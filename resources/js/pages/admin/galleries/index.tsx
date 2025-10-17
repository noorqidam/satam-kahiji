import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';
import { Input } from '@/components/ui/input';
import { Pagination, type PaginationData } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Calendar, Edit, Eye, ImageIcon, Plus, Search, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

// Utility function to handle Google Drive URLs for image display
const convertGoogleDriveUrlForDisplay = (url: string | null): string | null => {
    if (!url) return url;

    // lh3.googleusercontent.com URLs are already optimized for display, use as-is
    if (url.includes('lh3.googleusercontent.com')) {
        return url;
    }

    // Check if it's a Google Drive view URL and convert to lh3 format
    const viewMatch = url.match(/https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9\-_]+)\/view/);
    if (viewMatch) {
        const fileId = viewMatch[1];
        return `https://lh3.googleusercontent.com/d/${fileId}`;
    }

    // Check if it's a thumbnail URL and convert to lh3 format
    const thumbnailMatch = url.match(/https:\/\/drive\.google\.com\/thumbnail\?id=([a-zA-Z0-9\-_]+)/);
    if (thumbnailMatch) {
        const fileId = thumbnailMatch[1];
        return `https://lh3.googleusercontent.com/d/${fileId}`;
    }

    // For other URLs, return as is
    return url;
};

interface Gallery {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    featured_image: string | null;
    is_published: boolean;
    sort_order: number;
    items_count: number;
    created_at: string;
    updated_at: string;
}

interface GalleriesPageProps {
    galleries: PaginationData & { data: Gallery[] };
    filters: {
        search?: string;
        status?: string;
    };
    [key: string]: unknown;
}

