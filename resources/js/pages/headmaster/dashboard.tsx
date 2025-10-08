import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Headmaster Dashboard',
        href: '/headmaster/dashboard',
    },
];

export default function HeadmasterDashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Headmaster Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mb-4">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Headmaster Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        School leadership overview. Monitor academic performance, staff management, and school operations.
                    </p>
                </div>

                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 bg-indigo-50 dark:border-sidebar-border dark:bg-indigo-950">
                        <div className="p-4">
                            <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">Staff Management</h3>
                            <p className="text-sm text-indigo-700 dark:text-indigo-300">Manage teachers and staff</p>
                        </div>
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-indigo-900/10 dark:stroke-indigo-100/10" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 bg-teal-50 dark:border-sidebar-border dark:bg-teal-950">
                        <div className="p-4">
                            <h3 className="font-semibold text-teal-900 dark:text-teal-100">Academic Overview</h3>
                            <p className="text-sm text-teal-700 dark:text-teal-300">Student performance metrics</p>
                        </div>
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-teal-900/10 dark:stroke-teal-100/10" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 bg-orange-50 dark:border-sidebar-border dark:bg-orange-950">
                        <div className="p-4">
                            <h3 className="font-semibold text-orange-900 dark:text-orange-100">Work Items</h3>
                            <p className="text-sm text-orange-700 dark:text-orange-300">Teacher work requirements</p>
                        </div>
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-orange-900/10 dark:stroke-orange-100/10" />
                    </div>
                </div>

                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className="p-6">
                        <h2 className="mb-4 text-lg font-semibold">School Performance Overview</h2>
                        <p className="text-gray-600 dark:text-gray-400">Academic performance data and school statistics will be displayed here.</p>
                    </div>
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </AppLayout>
    );
}
