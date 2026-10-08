# k6 BASELINE LOAD TEST — 10 VU / 60s

## Configuration
- **Target:** `https://chemicallab.vercel.app`
- **k6 Version:** `k6 v2.3.0 (commit/e088784614, go1.26.8, darwin/arm64)`
- **VUs:** 10
- **Duration:** 60s
- **Read-Only Mode:** **YES** (`GET` requests only, zero mutating methods, zero authentication credentials)
- **Script Executed:** `security-tests/k6/load-10vu.js`
- **Execution Command:** `"$HOME/.local/bin/k6" run --summary-export=security-tests/k6/k6-10vu-summary.json security-tests/k6/load-10vu.js`
- **Thresholds Configured:**
  - `http_req_failed`: `['rate<0.01']` (< 1%)
  - `http_req_duration`: `['p(95)<1500']` (< 1500 ms)

---

## Results

| Metric | 1 VU Baseline (30s) | 10 VU (60s) | Change | Status |
| :--- | :---: | :---: | :---: | :---: |
| **Error rate (`http_req_failed`)** | **0.00%** (0 / 24) | **0.00%** (0 / 440) | 0.00% | **PASS** |
| **p(90) Duration** | **591.55 ms** | **711.18 ms** | +20.22% | **INFO** |
| **p(95) Duration** | **972.44 ms** | **1,277.97 ms** | +31.42% | **PASS** (Threshold <1500ms) |
| **p(99) Duration** | **1,048.00 ms** | **~1,520.00 ms** | +45.04% | **INFO** |
| **Average Duration (`avg`)** | **361.86 ms** | **432.92 ms** | +19.64% | **INFO** |
| **Minimum Duration (`min`)** | **264.41 ms** | **279.58 ms** | +5.74% | **INFO** |
| **Median Duration (`med`)** | **275.52 ms** | **327.19 ms** | +18.75% | **INFO** |
| **Maximum Duration (`max`)** | **1,068.12 ms** | **1,629.22 ms** | +52.53% | **INFO** |
| **Requests / sec (`rate`)** | **0.73 req/s** | **6.82 req/s** | +834.25% (9.3x) | **INFO** |
| **Total Iterations** | **6 complete** | **110 complete** | +1733% (18.3x) | **INFO** |
| **Total HTTP Requests** | **24 requests** | **440 requests** | +1733% (18.3x) | **INFO** |
| **Network Data Received** | **223.6 kB** (6.8 kB/s) | **4,052.1 kB** (62.8 kB/s) | +1712% | **INFO** |
| **Network Data Sent** | **3.7 kB** (113 B/s) | **45.3 kB** (702 B/s) | +1124% | **INFO** |
| **Checks Succeeded** | **24 / 24 (100%)** | **440 / 440 (100%)** | 100% | **PASS** |

---

## Endpoint Performance

| Endpoint | Requests | 2xx | 4xx | 5xx | Avg | p95 | Max | Latency Profile |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `/api/health` | 110 | 110 | 0 | 0 | 402.32 ms | 927.39 ms | 1,058.94 ms | Moderate (Supabase ping) |
| `/api/version` | 110 | 110 | 0 | 0 | 325.02 ms | 393.47 ms | 536.48 ms | Fast & Consistent |
| `/api/config` | 110 | 110 | 0 | 0 | 328.70 ms | 398.78 ms | 478.99 ms | Fast & Consistent |
| `/api/items` | 110 | 110 | 0 | 0 | **675.65 ms** | **1,424.41 ms** | **1,629.22 ms** | **Highest Latency** |

### Latency Bottleneck Analysis
- **Highest Latency Endpoint:** `/api/items`
- `/api/items` exhibits the highest response duration across all percentiles (`avg` 675.65 ms, `p95` 1,424.41 ms, `max` 1,629.22 ms). This behavior is consistent with prior baseline probes due to Supabase database query execution and serialization of inventory dataset.
- Lightweight configuration and version endpoints (`/api/version`, `/api/config`) remain steady below 400 ms at p95 under 10 concurrent VUs.

---

## Errors
- **HTTP 4xx:** 0
- **HTTP 5xx:** 0
- **Timeout Errors:** 0
- **Connection Errors:** 0
- **Failed Checks:** 0

---

## Performance Degradation

### p95 Latency Degradation
- **1 VU Baseline p95:** `972.44 ms`
- **10 VU Test p95:** `1,277.97 ms`
- **Calculation:**
  $$\text{p95 degradation} = \frac{1,277.97 - 972.44}{972.44} \times 100 = \mathbf{+31.42\%}$$

### Throughput Scaling
- **1 VU Baseline rate:** `0.73 req/s`
- **10 VU Test rate:** `6.82 req/s`
- **Calculation:**
  $$\text{Throughput increase} = \frac{6.82 - 0.73}{0.73} \times 100 = \mathbf{+834.25\%} \quad (\approx 9.3\times)$$
- The system effectively scaled throughput by **9.3x** with a modest **+31.42%** increase in p95 latency.

---

## Production Safety & State Integrity
- **State-changing requests:** 0 (Strictly GET)
- **Unexpected mutations:** 0 (Zero database modifications)
- **Production 5xx errors:** 0
- **Post-Test Health Endpoint Verification:**
  - Request: `GET /api/health`
  - HTTP Status: **200 OK**
  - Response Body:
    ```json
    {
      "status": "ok",
      "timestamp": "2026-10-07T12:53:42.645Z",
      "supabaseConnected": true,
      "jwtSecretConfigured": true,
      "version": "2.6.0"
    }
    ```
  - Verified Claims:
    - `supabaseConnected = true`
    - `jwtSecretConfigured = true`
    - No secrets, tokens, or private credentials exposed.

---

## Verdict

### **PASS WITH WARNINGS**

#### Verdict Justification
1. **Pass Criteria Satisfied:**
   - Error rate: **0.00%** (target `< 1%`)
   - p95 latency: **1,277.97 ms** (threshold `< 1500 ms` guardrail passed)
   - Zero unexpected 5xx responses
   - Zero timeouts or socket/connection errors
   - Production serverless runtime and Supabase connection remained healthy throughout and post-test.
2. **Warning Justification (Performance Characteristics, NOT a Security Issue):**
   - System remains fully operational and stable, but overall **p95 exceeded 1,000 ms** (1,277.97 ms) and experienced **+31.42% degradation** relative to the 1 VU baseline.
   - The degradation is heavily concentrated in `/api/items` (p95: 1,424.41 ms, max: 1,629.22 ms).
