import { useToast } from '@/hooks/use-toast';
import { StaffService } from '@/services/staffService';
import type { Staff } from '@/types/staff';
import { useCallback, useState } from 'react';

export function useStaffOperations() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    // Dialog states
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);
    const [showStaffDialog, setShowStaffDialog] = useState<Staff | null>(null);

    const handleDeleteStaff = useCallback(async () => {
        if (!staffToDelete) return;

        try {
            setIsLoading(true);
            await StaffService.deleteStaff(staffToDelete);

            toast({
                title: 'Success',
                description: `${staffToDelete.name} has been deleted successfully. All related position history and assignments have also been removed.`,
                variant: 'success',
            });

            setStaffToDelete(null);
        } catch (error) {
            toast({
                title: 'Error',
                description: `${error} Failed to delete staff member and related records. Please try again.`,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }, [staffToDelete, toast]);

    const handleBulkDelete = useCallback(
        async (staffIds: number[]) => {
            try {
                setIsLoading(true);
                await StaffService.bulkDeleteStaff(staffIds);

                toast({
                    title: 'Success',
                    description: `${staffIds.length} staff members have been deleted successfully. All related position history and assignments have also been removed.`,
                    variant: 'success',
                });

                setShowBulkDeleteConfirm(false);
            } catch (error) {
                toast({
                    title: 'Error',
                    description: `${error} Failed to delete staff members and related records. Please try again.`,
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        },
        [toast],
    );

    return {
        // States
        isLoading,
        showBulkDeleteConfirm,
        staffToDelete,
        showStaffDialog,

        // Handlers
        handleDeleteStaff,
        handleBulkDelete,

        // State setters
        setShowBulkDeleteConfirm,
        setStaffToDelete,
        setShowStaffDialog,
    };
}
