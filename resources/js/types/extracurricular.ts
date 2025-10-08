// Extracurricular types following Interface Segregation Principle

// Base interfaces following Single Responsibility Principle
export interface BaseExtracurricular {
    id: number;
    name: string;
    description?: string;
    created_at: string;
}

export interface ExtracurricularPhoto {
    photo?: string;
    photo_url?: string;
}

export interface ExtracurricularStats {
    students_count: number;
}

// Composed interfaces using Interface Segregation
export interface ExtracurricularWithPhoto extends BaseExtracurricular, ExtracurricularPhoto {}

export interface ExtracurricularWithStats extends ExtracurricularWithPhoto, ExtracurricularStats {}

// Form data interfaces
export interface ExtracurricularFormData {
    name: string;
    description: string;
    photo?: File | null;
    remove_photo?: boolean;
}

export interface ExtracurricularFormErrors {
    name?: string;
    description?: string;
    photo?: string;
}

// Filter and search interfaces
export interface ExtracurricularFilters {
    search: string;
}

export interface ExtracurricularSearchParams extends ExtracurricularFilters {
    page?: number;
    per_page?: number;
}

// Table and UI interfaces
export interface ExtracurricularTableItem extends ExtracurricularWithStats {
    isSelected?: boolean;
}

export interface ExtracurricularBulkActions {
    selectedIds: number[];
    isAllSelected: boolean;
}

// Action types for better type safety
export type ExtracurricularAction = 'view' | 'edit' | 'delete' | 'assign_students';

export interface ExtracurricularActionHandler {
    onView?: (extracurricular: ExtracurricularWithStats) => void;
    onEdit?: (extracurricular: ExtracurricularWithStats) => void;
    onDelete?: (extracurricular: ExtracurricularWithStats) => void;
    onAssignStudents?: (extracurricular: ExtracurricularWithStats) => void;
}

// API response interfaces
export interface ExtracurricularApiResponse {
    data: ExtracurricularWithStats[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

// Dialog and modal state interfaces
export interface ExtracurricularDialogState {
    view: ExtracurricularWithStats | null;
    delete: ExtracurricularWithStats | null;
    bulkDelete: boolean;
}

// Constants and enums
export const EXTRACURRICULAR_CATEGORIES = {
    SPORTS: 'Sports',
    ARTS_CULTURE: 'Arts & Culture',
    ACADEMIC_SCIENCE: 'Academic & Science',
    COMMUNITY_SERVICE: 'Community & Service',
    RELIGION_CHARACTER: 'Religion & Character',
    OTHERS: 'Others',
} as const;

export type ExtracurricularCategory = (typeof EXTRACURRICULAR_CATEGORIES)[keyof typeof EXTRACURRICULAR_CATEGORIES];

// Predefined activities organized by category
export const PREDEFINED_ACTIVITIES: Record<ExtracurricularCategory, string[]> = {
    [EXTRACURRICULAR_CATEGORIES.SPORTS]: [
        'Basketball',
        'Football (Soccer)',
        'Volleyball',
        'Badminton',
        'Tennis',
        'Table Tennis',
        'Swimming',
        'Athletics',
        'Martial Arts',
        'Chess',
    ],
    [EXTRACURRICULAR_CATEGORIES.ARTS_CULTURE]: [
        'Music Band',
        'Choir',
        'Traditional Dance',
        'Modern Dance',
        'Drama Club',
        'Art Club',
        'Photography',
        'Creative Writing',
        'Poetry',
        'Literature Club',
    ],
    [EXTRACURRICULAR_CATEGORIES.ACADEMIC_SCIENCE]: [
        'Science Club',
        'Mathematics Club',
        'English Club',
        'Debate Team',
        'Quiz Bowl',
        'Computer Club',
        'Programming Club',
        'Robotics',
        'Environmental Club',
        'Research Club',
    ],
    [EXTRACURRICULAR_CATEGORIES.COMMUNITY_SERVICE]: [
        'Student Council',
        'Community Service',
        'Red Cross Youth',
        'Scout Movement (Pramuka)',
        'Volunteering Club',
        'Peer Tutoring',
        'School Newspaper',
        'Broadcasting Club',
    ],
    [EXTRACURRICULAR_CATEGORIES.RELIGION_CHARACTER]: ['Islamic Study Group (ROHIS)', 'Christian Fellowship', 'Character Building', 'Ethics Club'],
    [EXTRACURRICULAR_CATEGORIES.OTHERS]: ['Entrepreneurship Club', 'Cooking Club', 'Gardening Club', 'Book Club', 'Language Club'],
};

// Get all activities as a flat array
export const ALL_PREDEFINED_ACTIVITIES = Object.values(PREDEFINED_ACTIVITIES).flat();
