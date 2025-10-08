import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Staff Dashboard',
        href: '/staff/dashboard',
    },
];

export default function StaffDashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Staff Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mb-4">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Staff Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Administrative staff portal for public relations, administration, and deputy headmaster functions.
                    </p>
                </div>

                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 bg-cyan-50 dark:border-sidebar-border dark:bg-cyan-950">
                        <div className="p-4">
                            <h3 className="font-semibold text-cyan-900 dark:text-cyan-100">Student Records</h3>
                            <p className="text-sm text-cyan-700 dark:text-cyan-300">Manage student information</p>
                        </div>
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-cyan-900/10 dark:stroke-cyan-100/10" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 bg-violet-50 dark:border-sidebar-border dark:bg-violet-950">
                        <div className="p-4">
                            <h3 className="font-semibold text-violet-900 dark:text-violet-100">Communications</h3>
                            <p className="text-sm text-violet-700 dark:text-violet-300">Public relations & notices</p>
                        </div>
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-violet-900/10 dark:stroke-violet-100/10" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 bg-slate-50 dark:border-sidebar-border dark:bg-slate-950">
                        <div className="p-4">
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Administration</h3>
                            <p className="text-sm text-slate-700 dark:text-slate-300">Administrative tasks</p>
                        </div>
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-slate-900/10 dark:stroke-slate-100/10" />
                    </div>
                </div>

                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className="p-6">
                        <h2 className="mb-4 text-lg font-semibold">Administrative Tasks</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Your administrative tasks, communications, and student management activities will be shown here.
                        </p>
                    </div>
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </AppLayout>
    );
}
