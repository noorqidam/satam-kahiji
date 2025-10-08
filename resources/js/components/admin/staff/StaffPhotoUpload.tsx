import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, User, X } from 'lucide-react';

interface StaffPhotoUploadProps {
    photoPreview: string | null;
    photoError: string | null;
    formErrors: string | undefined;
    onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemovePhoto: () => void;
}

export function StaffPhotoUpload({ photoPreview, photoError, formErrors, onPhotoChange, onRemovePhoto }: StaffPhotoUploadProps) {
    return (
        <div className="flex flex-col items-center lg:w-1/3">
            <div className="mb-4 text-center">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Profile Photo</h3>
            </div>
            <div className="flex items-start gap-4">
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                    {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="h-32 w-32 rounded-full object-cover" />
                    ) : (
                        <User className="h-16 w-16 text-gray-400" />
                    )}
                </div>

                <div className="flex flex-col gap-2 pt-2">
                    {photoPreview ? (
                        <>
                            <Label htmlFor="photo" className="cursor-pointer">
                                <Button type="button" variant="outline" size="sm" asChild>
                                    <span>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Change Photo
                                    </span>
                                </Button>
                            </Label>
                            <Button type="button" variant="ghost" size="sm" onClick={onRemovePhoto}>
                                <X className="mr-2 h-4 w-4" />
                                Remove
                            </Button>
                        </>
                    ) : (
                        <Label htmlFor="photo" className="cursor-pointer">
                            <Button type="button" variant="outline" asChild>
                                <span>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Photo
                                </span>
                            </Button>
                        </Label>
                    )}

                    <input id="photo" type="file" accept="image/*" onChange={onPhotoChange} className="hidden" />

                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">JPG, PNG, GIF up to 10MB</p>
                    </div>

                    {photoError && (
                        <div>
                            <p className="text-sm text-red-600 dark:text-red-400">{photoError}</p>
                        </div>
                    )}

                    <InputError message={formErrors} />
                </div>
            </div>
        </div>
    );
}
