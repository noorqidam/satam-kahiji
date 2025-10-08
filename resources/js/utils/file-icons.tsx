import { Archive, Code, File, FileAudio, FileImage, FileSpreadsheet, FileText, FileVideo, Presentation } from 'lucide-react';

export interface FileTypeInfo {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    category: string;
}

export const getFileTypeInfo = (fileName: string | undefined | null): FileTypeInfo => {
    if (!fileName || typeof fileName !== 'string') {
        return { icon: File, color: 'text-gray-500', category: 'File' };
    }

    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (extension) {
        // Documents
        case 'pdf':
            return { icon: FileText, color: 'text-red-500', category: 'PDF Document' };
        case 'doc':
        case 'docx':
            return { icon: FileText, color: 'text-blue-500', category: 'Word Document' };
        case 'txt':
            return { icon: FileText, color: 'text-gray-500', category: 'Text Document' };
        case 'rtf':
            return { icon: FileText, color: 'text-purple-500', category: 'Rich Text Document' };

        // Spreadsheets
        case 'xls':
        case 'xlsx':
        case 'csv':
            return { icon: FileSpreadsheet, color: 'text-green-500', category: 'Excel Spreadsheet' };
        case 'ods':
            return { icon: FileSpreadsheet, color: 'text-blue-500', category: 'Spreadsheet' };

        // Presentations
        case 'ppt':
        case 'pptx':
            return { icon: Presentation, color: 'text-orange-500', category: 'PowerPoint Presentation' };
        case 'odp':
            return { icon: Presentation, color: 'text-red-500', category: 'Presentation' };

        // Images
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'bmp':
        case 'webp':
        case 'svg':
            return { icon: FileImage, color: 'text-purple-500', category: 'Image' };

        // Videos
        case 'mp4':
        case 'avi':
        case 'mkv':
        case 'mov':
        case 'wmv':
        case 'flv':
        case 'webm':
            return { icon: FileVideo, color: 'text-red-500', category: 'Video' };

        // Audio
        case 'mp3':
        case 'wav':
        case 'ogg':
        case 'flac':
        case 'aac':
            return { icon: FileAudio, color: 'text-green-500', category: 'Audio' };

        // Archives
        case 'zip':
        case 'rar':
        case '7z':
        case 'tar':
        case 'gz':
            return { icon: Archive, color: 'text-yellow-500', category: 'Archive' };

        // Code
        case 'js':
        case 'ts':
        case 'jsx':
        case 'tsx':
        case 'html':
        case 'css':
        case 'php':
        case 'py':
        case 'java':
        case 'cpp':
        case 'c':
            return { icon: Code, color: 'text-blue-500', category: 'Code' };

        default:
            return { icon: File, color: 'text-gray-500', category: 'File' };
    }
};

export const formatFileSize = (bytes: number | undefined | null): string => {
    if (!bytes || bytes === 0 || typeof bytes !== 'number' || isNaN(bytes)) {
        return '0 Bytes';
    }

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isValidFileType = (fileName: string | undefined | null): boolean => {
    if (!fileName || typeof fileName !== 'string') {
        return false;
    }

    const extension = fileName.split('.').pop()?.toLowerCase();
    const allowedTypes = [
        'pdf',
        'doc',
        'docx',
        'txt',
        'rtf',
        'xls',
        'xlsx',
        'csv',
        'ods',
        'ppt',
        'pptx',
        'odp',
        'jpg',
        'jpeg',
        'png',
        'gif',
        'bmp',
        'webp',
        'svg',
        'mp4',
        'avi',
        'mkv',
        'mov',
        'wmv',
        'flv',
        'webm',
        'mp3',
        'wav',
        'ogg',
        'flac',
        'aac',
        'zip',
        'rar',
        '7z',
        'tar',
        'gz',
    ];

    return extension ? allowedTypes.includes(extension) : false;
};
