import { FacilityCard } from '@/components/facility/FacilityCard';
import { FacilityViewToggle } from '@/components/facility/facility-view-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useFacilityService } from '@/hooks/useFacilityService';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import type { Facility, PaginatedFacilities } from '@/types/facility';
import { generateFacilityBreadcrumbs } from '@/utils/facility';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Building2, Camera, Filter, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
    facilities: PaginatedFacilities;
    filters: {
        search?: string;
    };
}

export default function FacilitiesIndex({ facilities, filters }: Props) {
    const { t } = useTranslation();
    const [mounted, setMounted] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [facilityToDelete, setFacilityToDelete] = useState<Facility | null>(null);
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

    const facilityService = useFacilityService();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        // Cleanup timeout on unmount
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTimeout]);

    const breadcrumbs: BreadcrumbItem[] = generateFacilityBreadcrumbs('index');

    const { data, setData, get, processing } = useForm({
        search: filters.search || '',
    });

    // Use ref to track if we're syncing from filters to prevent infinite loops
    const isSyncingFromFilters = useRef(false);

    // Sync local state with URL parameters when filters change
    useEffect(() => {
        if (filters.search !== data.search && !isSyncingFromFilters.current) {
            isSyncingFromFilters.current = true;
            setData('search', filters.search || '');
            // Reset flag after state update
            setTimeout(() => {
                isSyncingFromFilters.current = false;
            }, 0);
        }
    }, [filters.search, data.search, setData]);

    // Real-time search with debouncing
    const handleSearchChange = (value: string) => {
        setData('search', value);

        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        const timeout = setTimeout(() => {
            router.get(
                route('admin.facilities.index'),
                { search: value || undefined }, // Send undefined instead of empty string to remove from URL
                {
                    preserveState: true,
                    preserveScroll: true,
                    onStart: () => {
                        // Don't clear the timeout here to avoid conflicts
                    },
                    onFinish: () => {
                        // Clear timeout after request completes
                        setSearchTimeout(null);
                    },
                    onError: (errors) => {
                        // Handle errors and clear timeout
                        console.error('Search request failed:', errors);
                        setSearchTimeout(null);
                    },
                },
            );
        }, 300); // 300ms debounce

        setSearchTimeout(timeout);
    };

    const handleClearSearch = () => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
            setSearchTimeout(null);
        }
        setData('search', '');
        router.get(
            route('admin.facilities.index'),
            {}, // Send empty object to remove search parameter completely
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const openDeleteDialog = (facility: Facility) => {
        setFacilityToDelete(facility);
        setIsDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!facilityToDelete) return;
        setIsDeleteDialogOpen(false);

        facilityService.deleteFacility(facilityToDelete, () => {
            setFacilityToDelete(null);
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('facility_management.header.title')} />

            <div
                className={`w-full max-w-none space-y-6 px-4 pb-3 transition-all duration-500 sm:px-6 lg:px-8 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
            >
                {/* Enhanced Hero Header - Responsive */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-4 shadow-2xl sm:rounded-2xl sm:p-6 lg:p-8">
                    {/* Background Pattern */}
                    <div className="bg-grid-white/[0.05] absolute inset-0 bg-[size:20px_20px]" />
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-600/50 to-indigo-800/50" />

                    {/* Floating Orbs - Hidden on mobile for performance */}
                    <div className="absolute -top-24 -right-24 hidden h-48 w-48 rounded-full bg-white/10 blur-3xl sm:block" />
                    <div className="absolute -bottom-24 -left-24 hidden h-48 w-48 rounded-full bg-white/5 blur-3xl sm:block" />

                    <div className="relative">
                        <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-start gap-3 sm:items-center sm:gap-6">
                                <div className="group relative flex-shrink-0">
                                    <div className="absolute -inset-1 rounded-xl bg-white/20 opacity-75 blur transition duration-300 group-hover:opacity-100" />
                                    <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/10 shadow-xl backdrop-blur-sm sm:h-20 sm:w-20">
                                        <Building2
                                            className={`h-6 w-6 text-white transition-all duration-300 sm:h-10 sm:w-10 ${mounted ? 'scale-100 rotate-0' : 'scale-50 rotate-45'}`}
                                        />
                                    </div>
                                </div>
                                <div className="text-white">
                                    <h1 className="mb-1 text-lg font-bold sm:mb-2 sm:text-3xl lg:text-4xl">
                                        <span className="block sm:hidden">{t('facility_management.header.title')}</span>
                                        <span className="hidden sm:block">{t('facility_management.header.title')}</span>
                                    </h1>
                                    <div className="text-xs text-blue-100 sm:hidden">
                                        <p className="mb-1">{t('facility_management.header.description')}</p>
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1">
                                                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
                                                {facilities.total} {t('facility_management.stats.total')}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Camera className="h-3 w-3" />
                                                {facilities.data.filter((f) => f.photo).length} {t('facility_management.stats.with_photos')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="hidden sm:block">
                                        <p className="text-base text-blue-100 lg:text-lg">{t('facility_management.header.description')}</p>
                                        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-blue-200">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                                                <span>
                                                    {facilities.total} {t('facility_management.stats.total')}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Camera className="h-4 w-4" />
                                                <span>
                                                    {facilities.data.filter((f) => f.photo).length} {t('facility_management.stats.with_photos')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                                {/* View Mode Toggle */}
                                <div className="hidden sm:block">
                                    <FacilityViewToggle view={viewMode} onViewChange={setViewMode} />
                                </div>

                                <Link href={route('admin.facilities.create')}>
                                    <Button className="h-10 w-full bg-white text-blue-700 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-white/90 sm:w-auto">
                                        <Plus className="mr-2 h-4 w-4" />
                                        {t('facility_management.actions.add_facility')}
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Live Status Indicator and Search - Responsive */}
                        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:mt-8">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 animate-pulse rounded-full bg-green-400" />
                                    <span className="text-sm font-medium text-white/90">{t('facility_management.stats.live_status')}</span>
                                </div>
                                <div className="hidden h-6 w-px bg-white/20 sm:block" />
                                <div className="text-xs text-white/80 sm:text-sm">
                                    {t('facility_management.stats.last_updated')} {new Date().toLocaleTimeString()}
                                </div>
                            </div>

                            {/* Search Input */}
                            <div className="w-full max-w-sm sm:w-auto">
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        id="search"
                                        type="text"
                                        placeholder={t('facility_management.search.placeholder')}
                                        value={data.search}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        className="h-10 border-white/20 bg-white/10 pr-10 pl-10 text-sm text-white transition-all duration-300 placeholder:text-white/60 focus:border-white/40 focus:ring-2 focus:ring-white/20"
                                    />
                                    {processing && (
                                        <div className="absolute top-1/2 right-3 -translate-y-1/2">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
                                        </div>
                                    )}
                                    {data.search && !processing && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleClearSearch();
                                            }}
                                            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-white/60 transition-colors hover:text-white/80"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Results Filter Display */}
                {filters.search && (
                    <div className="flex flex-col gap-2 rounded-lg bg-blue-50 p-3 sm:flex-row sm:items-center sm:gap-3 dark:bg-blue-900/20">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 flex-shrink-0 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                {t('facility_management.search.showing_results')} <span className="font-bold">"{filters.search}"</span>
                            </span>
                        </div>
                        <Badge variant="secondary" className="self-start sm:ml-auto sm:self-center">
                            {facilities.total}{' '}
                            {facilities.total === 1 ? t('facility_management.search.result') : t('facility_management.search.results')}
                        </Badge>
                    </div>
                )}

                {/* Enhanced Facilities Display */}
                <div className="space-y-6">
                    {facilities.data.length === 0 ? (
                        <Card className="group hover:shadow-3xl relative overflow-hidden border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50/80 to-white shadow-xl transition-all duration-500 dark:border-gray-700 dark:from-gray-800/50 dark:to-gray-900/50">
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="relative mb-6">
                                    <div className="absolute -inset-4 rounded-full bg-blue-200/50 opacity-20 blur-xl dark:bg-blue-800/50" />
                                    <div className="relative rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 p-6 dark:from-blue-900/50 dark:to-indigo-900/50">
                                        <Building2 className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                                <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
                                    {filters.search
                                        ? t('facility_management.empty_state.no_facilities_found')
                                        : t('facility_management.empty_state.no_facilities')}
                                </h3>
                                <p className="mb-8 max-w-md text-gray-600 dark:text-gray-400">
                                    {filters.search
                                        ? t('facility_management.empty_state.try_adjusting')
                                        : t('facility_management.empty_state.get_started')}
                                </p>
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <Link href={route('admin.facilities.create')}>
                                        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-indigo-700">
                                            <Plus className="mr-2 h-5 w-5" />
                                            {t('facility_management.actions.add_first_facility')}
                                        </Button>
                                    </Link>
                                    {filters.search && (
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setData('search', '');
                                                get(route('admin.facilities.index'), {
                                                    preserveState: true,
                                                });
                                            }}
                                            className="transition-all duration-300 hover:scale-105"
                                        >
                                            {t('facility_management.actions.view_all_facilities')}
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            {/* Results Summary - Responsive */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                                        {facilities.total}{' '}
                                        {facilities.total === 1 ? t('facility_management.stats.facility') : t('facility_management.stats.facilities')}
                                    </Badge>
                                    {filters.search && (
                                        <Badge
                                            variant="outline"
                                            className="border-green-200 bg-green-50 text-green-800 dark:border-green-800/50 dark:bg-green-900/20 dark:text-green-200"
                                        >
                                            <span className="hidden sm:inline">{t('facility_management.search.results')}</span>
                                            <span className="sm:hidden">{t('facility_management.search.results')}</span>
                                        </Badge>
                                    )}
                                </div>
                                <div className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">
                                    {t('facility_management.stats.showing')} {facilities.data.length} {t('facility_management.pagination.of')}{' '}
                                    {facilities.total}
                                </div>
                            </div>

                            {/* Facilities Grid/List - Mobile Always Grid */}
                            <div
                                className={`grid gap-4 sm:gap-6 ${
                                    viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 sm:grid-cols-1'
                                }`}
                            >
                                {facilities.data.map((facility, index) => (
                                    <div
                                        key={facility.id}
                                        className={`transition-all duration-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                                        style={{
                                            transitionDelay: `${index * 50}ms`,
                                        }}
                                    >
                                        <FacilityCard facility={facility} onDelete={openDeleteDialog} viewMode={viewMode} />
                                    </div>
                                ))}
                            </div>

                            {/* Enhanced Pagination - Responsive */}
                            {facilities.last_page > 1 && (
                                <div className="flex flex-col items-center gap-3 pt-6 sm:gap-4 sm:pt-8">
                                    <div className="text-xs text-gray-600 sm:text-sm dark:text-gray-400">
                                        <span className="hidden sm:inline">
                                            {t('facility_management.pagination.page')} {facilities.current_page}{' '}
                                            {t('facility_management.pagination.of')} {facilities.last_page} • {facilities.total}{' '}
                                            {t('facility_management.pagination.total_facilities')}
                                        </span>
                                        <span className="sm:hidden">
                                            {facilities.current_page}/{facilities.last_page} • {facilities.total}{' '}
                                            {t('facility_management.pagination.total')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 overflow-x-auto pb-2 sm:gap-2 sm:overflow-visible sm:pb-0">
                                        {facilities.links?.map((link: { url: string | null; active: boolean; label: string }, index: number) => (
                                            <div key={index} className="flex-shrink-0">
                                                {link.url ? (
                                                    <Link
                                                        href={link.url}
                                                        className={`flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 text-xs font-medium transition-all duration-300 sm:h-10 sm:min-w-[2.5rem] sm:px-3 sm:text-sm ${
                                                            link.active
                                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:scale-105'
                                                                : 'border border-gray-200 bg-white text-gray-700 shadow-sm hover:scale-105 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                                        }`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                ) : (
                                                    <span
                                                        className="flex h-8 min-w-[2rem] cursor-not-allowed items-center justify-center rounded-lg px-2 text-xs font-medium text-gray-400 sm:h-10 sm:min-w-[2.5rem] sm:px-3 sm:text-sm"
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
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
                            {t('facility_management.delete.title')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('facility_management.delete.message')} <strong>{facilityToDelete?.name}</strong>?{' '}
                            {t('facility_management.delete.warning')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:gap-3">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={facilityService.processing}>
                            {t('facility_management.delete.cancel')}
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={facilityService.processing}>
                            {facilityService.processing ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    {t('facility_management.delete.deleting')}
                                </div>
                            ) : (
                                <>{t('facility_management.delete.confirm')}</>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
