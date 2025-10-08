import { motion } from 'framer-motion';
import { GlassmorphismCard } from './glassmorphism-card';

export const WelcomeSection = () => (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/50 to-emerald-50/50 py-12">
        <div className="absolute inset-0">
            <div className="absolute top-0 left-0 h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-blue-200/30 to-indigo-300/30 mix-blend-multiply blur-3xl" />
            <div
                className="absolute top-0 right-0 h-96 w-96 animate-pulse rounded-full bg-gradient-to-bl from-emerald-200/30 to-teal-300/30 mix-blend-multiply blur-3xl"
                style={{ animationDelay: '2s' }}
            />
            <div
                className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 animate-pulse rounded-full bg-gradient-to-t from-purple-200/30 to-pink-300/30 mix-blend-multiply blur-3xl"
                style={{ animationDelay: '4s' }}
            />
        </div>

        <div className="absolute inset-0 opacity-5">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                    <pattern id="welcome-grid" width="4" height="4" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="0.5" fill="currentColor" className="text-blue-500" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#welcome-grid)" />
            </svg>
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
            <GlassmorphismCard className="mx-auto max-w-6xl">
                <div className="text-center">
                    <motion.div className="mb-10" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
                        <motion.h1
                            className="welcome-title mb-8 text-3xl leading-tight font-black text-gray-900 sm:text-4xl lg:text-5xl xl:text-6xl"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1.2, delay: 0.3 }}
                        >
                            <motion.span
                                className="welcome-subtitle mb-2 block"
                                initial={{ opacity: 0, x: -100 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.5 }}
                            >
                                Selamat Datang di
                            </motion.span>
                            <motion.span
                                className="welcome-subtitle block bg-gradient-to-r from-blue-700 via-purple-700 to-emerald-700 bg-clip-text font-black text-transparent"
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.7 }}
                            >
                                SMP Negeri 1 Tambun Selatan
                            </motion.span>
                        </motion.h1>

                        <motion.div className="flex justify-center space-x-2">
                            <motion.div
                                className="h-2 w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 32, opacity: 1 }}
                                transition={{ duration: 0.8, delay: 1 }}
                            />
                            <motion.div
                                className="h-2 w-4 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600"
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 16, opacity: 1 }}
                                transition={{ duration: 0.8, delay: 1.2 }}
                            />
                            <motion.div
                                className="h-2 w-8 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 32, opacity: 1 }}
                                transition={{ duration: 0.8, delay: 1.4 }}
                            />
                        </motion.div>
                    </motion.div>

                    <motion.div
                        className="mx-auto max-w-5xl"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 1.2 }}
                    >
                        <p className="welcome-description mb-6 text-lg leading-relaxed font-medium text-gray-800 lg:text-xl xl:text-2xl">
                            <span className="bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                                Membentuk generasi muda yang cerdas, berkarakter, dan siap melanjutkan pendidikan ke jenjang yang lebih tinggi
                            </span>
                        </p>

                        <p className="mb-12 text-base leading-relaxed font-light text-gray-600 lg:text-lg">
                            Melalui pembelajaran berkualitas dan pengembangan bakat siswa dengan pendekatan holistik yang mengutamakan karakter dan
                            prestasi akademik.
                        </p>
                    </motion.div>
                </div>
            </GlassmorphismCard>

            <motion.div
                className="absolute -top-4 -right-4 h-12 w-12 rounded-full bg-gradient-to-r from-blue-400/20 to-emerald-400/20 blur-sm"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />
        </div>
    </section>
);
