import { Head } from '@inertiajs/react';
import { FileText, Plus, Users } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TeacherProgressTable } from '@/components/admin/work-items/teacher-progress-table';
import { WorkItemManageDialog } from '@/components/admin/work-items/work-item-manage-dialog';
import { WorkItemStatsCards } from '@/components/admin/work-items/work-item-stats-cards';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { WorkItemIndexProps } from '@/types/workItem';

export default function WorkItemsIndex({ workItems, teachers = [], stats, userRole }: WorkItemIndexProps) {
    const { t } = useTranslation('common');
    const [showManageDialog, setShowManageDialog] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('work_items_management.breadcrumbs.admin_dashboard'), href: '/admin/dashboard' },
        { title: t('work_items_management.breadcrumbs.work_items_management'), href: '/admin/work-items' },
    ];

    const canManageWorkItems = ['super_admin', 'headmaster'].includes(userRole);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('work_items_management.page_title')} />

            <div className="space-y-8 px-4 sm:px-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('work_items_management.header.title')}</h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t('work_items_management.header.description')}</p>
                    </div>

                    {canManageWorkItems && (
                        <div className="flex gap-2">
                            <Button onClick={() => setShowManageDialog(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                {t('work_items_management.actions.manage_work_items')}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Statistics Cards */}
                {stats && <WorkItemStatsCards stats={stats} />}

                {/* Work Items Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            {t('work_items_management.overview.title')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {workItems.map((workItem) => (
                                <div key={workItem.id} className="rounded-lg border p-4 transition-shadow hover:shadow-md">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900 dark:text-gray-100">{workItem.name}</h3>
                                        </div>
                                        <Badge variant={workItem.is_required ? 'destructive' : 'secondary'}>
                                            {workItem.is_required
                                                ? t('work_items_management.work_item_status.required')
                                                : t('work_items_management.work_item_status.optional')}
                                        </Badge>
                                    </div>

                                    {stats && (
                                        <div className="mt-3">
                                            {(() => {
                                                const workItemStat = stats.work_item_stats.find((stat) => stat.work_item === workItem.name);
                                                return workItemStat ? (
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span>{t('work_items_management.overview.completion')}</span>
                                                            <span>{workItemStat.completion_rate}%</span>
                                                        </div>
                                                        <Progress value={workItemStat.completion_rate} />
                                                        <p className="text-xs text-gray-500">
                                                            {workItemStat.completion_count} {t('work_items_management.overview.of')}{' '}
                                                            {workItemStat.total_teachers} {t('work_items_management.overview.teachers')}
                                                        </p>
                                                    </div>
                                                ) : null;
                                            })()}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Teacher Progress Table */}
                {teachers.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                {t('work_items_management.teacher_progress.title')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <TeacherProgressTable teachers={teachers} workItems={workItems} userRole={userRole} />
                        </CardContent>
                    </Card>
                )}

                {/* Work Item Management Dialog */}
                {canManageWorkItems && (
                    <WorkItemManageDialog open={showManageDialog} onOpenChange={setShowManageDialog} workItems={workItems} userRole={userRole} />
                )}
            </div>
        </AppLayout>
    );
}
