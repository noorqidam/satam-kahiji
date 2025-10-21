import { useState, useRef, useEffect, memo } from 'react';
import { clsx } from 'clsx';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    className?: string;
    placeholder?: string;
    errorFallback?: string;
    threshold?: number;
    priority?: boolean; // For above-the-fold images
    sizes?: string; // For responsive images
    quality?: number; // For future optimization
}

export const LazyImage = memo(function LazyImage({
    src,
    alt,
    className,
    placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3C/svg%3E",
    errorFallback = placeholder,
    threshold = 0.1,
    priority = false,
    sizes,
    ...props
}: LazyImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [isInView, setIsInView] = useState(priority); // Load immediately if priority
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (priority) return; // Skip intersection observer for priority images

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            { 
                threshold,
                rootMargin: '50px' // Start loading 50px before entering viewport
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, [threshold, priority]);

    const handleLoad = () => {
        setIsLoaded(true);
    };

    const handleError = () => {
        setHasError(true);
    };

    return (
        <img
            ref={imgRef}
            src={isInView ? (hasError ? errorFallback : src) : placeholder}
            alt={alt}
            className={clsx(
                'transition-opacity duration-300',
                isLoaded ? 'opacity-100' : 'opacity-70',
                className
            )}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : 'low'}
            sizes={sizes}
            {...props}
        />
    );
});