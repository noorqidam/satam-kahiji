import { useState } from 'react';

interface FileMetadata {
    id: string;
    name: string;
    size: number | null;
    mime_type: string;
    created_time: string;
    modified_time: string;
    web_view_link: string;
}

interface FileMetadataHook {
    metadata: FileMetadata | null;
    loading: boolean;
    error: string | null;
    fetchMetadata: (fileUrl: string) => Promise<void>;
    formatFileSize: (bytes?: number | null) => string;
}

export function useFileMetadata(): FileMetadataHook {
    const [metadata, setMetadata] = useState<FileMetadata | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const formatFileSize = (bytes?: number | null): string => {
        if (!bytes || bytes === 0) return 'Size unknown';

        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));

        if (i === 0) return bytes + ' ' + sizes[i];

        return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
    };

    const fetchMetadata = async (fileUrl: string): Promise<void> => {
        if (!fileUrl) {
            setError('File URL is required');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(route('admin.work-items.file-metadata'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    file_url: fileUrl,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch file metadata');
            }

            if (data.success) {
                setMetadata(data.data);
            } else {
                throw new Error(data.message || 'Failed to fetch file metadata');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
            setMetadata(null);
        } finally {
            setLoading(false);
        }
    };

    return {
        metadata,
        loading,
        error,
        fetchMetadata,
        formatFileSize,
    };
}

// Simple hook for just formatting file size
export function useFileSize() {
    const formatFileSize = (bytes?: number | null): string => {
        if (!bytes || bytes === 0) return 'Size unknown';

        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));

        if (i === 0) return bytes + ' ' + sizes[i];

        return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
    };

    return { formatFileSize };
}

// Hook for multiple files with direct fetching (no queue to prevent repeated requests)
export function useMultipleFileMetadata() {
    const [metadataCache, setMetadataCache] = useState<Map<string, FileMetadata>>(new Map());
    const [loadingFiles, setLoadingFiles] = useState<Set<string>>(new Set());
    const [errors, setErrors] = useState<Map<string, string>>(new Map());

    const fetchMetadata = async (fileUrl: string): Promise<FileMetadata | null> => {
        // Return cached data if available
        if (metadataCache.has(fileUrl)) {
            return metadataCache.get(fileUrl) || null;
        }

        // Skip if already loading to prevent duplicate requests
        if (loadingFiles.has(fileUrl)) {
            // Wait for the ongoing request to complete
            while (loadingFiles.has(fileUrl)) {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
            // Return cached result after waiting
            return metadataCache.get(fileUrl) || null;
        }

        // Mark as loading
        setLoadingFiles((prev) => new Set(prev).add(fileUrl));

        try {
            const response = await fetch(route('admin.work-items.file-metadata'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    file_url: fileUrl,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch file metadata');
            }

            if (data.success) {
                setMetadataCache((prev) => new Map(prev).set(fileUrl, data.data));
                setErrors((prev) => {
                    const newErrors = new Map(prev);
                    newErrors.delete(fileUrl);
                    return newErrors;
                });
                return data.data;
            } else {
                throw new Error(data.message || 'Failed to fetch file metadata');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            console.error(`Failed to fetch metadata for ${fileUrl}:`, errorMessage);
            setErrors((prev) => new Map(prev).set(fileUrl, errorMessage));
            return null;
        } finally {
            setLoadingFiles((prev) => {
                const newSet = new Set(prev);
                newSet.delete(fileUrl);
                return newSet;
            });
        }
    };

    const getMetadata = (fileUrl: string): FileMetadata | null => {
        return metadataCache.get(fileUrl) || null;
    };

    const isLoading = (fileUrl: string): boolean => {
        return loadingFiles.has(fileUrl);
    };

    const getError = (fileUrl: string): string | null => {
        return errors.get(fileUrl) || null;
    };

    const formatFileSize = (bytes?: number | null): string => {
        if (!bytes || bytes === 0) return 'Size unknown';

        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));

        if (i === 0) return bytes + ' ' + sizes[i];

        return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
    };

    return {
        fetchMetadata,
        getMetadata,
        isLoading,
        getError,
        formatFileSize,
    };
}
