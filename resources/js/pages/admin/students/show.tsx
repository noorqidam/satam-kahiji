import { Head } from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type StudentShowProps } from '@/types/student';

import { StudentInfoCard, StudentPageHeader } from '@/components/admin/student/student-info';

export default function ShowStudent({ student }: StudentShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin Dashboard', href: '/admin/dashboard' },
        { title: 'Student Management', href: '/admin/students' },
        { title: student.name, href: `/admin/students/${student.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={student.name} />

            <div className="space-y-6 px-4 sm:px-6">
                <StudentPageHeader student={student} />
                <StudentInfoCard student={student} />
            </div>
        </AppLayout>
    );
}
