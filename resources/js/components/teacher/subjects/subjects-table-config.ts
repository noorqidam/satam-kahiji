export interface TableColumn {
    key: string;
    label: string;
    className: string;
    responsive: string;
}

export const subjectTableColumns: TableColumn[] = [
    { key: 'subject', label: 'Subject', className: 'min-w-[200px]', responsive: '' },
    { key: 'completion', label: 'Completion', className: 'min-w-[120px]', responsive: '' },
    { key: 'students', label: 'Students', className: 'min-w-[100px]', responsive: 'hidden md:table-cell' },
    { key: 'files', label: 'Files', className: 'min-w-[80px]', responsive: 'hidden lg:table-cell' },
    { key: 'progress', label: 'Progress', className: 'min-w-[150px]', responsive: 'hidden xl:table-cell' },
    { key: 'actions', label: 'Actions', className: 'min-w-[150px]', responsive: '' },
];
