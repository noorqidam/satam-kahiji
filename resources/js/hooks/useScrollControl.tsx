import { useState } from 'react';

export function useScrollControl(params: { itemWidth: number; visibleItems: number; totalItems: number }): {
    scrollPosition: number;
    scrollLeft: () => void;
    scrollRight: () => void;
    canScrollLeft: boolean;
    canScrollRight: boolean;
    setScrollPosition: (position: number) => void;
} {
    const { itemWidth, visibleItems, totalItems } = params;
    const [scrollPosition, setScrollPosition] = useState(0);

    const maxScroll = Math.max(0, (totalItems - visibleItems) * itemWidth);

    const scrollLeft = () => {
        setScrollPosition((prev) => Math.max(prev - itemWidth, 0));
    };

    const scrollRight = () => {
        setScrollPosition((prev) => Math.min(prev + itemWidth, maxScroll));
    };

    const canScrollLeft = scrollPosition > 0;
    const canScrollRight = scrollPosition < maxScroll;

    return {
        scrollPosition,
        scrollLeft,
        scrollRight,
        canScrollLeft,
        canScrollRight,
        setScrollPosition,
    };
}
