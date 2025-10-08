import { Head } from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type SubjectShowProps } from '@/types/subject';

import { StaffAssignmentCard } from '@/components/admin/subject/staff-assignment';
import { SubjectInfoCard, SubjectPageHeader } from '@/components/admin/subject/subject-info';
import { useStaffAssignment } from '@/hooks/use-subject-hooks';

export default function ShowSubject({ subject, availableStaff }: SubjectShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin Dashboard', href: '/admin/dashboard' },
        { title: 'Subject Management', href: '/admin/subjects' },
        { title: subject.name, href: `/admin/subjects/${subject.id}` },
    ];

    const {
        selectedStaff,
        isAssigning,
        showAssignmentPanel,
        handleStaffSelection,
        assignStaff,
        removeStaffMember,
        toggleAssignmentPanel,
        cancelAssignment,
    } = useStaffAssignment(subject);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={subject.name} />

            <div className="space-y-6 px-4 sm:px-6">
                <SubjectPageHeader subject={subject} />

                <div className="grid gap-6 lg:grid-cols-2">
                    <SubjectInfoCard subject={subject} />

                    <StaffAssignmentCard
                        assignedStaff={subject.staff || []}
                        availableStaff={availableStaff}
                        selectedStaff={selectedStaff}
                        isAssigning={isAssigning}
                        showAssignmentPanel={showAssignmentPanel}
                        onStaffSelection={handleStaffSelection}
                        onAssignStaff={assignStaff}
                        onRemoveStaff={removeStaffMember}
                        onToggleAssignmentPanel={toggleAssignmentPanel}
                        onCancelAssignment={cancelAssignment}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
