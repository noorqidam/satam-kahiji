import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { setupEcho } from './services/echo';
import { trackWebVitals } from './utils/performance';

// Import i18n synchronously to ensure it's available immediately
import './i18n';

const appName = import.meta.env.VITE_APP_NAME;

// Preload critical resources
const preloadCriticalResources = () => {
    // Preload commonly used icons and assets
    const criticalAssets = ['/build/assets/app.css', '/favicon.ico'];

    criticalAssets.forEach((href) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = href;
        if (href.endsWith('.css')) {
            link.as = 'style';
        }
        document.head.appendChild(link);
    });
};

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx', { eager: false })),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Initialize performance tracking
        if (process.env.NODE_ENV === 'production') {
            trackWebVitals();
            preloadCriticalResources();
        }

        // Initialize Laravel Echo for real-time updates
        setupEcho();

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
        delay: 150, // Reduced delay for faster feedback
        showSpinner: true,
    },
});

// This will set light / dark mode on load...
initializeTheme();
