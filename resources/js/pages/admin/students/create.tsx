import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useCallback } from 'react';

import { useToast } from '@/hooks/use-toast';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type StudentCreateProps, type StudentForm } from '@/types/student';

import { PageHeader, StudentFormCard } from '@/components/admin/student/student-form';

export default function CreateStudent({ staff, availableClasses, extracurriculars }: StudentCreateProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin Dashboard', href: '/admin/dashboard' },
        { title: 'Student Management', href: '/admin/students' },
        { title: 'Create Student', href: '/admin/students/create' },
    ];

    const { data, setData, post, processing, errors } = useForm<StudentForm>({
        nisn: '',
        name: '',
        gender: '',
        birth_date: '',
        birthplace: '',
        religion: '',
        class: '',
        homeroom_teacher_id: '',
        entry_year: '',
        graduation_year: '',
        status: 'active',
        photo: null,
        notes: '',
        // Enhanced personal information
        parent_name: '',
        parent_phone: '',
        parent_email: '',
        address: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        // Transportation information
        transportation_method: '',
        distance_from_home_km: '',
        travel_time_minutes: '',
        pickup_location: '',
        transportation_notes: '',
        // Health information
        allergies: '',
        medical_conditions: '',
        dietary_restrictions: '',
        blood_type: '',
        emergency_medical_info: '',
        extracurricular_ids: [],
    });

    const { toast } = useToast();

    const submit: FormEventHandler = useCallback(
        (e) => {
            e.preventDefault();

            post(route('admin.students.store'), {
                forceFormData: true,
                onSuccess: () => {
                    toast({
                        title: 'Success',
                        description: 'Student created successfully.',
                        variant: 'success',
                    });
                },
                onError: (errors) => {
                    const errorMessage = Object.values(errors).flat().join(', ') || 'Failed to create student.';
                    toast({
                        title: 'Error',
                        description: errorMessage,
                        variant: 'destructive',
                    });
                },
            });
        },
        [post, toast],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Student" />

            <div className="space-y-6 px-4 sm:px-6">
                <PageHeader title="Create New Student" description="Add a new student to the system with their personal information and details." />

                <StudentFormCard
                    data={data}
                    setData={setData}
                    submit={submit}
                    processing={processing}
                    errors={errors}
                    submitLabel="Create Student"
                    staff={staff}
                    availableClasses={availableClasses}
                    extracurriculars={extracurriculars}
                />
            </div>
        </AppLayout>
    );
}
