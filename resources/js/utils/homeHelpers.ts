// Home page utility functions
// Single Responsibility: Provide helper functions for home page

import { truncate } from '@/utils/common';
type CategoryType = 'news' | 'announcements';

/**
 * Format date for Indonesian locale
 */
export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Jakarta',
    });
}

/**
 * Get category label in Indonesian
 */
export function getCategoryLabel(category: CategoryType): string {
    const labels: Record<CategoryType, string> = {
        news: 'Berita',
        announcements: 'Pengumuman',
    };
    return labels[category];
}

/**
 * Get category styling classes
 */
export function getCategoryStyle(category: CategoryType): string {
    const styles: Record<CategoryType, string> = {
        news: 'border-blue-500 bg-blue-50 text-blue-600',
        announcements: 'border-emerald-500 bg-emerald-50 text-emerald-600',
    };
    return styles[category];
}

/**
 * Truncate text for display
 */
export function truncateText(text: string, maxLength: number): string {
    return truncate(text, maxLength);
}

/**
 * Scroll to top of page smoothly
 */
export function scrollToTop(): void {
    window.scrollTo({
        top: 0,
        behavior: 'smooth',
    });
}

/**
 * Calculate drag constraints for carousel
 */
export function calculateDragConstraints(itemsLength: number): { left: number; right: number } {
    if (typeof window === 'undefined') {
        return { left: 0, right: 0 };
    }

    return {
        left: -((itemsLength - 1) * window.innerWidth),
        right: 0,
    };
}

/**
 * Handle carousel drag end logic
 */
export function handleCarouselDragEnd(
    info: { offset: { x: number } },
    currentSlide: number,
    itemsLength: number,
    onSlideChange: (slide: number) => void,
): void {
    // Only handle on mobile
    if (typeof window === 'undefined' || window.innerWidth >= 640) return;

    const threshold = Math.min(60, window.innerWidth * 0.15);
    let newSlide = currentSlide;

    if (info.offset.x < -threshold && currentSlide < itemsLength - 1) {
        newSlide = currentSlide + 1;
    } else if (info.offset.x > threshold && currentSlide > 0) {
        newSlide = currentSlide - 1;
    }

    // Ensure newSlide is within bounds
    newSlide = Math.max(0, Math.min(newSlide, itemsLength - 1));
    onSlideChange(newSlide);
}

/**
 * Disable/enable content links during drag
 */
export function toggleContentLinks(disabled: boolean): void {
    try {
        const contentLinks = document.querySelectorAll('.hero-slide a');
        contentLinks.forEach((link) => {
            if (link instanceof HTMLElement) {
                link.style.pointerEvents = disabled ? 'none' : 'auto';
            }
        });
    } catch (error) {
        console.warn('Toggle content links error:', error);
    }
}
