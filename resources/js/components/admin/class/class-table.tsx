import { Link } from '@inertiajs/react';
import { Edit, Eye, Trash2 } from 'lucide-react';

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
    return (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700">
                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                Class
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                Capacity
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                Teacher
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                Actions
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
                                                    Full
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
                                        <div className="text-gray-500">Available: {schoolClass.available_capacity} slots</div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    {schoolClass.homeroom_teacher ? (
                                        <div className="text-sm">
                                            <div className="font-medium text-gray-900 dark:text-gray-100">{schoolClass.homeroom_teacher.name}</div>
                                            <div className="text-gray-500">{schoolClass.homeroom_teacher.position}</div>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-orange-600">No teacher assigned</span>
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

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {gradeClasses.map((schoolClass) => (
                        <div key={schoolClass.id} className="p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex min-w-0 flex-1 items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedClasses.includes(schoolClass.id)}
                                        onChange={() => onToggleSelection(schoolClass.id)}
                                        className="rounded border-gray-300 focus:ring-blue-500"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="mb-2 flex items-center justify-between gap-2">
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{schoolClass.name}</h4>
                                            <div className="flex flex-wrap gap-1">
                                                {schoolClass.is_full && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        Full
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mb-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                            <div>
                                                Capacity: {schoolClass.student_count}/{schoolClass.capacity}
                                            </div>
                                            <div>Available: {schoolClass.available_capacity} slots</div>
                                            {schoolClass.homeroom_teacher ? (
                                                <div>Teacher: {schoolClass.homeroom_teacher.name}</div>
                                            ) : (
                                                <div className="text-orange-600">No teacher assigned</div>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <Link href={route('admin.classes.show', schoolClass.id)} className="flex-1">
                                                <Button size="sm" variant="outline" className="w-full">
                                                    <Eye className="mr-1 h-3 w-3" />
                                                    View
                                                </Button>
                                            </Link>
                                            <Link href={route('admin.classes.edit', schoolClass.id)} className="flex-1">
                                                <Button size="sm" variant="outline" className="w-full">
                                                    <Edit className="mr-1 h-3 w-3" />
                                                    Edit
                                                </Button>
                                            </Link>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onDelete(schoolClass.id, schoolClass.name)}
                                                className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                                            >
                                                <Trash2 className="mr-1 h-3 w-3" />
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
