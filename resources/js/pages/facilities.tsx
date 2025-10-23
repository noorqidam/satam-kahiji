import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useFacilityUpdates } from '@/hooks/use-content-updates';
import PublicLayout from '@/layouts/public-layout';
import type { ContentUpdateEvent } from '@/types/echo';
import { Head, router } from '@inertiajs/react';
import { motion, useInView } from 'framer-motion';
import { Building2, Search, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

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
    const maxLength = 150;

    if (description.length <= maxLength) {
        return <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{description}</p>;
    }

    return (
        <div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {isExpanded ? description : `${description.slice(0, maxLength)}...`}
            </p>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
                {isExpanded ? 'Show Less' : 'Read More'}
            </button>
        </div>
    );
}

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export default function Facilities({ facilities, filters }: FacilitiesProps) {
    const [search, setSearch] = useState(filters?.search || '');
    const [isLoading, setIsLoading] = useState(false);

    // Handle real-time facility updates
    const handleFacilityUpdate = useCallback((event: ContentUpdateEvent) => {
        console.log('Facility updated:', event);
        // Reload the page data to get fresh facilities
        router.reload({ only: ['facilities'] });
    }, []);

    // Listen for facility updates
    useFacilityUpdates(handleFacilityUpdate);

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

            router.get(
                route('facilities'),
                params,
                {
                    preserveState: true,
                    preserveScroll: true,
                    only: ['facilities'],
                    onFinish: () => setIsLoading(false),
                },
            );
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search]);

    const clearSearch = () => {
        setSearch('');
    };

    return (
        <>
            <Head title="Fasilitas Sekolah" />
            <PublicLayout currentPath="/facilities">
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                    {/* Header Section */}
                    <motion.section
                        ref={headerRef}
                        initial="hidden"
                        animate={headerInView ? 'visible' : 'hidden'}
                        variants={{
                            hidden: { opacity: 0, y: 30 },
                            visible: { opacity: 1, y: 0 },
                        }}
                        transition={{ duration: 0.6 }}
                        className="relative py-20 px-4 overflow-hidden"
                    >
                        {/* Background decoration */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10" />
                        <motion.div
                            className="absolute top-10 left-10 w-20 h-20 bg-blue-400/20 rounded-full blur-xl"
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.6, 0.3],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        />
                        <motion.div
                            className="absolute top-20 right-20 w-16 h-16 bg-indigo-400/20 rounded-full blur-xl"
                            animate={{
                                scale: [1, 1.3, 1],
                                opacity: [0.2, 0.5, 0.2],
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                delay: 1,
                            }}
                        />

                        <div className="relative max-w-6xl mx-auto text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={headerInView ? { scale: 1 } : { scale: 0 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg"
                            >
                                <Building2 className="w-8 h-8 text-white" />
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                                className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white mb-6"
                            >
                                Fasilitas{' '}
                                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Sekolah
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ delay: 0.4, duration: 0.6 }}
                                className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed"
                            >
                                Jelajahi fasilitas modern dan lengkap yang mendukung proses pembelajaran dan
                                pengembangan siswa di sekolah kami.
                            </motion.p>
                        </div>
                    </motion.section>

                    {/* Search Section */}
                    <div className="max-w-6xl mx-auto px-4 mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                            className="relative max-w-md mx-auto"
                        >
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    type="text"
                                    placeholder="Cari fasilitas..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 pr-10 py-3 w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                                {search && (
                                    <Button
                                        onClick={clearSearch}
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                                    >
                                        ×
                                    </Button>
                                )}
                            </div>
                            {isLoading && (
                                <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                    <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
                                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                        <span>Mencari...</span>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Facilities Grid */}
                    <motion.section
                        ref={facilitiesRef}
                        initial="hidden"
                        animate={facilitiesInView ? 'visible' : 'hidden'}
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.1,
                                },
                            },
                        }}
                        className="max-w-6xl mx-auto px-4 pb-20"
                    >
                        {facilities.length === 0 ? (
                            <motion.div
                                variants={cardVariants}
                                className="text-center py-20"
                            >
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                                    <Search className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                                    Tidak ada fasilitas ditemukan
                                </h3>
                                <p className="text-slate-600 dark:text-slate-300">
                                    {search ? `Tidak ada fasilitas yang cocok dengan "${search}"` : 'Belum ada fasilitas yang tersedia.'}
                                </p>
                                {search && (
                                    <Button onClick={clearSearch} variant="outline" className="mt-4">
                                        Hapus Pencarian
                                    </Button>
                                )}
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {facilities.map((facility, index) => (
                                    <motion.div
                                        key={facility.id}
                                        variants={cardVariants}
                                        transition={{
                                            duration: 0.5,
                                            delay: index * 0.1,
                                        }}
                                    >
                                        <Card className="group h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                                            {facility.photo && (
                                                <div className="relative h-48 overflow-hidden">
                                                    <img
                                                        src={facility.photo}
                                                        alt={facility.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        loading="lazy"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                                    <div className="absolute top-3 right-3">
                                                        <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                                            <Sparkles className="w-4 h-4 text-white" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <CardHeader className="p-6">
                                                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {facility.name}
                                                </h3>

                                                {facility.description && (
                                                    <FacilityDescription description={facility.description} />
                                                )}
                                            </CardHeader>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.section>
                </div>
            </PublicLayout>
        </>
    );
}