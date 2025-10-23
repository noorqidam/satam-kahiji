/* eslint-env k6 */
import { check, sleep } from 'k6';
import http from 'k6/http';
import { Counter, Gauge, Rate, Trend } from 'k6/metrics';

// Custom metrics for massive load testing
const assetLoadTime = new Trend('asset_load_time');
const pageLoadTime = new Trend('page_load_time');
const apiResponseTime = new Trend('api_response_time');
const errorRate = new Rate('error_rate');
const staticAssetRequests = new Counter('static_asset_requests');
const concurrentUsers = new Gauge('concurrent_users');
const memoryUsage = new Trend('memory_usage_estimate');

// Massive load test configuration - 1000+ users
export const options = {
    stages: [
        // Accelerated massive load test
        { duration: '1m', target: 200 }, // Quick ramp to 200 users
        { duration: '1m', target: 500 }, // Ramp to 500 users
        { duration: '2m', target: 1000 }, // Ramp to 1000 users - THE TEST
        { duration: '2m', target: 1000 }, // Sustain 1000 users
        { duration: '1m', target: 1500 }, // Push to 1500 users
        { duration: '1m', target: 1500 }, // Brief sustain at 1500
        { duration: '30s', target: 0 }, // Quick ramp down
    ],

    // Relaxed thresholds for massive load testing
    thresholds: {
        http_req_duration: [
            'p(50)<1000', // 50% under 1s
            'p(90)<3000', // 90% under 3s
            'p(95)<5000', // 95% under 5s
            'p(99)<10000', // 99% under 10s
        ],
        http_req_failed: ['rate<0.15'], // Allow up to 15% errors under massive load
        asset_load_time: ['p(95)<2000'], // 95% of assets under 2s
        page_load_time: ['p(95)<5000'], // 95% of pages under 5s
        api_response_time: ['p(95)<3000'], // 95% of API calls under 3s
        error_rate: ['rate<0.15'], // Custom error rate tracking
    },

    // Resource limits for massive testing
    maxRedirects: 0,
    discardResponseBodies: true, // Save memory during massive load

    // Extended timeouts for high load
    httpDebug: 'full',
};

const BASE_URL = 'http://127.0.0.1:8000';

// Optimized asset list for massive testing
const STATIC_ASSETS = [
    '/build/assets/app-Qcz_Fqaq.js',
    '/build/assets/app-DvW8H0Fo.css',
    '/build/assets/react-vendor-igPdlYzW.js',
    '/build/assets/vendor-Dztswde7.js',
];

// Essential pages for massive testing
const PAGES = ['/', '/news', '/gallery', '/facilities', '/teachers', '/principal', '/about-us'];

// Gallery detail pages for massive testing
const GALLERY_SLUGS = [
    'semangat-kebersamaan-di-hari-pramuka',
    'upacara-hari-kemerdekaan-indonesia',
    'peringatan-maulid-nabi-muhammad-saw',
    'makan-bergizi-gratis'
];

// API endpoints for testing
const API_ENDPOINTS = ['/api/pages'];

export function setup() {
    console.log('🚀 MASSIVE LOAD TEST - Testing Laravel + Octane + FrankenPHP');
    console.log(`🎯 Target: UP TO 2000 CONCURRENT USERS`);
    console.log(`📍 Base URL: ${BASE_URL}`);
    console.log('⚠️  This test will push your server to its absolute limits!');

    // Warm up the application
    const warmupResponse = http.get(BASE_URL);
    if (warmupResponse.status !== 200) {
        console.error('❌ Server warmup failed - check if server is running');
        return null;
    }

    console.log('✅ Server warmup successful');
    return { baseUrl: BASE_URL, startTime: new Date() };
}

export default function () {
    // Track concurrent users
    concurrentUsers.add(__VU);

    // Estimate memory usage (rough calculation)
    const estimatedMemory = __VU * 2; // ~2MB per virtual user estimate
    memoryUsage.add(estimatedMemory);

    // Weighted test distribution for massive load
    const testType = Math.floor(Math.random() * 20); // 0-19 for precise percentage distribution

    switch (testType) {
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
            // 50% - Static assets (lightest load)
            testStaticAssets();
            break;
        
        case 10:
        case 11:
        case 12:
        case 13:
        case 14:
        case 15:
            // 30% - Page loads (medium load)
            testPageLoads();
            break;
        
        case 16:
        case 17:
            // 10% - Gallery detail pages (medium load)
            testGalleryDetailPages();
            break;
        
        case 18:
        case 19:
        default:
            // 10% - API calls (can be heavy depending on complexity)
            testApiEndpoints();
            break;
    }

    // Variable sleep based on load level
    const sleepTime = __VU > 1000 ? Math.random() * 0.5 + 0.5 : Math.random() * 1 + 1;
    sleep(sleepTime);
}

