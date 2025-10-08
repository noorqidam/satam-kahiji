import { useState, useEffect } from 'react';
import { ExternalLink, Maximize2, Download } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileIcon } from '@/components/ui/file-icon';

interface FilePreviewDialogProps {
    file: {
        id: number;
        file_name: string;
        file_url: string;
        file_size?: number;
        created_at: string;
    };
    isOpen: boolean;
    onClose: () => void;
    allowDownload?: boolean;
}

export function FilePreviewDialog({ file, isOpen, onClose, allowDownload = true }: FilePreviewDialogProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Reset states when dialog opens with new file
    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            setHasError(false);
        }
    }, [isOpen, file.id]);

    // Extract file extension
    const getFileExtension = (fileName: string): string => {
        return fileName.split('.').pop()?.toLowerCase() || '';
    };

    // Get file type category
    const getFileType = (fileName: string): 'pdf' | 'image' | 'document' | 'other' => {
        const extension = getFileExtension(fileName);
        
        if (extension === 'pdf') return 'pdf';
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) return 'image';
        if (['doc', 'docx', 'txt', 'rtf'].includes(extension)) return 'document';
        return 'other';
    };

    // Convert Google Drive URL to direct preview URL
    const getPreviewUrl = (driveUrl: string): string => {
        try {
            // Extract file ID from Google Drive URL - handle both formats:
            // 1. https://drive.google.com/uc?id=FILE_ID (our format)
            // 2. https://drive.google.com/file/d/FILE_ID/... (sharing format)
            let fileId = null;
            
            // Try to extract from our format: https://drive.google.com/uc?id=FILE_ID
            const ucMatch = driveUrl.match(/uc\?id=([a-zA-Z0-9-_]+)/);
            if (ucMatch) {
                fileId = ucMatch[1];
            } else {
                // Try to extract from sharing format: /d/FILE_ID/
                const dMatch = driveUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
                if (dMatch) {
                    fileId = dMatch[1];
                }
            }
            
            if (fileId) {
                const fileType = getFileType(file.file_name);
                let previewUrl = '';
                
                if (fileType === 'pdf') {
                    // For PDFs, use embedded viewer URL that works with CSP
                    previewUrl = `https://drive.google.com/file/d/${fileId}/preview?embedded=true`;
                } else if (fileType === 'image') {
                    // For images, use direct view URL
                    previewUrl = `https://drive.google.com/uc?id=${fileId}`;
                } else {
                    // For other documents, try the preview URL first, fallback to viewer
                    previewUrl = `https://drive.google.com/file/d/${fileId}/preview?embedded=true`;
                }
                
                return previewUrl;
            }
            
            // If no file ID found, return original URL
            return driveUrl;
        } catch (error) {
            console.error('Error converting Drive URL:', error);
            return driveUrl;
        }
    };

    // Format file size
    const formatFileSize = (bytes?: number): string => {
        if (!bytes || bytes === 0) return 'Size unknown';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    // Format date
    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const fileType = getFileType(file.file_name);
    const previewUrl = getPreviewUrl(file.file_url);
    const extension = getFileExtension(file.file_name);

    const handleLoad = () => {
        setIsLoading(false);
        setHasError(false);
    };

    const handleError = () => {
        setIsLoading(false);
        setHasError(true);
    };

    const handleOpenOriginal = () => {
        window.open(file.file_url, '_blank');
    };

    const handleDownload = async () => {
        try {
            // Extract file ID from Google Drive URL for download
            const fileIdMatch = file.file_url.match(/\/d\/([a-zA-Z0-9-_]+)/);
            if (fileIdMatch) {
                const fileId = fileIdMatch[1];
                const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
                
                // Create a temporary anchor element to trigger download
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = file.file_name;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                // Fallback to opening the original URL
                window.open(file.file_url, '_blank');
            }
        } catch (error) {
            console.error('Download failed:', error);
            // Fallback to opening the file
            window.open(file.file_url, '_blank');
        }
    };

    const renderPreview = () => {
        if (hasError) {
            return (
                <div className="flex flex-col items-center justify-center h-64 sm:h-96 bg-gray-50 dark:bg-gray-800 rounded-lg px-4">
                    <FileIcon fileName={file.file_name} className="w-12 h-12 sm:w-16 sm:h-16 mb-4" />
                    <div className="text-center mb-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">Preview not available</p>
                        <p className="text-xs text-gray-500">
                            This file type cannot be previewed inline due to security restrictions
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs">
                        {allowDownload && (
                            <Button onClick={handleDownload} variant="outline" className="w-full sm:w-auto">
                                <Download className="w-4 h-4 mr-2" />
                                Download
                            </Button>
                        )}
                        <Button onClick={handleOpenOriginal} variant="ghost" className="w-full sm:w-auto">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open in Drive
                        </Button>
                    </div>
                </div>
            );
        }

        if (fileType === 'pdf' || fileType === 'document') {
            return (
                <div className="relative h-full min-h-[400px]">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
                        </div>
                    )}
                    <iframe
                        src={previewUrl}
                        className="w-full h-full rounded-lg border"
                        onLoad={handleLoad}
                        onError={(e) => {
                            console.error('Iframe failed to load:', previewUrl, e);
                            handleError();
                        }}
                        title={`Preview of ${file.file_name}`}
                        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
                        referrerPolicy="no-referrer"
                        allow="fullscreen"
                    />
                </div>
            );
        }

        if (fileType === 'image') {
            // Try multiple URL formats for better compatibility
            const imageUrls = [
                previewUrl,
                file.file_url.includes('drive.google.com') ? 
                    `https://lh3.googleusercontent.com/d/${file.file_url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1]}` : 
                    file.file_url
            ].filter(Boolean);

            return (
                <div className="flex justify-center">
                    {isLoading && (
                        <div className="flex items-center justify-center h-64 sm:h-96 bg-gray-50 dark:bg-gray-800 rounded-lg w-full">
                            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
                        </div>
                    )}
                    <img
                        src={imageUrls[0]}
                        alt={file.file_name}
                        className="max-w-full max-h-64 sm:max-h-96 lg:max-h-[600px] object-contain rounded-lg"
                        onLoad={handleLoad}
                        onError={(e) => {
                            // Try fallback URL if primary fails
                            if (imageUrls[1] && (e.target as HTMLImageElement).src === imageUrls[0]) {
                                (e.target as HTMLImageElement).src = imageUrls[1];
                            } else {
                                handleError();
                            }
                        }}
                        style={{ display: isLoading ? 'none' : 'block' }}
                    />
                </div>
            );
        }

        // For other file types, show file icon and info
        return (
            <div className="flex flex-col items-center justify-center h-64 sm:h-96 bg-gray-50 dark:bg-gray-800 rounded-lg px-4">
                <FileIcon fileName={file.file_name} className="w-12 h-12 sm:w-16 sm:h-16 mb-4" />
                <div className="text-center mb-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">Preview not available</p>
                    <p className="text-xs text-gray-500">
                        {extension.toUpperCase()} files are not supported for inline preview
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs">
                    {allowDownload && (
                        <Button onClick={handleDownload} variant="outline" className="w-full sm:w-auto">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                        </Button>
                    )}
                    <Button onClick={handleOpenOriginal} variant="ghost" className="w-full sm:w-auto">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open in Drive
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => onClose()}>
            <DialogContent className="w-[95vw] max-w-4xl h-[85vh] sm:h-[80vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <FileIcon fileName={file.file_name} className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                                <DialogTitle className="text-left truncate text-sm sm:text-base max-w-[200px] sm:max-w-md">
                                    {file.file_name}
                                </DialogTitle>
                                <DialogDescription className="sr-only">
                                    File preview for {file.file_name}. Size: {formatFileSize(file.file_size)}. Created: {formatDate(file.created_at)}.
                                </DialogDescription>
                                {/* Mobile: Stack vertically, Desktop: Two columns */}
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mt-1">
                                    {/* File metadata */}
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        <span className="text-xs text-gray-500">
                                            {formatFileSize(file.file_size)}
                                        </span>
                                        <span className="text-xs text-gray-500">•</span>
                                        <span className="text-xs text-gray-500">
                                            {formatDate(file.created_at)}
                                        </span>
                                    </div>
                                    
                                    {/* Action buttons */}
                                    <div className="flex items-center gap-1 self-end sm:self-auto">
                                        {allowDownload && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleDownload}
                                                title="Download file"
                                                className="h-8 w-8 p-0"
                                            >
                                                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => window.open(previewUrl, '_blank')}
                                            title="Open in new tab"
                                            className="h-8 w-8 p-0"
                                        >
                                            <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleOpenOriginal}
                                            title="Open in Google Drive"
                                            className="h-8 w-8 p-0"
                                        >
                                            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogHeader>
                
                <div className="flex-1 overflow-hidden">
                    {renderPreview()}
                </div>
            </DialogContent>
        </Dialog>
    );
}