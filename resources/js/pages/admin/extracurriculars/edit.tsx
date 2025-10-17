import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import ExtracurricularForm from '@/components/extracurricular/extracurricular-form';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { ExtracurricularWithPhoto } from '@/types/extracurricular';

interface ExtracurricularEditProps {
    extracurricular: ExtracurricularWithPhoto;
}

export default function ExtracurricularEdit({ extracurricular }: ExtracurricularEditProps) {
    const { t } = useTranslation('common');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('extracurricular_edit.breadcrumbs.admin_dashboard'), href: '/admin/dashboard' },
        { title: t('extracurricular_edit.breadcrumbs.extracurricular_management'), href: '/admin/extracurriculars' },
        {
            title: t('extracurricular_edit.breadcrumbs.edit_activity', { name: extracurricular.name }),
            href: `/admin/extracurriculars/${extracurricular.id}/edit`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('extracurricular_edit.page_title')} />

            <div className="space-y-6 px-4 sm:px-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-gray-100">{t('extracurricular_edit.page_title')}</h1>
                    <p className="text-sm text-gray-600 sm:text-base dark:text-gray-400">
                        {t('extracurricular_edit.page_description', { name: extracurricular.name })}
                    </p>
                </div>

                <div className="mx-auto max-w-2xl">
                    <ExtracurricularForm extracurricular={extracurricular} isEditing={true} />
                </div>
            </div>
        </AppLayout>
    );
}
