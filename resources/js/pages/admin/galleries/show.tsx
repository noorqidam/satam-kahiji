import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Calendar, Edit, Eye, GripVertical, ImageIcon, Images, Music, Play, Plus, Search, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// Note: URL optimization is now handled by the backend GalleryItem model

interface GalleryItem {
    id: number;
    title: string | null;
    caption: string | null;
    type: 'image' | 'video' | 'audio';
    file_path: string;
    file_url: string; // Optimized file URL
    thumbnail_path: string | null;
    thumbnail_url: string | null; // Optimized thumbnail URL
    metadata?: {
        file_size?: number;
        file_size_human?: string;
        width?: number;
        height?: number;
        dimensions?: string;
        aspect_ratio?: number;
        original_name?: string;
        extension?: string;
        exif?: {
            camera_make?: string;
            camera_model?: string;
            date_taken?: string;
            orientation?: number;
        };
        video_type?: string;
        duration?: number;
    };
    is_featured: boolean;
    sort_order: number;
    created_at: string;
}

interface Gallery {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    featured_image: string | null;
    is_published: boolean;
    sort_order: number;
    google_drive_folder_id: string | null;
    created_at: string;
    updated_at: string;
    items: GalleryItem[];
}

interface GalleryShowPageProps {
    gallery: Gallery;
    [key: string]: unknown;
}

