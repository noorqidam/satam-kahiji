import type { TFunction } from 'i18next';

/**
 * Mapping of database content (usually English) to translation keys
 * This allows you to translate dynamic content from the database
 */
export const dbContentToTranslationKey: Record<string, string> = {
    // Page titles from database
    'About Us': 'pages.about_us',
    Contact: 'pages.contact',
    'Contact Us': 'pages.contact_us',
    'Our History': 'pages.our_history',
    'Vision Mission': 'pages.vision_mission',
    Facilities: 'pages.facilities',
    'Academic Programs': 'pages.academic_programs',
    'School Rules': 'pages.school_rules',
    Achievements: 'pages.achievements',
    'School Calendar': 'pages.school_calendar',
    Admission: 'pages.admission',
    Alumni: 'pages.alumni',

    // Status values
    Published: 'common.published',
    Draft: 'common.draft',
    Active: 'common.active',
    Inactive: 'common.inactive',

    // Common actions
    'Read More': 'common.read_more',
    'Learn More': 'common.learn_more',
    Download: 'common.download',
    'View All': 'common.view_all',
    Back: 'common.back',
    Next: 'common.next',
    Previous: 'common.previous',
    Search: 'common.search',
    Submit: 'common.submit',
    Cancel: 'common.cancel',
    Save: 'common.save',
    Edit: 'common.edit',
    Delete: 'common.delete',
    Create: 'common.create',
    Update: 'common.update',
};

/**
 * Translate database content using i18next
 * Falls back to original content if no translation key found
 *
 * @param content - Content from database (usually in English)
 * @param t - i18next translation function
 * @returns Translated content or original if no translation found
 */
export function translateDbContent(content: string, t: TFunction): string {
    // Check if we have a translation key for this content
    const translationKey = dbContentToTranslationKey[content];

    if (translationKey) {
        // Use the translation key to get translated text
        const translated = t(translationKey);

        // If translation exists and is different from the key, return it
        if (translated && translated !== translationKey) {
            return translated;
        }
    }

    // Fallback: try some common patterns
    const lowerContent = content.toLowerCase();

    // Handle "about" variations
    if (lowerContent.includes('about')) {
        if (lowerContent === 'about us' || lowerContent === 'about') {
            return t('pages.about_us');
        }
    }

    // Handle "contact" variations
    if (lowerContent.includes('contact')) {
        if (lowerContent === 'contact us') {
            return t('pages.contact_us');
        }
        if (lowerContent === 'contact') {
            return t('pages.contact');
        }
    }

    // Return original content if no translation found
    return content;
}

/**
 * Smart translation for page titles
 * Handles both exact matches and partial matches
 */
export function translatePageTitle(title: string, t: TFunction): string {
    return translateDbContent(title, t);
}

/**
 * Add new translation mapping dynamically
 * Useful for adding translations for new database content
 */
export function addTranslationMapping(dbContent: string, translationKey: string): void {
    dbContentToTranslationKey[dbContent] = translationKey;
}

/**
 * Get all available translation mappings
 * Useful for debugging or administration
 */
export function getTranslationMappings(): Record<string, string> {
    return { ...dbContentToTranslationKey };
}
