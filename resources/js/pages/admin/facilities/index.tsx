import { FacilityCard } from '@/components/facility/FacilityCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useFacilityService } from '@/hooks/useFacilityService';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import type { Facility, PaginatedFacilities } from '@/types/facility';
import { generateFacilityBreadcrumbs } from '@/utils/facility';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Building2, Camera, Filter, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    facilities: PaginatedFacilities;
    filters: {
        search?: string;
    };
}

export default function FacilitiesIndex({ facilities, filters }: Props) {
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

    // Sync local state with URL parameters when filters change
    useEffect(() => {
        if (filters.search !== data.search) {
            setData('search', filters.search || '');
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
                { search: value },
                {
                    preserveState: true,
                    preserveScroll: true,
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
            { search: '' },
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
            <Head title="Facility Management" />

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
                                        <span className="block sm:hidden">Facility Management</span>
                                        <span className="hidden sm:block">Facility Management</span>
                                    </h1>
                                    <div className="text-xs text-blue-100 sm:hidden">
                                        <p className="mb-1">Manage school facilities with secure cloud storage</p>
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1">
                                                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
                                                {facilities.total} Total
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Camera className="h-3 w-3" />
                                                {facilities.data.filter((f) => f.photo).length} With Photos
                                            </span>
                                        </div>
                                    </div>
                                    <div className="hidden sm:block">
                                        <p className="text-base text-blue-100 lg:text-lg">Manage school facilities with secure cloud storage</p>
                                        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-blue-200">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                                                <span>{facilities.total} Total</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Camera className="h-4 w-4" />
                                                <span>{facilities.data.filter((f) => f.photo).length} With Photos</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                                {/* View Mode Toggle - Hidden on Mobile */}
                                <Button
                                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                                    variant="outline"
                                    size="lg"
                                    className="hidden border-white/20 bg-white/10 text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20 sm:flex sm:items-center"
                                >
                                    {viewMode === 'grid' ? '☰' : '▦'}
                                    <span className="ml-2">{viewMode === 'grid' ? 'List View' : 'Grid View'}</span>
                                </Button>

                                <Link href={route('admin.facilities.create')}>
                                    <Button
                                        size="sm"
                                        className="sm:size-lg w-full bg-white text-blue-700 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-white/90 sm:w-auto"
                                    >
                                        <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                        Add Facility
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Live Status Indicator - Responsive */}
                        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 lg:mt-8">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 animate-pulse rounded-full bg-green-400" />
                                <span className="text-sm font-medium text-white/90">Live Status</span>
                            </div>
                            <div className="hidden h-6 w-px bg-white/20 sm:block" />
                            <div className="text-xs text-white/80 sm:text-sm">Last updated: {new Date().toLocaleTimeString()}</div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Search and Filters */}
                <Card className="group hover:shadow-3xl relative gap-0 overflow-hidden border-0 py-0 shadow-2xl transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-500/5 via-gray-500/5 to-zinc-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    <CardHeader className="relative rounded-t-lg bg-gradient-to-r from-slate-800 via-gray-800 to-zinc-800 px-4 py-4 text-white sm:px-6 sm:py-6">
                        <div className="absolute inset-0 opacity-10">
                            <div className="h-full w-full bg-gradient-to-br from-white/5 to-transparent" />
                        </div>
                        <div className="relative flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
                            <div className="flex items-start gap-3 sm:items-center sm:gap-4">
                                <div className="relative flex-shrink-0">
                                    <div className="absolute -inset-2 rounded-xl bg-white/20 opacity-50 blur" />
                                    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm sm:h-14 sm:w-14">
                                        <Search className="h-4 w-4 sm:h-6 sm:w-6" />
                                    </div>
                                </div>
                                <div className="text-white">
                                    <CardTitle className="text-base font-bold sm:text-2xl">
                                        <span className="block sm:hidden">Search & Discover</span>
                                        <span className="hidden sm:block">Search & Discover</span>
                                    </CardTitle>
                                    <CardDescription className="mt-0.5 text-xs text-gray-100 sm:mt-1 sm:hidden sm:text-base">
                                        Find facilities quickly with smart filtering
                                    </CardDescription>
                                    <CardDescription className="mt-1 hidden text-base text-gray-100 sm:block">
                                        Find facilities quickly with smart filtering
                                    </CardDescription>
                                </div>
                            </div>

                            {/* Search Input - Responsive */}
                            <div className="w-full lg:max-w-md lg:flex-1">
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 sm:left-4 sm:h-5 sm:w-5" />
                                    <Input
                                        id="search"
                                        type="text"
                                        placeholder="Search facilities..."
                                        value={data.search}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        className="h-10 border-white/20 bg-white/10 pr-10 pl-10 text-sm text-white transition-all duration-300 placeholder:text-white/60 focus:border-white/40 focus:ring-2 focus:ring-white/20 sm:h-12 sm:pr-12 sm:pl-12 sm:text-base"
                                    />
                                    {processing && (
                                        <div className="absolute top-1/2 right-3 -translate-y-1/2 sm:right-4">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent sm:h-5 sm:w-5" />
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
                                            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-white/60 transition-colors hover:text-white/80 sm:right-4"
                                        >
                                            <X className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    {filters.search && (
                        <CardContent className="relative px-4 pt-0 pb-4 sm:px-6 sm:pb-6 lg:px-8">
                            <div className="flex flex-col gap-2 rounded-lg bg-blue-50 p-3 sm:flex-row sm:items-center sm:gap-3 dark:bg-blue-900/20">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 flex-shrink-0 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                        Showing results for: <span className="font-bold">"{filters.search}"</span>
                                    </span>
                                </div>
                                <Badge variant="secondary" className="self-start sm:ml-auto sm:self-center">
                                    {facilities.total} {facilities.total === 1 ? 'result' : 'results'}
                                </Badge>
                            </div>
                        </CardContent>
                    )}
                </Card>

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
                                    {filters.search ? 'No facilities found' : 'No facilities yet'}
                                </h3>
                                <p className="mb-8 max-w-md text-gray-600 dark:text-gray-400">
                                    {filters.search
                                        ? 'Try adjusting your search criteria or browse all facilities'
                                        : "Get started by adding your first facility to showcase your school's infrastructure"}
                                </p>
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <Link href={route('admin.facilities.create')}>
                                        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-indigo-700">
                                            <Plus className="mr-2 h-5 w-5" />
                                            Add First Facility
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
                                            View All Facilities
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
                                        {facilities.total} {facilities.total === 1 ? 'Facility' : 'Facilities'}
                                    </Badge>
                                    {filters.search && (
                                        <Badge
                                            variant="outline"
                                            className="border-green-200 bg-green-50 text-green-800 dark:border-green-800/50 dark:bg-green-900/20 dark:text-green-200"
                                        >
                                            <span className="hidden sm:inline">Search Results</span>
                                            <span className="sm:hidden">Results</span>
                                        </Badge>
                                    )}
                                </div>
                                <div className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">
                                    Showing {facilities.data.length} of {facilities.total}
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
                                            Page {facilities.current_page} of {facilities.last_page} • {facilities.total} total facilities
                                        </span>
                                        <span className="sm:hidden">
                                            {facilities.current_page}/{facilities.last_page} • {facilities.total} total
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
                            Delete Facility
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{facilityToDelete?.name}</strong>? This action cannot be undone and will
                            permanently remove the facility and its associated photo.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:gap-3">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={facilityService.processing}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={facilityService.processing}>
                            {facilityService.processing ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Deleting...
                                </div>
                            ) : (
                                <>Delete Facility</>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
