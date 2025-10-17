import { Head } from '@inertiajs/react';
import { AlertCircle, CheckCircle, Eye, FileText, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Staff } from '@/types/staff';
import type { WorkItem } from '@/types/workItem';
import { Link } from '@inertiajs/react';
import { useState } from 'react';

interface StaffOverviewStats {
    total_teachers: number;
    total_work_items: number;
    total_expected_files: number;
    total_files_uploaded: number;
    total_files_with_feedback: number;
    total_approved_files: number;
    needs_revision_files: number;
    upload_completion_rate: number;
    feedback_completion_rate: number;
    approval_rate: number;
}

interface WorkFile {
    id: number;
    latest_feedback?: {
        status: 'approved' | 'pending' | 'needs_revision';
    };
}

interface TeacherWork {
    id: number;
    work_item?: {
        id: number;
    };
    files?: WorkFile[];
}

interface StaffOverviewIndexProps {
    teachers: Staff[];
    workItems: WorkItem[];
    stats: StaffOverviewStats;
    userRole: string;
}

export default function StaffOverviewIndex({ teachers, workItems, stats, userRole }: StaffOverviewIndexProps) {
    const { t } = useTranslation('common');
    const [searchTerm, setSearchTerm] = useState('');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('staff_overview.breadcrumbs.admin_dashboard'), href: '/admin/dashboard' },
        { title: t('staff_overview.breadcrumbs.staff_overview'), href: '/admin/staff-overview' },
    ];

    const filteredTeachers = teachers.filter(
        (teacher) =>
            teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) || teacher.position?.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const getTeacherProgress = (teacher: Staff) => {
        const works = teacher.teacher_subject_works || [];
        const totalRequiredItems = workItems.filter((item) => item.is_required).length;

        const submittedWorkItemIds = new Set(works.filter((work: TeacherWork) => work.files && work.files.length > 0).map((work: TeacherWork) => work.work_item?.id));
        const completedRequiredItems = workItems.filter((item) => item.is_required && submittedWorkItemIds.has(item.id)).length;
        const progressPercentage = totalRequiredItems > 0 ? Math.round((completedRequiredItems / totalRequiredItems) * 100) : 0;

        const totalFiles = works.reduce((sum: number, work: TeacherWork) => sum + (work.files?.length || 0), 0);
        const approvedFiles = works.reduce(
            (sum: number, work: TeacherWork) => sum + (work.files?.filter((file: WorkFile) => file.latest_feedback?.status === 'approved').length || 0),
            0,
        );
        const pendingFiles = works.reduce(
            (sum: number, work: TeacherWork) =>
                sum + (work.files?.filter((file: WorkFile) => !file.latest_feedback || file.latest_feedback.status === 'pending').length || 0),
            0,
        );
        const needsRevisionFiles = works.reduce(
            (sum: number, work: TeacherWork) => sum + (work.files?.filter((file: WorkFile) => file.latest_feedback?.status === 'needs_revision').length || 0),
            0,
        );

        return {
            completed: completedRequiredItems,
            total: totalRequiredItems,
            percentage: progressPercentage,
            totalFiles,
            approvedFiles,
            pendingFiles,
            needsRevisionFiles,
        };
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('staff_overview.page_title')} />

            <div className="space-y-8 px-4 sm:px-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('staff_overview.header.title')}</h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            {userRole === 'super_admin'
                                ? t('staff_overview.header.description_admin')
                                : t('staff_overview.header.description_headmaster')}
                        </p>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('staff_overview.stats.total_teachers')}</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_teachers}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('staff_overview.stats.upload_completion')}</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.upload_completion_rate}%</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.total_files_uploaded} {t('staff_overview.stats.of')} {stats.total_expected_files}{' '}
                                {t('staff_overview.stats.files')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('staff_overview.stats.feedback_completion')}</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.feedback_completion_rate}%</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.total_files_with_feedback} {t('staff_overview.stats.of')} {stats.total_files_uploaded}{' '}
                                {t('staff_overview.stats.files')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('staff_overview.stats.approval_rate')}</CardTitle>
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.approval_rate}%</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.total_approved_files} {t('staff_overview.stats.approved')} / {stats.needs_revision_files}{' '}
                                {t('staff_overview.stats.revision')}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Teachers Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            {t('staff_overview.teachers.title')}
                        </CardTitle>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <Input
                                placeholder={t('staff_overview.teachers.search_placeholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full sm:max-w-sm"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {/* Mobile Card Layout */}
                        <div className="block lg:hidden">
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredTeachers.map((teacher) => {
                                    const progress = getTeacherProgress(teacher);
                                    const subjects = teacher.subjects || [];

                                    return (
                                        <div key={teacher.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <div className="space-y-3">
                                                {/* Teacher Info */}
                                                <div className="flex items-start justify-between">
                                                    <div className="flex min-w-0 flex-1 items-center gap-3">
                                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                                                            {teacher.photo ? (
                                                                <img
                                                                    src={teacher.photo}
                                                                    alt={teacher.name}
                                                                    className="h-10 w-10 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <span className="text-sm font-medium">{teacher.name.charAt(0)}</span>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate font-medium text-gray-900 dark:text-gray-100">{teacher.name}</p>
                                                            <p className="truncate text-sm text-gray-600 dark:text-gray-400">{teacher.position}</p>
                                                            <p className="truncate text-xs text-gray-500">{teacher.user?.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="ml-3 flex-shrink-0">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            title={t('staff_overview.table.action_titles.view_details')}
                                                            asChild
                                                        >
                                                            <Link href={route('admin.staff-overview.show', teacher.id)}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Subjects */}
                                                <div className="space-y-1">
                                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                        {t('staff_overview.table.columns.subjects')}
                                                    </p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {subjects.slice(0, 3).map((subject) => (
                                                            <Badge key={subject.id} variant="secondary" className="text-xs">
                                                                {subject.code || subject.name}
                                                            </Badge>
                                                        ))}
                                                        {subjects.length > 3 && (
                                                            <Badge variant="outline" className="text-xs">
                                                                +{subjects.length - 3} {t('staff_overview.table.more')}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Progress */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                            {t('staff_overview.table.columns.progress')}
                                                        </p>
                                                        <span className="text-sm font-medium">
                                                            {progress.completed}/{progress.total} ({progress.percentage}%)
                                                        </span>
                                                    </div>
                                                    <Progress value={progress.percentage} className="h-2" />
                                                </div>

                                                {/* Status */}
                                                <div className="flex items-center justify-between">
                                                    <Badge
                                                        variant={
                                                            progress.percentage >= 100
                                                                ? 'default'
                                                                : progress.percentage >= 50
                                                                  ? 'secondary'
                                                                  : 'destructive'
                                                        }
                                                    >
                                                        {progress.percentage >= 100
                                                            ? t('staff_overview.table.status.complete')
                                                            : progress.percentage >= 50
                                                              ? t('staff_overview.table.status.in_progress')
                                                              : t('staff_overview.table.status.behind')}
                                                    </Badge>
                                                    {progress.totalFiles > 0 && (
                                                        <div className="flex gap-2 text-xs">
                                                            <span className="text-green-600">
                                                                {progress.approvedFiles} {t('staff_overview.table.status.approved')}
                                                            </span>
                                                            <span className="text-orange-600">
                                                                {progress.pendingFiles} {t('staff_overview.table.status.pending')}
                                                            </span>
                                                            <span className="text-red-600">
                                                                {progress.needsRevisionFiles} {t('staff_overview.table.status.revision')}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Desktop Table Layout */}
                        <div className="hidden lg:block">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="border-b">
                                        <tr>
                                            <th className="p-4 text-left font-medium">{t('staff_overview.table.columns.teacher')}</th>
                                            <th className="p-4 text-left font-medium">{t('staff_overview.table.columns.position')}</th>
                                            <th className="p-4 text-left font-medium">{t('staff_overview.table.columns.subjects')}</th>
                                            <th className="p-4 text-left font-medium">{t('staff_overview.table.columns.progress')}</th>
                                            <th className="p-4 text-left font-medium">{t('staff_overview.table.columns.status')}</th>
                                            <th className="p-4 text-left font-medium">{t('staff_overview.table.columns.actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTeachers.map((teacher) => {
                                            const progress = getTeacherProgress(teacher);
                                            const subjects = teacher.subjects || [];

                                            return (
                                                <tr key={teacher.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                                                                {teacher.photo ? (
                                                                    <img
                                                                        src={teacher.photo}
                                                                        alt={teacher.name}
                                                                        className="h-8 w-8 rounded-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <span className="text-sm font-medium">{teacher.name.charAt(0)}</span>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">{teacher.name}</p>
                                                                <p className="text-sm text-gray-500">{teacher.user?.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <p className="text-sm">{teacher.position}</p>
                                                        <p className="text-xs text-gray-500">{teacher.division}</p>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex flex-wrap gap-1">
                                                            {subjects.slice(0, 2).map((subject) => (
                                                                <Badge key={subject.id} variant="secondary" className="text-xs">
                                                                    {subject.code || subject.name}
                                                                </Badge>
                                                            ))}
                                                            {subjects.length > 2 && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    +{subjects.length - 2} {t('staff_overview.table.more')}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between text-sm">
                                                                <span>
                                                                    {progress.completed}/{progress.total}
                                                                </span>
                                                                <span>{progress.percentage}%</span>
                                                            </div>
                                                            <Progress value={progress.percentage} className="h-2" />
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="space-y-1">
                                                            <Badge
                                                                variant={
                                                                    progress.percentage >= 100
                                                                        ? 'default'
                                                                        : progress.percentage >= 50
                                                                          ? 'secondary'
                                                                          : 'destructive'
                                                                }
                                                            >
                                                                {progress.percentage >= 100
                                                                    ? t('staff_overview.table.status.complete')
                                                                    : progress.percentage >= 50
                                                                      ? t('staff_overview.table.status.in_progress')
                                                                      : t('staff_overview.table.status.behind')}
                                                            </Badge>
                                                            {progress.totalFiles > 0 && (
                                                                <div className="flex gap-1 text-xs">
                                                                    <span className="text-green-600">
                                                                        {progress.approvedFiles} {t('staff_overview.table.status.approved')}
                                                                    </span>
                                                                    <span className="text-orange-600">
                                                                        {progress.pendingFiles} {t('staff_overview.table.status.pending')}
                                                                    </span>
                                                                    <span className="text-red-600">
                                                                        {progress.needsRevisionFiles} {t('staff_overview.table.status.revision')}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            title={t('staff_overview.table.action_titles.view_details')}
                                                            asChild
                                                        >
                                                            <Link href={route('admin.staff-overview.show', teacher.id)}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {filteredTeachers.length === 0 && (
                            <div className="py-8 text-center text-gray-500">
                                {searchTerm
                                    ? t('staff_overview.table.empty_states.no_teachers_search')
                                    : t('staff_overview.table.empty_states.no_teachers')}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
