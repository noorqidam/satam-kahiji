import { AlertCircle, CheckCircle2, Eye, FileText, Hash, Save, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { ClassFormData, ValidationErrors } from '@/schemas/class-validation';
import { CLASS_SECTIONS, GRADE_LEVELS } from '@/utils/class-utils';

interface ClassFormCardProps {
    formData: ClassFormData;
    errors: ValidationErrors;
    previewClassName: string;
    isSubmitting: boolean;
    isFormValid: boolean;
    currentClassName?: string;
    isEdit?: boolean;
    getFieldState?: (field: keyof ClassFormData) => {
        hasError: boolean;
        isTouched: boolean;
        showError: boolean;
        error?: string;
    };
    onInputChange: (field: keyof ClassFormData, value: string | boolean) => void;
    onFieldBlur?: (field: keyof ClassFormData) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
}

export function ClassFormCard({
    formData,
    errors,
    previewClassName,
    isSubmitting,
    isFormValid,
    currentClassName,
    isEdit = false,
    getFieldState,
    onInputChange,
    onFieldBlur,
    onSubmit,
    onCancel,
}: ClassFormCardProps) {
    const actionText = isEdit ? 'Update' : 'Create';
    const loadingText = isEdit ? 'Updating...' : 'Creating...';

    // Get field states for enhanced validation feedback
    const gradeFieldState = getFieldState?.('grade_level') || {
        hasError: Boolean(errors.grade_level),
        isTouched: false,
        showError: Boolean(errors.grade_level),
        error: errors.grade_level,
    };
    const sectionFieldState = getFieldState?.('class_section') || {
        hasError: Boolean(errors.class_section),
        isTouched: false,
        showError: Boolean(errors.class_section),
        error: errors.class_section,
    };
    const capacityFieldState = getFieldState?.('capacity') || {
        hasError: Boolean(errors.capacity),
        isTouched: false,
        showError: Boolean(errors.capacity),
        error: errors.capacity,
    };
    const descriptionFieldState = getFieldState?.('description') || {
        hasError: Boolean(errors.description),
        isTouched: false,
        showError: Boolean(errors.description),
        error: errors.description,
    };

    return (
        <form onSubmit={onSubmit} className="w-full">
            <Card className="border-2 border-gray-200 shadow-lg dark:border-gray-700">
                <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800">
                    <CardTitle className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Class Information</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Configure class details and settings</p>
                            </div>
                        </div>

                        {/* Enhanced Preview Section */}
                        <div className="flex flex-col gap-2 sm:flex-row">
                            {isEdit && currentClassName && (
                                <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 dark:bg-gray-700">
                                    <Hash className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Current: {currentClassName}</span>
                                </div>
                            )}
                            {previewClassName && (!isEdit || previewClassName !== currentClassName) && (
                                <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 dark:border-blue-700 dark:bg-blue-900/50">
                                    <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    <span className="text-sm font-bold text-blue-700 dark:text-blue-300">Preview: {previewClassName}</span>
                                </div>
                            )}
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                    {/* Grade and Section Selection */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="grade_level" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                <Hash className="h-4 w-4 text-blue-600" />
                                Grade Level *
                            </Label>
                            <Select value={formData.grade_level || undefined} onValueChange={(value) => onInputChange('grade_level', value)}>
                                <SelectTrigger
                                    className={`h-12 border-2 transition-colors ${
                                        gradeFieldState.showError
                                            ? 'border-red-500 focus:border-red-500'
                                            : gradeFieldState.isTouched && !gradeFieldState.hasError && formData.grade_level
                                              ? 'border-green-500 focus:border-green-600'
                                              : 'border-gray-200 focus:border-blue-500 dark:border-gray-600'
                                    }`}
                                    onBlur={() => onFieldBlur?.('grade_level')}
                                >
                                    <SelectValue placeholder="Choose grade level" />
                                </SelectTrigger>
                                <SelectContent>
                                    {GRADE_LEVELS.map((grade) => (
                                        <SelectItem key={grade.value} value={grade.value} className="h-10">
                                            {grade.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {gradeFieldState.showError && (
                                <p className="mt-2 flex items-center gap-1 text-xs text-red-600">
                                    <AlertCircle className="h-3 w-3" />
                                    {gradeFieldState.error}
                                </p>
                            )}
                            {gradeFieldState.isTouched && !gradeFieldState.hasError && formData.grade_level && (
                                <p className="mt-2 flex items-center gap-1 text-xs text-green-600">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Valid grade level selected
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="class_section" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                <FileText className="h-4 w-4 text-green-600" />
                                Class Section *
                            </Label>
                            <Select value={formData.class_section || undefined} onValueChange={(value) => onInputChange('class_section', value)}>
                                <SelectTrigger
                                    className={`h-12 border-2 transition-colors ${
                                        sectionFieldState.showError
                                            ? 'border-red-500 focus:border-red-500'
                                            : sectionFieldState.isTouched && !sectionFieldState.hasError && formData.class_section
                                              ? 'border-green-500 focus:border-green-600'
                                              : 'border-gray-200 focus:border-blue-500 dark:border-gray-600'
                                    }`}
                                    onBlur={() => onFieldBlur?.('class_section')}
                                >
                                    <SelectValue placeholder="Choose section" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CLASS_SECTIONS.map((section) => (
                                        <SelectItem key={section} value={section} className="h-10">
                                            Section {section}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {sectionFieldState.showError && (
                                <p className="mt-2 flex items-center gap-1 text-xs text-red-600">
                                    <AlertCircle className="h-3 w-3" />
                                    {sectionFieldState.error}
                                </p>
                            )}
                            {sectionFieldState.isTouched && !sectionFieldState.hasError && formData.class_section && (
                                <p className="mt-2 flex items-center gap-1 text-xs text-green-600">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Valid section selected
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Capacity Input */}
                    <div className="space-y-2">
                        <Label htmlFor="capacity" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                            <Users className="h-4 w-4 text-purple-600" />
                            Class Capacity *
                        </Label>
                        <div className="relative">
                            <Input
                                id="capacity"
                                type="number"
                                min="1"
                                max="40"
                                value={formData.capacity}
                                onChange={(e) => onInputChange('capacity', e.target.value)}
                                onBlur={() => onFieldBlur?.('capacity')}
                                placeholder="Maximum students (e.g., 40)"
                                className={`h-12 border-2 pr-20 pl-4 transition-colors ${
                                    capacityFieldState.showError
                                        ? 'border-red-500 focus:border-red-500'
                                        : capacityFieldState.isTouched && !capacityFieldState.hasError && formData.capacity
                                          ? 'border-green-500 focus:border-green-600'
                                          : 'border-gray-200 focus:border-blue-500 dark:border-gray-600'
                                }`}
                                required
                            />
                            <div className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 transform">
                                <span className="text-sm font-medium text-gray-500">students</span>
                            </div>
                        </div>
                        {capacityFieldState.showError && (
                            <p className="mt-2 flex items-center gap-1 text-xs text-red-600">
                                <AlertCircle className="h-3 w-3" />
                                {capacityFieldState.error}
                            </p>
                        )}
                        {capacityFieldState.isTouched && !capacityFieldState.hasError && formData.capacity && (
                            <p className="mt-2 flex items-center gap-1 text-xs text-green-600">
                                <CheckCircle2 className="h-3 w-3" />
                                Valid capacity entered
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                            <FileText className="h-4 w-4 text-indigo-600" />
                            Description (Optional)
                        </Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => onInputChange('description', e.target.value)}
                            onBlur={() => onFieldBlur?.('description')}
                            placeholder="Add notes about this class... (e.g., 'Advanced science curriculum', 'Arts-focused program', 'Regular academic track')"
                            rows={4}
                            className={`resize-none border-2 transition-colors ${
                                descriptionFieldState.showError
                                    ? 'border-red-500 focus:border-red-500'
                                    : descriptionFieldState.isTouched && !descriptionFieldState.hasError
                                      ? 'border-green-500 focus:border-green-600'
                                      : 'border-gray-200 focus:border-blue-500 dark:border-gray-600'
                            }`}
                        />
                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Help students and teachers understand what makes this class unique</span>
                            <span>{formData.description?.length || 0}/500</span>
                        </div>
                        {descriptionFieldState.showError && (
                            <p className="mt-2 flex items-center gap-1 text-xs text-red-600">
                                <AlertCircle className="h-3 w-3" />
                                {descriptionFieldState.error}
                            </p>
                        )}
                        {descriptionFieldState.isTouched && !descriptionFieldState.hasError && (
                            <p className="mt-2 flex items-center gap-1 text-xs text-green-600">
                                <CheckCircle2 className="h-3 w-3" />
                                Description looks good
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Enhanced Action Buttons */}
            <div className="mt-8 flex flex-col justify-end gap-3 rounded-b-lg border-t border-gray-200 bg-gray-50 p-6 sm:flex-row sm:gap-4 dark:border-gray-700 dark:bg-gray-800">
                <Button type="button" variant="outline" onClick={onCancel} className="h-12 w-full px-6 font-medium sm:w-auto">
                    Cancel Changes
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting || !isFormValid}
                    className="h-12 w-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 font-medium shadow-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none sm:w-auto"
                >
                    {isSubmitting ? (
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            {loadingText}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            {actionText} Class
                        </div>
                    )}
                </Button>
            </div>
        </form>
    );
}
