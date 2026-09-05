import http from 'k6/http';
import { check, sleep } from 'k6';

// Run with: k6 run load-test.js
// Environment setup:
// For local: k6 run -e API_URL=http://localhost:5000 load-test.js
// For staging: k6 run -e API_URL=https://staging.api.example.com load-test.js

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 20 },  // Stay at 20 users for 1 minute
    { duration: '30s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate should be less than 1%
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:5000';

export default function () {
  // Setup: Usually we'd get a token here, but for this test we'll assume 
  // there's a public/mock endpoint or we just test the login endpoint payload parsing
  
  // Example 1: Test Login Performance (assuming /api/auth/login exists)
  const loginPayload = JSON.stringify({
    username: 'testuser',
    password: 'password123',
  });
  
  const headers = { 'Content-Type': 'application/json' };
  
  let res = http.post(`${BASE_URL}/api/auth/login`, loginPayload, { headers });
  
  check(res, {
    'login status is 401 or 200': (r) => r.status === 200 || r.status === 401, // 401 is expected if testuser doesn't exist, which still tests backend processing
  });

  sleep(1);

  // Example 2: Fetch Purchase Requests (If we had a valid token, we'd pass it in headers)
  // res = http.get(`${BASE_URL}/api/purchase-requests`, { headers: { Authorization: 'Bearer ...' } });
  // check(res, { 'PR list status is 200': (r) => r.status === 200 });
}
