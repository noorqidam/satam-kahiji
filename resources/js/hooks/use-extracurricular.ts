import { useToast } from '@/hooks/use-toast';
import {
    ExtracurricularBulkActions,
    ExtracurricularDialogState,
    ExtracurricularSearchParams,
    ExtracurricularWithStats,
} from '@/types/extracurricular';
import { router } from '@inertiajs/react';
import { useCallback, useState } from 'react';

interface UseExtracurricularManagerProps {
    onSuccess?: (message: string) => void;
    onError?: (message: string) => void;
}

export function useExtracurricularManager({ onSuccess, onError }: UseExtracurricularManagerProps = {}) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const showToast = useCallback(
        (type: 'success' | 'error', message: string) => {
            toast({
                title: type === 'success' ? 'Success' : 'Error',
                description: message,
                variant: type === 'success' ? 'success' : 'destructive',
            });
        },
        [toast],
    );

    const deleteExtracurricular = useCallback(
        (extracurricular: ExtracurricularWithStats) => {
            setIsLoading(true);
            router.delete(route('admin.extracurriculars.destroy', extracurricular.id), {
                onSuccess: () => {
                    const message = `${extracurricular.name} has been deleted successfully.`;
                    showToast('success', message);
                    onSuccess?.(message);
                },
                onError: () => {
                    const message = 'Failed to delete extracurricular activity. Please try again.';
                    showToast('error', message);
                    onError?.(message);
                },
                onFinish: () => setIsLoading(false),
            });
        },
        [showToast, onSuccess, onError],
    );

    const bulkDeleteExtracurriculars = useCallback(
        (selectedIds: number[]) => {
            setIsLoading(true);
            router.delete(route('admin.extracurriculars.bulk-destroy'), {
                data: { ids: selectedIds },
                onSuccess: () => {
                    const message = `${selectedIds.length} extracurricular activities have been deleted successfully.`;
                    showToast('success', message);
                    onSuccess?.(message);
                },
                onError: () => {
                    const message = 'Failed to delete extracurricular activities. Please try again.';
                    showToast('error', message);
                    onError?.(message);
                },
                onFinish: () => setIsLoading(false),
            });
        },
        [showToast, onSuccess, onError],
    );

    const updateFilters = useCallback((params: ExtracurricularSearchParams) => {
        const cleanParams: Record<string, string> = {};

        if (params.search?.trim()) {
            cleanParams.search = params.search.trim();
        }
        if (params.page) {
            cleanParams.page = params.page.toString();
        }
        if (params.per_page) {
            cleanParams.per_page = params.per_page.toString();
        }

        setIsLoading(true);
        router.get(route('admin.extracurriculars.index'), cleanParams, {
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    }, []);

    const clearFilters = useCallback(() => {
        router.get(route('admin.extracurriculars.index'));
    }, []);

    return {
        isLoading,
        deleteExtracurricular,
        bulkDeleteExtracurriculars,
        updateFilters,
        clearFilters,
    };
}

export function useExtracurricularSelection() {
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    const selectAll = useCallback((items: ExtracurricularWithStats[], checked: boolean) => {
        if (checked) {
            setSelectedItems(items.map((item) => item.id));
        } else {
            setSelectedItems([]);
        }
    }, []);

    const selectItem = useCallback((itemId: number, checked: boolean) => {
        if (checked) {
            setSelectedItems((prev) => [...prev, itemId]);
        } else {
            setSelectedItems((prev) => prev.filter((id) => id !== itemId));
        }
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedItems([]);
    }, []);

    const getBulkActions = useCallback(
        (totalItems: number): ExtracurricularBulkActions => ({
            selectedIds: selectedItems,
            isAllSelected: selectedItems.length === totalItems && totalItems > 0,
        }),
        [selectedItems],
    );

    return {
        selectedItems,
        selectAll,
        selectItem,
        clearSelection,
        getBulkActions,
    };
}

export function useExtracurricularDialogs() {
    const [dialogState, setDialogState] = useState<ExtracurricularDialogState>({
        view: null,
        delete: null,
        bulkDelete: false,
    });

    const openViewDialog = useCallback((extracurricular: ExtracurricularWithStats) => {
        setDialogState((prev) => ({ ...prev, view: extracurricular }));
    }, []);

    const openDeleteDialog = useCallback((extracurricular: ExtracurricularWithStats) => {
        setDialogState((prev) => ({ ...prev, delete: extracurricular }));
    }, []);

    const openBulkDeleteDialog = useCallback(() => {
        setDialogState((prev) => ({ ...prev, bulkDelete: true }));
    }, []);

    const closeDialogs = useCallback(() => {
        setDialogState({
            view: null,
            delete: null,
            bulkDelete: false,
        });
    }, []);

    const closeViewDialog = useCallback(() => {
        setDialogState((prev) => ({ ...prev, view: null }));
    }, []);

    const closeDeleteDialog = useCallback(() => {
        setDialogState((prev) => ({ ...prev, delete: null }));
    }, []);

    const closeBulkDeleteDialog = useCallback(() => {
        setDialogState((prev) => ({ ...prev, bulkDelete: false }));
    }, []);

    return {
        dialogState,
        openViewDialog,
        openDeleteDialog,
        openBulkDeleteDialog,
        closeDialogs,
        closeViewDialog,
        closeDeleteDialog,
        closeBulkDeleteDialog,
    };
}
