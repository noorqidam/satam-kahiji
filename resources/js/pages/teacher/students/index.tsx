import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, GraduationCap, Grid3X3, List, Plus, Search, Trash2, User, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ConfirmationDialog } from '@/components/admin/student/confirmation-dialog';
import { StudentsTable } from '@/components/teacher/students/students-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { TeacherStudent } from '@/types/teacher-student';

interface Teacher {
    id: number;
    name: string;
    email: string;
    position: string;
}

interface ClassStats {
    total_students: number;
    male_students: number;
    female_students: number;
    active_students: number;
}

interface TeacherStudentsIndexProps {
    students: TeacherStudent[];
    teacher: Teacher;
    classStats: ClassStats;
    userRole: string;
}

// Note: breadcrumbs will be defined inside component to access translations

export default function TeacherStudentsIndex({ students, teacher, classStats, userRole }: TeacherStudentsIndexProps) {
    const { t } = useTranslation('common');
    const { toast } = useToast();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('teacher_students.breadcrumbs.teacher_dashboard'), href: '/teacher/dashboard' },
        { title: t('teacher_students.breadcrumbs.my_students'), href: '/teacher/students' },
    ];
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGender, setSelectedGender] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

    // Load view mode from localStorage on component mount
    useEffect(() => {
        const savedViewMode = localStorage.getItem('teacher-students-view-mode');
        if (savedViewMode === 'table' || savedViewMode === 'cards') {
            setViewMode(savedViewMode);
        }
    }, []);

    // Save view mode to localStorage when it changes
    const handleViewModeChange = (mode: 'cards' | 'table') => {
        setViewMode(mode);
        localStorage.setItem('teacher-students-view-mode', mode);
    };

    // Dialog states
    const [studentToRemove, setStudentToRemove] = useState<{ id: number; name: string } | null>(null);
    const [isRemoving, setIsRemoving] = useState(false);

    // Filter students based on search criteria
    const filteredStudents = students.filter((student) => {
        const matchesSearch =
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.nisn.includes(searchTerm) ||
            student.class.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesGender = selectedGender === 'all' || student.gender === selectedGender;
        const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus;

        return matchesSearch && matchesGender && matchesStatus;
    });

    const handleRemoveFromClass = (studentId: number, studentName: string) => {
        setStudentToRemove({ id: studentId, name: studentName });
    };

    const confirmRemoveStudent = () => {
        if (!studentToRemove) return;

        setIsRemoving(true);
        router.delete(route('teacher.students.destroy', studentToRemove.id), {
            onSuccess: () => {
                toast({
                    title: t('teacher_students.messages.remove_success'),
                    description: t('teacher_students.messages.remove_success_desc'),
                    variant: 'success',
                });
                setStudentToRemove(null);
            },
            onError: () => {
                toast({
                    title: t('teacher_students.messages.remove_error'),
                    description: t('teacher_students.messages.remove_error_desc'),
                    variant: 'destructive',
                });
            },
            onFinish: () => {
                setIsRemoving(false);
            },
        });
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'active':
                return 'default';
            case 'graduated':
                return 'secondary';
            case 'transferred':
                return 'outline';
            case 'dropped':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

    const handleImageError = useCallback((photoUrl: string) => {
        setFailedImages((prev) => new Set(prev).add(photoUrl));
    }, []);

    const shouldShowDefaultAvatar = (photo: string | null) => {
        if (!photo || photo.trim() === '') {
            return true;
        }
        return failedImages.has(photo);
    };

    const renderTableView = useCallback(
        () => (
            <StudentsTable
                students={filteredStudents}
                getStatusBadgeVariant={getStatusBadgeVariant}
                shouldShowDefaultAvatar={shouldShowDefaultAvatar}
                onImageError={handleImageError}
                onRemove={handleRemoveFromClass}
            />
        ),
        [filteredStudents, getStatusBadgeVariant, shouldShowDefaultAvatar, handleImageError, handleRemoveFromClass],
    );

    const renderCardView = () => (
        <div className="grid gap-4 pb-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredStudents.map((student) => (
                <Card key={student.id} className="space-y-2 overflow-hidden p-3 transition-shadow hover:shadow-lg">
                    {/* Student Header */}
                    <div className="flex items-start gap-3">
                        {shouldShowDefaultAvatar(student.photo) ? (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                                <User className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                            </div>
                        ) : (
                            <img
                                src={student.photo || ''}
                                alt={student.name}
                                className="h-12 w-12 rounded-full object-cover"
                                onError={() => student.photo && handleImageError(student.photo)}
                            />
                        )}
                        <div className="min-w-0 flex-1">
                            <h3 className="truncate font-medium text-gray-900 dark:text-gray-100">{student.name}</h3>
                            <p className="text-xs text-gray-500">NISN: {student.nisn}</p>
                            <div className="mt-1 flex items-center gap-1">
                                <Badge variant={getStatusBadgeVariant(student.status)} className="text-xs">
                                    {t(`teacher_students.status.${student.status}`)}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Student Info */}
                    <div className="space-y-0.5 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex justify-between">
                            <span>{t('teacher_students.card_fields.class')}:</span>
                            <span className="font-medium">{student.class}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>{t('teacher_students.card_fields.gender')}:</span>
                            <span className="font-medium">{t(`teacher_students.gender.${student.gender}`)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>{t('teacher_students.card_fields.entry_year')}:</span>
                            <span className="font-medium">{student.entry_year}</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Link href={route('teacher.students.show', student.id)} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                                <Eye className="mr-1 h-3 w-3" />
                                {t('teacher_students.actions.view')}
                            </Button>
                        </Link>
                        <Link href={route('teacher.students.edit', student.id)} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                                <Edit className="mr-1 h-3 w-3" />
                                {t('teacher_students.actions.edit')}
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveFromClass(student.id, student.name)}
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                </Card>
            ))}
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Students - Homeroom Teacher" />

            <div className="space-y-6 px-4 sm:space-y-8 sm:px-6">
                {/* Header */}
                <div className="border-b border-gray-200 pb-4 sm:pb-6 dark:border-gray-700">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center sm:gap-0">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-gray-100">{t('teacher_students.title')}</h1>
                            <p className="mt-1 text-xs leading-relaxed text-gray-600 sm:mt-2 sm:text-sm dark:text-gray-400">
                                <span className="hidden sm:inline">{t('teacher_students.subtitle.full')}</span>
                                <span className="sm:hidden">{t('teacher_students.subtitle.short')}</span>
                            </p>
                        </div>
                        <div className="flex flex-shrink-0 gap-2">
                            <Link href={route('teacher.students.create')}>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('teacher_students.actions.add_student')}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
                    <Card className="p-3 sm:p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-400">
                                    {t('teacher_students.stats.total_students')}
                                </p>
                                <p className="mt-1 text-lg font-bold text-gray-900 sm:text-2xl dark:text-gray-100">{classStats.total_students}</p>
                            </div>
                            <Users className="h-6 w-6 text-blue-600 sm:h-8 sm:w-8" />
                        </div>
                    </Card>

                    <Card className="p-3 sm:p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-400">
                                    {t('teacher_students.stats.active')}
                                </p>
                                <p className="mt-1 text-lg font-bold text-green-600 sm:text-2xl">{classStats.active_students}</p>
                            </div>
                            <GraduationCap className="h-6 w-6 text-green-600 sm:h-8 sm:w-8" />
                        </div>
                    </Card>

                    <Card className="p-3 sm:p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-400">{t('teacher_students.stats.male')}</p>
                                <p className="mt-1 text-lg font-bold text-blue-600 sm:text-2xl">{classStats.male_students}</p>
                            </div>
                            <Users className="h-6 w-6 text-blue-600 sm:h-8 sm:w-8" />
                        </div>
                    </Card>

                    <Card className="p-3 sm:p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-400">
                                    {t('teacher_students.stats.female')}
                                </p>
                                <p className="mt-1 text-lg font-bold text-pink-600 sm:text-2xl">{classStats.female_students}</p>
                            </div>
                            <Users className="h-6 w-6 text-pink-600 sm:h-8 sm:w-8" />
                        </div>
                    </Card>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="relative">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder={t('teacher_students.filters.search_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <Select value={selectedGender} onValueChange={setSelectedGender}>
                        <SelectTrigger>
                            <SelectValue placeholder="All Genders" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('teacher_students.filters.all_genders')}</SelectItem>
                            <SelectItem value="male">{t('teacher_students.gender.male')}</SelectItem>
                            <SelectItem value="female">{t('teacher_students.gender.female')}</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger>
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('teacher_students.filters.all_status')}</SelectItem>
                            <SelectItem value="active">{t('teacher_students.status.active')}</SelectItem>
                            <SelectItem value="graduated">{t('teacher_students.status.graduated')}</SelectItem>
                            <SelectItem value="transferred">{t('teacher_students.status.transferred')}</SelectItem>
                            <SelectItem value="dropped">{t('teacher_students.status.dropped')}</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        {t('teacher_students.filters.showing_results', {
                            filtered: filteredStudents.length,
                            total: students.length,
                        })}
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            variant={viewMode === 'cards' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleViewModeChange('cards')}
                            className="px-3"
                        >
                            <Grid3X3 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'table' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleViewModeChange('table')}
                            className="px-3"
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Students Display */}
                {viewMode === 'cards' ? renderCardView() : renderTableView()}

                {/* Empty State */}
                {filteredStudents.length === 0 && (
                    <div className="py-12 text-center">
                        <Users className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                            {students.length === 0
                                ? t('teacher_students.empty_state.no_students_title')
                                : t('teacher_students.empty_state.no_results_title')}
                        </h3>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {students.length === 0
                                ? t('teacher_students.empty_state.no_students_desc')
                                : t('teacher_students.empty_state.no_results_desc')}
                        </p>
                        {students.length === 0 && (
                            <div className="mt-4">
                                <Link href={route('teacher.students.create')}>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        {t('teacher_students.actions.add_first_student')}
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* Remove Student Confirmation Dialog */}
                <ConfirmationDialog
                    open={studentToRemove !== null}
                    onOpenChange={() => setStudentToRemove(null)}
                    title={t('teacher_students.confirmation.remove_title')}
                    message={t('teacher_students.confirmation.remove_message', { name: studentToRemove?.name })}
                    confirmLabel={t('teacher_students.confirmation.remove_confirm')}
                    onConfirm={confirmRemoveStudent}
                    isLoading={isRemoving}
                />
            </div>
        </AppLayout>
    );
}
