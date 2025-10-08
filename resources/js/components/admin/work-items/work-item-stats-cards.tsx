import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { WorkItemStats } from '@/types/workItem';
import { CheckCircle, FileText, TrendingUp, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface WorkItemStatsCardsProps {
    stats: WorkItemStats;
}

export function WorkItemStatsCards({ stats }: WorkItemStatsCardsProps) {
    const { t } = useTranslation('common');
    
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('work_items_management.stats.total_teachers')}</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.total_teachers}</div>
                    <p className="text-xs text-muted-foreground">{t('work_items_management.stats.active_teaching_staff')}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('work_items_management.stats.work_items')}</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.total_work_items}</div>
                    <p className="text-xs text-muted-foreground">{t('work_items_management.stats.required_documents')}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('work_items_management.stats.completed')}</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.completed_submissions}</div>
                    <p className="text-xs text-muted-foreground">{t('work_items_management.overview.of')} {stats.total_expected_submissions} {t('work_items_management.stats.expected')}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('work_items_management.stats.completion_rate')}</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.overall_completion_rate}%</div>
                    <p className="text-xs text-muted-foreground">{t('work_items_management.stats.overall_progress')}</p>
                </CardContent>
            </Card>
        </div>
    );
}
