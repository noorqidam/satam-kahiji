export interface TableColumn {
    key: string;
    label: string;
    className: string;
    responsive: string;
}

export const tableColumns: TableColumn[] = [
    { key: 'student', label: 'Student', className: 'min-w-[200px]', responsive: '' },
    { key: 'nisn', label: 'NISN', className: 'min-w-[120px]', responsive: 'hidden sm:table-cell' },
    { key: 'class', label: 'Class', className: 'min-w-[80px]', responsive: '' },
    { key: 'gender', label: 'Gender', className: 'min-w-[80px]', responsive: 'hidden md:table-cell' },
    { key: 'status', label: 'Status', className: 'min-w-[100px]', responsive: '' },
    { key: 'entry_year', label: 'Entry Year', className: 'min-w-[100px]', responsive: 'hidden lg:table-cell' },
    { key: 'actions', label: 'Actions', className: 'min-w-[120px]', responsive: '' },
];
