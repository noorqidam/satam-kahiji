import { useToast } from '@/hooks/use-toast';
import { router } from '@inertiajs/react';
import { useState } from 'react';


interface FlashMessages {
    success?: string;
    info?: string;
    warning?: string;
    error?: string;
}

interface InertiaPageProps {
    flash?: FlashMessages;
    [key: string]: unknown;
}

export function useAssignmentSave() {
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const saveAssignments = (assignmentsData: Array<{ staff_id: number; subject_ids: number[] }>, hasChanges: boolean) => {
        if (!hasChanges) {
            toast({
                title: 'No Changes',
                description: 'No changes detected in subject assignments.',
                variant: 'default',
            });
            return;
        }

        setIsSaving(true);

        router.post(
            route('admin.subject-assignments.bulk-update'),
            JSON.parse(JSON.stringify({ assignments: assignmentsData })),
            {
                onSuccess: (page: { props: InertiaPageProps }) => {
                    const props = page.props;

                    if (props.flash?.success) {
                        toast({
                            title: 'Success',
                            description: props.flash.success,
                            variant: 'success',
                        });
                        // Dispatch custom event to notify other components
                        window.dispatchEvent(new CustomEvent('subject-staff-updated'));
                        // Redirect to subjects page to show updated staff counts
                        router.visit('/admin/subjects', { preserveState: false });
                    } else if (props.flash?.info) {
                        toast({
                            title: 'No Changes',
                            description: 'No changes detected in subject assignments.',
                            variant: 'default',
                        });
                    } else if (props.flash?.warning) {
                        toast({
                            title: 'Warning',
                            description: props.flash.warning,
                            variant: 'default',
                        });
                    } else {
                        toast({
                            title: 'Success',
                            description: 'Assignment operation completed.',
                            variant: 'success',
                        });
                        router.visit('/admin/subjects', { preserveState: false });
                    }
                },
                onError: (errors) => {
                    const errorMessage = Object.values(errors).flat().join(', ') || 'Failed to save assignments. Please try again.';
                    toast({
                        title: 'Error',
                        description: errorMessage,
                        variant: 'destructive',
                    });
                },
                onFinish: () => setIsSaving(false),
            },
        );
    };

    return {
        isSaving,
        saveAssignments,
    };
}