export default function GalleriesIndex() {
    const { galleries, filters } = usePage<GalleriesPageProps>().props;
    const { t } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('gallery_management.breadcrumbs.admin_dashboard'), href: route('admin.dashboard') },
        { title: t('gallery_management.breadcrumbs.gallery_management'), href: route('admin.galleries.index') },
    ];

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; gallery: Gallery | null }>({ open: false, gallery: null });
    const [isDeleting, setIsDeleting] = useState(false);

    const updateFilters = useCallback(() => {
        const params: Record<string, string> = {};

        if (searchTerm.trim()) {
            params.search = searchTerm.trim();
        }
        if (selectedStatus !== 'all') {
            params.status = selectedStatus;
        }

        router.get(route('admin.galleries.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    }, [searchTerm, selectedStatus]);

    // Real-time search with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            updateFilters();
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchTerm, selectedStatus, updateFilters]);

    const handleTogglePublish = (gallery: Gallery) => {
        router.post(
            route('admin.galleries.toggle-publish', gallery.id),
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleDelete = (gallery: Gallery) => {
        setDeleteDialog({ open: true, gallery });
    };

    const confirmDelete = () => {
        if (!deleteDialog.gallery) return;

        setIsDeleting(true);
        router.delete(route('admin.galleries.destroy', deleteDialog.gallery.id), {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
                setDeleteDialog({ open: false, gallery: null });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('gallery_management.header.title')} />

            <div className="w-full max-w-none space-y-3 px-4 sm:px-8">
                {/* Header */}
                <div className="rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 p-4 sm:rounded-xl sm:p-6 dark:from-gray-900 dark:to-gray-800">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2 text-center sm:text-left">
                            <h1 className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl lg:text-4xl">
                                {t('gallery_management.header.title')}
                            </h1>
                            <p className="text-sm text-muted-foreground sm:text-base lg:text-lg">
                                {t('gallery_management.header.description')}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground sm:justify-start sm:gap-4 sm:text-sm">
                                <div className="flex items-center gap-1">
                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    <span>{galleries.data.filter((gallery) => gallery.is_published).length} {t('gallery_management.list.filters.published')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                                    <span>{galleries.data.filter((gallery) => !gallery.is_published).length} {t('gallery_management.list.filters.draft')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                                    <span>{galleries.total} {t('gallery_management.list.title')}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center sm:justify-end">
                            <Link href={route('admin.galleries.create')} className="w-full sm:w-auto">
                                <Button
                                    size="lg"
                                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg transition-all duration-200 hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl sm:w-auto"
                                >
                                    <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                    <span className="xs:inline hidden">{t('gallery_management.create.title')}</span>
                                    <span className="xs:hidden">{t('gallery_management.actions.create_gallery')}</span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-900/80">
                    <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <Search className="h-5 w-5 text-purple-600" />
                            <CardTitle className="text-xl text-gray-900 dark:text-white">{t('gallery_management.list.search_and_filter.title')}</CardTitle>
                        </div>
                        <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                            {t('gallery_management.list.search_and_filter.description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Real-time Search and Filters - Single Row */}
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-4">
                            {/* Search Input */}
                            <div className="relative min-w-0 flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder={t('gallery_management.list.search_placeholder')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-11 border-gray-200 pl-10 transition-colors focus:border-purple-500 focus:ring-purple-500 dark:border-gray-700"
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:gap-3 lg:flex-shrink-0">
                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger className="h-11 w-full border-gray-200 focus:border-purple-500 focus:ring-purple-500 sm:w-[150px] dark:border-gray-700">
                                        <SelectValue placeholder={t('gallery_management.list.filters.all')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('gallery_management.list.filters.all')}</SelectItem>
                                        <SelectItem value="published">✅ {t('gallery_management.list.filters.published')}</SelectItem>
                                        <SelectItem value="draft">📝 {t('gallery_management.list.filters.draft')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Galleries Table */}
                {galleries.data.length === 0 ? (
                    <Card className="border-0 bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg dark:from-gray-900 dark:to-gray-800">
                        <CardContent className="py-20">
                            <div className="text-center">
                                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900">
                                    <Edit className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                                </div>
                                <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">{t('gallery_management.list.empty_state.title')}</h3>
                                <p className="mx-auto mb-8 max-w-md text-lg text-gray-600 dark:text-gray-400">
                                    {t('gallery_management.list.empty_state.description')}
                                </p>
                                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                                    <Link href={route('admin.galleries.create')}>
                                        <Button
                                            size="lg"
                                            className="bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg transition-all duration-200 hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl"
                                        >
                                            <Plus className="mr-2 h-5 w-5" />
                                            {t('gallery_management.list.empty_state.create_button')}
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="mb-3 w-full shadow-sm">
                        <div className="overflow-x-auto">
                            <Table className="w-full">
                                <TableHeader>
                                    <TableRow className="border-b">
                                        <TableHead className="w-16 sm:w-20">{t('gallery_management.list.table.columns.image')}</TableHead>
                                        <TableHead className="min-w-[200px]">{t('gallery_management.list.table.columns.title')} & {t('gallery_management.list.table.columns.description')}</TableHead>
                                        <TableHead className="w-20 sm:w-24">{t('gallery_management.list.table.columns.items_count')}</TableHead>
                                        <TableHead className="w-20 sm:w-24">{t('gallery_management.list.table.columns.status')}</TableHead>
                                        <TableHead className="hidden w-32 md:table-cell">{t('gallery_management.list.table.columns.created_at')}</TableHead>
                                        <TableHead className="w-24 text-right sm:w-36">{t('gallery_management.list.table.columns.actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {galleries.data.map((gallery) => (
                                        <TableRow
                                            key={gallery.id}
                                            className="group border-b border-gray-100 transition-all duration-200 hover:bg-gradient-to-r hover:from-purple-50/30 hover:to-indigo-50/30 dark:border-gray-800 dark:hover:from-purple-900/10 dark:hover:to-indigo-900/10"
                                        >
                                            {/* Featured Image */}
                                            <TableCell className="py-4">
                                                <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 shadow-md transition-shadow duration-200 group-hover:shadow-lg sm:h-16 sm:w-16 sm:rounded-xl dark:from-gray-700 dark:to-gray-800">
                                                    {gallery.featured_image ? (
                                                        <>
                                                            <img
                                                                src={
                                                                    convertGoogleDriveUrlForDisplay(gallery.featured_image) || gallery.featured_image
                                                                }
                                                                alt={gallery.title}
                                                                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                                                            />
                                                            <div className="absolute inset-0 rounded-lg bg-black/0 transition-colors duration-200 group-hover:bg-black/10 sm:rounded-xl"></div>
                                                        </>
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center">
                                                            <ImageIcon className="h-5 w-5 text-gray-400 transition-colors group-hover:text-gray-500 sm:h-7 sm:w-7" />
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Title & Description */}
                                            <TableCell className="py-4">
                                                <div className="space-y-1 sm:space-y-2">
                                                    <h3 className="line-clamp-1 text-sm font-semibold text-gray-900 transition-colors duration-200 group-hover:text-purple-600 sm:line-clamp-2 sm:text-base lg:text-lg dark:text-white dark:group-hover:text-purple-400">
                                                        {gallery.title}
                                                    </h3>
                                                    {gallery.description && (
                                                        <p className="line-clamp-1 hidden text-xs leading-relaxed text-gray-600 sm:line-clamp-2 sm:block sm:text-sm dark:text-gray-400">
                                                            {gallery.description}
                                                        </p>
                                                    )}
                                                    <div className="hidden items-center gap-1 text-xs text-gray-500 sm:flex">
                                                        <span>{t('gallery_management.list.table.sort_order')}: {gallery.sort_order}</span>
                                                    </div>
                                                    {/* Mobile: Show status inline */}
                                                    <div className="mt-1 flex items-center gap-2 sm:hidden">
                                                        <Badge
                                                            className={
                                                                gallery.is_published
                                                                    ? 'bg-green-100 px-2 py-0.5 text-xs text-green-800'
                                                                    : 'bg-gray-100 px-2 py-0.5 text-xs text-gray-600'
                                                            }
                                                        >
                                                            {gallery.is_published ? '✅' : '📝'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Items Count */}
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-2">
                                                    <Edit className="h-4 w-4 text-purple-600" />
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{gallery.items_count}</span>
                                                </div>
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell className="py-4">
                                                {gallery.is_published ? (
                                                    <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 px-2 py-1 text-xs font-medium text-green-800 shadow-sm transition-all duration-200 hover:from-green-200 hover:to-emerald-200 hover:shadow-md sm:px-3 dark:from-green-900 dark:to-emerald-900 dark:text-green-300">
                                                        <span className="mr-1 h-2 w-2 animate-pulse rounded-full bg-green-500 sm:mr-1.5"></span>
                                                        <span className="hidden sm:inline">✅ {t('gallery_management.show.overview.published')}</span>
                                                        <span className="sm:hidden">✅</span>
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-gradient-to-r from-gray-100 to-slate-100 px-2 py-1 text-xs font-medium text-gray-600 shadow-sm transition-all duration-200 hover:from-gray-200 hover:to-slate-200 hover:shadow-md sm:px-3 dark:from-gray-800 dark:to-slate-800 dark:text-gray-400"
                                                    >
                                                        <span className="mr-1 h-2 w-2 rounded-full bg-gray-400 sm:mr-1.5"></span>
                                                        <span className="hidden sm:inline">📝 {t('gallery_management.show.overview.draft')}</span>
                                                        <span className="sm:hidden">📝</span>
                                                    </Badge>
                                                )}
                                            </TableCell>

                                            {/* Created At */}
                                            <TableCell className="hidden py-4 md:table-cell">
                                                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-medium whitespace-nowrap text-gray-900 sm:text-sm dark:text-white">
                                                            {new Date(gallery.created_at).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                            })}
                                                        </span>
                                                        <span className="text-xs whitespace-nowrap text-gray-500 dark:text-gray-400">
                                                            {new Date(gallery.created_at).toLocaleTimeString('en-US', {
                                                                hour: 'numeric',
                                                                minute: '2-digit',
                                                                hour12: true,
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    {/* Desktop Actions */}
                                                    <div className="hidden items-center gap-1 sm:flex">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleTogglePublish(gallery)}
                                                            title={gallery.is_published ? t('gallery_management.actions.unpublish') : t('gallery_management.actions.publish')}
                                                            className={`h-8 w-8 rounded-lg transition-all duration-200 hover:shadow-md sm:h-10 sm:w-10 sm:rounded-xl ${
                                                                gallery.is_published
                                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
                                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                                                            }`}
                                                        >
                                                            {gallery.is_published ? (
                                                                <ToggleRight className="h-4 w-4 sm:h-5 sm:w-5" />
                                                            ) : (
                                                                <ToggleLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                                                            )}
                                                        </Button>
                                                        <Link href={route('admin.galleries.show', gallery.id)}>
                                                            <Button
                                                                size="sm"
                                                                title={t('gallery_management.actions.view_gallery')}
                                                                className="h-8 w-8 rounded-lg bg-blue-100 text-blue-700 transition-all duration-200 hover:bg-blue-200 hover:shadow-md sm:h-10 sm:w-10 sm:rounded-xl dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                                                            >
                                                                <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                                                            </Button>
                                                        </Link>
                                                        <Link href={route('admin.galleries.edit', gallery.id)}>
                                                            <Button
                                                                size="sm"
                                                                title={t('gallery_management.actions.edit_gallery')}
                                                                className="h-8 w-8 rounded-lg bg-orange-100 text-orange-700 transition-all duration-200 hover:bg-orange-200 hover:shadow-md sm:h-10 sm:w-10 sm:rounded-xl dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50"
                                                            >
                                                                <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleDelete(gallery)}
                                                            title={t('gallery_management.actions.delete_gallery')}
                                                            className="h-8 w-8 rounded-lg bg-red-100 text-red-700 transition-all duration-200 hover:bg-red-200 hover:shadow-md sm:h-10 sm:w-10 sm:rounded-xl dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                                                        >
                                                            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                                                        </Button>
                                                    </div>

                                                    {/* Mobile Actions - Dropdown */}
                                                    <div className="flex items-center gap-1 sm:hidden">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleTogglePublish(gallery)}
                                                            className="h-8 w-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                                        >
                                                            {gallery.is_published ? (
                                                                <ToggleRight className="h-4 w-4 text-green-600" />
                                                            ) : (
                                                                <ToggleLeft className="h-4 w-4 text-gray-600" />
                                                            )}
                                                        </Button>
                                                        <Link href={route('admin.galleries.edit', gallery.id)}>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                )}

                {/* Pagination */}
                {galleries.last_page > 1 && (
                    <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-900/80">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {t('gallery_management.pagination.showing')} <span className="font-medium text-gray-900 dark:text-white">{galleries.from}</span> {t('gallery_management.pagination.to')}{' '}
                                    <span className="font-medium text-gray-900 dark:text-white">{galleries.to}</span> {t('gallery_management.pagination.of')}{' '}
                                    <span className="font-medium text-gray-900 dark:text-white">{galleries.total}</span> {t('gallery_management.pagination.results')}
                                </div>
                                <Pagination data={galleries} />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Delete Confirmation Dialog */}
                <DeleteConfirmationDialog
                    open={deleteDialog.open}
                    onOpenChange={(open) => setDeleteDialog({ open, gallery: null })}
                    title={t('gallery_management.delete.title')}
                    description={t('gallery_management.delete.message')}
                    itemName={deleteDialog.gallery?.title}
                    itemType="gallery"
                    onConfirm={confirmDelete}
                    isLoading={isDeleting}
                />
            </div>
        </AppLayout>
    );
}
