import { lazy } from 'react';

// Lazy load heavy editor components
export const TinyMCEEditor = lazy(() => 
    import('@tinymce/tinymce-react').then(module => ({ default: module.Editor }))
);

// Lazy load heavy UI components
export const DropzoneComponent = lazy(() => 
    import('react-dropzone').then(module => ({ default: module.default }))
);

// Lazy load animation components
export const FramerMotion = lazy(() => 
    import('framer-motion').then(module => ({ default: module.motion }))
);

// Loading fallback component
export const ComponentLoader = ({ className = "h-32" }: { className?: string }) => {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
        </div>
    );
};