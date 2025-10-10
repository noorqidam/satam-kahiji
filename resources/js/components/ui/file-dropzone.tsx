import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileIcon } from '@/components/ui/file-icon';
import { cn } from '@/lib/utils';

interface FileDropzoneProps {
  onFileSelect: (files: File[] | null) => void;
  className?: string;
  accept?: Record<string, string[]>;
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  multiple?: boolean;
  showPreview?: boolean;
  height?: 'sm' | 'md' | 'lg' | 'xl';
}

const heightClasses = {
  sm: 'h-32',
  md: 'h-48', 
  lg: 'h-64',
  xl: 'h-80'
};

export default function FileDropzone({
  onFileSelect,
  className,
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 5,
  disabled = false,
  multiple = false,
  showPreview = true,
  height = 'md'
}: FileDropzoneProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const newFiles = acceptedFiles.slice(0, maxFiles);
      setSelectedFiles([]); // Clear internal state since parent handles all files
      onFileSelect(newFiles);
    }
  }, [onFileSelect, maxFiles]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple,
    disabled,
    maxFiles: multiple ? maxFiles : 1
  });

  const removeFile = useCallback((indexToRemove: number) => {
    const newFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
    setSelectedFiles(newFiles);
    onFileSelect(newFiles.length > 0 ? newFiles : null);
  }, [selectedFiles, onFileSelect]);

  const removeAllFiles = useCallback(() => {
    setSelectedFiles([]);
    onFileSelect(null);
  }, [onFileSelect]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getAcceptedFileTypes = () => {
    if (!accept) return 'All files';
    const types = Object.keys(accept).join(', ');
    const extensions = Object.values(accept).flat().join(', ');
    return extensions || types;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main dropzone area */}
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors",
          heightClasses[height],
          "hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50",
          isDragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : "border-gray-300 dark:border-gray-600",
          disabled && "cursor-not-allowed opacity-50",
          !disabled && "cursor-pointer",
          "flex flex-col items-center justify-center"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            {isDragActive ? (
              <Upload className="h-12 w-12" />
            ) : (
              <FileText className="h-12 w-12" />
            )}
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {isDragActive ? "Drop the files here" : "Drag & drop files here"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              or click to browse files
            </p>
            {multiple && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                You can upload up to {maxFiles} files
              </p>
            )}
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Supports: {getAcceptedFileTypes()} (max {Math.round(maxSize / 1024 / 1024)}MB per file)
            </p>
          </div>
        </div>
      </div>

      {/* File previews */}
      {showPreview && selectedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Selected Files ({selectedFiles.length})
            </h4>
            {selectedFiles.length > 1 && !disabled && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={removeAllFiles}
              >
                Remove All
              </Button>
            )}
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md"
              >
                <FileIcon fileName={file.name} size="md" />
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                
                {!disabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error messages */}
      {fileRejections.length > 0 && (
        <div className="text-sm text-red-600 dark:text-red-400">
          {fileRejections.map(({ file, errors }, index) => (
            <div key={index} className="p-3 bg-red-50 dark:bg-red-950 rounded-md">
              <p className="font-medium">{file.name}:</p>
              <ul className="list-disc list-inside ml-4 mt-1">
                {errors.map((error) => (
                  <li key={error.code}>
                    {error.code === 'file-too-large'
                      ? `File is too large. Max size is ${Math.round(maxSize / 1024 / 1024)}MB`
                      : error.code === 'file-invalid-type'
                      ? 'File type not supported'
                      : error.code === 'too-many-files'
                      ? `Too many files. Maximum allowed is ${maxFiles}`
                      : error.message
                    }
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}