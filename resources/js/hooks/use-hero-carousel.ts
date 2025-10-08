// ============================================================================
// HERO CAROUSEL HOOK (SOLID: Single Responsibility Principle)
// ============================================================================
// Custom hook for managing hero section carousel state and behavior

import type { UseHomeCarouselReturn } from '@/types/home';
import { useEffect, useState } from 'react';

export const useHeroCarousel = (itemsLength: number): UseHomeCarouselReturn => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

    // Screen size detection for responsive text
    useEffect(() => {
        const updateScreenSize = () => {
            if (typeof window !== 'undefined') {
                const width = window.innerWidth;
                if (width < 640) {
                    setScreenSize('mobile');
                } else if (width < 1024) {
                    setScreenSize('tablet');
                } else {
                    setScreenSize('desktop');
                }
            }
        };

        updateScreenSize();
        window.addEventListener('resize', updateScreenSize);
        return () => window.removeEventListener('resize', updateScreenSize);
    }, []);

    // Auto-rotate carousel every 5 seconds
    useEffect(() => {
        if (itemsLength > 1 && isAutoPlaying) {
            const timer = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % itemsLength);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [itemsLength, isAutoPlaying]);

    const nextSlide = (): void => {
        if (!itemsLength || itemsLength === 0) return;
        const newSlide = (currentSlide + 1) % itemsLength;
        setCurrentSlide(newSlide);
    };

    const prevSlide = (): void => {
        if (!itemsLength || itemsLength === 0) return;
        const newSlide = (currentSlide - 1 + itemsLength) % itemsLength;
        setCurrentSlide(newSlide);
    };

    const startAutoPlay = (): void => {
        setIsAutoPlaying(true);
    };

    const stopAutoPlay = (): void => {
        setIsAutoPlaying(false);
    };

    const getExcerptLength = (): number => {
        switch (screenSize) {
            case 'mobile':
                return 80;
            case 'tablet':
                return 120;
            default:
                return 150;
        }
    };

    return {
        currentSlide,
        setCurrentSlide,
        nextSlide,
        prevSlide,
        isAutoPlaying,
        startAutoPlay,
        stopAutoPlay,
        screenSize,
        getExcerptLength,
    };
};
