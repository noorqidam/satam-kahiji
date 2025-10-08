/**
 * Enhanced file upload component with drag-and-drop support and file type icons
 *
 * Features:
 * - Multiple file selection and drag-and-drop
 * - File type icons (PDF, Word, Excel, PowerPoint, Images, etc.)
 * - Upload progress tracking with XMLHttpRequest
 * - File validation (size, type)
 * - Retry failed uploads
 *
 * Supported file types:
 * - Documents: PDF, DOC, DOCX, TXT, RTF
 * - Spreadsheets: XLS, XLSX, CSV, ODS
 * - Presentations: PPT, PPTX, ODP
 * - Images: JPG, JPEG, PNG, GIF, BMP, WEBP, SVG
 * - Videos: MP4, AVI, MKV, MOV, WMV, FLV, WEBM
 * - Audio: MP3, WAV, OGG, FLAC, AAC
 * - Archives: ZIP, RAR, 7Z, TAR, GZ
 * - Code: JS, TS, HTML, CSS, PHP, PY, JAVA, etc.
 */
import { Button } from '@/components/ui/button';
import { FileIcon } from '@/components/ui/file-icon';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { uploadService } from '@/services/upload-service';
import { formatFileSize, getFileTypeInfo } from '@/utils/file-icons';
import {
    FileWithProgress,
    createFileWithProgress,
    getFileStatistics,
    removeFile as removeFileFromList,
    resetFailedFiles,
    updateFileStatus,
} from '@/utils/file-management';
import { handleUploadError } from '@/utils/upload-error-handler';
import { AlertCircle, CheckCircle, Loader2, Upload, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

interface MultiFileUploadProps {
    subjectId: number;
    workItemId: number;
    teacherId: number;
    onUploadSuccess: () => void;
    maxFiles?: number;
    maxFileSize?: number; // in MB
}

export function MultiFileUpload({ subjectId, workItemId, teacherId, onUploadSuccess, maxFiles = 10, maxFileSize = 10 }: MultiFileUploadProps) {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<FileWithProgress[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const addFiles = useCallback(
        (newFiles: File[]) => {
            const existingFiles = files.map((f) => f.file);
            const { validFiles, errors } = uploadService.validateFiles(newFiles, existingFiles, maxFiles, maxFileSize);

            if (validFiles.length > 0) {
                const newFileObjects = validFiles.map(createFileWithProgress);
                setFiles((prev) => [...prev, ...newFileObjects]);
            }

            if (errors.length > 0) {
                toast({
                    title: 'Some files could not be added',
                    description: errors.slice(0, 3).join(', ') + (errors.length > 3 ? '...' : ''),
                    variant: 'destructive',
                });
            }
        },
        [files, maxFiles, maxFileSize, toast],
    );

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        addFiles(selectedFiles);

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(false);

            const droppedFiles = Array.from(e.dataTransfer.files);
            addFiles(droppedFiles);
        },
        [addFiles],
    );

    const removeFile = (fileId: string) => {
        setFiles((prev) => removeFileFromList(prev, fileId));
    };

    const uploadFile = async (fileWithProgress: FileWithProgress): Promise<boolean> => {
        try {
            // Get teacher subject work ID
            const teacherSubjectWorkId = await uploadService.getTeacherSubjectWorkId(teacherId, subjectId, workItemId);

            // Update file status to uploading
            setFiles((prev) =>
                updateFileStatus(prev, fileWithProgress.id, {
                    status: 'uploading',
                    progress: 0,
                }),
            );

            // Upload file with progress tracking
            await uploadService.uploadFile(fileWithProgress.file, teacherSubjectWorkId, {
                maxFileSize,
                onProgress: (progress) => {
                    setFiles((prev) =>
                        updateFileStatus(prev, fileWithProgress.id, {
                            progress: progress.percentage,
                        }),
                    );
                },
            });

            // Upload success
            setFiles((prev) =>
                updateFileStatus(prev, fileWithProgress.id, {
                    status: 'completed',
                    progress: 100,
                }),
            );
            return true;
        } catch (error) {
            console.error('Multi-file upload error:', error);
            const uploadError = handleUploadError(error);

            // Show specific toast messages for different error types
            if (uploadError.type === 'validation' && uploadError.message.includes('folders')) {
                toast({
                    title: 'Upload Failed',
                    description: 'Please ensure folders are initialized before uploading.',
                    variant: 'destructive',
                });
            } else if (uploadError.type === 'google_drive') {
                toast({
                    title: 'Google Drive Error',
                    description: uploadError.message,
                    variant: 'destructive',
                });
            } else if (uploadError.type === 'auth') {
                toast({
                    title: 'Authentication Error',
                    description: uploadError.message,
                    variant: 'destructive',
                });
            } else {
                toast({
                    title: 'Upload Failed',
                    description: uploadError.message,
                    variant: 'destructive',
                });
            }

            setFiles((prev) =>
                updateFileStatus(prev, fileWithProgress.id, {
                    status: 'error',
                    error: uploadError.message,
                    progress: 0,
                }),
            );
            return false;
        }
    };

    const uploadAllFiles = async () => {
        const stats = getFileStatistics(files);
        if (stats.pending === 0) return;

        setIsUploading(true);

        const pendingFiles = files.filter((f) => f.status === 'pending');
        const results = await Promise.allSettled(pendingFiles.map((file) => uploadFile(file)));

        const successCount = results.filter((r) => r.status === 'fulfilled' && r.value).length;
        const errorCount = results.length - successCount;

        setIsUploading(false);

        if (successCount > 0) {
            toast({
                title: 'Upload Complete',
                description: `${successCount} file(s) uploaded successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
                variant: successCount === results.length ? 'success' : 'default',
            });

            // Remove completed files from the upload list
            setFiles((prev) => prev.filter((f) => f.status !== 'completed'));

            onUploadSuccess();
        }

        if (errorCount === results.length) {
            toast({
                title: 'Upload Failed',
                description: 'All file uploads failed. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const retryFailed = () => {
        setFiles((prev) => resetFailedFiles(prev));
    };

    const stats = getFileStatistics(files);

    return (
        <div className="space-y-4">
            {/* Dropzone */}
            <div
                className={cn(
                    'rounded-lg border-2 border-dashed text-center transition-colors',
                    'p-4 sm:p-6', // Responsive padding
                    isDragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-300 dark:border-gray-600',
                    files.length === 0 ? 'py-8 sm:py-12' : 'py-4 sm:py-6', // Responsive vertical padding
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mkv,.mov,.zip,.rar"
                />

                <Upload className="mx-auto mb-3 h-8 w-8 text-gray-400 sm:mb-4 sm:h-12 sm:w-12" />
                <div className="space-y-2">
                    <p className="px-2 text-xs font-medium sm:text-sm">
                        <span className="hidden sm:inline">Drop files here or </span>
                        <span className="sm:hidden">Tap to </span>
                        <button onClick={() => fileInputRef.current?.click()} className="text-blue-500 underline hover:text-blue-700">
                            <span className="hidden sm:inline">browse</span>
                            <span className="sm:hidden">select files</span>
                        </button>
                    </p>
                    <div className="space-y-1 sm:space-y-2">
                        <p className="text-xs leading-relaxed text-gray-500">
                            Max {maxFiles} files, {maxFileSize}MB each
                        </p>
                        <p className="hidden text-xs leading-relaxed text-gray-500 sm:block">
                            Supports: Documents, Spreadsheets, Images, Videos, Archives
                        </p>
                        <p className="text-xs leading-relaxed text-gray-500 sm:hidden">PDF, DOC, XLS, PPT, Images, Videos</p>
                    </div>
                </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="space-y-3">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center sm:gap-0">
                        <h4 className="text-sm font-medium sm:text-base">
                            Files ({stats.total}/{maxFiles})
                        </h4>
                        <div className="flex gap-2 self-end sm:self-auto">
                            {stats.error > 0 && (
                                <Button variant="outline" size="sm" onClick={retryFailed} className="text-xs sm:text-sm">
                                    Retry Failed
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="max-h-48 space-y-2 overflow-y-auto sm:max-h-60">
                        {files.map((fileWithProgress) => {
                            const { file } = fileWithProgress;
                            const fileInfo = getFileTypeInfo(file?.name);

                            return (
                                <div key={fileWithProgress.id} className="flex items-start gap-2 rounded-lg border p-2 sm:gap-3 sm:p-3">
                                    <div className="flex-shrink-0">
                                        <FileIcon fileName={file?.name} size="md" className="sm:!h-8 sm:!w-8" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        {/* Mobile: Stack layout, Desktop: Side by side */}
                                        <div className="mb-1 flex flex-col justify-between gap-1 sm:flex-row sm:items-center sm:gap-2">
                                            <p className="truncate pr-2 text-xs font-medium sm:text-sm">{file?.name || 'Unknown file'}</p>
                                            <div className="flex items-center gap-1 self-end sm:gap-2 sm:self-auto">
                                                {fileWithProgress.status === 'completed' && (
                                                    <CheckCircle className="h-3 w-3 text-green-500 sm:h-4 sm:w-4" />
                                                )}
                                                {fileWithProgress.status === 'error' && (
                                                    <AlertCircle className="h-3 w-3 text-red-500 sm:h-4 sm:w-4" />
                                                )}
                                                {fileWithProgress.status === 'uploading' && (
                                                    <Loader2 className="h-3 w-3 animate-spin text-blue-500 sm:h-4 sm:w-4" />
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeFile(fileWithProgress.id)}
                                                    disabled={fileWithProgress.status === 'uploading'}
                                                    className="h-5 w-5 p-0 sm:h-6 sm:w-6"
                                                >
                                                    <X className="h-2 w-2 sm:h-3 sm:w-3" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                                            <span className="truncate">{fileInfo.category}</span>
                                            <span className="text-right sm:text-left">{formatFileSize(file?.size)}</span>
                                        </div>

                                        {fileWithProgress.status === 'uploading' && (
                                            <Progress value={fileWithProgress.progress} className="mt-2 h-1" />
                                        )}

                                        {fileWithProgress.status === 'error' && fileWithProgress.error && (
                                            <p className="mt-1 text-xs break-words text-red-500">{fileWithProgress.error}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Upload Actions */}
                    {stats.pending > 0 && (
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Button onClick={uploadAllFiles} disabled={isUploading} className="w-full flex-1 text-sm sm:w-auto">
                                {isUploading && <Loader2 className="mr-2 h-3 w-3 animate-spin sm:h-4 sm:w-4" />}
                                <span className="hidden sm:inline">
                                    Upload {stats.pending} File{stats.pending > 1 ? 's' : ''}
                                </span>
                                <span className="sm:hidden">
                                    Upload {stats.pending} file{stats.pending > 1 ? 's' : ''}
                                </span>
                            </Button>
                            <Button variant="outline" onClick={() => setFiles([])} disabled={isUploading} className="w-full text-sm sm:w-auto">
                                Clear All
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
