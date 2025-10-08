import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useCallback } from 'react';

import { useToast } from '@/hooks/use-toast';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type StudentEditProps, type StudentForm } from '@/types/student';

import { PageHeader, StudentFormCard } from '@/components/admin/student/student-form';

export default function EditStudent({ student, staff, availableClasses, extracurriculars }: StudentEditProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin Dashboard', href: '/admin/dashboard' },
        { title: 'Student Management', href: '/admin/students' },
        { title: `Edit ${student.name}`, href: `/admin/students/${student.id}/edit` },
    ];

    const { data, setData, post, processing, errors } = useForm<StudentForm>({
        nisn: student.nisn || '',
        name: student.name || '',
        gender: student.gender || '',
        birth_date: student.birth_date || '',
        birthplace: student.birthplace || '',
        religion: student.religion || '',
        class: student.class || '',
        homeroom_teacher_id: student.homeroom_teacher_id?.toString() || '',
        entry_year: student.entry_year?.toString() || '',
        graduation_year: student.graduation_year?.toString() || '',
        status: student.status || 'active',
        photo: null,
        notes: student.notes || '',
        // Enhanced personal information
        parent_name: student.parent_name || '',
        parent_phone: student.parent_phone || '',
        parent_email: student.parent_email || '',
        address: student.address || '',
        emergency_contact_name: student.emergency_contact_name || '',
        emergency_contact_phone: student.emergency_contact_phone || '',
        // Transportation information
        transportation_method: student.transportation_method || '',
        distance_from_home_km: student.distance_from_home_km?.toString() || '',
        travel_time_minutes: student.travel_time_minutes?.toString() || '',
        pickup_location: student.pickup_location || '',
        transportation_notes: student.transportation_notes || '',
        // Health information
        allergies: student.allergies || '',
        medical_conditions: student.medical_conditions || '',
        dietary_restrictions: student.dietary_restrictions || '',
        blood_type: student.blood_type || '',
        emergency_medical_info: student.emergency_medical_info || '',
        extracurricular_ids: student.extracurriculars?.map((ec) => ec.id) || [],
        delete_photo: false,
        _method: 'PUT',
    });

    const { toast } = useToast();

    const submit: FormEventHandler = useCallback(
        (e) => {
            e.preventDefault();

            post(route('admin.students.update', student.id), {
                forceFormData: true,
                onSuccess: () => {
                    toast({
                        title: 'Success',
                        description: 'Student updated successfully.',
                        variant: 'success',
                    });
                },
                onError: (errors) => {
                    const errorMessage = Object.values(errors).flat().join(', ') || 'Failed to update student.';
                    toast({
                        title: 'Error',
                        description: errorMessage,
                        variant: 'destructive',
                    });
                },
            });
        },
        [post, student.id, toast],
    );

    const currentPhotoUrl = student.photo ? (student.photo.startsWith('http') ? student.photo : `/storage/students/${student.photo}`) : undefined;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${student.name}`} />

            <div className="space-y-6 px-4 sm:px-6">
                <PageHeader title="Edit Student" description={`Update ${student.name}'s information and details.`} />

                <StudentFormCard
                    data={data}
                    setData={setData}
                    submit={submit}
                    processing={processing}
                    errors={errors}
                    submitLabel="Update Student"
                    isEdit={true}
                    currentPhotoUrl={currentPhotoUrl}
                    staff={staff}
                    availableClasses={availableClasses}
                    extracurriculars={extracurriculars}
                />
            </div>
        </AppLayout>
    );
}
