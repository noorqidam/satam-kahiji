import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DropzoneProps {
  onFileSelect: (file: File | null) => void;
  currentImage?: string | null;
  currentImageUrl?: string | null;
  className?: string;
  accept?: Record<string, string[]>;
  maxSize?: number;
  disabled?: boolean;
}

export default function Dropzone({
  onFileSelect,
  currentImage,
  currentImageUrl,
  className,
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.svg', '.webp']
  },
  maxSize = 10 * 1024 * 1024, // 10MB
  disabled = false
}: DropzoneProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [showCurrentImage, setShowCurrentImage] = useState<boolean>(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Reset state when currentImage or currentImageUrl changes (e.g., switching between forms)
  useEffect(() => {
    setShowCurrentImage(true);
    setPreview(null);
    setSelectedFile(null);
  }, [currentImage, currentImageUrl]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Store selected file info
      setSelectedFile(file);
      
      // Hide current image when new file is selected
      setShowCurrentImage(false);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    disabled
  });

  const removeImage = () => {
    setPreview(null);
    setSelectedFile(null);
    setShowCurrentImage(false);
    onFileSelect(null);
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const displayImage = preview || (showCurrentImage && currentImageUrl) || (showCurrentImage && currentImage && `/storage/${currentImage}`);

  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors",
          "hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50",
          isDragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : "border-gray-300 dark:border-gray-600",
          disabled && "cursor-not-allowed opacity-50",
          !disabled && "cursor-pointer"
        )}
      >
        <input {...getInputProps()} />
        
        {displayImage ? (
          <div className="relative">
            <img
              src={displayImage}
              alt="Preview"
              className="w-full h-48 object-cover rounded-md"
            />
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {selectedFile && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-sm">
                <div className="flex flex-col space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700 dark:text-gray-300">File:</span>
                    <span className="text-gray-600 dark:text-gray-400 truncate max-w-48" title={selectedFile.name}>
                      {selectedFile.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Size:</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {formatFileSize(selectedFile.size)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {selectedFile.type.split('/')[1]?.toUpperCase() || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-gray-400">
              {isDragActive ? (
                <Upload className="h-12 w-12" />
              ) : (
                <ImageIcon className="h-12 w-12" />
              )}
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {isDragActive ? "Drop the image here" : "Drag & drop an image here"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                or click to browse files
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                Supports: JPG, PNG, GIF, SVG, WebP (max {Math.round(maxSize / 1024 / 1024)}MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error messages */}
      {fileRejections.length > 0 && (
        <div className="text-sm text-red-600 dark:text-red-400">
          {fileRejections.map(({ file, errors }, index) => (
            <div key={index}>
              <p className="font-medium">{file.name}:</p>
              <ul className="list-disc list-inside ml-4">
                {errors.map((error) => (
                  <li key={error.code}>
                    {error.code === 'file-too-large'
                      ? `File is too large. Max size is ${Math.round(maxSize / 1024 / 1024)}MB`
                      : error.code === 'file-invalid-type'
                      ? 'File type not supported'
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