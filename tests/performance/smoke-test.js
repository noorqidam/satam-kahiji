import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1, // 1 virtual user
  duration: '1m', // Run for 1 minute
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests under 1s
    http_req_failed: ['rate<0.01'],    // Less than 1% errors
  },
};

const BASE_URL = 'http://127.0.0.1:8000';

export default function() {
  // Test homepage
  let response = http.get(`${BASE_URL}/`);
  check(response, {
    'Homepage loads': (r) => r.status === 200,
    'Homepage is HTML': (r) => r.headers['Content-Type']?.includes('html') || r.headers['content-type']?.includes('html'),
  });
  
  sleep(1);
  
  // Test static asset
  response = http.get(`${BASE_URL}/build/assets/app-Qcz_Fqaq.js`);
  check(response, {
    'JS asset loads': (r) => r.status === 200,
    'JS has correct MIME': (r) => r.headers['Content-Type']?.includes('javascript') || r.headers['content-type']?.includes('javascript'),
  });
  
  sleep(1);
  
  // Test CSS asset
  response = http.get(`${BASE_URL}/build/assets/app-DvW8H0Fo.css`);
  check(response, {
    'CSS asset loads': (r) => r.status === 200,
    'CSS has correct MIME': (r) => r.headers['Content-Type']?.includes('css') || r.headers['content-type']?.includes('css'),
  });
  
  sleep(1);
  
  // Test API endpoint
  response = http.get(`${BASE_URL}/api/pages`);
  check(response, {
    'API responds': (r) => r.status === 200,
    'API returns JSON': (r) => r.headers['Content-Type']?.includes('json') || r.headers['content-type']?.includes('json'),
  });
  
  sleep(2);
}