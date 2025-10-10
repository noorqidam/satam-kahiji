import { useCallback, useState } from 'react';
import { useDropzone, FileRejection, FileError } from 'react-dropzone';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FileIcon } from '@/components/ui/file-icon';

interface DocumentDropzoneProps {
    onFileSelect: (file: File | null) => void;
    accept?: Record<string, string[]>;
    maxSize?: number; // in bytes
    multiple?: boolean;
    className?: string;
    placeholder?: string;
    disabled?: boolean;
}

export function DocumentDropzone({
    onFileSelect,
    accept = {
        'application/pdf': ['.pdf'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'image/*': ['.jpeg', '.jpg', '.png'],
    },
    maxSize = 10 * 1024 * 1024, // 10MB default
    multiple = false,
    className,
    placeholder = 'Drop files here or click to browse',
    disabled = false,
}: DocumentDropzoneProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string>('');

    const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
        setError('');

        if (rejectedFiles.length > 0) {
            const rejection = rejectedFiles[0];
            if (rejection.errors.some((e: FileError) => e.code === 'file-too-large')) {
                setError(`File size must be less than ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
            } else if (rejection.errors.some((e: FileError) => e.code === 'file-invalid-type')) {
                setError('Invalid file type. Please select a PDF, DOC, DOCX, JPG, or PNG file.');
            } else {
                setError('File rejected. Please try again.');
            }
            return;
        }

        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setSelectedFile(file);
            onFileSelect(file);
        }
    }, [maxSize, onFileSelect]);

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        accept,
        maxSize,
        multiple,
        disabled,
    });

    const removeFile = () => {
        setSelectedFile(null);
        setError('');
        onFileSelect(null);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (file: File) => {
        // For images, show thumbnail preview
        if (file.type.startsWith('image/')) {
            return <img src={URL.createObjectURL(file)} alt={file.name} className="w-8 h-8 object-cover rounded" />;
        }
        // For all other files, use the FileIcon component with proper file type detection
        return <FileIcon fileName={file.name} size="lg" />;
    };

    return (
        <div className={cn('w-full', className)}>
            {!selectedFile ? (
                <div
                    {...getRootProps()}
                    className={cn(
                        'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                        isDragActive && !isDragReject ? 'border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600',
                        isDragReject ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-900/20' : '',
                        disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-gray-400 hover:bg-gray-50 dark:hover:border-gray-500 dark:hover:bg-gray-800/50',
                        error ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-900/20' : ''
                    )}
                >
                    <input {...getInputProps()} />
                    <Upload className={cn(
                        'mx-auto h-12 w-12 mb-4',
                        isDragActive && !isDragReject ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500',
                        isDragReject ? 'text-red-500 dark:text-red-400' : ''
                    )} />
                    <p className={cn(
                        'text-sm font-medium mb-2',
                        isDragActive && !isDragReject ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100',
                        isDragReject ? 'text-red-600 dark:text-red-400' : ''
                    )}>
                        {isDragActive
                            ? isDragReject
                                ? 'Invalid file type'
                                : 'Drop file here'
                            : placeholder
                        }
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Supported formats: PDF, DOC, DOCX, JPG, PNG (Max {(maxSize / 1024 / 1024).toFixed(1)}MB)
                    </p>
                </div>
            ) : (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            {getFileIcon(selectedFile)}
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedFile.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(selectedFile.size)}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                            <button
                                type="button"
                                onClick={removeFile}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                title="Remove file"
                            >
                                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="mt-2 flex items-center space-x-1 text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-xs">{error}</p>
                </div>
            )}
        </div>
    );
}