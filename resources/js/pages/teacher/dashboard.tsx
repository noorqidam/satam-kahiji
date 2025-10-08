import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Teacher Dashboard',
        href: '/teacher/dashboard',
    },
];

export default function TeacherDashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Teacher Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mb-4">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Teacher Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage your classes, students, and grades.</p>
                </div>

                <div className="grid auto-rows-min gap-4 md:grid-cols-2">
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 bg-rose-50 dark:border-sidebar-border dark:bg-rose-950">
                        <div className="p-4">
                            <h3 className="font-semibold text-rose-900 dark:text-rose-100">My Subjects</h3>
                            <p className="text-sm text-rose-700 dark:text-rose-300">Subjects you teach</p>
                        </div>
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-rose-900/10 dark:stroke-rose-100/10" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 bg-emerald-50 dark:border-sidebar-border dark:bg-emerald-950">
                        <div className="p-4">
                            <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">Student Grades</h3>
                            <p className="text-sm text-emerald-700 dark:text-emerald-300">Manage student assessments</p>
                        </div>
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-emerald-900/10 dark:stroke-emerald-100/10" />
                    </div>
                </div>

                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className="p-6">
                        <h2 className="mb-4 text-lg font-semibold">Recent Teaching Activity</h2>
                        <p className="text-gray-600 dark:text-gray-400">Your recent grades and student interactions will appear here.</p>
                    </div>
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </AppLayout>
    );
}
