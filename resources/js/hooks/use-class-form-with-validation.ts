import { router } from '@inertiajs/react';
import { FormEvent, useCallback, useState } from 'react';

import { useToast } from '@/hooks/use-toast';
import {
    CapacitySchema,
    ClassSectionSchema,
    DescriptionSchema,
    GradeLevelSchema,
    validateField,
    validateForm,
    type ValidationErrors,
} from '@/schemas/class-validation';
import { generateClassName } from '@/utils/class-utils';

interface ClassFormData {
    grade_level: string;
    class_section: string;
    description: string;
    capacity: string;
}

interface UseClassFormWithValidationProps {
    initialData: ClassFormData;
    submitRoute: string;
    isEdit?: boolean;
    currentStudentCount?: number;
    onSuccess?: () => void;
}

export const useClassFormWithValidation = ({
    initialData,
    submitRoute,
    isEdit = false,
    currentStudentCount = 0,
    onSuccess,
}: UseClassFormWithValidationProps) => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<ClassFormData>(initialData);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [fieldTouched, setFieldTouched] = useState<Record<string, boolean>>({});
    const [previewClassName, setPreviewClassName] = useState(generateClassName(initialData.grade_level, initialData.class_section));

    // Real-time validation for individual fields
    const validateSingleField = useCallback(
        (field: keyof ClassFormData, value: string) => {
            let schema;

            switch (field) {
                case 'grade_level':
                    schema = GradeLevelSchema;
                    break;
                case 'class_section':
                    schema = ClassSectionSchema;
                    break;
                case 'capacity':
                    schema = CapacitySchema(currentStudentCount);
                    break;
                case 'description':
                    schema = DescriptionSchema;
                    break;
                default:
                    return;
            }

            const result = validateField(schema, value);

            setErrors((prev) => ({
                ...prev,
                [field]: result.success ? '' : result.error || '',
            }));

            return result;
        },
        [currentStudentCount],
    );

    const handleInputChange = useCallback(
        (field: keyof ClassFormData, value: string | boolean) => {
            const stringValue = String(value);

            setFormData((prev) => ({ ...prev, [field]: stringValue }));

            // Mark field as touched for validation feedback
            setFieldTouched((prev) => ({ ...prev, [field]: true }));

            // Validate field in real-time if it has been touched
            if (fieldTouched[field] || stringValue !== '') {
                validateSingleField(field, stringValue);
            }

            // Update preview class name
            if (field === 'grade_level' || field === 'class_section') {
                const updatedData = { ...formData, [field]: stringValue };
                setPreviewClassName(generateClassName(updatedData.grade_level, updatedData.class_section));
            }
        },
        [fieldTouched, formData, validateSingleField],
    );

    const handleFieldBlur = useCallback(
        (field: keyof ClassFormData) => {
            setFieldTouched((prev) => ({ ...prev, [field]: true }));
            validateSingleField(field, formData[field]);
        },
        [formData, validateSingleField],
    );

    const validateAllFields = useCallback(() => {
        const result = validateForm(formData, isEdit, currentStudentCount);

        if (!result.success && result.errors) {
            setErrors(result.errors);

            // Mark all fields as touched to show validation errors
            const allFieldsTouched: Record<string, boolean> = {};
            Object.keys(formData).forEach((key) => {
                allFieldsTouched[key] = true;
            });
            setFieldTouched(allFieldsTouched);
        }

        return result;
    }, [formData, isEdit, currentStudentCount]);

    const handleSubmit = useCallback(
        (e: FormEvent) => {
            e.preventDefault();

            // Validate all fields before submission
            const validationResult = validateAllFields();

            if (!validationResult.success) {
                toast({
                    title: 'Validation Error',
                    description: 'Please fix the errors in the form before submitting',
                    variant: 'destructive',
                });
                return;
            }

            setIsSubmitting(true);

            const method = isEdit ? 'put' : 'post';

            router[method](submitRoute, formData as Record<string, any>, {
                onSuccess: () => {
                    const action = isEdit ? 'updated' : 'created';
                    toast({
                        title: 'Success',
                        description: `Class ${action} successfully`,
                        variant: 'success',
                    });
                    if (onSuccess) onSuccess();
                },
                onError: (serverErrors) => {
                    // Handle server-side validation errors
                    setErrors(serverErrors);

                    // Mark fields with server errors as touched
                    const touchedFields: Record<string, boolean> = {};
                    Object.keys(serverErrors).forEach((key) => {
                        touchedFields[key] = true;
                    });
                    setFieldTouched((prev) => ({ ...prev, ...touchedFields }));

                    const firstError = Object.values(serverErrors).flat()[0] as string;
                    toast({
                        title: 'Error',
                        description: firstError || 'Please check the form for errors',
                        variant: 'destructive',
                    });
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            });
        },
        [validateAllFields, isEdit, submitRoute, formData, onSuccess, toast],
    );

    // Check if form is valid (no errors and all required fields filled)
    const isFormValid = Boolean(
        formData.grade_level && formData.class_section && formData.capacity && !Object.values(errors).some((error) => error !== ''),
    );

    // Get field-specific validation state
    const getFieldState = useCallback(
        (field: keyof ClassFormData) => {
            const hasError = Boolean(errors[field]);
            const isTouched = Boolean(fieldTouched[field]);
            const showError = hasError && isTouched;

            return {
                hasError,
                isTouched,
                showError,
                error: showError ? errors[field] : undefined,
            };
        },
        [errors, fieldTouched],
    );

    // Clear all validation errors
    const clearErrors = useCallback(() => {
        setErrors({});
        setFieldTouched({});
    }, []);

    return {
        formData,
        errors,
        fieldTouched,
        previewClassName,
        isSubmitting,
        isFormValid,
        handleInputChange,
        handleFieldBlur,
        handleSubmit,
        getFieldState,
        clearErrors,
        validateField: validateSingleField,
        validateForm: validateAllFields,
    };
};
