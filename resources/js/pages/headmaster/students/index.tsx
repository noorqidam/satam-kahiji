import { Head, Link } from '@inertiajs/react';
import { Eye, GraduationCap, Loader2, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHeadmasterStudentDataRefresh, useHeadmasterStudentFilters } from '@/hooks/use-headmaster-student-hooks';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type StudentIndexProps } from '@/types/student';

export default function HeadmasterStudentsIndex({ students, filters }: StudentIndexProps) {
    const { t } = useTranslation();
    useHeadmasterStudentDataRefresh();

    const { searchTerm, genderFilter, statusFilter, setSearchTerm, setGenderFilter, setStatusFilter, clearFilters, isLoading } =
        useHeadmasterStudentFilters(filters?.search || '', filters?.gender || 'all', filters?.status || 'all');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('headmaster_students.breadcrumbs.headmaster_dashboard'), href: '/headmaster/dashboard' },
        { title: t('headmaster_students.breadcrumbs.students_overview'), href: '/headmaster/students' },
    ];

    // Check if any filters are active
    const hasActiveFilters = searchTerm.trim() !== '' || genderFilter !== 'all' || statusFilter !== 'all';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('headmaster_students.page_title')} />

            <div className="space-y-6 px-4 sm:px-6">
                <div className="border-b border-gray-200 pb-5 dark:border-gray-700">
                    <h3 className="flex items-center gap-2 text-2xl leading-6 font-semibold text-gray-900 dark:text-gray-100">
                        <GraduationCap className="h-6 w-6" />
                        {t('headmaster_students.header.title')}
                        {isLoading && <Loader2 className="h-5 w-5 animate-spin text-gray-400" />}
                    </h3>
                    <p className="mt-2 max-w-4xl text-sm text-gray-500 dark:text-gray-400">{t('headmaster_students.header.description')}</p>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">{t('headmaster_students.filters.title')}</CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('headmaster_students.filters.description')}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className={`grid grid-cols-1 gap-4 ${hasActiveFilters ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
                            <div className="relative">
                                <Input
                                    placeholder={t('headmaster_students.filters.search_placeholder')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {isLoading && (
                                    <div className="absolute top-1/2 right-3 -translate-y-1/2 transform">
                                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <Select value={genderFilter} onValueChange={setGenderFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('headmaster_students.filters.gender_placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('headmaster_students.filters.all_genders')}</SelectItem>
                                        <SelectItem value="male">{t('headmaster_students.gender.male')}</SelectItem>
                                        <SelectItem value="female">{t('headmaster_students.gender.female')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('headmaster_students.filters.status_placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('headmaster_students.filters.all_status')}</SelectItem>
                                        <SelectItem value="active">{t('headmaster_students.status.active')}</SelectItem>
                                        <SelectItem value="graduated">{t('headmaster_students.status.graduated')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {hasActiveFilters && (
                                <div>
                                    <Button variant="outline" onClick={clearFilters} className="w-full">
                                        {t('headmaster_students.filters.clear_filters')}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Students Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            {t('headmaster_students.table.title', { total: students.total })}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            {t('headmaster_students.table.columns.student')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            {t('headmaster_students.table.columns.class_year')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            {t('headmaster_students.table.columns.gender')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            {t('headmaster_students.table.columns.birth_date')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            {t('headmaster_students.table.columns.homeroom_teacher')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            {t('headmaster_students.table.columns.status')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            {t('headmaster_students.table.columns.actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                                    {students.data.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0">
                                                        {student.photo ? (
                                                            <img
                                                                className="h-10 w-10 rounded-full object-cover"
                                                                src={student.photo}
                                                                alt={student.name}
                                                            />
                                                        ) : (
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600">
                                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                    {student.name.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{student.name}</div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">NISN: {student.nisn}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-gray-100">{student.class}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {t('headmaster_students.table.entry')}: {student.entry_year}
                                                    {student.graduation_year &&
                                                        ` | ${t('headmaster_students.table.grad')}: ${student.graduation_year}`}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge variant={student.gender === 'male' ? 'default' : 'secondary'}>
                                                    {student.gender === 'male'
                                                        ? t('headmaster_students.gender.male')
                                                        : t('headmaster_students.gender.female')}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                                                {new Date(student.birth_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                                                {student.homeroom_teacher?.name || t('headmaster_students.table.not_assigned')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                                                    {student.status === 'active'
                                                        ? t('headmaster_students.status.active')
                                                        : t('headmaster_students.status.graduated')}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                                <Link href={route('headmaster.students.show', student.id)}>
                                                    <Button variant="ghost" size="sm" title={t('headmaster_students.table.view_details')}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {students.data.length === 0 && (
                            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                                {t('headmaster_students.table.no_students_found')}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {students.last_page > 1 && (
                    <div className="flex justify-center">
                        <Pagination data={students} />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
