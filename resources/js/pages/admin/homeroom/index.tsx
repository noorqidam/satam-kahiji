import { Head, router } from '@inertiajs/react';
import { GraduationCap, Plus, Trash2, UserCheck, Users, UserX } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { HomeroomDisplay } from '@/components/admin/homeroom/homeroom-display';
import { HomeroomViewToggle } from '@/components/admin/homeroom/homeroom-view-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDeleteDialog } from '@/hooks/use-delete-dialog';
import { useToast } from '@/hooks/use-toast';
import { useViewPreference } from '@/hooks/use-view-preference';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Teacher {
    id: number;
    name: string;
    position: string;
    division: string;
    homeroom_class: string | null;
    homeroom_students_count: number;
    user_email: string | null;
}

interface ClassStat {
    class: string;
    student_count: number;
    assigned_teacher: Teacher | null;
    has_teacher: boolean;
}

interface HomeroomIndexProps {
    teachers: Teacher[];
    classStats: ClassStat[];
    availableClasses: string[];
    unassignedClasses: string[];
    userRole: string;
}

export default function HomeroomIndex({ teachers, classStats, availableClasses, unassignedClasses }: HomeroomIndexProps) {
    const { t } = useTranslation();
    const { toast } = useToast();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('homeroom_management.breadcrumbs.admin_dashboard'), href: '/admin/dashboard' },
        { title: t('homeroom_management.breadcrumbs.homeroom_management'), href: '/admin/homeroom' },
    ];
    const [isAssigning, setIsAssigning] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<string>('');
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [showAssignDialog, setShowAssignDialog] = useState(false);
    const [viewMode, setViewMode] = useViewPreference('homeroom-management-view', 'card');

    const { dialogState, isDeleting, openDialog, closeDialog, confirmDelete } = useDeleteDialog();

    const handleAssignClass = () => {
        if (!selectedTeacher || !selectedClass) {
            toast({
                title: t('homeroom_management.messages.error'),
                description: t('homeroom_management.messages.select_both'),
                variant: 'destructive',
            });
            return;
        }

        setIsAssigning(true);

        router.post(
            route('admin.homeroom.assign-class'),
            {
                staff_id: selectedTeacher,
                class: selectedClass,
            },
            {
                onSuccess: () => {
                    toast({
                        title: t('homeroom_management.messages.success'),
                        description: t('homeroom_management.messages.assignment_success'),
                        variant: 'success',
                    });
                    setShowAssignDialog(false);
                    setSelectedTeacher('');
                    setSelectedClass('');
                },
                onError: (errors) => {
                    toast({
                        title: t('homeroom_management.messages.error'),
                        description: errors.class || t('homeroom_management.messages.assignment_error'),
                        variant: 'destructive',
                    });
                },
                onFinish: () => {
                    setIsAssigning(false);
                },
            },
        );
    };

    const handleRemoveAssignment = (teacherId: number, teacherName: string, className: string) => {
        const itemName = t('homeroom_management.confirmation.assignment_description', {
            teacherName,
            className,
        });
        openDialog('single', teacherId, itemName);
    };

    const handleConfirmRemoval = () => {
        if (dialogState.itemId) {
            confirmDelete(
                route('admin.homeroom.remove-assignment', dialogState.itemId),
                undefined,
                undefined,
                t('homeroom_management.messages.removal_success'),
                t('homeroom_management.messages.removal_error'),
            );
        }
    };

    const availableTeachers = teachers.filter((teacher) => !teacher.homeroom_class);
    const assignedTeachers = teachers.filter((teacher) => teacher.homeroom_class);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('homeroom_management.page_title')} />

            <div className="space-y-6 px-4 sm:space-y-8 sm:px-6">
                {/* Header */}
                <div className="border-b border-gray-200 pb-4 sm:pb-6 dark:border-gray-700">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center sm:gap-0">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-gray-100">
                                {t('homeroom_management.header.title')}
                            </h1>
                            <p className="mt-1 text-xs leading-relaxed text-gray-600 sm:mt-2 sm:text-sm dark:text-gray-400">
                                {t('homeroom_management.header.description')}
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-shrink-0 sm:flex-row sm:items-center">
                            <HomeroomViewToggle view={viewMode} onViewChange={setViewMode} />
                            <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        {t('homeroom_management.actions.assign_homeroom')}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{t('homeroom_management.dialog.assign_title')}</DialogTitle>
                                        <DialogDescription>{t('homeroom_management.dialog.assign_description')}</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium">{t('homeroom_management.dialog.select_teacher')}</label>
                                            <Select value={selectedTeacher || undefined} onValueChange={setSelectedTeacher}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('homeroom_management.dialog.choose_teacher')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableTeachers.length > 0 ? (
                                                        availableTeachers.map((teacher) => (
                                                            <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                                                {teacher.name} ({teacher.position})
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <div className="px-2 py-1 text-sm text-gray-500">
                                                            {t('homeroom_management.dialog.no_available_teachers')}
                                                        </div>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium">{t('homeroom_management.dialog.select_class')}</label>
                                            <Select value={selectedClass || undefined} onValueChange={setSelectedClass}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('homeroom_management.dialog.choose_class')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {unassignedClasses.length > 0 ? (
                                                        unassignedClasses.map((className) => (
                                                            <SelectItem key={className} value={className}>
                                                                {className}
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <div className="px-2 py-1 text-sm text-gray-500">
                                                            {t('homeroom_management.dialog.no_unassigned_classes')}
                                                        </div>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex justify-end gap-3">
                                            <Button variant="outline" onClick={() => setShowAssignDialog(false)} disabled={isAssigning}>
                                                {t('homeroom_management.actions.cancel')}
                                            </Button>
                                            <Button
                                                onClick={handleAssignClass}
                                                disabled={
                                                    isAssigning ||
                                                    !selectedTeacher ||
                                                    !selectedClass ||
                                                    availableTeachers.length === 0 ||
                                                    unassignedClasses.length === 0
                                                }
                                            >
                                                {isAssigning
                                                    ? t('homeroom_management.actions.assigning')
                                                    : availableTeachers.length === 0
                                                      ? t('homeroom_management.actions.no_teachers_available')
                                                      : unassignedClasses.length === 0
                                                        ? t('homeroom_management.actions.no_classes_available')
                                                        : t('homeroom_management.actions.assign')}
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
                    <Card>
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-400">
                                        {t('homeroom_management.statistics.total_classes')}
                                    </p>
                                    <p className="mt-1 text-lg font-bold text-gray-900 sm:text-2xl dark:text-gray-100">{availableClasses.length}</p>
                                </div>
                                <GraduationCap className="h-6 w-6 text-blue-600 sm:h-8 sm:w-8" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-400">
                                        {t('homeroom_management.statistics.assigned_classes')}
                                    </p>
                                    <p className="mt-1 text-lg font-bold text-green-600 sm:text-2xl">
                                        {classStats.filter((c) => c.has_teacher).length}
                                    </p>
                                </div>
                                <UserCheck className="h-6 w-6 text-green-600 sm:h-8 sm:w-8" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-400">
                                        {t('homeroom_management.statistics.unassigned')}
                                    </p>
                                    <p className="mt-1 text-lg font-bold text-red-600 sm:text-2xl">{unassignedClasses.length}</p>
                                </div>
                                <UserX className="h-6 w-6 text-red-600 sm:h-8 sm:w-8" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-400">
                                        {t('homeroom_management.statistics.total_teachers')}
                                    </p>
                                    <p className="mt-1 text-lg font-bold text-gray-900 sm:text-2xl dark:text-gray-100">{teachers.length}</p>
                                </div>
                                <Users className="h-6 w-6 text-purple-600 sm:h-8 sm:w-8" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Class Assignments */}
                {viewMode === 'card' ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('homeroom_management.sections.class_assignments')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <HomeroomDisplay classStats={classStats} view={viewMode} onRemoveAssignment={handleRemoveAssignment} />
                        </CardContent>
                    </Card>
                ) : (
                    <HomeroomDisplay classStats={classStats} view={viewMode} onRemoveAssignment={handleRemoveAssignment} />
                )}

                {/* Teachers List */}
                <div className="grid gap-6 pb-3 lg:grid-cols-2">
                    {/* Assigned Teachers */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {t('homeroom_management.sections.assigned_teachers')} ({assignedTeachers.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {assignedTeachers.length > 0 ? (
                                <div className="space-y-3">
                                    {assignedTeachers.map((teacher) => (
                                        <div
                                            key={teacher.id}
                                            className="flex items-center justify-between rounded-lg bg-green-50 p-3 dark:bg-green-900/20"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-medium">{teacher.name}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {t('homeroom_management.teacher_info.class')}: {teacher.homeroom_class} •{' '}
                                                    {teacher.homeroom_students_count} {t('homeroom_management.teacher_info.students')}
                                                </p>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleRemoveAssignment(teacher.id, teacher.name, teacher.homeroom_class!)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="py-4 text-center text-gray-500">{t('homeroom_management.empty_states.no_assigned_teachers')}</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Available Teachers */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {t('homeroom_management.sections.available_teachers')} ({availableTeachers.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {availableTeachers.length > 0 ? (
                                <div className="space-y-3">
                                    {availableTeachers.map((teacher) => (
                                        <div
                                            key={teacher.id}
                                            className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-medium">{teacher.name}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {teacher.position} • {teacher.division}
                                                </p>
                                            </div>
                                            <Badge variant="secondary">{t('homeroom_management.teacher_info.available')}</Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="py-4 text-center text-gray-500">{t('homeroom_management.empty_states.all_teachers_assigned')}</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Remove Assignment Confirmation Dialog */}
            <DeleteConfirmationDialog
                open={dialogState.open}
                onOpenChange={(open) => !open && closeDialog()}
                title={t('homeroom_management.confirmation.remove_title')}
                description={t('homeroom_management.confirmation.remove_description', { itemName: dialogState.itemName })}
                itemName={dialogState.itemName}
                itemType={t('homeroom_management.confirmation.assignment')}
                onConfirm={handleConfirmRemoval}
                isLoading={isDeleting}
                cancelText={t('common.cancel')}
                deleteText={t('common.delete')}
                deletingText={t('common.deleting')}
            />
        </AppLayout>
    );
}
