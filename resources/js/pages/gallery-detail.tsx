import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card, CardContent } from '@/components/ui/card';
import PublicLayout from '@/layouts/public-layout';
import { Head, Link } from '@inertiajs/react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Grid3x3, Home, Images, Layers, Maximize, Play, Volume2, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface GalleryItem {
    id: number;
    gallery_id: number;
    title: string | null;
    caption: string | null;
    mime_type: string | null;
    file_path: string | null;
    metadata: any;
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

interface Contact {
    id: number;
    name: string;
    email: string;
    message: string;
    phone: string | null;
    created_at: string;
    updated_at: string;
}

interface GalleryDetailPageProps {
    gallery: Gallery;
    otherGalleries: Gallery[];
    contact?: Contact;
}

export default function GalleryDetailPage({ gallery, otherGalleries, contact }: GalleryDetailPageProps) {
    const [selectedImage, setSelectedImage] = useState<number | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
    const [videoError, setVideoError] = useState<string | null>(null);
    const headerRef = useRef(null);
    const itemsRef = useRef(null);

    const headerInView = useInView(headerRef, { once: true, amount: 0.3 });
    const itemsInView = useInView(itemsRef, { once: true, amount: 0.1 });

    // Keyboard navigation for lightbox
    useEffect(() => {
        if (selectedImage === null) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'Escape':
                    closeLightbox();
                    break;
                case 'ArrowLeft':
                    prevImage();
                    break;
                case 'ArrowRight':
                    nextImage();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedImage, currentImageIndex]);

    // Force video reload when navigating in lightbox
    useEffect(() => {
        if (selectedImage !== null && gallery.items[currentImageIndex]?.mime_type?.startsWith('video/')) {
            const video = document.querySelector('.lightbox-video') as HTMLVideoElement;
            if (video) {
                video.load(); // Force reload the video
            }
        }
    }, [currentImageIndex, selectedImage]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getMediaIcon = (mimeType: string | null) => {
        if (!mimeType) return Images;
        if (mimeType.startsWith('video/')) return Play;
        if (mimeType.startsWith('audio/')) return Volume2;
        return Images;
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

    const extractFileIdFromUrl = (url: string): string | null => {
        if (url.includes('lh3.googleusercontent.com/d/')) {
            return url.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1] || null;
        } else if (url.includes('drive.google.com')) {
            return url.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1] || url.match(/id=([a-zA-Z0-9_-]+)/)?.[1] || null;
        }
        return null;
    };

    const isGoogleDriveUrl = (url: string): boolean => {
        return url.includes('drive.google.com') || url.includes('lh3.googleusercontent.com');
    };

    const openLightbox = (index: number) => {
        setCurrentImageIndex(index);
        setSelectedImage(index);
        setCurrentUrlIndex(0); // Reset URL index when opening lightbox
        setVideoError(null); // Reset video error when opening lightbox
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        // Pause any playing video in the lightbox
        const lightboxVideo = document.querySelector('.lightbox-video') as HTMLVideoElement;
        if (lightboxVideo) {
            lightboxVideo.pause();
        }

        setSelectedImage(null);
        document.body.style.overflow = 'unset';
    };

    const nextImage = () => {
        if (currentImageIndex < gallery.items.length - 1) {
            setCurrentImageIndex(currentImageIndex + 1);
        } else {
            setCurrentImageIndex(0);
        }
        setCurrentUrlIndex(0); // Reset URL index when changing media
        setVideoError(null); // Reset video error when changing media
    };

    const prevImage = () => {
        if (currentImageIndex > 0) {
            setCurrentImageIndex(currentImageIndex - 1);
        } else {
            setCurrentImageIndex(gallery.items.length - 1);
        }
        setCurrentUrlIndex(0); // Reset URL index when changing media
        setVideoError(null); // Reset video error when changing media
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
        <PublicLayout currentPath={`/gallery/${gallery.slug}`}>
            <Head title={`${gallery.title} - Galeri`} />

            <div className="relative overflow-hidden">
                {/* Animated Background Elements */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <motion.div
                        className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-gradient-to-br from-purple-400/10 to-pink-400/10 blur-3xl sm:h-80 sm:w-80"
                        animate={{
                            y: [0, -30, 0],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                    <motion.div
                        className="absolute bottom-20 left-1/4 h-32 w-32 rounded-full bg-gradient-to-br from-cyan-400/8 to-blue-400/8 blur-3xl sm:h-64 sm:w-64"
                        animate={{
                            x: [0, 30, 0],
                            y: [0, -20, 0],
                        }}
                        transition={{
                            duration: 12,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: 3,
                        }}
                    />
                </div>

                <div className="relative mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8 lg:px-8">
                    {/* Breadcrumbs */}
                    <div className="mb-6">
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink asChild>
                                        <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
                                            <Home className="mr-1 h-4 w-4" />
                                            Beranda
                                        </Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink asChild>
                                        <Link href="/gallery" className="text-gray-600 hover:text-gray-900">
                                            Galeri
                                        </Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="font-medium text-gray-900">{gallery.title}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>

                    {/* Gallery Header */}
                    <motion.div
                        ref={headerRef}
                        className="mb-12 text-center"
                        initial="hidden"
                        animate={headerInView ? 'visible' : 'hidden'}
                        variants={containerVariants}
                    >
                        <motion.div
                            className="mb-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-purple-200/50 bg-gradient-to-r from-purple-50/80 to-pink-50/80 px-4 py-3 shadow-lg backdrop-blur-sm sm:gap-0 sm:px-6"
                            variants={itemVariants}
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <Badge className="bg-purple-100 text-purple-800 shadow-sm">
                                <Layers className="mr-1 h-3 w-3" />
                                {getMediaTypeLabel(gallery.items)}
                            </Badge>
                            <div className="mx-2 hidden h-4 w-px bg-gray-300 sm:block" />
                            <div className="flex items-center text-sm text-gray-600">
                                <Grid3x3 className="mr-1 h-4 w-4" />
                                {gallery.items.length} Item
                            </div>
                            <div className="mx-2 hidden h-4 w-px bg-gray-300 sm:block" />
                            <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="mr-1 h-4 w-4" />
                                {formatDate(gallery.created_at)}
                            </div>
                        </motion.div>

                        <motion.h1
                            className="mb-4 bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-2xl font-bold text-transparent sm:text-4xl md:text-5xl lg:text-6xl"
                            variants={itemVariants}
                        >
                            {gallery.title}
                        </motion.h1>

                        {gallery.description && (
                            <motion.p className="mx-auto max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg" variants={itemVariants}>
                                {gallery.description}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Gallery Items Grid */}
                    {gallery.items.length > 0 ? (
                        <motion.div
                            ref={itemsRef}
                            className="mb-16 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                            initial="hidden"
                            animate={itemsInView ? 'visible' : 'hidden'}
                            variants={containerVariants}
                        >
                            {gallery.items.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    className="group"
                                    variants={cardVariants}
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Card className="flex h-full flex-col overflow-hidden border-0 bg-white/95 pt-0 shadow-lg backdrop-blur-sm transition-all duration-500 hover:shadow-2xl">
                                        <div
                                            className="relative aspect-[4/3] cursor-pointer overflow-hidden sm:aspect-square"
                                            onClick={() => openLightbox(index)}
                                        >
                                            {item.file_path && (
                                                <>
                                                    {item.mime_type?.startsWith('image/') ? (
                                                        <motion.img
                                                            src={item.file_path}
                                                            alt={item.title || gallery.title}
                                                            className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
                                                            whileHover={{ scale: 1.1 }}
                                                            loading="lazy"
                                                        />
                                                    ) : item.mime_type?.startsWith('video/') ? (
                                                        <div className="relative h-full bg-gray-900">
                                                            <img
                                                                src={item.file_path}
                                                                alt={item.title || gallery.title}
                                                                className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
                                                                loading="lazy"
                                                                onError={(e) => {
                                                                    // Fallback to gradient background if image fails to load
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.style.display = 'none';
                                                                    const parent = target.parentElement;
                                                                    if (parent) {
                                                                        parent.innerHTML = `
                                                                            <div class="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100">
                                                                                <div class="text-center">
                                                                                    <svg class="h-16 w-16 text-purple-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                                                                                        <path d="M8 5v14l11-7z"/>
                                                                                    </svg>
                                                                                    <p class="text-sm font-medium text-purple-600">Video</p>
                                                                                </div>
                                                                            </div>
                                                                            <div class="absolute top-3 right-3 rounded-full bg-purple-600/80 p-2 backdrop-blur-sm">
                                                                                <svg class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                                                    <path d="M8 5v14l11-7z"/>
                                                                                </svg>
                                                                            </div>
                                                                        `;
                                                                    }
                                                                }}
                                                            />
                                                            {/* Center play button overlay */}
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                                                <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                                                                    <Play className="h-8 w-8 text-white" />
                                                                </div>
                                                            </div>
                                                            {/* Top-right play button */}
                                                            <div className="absolute top-3 right-3 rounded-full bg-black/50 p-2 backdrop-blur-sm">
                                                                <Play className="h-4 w-4 text-white" />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                                            {React.createElement(getMediaIcon(item.mime_type), {
                                                                className: 'h-16 w-16 text-gray-400',
                                                            })}
                                                        </div>
                                                    )}
                                                </>
                                            )}

                                            {/* Hover overlay */}
                                            <motion.div
                                                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100"
                                                transition={{ duration: 0.3 }}
                                            >
                                                <motion.div className="rounded-full bg-white/20 p-3 backdrop-blur-sm" whileHover={{ scale: 1.1 }}>
                                                    <Maximize className="h-6 w-6 text-white" />
                                                </motion.div>
                                            </motion.div>
                                        </div>

                                        {(item.title || item.caption) && (
                                            <CardContent className="flex flex-1 flex-col p-4">
                                                {item.title && <h4 className="mb-2 font-semibold text-gray-900">{item.title}</h4>}
                                                {item.caption && <p className="text-sm text-gray-600">{item.caption}</p>}
                                            </CardContent>
                                        )}
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div className="py-20 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
                            <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100">
                                <Images className="h-16 w-16 text-purple-300" />
                            </div>
                            <h3 className="mt-6 text-xl font-semibold text-gray-900">Galeri Kosong</h3>
                            <p className="mt-2 text-gray-500">Belum ada item dalam galeri ini.</p>
                        </motion.div>
                    )}
                </div>

                {/* Lightbox Modal */}
                <AnimatePresence>
                    {selectedImage !== null && (
                        <motion.div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 sm:p-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={closeLightbox}
                        >
                            <motion.div
                                className="relative flex h-full w-full items-center justify-center"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Close Button */}
                                <button
                                    onClick={closeLightbox}
                                    className="absolute top-2 right-2 z-50 rounded-full bg-white/10 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:top-4 sm:right-4 sm:p-2"
                                >
                                    <X className="h-5 w-5 sm:h-6 sm:w-6" />
                                </button>

                                {/* Navigation Buttons */}
                                {gallery.items.length > 1 && (
                                    <>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                prevImage();
                                            }}
                                            className="absolute top-1/2 left-1 z-50 -translate-y-1/2 rounded-full bg-white/10 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:left-4 sm:p-2"
                                        >
                                            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                nextImage();
                                            }}
                                            className="absolute top-1/2 right-1 z-50 -translate-y-1/2 rounded-full bg-white/10 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:right-4 sm:p-2"
                                        >
                                            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                                        </button>
                                    </>
                                )}

                                {/* Media Content */}
                                <div className="flex h-full w-full items-center justify-center">
                                    {gallery.items[currentImageIndex]?.file_path && (
                                        <>
                                            {gallery.items[currentImageIndex]?.mime_type?.startsWith('image/') ? (
                                                <img
                                                    key={`image-${currentImageIndex}`}
                                                    src={gallery.items[currentImageIndex].file_path}
                                                    alt={gallery.items[currentImageIndex].title || gallery.title}
                                                    className="max-h-[85vh] max-w-[95vw] rounded-lg object-contain sm:max-h-[90vh] sm:max-w-[90vw]"
                                                />
                                            ) : gallery.items[currentImageIndex]?.mime_type?.startsWith('video/') ? (
                                                <div
                                                    key={`video-${currentImageIndex}`}
                                                    className="relative h-full max-h-[85vh] w-full max-w-[98vw] sm:max-h-[90vh] sm:max-w-[95vw]"
                                                >
                                                    {videoError ? (
                                                        <div className="flex h-full flex-col items-center justify-center rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 p-8 text-center">
                                                            <div className="mb-6 text-6xl">⚠️</div>
                                                            <h3 className="mb-3 text-xl font-bold text-white">Video Unavailable</h3>
                                                            <p className="mb-6 max-w-md text-sm leading-relaxed text-gray-300">
                                                                This video cannot be played. It may be private, deleted, or requires special
                                                                permissions to view.
                                                            </p>
                                                            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                                                                <button
                                                                    onClick={() => {
                                                                        setVideoError(null);
                                                                        setCurrentUrlIndex(0);
                                                                    }}
                                                                    className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                                                                >
                                                                    Try Again
                                                                </button>
                                                                <button
                                                                    onClick={closeLightbox}
                                                                    className="rounded-lg bg-gray-600 px-4 py-2 font-medium text-white transition-colors hover:bg-gray-700"
                                                                >
                                                                    Close
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        (() => {
                                                            const url = gallery.items[currentImageIndex].file_path;
                                                            const fileId = extractFileIdFromUrl(url);
                                                            const isGoogleDrive = isGoogleDriveUrl(url);

                                                            if (isGoogleDrive && fileId) {
                                                                // Google Drive iframe embed player
                                                                const embedUrl = `https://drive.google.com/file/d/${fileId}/preview?usp=embed_facebook&rm=minimal`;

                                                                return (
                                                                    <div className="relative h-full w-full overflow-hidden rounded-lg bg-black">
                                                                        <iframe
                                                                            key={`iframe-${currentImageIndex}`}
                                                                            src={embedUrl}
                                                                            className="h-full w-full"
                                                                            allow="autoplay; fullscreen"
                                                                            allowFullScreen
                                                                            sandbox="allow-scripts allow-same-origin allow-presentation"
                                                                            referrerPolicy="no-referrer"
                                                                            onError={() => setVideoError('Unable to load Google Drive video')}
                                                                        />
                                                                        {/* Overlay to hide Google's external link button */}
                                                                        <div className="absolute top-3 right-3 h-8 w-8 bg-black" />
                                                                    </div>
                                                                );
                                                            } else {
                                                                // Standard video player for non-Google Drive videos
                                                                return (
                                                                    <video
                                                                        key={`video-${currentImageIndex}`}
                                                                        src={url}
                                                                        controls
                                                                        controlsList="nodownload"
                                                                        disablePictureInPicture
                                                                        className="h-full w-full rounded-lg object-contain"
                                                                        onContextMenu={(e) => e.preventDefault()}
                                                                        playsInline
                                                                        autoPlay
                                                                        preload="metadata"
                                                                        onError={() => {
                                                                            setVideoError('Video could not be loaded');
                                                                        }}
                                                                        onLoadStart={() => {
                                                                            setVideoError(null);
                                                                        }}
                                                                        onCanPlay={() => {
                                                                            setVideoError(null);
                                                                        }}
                                                                    />
                                                                );
                                                            }
                                                        })()
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex h-96 w-96 items-center justify-center rounded-lg bg-gradient-to-br from-gray-100 to-gray-200">
                                                    {React.createElement(getMediaIcon(gallery.items[currentImageIndex]?.mime_type), {
                                                        className: 'h-16 w-16 text-gray-400',
                                                    })}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Media Info */}
                                <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-white sm:p-4">
                                    <div className="text-center">
                                        {gallery.items[currentImageIndex]?.title && (
                                            <h4 className="text-sm font-semibold sm:text-base">{gallery.items[currentImageIndex].title}</h4>
                                        )}
                                        {gallery.items[currentImageIndex]?.caption && (
                                            <p className="text-xs text-white/80 sm:text-sm">{gallery.items[currentImageIndex].caption}</p>
                                        )}
                                        <p className="mt-1 text-xs text-white/60 sm:mt-2">
                                            {currentImageIndex + 1} dari {gallery.items.length}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </PublicLayout>
    );
}
