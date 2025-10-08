// Home carousel hook
// Single Responsibility: Manage carousel state and behavior

import { useCallback, useEffect, useState } from 'react';

interface UseHomeCarouselProps {
    itemsLength: number;
    autoRotateInterval?: number;
}

export function useHomeCarousel({ itemsLength, autoRotateInterval = 5000 }: UseHomeCarouselProps) {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Auto-rotate carousel
    useEffect(() => {
        if (itemsLength > 1) {
            const timer = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % itemsLength);
            }, autoRotateInterval);
            return () => clearInterval(timer);
        }
    }, [itemsLength, autoRotateInterval]);

    const nextSlide = useCallback(() => {
        if (!itemsLength) return;
        setCurrentSlide((prev) => (prev + 1) % itemsLength);
    }, [itemsLength]);

    const prevSlide = useCallback(() => {
        if (!itemsLength) return;
        setCurrentSlide((prev) => (prev - 1 + itemsLength) % itemsLength);
    }, [itemsLength]);

    const goToSlide = useCallback(
        (slideIndex: number) => {
            if (slideIndex >= 0 && slideIndex < itemsLength) {
                setCurrentSlide(slideIndex);
            }
        },
        [itemsLength],
    );

    return {
        currentSlide,
        nextSlide,
        prevSlide,
        goToSlide,
        setCurrentSlide,
    };
}
