import { AxiosError } from 'axios';

export interface UploadError {
    message: string;
    type: 'validation' | 'network' | 'server' | 'auth' | 'google_drive' | 'unknown';
}

export const handleUploadError = (error: unknown): UploadError => {
    if (error instanceof AxiosError) {
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;

            switch (status) {
                case 419:
                    return {
                        message: 'Session expired. Please refresh the page and try again.',
                        type: 'auth',
                    };
                case 422:
                    if (data?.errors) {
                        const validationErrors = Object.values(data.errors).flat();
                        return {
                            message: `Validation failed: ${validationErrors.join(', ')}`,
                            type: 'validation',
                        };
                    }
                    if (data?.error || data?.message) {
                        return {
                            message: data.error || data.message,
                            type: 'validation',
                        };
                    }
                    return {
                        message: 'Invalid file or request. Please check your file and try again.',
                        type: 'validation',
                    };
                case 413:
                    return {
                        message: 'File too large. Please choose a smaller file.',
                        type: 'validation',
                    };
                default:
                    if (data?.error || data?.message) {
                        const errorMessage = data.error || data.message;

                        // Check for Google Drive specific errors
                        if (
                            errorMessage.includes('Google Drive') ||
                            errorMessage.includes('authenticated') ||
                            errorMessage.includes('Token may be invalid') ||
                            errorMessage.includes('Drive client')
                        ) {
                            return {
                                message: errorMessage,
                                type: 'google_drive',
                            };
                        }

                        return {
                            message: errorMessage,
                            type: 'server',
                        };
                    }
                    return {
                        message: `Upload failed (${status})`,
                        type: 'server',
                    };
            }
        } else if (error.request) {
            return {
                message: 'Network error. Please check your connection and try again.',
                type: 'network',
            };
        } else {
            return {
                message: error.message || 'Upload failed',
                type: 'unknown',
            };
        }
    }

    if (error instanceof Error) {
        return {
            message: error.message,
            type: 'unknown',
        };
    }

    return {
        message: 'An unexpected error occurred',
        type: 'unknown',
    };
};
