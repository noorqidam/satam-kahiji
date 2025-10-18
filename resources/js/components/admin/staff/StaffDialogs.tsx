import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { useStaffOperations } from '@/hooks/useStaffOperations';
import { Trash2, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StaffDialogsProps {
    operations: ReturnType<typeof useStaffOperations>;
    selectedStaff: number[];
    onBulkDelete: (staffIds: number[]) => Promise<void>;
    onClearSelection: () => void;
}

export function StaffDialogs({ operations, selectedStaff, onBulkDelete, onClearSelection }: StaffDialogsProps) {
    const { t } = useTranslation();
    const {
        isLoading,
        showBulkDeleteConfirm,
        staffToDelete,
        showStaffDialog,
        handleDeleteStaff,
        setShowBulkDeleteConfirm,
        setStaffToDelete,
        setShowStaffDialog,
    } = operations;

    return (
        <>
            {/* Staff Details Dialog */}
            <Dialog open={!!showStaffDialog} onOpenChange={() => setShowStaffDialog(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {t('staff_management.dialogs.view.title')}: {showStaffDialog?.name}
                        </DialogTitle>
                    </DialogHeader>
                    {showStaffDialog && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                                    {showStaffDialog.photo ? (
                                        <img
                                            src={showStaffDialog.photo_url || showStaffDialog.photo}
                                            alt={showStaffDialog.name}
                                            className="h-20 w-20 rounded-full object-cover"
                                        />
                                    ) : (
                                        <User className="h-10 w-10 text-gray-500" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{showStaffDialog.name}</h3>
                                    <p className="text-gray-600 dark:text-gray-400">{showStaffDialog.position}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-500">{showStaffDialog.division}</p>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        {t('staff_management.dialogs.view.email')}
                                    </label>
                                    <p className="text-sm text-gray-900 dark:text-gray-100">{showStaffDialog.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        {t('staff_management.dialogs.view.phone')}
                                    </label>
                                    <p className="text-sm text-gray-900 dark:text-gray-100">{showStaffDialog.phone || t('common.not_provided')}</p>
                                </div>
                            </div>

                            {showStaffDialog.bio && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('common.biography')}</label>
                                    <div
                                        className="prose dark:prose-invert mt-1 max-w-none text-sm text-gray-900 dark:text-gray-100"
                                        dangerouslySetInnerHTML={{ __html: showStaffDialog.bio }}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t('staff_management.dialogs.view.created')}
                                </label>
                                <p className="text-sm text-gray-900 dark:text-gray-100">
                                    {new Date(showStaffDialog.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Staff Dialog */}
            <Dialog open={!!staffToDelete} onOpenChange={() => setStaffToDelete(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="ml-3">
                                <DialogTitle>{t('staff_management.dialogs.delete.title')}</DialogTitle>
                            </div>
                        </div>
                    </DialogHeader>
                    {staffToDelete && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t('staff_management.dialogs.delete.message', { name: staffToDelete.name })}
                            </p>
                            <div className="flex justify-end space-x-3">
                                <Button variant="ghost" onClick={() => setStaffToDelete(null)} disabled={isLoading}>
                                    {t('staff_management.dialogs.delete.cancel')}
                                </Button>
                                <Button variant="destructive" onClick={handleDeleteStaff} disabled={isLoading}>
                                    {isLoading ? t('staff_management.dialogs.delete.deleting') : t('staff_management.dialogs.delete.delete')}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Bulk Delete Dialog */}
            <Dialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="ml-3">
                                <DialogTitle>{t('staff_management.dialogs.bulk_delete.title')}</DialogTitle>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t('staff_management.dialogs.bulk_delete.message', {
                                count: selectedStaff.length,
                                plural: selectedStaff.length !== 1 ? 's' : '',
                            })}
                        </p>
                        <div className="flex justify-end space-x-3">
                            <Button variant="ghost" onClick={() => setShowBulkDeleteConfirm(false)} disabled={isLoading}>
                                {t('staff_management.dialogs.bulk_delete.cancel')}
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={async () => {
                                    try {
                                        await onBulkDelete(selectedStaff);
                                        onClearSelection();
                                    } catch {
                                        // Error handling is done in the hook
                                    }
                                }}
                                disabled={isLoading}
                            >
                                {isLoading ? t('staff_management.dialogs.bulk_delete.deleting') : t('staff_management.dialogs.bulk_delete.delete')}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
