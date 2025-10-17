import { useToast } from '@/hooks/use-toast';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();

    const saveAssignments = (assignmentsData: Array<{ staff_id: number; subject_ids: number[] }>, hasChanges: boolean) => {
        if (!hasChanges) {
            toast({
                title: t('class_management.subject_staff_assignments.save.no_changes_title'),
                description: t('class_management.subject_staff_assignments.save.no_changes_description'),
                variant: 'default',
            });
            return;
        }

        setIsSaving(true);

        router.post('/admin/subject-assignments/bulk-update', JSON.parse(JSON.stringify({ assignments: assignmentsData })), {
            onSuccess: (page: { props: InertiaPageProps }) => {
                const props = page.props;

                if (props.flash?.success) {
                    toast({
                        title: t('class_management.subject_staff_assignments.save.success_title'),
                        description: props.flash.success,
                        variant: 'success',
                    });
                    // Dispatch custom event to notify other components
                    window.dispatchEvent(new CustomEvent('subject-staff-updated'));
                    // Redirect to subjects page to show updated staff counts
                    router.visit('/admin/subjects', { preserveState: false });
                } else if (props.flash?.info) {
                    toast({
                        title: t('class_management.subject_staff_assignments.save.no_changes_title'),
                        description: t('class_management.subject_staff_assignments.save.no_changes_description'),
                        variant: 'default',
                    });
                } else if (props.flash?.warning) {
                    toast({
                        title: t('class_management.subject_staff_assignments.save.warning_title'),
                        description: props.flash.warning,
                        variant: 'default',
                    });
                } else {
                    toast({
                        title: t('class_management.subject_staff_assignments.save.success_title'),
                        description: t('class_management.subject_staff_assignments.save.success_description'),
                        variant: 'success',
                    });
                    router.visit('/admin/subjects', { preserveState: false });
                }
            },
            onError: (errors) => {
                const errorMessage = Object.values(errors).flat().join(', ') || t('class_management.subject_staff_assignments.save.error_fallback');
                toast({
                    title: t('class_management.subject_staff_assignments.save.error_title'),
                    description: errorMessage,
                    variant: 'destructive',
                });
            },
            onFinish: () => setIsSaving(false),
        });
    };

    return {
        isSaving,
        saveAssignments,
    };
}
