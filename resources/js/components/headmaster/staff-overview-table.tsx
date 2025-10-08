import { Link } from '@inertiajs/react';
import { Eye, MessageSquare, Search, User } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import type { StaffOverviewTableProps, TeacherWithProgress } from '@/types/staff-overview';

export function StaffOverviewTable({ teachers, selectedWorkItem, feedbackFilter, getStatusBadge }: StaffOverviewTableProps) {
    const { t } = useTranslation('common');
    const [searchTerm, setSearchTerm] = useState('');

    // Filter teachers based on search term
    const filteredTeachers = teachers.filter((teacher) => {
        const matchesSearch =
            searchTerm === '' ||
            teacher.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teacher.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teacher.subjects.some(
                (subject) =>
                    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) || subject.code.toLowerCase().includes(searchTerm.toLowerCase()),
            );

        const matchesFeedback =
            feedbackFilter === 'all' ||
            teacher.teacher_subject_works.some((work) => work.files.some((file) => file.latest_feedback?.status === feedbackFilter));

        return matchesSearch && matchesFeedback;
    });

    const getOverallStatus = (teacher: TeacherWithProgress): 'complete' | 'in-progress' | 'behind' => {
        const { progressPercentage, totalFiles, approvedFiles, needsRevisionFiles } = teacher.progress;

        // If no files uploaded, definitely behind
        if (totalFiles === 0) return 'behind';

        // If progress is less than 50%, behind
        if (progressPercentage < 50) return 'behind';

        // If all required work items are submitted (100%) and most files are approved
        if (progressPercentage >= 100) {
            const approvalRate = totalFiles > 0 ? approvedFiles / totalFiles : 0;
            // Consider complete only if 80%+ of files are approved and no revision needed
            if (approvalRate >= 0.8 && needsRevisionFiles === 0) {
                return 'complete';
            }
            // Otherwise still in progress even if all items submitted
            return 'in-progress';
        }

        // For partial submission (50-99%), always in progress
        return 'in-progress';
    };

    const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' => {
        switch (status) {
            case 'complete':
                return 'default';
            case 'in-progress':
                return 'secondary';
            case 'behind':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <span className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        <span className="hidden sm:inline">{t('headmaster_staff_overview.table.teachers_overview')}</span>
                        <span className="sm:hidden">{t('headmaster_staff_overview.table.teachers')}</span>
                        <span className="text-muted-foreground">({filteredTeachers.length})</span>
                    </span>
                    <div className="relative w-full sm:max-w-sm">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                        <Input
                            placeholder={t('headmaster_staff_overview.table.search_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {/* Desktop Table View */}
                <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full">
                        <thead className="border-b bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="p-4 text-left text-sm font-medium">{t('headmaster_staff_overview.table.columns.teacher')}</th>
                                <th className="p-4 text-left text-sm font-medium">{t('headmaster_staff_overview.table.columns.subjects')}</th>
                                <th className="p-4 text-left text-sm font-medium">{t('headmaster_staff_overview.table.columns.progress')}</th>
                                <th className="p-4 text-left text-sm font-medium">{t('headmaster_staff_overview.table.columns.files_status')}</th>
                                <th className="p-4 text-left text-sm font-medium">{t('headmaster_staff_overview.table.columns.overall_status')}</th>
                                <th className="p-4 text-left text-sm font-medium">{t('headmaster_staff_overview.table.columns.work_items_status')}</th>
                                <th className="p-4 text-left text-sm font-medium">{t('headmaster_staff_overview.table.columns.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTeachers.map((teacher) => {
                                const overallStatus = getOverallStatus(teacher);
                                // Show all work items instead of just recent 3
                                const allWorks = teacher.teacher_subject_works
                                    .filter((work) => (selectedWorkItem ? work.work_item.id === selectedWorkItem : true))
                                    .sort((a, b) => a.work_item.name.localeCompare(b.work_item.name)); // Sort alphabetically

                                return (
                                    <tr key={teacher.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                        {/* Teacher Info */}
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                                                    <span className="text-sm font-medium">{teacher.user.name.charAt(0).toUpperCase()}</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{teacher.user.name}</p>
                                                    <p className="text-xs text-gray-500">{teacher.user.email}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Subjects */}
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-1">
                                                {teacher.subjects.slice(0, 2).map((subject) => (
                                                    <Badge key={subject.id} variant="outline" className="text-xs">
                                                        {subject.code}
                                                    </Badge>
                                                ))}
                                                {teacher.subjects.length > 2 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{teacher.subjects.length - 2}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="mt-1 text-xs text-gray-500">{teacher.subjects.map((s) => s.name).join(', ')}</p>
                                        </td>

                                        {/* Progress */}
                                        <td className="p-4">
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span>
                                                        {teacher.progress.completedWorkItems}/{teacher.progress.totalWorkItems}
                                                    </span>
                                                    <span>{teacher.progress.progressPercentage}%</span>
                                                </div>
                                                <Progress value={teacher.progress.progressPercentage} className="h-2" />
                                            </div>
                                        </td>

                                        {/* Files Status */}
                                        <td className="p-4">
                                            <div className="grid grid-cols-2 gap-1 text-xs">
                                                <div className="text-center">
                                                    <span className="font-medium text-blue-600">{teacher.progress.totalFiles}</span>
                                                    <p className="text-gray-500">{t('headmaster_staff_overview.table.file_status.total')}</p>
                                                </div>
                                                <div className="text-center">
                                                    <span className="font-medium text-green-600">{teacher.progress.approvedFiles}</span>
                                                    <p className="text-gray-500">{t('headmaster_staff_overview.table.file_status.approved')}</p>
                                                </div>
                                                <div className="text-center">
                                                    <span className="font-medium text-orange-600">{teacher.progress.pendingFiles}</span>
                                                    <p className="text-gray-500">{t('headmaster_staff_overview.table.file_status.pending')}</p>
                                                </div>
                                                <div className="text-center">
                                                    <span className="font-medium text-red-600">{teacher.progress.needsRevisionFiles}</span>
                                                    <p className="text-gray-500">{t('headmaster_staff_overview.table.file_status.revision')}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Overall Status */}
                                        <td className="p-4">
                                            <Badge variant={getStatusVariant(overallStatus)}>
                                                {overallStatus === 'complete'
                                                    ? t('headmaster_staff_overview.status.complete')
                                                    : overallStatus === 'in-progress'
                                                      ? t('headmaster_staff_overview.status.in_progress')
                                                      : t('headmaster_staff_overview.status.behind')}
                                            </Badge>
                                        </td>

                                        {/* All Work Items */}
                                        <td className="p-4">
                                            <div className="max-w-52 space-y-1">
                                                {allWorks.length > 0 ? (
                                                    allWorks.map((work) => (
                                                        <div key={work.id} className="border-l-2 border-gray-200 pl-2 text-xs">
                                                            <p className="truncate font-medium text-gray-800 dark:text-gray-200">
                                                                {work.work_item.name}
                                                            </p>
                                                            <div className="mt-1 flex items-center gap-1">
                                                                {work.files.length > 0 ? (
                                                                    work.files[0].latest_feedback ? (
                                                                        getStatusBadge(work.files[0].latest_feedback.status)
                                                                    ) : (
                                                                        <span className="rounded bg-blue-50 px-1 text-xs text-blue-600">
                                                                            {work.files.length} {work.files.length > 1 ? t('headmaster_staff_overview.table.work_items.files_uploaded') : t('headmaster_staff_overview.table.work_items.file_uploaded')}
                                                                        </span>
                                                                    )
                                                                ) : (
                                                                    <span className="rounded bg-gray-50 px-1 text-xs text-gray-500">
                                                                        {t('headmaster_staff_overview.table.work_items.not_submitted')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-xs text-gray-500">{t('headmaster_staff_overview.table.work_items.no_work_items_assigned')}</p>
                                                )}
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="p-4">
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="sm" title={t('headmaster_staff_overview.table.actions.view_details')} asChild>
                                                    <Link href={route('headmaster.staff-overview.show', teacher.id)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                {teacher.progress.totalFiles > 0 && (
                                                    <Button variant="ghost" size="sm" title={t('headmaster_staff_overview.table.actions.provide_feedback')} asChild>
                                                        <Link href={route('headmaster.staff-overview.show', teacher.id)}>
                                                            <MessageSquare className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Tablet View */}
                <div className="hidden overflow-x-auto md:block lg:hidden">
                    <table className="w-full">
                        <thead className="border-b bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="p-3 text-left text-sm font-medium">{t('headmaster_staff_overview.table.columns.teacher')}</th>
                                <th className="p-3 text-left text-sm font-medium">{t('headmaster_staff_overview.table.columns.progress')}</th>
                                <th className="p-3 text-left text-sm font-medium">{t('headmaster_staff_overview.table.columns.overall_status')}</th>
                                <th className="p-3 text-left text-sm font-medium">{t('headmaster_staff_overview.table.columns.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTeachers.map((teacher) => {
                                const overallStatus = getOverallStatus(teacher);
                                return (
                                    <tr key={teacher.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                        {/* Teacher Info */}
                                        <td className="p-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                                                    <span className="text-xs font-medium">{teacher.user.name.charAt(0).toUpperCase()}</span>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium">{teacher.user.name}</p>
                                                    <div className="mt-1 flex flex-wrap gap-1">
                                                        {teacher.subjects.slice(0, 2).map((subject) => (
                                                            <Badge key={subject.id} variant="outline" className="text-xs">
                                                                {subject.code}
                                                            </Badge>
                                                        ))}
                                                        {teacher.subjects.length > 2 && (
                                                            <Badge variant="outline" className="text-xs">
                                                                +{teacher.subjects.length - 2}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Progress */}
                                        <td className="p-3">
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span>
                                                        {teacher.progress.completedWorkItems}/{teacher.progress.totalWorkItems}
                                                    </span>
                                                    <span>{teacher.progress.progressPercentage}%</span>
                                                </div>
                                                <Progress value={teacher.progress.progressPercentage} className="h-2" />
                                                <div className="flex justify-between text-xs text-gray-500">
                                                    <span>{teacher.progress.approvedFiles} {t('headmaster_staff_overview.table.file_status.approved')}</span>
                                                    <span>{teacher.progress.pendingFiles} {t('headmaster_staff_overview.table.file_status.pending')}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Overall Status */}
                                        <td className="p-3">
                                            <Badge variant={getStatusVariant(overallStatus)}>
                                                {overallStatus === 'complete'
                                                    ? t('headmaster_staff_overview.status.complete')
                                                    : overallStatus === 'in-progress'
                                                      ? t('headmaster_staff_overview.status.in_progress')
                                                      : t('headmaster_staff_overview.status.behind')}
                                            </Badge>
                                        </td>

                                        {/* Actions */}
                                        <td className="p-3">
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="sm" title={t('headmaster_staff_overview.table.actions.view_details')} asChild>
                                                    <Link href={route('headmaster.staff-overview.show', teacher.id)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                {teacher.progress.totalFiles > 0 && (
                                                    <Button variant="ghost" size="sm" title={t('headmaster_staff_overview.table.actions.provide_feedback')} asChild>
                                                        <Link href={route('headmaster.staff-overview.show', teacher.id)}>
                                                            <MessageSquare className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="space-y-4 p-4 md:hidden">
                    {filteredTeachers.map((teacher) => {
                        const overallStatus = getOverallStatus(teacher);
                        const allWorks = teacher.teacher_subject_works
                            .filter((work) => (selectedWorkItem ? work.work_item.id === selectedWorkItem : true))
                            .sort((a, b) => a.work_item.name.localeCompare(b.work_item.name));

                        return (
                            <Card key={teacher.id} className="border border-gray-200 dark:border-gray-700">
                                <CardContent className="p-4">
                                    {/* Teacher Header */}
                                    <div className="mb-3 flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                                            <span className="text-sm font-medium">{teacher.user.name.charAt(0).toUpperCase()}</span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{teacher.user.name}</p>
                                            <p className="truncate text-xs text-gray-500">{teacher.user.email}</p>
                                        </div>
                                        <Badge variant={getStatusVariant(overallStatus)} className="text-xs">
                                            {overallStatus === 'complete' ? 'Complete' : overallStatus === 'in-progress' ? 'In Progress' : 'Behind'}
                                        </Badge>
                                    </div>

                                    {/* Subjects */}
                                    <div className="mb-3">
                                        <p className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                                            {t('headmaster_staff_overview.table.mobile.subjects')}: {teacher.subjects.map((s) => s.name).join(', ')}
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                            {teacher.subjects.slice(0, 3).map((subject) => (
                                                <Badge key={subject.id} variant="outline" className="text-xs">
                                                    {subject.code}
                                                </Badge>
                                            ))}
                                            {teacher.subjects.length > 3 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{teacher.subjects.length - 3}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Progress */}
                                    <div className="mb-3">
                                        <div className="mb-1 flex items-center justify-between">
                                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('headmaster_staff_overview.table.mobile.progress')}</p>
                                            <span className="text-xs text-gray-500">
                                                {teacher.progress.completedWorkItems}/{teacher.progress.totalWorkItems} {t('headmaster_staff_overview.table.mobile.tasks')}
                                            </span>
                                        </div>
                                        <Progress value={teacher.progress.progressPercentage} className="mb-2 h-2" />
                                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                            <div>
                                                <span className="font-medium text-green-600">{teacher.progress.approvedFiles}</span>
                                                <p className="text-gray-500">{t('headmaster_staff_overview.table.file_status.approved')}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-orange-600">{teacher.progress.pendingFiles}</span>
                                                <p className="text-gray-500">{t('headmaster_staff_overview.table.file_status.pending')}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-red-600">{teacher.progress.needsRevisionFiles}</span>
                                                <p className="text-gray-500">{t('headmaster_staff_overview.table.file_status.revision')}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* All Work Items */}
                                    <div className="mb-3">
                                        <p className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">{t('headmaster_staff_overview.table.columns.work_items_status')}</p>
                                        {allWorks.length > 0 ? (
                                            <div className="space-y-1">
                                                {allWorks.map((work) => (
                                                    <div
                                                        key={work.id}
                                                        className="rounded border-l-2 border-blue-200 bg-gray-50 p-2 text-xs dark:bg-gray-800"
                                                    >
                                                        <p className="truncate font-medium">{work.work_item.name}</p>
                                                        <div className="mt-1 flex items-center justify-between">
                                                            <span className="text-gray-500">{work.subject.code}</span>
                                                            {work.files.length > 0 ? (
                                                                work.files[0].latest_feedback ? (
                                                                    getStatusBadge(work.files[0].latest_feedback.status)
                                                                ) : (
                                                                    <span className="rounded bg-blue-100 px-1 text-xs text-blue-600">
                                                                        {work.files.length} {work.files.length > 1 ? t('headmaster_staff_overview.table.work_items.files_uploaded') : t('headmaster_staff_overview.table.work_items.file_uploaded')}
                                                                    </span>
                                                                )
                                                            ) : (
                                                                <span className="rounded bg-gray-100 px-1 text-xs text-gray-500">{t('headmaster_staff_overview.table.work_items.not_submitted')}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-500">{t('headmaster_staff_overview.table.work_items.no_work_items_assigned')}</p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 border-t border-gray-200 pt-2 dark:border-gray-700">
                                        <Button variant="outline" size="sm" className="flex-1" asChild>
                                            <Link href={route('headmaster.staff-overview.show', teacher.id)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                {t('headmaster_staff_overview.table.actions.view_details')}
                                            </Link>
                                        </Button>
                                        {teacher.progress.totalFiles > 0 && (
                                            <Button variant="outline" size="sm" className="flex-1" asChild>
                                                <Link href={route('headmaster.staff-overview.show', teacher.id)}>
                                                    <MessageSquare className="mr-2 h-4 w-4" />
                                                    {t('headmaster_staff_overview.table.actions.feedback')}
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {filteredTeachers.length === 0 && (
                    <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                        <User className="mx-auto mb-4 h-12 w-12 opacity-50" />
                        <h3 className="mb-2 text-lg font-medium">{searchTerm ? t('headmaster_staff_overview.table.empty_state.no_teachers_found') : t('headmaster_staff_overview.table.empty_state.no_teachers_available')}</h3>
                        <p className="text-sm">
                            {searchTerm
                                ? t('headmaster_staff_overview.table.empty_state.adjust_search')
                                : t('headmaster_staff_overview.table.empty_state.teachers_will_appear')}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
