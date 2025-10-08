import { motion } from 'framer-motion';

export const FloatingElements = () => (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
            className="absolute top-20 left-2 sm:left-10"
            animate={{
                y: [0, -20, 0],
                rotate: [0, 360],
                scale: [1, 1.1, 1],
            }}
            transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
            }}
        >
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-200 to-indigo-300 opacity-20 blur-sm" />
        </motion.div>

        <motion.div
            className="absolute top-40 right-2 sm:right-20"
            animate={{
                y: [0, 15, 0],
                rotate: [0, -180],
                scale: [1, 0.9, 1],
            }}
            transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
            }}
        >
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-200 to-teal-300 opacity-20 blur-sm" />
        </motion.div>

        <motion.div
            className="absolute bottom-40 left-20"
            animate={{
                y: [0, -10, 0],
                rotate: [0, 180],
                scale: [1, 1.2, 1],
            }}
            transition={{
                duration: 7,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 2,
            }}
        >
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-200 to-pink-300 opacity-20 blur-sm" />
        </motion.div>

        <motion.svg
            className="absolute top-32 right-32"
            width="60"
            height="60"
            viewBox="0 0 24 24"
            fill="none"
            animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1],
            }}
            transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
            }}
        >
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="rgba(59, 130, 246, 0.15)" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="0.5" />
            <path d="M2 17L12 22L22 17" fill="none" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="0.5" />
            <path d="M2 12L12 17L22 12" fill="none" stroke="rgba(99, 102, 241, 0.3)" strokeWidth="0.5" />
        </motion.svg>

        <motion.svg
            className="absolute right-2 bottom-32 sm:right-40"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            animate={{
                rotate: [0, -10, 10, 0],
                y: [0, -8, 0],
            }}
            transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1.5,
            }}
        >
            <path d="M9 12L11 14L15 10" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="1.5" fill="none" />
            <circle cx="12" cy="12" r="10" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1" fill="rgba(16, 185, 129, 0.05)" />
        </motion.svg>
    </div>
);
