import { Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Edit, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type Subject } from '@/types/subject';

interface SubjectInfoCardProps {
    subject: Subject;
}

interface SubjectPageHeaderProps {
    subject: Subject;
}

export function SubjectInfoCard({ subject }: SubjectInfoCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Subject Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Subject Name</label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{subject.name}</p>
                </div>

                {subject.code && (
                    <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Subject Code</label>
                        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-sm font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            {subject.code}
                        </span>
                    </div>
                )}

                <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned Teachers</label>
                    <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-900 dark:text-gray-100">{subject.staff?.length || 0} teachers</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function SubjectPageHeader({ subject }: SubjectPageHeaderProps) {
    return (
        <div className="flex items-center gap-4">
            <Link href={route('admin.subjects.index')}>
                <Button variant="ghost" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                </Button>
            </Link>
            <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-gray-100">{subject.name}</h1>
                <p className="text-sm text-gray-600 sm:text-base dark:text-gray-400">Subject details and staff assignments</p>
            </div>
            <Link href={route('admin.subjects.edit', subject.id)}>
                <Button>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Subject
                </Button>
            </Link>
        </div>
    );
}
