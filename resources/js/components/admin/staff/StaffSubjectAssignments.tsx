import { Link } from '@inertiajs/react';
import { BookOpen, LoaderCircle, Plus, Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Import i18n to ensure it's initialized

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pagination, type PaginationData } from '@/components/ui/pagination';
import type { Staff } from '@/types/staff';

interface StaffSubjectAssignmentsProps {
    staff: Staff;
    availableSubjects?: PaginationData & {
        data: {
            id: number;
            name: string;
            code: string | null;
        }[];
    };
    selectedSubjects: number[];
    isAssigningSubjects: boolean;
    subjectsSearch: string;
    onSubjectSelection: (subjectId: number, checked: boolean) => void;
    onAssignSubjects: () => void;
    onRemoveSubject: (subjectId: number) => void;
    onSubjectsSearchChange: (search: string) => void;
}

export function StaffSubjectAssignments({
    staff,
    availableSubjects,
    selectedSubjects,
    isAssigningSubjects,
    subjectsSearch,
    onSubjectSelection,
    onAssignSubjects,
    onRemoveSubject,
    onSubjectsSearchChange,
}: StaffSubjectAssignmentsProps) {
    const { t } = useTranslation();
    const isTeacherInAcademic =
        (staff.position.toLowerCase().includes('teacher') || staff.position.toLowerCase().includes('guru')) &&
        staff.division.toLowerCase() === 'akademik';

    if (!isTeacherInAcademic) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        {t('staff_management.subject_assignments.title')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
                                <BookOpen className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                                <h4 className="font-medium text-yellow-900 dark:text-yellow-100">{t('staff_management.subject_assignments.restricted_title')}</h4>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                    {t('staff_management.subject_assignments.restricted_message')}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!availableSubjects || availableSubjects.data.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        {t('staff_management.subject_assignments.title')} ({staff.subjects?.length || 0})
                    </CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={onAssignSubjects} disabled={isAssigningSubjects}>
                        {isAssigningSubjects && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        {t('staff_management.subject_assignments.update_assignments')}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Currently Assigned Subjects */}
                {staff.subjects && staff.subjects.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('staff_management.subject_assignments.currently_assigned')}</h4>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {staff.subjects.map((subject) => (
                                <div
                                    key={subject.id}
                                    className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                                            <BookOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{subject.name}</p>
                                            {subject.code && <p className="text-xs text-gray-500 dark:text-gray-400">{subject.code}</p>}
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onRemoveSubject(subject.id)}
                                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Search and Filter */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('staff_management.subject_assignments.all_subjects')} ({availableSubjects?.total || 0})</h4>
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                type="text"
                                placeholder={t('staff_management.subject_assignments.search_placeholder')}
                                value={subjectsSearch}
                                onChange={(e) => onSubjectsSearchChange(e.target.value)}
                                className="w-64 pl-10"
                            />
                        </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {availableSubjects?.data.map((subject) => {
                            const isAssigned = selectedSubjects.includes(subject.id);
                            return (
                                <div
                                    key={subject.id}
                                    className={`flex items-center space-x-3 rounded-lg border p-3 ${
                                        isAssigned
                                            ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                                            : 'border-gray-200 dark:border-gray-700'
                                    }`}
                                >
                                    <Checkbox
                                        id={`subject-${subject.id}`}
                                        checked={isAssigned}
                                        onCheckedChange={(checked) => onSubjectSelection(subject.id, checked as boolean)}
                                    />
                                    <Label htmlFor={`subject-${subject.id}`} className="flex-1 cursor-pointer">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                                    isAssigned ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-800'
                                                }`}
                                            >
                                                <BookOpen
                                                    className={`h-4 w-4 ${
                                                        isAssigned ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                                                    }`}
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{subject.name}</p>
                                                {subject.code && <p className="text-xs text-gray-500 dark:text-gray-400">{subject.code}</p>}
                                            </div>
                                        </div>
                                    </Label>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {availableSubjects && availableSubjects.last_page > 1 && (
                        <div className="mt-4">
                            <Pagination data={availableSubjects} />
                        </div>
                    )}
                </div>

                {(!availableSubjects || availableSubjects.data.length === 0) && (
                    <div className="py-8 text-center">
                        <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">{t('staff_management.subject_assignments.no_subjects_title')}</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('staff_management.subject_assignments.no_subjects_message')}</p>
                        <div className="mt-4">
                            <Link href={route('admin.subjects.create')}>
                                <Button size="sm">
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('staff_management.subject_assignments.create_subject')}
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
