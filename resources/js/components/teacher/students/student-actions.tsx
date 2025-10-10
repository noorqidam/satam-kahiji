import { Link } from '@inertiajs/react';
import { Edit, Eye, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { Student } from '@/types/student';

interface StudentActionsProps {
    student: Student;
    onRemove: (studentId: number, studentName: string) => void;
}

export const StudentActions = ({ student, onRemove }: StudentActionsProps) => {
    const actionButtons = [
        {
            href: route('teacher.students.show', student.id),
            icon: Eye,
            className: 'h-8 w-8 p-0',
        },
        {
            href: route('teacher.students.edit', student.id),
            icon: Edit,
            className: 'h-8 w-8 p-0',
        },
        {
            onClick: () => onRemove(student.id, student.name),
            icon: Trash2,
            className: 'h-8 w-8 p-0 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700',
        },
    ];

    return (
        <div className="flex gap-1">
            {actionButtons.map((action, index) =>
                action.href ? (
                    <Link key={index} href={action.href}>
                        <Button variant="outline" size="sm" className={action.className}>
                            <action.icon className="h-3 w-3" />
                        </Button>
                    </Link>
                ) : (
                    <Button key={index} variant="outline" size="sm" onClick={action.onClick} className={action.className}>
                        <action.icon className="h-3 w-3" />
                    </Button>
                ),
            )}
        </div>
    );
};
