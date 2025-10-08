interface GlassmorphismCardProps {
    children: React.ReactNode;
    className?: string;
}

export const GlassmorphismCard = ({ children, className = '' }: GlassmorphismCardProps) => (
    <div
        className={`rounded-3xl border border-white/20 bg-white/10 shadow-2xl shadow-blue-500/10 backdrop-blur-lg transition-all duration-500 ease-out hover:border-white/30 hover:bg-white/15 ${className}`}
    >
        {children}
    </div>
);
