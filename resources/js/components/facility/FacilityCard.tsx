// Single Responsibility: Display facility information in card format
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Facility } from '@/types/facility';
import { Link } from '@inertiajs/react';
import { Calendar, Camera, Edit, Eye, ImageIcon, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FacilityCardProps {
    facility: Facility;
    onDelete?: (facility: Facility) => void;
    showActions?: boolean;
    viewMode?: 'grid' | 'list';
}

export function FacilityCard({ facility, onDelete, showActions = true, viewMode = 'grid' }: FacilityCardProps) {
    const { t } = useTranslation();
    if (viewMode === 'list') {
        // List View - Image on left, content on right
        return (
            <Card className="group overflow-hidden border p-0 transition-all duration-200 hover:shadow-md">
                <div className="flex h-full">
                    {/* Image on Left - Full height, 0 padding */}
                    <div className="relative w-32 flex-shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-800">
                        {facility.photo ? (
                            <img
                                src={facility.photo}
                                alt={facility.name}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center">
                                <ImageIcon className="h-8 w-8 text-gray-400" />
                            </div>
                        )}
                    </div>

                    {/* Content on Right */}
                    <div className="flex-1 p-4">
                        <div className="flex h-full items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                                <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white">{facility.name}</h3>
                                <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{facility.description}</p>
                                <div className="mt-2 flex items-center gap-4">
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Calendar className="h-3 w-3" />
                                        <span>{t('facility_management.card.created')} {new Date(facility.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <Badge variant={facility.photo ? 'default' : 'secondary'} className="text-xs">
                                        <Camera className="mr-1 h-3 w-3" />
                                        {facility.photo ? t('facility_management.card.has_image') : t('facility_management.card.no_image')}
                                    </Badge>
                                </div>
                            </div>

                            {/* Actions on Far Right */}
                            {showActions && (
                                <div className="flex flex-shrink-0 items-center gap-2">
                                    <Link href={route('admin.facilities.show', facility.id)}>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Link href={route('admin.facilities.edit', facility.id)}>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    {onDelete && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                                            onClick={() => onDelete(facility)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        );
    }

    // Grid View - Full-width image at top, content below
    return (
        <Card className="group overflow-hidden border p-0 transition-all duration-300 hover:shadow-lg">
            {/* Full-width Image at Top - 0 padding */}
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
                {facility.photo ? (
                    <img
                        src={facility.photo}
                        alt={facility.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <div className="text-center">
                            <ImageIcon className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                            <span className="text-sm text-gray-500">{t('facility_management.card.no_image')}</span>
                        </div>
                    </div>
                )}

                {/* Quick Actions Overlay */}
                {showActions && (
                    <div className="absolute top-2 right-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <div className="flex gap-1">
                            <Link href={route('admin.facilities.show', facility.id)}>
                                <Button size="sm" variant="secondary" className="h-7 w-7 bg-white/90 p-0 hover:bg-white">
                                    <Eye className="h-3 w-3" />
                                </Button>
                            </Link>
                            <Link href={route('admin.facilities.edit', facility.id)}>
                                <Button size="sm" variant="secondary" className="h-7 w-7 bg-white/90 p-0 hover:bg-white">
                                    <Edit className="h-3 w-3" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-4">
                <div className="space-y-3">
                    {/* Header */}
                    <div>
                        <h3 className="line-clamp-1 text-sm font-semibold text-gray-900 dark:text-white">{facility.name}</h3>
                        <div className="mt-1 flex items-center gap-2">
                            <Badge variant={facility.photo ? 'default' : 'secondary'} className="px-2 py-0.5 text-xs">
                                <Camera className="mr-1 h-2.5 w-2.5" />
                                {facility.photo ? t('facility_management.card.has_image') : t('facility_management.card.no_image')}
                            </Badge>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="line-clamp-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">{facility.description}</p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-1 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{t('facility_management.card.created')} {new Date(facility.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    {showActions && (
                        <div className="flex gap-2 pt-2">
                            <Link href={route('admin.facilities.show', facility.id)} className="flex-1">
                                <Button variant="outline" size="sm" className="h-7 w-full text-xs">
                                    <Eye className="mr-1 h-3 w-3" />
                                    {t('facility_management.card.view')}
                                </Button>
                            </Link>
                            <Link href={route('admin.facilities.edit', facility.id)} className="flex-1">
                                <Button variant="outline" size="sm" className="h-7 w-full text-xs">
                                    <Edit className="mr-1 h-3 w-3" />
                                    {t('facility_management.card.edit')}
                                </Button>
                            </Link>
                            {onDelete && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 border-red-200 px-2 text-xs text-red-600 hover:border-red-300 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                                    onClick={() => onDelete(facility)}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
