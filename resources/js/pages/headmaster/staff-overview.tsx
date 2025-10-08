import { Head } from '@inertiajs/react';
import { AlertCircle, CheckCircle, Clock, FileText, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StaffOverviewTable } from '@/components/headmaster/staff-overview-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { StaffOverviewProps } from '@/types/staff-overview';
import { applyAllFilters, enrichTeachersWithProgress } from '@/utils/staff-overview-helpers';

export default function StaffOverview({ teachers, workItems, stats }: StaffOverviewProps) {
    const { t } = useTranslation('common');
    
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('headmaster_staff_overview.breadcrumbs.headmaster_dashboard'), href: '/headmaster/dashboard' },
        { title: t('headmaster_staff_overview.breadcrumbs.staff_overview'), href: '/headmaster/staff-overview' },
    ];
    const [selectedWorkItem, setSelectedWorkItem] = useState<number | null>(null);
    const [feedbackFilter, setFeedbackFilter] = useState<'all' | 'pending' | 'approved' | 'needs_revision'>('all');

    // Enrich teachers with progress data using utility functions
    const teachersWithProgress = enrichTeachersWithProgress(teachers, workItems);

    // Apply filters using utility functions
    const filteredTeachers = applyAllFilters(teachersWithProgress, selectedWorkItem, feedbackFilter);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        {t('headmaster_staff_overview.status.approved')}
                    </Badge>
                );
            case 'needs_revision':
                return (
                    <Badge variant="destructive">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        {t('headmaster_staff_overview.status.needs_revision')}
                    </Badge>
                );
            case 'pending':
            default:
                return (
                    <Badge variant="secondary">
                        <Clock className="mr-1 h-3 w-3" />
                        {t('headmaster_staff_overview.status.pending_review')}
                    </Badge>
                );
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('headmaster_staff_overview.page_title')} />

            <div className="space-y-6 px-4 sm:px-6">
                {/* Header */}
                <div className="border-b border-gray-200 pb-6 dark:border-gray-700">
                    <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-gray-100">{t('headmaster_staff_overview.header.title')}</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t('headmaster_staff_overview.header.description')}</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('headmaster_staff_overview.stats.total_teachers')}</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_teachers}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('headmaster_staff_overview.stats.upload_progress')}</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.upload_completion_rate}%</div>
                            <Progress value={stats.upload_completion_rate} className="mt-2" />
                            <p className="mt-1 text-xs text-muted-foreground">{stats.total_files} {t('headmaster_staff_overview.stats.files_uploaded')}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('headmaster_staff_overview.stats.feedback_progress')}</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.feedback_completion_rate}%</div>
                            <Progress value={stats.feedback_completion_rate} className="mt-2" />
                            <p className="mt-1 text-xs text-muted-foreground">{stats.total_approved_files} {t('headmaster_staff_overview.stats.files_reviewed')}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('headmaster_staff_overview.stats.approval_rate')}</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.approval_rate}%</div>
                            <p className="mt-1 text-xs text-muted-foreground">{stats.total_approved_files} {t('headmaster_staff_overview.stats.approved_files')}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="p-4 sm:p-6">
                    <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-6">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="work-item-filter" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {t('headmaster_staff_overview.filters.filter_by_work_item')}
                            </Label>
                            <Select
                                value={selectedWorkItem?.toString() || 'all'}
                                onValueChange={(value) => setSelectedWorkItem(value === 'all' ? null : Number(value))}
                            >
                                <SelectTrigger
                                    id="work-item-filter"
                                    className="h-10 w-full border-gray-300 bg-white transition-colors hover:border-gray-400 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500 dark:focus:border-blue-400"
                                >
                                    <SelectValue placeholder={t('headmaster_staff_overview.filters.all_work_items')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('headmaster_staff_overview.filters.all_work_items')}</SelectItem>
                                    {workItems.map((item) => (
                                        <SelectItem key={item.id} value={item.id.toString()}>
                                            {item.name} {item.is_required ? `(${t('headmaster_staff_overview.filters.required')})` : `(${t('headmaster_staff_overview.filters.optional')})`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex-1 space-y-2">
                            <Label htmlFor="feedback-filter" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {t('headmaster_staff_overview.filters.filter_by_feedback_status')}
                            </Label>
                            <Select
                                value={feedbackFilter}
                                onValueChange={(value: 'all' | 'pending' | 'approved' | 'needs_revision') => setFeedbackFilter(value)}
                            >
                                <SelectTrigger
                                    id="feedback-filter"
                                    className="h-10 w-full border-gray-300 bg-white transition-colors hover:border-gray-400 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500 dark:focus:border-blue-400"
                                >
                                    <SelectValue placeholder={t('headmaster_staff_overview.filters.all_statuses')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('headmaster_staff_overview.filters.all_statuses')}</SelectItem>
                                    <SelectItem value="pending">{t('headmaster_staff_overview.status.pending_review')}</SelectItem>
                                    <SelectItem value="approved">{t('headmaster_staff_overview.status.approved')}</SelectItem>
                                    <SelectItem value="needs_revision">{t('headmaster_staff_overview.status.needs_revision')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </Card>

                {/* Teachers Table */}
                <StaffOverviewTable
                    teachers={filteredTeachers}
                    workItems={workItems}
                    selectedWorkItem={selectedWorkItem}
                    feedbackFilter={feedbackFilter}
                    getStatusBadge={getStatusBadge}
                />
            </div>
        </AppLayout>
    );
}
