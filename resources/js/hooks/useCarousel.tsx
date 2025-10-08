import { useEffect, useState } from 'react';

interface UseCarouselProps {
    itemsLength: number;
    autoRotateInterval?: number;
    enableAutoRotate?: boolean;
}

export function useCarousel({ itemsLength, autoRotateInterval = 5000, enableAutoRotate = true }: UseCarouselProps) {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        if (!enableAutoRotate || itemsLength <= 1) return;

        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % itemsLength);
        }, autoRotateInterval);

        return () => clearInterval(timer);
    }, [itemsLength, autoRotateInterval, enableAutoRotate]);

    const nextSlide = () => {
        if (itemsLength === 0) return;
        setCurrentSlide((prev) => (prev + 1) % itemsLength);
    };

    const prevSlide = () => {
        if (itemsLength === 0) return;
        setCurrentSlide((prev) => (prev - 1 + itemsLength) % itemsLength);
    };

    const goToSlide = (index: number) => {
        if (index >= 0 && index < itemsLength) {
            setCurrentSlide(index);
        }
    };

    return {
        currentSlide,
        nextSlide,
        prevSlide,
        goToSlide,
        setCurrentSlide,
    };
}
