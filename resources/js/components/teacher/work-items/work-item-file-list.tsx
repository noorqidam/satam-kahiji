import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';
import { FileIcon } from '@/components/ui/file-icon';
import { FilePreviewDialog } from '@/components/ui/file-preview-dialog';
import { useFileSize } from '@/hooks/use-file-metadata';
import { useToast } from '@/hooks/use-toast';
import { createFileService, type FileOperations } from '@/services/file-service';
import { createNotificationService, type NotificationService } from '@/services/notification-service';
import type { TeacherWorkFile } from '@/types/workItem';
import { createFileUtils, type FileUtils } from '@/utils/file-utils';
import { AlertCircle, Calendar, CheckCircle, Clock, ExternalLink, Eye, FileText, MessageSquare, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface WorkItemFileListProps {
    files: TeacherWorkFile[];
    onFileDelete: () => void;
}

export function WorkItemFileList({ files, onFileDelete }: WorkItemFileListProps) {
    const { t } = useTranslation('common');
    const { toast } = useToast();
    const [deletingFileId, setDeletingFileId] = useState<number | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState<TeacherWorkFile | null>(null);
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
    const [fileToPreview, setFileToPreview] = useState<TeacherWorkFile | null>(null);

    // File size formatting utility
    const { formatFileSize } = useFileSize();

    // Dependency Injection: Create services using factories
    const fileService: FileOperations = useMemo(() => createFileService(), []);
    const notificationService: NotificationService = useMemo(() => createNotificationService(toast), [toast]);
    const fileUtils: FileUtils = useMemo(() => createFileUtils(), []);

    // Get feedback status badge with enhanced styling
    const getFeedbackStatusBadge = (file: TeacherWorkFile) => {
        if (!file.latest_feedback) {
            return (
                <Badge className="inline-flex items-center rounded-full border border-blue-200 bg-gradient-to-r from-blue-50 to-sky-50 px-3 py-2 text-xs font-semibold whitespace-nowrap text-blue-700 shadow-md dark:border-blue-700/50 dark:from-blue-900/40 dark:to-sky-900/40 dark:text-blue-300">
                    <Clock className="mr-1.5 h-3.5 w-3.5 flex-shrink-0 animate-pulse" />
                    <span>{t('work_item_files.status.pending_review')}</span>
                </Badge>
            );
        }

        switch (file.latest_feedback.status) {
            case 'approved':
                return (
                    <Badge className="inline-flex items-center rounded-full border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 px-3 py-2 text-xs font-semibold whitespace-nowrap text-emerald-700 shadow-md dark:border-emerald-700/50 dark:from-emerald-900/40 dark:to-green-900/40 dark:text-emerald-300">
                        <CheckCircle className="mr-1.5 h-3.5 w-3.5 flex-shrink-0" />
                        <span>{t('work_item_files.status.approved')}</span>
                    </Badge>
                );
            case 'needs_revision':
                return (
                    <Badge className="inline-flex items-center rounded-full border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 px-3 py-2 text-xs font-semibold whitespace-nowrap text-red-700 shadow-md dark:border-red-700/50 dark:from-red-900/40 dark:to-rose-900/40 dark:text-red-300">
                        <AlertCircle className="mr-1.5 h-3.5 w-3.5 flex-shrink-0 animate-pulse" />
                        <span>{t('work_item_files.status.needs_revision')}</span>
                    </Badge>
                );
            case 'pending':
            default:
                return (
                    <Badge className="inline-flex items-center rounded-full border border-blue-200 bg-gradient-to-r from-blue-50 to-sky-50 px-3 py-2 text-xs font-semibold whitespace-nowrap text-blue-700 shadow-md dark:border-blue-700/50 dark:from-blue-900/40 dark:to-sky-900/40 dark:text-blue-300">
                        <Clock className="mr-1.5 h-3.5 w-3.5 flex-shrink-0 animate-pulse" />
                        <span>{t('work_item_files.status.pending_review')}</span>
                    </Badge>
                );
        }
    };

    const handleDeleteClick = (file: TeacherWorkFile) => {
        setFileToDelete(file);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!fileToDelete) return;

        setDeletingFileId(fileToDelete.id);

        try {
            await fileService.deleteFile(fileToDelete.id);
            notificationService.showSuccess('File deleted successfully.');
            onFileDelete();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete file.';
            notificationService.showError(errorMessage);
        } finally {
            setDeletingFileId(null);
            setFileToDelete(null);
        }
    };

    const openFile = async (file: TeacherWorkFile) => {
        try {
            // Track file access
            await fetch(route('work-items.track-access', { file: file.id }), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ action: 'view' }),
            });
        } catch (error) {
            console.warn('Failed to track file access:', error);
        }

        // Open the file
        window.open(file.file_url, '_blank');
    };

    const handlePreviewFile = (file: TeacherWorkFile) => {
        // No need to fetch metadata - file_size is already in the database
        setFileToPreview(file);
        setPreviewDialogOpen(true);
    };

    if (files.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            {/* Enhanced Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h5 className="text-base font-semibold text-gray-900 dark:text-gray-100">{t('work_item_files.uploaded_files')}</h5>
                </div>
                <div className="flex items-center gap-2">
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                        {files.length} {files.length !== 1 ? t('work_item_files.file_count_plural') : t('work_item_files.file_count')}
                    </span>
                </div>
            </div>

            <div className="grid gap-4 sm:gap-3">
                {files.map((file, index) => {
                    return (
                        <div
                            key={file.id}
                            className={`group relative w-full max-w-full overflow-hidden rounded-xl border border-gray-200/80 bg-gradient-to-br from-white to-gray-50/50 p-5 shadow-sm transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500/20 hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg hover:shadow-gray-200/20 sm:p-4 dark:border-gray-700/50 dark:from-gray-800 dark:to-gray-800/80 dark:hover:border-gray-600 dark:hover:shadow-lg dark:hover:shadow-black/10 ${
                                index === 0 ? 'ring-2 ring-blue-500/10' : ''
                            } animate-in fade-in slide-in-from-bottom-2`}
                            style={{
                                animationDelay: `${index * 150}ms`,
                                animationFillMode: 'both',
                            }}
                            role="article"
                            aria-label={`File: ${file?.file_name || 'Unknown file'}`}
                        >
                            {/* File Header with Icon, Name, and Status */}
                            <div className="mb-5 flex w-full min-w-0 items-start gap-4">
                                <div className="mt-1 flex-shrink-0">
                                    <div className="transition-transform duration-200 group-hover:scale-105">
                                        <FileIcon fileName={file?.file_name} size="sm" />
                                    </div>
                                </div>

                                <div className="min-w-0 flex-1 overflow-hidden">
                                    <div className="mb-4 flex w-full min-w-0 items-start justify-between gap-2">
                                        <h4
                                            className="min-w-0 flex-1 overflow-hidden text-base leading-tight font-semibold break-words text-gray-900 sm:text-sm lg:text-base dark:text-gray-100"
                                            title={file?.file_name || 'Unknown file'}
                                            id={`file-title-${file.id}`}
                                        >
                                            {file?.file_name || 'Unknown file'}
                                        </h4>
                                        <div className="ml-2 flex-shrink-0">{getFeedbackStatusBadge(file)}</div>
                                    </div>

                                    {/* File Metadata Cards */}
                                    <div className="w-full space-y-2.5">
                                        <div className="flex w-full min-w-0 items-center gap-3 rounded-lg bg-white/70 p-3 shadow-sm dark:bg-gray-700/40">
                                            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
                                                <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="min-w-0 flex-1 overflow-hidden">
                                                <p className="mb-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                    {t('work_item_files.metadata.uploaded')}
                                                </p>
                                                <p className="overflow-hidden text-sm font-semibold break-words text-gray-700 dark:text-gray-300">
                                                    {fileUtils.formatDate(file.uploaded_at)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex w-full min-w-0 items-center gap-3 rounded-lg bg-white/70 p-3 shadow-sm dark:bg-gray-700/40">
                                            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                                                <FileText className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div className="min-w-0 flex-1 overflow-hidden">
                                                <p className="mb-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                    {t('work_item_files.metadata.size')}
                                                </p>
                                                <p className="overflow-hidden text-sm font-semibold break-words text-gray-700 dark:text-gray-300">
                                                    {file.file_size ? formatFileSize(file.file_size) : 'Unknown'}
                                                </p>
                                            </div>
                                        </div>

                                        {file.last_accessed && (
                                            <div className="flex w-full min-w-0 items-center gap-3 rounded-lg bg-white/70 p-3 shadow-sm dark:bg-gray-700/40">
                                                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/40">
                                                    <Clock className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                                                </div>
                                                <div className="min-w-0 flex-1 overflow-hidden">
                                                    <p className="mb-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                        {t('work_item_files.metadata.last_accessed')}
                                                    </p>
                                                    <p
                                                        className="overflow-hidden text-sm font-semibold break-words text-gray-700 dark:text-gray-300"
                                                        title={`Last accessed: ${fileUtils.formatDate(file.last_accessed)}`}
                                                    >
                                                        {fileUtils.formatDate(file.last_accessed)}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-5 w-full border-t border-gray-200/80 pt-4 dark:border-gray-600/50">
                                <div className="grid w-full grid-cols-3 gap-2 sm:gap-3" role="group" aria-labelledby={`file-title-${file.id}`}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="group relative h-10 flex-1 overflow-hidden rounded-lg border border-transparent bg-gradient-to-r from-blue-50 to-blue-100 text-xs font-semibold text-blue-700 transition-all hover:border-blue-200 hover:from-blue-100 hover:to-blue-200 hover:shadow-sm active:scale-95 sm:text-sm dark:from-blue-900/20 dark:to-blue-800/20 dark:text-blue-300 dark:hover:from-blue-800/30 dark:hover:to-blue-700/30"
                                        onClick={() => handlePreviewFile(file)}
                                        aria-label={`Preview ${file?.file_name || 'file'}`}
                                        title="Preview file"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 transition-opacity group-hover:opacity-100" />
                                        <Eye className="mr-1.5 h-3.5 w-3.5 transition-transform group-hover:scale-110" />
                                        <span className="relative">{t('work_item_files.actions.preview')}</span>
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="group relative h-10 flex-1 overflow-hidden rounded-lg border border-transparent bg-gradient-to-r from-green-50 to-green-100 text-xs font-semibold text-green-700 transition-all hover:border-green-200 hover:from-green-100 hover:to-green-200 hover:shadow-sm active:scale-95 sm:text-sm dark:from-green-900/20 dark:to-green-800/20 dark:text-green-300 dark:hover:from-green-800/30 dark:hover:to-green-700/30"
                                        onClick={() => openFile(file)}
                                        title="Open file"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 opacity-0 transition-opacity group-hover:opacity-100" />
                                        <ExternalLink className="mr-1.5 h-3.5 w-3.5 transition-transform group-hover:scale-110" />
                                        <span className="relative">{t('work_item_files.actions.open')}</span>
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="group relative h-10 flex-1 overflow-hidden rounded-lg border border-transparent bg-gradient-to-r from-red-50 to-red-100 text-xs font-semibold text-red-700 transition-all hover:border-red-200 hover:from-red-100 hover:to-red-200 hover:shadow-sm active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm dark:from-red-900/20 dark:to-red-800/20 dark:text-red-300 dark:hover:from-red-800/30 dark:hover:to-red-700/30"
                                        onClick={() => handleDeleteClick(file)}
                                        disabled={deletingFileId === file.id}
                                        title="Delete file"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 opacity-0 transition-opacity group-hover:opacity-100" />
                                        <Trash2
                                            className={`mr-1.5 h-3.5 w-3.5 transition-transform group-hover:scale-110 ${deletingFileId === file.id ? 'animate-pulse' : ''}`}
                                        />
                                        <span className="relative">
                                            {deletingFileId === file.id ? t('work_item_files.actions.deleting') : t('work_item_files.actions.delete')}
                                        </span>
                                    </Button>
                                </div>
                            </div>

                            {/* Feedback Details */}
                            {file.latest_feedback && (
                                <div className="mt-4 overflow-hidden rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-sm dark:border-amber-800/50 dark:from-amber-900/20 dark:to-orange-900/20">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
                                                <MessageSquare className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex items-center gap-2">
                                                    <h5 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                                                        {t('work_item_files.feedback_from')} {file.latest_feedback.reviewer.name}
                                                    </h5>
                                                    <div className="flex h-2 w-2 rounded-full bg-amber-500 dark:bg-amber-400"></div>
                                                </div>
                                                <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                                                    {fileUtils.formatDate(file.latest_feedback.reviewed_at)}
                                                </span>
                                            </div>
                                            <div className="rounded-md bg-white/60 p-3 dark:bg-gray-800/40">
                                                <p className="text-sm leading-relaxed break-words text-gray-700 dark:text-gray-300">
                                                    {file.latest_feedback.feedback}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                itemName={fileToDelete?.file_name}
                itemType="file"
                onConfirm={handleConfirmDelete}
                isLoading={deletingFileId === fileToDelete?.id}
            />

            {/* File Preview Dialog */}
            {fileToPreview && (
                <FilePreviewDialog
                    file={fileToPreview}
                    isOpen={previewDialogOpen}
                    onClose={() => {
                        setPreviewDialogOpen(false);
                        setFileToPreview(null);
                    }}
                />
            )}
        </div>
    );
}
