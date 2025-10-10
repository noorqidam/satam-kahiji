// Single Responsibility: Handle contact form validation logic
import type { ContactFormData, ContactValidationHook } from '@/types/contact';
import { useState } from 'react';
import * as v from 'valibot';

// Open/Closed Principle: Validation schema can be extended without modifying this hook
const ContactValidationSchema = v.object({
    name: v.pipe(v.string(), v.trim(), v.minLength(1, 'Name is required')),
    email: v.pipe(v.string(), v.trim(), v.minLength(1, 'Email is required'), v.email('Please enter a valid email address')),
    message: v.pipe(v.string(), v.trim(), v.minLength(1, 'Message is required')),
    phone: v.pipe(v.string(), v.trim()),
});

/**
 * Custom hook for contact form validation
 * Follows SRP by handling only validation logic
 * Follows OCP by using a centralized schema that can be extended
 */
export function useContactValidation(): ContactValidationHook {
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const validateForm = (data: ContactFormData): boolean => {
        try {
            v.parse(ContactValidationSchema, data);
            setValidationErrors({});
            return true;
        } catch (error) {
            if (error instanceof v.ValiError) {
                const newErrors: Record<string, string> = {};
                for (const issue of error.issues) {
                    if (issue.path) {
                        const path = issue.path.map((p: { key?: string }) => p.key).join('.');
                        newErrors[path] = issue.message;
                    }
                }
                setValidationErrors(newErrors);
            }
            return false;
        }
    };

    const clearValidationErrors = () => {
        setValidationErrors({});
    };

    const getValidationSchema = () => {
        return ContactValidationSchema;
    };

    return {
        validateForm,
        validationErrors,
        clearValidationErrors,
        getValidationSchema,
    };
}
