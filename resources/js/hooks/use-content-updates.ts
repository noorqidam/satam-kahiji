import { useEffect, useRef } from 'react';
import type { ContentUpdateEvent, ContentUpdateListener } from '@/types/echo';
import { getEcho } from '@/services/echo';

/**
 * Hook to listen for real-time content updates
 * @param onUpdate Callback function to handle content updates
 * @param contentTypes Optional array to filter specific content types
 */
export const useContentUpdates = (
    onUpdate: ContentUpdateListener,
    contentTypes?: ('post' | 'gallery' | 'facility' | 'extracurricular' | 'page')[]
) => {
    const onUpdateRef = useRef(onUpdate);
    
    // Keep the callback ref updated
    useEffect(() => {
        onUpdateRef.current = onUpdate;
    }, [onUpdate]);

    useEffect(() => {
        const echo = getEcho();
        if (!echo) {
            console.warn('Echo not initialized. Real-time updates unavailable.');
            return;
        }

        const handleContentUpdate = (event: ContentUpdateEvent) => {
            console.log('Echo received event:', event);
            
            // Filter by content types if specified
            if (contentTypes && !contentTypes.includes(event.contentType)) {
                console.log('Event filtered out, not matching content types:', contentTypes);
                return;
            }
            
            console.log('Calling onUpdate callback for event:', event);
            onUpdateRef.current(event);
        };

        // Listen to the content-updates channel
        console.log('Subscribing to content-updates channel with content types:', contentTypes);
        const channel = echo.channel('content-updates');
        
        channel.listen('.content.updated', handleContentUpdate);
        
        // Add channel debugging
        channel.subscribed(() => {
            console.log('Successfully subscribed to content-updates channel');
        });
        
        channel.error((error: unknown) => {
            console.error('Channel subscription error:', error);
        });

        // Cleanup on unmount
        return () => {
            console.log('Leaving content-updates channel');
            echo.leaveChannel('content-updates');
        };
    }, [contentTypes]);
};

/**
 * Hook specifically for homepage content updates
 * Listens for post, gallery, and extracurricular updates that affect the homepage
 */
export const useHomepageUpdates = (onUpdate: ContentUpdateListener) => {
    return useContentUpdates(onUpdate, ['post', 'gallery', 'extracurricular']);
};

/**
 * Hook for post updates only
 */
export const usePostUpdates = (onUpdate: ContentUpdateListener) => {
    return useContentUpdates(onUpdate, ['post']);
};

/**
 * Hook for gallery updates only
 */
export const useGalleryUpdates = (onUpdate: ContentUpdateListener) => {
    return useContentUpdates(onUpdate, ['gallery']);
};

/**
 * Hook for facility updates only
 */
export const useFacilityUpdates = (onUpdate: ContentUpdateListener) => {
    return useContentUpdates(onUpdate, ['facility']);
};

/**
 * Hook for extracurricular updates only
 */
export const useExtracurricularUpdates = (onUpdate: ContentUpdateListener) => {
    return useContentUpdates(onUpdate, ['extracurricular']);
};

/**
 * Hook for page updates only
 */
export const usePageUpdates = (onUpdate: ContentUpdateListener) => {
    return useContentUpdates(onUpdate, ['page']);
};