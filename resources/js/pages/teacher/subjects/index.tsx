import { Head, Link, router } from '@inertiajs/react';
import { BookOpen, ChevronRight, ExternalLink, FileText, FolderOpen, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useViewPreference } from '@/hooks/use-view-preference';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

import { SubjectViewToggle } from '@/components/teacher/subjects/subject-view-toggle';
import { SubjectsTable } from '@/components/teacher/subjects/subjects-table';

interface Teacher {
    id: number;
    name: string;
    email: string;
}

interface Student {
    id: number;
    name: string;
    nisn: string;
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
    has_files: boolean;
    folder_url: string | null;
}

interface RecentFile {
    id: number;
    file_name: string;
    uploaded_at: string;
    last_accessed?: string;
}

interface Subject {
    id: number;
    name: string;
    code: string;
    description: string;
    total_students: number;
    students: Student[];
    work_items_progress: WorkItemProgress[];
    recent_files: RecentFile[];
    completion_percentage: number;
    completed_work_items: number;
    total_work_items: number;
    has_folders: boolean;
    folder_url: string | null;
}

interface OverallStats {
    total_subjects: number;
    total_students: number;
    average_completion: number;
    total_files: number;
}

interface TeacherSubjectsIndexProps {
    subjects: Subject[];
    teacher: Teacher;
    overallStats: OverallStats;
    userRole: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Teacher Dashboard', href: '/teacher/dashboard' },
    { title: 'My Subjects', href: '/teacher/subjects' },
];

