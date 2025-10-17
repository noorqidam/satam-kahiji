import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useToast } from '@/hooks/use-toast';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type StudentCreateProps, type StudentForm } from '@/types/student';

import { AdminStudentFormCard, PageHeader } from '@/components/admin/student/admin-student-form';
import { StudentRecordsTabs } from '@/components/teacher/students/comprehensive-student-form';

export default function CreateStudent({ staff, availableClasses, extracurriculars, recordOptions }: StudentCreateProps) {
    const { t } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('student_management.breadcrumbs.admin_dashboard'), href: '/admin/dashboard' },
        { title: t('student_management.breadcrumbs.students'), href: '/admin/students' },
        { title: t('student_creation.breadcrumbs.create_student'), href: '/admin/students/create' },
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
                        title: t('student_creation.success.title'),
                        description: t('student_creation.success.description'),
                        variant: 'success',
                    });
                },
                onError: (errors) => {
                    const errorMessage = Object.values(errors).flat().join(', ') || t('student_creation.error.fallback');
                    toast({
                        title: t('student_creation.error.title'),
                        description: errorMessage,
                        variant: 'destructive',
                    });
                },
            });
        },
        [post, toast, t],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('student_creation.page_title')} />

            <div className="space-y-6 px-4 sm:px-6">
                <PageHeader title={t('student_creation.page_title')} description={t('student_creation.page_description')} />

                <AdminStudentFormCard
                    data={data}
                    setData={setData}
                    submit={submit}
                    processing={processing}
                    errors={errors}
                    submitLabel={t('student_creation.submit_button')}
                    staff={staff}
                    availableClasses={availableClasses}
                    extracurriculars={extracurriculars}
                />

                {/* Student Records Management - Preview only for new students */}
                <StudentRecordsTabs
                    student={{
                        id: 0,
                        name: data.name || t('student_creation.placeholders.new_student'),
                        nisn: data.nisn || '',
                        class: data.class || '',
                    }}
                    recordOptions={recordOptions || { achievement_types: {}, achievement_levels: {} }}
                    isEdit={false}
                />
            </div>
        </AppLayout>
    );
}
