import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation('common');
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
        const translationKey = isEditing ? 'extracurricular_edit' : 'extracurricular_create';
        toast({
            title: t(`${translationKey}.messages.success_title`),
            description: t(`${translationKey}.messages.success_description`),
            variant: 'success',
        });

        if (!isEditing) {
            reset();
            setSelectedPhoto(null);
            setRemoveExistingPhoto(false);
        }

        onSuccess?.();
    }, [isEditing, reset, toast, onSuccess, t]);

    const handleError = useCallback(() => {
        const translationKey = isEditing ? 'extracurricular_edit' : 'extracurricular_create';
        toast({
            title: t(`${translationKey}.messages.error_title`),
            description: t(`${translationKey}.messages.error_description`),
            variant: 'destructive',
        });
    }, [isEditing, toast, t]);

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();

            if (hasValidationErrors) {
                const translationKey = isEditing ? 'extracurricular_edit' : 'extracurricular_create';
                toast({
                    title: t(`${translationKey}.messages.validation_error_title`),
                    description: t(`${translationKey}.messages.validation_error_description`),
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
        [hasValidationErrors, data, selectedPhoto, removeExistingPhoto, isEditing, extracurricular, handleSuccess, handleError, toast, t],
    );

    const translationKey = isEditing ? 'extracurricular_edit' : 'extracurricular_create';
    const formTitle = t(`${translationKey}.form.title`);

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
                        isEditing={isEditing}
                    />

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t(`${translationKey}.form.photo_label`)}</label>
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
                            {processing
                                ? t(`${translationKey}.form.${isEditing ? 'updating' : 'creating'}`)
                                : t(`${translationKey}.form.${isEditing ? 'update_button' : 'create_button'}`)}
                        </Button>

                        {onCancel && (
                            <Button type="button" variant="outline" onClick={onCancel} disabled={processing} className="flex-1 sm:flex-none">
                                {t(`${translationKey}.form.cancel_button`)}
                            </Button>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
