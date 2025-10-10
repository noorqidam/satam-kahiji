import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { trackWebVitals } from './utils/performance';

// Lazy load i18n only when needed
const initI18n = () => import('./i18n');

const appName = import.meta.env.VITE_APP_NAME;

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx', { eager: false })),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Initialize performance tracking
        if (process.env.NODE_ENV === 'production') {
            trackWebVitals();
        }

        // Lazy load i18n after initial render
        setTimeout(() => {
            initI18n();
        }, 100);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
        delay: 250,
        showSpinner: true,
    },
});

// This will set light / dark mode on load...
initializeTheme();
