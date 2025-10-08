import * as v from 'valibot';

// Schema for page form data
export const PageFormSchema = v.object({
    title: v.pipe(
        v.string(),
        v.nonEmpty('Page title is required'),
        v.minLength(3, 'Page title must be at least 3 characters'),
        v.maxLength(255, 'Page title cannot exceed 255 characters'),
        v.regex(/^[a-zA-Z0-9\s\-_.&()]+$/, 'Page title contains invalid characters'),
    ),
    slug: v.pipe(
        v.string(),
        v.nonEmpty('URL slug is required'),
        v.regex(/^[a-z0-9-]+$/, 'URL slug must contain only lowercase letters, numbers, and dashes'),
        v.minLength(3, 'URL slug must be at least 3 characters'),
        v.maxLength(255, 'URL slug cannot exceed 255 characters'),
    ),
    content: v.pipe(v.string(), v.nonEmpty('Page content is required'), v.minLength(10, 'Page content must be at least 10 characters')),
});

// Schema for edit form with slug uniqueness consideration
export const PageEditSchema = v.object({
    title: v.pipe(
        v.string(),
        v.nonEmpty('Page title is required'),
        v.minLength(3, 'Page title must be at least 3 characters'),
        v.maxLength(255, 'Page title cannot exceed 255 characters'),
        v.regex(/^[a-zA-Z0-9\s\-_.&()]+$/, 'Page title contains invalid characters'),
    ),
    slug: v.pipe(
        v.string(),
        v.nonEmpty('URL slug is required'),
        v.regex(/^[a-z0-9-]+$/, 'URL slug must contain only lowercase letters, numbers, and dashes'),
        v.minLength(3, 'URL slug must be at least 3 characters'),
        v.maxLength(255, 'URL slug cannot exceed 255 characters'),
    ),
    content: v.pipe(v.string(), v.nonEmpty('Page content is required'), v.minLength(10, 'Page content must be at least 10 characters')),
});

// Individual field schemas for real-time validation
export const TitleSchema = v.pipe(
    v.string(),
    v.nonEmpty('Page title is required'),
    v.minLength(3, 'Page title must be at least 3 characters'),
    v.maxLength(255, 'Page title cannot exceed 255 characters'),
    v.regex(/^[a-zA-Z0-9\s\-_.&()]+$/, 'Page title contains invalid characters'),
);

export const SlugSchema = v.pipe(
    v.string(),
    v.nonEmpty('URL slug is required'),
    v.regex(/^[a-z0-9-]+$/, 'URL slug must contain only lowercase letters, numbers, and dashes'),
    v.minLength(3, 'URL slug must be at least 3 characters'),
    v.maxLength(255, 'URL slug cannot exceed 255 characters'),
);

export const ContentSchema = v.pipe(
    v.string(),
    v.nonEmpty('Page content is required'),
    v.minLength(10, 'Page content must be at least 10 characters'),
);

// Type definitions
export type PageFormData = v.InferInput<typeof PageFormSchema>;
export type PageFormOutput = v.InferOutput<typeof PageFormSchema>;
export type ValidationErrors = Record<string, string>;

// Utility function to validate a single field
export function validateField(schema: any, value: any): { success: boolean; error?: string } {
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
export function validateForm(data: any, isEdit: boolean = false): { success: boolean; errors?: ValidationErrors } {
    try {
        const schema = isEdit ? PageEditSchema : PageFormSchema;
        v.parse(schema, data);
        return { success: true };
    } catch (error) {
        if (error instanceof v.ValiError) {
            const errors: ValidationErrors = {};
            error.issues.forEach((issue) => {
                const path = issue.path?.map((p: any) => p.key).join('.') || 'unknown';
                errors[path] = issue.message;
            });
            return { success: false, errors };
        }
        return { success: false, errors: { general: 'Validation failed' } };
    }
}

// Utility function to generate slug from title
export function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .replace(/^-+|-+$/g, '');
}
