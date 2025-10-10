import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, CheckCircle, Clock, ExternalLink, FileText, TrendingUp, Upload, Users, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { WorkItemFileList } from '@/components/teacher/work-items/work-item-file-list';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { TeacherWorkFile } from '@/types/workItem';

interface Teacher {
    id: number;
    name: string;
    email: string;
}

interface Subject {
    id: number;
    name: string;
    code: string;
    description: string;
}

interface WorkItem {
    id: number;
    name: string;
    is_required: boolean;
}

interface WorkItemProgress {
    work_item: WorkItem;
    has_folder: boolean;
    files_count: number;
    files: TeacherWorkFile[];
    has_files: boolean;
    folder_url: string | null;
    last_updated: string | null;
}

interface RecentActivity {
    work_item: WorkItem;
    files: TeacherWorkFile[];
    folder_url: string | null;
}

interface Statistics {
    total_students: number;
    total_work_items: number;
    completed_work_items: number;
    total_files: number;
    completion_percentage: number;
}

interface TeacherSubjectShowProps {
    subject: Subject;
    workItemsProgress: WorkItemProgress[];
    recentActivity: RecentActivity[];
    statistics: Statistics;
    teacher: Teacher;
    userRole: string;
}

export default function TeacherSubjectShow({ subject, workItemsProgress, recentActivity, statistics }: TeacherSubjectShowProps) {
    const { t } = useTranslation('common');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Teacher Dashboard', href: '/teacher/dashboard' },
        { title: 'My Subjects', href: '/teacher/subjects' },
        { title: subject.name, href: `/teacher/subjects/${subject.id}` },
    ];

    const getCompletionColor = (percentage: number) => {
        if (percentage >= 80) return 'text-green-600';
        if (percentage >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            timeZone: 'Asia/Jakarta',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${subject.name} - My Subjects`} />

            <div className="space-y-3 px-2 sm:space-y-4 sm:px-3 md:space-y-6 md:px-4 lg:space-y-8 lg:px-6">
                {/* Header */}
                <div className="border-b border-gray-200 pb-2 sm:pb-3 md:pb-4 lg:pb-6 dark:border-gray-700">
                    <div className="flex flex-col gap-2 sm:gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <Link href={route('teacher.subjects.index')}>
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 sm:h-8 sm:w-8 sm:p-1">
                                        <ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                    </Button>
                                </Link>
                                <div className="min-w-0 flex-1">
                                    <h1 className="text-base font-bold text-gray-900 sm:text-lg md:text-xl lg:text-2xl dark:text-gray-100">
                                        {subject.name}
                                    </h1>
                                    <p className="mt-0.5 text-xs text-gray-600 sm:text-sm dark:text-gray-400">
                                        {subject.code} {subject.description && `• ${subject.description}`}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-start md:justify-end">
                            <Badge variant="outline" className="flex items-center gap-1 text-xs">
                                <TrendingUp className="h-3 w-3" />
                                <span className="xs:inline hidden">{statistics.completion_percentage}% Complete</span>
                                <span className="xs:hidden">{statistics.completion_percentage}%</span>
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:grid-cols-4">
                    <Card>
                        <CardContent className="px-3 py-1.5 sm:px-4 sm:py-2 lg:px-6 lg:py-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-400">
                                        {t('subject_details.statistics.students')}
                                    </p>
                                    <p className="mt-0.5 text-base font-bold text-gray-900 sm:mt-1 sm:text-lg lg:text-2xl dark:text-gray-100">
                                        {statistics.total_students}
                                    </p>
                                </div>
                                <Users className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="px-3 py-1.5 sm:px-4 sm:py-2 lg:px-6 lg:py-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-400">
                                        {t('subject_details.statistics.work_items')}
                                    </p>
                                    <p className="mt-0.5 text-base font-bold text-gray-900 sm:mt-1 sm:text-lg lg:text-2xl dark:text-gray-100">
                                        {statistics.completed_work_items}/{statistics.total_work_items}
                                    </p>
                                </div>
                                <FileText className="h-5 w-5 text-green-600 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="px-3 py-1.5 sm:px-4 sm:py-2 lg:px-6 lg:py-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-400">
                                        {t('subject_details.statistics.total_files')}
                                    </p>
                                    <p className="mt-0.5 text-base font-bold text-gray-900 sm:mt-1 sm:text-lg lg:text-2xl dark:text-gray-100">
                                        {statistics.total_files}
                                    </p>
                                </div>
                                <Upload className="h-5 w-5 text-purple-600 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="px-3 py-1.5 sm:px-4 sm:py-2 lg:px-6 lg:py-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-400">
                                        {t('subject_details.statistics.completion')}
                                    </p>
                                    <p
                                        className={`mt-0.5 text-base font-bold sm:mt-1 sm:text-lg lg:text-2xl ${getCompletionColor(statistics.completion_percentage)}`}
                                    >
                                        {statistics.completion_percentage}%
                                    </p>
                                </div>
                                <TrendingUp className="h-5 w-5 text-orange-600 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="work-items" className="space-y-3 sm:space-y-4 md:space-y-6">
                    <TabsList className="grid h-8 w-full grid-cols-2 sm:h-9 md:h-10">
                        <TabsTrigger value="work-items" className="text-xs sm:text-sm">
                            <span className="xs:inline hidden">{t('subject_details.tabs.work_items')}</span>
                            <span className="xs:hidden">{t('subject_details.tabs.work_items_short')}</span>
                        </TabsTrigger>
                        <TabsTrigger value="activity" className="text-xs sm:text-sm">
                            <span className="xs:inline hidden">{t('subject_details.tabs.recent_activity')}</span>
                            <span className="xs:hidden">{t('subject_details.tabs.recent_activity_short')}</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Work Items Tab */}
                    <TabsContent value="work-items" className="space-y-3 sm:space-y-4 md:space-y-6">
                        <Card>
                            <CardContent className="p-3 sm:p-4 md:p-6">
                                <div className="space-y-2 sm:space-y-3 md:space-y-4">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                                        <h3 className="text-base font-semibold sm:text-lg">{t('subject_details.work_items.title')}</h3>
                                    </div>
                                    <div className="flex flex-col gap-0.5 text-xs text-gray-600 sm:flex-row sm:justify-between sm:text-sm dark:text-gray-300">
                                        <span>{t('subject_details.work_items.overall_progress')}</span>
                                        <span className="font-medium">
                                            {statistics.completed_work_items}/{statistics.total_work_items}{' '}
                                            {t('subject_details.work_items.completed')}
                                        </span>
                                    </div>
                                    <Progress value={statistics.completion_percentage} className="h-1.5 sm:h-2 md:h-3" />

                                    <div className="grid gap-2 sm:gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3">
                                        {workItemsProgress.map((item) => (
                                            <Card key={item.work_item.id} className="border-l-4 border-l-gray-200">
                                                <CardContent className="p-2.5 sm:p-3 md:p-4">
                                                    <div className="space-y-1.5 sm:space-y-2">
                                                        <div className="flex items-start justify-between">
                                                            <div className="min-w-0 flex-1">
                                                                <h4 className="truncate text-xs font-medium sm:text-sm">{item.work_item.name}</h4>
                                                                <div className="mt-0.5 flex items-center gap-1 sm:gap-1.5">
                                                                    {item.work_item.is_required ? (
                                                                        <Badge variant="destructive" className="px-1 py-0.5 text-xs">
                                                                            {t('subject_details.work_items.required')}
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge variant="secondary" className="px-1 py-0.5 text-xs">
                                                                            {t('subject_details.work_items.optional')}
                                                                        </Badge>
                                                                    )}
                                                                    {item.has_files ? (
                                                                        <CheckCircle className="h-3 w-3 text-green-600 sm:h-3.5 sm:w-3.5" />
                                                                    ) : (
                                                                        <XCircle className="h-3 w-3 text-red-600 sm:h-3.5 sm:w-3.5" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex-shrink-0 text-right">
                                                                <p className="text-sm font-semibold sm:text-base">{item.files_count}</p>
                                                                <p className="text-xs text-gray-500">{t('subject_details.work_items.files')}</p>
                                                            </div>
                                                        </div>

                                                        {item.last_updated && (
                                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                                <Clock className="h-3 w-3 flex-shrink-0" />
                                                                <span className="truncate text-xs">
                                                                    {t('subject_details.work_items.updated')} {formatDate(item.last_updated)}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {item.folder_url && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-7 w-full text-xs sm:h-8 sm:text-sm"
                                                                onClick={() => window.open(item.folder_url!, '_blank')}
                                                            >
                                                                <ExternalLink className="mr-1 h-3 w-3" />
                                                                <span className="xs:inline hidden">
                                                                    {t('subject_details.work_items.open_folder')}
                                                                </span>
                                                                <span className="xs:hidden">{t('subject_details.work_items.open')}</span>
                                                            </Button>
                                                        )}

                                                        {item.files.length > 0 && (
                                                            <WorkItemFileList
                                                                files={item.files}
                                                                onFileDelete={() => router.reload({ only: ['workItemsProgress', 'statistics'] })}
                                                            />
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Recent Activity Tab */}
                    <TabsContent value="activity" className="space-y-3 sm:space-y-4 md:space-y-6">
                        <Card>
                            <CardContent className="p-3 sm:p-4 md:p-6">
                                <div className="space-y-2 sm:space-y-3 md:space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                                        <h3 className="text-base font-semibold sm:text-lg">{t('subject_details.activity.title')}</h3>
                                    </div>
                                    {recentActivity.some((activity) => activity.files.length > 0) ? (
                                        <div className="space-y-1.5 sm:space-y-2 md:space-y-3">
                                            {recentActivity.map(
                                                (activity) =>
                                                    activity.files.length > 0 && (
                                                        <div key={activity.work_item.id} className="space-y-1.5 sm:space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <h4 className="text-xs font-medium sm:text-sm">{activity.work_item.name}</h4>
                                                                {activity.folder_url && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => window.open(activity.folder_url!, '_blank')}
                                                                        className="h-6 w-6 p-0 sm:h-7 sm:w-7"
                                                                    >
                                                                        <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                            <WorkItemFileList
                                                                files={activity.files}
                                                                onFileDelete={() => router.reload({ only: ['recentActivity', 'statistics'] })}
                                                            />
                                                        </div>
                                                    ),
                                            )}
                                        </div>
                                    ) : (
                                        <div className="py-4 text-center sm:py-6 md:py-8">
                                            <Calendar className="mx-auto h-8 w-8 text-gray-400 sm:h-10 sm:w-10 md:h-12 md:w-12" />
                                            <h3 className="mt-2 text-sm font-medium text-gray-900 sm:mt-3 sm:text-base md:mt-4 md:text-lg dark:text-white">
                                                {t('subject_details.activity.no_activity')}
                                            </h3>
                                            <p className="mt-1 text-xs text-gray-500 sm:mt-2 sm:text-sm dark:text-gray-300">
                                                {t('subject_details.activity.no_files_message')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
