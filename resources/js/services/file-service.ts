import { httpClient } from '@/lib/http-client';

// Single Responsibility: File operations interface
export interface FileOperations {
    deleteFile(fileId: number): Promise<any>;
}

// Single Responsibility: Error handling interface
export interface ErrorHandler {
    handleError(error: any): string;
}

// Open/Closed Principle: Extensible error handler
export class DefaultErrorHandler implements ErrorHandler {
    handleError(error: any): string {
        if (error.response?.data?.error) {
            return error.response.data.error;
        }
        if (error.response?.data?.message) {
            return error.response.data.message;
        }
        if (error.message) {
            return error.message;
        }
        return 'An unexpected error occurred';
    }
}

// Single Responsibility: File service implementation
export class WorkItemFileService implements FileOperations {
    constructor(private errorHandler: ErrorHandler) {}

    async deleteFile(fileId: number): Promise<any> {
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
