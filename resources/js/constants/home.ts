// Constants for home page to avoid magic numbers and improve maintainability

export const SCROLL_CONFIG = {
    CARD_WIDTH: 320,
    MOBILE_CARD_WIDTH: 288,
    VISIBLE_ITEMS: 3,
} as const;

export const CAROUSEL_CONFIG = {
    AUTO_ROTATE_INTERVAL: 5000,
} as const;

export const ANIMATION_CONFIG = {
    SPRING_CONFIG: {
        stiffness: 300,
        damping: 30,
    },
    DRAG_THRESHOLD: 0.2,
    MOBILE_DRAG_THRESHOLD: 0.15,
} as const;
