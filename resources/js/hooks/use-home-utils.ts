// ============================================================================
// HOME UTILITIES HOOK (SOLID: Single Responsibility Principle)
// ============================================================================
// Custom hook for home page utility functions following DRY principle

import type { NewsCategory, UseHomeUtilsReturn } from '@/types/home';

export const useHomeUtils = (): UseHomeUtilsReturn => {
    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'Asia/Jakarta',
        });
    };

    const getCategoryLabel = (category: NewsCategory): string => {
        return category === 'news' ? 'Berita' : 'Pengumuman';
    };

    const getCategoryStyle = (category: NewsCategory): string => {
        return category === 'news' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-emerald-500 bg-emerald-50 text-emerald-600';
    };

    const truncateText = (text: string, maxLength: number): string => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return {
        formatDate,
        getCategoryLabel,
        getCategoryStyle,
        truncateText,
    };
};
