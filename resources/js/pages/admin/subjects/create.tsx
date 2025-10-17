import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useCallback } from 'react';
import { useTranslation } from 'react-i18next';


import { useToast } from '@/hooks/use-toast';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type SubjectForm } from '@/types/subject';

import { PageHeader, SubjectFormCard } from '@/components/admin/subject/subject-form';


export default function CreateSubject() {
    const { t } = useTranslation();
    
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('subject_management.create.breadcrumbs.admin_dashboard'), href: '/admin/dashboard' },
        { title: t('subject_management.create.breadcrumbs.subject_management'), href: '/admin/subjects' },
        { title: t('subject_management.create.breadcrumbs.create_subject'), href: '/admin/subjects/create' },
    ];
    
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
                        title: t('subject_management.create.messages.success.title'),
                        description: t('subject_management.create.messages.success.description'),
                        variant: 'success',
                    });
                },
                onError: (errors) => {
                    const errorMessage = Object.values(errors).flat().join(', ') || t('subject_management.create.messages.error.description');
                    toast({
                        title: t('subject_management.create.messages.error.title'),
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
            <Head title={t('subject_management.create.page_title')} />

            <div className="space-y-6 px-4 sm:px-6">
                <PageHeader title={t('subject_management.create.header.title')} description={t('subject_management.create.header.description')} />

                <SubjectFormCard data={data} setData={setData} submit={submit} processing={processing} errors={errors} submitLabel={t('subject_management.create.form.buttons.create')} />
            </div>
        </AppLayout>
    );
}
