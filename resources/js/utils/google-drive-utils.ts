// Google Drive utility functions for fetching file metadata
// Since we don't have direct Google Drive API access from frontend,
// we'll use alternative methods to get file information

interface GoogleDriveFileInfo {
    size?: number;
    name?: string;
    mimeType?: string;
}

/**
 * Extract file ID from Google Drive URL
 */
export const extractFileIdFromUrl = (driveUrl: string): string | null => {
    const patterns = [
        /\/d\/([a-zA-Z0-9-_]+)/, // Standard sharing URL
        /id=([a-zA-Z0-9-_]+)/, // Direct file URL
        /file\/d\/([a-zA-Z0-9-_]+)/, // Alternative format
    ];

    for (const pattern of patterns) {
        const match = driveUrl.match(pattern);
        if (match) {
            return match[1];
        }
    }

    return null;
};

/**
 * Attempt to get file size using HEAD request to Google Drive export URL
 * This is a fallback method that may not always work due to CORS
 */
export const getFileSizeFromDrive = async (fileUrl: string): Promise<number | null> => {
    try {
        const fileId = extractFileIdFromUrl(fileUrl);
        if (!fileId) {
            return null;
        }

        // Try different approaches to get file size

        // Method 1: Try using the export URL for documents
        const exportUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

        try {
            const response = await fetch(exportUrl, {
                method: 'HEAD',
                mode: 'cors',
            });

            const contentLength = response.headers.get('content-length');
            if (contentLength) {
                return parseInt(contentLength, 10);
            }
        } catch (error) {
            // CORS will likely block this, so we'll fall back to other methods
            console.log('CORS blocked file size fetch, trying alternative method');
        }

        // Method 2: Try to get file info from the sharing page (requires server-side proxy)
        // This would need to be implemented on the backend

        return null;
    } catch (error) {
        console.error('Error fetching file size from Google Drive:', error);
        return null;
    }
};

/**
 * Format file size with appropriate units
 */
export const formatFileSize = (bytes?: number | null): string => {
    if (!bytes || bytes === 0) return 'Size unknown';

    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    if (i === 0) return bytes + ' ' + sizes[i];

    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
};

/**
 * Estimate file size based on file type and other indicators
 * This is a fallback when we can't get exact size
 */
export const estimateFileSize = (filename: string, mimeType?: string): string => {
    const extension = getFileExtension(filename);

    // Common file type size estimates
    const estimates: Record<string, string> = {
        pdf: '500 KB - 2 MB',
        doc: '100 KB - 1 MB',
        docx: '100 KB - 1 MB',
        xls: '100 KB - 5 MB',
        xlsx: '100 KB - 5 MB',
        ppt: '1 MB - 10 MB',
        pptx: '1 MB - 10 MB',
        jpg: '100 KB - 5 MB',
        jpeg: '100 KB - 5 MB',
        png: '100 KB - 10 MB',
        gif: '100 KB - 5 MB',
        txt: '1 KB - 100 KB',
        zip: '1 MB - 100 MB',
        rar: '1 MB - 100 MB',
    };

    return estimates[extension] || 'Size varies';
};
