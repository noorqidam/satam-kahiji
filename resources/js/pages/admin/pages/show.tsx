import { Head, Link } from '@inertiajs/react';
import { Calendar, Edit, FileText, Link as LinkIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Page {
    id: number;
    slug: string;
    title: string;
    content: string;
    image: string | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    page: Page;
}

export default function ShowPage({ page }: Props) {
    const { t } = useTranslation('common');
    
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('page_management.breadcrumbs.admin_dashboard'), href: '/admin/dashboard' },
        { title: t('page_management.breadcrumbs.page_management'), href: '/admin/pages' },
        { title: page.title, href: `/admin/pages/${page.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={page.title} />

            <div className="space-y-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6 sm:p-8 dark:border-blue-800 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-800">
                                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h1 className="mb-1 text-2xl font-bold text-gray-900 sm:text-3xl dark:text-gray-100">{page.title}</h1>
                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <LinkIcon className="h-4 w-4" />/{page.slug}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        {t('page_management.show.header.updated')} {new Date(page.updated_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Link href={route('admin.pages.edit', page.id)}>
                            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                                <Edit className="mr-2 h-4 w-4" />
                                {t('page_management.show.actions.edit_page')}
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <Card className="border-2 border-gray-200 dark:border-gray-700">
                            <CardHeader>
                                <CardTitle>{t('page_management.create.form.fields.content.label')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {page.image && (
                                    <div className="mb-6">
                                        <img
                                            src={page.image || undefined}
                                            alt={page.title}
                                            className="max-h-64 w-full rounded-lg border object-cover"
                                        />
                                    </div>
                                )}

                                <div className="prose prose-gray dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: page.content }} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Page Information */}
                        <Card className="border-2 border-gray-200 dark:border-gray-700">
                            <CardHeader>
                                <CardTitle className="text-lg">{t('page_management.show.meta.title')}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('page_management.show.meta.slug')}</label>
                                    <p className="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-900 dark:bg-gray-800 dark:text-gray-100">
                                        /{page.slug}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('page_management.show.meta.created_at')}</label>
                                    <p className="text-sm text-gray-900 dark:text-gray-100">{new Date(page.created_at).toLocaleString()}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('page_management.show.meta.updated_at')}</label>
                                    <p className="text-sm text-gray-900 dark:text-gray-100">{new Date(page.updated_at).toLocaleString()}</p>
                                </div>

                                {page.image && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('page_management.show.meta.featured_image')}</label>
                                        <div className="mt-1">
                                            <img src={page.image || undefined} alt={page.title} className="h-24 w-full rounded border object-cover" />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
