import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import PublicLayout from '@/layouts/public-layout';
import { Head, Link, router } from '@inertiajs/react';
import { motion, useInView } from 'framer-motion';
import { Calendar, Eye, Grid3x3, Images, Layers, Search, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface GalleryItem {
    id: number;
    gallery_id: number;
    title: string | null;
    caption: string | null;
    mime_type: string | null;
    file_path: string | null;
    metadata: unknown;
    sort_order: number;
    is_featured: boolean;
    created_at: string;
    updated_at: string;
}

interface Gallery {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    featured_image: string | null;
    is_published: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
    items: GalleryItem[];
}

interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedGalleries {
    data: Gallery[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLinks[];
}

interface Contact {
    id: number;
    name: string;
    email: string;
    message: string;
    phone: string | null;
    created_at: string;
    updated_at: string;
}

interface GalleryPageProps {
    galleries: PaginatedGalleries;
    filters: {
        search?: string;
    };
    contact?: Contact;
}

export default function GalleryPage({ galleries, filters }: GalleryPageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [isLoading, setIsLoading] = useState(false);
    const isFirstRender = useRef(true);
    const headerRef = useRef(null);
    const galleriesRef = useRef(null);

    const headerInView = useInView(headerRef, { once: true, amount: 0.3 });
    const galleriesInView = useInView(galleriesRef, { once: true, amount: 0.1 });

    // Debounced search effect
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeoutId = setTimeout(() => {
            setIsLoading(true);
            const params: Record<string, string> = {};

            if (search.trim()) {
                params.search = search.trim();
            }

            router.get('/gallery', params, {
                preserveState: true,
                preserveScroll: true,
                only: ['galleries'],
                onFinish: () => setIsLoading(false),
            });
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };


    const getMediaTypeLabel = (items: GalleryItem[]) => {
        const hasVideo = items.some((item) => item.mime_type?.startsWith('video/'));
        const hasAudio = items.some((item) => item.mime_type?.startsWith('audio/'));
        const hasImage = items.some((item) => item.mime_type?.startsWith('image/'));

        const types = [];
        if (hasImage) types.push('Foto');
        if (hasVideo) types.push('Video');
        if (hasAudio) types.push('Audio');

        return types.join(' • ') || 'Media';
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };

    const cardVariants = {
        hidden: { y: 50, opacity: 0, scale: 0.95 },
        visible: { y: 0, opacity: 1, scale: 1 },
    };

    return (
        <PublicLayout currentPath="/gallery">
            <Head title="Galeri" />

            <div className="relative overflow-hidden">
                {/* Animated Background Elements */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <motion.div
                        className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-gradient-to-br from-purple-400/10 to-pink-400/10 blur-3xl sm:h-80 sm:w-80"
                        animate={{
                            y: [0, -30, 0],
                            scale: [1, 1.2, 1],
                            rotate: [0, 180, 360],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                    <motion.div
                        className="absolute top-1/4 -left-20 h-32 w-32 rounded-full bg-gradient-to-br from-cyan-400/8 to-blue-400/8 blur-3xl sm:h-64 sm:w-64"
                        animate={{
                            y: [0, 40, 0],
                            x: [0, 20, 0],
                            scale: [1, 0.8, 1],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: 5,
                        }}
                    />
                    <motion.div
                        className="absolute right-1/4 bottom-20 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-400/6 to-teal-400/6 blur-3xl sm:h-48 sm:w-48"
                        animate={{
                            y: [0, -25, 0],
                            x: [0, -15, 0],
                        }}
                        transition={{
                            duration: 12,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: 8,
                        }}
                    />
                </div>

                <div className="relative mx-auto max-w-7xl px-3 py-8 sm:px-4 sm:py-12 lg:px-8">
                    {/* Enhanced Header */}
                    <motion.div
                        ref={headerRef}
                        className="mb-10 text-center"
                        initial="hidden"
                        animate={headerInView ? 'visible' : 'hidden'}
                        variants={containerVariants}
                    >
                        <motion.h1
                            className="mb-4 bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-3xl font-bold text-transparent sm:mb-6 sm:text-5xl md:text-6xl lg:text-7xl"
                            variants={itemVariants}
                        >
                            Galeri
                        </motion.h1>

                        <motion.p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg md:text-xl" variants={itemVariants}>
                            Saksikan momen-momen berharga dan kegiatan sekolah melalui koleksi foto dan video kami
                        </motion.p>

                        <motion.div className="mt-5 flex items-center justify-center space-x-3 sm:mt-8 sm:space-x-4" variants={containerVariants}>
                            <motion.div className="h-1 w-12 rounded-full bg-gradient-to-r from-transparent to-purple-400" variants={itemVariants} />
                            <motion.div className="h-2 w-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600" variants={itemVariants} />
                            <motion.div className="h-1 w-12 rounded-full bg-gradient-to-l from-transparent to-pink-400" variants={itemVariants} />
                        </motion.div>
                    </motion.div>

                    {/* Enhanced Search */}
                    <motion.div
                        className="mb-12 sm:mb-16"
                        initial="hidden"
                        animate={headerInView ? 'visible' : 'hidden'}
                        variants={containerVariants}
                    >
                        <div className="mx-auto max-w-2xl px-2 sm:px-0">
                            <motion.div className="mb-8" variants={itemVariants}>
                                <div className="group relative">
                                    <motion.div
                                        className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 opacity-20 blur transition-opacity group-hover:opacity-30"
                                        whileHover={{ scale: 1.02 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                    <div className="relative flex items-center">
                                        <Search className="absolute left-3 z-10 h-4 w-4 text-gray-400 transition-colors group-focus-within:text-purple-500 sm:left-4 sm:h-5 sm:w-5" />
                                        <Input
                                            type="text"
                                            placeholder="Cari galeri..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="h-12 rounded-2xl border-2 border-gray-200/50 bg-white/90 pr-4 pl-10 text-sm font-medium text-gray-900 shadow-lg backdrop-blur-sm transition-all duration-300 placeholder:text-gray-500 hover:border-purple-300/50 focus:border-purple-500/50 focus:shadow-xl sm:h-14 sm:pl-12 sm:text-base"
                                        />
                                        {isLoading && (
                                            <motion.div
                                                className="absolute right-4"
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                            >
                                                <Sparkles className="h-4 w-4 text-purple-500 sm:h-5 sm:w-5" />
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Galleries Grid */}
                    {galleries.data.length > 0 ? (
                        <>
                            <motion.div
                                ref={galleriesRef}
                                className="mb-12 grid gap-4 sm:mb-16 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8"
                                initial="hidden"
                                animate={galleriesInView ? 'visible' : 'hidden'}
                                variants={containerVariants}
                            >
                                {galleries.data.map((gallery) => (
                                    <motion.div
                                        key={gallery.id}
                                        variants={cardVariants}
                                        whileHover={{
                                            y: -12,
                                            scale: 1.02,
                                        }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 300,
                                            damping: 20,
                                            duration: 0.6,
                                        }}
                                    >
                                        <Card className="group relative flex h-full flex-col overflow-hidden border-0 bg-white/95 pt-0 shadow-xl backdrop-blur-sm transition-all duration-500 hover:shadow-2xl">
                                            {/* Animated background overlay */}
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 opacity-0 group-hover:opacity-100"
                                                transition={{ duration: 0.4 }}
                                            />

                                            {/* Floating decoration */}
                                            <motion.div
                                                className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-gradient-to-br from-purple-500/5 to-pink-500/5 group-hover:from-purple-500/10 group-hover:to-pink-500/10"
                                                animate={{ rotate: [0, 360] }}
                                                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                            />

                                            {/* Gallery Featured Image */}
                                            <div className="relative aspect-[4/3] overflow-hidden sm:aspect-video">
                                                {gallery.featured_image ? (
                                                    <motion.img
                                                        src={gallery.featured_image}
                                                        alt={gallery.title}
                                                        className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
                                                        whileHover={{ scale: 1.1 }}
                                                        transition={{ duration: 0.6, ease: 'easeOut' }}
                                                    />
                                                ) : gallery.items.length > 0 && gallery.items[0].file_path ? (
                                                    <motion.img
                                                        src={gallery.items[0].file_path}
                                                        alt={gallery.title}
                                                        className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
                                                        whileHover={{ scale: 1.1 }}
                                                        transition={{ duration: 0.6, ease: 'easeOut' }}
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
                                                        <Images className="h-16 w-16 text-purple-300" />
                                                    </div>
                                                )}

                                                {/* Image overlay on hover */}
                                                <motion.div
                                                    className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100"
                                                    transition={{ duration: 0.3 }}
                                                />

                                                {/* Media type indicators */}
                                                <div className="absolute top-2 right-2 flex space-x-1 sm:top-3 sm:right-3 sm:space-x-2">
                                                    <motion.div
                                                        className="flex items-center rounded-full bg-white/90 px-1.5 py-0.5 text-xs font-medium text-gray-700 backdrop-blur-sm sm:px-2 sm:py-1"
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: 0.2 }}
                                                    >
                                                        <Grid3x3 className="mr-0.5 h-2.5 w-2.5 sm:mr-1 sm:h-3 sm:w-3" />
                                                        {gallery.items.length}
                                                    </motion.div>
                                                </div>

                                                {/* View overlay */}
                                                <motion.div
                                                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100"
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <motion.div
                                                        className="flex items-center rounded-full bg-white/20 px-3 py-1.5 text-white backdrop-blur-sm sm:px-4 sm:py-2"
                                                        initial={{ scale: 0.8, opacity: 0 }}
                                                        whileHover={{ scale: 1.1, opacity: 1 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <Eye className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
                                                        <span className="text-xs font-semibold sm:text-sm">Lihat Galeri</span>
                                                    </motion.div>
                                                </motion.div>
                                            </div>

                                            <div className="relative z-10 flex flex-1 flex-col">
                                                <CardContent className="flex flex-1 flex-col p-4 sm:p-6">
                                                    <div className="mb-3 flex items-center justify-between">
                                                        <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 400 }}>
                                                            <Badge className="bg-purple-100 text-purple-800 shadow-sm transition-all duration-300 group-hover:shadow-md">
                                                                <Layers className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                                                <span className="text-xs sm:text-sm">{getMediaTypeLabel(gallery.items)}</span>
                                                            </Badge>
                                                        </motion.div>
                                                        <div className="flex items-center text-xs text-gray-500 transition-colors group-hover:text-gray-600 sm:text-sm">
                                                            <Calendar className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                                            {formatDate(gallery.created_at)}
                                                        </div>
                                                    </div>

                                                    <motion.h3
                                                        className="mb-2 text-lg leading-tight font-bold sm:mb-3 sm:text-xl"
                                                        whileHover={{ x: 4 }}
                                                        transition={{ type: 'spring', stiffness: 300 }}
                                                    >
                                                        <Link
                                                            href={`/gallery/${gallery.slug}`}
                                                            className="text-gray-900 transition-colors duration-300 group-hover:text-purple-700 hover:text-purple-600"
                                                        >
                                                            {gallery.title}
                                                        </Link>
                                                    </motion.h3>

                                                    {gallery.description && (
                                                        <p className="mb-3 flex-1 text-sm text-gray-600 transition-colors group-hover:text-gray-700 sm:mb-4 sm:text-base">
                                                            {gallery.description}
                                                        </p>
                                                    )}

                                                    <motion.div
                                                        className="mt-auto flex items-center justify-between"
                                                        whileHover={{ x: 2 }}
                                                        transition={{ type: 'spring', stiffness: 300 }}
                                                    >
                                                        <Link
                                                            href={`/gallery/${gallery.slug}`}
                                                            className="group inline-flex items-center text-xs font-semibold text-purple-600 transition-all duration-300 hover:text-purple-700 sm:text-sm"
                                                        >
                                                            <span>Lihat Galeri</span>
                                                            <motion.span
                                                                className="ml-1 transition-transform duration-300 group-hover:translate-x-1"
                                                                whileHover={{ x: 4 }}
                                                            >
                                                                →
                                                            </motion.span>
                                                        </Link>
                                                    </motion.div>
                                                </CardContent>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {/* Enhanced Pagination */}
                            {galleries.last_page > 1 && (
                                <motion.div
                                    className="flex justify-center"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.3 }}
                                >
                                    <div className="flex flex-wrap items-center justify-center gap-1 sm:space-x-2">
                                        {galleries.links.map((link, index) => (
                                            <motion.div
                                                key={index}
                                                whileHover={{ scale: link.url ? 1.05 : 1 }}
                                                whileTap={{ scale: link.url ? 0.95 : 1 }}
                                                transition={{ type: 'spring', stiffness: 400 }}
                                            >
                                                {link.url ? (
                                                    <Link
                                                        href={link.url}
                                                        className={`flex h-10 w-10 items-center justify-center rounded-lg text-xs font-semibold shadow-lg transition-all duration-300 sm:h-12 sm:w-12 sm:rounded-xl sm:text-sm ${
                                                            link.active
                                                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-200 hover:shadow-xl'
                                                                : 'bg-white/90 text-gray-700 backdrop-blur-sm hover:bg-purple-50 hover:text-purple-700 hover:shadow-xl'
                                                        }`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                ) : (
                                                    <span
                                                        className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-lg bg-gray-100/50 text-xs text-gray-400 sm:h-12 sm:w-12 sm:rounded-xl sm:text-sm"
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </>
                    ) : (
                        <motion.div
                            className="py-12 text-center sm:py-20"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6 }}
                        >
                            <motion.div className="mx-auto max-w-lg" variants={containerVariants} initial="hidden" animate="visible">
                                <motion.div
                                    className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center sm:mb-8 sm:h-32 sm:w-32"
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    {/* Animated background circle */}
                                    <motion.div
                                        className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-100 to-pink-100"
                                        animate={{ rotate: [0, 360] }}
                                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                    />
                                    {/* Icon container */}
                                    <motion.div
                                        className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg sm:h-20 sm:w-20"
                                        whileHover={{ scale: 1.1 }}
                                        transition={{ type: 'spring', stiffness: 400 }}
                                    >
                                        <Images className="h-8 w-8 text-gray-400 sm:h-10 sm:w-10" />
                                    </motion.div>
                                    {/* Floating elements */}
                                    <motion.div
                                        className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-purple-400"
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                    />
                                    <motion.div
                                        className="absolute -bottom-2 -left-2 h-3 w-3 rounded-full bg-pink-400"
                                        animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                                    />
                                </motion.div>

                                <motion.h3
                                    className="mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-xl font-bold text-transparent sm:mb-4 sm:text-2xl"
                                    variants={itemVariants}
                                >
                                    Tidak ada galeri ditemukan
                                </motion.h3>

                                <motion.p className="mb-6 text-base leading-relaxed text-gray-500 sm:mb-8 sm:text-lg" variants={itemVariants}>
                                    {search
                                        ? 'Coba ubah kata kunci pencarian untuk menemukan galeri yang Anda cari.'
                                        : 'Belum ada galeri yang dipublikasikan saat ini.'}
                                </motion.p>

                                {search && (
                                    <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button
                                            onClick={() => setSearch('')}
                                            size="lg"
                                            className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2.5 text-sm text-white shadow-lg hover:from-purple-700 hover:to-pink-700 hover:shadow-xl sm:px-8 sm:py-3 sm:text-base"
                                        >
                                            <Images className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
                                            Lihat Semua Galeri
                                        </Button>
                                    </motion.div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
