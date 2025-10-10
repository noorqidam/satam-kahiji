import { httpClient } from '@/lib/http-client';

// Single Responsibility: File operations interface
export interface FileOperations {
    deleteFile(fileId: number): Promise<unknown>;
}

// Single Responsibility: Error handling interface
export interface ErrorHandler {
    handleError(error: unknown): string;
}

// Open/Closed Principle: Extensible error handler
export class DefaultErrorHandler implements ErrorHandler {
    handleError(error: unknown): string {
        if (error && typeof error === 'object') {
            const errorObj = error as { response?: { data?: { error?: string; message?: string } }; message?: string };
            if (errorObj.response?.data?.error) {
                return errorObj.response.data.error;
            }
            if (errorObj.response?.data?.message) {
                return errorObj.response.data.message;
            }
            if (errorObj.message) {
                return errorObj.message;
            }
        }
        return 'An unexpected error occurred';
    }
}

// Single Responsibility: File service implementation
export class WorkItemFileService implements FileOperations {
    constructor(private errorHandler: ErrorHandler) {}

    async deleteFile(fileId: number): Promise<unknown> {
        try {
            return await httpClient.delete(`/admin/work-items/files/${fileId}`);
        } catch (error) {
            const errorMessage = this.errorHandler.handleError(error);
            throw new Error(errorMessage);
        }
    }
}

// Factory pattern for service creation
export const createFileService = (errorHandler?: ErrorHandler): FileOperations => {
    const handler = errorHandler || new DefaultErrorHandler();
    return new WorkItemFileService(handler);
};
