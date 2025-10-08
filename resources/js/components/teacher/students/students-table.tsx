import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { TeacherStudent } from '@/types/teacher-student';

import { TableCellRenderer } from './table-cell-renderer';
import { tableColumns } from './table-config';

interface StudentsTableProps {
    students: TeacherStudent[];
    getStatusBadgeVariant: (status: string) => 'default' | 'destructive' | 'outline' | 'secondary';
    shouldShowDefaultAvatar: (photo: string | null) => boolean;
    onImageError: (photo: string) => void;
    onRemove: (studentId: number, studentName: string) => void;
}

export const StudentsTable = ({ students, getStatusBadgeVariant, shouldShowDefaultAvatar, onImageError, onRemove }: StudentsTableProps) => {
    const { t } = useTranslation('common');
    const TableHeaderRow = useCallback(
        () => (
            <TableRow>
                {tableColumns.map((column) => (
                    <TableHead key={column.key} className={`${column.className} ${column.responsive}`}>
                        {t(`student_table.columns.${column.key}`)}
                    </TableHead>
                ))}
            </TableRow>
        ),
        [t],
    );

    const TableBodyRows = useCallback(
        () => (
            <>
                {students.map((student) => (
                    <TableRow key={student.id}>
                        {tableColumns.map((column) => (
                            <TableCell
                                key={`${student.id}-${column.key}`}
                                className={`${column.key === 'student' ? 'font-medium' : ''} ${column.className} ${column.responsive}`}
                            >
                                <TableCellRenderer
                                    student={student}
                                    columnKey={column.key}
                                    getStatusBadgeVariant={getStatusBadgeVariant}
                                    shouldShowDefaultAvatar={shouldShowDefaultAvatar}
                                    onImageError={onImageError}
                                    onRemove={onRemove}
                                />
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </>
        ),
        [students, getStatusBadgeVariant, shouldShowDefaultAvatar, onImageError, onRemove],
    );

    return (
        <div className="overflow-x-auto pb-3">
            <Table>
                <TableHeader>
                    <TableHeaderRow />
                </TableHeader>
                <TableBody>
                    <TableBodyRows />
                </TableBody>
            </Table>
        </div>
    );
};
