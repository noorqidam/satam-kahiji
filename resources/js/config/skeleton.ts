/**
 * Skeleton loading configuration
 */
export const skeletonConfig = {
    /**
     * Whether to enable skeleton loading
     * Disabled in production for better performance unless explicitly needed
     */
    enabled: process.env.NODE_ENV === 'development',
    
    /**
     * Default loading duration for skeleton animations
     * Reduced for better perceived performance
     */
    defaultDuration: 800,
    
    /**
     * Minimum loading duration to prevent flickering
     */
    minDuration: 400,
    
    /**
     * Maximum loading duration for timeout scenarios
     */
    maxDuration: 3000,
    
    /**
     * Stagger delay between different sections
     */
    staggerDelay: 50,
    
    /**
     * Animation variants available
     */
    variants: {
        pulse: 'pulse',
        wave: 'wave', 
        shimmer: 'shimmer',
    } as const,
} as const;