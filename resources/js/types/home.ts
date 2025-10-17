export interface User {
    id: number;
    name: string;
}

export interface Post {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    category: 'news' | 'announcements';
    image: string | null;
    is_published: boolean;
    created_at: string;
    updated_at: string;
    user: User;
}

export interface Contact {
    id: number;
    name: string;
    email: string;
    message: string;
    phone: string | null;
    address: string | null;
    created_at: string;
    updated_at: string;
}

export interface GalleryItem {
    id: number;
    gallery_id: number;
    title: string | null;
    caption: string | null;
    mime_type: string | null;
    file_path: string | null;
    metadata: unknown;
    sort_order: number;
    is_featured: boolean;
    created_at: string;
    updated_at: string;
    type: 'image' | 'video' | 'other';
    file_url: string | null;
    thumbnail_url: string | null;
    view_url: string | null;
}

export interface Gallery {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    featured_image: string | null;
    is_published: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
    featured_items: GalleryItem[];
}

export interface Extracurricular {
    id: number;
    name: string;
    description: string | null;
    photo: string | null;
}

export interface HomeProps {
    featuredNews: Post[];
    latestNews: Post[];
    contact?: Contact;
    galleries: Gallery[];
    extracurriculars: Extracurricular[];
}

// Hook return types
export interface UseHomeCarouselReturn {
    currentSlide: number;
    setCurrentSlide: (slide: number) => void;
    nextSlide: () => void;
    prevSlide: () => void;
    isAutoPlaying: boolean;
    startAutoPlay: () => void;
    stopAutoPlay: () => void;
    screenSize: 'mobile' | 'tablet' | 'desktop';
    getExcerptLength: () => number;
}

export type ScrollDirection = 'left' | 'right';

export interface UseScrollControlReturn {
    newsScrollPosition: number;
    galleryScrollPosition: number;
    extracurricularScrollPosition: number;
    scrollNews: (direction: ScrollDirection) => void;
    scrollGallery: (direction: ScrollDirection) => void;
    scrollExtracurricular: (direction: ScrollDirection) => void;
}

export type NewsCategory = 'news' | 'announcements';

export interface UseHomeUtilsReturn {
    formatDate: (dateString: string) => string;
    getCategoryLabel: (category: NewsCategory) => string;
    getCategoryStyle: (category: NewsCategory) => string;
    truncateText: (text: string, maxLength: number) => string;
}
