import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Counter } from 'k6/metrics';

const BASE_URL = 'https://chemicallab.vercel.app';

export const options = {
  vus: 10,
  duration: '60s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1500'],
  },
};

const endpointTrends = {
  '/api/health': new Trend('duration_api_health'),
  '/api/version': new Trend('duration_api_version'),
  '/api/config': new Trend('duration_api_config'),
  '/api/items': new Trend('duration_api_items'),
};

const endpointCounts = {
  '/api/health': { reqs: new Counter('reqs_api_health'), c2xx: new Counter('c2xx_api_health'), c4xx: new Counter('c4xx_api_health'), c5xx: new Counter('c5xx_api_health') },
  '/api/version': { reqs: new Counter('reqs_api_version'), c2xx: new Counter('c2xx_api_version'), c4xx: new Counter('c4xx_api_version'), c5xx: new Counter('c5xx_api_version') },
  '/api/config': { reqs: new Counter('reqs_api_config'), c2xx: new Counter('c2xx_api_config'), c4xx: new Counter('c4xx_api_config'), c5xx: new Counter('c5xx_api_config') },
  '/api/items': { reqs: new Counter('reqs_api_items'), c2xx: new Counter('c2xx_api_items'), c4xx: new Counter('c4xx_api_items'), c5xx: new Counter('c5xx_api_items') },
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

    endpointTrends[endpoint].add(response.timings.duration);
    endpointCounts[endpoint].reqs.add(1);
    if (response.status >= 200 && response.status < 300) {
      endpointCounts[endpoint].c2xx.add(1);
    } else if (response.status >= 400 && response.status < 500) {
      endpointCounts[endpoint].c4xx.add(1);
    } else if (response.status >= 500) {
      endpointCounts[endpoint].c5xx.add(1);
    }

    check(response, {
      [`${endpoint} returns expected HTTP status`]: (r) => r.status >= 200 && r.status < 300,
    });
    sleep(1);
  }
}
