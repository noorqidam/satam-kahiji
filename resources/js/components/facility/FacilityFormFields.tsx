// Single Responsibility: Render facility form fields
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Dropzone from '@/components/ui/dropzone';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Facility, FacilityFormData } from '@/types/facility';
import { Link } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Building2, CheckCircle, Eye, Save } from 'lucide-react';

interface FacilityFormFieldsProps {
    facility?: Facility;
    data: FacilityFormData;
    errors: Record<string, string | undefined>;
    processing: boolean;
    mounted: boolean;
    onDataChange: (field: keyof FacilityFormData, value: any) => void;
    onImageSelect: (file: File | null) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export function FacilityFormFields({ facility, data, errors, processing, mounted, onDataChange, onImageSelect, onSubmit }: FacilityFormFieldsProps) {
    const isEditing = !!facility;

    return (
        <form onSubmit={onSubmit}>
            <Card className="hover:shadow-3xl gap-0 rounded-xl py-0 shadow-2xl transition-all duration-300">
                <CardHeader className="rounded-t-xl bg-blue-600 px-6 py-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm">
                                <Building2 className="h-7 w-7" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-bold">{isEditing ? 'Edit Facility' : 'Create New Facility'}</CardTitle>
                                <CardDescription className="text-blue-100">
                                    {isEditing ? 'Update facility information and manage its photo' : 'Add a new facility with secure cloud storage'}
                                </CardDescription>
                            </div>
                        </div>

                        {isEditing && (
                            <Link href={route('admin.facilities.show', facility!.id)}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-white/20 bg-white/10 text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20"
                                >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View
                                </Button>
                            </Link>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="space-y-6 p-6">
                    {/* Name Field */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-base font-semibold">
                            Facility Name *
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => onDataChange('name', e.target.value)}
                            className={`transition-all duration-200 ${
                                errors.name
                                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:bg-red-900/20 dark:focus:border-red-500'
                                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                            }`}
                            placeholder="Enter facility name"
                            disabled={processing}
                            maxLength={255}
                        />
                        {errors.name && (
                            <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm">{errors.name}</span>
                            </div>
                        )}
                    </div>

                    {/* Description Field */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-base font-semibold">
                            Description *
                        </Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => onDataChange('description', e.target.value)}
                            className={`min-h-32 resize-none transition-all duration-200 ${
                                errors.description
                                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:bg-red-900/20 dark:focus:border-red-500'
                                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                            }`}
                            placeholder="Provide a detailed description of the facility..."
                            disabled={processing}
                            maxLength={5000}
                        />
                        <div className="flex items-center justify-between">
                            {errors.description && (
                                <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                    <AlertCircle className="h-4 w-4" />
                                    <span className="text-sm">{errors.description}</span>
                                </div>
                            )}
                            <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">{data.description.length}/5000</span>
                        </div>
                    </div>

                    {/* Image Upload Field */}
                    <div className="space-y-2">
                        <Label className="text-base font-semibold">Featured Image</Label>
                        <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                            <Dropzone
                                onFileSelect={onImageSelect}
                                currentImageUrl={facility?.photo}
                                accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] }}
                                maxSize={5 * 1024 * 1024} // 5MB
                                className="min-h-48"
                                disabled={processing}
                            />
                        </div>
                        {errors.image && (
                            <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm">{errors.image}</span>
                            </div>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Upload an image file (JPEG, PNG, GIF, WebP) up to 5MB. Images are securely stored in Google Drive.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col-reverse gap-4 border-t pt-6 sm:flex-row sm:justify-between">
                        <Link href={route('admin.facilities.index')}>
                            <Button
                                variant="outline"
                                type="button"
                                className="w-full transition-all duration-200 hover:bg-gray-50 sm:w-auto dark:hover:bg-gray-800"
                                disabled={processing}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Facilities
                            </Button>
                        </Link>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-purple-700 sm:w-auto"
                            disabled={processing}
                        >
                            {processing ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    {isEditing ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                                    <span>{isEditing ? 'Update Facility' : 'Create Facility'}</span>
                                </div>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
