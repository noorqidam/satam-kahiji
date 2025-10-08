import { Link } from '@inertiajs/react';
import { Calendar, Edit2, FileText, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type Student } from '@/types/student';

interface StudentPageHeaderProps {
    student: Student;
}

interface StudentInfoCardProps {
    student: Student;
}

export function StudentPageHeader({ student }: StudentPageHeaderProps) {
    return (
        <div className="flex items-center justify-between border-b border-gray-200 pb-5 dark:border-gray-700">
            <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                    {student.photo ? (
                        <img
                            src={student.photo.startsWith('http') ? student.photo : `/storage/students/${student.photo}`}
                            alt={student.name}
                            className="h-16 w-16 rounded-full object-cover"
                        />
                    ) : (
                        <User className="h-8 w-8 text-gray-500" />
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <div>
                        <h3 className="text-2xl leading-6 font-semibold text-gray-900 dark:text-gray-100">{student.name}</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            NISN: {student.nisn} | Class: {student.class}
                        </p>
                    </div>
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            student.status === 'active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : student.status === 'graduated'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                  : student.status === 'transferred'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                    : student.status === 'dropped'
                                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}
                    >
                        {student.status === 'active'
                            ? 'Active'
                            : student.status === 'graduated'
                              ? 'Graduated'
                              : student.status === 'transferred'
                                ? 'Transferred'
                                : student.status === 'dropped'
                                  ? 'Dropped'
                                  : 'Unknown'}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Link href={route('admin.students.edit', student.id)}>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Edit2 className="h-4 w-4" />
                        Edit Student
                    </Button>
                </Link>
            </div>
        </div>
    );
}

export function StudentInfoCard({ student }: StudentInfoCardProps) {
    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Personal Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{student.name}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">NISN</dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{student.nisn}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Class</dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{student.class}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                {student.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : 'Not specified'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                {student.birth_date ? new Date(student.birth_date).toLocaleDateString() : 'Not specified'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Entry Year</dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{student.entry_year}</dd>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Academic Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Homeroom Teacher</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                            {student.homeroom_teacher ? (
                                <div>
                                    <p className="font-medium">{student.homeroom_teacher.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{student.homeroom_teacher.position}</p>
                                </div>
                            ) : (
                                'No homeroom teacher assigned'
                            )}
                        </dd>
                    </div>
                    {student.graduation_year && (
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Expected Graduation</dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{student.graduation_year}</dd>
                        </div>
                    )}
                </CardContent>
            </Card>

            {student.notes && (
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Notes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: student.notes }} />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
