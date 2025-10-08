import { Head, router } from '@inertiajs/react';
import { Building, Lightbulb, Users } from 'lucide-react';

import { ClassFormCard } from '@/components/admin/class/class-form-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useClassFormWithValidation } from '@/hooks/use-class-form-with-validation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Classes', href: '/admin/classes' },
    { title: 'Create Class', href: '/admin/classes/create' },
];

export default function CreateClass() {
    const { formData, errors, previewClassName, isSubmitting, isFormValid, handleInputChange, handleFieldBlur, handleSubmit, getFieldState } =
        useClassFormWithValidation({
            initialData: {
                grade_level: '',
                class_section: '',
                description: '',
                capacity: '40',
            },
            submitRoute: route('admin.classes.store'),
            isEdit: false,
        });

    const handleCancel = () => {
        router.visit(route('admin.classes.index'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create New Class" />

            <div className="space-y-8 px-4 sm:px-6 lg:px-8">
                {/* Enhanced Header */}
                <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6 sm:p-8 dark:border-blue-800 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-800">
                            <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-gray-100">Create New Class</h1>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Add a new class to organize students by grade and section</p>
                        </div>
                    </div>
                </div>

                <ClassFormCard
                    formData={formData}
                    errors={errors}
                    previewClassName={previewClassName}
                    isSubmitting={isSubmitting}
                    isFormValid={isFormValid}
                    isEdit={false}
                    getFieldState={getFieldState}
                    onInputChange={handleInputChange}
                    onFieldBlur={handleFieldBlur}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />

                {/* Enhanced Help Cards */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Naming Convention */}
                    <Card className="border-l-4 border-l-blue-500 shadow-md">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Lightbulb className="h-5 w-5 text-blue-600" />
                                Class Naming Convention
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Classes are automatically named by combining grade level and section:
                                </p>

                                <div className="grid grid-cols-1 gap-3">
                                    <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-950/30">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600 dark:bg-blue-800 dark:text-blue-400">
                                            7A
                                        </div>
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Grade 7, Section A</span>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-lg bg-indigo-50 p-3 dark:bg-indigo-950/30">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600 dark:bg-indigo-800 dark:text-indigo-400">
                                            8B
                                        </div>
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Grade 8, Section B</span>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-lg bg-purple-50 p-3 dark:bg-purple-950/30">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600 dark:bg-purple-800 dark:text-purple-400">
                                            9C
                                        </div>
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Grade 9, Section C</span>
                                    </div>
                                </div>

                                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                                    This naming system ensures consistency across the junior high school.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Best Practices */}
                    <Card className="border-l-4 border-l-green-500 shadow-md">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Users className="h-5 w-5 text-green-600" />
                                Best Practices
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-green-500"></div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Standard Capacity</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">Set capacity to 40 students per class maximum</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Clear Descriptions</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                Add helpful descriptions to identify class characteristics
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-purple-500"></div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Grade Organization</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                Create multiple sections (A, B, C) for each grade level
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
