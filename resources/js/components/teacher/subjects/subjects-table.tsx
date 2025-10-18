import { Link } from '@inertiajs/react';
import { ChevronRight, ExternalLink, FolderOpen } from 'lucide-react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { subjectTableColumns } from './subjects-table-config';

interface Subject {
    id: number;
    name: string;
    code: string;
    completion_percentage: number;
    total_students: number;
    recent_files: Array<{ id: number; file_name: string }>;
    completed_work_items: number;
    total_work_items: number;
    has_folders: boolean;
    folder_url: string | null;
}

interface SubjectsTableProps {
    subjects: Subject[];
    initializingSubjectId: number | null;
    onInitializeFolders: (subjectId: number) => void;
    getCompletionBadgeVariant: (percentage: number) => 'default' | 'destructive' | 'outline' | 'secondary';
}

export const SubjectsTable = ({ subjects, initializingSubjectId, onInitializeFolders, getCompletionBadgeVariant }: SubjectsTableProps) => {
    const { t } = useTranslation('common');

    const TableHeaderRow = useCallback(
        () => (
            <TableRow>
                {subjectTableColumns.map((column) => (
                    <TableHead key={column.key} className={`${column.className} ${column.responsive}`}>
                        {t(`subject_table.columns.${column.key}`)}
                    </TableHead>
                ))}
            </TableRow>
        ),
        [t],
    );

    const renderTableCell = useCallback(
        (subject: Subject, columnKey: string) => {
            switch (columnKey) {
                case 'subject':
                    return (
                        <div className="flex items-center space-x-3">
                            <div className="min-w-0 flex-1">
                                <div className="truncate font-medium text-gray-900 dark:text-gray-100">{subject.name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{subject.code}</div>
                            </div>
                        </div>
                    );

                case 'completion':
                    return <Badge variant={getCompletionBadgeVariant(subject.completion_percentage)}>{subject.completion_percentage}%</Badge>;

                case 'students':
                    return <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{subject.total_students}</span>;

                case 'files':
                    return <span className="text-sm text-gray-600 dark:text-gray-400">{subject.recent_files.length}</span>;

                case 'progress':
                    return (
                        <div className="min-w-[120px] space-y-1">
                            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                                <span>
                                    {subject.completed_work_items}/{subject.total_work_items}
                                </span>
                            </div>
                            <Progress value={subject.completion_percentage} className="h-1.5" />
                        </div>
                    );

                case 'actions':
                    return (
                        <div className="flex items-center space-x-2">
                            <Link href={`/teacher/subjects/${subject.id}`}>
                                <Button variant="outline" size="sm" className="text-xs" title={t('subject_cards.actions.view_details')}>
                                    <ChevronRight className="h-3 w-3" />
                                    <span className="sr-only">{t('subject_cards.actions.view_details')}</span>
                                </Button>
                            </Link>

                            {subject.has_folders ? (
                                subject.folder_url && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs"
                                        onClick={() => window.open(subject.folder_url!, '_blank')}
                                        title={t('subject_cards.actions.open_drive_folder')}
                                    >
                                        <ExternalLink className="h-3 w-3" />
                                        <span className="sr-only">{t('subject_cards.actions.open_drive_folder')}</span>
                                    </Button>
                                )
                            ) : (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() => onInitializeFolders(subject.id)}
                                    disabled={initializingSubjectId === subject.id}
                                    title={t('subject_cards.actions.initialize_folders')}
                                >
                                    <FolderOpen className="h-3 w-3" />
                                    <span className="sr-only">{t('subject_cards.actions.initialize_folders')}</span>
                                </Button>
                            )}
                        </div>
                    );

                default:
                    return null;
            }
        },
        [getCompletionBadgeVariant, onInitializeFolders, initializingSubjectId, t],
    );

    const TableBodyRows = useCallback(
        () => (
            <>
                {subjects.map((subject) => (
                    <TableRow key={subject.id}>
                        {subjectTableColumns.map((column) => (
                            <TableCell key={`${subject.id}-${column.key}`} className={`${column.className} ${column.responsive}`}>
                                {renderTableCell(subject, column.key)}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </>
        ),
        [subjects, renderTableCell],
    );

    return (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-gray-50 dark:bg-gray-900">
                        <TableHeaderRow />
                    </TableHeader>
                    <TableBody>
                        <TableBodyRows />
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
