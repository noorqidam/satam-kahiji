import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useCallback } from 'react';

import { useToast } from '@/hooks/use-toast';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type SubjectForm } from '@/types/subject';

import { PageHeader, SubjectFormCard } from '@/components/admin/subject/subject-form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Subject Management', href: '/admin/subjects' },
    { title: 'Create Subject', href: '/admin/subjects/create' },
];

export default function CreateSubject() {
    const { data, setData, post, processing, errors } = useForm<SubjectForm>({
        name: '',
        code: '',
    });

    const { toast } = useToast();

    const submit: FormEventHandler = useCallback(
        (e) => {
            e.preventDefault();
            post(route('admin.subjects.store'), {
                onSuccess: () => {
                    toast({
                        title: 'Success',
                        description: 'Subject created successfully.',
                        variant: 'success',
                    });
                },
                onError: (errors) => {
                    const errorMessage = Object.values(errors).flat().join(', ') || 'Failed to create subject.';
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
            <Head title="Create Subject" />

            <div className="space-y-6 px-4 sm:px-6">
                <PageHeader title="Create Subject" description="Add a new subject to the system" />

                <SubjectFormCard data={data} setData={setData} submit={submit} processing={processing} errors={errors} submitLabel="Create Subject" />
            </div>
        </AppLayout>
    );
}
