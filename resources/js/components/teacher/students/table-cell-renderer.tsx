import React from 'react';

import { Badge } from '@/components/ui/badge';
import type { TeacherStudent } from '@/types/teacher-student';

import { StudentActions } from './student-actions';
import { StudentAvatar } from './student-avatar';
import { StudentInfo } from './student-info';

interface TableCellRendererProps {
    student: TeacherStudent;
    columnKey: string;
    getStatusBadgeVariant: (status: string) => 'default' | 'destructive' | 'outline' | 'secondary';
    shouldShowDefaultAvatar: (photo: string | null) => boolean;
    onImageError: (photo: string) => void;
    onRemove: (studentId: number, studentName: string) => void;
}

export const TableCellRenderer = ({
    student,
    columnKey,
    getStatusBadgeVariant,
    shouldShowDefaultAvatar,
    onImageError,
    onRemove,
}: TableCellRendererProps) => {
    const cellRenderers: Record<string, () => React.ReactNode> = {
        student: () => (
            <div className="flex items-center gap-3">
                <StudentAvatar student={student} shouldShowDefaultAvatar={shouldShowDefaultAvatar} onImageError={onImageError} />
                <StudentInfo student={student} />
            </div>
        ),
        nisn: () => student.nisn,
        class: () => student.class,
        gender: () => <span className="capitalize">{student.gender}</span>,
        status: () => (
            <Badge variant={getStatusBadgeVariant(student.status)} className="text-xs">
                {student.status}
            </Badge>
        ),
        entry_year: () => student.entry_year,
        actions: () => <StudentActions student={student} onRemove={onRemove} />,
    };

    return cellRenderers[columnKey]?.() || null;
};
