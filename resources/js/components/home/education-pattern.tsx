export const EducationPattern = () => (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
        <defs>
            <pattern id="education-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <circle cx="40" cy="40" r="1.5" fill="rgba(59, 130, 246, 0.1)" />
                <path d="M20 30 L40 20 L60 30 L40 35 Z" fill="rgba(16, 185, 129, 0.08)" />
                <circle cx="20" cy="50" r="0.8" fill="rgba(147, 51, 234, 0.08)" />
                <circle cx="60" cy="50" r="0.8" fill="rgba(236, 72, 153, 0.08)" />
            </pattern>
            <linearGradient id="hero-overlay" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.8)" />
                <stop offset="50%" stopColor="rgba(99, 102, 241, 0.6)" />
                <stop offset="100%" stopColor="rgba(16, 185, 129, 0.7)" />
            </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#education-pattern)" />
        <rect width="100%" height="100%" fill="url(#hero-overlay)" />
    </svg>
);