export default function TeacherSubjectsIndex({ subjects, overallStats }: TeacherSubjectsIndexProps) {
    const { t } = useTranslation('common');
    const { toast } = useToast();
    const [view, setView] = useViewPreference('teacher-subjects-view', 'card');
    const [initializingSubjectId, setInitializingSubjectId] = useState<number | null>(null);

    const handleInitializeFolders = async (subjectId: number) => {
        setInitializingSubjectId(subjectId);

        router.post(
            route('teacher.subjects.initialize-folders', { subject: subjectId }),
            {},
            {
                onSuccess: (page) => {
                    const flash = page.props.flash as { success?: string; error?: string } | undefined;
                    if (flash?.success) {
                        toast({
                            title: t('subject_cards.messages.success'),
                            description: flash.success as string,
                            variant: 'success',
                        });
                    }
                    setInitializingSubjectId(null);
                },
                onError: (errors) => {
                    const errorMessage = errors.error || t('subject_cards.messages.initialize_failed');
                    toast({
                        title: t('subject_cards.messages.error'),
                        description: errorMessage as string,
                        variant: 'destructive',
                    });
                    setInitializingSubjectId(null);
                },
            },
        );
    };

    const getCompletionColor = (percentage: number) => {
        if (percentage >= 80) return 'text-green-600';
        if (percentage >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getCompletionBadgeVariant = (percentage: number) => {
        if (percentage >= 80) return 'default';
        if (percentage >= 60) return 'secondary';
        return 'destructive';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('subject_cards.page_title')} />

            <div className="space-y-4 px-3 sm:space-y-6 sm:px-4 lg:space-y-8 lg:px-6">
                {/* Header */}
                <div className="border-b border-gray-200 pb-3 sm:pb-4 lg:pb-6 dark:border-gray-700">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-lg font-bold text-gray-900 sm:text-xl lg:text-2xl dark:text-gray-100">
                                {t('subject_cards.page_title')}
                            </h1>
                            <p className="mt-0.5 text-xs leading-relaxed text-gray-600 sm:mt-1 sm:text-sm dark:text-gray-400">
                                <span className="hidden sm:inline">{t('subject_cards.page_subtitle')}</span>
                                <span className="sm:hidden">{t('subject_cards.page_subtitle_short')}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <SubjectViewToggle view={view} onViewChange={setView} />
                        </div>
                    </div>
                </div>

                {/* Overall Statistics */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
                    <Card>
                        <CardContent className="px-3 py-1.5 sm:px-4 sm:py-2 lg:px-6 lg:py-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-400">
                                        {t('subject_cards.stats.total_subjects')}
                                    </p>
                                    <p className="mt-0.5 text-base font-bold text-gray-900 sm:mt-1 sm:text-lg lg:text-2xl dark:text-gray-100">
                                        {overallStats.total_subjects}
                                    </p>
                                </div>
                                <BookOpen className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="px-3 py-1.5 sm:px-4 sm:py-2 lg:px-6 lg:py-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-400">
                                        {t('subject_cards.stats.total_students')}
                                    </p>
                                    <p className="mt-0.5 text-base font-bold text-gray-900 sm:mt-1 sm:text-lg lg:text-2xl dark:text-gray-100">
                                        {overallStats.total_students}
                                    </p>
                                </div>
                                <Users className="h-5 w-5 text-green-600 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="px-3 py-1.5 sm:px-4 sm:py-2 lg:px-6 lg:py-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-400">
                                        {t('subject_cards.stats.avg_completion')}
                                    </p>
                                    <p
                                        className={`mt-0.5 text-base font-bold sm:mt-1 sm:text-lg lg:text-2xl ${getCompletionColor(overallStats.average_completion)}`}
                                    >
                                        {Math.round(overallStats.average_completion)}%
                                    </p>
                                </div>
                                <TrendingUp className="h-5 w-5 text-purple-600 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="px-3 py-1.5 sm:px-4 sm:py-2 lg:px-6 lg:py-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-400">
                                        {t('subject_cards.stats.total_files')}
                                    </p>
                                    <p className="mt-0.5 text-base font-bold text-gray-900 sm:mt-1 sm:text-lg lg:text-2xl dark:text-gray-100">
                                        {overallStats.total_files}
                                    </p>
                                </div>
                                <FileText className="h-5 w-5 text-orange-600 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Subjects Content */}
                {subjects.length === 0 ? (
                    /* Empty State */
                    <Card className="py-8 text-center sm:py-12">
                        <CardContent>
                            <BookOpen className="mx-auto h-10 w-10 text-gray-400 sm:h-12 sm:w-12" />
                            <h3 className="mt-3 text-base font-medium text-gray-900 sm:mt-4 sm:text-lg dark:text-gray-100">No Subjects Assigned</h3>
                            <p className="mt-1 text-xs text-gray-500 sm:mt-2 sm:text-sm dark:text-gray-400">
                                You don't have any subjects assigned yet. Contact your administrator for subject assignments.
                            </p>
                        </CardContent>
                    </Card>
                ) : view === 'table' ? (
                    /* Table View */
                    <SubjectsTable
                        subjects={subjects}
                        initializingSubjectId={initializingSubjectId}
                        onInitializeFolders={handleInitializeFolders}
                        getCompletionBadgeVariant={getCompletionBadgeVariant}
                    />
                ) : (
                    /* Card View */
                    <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:gap-6 xl:grid-cols-3">
                        {subjects.map((subject) => (
                            <Card key={subject.id} className="overflow-hidden">
                                <CardHeader className="pb-2 sm:pb-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <CardTitle className="truncate text-sm font-semibold sm:text-base lg:text-lg">{subject.name}</CardTitle>
                                            <p className="mt-0.5 text-xs text-gray-500 sm:mt-1 sm:text-sm">{subject.code}</p>
                                        </div>
                                        <Badge variant={getCompletionBadgeVariant(subject.completion_percentage)} className="flex-shrink-0 text-xs">
                                            {subject.completion_percentage}%
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-3 sm:space-y-4">
                                    {/* Progress Bar */}
                                    <div className="space-y-1.5 sm:space-y-2">
                                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                                            <span>{t('subject_cards.card_labels.work_items_progress')}</span>
                                            <span className="font-medium">
                                                {subject.completed_work_items}/{subject.total_work_items}
                                            </span>
                                        </div>
                                        <Progress value={subject.completion_percentage} className="h-1.5 sm:h-2" />
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-2 gap-3 text-center sm:gap-4">
                                        <div className="rounded-lg bg-gray-50 p-2 sm:p-3 dark:bg-gray-800">
                                            <p className="text-base font-semibold text-gray-900 sm:text-lg dark:text-gray-100">
                                                {subject.total_students}
                                            </p>
                                            <p className="text-xs text-gray-500">{t('subject_cards.card_labels.students')}</p>
                                        </div>
                                        <div className="rounded-lg bg-gray-50 p-2 sm:p-3 dark:bg-gray-800">
                                            <p className="text-base font-semibold text-gray-900 sm:text-lg dark:text-gray-100">
                                                {subject.recent_files.length}
                                            </p>
                                            <p className="text-xs text-gray-500">{t('subject_cards.card_labels.recent_files')}</p>
                                        </div>
                                    </div>

                                    {/* Recent Activity */}
                                    {subject.recent_files.length > 0 && (
                                        <div className="space-y-1.5 sm:space-y-2">
                                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                {t('subject_cards.card_labels.recent_files')}
                                            </p>
                                            <div className="space-y-1">
                                                {subject.recent_files.slice(0, 2).map((file) => (
                                                    <div
                                                        key={file.id}
                                                        className="flex items-center gap-2 rounded bg-gray-50 p-1.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                                    >
                                                        <FileText className="h-3 w-3 flex-shrink-0" />
                                                        <span className="flex-1 truncate">{file.file_name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="space-y-1.5 sm:space-y-2">
                                        <Link href={route('teacher.subjects.show', { subject: subject.id })} className="block w-full">
                                            <Button variant="outline" size="sm" className="w-full justify-between text-xs sm:text-sm">
                                                <span>{t('subject_cards.actions.view_details')}</span>
                                                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                            </Button>
                                        </Link>

                                        {subject.has_folders ? (
                                            subject.folder_url && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full text-xs sm:text-sm"
                                                    onClick={() => window.open(subject.folder_url!, '_blank')}
                                                >
                                                    <ExternalLink className="mr-1.5 h-3 w-3" />
                                                    <span className="xs:inline hidden">{t('subject_cards.actions.open_drive_folder')}</span>
                                                    <span className="xs:hidden">{t('subject_cards.actions.open_folder')}</span>
                                                </Button>
                                            )
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full text-xs sm:text-sm"
                                                onClick={() => handleInitializeFolders(subject.id)}
                                                disabled={initializingSubjectId === subject.id}
                                            >
                                                <FolderOpen className="mr-1.5 h-3 w-3" />
                                                {initializingSubjectId === subject.id ? (
                                                    <span>Initializing...</span>
                                                ) : (
                                                    <>
                                                        <span className="xs:inline hidden">{t('subject_cards.actions.initialize_folders')}</span>
                                                        <span className="xs:hidden">Initialize</span>
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
