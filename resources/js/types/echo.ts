/**
 * Content update event data structure
 */
export interface ContentUpdateEvent {
    contentType: 'post' | 'gallery' | 'facility' | 'extracurricular' | 'page';
    action: 'created' | 'updated' | 'deleted' | 'published' | 'unpublished';
    id: number;
    title?: string;
    timestamp: string;
}

/**
 * Echo channel event listener callback
 */
export type ContentUpdateListener = (event: ContentUpdateEvent) => void;