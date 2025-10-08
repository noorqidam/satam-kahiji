// Single Responsibility: Facility utility functions
import type { Facility, FacilityFilters } from '@/types/facility';

/**
 * Format facility metadata for display
 */
export function formatFacilityMetadata(facility: Facility): Record<string, string> {
    const metadata = facility.metadata;
    if (!metadata) return {};

    const formatted: Record<string, string> = {};

    if (metadata.dimensions) {
        formatted['Dimensions'] = metadata.dimensions;
    }

    if (metadata.file_size_human) {
        formatted['File Size'] = metadata.file_size_human;
    }

    if (metadata.aspect_ratio) {
        formatted['Aspect Ratio'] = metadata.aspect_ratio.toString();
    }

    if (metadata.original_name) {
        formatted['Original Name'] = metadata.original_name;
    }

    if (metadata.extension) {
        formatted['Format'] = metadata.extension.toUpperCase();
    }

    return formatted;
}

/**
 * Generate breadcrumbs for facility pages
 */
export function generateFacilityBreadcrumbs(type: 'index' | 'create' | 'show' | 'edit', facility?: Facility) {
    const baseBreadcrumbs = [
        { title: 'Admin Dashboard', href: route('admin.dashboard') },
        { title: 'Facility Management', href: route('admin.facilities.index') },
    ];

    switch (type) {
        case 'index':
            return baseBreadcrumbs;
        case 'create':
            return [...baseBreadcrumbs, { title: 'Create Facility', href: route('admin.facilities.create') }];
        case 'show':
            return [...baseBreadcrumbs, { title: facility?.name || 'Facility', href: route('admin.facilities.show', facility?.id) }];
        case 'edit':
            return [
                ...baseBreadcrumbs,
                { title: facility?.name || 'Facility', href: route('admin.facilities.show', facility?.id) },
                { title: 'Edit', href: route('admin.facilities.edit', facility?.id) },
            ];
        default:
            return baseBreadcrumbs;
    }
}

/**
 * Filter facilities based on search criteria
 */
export function filterFacilities(facilities: Facility[], filters: Partial<FacilityFilters>): Facility[] {
    let filtered = [...facilities];

    if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(
            (facility) => facility.name.toLowerCase().includes(searchLower) || facility.description.toLowerCase().includes(searchLower),
        );
    }

    if (filters.has_image === 'yes') {
        filtered = filtered.filter((facility) => !!facility.photo);
    } else if (filters.has_image === 'no') {
        filtered = filtered.filter((facility) => !facility.photo);
    }

    return filtered;
}

/**
 * Sort facilities based on criteria
 */
export function sortFacilities(facilities: Facility[], order: string): Facility[] {
    const sorted = [...facilities];

    switch (order) {
        case 'name_asc':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'name_desc':
            return sorted.sort((a, b) => b.name.localeCompare(a.name));
        case 'created_asc':
            return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        case 'created_desc':
        default:
            return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
}

/**
 * Get image display URL for Google Drive
 */
export function getImageDisplayUrl(url: string | null): string | null {
    if (!url) return null;

    // If it's already a direct link, use as-is
    if (url.includes('lh3.googleusercontent.com')) {
        return url;
    }

    // Convert Google Drive URLs to direct display URLs
    const viewMatch = url.match(/https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9\-_]+)\/view/);
    if (viewMatch) {
        const fileId = viewMatch[1];
        return `https://lh3.googleusercontent.com/d/${fileId}`;
    }

    const thumbnailMatch = url.match(/https:\/\/drive\.google\.com\/thumbnail\?id=([a-zA-Z0-9\-_]+)/);
    if (thumbnailMatch) {
        const fileId = thumbnailMatch[1];
        return `https://lh3.googleusercontent.com/d/${fileId}`;
    }

    return url;
}

/**
 * Validate file for facility image upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];

    if (file.size > maxSize) {
        return { valid: false, error: 'Image must be smaller than 5MB' };
    }

    if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: 'Invalid image format. Allowed: JPEG, PNG, GIF, WebP' };
    }

    return { valid: true };
}
