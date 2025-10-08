import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Dropzone from '@/components/ui/dropzone';

import { useToast } from '@/hooks/use-toast';
import { extracurricularService } from '@/services/extracurricular-service';
import { ExtracurricularFormData, ExtracurricularFormErrors, ExtracurricularWithPhoto } from '@/types/extracurricular';
import { extracurricularUtils } from '@/utils/extracurricular-utils';

import { ExtracurricularDescriptionField } from './extracurricular-description-field';
import { ExtracurricularNameSelector } from './extracurricular-name-selector';

interface ExtracurricularFormProps {
    extracurricular?: ExtracurricularWithPhoto;
    isEditing?: boolean;
    onCancel?: () => void;
    onSuccess?: () => void;
}

export default function ExtracurricularForm({ extracurricular, isEditing = false, onCancel, onSuccess }: ExtracurricularFormProps) {
    const { toast } = useToast();
    const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
    const [removeExistingPhoto, setRemoveExistingPhoto] = useState(false);

    const { data, setData, processing, errors, reset } = useForm({
        name: extracurricular?.name || '',
        description: extracurricular?.description || '',
        photo: null as File | null,
        remove_photo: false,
    });

    const validationErrors = useMemo((): ExtracurricularFormErrors => {
        const nameError = extracurricularUtils.validateExtracurricularName(data.name);
        const descriptionError = extracurricularUtils.validateDescription(data.description);

        return {
            name: nameError || errors.name,
            description: descriptionError || errors.description,
            photo: errors.photo,
        };
    }, [data.name, data.description, errors]);

    const hasValidationErrors = useMemo(() => {
        return Object.values(validationErrors).some((error) => error);
    }, [validationErrors]);

    const handleNameChange = useCallback(
        (name: string) => {
            setData('name', name);
        },
        [setData],
    );

    const handleDescriptionChange = useCallback(
        (description: string) => {
            setData('description', description);
        },
        [setData],
    );

    const handlePhotoChange = useCallback(
        (file: File | null) => {
            setSelectedPhoto(file);
            setData('photo', file);

            if (file === null && extracurricular?.photo) {
                setRemoveExistingPhoto(true);
            } else {
                setRemoveExistingPhoto(false);
            }
        },
        [setData, extracurricular?.photo],
    );

    const handleSuccess = useCallback(() => {
        toast({
            title: 'Success',
            description: `Extracurricular activity ${isEditing ? 'updated' : 'created'} successfully.`,
            variant: 'success',
        });

        if (!isEditing) {
            reset();
            setSelectedPhoto(null);
            setRemoveExistingPhoto(false);
        }

        onSuccess?.();
    }, [isEditing, reset, toast, onSuccess]);

    const handleError = useCallback(
        (_submitErrors?: Record<string, string>) => {
            toast({
                title: 'Error',
                description: `Failed to ${isEditing ? 'update' : 'create'} extracurricular activity.`,
                variant: 'destructive',
            });
        },
        [isEditing, toast],
    );

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();

            if (hasValidationErrors) {
                toast({
                    title: 'Validation Error',
                    description: 'Please fix the errors before submitting.',
                    variant: 'destructive',
                });
                return;
            }

            const formData: ExtracurricularFormData = {
                name: data.name,
                description: data.description,
                photo: selectedPhoto,
                remove_photo: removeExistingPhoto,
            };

            const options = {
                onSuccess: handleSuccess,
                onError: handleError,
            };

            if (isEditing && extracurricular) {
                extracurricularService.update(extracurricular, formData, options);
            } else {
                extracurricularService.create(formData, options);
            }
        },
        [hasValidationErrors, data, selectedPhoto, removeExistingPhoto, isEditing, extracurricular, handleSuccess, handleError, toast],
    );

    const formTitle = isEditing ? 'Edit Extracurricular Activity' : 'Create New Extracurricular Activity';

    return (
        <Card>
            <CardHeader>
                <CardTitle>{formTitle}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <ExtracurricularNameSelector
                        value={data.name}
                        onChange={handleNameChange}
                        error={validationErrors.name}
                        isEditing={isEditing}
                        originalName={extracurricular?.name}
                    />

                    <ExtracurricularDescriptionField
                        value={data.description}
                        onChange={handleDescriptionChange}
                        error={validationErrors.description}
                    />

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Activity Photo (Optional)</label>
                        <Dropzone
                            onFileSelect={handlePhotoChange}
                            currentImage={extracurricular?.photo}
                            currentImageUrl={extracurricular?.photo_url}
                            className="w-full"
                        />
                        {validationErrors.photo && <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.photo}</p>}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="submit" disabled={processing || hasValidationErrors} className="flex-1 sm:flex-none">
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? 'Update Activity' : 'Create Activity'}
                        </Button>

                        {onCancel && (
                            <Button type="button" variant="outline" onClick={onCancel} disabled={processing} className="flex-1 sm:flex-none">
                                Cancel
                            </Button>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
