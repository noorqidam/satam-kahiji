import { Head } from '@inertiajs/react';
import { LoaderCircle, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';


import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

import { AssignmentEmptyState } from '@/components/admin/subject-assignments/assignment-empty-state';
import { AssignmentMatrixTable } from '@/components/admin/subject-assignments/assignment-matrix-table';
import { AssignmentPagination } from '@/components/admin/subject-assignments/assignment-pagination';
import { AssignmentSearchFilters } from '@/components/admin/subject-assignments/assignment-search-filters';

import { useAssignmentFilters } from '@/hooks/use-assignment-filters';
import { useAssignmentMatrix } from '@/hooks/use-assignment-matrix';
import { useAssignmentSave } from '@/hooks/use-assignment-save';
import { useSubjectAssignmentData, type SubjectAssignmentData } from '@/hooks/use-subject-assignment-data';


interface SubjectAssignmentsProps extends SubjectAssignmentData {
    filters?: {
        staff_search?: string;
        subject_search?: string;
    };
}

export default function SubjectAssignments({ staff, subjects, filters = {} }: SubjectAssignmentsProps) {
    const { t } = useTranslation();
    const data = useSubjectAssignmentData({ staff, subjects });
    const matrixHook = useAssignmentMatrix(data);
    const filterHook = useAssignmentFilters(filters);
    const saveHook = useAssignmentSave();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('class_management.subject_staff_assignments.breadcrumbs.admin_dashboard'), href: '/admin/dashboard' },
        { title: t('class_management.subject_staff_assignments.breadcrumbs.subject_staff_assignments'), href: '/admin/subject-assignments' },
    ];

    const handleSaveAllAssignments = () => {
        const assignmentsData = matrixHook.getAssignmentsData();
        const hasChanges = matrixHook.hasChanges();
        saveHook.saveAssignments(assignmentsData, hasChanges);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('class_management.subject_staff_assignments.page_title')} />

            <div className="space-y-6 px-4 sm:px-6">
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-gray-100">{t('class_management.subject_staff_assignments.page_title')}</h1>
                        <p className="text-sm text-gray-600 sm:text-base dark:text-gray-400">{t('class_management.subject_staff_assignments.page_description')}</p>
                    </div>
                    <Button onClick={handleSaveAllAssignments} disabled={saveHook.isSaving}>
                        {saveHook.isSaving && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        {t('class_management.subject_staff_assignments.actions.save_all_changes')}
                    </Button>
                </div>

                <AssignmentSearchFilters
                    staffSearch={filterHook.staffSearch}
                    subjectSearch={filterHook.subjectSearch}
                    onStaffSearchChange={filterHook.handleStaffSearchChange}
                    onSubjectSearchChange={filterHook.handleSubjectSearchChange}
                />

                <Card>
                    <CardHeader>
                        <CardTitle>{t('class_management.subject_staff_assignments.matrix.title')}</CardTitle>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {t('class_management.subject_staff_assignments.matrix.showing_count', {
                                staffCount: data.staff.data.length,
                                staffTotal: data.staff.total,
                                subjectCount: data.subjects.data.length,
                                subjectTotal: data.subjects.total
                            })}
                        </div>
                        <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                            {t('class_management.subject_staff_assignments.matrix.note')}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <AssignmentMatrixTable
                            data={data}
                            assignments={matrixHook.assignments}
                            onToggleAssignment={matrixHook.toggleAssignment}
                            getStaffAssignmentCount={matrixHook.getStaffAssignmentCount}
                            getSubjectAssignmentCount={matrixHook.getSubjectAssignmentCount}
                        />

                        <AssignmentPagination data={data} />

                        <AssignmentEmptyState data={data} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
