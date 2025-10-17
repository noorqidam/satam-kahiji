import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';


import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type StudentIndexProps } from '@/types/student';

import { ConfirmationDialog } from '@/components/admin/student/confirmation-dialog';
import { StudentFilters } from '@/components/admin/student/student-filters';
import { StudentTableRow } from '@/components/admin/student/student-table-row';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Pagination } from '@/components/ui/pagination';

import { useStudentActions, useStudentDataRefresh, useStudentFilters, useStudentSelection } from '@/hooks/use-student-hooks';

export default function StudentsIndex({ students, filters }: StudentIndexProps) {
    const { t } = useTranslation();
    useStudentDataRefresh();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('student_management.breadcrumbs.admin_dashboard'), href: '/admin/dashboard' },
        { title: t('student_management.breadcrumbs.students'), href: '/admin/students' },
    ];

    const { searchTerm, genderFilter, statusFilter, setSearchTerm, setGenderFilter, setStatusFilter, clearFilters, isLoading } = useStudentFilters(
        filters?.search || '',
        filters?.gender || '',
        filters?.status || '',
    );

    const { selectedStudents, handleSelectAll, handleSelectStudent, clearSelection } = useStudentSelection(students.data);

    const { deleteStudent, bulkDelete, isDeleting } = useStudentActions();

    const [studentToDelete, setStudentToDelete] = useState<number | null>(null);
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

    const handleDelete = (studentId: number) => {
        const student = students.data.find((s) => s.id === studentId);
        if (student) {
            deleteStudent(student);
            setStudentToDelete(null);
        }
    };

    const handleBulkDelete = () => {
        bulkDelete(selectedStudents);
        setShowBulkDeleteDialog(false);
        clearSelection();
    };

    const isAllSelected = selectedStudents.length === students.data.length && students.data.length > 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('student_management.page_title')} />

            <div className="space-y-6 px-4 sm:px-6">
                <div className="border-b border-gray-200 pb-5 dark:border-gray-700">
                    <h3 className="text-2xl leading-6 font-semibold text-gray-900 dark:text-gray-100">{t('student_management.page_title')}</h3>
                    <p className="mt-2 max-w-4xl text-sm text-gray-500 dark:text-gray-400">
                        {t('student_management.page_description')}
                    </p>
                </div>

                <StudentFilters
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onClearFilters={clearFilters}
                    selectedStudents={selectedStudents}
                    onBulkDelete={() => setShowBulkDeleteDialog(true)}
                    isLoading={isLoading}
                    genderFilter={genderFilter}
                    onGenderFilterChange={setGenderFilter}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                />

                <Card>
                    <CardHeader>
                        <CardTitle>{t('student_management.table.total_count', { count: students.total })}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left">
                                            <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} />
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
                                        >
                                            {t('student_management.table.headers.student')}
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
                                        >
                                            {t('student_management.table.headers.class_entry_year')}
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
                                        >
                                            {t('student_management.table.headers.gender')}
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
                                        >
                                            {t('student_management.table.headers.date_of_birth')}
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
                                        >
                                            {t('student_management.table.headers.homeroom_teacher')}
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
                                        >
                                            {t('student_management.table.headers.status')}
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
                                        >
                                            {t('student_management.table.headers.actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                                    {students.data.length > 0 ? (
                                        students.data.map((student) => (
                                            <StudentTableRow
                                                key={student.id}
                                                student={student}
                                                isSelected={selectedStudents.includes(student.id)}
                                                onSelect={(checked) => handleSelectStudent(student.id, checked)}
                                                onDelete={() => setStudentToDelete(student.id)}
                                            />
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-12 text-center">
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {searchTerm || genderFilter || statusFilter
                                                        ? t('student_management.table.empty_states.no_students_filtered')
                                                        : t('student_management.table.empty_states.no_students')}
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {students.data.length > 0 && (
                            <div className="border-t border-gray-200 p-4 dark:border-gray-700">
                                <Pagination data={students} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Student Dialog */}
            <ConfirmationDialog
                open={studentToDelete !== null}
                onOpenChange={() => setStudentToDelete(null)}
                title={t('student_management.dialogs.delete_student.title')}
                message={t('student_management.dialogs.delete_student.message')}
                confirmLabel={t('student_management.dialogs.delete_student.confirm_button')}
                onConfirm={() => studentToDelete && handleDelete(studentToDelete)}
                isLoading={isDeleting}
            />

            {/* Bulk Delete Dialog */}
            <ConfirmationDialog
                open={showBulkDeleteDialog}
                onOpenChange={setShowBulkDeleteDialog}
                title={t('student_management.dialogs.bulk_delete.title')}
                message={t('student_management.dialogs.bulk_delete.message', { 
                    count: selectedStudents.length,
                    plural: selectedStudents.length > 1 ? 's' : ''
                })}
                confirmLabel={t('student_management.dialogs.bulk_delete.confirm_button', { 
                    count: selectedStudents.length,
                    plural: selectedStudents.length > 1 ? 's' : ''
                })}
                onConfirm={handleBulkDelete}
                isLoading={isDeleting}
            />
        </AppLayout>
    );
}
