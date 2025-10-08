import { useForm } from '@inertiajs/react';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { WorkItem } from '@/types/workItem';

interface WorkItemManageDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workItems: WorkItem[];
    userRole: string;
}

export function WorkItemManageDialog({ open, onOpenChange, workItems, userRole }: WorkItemManageDialogProps) {
    const { t } = useTranslation('common');
    const { toast } = useToast();
    const [editingItem, setEditingItem] = useState<WorkItem | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<WorkItem | null>(null);

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        errors,
        reset,
    } = useForm<{
        name: string;
        is_required: boolean;
    }>({
        name: '',
        is_required: userRole === 'headmaster' ? true : false,
    });

    const canCreateRequired = ['super_admin', 'headmaster'].includes(userRole);
    const isHeadmaster = userRole === 'headmaster';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingItem) {
            put(route('admin.work-items.update', editingItem.id), {
                onSuccess: () => {
                    toast({
                        title: t('work_items_management.manage_dialog.messages.success'),
                        description: t('work_items_management.manage_dialog.messages.update_success'),
                        variant: 'success',
                    });
                    resetForm();
                },
                onError: () => {
                    toast({
                        title: t('work_items_management.manage_dialog.messages.error'),
                        description: t('work_items_management.manage_dialog.messages.update_error'),
                        variant: 'destructive',
                    });
                },
            });
        } else {
            post(route('admin.work-items.store'), {
                onSuccess: () => {
                    toast({
                        title: t('work_items_management.manage_dialog.messages.success'),
                        description: t('work_items_management.manage_dialog.messages.create_success'),
                        variant: 'success',
                    });
                    resetForm();
                },
                onError: () => {
                    toast({
                        title: t('work_items_management.manage_dialog.messages.error'),
                        description: t('work_items_management.manage_dialog.messages.create_error'),
                        variant: 'destructive',
                    });
                },
            });
        }
    };

    const handleDeleteClick = (workItem: WorkItem) => {
        setItemToDelete(workItem);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!itemToDelete) return;

        destroy(route('admin.work-items.destroy', itemToDelete.id), {
            onSuccess: () => {
                toast({
                    title: t('work_items_management.manage_dialog.messages.success'),
                    description: t('work_items_management.manage_dialog.messages.delete_success'),
                    variant: 'success',
                });
                setItemToDelete(null);
            },
            onError: () => {
                toast({
                    title: t('work_items_management.manage_dialog.messages.error'),
                    description: t('work_items_management.manage_dialog.messages.delete_error'),
                    variant: 'destructive',
                });
                setItemToDelete(null);
            },
        });
    };

    const resetForm = () => {
        reset();
        setEditingItem(null);
        setShowForm(false);
    };

    const startEdit = (workItem: WorkItem) => {
        setData({
            name: workItem.name,
            is_required: workItem.is_required,
        });
        setEditingItem(workItem);
        setShowForm(true);
    };

    const startCreate = () => {
        reset();
        if (isHeadmaster) {
            setData('is_required', true);
        }
        setEditingItem(null);
        setShowForm(true);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t('work_items_management.manage_dialog.title')}</DialogTitle>
                    <DialogDescription>
                        {isHeadmaster
                            ? t('work_items_management.manage_dialog.description_headmaster')
                            : t('work_items_management.manage_dialog.description_admin')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Create/Edit Form */}
                    {showForm ? (
                        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium">{editingItem ? t('work_items_management.manage_dialog.form.edit_title') : t('work_items_management.manage_dialog.form.create_title')}</h3>
                                <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                                    {t('work_items_management.manage_dialog.form.cancel')}
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">{t('work_items_management.manage_dialog.form.name_label')}</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder={t('work_items_management.manage_dialog.form.name_placeholder')}
                                    required
                                />
                                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                            </div>

                            {canCreateRequired && (
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_required"
                                        checked={data.is_required}
                                        onCheckedChange={(checked) => setData('is_required', !!checked)}
                                        disabled={isHeadmaster}
                                    />
                                    <Label htmlFor="is_required" className={isHeadmaster ? 'text-muted-foreground' : ''}>
                                        {t('work_items_management.manage_dialog.form.required_label')}
                                        {isHeadmaster && <span className="block text-xs">{t('work_items_management.manage_dialog.form.required_note')}</span>}
                                    </Label>
                                </div>
                            )}

                            <Button type="submit" disabled={processing}>
                                {processing ? t('work_items_management.manage_dialog.form.saving') : editingItem ? t('work_items_management.manage_dialog.form.update') : t('work_items_management.manage_dialog.form.create')}
                            </Button>
                        </form>
                    ) : (
                        <Button onClick={startCreate}>
                            <Plus className="mr-2 h-4 w-4" />
                            {t('work_items_management.manage_dialog.add_button')}
                        </Button>
                    )}

                    {/* Work Items List */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-medium">{t('work_items_management.manage_dialog.existing_title')}</h3>

                        {workItems.length === 0 ? (
                            <p className="py-4 text-center text-gray-500">{t('work_items_management.manage_dialog.empty_state')}</p>
                        ) : (
                            <div className="space-y-2">
                                {workItems.map((workItem) => (
                                    <div key={workItem.id} className="flex items-center justify-between rounded-lg border p-3">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <p className="font-medium">{workItem.name}</p>
                                                <p className="text-sm text-gray-500">{t('work_items_management.manage_dialog.created_by')} {t(`work_items_management.roles.${workItem.created_by_role}`) || workItem.created_by_role.replace('_', ' ')}</p>
                                            </div>
                                            <Badge variant={workItem.is_required ? 'destructive' : 'secondary'}>
                                                {workItem.is_required ? t('work_items_management.work_item_status.required') : t('work_items_management.work_item_status.optional')}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => startEdit(workItem)}>
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteClick(workItem)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>

            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title={t('work_items_management.manage_dialog.delete_dialog.title')}
                description={t('work_items_management.manage_dialog.delete_dialog.description')}
                itemName={itemToDelete?.name}
                itemType={t('work_items_management.manage_dialog.delete_dialog.item_type')}
                onConfirm={handleConfirmDelete}
                isLoading={processing}
            />
        </Dialog>
    );
}
