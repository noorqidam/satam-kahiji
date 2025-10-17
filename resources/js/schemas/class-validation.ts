import * as v from 'valibot';
import i18n from '@/i18n';

// Helper function to get translated validation messages
const t = (key: string, params?: Record<string, string | number>) => {
    return i18n.t(key, params);
};

// Schema for class form data
export const ClassFormSchema = v.object({
    grade_level: v.pipe(
        v.string(), 
        v.nonEmpty(() => t('classes_management.create.form.validation.grade_level.required')), 
        v.regex(/^[789]$/, () => t('classes_management.create.form.validation.grade_level.invalid'))
    ),
    class_section: v.pipe(
        v.string(), 
        v.nonEmpty(() => t('classes_management.create.form.validation.class_section.required')), 
        v.regex(/^[A-Z]$/, () => t('classes_management.create.form.validation.class_section.invalid'))
    ),
    capacity: v.pipe(
        v.string(),
        v.nonEmpty(() => t('classes_management.create.form.validation.capacity.required')),
        v.transform(Number),
        v.number(() => t('classes_management.create.form.validation.capacity.invalid_number')),
        v.minValue(1, () => t('classes_management.create.form.validation.capacity.min_value')),
        v.maxValue(40, () => t('classes_management.create.form.validation.capacity.max_value')),
        v.integer(() => t('classes_management.create.form.validation.capacity.must_be_integer')),
    ),
    description: v.optional(v.pipe(v.string(), v.maxLength(500, () => t('classes_management.create.form.validation.description.max_length'))), ''),
});

// Schema for edit form with additional validation for existing students
export const ClassEditSchema = (currentStudentCount: number = 0) =>
    v.object({
        grade_level: v.pipe(
            v.string(), 
            v.nonEmpty(() => t('classes_management.create.form.validation.grade_level.required')), 
            v.regex(/^[789]$/, () => t('classes_management.create.form.validation.grade_level.invalid'))
        ),
        class_section: v.pipe(
            v.string(), 
            v.nonEmpty(() => t('classes_management.create.form.validation.class_section.required')), 
            v.regex(/^[A-Z]$/, () => t('classes_management.create.form.validation.class_section.invalid'))
        ),
        capacity: v.pipe(
            v.string(),
            v.nonEmpty(() => t('classes_management.create.form.validation.capacity.required')),
            v.transform(Number),
            v.number(() => t('classes_management.create.form.validation.capacity.invalid_number')),
            v.minValue(currentStudentCount, () => t('classes_management.create.form.validation.capacity.min_current_students', { count: currentStudentCount })),
            v.maxValue(40, () => t('classes_management.create.form.validation.capacity.max_value')),
            v.integer(() => t('classes_management.create.form.validation.capacity.must_be_integer')),
        ),
        description: v.optional(v.pipe(v.string(), v.maxLength(500, () => t('classes_management.create.form.validation.description.max_length'))), ''),
    });

// Individual field schemas for real-time validation
export const GradeLevelSchema = v.pipe(
    v.string(), 
    v.nonEmpty(() => t('classes_management.create.form.validation.grade_level.required')), 
    v.regex(/^[789]$/, () => t('classes_management.create.form.validation.grade_level.invalid'))
);

export const ClassSectionSchema = v.pipe(
    v.string(),
    v.nonEmpty(() => t('classes_management.create.form.validation.class_section.required')),
    v.regex(/^[A-Z]$/, () => t('classes_management.create.form.validation.class_section.invalid')),
);

export const CapacitySchema = (minCapacity: number = 1) =>
    v.pipe(
        v.string(),
        v.nonEmpty(() => t('classes_management.create.form.validation.capacity.required')),
        v.regex(/^\d+$/, () => t('classes_management.create.form.validation.capacity.invalid_format')),
        v.check(
            (value) => {
                const num = Number(value);
                return !isNaN(num) && num >= minCapacity;
            },
            () => minCapacity > 1 
                ? t('classes_management.create.form.validation.capacity.min_current_students', { count: minCapacity })
                : t('classes_management.create.form.validation.capacity.min_value'),
        ),
        v.check((value) => {
            const num = Number(value);
            return !isNaN(num) && num <= 40;
        }, () => t('classes_management.create.form.validation.capacity.max_value')),
        v.check((value) => {
            const num = Number(value);
            return !isNaN(num) && Number.isInteger(num);
        }, () => t('classes_management.create.form.validation.capacity.must_be_integer')),
    );

export const DescriptionSchema = v.optional(v.pipe(v.string(), v.maxLength(500, () => t('classes_management.create.form.validation.description.max_length'))), '');

// Type definitions
export type ClassFormData = v.InferInput<typeof ClassFormSchema>;
export type ClassFormOutput = v.InferOutput<typeof ClassFormSchema>;
export type ValidationErrors = Record<string, string>;

// Utility function to validate a single field
export function validateField(schema: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>, value: unknown): { success: boolean; error?: string } {
    try {
        v.parse(schema, value);
        return { success: true };
    } catch (error) {
        if (error instanceof v.ValiError) {
            return { success: false, error: error.issues[0]?.message || t('classes_management.create.form.validation.general.validation_error') };
        }
        return { success: false, error: t('classes_management.create.form.validation.general.unexpected_error') };
    }
}

// Utility function to validate the entire form
export function validateForm(
    data: unknown,
    isEdit: boolean = false,
    currentStudentCount: number = 0,
): { success: boolean; errors?: ValidationErrors } {
    try {
        const schema = isEdit ? ClassEditSchema(currentStudentCount) : ClassFormSchema;
        v.parse(schema, data);
        return { success: true };
    } catch (error) {
        if (error instanceof v.ValiError) {
            const errors: ValidationErrors = {};
            error.issues.forEach((issue) => {
                const path = issue.path?.map((p: { key: string }) => p.key).join('.') || 'unknown';
                errors[path] = issue.message;
            });
            return { success: false, errors };
        }
        return { success: false, errors: { general: t('classes_management.create.form.validation.general.validation_failed') } };
    }
}
