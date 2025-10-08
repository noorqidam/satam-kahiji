import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gallery } from '@/types/home';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { formatDate, truncateText } from './home-utils';

interface GallerySectionProps {
    galleries: Gallery[];
}

export const GallerySection = ({ galleries }: GallerySectionProps) => {
    const [galleryScrollPosition, setGalleryScrollPosition] = useState(0);

    const scrollGallery = (direction: 'left' | 'right') => {
        const scrollAmount = 320;
        const maxScroll = Math.max(0, (galleries.length - 3) * scrollAmount);

        const newPosition =
            direction === 'left' ? Math.max(galleryScrollPosition - scrollAmount, 0) : Math.min(galleryScrollPosition + scrollAmount, maxScroll);

        setGalleryScrollPosition(newPosition);
    };

    const calculateDragConstraints = () => {
        return { right: 0, left: 0 };
    };

    if (galleries.length === 0) return null;

    return (
        <section id="gallery" className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50 py-5">
            <div className="absolute top-10 right-10 h-32 w-32 animate-pulse rounded-full bg-emerald-200 opacity-30 mix-blend-multiply blur-2xl filter" />
            <div
                className="absolute bottom-10 left-10 h-40 w-40 animate-pulse rounded-full bg-blue-200 opacity-30 mix-blend-multiply blur-2xl filter"
                style={{ animationDelay: '3s' }}
            />

            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-10 text-center">
                    <h2 className="mb-6 text-4xl font-bold text-gray-900 sm:text-5xl">
                        <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Galeri Sekolah</span>
                    </h2>
                    <p className="mx-auto max-w-3xl text-xl font-light text-gray-700">
                        Dokumentasi kegiatan dan fasilitas SMP Negeri 1 Tambun Selatan.
                    </p>
                    <div className="mx-auto mt-6 h-1 w-20 rounded-full bg-gradient-to-r from-emerald-600 to-blue-600" />
                </div>

                <div className="relative">
                    {galleries.length > 1 && (
                        <motion.button
                            onClick={() => scrollGallery('left')}
                            disabled={galleryScrollPosition === 0}
                            className="absolute top-1/2 left-0 z-20 hidden -translate-y-1/2 rounded-full border border-emerald-300/50 bg-white/95 p-4 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-emerald-400 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 lg:block"
                            style={{ marginLeft: '-24px' }}
                            whileHover={{ scale: 1.1, x: -2 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ChevronLeft className="h-6 w-6 text-emerald-700 transition-all duration-200" />
                        </motion.button>
                    )}

                    {galleries.length > 1 && (
                        <motion.button
                            onClick={() => scrollGallery('right')}
                            disabled={galleryScrollPosition >= Math.max(0, (galleries.length - 3) * 320)}
                            className="absolute top-1/2 right-0 z-20 hidden -translate-y-1/2 rounded-full border border-emerald-300/50 bg-white/95 p-4 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-emerald-400 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 lg:block"
                            style={{ marginRight: '-24px' }}
                            whileHover={{ scale: 1.1, x: 2 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ChevronRight className="h-6 w-6 text-emerald-700 transition-all duration-200" />
                        </motion.button>
                    )}

                    <div className="mx-4 hidden overflow-hidden pt-2 lg:block">
                        <motion.div
                            className="gallery-scroll-container flex cursor-grab gap-6 active:cursor-grabbing"
                            style={{
                                willChange: 'transform',
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                            }}
                            drag="x"
                            dragConstraints={calculateDragConstraints()}
                            dragElastic={0.1}
                            whileTap={{ cursor: 'grabbing' }}
                            dragMomentum={false}
                            animate={{ x: -galleryScrollPosition }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            onDragEnd={(_, info) => {
                                const cardWidth = 320;
                                const threshold = cardWidth * 0.25;
                                let newPosition = galleryScrollPosition;
                                const maxScroll = Math.max(0, (galleries.length - 3) * cardWidth);

                                if (info.offset.x < -threshold && galleryScrollPosition < maxScroll) {
                                    newPosition = Math.min(galleryScrollPosition + cardWidth, maxScroll);
                                } else if (info.offset.x > threshold && galleryScrollPosition > 0) {
                                    newPosition = Math.max(galleryScrollPosition - cardWidth, 0);
                                }

                                setGalleryScrollPosition(newPosition);
                            }}
                        >
                            {galleries.map((gallery) => (
                                <div key={gallery.id} className="w-80 flex-shrink-0">
                                    <Link href={`/gallery/${gallery.slug}`} className="block">
                                        <Card className="gallery-card group h-full cursor-pointer overflow-hidden rounded-lg border-0 bg-white/80 py-0 shadow-xl backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                                            {gallery.featured_image ? (
                                                <div className="relative h-48 overflow-hidden rounded-t-lg bg-gray-100 sm:h-56">
                                                    <img
                                                        src={gallery.featured_image}
                                                        alt={gallery.title}
                                                        className="absolute inset-0 h-full w-full rounded-t-lg object-cover transition-all duration-500 group-hover:scale-[1.08]"
                                                        loading="lazy"
                                                        decoding="async"
                                                        style={
                                                            {
                                                                imageRendering: 'auto' as const,
                                                                backfaceVisibility: 'hidden',
                                                                transform: 'translateZ(0)',
                                                                filter: 'contrast(1.02) saturate(1.05) brightness(1.01)',
                                                                transformStyle: 'preserve-3d',
                                                                willChange: 'transform',
                                                                WebkitBackfaceVisibility: 'hidden',
                                                                WebkitTransform: 'translateZ(0)',
                                                                MozBackfaceVisibility: 'hidden',
                                                            } as React.CSSProperties
                                                        }
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.style.display = 'none';
                                                            const parent = target.parentElement;
                                                            if (parent) {
                                                                parent.innerHTML =
                                                                    '<div class="flex h-full items-center justify-center bg-gradient-to-br from-emerald-100 to-blue-100"><div class="h-16 w-16 text-emerald-500">📸</div></div>';
                                                            }
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                                </div>
                                            ) : gallery.featured_items.length > 0 && gallery.featured_items[0].file_url ? (
                                                <div className="relative h-48 overflow-hidden rounded-t-lg bg-gray-100 sm:h-56">
                                                    <img
                                                        src={gallery.featured_items[0].file_url}
                                                        alt={gallery.featured_items[0].title || gallery.title}
                                                        className="absolute inset-0 h-full w-full rounded-t-lg object-cover transition-all duration-500 group-hover:scale-[1.08]"
                                                        loading="lazy"
                                                        decoding="async"
                                                        style={
                                                            {
                                                                imageRendering: 'auto' as const,
                                                                backfaceVisibility: 'hidden',
                                                                transform: 'translateZ(0)',
                                                                filter: 'contrast(1.02) saturate(1.05) brightness(1.01)',
                                                                transformStyle: 'preserve-3d',
                                                                willChange: 'transform',
                                                                WebkitBackfaceVisibility: 'hidden',
                                                                WebkitTransform: 'translateZ(0)',
                                                                MozBackfaceVisibility: 'hidden',
                                                            } as React.CSSProperties
                                                        }
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.style.display = 'none';
                                                            const parent = target.parentElement;
                                                            if (parent) {
                                                                parent.innerHTML =
                                                                    '<div class="flex h-full items-center justify-center bg-gradient-to-br from-emerald-100 to-blue-100"><div class="h-16 w-16 text-emerald-500">📸</div></div>';
                                                            }
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                                </div>
                                            ) : (
                                                <div className="flex h-56 items-center justify-center rounded-t-lg bg-gradient-to-br from-emerald-100 to-blue-100 transition-all duration-500 group-hover:from-emerald-200 group-hover:to-blue-200">
                                                    <BookOpen className="h-16 w-16 text-emerald-500 transition-all duration-300 group-hover:scale-110 group-hover:text-emerald-600" />
                                                </div>
                                            )}
                                            <CardHeader className="relative pt-4 pb-3">
                                                <div className="absolute -top-3 right-3 h-6 w-6 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                                    <div className="h-full w-full rounded-full border-2 border-white" />
                                                </div>
                                                <CardTitle className="text-lg font-semibold text-gray-900 transition-colors duration-300 group-hover:text-emerald-600">
                                                    {gallery.title}
                                                </CardTitle>
                                                {gallery.description && (
                                                    <CardDescription className="text-sm text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
                                                        {truncateText(gallery.description, 100)}
                                                    </CardDescription>
                                                )}
                                            </CardHeader>
                                            <CardContent className="pt-0 pb-4">
                                                <div className="flex items-center justify-between text-xs text-gray-500 transition-colors duration-300 group-hover:text-gray-600">
                                                    <span className="flex items-center">
                                                        <Calendar className="mr-1 h-3 w-3" />
                                                        {formatDate(gallery.created_at)}
                                                    </span>
                                                    <ChevronRight className="h-4 w-4 text-emerald-500 opacity-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    <div className="mb-8 px-4 lg:hidden">
                        <motion.div
                            className="flex cursor-grab gap-4 active:cursor-grabbing"
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0}
                            whileTap={{ cursor: 'grabbing' }}
                            dragMomentum={false}
                            animate={{ x: -galleryScrollPosition }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            onDragEnd={(_, info) => {
                                // Enhanced mobile drag snapping
                                const cardWidth = 288;
                                const threshold = cardWidth * 0.2;
                                let newPosition = galleryScrollPosition;
                                const maxScroll = Math.max(0, (galleries.length - 1) * cardWidth);

                                if (info.offset.x < -threshold && galleryScrollPosition < maxScroll) {
                                    newPosition = Math.min(galleryScrollPosition + cardWidth, maxScroll);
                                } else if (info.offset.x > threshold && galleryScrollPosition > 0) {
                                    newPosition = Math.max(galleryScrollPosition - cardWidth, 0);
                                }

                                setGalleryScrollPosition(newPosition);
                            }}
                        >
                            {galleries.map((gallery, index) => (
                                <motion.div
                                    key={`mobile-${gallery.id}`}
                                    className="w-72 flex-shrink-0"
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.6,
                                        delay: index * 0.1,
                                        type: 'spring',
                                        bounce: 0.3,
                                    }}
                                    viewport={{ once: true }}
                                >
                                    <Link href={`/gallery/${gallery.slug}`}>
                                        <Card className="group h-full cursor-pointer overflow-hidden rounded-lg border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
                                            {gallery.featured_image ? (
                                                <div className="relative h-44 overflow-hidden rounded-t-lg bg-gray-100">
                                                    <img
                                                        src={gallery.featured_image}
                                                        alt={gallery.title}
                                                        className="absolute inset-0 h-full w-full object-cover transition-all duration-500 group-hover:scale-[1.08]"
                                                        loading="lazy"
                                                        decoding="async"
                                                        style={
                                                            {
                                                                imageRendering: 'auto' as const,
                                                                backfaceVisibility: 'hidden',
                                                                transform: 'translateZ(0)',
                                                                filter: 'contrast(1.02) saturate(1.05) brightness(1.01)',
                                                                transformStyle: 'preserve-3d',
                                                                willChange: 'transform',
                                                                WebkitBackfaceVisibility: 'hidden',
                                                                WebkitTransform: 'translateZ(0)',
                                                                MozBackfaceVisibility: 'hidden',
                                                            } as React.CSSProperties
                                                        }
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.style.display = 'none';
                                                            const parent = target.parentElement;
                                                            if (parent) {
                                                                parent.innerHTML =
                                                                    '<div class="flex h-full items-center justify-center bg-gradient-to-br from-emerald-100 to-blue-100"><div class="h-16 w-16 text-emerald-500">📸</div></div>';
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex h-44 items-center justify-center rounded-t-lg bg-gradient-to-br from-emerald-100 to-blue-100">
                                                    <BookOpen className="h-12 w-12 text-emerald-500" />
                                                </div>
                                            )}
                                            <CardHeader className="relative pt-3 pb-2">
                                                <div className="absolute -top-3 right-3 h-6 w-6 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                                    <div className="h-full w-full rounded-full border-2 border-white" />
                                                </div>
                                                <CardTitle className="text-base font-semibold text-gray-900 transition-colors duration-300 group-hover:text-emerald-600">
                                                    {truncateText(gallery.title, 60)}
                                                </CardTitle>
                                                {gallery.description && (
                                                    <CardDescription className="text-sm text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
                                                        {truncateText(gallery.description, 80)}
                                                    </CardDescription>
                                                )}
                                            </CardHeader>
                                            <CardContent className="pt-0 pb-4">
                                                <div className="flex items-center justify-between text-xs text-gray-500 transition-colors duration-300 group-hover:text-gray-600">
                                                    <span className="flex items-center">
                                                        <Calendar className="mr-1 h-3 w-3" />
                                                        {formatDate(gallery.created_at)}
                                                    </span>
                                                    <ChevronRight className="h-4 w-4 text-emerald-500 opacity-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Enhanced Swipe instruction with icon */}
                        <div className="mt-3 flex items-center justify-center gap-2">
                            <motion.div animate={{ x: [-3, 3, -3] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                                <ChevronLeft className="h-4 w-4 text-emerald-500" />
                            </motion.div>
                            <p className="text-center text-sm font-medium text-emerald-600">Geser untuk navigasi</p>
                            <motion.div animate={{ x: [3, -3, 3] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                                <ChevronRight className="h-4 w-4 text-emerald-500" />
                            </motion.div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <Link href="/gallery">
                        <Button
                            size="lg"
                            className="group bg-gradient-to-r from-emerald-600 to-blue-600 px-8 py-3 text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:from-emerald-700 hover:to-blue-700 hover:shadow-xl hover:shadow-emerald-500/25"
                        >
                            <span className="flex items-center gap-2">
                                Lihat Semua Galeri
                                <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                            </span>
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
};
