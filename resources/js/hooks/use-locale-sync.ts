import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { type SharedData } from '@/types';

/**
 * Hook to ensure i18n stays synchronized with server locale
 * This should be called in the main app layout or app component
 */
export function useLocaleSync() {
    const { locale } = usePage<SharedData>().props;
    const { i18n } = useTranslation();

    // Debug logging on every render
    useEffect(() => {
        console.log('🔍 Locale Sync Debug:', {
            serverLocale: locale,
            i18nLanguage: i18n.language,
            localStorage: typeof window !== 'undefined' ? localStorage.getItem('i18nextLng') : 'N/A',
            needsSync: locale && i18n.language !== locale
        });
    });

    useEffect(() => {
        // Sync i18n language with server locale if they differ
        if (locale && i18n.language !== locale) {
            console.log('🌐 Syncing language:', i18n.language, '→', locale);
            i18n.changeLanguage(locale);
        } else if (locale) {
            console.log('✅ Language already in sync:', locale);
        } else {
            console.warn('⚠️ No server locale received from Inertia props');
        }
    }, [locale, i18n]);

    // Also sync localStorage to match server locale
    useEffect(() => {
        if (locale && typeof window !== 'undefined') {
            const storedLanguage = localStorage.getItem('i18nextLng');
            if (storedLanguage !== locale) {
                console.log('💾 Syncing localStorage:', storedLanguage, '→', locale);
                localStorage.setItem('i18nextLng', locale);
            }
        }
    }, [locale]);

    return { serverLocale: locale, currentLanguage: i18n.language };
}