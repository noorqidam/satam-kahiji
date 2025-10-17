import { Link } from '@inertiajs/react';
import { Edit, Eye, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Import i18n to ensure it's initialized

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { SchoolClass } from '@/types/class';

interface ClassTableProps {
    gradeClasses: SchoolClass[];
    selectedClasses: number[];
    gradeLevel: string;
    onToggleSelection: (classId: number) => void;
    onToggleGradeSelection: (gradeClassIds: number[]) => void;
    onDelete: (classId: number, className: string) => void;
}

export function ClassTable({
    gradeClasses,
    selectedClasses,
    onToggleSelection,
    onDelete,
}: Omit<ClassTableProps, 'gradeLevel' | 'onToggleGradeSelection'>) {
    const { t } = useTranslation();
    return (
        <div className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            {/* Desktop Table View */}
            <div className="hidden md:block p-4">
                <div className="overflow-x-auto">
                    <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700">
                            <th className="w-1/6 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                {t('classes_management.table.class')}
                            </th>
                            <th className="w-1/4 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                {t('classes_management.table.capacity')}
                            </th>
                            <th className="w-1/3 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                {t('classes_management.table.teacher')}
                            </th>
                            <th className="w-1/4 px-4 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                {t('classes_management.table.actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {gradeClasses.map((schoolClass) => (
                            <tr key={schoolClass.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedClasses.includes(schoolClass.id)}
                                            onChange={() => onToggleSelection(schoolClass.id)}
                                            className="rounded border-gray-300 focus:ring-blue-500"
                                        />
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">{schoolClass.name}</span>
                                            {schoolClass.is_full && (
                                                <Badge variant="destructive" className="text-xs">
                                                    {t('classes_management.table.full')}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="text-sm">
                                        <div className="font-medium text-gray-900 dark:text-gray-100">
                                            {schoolClass.student_count}/{schoolClass.capacity}
                                        </div>
                                        <div className="text-gray-500">{t('classes_management.table.available')}: {schoolClass.available_capacity} {t('classes_management.table.slots')}</div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    {schoolClass.homeroom_teacher ? (
                                        <div className="text-sm">
                                            <div className="font-medium text-gray-900 dark:text-gray-100">{schoolClass.homeroom_teacher.name}</div>
                                            <div className="text-gray-500">{schoolClass.homeroom_teacher.position}</div>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-orange-600">{t('classes_management.table.no_teacher_assigned')}</span>
                                    )}
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex justify-end gap-2">
                                        <Link href={route('admin.classes.show', schoolClass.id)}>
                                            <Button size="sm" variant="outline">
                                                <Eye className="h-3 w-3" />
                                            </Button>
                                        </Link>
                                        <Link href={route('admin.classes.edit', schoolClass.id)}>
                                            <Button size="sm" variant="outline">
                                                <Edit className="h-3 w-3" />
                                            </Button>
                                        </Link>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => onDelete(schoolClass.id, schoolClass.name)}
                                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile/Small Tablet Responsive View */}
            <div className="md:hidden">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {gradeClasses.map((schoolClass) => (
                        <div key={schoolClass.id} className="p-3 sm:p-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedClasses.includes(schoolClass.id)}
                                            onChange={() => onToggleSelection(schoolClass.id)}
                                            className="rounded border-gray-300 focus:ring-blue-500"
                                        />
                                        <h4 className="text-base font-semibold text-gray-900 sm:text-lg dark:text-gray-100">{schoolClass.name}</h4>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {schoolClass.is_full && (
                                            <Badge variant="destructive" className="text-xs">
                                                {t('classes_management.table.full')}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                    <div>
                                        {t('classes_management.table.capacity')}: {schoolClass.student_count}/{schoolClass.capacity}
                                    </div>
                                    <div>{t('classes_management.table.available')}: {schoolClass.available_capacity} {t('classes_management.table.slots')}</div>
                                    {schoolClass.homeroom_teacher ? (
                                        <div>{t('classes_management.table.teacher')}: {schoolClass.homeroom_teacher.name}</div>
                                    ) : (
                                        <div className="text-orange-600">{t('classes_management.table.no_teacher_assigned')}</div>
                                    )}
                                </div>

                                <div className="flex gap-1">
                                    <Link href={route('admin.classes.show', schoolClass.id)} className="flex-1">
                                        <Button size="sm" variant="outline" className="w-full px-2 text-xs">
                                            <Eye className="mr-1 h-3 w-3" />
                                            <span className="hidden xs:inline">{t('classes_management.table.view')}</span>
                                        </Button>
                                    </Link>
                                    <Link href={route('admin.classes.edit', schoolClass.id)} className="flex-1">
                                        <Button size="sm" variant="outline" className="w-full px-2 text-xs">
                                            <Edit className="mr-1 h-3 w-3" />
                                            <span className="hidden xs:inline">{t('classes_management.table.edit')}</span>
                                        </Button>
                                    </Link>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => onDelete(schoolClass.id, schoolClass.name)}
                                        className="flex-1 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                                    >
                                        <Trash2 className="mr-1 h-3 w-3" />
                                        <span className="hidden xs:inline">{t('classes_management.table.delete')}</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
