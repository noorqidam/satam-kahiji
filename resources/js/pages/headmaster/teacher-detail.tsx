import { Head } from '@inertiajs/react';
import { AlertCircle, Calendar, Clock, ExternalLink, Eye, FileCheck, FileText, MessageSquare, User } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FeedbackDialog } from '@/components/headmaster/feedback-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileIcon } from '@/components/ui/file-icon';
import { FilePreviewDialog } from '@/components/ui/file-preview-dialog';
import { useFileSize } from '@/hooks/use-file-metadata';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Subject } from '@/types/subject';
import type { TeacherWithUserDetail } from '@/types/teacher';
import type { TeacherSubjectWork, TeacherWorkFile } from '@/types/workItem';

interface TeacherDetailProps {
    teacher: TeacherWithUserDetail;
}

export default function TeacherDetail({ teacher }: TeacherDetailProps) {
    const { t } = useTranslation();
    const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<TeacherWorkFile | null>(null);
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
    const [fileToPreview, setFileToPreview] = useState<TeacherWorkFile | null>(null);

    // File size formatting utility
    const { formatFileSize } = useFileSize();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('teacher_detail.breadcrumbs.headmaster_dashboard'), href: '/headmaster/dashboard' },
        { title: t('teacher_detail.breadcrumbs.staff_overview'), href: '/headmaster/staff-overview' },
        { title: teacher.user.name, href: `/headmaster/staff-overview/${teacher.id}` },
    ];

    const handleProvideFeedback = (file: TeacherWorkFile) => {
        setSelectedFile(file);
        setFeedbackDialogOpen(true);
    };

    const handlePreviewFile = (file: TeacherWorkFile) => {
        // No need to fetch metadata - file_size is already in the database
        setFileToPreview(file);
        setPreviewDialogOpen(true);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        {t('teacher_detail.status.approved')}
                    </Badge>
                );
            case 'needs_revision':
                return <Badge variant="destructive">{t('teacher_detail.status.needs_revision')}</Badge>;
            case 'pending':
            default:
                return <Badge variant="secondary">{t('teacher_detail.status.pending_review')}</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Group work items by subject
    const workItemsBySubject = teacher.teacher_subject_works.reduce(
        (acc, work) => {
            const subjectKey = work.subject.id;
            if (!acc[subjectKey]) {
                acc[subjectKey] = {
                    subject: work.subject,
                    workItems: [],
                };
            }
            acc[subjectKey].workItems.push(work);
            return acc;
        },
        {} as Record<number, { subject: Subject; workItems: TeacherSubjectWork[] }>,
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${teacher.user.name} - ${t('teacher_detail.page_title')}`} />

            <div className="space-y-4 px-2 sm:space-y-6 sm:px-4 lg:px-6 xl:px-8">
                {/* Header */}
                <div className="rounded-lg border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:rounded-xl sm:p-6 dark:border-blue-800 dark:from-blue-950/20 dark:to-indigo-950/20">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start lg:items-center">
                        <div className="flex-shrink-0 self-start sm:self-auto">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 sm:h-12 sm:w-12 dark:bg-blue-800">
                                <User className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6 dark:text-blue-400" />
                            </div>
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-xl font-bold break-words text-gray-900 sm:text-2xl lg:text-3xl dark:text-gray-100">
                                {teacher.user.name}
                            </h1>
                            <p className="mt-1 text-sm break-all text-gray-600 sm:text-base dark:text-gray-400">{teacher.user.email}</p>
                            <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
                                {teacher.subjects.map((subject) => (
                                    <Badge key={subject.id} variant="outline" className="bg-white/80 text-xs sm:text-sm dark:bg-gray-800/80">
                                        <span className="hidden sm:inline">
                                            {subject.name} ({subject.code})
                                        </span>
                                        <span className="sm:hidden">{subject.code}</span>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics Overview */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                    {(() => {
                        const totalWorkItems = teacher.teacher_subject_works.length;
                        const totalFiles = teacher.teacher_subject_works.reduce((acc, work) => acc + work.files.length, 0);
                        const approvedFiles = teacher.teacher_subject_works.reduce(
                            (acc, work) => acc + work.files.filter((file) => file.feedback?.[0]?.status === 'approved').length,
                            0,
                        );
                        const pendingFiles = teacher.teacher_subject_works.reduce(
                            (acc, work) => acc + work.files.filter((file) => !file.feedback?.[0] || file.feedback[0].status === 'pending').length,
                            0,
                        );

                        return [
                            {
                                title: t('teacher_detail.statistics.work_items'),
                                value: totalWorkItems,
                                icon: FileText,
                                color: 'blue',
                            },
                            {
                                title: t('teacher_detail.statistics.total_files'),
                                value: totalFiles,
                                icon: FileCheck,
                                color: 'green',
                            },
                            {
                                title: t('teacher_detail.statistics.approved'),
                                value: approvedFiles,
                                icon: FileCheck,
                                color: 'emerald',
                            },
                            {
                                title: t('teacher_detail.statistics.pending_review'),
                                value: pendingFiles,
                                icon: Clock,
                                color: 'amber',
                            },
                        ];
                    })().map((stat, index) => {
                        const IconComponent = stat.icon;
                        const colorClasses: Record<string, string> = {
                            blue: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400',
                            green: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400',
                            emerald:
                                'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400',
                            amber: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400',
                        };

                        return (
                            <Card key={index} className={`border ${colorClasses[stat.color]}`}>
                                <CardContent className="p-3 sm:p-4 lg:p-6">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-xs font-medium opacity-70 sm:text-sm">{stat.title}</p>
                                            <p className="text-lg font-bold sm:text-xl lg:text-2xl">{stat.value}</p>
                                        </div>
                                        <div className="self-end sm:self-auto">
                                            <IconComponent className="h-6 w-6 opacity-70 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Work Items by Subject */}
                <div className="space-y-4 sm:space-y-6">
                    {Object.values(workItemsBySubject).map(({ subject, workItems }) => (
                        <Card key={subject.id} className="overflow-hidden shadow-sm">
                            <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-gray-50 p-4 sm:p-6 dark:from-slate-900/50 dark:to-gray-900/50">
                                <CardTitle className="flex items-center gap-2 text-base sm:gap-3 sm:text-lg">
                                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 sm:h-10 sm:w-10 dark:bg-blue-900">
                                        <FileText className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5 dark:text-blue-400" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate font-semibold">{subject.name}</div>
                                        <div className="text-xs font-normal text-gray-600 sm:text-sm dark:text-gray-400">{subject.code}</div>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6">
                                <div className="space-y-4 sm:space-y-6">
                                    {workItems.map((workItem) => (
                                        <div
                                            key={workItem.id}
                                            className="overflow-hidden rounded-lg border border-gray-200 sm:rounded-xl dark:border-gray-700"
                                        >
                                            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 sm:px-6 sm:py-4 dark:border-gray-700 dark:bg-gray-800/50">
                                                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center sm:gap-3">
                                                    <h4 className="text-base font-semibold break-words text-gray-900 sm:text-lg dark:text-gray-100">
                                                        {workItem.work_item.name}
                                                    </h4>
                                                    <Badge
                                                        variant={workItem.work_item.is_required ? 'destructive' : 'secondary'}
                                                        className="w-fit text-xs sm:text-sm"
                                                    >
                                                        {workItem.work_item.is_required ? (
                                                            <>
                                                                <AlertCircle className="mr-1 h-3 w-3" />
                                                                {t('teacher_detail.work_item_status.required')}
                                                            </>
                                                        ) : (
                                                            t('teacher_detail.work_item_status.optional')
                                                        )}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="p-4 sm:p-6">
                                                {workItem.files.length === 0 ? (
                                                    <div className="py-8 text-center sm:py-12">
                                                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 sm:mb-4 sm:h-16 sm:w-16 dark:bg-gray-800">
                                                            <FileText className="h-6 w-6 text-gray-400 sm:h-8 sm:w-8" />
                                                        </div>
                                                        <h3 className="mb-2 text-base font-medium text-gray-900 sm:text-lg dark:text-gray-100">
                                                            {t('teacher_detail.file_section.no_files_uploaded')}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 sm:text-base dark:text-gray-400">
                                                            {t('teacher_detail.file_section.no_files_description')}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3 sm:space-y-4">
                                                        {workItem.files?.map((file: TeacherWorkFile) => {
                                                            const latestFeedback = file.feedback?.[0];

                                                            return (
                                                                <div
                                                                    key={file.id}
                                                                    className="rounded-lg border border-gray-200 bg-white transition-shadow duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                                                                >
                                                                    <div className="p-3 sm:p-4">
                                                                        <div className="flex flex-col gap-4 space-y-3 sm:flex-row sm:items-start sm:space-y-0">
                                                                            <div className="flex min-w-0 flex-1 items-start gap-3">
                                                                                <div className="mt-0.5 flex-shrink-0">
                                                                                    <FileIcon fileName={file.file_name} />
                                                                                </div>
                                                                                <div className="min-w-0 flex-1">
                                                                                    <h5
                                                                                        className="text-sm font-medium break-words text-gray-900 sm:text-base dark:text-gray-100"
                                                                                        title={file.file_name}
                                                                                    >
                                                                                        {file.file_name}
                                                                                    </h5>
                                                                                    <div className="mt-2 flex flex-col gap-2 text-xs text-gray-500 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 sm:text-sm dark:text-gray-400">
                                                                                        <div className="flex items-center gap-1">
                                                                                            <Calendar className="h-3 w-3 flex-shrink-0" />
                                                                                            <span className="hidden sm:inline">
                                                                                                {t('teacher_detail.file_section.uploaded')}:{' '}
                                                                                            </span>
                                                                                            <span className="break-all">
                                                                                                {formatDate(file.uploaded_at)}
                                                                                            </span>
                                                                                        </div>
                                                                                        <div className="flex items-center gap-1">
                                                                                            <FileText className="h-3 w-3 flex-shrink-0" />
                                                                                            <span>
                                                                                                {file.file_size
                                                                                                    ? formatFileSize(file.file_size)
                                                                                                    : t('teacher_detail.file_section.size_unknown')}
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>

                                                                                    {latestFeedback && (
                                                                                        <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 sm:mt-4 sm:p-4 dark:border-gray-600 dark:bg-gray-700/50">
                                                                                            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                                                                <span className="text-xs font-medium text-gray-700 sm:text-sm dark:text-gray-300">
                                                                                                    {t('teacher_detail.file_section.latest_feedback')}
                                                                                                </span>
                                                                                                {getStatusBadge(latestFeedback.status)}
                                                                                            </div>
                                                                                            <p className="mb-2 text-xs leading-relaxed break-words text-gray-700 sm:mb-3 sm:text-sm dark:text-gray-300">
                                                                                                {latestFeedback.feedback}
                                                                                            </p>
                                                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                                                {t('teacher_detail.file_section.reviewed_by')}{' '}
                                                                                                <span className="font-medium">
                                                                                                    {latestFeedback.reviewer.name}
                                                                                                </span>{' '}
                                                                                                {t('teacher_detail.file_section.on')}{' '}
                                                                                                {formatDate(latestFeedback.reviewed_at)}
                                                                                            </p>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                            <div className="flex w-full flex-row gap-2 sm:w-auto sm:flex-shrink-0">
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    onClick={() => handlePreviewFile(file)}
                                                                                    className="flex-1 text-xs sm:flex-none sm:text-sm"
                                                                                >
                                                                                    <Eye className="h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                                                                                    <span className="hidden sm:inline">
                                                                                        {t('teacher_detail.actions.preview')}
                                                                                    </span>
                                                                                </Button>
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="ghost"
                                                                                    onClick={() => window.open(file.file_url, '_blank')}
                                                                                    title={t('teacher_detail.actions.open_in_drive')}
                                                                                    className="flex-1 text-xs sm:flex-none sm:text-sm"
                                                                                >
                                                                                    <ExternalLink className="h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                                                                                    <span className="hidden sm:inline">
                                                                                        {t('teacher_detail.actions.open')}
                                                                                    </span>
                                                                                </Button>
                                                                                <Button
                                                                                    size="sm"
                                                                                    onClick={() => handleProvideFeedback(file)}
                                                                                    className="flex-1 text-xs sm:flex-none sm:text-sm"
                                                                                >
                                                                                    <MessageSquare className="h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                                                                                    <span className="hidden sm:inline">
                                                                                        {latestFeedback
                                                                                            ? t('teacher_detail.actions.update')
                                                                                            : t('teacher_detail.actions.feedback')}
                                                                                    </span>
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Feedback Dialog */}
                <FeedbackDialog
                    open={feedbackDialogOpen}
                    onOpenChange={setFeedbackDialogOpen}
                    file={selectedFile}
                    onSuccess={() => {
                        setFeedbackDialogOpen(false);
                        setSelectedFile(null);
                    }}
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
        </AppLayout>
    );
}
