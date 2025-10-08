import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvatarDropzoneProps {
  onFileSelect: (file: File | null) => void;
  currentImage?: string | null;
  currentImageUrl?: string | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  accept?: Record<string, string[]>;
  maxSize?: number;
  disabled?: boolean;
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
  xl: 'w-40 h-40'
};

const iconSizes = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16'
};

export default function AvatarDropzone({
  onFileSelect,
  currentImage,
  currentImageUrl,
  className,
  size = 'lg',
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.svg', '.webp']
  },
  maxSize = 2 * 1024 * 1024, // 2MB
  disabled = false
}: AvatarDropzoneProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [showCurrentImage, setShowCurrentImage] = useState<boolean>(true);
  const [imageError, setImageError] = useState<boolean>(false);

  // Reset state when currentImage or currentImageUrl changes (e.g., switching between forms)
  useEffect(() => {
    setShowCurrentImage(true);
    setPreview(null);
    setImageError(false);
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
    setShowCurrentImage(false);
    setImageError(false);
    onFileSelect(null);
  };

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const displayImage = preview || (showCurrentImage && !imageError && currentImageUrl) || (showCurrentImage && !imageError && currentImage && `/storage/${currentImage}`);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col items-center space-y-4">
        
        {/* Avatar circle with delete button on the right */}
        <div className="flex items-center gap-4">
          <div
            {...getRootProps()}
            className={cn(
              "relative rounded-full transition-colors group overflow-hidden",
              sizeClasses[size],
              "focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50",
              disabled && "cursor-not-allowed opacity-50",
              !disabled && "cursor-pointer",
              // Always show circle border
              "border-4",
              // Border styling - dashed when no image, solid when image exists
              !displayImage ? [
                "border-dashed",
                "hover:border-gray-400 focus:border-blue-500",
                isDragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : "border-gray-300 dark:border-gray-600"
              ] : [
                "border-solid border-gray-200 dark:border-gray-700",
                "hover:border-gray-300 dark:hover:border-gray-600",
                isDragActive && "border-blue-500"
              ]
            )}
          >
          <input {...getInputProps()} />
          
          {displayImage ? (
            <div className="relative w-full h-full">
              <img
                src={displayImage}
                alt="Avatar Preview"
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-200 flex items-center justify-center">
                <Upload className={cn("text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200", iconSizes[size])} />
              </div>
              
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800">
              {isDragActive ? (
                <Upload className={cn("text-blue-500", iconSizes[size])} />
              ) : (
                <User className={cn("text-gray-400", iconSizes[size])} />
              )}
            </div>
          )}
          </div>
          
          {/* Delete button on the right side */}
          {displayImage && !disabled && (
            <button
              type="button"
              className="rounded-full bg-red-500 hover:bg-red-600 shadow-lg h-8 w-8 flex items-center justify-center transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                removeImage();
              }}
            >
              <X className="h-4 w-4 text-white" />
            </button>
          )}
        </div>
        
        {/* Instructions text */}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {displayImage 
              ? (isDragActive ? "Drop to replace" : "Click or drag to change")
              : (isDragActive ? "Drop the image here" : "Click or drag to add photo")
            }
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            JPG, PNG, GIF (max {Math.round(maxSize / 1024 / 1024)}MB)
          </p>
        </div>
      </div>

      {/* Error messages */}
      {fileRejections.length > 0 && (
        <div className="text-sm text-red-600 dark:text-red-400">
          {fileRejections.map(({ file, errors }, index) => (
            <div key={index} className="text-center">
              <p className="font-medium">{file.name}:</p>
              <ul className="list-none space-y-1">
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