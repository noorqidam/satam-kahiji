import { cn } from '@/lib/utils';
import { Image as ImageIcon, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';

// Utility function to handle Google Drive URLs for image display
const convertGoogleDriveUrlForDisplay = (url: string): string => {
    if (!url) return url;

    // lh3.googleusercontent.com URLs are already optimized for display, use as-is
    if (url.includes('lh3.googleusercontent.com')) {
        return url;
    }

    // Check if it's a Google Drive view URL and convert to lh3 format
    const viewMatch = url.match(/https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9\-_]+)\/view/);
    if (viewMatch) {
        const fileId = viewMatch[1];
        return `https://lh3.googleusercontent.com/d/${fileId}`;
    }

    // Check if it's a thumbnail URL and convert to lh3 format
    const thumbnailMatch = url.match(/https:\/\/drive\.google\.com\/thumbnail\?id=([a-zA-Z0-9\-_]+)/);
    if (thumbnailMatch) {
        const fileId = thumbnailMatch[1];
        return `https://lh3.googleusercontent.com/d/${fileId}`;
    }

    // For other URLs, return as is
    return url;
};

interface FeaturedImageDropzoneProps {
    galleryId: number | null;
    currentImageUrl?: string | null;
    onFileSelect?: (file: File | null) => void;
    onImageUrlChange?: (imageUrl: string | null) => void;
    className?: string;
    disabled?: boolean;
}

export default function FeaturedImageDropzone({
    galleryId,
    currentImageUrl,
    onFileSelect,
    onImageUrlChange,
    className,
    disabled = false,
}: FeaturedImageDropzoneProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [showCurrentImage, setShowCurrentImage] = useState<boolean>(true);
    const [, setSelectedFile] = useState<File | null>(null);

    // Reset state when currentImageUrl changes
    useEffect(() => {
        setShowCurrentImage(true);
        setPreview(null);
        setSelectedFile(null);
    }, [currentImageUrl, galleryId]);

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
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
                setSelectedFile(file);

                // Notify parent component about file selection
                onFileSelect?.(file);
                onImageUrlChange?.(null); // Clear any existing URL since we have a new file
            }
        },
        [onFileSelect, onImageUrlChange],
    );

    const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
        },
        maxSize: 10 * 1024 * 1024, // 10MB
        multiple: false,
        disabled: disabled,
    });

    const removeImage = () => {
        setPreview(null);
        setShowCurrentImage(false);
        setSelectedFile(null);

        // Notify parent component that image was removed
        onFileSelect?.(null);
        onImageUrlChange?.(null);
    };

    const displayImage = preview || (showCurrentImage && currentImageUrl && convertGoogleDriveUrlForDisplay(currentImageUrl));

    // Allow featured image selection for new galleries (galleryId will be null)
    // The upload will happen after gallery creation

    return (
        <div className={cn('space-y-4', className)}>
            <div
                {...getRootProps()}
                className={cn(
                    'relative rounded-lg border-2 border-dashed p-6 transition-colors',
                    'focus:ring-opacity-50 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500',
                    isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-300 dark:border-gray-600',
                    disabled && 'cursor-not-allowed opacity-50',
                    !disabled && 'cursor-pointer',
                )}
            >
                <input {...getInputProps()} />

                {displayImage ? (
                    <div className="relative rounded-lg border-2 border-dashed border-gray-400 bg-gray-50 p-1 dark:border-gray-600 dark:bg-gray-900">
                        {/* Remove Image button */}
                        {!disabled && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    removeImage();
                                }}
                                className="absolute top-2 right-2 z-10 rounded-md bg-red-500 p-1.5 text-white shadow-lg transition-colors hover:bg-red-600"
                                title="Remove featured image"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}

                        {/* Image Content - Click to replace */}
                        <div
                            className="h-48 w-full cursor-pointer overflow-hidden rounded-md transition-opacity hover:opacity-75"
                            onClick={(e) => {
                                if (!disabled) {
                                    e.stopPropagation();
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.accept = 'image/*';
                                    input.onchange = (e) => {
                                        const files = (e.target as HTMLInputElement).files;
                                        if (files && files[0]) {
                                            onDrop([files[0]]);
                                        }
                                    };
                                    input.click();
                                }
                            }}
                            title="Click to replace file"
                        >
                            <img src={displayImage} alt="Featured Image Preview" className="h-48 w-full rounded-md object-cover" />
                        </div>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="mx-auto h-12 w-12 text-gray-400">
                            {isDragActive ? <Upload className="h-12 w-12" /> : <ImageIcon className="h-12 w-12" />}
                        </div>
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {isDragActive ? 'Drop the featured image here' : 'Drag & drop featured image here'}
                            </p>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">or click to browse files</p>
                            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">Will be uploaded when you save the gallery</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Supports: JPG, PNG, GIF, WebP (max 10MB)</p>
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
                            <ul className="ml-4 list-inside list-disc">
                                {errors.map((error) => (
                                    <li key={error.code}>
                                        {error.code === 'file-too-large'
                                            ? 'File is too large. Max size is 10MB'
                                            : error.code === 'file-invalid-type'
                                              ? 'File type not supported. Use JPG, PNG, GIF, or WebP'
                                              : error.message}
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
