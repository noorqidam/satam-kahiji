import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import PublicLayout from '@/layouts/public-layout';
import { Head, router } from '@inertiajs/react';
import { motion, useInView } from 'framer-motion';
import { Building2, Search, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Facility {
    id: number;
    name: string;
    description: string;
    photo: string | null;
    metadata: Record<string, unknown>;
}

interface FacilitiesProps {
    facilities: Facility[];
    filters?: {
        search?: string;
    };
}

interface FacilityDescriptionProps {
    description: string;
}

function FacilityDescription({ description }: FacilityDescriptionProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const maxLength = 100; // Character limit before showing "read more"

    const shouldTruncate = description.length > maxLength;
    const displayText = isExpanded ? description : description.slice(0, maxLength);

    return (
        <div className="flex-1">
            <p className="text-justify text-xs text-gray-600 transition-colors group-hover:text-gray-700 sm:text-sm md:text-base lg:text-sm xl:text-xs">
                {displayText}
                {shouldTruncate && !isExpanded && '...'}
            </p>
            {shouldTruncate && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-1 text-xs font-medium text-blue-600 transition-colors duration-200 hover:text-blue-700 sm:mt-2"
                >
                    {isExpanded ? 'Read Less' : 'Read More'}
                </button>
            )}
        </div>
    );
}

