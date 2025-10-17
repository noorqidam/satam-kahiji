import { Link } from '@inertiajs/react';
import { BookOpen, Edit, Eye, Trash2, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';


import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { type Subject } from '@/types/subject';

interface SubjectTableRowProps {
    subject: Subject;
    isSelected: boolean;
    onSelect: (checked: boolean) => void;
    onView: () => void;
    onDelete: () => void;
}

export function SubjectTableRow({ subject, isSelected, onSelect, onView, onDelete }: SubjectTableRowProps) {
    const { t } = useTranslation();
    
    return (
        <tr className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800">
            <td className="py-4 pr-4">
                <Checkbox checked={isSelected} onCheckedChange={onSelect} />
            </td>
            <td className="py-4 pr-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                        <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{subject.name}</div>
                </div>
            </td>
            <td className="py-4 pr-4">
                {subject.code ? (
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {subject.code}
                    </span>
                ) : (
                    <span className="text-gray-400 dark:text-gray-600">{t('subject_management.table.no_code')}</span>
                )}
            </td>
            <td className="py-4 pr-4">
                <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-900 dark:text-gray-100">{subject.staff_count}</span>
                </div>
            </td>
            <td className="py-4 pr-4 text-gray-900 dark:text-gray-100">{new Date(subject.created_at).toLocaleDateString()}</td>
            <td className="py-4">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={onView} className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Link href={route('admin.subjects.edit', subject.id)}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={onDelete} className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </td>
        </tr>
    );
}
