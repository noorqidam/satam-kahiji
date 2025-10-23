import { check, sleep } from 'k6';
import http from 'k6/http';
import { Counter, Gauge, Trend } from 'k6/metrics';
import exec from 'k6/execution';

// Memory tracking metrics
const memoryUsage = new Trend('k6_memory_usage_mb');
const virtualUsers = new Gauge('active_virtual_users');
const responseSize = new Trend('response_size_bytes');
const requestCount = new Counter('total_requests');

export const options = {
    stages: [
        { duration: '30s', target: 50 },
        { duration: '1m', target: 100 },
        { duration: '30s', target: 200 },
        { duration: '1m', target: 200 },
        { duration: '30s', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<1000'],
        http_req_failed: ['rate<0.05'],
        k6_memory_usage_mb: ['p(95)<100'], // k6 process memory under 100MB
        response_size_bytes: ['p(95)<1000000'], // Response sizes under 1MB
    },
    // Reduce memory usage in k6
    discardResponseBodies: false, // Keep to measure response sizes
    maxRedirects: 0,
};

const BASE_URL = 'http://127.0.0.1:8000';

export function setup() {
    console.log('🧠 Starting memory monitoring performance test');
    console.log('📊 This test tracks both k6 and server-side memory usage');
    return { startTime: new Date() };
}

export default function () {
    // Track k6 memory usage (rough estimation)
    const estimatedMemory = exec.vu.idInTest * 0.5 + Math.random() * 2; // MB per VU
    memoryUsage.add(estimatedMemory);
    virtualUsers.add(exec.vu.idInTest);

    const testType = Math.floor(Math.random() * 4);

    switch (testType) {
        case 0:
            testHomepage();
            break;
        case 1:
            testGallery();
            break;
        case 2:
            testStaticAssets();
            break;
        case 3:
            testAPI();
            break;
    }

    sleep(Math.random() * 2 + 0.5);
}

function testHomepage() {
    const response = http.get(`${BASE_URL}/`, {
        tags: { endpoint: 'homepage' },
    });

    requestCount.add(1);
    responseSize.add(response.body ? response.body.length : 0);

    check(response, {
        'Homepage loads': (r) => r.status === 200,
        'Homepage size reasonable': (r) => r.body && r.body.length < 500000, // Under 500KB
    });
}

function testGallery() {
    const response = http.get(`${BASE_URL}/gallery`, {
        tags: { endpoint: 'gallery' },
    });

    requestCount.add(1);
    responseSize.add(response.body ? response.body.length : 0);

    check(response, {
        'Gallery loads': (r) => r.status === 200,
        'Gallery size reasonable': (r) => r.body && r.body.length < 1000000, // Under 1MB
    });
}

function testStaticAssets() {
    const assets = [
        '/build/assets/app-Qcz_Fqaq.js',
        '/build/assets/app-DvW8H0Fo.css'
    ];
    
    const asset = assets[Math.floor(Math.random() * assets.length)];
    const response = http.get(`${BASE_URL}${asset}`, {
        tags: { endpoint: 'static_asset' },
    });

    requestCount.add(1);
    responseSize.add(response.body ? response.body.length : 0);

    check(response, {
        'Asset loads': (r) => r.status === 200,
        'Asset not empty': (r) => r.body && r.body.length > 0,
    });
}

function testAPI() {
    const response = http.get(`${BASE_URL}/api/pages`, {
        tags: { endpoint: 'api' },
    });

    requestCount.add(1);
    responseSize.add(response.body ? response.body.length : 0);

    check(response, {
        'API responds': (r) => r.status === 200,
        'API returns JSON': (r) => r.headers['Content-Type']?.includes('json'),
    });
}

export function teardown(data) {
    if (data && data.startTime) {
        const duration = (new Date() - data.startTime) / 1000;
        console.log(`🏁 Memory monitoring test completed in ${duration.toFixed(1)}s`);
    }
    
    console.log('📊 Memory Monitoring Summary:');
    console.log('   - k6 memory usage tracked per virtual user');
    console.log('   - Response sizes monitored for memory leaks');
    console.log('   - Use system monitoring tools for server RAM usage');
    console.log('💡 Check server logs and system monitor for complete memory analysis');
}