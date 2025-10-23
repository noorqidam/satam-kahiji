import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useExtracurricularUpdates } from '@/hooks/use-content-updates';
import PublicLayout from '@/layouts/public-layout';
import type { ContentUpdateEvent } from '@/types/echo';
import { Head, Link, router } from '@inertiajs/react';
import { motion, useInView } from 'framer-motion';
import { GraduationCap, Search, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Extracurricular {
    id: number;
    name: string;
    description: string | null;
    photo: string | null;
    created_at: string;
    updated_at: string;
}

interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedExtracurriculars {
    data: Extracurricular[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: PaginationLinks[];
    next_page_url: string | null;
    prev_page_url: string | null;
    first_page_url: string;
    last_page_url: string;
    path: string;
}

interface Filters {
    search: string;
}

interface ExtracurricularPageProps {
    extracurriculars: PaginatedExtracurriculars;
    filters: Filters;
}

export default function ExtracurricularPage({ extracurriculars, filters }: ExtracurricularPageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [isLoading, setIsLoading] = useState(false);

    // Handle real-time extracurricular updates
    const handleExtracurricularUpdate = useCallback((event: ContentUpdateEvent) => {
        console.log('Extracurricular updated:', event);
        // Reload the page data to get fresh extracurriculars
        router.reload({ only: ['extracurriculars'] });
    }, []);

    // Listen for extracurricular updates
    useExtracurricularUpdates(handleExtracurricularUpdate);

    const isFirstRender = useRef(true);
    const headerRef = useRef(null);
    const extracurricularsRef = useRef(null);

    const headerInView = useInView(headerRef, { once: true, amount: 0.3 });
    const extracurricularsInView = useInView(extracurricularsRef, { once: true, amount: 0.1 });

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

            router.get('/extracurricular', params, {
                preserveState: true,
                preserveScroll: true,
                only: ['extracurriculars'],
                onFinish: () => setIsLoading(false),
            });
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search]);

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
        <PublicLayout currentPath="/extracurricular">
            <Head title="Ekstrakurikuler" />

            <div className="relative overflow-hidden">
                {/* Animated Background Elements */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <motion.div
                        className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-gradient-to-br from-blue-400/10 to-indigo-400/10 blur-3xl sm:h-80 sm:w-80"
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
                        className="absolute top-1/4 -left-20 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-400/8 to-teal-400/8 blur-3xl sm:h-64 sm:w-64"
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
                        className="absolute right-1/4 bottom-20 h-24 w-24 rounded-full bg-gradient-to-br from-orange-400/6 to-red-400/6 blur-3xl sm:h-48 sm:w-48"
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
                            className="mb-4 bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-3xl font-bold text-transparent sm:mb-6 sm:text-5xl md:text-6xl lg:text-7xl"
                            variants={itemVariants}
                        >
                            Ekstrakurikuler
                        </motion.h1>

                        <motion.p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg md:text-xl" variants={itemVariants}>
                            Kembangkan bakat dan minat melalui beragam kegiatan ekstrakurikuler yang tersedia di sekolah kami
                        </motion.p>

                        <motion.div className="mt-5 flex items-center justify-center space-x-3 sm:mt-8 sm:space-x-4" variants={containerVariants}>
                            <motion.div className="h-1 w-12 rounded-full bg-gradient-to-r from-transparent to-blue-400" variants={itemVariants} />
                            <motion.div className="h-2 w-6 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600" variants={itemVariants} />
                            <motion.div className="h-1 w-12 rounded-full bg-gradient-to-l from-transparent to-indigo-400" variants={itemVariants} />
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
                                        className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 opacity-20 blur transition-opacity group-hover:opacity-30"
                                        whileHover={{ scale: 1.02 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                    <div className="relative flex items-center">
                                        <Search className="absolute left-3 z-10 h-4 w-4 text-gray-400 transition-colors group-focus-within:text-blue-500 sm:left-4 sm:h-5 sm:w-5" />
                                        <Input
                                            type="text"
                                            placeholder="Cari ekstrakurikuler..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="h-12 rounded-2xl border-2 border-gray-200/50 bg-white/90 pr-4 pl-10 text-sm font-medium text-gray-900 shadow-lg backdrop-blur-sm transition-all duration-300 placeholder:text-gray-500 hover:border-blue-300/50 focus:border-blue-500/50 focus:shadow-xl sm:h-14 sm:pl-12 sm:text-base"
                                        />
                                        {isLoading && (
                                            <motion.div
                                                className="absolute right-4"
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                            >
                                                <Sparkles className="h-4 w-4 text-blue-500 sm:h-5 sm:w-5" />
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Extracurriculars Grid */}
                    {extracurriculars.data.length > 0 ? (
                        <>
                            <motion.div
                                ref={extracurricularsRef}
                                className="mb-12 grid gap-4 sm:mb-16 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8"
                                initial="hidden"
                                animate={extracurricularsInView ? 'visible' : 'hidden'}
                                variants={containerVariants}
                            >
                                {extracurriculars.data.map((extracurricular) => (
                                    <motion.div
                                        key={extracurricular.id}
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
                                        <Card className="group h-full overflow-hidden border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10">
                                            {extracurricular.photo && (
                                                <div className="relative h-48 overflow-hidden sm:h-56">
                                                    <motion.img
                                                        src={extracurricular.photo}
                                                        alt={extracurricular.name}
                                                        className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110"
                                                        whileHover={{ scale: 1.1 }}
                                                        transition={{ duration: 0.6 }}
                                                    />
                                                    <motion.div
                                                        className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                                        initial={{ opacity: 0 }}
                                                        whileHover={{ opacity: 1 }}
                                                    />
                                                    <motion.div
                                                        className="absolute top-4 right-4 rounded-full bg-white/20 p-2 backdrop-blur-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                                        initial={{ opacity: 0, scale: 0 }}
                                                        whileHover={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: 0.1 }}
                                                    >
                                                        <GraduationCap className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                                                    </motion.div>
                                                </div>
                                            )}

                                            <CardHeader className="p-4 sm:p-6">
                                                <motion.h3
                                                    className="mb-3 text-lg font-bold text-gray-900 transition-colors duration-300 group-hover:text-blue-600 sm:text-xl"
                                                    layout
                                                >
                                                    {extracurricular.name}
                                                </motion.h3>

                                                {extracurricular.description && (
                                                    <motion.p
                                                        className="line-clamp-3 text-sm leading-relaxed text-gray-600 sm:text-base"
                                                        layout
                                                    >
                                                        {extracurricular.description}
                                                    </motion.p>
                                                )}

                                                <motion.div
                                                    className="mt-4 flex items-center justify-between"
                                                    layout
                                                >
                                                    <motion.div
                                                        className="flex items-center space-x-2"
                                                        whileHover={{ x: 4 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400" />
                                                        <span className="text-xs font-medium text-blue-600 sm:text-sm">
                                                            Aktivitas
                                                        </span>
                                                    </motion.div>

                                                    <motion.div
                                                        className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                                        whileHover={{ scale: 1.1 }}
                                                    >
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg">
                                                            <Sparkles className="h-3 w-3" />
                                                        </div>
                                                    </motion.div>
                                                </motion.div>
                                            </CardHeader>
                                        </Card>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {/* Enhanced Pagination */}
                            {extracurriculars.links && extracurriculars.links.length > 3 && (
                                <motion.div
                                    className="flex justify-center"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={extracurricularsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <div className="flex items-center space-x-1 rounded-2xl bg-white/60 p-2 shadow-lg backdrop-blur-sm sm:space-x-2 sm:p-3">
                                        {extracurriculars.links.map((link, index) => {
                                            if (!link.url) {
                                                return (
                                                    <div
                                                        key={index}
                                                        className="flex h-8 w-8 items-center justify-center rounded-xl text-sm font-medium text-gray-400 sm:h-10 sm:w-10 sm:text-base"
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                );
                                            }

                                            return (
                                                <Link
                                                    key={index}
                                                    href={link.url}
                                                    preserveState
                                                    preserveScroll
                                                    only={['extracurriculars']}
                                                >
                                                    <motion.div
                                                        className={`flex h-8 w-8 items-center justify-center rounded-xl text-sm font-medium transition-all duration-300 sm:h-10 sm:w-10 sm:text-base ${
                                                            link.active
                                                                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                                                                : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                                                        }`}
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </>
                    ) : (
                        <motion.div
                            className="py-16 text-center sm:py-24"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6 }}
                        >
                            <motion.div
                                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 sm:h-24 sm:w-24"
                                animate={{
                                    rotate: [0, 10, -10, 0],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            >
                                <Search className="h-8 w-8 text-gray-400 sm:h-10 sm:w-10" />
                            </motion.div>

                            <motion.h3
                                className="mb-3 text-xl font-bold text-gray-900 sm:mb-4 sm:text-2xl"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                Tidak ada ekstrakurikuler ditemukan
                            </motion.h3>

                            <motion.p
                                className="mb-6 text-gray-600 sm:mb-8 sm:text-lg"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                {search
                                    ? `Tidak ada ekstrakurikuler yang cocok dengan "${search}"`
                                    : 'Belum ada ekstrakurikuler yang tersedia saat ini.'}
                            </motion.p>

                            {search && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <Button
                                        onClick={() => setSearch('')}
                                        className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                                    >
                                        Hapus Pencarian
                                    </Button>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}