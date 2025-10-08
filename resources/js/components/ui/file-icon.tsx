import React from 'react';
import { 
    File, 
    FileText, 
    FileSpreadsheet,
    FileImage,
    FileVideo,
    FileAudio,
    Archive,
    Code,
    Presentation
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileIconProps {
    fileName: string | undefined | null;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function FileIcon({ fileName, className, size = 'md' }: FileIconProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6', 
        lg: 'h-8 w-8'
    };
    
    if (!fileName || typeof fileName !== 'string') {
        return <File className={cn(sizeClasses[size], 'text-gray-500', className)} />;
    }
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
        case 'pdf':
            return <FileText className={cn(sizeClasses[size], 'text-red-500', className)} />;
        case 'doc':
        case 'docx':
            return <FileText className={cn(sizeClasses[size], 'text-blue-500', className)} />;
        case 'txt':
            return <FileText className={cn(sizeClasses[size], 'text-gray-500', className)} />;
        case 'rtf':
            return <FileText className={cn(sizeClasses[size], 'text-purple-500', className)} />;
            
        // Spreadsheets
        case 'xls':
        case 'xlsx':
        case 'csv':
            return <FileSpreadsheet className={cn(sizeClasses[size], 'text-green-500', className)} />;
        case 'ods':
            return <FileSpreadsheet className={cn(sizeClasses[size], 'text-blue-500', className)} />;
            
        // Presentations
        case 'ppt':
        case 'pptx':
            return <Presentation className={cn(sizeClasses[size], 'text-orange-500', className)} />;
        case 'odp':
            return <Presentation className={cn(sizeClasses[size], 'text-red-500', className)} />;
            
        // Images
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'bmp':
        case 'webp':
        case 'svg':
            return <FileImage className={cn(sizeClasses[size], 'text-purple-500', className)} />;
            
        // Videos
        case 'mp4':
        case 'avi':
        case 'mkv':
        case 'mov':
        case 'wmv':
        case 'flv':
        case 'webm':
            return <FileVideo className={cn(sizeClasses[size], 'text-red-500', className)} />;
            
        // Audio
        case 'mp3':
        case 'wav':
        case 'ogg':
        case 'flac':
        case 'aac':
            return <FileAudio className={cn(sizeClasses[size], 'text-green-500', className)} />;
            
        // Archives
        case 'zip':
        case 'rar':
        case '7z':
        case 'tar':
        case 'gz':
            return <Archive className={cn(sizeClasses[size], 'text-yellow-500', className)} />;
            
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
            return <Code className={cn(sizeClasses[size], 'text-blue-500', className)} />;
            
        default:
            return <File className={cn(sizeClasses[size], 'text-gray-500', className)} />;
    }
}