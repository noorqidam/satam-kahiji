import { Head, Link } from '@inertiajs/react';
import { BookOpen, Building, GraduationCap, Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

import { ClassDisplay } from '@/components/admin/class/class-display';
import { ClassViewToggle } from '@/components/admin/class/class-view-toggle';
import { Button } from '@/components/ui/button';
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';
import { useDeleteDialog } from '@/hooks/use-delete-dialog';
import { useToast } from '@/hooks/use-toast';
import { useViewPreference } from '@/hooks/use-view-preference';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { ClassStats, SchoolClass } from '@/types/class';

interface ClassIndexProps {
    classes: SchoolClass[];
    classesByGrade: Record<string, SchoolClass[]>;
    stats: ClassStats;
    userRole: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Classes', href: '/admin/classes' },
];

export default function ClassIndex({ classes, classesByGrade, stats }: ClassIndexProps) {
    const { toast } = useToast();
    const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
    const [viewMode, setViewMode] = useViewPreference('class-management-view', 'card');

    const { dialogState, isDeleting, openDialog, closeDialog, confirmDelete } = useDeleteDialog({
        onSuccess: () => {
            if (dialogState.type === 'bulk') {
                setSelectedClasses([]);
            }
        },
    });

    const handleDelete = (classId: number, className: string) => {
        openDialog('single', classId, className);
    };

    const handleConfirmDelete = () => {
        if (dialogState.type === 'single' && dialogState.itemId) {
            confirmDelete(
                route('admin.classes.destroy', dialogState.itemId),
                undefined,
                undefined,
                `Class ${dialogState.itemName} deleted successfully`,
                'Failed to delete class',
            );
        } else if (dialogState.type === 'bulk') {
            confirmDelete(
                '',
                route('admin.classes.bulk-destroy'),
                { ids: selectedClasses },
                'Selected classes deleted successfully',
                'Failed to delete selected classes',
            );
        }
    };

    const handleBulkDelete = () => {
        if (selectedClasses.length === 0) {
            toast({
                title: 'Error',
                description: 'Please select classes to delete',
                variant: 'destructive',
            });
            return;
        }

        openDialog('bulk');
    };

    const toggleClassSelection = (classId: number) => {
        setSelectedClasses((prev) => (prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]));
    };

    const toggleGradeSelection = (gradeClassIds: number[]) => {
        const allSelected = gradeClassIds.every((id) => selectedClasses.includes(id));
        if (allSelected) {
            setSelectedClasses((prev) => prev.filter((id) => !gradeClassIds.includes(id)));
        } else {
            setSelectedClasses((prev) => [...new Set([...prev, ...gradeClassIds])]);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Class Management" />

            <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 xl:px-10">
                {/* Enhanced Header */}
                <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6 sm:p-8 dark:border-blue-800 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30">
                    <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                        <div className="min-w-0 flex-1">
                            <div className="mb-3 flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-800">
                                    <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-gray-100">Class Management</h1>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Organize and manage junior high school classes</p>
                                </div>
                            </div>

                            {/* Quick Stats Summary */}
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                    <Building className="h-4 w-4" />
                                    <span className="font-medium">{stats.total_classes} Total Classes</span>
                                </div>
                                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                                    <GraduationCap className="h-4 w-4" />
                                    <span className="font-medium">{stats.total_students} Students</span>
                                </div>
                                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                                    <Users className="h-4 w-4" />
                                    <span className="font-medium">{stats.classes_with_teachers} With Teachers</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Controls */}
                        <div className="flex flex-col gap-3 sm:flex-row lg:flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <ClassViewToggle view={viewMode} onViewChange={setViewMode} />
                            </div>

                            <div className="flex gap-2">
                                {selectedClasses.length > 0 && (
                                    <Button variant="destructive" onClick={handleBulkDelete} className="flex-1 sm:flex-none" size="sm">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete ({selectedClasses.length})
                                    </Button>
                                )}
                                <Link href={route('admin.classes.create')} className="flex-1 sm:flex-none">
                                    <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg hover:from-blue-700 hover:to-indigo-700">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Class
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Statistics */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Classes</p>
                                <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total_classes}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/50">
                                <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Classes</p>
                                <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">{stats.active_classes}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 dark:bg-green-900/50">
                                <GraduationCap className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">With Teachers</p>
                                <p className="mt-1 text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.classes_with_teachers}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-900/50">
                                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Capacity</p>
                                <p className="mt-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.total_capacity}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/50">
                                <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
                                <p className="mt-1 text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.total_students}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-900/50">
                                <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Classes by Grade Level */}
                <div className="space-y-8">
                    {Object.entries(classesByGrade).map(([gradeLevel, gradeClasses]) => (
                        <div
                            key={gradeLevel}
                            className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
                        >
                            <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 dark:border-gray-600 dark:from-gray-700 dark:to-slate-700">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                                            <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Grade {gradeLevel}</h2>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {gradeClasses.length} {gradeClasses.length === 1 ? 'class' : 'classes'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => toggleGradeSelection(gradeClasses.map((c) => c.id))}
                                            className="text-xs"
                                        >
                                            {gradeClasses.every((c) => selectedClasses.includes(c.id)) ? 'Deselect All' : 'Select All'}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <ClassDisplay
                                    gradeClasses={gradeClasses}
                                    selectedClasses={selectedClasses}
                                    view={viewMode}
                                    onToggleSelection={toggleClassSelection}
                                    onDelete={handleDelete}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Enhanced Empty State */}
                {classes.length === 0 && (
                    <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-600 dark:bg-gray-800">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/50">
                            <Building className="h-10 w-10 text-blue-500 dark:text-blue-400" />
                        </div>
                        <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">No classes created yet</h3>
                        <p className="mx-auto mb-8 max-w-md text-gray-600 dark:text-gray-400">
                            Get started by creating your first class. Classes help organize students by grade level and section.
                        </p>
                        <div className="flex flex-col justify-center gap-3 sm:flex-row">
                            <Link href={route('admin.classes.create')}>
                                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg hover:from-blue-700 hover:to-indigo-700">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Your First Class
                                </Button>
                            </Link>
                        </div>

                        {/* Quick tips */}
                        <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-700">
                            <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-gray-100">Quick Tips:</h4>
                            <div className="grid grid-cols-1 gap-4 text-sm text-gray-600 sm:grid-cols-3 dark:text-gray-400">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                    <span>Classes are named like "7A", "8B"</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    <span>Set capacity for each class</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                                    <span>Assign homeroom teachers</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmationDialog
                open={dialogState.open}
                onOpenChange={(open) => !open && closeDialog()}
                title={dialogState.type === 'single' ? 'Delete Class' : 'Delete Classes'}
                description={
                    dialogState.type === 'single' && dialogState.itemName
                        ? `Are you sure you want to delete class "${dialogState.itemName}"? This will remove all associated data and cannot be undone.`
                        : `Are you sure you want to delete ${selectedClasses.length} selected classes? This will remove all associated data and cannot be undone.`
                }
                itemName={dialogState.type === 'single' ? dialogState.itemName : undefined}
                itemType={dialogState.type === 'single' ? 'class' : 'classes'}
                onConfirm={handleConfirmDelete}
                isLoading={isDeleting}
            />
        </AppLayout>
    );
}
