import { Head, Link } from '@inertiajs/react';
import { Building, Edit, GraduationCap, UserCheck, Users } from 'lucide-react';

import { StudentCard } from '@/components/admin/class/student-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { SchoolClass, Student } from '@/types/class';
import { getGradeDisplayName } from '@/utils/class-utils';

interface ClassShowProps {
    class: SchoolClass;
    students: Student[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Classes', href: '/admin/classes' },
    { title: 'Class Details', href: '' },
];

export default function ClassShow({ class: schoolClass, students }: ClassShowProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Class ${schoolClass.name} Details`} />

            <div className="space-y-4 px-3 sm:space-y-6 sm:px-4 lg:px-6">
                {/* Header */}
                <div className="border-b border-gray-200 pb-3 sm:pb-4 dark:border-gray-700">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-lg font-bold text-gray-900 sm:text-xl lg:text-2xl dark:text-gray-100">
                                Class {schoolClass.name} Details
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {getGradeDisplayName(schoolClass.grade_level)} - Section {schoolClass.class_section}
                            </p>
                        </div>
                        <Link href={route('admin.classes.edit', schoolClass.id)} className="sm:flex-shrink-0">
                            <Button className="w-full sm:w-auto">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Class
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Class Overview - Compact Layout */}
                <div className="grid gap-4">
                    {/* Class Information & Statistics Combined */}
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <span className="text-lg">Class Information</span>
                                <div className="flex flex-wrap gap-2">{schoolClass.is_full && <Badge variant="destructive">Full</Badge>}</div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Basic Information Grid */}
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Class Name</label>
                                    <p className="text-base font-semibold">{schoolClass.name}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Grade Level</label>
                                    <p className="text-base font-semibold">{getGradeDisplayName(schoolClass.grade_level)}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Section</label>
                                    <p className="text-base font-semibold">{schoolClass.class_section}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Capacity</label>
                                    <p className="text-base font-semibold">
                                        {schoolClass.student_count}/{schoolClass.capacity} students
                                    </p>
                                </div>
                            </div>

                            {/* Statistics Cards - Compact Horizontal Layout */}
                            <div className="grid grid-cols-3 gap-3 sm:gap-4">
                                <div className="rounded-lg bg-blue-50 p-3 text-center dark:bg-blue-950/20">
                                    <Users className="mx-auto mb-1 h-5 w-5 text-blue-600" />
                                    <p className="text-lg font-bold text-blue-600">{schoolClass.student_count}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Total Students</p>
                                </div>
                                <div className="rounded-lg bg-green-50 p-3 text-center dark:bg-green-950/20">
                                    <GraduationCap className="mx-auto mb-1 h-5 w-5 text-green-600" />
                                    <p className="text-lg font-bold text-green-600">{schoolClass.available_capacity}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Available Slots</p>
                                </div>
                                <div className="rounded-lg bg-purple-50 p-3 text-center dark:bg-purple-950/20">
                                    <Building className="mx-auto mb-1 h-5 w-5 text-purple-600" />
                                    <p className="text-lg font-bold text-purple-600">
                                        {Math.round((schoolClass.student_count / schoolClass.capacity) * 100)}%
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Capacity Usage</p>
                                </div>
                            </div>

                            {/* Homeroom Teacher */}
                            <div className="border-t pt-3">
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Homeroom Teacher</label>
                                {schoolClass.homeroom_teacher ? (
                                    <div className="mt-1 flex items-center gap-2">
                                        <UserCheck className="h-4 w-4 text-green-600" />
                                        <span className="font-medium">{schoolClass.homeroom_teacher.name}</span>
                                        <Badge variant="outline" className="text-xs">
                                            {schoolClass.homeroom_teacher.position}
                                        </Badge>
                                    </div>
                                ) : (
                                    <p className="mt-1 text-sm text-orange-600">No homeroom teacher assigned</p>
                                )}
                            </div>

                            {/* Description if exists */}
                            {schoolClass.description && (
                                <div className="border-t pt-3">
                                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Description</label>
                                    <p className="mt-1 text-sm">{schoolClass.description}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Students List - Compact Layout */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle className="text-lg">
                                Students in Class {schoolClass.name} ({students.length})
                            </CardTitle>
                            {students.length > 0 && (
                                <div className="flex flex-wrap gap-2 text-xs">
                                    <span className="rounded bg-blue-100 px-2 py-1 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                        Male: {students.filter((s) => s.gender === 'male').length}
                                    </span>
                                    <span className="rounded bg-pink-100 px-2 py-1 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
                                        Female: {students.filter((s) => s.gender === 'female').length}
                                    </span>
                                    <span className="rounded bg-green-100 px-2 py-1 text-green-800 dark:bg-green-900 dark:text-green-200">
                                        Active: {students.filter((s) => s.status === 'active').length}
                                    </span>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {students.length > 0 ? (
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {students.map((student) => (
                                    <StudentCard key={student.id} student={student} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-6 text-center">
                                <Users className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                                <h3 className="mb-1 text-base font-medium text-gray-900 dark:text-gray-100">No Students Assigned</h3>
                                <p className="mb-2 text-sm text-gray-500">This class doesn't have any students assigned yet.</p>
                                {!schoolClass.homeroom_teacher && (
                                    <p className="text-xs text-orange-600">
                                        Assign a homeroom teacher first to enable student management for this class.
                                    </p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