export default function Facilities({ facilities, filters }: FacilitiesProps) {
    const [search, setSearch] = useState(filters?.search || '');
    const [isLoading, setIsLoading] = useState(false);
    const isFirstRender = useRef(true);
    const headerRef = useRef(null);
    const facilitiesRef = useRef(null);

    const headerInView = useInView(headerRef, { once: true, amount: 0.3 });
    const facilitiesInView = useInView(facilitiesRef, { once: true, amount: 0.1 });

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

            router.get('/facilities', params, {
                preserveState: true,
                preserveScroll: true,
                only: ['facilities'],
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
        <PublicLayout currentPath="/facilities">
            <Head title="Fasilitas Sekolah" />

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

                <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 md:py-12 lg:px-8 xl:px-12">
                    {/* Enhanced Header */}
                    <motion.div
                        ref={headerRef}
                        className="mb-10 text-center"
                        initial="hidden"
                        animate={headerInView ? 'visible' : 'hidden'}
                        variants={containerVariants}
                    >
                        <motion.h1
                            className="mb-3 bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-2xl font-bold text-transparent sm:mb-4 sm:text-4xl md:mb-6 md:text-5xl lg:text-6xl xl:text-7xl"
                            variants={itemVariants}
                        >
                            Fasilitas Sekolah
                        </motion.h1>

                        <motion.p
                            className="mx-auto max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base md:text-lg lg:text-xl"
                            variants={itemVariants}
                        >
                            Mengenal lebih dekat fasilitas-fasilitas unggulan yang mendukung proses pembelajaran dan kegiatan siswa
                        </motion.p>

                        <motion.div
                            className="mt-4 flex items-center justify-center space-x-2 sm:mt-6 sm:space-x-3 md:mt-8 md:space-x-4"
                            variants={containerVariants}
                        >
                            <motion.div className="h-1 w-12 rounded-full bg-gradient-to-r from-transparent to-blue-400" variants={itemVariants} />
                            <motion.div className="h-2 w-6 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600" variants={itemVariants} />
                            <motion.div className="h-1 w-12 rounded-full bg-gradient-to-l from-transparent to-indigo-400" variants={itemVariants} />
                        </motion.div>
                    </motion.div>

                    {/* Enhanced Search */}
                    <motion.div
                        className="mb-8 sm:mb-12 md:mb-16"
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
                                            placeholder="Cari fasilitas..."
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

                    {/* Facilities Grid */}
                    {facilities.length > 0 ? (
                        <motion.div
                            ref={facilitiesRef}
                            className="mb-8 grid gap-4 sm:mb-12 sm:grid-cols-2 sm:gap-6 md:mb-16 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4 xl:gap-6"
                            initial="hidden"
                            animate={facilitiesInView ? 'visible' : 'hidden'}
                            variants={containerVariants}
                        >
                            {facilities.map((facility) => (
                                <motion.div
                                    key={facility.id}
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
                                            className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100"
                                            transition={{ duration: 0.4 }}
                                        />

                                        {/* Floating decoration */}
                                        <motion.div
                                            className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-gradient-to-br from-blue-500/5 to-indigo-500/5 group-hover:from-blue-500/10 group-hover:to-indigo-500/10"
                                            animate={{ rotate: [0, 360] }}
                                            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                        />

                                        {/* Facility Photo */}
                                        <div className="relative aspect-[4/3] overflow-hidden sm:aspect-video lg:aspect-[4/3] xl:aspect-video">
                                            {facility.photo ? (
                                                <motion.img
                                                    src={facility.photo}
                                                    alt={facility.name}
                                                    className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
                                                    whileHover={{ scale: 1.1 }}
                                                    transition={{ duration: 0.6, ease: 'easeOut' }}
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
                                                    <Building2 className="h-16 w-16 text-blue-300" />
                                                </div>
                                            )}

                                            {/* Image overlay on hover */}
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100"
                                                transition={{ duration: 0.3 }}
                                            />
                                        </div>

                                        <div className="relative z-10 flex flex-1 flex-col">
                                            <CardHeader className="flex h-32 flex-1 flex-col p-3 sm:h-36 sm:p-4 md:h-40 md:p-5 lg:h-44 lg:p-6 xl:h-40 xl:p-5">
                                                <motion.h3
                                                    className="mb-1 text-base leading-tight font-bold sm:mb-2 sm:text-lg md:mb-3 md:text-xl lg:text-xl xl:text-lg"
                                                    whileHover={{ x: 4 }}
                                                    transition={{ type: 'spring', stiffness: 300 }}
                                                >
                                                    <span className="text-gray-900 transition-colors duration-300 group-hover:text-blue-700">
                                                        {facility.name}
                                                    </span>
                                                </motion.h3>

                                                {facility.description && <FacilityDescription description={facility.description} />}
                                            </CardHeader>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
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
                                        className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100"
                                        animate={{ rotate: [0, 360] }}
                                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                    />
                                    {/* Icon container */}
                                    <motion.div
                                        className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg sm:h-20 sm:w-20"
                                        whileHover={{ scale: 1.1 }}
                                        transition={{ type: 'spring', stiffness: 400 }}
                                    >
                                        <Building2 className="h-8 w-8 text-gray-400 sm:h-10 sm:w-10" />
                                    </motion.div>
                                    {/* Floating elements */}
                                    <motion.div
                                        className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-blue-400"
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                    />
                                    <motion.div
                                        className="absolute -bottom-2 -left-2 h-3 w-3 rounded-full bg-indigo-400"
                                        animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                                    />
                                </motion.div>

                                <motion.h3
                                    className="mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-xl font-bold text-transparent sm:mb-4 sm:text-2xl"
                                    variants={itemVariants}
                                >
                                    Tidak ada fasilitas ditemukan
                                </motion.h3>

                                <motion.p className="mb-6 text-base leading-relaxed text-gray-500 sm:mb-8 sm:text-lg" variants={itemVariants}>
                                    {search
                                        ? 'Coba ubah kata kunci pencarian untuk menemukan fasilitas yang Anda cari.'
                                        : 'Belum ada fasilitas yang tersedia saat ini.'}
                                </motion.p>

                                {search && (
                                    <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button
                                            onClick={() => setSearch('')}
                                            size="lg"
                                            className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm text-white shadow-lg hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl sm:px-8 sm:py-3 sm:text-base"
                                        >
                                            <Building2 className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
                                            Lihat Semua Fasilitas
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
