import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import type { TeacherWithDirectProps } from '@/types/teacher';
import type { WorkItem } from '@/types/workItem';
import { Link } from '@inertiajs/react';
import { Eye, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface TeacherProgressTableProps {
    teachers: TeacherWithDirectProps[];
    workItems: WorkItem[];
}

export function TeacherProgressTable({ teachers, workItems }: TeacherProgressTableProps) {
    const { t } = useTranslation('common');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTeachers = teachers.filter(
        (teacher) =>
            teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) || teacher.position.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const getTeacherProgress = (teacher: TeacherWithDirectProps) => {
        const works = teacher.teacher_subject_works || [];
        const totalRequiredItems = workItems.filter((item) => item.is_required).length;

        // Get unique work items this teacher has submitted files for
        const submittedWorkItemIds = new Set(works.filter((work) => work.files.length > 0).map((work) => work.work_item.id));

        // Count how many required work items have been submitted
        const completedRequiredItems = workItems.filter((item) => item.is_required && submittedWorkItemIds.has(item.id)).length;

        const progressPercentage = totalRequiredItems > 0 ? Math.round((completedRequiredItems / totalRequiredItems) * 100) : 0;

        // Calculate file statistics
        const totalFiles = works.reduce((sum, work) => sum + work.files.length, 0);
        const approvedFiles = works.reduce((sum, work) => sum + work.files.filter((file) => file.latest_feedback?.status === 'approved').length, 0);
        const pendingFiles = works.reduce(
            (sum, work) => sum + work.files.filter((file) => !file.latest_feedback || file.latest_feedback.status === 'pending').length,
            0,
        );
        const needsRevisionFiles = works.reduce(
            (sum, work) => sum + work.files.filter((file) => file.latest_feedback?.status === 'needs_revision').length,
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
        <div className="space-y-4">
            {/* Search */}
            <div className="border-b p-4">
                <Input
                    placeholder={t('work_items_management.table.search_placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="border-b">
                        <tr>
                            <th className="p-4 text-left font-medium">{t('work_items_management.table.columns.teacher')}</th>
                            <th className="p-4 text-left font-medium">{t('work_items_management.table.columns.position')}</th>
                            <th className="p-4 text-left font-medium">{t('work_items_management.table.columns.subjects')}</th>
                            <th className="p-4 text-left font-medium">{t('work_items_management.table.columns.progress')}</th>
                            <th className="p-4 text-left font-medium">{t('work_items_management.table.columns.status')}</th>
                            <th className="p-4 text-left font-medium">{t('work_items_management.table.columns.actions')}</th>
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
                                                    <img src={teacher.photo} alt={teacher.name} className="h-8 w-8 rounded-full object-cover" />
                                                ) : (
                                                    <span className="text-sm font-medium">{teacher.name.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium">{teacher.name}</p>
                                                <p className="text-sm text-gray-500">{teacher.email}</p>
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
                                                    +{subjects.length - 2} {t('work_items_management.table.more')}
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
                                                    progress.percentage >= 100 ? 'default' : progress.percentage >= 50 ? 'secondary' : 'destructive'
                                                }
                                            >
                                                {progress.percentage >= 100
                                                    ? t('work_items_management.table.status_labels.complete')
                                                    : progress.percentage >= 50
                                                      ? t('work_items_management.table.status_labels.in_progress')
                                                      : t('work_items_management.table.status_labels.behind')}
                                            </Badge>
                                            {progress.totalFiles > 0 && (
                                                <div className="flex gap-1 text-xs">
                                                    <span className="text-green-600">
                                                        {progress.approvedFiles} {t('work_items_management.table.status_labels.approved')}
                                                    </span>
                                                    <span className="text-orange-600">
                                                        {progress.pendingFiles} {t('work_items_management.table.status_labels.pending')}
                                                    </span>
                                                    <span className="text-red-600">
                                                        {progress.needsRevisionFiles} {t('work_items_management.table.status_labels.revision')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                title={t('work_items_management.table.action_titles.view_details')}
                                                asChild
                                            >
                                                <Link href={route('headmaster.staff-overview.show', teacher.id)}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            {progress.totalFiles > 0 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    title={t('work_items_management.table.action_titles.provide_feedback')}
                                                    asChild
                                                >
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

            {filteredTeachers.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                    {searchTerm
                        ? t('work_items_management.table.empty_states.no_teachers_search')
                        : t('work_items_management.table.empty_states.no_teachers')}
                </div>
            )}
        </div>
    );
}
