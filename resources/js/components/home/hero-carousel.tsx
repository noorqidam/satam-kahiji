import { Button } from '@/components/ui/button';
import { LazyImage } from '@/components/ui/lazy-image';
import { Post } from '@/types/home';
import { Link } from '@inertiajs/react';
import { motion, PanInfo } from 'framer-motion';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState, memo } from 'react';
import { truncateText } from './home-utils';

interface HeroCarouselProps {
    featuredNews: Post[];
}

export const HeroCarousel = memo(function HeroCarousel({ featuredNews }: HeroCarouselProps) {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        if (featuredNews.length > 1) {
            const timer = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % featuredNews.length);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [featuredNews.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % featuredNews.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + featuredNews.length) % featuredNews.length);
    };

    const handleDragEnd = (info: PanInfo) => {
        if (window.innerWidth >= 640) return;

        try {
            setTimeout(() => {
                const contentLinks = document.querySelectorAll('.hero-slide a');
                contentLinks.forEach((link) => {
                    if (link && link instanceof HTMLElement) {
                        link.style.pointerEvents = 'auto';
                    }
                });
            }, 100);

            if (!featuredNews || featuredNews.length === 0) return;

            const threshold = Math.min(60, window.innerWidth * 0.15);
            let newSlide = currentSlide;

            if (info.offset.x < -threshold && currentSlide < featuredNews.length - 1) {
                newSlide = currentSlide + 1;
            } else if (info.offset.x > threshold && currentSlide > 0) {
                newSlide = currentSlide - 1;
            }

            newSlide = Math.max(0, Math.min(newSlide, featuredNews.length - 1));

            if (newSlide !== currentSlide && newSlide >= 0 && newSlide < featuredNews.length) {
                setCurrentSlide(newSlide);
            }
        } catch (error) {
            console.warn('Drag end handler error:', error);
        }
    };

    const handleDrag = (info: PanInfo) => {
        if (window.innerWidth >= 640) return;

        try {
            if (Math.abs(info.offset.x) > 5) {
                const contentLinks = document.querySelectorAll('.hero-slide a');
                contentLinks.forEach((link) => {
                    if (link && link instanceof HTMLElement) {
                        link.style.pointerEvents = 'none';
                    }
                });
            }
        } catch (error) {
            console.warn('Drag handler error:', error);
        }
    };

    if (featuredNews.length === 0) {
        return (
            <div className="relative flex h-[80vh] min-h-[700px] items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-emerald-600">
                <div className="absolute inset-0 animate-pulse">
                    <div
                        className="h-full w-full"
                        style={{
                            backgroundImage: `radial-gradient(circle at 30px 30px, rgba(255, 255, 255, 0.1) 2px, transparent 2px)`,
                            backgroundSize: '60px 60px',
                        }}
                    />
                </div>
                <div className="z-10 text-center">
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}>
                        <BookOpen className="mx-auto mb-6 h-32 w-32 animate-bounce text-white opacity-80" />
                        <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl lg:text-6xl">SMP Negeri 1 Tambun Selatan</h1>
                        <p className="mx-auto max-w-3xl text-xl text-white/80 md:text-2xl">Mencerdaskan Bangsa, Membentuk Karakter</p>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full max-w-full min-w-0">
            <div className="relative w-full min-w-0 overflow-hidden shadow-2xl">
                <motion.div
                    className="flex min-w-0 cursor-grab active:cursor-grabbing sm:cursor-default"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    drag="x"
                    dragConstraints={{
                        left: -((featuredNews.length - 1) * window.innerWidth),
                        right: 0,
                    }}
                    dragElastic={0.1}
                    dragMomentum={false}
                    whileTap={{}}
                    transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                    onDrag={(_, info) => handleDrag(info)}
                    onDragEnd={(_, info) => handleDragEnd(info)}
                >
                    {featuredNews.map((news) => (
                        <div key={news.id} className="hero-slide relative w-full max-w-full flex-shrink-0 overflow-hidden">
                            <div className="relative h-[80vh] min-h-[750px] w-full">
                                {news.image ? (
                                    <>
                                        <LazyImage
                                            src={news.image}
                                            alt={news.title}
                                            priority={true}
                                            className="absolute inset-0 h-full w-full object-cover object-center"
                                            sizes="100vw"
                                            style={{
                                                imageRendering: 'auto' as const,
                                                backfaceVisibility: 'hidden',
                                                transform: 'translateZ(0)',
                                                filter: 'contrast(1.01) saturate(1.02) brightness(1.005)',
                                                transformStyle: 'preserve-3d',
                                                willChange: 'transform',
                                                WebkitBackfaceVisibility: 'hidden',
                                                WebkitTransform: 'translateZ(0)',
                                                MozBackfaceVisibility: 'hidden',
                                                msBackfaceVisibility: 'hidden',
                                                WebkitFontSmoothing: 'antialiased',
                                            } as React.CSSProperties}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-transparent to-emerald-900/30" />
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-700 to-emerald-600">
                                        <div className="text-center">
                                            <BookOpen className="mx-auto mb-4 h-32 w-32 animate-pulse text-white opacity-80" />
                                            <div className="text-xl font-light text-white/80">Berita Unggulan</div>
                                        </div>
                                    </div>
                                )}

                                <div className="absolute inset-0 flex items-end">
                                    <div className="w-full p-8 md:p-12 lg:p-16">
                                        <div className="max-w-4xl">
                                            <motion.h1
                                                initial={{ opacity: 0, y: 30 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.8, delay: 0.3 }}
                                                className="mb-4 text-3xl leading-tight font-bold text-white md:text-4xl lg:text-5xl xl:text-6xl"
                                            >
                                                {news.title}
                                            </motion.h1>
                                            {news.excerpt && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: 30 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.8, delay: 0.5 }}
                                                    className="mb-6 max-w-3xl text-lg leading-relaxed text-white/90 md:text-xl"
                                                >
                                                    {truncateText(news.excerpt, 200)}
                                                </motion.p>
                                            )}
                                            <motion.div
                                                initial={{ opacity: 0, y: 30 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.8, delay: 0.7 }}
                                            >
                                                <Link href={`/news/${news.slug}`}>
                                                    <Button
                                                        size="lg"
                                                        className="border-white/30 bg-white/20 text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/30"
                                                    >
                                                        Baca Selengkapnya
                                                        <ChevronRight className="ml-2 h-5 w-5" />
                                                    </Button>
                                                </Link>
                                            </motion.div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {featuredNews.length > 1 && (
                    <>
                        <button
                            onClick={prevSlide}
                            className="group absolute top-1/2 left-6 hidden -translate-y-1/2 rounded-full border border-white/30 bg-white/20 p-4 text-white shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-white/50 hover:bg-white/30 sm:block"
                        >
                            <ChevronLeft className="h-6 w-6 transition-transform duration-200 group-hover:-translate-x-0.5" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="group absolute top-1/2 right-6 hidden -translate-y-1/2 rounded-full border border-white/30 bg-white/20 p-4 text-white shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-white/50 hover:bg-white/30 sm:block"
                        >
                            <ChevronRight className="h-6 w-6 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </button>

                        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 space-x-3">
                            {featuredNews.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`h-3 rounded-full border border-white/60 shadow-lg backdrop-blur-sm transition-all duration-300 ${
                                        index === currentSlide ? 'w-10 bg-white shadow-white/30' : 'w-3 bg-white/40 hover:scale-110 hover:bg-white/60'
                                    }`}
                                />
                            ))}
                        </div>

                        <div className="absolute bottom-0 left-0 h-1 w-full bg-black/20">
                            <div
                                className="h-full bg-gradient-to-r from-blue-400 to-emerald-400 transition-all duration-300"
                                style={{ width: `${((currentSlide + 1) / featuredNews.length) * 100}%` }}
                            />
                        </div>

                        <div className="absolute right-4 bottom-4 sm:hidden">
                            <div className="flex items-center gap-2 rounded-full bg-black/20 px-3 py-2 backdrop-blur-sm">
                                <motion.div animate={{ x: [-2, 2, -2] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                                    <ChevronLeft className="h-3 w-3 text-white/70" />
                                </motion.div>
                                <span className="text-xs font-medium text-white/70">Geser</span>
                                <motion.div animate={{ x: [2, -2, 2] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                                    <ChevronRight className="h-3 w-3 text-white/70" />
                                </motion.div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
});
