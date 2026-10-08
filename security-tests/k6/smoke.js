import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'https://chemicallab.vercel.app';

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000'],
  },
};

export default function () {
  const endpoints = [
    '/api/health',
    '/api/version',
    '/api/config',
    '/api/items',
  ];

  for (const endpoint of endpoints) {
    const response = http.get(`${BASE_URL}${endpoint}`);
    check(response, {
      [`${endpoint} returns expected HTTP status`]: (r) => r.status >= 200 && r.status < 300,
    });
    sleep(1);
  }
}
