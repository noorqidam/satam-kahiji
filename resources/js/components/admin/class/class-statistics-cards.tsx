import { Building, GraduationCap, Users } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import type { ClassStats } from '@/types/class';

interface StatisticCardProps {
    title: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}

function StatisticCard({ title, value, icon: Icon, color }: StatisticCardProps) {
    return (
        <Card>
            <CardContent className="px-3 py-3 sm:px-4 sm:py-4">
                <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-400">{title}</p>
                        <p className={`mt-1 text-xl font-bold sm:text-2xl ${color}`}>{value}</p>
                    </div>
                    <Icon className={`ml-2 h-6 w-6 flex-shrink-0 sm:h-8 sm:w-8 ${color.replace('text-', 'text-')}`} />
                </div>
            </CardContent>
        </Card>
    );
}

interface ClassStatisticsCardsProps {
    stats: ClassStats;
}

export function ClassStatisticsCards({ stats }: ClassStatisticsCardsProps) {
    const statisticsConfig = [
        {
            title: 'Total Classes',
            value: stats.total_classes,
            icon: Building,
            color: 'text-blue-600',
        },
        {
            title: 'Active Classes',
            value: stats.active_classes,
            icon: GraduationCap,
            color: 'text-green-600',
        },
        {
            title: 'With Teachers',
            value: stats.classes_with_teachers,
            icon: Users,
            color: 'text-purple-600',
        },
        {
            title: 'Total Capacity',
            value: stats.total_capacity,
            icon: Building,
            color: 'text-gray-900 dark:text-gray-100',
        },
        {
            title: 'Total Students',
            value: stats.total_students,
            icon: Users,
            color: 'text-indigo-600',
        },
    ];

    return (
        <div className="xs:grid-cols-2 grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5 lg:gap-6">
            {statisticsConfig.map((stat) => (
                <StatisticCard key={stat.title} title={stat.title} value={stat.value} icon={stat.icon} color={stat.color} />
            ))}
        </div>
    );
}
