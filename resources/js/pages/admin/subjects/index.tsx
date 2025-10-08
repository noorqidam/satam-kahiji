import { Head, Link } from '@inertiajs/react';
import { BookOpen, Plus } from 'lucide-react';
import { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pagination } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Subject, type SubjectIndexProps } from '@/types/subject';

import { ConfirmationDialog } from '@/components/admin/subject/confirmation-dialog';
import { SubjectFilters } from '@/components/admin/subject/subject-filters';
import { SubjectTableRow } from '@/components/admin/subject/subject-table-row';
import { useSubjectActions, useSubjectDataRefresh, useSubjectFilters, useSubjectSelection } from '@/hooks/use-subject-hooks';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Subject Management', href: '/admin/subjects' },
];

export default function SubjectIndex({ subjects, filters = { search: '' } }: SubjectIndexProps) {
    const { searchTerm, setSearchTerm, clearFilters } = useSubjectFilters(filters.search);
    const { selectedSubjects, handleSelectAll, handleSelectSubject, clearSelection } = useSubjectSelection(subjects.data);
    const { deleteSubject, bulkDelete, isDeleting } = useSubjectActions();

    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
    const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
    const [showSubjectDialog, setShowSubjectDialog] = useState<Subject | null>(null);

    useSubjectDataRefresh();

    const handleBulkDeleteConfirm = useCallback(() => {
        bulkDelete(selectedSubjects);
        setShowBulkDeleteConfirm(false);
        clearSelection();
    }, [selectedSubjects, bulkDelete, clearSelection]);

    const handleDeleteSubjectConfirm = useCallback(() => {
        if (subjectToDelete) {
            deleteSubject(subjectToDelete);
            setSubjectToDelete(null);
        }
    }, [subjectToDelete, deleteSubject]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subject Management" />

            <div className="space-y-6 px-4 sm:px-6">
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-gray-100">Subject Management</h1>
                        <p className="text-sm text-gray-600 sm:text-base dark:text-gray-400">Manage subjects and their staff assignments</p>
                    </div>
                    <Link href={route('admin.subjects.create')}>
                        <Button className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Add New Subject</span>
                            <span className="sm:hidden">Add Subject</span>
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <SubjectFilters
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            onClearFilters={clearFilters}
                            selectedCount={selectedSubjects.length}
                            onBulkDelete={() => setShowBulkDeleteConfirm(true)}
                        />
                    </CardHeader>
                    <CardContent>
                        {subjects.data.length > 0 ? (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full table-auto">
                                        <thead>
                                            <tr className="border-b border-gray-200 text-left dark:border-gray-700">
                                                <th className="pr-4 pb-3">
                                                    <Checkbox
                                                        checked={selectedSubjects.length === subjects.data.length && subjects.data.length > 0}
                                                        onCheckedChange={handleSelectAll}
                                                    />
                                                </th>
                                                <th className="pr-4 pb-3 font-medium text-gray-900 dark:text-gray-100">Subject Name</th>
                                                <th className="pr-4 pb-3 font-medium text-gray-900 dark:text-gray-100">Code</th>
                                                <th className="pr-4 pb-3 font-medium text-gray-900 dark:text-gray-100">Assigned Staff</th>
                                                <th className="pr-4 pb-3 font-medium text-gray-900 dark:text-gray-100">Created</th>
                                                <th className="pb-3 font-medium text-gray-900 dark:text-gray-100">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {subjects.data.map((subject) => (
                                                <SubjectTableRow
                                                    key={subject.id}
                                                    subject={subject}
                                                    isSelected={selectedSubjects.includes(subject.id)}
                                                    onSelect={(checked) => handleSelectSubject(subject.id, checked)}
                                                    onView={() => setShowSubjectDialog(subject)}
                                                    onDelete={() => setSubjectToDelete(subject)}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {subjects.last_page > 1 && (
                                    <div className="mt-6">
                                        <Pagination data={subjects} />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12">
                                <BookOpen className="h-12 w-12 text-gray-400" />
                                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">No subjects found</h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    {searchTerm ? 'Try adjusting your search.' : 'Get started by adding a new subject.'}
                                </p>
                                {!searchTerm && (
                                    <Link href={route('admin.subjects.create')} className="mt-4">
                                        <Button>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Subject
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <ConfirmationDialog
                isOpen={showBulkDeleteConfirm}
                title="Delete Subjects"
                message={`Are you sure you want to delete <strong>${selectedSubjects.length}</strong> subjects? This action cannot be undone.`}
                onConfirm={handleBulkDeleteConfirm}
                onCancel={() => setShowBulkDeleteConfirm(false)}
                isLoading={isDeleting}
            />

            <ConfirmationDialog
                isOpen={!!subjectToDelete}
                title="Delete Subject"
                message={`Are you sure you want to delete <strong>${subjectToDelete?.name}</strong>? This action cannot be undone.`}
                onConfirm={handleDeleteSubjectConfirm}
                onCancel={() => setSubjectToDelete(null)}
                isLoading={isDeleting}
            />

            <Dialog open={!!showSubjectDialog} onOpenChange={() => setShowSubjectDialog(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Subject Details: {showSubjectDialog?.name}</DialogTitle>
                        <DialogDescription>
                            View detailed information about this subject including assigned staff and creation date.
                        </DialogDescription>
                    </DialogHeader>
                    {showSubjectDialog && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                    <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{showSubjectDialog.name}</h3>
                                    {showSubjectDialog.code && (
                                        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                            {showSubjectDialog.code}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned Staff</label>
                                    <p className="text-sm text-gray-900 dark:text-gray-100">{showSubjectDialog.staff_count} staff members</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</label>
                                    <p className="text-sm text-gray-900 dark:text-gray-100">
                                        {new Date(showSubjectDialog.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
