import { STAFF_DIVISIONS } from '@/constants/divisions';
import { useToast } from '@/hooks/use-toast';
import type { CreateStaffForm } from '@/types/staff';
import { useForm } from '@inertiajs/react';
import { useCallback } from 'react';

export function useStaffCreate() {
    const { toast } = useToast();

    const form = useForm<CreateStaffForm>({
        name: '',
        position: '',
        division: STAFF_DIVISIONS.ACADEMIC,
        email: '',
        phone: '',
        bio: '',
        photo: null,
    });

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();

            form.post(route('admin.staff.store'), {
                forceFormData: true,
                onSuccess: () => {
                    toast({
                        title: 'Success',
                        description: 'Staff member created successfully.',
                        variant: 'success',
                    });
                },
                onError: (errors) => {
                    const errorMessage = Object.values(errors).flat().join(', ') || 'Failed to create staff member.';
                    toast({
                        title: 'Error',
                        description: errorMessage,
                        variant: 'destructive',
                    });
                },
            });
        },
        [form, toast],
    );

    return {
        form,
        handleSubmit,
    };
}
