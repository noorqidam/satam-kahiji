import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import PublicLayout from '@/layouts/public-layout';
import { Head, Link, router } from '@inertiajs/react';
import { motion, useInView } from 'framer-motion';
import { Calendar, Filter, Newspaper, Search, Sparkles, Tag, TrendingUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface User {
    id: number;
    name: string;
}

interface Post {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    category: 'news' | 'announcements';
    image: string | null;
    created_at: string;
    is_published: boolean;
    user: User;
}

interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedPosts {
    data: Post[];
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

interface NewsPageProps {
    posts: PaginatedPosts;
    filters: {
        category?: string;
        search?: string;
    };
    contact?: Contact;
}

export default function NewsPage({ posts, filters }: NewsPageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
    const [isLoading, setIsLoading] = useState(false);
    const isFirstRender = useRef(true);
    const headerRef = useRef(null);
    const postsRef = useRef(null);

    const headerInView = useInView(headerRef, { once: true, amount: 0.3 });
    const postsInView = useInView(postsRef, { once: true, amount: 0.1 });

    // Debounced search effect
    useEffect(() => {
        // Skip the first render to prevent unnecessary API call
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

            if (selectedCategory !== '') {
                params.category = selectedCategory; // Send English to backend
            }

            router.get('/news', params, {
                preserveState: true,
                preserveScroll: true,
                only: ['posts'],
                onFinish: () => setIsLoading(false),
            });
        }, 300); // Reduced delay for better responsiveness

        return () => clearTimeout(timeoutId);
    }, [search, selectedCategory]);

    const handleCategoryFilter = (category: string) => {
        setSelectedCategory(category);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getCategoryColor = (category: string) => {
        return category === 'news' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800';
    };

    const getCategoryLabel = (category: string) => {
        return category === 'news' ? 'Berita' : 'Pengumuman';
    };

    const truncateContent = (content: string, maxLength: number = 150) => {
        const textContent = content.replace(/<[^>]*>/g, '');
        return textContent.length > maxLength ? textContent.substring(0, maxLength) + '...' : textContent;
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
        <PublicLayout currentPath="/news">
            <Head title="Berita & Pengumuman" />

            <div className="relative overflow-hidden">
                {/* Animated Background Elements */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <motion.div
                        className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-gradient-to-br from-blue-400/10 to-purple-400/10 blur-3xl sm:h-80 sm:w-80"
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
                        className="absolute top-1/4 -left-20 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-400/8 to-cyan-400/8 blur-3xl sm:h-64 sm:w-64"
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
                </div>

                <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <>
                        {/* Enhanced Header */}
                        <motion.div
                            ref={headerRef}
                            className="mb-10 text-center"
                            initial="hidden"
                            animate={headerInView ? 'visible' : 'hidden'}
                            variants={containerVariants}
                        >
                            <motion.h1
                                className="bg-gradient-to-r from-gray-900 via-blue-800 to-emerald-800 bg-clip-text pb-2 text-5xl font-bold text-transparent sm:text-6xl lg:text-7xl"
                                variants={itemVariants}
                            >
                                Berita & Pengumuman
                            </motion.h1>

                            <motion.p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600 sm:text-xl" variants={itemVariants}>
                                Dapatkan informasi terkini tentang kegiatan, prestasi, dan pengumuman penting sekolah
                            </motion.p>

                            <motion.div className="mt-5 flex items-center justify-center space-x-4" variants={containerVariants}>
                                <motion.div className="h-1 w-12 rounded-full bg-gradient-to-r from-transparent to-blue-400" variants={itemVariants} />
                                <motion.div className="h-2 w-6 rounded-full bg-gradient-to-r from-blue-600 to-emerald-600" variants={itemVariants} />
                                <motion.div
                                    className="h-1 w-12 rounded-full bg-gradient-to-l from-transparent to-emerald-400"
                                    variants={itemVariants}
                                />
                            </motion.div>
                        </motion.div>

                        {/* Enhanced Search and Filter */}
                        <motion.div className="mb-16" initial="hidden" animate={headerInView ? 'visible' : 'hidden'} variants={containerVariants}>
                            <div className="mx-auto max-w-3xl">
                                {/* Search Section */}
                                <motion.div className="mb-8" variants={itemVariants}>
                                    <div className="group relative">
                                        <motion.div
                                            className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-600 opacity-20 blur transition-opacity group-hover:opacity-30"
                                            whileHover={{ scale: 1.02 }}
                                            transition={{ duration: 0.3 }}
                                        />
                                        <div className="relative flex items-center">
                                            <Search className="absolute left-4 z-10 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-blue-500" />
                                            <Input
                                                type="text"
                                                placeholder="Cari berita atau pengumuman..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                className="h-14 rounded-2xl border-2 border-gray-200/50 bg-white/90 pr-4 pl-12 text-base font-medium text-gray-900 shadow-lg backdrop-blur-sm transition-all duration-300 placeholder:text-gray-500 hover:border-blue-300/50 focus:border-blue-500/50 focus:shadow-xl"
                                            />
                                            {isLoading && (
                                                <motion.div
                                                    className="absolute right-4"
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                >
                                                    <Sparkles className="h-5 w-5 text-blue-500" />
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Enhanced Category Filters */}
                                <motion.div className="text-center" variants={itemVariants}>
                                    <div className="mb-4 inline-flex items-center rounded-full bg-white/80 px-4 py-2 shadow-lg backdrop-blur-sm">
                                        <Filter className="mr-2 h-4 w-4 text-gray-500" />
                                        <span className="text-sm font-medium text-gray-600">Filter Kategori</span>
                                    </div>

                                    <div className="flex flex-wrap justify-center gap-3">
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button
                                                variant={selectedCategory === '' ? 'default' : 'outline'}
                                                size="lg"
                                                onClick={() => handleCategoryFilter('')}
                                                className={`relative overflow-hidden px-6 py-3 font-semibold shadow-lg transition-all duration-300 ${
                                                    selectedCategory === ''
                                                        ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-blue-200 hover:shadow-xl'
                                                        : 'bg-white/90 text-gray-700 backdrop-blur-sm hover:bg-blue-50 hover:text-blue-700'
                                                }`}
                                            >
                                                <TrendingUp className="mr-2 h-4 w-4" />
                                                Semua
                                            </Button>
                                        </motion.div>

                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button
                                                variant={selectedCategory === 'news' ? 'default' : 'outline'}
                                                size="lg"
                                                onClick={() => handleCategoryFilter('news')}
                                                className={`relative overflow-hidden px-6 py-3 font-semibold shadow-lg transition-all duration-300 ${
                                                    selectedCategory === 'news'
                                                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-200 hover:shadow-xl'
                                                        : 'bg-white/90 text-gray-700 backdrop-blur-sm hover:bg-blue-50 hover:text-blue-700'
                                                }`}
                                            >
                                                <Newspaper className="mr-2 h-4 w-4" />
                                                Berita
                                            </Button>
                                        </motion.div>

                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button
                                                variant={selectedCategory === 'announcements' ? 'default' : 'outline'}
                                                size="lg"
                                                onClick={() => handleCategoryFilter('announcements')}
                                                className={`relative overflow-hidden px-6 py-3 font-semibold shadow-lg transition-all duration-300 ${
                                                    selectedCategory === 'announcements'
                                                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-emerald-200 hover:shadow-xl'
                                                        : 'bg-white/90 text-gray-700 backdrop-blur-sm hover:bg-emerald-50 hover:text-emerald-700'
                                                }`}
                                            >
                                                <Tag className="mr-2 h-4 w-4" />
                                                Pengumuman
                                            </Button>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Enhanced Posts Grid */}
                        {posts.data.length > 0 ? (
                            <>
                                <motion.div
                                    ref={postsRef}
                                    className="mb-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3"
                                    initial="hidden"
                                    animate={postsInView ? 'visible' : 'hidden'}
                                    variants={containerVariants}
                                >
                                    {posts.data.map((post) => (
                                        <motion.div
                                            key={post.id}
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
                                                    className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-emerald-50/50 opacity-0 group-hover:opacity-100"
                                                    transition={{ duration: 0.4 }}
                                                />

                                                {/* Floating decoration */}
                                                <motion.div
                                                    className={`absolute -top-6 -right-6 h-20 w-20 rounded-full opacity-5 group-hover:opacity-10 ${
                                                        post.category === 'news'
                                                            ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                                                            : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                                                    }`}
                                                    animate={{ rotate: [0, 360] }}
                                                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                                />

                                                {post.image && (
                                                    <div className="relative aspect-video overflow-hidden">
                                                        <motion.img
                                                            src={post.image.startsWith('http') ? post.image : `/storage/posts/${post.image}`}
                                                            alt={post.title}
                                                            className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
                                                            whileHover={{ scale: 1.1 }}
                                                            transition={{ duration: 0.6, ease: 'easeOut' }}
                                                        />
                                                        {/* Image overlay on hover */}
                                                        <motion.div
                                                            className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100"
                                                            transition={{ duration: 0.3 }}
                                                        />
                                                    </div>
                                                )}

                                                <div className="relative z-10 flex flex-1 flex-col">
                                                    <CardHeader className="pb-3">
                                                        <div className="mb-3 flex items-center justify-between">
                                                            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 400 }}>
                                                                <Badge
                                                                    className={`${getCategoryColor(post.category)} shadow-sm transition-all duration-300 group-hover:shadow-md`}
                                                                >
                                                                    {getCategoryLabel(post.category)}
                                                                </Badge>
                                                            </motion.div>
                                                            <div className="flex items-center text-sm text-gray-500 transition-colors group-hover:text-gray-600">
                                                                <Calendar className="mr-1 h-3 w-3" />
                                                                {formatDate(post.created_at)}
                                                            </div>
                                                        </div>
                                                        <motion.h3
                                                            className="text-xl leading-tight font-bold"
                                                            whileHover={{ x: 4 }}
                                                            transition={{ type: 'spring', stiffness: 300 }}
                                                        >
                                                            <Link
                                                                href={`/news/${post.slug}`}
                                                                className="text-gray-900 transition-colors duration-300 group-hover:text-blue-700 hover:text-blue-600"
                                                            >
                                                                {post.title}
                                                            </Link>
                                                        </motion.h3>
                                                    </CardHeader>

                                                    <CardContent className="flex flex-1 flex-col pt-0">
                                                        <p className="mb-4 flex-1 text-gray-600 transition-colors group-hover:text-gray-700">
                                                            {post.excerpt || truncateContent(post.content)}
                                                        </p>
                                                        <motion.div
                                                            className="mt-auto flex items-center justify-between"
                                                            whileHover={{ x: 2 }}
                                                            transition={{ type: 'spring', stiffness: 300 }}
                                                        >
                                                            <Link
                                                                href={`/news/${post.slug}`}
                                                                className="group inline-flex items-center text-sm font-semibold text-blue-600 transition-all duration-300 hover:text-blue-700"
                                                            >
                                                                <span>Baca Selengkapnya</span>
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
                                {posts.last_page > 1 && (
                                    <motion.div
                                        className="flex justify-center"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.3 }}
                                    >
                                        <div className="flex items-center space-x-2">
                                            {posts.links.map((link, index) => (
                                                <motion.div
                                                    key={index}
                                                    whileHover={{ scale: link.url ? 1.05 : 1 }}
                                                    whileTap={{ scale: link.url ? 0.95 : 1 }}
                                                    transition={{ type: 'spring', stiffness: 400 }}
                                                >
                                                    {link.url ? (
                                                        <Link
                                                            href={link.url}
                                                            className={`flex h-12 w-12 items-center justify-center rounded-xl text-sm font-semibold shadow-lg transition-all duration-300 ${
                                                                link.active
                                                                    ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-blue-200 hover:shadow-xl'
                                                                    : 'bg-white/90 text-gray-700 backdrop-blur-sm hover:bg-blue-50 hover:text-blue-700 hover:shadow-xl'
                                                            }`}
                                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                                        />
                                                    ) : (
                                                        <span
                                                            className="flex h-12 w-12 cursor-not-allowed items-center justify-center rounded-xl bg-gray-100/50 text-sm text-gray-400"
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
                                className="py-20 text-center"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6 }}
                            >
                                <motion.div className="mx-auto max-w-lg" variants={containerVariants} initial="hidden" animate="visible">
                                    <motion.div
                                        className="relative mx-auto mb-8 flex h-32 w-32 items-center justify-center"
                                        variants={itemVariants}
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    >
                                        {/* Animated background circle */}
                                        <motion.div
                                            className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-100 to-emerald-100"
                                            animate={{ rotate: [0, 360] }}
                                            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                        />
                                        {/* Icon container */}
                                        <motion.div
                                            className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg"
                                            whileHover={{ scale: 1.1 }}
                                            transition={{ type: 'spring', stiffness: 400 }}
                                        >
                                            <Search className="h-10 w-10 text-gray-400" />
                                        </motion.div>
                                        {/* Floating elements */}
                                        <motion.div
                                            className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-blue-400"
                                            animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                        />
                                        <motion.div
                                            className="absolute -bottom-2 -left-2 h-3 w-3 rounded-full bg-emerald-400"
                                            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                                        />
                                    </motion.div>

                                    <motion.h3
                                        className="mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-2xl font-bold text-transparent"
                                        variants={itemVariants}
                                    >
                                        Tidak ada berita ditemukan
                                    </motion.h3>

                                    <motion.p className="mb-8 text-lg leading-relaxed text-gray-500" variants={itemVariants}>
                                        {search || selectedCategory
                                            ? 'Coba ubah kata kunci pencarian atau filter kategori untuk menemukan berita yang Anda cari.'
                                            : 'Belum ada berita atau pengumuman yang dipublikasikan saat ini.'}
                                    </motion.p>

                                    {(search || selectedCategory) && (
                                        <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button
                                                onClick={() => {
                                                    setSearch('');
                                                    setSelectedCategory('');
                                                }}
                                                size="lg"
                                                className="bg-gradient-to-r from-blue-600 to-emerald-600 px-8 py-3 text-white shadow-lg hover:from-blue-700 hover:to-emerald-700 hover:shadow-xl"
                                            >
                                                <Search className="mr-2 h-5 w-5" />
                                                Lihat Semua Berita
                                            </Button>
                                        </motion.div>
                                    )}
                                </motion.div>
                            </motion.div>
                        )}
                    </>
                </div>
            </div>
        </PublicLayout>
    );
}
