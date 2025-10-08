import { Link } from '@inertiajs/react';
import { Edit2, Eye, Trash2, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { type Student } from '@/types/student';

interface StudentTableRowProps {
    student: Student;
    isSelected: boolean;
    onSelect: (checked: boolean) => void;
    onDelete: () => void;
}

export function StudentTableRow({ student, isSelected, onSelect, onDelete }: StudentTableRowProps) {
    return (
        <tr className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
            <td className="px-6 py-4">
                <Checkbox checked={isSelected} onCheckedChange={onSelect} />
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                        {student.photo ? (
                            <img
                                src={student.photo.startsWith('http') ? student.photo : `/storage/students/${student.photo}`}
                                alt={student.name}
                                className="h-10 w-10 rounded-full object-cover"
                            />
                        ) : (
                            <User className="h-5 w-5 text-gray-500" />
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{student.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">NISN: {student.nisn}</p>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <div>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{student.class}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Entry: {student.entry_year}</p>
                </div>
            </td>
            <td className="px-6 py-4">
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        student.gender === 'male'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : student.gender === 'female'
                              ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                >
                    {student.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : 'Not specified'}
                </span>
            </td>
            <td className="px-6 py-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {student.birth_date ? new Date(student.birth_date).toLocaleDateString() : 'Not specified'}
                </p>
            </td>
            <td className="px-6 py-4">
                <div>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{student.homeroom_teacher?.name || 'No homeroom teacher'}</p>
                    {student.homeroom_teacher && <p className="text-xs text-gray-500 dark:text-gray-400">{student.homeroom_teacher.position}</p>}
                </div>
            </td>
            <td className="px-6 py-4">
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        student.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : student.status === 'graduated'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : student.status === 'transferred'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : student.status === 'dropped'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                >
                    {student.status === 'active'
                        ? 'Active'
                        : student.status === 'graduated'
                          ? 'Graduated'
                          : student.status === 'transferred'
                            ? 'Transferred'
                            : student.status === 'dropped'
                              ? 'Dropped'
                              : 'Unknown'}
                </span>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <Link href={route('admin.students.show', student.id)}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Link href={route('admin.students.edit', student.id)}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit2 className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" onClick={onDelete}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </td>
        </tr>
    );
}
