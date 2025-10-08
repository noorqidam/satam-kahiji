import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Edit, Mail, Phone, User as UserIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDivisionColor } from '@/constants/divisions';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Staff } from '@/types/staff';

interface ShowStaffProps {
    staff: Staff & {
        subjects?: {
            id: number;
            name: string;
            code: string | null;
        }[];
    };
}

export default function ShowStaff({ staff }: ShowStaffProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin Dashboard', href: '/admin/dashboard' },
        { title: 'Staff Management', href: '/admin/staff' },
        { title: staff.name, href: `/admin/staff/${staff.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={staff.name} />

            <div className="space-y-6 px-4 sm:px-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('admin.staff.index')}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-gray-100">{staff.name}</h1>
                            <p className="text-sm text-gray-600 sm:text-base dark:text-gray-400">{staff.position}</p>
                        </div>
                    </div>

                    <Link href={route('admin.staff.edit', staff.id)}>
                        <Button>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Staff
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Profile Overview */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex flex-col items-center">
                                    <div className="mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                                        {staff.photo ? (
                                            <img
                                                src={staff.photo.startsWith('http') ? staff.photo : `/storage/profile-photos/${staff.photo}`}
                                                alt={staff.name}
                                                className="h-32 w-32 rounded-full object-cover"
                                            />
                                        ) : (
                                            <UserIcon className="h-16 w-16 text-gray-400" />
                                        )}
                                    </div>

                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{staff.name}</h3>
                                    <p className="text-gray-600 dark:text-gray-400">{staff.position}</p>
                                    <span
                                        className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getDivisionColor(staff.division)}`}
                                    >
                                        {staff.division}
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Email</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{staff.email}</p>
                                        </div>
                                    </div>

                                    {staff.phone && (
                                        <div className="flex items-center gap-3">
                                            <Phone className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Phone</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{staff.phone}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {staff.user && (
                                    <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                                        <h4 className="font-medium text-blue-900 dark:text-blue-100">User Account</h4>
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                            Role: {staff.user.role.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                        </p>
                                        <p className="text-sm text-blue-700 dark:text-blue-300">Login: {staff.user.email}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Detailed Information */}
                    <div className="lg:col-span-2">
                        <div className="space-y-6">
                            {/* Biography */}
                            {staff.bio && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Biography</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div
                                            className="prose prose-sm dark:prose-invert max-w-none"
                                            dangerouslySetInnerHTML={{ __html: staff.bio }}
                                        />
                                    </CardContent>
                                </Card>
                            )}

                            {/* Professional Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Professional Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-gray-100">Position</h4>
                                            <p className="mt-1 text-gray-600 dark:text-gray-400">{staff.position}</p>
                                        </div>

                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-gray-100">Division</h4>
                                            <p className="mt-1 text-gray-600 dark:text-gray-400">{staff.division}</p>
                                        </div>

                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-gray-100">Email Address</h4>
                                            <p className="mt-1 text-gray-600 dark:text-gray-400">{staff.email}</p>
                                        </div>

                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-gray-100">Phone Number</h4>
                                            <p className="mt-1 text-gray-600 dark:text-gray-400">{staff.phone || 'Not provided'}</p>
                                        </div>

                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-gray-100">Member Since</h4>
                                            <p className="mt-1 text-gray-600 dark:text-gray-400">
                                                {new Date(staff.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Subject Assignments */}
                            {staff.subjects && staff.subjects.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <BookOpen className="h-5 w-5" />
                                            Subject Assignments ({staff.subjects.length})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                            {staff.subjects.map((subject) => (
                                                <Link
                                                    key={subject.id}
                                                    href={route('admin.subjects.show', subject.id)}
                                                    className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                                                >
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                                        <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-gray-100">{subject.name}</p>
                                                        {subject.code && <p className="text-sm text-gray-500 dark:text-gray-400">{subject.code}</p>}
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                        <div className="mt-4 text-center">
                                            <Link href={route('admin.subjects.index')}>
                                                <Button variant="outline" size="sm">
                                                    <BookOpen className="mr-2 h-4 w-4" />
                                                    Manage Subject Assignments
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Activities or Additional Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Additional Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="py-8 text-center">
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Additional features like activity logs, performance metrics, or documents can be added here.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
