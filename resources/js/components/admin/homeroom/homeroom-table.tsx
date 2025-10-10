import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Teacher {
    id: number;
    name: string;
    position: string;
    division: string;
    homeroom_class: string | null;
    homeroom_students_count: number;
    user_email: string | null;
}

interface ClassStat {
    class: string;
    student_count: number;
    assigned_teacher: Teacher | null;
    has_teacher: boolean;
}

interface HomeroomTableProps {
    classStats: ClassStat[];
    onRemoveAssignment: (teacherId: number, teacherName: string, className: string) => void;
}

export function HomeroomTable({ classStats, onRemoveAssignment }: HomeroomTableProps) {
    const { t } = useTranslation();

    return (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            {/* Table Header */}
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-700">
                <h3 className="text-base font-semibold text-gray-900 sm:text-lg dark:text-gray-100">
                    {t('homeroom_management.table.title', { count: classStats.length })}
                </h3>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700">
                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                {t('homeroom_management.table.columns.class')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                {t('homeroom_management.table.columns.status')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                {t('homeroom_management.table.columns.students')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                {t('homeroom_management.table.columns.homeroom_teacher')}
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                {t('homeroom_management.table.columns.actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {classStats.map((classStat) => (
                            <tr key={classStat.class} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-4 py-4">
                                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">{classStat.class}</span>
                                </td>
                                <td className="px-4 py-4">
                                    <Badge variant={classStat.has_teacher ? 'default' : 'destructive'}>
                                        {classStat.has_teacher
                                            ? t('homeroom_management.table.status.assigned')
                                            : t('homeroom_management.table.status.unassigned')}
                                    </Badge>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="text-sm">
                                        <div className="font-medium text-gray-900 dark:text-gray-100">{classStat.student_count}</div>
                                        <div className="text-gray-500">
                                            {classStat.student_count === 1
                                                ? t('homeroom_management.table.student_count.singular')
                                                : t('homeroom_management.table.student_count.plural')}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    {classStat.assigned_teacher ? (
                                        <div className="text-sm">
                                            <div className="font-medium text-gray-900 dark:text-gray-100">{classStat.assigned_teacher.name}</div>
                                            <div className="text-gray-500">{classStat.assigned_teacher.position}</div>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-red-600">{t('homeroom_management.table.no_teacher_assigned')}</span>
                                    )}
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex justify-end">
                                        {classStat.assigned_teacher && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    onRemoveAssignment(
                                                        classStat.assigned_teacher!.id,
                                                        classStat.assigned_teacher!.name,
                                                        classStat.class,
                                                    )
                                                }
                                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {classStats.map((classStat) => (
                        <div key={classStat.class} className="p-4">
                            <div className="flex items-start gap-3">
                                <div className="min-w-0 flex-1">
                                    <div className="mb-2 flex items-center justify-between gap-2">
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{classStat.class}</h4>
                                        <Badge variant={classStat.has_teacher ? 'default' : 'destructive'}>
                                            {classStat.has_teacher
                                                ? t('homeroom_management.table.status.assigned')
                                                : t('homeroom_management.table.status.unassigned')}
                                        </Badge>
                                    </div>

                                    <div className="mb-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                        <div>
                                            {t('homeroom_management.table.columns.students')}: {classStat.student_count}
                                        </div>
                                        {classStat.assigned_teacher ? (
                                            <div>
                                                {t('homeroom_management.table.teacher_label')}: {classStat.assigned_teacher.name} (
                                                {classStat.assigned_teacher.position})
                                            </div>
                                        ) : (
                                            <div className="text-red-600">{t('homeroom_management.table.no_teacher_assigned')}</div>
                                        )}
                                    </div>

                                    {classStat.assigned_teacher && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                onRemoveAssignment(classStat.assigned_teacher!.id, classStat.assigned_teacher!.name, classStat.class)
                                            }
                                            className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
                                        >
                                            <Trash2 className="mr-1 h-3 w-3" />
                                            {t('homeroom_management.table.remove_assignment')}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
