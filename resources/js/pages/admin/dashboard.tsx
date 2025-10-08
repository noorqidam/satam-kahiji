import { MetricsCard } from '@/components/metrics-card';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Activity, ArrowRight, LogIn, LogOut, Shield, TrendingUp, UserPlus, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin/dashboard',
    },
];

interface AdminDashboardProps {
    metrics?: {
        total_users: number;
        active_users: number;
        users_by_role: Record<string, number>;
        recent_login_count: number;
    };
    recent_activity?: Array<{
        id: number;
        name: string;
        email: string;
        role: string;
        action: string;
        activity_type: string;
        ip_address: string;
        created_at: string;
    }>;
}

export default function AdminDashboard({ metrics, recent_activity }: AdminDashboardProps) {
    // Provide fallback values if metrics is undefined
    const safeMetrics = metrics || {
        total_users: 0,
        active_users: 0,
        users_by_role: {},
        recent_login_count: 0,
    };

    const safeRecentActivity = recent_activity || [];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Super Admin Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Welcome to the system administration panel. Manage users, system settings, and monitor school operations.
                    </p>
                </div>

                {/* Key Metrics Cards */}
                <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <MetricsCard
                        title="Total Users"
                        value={safeMetrics.total_users}
                        description="All registered users"
                        icon={Users}
                        gradient="from-blue-500/20 via-blue-400/15 to-cyan-400/10"
                    />
                    <MetricsCard
                        title="Active Users"
                        value={safeMetrics.active_users}
                        description="Verified accounts"
                        icon={Shield}
                        gradient="from-green-500/20 via-emerald-400/15 to-teal-400/10"
                    />
                    <MetricsCard
                        title="Recent Logins"
                        value={safeMetrics.recent_login_count}
                        description="Last 7 days"
                        icon={Activity}
                        gradient="from-purple-500/20 via-violet-400/15 to-indigo-400/10"
                    />
                    <MetricsCard
                        title="System Health"
                        value="Good"
                        description="All systems operational"
                        icon={TrendingUp}
                        gradient="from-orange-500/20 via-amber-400/15 to-yellow-400/10"
                    />
                </div>

                {/* User Role Distribution */}
                <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {Object.entries(safeMetrics.users_by_role).map(([role, count], index) => {
                        const gradients = [
                            'from-rose-500/20 via-pink-400/15 to-red-400/10',
                            'from-indigo-500/20 via-blue-400/15 to-sky-400/10',
                            'from-emerald-500/20 via-green-400/15 to-lime-400/10',
                            'from-violet-500/20 via-purple-400/15 to-fuchsia-400/10',
                        ];
                        return (
                            <MetricsCard
                                key={role}
                                title={role.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                value={count}
                                gradient={gradients[index % gradients.length]}
                            />
                        );
                    })}
                </div>

                <div className="grid auto-rows-min gap-4 md:grid-cols-2">
                    <div className="group relative aspect-video cursor-pointer overflow-hidden rounded-xl border-0 bg-gradient-to-br from-green-500/20 via-emerald-400/15 to-teal-400/10 backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-white/5 dark:to-transparent" />
                        <div className="relative z-10 p-4">
                            <h3 className="font-semibold text-foreground transition-colors group-hover:text-green-600 dark:group-hover:text-green-400">
                                System Settings
                            </h3>
                            <p className="text-sm text-muted-foreground">Configure system parameters</p>
                        </div>
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-green-900/10 dark:stroke-green-100/10" />
                    </div>
                    <div className="group relative aspect-video cursor-pointer overflow-hidden rounded-xl border-0 bg-gradient-to-br from-purple-500/20 via-violet-400/15 to-indigo-400/10 backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-white/5 dark:to-transparent" />
                        <div className="relative z-10 p-4">
                            <h3 className="font-semibold text-foreground transition-colors group-hover:text-purple-600 dark:group-hover:text-purple-400">
                                Analytics
                            </h3>
                            <p className="text-sm text-muted-foreground">System usage analytics</p>
                        </div>
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-purple-900/10 dark:stroke-purple-100/10" />
                    </div>
                </div>

                <div className="relative min-h-[400px] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <div className="p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Recent System Activity</h2>
                            <Link
                                href="/admin/system-activity"
                                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                View All
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                        {safeRecentActivity.length > 0 ? (
                            <div className="space-y-3">
                                {safeRecentActivity.map((activity) => {
                                    const getActivityIcon = (activityType: string) => {
                                        switch (activityType) {
                                            case 'login':
                                                return <LogIn className="h-4 w-4 text-green-600 dark:text-green-400" />;
                                            case 'logout':
                                                return <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />;
                                            case 'registration':
                                                return <UserPlus className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
                                            default:
                                                return <Activity className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
                                        }
                                    };

                                    const getActivityBgColor = (activityType: string) => {
                                        switch (activityType) {
                                            case 'login':
                                                return 'bg-green-100 dark:bg-green-900';
                                            case 'logout':
                                                return 'bg-red-100 dark:bg-red-900';
                                            case 'registration':
                                                return 'bg-blue-100 dark:bg-blue-900';
                                            default:
                                                return 'bg-gray-100 dark:bg-gray-900';
                                        }
                                    };

                                    return (
                                        <div
                                            key={activity.id}
                                            className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`flex h-8 w-8 items-center justify-center rounded-full ${getActivityBgColor(activity.activity_type)}`}
                                                >
                                                    {getActivityIcon(activity.activity_type)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{activity.action}</p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                        {activity.name} ({activity.role}) • {activity.ip_address}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(activity.created_at).toLocaleDateString()}{' '}
                                                {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-600 dark:text-gray-400">No recent activity to display.</p>
                        )}
                    </div>
                    <PlaceholderPattern className="absolute inset-0 -z-10 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10" />
                </div>
            </div>
        </AppLayout>
    );
}
