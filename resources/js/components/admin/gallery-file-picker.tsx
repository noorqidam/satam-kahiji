import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ImageIcon, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import GalleryDrivePicker from './gallery-drive-picker';

interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    webContentLink?: string;
    thumbnailLink?: string;
    isImage: boolean;
    isVideo: boolean;
}

interface GalleryFilePickerProps {
    galleryId?: number;
    gallerySlug?: string;
    selectedFile?: DriveFile | null;
    onFileSelect: (file: DriveFile) => void;
    onFileRemove: () => void;
    fileTypes?: ('image' | 'video')[];
    label?: string;
    placeholder?: string;
    disabled?: boolean;
}

export default function GalleryFilePicker({
    galleryId,
    gallerySlug,
    selectedFile,
    onFileSelect,
    onFileRemove,
    fileTypes = ['image'],
    label = 'Select File',
    placeholder = 'No file selected',
    disabled = false,
}: GalleryFilePickerProps) {
    const { t } = useTranslation();
    const [dragOver, setDragOver] = useState(false);

    // If no gallery is provided yet, show upload-only interface
    if (!galleryId || !gallerySlug) {
        return (
            <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
                <CardContent className="p-6 text-center">
                    <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400">{t('gallery_management.show.file_picker.save_first')}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-3">
            {/* Selected File Display */}
            {selectedFile ? (
                <Card className="relative">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            {/* Thumbnail */}
                            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                {selectedFile.isImage && selectedFile.thumbnailLink ? (
                                    <img src={selectedFile.thumbnailLink} alt={selectedFile.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <ImageIcon className="h-6 w-6 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            {/* File Info */}
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {selectedFile.isImage ? 'Image' : selectedFile.isVideo ? 'Video' : 'File'}
                                </p>
                            </div>

                            {/* Remove Button */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onFileRemove}
                                disabled={disabled}
                                className="text-red-600 hover:bg-red-50 hover:text-red-800"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                /* Empty State - File Picker */
                <Card
                    className={`cursor-pointer border-2 border-dashed transition-colors ${
                        dragOver ? 'border-blue-400 bg-blue-50 dark:bg-blue-950' : 'border-gray-300 hover:border-gray-400 dark:border-gray-600'
                    } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                    onDragOver={(e) => {
                        e.preventDefault();
                        if (!disabled) setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        // Handle file drop if needed
                    }}
                >
                    <CardContent className="p-8 text-center">
                        <ImageIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{placeholder}</h3>
                        <p className="mb-4 text-gray-600 dark:text-gray-400">{t('gallery_management.show.file_picker.choose_from_drive')}</p>

                        <GalleryDrivePicker
                            galleryId={galleryId}
                            gallerySlug={gallerySlug}
                            onFileSelect={onFileSelect}
                            fileTypes={fileTypes}
                            multiSelect={false}
                            trigger={
                                <Button disabled={disabled}>
                                    <ImageIcon className="mr-2 h-4 w-4" />
                                    {label}
                                </Button>
                            }
                        />
                    </CardContent>
                </Card>
            )}

            {/* Change File Button for Selected State */}
            {selectedFile && (
                <div className="flex justify-center">
                    <GalleryDrivePicker
                        galleryId={galleryId}
                        gallerySlug={gallerySlug}
                        onFileSelect={onFileSelect}
                        fileTypes={fileTypes}
                        multiSelect={false}
                        trigger={
                            <Button variant="outline" disabled={disabled}>
                                {t('gallery_management.show.file_picker.change_file')}
                            </Button>
                        }
                    />
                </div>
            )}
        </div>
    );
}
