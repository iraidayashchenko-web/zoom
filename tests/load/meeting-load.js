import http from 'k6/http';
import { check, sleep } from 'k6';
export const options = { vus: 200, duration: '5m', thresholds: { http_req_failed: ['rate<0.01'], http_req_duration: ['p(95)<500'] } };
export default function () { const res = http.get(`${__ENV.API_URL}/api/v1/health`); check(res, { 'healthy': (r) => r.status === 200 }); sleep(1); }
