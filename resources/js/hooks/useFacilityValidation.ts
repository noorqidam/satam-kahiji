// Single Responsibility: Handle facility form validation
import { useToast } from '@/hooks/use-toast';
import type { FacilityFormData } from '@/types/facility';
import { useCallback, useState } from 'react';

interface ValidationErrors {
    [key: string]: string | undefined;
    name?: string;
    description?: string;
    image?: string;
}

export function useFacilityValidation() {
    const { toast } = useToast();
    const [errors, setErrors] = useState<ValidationErrors>({});

    const validateForm = useCallback(
        (data: FacilityFormData): boolean => {
            const newErrors: ValidationErrors = {};

            // Name validation
            if (!data.name.trim()) {
                newErrors.name = 'Facility name is required';
            } else if (data.name.length > 255) {
                newErrors.name = 'Facility name must not exceed 255 characters';
            }

            // Description validation
            if (!data.description.trim()) {
                newErrors.description = 'Description is required';
            } else if (data.description.length > 5000) {
                newErrors.description = 'Description must not exceed 5000 characters';
            }

            // Image validation
            if (data.image) {
                const maxSize = 5 * 1024 * 1024; // 5MB
                if (data.image.size > maxSize) {
                    newErrors.image = 'Image must be smaller than 5MB';
                    toast({
                        title: 'Error',
                        description: 'Image must be smaller than 5MB',
                        variant: 'destructive',
                    });
                }

                const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
                if (!allowedTypes.includes(data.image.type)) {
                    newErrors.image = 'Invalid image format. Allowed: JPEG, PNG, GIF, WebP';
                    toast({
                        title: 'Error',
                        description: 'Invalid image format. Allowed: JPEG, PNG, GIF, WebP',
                        variant: 'destructive',
                    });
                }
            }

            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        },
        [toast],
    );

    const clearErrors = useCallback(() => {
        setErrors({});
    }, []);

    const hasError = useCallback(
        (field: keyof ValidationErrors): boolean => {
            return !!errors[field];
        },
        [errors],
    );

    const getError = useCallback(
        (field: keyof ValidationErrors): string | undefined => {
            return errors[field];
        },
        [errors],
    );

    return {
        errors,
        validateForm,
        clearErrors,
        hasError,
        getError,
    };
}
