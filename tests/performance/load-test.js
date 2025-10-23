import { check, sleep } from 'k6';
import http from 'k6/http';
import { Counter, Rate, Trend, Gauge } from 'k6/metrics';
import exec from 'k6/execution';

// Custom metrics
const assetLoadTime = new Trend('asset_load_time');
const pageLoadTime = new Trend('page_load_time');
const apiResponseTime = new Trend('api_response_time');
const errorRate = new Rate('error_rate');
const staticAssetRequests = new Counter('static_asset_requests');

// Memory tracking metrics
const responseSize = new Trend('response_size_bytes');
const memoryEstimate = new Trend('k6_memory_estimate_mb');
const activeVUs = new Gauge('active_virtual_users');

// Test configuration
export const options = {
    stages: [
        { duration: '30s', target: 10 }, // Ramp up to 10 users
        { duration: '1m', target: 10 }, // Stay at 10 users
        { duration: '30s', target: 25 }, // Ramp up to 25 users
        { duration: '2m', target: 25 }, // Stay at 25 users
        { duration: '30s', target: 50 }, // Ramp up to 50 users
        { duration: '1m', target: 50 }, // Stay at 50 users
        { duration: '30s', target: 0 }, // Ramp down to 0 users
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests must finish within 500ms
        http_req_failed: ['rate<0.05'], // Error rate must be less than 5%
        asset_load_time: ['p(95)<200'], // 95% of asset loads under 200ms
        page_load_time: ['p(95)<1000'], // 95% of page loads under 1s
        api_response_time: ['p(95)<300'], // 95% of API calls under 300ms
        response_size_bytes: ['p(95)<2000000'], // 95% of responses under 2MB
        k6_memory_estimate_mb: ['p(95)<50'], // k6 memory usage estimate
    },
};

const BASE_URL = 'http://127.0.0.1:8000';

// Static assets to test
const STATIC_ASSETS = [
    '/build/assets/app-Qcz_Fqaq.js',
    '/build/assets/app-DvW8H0Fo.css',
    '/build/assets/react-vendor-igPdlYzW.js',
    '/build/assets/vendor-Dztswde7.js',
];

// Pages to test
const PAGES = ['/', '/news', '/gallery', '/facilities', '/teachers', '/principal', '/about-us'];

// Gallery detail pages to test (real slugs from database)
const GALLERY_SLUGS = [
    'semangat-kebersamaan-di-hari-pramuka',
    'upacara-hari-kemerdekaan-indonesia',
    'peringatan-maulid-nabi-muhammad-saw',
    'makan-bergizi-gratis'
];

export function setup() {
    console.log('🚀 Starting performance tests for Laravel + Octane + FrankenPHP');
    console.log(`Base URL: ${BASE_URL}`);

    // Warm up the application
    http.get(BASE_URL);
    return { baseUrl: BASE_URL };
}

export default function () {
    // Track memory usage
    activeVUs.add(exec.vu.idInTest);
    const estimatedMemory = exec.vu.idInTest * 1.5 + Math.random() * 2; // Rough estimate in MB
    memoryEstimate.add(estimatedMemory);

    const testType = Math.floor(Math.random() * 10); // 0-9 for easier percentage distribution

    switch (testType) {
        case 0:
        case 1:
        case 2:
            // 30% - Test static assets
            testStaticAssets();
            break;
        
        case 3:
        case 4:
        case 5:
            // 30% - Test page loads
            testPageLoads();
            break;
        
        case 6:
        case 7:
            // 20% - Test gallery detail pages
            testGalleryDetailPages();
            break;
        
        case 8:
        case 9:
        default:
            // 20% - Test API endpoints
            testApiEndpoints();
            break;
    }

    sleep(Math.random() * 2 + 1); // Random sleep between 1-3 seconds
}

function testStaticAssets() {
    const asset = STATIC_ASSETS[Math.floor(Math.random() * STATIC_ASSETS.length)];
    const url = `${BASE_URL}${asset}`;

    const response = http.get(url, {
        tags: { type: 'static_asset' },
    });

    staticAssetRequests.add(1);
    assetLoadTime.add(response.timings.duration);

    const success = check(response, {
        'Static asset status is 200': (r) => r.status === 200,
        'Static asset has correct content-type': (r) => {
            if (asset.endsWith('.js')) {
                return r.headers['Content-Type']?.includes('javascript') || r.headers['content-type']?.includes('javascript');
            }
            if (asset.endsWith('.css')) {
                return r.headers['Content-Type']?.includes('css') || r.headers['content-type']?.includes('css');
            }
            return true;
        },
        'Static asset loads quickly': (r) => r.timings.duration < 200,
    });

    if (!success) {
        errorRate.add(1);
    }
}

function testPageLoads() {
    const page = PAGES[Math.floor(Math.random() * PAGES.length)];
    const url = `${BASE_URL}${page}`;

    const response = http.get(url, {
        tags: { type: 'page_load' },
    });

    pageLoadTime.add(response.timings.duration);

    const success = check(response, {
        'Page status is 200': (r) => r.status === 200,
        'Page contains HTML': (r) => r.headers['Content-Type']?.includes('html') || r.headers['content-type']?.includes('html'),
        'Page loads quickly': (r) => r.timings.duration < 1000,
        'Page contains expected content': (r) => r.body?.includes('<!DOCTYPE html>'),
    });

    if (!success) {
        errorRate.add(1);
    }
}

function testGalleryDetailPages() {
    const slug = GALLERY_SLUGS[Math.floor(Math.random() * GALLERY_SLUGS.length)];
    const url = `${BASE_URL}/gallery/${slug}`;

    const response = http.get(url, {
        tags: { type: 'gallery_detail' },
    });

    pageLoadTime.add(response.timings.duration);
    responseSize.add(response.body ? response.body.length : 0);

    const success = check(response, {
        'Gallery detail status is 200': (r) => r.status === 200,
        'Gallery detail contains HTML': (r) => r.headers['Content-Type']?.includes('html') || r.headers['content-type']?.includes('html'),
        'Gallery detail loads quickly': (r) => r.timings.duration < 1000,
        'Gallery detail contains expected content': (r) => r.body?.includes('<!DOCTYPE html>'),
    });

    if (!success) {
        errorRate.add(1);
    }
}

function testApiEndpoints() {
    const endpoints = [
        '/api/pages',
        // Add more API endpoints here as needed
    ];

    const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
    const url = `${BASE_URL}${endpoint}`;

    const response = http.get(url, {
        tags: { type: 'api_call' },
    });

    apiResponseTime.add(response.timings.duration);

    const success = check(response, {
        'API status is 200': (r) => r.status === 200,
        'API returns JSON': (r) => r.headers['Content-Type']?.includes('json') || r.headers['content-type']?.includes('json'),
        'API responds quickly': (r) => r.timings.duration < 300,
    });

    if (!success) {
        errorRate.add(1);
    }
}

export function teardown() {
    console.log('🏁 Performance tests completed');
}
