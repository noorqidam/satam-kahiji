import { FacilityFormFields } from '@/components/facility/FacilityFormFields';
import { useFacilityForm } from '@/hooks/useFacilityForm';
import AppLayout from '@/layouts/app-layout';
import { generateFacilityBreadcrumbs } from '@/utils/facility';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function CreateFacility() {
    const [mounted, setMounted] = useState(false);
    const facilityForm = useFacilityForm();

    useEffect(() => {
        setMounted(true);
    }, []);

    const breadcrumbs = generateFacilityBreadcrumbs('create');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Facility" />

            <div
                className={`w-full max-w-none space-y-6 px-4 pb-3 transition-all duration-500 sm:px-6 lg:px-8 ${
                    mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
            >
                <FacilityFormFields
                    data={facilityForm.data}
                    errors={facilityForm.errors}
                    processing={facilityForm.processing}
                    mounted={mounted}
                    onDataChange={facilityForm.updateField}
                    onImageSelect={facilityForm.handleImageSelect}
                    onSubmit={facilityForm.submitForm}
                />
            </div>
        </AppLayout>
    );
}
