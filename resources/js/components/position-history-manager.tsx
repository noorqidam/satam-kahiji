import { router } from '@inertiajs/react';
import { Edit, Plus, Save, Trash2, X } from 'lucide-react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface PositionHistory {
    id: number;
    title: string;
    start_year: number;
    end_year: number | null;
}

interface Staff {
    id: number;
    name: string;
    positionHistory?: PositionHistory[];
    position_history?: PositionHistory[];
}

interface PositionHistoryManagerProps {
    staff: Staff;
}

type PositionHistoryForm = {
    title: string;
    start_year: string;
    end_year: string;
};

export default function PositionHistoryManager({ staff }: PositionHistoryManagerProps) {
    const { toast } = useToast();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // Dialog states
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

    // Get position history from either property name
    const positionHistory = staff.positionHistory || staff.position_history || [];

    const [newPositionForm, setNewPositionForm] = useState<PositionHistoryForm>({
        title: '',
        start_year: '',
        end_year: '',
    });

    const [editForm, setEditForm] = useState<PositionHistoryForm>({
        title: '',
        start_year: '',
        end_year: '',
    });

    const handleAdd = () => {
        setErrors({});

        // Basic validation
        const newErrors: Record<string, string> = {};
        if (!newPositionForm.title.trim()) {
            newErrors.title = 'Position title is required';
        }
        if (!newPositionForm.start_year.trim()) {
            newErrors.start_year = 'Start year is required';
        }
        if (newPositionForm.end_year && parseInt(newPositionForm.end_year) < parseInt(newPositionForm.start_year)) {
            newErrors.end_year = 'End year must be greater than or equal to start year';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Submit to backend
        router.post(
            route('admin.position-history.store'),
            {
                staff_id: staff.id,
                title: newPositionForm.title,
                start_year: newPositionForm.start_year,
                end_year: newPositionForm.end_year || null,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast({
                        title: 'Success',
                        description: 'Position history added successfully.',
                        variant: 'success',
                    });
                    setIsAdding(false);
                    setNewPositionForm({ title: '', start_year: '', end_year: '' });
                    setErrors({});
                    setSelectedIds([]); // Clear selections after successful add
                },
                onError: (errors) => {
                    setErrors(errors);
                    toast({
                        title: 'Error',
                        description: 'Failed to add position history.',
                        variant: 'destructive',
                    });
                },
            },
        );
    };

    const handleEdit = (position: PositionHistory) => {
        setEditingId(position.id);
        setEditForm({
            title: position.title,
            start_year: position.start_year.toString(),
            end_year: position.end_year?.toString() || '',
        });
        setErrors({});
    };

    const handleUpdate = () => {
        if (!editingId) return;

        setErrors({});

        // Basic validation
        const newErrors: Record<string, string> = {};
        if (!editForm.title.trim()) {
            newErrors.title = 'Position title is required';
        }
        if (!editForm.start_year.trim()) {
            newErrors.start_year = 'Start year is required';
        }
        if (editForm.end_year && parseInt(editForm.end_year) < parseInt(editForm.start_year)) {
            newErrors.end_year = 'End year must be greater than or equal to start year';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Submit to backend
        router.put(
            route('admin.position-history.update', editingId),
            {
                staff_id: staff.id,
                title: editForm.title,
                start_year: editForm.start_year,
                end_year: editForm.end_year || null,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast({
                        title: 'Success',
                        description: 'Position history updated successfully.',
                        variant: 'success',
                    });
                    setEditingId(null);
                    setEditForm({ title: '', start_year: '', end_year: '' });
                    setErrors({});
                    setSelectedIds([]); // Clear selections after successful update
                },
                onError: (errors) => {
                    setErrors(errors);
                    toast({
                        title: 'Error',
                        description: 'Failed to update position history.',
                        variant: 'destructive',
                    });
                },
            },
        );
    };

    const handleDelete = (id: number) => {
        setDeleteItemId(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!deleteItemId) return;

        router.delete(route('admin.position-history.destroy', deleteItemId), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                toast({
                    title: 'Success',
                    description: 'Position history deleted successfully.',
                    variant: 'success',
                });
                setSelectedIds([]); // Clear selections after successful delete
                setDeleteDialogOpen(false);
                setDeleteItemId(null);
            },
            onError: () => {
                toast({
                    title: 'Error',
                    description: 'Failed to delete position history.',
                    variant: 'destructive',
                });
                setDeleteDialogOpen(false);
                setDeleteItemId(null);
            },
        });
    };

    const handleCancelAdd = () => {
        setIsAdding(false);
        setNewPositionForm({ title: '', start_year: '', end_year: '' });
        setErrors({});
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm({ title: '', start_year: '', end_year: '' });
        setErrors({});
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(positionHistory.map((position) => position.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectItem = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedIds((prev) => [...prev, id]);
        } else {
            setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
        }
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        setBulkDeleteDialogOpen(true);
    };

    const confirmBulkDelete = () => {
        router.delete(route('admin.position-history.bulk-destroy'), {
            data: { ids: selectedIds },
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                toast({
                    title: 'Success',
                    description: `${selectedIds.length} position history record(s) deleted successfully.`,
                    variant: 'success',
                });
                setSelectedIds([]);
                setBulkDeleteDialogOpen(false);
            },
            onError: () => {
                toast({
                    title: 'Error',
                    description: 'Failed to delete position history records.',
                    variant: 'destructive',
                });
                setBulkDeleteDialogOpen(false);
            },
        });
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Position History</CardTitle>
                        <div className="flex items-center gap-2">
                            {selectedIds.length > 0 && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleBulkDelete}
                                    disabled={isAdding || editingId !== null}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Selected ({selectedIds.length})
                                </Button>
                            )}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsAdding(true)}
                                disabled={isAdding || editingId !== null}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Position
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Add New Position Form */}
                    {isAdding && (
                        <div className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-800">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="new-title">Position Title *</Label>
                                    <Input
                                        id="new-title"
                                        type="text"
                                        value={newPositionForm.title}
                                        onChange={(e) => setNewPositionForm((prev) => ({ ...prev, title: e.target.value }))}
                                        placeholder="e.g., Head of Mathematics Department"
                                    />
                                    <InputError message={errors.title} />
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="new-start-year">Start Year *</Label>
                                        <Input
                                            id="new-start-year"
                                            type="number"
                                            value={newPositionForm.start_year}
                                            onChange={(e) => setNewPositionForm((prev) => ({ ...prev, start_year: e.target.value }))}
                                            placeholder="2023"
                                            min="1900"
                                            max="2100"
                                        />
                                        <InputError message={errors.start_year} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new-end-year">End Year</Label>
                                        <Input
                                            id="new-end-year"
                                            type="number"
                                            value={newPositionForm.end_year}
                                            onChange={(e) => setNewPositionForm((prev) => ({ ...prev, end_year: e.target.value }))}
                                            placeholder="2024 (leave empty if ongoing)"
                                            min="1900"
                                            max="2100"
                                        />
                                        <InputError message={errors.end_year} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button type="button" size="sm" onClick={handleAdd}>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save
                                    </Button>
                                    <Button type="button" variant="ghost" size="sm" onClick={handleCancelAdd}>
                                        <X className="mr-2 h-4 w-4" />
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Existing Position History */}
                    {positionHistory && positionHistory.length > 0 ? (
                        <div className="space-y-3">
                            {/* Select All Checkbox */}
                            <div className="flex items-center gap-2 border-b p-2">
                                <Checkbox
                                    checked={selectedIds.length === positionHistory.length && positionHistory.length > 0}
                                    onCheckedChange={handleSelectAll}
                                />
                                <Label className="text-sm text-gray-600 dark:text-gray-400">Select All ({positionHistory.length} records)</Label>
                            </div>

                            {positionHistory.map((position) => (
                                <div key={position.id} className="rounded-lg border p-4">
                                    {editingId === position.id ? (
                                        /* Edit Form */
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor={`edit-title-${position.id}`}>Position Title *</Label>
                                                <Input
                                                    id={`edit-title-${position.id}`}
                                                    type="text"
                                                    value={editForm.title}
                                                    onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                                                    placeholder="e.g., Head of Mathematics Department"
                                                />
                                                <InputError message={errors.title} />
                                            </div>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor={`edit-start-year-${position.id}`}>Start Year *</Label>
                                                    <Input
                                                        id={`edit-start-year-${position.id}`}
                                                        type="number"
                                                        value={editForm.start_year}
                                                        onChange={(e) => setEditForm((prev) => ({ ...prev, start_year: e.target.value }))}
                                                        placeholder="2023"
                                                        min="1900"
                                                        max="2100"
                                                    />
                                                    <InputError message={errors.start_year} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`edit-end-year-${position.id}`}>End Year</Label>
                                                    <Input
                                                        id={`edit-end-year-${position.id}`}
                                                        type="number"
                                                        value={editForm.end_year}
                                                        onChange={(e) => setEditForm((prev) => ({ ...prev, end_year: e.target.value }))}
                                                        placeholder="2024 (leave empty if ongoing)"
                                                        min="1900"
                                                        max="2100"
                                                    />
                                                    <InputError message={errors.end_year} />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button type="button" size="sm" onClick={handleUpdate}>
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Save
                                                </Button>
                                                <Button type="button" variant="ghost" size="sm" onClick={handleCancelEdit}>
                                                    <X className="mr-2 h-4 w-4" />
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Display Mode */
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    checked={selectedIds.includes(position.id)}
                                                    onCheckedChange={(checked) => handleSelectItem(position.id, checked as boolean)}
                                                    disabled={isAdding || editingId !== null}
                                                />
                                                <div>
                                                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{position.title}</h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {position.start_year} - {position.end_year || 'Present'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(position)}
                                                    disabled={isAdding || editingId !== null}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(position.id)}
                                                    disabled={isAdding || editingId !== null}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                            <p>No position history records found.</p>
                            <p className="text-sm">Click "Add Position" to add the first record.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Position History</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this position history record? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="button" variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Delete Confirmation Dialog */}
            <Dialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Multiple Records</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {selectedIds.length} position history record(s)? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setBulkDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="button" variant="destructive" onClick={confirmBulkDelete}>
                            Delete {selectedIds.length} Record(s)
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
