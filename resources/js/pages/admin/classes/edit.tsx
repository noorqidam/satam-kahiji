import { Head, router } from '@inertiajs/react';
import { AlertTriangle, BookOpen, Building, GraduationCap, Info, Shield, TrendingUp, UserCheck, Users } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useClassFormWithValidation } from '@/hooks/use-class-form-with-validation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { SchoolClass } from '@/types/class';

interface EditClassProps {
    class: SchoolClass;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Classes', href: '/admin/classes' },
    { title: 'Edit Class', href: '' },
];

export default function EditClass({ class: schoolClass }: EditClassProps) {
    const { formData, errors, previewClassName, isSubmitting, isFormValid, handleInputChange, handleFieldBlur, handleSubmit, getFieldState } =
        useClassFormWithValidation({
            initialData: {
                grade_level: schoolClass.grade_level,
                class_section: schoolClass.class_section,
                description: schoolClass.description || '',
                capacity: schoolClass.capacity.toString(),
            },
            submitRoute: route('admin.classes.update', schoolClass.id),
            isEdit: true,
            currentStudentCount: schoolClass.student_count,
        });

    const handleCancel = () => {
        router.visit(route('admin.classes.index'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Class ${schoolClass.name}`} />

            <div className="w-full max-w-none space-y-6 px-4 sm:px-6 lg:px-8">
                {/* Modern Header with Gradient */}
                <div className="relative overflow-hidden rounded-xl border-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 shadow-xl sm:rounded-2xl sm:p-8 lg:p-10 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
                    <div className="bg-grid-slate-100 dark:bg-grid-slate-700/25 absolute inset-0 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>
                    <div className="relative flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-4 sm:gap-6">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg sm:h-16 sm:w-16 lg:h-20 lg:w-20">
                                <GraduationCap className="h-7 w-7 text-white sm:h-8 sm:w-8 lg:h-10 lg:w-10" />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl dark:text-white">
                                    Edit Class {schoolClass.name}
                                </h1>
                                <p className="max-w-2xl text-base text-gray-600 sm:text-lg dark:text-gray-300">
                                    Update class information, capacity, and manage student enrollment settings
                                </p>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        <span>
                                            {schoolClass.student_count}/{schoolClass.capacity} students
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Building className="h-4 w-4" />
                                        <span>Grade {schoolClass.grade_level}</span>
                                    </div>
                                    {schoolClass.homeroom_teacher && (
                                        <div className="flex items-center gap-1">
                                            <UserCheck className="h-4 w-4" />
                                            <span>{schoolClass.homeroom_teacher.name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            {schoolClass.is_full ? (
                                <div className="inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-800 dark:bg-red-900/50 dark:text-red-200">
                                    <AlertTriangle className="h-4 w-4" />
                                    Class Full
                                </div>
                            ) : (
                                <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800 dark:bg-green-900/50 dark:text-green-200">
                                    <TrendingUp className="h-4 w-4" />
                                    {schoolClass.available_capacity} spots available
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
                        {/* Main Content - 2/3 width */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Class Information Card */}
                            <Card className="overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50 shadow-xl dark:from-gray-900 dark:to-gray-800">
                                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 pb-3 text-white">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
                                            <Building className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl sm:text-2xl">Class Information</CardTitle>
                                            <p className="text-blue-100">Update basic class details and settings</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <div className="p-4 sm:p-6">
                                    <div className="space-y-6">
                                        {/* Grade and Section */}
                                        <div className="grid gap-6 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                    <GraduationCap className="h-4 w-4 text-blue-600" />
                                                    Grade Level *
                                                </label>
                                                <select
                                                    value={formData.grade_level || ''}
                                                    onChange={(e) => handleInputChange('grade_level', e.target.value)}
                                                    onBlur={() => handleFieldBlur('grade_level')}
                                                    className={`h-12 w-full rounded-lg border-2 px-4 transition-colors ${
                                                        getFieldState('grade_level').showError
                                                            ? 'border-red-500 focus:border-red-500'
                                                            : getFieldState('grade_level').isTouched &&
                                                                !getFieldState('grade_level').hasError &&
                                                                formData.grade_level
                                                              ? 'border-green-500 focus:border-green-600'
                                                              : 'border-gray-300 focus:border-blue-500 dark:border-gray-600'
                                                    } bg-white dark:bg-gray-800`}
                                                >
                                                    <option value="">Choose grade level</option>
                                                    <option value="7">Grade 7</option>
                                                    <option value="8">Grade 8</option>
                                                    <option value="9">Grade 9</option>
                                                </select>
                                                {getFieldState('grade_level').showError && (
                                                    <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        {getFieldState('grade_level').error}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                    <Building className="h-4 w-4 text-green-600" />
                                                    Class Section *
                                                </label>
                                                <select
                                                    value={formData.class_section || ''}
                                                    onChange={(e) => handleInputChange('class_section', e.target.value)}
                                                    onBlur={() => handleFieldBlur('class_section')}
                                                    className={`h-12 w-full rounded-lg border-2 px-4 transition-colors ${
                                                        getFieldState('class_section').showError
                                                            ? 'border-red-500 focus:border-red-500'
                                                            : getFieldState('class_section').isTouched &&
                                                                !getFieldState('class_section').hasError &&
                                                                formData.class_section
                                                              ? 'border-green-500 focus:border-green-600'
                                                              : 'border-gray-300 focus:border-blue-500 dark:border-gray-600'
                                                    } bg-white dark:bg-gray-800`}
                                                >
                                                    <option value="">Choose section</option>
                                                    {['A', 'B', 'C', 'D', 'E', 'F'].map((section) => (
                                                        <option key={section} value={section}>
                                                            Section {section}
                                                        </option>
                                                    ))}
                                                </select>
                                                {getFieldState('class_section').showError && (
                                                    <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        {getFieldState('class_section').error}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Capacity */}
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                <Users className="h-4 w-4 text-purple-600" />
                                                Class Capacity *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="40"
                                                    value={formData.capacity}
                                                    onChange={(e) => handleInputChange('capacity', e.target.value)}
                                                    onBlur={() => handleFieldBlur('capacity')}
                                                    placeholder="Maximum students (e.g., 40)"
                                                    className={`h-12 w-full rounded-lg border-2 px-4 pr-20 transition-colors ${
                                                        getFieldState('capacity').showError
                                                            ? 'border-red-500 focus:border-red-500'
                                                            : getFieldState('capacity').isTouched &&
                                                                !getFieldState('capacity').hasError &&
                                                                formData.capacity
                                                              ? 'border-green-500 focus:border-green-600'
                                                              : 'border-gray-300 focus:border-blue-500 dark:border-gray-600'
                                                    } bg-white dark:bg-gray-800`}
                                                />
                                                <div className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 transform">
                                                    <span className="text-sm font-medium text-gray-500">students</span>
                                                </div>
                                            </div>
                                            {getFieldState('capacity').showError && (
                                                <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    {getFieldState('capacity').error}
                                                </p>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                <BookOpen className="h-4 w-4 text-indigo-600" />
                                                Description (Optional)
                                            </label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => handleInputChange('description', e.target.value)}
                                                onBlur={() => handleFieldBlur('description')}
                                                placeholder="Add notes about this class... (e.g., 'Advanced science curriculum', 'Arts-focused program')"
                                                rows={4}
                                                className={`w-full resize-none rounded-lg border-2 px-4 py-3 transition-colors ${
                                                    getFieldState('description').showError
                                                        ? 'border-red-500 focus:border-red-500'
                                                        : getFieldState('description').isTouched && !getFieldState('description').hasError
                                                          ? 'border-green-500 focus:border-green-600'
                                                          : 'border-gray-300 focus:border-blue-500 dark:border-gray-600'
                                                } bg-white dark:bg-gray-800`}
                                            />
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span>Help students and teachers understand what makes this class unique</span>
                                                <span>{formData.description?.length || 0}/500</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Sidebar - 1/3 width */}
                        <div className="space-y-6">
                            {/* Live Preview */}
                            <Card className="overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50 shadow-xl dark:from-gray-900 dark:to-gray-800">
                                <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 pb-3 text-white">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
                                            <Info className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">Live Preview</CardTitle>
                                            <p className="text-emerald-100">Real-time class name</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <div className="p-4">
                                    <div className="space-y-4">
                                        <div className="rounded-lg bg-gray-100 p-4 text-center dark:bg-gray-700">
                                            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">Current Class Name:</p>
                                            <p className="text-xl font-bold text-gray-900 dark:text-white">{schoolClass.name}</p>
                                        </div>
                                        {previewClassName && previewClassName !== schoolClass.name && (
                                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center dark:border-blue-700 dark:bg-blue-900/50">
                                                <p className="mb-2 text-sm text-blue-600 dark:text-blue-400">Preview New Name:</p>
                                                <p className="text-xl font-bold text-blue-800 dark:text-blue-200">{previewClassName}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>

                            {/* Current Information */}
                            <Card className="overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50 shadow-xl dark:from-gray-900 dark:to-gray-800">
                                <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 pb-3 text-white">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
                                            <Users className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">Class Details</CardTitle>
                                            <p className="text-amber-100">Current information</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <div className="space-y-4 p-4">
                                    <div className="grid grid-cols-1 gap-3 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Grade Level:</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">Grade {schoolClass.grade_level}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Section:</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">{schoolClass.class_section}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Current Capacity:</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">{schoolClass.capacity}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Enrolled:</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">{schoolClass.student_count}</span>
                                        </div>
                                    </div>

                                    {schoolClass.homeroom_teacher && (
                                        <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
                                            <div className="flex items-start gap-2">
                                                <UserCheck className="mt-0.5 h-4 w-4 text-gray-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {schoolClass.homeroom_teacher.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{schoolClass.homeroom_teacher.position}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            {/* Action Buttons */}
                            <Card className="overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50 p-4 shadow-xl dark:from-gray-900 dark:to-gray-800">
                                <div className="space-y-3">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !isFormValid}
                                        className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 font-medium text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <Building className="h-4 w-4" />
                                                Update Class
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="h-12 w-full rounded-lg border-2 border-gray-300 font-medium text-gray-700 transition-colors duration-200 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500"
                                    >
                                        Cancel Changes
                                    </button>
                                </div>
                            </Card>
                        </div>
                    </div>
                </form>

                {/* Important Information */}
                <div className="space-y-4">
                    <Alert className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 shadow-sm dark:from-amber-950/20 dark:to-orange-950/20">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        <AlertDescription className="text-amber-800 dark:text-amber-200">
                            <div className="space-y-3">
                                <p className="text-base font-semibold">⚠️ Important: Changes will affect the following:</p>
                                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
                                    <div className="flex items-center gap-2 rounded-md bg-white p-2 dark:bg-amber-950">
                                        <Users className="h-4 w-4 text-amber-600" />
                                        <span>All {schoolClass.student_count} students in this class</span>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-md bg-white p-2 dark:bg-amber-950">
                                        <Shield className="h-4 w-4 text-amber-600" />
                                        <span>Homeroom teacher assignments</span>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-md bg-white p-2 dark:bg-amber-950">
                                        <BookOpen className="h-4 w-4 text-amber-600" />
                                        <span>Historical records & reports</span>
                                    </div>
                                </div>
                                <p className="mt-3 rounded-lg bg-white p-3 text-sm font-medium dark:bg-amber-950">
                                    📝 This action cannot be undone. Please review all changes carefully before saving.
                                </p>
                            </div>
                        </AlertDescription>
                    </Alert>

                    {schoolClass.student_count > 0 && (
                        <Alert className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm dark:from-blue-950/20 dark:to-indigo-950/20">
                            <Info className="h-5 w-5 text-blue-600" />
                            <AlertDescription className="text-blue-800 dark:text-blue-200">
                                <div className="space-y-3">
                                    <p className="text-base font-semibold">📊 Current Enrollment: {schoolClass.student_count} students</p>
                                    <div className="rounded-lg bg-white p-3 dark:bg-blue-950">
                                        <p className="text-sm">
                                            When changing capacity, ensure the new limit accommodates all currently enrolled students. The minimum
                                            capacity should be at least <strong>{schoolClass.student_count}</strong>.
                                        </p>
                                    </div>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
