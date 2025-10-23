import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Make Pusher available globally for Echo
window.Pusher = Pusher;

// Type for Laravel Echo instance
type EchoInstance = Echo<'pusher'>;

/**
 * Initialize Laravel Echo with Pusher configuration
 */
export const initializeEcho = (): EchoInstance => {
    console.log('Initializing Echo with config:', {
        key: import.meta.env.VITE_PUSHER_APP_KEY,
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER ?? 'ap1',
    });
    
    const echoInstance = new Echo<'pusher'>({
        broadcaster: 'pusher',
        key: import.meta.env.VITE_PUSHER_APP_KEY,
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER ?? 'ap1',
        forceTLS: true,
        encrypted: true,
        authEndpoint: '/broadcasting/auth',
        auth: {
            headers: {
                Accept: 'application/json',
            },
        },
        enabledTransports: ['ws', 'wss'],
    });
    
    // Add connection debugging
    if ('pusher' in echoInstance.connector) {
        echoInstance.connector.pusher.connection.bind('connected', () => {
            console.log('Pusher connected successfully');
        });
        
        echoInstance.connector.pusher.connection.bind('error', (error: unknown) => {
            console.error('Pusher connection error:', error);
        });
    }
    
    return echoInstance;
};

/**
 * Global Echo instance
 */
export let echo: EchoInstance | null = null;

/**
 * Initialize Echo globally
 */
export const setupEcho = (): EchoInstance => {
    if (!echo) {
        echo = initializeEcho();
    }
    return echo;
};

/**
 * Get the current Echo instance
 */
export const getEcho = (): EchoInstance | null => {
    return echo;
};

/**
 * Disconnect Echo
 */
export const disconnectEcho = (): void => {
    if (echo) {
        echo.disconnect();
        echo = null;
    }
};
