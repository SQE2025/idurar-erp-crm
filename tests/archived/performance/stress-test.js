import http from 'k6/http';
import { check, sleep } from 'k6';

// Stress test configuration
export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp-up to 50 users
    { duration: '3m', target: 100 },  // Ramp-up to 100 users
    { duration: '3m', target: 200 },  // Spike to 200 users
    { duration: '3m', target: 300 },  // Spike to 300 users
    { duration: '3m', target: 100 },  // Recover to 100 users
    { duration: '2m', target: 0 },    // Ramp-down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests under 2s during stress
    http_req_failed: ['rate<0.05'],    // Error rate under 5% during stress
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8888';

export function setup() {
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: 'admin@admin.com',
    password: 'admin123'
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  return { token: loginRes.json('result.token') };
}

export default function(data) {
  const params = {
    headers: {
      'Authorization': `Bearer ${data.token}`,
    },
  };

  // Simulate heavy load on multiple endpoints
  http.batch([
    ['GET', `${BASE_URL}/api/customer/list`, null, params],
    ['GET', `${BASE_URL}/api/invoice/list`, null, params],
    ['GET', `${BASE_URL}/api/quote/list`, null, params],
    ['GET', `${BASE_URL}/api/payment/list`, null, params],
  ]);

  sleep(1);
}