function testStaticAssets() {
    const asset = STATIC_ASSETS[Math.floor(Math.random() * STATIC_ASSETS.length)];
    const url = `${BASE_URL}${asset}`;

    const response = http.get(url, {
        tags: {
            type: 'static_asset',
            asset_type: asset.endsWith('.js') ? 'javascript' : 'css',
            load_phase: getLoadPhase(__VU),
        },
        timeout: '10s', // Extended timeout for high load
    });

    staticAssetRequests.add(1);
    assetLoadTime.add(response.timings.duration);

    const success = check(response, {
        'Asset loads successfully': (r) => r.status === 200,
        'Asset has content': (r) => r.body && r.body.length > 0,
        'Asset loads within timeout': (r) => r.timings.duration < 10000,
    });

    if (!success) {
        errorRate.add(1);
    }
}

function testPageLoads() {
    const page = PAGES[Math.floor(Math.random() * PAGES.length)];
    const url = `${BASE_URL}${page}`;

    const response = http.get(url, {
        tags: {
            type: 'page_load',
            page: page,
            load_phase: getLoadPhase(__VU),
        },
        timeout: '15s', // Extended timeout for pages under high load
    });

    pageLoadTime.add(response.timings.duration);

    const success = check(response, {
        'Page loads successfully': (r) => r.status === 200,
        'Page is HTML': (r) => r.headers['Content-Type']?.includes('html') || r.headers['content-type']?.includes('html'),
        'Page loads within timeout': (r) => r.timings.duration < 15000,
        'Page has DOCTYPE': (r) => r.body?.includes('<!DOCTYPE'),
    });

    if (!success) {
        errorRate.add(1);
    }
}

function testGalleryDetailPages() {
    const slug = GALLERY_SLUGS[Math.floor(Math.random() * GALLERY_SLUGS.length)];
    const url = `${BASE_URL}/gallery/${slug}`;

    const response = http.get(url, {
        tags: {
            type: 'gallery_detail',
            slug: slug,
            load_phase: getLoadPhase(__VU),
        },
        timeout: '15s', // Extended timeout for gallery pages under high load
    });

    pageLoadTime.add(response.timings.duration);

    const success = check(response, {
        'Gallery detail loads successfully': (r) => r.status === 200,
        'Gallery detail is HTML': (r) => r.headers['Content-Type']?.includes('html') || r.headers['content-type']?.includes('html'),
        'Gallery detail loads within timeout': (r) => r.timings.duration < 15000,
        'Gallery detail has DOCTYPE': (r) => r.body?.includes('<!DOCTYPE'),
    });

    if (!success) {
        errorRate.add(1);
    }
}

function testApiEndpoints() {
    const endpoint = API_ENDPOINTS[Math.floor(Math.random() * API_ENDPOINTS.length)];
    const url = `${BASE_URL}${endpoint}`;

    const response = http.get(url, {
        tags: {
            type: 'api_call',
            endpoint: endpoint,
            load_phase: getLoadPhase(__VU),
        },
        timeout: '20s', // Extended timeout for API calls
    });

    apiResponseTime.add(response.timings.duration);

    const success = check(response, {
        'API responds successfully': (r) => r.status === 200,
        'API returns JSON': (r) => r.headers['Content-Type']?.includes('json') || r.headers['content-type']?.includes('json'),
        'API responds within timeout': (r) => r.timings.duration < 20000,
    });

    if (!success) {
        errorRate.add(1);
    }
}

function getLoadPhase(vu) {
    if (vu <= 50) return 'light';
    if (vu <= 200) return 'medium';
    if (vu <= 500) return 'high';
    if (vu <= 1000) return 'massive';
    if (vu <= 1500) return 'extreme';
    return 'ultimate';
}

export function teardown(data) {
    if (data && data.startTime) {
        const duration = (new Date() - data.startTime) / 1000;
        console.log(`🏁 MASSIVE LOAD TEST COMPLETED in ${duration.toFixed(1)}s`);
    }

    console.log('📊 Test Summary:');
    console.log('   - Maximum concurrent users: 2000');
    console.log('   - Test phases: 7 (light → ultimate)');
    console.log('   - Total duration: ~32 minutes');
    console.log('   - Load types: Static assets (50%), Pages (30%), Gallery details (10%), APIs (10%)');
    console.log('💡 Check the results to see how your Octane setup handled massive load!');
}
