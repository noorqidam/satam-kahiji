import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Post } from '@/types/home';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { formatDate, getCategoryLabel, getCategoryStyle, truncateText } from './home-utils';

interface NewsSectionProps {
    latestNews: Post[];
}

export const NewsSection = ({ latestNews }: NewsSectionProps) => {
    const [newsScrollPosition, setNewsScrollPosition] = useState(0);

    const scrollNews = (direction: 'left' | 'right') => {
        const scrollAmount = 320;
        const newPosition =
            direction === 'left'
                ? Math.max(newsScrollPosition - scrollAmount, 0)
                : Math.min(newsScrollPosition + scrollAmount, (latestNews.length - 3) * scrollAmount);
        setNewsScrollPosition(newPosition);
    };

    if (latestNews.length === 0) return null;

    return (
        <section id="news" className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-white py-5">
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-20 right-20 h-72 w-72 rounded-full bg-blue-300 blur-3xl" />
                <div className="absolute bottom-20 left-20 h-96 w-96 rounded-full bg-emerald-300 blur-3xl" />
            </div>

            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="mb-8 text-center"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <motion.h2
                        className="mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 bg-clip-text pb-1 text-4xl font-bold text-transparent md:text-5xl"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        Berita & Pengumuman Terbaru
                    </motion.h2>
                    <motion.p
                        className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-600"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        viewport={{ once: true }}
                    >
                        Tetap terkini dengan berita dan pengumuman terbaru dari kegiatan sekolah, prestasi siswa, dan informasi penting lainnya.
                    </motion.p>
                    <motion.div
                        className="mx-auto mt-6 h-1 w-20 rounded-full bg-gradient-to-r from-blue-600 to-emerald-600"
                        initial={{ width: 0 }}
                        whileInView={{ width: 80 }}
                        transition={{ duration: 1, delay: 0.6 }}
                        viewport={{ once: true }}
                    />
                </motion.div>

                <div className="relative">
                    <button
                        onClick={() => scrollNews('left')}
                        disabled={newsScrollPosition === 0}
                        className="absolute top-1/2 left-0 z-10 hidden -translate-y-1/2 rounded-full border border-gray-200 bg-white/90 p-3 shadow-lg transition-all duration-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 lg:block"
                        style={{ marginLeft: '-20px' }}
                    >
                        <ChevronLeft className="h-6 w-6 text-gray-700" />
                    </button>

                    <button
                        onClick={() => scrollNews('right')}
                        disabled={newsScrollPosition >= (latestNews.length - 3) * 320}
                        className="absolute top-1/2 right-0 z-10 hidden -translate-y-1/2 rounded-full border border-gray-200 bg-white/90 p-3 shadow-lg transition-all duration-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 lg:block"
                        style={{ marginRight: '-20px' }}
                    >
                        <ChevronRight className="h-6 w-6 text-gray-700" />
                    </button>

                    <div className="mx-4 hidden overflow-hidden pt-4 lg:block">
                        <motion.div
                            className="flex cursor-grab gap-6 active:cursor-grabbing"
                            drag="x"
                            dragConstraints={{
                                left: Math.min(-Math.max((latestNews.length - 3) * 320, 0), 0),
                                right: 0,
                            }}
                            dragElastic={0.05}
                            whileTap={{ cursor: 'grabbing' }}
                            dragMomentum={false}
                            animate={{ x: -newsScrollPosition }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            onDragEnd={(_, info) => {
                                const cardWidth = 320;
                                const threshold = cardWidth * 0.2;
                                let newPosition = newsScrollPosition;

                                if (info.offset.x < -threshold && newsScrollPosition < (latestNews.length - 3) * cardWidth) {
                                    newPosition = Math.min(newsScrollPosition + cardWidth, (latestNews.length - 3) * cardWidth);
                                } else if (info.offset.x > threshold && newsScrollPosition > 0) {
                                    newPosition = Math.max(newsScrollPosition - cardWidth, 0);
                                }

                                setNewsScrollPosition(newPosition);
                            }}
                        >
                            {latestNews.map((news, index) => (
                                <motion.div
                                    key={news.id}
                                    className="news-card w-80 flex-shrink-0"
                                    style={{
                                        willChange: 'transform',
                                        backfaceVisibility: 'hidden',
                                        transform: 'translateZ(0)',
                                    }}
                                    initial={{ opacity: 0, x: 100 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{
                                        duration: 0.6,
                                        delay: index * 0.1,
                                        type: 'spring',
                                        bounce: 0.4,
                                    }}
                                    viewport={{ once: true }}
                                    whileHover={{
                                        y: -8,
                                        scale: 1.01,
                                        rotateX: 5,
                                        transition: { duration: 0.4, type: 'spring', stiffness: 300 },
                                    }}
                                >
                                    <Link href={`/news/${news.slug}`}>
                                        <Card className="group h-full cursor-pointer overflow-hidden rounded-2xl border-2 border-blue-200/30 bg-gradient-to-tr from-slate-50/95 via-blue-50/40 to-cyan-50/30 py-0 shadow-md shadow-slate-400/20 backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-400/30">
                                            {news.image && (
                                                <div className="relative h-48 overflow-hidden rounded-t-xl bg-gray-100 sm:h-56">
                                                    <img
                                                        src={news.image}
                                                        alt={news.title}
                                                        className="absolute inset-0 h-full w-full rounded-t-xl object-cover transition-all duration-500 group-hover:scale-[1.08]"
                                                        loading="lazy"
                                                        decoding="async"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.style.display = 'none';
                                                            const parent = target.parentElement;
                                                            if (parent) {
                                                                parent.innerHTML =
                                                                    '<div class="flex h-full items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100"><div class="h-16 w-16 text-blue-600">📰</div></div>';
                                                            }
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                                </div>
                                            )}
                                            <CardHeader className="pt-4 pb-3">
                                                <div className="mb-2 flex items-center justify-between">
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-xs transition-colors duration-300 ${getCategoryStyle(news.category)} ${
                                                            news.category === 'news'
                                                                ? 'group-hover:border-blue-600 group-hover:bg-blue-100'
                                                                : 'group-hover:border-emerald-600 group-hover:bg-emerald-100'
                                                        }`}
                                                    >
                                                        {getCategoryLabel(news.category)}
                                                    </Badge>
                                                    <span className="text-xs text-gray-500 transition-colors duration-300 group-hover:text-gray-700">
                                                        {formatDate(news.created_at)}
                                                    </span>
                                                </div>
                                                <CardTitle className="text-lg leading-tight font-semibold text-gray-900 transition-colors duration-300 group-hover:text-blue-600">
                                                    {truncateText(news.title, 70)}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-0 pb-4">
                                                {news.excerpt && (
                                                    <CardDescription className="mb-3 text-sm leading-relaxed text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
                                                        {truncateText(news.excerpt, 120)}
                                                    </CardDescription>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </motion.div>
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
                            animate={{ x: -newsScrollPosition }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            onDragStart={() => {
                                // Drag started
                            }}
                            onDragEnd={(_, info) => {
                                // Drag ended
                                const cardWidth = 288;
                                const threshold = cardWidth * 0.2;
                                let newPosition = newsScrollPosition;
                                const maxScroll = Math.max(0, (latestNews.length - 1) * cardWidth);

                                if (info.offset.x < -threshold && newsScrollPosition < maxScroll) {
                                    newPosition = Math.min(newsScrollPosition + cardWidth, maxScroll);
                                } else if (info.offset.x > threshold && newsScrollPosition > 0) {
                                    newPosition = Math.max(newsScrollPosition - cardWidth, 0);
                                }

                                setNewsScrollPosition(newPosition);
                            }}
                        >
                            {latestNews.map((news, index) => (
                                <motion.div
                                    key={`mobile-${news.id}`}
                                    className="news-card w-72 flex-shrink-0"
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
                                    <Link href={`/news/${news.slug}`}>
                                        <Card className="group h-full cursor-pointer overflow-hidden rounded-xl border border-gray-200/50 bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:shadow-blue-200/30">
                                            {news.image && (
                                                <div className="relative h-44 overflow-hidden rounded-t-xl bg-gray-100">
                                                    <img
                                                        src={news.image}
                                                        alt={news.title}
                                                        className="absolute inset-0 h-full w-full rounded-t-xl object-cover"
                                                        loading="lazy"
                                                        decoding="async"
                                                    />
                                                </div>
                                            )}
                                            <CardHeader className="pt-3 pb-2">
                                                <div className="mb-2 flex items-center justify-between">
                                                    <Badge variant="outline" className={`text-xs ${getCategoryStyle(news.category)}`}>
                                                        {getCategoryLabel(news.category)}
                                                    </Badge>
                                                    <span className="text-xs text-gray-500">{formatDate(news.created_at)}</span>
                                                </div>
                                                <CardTitle className="text-base leading-tight font-semibold text-gray-900">
                                                    {truncateText(news.title, 60)}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-0 pb-3">
                                                {news.excerpt && (
                                                    <CardDescription className="text-sm text-gray-600">
                                                        {truncateText(news.excerpt, 100)}
                                                    </CardDescription>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Swipe indicator */}
                        <div className="mt-4 flex justify-center gap-2">
                            {latestNews.length > 1 &&
                                Array.from({ length: Math.min(latestNews.length, 5) }).map((_, index) => {
                                    const cardWidth = 288; // Mobile card width
                                    const currentIndex = Math.round(newsScrollPosition / cardWidth);
                                    const isActive = currentIndex === index;

                                    return (
                                        <div
                                            key={index}
                                            className={`h-2 rounded-full transition-all duration-200 ${
                                                isActive ? 'w-6 bg-blue-600' : 'w-2 bg-blue-300 hover:bg-blue-500'
                                            }`}
                                        />
                                    );
                                })}
                        </div>

                        {/* Swipe instruction */}
                        <p className="mt-2 text-center text-sm text-gray-500">Geser untuk melihat berita lainnya</p>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <Link href="/news">
                        <Button
                            size="lg"
                            className="group bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/25"
                        >
                            <span className="flex items-center gap-2">
                                Lihat Semua Berita & Pengumuman
                                <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                            </span>
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
};
