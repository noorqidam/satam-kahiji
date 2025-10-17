import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useFacilityService } from '@/hooks/useFacilityService';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import type { Facility } from '@/types/facility';
import { formatFacilityMetadata, generateFacilityBreadcrumbs, getImageDisplayUrl } from '@/utils/facility';
import { Head, Link } from '@inertiajs/react';
import { Building2, Calendar, Camera, Clock, Edit, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function FacilityShow({ facility }: { facility: Facility }) {
    const { t } = useTranslation();
    const [mounted, setMounted] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const facilityService = useFacilityService();

    useEffect(() => {
        setMounted(true);
    }, []);

    const breadcrumbs: BreadcrumbItem[] = generateFacilityBreadcrumbs('show', facility);
    const formattedMetadata = formatFacilityMetadata(facility);
    const displayImageUrl = getImageDisplayUrl(facility.photo);

    const handleDelete = async () => {
        setIsDeleteDialogOpen(false);
        facilityService.deleteFacility(facility);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${facility.name} - ${t('facility_management.show.page_title')}`} />

            <div
                className={`w-full max-w-none space-y-6 px-4 pb-3 transition-all duration-500 sm:px-6 lg:px-8 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
            >
                {/* Enhanced Hero Header */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 shadow-2xl">
                    {/* Background Pattern */}
                    <div className="bg-grid-white/[0.05] absolute inset-0 bg-[size:20px_20px]" />
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-600/50 to-indigo-800/50" />

                    {/* Floating Orbs */}
                    <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-white/5 blur-3xl" />

                    <div className="relative">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-center gap-6">
                                <div className="group relative">
                                    <div className="absolute -inset-1 rounded-xl bg-white/20 opacity-75 blur transition duration-300 group-hover:opacity-100" />
                                    <div className="relative flex h-20 w-20 items-center justify-center rounded-xl border border-white/20 bg-white/10 shadow-xl backdrop-blur-sm">
                                        <Building2
                                            className={`h-10 w-10 text-white transition-all duration-300 ${mounted ? 'scale-100 rotate-0' : 'scale-50 rotate-45'}`}
                                        />
                                    </div>
                                </div>
                                <div className="text-white">
                                    <h1 className="mb-2 text-3xl font-bold lg:text-4xl">{facility.name}</h1>
                                    <p className="text-lg text-blue-100">{t('facility_management.show.header.description')}</p>
                                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-blue-200">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>{t('facility_management.show.header.created')} {new Date(facility.created_at).toLocaleDateString()}</span>
                                        </div>
                                        {facility.photo && (
                                            <div className="flex items-center gap-2">
                                                <Camera className="h-4 w-4" />
                                                <span>{t('facility_management.show.header.photo_available')}</span>
                                            </div>
                                        )}
                                        {facility.updated_at !== facility.created_at && (
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                <span>{t('facility_management.show.header.updated')} {new Date(facility.updated_at).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Link href={route('admin.facilities.edit', facility.id)}>
                                    <Button
                                        size="lg"
                                        className="bg-white text-blue-700 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-white/90"
                                    >
                                        <Edit className="mr-2 h-5 w-5" />
                                        {t('facility_management.show.buttons.edit_facility')}
                                    </Button>
                                </Link>

                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={() => setIsDeleteDialogOpen(true)}
                                    disabled={facilityService.processing}
                                    className="border-red-300/50 bg-red-500/10 text-red-100 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-red-500/20 disabled:hover:scale-100"
                                >
                                    {facilityService.processing ? (
                                        <div className="flex items-center gap-2">
                                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-300 border-t-transparent" />
                                            <span>{t('facility_management.show.buttons.deleting')}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <Trash2 className="mr-2 h-5 w-5" />
                                            {t('facility_management.show.buttons.delete')}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Improved Two-Column Layout */}
                <div className="grid grid-cols-1 gap-8 xl:grid-cols-5">
                    {/* Left Column - Main Content */}
                    <div className="space-y-8 xl:col-span-3">
                        {/* Facility Information Card */}
                        <Card className="group hover:shadow-3xl relative gap-0 overflow-hidden border-0 py-0 shadow-2xl transition-all duration-500">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                            <CardHeader className="relative rounded-t-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-6 text-white">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="absolute -inset-2 rounded-xl bg-white/20 opacity-50 blur" />
                                        <div className="relative flex h-14 w-14 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm">
                                            <Building2 className="h-6 w-6" />
                                        </div>
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-bold">{t('facility_management.show.sections.facility_information')}</CardTitle>
                                        <CardDescription className="mt-1 text-blue-100">{t('facility_management.show.sections.complete_details')}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="relative p-8">
                                <div className="space-y-6">
                                    <div className="rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20">
                                        <Label className="text-lg font-bold text-blue-800 dark:text-blue-200">{t('facility_management.show.sections.facility_name')}</Label>
                                        <h2 className="mt-2 text-3xl font-bold text-blue-900 dark:text-blue-100">{facility.name}</h2>
                                    </div>

                                    <div className="rounded-lg bg-green-50 p-6 dark:bg-green-900/20">
                                        <Label className="text-lg font-bold text-green-800 dark:text-green-200">{t('facility_management.show.sections.description')}</Label>
                                        <p className="mt-3 text-lg leading-relaxed whitespace-pre-wrap text-green-700 dark:text-green-300">
                                            {facility.description}
                                        </p>
                                    </div>

                                    {/* Timeline */}
                                    <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800/50">
                                        <div className="mb-4 flex items-center gap-3">
                                            <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                            <Label className="text-lg font-bold text-gray-800 dark:text-gray-200">{t('facility_management.show.sections.timeline')}</Label>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800/50 dark:bg-blue-900/20">
                                                <Label className="text-sm font-semibold text-blue-800 dark:text-blue-200">{t('facility_management.show.timeline.created')}</Label>
                                                <p className="mt-1 text-base font-medium text-blue-900 dark:text-blue-100">
                                                    {new Date(facility.created_at).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </p>
                                            </div>
                                            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800/50 dark:bg-green-900/20">
                                                <Label className="text-sm font-semibold text-green-800 dark:text-green-200">{t('facility_management.show.timeline.last_updated')}</Label>
                                                <p className="mt-1 text-base font-medium text-green-900 dark:text-green-100">
                                                    {new Date(facility.updated_at).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Photo & Actions */}
                    <div className="space-y-8 xl:col-span-2">
                        {/* Facility Photo - Reasonable Size */}
                        <Card className="group hover:shadow-3xl relative gap-0 overflow-hidden border-0 py-0 shadow-2xl transition-all duration-500">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-green-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                            <CardHeader className="relative rounded-t-lg bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 px-6 py-6 text-white">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
                                        <Camera className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-bold">{t('facility_management.show.sections.photo')}</CardTitle>
                                        <CardDescription className="text-emerald-100">
                                            {facility.photo ? t('facility_management.show.sections.current_image') : t('facility_management.show.sections.not_available')}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="relative p-6">
                                {displayImageUrl ? (
                                    <div className="space-y-4">
                                        {/* Reasonably Sized Image */}
                                        <div className="group/image relative overflow-hidden rounded-xl bg-gray-100 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
                                            <div className="aspect-[4/3] overflow-hidden">
                                                <img
                                                    src={displayImageUrl}
                                                    alt={facility.name}
                                                    className={`h-full w-full object-cover transition-all duration-500 group-hover/image:scale-105 ${
                                                        imageLoaded ? 'opacity-100' : 'opacity-0'
                                                    }`}
                                                    onLoad={() => setImageLoaded(true)}
                                                    onError={(e) => {
                                                        const img = e.currentTarget;
                                                        img.style.display = 'none';
                                                        const parent = img.parentElement;
                                                        if (parent && !parent.querySelector('.error-fallback')) {
                                                            const fallbackDiv = document.createElement('div');
                                                            fallbackDiv.className =
                                                                'error-fallback absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20';
                                                            fallbackDiv.innerHTML = `
                                                                <div class="text-center p-4">
                                                                    <div class="text-3xl mb-2">⚠️</div>
                                                                    <p class="text-sm text-red-600 dark:text-red-400 font-medium">Failed to load</p>
                                                                    <p class="text-xs text-red-500 dark:text-red-500 mt-1">Image may have been moved</p>
                                                                </div>
                                                            `;
                                                            parent.appendChild(fallbackDiv);
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Photo Metadata - Compact */}
                                        {Object.keys(formattedMetadata).length > 0 && (
                                            <div className="grid grid-cols-2 gap-3">
                                                {Object.entries(formattedMetadata).map(([key, value]) => (
                                                    <div
                                                        key={key}
                                                        className={`rounded-lg border p-3 ${
                                                            key === 'Dimensions'
                                                                ? 'border-blue-200 bg-blue-50 dark:border-blue-800/50 dark:bg-blue-900/20'
                                                                : key === 'File Size'
                                                                  ? 'border-green-200 bg-green-50 dark:border-green-800/50 dark:bg-green-900/20'
                                                                  : 'border-orange-200 bg-orange-50 dark:border-orange-800/50 dark:bg-orange-900/20'
                                                        }`}
                                                    >
                                                        <Label
                                                            className={`text-xs font-semibold ${
                                                                key === 'Dimensions'
                                                                    ? 'text-blue-800 dark:text-blue-200'
                                                                    : key === 'File Size'
                                                                      ? 'text-green-800 dark:text-green-200'
                                                                      : 'text-orange-800 dark:text-orange-200'
                                                            }`}
                                                        >
                                                            {key}
                                                        </Label>
                                                        <p
                                                            className={`text-sm font-bold ${
                                                                key === 'Dimensions'
                                                                    ? 'text-blue-900 dark:text-blue-100'
                                                                    : key === 'File Size'
                                                                      ? 'text-green-900 dark:text-green-100'
                                                                      : 'text-orange-900 dark:text-orange-100'
                                                            }`}
                                                        >
                                                            {value}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="relative mb-4">
                                            <div className="absolute -inset-3 rounded-full bg-gray-200/30 opacity-50 blur-lg dark:bg-gray-700/30" />
                                            <div className="relative rounded-full bg-gradient-to-br from-gray-100 to-gray-200 p-6 dark:from-gray-700 dark:to-gray-600">
                                                <Camera className="h-8 w-8 text-gray-400" />
                                            </div>
                                        </div>
                                        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{t('facility_management.show.sections.no_photo_title')}</h3>
                                        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">{t('facility_management.show.sections.no_photo_description')}</p>
                                        <Link href={route('admin.facilities.edit', facility.id)}>
                                            <Button
                                                size="sm"
                                                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
                                            >
                                                <Camera className="mr-2 h-4 w-4" />
                                                {t('facility_management.show.buttons.add_photo')}
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            {t('facility_management.show.delete_dialog.title')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('facility_management.show.delete_dialog.description')} <strong>{facility.name}</strong>{t('facility_management.show.delete_dialog.description_continued')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:gap-3">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={facilityService.processing}>
                            {t('facility_management.show.delete_dialog.cancel')}
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={facilityService.processing}>
                            {facilityService.processing ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    {t('facility_management.show.delete_dialog.processing')}
                                </div>
                            ) : (
                                <>{t('facility_management.show.delete_dialog.confirm')}</>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
