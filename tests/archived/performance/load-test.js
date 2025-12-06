import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 },  // Ramp-up to 10 users
    { duration: '5m', target: 10 },  // Stay at 10 users
    { duration: '2m', target: 50 },  // Ramp-up to 50 users
    { duration: '5m', target: 50 },  // Stay at 50 users
    { duration: '2m', target: 100 }, // Ramp-up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp-down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate should be less than 1%
    errors: ['rate<0.1'],             // Custom error rate should be less than 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8888';
let authToken = '';

// Setup function - runs once per VU
export function setup() {
  // Login to get authentication token
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: 'admin@admin.com',
    password: 'admin123'
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(loginRes, {
    'login successful': (r) => r.status === 200,
  });

  return { token: loginRes.json('result.token') };
}

// Main test function
export default function(data) {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${data.token}`,
    },
  };

  // Test 1: Health Check
  let healthRes = http.get(`${BASE_URL}/api/health`);
  check(healthRes, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 200ms': (r) => r.timings.duration < 200,
  }) || errorRate.add(1);

  sleep(1);

  // Test 2: List Customers
  let customersRes = http.get(`${BASE_URL}/api/customer/list`, params);
  check(customersRes, {
    'customers list status is 200': (r) => r.status === 200,
    'customers list response time < 1000ms': (r) => r.timings.duration < 1000,
    'customers list returns array': (r) => Array.isArray(r.json('result')),
  }) || errorRate.add(1);

  sleep(2);

  // Test 3: List Invoices
  let invoicesRes = http.get(`${BASE_URL}/api/invoice/list`, params);
  check(invoicesRes, {
    'invoices list status is 200': (r) => r.status === 200,
    'invoices list response time < 1000ms': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);

  sleep(2);

  // Test 4: List Quotes
  let quotesRes = http.get(`${BASE_URL}/api/quote/list`, params);
  check(quotesRes, {
    'quotes list status is 200': (r) => r.status === 200,
    'quotes list response time < 1000ms': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);

  sleep(2);

  // Test 5: Create Customer
  const customerData = {
    company: `Test Company ${Date.now()}`,
    name: 'Load',
    surname: 'Test',
    email: `loadtest${Date.now()}@example.com`,
    phone: '+1234567890',
  };

  let createCustomerRes = http.post(
    `${BASE_URL}/api/customer/create`,
    JSON.stringify(customerData),
    params
  );
  
  check(createCustomerRes, {
    'customer creation status is 200': (r) => r.status === 200,
    'customer creation response time < 2000ms': (r) => r.timings.duration < 2000,
    'customer has ID': (r) => r.json('result._id') !== undefined,
  }) || errorRate.add(1);

  sleep(3);

  // Test 6: Read Customer
  if (createCustomerRes.status === 200) {
    const customerId = createCustomerRes.json('result._id');
    let readCustomerRes = http.get(`${BASE_URL}/api/customer/read/${customerId}`, params);
    
    check(readCustomerRes, {
      'customer read status is 200': (r) => r.status === 200,
      'customer read response time < 500ms': (r) => r.timings.duration < 500,
    }) || errorRate.add(1);
  }

  sleep(2);

  // Test 7: Dashboard Statistics
  let statsRes = http.get(`${BASE_URL}/api/dashboard/stats`, params);
  check(statsRes, {
    'dashboard stats response time < 1500ms': (r) => r.timings.duration < 1500,
  }) || errorRate.add(1);

  sleep(1);
}

// Teardown function - runs once at the end
export function teardown(data) {
  console.log('Performance test completed');
}
