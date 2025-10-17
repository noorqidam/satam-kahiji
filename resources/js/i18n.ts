import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enCommon from './locales/en/common.json';
import idCommon from './locales/id/common.json';

const resources = {
    en: {
        common: enCommon,
    },
    id: {
        common: idCommon,
    },
};

i18n
    // Pass the i18n instance to react-i18next
    .use(initReactI18next)
    // Initialize i18next
    .init({
        resources,

        // Set initial language from localStorage or fallback
        lng: 'id', // Force Indonesian for now

        // Default language
        fallbackLng: 'id', // Default to Indonesian

        // Default namespace
        defaultNS: 'common',

        // Namespace separator
        ns: ['common'],

        // Debug mode (set to false in production)
        debug: process.env.NODE_ENV === 'development',

        // Supported languages
        supportedLngs: ['en', 'id'],

        // Interpolation options
        interpolation: {
            escapeValue: false, // React already escapes values
        },

        // React specific options
        react: {
            useSuspense: false, // Set to false to avoid suspense issues with SSR
            bindI18n: 'languageChanged',
            bindI18nStore: '',
            transEmptyNodeValue: '',
            transSupportBasicHtmlNodes: true,
            transKeepBasicHtmlNodesFor: ['br', 'strong', 'i'],
        },
    })
    .then(() => {
        console.log('✅ i18next initialized successfully');
    })
    .catch((error) => {
        console.error('❌ i18next initialization failed:', error);
    });

// Set up automatic localStorage sync when language changes
i18n.on('languageChanged', (lng) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('i18nextLng', lng);
    }
});

export default i18n;
