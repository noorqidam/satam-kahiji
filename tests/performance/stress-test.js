import { check, sleep } from 'k6';
import http from 'k6/http';
import { Counter, Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('error_rate');
const totalRequests = new Counter('total_requests');

export const options = {
    stages: [
        { duration: '1m', target: 20 }, // Ramp up to 20 users
        { duration: '2m', target: 20 }, // Stay at 20 users
        { duration: '1m', target: 50 }, // Ramp up to 50 users
        { duration: '2m', target: 50 }, // Stay at 50 users
        { duration: '1m', target: 100 }, // Ramp up to 100 users
        { duration: '2m', target: 100 }, // Stay at 100 users
        { duration: '1m', target: 200 }, // Ramp up to 200 users
        { duration: '3m', target: 200 }, // Stay at 200 users - stress test
        { duration: '1m', target: 0 }, // Ramp down to 0 users
    ],
    thresholds: {
        http_req_duration: ['p(95)<2000'], // Allow higher response times under stress
        http_req_failed: ['rate<0.1'], // Allow up to 10% errors under stress
        error_rate: ['rate<0.1'],
    },
};

const BASE_URL = 'http://127.0.0.1:8000';

export function setup() {
    console.log('💪 Starting stress test - finding breaking point');
    return { baseUrl: BASE_URL };
}

export default function () {
    totalRequests.add(1);

    const scenarios = [() => testHomepage(), () => testStaticAssets(), () => testNewsPage(), () => testConcurrentAssets()];

    // Pick random scenario
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    scenario();

    sleep(Math.random() * 1); // Random sleep 0-1 seconds
}

function testHomepage() {
    const response = http.get(`${BASE_URL}/`, {
        tags: { scenario: 'homepage' },
    });

    const success = check(response, {
        'Homepage status is 200': (r) => r.status === 200,
        'Homepage loads under stress': (r) => r.timings.duration < 3000,
    });

    if (!success) errorRate.add(1);
}

function testStaticAssets() {
    const assets = ['/build/assets/app-Qcz_Fqaq.js', '/build/assets/app-DvW8H0Fo.css', '/build/assets/react-vendor-igPdlYzW.js'];

    const asset = assets[Math.floor(Math.random() * assets.length)];
    const response = http.get(`${BASE_URL}${asset}`, {
        tags: { scenario: 'static_asset' },
    });

    const success = check(response, {
        'Asset status is 200': (r) => r.status === 200,
        'Asset loads under stress': (r) => r.timings.duration < 1000,
    });

    if (!success) errorRate.add(1);
}

function testNewsPage() {
    const response = http.get(`${BASE_URL}/news`, {
        tags: { scenario: 'news_page' },
    });

    const success = check(response, {
        'News page status is 200': (r) => r.status === 200,
        'News page loads under stress': (r) => r.timings.duration < 3000,
    });

    if (!success) errorRate.add(1);
}

function testConcurrentAssets() {
    // Simulate loading multiple assets at once
    const requests = [
        { method: 'GET', url: `${BASE_URL}/build/assets/app-Qcz_Fqaq.js` },
        { method: 'GET', url: `${BASE_URL}/build/assets/app-DvW8H0Fo.css` },
        { method: 'GET', url: `${BASE_URL}/build/assets/react-vendor-igPdlYzW.js` },
    ];

    const responses = http.batch(requests);

    for (let i = 0; i < responses.length; i++) {
        const success = check(responses[i], {
            'Concurrent asset loads': (r) => r.status === 200,
        });

        if (!success) errorRate.add(1);
    }
}

export function teardown() {
    console.log('💪 Stress test completed - check results for breaking point');
}