export default function ShowGallery() {
    const { gallery } = usePage<GalleryShowPageProps>().props;
    const { t } = useTranslation();

    // State for search and filtering
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'audio' | 'featured'>('all');

    // State for delete dialog
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<GalleryItem | null>(null);

    // State for video player modal
    const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
    const [currentVideoItem, setCurrentVideoItem] = useState<GalleryItem | null>(null);
    const [mediaError, setMediaError] = useState<string | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin Dashboard', href: route('admin.dashboard') },
        { title: t('gallery_management.header.title'), href: route('admin.galleries.index') },
        { title: gallery.title, href: route('admin.galleries.show', gallery.id) },
    ];

    // Filter items based on search and type
    const filteredItems =
        gallery.items?.filter((item) => {
            const matchesSearch =
                !searchTerm ||
                item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.caption?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesFilter =
                filterType === 'all' || (filterType === 'featured' && item.is_featured) || (filterType !== 'featured' && item.type === filterType);

            return matchesSearch && matchesFilter;
        }) || [];

    const handleDeleteClick = (item: GalleryItem) => {
        setItemToDelete(item);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            router.delete(route('admin.galleries.items.destroy', [gallery.id, itemToDelete.id]), {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setItemToDelete(null);
                },
                onError: () => {
                    // Keep dialog open if there's an error
                },
            });
        }
    };

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setItemToDelete(null);
    };

    const handleToggleFeatured = (item: GalleryItem) => {
        router.post(
            route('admin.galleries.items.toggle-featured', [gallery.id, item.id]),
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleMediaPlay = (item: GalleryItem) => {
        if (item.type === 'video' || item.type === 'audio') {
            setCurrentVideoItem(item);
            setMediaError(null); // Reset error state
            setVideoPlayerOpen(true);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${t('navigation.gallery')} - ${gallery.title}`} />

            <div className="w-full max-w-none space-y-6 px-4 sm:space-y-8 sm:px-6 lg:px-8">
                {/* Header with Gradient Background */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4 shadow-xl sm:rounded-2xl sm:p-6 lg:p-8 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
                    <div className="bg-grid-slate-100 dark:bg-grid-slate-700/25 absolute inset-0 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>
                    <div className="relative flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-3 sm:gap-4 lg:gap-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg sm:h-14 sm:w-14 sm:rounded-2xl lg:h-16 lg:w-16">
                                <Images className="h-6 w-6 text-white sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl lg:text-3xl xl:text-4xl dark:text-white">
                                    {gallery.title}
                                </h1>
                                <p className="max-w-2xl text-sm text-gray-600 sm:text-base lg:text-lg dark:text-gray-300">
                                    {gallery.description || t('gallery_management.list.table.no_description')}
                                </p>
                                <div className="flex items-center gap-3 text-xs text-gray-500 sm:gap-4 sm:text-sm dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>
                                            {t('gallery_management.show.overview.created')} {new Date(gallery.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Images className="h-4 w-4" />
                                        <span>
                                            {gallery.items?.length || 0} {t('gallery_management.show.items.title')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex gap-2 sm:gap-3 lg:mt-0">
                            <Link href={route('admin.galleries.edit', gallery.id)}>
                                <Button
                                    size="sm"
                                    className="sm:size-md lg:size-lg bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg hover:from-indigo-700 hover:to-purple-700"
                                >
                                    <Edit className="mr-1 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
                                    {t('gallery_management.actions.edit_gallery')}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Enhanced Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                    <Card className="overflow-hidden border-0 bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950 dark:to-green-900">
                        <CardContent className="px-6 pt-0 pb-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                        {t('gallery_management.show.overview.status')}
                                    </p>
                                    <div className="mt-2">
                                        <Badge
                                            variant={gallery.is_published ? 'default' : 'secondary'}
                                            className={
                                                gallery.is_published
                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100'
                                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100'
                                            }
                                        >
                                            {gallery.is_published
                                                ? `✅ ${t('gallery_management.show.overview.published')}`
                                                : `📝 ${t('gallery_management.show.overview.draft')}`}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-800">
                                    {gallery.is_published ? (
                                        <Eye className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                    ) : (
                                        <Edit className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                        {t('gallery_management.show.overview.items_count')}
                                    </p>
                                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{gallery.items.length}</p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800">
                                    <Images className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-950 dark:to-pink-900">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                        {t('gallery_management.show.items.filters.featured')}
                                    </p>
                                    <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                                        {gallery.items.filter((item) => item.is_featured).length}
                                    </p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-800">
                                    <Star className="h-6 w-6 fill-current text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-0 bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-950 dark:to-red-900">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                                        {t('gallery_management.create.form.fields.sort_order.label')}
                                    </p>
                                    <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">#{gallery.sort_order}</p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-800">
                                    <GripVertical className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Featured Image */}
                {gallery.featured_image && (
                    <Card className="overflow-hidden border-0 bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-800 dark:to-slate-900">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                                    <Star className="h-4 w-4 fill-current text-white" />
                                </div>
                                <CardTitle className="text-xl">{t('gallery_management.create.form.fields.featured_image.label')}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-center">
                                <div className="relative overflow-hidden rounded-xl shadow-2xl">
                                    <img
                                        src={gallery.featured_image}
                                        alt={gallery.title}
                                        className="max-h-80 object-contain transition-transform hover:scale-105"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Gallery Items Management */}
                <div className="space-y-4 sm:space-y-6">
                    {/* Header Card */}
                    <Card className="overflow-hidden border-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 shadow-2xl dark:from-emerald-700 dark:via-teal-700 dark:to-cyan-700">
                        <CardHeader className="p-4 pb-0 text-white sm:p-6">
                            <div className="flex flex-col space-y-3 sm:space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                                <div>
                                    <CardTitle className="text-lg font-bold sm:text-xl lg:text-2xl">
                                        {t('gallery_management.show.items.title')}
                                    </CardTitle>
                                    <CardDescription className="text-sm text-emerald-100 sm:text-base dark:text-emerald-200">
                                        {filteredItems.length} of {gallery.items?.length || 0} {t('gallery_management.show.items.title')}
                                        {searchTerm && ` matching "${searchTerm}"`}
                                        {filterType !== 'all' && ` (${filterType})`}
                                    </CardDescription>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2 lg:mt-0">
                                    <Link href={route('admin.galleries.edit', gallery.id)}>
                                        <Button
                                            size="sm"
                                            className="sm:size-md lg:size-lg border border-white/30 bg-white/20 backdrop-blur-sm hover:bg-white/30"
                                        >
                                            <Plus className="mr-1 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
                                            {t('gallery_management.show.items.add_items')}
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            {/* Enhanced Search and Filter Controls */}
                            <div className="mt-4 pb-4 sm:mt-6 sm:pb-6">
                                <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:gap-4">
                                    <div className="relative flex-1 lg:max-w-sm xl:max-w-md">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-emerald-200 sm:left-4 sm:h-5 sm:w-5 dark:text-emerald-300" />
                                        <Input
                                            type="text"
                                            placeholder={t('gallery_management.show.items.search_placeholder')}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="border-white/20 bg-white/10 py-2 pl-10 text-sm text-white backdrop-blur-sm placeholder:text-emerald-200 focus:border-white/50 focus:ring-white/20 sm:py-3 sm:pl-12 sm:text-base dark:placeholder:text-emerald-300"
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-1 sm:gap-2">
                                        <Button
                                            size="sm"
                                            variant={filterType === 'all' ? 'secondary' : 'ghost'}
                                            onClick={() => setFilterType('all')}
                                            className={
                                                filterType === 'all'
                                                    ? 'bg-white text-emerald-600 hover:bg-white/90 dark:text-emerald-700'
                                                    : 'border-white/20 text-white hover:bg-white/10 hover:text-white'
                                            }
                                        >
                                            {t('gallery_management.show.items.filters.all')}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={filterType === 'image' ? 'secondary' : 'ghost'}
                                            onClick={() => setFilterType('image')}
                                            className={
                                                filterType === 'image'
                                                    ? 'bg-white text-emerald-600 hover:bg-white/90 dark:text-emerald-700'
                                                    : 'border-white/20 text-white hover:bg-white/10 hover:text-white'
                                            }
                                        >
                                            <ImageIcon className="mr-2 h-4 w-4" />
                                            {t('gallery_management.show.items.filters.images')}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={filterType === 'video' ? 'secondary' : 'ghost'}
                                            onClick={() => setFilterType('video')}
                                            className={
                                                filterType === 'video'
                                                    ? 'bg-white text-emerald-600 hover:bg-white/90 dark:text-emerald-700'
                                                    : 'border-white/20 text-white hover:bg-white/10 hover:text-white'
                                            }
                                        >
                                            <Play className="mr-2 h-4 w-4" />
                                            {t('gallery_management.show.items.filters.videos')}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={filterType === 'audio' ? 'secondary' : 'ghost'}
                                            onClick={() => setFilterType('audio')}
                                            className={
                                                filterType === 'audio'
                                                    ? 'bg-white text-emerald-600 hover:bg-white/90 dark:text-emerald-700'
                                                    : 'border-white/20 text-white hover:bg-white/10 hover:text-white'
                                            }
                                        >
                                            <Music className="mr-2 h-4 w-4" />
                                            {t('gallery_management.show.items.media_types.audio')}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={filterType === 'featured' ? 'secondary' : 'ghost'}
                                            onClick={() => setFilterType('featured')}
                                            className={
                                                filterType === 'featured'
                                                    ? 'bg-white text-emerald-600 hover:bg-white/90 dark:text-emerald-700'
                                                    : 'border-white/20 text-white hover:bg-white/10 hover:text-white'
                                            }
                                        >
                                            <Star className="mr-2 h-4 w-4" />
                                            {t('gallery_management.show.items.filters.featured')}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Gallery Items Grid */}
                    {!gallery.items || gallery.items.length === 0 ? (
                        <Card className="overflow-hidden border-0 bg-gradient-to-br from-white via-gray-50 to-emerald-50 shadow-2xl dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900">
                            <CardContent className="py-20 text-center">
                                <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 via-teal-100 to-cyan-100 shadow-2xl dark:from-emerald-900 dark:via-teal-900 dark:to-cyan-900">
                                    <ImageIcon className="h-16 w-16 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h3 className="mb-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-3xl font-bold text-transparent dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400">
                                    {t('gallery_management.show.items.empty_state.title')}
                                </h3>
                                <p className="mx-auto mb-10 max-w-lg text-lg text-gray-600 dark:text-gray-300">
                                    {t('gallery_management.show.items.empty_state.description')}
                                </p>
                                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                                    <Link href={route('admin.galleries.edit', gallery.id)}>
                                        <Button
                                            size="lg"
                                            className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 shadow-xl hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 dark:hover:from-emerald-800 dark:hover:via-teal-800 dark:hover:to-cyan-800"
                                        >
                                            <Plus className="mr-2 h-5 w-5" />
                                            {t('gallery_management.show.items.add_items')}
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ) : filteredItems.length === 0 ? (
                        <Card className="overflow-hidden border-0 bg-gradient-to-br from-white via-gray-50 to-emerald-50 shadow-2xl dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900">
                            <CardContent className="py-20 text-center">
                                <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 via-teal-100 to-cyan-100 shadow-2xl dark:from-emerald-900 dark:via-teal-900 dark:to-cyan-900">
                                    <ImageIcon className="h-16 w-16 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h3 className="mb-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-3xl font-bold text-transparent dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400">
                                    {t('gallery_management.show.items.empty_state.no_matches')}
                                </h3>
                                <p className="mx-auto mb-10 max-w-lg text-gray-600 dark:text-gray-300">
                                    {t('gallery_management.show.items.empty_state.adjust_search')}
                                </p>
                                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                                    <Link href={route('admin.galleries.edit', gallery.id)}>
                                        <Button
                                            size="lg"
                                            className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 shadow-xl hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 dark:hover:from-emerald-800 dark:hover:via-teal-800 dark:hover:to-cyan-800"
                                        >
                                            <Plus className="mr-2 h-5 w-5" />
                                            Add Items
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:gap-6 sm:p-6 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                            {filteredItems.map((item) => (
                                <Card
                                    key={item.id}
                                    className="group overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50 p-0 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl dark:from-gray-800 dark:to-gray-900"
                                >
                                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                                        {item.type === 'image' ? (
                                            <img
                                                src={item.file_url || item.file_path}
                                                alt={item.title || 'Gallery item'}
                                                className="absolute inset-0 h-full w-full object-cover object-top transition-all duration-500 group-hover:scale-110"
                                            />
                                        ) : item.type === 'video' ? (
                                            <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800">
                                                {item.thumbnail_url || item.thumbnail_path ? (
                                                    <img
                                                        src={item.thumbnail_url || item.thumbnail_path || ''}
                                                        alt={item.title || 'Video thumbnail'}
                                                        className="absolute inset-0 h-full w-full object-cover object-top transition-all duration-500 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center">
                                                        <Play className="h-16 w-16 text-slate-400 dark:text-slate-500" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                                    <div className="rounded-full border border-white/30 bg-white/20 p-3 backdrop-blur-sm transition-colors hover:bg-white/30">
                                                        <Play className="h-8 w-8 text-white" />
                                                    </div>
                                                </div>
                                                {/* Always visible play button for video items */}
                                                <div className="absolute top-2 right-2 rounded-full bg-black/60 p-2">
                                                    <Play className="h-4 w-4 fill-current text-white" />
                                                </div>
                                            </div>
                                        ) : item.type === 'audio' ? (
                                            <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900">
                                                <div className="text-center">
                                                    <div className="mb-4 text-6xl">🎵</div>
                                                    <div className="text-lg font-medium text-indigo-700 dark:text-indigo-300">
                                                        {t('gallery_management.show.items.media_types.audio_file')}
                                                    </div>
                                                </div>

                                                {/* Hover overlay */}
                                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                                    <div className="rounded-full border border-white/30 bg-white/20 p-3 backdrop-blur-sm transition-colors hover:bg-white/30">
                                                        <Play className="h-8 w-8 text-white" />
                                                    </div>
                                                </div>

                                                {/* Always visible play button for audio items */}
                                                <div className="absolute top-2 right-2 rounded-full bg-black/60 p-2">
                                                    <Music className="h-4 w-4 text-white" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
                                                <div className="text-center">
                                                    <div className="mb-2 text-4xl">📄</div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                        {t('gallery_management.show.items.media_types.unknown_file')}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Enhanced Featured Badge */}
                                        {item.is_featured && (
                                            <div className="absolute top-3 right-3">
                                                <Badge className="border-0 bg-gradient-to-r from-yellow-400 to-amber-500 font-semibold text-yellow-900 shadow-xl">
                                                    <Star className="mr-1 h-3 w-3 fill-current" />
                                                    {t('gallery_management.show.items.badges.featured')}
                                                </Badge>
                                            </div>
                                        )}

                                        {/* Enhanced Type Badge */}
                                        <div className="absolute top-3 left-3">
                                            <Badge
                                                variant={item.type === 'image' ? 'default' : 'secondary'}
                                                className={`border-0 font-medium shadow-lg ${
                                                    item.type === 'image'
                                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                                                        : item.type === 'video'
                                                          ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                                                          : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                                                }`}
                                            >
                                                {item.type === 'image' ? (
                                                    <ImageIcon className="mr-1 h-3 w-3" />
                                                ) : item.type === 'video' ? (
                                                    <Play className="mr-1 h-3 w-3" />
                                                ) : (
                                                    <Music className="mr-1 h-3 w-3" />
                                                )}
                                                {t(`gallery_management.show.items.media_types.${item.type}`)}
                                            </Badge>
                                        </div>

                                        {/* Enhanced Actions Overlay */}
                                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-all duration-300 group-hover:opacity-100">
                                            {/* Center play button for videos/audio - only show for non-image types */}
                                            {(item.type === 'video' || item.type === 'audio') && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div
                                                        className="pointer-events-auto cursor-pointer rounded-full border border-white/30 bg-white/20 p-4 backdrop-blur-sm transition-colors hover:bg-white/30"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleMediaPlay(item);
                                                        }}
                                                        title={
                                                            item.type === 'video'
                                                                ? t('gallery_management.show.items.media_types.play_video')
                                                                : t('gallery_management.show.items.media_types.play_audio')
                                                        }
                                                    >
                                                        <Play className="h-8 w-8 text-white" />
                                                    </div>
                                                </div>
                                            )}
                                            {/* Action buttons in bottom right corner */}
                                            <div className="pointer-events-auto absolute right-3 bottom-3 flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleToggleFeatured(item);
                                                    }}
                                                    title={
                                                        item.is_featured
                                                            ? t('gallery_management.show.items.item_actions.unfeature')
                                                            : t('gallery_management.show.items.item_actions.feature')
                                                    }
                                                    className="h-8 w-8 border-0 bg-white/90 p-0 text-gray-900 shadow-xl backdrop-blur-sm hover:bg-white"
                                                >
                                                    <Star
                                                        className={`h-4 w-4 ${item.is_featured ? 'fill-current text-yellow-500' : 'text-gray-600'}`}
                                                    />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteClick(item);
                                                    }}
                                                    title={t('gallery_management.show.items.item_actions.delete')}
                                                    className="h-8 w-8 border-0 bg-red-500/90 p-0 shadow-xl backdrop-blur-sm hover:bg-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <CardContent className="bg-gradient-to-b from-white to-gray-50 p-3 sm:p-4 lg:p-6 dark:from-gray-800 dark:to-gray-900">
                                        <div className="space-y-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="line-clamp-2 text-sm leading-tight font-bold text-gray-900 sm:text-base lg:text-lg dark:text-white">
                                                    {item.title || `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} #${item.id}`}
                                                </h3>
                                                <Badge
                                                    variant="outline"
                                                    className="shrink-0 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 font-medium text-indigo-700 dark:border-indigo-700 dark:from-indigo-900 dark:to-purple-900 dark:text-indigo-300"
                                                >
                                                    #{item.sort_order}
                                                </Badge>
                                            </div>

                                            {item.caption && (
                                                <p className="line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                                                    {item.caption}
                                                </p>
                                            )}

                                            {/* Metadata section */}
                                            {item.metadata && (
                                                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                                    {item.metadata.dimensions && (
                                                        <span className="flex items-center gap-1">
                                                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                                            {item.metadata.dimensions}
                                                        </span>
                                                    )}
                                                    {item.metadata.file_size_human && (
                                                        <span className="flex items-center gap-1">
                                                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                                            {item.metadata.file_size_human}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                    {new Date(item.created_at).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    {item.is_featured && (
                                                        <Badge className="border-yellow-200 bg-gradient-to-r from-yellow-100 to-amber-100 text-xs font-semibold text-yellow-800 dark:border-yellow-700 dark:from-yellow-900 dark:to-amber-900 dark:text-yellow-200">
                                                            <Star className="mr-1 h-2 w-2 fill-current" />
                                                            {t('gallery_management.show.items.filters.featured')}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Gallery Metadata */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('gallery_management.show.overview.status')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 sm:gap-4 sm:text-sm lg:grid-cols-3">
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">{t('gallery_management.show.items.metadata.gallery_id')}</Label>
                                <p className="font-mono">{gallery.id}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">{t('gallery_management.show.items.metadata.slug')}</Label>
                                <p className="font-mono">{gallery.slug}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">{t('gallery_management.create.form.fields.sort_order.label')}</Label>
                                <p>{gallery.sort_order}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">{t('gallery_management.show.overview.created')}</Label>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                        {new Date(gallery.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">{t('gallery_management.show.overview.updated')}</Label>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                        {new Date(gallery.updated_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">{t('gallery_management.show.overview.status')}</Label>
                                <p>
                                    {gallery.is_published
                                        ? `✅ ${t('gallery_management.show.overview.published')}`
                                        : `📝 ${t('gallery_management.show.overview.draft')}`}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Enhanced Delete Confirmation Dialog */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent className="border-0 bg-gradient-to-br from-white via-gray-50 to-red-50 shadow-2xl sm:max-w-lg dark:from-gray-900 dark:via-gray-800 dark:to-red-900">
                        <DialogHeader className="pb-4 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800">
                                <Trash2 className="h-8 w-8 text-red-600 dark:text-red-400" />
                            </div>
                            <DialogTitle className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-2xl font-bold text-transparent">
                                {t('gallery_management.show.items.item_actions.delete')}
                            </DialogTitle>
                            <DialogDescription className="text-base leading-relaxed text-gray-600 dark:text-gray-300">
                                {t('gallery_management.delete.message')}
                                {itemToDelete?.title && (
                                    <div className="mt-4 rounded-lg border border-gray-200 bg-gradient-to-r from-gray-100 to-gray-200 p-3 dark:border-gray-600 dark:from-gray-800 dark:to-gray-700">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">{t('gallery_management.show.items.title')}:</span>
                                        <div className="mt-1 font-semibold text-gray-900 dark:text-white">"{itemToDelete.title}"</div>
                                    </div>
                                )}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex flex-col gap-3 pt-6 sm:flex-row">
                            <Button
                                variant="outline"
                                onClick={handleCancelDelete}
                                className="flex-1 border-gray-300 bg-white text-gray-700 shadow-lg hover:bg-gray-50"
                                size="lg"
                            >
                                {t('gallery_management.delete.cancel')}
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleConfirmDelete}
                                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 shadow-xl hover:from-red-700 hover:to-red-800"
                                size="lg"
                            >
                                <Trash2 className="mr-2 h-5 w-5" />
                                {t('gallery_management.delete.confirm')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Media Player Modal */}
                <Dialog open={videoPlayerOpen} onOpenChange={setVideoPlayerOpen}>
                    <DialogContent className="border-0 bg-black p-0 shadow-2xl sm:max-w-4xl">
                        <DialogTitle className="sr-only">
                            {currentVideoItem?.type === 'video'
                                ? t('gallery_management.show.items.filters.videos')
                                : t('gallery_management.show.items.media_types.audio')}
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            {currentVideoItem?.type === 'video'
                                ? `${t('gallery_management.show.items.media_types.play_video')}: ${currentVideoItem.title || `${t('gallery_management.show.items.media_types.video')} #${currentVideoItem.id}`}`
                                : `${t('gallery_management.show.items.media_types.play_audio')}: ${currentVideoItem?.title || `${t('gallery_management.show.items.media_types.audio')} #${currentVideoItem?.id}`}`}
                        </DialogDescription>
                        {currentVideoItem?.type === 'video' ? (
                            <>
                                <div className="relative aspect-video w-full">
                                    {(() => {
                                        const url = currentVideoItem.file_url || currentVideoItem.file_path;
                                        const fileId = url.includes('lh3.googleusercontent.com/d/') ? url.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1] : null;

                                        if (fileId) {
                                            // Use Google Drive embedded player for videos
                                            const embedUrl = `https://drive.google.com/file/d/${fileId}/preview?usp=embed_facebook&rm=minimal`;
                                            console.log('Using Google Drive embed player:', embedUrl);

                                            return (
                                                <div className="relative h-full w-full overflow-hidden">
                                                    <iframe
                                                        src={embedUrl}
                                                        className="h-full w-full"
                                                        allow="autoplay; fullscreen"
                                                        allowFullScreen
                                                        sandbox="allow-scripts allow-same-origin allow-presentation"
                                                        referrerPolicy="no-referrer"
                                                        onLoad={() => {
                                                            console.log('Google Drive embed loaded');
                                                        }}
                                                        onError={(e) => {
                                                            console.error('Embed iframe error:', e);
                                                            setMediaError(t('gallery_management.show.items.media_error'));
                                                        }}
                                                    />
                                                    {/* Overlay to hide the top-right corner where the external link button appears */}
                                                    <div className="pointer-events-none absolute top-0 right-0 h-16 w-16 bg-black"></div>
                                                </div>
                                            );
                                        } else {
                                            // Fallback for non-Google Drive URLs
                                            return (
                                                <video
                                                    src={url}
                                                    controls
                                                    autoPlay
                                                    playsInline
                                                    className="h-full w-full object-contain"
                                                    onError={() => {
                                                        setMediaError(`Video format not supported. URL: ${url}`);
                                                    }}
                                                />
                                            );
                                        }
                                    })()}
                                </div>
                            </>
                        ) : currentVideoItem?.type === 'audio' ? (
                            <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8">
                                <div className="mb-6 text-center">
                                    <div className="mb-4 text-8xl">🎵</div>
                                </div>
                                <div className="flex justify-center">
                                    {!mediaError ? (
                                        <audio
                                            src={(() => {
                                                const url = currentVideoItem.file_url || currentVideoItem.file_path;
                                                // Convert lh3.googleusercontent.com URLs to direct streaming format for audio
                                                if (url.includes('lh3.googleusercontent.com/d/')) {
                                                    const fileId = url.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1];
                                                    return fileId ? `https://drive.google.com/uc?export=download&id=${fileId}` : url;
                                                }
                                                return url;
                                            })()}
                                            controls
                                            autoPlay
                                            className="w-full max-w-md"
                                            onError={(e) => {
                                                console.error('Audio playback error:', e);
                                                const target = e.target as HTMLAudioElement;
                                                if (target.error) {
                                                    switch (target.error.code) {
                                                        case target.error.MEDIA_ERR_ABORTED:
                                                            setMediaError(t('gallery_management.show.items.media_error'));
                                                            break;
                                                        case target.error.MEDIA_ERR_NETWORK:
                                                            setMediaError(t('gallery_management.show.items.media_error'));
                                                            break;
                                                        case target.error.MEDIA_ERR_DECODE:
                                                            setMediaError(t('gallery_management.show.items.media_error'));
                                                            break;
                                                        case target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                                                            setMediaError(t('gallery_management.show.items.media_error'));
                                                            break;
                                                        default:
                                                            setMediaError(t('gallery_management.show.items.media_error'));
                                                    }
                                                } else {
                                                    setMediaError(t('gallery_management.show.items.media_error'));
                                                }
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full max-w-md text-center">
                                            <div className="mb-4 text-6xl">⚠️</div>
                                            <h3 className="mb-2 text-lg font-semibold text-white">
                                                {t('gallery_management.show.items.media_error')}
                                            </h3>
                                            <p className="mb-4 text-sm text-gray-300">{mediaError}</p>
                                            <button
                                                onClick={() => {
                                                    setMediaError(null);
                                                    // Force audio reload by re-setting the current item
                                                    const item = currentVideoItem;
                                                    setCurrentVideoItem(null);
                                                    setTimeout(() => setCurrentVideoItem(item), 100);
                                                }}
                                                className="rounded-lg bg-white px-4 py-2 text-black transition-colors hover:bg-gray-200"
                                            >
                                                {t('gallery_management.show.drive_picker.selection.clear')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
