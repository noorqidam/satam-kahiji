import { Head, router } from '@inertiajs/react';
import { AlertCircle, BookOpen, CheckCircle, Clock, ExternalLink, FolderOpen, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AddWorkItemDialog } from '@/components/teacher/work-items/add-work-item-dialog';
import { ApprovedCard } from '@/components/teacher/work-items/approved-card';
import { InitializeFoldersDialog } from '@/components/teacher/work-items/initialize-folders-dialog';
import { MultiFileUpload } from '@/components/teacher/work-items/multi-file-upload';
import { WorkItemFileList } from '@/components/teacher/work-items/work-item-file-list';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { TeacherWorkDashboardProps } from '@/types/workItem';

export default function TeacherWorkDashboard({ progress, teacher, userRole }: TeacherWorkDashboardProps) {
    const { toast } = useToast();
    const { t } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('teacher_work_items.breadcrumbs.teacher_dashboard'), href: '/teacher/dashboard' },
        { title: t('teacher_work_items.breadcrumbs.my_work_items'), href: '/teacher/work-items' },
    ];
    const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
    const [showInitializeDialog, setShowInitializeDialog] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [workItemToDelete, setWorkItemToDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Calculate overall progress
    const totalWorkItems = progress.reduce((sum, subject) => sum + subject.total_work_items, 0);
    const completedWorkItems = progress.reduce((sum, subject) => sum + subject.completed_work_items, 0);
    const overallProgress = totalWorkItems > 0 ? Math.round((completedWorkItems / totalWorkItems) * 100) : 0;

    // Calculate approved files count
    const { totalFiles, approvedFiles } = progress.reduce(
        (acc, subject) => {
            subject.work_items.forEach((workItemData) => {
                workItemData.files.forEach((file) => {
                    acc.totalFiles += 1;
                    if (file.latest_feedback?.status === 'approved') {
                        acc.approvedFiles += 1;
                    }
                });
            });
            return acc;
        },
        { totalFiles: 0, approvedFiles: 0 },
    );

    // Check if user can delete a work item (teachers can only delete optional items they created)
    const canDeleteWorkItem = (workItem: any) => {
        return userRole === 'teacher' && !workItem.is_required && workItem.created_by_role === 'teacher';
    };

    // Get feedback summary for a work item
    const getWorkItemFeedbackSummary = (workItemData: any) => {
        const files = workItemData.files || [];
        const approved = files.filter((file: any) => file.latest_feedback?.status === 'approved').length;
        const needsRevision = files.filter((file: any) => file.latest_feedback?.status === 'needs_revision').length;
        const pending = files.filter((file: any) => !file.latest_feedback || file.latest_feedback.status === 'pending').length;

        return { approved, needsRevision, pending, total: files.length };
    };

    // Get feedback status badge for work item
    const getWorkItemFeedbackBadge = (workItemData: any) => {
        const summary = getWorkItemFeedbackSummary(workItemData);

        if (summary.total === 0) {
            return null;
        }

        if (summary.needsRevision > 0) {
            return (
                <div className="flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="h-3 w-3" />
                    <span>
                        {summary.needsRevision}{' '}
                        {summary.needsRevision > 1
                            ? t('teacher_work_items.work_item.needs_revision')
                            : t('teacher_work_items.work_item.need_revision')}
                    </span>
                </div>
            );
        }

        if (summary.approved === summary.total) {
            return (
                <div className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    <span>{t('teacher_work_items.work_item.all_approved')}</span>
                </div>
            );
        }

        if (summary.pending > 0) {
            return (
                <div className="flex items-center gap-1 text-xs text-blue-600">
                    <Clock className="h-3 w-3" />
                    <span>
                        {summary.pending} {t('teacher_work_items.work_item.pending_review')}
                    </span>
                </div>
            );
        }

        return null;
    };

    const handleDeleteClick = (workItem: any) => {
        setWorkItemToDelete(workItem);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!workItemToDelete) return;

        setIsDeleting(true);
        router.delete(route('teacher.work-items.destroy', workItemToDelete.id), {
            onSuccess: (page) => {
                const flash = page.props.flash as any;
                if (flash?.success) {
                    toast({
                        title: t('teacher_work_items.success_messages.success'),
                        description: flash.success as string,
                        variant: 'success',
                    });
                }
                setWorkItemToDelete(null);
                setIsDeleting(false);
            },
            onError: (errors) => {
                const errorMessage = errors.error || t('teacher_work_items.error_messages.delete_failed');
                toast({
                    title: t('teacher_work_items.error_messages.error'),
                    description: errorMessage as string,
                    variant: 'destructive',
                });
                setWorkItemToDelete(null);
                setIsDeleting(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('teacher_work_items.page_title')} />

            <div className="space-y-6 px-4 sm:space-y-8 sm:px-6">
                {/* Header */}
                <div className="border-b border-gray-200 pb-4 sm:pb-6 dark:border-gray-700">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center sm:gap-0">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-gray-100">{t('teacher_work_items.page_title')}</h1>
                            <p className="mt-1 text-xs leading-relaxed text-gray-600 sm:mt-2 sm:text-sm dark:text-gray-400">
                                <span className="hidden sm:inline">{t('teacher_work_items.page_description.full')}</span>
                                <span className="sm:hidden">{t('teacher_work_items.page_description.short')}</span>
                            </p>
                        </div>
                        <div className="flex-shrink-0">
                            <AddWorkItemDialog onSuccess={() => router.reload({ only: ['progress'] })} />
                        </div>
                    </div>
                </div>

                {/* Overall Progress */}
                <Card>
                    <CardHeader className="pb-0">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                            {t('teacher_work_items.overall_progress.title')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 sm:space-y-4">
                            <div className="flex flex-row items-center justify-between gap-2">
                                <span className="text-sm font-medium">{t('teacher_work_items.overall_progress.completion_rate')}</span>
                                <span className="text-xl font-bold text-blue-600 sm:text-2xl">{overallProgress}%</span>
                            </div>
                            <Progress value={overallProgress} className="h-2 sm:h-3" />
                            <p className="text-xs leading-relaxed text-gray-500 sm:text-sm">
                                <span className="font-medium">{completedWorkItems}</span> {t('common.of')}{' '}
                                <span className="font-medium">{totalWorkItems}</span> {t('teacher_work_items.overall_progress.work_items_completed')}
                                <span className="hidden sm:inline"> {t('teacher_work_items.overall_progress.across_all_subjects')}</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Subject Progress */}
                <div className="grid gap-4 sm:gap-6">
                    {progress.map((subjectProgress) => (
                        <Card key={subjectProgress.subject.id}>
                            <CardHeader className="pb-0">
                                <div className="flex flex-row items-center justify-between gap-3">
                                    <div className="flex min-w-0 flex-1 flex-col justify-center">
                                        <CardTitle className="truncate text-base sm:text-lg">{subjectProgress.subject.name}</CardTitle>
                                        <p className="mt-1 text-xs text-gray-500 sm:text-sm">{subjectProgress.subject.code}</p>
                                    </div>
                                    <div className="flex flex-shrink-0 flex-col items-end justify-center text-right">
                                        <div className="text-xl font-bold text-green-600 sm:text-2xl">{subjectProgress.completion_percentage}%</div>
                                        <p className="text-xs text-gray-500">
                                            <span className="sm:hidden">
                                                {subjectProgress.completed_work_items}/{subjectProgress.total_work_items}
                                            </span>
                                            <span className="hidden sm:inline">
                                                {subjectProgress.completed_work_items} {t('common.of')} {subjectProgress.total_work_items}{' '}
                                                {t('subject_details.work_items.completed')}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 sm:space-y-4">
                                    <Progress value={subjectProgress.completion_percentage} className="h-2 sm:h-3" />

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                                        {subjectProgress.work_items.map((workItemData) => (
                                            <div key={workItemData.work_item.id} className="w-full space-y-3 rounded-lg border p-3 sm:p-4">
                                                <div className="flex flex-row items-start justify-between gap-2">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                                                            <div className="min-w-0 flex-1">
                                                                <h4 className="truncate text-sm font-medium">{workItemData.work_item.name}</h4>
                                                                <div className="mt-1 flex items-center gap-2">
                                                                    {workItemData.work_item.is_required ? (
                                                                        <Badge variant="destructive" className="text-xs">
                                                                            {t('teacher_work_items.work_item.required')}
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge variant="secondary" className="text-xs">
                                                                            {t('teacher_work_items.work_item.optional')}
                                                                        </Badge>
                                                                    )}
                                                                    {canDeleteWorkItem(workItemData.work_item) && (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => handleDeleteClick(workItemData.work_item)}
                                                                            className="h-5 w-5 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 sm:h-6 sm:w-6"
                                                                            title={t('teacher_work_items.work_item.delete_work_item')}
                                                                        >
                                                                            <Trash2 className="h-2 w-2 sm:h-3 sm:w-3" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex-shrink-0 text-right">
                                                        <div className="text-base font-semibold sm:text-lg">{workItemData.files_count}</div>
                                                        <p className="text-xs text-gray-500">{t('teacher_work_items.work_item.files')}</p>
                                                    </div>
                                                </div>

                                                {/* Feedback Status */}
                                                {getWorkItemFeedbackBadge(workItemData) && (
                                                    <div className="border-t pt-2">{getWorkItemFeedbackBadge(workItemData)}</div>
                                                )}

                                                <div className="space-y-2 sm:space-y-3">
                                                    {workItemData.has_folder ? (
                                                        <div className="space-y-2 sm:space-y-3">
                                                            {workItemData.folder_url && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="w-full text-xs sm:text-sm"
                                                                    onClick={() => window.open(workItemData.folder_url!, '_blank')}
                                                                >
                                                                    <ExternalLink className="mr-1 h-3 w-3 sm:mr-2" />
                                                                    <span className="hidden sm:inline">
                                                                        {t('teacher_work_items.folder_management.open_folder')}
                                                                    </span>
                                                                    <span className="sm:hidden">
                                                                        {t('teacher_work_items.folder_management.open')}
                                                                    </span>
                                                                </Button>
                                                            )}

                                                            <MultiFileUpload
                                                                subjectId={subjectProgress.subject.id}
                                                                workItemId={workItemData.work_item.id}
                                                                teacherId={teacher.id}
                                                                onUploadSuccess={() => router.reload({ only: ['progress'] })}
                                                                maxFiles={5}
                                                                maxFileSize={10}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full text-xs sm:text-sm"
                                                            onClick={() => {
                                                                setSelectedSubject(subjectProgress.subject.id);
                                                                setShowInitializeDialog(true);
                                                            }}
                                                        >
                                                            <FolderOpen className="mr-1 h-3 w-3 sm:mr-2" />
                                                            <span className="hidden sm:inline">
                                                                {t('teacher_work_items.folder_management.initialize_folders')}
                                                            </span>
                                                            <span className="sm:hidden">{t('teacher_work_items.folder_management.initialize')}</span>
                                                        </Button>
                                                    )}
                                                </div>

                                                {workItemData.files.length > 0 && (
                                                    <WorkItemFileList
                                                        files={workItemData.files}
                                                        onFileDelete={() => router.reload({ only: ['progress'] })}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Initialize Folders Dialog */}
                <InitializeFoldersDialog
                    open={showInitializeDialog}
                    onOpenChange={(open) => {
                        setShowInitializeDialog(open);
                        if (!open) {
                            setSelectedSubject(null); // Reset selected subject when dialog closes
                        }
                    }}
                    teacherId={teacher.id}
                    subjectId={selectedSubject}
                    onSuccess={() => {
                        router.reload({ only: ['progress'] });
                    }}
                />

                {/* Delete Work Item Confirmation Dialog */}
                <DeleteConfirmationDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    title={t('teacher_work_items.work_item.delete_title')}
                    description={t('teacher_work_items.work_item.delete_description')}
                    itemName={workItemToDelete?.name}
                    itemType={t('teacher_work_items.work_item.delete_work_item')}
                    onConfirm={handleConfirmDelete}
                    isLoading={isDeleting}
                />
            </div>

            {/* Approved Card in Right Corner */}
            <ApprovedCard approvedCount={approvedFiles} totalCount={totalFiles} />
        </AppLayout>
    );
}
