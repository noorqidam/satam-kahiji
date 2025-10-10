import * as v from 'valibot';

// Schema for class form data
export const ClassFormSchema = v.object({
    grade_level: v.pipe(v.string(), v.nonEmpty('Grade level is required'), v.regex(/^[789]$/, 'Grade level must be 7, 8, or 9')),
    class_section: v.pipe(v.string(), v.nonEmpty('Class section is required'), v.regex(/^[A-Z]$/, 'Class section must be a single letter (A-Z)')),
    capacity: v.pipe(
        v.string(),
        v.nonEmpty('Capacity is required'),
        v.transform(Number),
        v.number('Capacity must be a number'),
        v.minValue(1, 'Capacity must be at least 1 student'),
        v.maxValue(40, 'Capacity cannot exceed 40 students'),
        v.integer('Capacity must be a whole number'),
    ),
    description: v.optional(v.pipe(v.string(), v.maxLength(500, 'Description cannot exceed 500 characters')), ''),
});

// Schema for edit form with additional validation for existing students
export const ClassEditSchema = (currentStudentCount: number = 0) =>
    v.object({
        grade_level: v.pipe(v.string(), v.nonEmpty('Grade level is required'), v.regex(/^[789]$/, 'Grade level must be 7, 8, or 9')),
        class_section: v.pipe(v.string(), v.nonEmpty('Class section is required'), v.regex(/^[A-Z]$/, 'Class section must be a single letter (A-Z)')),
        capacity: v.pipe(
            v.string(),
            v.nonEmpty('Capacity is required'),
            v.transform(Number),
            v.number('Capacity must be a number'),
            v.minValue(currentStudentCount, `Capacity must be at least ${currentStudentCount} to accommodate current students`),
            v.maxValue(40, 'Capacity cannot exceed 40 students'),
            v.integer('Capacity must be a whole number'),
        ),
        description: v.optional(v.pipe(v.string(), v.maxLength(500, 'Description cannot exceed 500 characters')), ''),
    });

// Individual field schemas for real-time validation
export const GradeLevelSchema = v.pipe(v.string(), v.nonEmpty('Grade level is required'), v.regex(/^[789]$/, 'Grade level must be 7, 8, or 9'));

export const ClassSectionSchema = v.pipe(
    v.string(),
    v.nonEmpty('Class section is required'),
    v.regex(/^[A-Z]$/, 'Class section must be a single letter (A-Z)'),
);

export const CapacitySchema = (minCapacity: number = 1) =>
    v.pipe(
        v.string(),
        v.nonEmpty('Capacity is required'),
        v.regex(/^\d+$/, 'Capacity must be a valid number'),
        v.check(
            (value) => {
                const num = Number(value);
                return !isNaN(num) && num >= minCapacity;
            },
            minCapacity > 1 ? `Capacity must be at least ${minCapacity} to accommodate current students` : 'Capacity must be at least 1 student',
        ),
        v.check((value) => {
            const num = Number(value);
            return !isNaN(num) && num <= 40;
        }, 'Capacity cannot exceed 40 students'),
        v.check((value) => {
            const num = Number(value);
            return !isNaN(num) && Number.isInteger(num);
        }, 'Capacity must be a whole number'),
    );

export const DescriptionSchema = v.optional(v.pipe(v.string(), v.maxLength(500, 'Description cannot exceed 500 characters')), '');

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
            return { success: false, error: error.issues[0]?.message || 'Validation error' };
        }
        return { success: false, error: 'Unexpected validation error' };
    }
}

// Utility function to validate the entire form
export function validateForm(data: unknown, isEdit: boolean = false, currentStudentCount: number = 0): { success: boolean; errors?: ValidationErrors } {
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
        return { success: false, errors: { general: 'Validation failed' } };
    }
}
