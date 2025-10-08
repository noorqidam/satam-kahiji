import { useState } from 'react';

type ViewMode = 'card' | 'table';

export const useViewPreference = (key: string, defaultView: ViewMode = 'card') => {
    const [view, setView] = useState<ViewMode>(() => {
        if (typeof window === 'undefined') return defaultView;

        try {
            const stored = localStorage.getItem(key);
            return (stored as ViewMode) || defaultView;
        } catch {
            return defaultView;
        }
    });

    const setViewWithPersistence = (newView: ViewMode) => {
        setView(newView);
        try {
            localStorage.setItem(key, newView);
        } catch {
            // Ignore storage errors
        }
    };

    return [view, setViewWithPersistence] as const;
};
