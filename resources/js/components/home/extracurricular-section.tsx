import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Extracurricular } from '@/types/home';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { useState } from 'react';
import { truncateText } from './home-utils';

interface ExtracurricularSectionProps {
    extracurriculars: Extracurricular[];
}

export const ExtracurricularSection = ({ extracurriculars }: ExtracurricularSectionProps) => {
    const [extracurricularScrollPosition, setExtracurricularScrollPosition] = useState(0);

    const scrollExtracurricular = (direction: 'left' | 'right') => {
        const scrollAmount = 320;
        const maxScroll = Math.max(0, (extracurriculars.length - 3) * scrollAmount);

        const newPosition =
            direction === 'left'
                ? Math.max(extracurricularScrollPosition - scrollAmount, 0)
                : Math.min(extracurricularScrollPosition + scrollAmount, maxScroll);

        setExtracurricularScrollPosition(newPosition);
    };

    const calculateDragConstraints = () => {
        return { right: 0, left: 0 };
    };

    if (extracurriculars.length === 0) return null;

    return (
        <section id="extracurricular" className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 py-5">
            <div className="absolute top-20 left-20 h-64 w-64 animate-pulse rounded-full bg-purple-200 opacity-20 mix-blend-multiply blur-3xl filter" />
            <div
                className="absolute right-20 bottom-20 h-80 w-80 animate-pulse rounded-full bg-indigo-200 opacity-20 mix-blend-multiply blur-3xl filter"
                style={{ animationDelay: '4s' }}
            />

            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="mb-12 text-center"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <motion.h2
                        className="mb-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text pb-2 text-4xl font-bold text-transparent md:text-5xl"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        Ekstrakurikuler
                    </motion.h2>
                    <motion.p
                        className="mx-auto max-w-4xl text-xl leading-relaxed font-light text-gray-700"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        viewport={{ once: true }}
                    >
                        Beragam kegiatan ekstrakurikuler yang menunjang pengembangan bakat, minat, dan karakter siswa di berbagai bidang.
                    </motion.p>
                    <motion.div
                        className="mx-auto mt-6 h-1 w-24 rounded-full bg-gradient-to-r from-purple-600 to-blue-600"
                        initial={{ width: 0 }}
                        whileInView={{ width: 96 }}
                        transition={{ duration: 1, delay: 0.6 }}
                        viewport={{ once: true }}
                    />
                </motion.div>

                <div className="relative">
                    {extracurriculars.length > 1 && (
                        <>
                            <motion.button
                                onClick={() => scrollExtracurricular('left')}
                                disabled={extracurricularScrollPosition === 0}
                                className="absolute top-1/2 left-0 z-20 hidden -translate-y-1/2 rounded-full border border-purple-300/50 bg-white/95 p-4 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-purple-400 hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 lg:block"
                                style={{ marginLeft: '-24px' }}
                            >
                                <ChevronLeft className="h-6 w-6 text-purple-700 transition-all duration-200" />
                            </motion.button>

                            <motion.button
                                onClick={() => scrollExtracurricular('right')}
                                disabled={extracurricularScrollPosition >= Math.max(0, (extracurriculars.length - 3) * 320)}
                                className="absolute top-1/2 right-0 z-20 hidden -translate-y-1/2 rounded-full border border-purple-300/50 bg-white/95 p-4 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-purple-400 hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 lg:block"
                                style={{ marginRight: '-24px' }}
                            >
                                <ChevronRight className="h-6 w-6 text-purple-700 transition-all duration-200" />
                            </motion.button>
                        </>
                    )}

                    <div className="mx-4 hidden overflow-hidden pt-4 lg:block">
                        <motion.div
                            className="flex cursor-grab gap-6 active:cursor-grabbing"
                            drag="x"
                            dragConstraints={calculateDragConstraints()}
                            dragElastic={0.1}
                            whileTap={{ cursor: 'grabbing' }}
                            dragMomentum={false}
                            animate={{ x: -extracurricularScrollPosition }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            onDragEnd={(_, info) => {
                                const cardWidth = 320;
                                const threshold = cardWidth * 0.25;
                                let newPosition = extracurricularScrollPosition;
                                const maxScroll = Math.max(0, (extracurriculars.length - 3) * cardWidth);

                                if (info.offset.x < -threshold && extracurricularScrollPosition < maxScroll) {
                                    newPosition = Math.min(extracurricularScrollPosition + cardWidth, maxScroll);
                                } else if (info.offset.x > threshold && extracurricularScrollPosition > 0) {
                                    newPosition = Math.max(extracurricularScrollPosition - cardWidth, 0);
                                }

                                setExtracurricularScrollPosition(newPosition);
                            }}
                        >
                            {extracurriculars.map((extracurricular, index) => (
                                <motion.div
                                    key={extracurricular.id}
                                    className="w-80 flex-shrink-0"
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.6,
                                        delay: index * 0.15,
                                        type: 'spring',
                                        bounce: 0.4,
                                    }}
                                    viewport={{ once: true }}
                                    whileHover={{
                                        y: -12,
                                        scale: 1.02,
                                        rotateX: 5,
                                        transition: { duration: 0.3, ease: 'easeOut' },
                                    }}
                                >
                                    <motion.div
                                        whileHover={{
                                            boxShadow: '0 20px 40px -12px rgba(59, 130, 246, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.1)',
                                            scale: 1.015,
                                        }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Card className="extra-card group overflow-hidden rounded-lg border-0 bg-white/80 py-0 shadow-xl backdrop-blur-sm transition-all duration-500 hover:shadow-2xl">
                                            {extracurricular.photo ? (
                                                <div className="relative h-48 overflow-hidden rounded-t-lg bg-gray-100 sm:h-56">
                                                    <img
                                                        src={extracurricular.photo}
                                                        alt={extracurricular.name}
                                                        className="absolute inset-0 h-full w-full rounded-t-lg object-cover transition-all duration-500 group-hover:scale-[1.08]"
                                                        loading="lazy"
                                                        decoding="async"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                                </div>
                                            ) : (
                                                <div className="flex h-48 items-center justify-center rounded-t-lg bg-gradient-to-br from-purple-100 to-indigo-100 transition-all duration-500 group-hover:from-purple-200 group-hover:to-indigo-200 sm:h-56">
                                                    <Trophy className="h-16 w-16 text-purple-600 transition-all duration-300 group-hover:scale-110 group-hover:text-purple-700" />
                                                </div>
                                            )}
                                            <CardHeader className="relative pt-4 pb-3">
                                                <div className="absolute -top-3 right-3 h-6 w-6 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                                    <div className="h-full w-full rounded-full border-2 border-white" />
                                                </div>
                                                <CardTitle className="text-lg font-semibold text-gray-900 transition-colors duration-300 group-hover:text-purple-600">
                                                    {extracurricular.name}
                                                </CardTitle>
                                                {extracurricular.description && (
                                                    <CardDescription className="text-sm text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
                                                        {truncateText(extracurricular.description, 80)}
                                                    </CardDescription>
                                                )}
                                            </CardHeader>
                                            <CardContent className="pt-0 pb-4">
                                                <div className="flex items-center justify-end text-xs text-gray-500">
                                                    <ChevronRight className="h-4 w-4 text-purple-500 opacity-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    <div className="hidden grid-cols-2 gap-4 sm:grid sm:gap-6 lg:hidden">
                        {extracurriculars.map((extracurricular) => (
                            <Card
                                key={`tablet-${extracurricular.id}`}
                                className="extra-card group overflow-hidden rounded-lg border-0 bg-white/80 py-0 shadow-xl backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                            >
                                {extracurricular.photo ? (
                                    <div className="relative h-48 overflow-hidden rounded-t-lg bg-gray-100 sm:h-56">
                                        <img
                                            src={extracurricular.photo}
                                            alt={extracurricular.name}
                                            className="absolute inset-0 h-full w-full rounded-t-lg object-cover transition-all duration-500 group-hover:scale-[1.08]"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                    </div>
                                ) : (
                                    <div className="flex h-48 items-center justify-center rounded-t-lg bg-gradient-to-br from-purple-100 to-indigo-100 transition-all duration-500 group-hover:from-purple-200 group-hover:to-indigo-200 sm:h-56">
                                        <Trophy className="h-16 w-16 text-purple-600 transition-all duration-300 group-hover:scale-110 group-hover:text-purple-700" />
                                    </div>
                                )}
                                <CardHeader className="relative pt-4 pb-3">
                                    <CardTitle className="text-lg font-semibold text-gray-900 transition-colors duration-300 group-hover:text-purple-600">
                                        {extracurricular.name}
                                    </CardTitle>
                                    {extracurricular.description && (
                                        <CardDescription className="text-sm text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
                                            {truncateText(extracurricular.description, 100)}
                                        </CardDescription>
                                    )}
                                </CardHeader>
                            </Card>
                        ))}
                    </div>

                    <div className="px-4 sm:hidden">
                        <motion.div
                            className="flex cursor-grab gap-4 active:cursor-grabbing"
                            drag="x"
                            dragConstraints={calculateDragConstraints()}
                            dragElastic={0.15}
                            whileTap={{ cursor: 'grabbing' }}
                            dragMomentum={false}
                            animate={{ x: -extracurricularScrollPosition }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            onDragEnd={(_, info) => {
                                const cardWidth = 288;
                                const threshold = cardWidth * 0.2;
                                let newPosition = extracurricularScrollPosition;
                                const maxScroll = Math.max(0, (extracurriculars.length - 1) * cardWidth);

                                if (info.offset.x < -threshold && extracurricularScrollPosition < maxScroll) {
                                    newPosition = Math.min(extracurricularScrollPosition + cardWidth, maxScroll);
                                } else if (info.offset.x > threshold && extracurricularScrollPosition > 0) {
                                    newPosition = Math.max(extracurricularScrollPosition - cardWidth, 0);
                                }

                                setExtracurricularScrollPosition(newPosition);
                            }}
                        >
                            {extracurriculars.map((extracurricular, index) => (
                                <motion.div
                                    key={`mobile-${extracurricular.id}`}
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
                                    <Card className="extra-card group overflow-hidden rounded-lg border-0 bg-white/80 py-0 shadow-xl backdrop-blur-sm transition-all duration-500 hover:shadow-2xl">
                                        {extracurricular.photo ? (
                                            <div className="relative h-48 overflow-hidden rounded-t-lg bg-gray-100 sm:h-56">
                                                <img
                                                    src={extracurricular.photo}
                                                    alt={extracurricular.name}
                                                    className="absolute inset-0 h-full w-full rounded-t-lg object-cover transition-all duration-500 group-hover:scale-[1.08]"
                                                    loading="lazy"
                                                    decoding="async"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex h-48 items-center justify-center rounded-t-lg bg-gradient-to-br from-purple-100 to-indigo-100 transition-all duration-500 group-hover:from-purple-200 group-hover:to-indigo-200 sm:h-56">
                                                <Trophy className="h-16 w-16 text-purple-600 transition-all duration-300 group-hover:scale-110 group-hover:text-purple-700" />
                                            </div>
                                        )}
                                        <CardHeader className="relative pt-4 pb-3">
                                            <CardTitle className="text-lg font-semibold text-gray-900 transition-colors duration-300 group-hover:text-purple-600">
                                                {extracurricular.name}
                                            </CardTitle>
                                            {extracurricular.description && (
                                                <CardDescription className="text-sm text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
                                                    {truncateText(extracurricular.description, 80)}
                                                </CardDescription>
                                            )}
                                        </CardHeader>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>

                        <div className="mt-6 flex justify-center gap-2">
                            {extracurriculars.length > 1 &&
                                Array.from({ length: Math.min(extracurriculars.length, 5) }).map((_, index) => {
                                    const currentIndex = Math.floor(extracurricularScrollPosition / 288);
                                    const isActive = currentIndex === index;
                                    return (
                                        <motion.button
                                            key={index}
                                            onClick={() => setExtracurricularScrollPosition(index * 288)}
                                            className={`rounded-full transition-all duration-300 ${
                                                isActive ? 'h-3 w-8 bg-purple-500 shadow-md' : 'h-2 w-2 bg-purple-300 hover:bg-purple-400'
                                            }`}
                                            whileHover={{ scale: 1.2 }}
                                            whileTap={{ scale: 0.9 }}
                                        />
                                    );
                                })}
                        </div>

                        <div className="mt-3 flex items-center justify-center gap-2">
                            <motion.div animate={{ x: [-3, 3, -3] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                                <ChevronLeft className="h-4 w-4 text-purple-500" />
                            </motion.div>
                            <p className="text-center text-sm font-medium text-purple-600">Geser untuk navigasi</p>
                            <motion.div animate={{ x: [3, -3, 3] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                                <ChevronRight className="h-4 w-4 text-purple-500" />
                            </motion.div>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <Link href="/extracurricular">
                            <Button
                                size="lg"
                                className="group bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-3 text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-purple-500/25"
                            >
                                <span className="flex items-center gap-2">
                                    Lihat Semua Ekstrakurikuler
                                    <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                </span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};
