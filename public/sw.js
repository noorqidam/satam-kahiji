const CACHE_NAME = 'satam-kahiji-v2';
const STATIC_CACHE_NAME = 'satam-static-v2';

// Critical resources to cache immediately
const CRITICAL_ASSETS = [
    '/build/manifest.json',
    '/favicon.svg',
    '/favicon.ico',
    '/logo-satam.png'
];

// Cache patterns for different asset types
const CACHE_PATTERNS = [
    /\/build\/assets\/.*\.(js|css|woff2|woff)$/,
    /\/images\/.*\.(jpg|jpeg|png|webp|svg)$/,
    /\/storage\/.*\.(jpg|jpeg|png|webp|svg)$/
];

// Install event - cache critical resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then(cache => cache.addAll(CRITICAL_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - optimized caching strategy
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip cross-origin requests except for fonts
    if (!request.url.startsWith(self.location.origin) && !url.hostname.includes('fonts.bunny.net')) return;

    // Handle API requests with network-first strategy
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request).catch(() => 
                new Response('{"error": "Network unavailable"}', {
                    status: 503,
                    headers: { 'Content-Type': 'application/json' }
                })
            )
        );
        return;
    }

    // Cache-first strategy for static assets
    if (CACHE_PATTERNS.some(pattern => pattern.test(url.pathname)) || url.hostname.includes('fonts.bunny.net')) {
        event.respondWith(
            caches.match(request).then(response => {
                if (response) {
                    return response;
                }
                
                return fetch(request).then(fetchResponse => {
                    // Only cache successful responses
                    if (fetchResponse.status === 200) {
                        const responseClone = fetchResponse.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, responseClone);
                        });
                    }
                    return fetchResponse;
                }).catch(() => {
                    // Return offline fallback for images
                    if (url.pathname.match(/\.(jpg|jpeg|png|webp|svg)$/)) {
                        return new Response('', { status: 404 });
                    }
                    throw new Error('Network failed');
                });
            })
        );
        return;
    }

    // Network-first strategy for pages
    event.respondWith(
        fetch(request).then(response => {
            // Cache successful HTML responses
            if (response.status === 200 && response.headers.get('content-type')?.includes('text/html')) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(request, responseClone);
                });
            }
            return response;
        }).catch(() => {
            // Fallback to cache if network fails
            return caches.match(request).then(response => {
                return response || new Response('Offline - Please check your internet connection', { 
                    status: 503,
                    headers: { 'Content-Type': 'text/plain' }
                });
            });
        })
    );
});

// Handle messages from the main thread
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage(CACHE_NAME);
    }
});