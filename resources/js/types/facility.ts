// Single Responsibility Principle: Dedicated types for facility domain
export interface FacilityMetadata {
    file_size?: number;
    file_size_human?: string;
    width?: number;
    height?: number;
    dimensions?: string;
    aspect_ratio?: number;
    original_name?: string;
    extension?: string;
    uploaded_at?: string;
}

export interface Facility {
    id: number;
    name: string;
    description: string;
    photo: string | null;
    metadata?: FacilityMetadata;
    created_at: string;
    updated_at: string;
}

export interface FacilityFormData {
    name: string;
    description: string;
    image: File | null;
    remove_image?: boolean;
}

export interface FacilityFilters {
    search: string;
    has_image: string;
    order: string;
}

export interface FacilityStats {
    total_facilities: number;
    facilities_with_images: number;
    facilities_without_images: number;
    image_percentage: number;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedFacilities {
    data: Facility[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: PaginationLink[];
    prev_page_url: string | null;
    next_page_url: string | null;
}

export interface FacilityIndexProps {
    facilities: PaginatedFacilities;
    filters: FacilityFilters;
    stats: FacilityStats;
}

export interface FacilityFormProps {
    facility?: Facility;
}
