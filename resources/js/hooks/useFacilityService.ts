// Single Responsibility: Handle all facility-related API operations
import { useToast } from '@/hooks/use-toast';
import type { Facility, FacilityFormData } from '@/types/facility';
import { router } from '@inertiajs/react';
import { useState } from 'react';

export function useFacilityService() {
    const { toast } = useToast();
    const [processing, setProcessing] = useState(false);

    const createFacility = (data: FacilityFormData, onSuccess?: () => void) => {
        setProcessing(true);
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description);

        if (data.image) {
            formData.append('image', data.image);
        }

        router.post(route('admin.facilities.store'), formData, {
            forceFormData: true,
            onSuccess: () => {
                toast({
                    title: 'Success',
                    description: 'Facility created successfully.',
                    variant: 'success',
                });
                onSuccess?.();
            },
            onError: () => {
                toast({
                    title: 'Error',
                    description: 'Failed to create facility. Please check the form and try again.',
                    variant: 'destructive',
                });
            },
            onFinish: () => setProcessing(false),
        });
    };

    const updateFacility = (facility: Facility, data: FacilityFormData, onSuccess?: () => void) => {
        setProcessing(true);
        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('name', data.name);
        formData.append('description', data.description);

        if (data.remove_image) {
            formData.append('remove_image', '1');
        }

        if (data.image) {
            formData.append('image', data.image);
        }

        router.post(route('admin.facilities.update', facility.id), formData, {
            forceFormData: true,
            onSuccess: () => {
                toast({
                    title: 'Success',
                    description: 'Facility updated successfully.',
                    variant: 'success',
                });
                onSuccess?.();
            },
            onError: () => {
                toast({
                    title: 'Error',
                    description: 'Failed to update facility. Please check the form and try again.',
                    variant: 'destructive',
                });
            },
            onFinish: () => setProcessing(false),
        });
    };

    const deleteFacility = (facility: Facility, onSuccess?: () => void) => {
        setProcessing(true);
        router.delete(route('admin.facilities.destroy', facility.id), {
            onSuccess: () => {
                toast({
                    title: 'Success',
                    description: 'Facility deleted successfully.',
                    variant: 'success',
                });
                onSuccess?.();
            },
            onError: () => {
                toast({
                    title: 'Error',
                    description: 'Failed to delete facility. Please try again.',
                    variant: 'destructive',
                });
            },
            onFinish: () => setProcessing(false),
        });
    };

    return {
        createFacility,
        updateFacility,
        deleteFacility,
        processing,
    };
}
