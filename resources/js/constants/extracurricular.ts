// Constants following Open/Closed Principle - easy to extend without modifying existing code

export const EXTRACURRICULAR_CATEGORIES = {
    SPORTS: 'Sports',
    ARTS_CULTURE: 'Arts & Culture',
    ACADEMIC_SCIENCE: 'Academic & Science',
    COMMUNITY_SERVICE: 'Community & Service',
    RELIGION_CHARACTER: 'Religion & Character',
    OTHER: 'Other',
} as const;

export type ExtracurricularCategory = (typeof EXTRACURRICULAR_CATEGORIES)[keyof typeof EXTRACURRICULAR_CATEGORIES];

export const EXTRACURRICULAR_OPTIONS: Record<ExtracurricularCategory, string[]> = {
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
    [EXTRACURRICULAR_CATEGORIES.OTHER]: ['Entrepreneurship Club', 'Cooking Club', 'Gardening Club', 'Book Club', 'Language Club'],
};

// Flatten all options for backward compatibility
export const FLAT_EXTRACURRICULAR_OPTIONS = Object.values(EXTRACURRICULAR_OPTIONS).flat();

// UI Constants
export const EXTRACURRICULAR_UI_CONFIG = {
    ITEMS_PER_PAGE: 10,
    DEBOUNCE_DELAY: 300,
    MAX_DESCRIPTION_LENGTH: 500,
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    MAX_IMAGE_SIZE: 2 * 1024 * 1024, // 2MB
} as const;

// Route constants
export const EXTRACURRICULAR_ROUTES = {
    INDEX: 'admin.extracurriculars.index',
    CREATE: 'admin.extracurriculars.create',
    EDIT: 'admin.extracurriculars.edit',
    SHOW: 'admin.extracurriculars.show',
    STORE: 'admin.extracurriculars.store',
    UPDATE: 'admin.extracurriculars.update-post',
    DESTROY: 'admin.extracurriculars.destroy',
    BULK_DESTROY: 'admin.extracurriculars.bulk-destroy',
} as const;
