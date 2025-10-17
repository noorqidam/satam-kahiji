import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook to ensure i18n stays synchronized with server locale
 * This should be called in the main app layout or app component
 */
export function useLocaleSync() {
    const { locale } = usePage<SharedData>().props;
    const { i18n } = useTranslation();
    const syncedRef = useRef<string | null>(null);

    useEffect(() => {
        // Only proceed if i18n is initialized and has the changeLanguage method
        if (!i18n || !i18n.isInitialized || typeof i18n.changeLanguage !== 'function') {
            return;
        }

        // Only sync if locale is different and we haven't synced this locale already
        if (locale && i18n.language !== locale && syncedRef.current !== locale) {
            syncedRef.current = locale;
            i18n.changeLanguage(locale);
            
            // Also sync localStorage to match server locale
            if (typeof window !== 'undefined') {
                localStorage.setItem('i18nextLng', locale);
            }
        }
    }, [locale, i18n]);

    return { serverLocale: locale, currentLanguage: i18n?.language || 'id' };
}
