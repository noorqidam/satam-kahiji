import { Head } from '@inertiajs/react';
import { ExternalLink, FileText, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Staff } from '@/types/staff';
import type { TeacherSubjectWork, WorkFile } from '@/types/teacher';

interface TeacherDetailShowProps {
    teacher: Staff;
    canProvideFeedback: boolean;
}

export default function TeacherDetailShow({ teacher, canProvideFeedback }: TeacherDetailShowProps) {
    const { t } = useTranslation('common');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('staff_overview.breadcrumbs.admin_dashboard'), href: '/admin/dashboard' },
        { title: t('staff_overview.breadcrumbs.staff_overview'), href: '/admin/staff-overview' },
        { title: teacher.name, href: `/admin/staff-overview/${teacher.id}` },
    ];

    const works = teacher.teacher_subject_works || [];
    const subjects = teacher.subjects || [];

    // Calculate overall progress
    const totalFiles = works.reduce((sum: number, work: TeacherSubjectWork) => sum + (work.files?.length || 0), 0);
    const approvedFiles = works.reduce(
        (sum: number, work: TeacherSubjectWork) =>
            sum + (work.files?.filter((file: WorkFile) => file.latest_feedback?.status === 'approved').length || 0),
        0,
    );
    const pendingFiles = works.reduce(
        (sum: number, work: TeacherSubjectWork) =>
            sum + (work.files?.filter((file: WorkFile) => !file.latest_feedback || file.latest_feedback.status === 'pending').length || 0),
        0,
    );
    const needsRevisionFiles = works.reduce(
        (sum: number, work: TeacherSubjectWork) =>
            sum + (work.files?.filter((file: WorkFile) => file.latest_feedback?.status === 'needs_revision').length || 0),
        0,
    );

    const getFileStatusBadge = (file: WorkFile) => {
        const latestFeedback = file.latest_feedback; // Using latest_feedback from WorkFile interface
        if (!latestFeedback) {
            return <Badge variant="secondary">{t('teacher_detail.file_status.pending')}</Badge>;
        }

        switch (latestFeedback.status) {
            case 'approved':
                return <Badge variant="default">{t('teacher_detail.file_status.approved')}</Badge>;
            case 'needs_revision':
                return <Badge variant="destructive">{t('teacher_detail.file_status.needs_revision')}</Badge>;
            default:
                return <Badge variant="secondary">{t('teacher_detail.file_status.pending')}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${t('teacher_detail.page_title')} - ${teacher.name}`} />

            <div className="space-y-8 px-4 sm:px-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="mx-auto flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 sm:mx-0 dark:bg-gray-700">
                            {teacher.photo ? (
                                <img src={teacher.photo} alt={teacher.name} className="h-16 w-16 rounded-full object-cover" />
                            ) : (
                                <User className="h-8 w-8 text-gray-500" />
                            )}
                        </div>
                        <div className="text-center sm:text-left">
                            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-gray-100">{teacher.name}</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {teacher.position} - {teacher.division}
                            </p>
                            <p className="text-sm text-gray-500">{teacher.user?.email}</p>
                            {!canProvideFeedback && (
                                <Badge variant="outline" className="mt-2">
                                    {t('teacher_detail.view_only_mode')}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Overview Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">{t('teacher_detail.stats.total_files')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalFiles}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-green-600">{t('teacher_detail.stats.approved_files')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{approvedFiles}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-orange-600">{t('teacher_detail.stats.pending_files')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{pendingFiles}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-red-600">{t('teacher_detail.stats.revision_files')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{needsRevisionFiles}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Subjects and Work Items */}
                <div className="space-y-6">
                    {subjects.map((subject) => {
                        const subjectWorks = works.filter((work: TeacherSubjectWork) => work.subject.id === subject.id);

                        return (
                            <Card key={subject.id}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        {subject.name} ({subject.code})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {subjectWorks.length > 0 ? (
                                        subjectWorks.map((work: TeacherSubjectWork) => (
                                            <div key={work.id} className="rounded-lg border p-4">
                                                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                    <h4 className="font-medium">{work.work_item?.name}</h4>
                                                    <Badge variant={work.work_item?.is_required ? 'destructive' : 'secondary'} className="w-fit">
                                                        {work.work_item?.is_required
                                                            ? t('teacher_detail.work_item.required')
                                                            : t('teacher_detail.work_item.optional')}
                                                    </Badge>
                                                </div>

                                                {work.files && work.files.length > 0 ? (
                                                    <div className="space-y-2">
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {t('teacher_detail.files.uploaded_files')} ({work.files.length})
                                                        </p>
                                                        <div className="space-y-2">
                                                            {work.files.map((file: WorkFile) => (
                                                                <div key={file.id} className="rounded bg-gray-50 p-3 dark:bg-gray-800">
                                                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                                        <div className="flex min-w-0 flex-1 items-center gap-2">
                                                                            <FileText className="h-4 w-4 flex-shrink-0 text-gray-400" />
                                                                            <span className="truncate text-sm">{file.file_name}</span>
                                                                            {getFileStatusBadge(file)}
                                                                        </div>
                                                                        <div className="flex items-center justify-between gap-2 sm:justify-end">
                                                                            <span className="flex-shrink-0 text-xs text-gray-500">
                                                                                {new Date(file.uploaded_at).toLocaleDateString('id-ID')}
                                                                            </span>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                title={t('teacher_detail.actions.view_file')}
                                                                                asChild
                                                                                className="flex-shrink-0"
                                                                            >
                                                                                <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                                                                                    <ExternalLink className="h-4 w-4" />
                                                                                </a>
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-500">{t('teacher_detail.files.no_files_uploaded')}</p>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500">{t('teacher_detail.work_items.no_work_items')}</p>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {subjects.length === 0 && (
                    <Card>
                        <CardContent className="py-8 text-center">
                            <p className="text-gray-500">{t('teacher_detail.subjects.no_subjects_assigned')}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
