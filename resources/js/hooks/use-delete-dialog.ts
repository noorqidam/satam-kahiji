import { router } from '@inertiajs/react';
import { useState } from 'react';

import { useToast } from '@/hooks/use-toast';

interface DeleteErrors {
    error?: string;
    [key: string]: unknown;
}

interface UseDeleteDialogOptions {
    onSuccess?: () => void;
    onError?: (errors: DeleteErrors) => void;
}

interface DeleteDialogState {
    open: boolean;
    type: 'single' | 'bulk';
    itemId?: number;
    itemName?: string;
}

export const useDeleteDialog = (options: UseDeleteDialogOptions = {}) => {
    const { toast } = useToast();
    const [dialogState, setDialogState] = useState<DeleteDialogState>({
        open: false,
        type: 'single',
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const openDialog = (type: 'single' | 'bulk', itemId?: number, itemName?: string) => {
        setDialogState({
            open: true,
            type,
            itemId,
            itemName,
        });
    };

    const closeDialog = () => {
        setDialogState((prev) => ({ ...prev, open: false }));
    };

    const confirmDelete = (
        singleRoute: string,
        bulkRoute?: string,
        bulkData?: Record<string, unknown>,
        successMessage?: string,
        errorMessage?: string,
    ) => {
        setIsDeleting(true);

        const route = dialogState.type === 'single' ? singleRoute : bulkRoute;
        const data = dialogState.type === 'bulk' ? bulkData : undefined;

        if (!route) {
            setIsDeleting(false);
            return;
        }

        router.delete(route, {
            data: data ? JSON.parse(JSON.stringify(data)) : undefined,
            onSuccess: () => {
                const defaultSuccessMessage =
                    dialogState.type === 'single' ? `${dialogState.itemName} deleted successfully` : 'Selected items deleted successfully';

                toast({
                    title: 'Success',
                    description: successMessage || defaultSuccessMessage,
                    variant: 'success',
                });

                closeDialog();
                if (options.onSuccess) {
                    options.onSuccess();
                }
            },
            onError: (errors) => {
                const defaultErrorMessage = dialogState.type === 'single' ? 'Failed to delete item' : 'Failed to delete selected items';

                toast({
                    title: 'Error',
                    description: errors.error || errorMessage || defaultErrorMessage,
                    variant: 'destructive',
                });

                if (options.onError) {
                    options.onError(errors);
                }
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    return {
        dialogState,
        isDeleting,
        openDialog,
        closeDialog,
        confirmDelete,
    };
};
