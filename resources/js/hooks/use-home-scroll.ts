// ============================================================================
// HOME SCROLL CONTROL HOOK (SOLID: Single Responsibility Principle)
// ============================================================================
// Custom hook for managing scroll positions across home page sections

import type { ScrollDirection, UseScrollControlReturn } from '@/types/home';
import { useState } from 'react';

export const useHomeScroll = (
    latestNewsLength: number = 0,
    galleriesLength: number = 0,
    extracurricularsLength: number = 0,
): UseScrollControlReturn => {
    const [newsScrollPosition, setNewsScrollPosition] = useState(0);
    const [galleryScrollPosition, setGalleryScrollPosition] = useState(0);
    const [extracurricularScrollPosition, setExtracurricularScrollPosition] = useState(0);

    const scrollNews = (direction: ScrollDirection): void => {
        const scrollAmount = 320;
        const newPosition =
            direction === 'left'
                ? Math.max(newsScrollPosition - scrollAmount, 0)
                : Math.min(newsScrollPosition + scrollAmount, (latestNewsLength - 3) * scrollAmount);
        setNewsScrollPosition(newPosition);
    };

    const scrollGallery = (direction: ScrollDirection): void => {
        const scrollAmount = 320;
        const maxScroll = Math.max(0, (galleriesLength - 3) * scrollAmount);
        const newPosition =
            direction === 'left' ? Math.max(galleryScrollPosition - scrollAmount, 0) : Math.min(galleryScrollPosition + scrollAmount, maxScroll);
        setGalleryScrollPosition(newPosition);
    };

    const scrollExtracurricular = (direction: ScrollDirection): void => {
        const scrollAmount = 320;
        const maxScroll = Math.max(0, (extracurricularsLength - 3) * scrollAmount);
        const newPosition =
            direction === 'left'
                ? Math.max(extracurricularScrollPosition - scrollAmount, 0)
                : Math.min(extracurricularScrollPosition + scrollAmount, maxScroll);
        setExtracurricularScrollPosition(newPosition);
    };

    return {
        newsScrollPosition,
        galleryScrollPosition,
        extracurricularScrollPosition,
        scrollNews,
        scrollGallery,
        scrollExtracurricular,
    };
};
