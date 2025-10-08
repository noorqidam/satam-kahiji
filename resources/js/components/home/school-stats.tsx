import { motion, useInView } from 'framer-motion';
import { GraduationCap, Star, Trophy, Users } from 'lucide-react';
import { useRef } from 'react';
import { GlassmorphismCard } from './glassmorphism-card';

export const SchoolStats = () => (
    <section className="relative bg-gradient-to-br from-blue-50/30 via-slate-50 to-emerald-50/30 py-2">
        <div className="absolute inset-0">
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
                <defs>
                    <pattern id="stats-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                        <circle cx="20" cy="20" r="1" fill="rgba(59, 130, 246, 0.08)" />
                        <circle cx="10" cy="30" r="0.5" fill="rgba(16, 185, 129, 0.06)" />
                        <circle cx="30" cy="10" r="0.8" fill="rgba(147, 51, 234, 0.06)" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#stats-pattern)" />
            </svg>
        </div>

        <div className="absolute inset-0 overflow-hidden opacity-60">
            <motion.div
                className="absolute top-20 left-20 h-64 w-64 rounded-full bg-gradient-to-br from-blue-200/40 to-indigo-300/40 blur-3xl"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />
            <motion.div
                className="absolute right-20 bottom-20 h-80 w-80 rounded-full bg-gradient-to-bl from-emerald-200/40 to-teal-300/40 blur-3xl"
                animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.4, 0.7, 0.4],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 2,
                }}
            />
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
                className="mb-8 text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
            >
                <motion.h2
                    className="mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 bg-clip-text pb-1 text-4xl font-bold text-transparent md:text-5xl"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                >
                    Kebanggaan Kami
                </motion.h2>
                <motion.p
                    className="mx-auto mb-8 max-w-2xl text-lg text-gray-600"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    viewport={{ once: true }}
                >
                    Pencapaian dan prestasi yang membanggakan dari SMP Negeri 1 Tambun Selatan
                </motion.p>
                <motion.div
                    className="mx-auto h-1 w-16 rounded-full bg-gradient-to-r from-blue-600 to-emerald-600"
                    initial={{ width: 0 }}
                    whileInView={{ width: 64 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    viewport={{ once: true }}
                />
            </motion.div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { icon: Users, number: '850+', label: 'Siswa Aktif', color: 'from-blue-500 to-blue-600' },
                    { icon: GraduationCap, number: '52+', label: 'Guru & Staff', color: 'from-emerald-500 to-emerald-600' },
                    { icon: Trophy, number: '25+', label: 'Prestasi Tahun Ini', color: 'from-purple-500 to-purple-600' },
                    { icon: Star, number: '100%', label: 'Tingkat Kelulusan', color: 'from-orange-500 to-orange-600' },
                ].map((stat, index) => {
                    const StatRef = useRef(null);
                    const isInView = useInView(StatRef, { once: true });

                    return (
                        <motion.div
                            key={`stat-${index}`}
                            ref={StatRef}
                            className="group"
                            initial={{ opacity: 0, y: 50, scale: 0.8 }}
                            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                            transition={{
                                duration: 0.6,
                                delay: index * 0.15,
                                type: 'spring',
                                bounce: 0.4,
                            }}
                            whileHover={{
                                y: -8,
                                transition: { duration: 0.3, ease: 'easeOut' },
                            }}
                        >
                            <GlassmorphismCard className="h-full transform p-8 text-center transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10">
                                <motion.div
                                    className={`stat-icon mx-auto mb-6 h-24 w-24 rounded-3xl bg-gradient-to-br ${stat.color} p-1 shadow-lg transition-all duration-300`}
                                    whileHover={{
                                        rotateY: 180,
                                        scale: 1.1,
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
                                    }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <div className="flex h-full w-full items-center justify-center rounded-3xl bg-white/95 backdrop-blur-sm">
                                        <motion.div whileHover={{ rotateY: -180 }} transition={{ duration: 0.6 }}>
                                            <stat.icon className="h-12 w-12 text-gray-700" />
                                        </motion.div>
                                    </div>
                                </motion.div>
                                <motion.div
                                    className={`stat-number mb-3 bg-gradient-to-r text-5xl font-extrabold md:text-6xl ${stat.color} bg-clip-text text-transparent`}
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                                    transition={{ duration: 0.8, delay: index * 0.15 + 0.3, type: 'spring', bounce: 0.4 }}
                                >
                                    {stat.number}
                                </motion.div>
                                <motion.div
                                    className="text-lg font-semibold text-gray-700"
                                    initial={{ opacity: 0 }}
                                    animate={isInView ? { opacity: 1 } : {}}
                                    transition={{ duration: 0.8, delay: index * 0.15 + 0.5 }}
                                >
                                    {stat.label}
                                </motion.div>
                            </GlassmorphismCard>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    </section>
);
