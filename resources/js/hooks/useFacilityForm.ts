// Single Responsibility: Manage facility form state and operations
import type { Facility, FacilityFormData } from '@/types/facility';
import { useCallback, useState } from 'react';
import { useFacilityService } from './useFacilityService';
import { useFacilityValidation } from './useFacilityValidation';

export function useFacilityForm(facility?: Facility) {
    const [processing, setProcessing] = useState(false);
    const [data, setData] = useState<FacilityFormData>({
        name: facility?.name || '',
        description: facility?.description || '',
        image: null,
        remove_image: false,
    });

    const facilityService = useFacilityService();
    const validation = useFacilityValidation();

    const updateField = useCallback(
        (field: keyof FacilityFormData, value: any) => {
            setData((prev) => ({ ...prev, [field]: value }));
            validation.clearErrors();
        },
        [validation],
    );

    const handleImageSelect = useCallback(
        (file: File | null) => {
            setData((prev) => ({
                ...prev,
                image: file,
                remove_image: !file && !!facility?.photo,
            }));
            validation.clearErrors();
        },
        [facility?.photo, validation],
    );

    const submitForm = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();

            if (!validation.validateForm(data)) {
                return;
            }

            setProcessing(true);

            const onComplete = () => {
                setProcessing(false);
            };

            if (facility) {
                facilityService.updateFacility(facility, data, onComplete);
            } else {
                facilityService.createFacility(data, onComplete);
            }
        },
        [data, facility, facilityService, validation],
    );

    return {
        data,
        processing,
        errors: validation.errors,
        updateField,
        handleImageSelect,
        submitForm,
        hasError: validation.hasError,
        getError: validation.getError,
    };
}
