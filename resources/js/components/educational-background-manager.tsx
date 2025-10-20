import { router } from '@inertiajs/react';
import { Edit, GraduationCap, Plus, Save, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface EducationalBackground {
    id: number;
    degree: string;
    field_of_study: string;
    institution: string;
    graduation_year: number;
    description?: string;
}

interface Staff {
    id: number;
    name: string;
    educationalBackgrounds?: EducationalBackground[];
    educational_background?: EducationalBackground[];
}

interface EducationalBackgroundManagerProps {
    staff: Staff;
}

type EducationalBackgroundForm = {
    degree: string;
    field_of_study: string;
    institution: string;
    graduation_year: string;
    description: string;
};

export default function EducationalBackgroundManager({ staff }: EducationalBackgroundManagerProps) {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // Dialog states
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

    // Get educational background from either property name
    const educationalBackgrounds = staff.educationalBackgrounds || staff.educational_background || [];

    const [newEducationForm, setNewEducationForm] = useState<EducationalBackgroundForm>({
        degree: '',
        field_of_study: '',
        institution: '',
        graduation_year: '',
        description: '',
    });

    const [editForm, setEditForm] = useState<EducationalBackgroundForm>({
        degree: '',
        field_of_study: '',
        institution: '',
        graduation_year: '',
        description: '',
    });

    const handleAdd = () => {
        setErrors({});

        // Basic validation
        const newErrors: Record<string, string> = {};
        if (!newEducationForm.degree.trim()) {
            newErrors.degree = t('staff_management.educational_background.validation.degree_required');
        }
        if (!newEducationForm.field_of_study.trim()) {
            newErrors.field_of_study = t('staff_management.educational_background.validation.field_of_study_required');
        }
        if (!newEducationForm.institution.trim()) {
            newErrors.institution = t('staff_management.educational_background.validation.institution_required');
        }
        if (!newEducationForm.graduation_year.trim()) {
            newErrors.graduation_year = t('staff_management.educational_background.validation.graduation_year_required');
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Submit to backend
        router.post(
            route('admin.educational-background.store'),
            {
                staff_id: staff.id,
                degree: newEducationForm.degree,
                field_of_study: newEducationForm.field_of_study,
                institution: newEducationForm.institution,
                graduation_year: newEducationForm.graduation_year,
                description: newEducationForm.description || null,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast({
                        title: t('success'),
                        description: t('staff_management.educational_background.messages.add_success'),
                        variant: 'success',
                    });
                    setIsAdding(false);
                    setNewEducationForm({ degree: '', field_of_study: '', institution: '', graduation_year: '', description: '' });
                    setErrors({});
                    setSelectedIds([]); // Clear selections after successful add
                },
                onError: (errors) => {
                    setErrors(errors);
                    toast({
                        title: t('error'),
                        description: t('staff_management.educational_background.messages.add_error'),
                        variant: 'destructive',
                    });
                },
            },
        );
    };

    const handleEdit = (education: EducationalBackground) => {
        setEditingId(education.id);
        setEditForm({
            degree: education.degree,
            field_of_study: education.field_of_study,
            institution: education.institution,
            graduation_year: education.graduation_year.toString(),
            description: education.description || '',
        });
        setErrors({});
    };

    const handleUpdate = () => {
        if (!editingId) return;

        setErrors({});

        // Basic validation
        const newErrors: Record<string, string> = {};
        if (!editForm.degree.trim()) {
            newErrors.degree = t('staff_management.educational_background.validation.degree_required');
        }
        if (!editForm.field_of_study.trim()) {
            newErrors.field_of_study = t('staff_management.educational_background.validation.field_of_study_required');
        }
        if (!editForm.institution.trim()) {
            newErrors.institution = t('staff_management.educational_background.validation.institution_required');
        }
        if (!editForm.graduation_year.trim()) {
            newErrors.graduation_year = t('staff_management.educational_background.validation.graduation_year_required');
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Submit to backend
        router.put(
            route('admin.educational-background.update', editingId),
            {
                staff_id: staff.id,
                degree: editForm.degree,
                field_of_study: editForm.field_of_study,
                institution: editForm.institution,
                graduation_year: editForm.graduation_year,
                description: editForm.description || null,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast({
                        title: t('success'),
                        description: t('staff_management.educational_background.messages.update_success'),
                        variant: 'success',
                    });
                    setEditingId(null);
                    setEditForm({ degree: '', field_of_study: '', institution: '', graduation_year: '', description: '' });
                    setErrors({});
                    setSelectedIds([]); // Clear selections after successful update
                },
                onError: (errors) => {
                    setErrors(errors);
                    toast({
                        title: t('error'),
                        description: t('staff_management.educational_background.messages.update_error'),
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

        router.delete(route('admin.educational-background.destroy', deleteItemId), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                toast({
                    title: t('common.success'),
                    description: t('staff_management.educational_background.messages.delete_success'),
                    variant: 'success',
                });
                setSelectedIds([]); // Clear selections after successful delete
                setDeleteDialogOpen(false);
                setDeleteItemId(null);
            },
            onError: () => {
                toast({
                    title: t('common.error'),
                    description: t('staff_management.educational_background.messages.delete_error'),
                    variant: 'destructive',
                });
                setDeleteDialogOpen(false);
                setDeleteItemId(null);
            },
        });
    };

    const handleCancelAdd = () => {
        setIsAdding(false);
        setNewEducationForm({ degree: '', field_of_study: '', institution: '', graduation_year: '', description: '' });
        setErrors({});
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm({ degree: '', field_of_study: '', institution: '', graduation_year: '', description: '' });
        setErrors({});
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(educationalBackgrounds.map((education) => education.id));
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
        router.delete(route('admin.educational-background.bulk-destroy'), {
            data: { ids: selectedIds },
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                toast({
                    title: t('common.success'),
                    description: `${selectedIds.length} ${t('staff_management.educational_background.messages.bulk_delete_success')}`,
                    variant: 'success',
                });
                setSelectedIds([]);
                setBulkDeleteDialogOpen(false);
            },
            onError: () => {
                toast({
                    title: t('common.error'),
                    description: t('staff_management.educational_background.messages.bulk_delete_error'),
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
                        <div className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-green-600" />
                            <CardTitle>{t('staff_management.educational_background.title')}</CardTitle>
                        </div>
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
                                    {t('staff_management.educational_background.delete_selected')} ({selectedIds.length})
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
                                {t('staff_management.educational_background.add_education')}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Add New Education Form */}
                    {isAdding && (
                        <div className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-800">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="new-degree">{t('staff_management.educational_background.degree')} *</Label>
                                    <Input
                                        id="new-degree"
                                        type="text"
                                        value={newEducationForm.degree}
                                        onChange={(e) => setNewEducationForm((prev) => ({ ...prev, degree: e.target.value }))}
                                        placeholder={t('staff_management.educational_background.placeholders.degree')}
                                    />
                                    <InputError message={errors.degree} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-field-of-study">{t('staff_management.educational_background.field_of_study')} *</Label>
                                    <Input
                                        id="new-field-of-study"
                                        type="text"
                                        value={newEducationForm.field_of_study}
                                        onChange={(e) => setNewEducationForm((prev) => ({ ...prev, field_of_study: e.target.value }))}
                                        placeholder={t('staff_management.educational_background.placeholders.field_of_study')}
                                    />
                                    <InputError message={errors.field_of_study} />
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="new-institution">{t('staff_management.educational_background.institution')} *</Label>
                                        <Input
                                            id="new-institution"
                                            type="text"
                                            value={newEducationForm.institution}
                                            onChange={(e) => setNewEducationForm((prev) => ({ ...prev, institution: e.target.value }))}
                                            placeholder={t('staff_management.educational_background.placeholders.institution')}
                                        />
                                        <InputError message={errors.institution} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new-graduation-year">{t('staff_management.educational_background.graduation_year')} *</Label>
                                        <Input
                                            id="new-graduation-year"
                                            type="number"
                                            value={newEducationForm.graduation_year}
                                            onChange={(e) => setNewEducationForm((prev) => ({ ...prev, graduation_year: e.target.value }))}
                                            placeholder={t('staff_management.educational_background.placeholders.graduation_year')}
                                            min="1900"
                                            max="2100"
                                        />
                                        <InputError message={errors.graduation_year} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-description">{t('staff_management.educational_background.description')}</Label>
                                    <Textarea
                                        id="new-description"
                                        value={newEducationForm.description}
                                        onChange={(e) => setNewEducationForm((prev) => ({ ...prev, description: e.target.value }))}
                                        placeholder={t('staff_management.educational_background.placeholders.description')}
                                        rows={3}
                                    />
                                    <InputError message={errors.description} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button type="button" size="sm" onClick={handleAdd}>
                                        <Save className="mr-2 h-4 w-4" />
                                        {t('staff_management.educational_background.save')}
                                    </Button>
                                    <Button type="button" variant="ghost" size="sm" onClick={handleCancelAdd}>
                                        <X className="mr-2 h-4 w-4" />
                                        {t('staff_management.educational_background.cancel')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Existing Educational Background */}
                    {educationalBackgrounds && educationalBackgrounds.length > 0 ? (
                        <div className="space-y-3">
                            {/* Select All Checkbox */}
                            <div className="flex items-center gap-2 border-b p-2">
                                <Checkbox
                                    checked={selectedIds.length === educationalBackgrounds.length && educationalBackgrounds.length > 0}
                                    onCheckedChange={handleSelectAll}
                                />
                                <Label className="text-sm text-gray-600 dark:text-gray-400">
                                    {t('staff_management.educational_background.select_all')} ({educationalBackgrounds.length}{' '}
                                    {t('staff_management.educational_background.records')})
                                </Label>
                            </div>

                            {educationalBackgrounds.map((education) => (
                                <div key={education.id} className="rounded-lg border p-4">
                                    {editingId === education.id ? (
                                        /* Edit Form */
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor={`edit-degree-${education.id}`}>
                                                    {t('staff_management.educational_background.degree')} *
                                                </Label>
                                                <Input
                                                    id={`edit-degree-${education.id}`}
                                                    type="text"
                                                    value={editForm.degree}
                                                    onChange={(e) => setEditForm((prev) => ({ ...prev, degree: e.target.value }))}
                                                    placeholder={t('staff_management.educational_background.placeholders.degree')}
                                                />
                                                <InputError message={errors.degree} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`edit-field-of-study-${education.id}`}>
                                                    {t('staff_management.educational_background.field_of_study')} *
                                                </Label>
                                                <Input
                                                    id={`edit-field-of-study-${education.id}`}
                                                    type="text"
                                                    value={editForm.field_of_study}
                                                    onChange={(e) => setEditForm((prev) => ({ ...prev, field_of_study: e.target.value }))}
                                                    placeholder={t('staff_management.educational_background.placeholders.field_of_study')}
                                                />
                                                <InputError message={errors.field_of_study} />
                                            </div>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor={`edit-institution-${education.id}`}>
                                                        {t('staff_management.educational_background.institution')} *
                                                    </Label>
                                                    <Input
                                                        id={`edit-institution-${education.id}`}
                                                        type="text"
                                                        value={editForm.institution}
                                                        onChange={(e) => setEditForm((prev) => ({ ...prev, institution: e.target.value }))}
                                                        placeholder={t('staff_management.educational_background.placeholders.institution')}
                                                    />
                                                    <InputError message={errors.institution} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`edit-graduation-year-${education.id}`}>
                                                        {t('staff_management.educational_background.graduation_year')} *
                                                    </Label>
                                                    <Input
                                                        id={`edit-graduation-year-${education.id}`}
                                                        type="number"
                                                        value={editForm.graduation_year}
                                                        onChange={(e) => setEditForm((prev) => ({ ...prev, graduation_year: e.target.value }))}
                                                        placeholder={t('staff_management.educational_background.placeholders.graduation_year')}
                                                        min="1900"
                                                        max="2100"
                                                    />
                                                    <InputError message={errors.graduation_year} />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`edit-description-${education.id}`}>
                                                    {t('staff_management.educational_background.description')}
                                                </Label>
                                                <Textarea
                                                    id={`edit-description-${education.id}`}
                                                    value={editForm.description}
                                                    onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                                                    placeholder={t('staff_management.educational_background.placeholders.description')}
                                                    rows={3}
                                                />
                                                <InputError message={errors.description} />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button type="button" size="sm" onClick={handleUpdate}>
                                                    <Save className="mr-2 h-4 w-4" />
                                                    {t('staff_management.educational_background.save')}
                                                </Button>
                                                <Button type="button" variant="ghost" size="sm" onClick={handleCancelEdit}>
                                                    <X className="mr-2 h-4 w-4" />
                                                    {t('staff_management.educational_background.cancel')}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Display Mode */
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <Checkbox
                                                    checked={selectedIds.includes(education.id)}
                                                    onCheckedChange={(checked) => handleSelectItem(education.id, checked as boolean)}
                                                    disabled={isAdding || editingId !== null}
                                                />
                                                <div>
                                                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{education.degree}</h4>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300">{education.field_of_study}</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{education.institution}</p>
                                                    <p className="text-sm text-green-600 dark:text-green-400">Lulus {education.graduation_year}</p>
                                                    {education.description && (
                                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{education.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(education)}
                                                    disabled={isAdding || editingId !== null}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(education.id)}
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
                            <GraduationCap className="mx-auto mb-2 h-12 w-12 text-gray-300" />
                            <p>{t('staff_management.educational_background.no_records')}</p>
                            <p className="text-sm">{t('staff_management.educational_background.add_first_record')}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('staff_management.educational_background.dialogs.delete_title')}</DialogTitle>
                        <DialogDescription>{t('staff_management.educational_background.dialogs.delete_description')}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
                            {t('staff_management.educational_background.dialogs.cancel')}
                        </Button>
                        <Button type="button" variant="destructive" onClick={confirmDelete}>
                            {t('staff_management.educational_background.dialogs.delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Delete Confirmation Dialog */}
            <Dialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('staff_management.educational_background.dialogs.bulk_delete_title')}</DialogTitle>
                        <DialogDescription>
                            {t('staff_management.educational_background.dialogs.bulk_delete_description', { count: selectedIds.length })}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setBulkDeleteDialogOpen(false)}>
                            {t('staff_management.educational_background.dialogs.cancel')}
                        </Button>
                        <Button type="button" variant="destructive" onClick={confirmBulkDelete}>
                            {t('staff_management.educational_background.dialogs.delete_count', { count: selectedIds.length })}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
