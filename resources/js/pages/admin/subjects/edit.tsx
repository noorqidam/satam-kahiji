import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useCallback } from 'react';

import { useToast } from '@/hooks/use-toast';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type SubjectEditProps, type SubjectForm } from '@/types/subject';

import { StaffAssignmentEditCard } from '@/components/admin/subject/staff-assignment-edit';
import { PageHeader, SubjectFormCard } from '@/components/admin/subject/subject-form';
import { useStaffAssignmentEdit } from '@/hooks/use-subject-hooks';

export default function EditSubject({ subject, availableStaff }: SubjectEditProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin Dashboard', href: '/admin/dashboard' },
        { title: 'Subject Management', href: '/admin/subjects' },
        { title: `Edit ${subject.name}`, href: `/admin/subjects/${subject.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm<SubjectForm>({
        name: subject.name || '',
        code: subject.code || '',
    });

    const { toast } = useToast();

    const submit: FormEventHandler = useCallback(
        (e) => {
            e.preventDefault();
            put(route('admin.subjects.update', subject.id), {
                onSuccess: () => {
                    toast({
                        title: 'Success',
                        description: 'Subject updated successfully.',
                        variant: 'success',
                    });
                },
                onError: (errors) => {
                    const errorMessage = Object.values(errors).flat().join(', ') || 'Failed to update subject.';
                    toast({
                        title: 'Error',
                        description: errorMessage,
                        variant: 'destructive',
                    });
                },
            });
        },
        [put, subject.id, toast],
    );

    const { selectedStaff, isAssigning, handleStaffSelection, updateAssignments, removeStaffMember } = useStaffAssignmentEdit(subject);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${subject.name}`} />

            <div className="space-y-6 px-4 sm:px-6">
                <PageHeader title="Edit Subject" description={`Update ${subject.name} information`} />

                <div className="space-y-6">
                    <SubjectFormCard
                        data={data}
                        setData={setData}
                        submit={submit}
                        processing={processing}
                        errors={errors}
                        submitLabel="Update Subject"
                        isEdit={true}
                    />

                    <StaffAssignmentEditCard
                        assignedStaff={subject.staff || []}
                        availableStaff={availableStaff}
                        selectedStaff={selectedStaff}
                        isAssigning={isAssigning}
                        onStaffSelection={handleStaffSelection}
                        onUpdateAssignments={updateAssignments}
                        onRemoveStaff={removeStaffMember}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
