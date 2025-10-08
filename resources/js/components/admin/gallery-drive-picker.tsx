import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Check, FileImage, ImageIcon, Loader2, Play, Search, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    size?: number;
    thumbnailLink?: string;
    webContentLink?: string;
    webViewLink?: string;
    isImage: boolean;
    isVideo: boolean;
    formattedSize?: string;
    createdTime?: string;
}

interface GalleryDrivePickerProps {
    galleryId: number;
    gallerySlug: string;
    onFileSelect: (file: DriveFile) => void;
    selectedFiles?: DriveFile[];
    multiSelect?: boolean;
    fileTypes?: ('image' | 'video')[];
    trigger?: React.ReactNode;
}

export default function GalleryDrivePicker({
    galleryId,
    gallerySlug,
    onFileSelect,
    selectedFiles = [],
    multiSelect = false,
    fileTypes = ['image', 'video'],
    trigger,
}: GalleryDrivePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [files, setFiles] = useState<DriveFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set(selectedFiles.map((f) => f.id)));

    // Load gallery files when dialog opens
    useEffect(() => {
        if (isOpen) {
            loadFiles();
        }
    }, [isOpen]);

    const loadFiles = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(route('admin.galleries.files', gallerySlug));
            const data = await response.json();

            if (data.success) {
                setFiles(data.files);
            } else {
                setError(data.error || 'Failed to load files');
            }
        } catch (err) {
            setError('Failed to connect to Google Drive');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (!fileTypes.includes('image') && isImage) {
            setError('Images are not allowed');
            return;
        }

        if (!fileTypes.includes('video') && isVideo) {
            setError('Videos are not allowed');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(route('admin.galleries.upload', gallerySlug), {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();

            if (data.success) {
                // Add the new file to the list
                setFiles((prev) => [data.file, ...prev]);

                // Auto-select the uploaded file if single select
                if (!multiSelect) {
                    handleFileSelect(data.file);
                }
            } else {
                setError(data.error || 'Upload failed');
            }
        } catch (err) {
            setError('Upload failed');
        } finally {
            setUploading(false);
            // Reset file input
            event.target.value = '';
        }
    };

    const handleFileSelect = (file: DriveFile) => {
        if (multiSelect) {
            const newSelected = new Set(selectedFileIds);
            if (newSelected.has(file.id)) {
                newSelected.delete(file.id);
            } else {
                newSelected.add(file.id);
            }
            setSelectedFileIds(newSelected);
        } else {
            onFileSelect(file);
            setIsOpen(false);
        }
    };

    const handleConfirmSelection = () => {
        if (multiSelect) {
            const selectedFiles = files.filter((f) => selectedFileIds.has(f.id));
            selectedFiles.forEach((file) => onFileSelect(file));
        }
        setIsOpen(false);
    };

    const filteredFiles = files.filter((file) => {
        // Filter by file type
        if (fileTypes.length > 0) {
            const matchesType = fileTypes.some((type) => (type === 'image' && file.isImage) || (type === 'video' && file.isVideo));
            if (!matchesType) return false;
        }

        // Filter by search query
        if (searchQuery) {
            return file.name.toLowerCase().includes(searchQuery.toLowerCase());
        }

        return true;
    });

    const FileGrid = ({ files }: { files: DriveFile[] }) => (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {files.map((file) => {
                const isSelected = selectedFileIds.has(file.id);

                return (
                    <Card
                        key={file.id}
                        className={`cursor-pointer transition-all hover:shadow-lg ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => handleFileSelect(file)}
                    >
                        <CardContent className="p-3">
                            <div className="relative mb-2 aspect-square">
                                {file.isImage && file.thumbnailLink ? (
                                    <img src={file.thumbnailLink} alt={file.name} className="h-full w-full rounded-md object-cover" />
                                ) : file.isVideo ? (
                                    <div className="flex h-full w-full items-center justify-center rounded-md bg-gray-100">
                                        <Play className="h-8 w-8 text-gray-600" />
                                    </div>
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center rounded-md bg-gray-100">
                                        <FileImage className="h-8 w-8 text-gray-600" />
                                    </div>
                                )}

                                {isSelected && (
                                    <div className="absolute top-1 right-1 rounded-full bg-blue-500 p-1 text-white">
                                        <Check className="h-3 w-3" />
                                    </div>
                                )}

                                <div className="absolute bottom-1 left-1">
                                    {file.isImage && <ImageIcon className="h-4 w-4 text-white drop-shadow-lg" />}
                                    {file.isVideo && <Play className="h-4 w-4 text-white drop-shadow-lg" />}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="truncate text-xs font-medium" title={file.name}>
                                    {file.name}
                                </p>
                                {file.formattedSize && <p className="text-xs text-muted-foreground">{file.formattedSize}</p>}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline">
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Browse Gallery Files
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="max-h-[80vh] max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Gallery Files</DialogTitle>
                    <DialogDescription>Browse or upload files for this gallery. Files are stored in your Google Drive.</DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="browse" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="browse">Browse Files</TabsTrigger>
                        <TabsTrigger value="upload">Upload New</TabsTrigger>
                    </TabsList>

                    <TabsContent value="browse" className="space-y-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search files..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                                <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                Loading files...
                            </div>
                        ) : filteredFiles.length === 0 ? (
                            <div className="py-12 text-center">
                                <ImageIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {searchQuery ? 'No files match your search' : 'No files in this gallery yet'}
                                </p>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {searchQuery ? 'Try adjusting your search terms' : 'Upload some files to get started'}
                                </p>
                            </div>
                        ) : (
                            <ScrollArea className="h-96">
                                <FileGrid files={filteredFiles} />
                            </ScrollArea>
                        )}

                        {/* Multi-select Actions */}
                        {multiSelect && selectedFileIds.size > 0 && (
                            <div className="flex items-center justify-between rounded-md border border-blue-200 bg-blue-50 p-3">
                                <span className="text-sm text-blue-800">
                                    {selectedFileIds.size} file{selectedFileIds.size === 1 ? '' : 's'} selected
                                </span>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedFileIds(new Set())}>
                                        Clear
                                    </Button>
                                    <Button size="sm" onClick={handleConfirmSelection}>
                                        Use Selected
                                    </Button>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="upload" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Upload className="h-5 w-5" />
                                    Upload New File
                                </CardTitle>
                                <CardDescription>Upload images or videos to this gallery's Google Drive folder</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="file-upload">Select File ({fileTypes.join(', ')})</Label>
                                    <Input
                                        id="file-upload"
                                        type="file"
                                        onChange={handleFileUpload}
                                        disabled={uploading}
                                        accept={
                                            fileTypes.includes('image') && fileTypes.includes('video')
                                                ? 'image/*,video/*'
                                                : fileTypes.includes('image')
                                                  ? 'image/*'
                                                  : 'video/*'
                                        }
                                        className="mt-1"
                                    />
                                </div>

                                {uploading && (
                                    <div className="flex items-center gap-2 text-sm text-blue-600">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Uploading to Google Drive...
                                    </div>
                                )}

                                <p className="text-sm text-muted-foreground">
                                    Maximum file size: 20MB. Supported formats: JPEG, PNG, GIF, WebP, MP4, MOV, AVI, MKV, WebM
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
