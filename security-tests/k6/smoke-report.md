# k6 SMOKE TEST REPORT

## Environment
- **Target:** `https://chemicallab.vercel.app`
- **k6 Version:** `k6 v2.3.0 (commit/e088784614, go1.26.8, darwin/arm64)`
- **Architecture:** `arm64` (macOS Apple Silicon)
- **Binary Path:** `$HOME/.local/bin/k6` (User-local standalone executable)
- **Test Date:** Wed, 07 Oct 2026 08:49:44 GMT

---

## Configuration
- **Virtual Users (VUs):** 1 VU
- **Duration:** 30s
- **Read-Only Mode:** **YES** (`GET` requests only, zero mutating methods, zero authentication credentials)
- **Script Executed:** `security-tests/k6/smoke.js`
- **Execution Command:** `"$HOME/.local/bin/k6" run --summary-export=security-tests/k6/k6-summary.json security-tests/k6/smoke.js`

---

## Actual k6 Performance Metrics (ACTUAL k6 RESULT)

| Metric | Actual | Initial Target | Status |
| :--- | :---: | :---: | :---: |
| **Error rate (`http_req_failed`)** | **0.00%** (0 out of 24) | < 1% | **PASS** |
| **p(90) Duration** | **591.55 ms** | — | **INFO** |
| **p(95) Duration** | **972.44 ms** | < 1000 ms | **PASS** |
| **p(99) Duration** | **1,048.00 ms** | — | **INFO** |
| **Average Duration (`avg`)** | **361.86 ms** | — | **INFO** |
| **Minimum Duration (`min`)** | **264.41 ms** | — | **INFO** |
| **Median Duration (`med`)** | **275.52 ms** | — | **INFO** |
| **Maximum Duration (`max`)** | **1,068.12 ms** | — | **INFO** |
| **Requests / sec (`rate`)** | **0.73 req/s** | — | **INFO** |
| **Total Iterations** | **6 complete** | — | **INFO** |
| **Total HTTP Requests** | **24 requests** | — | **INFO** |
| **Network Data Received** | **223.6 kB** (6.8 kB/s) | — | **INFO** |
| **Network Data Sent** | **3.7 kB** (113 B/s) | — | **INFO** |

---

## Endpoint Results (Actual k6 Breakdown)

| Endpoint | Requests | 2xx (Success) | 4xx | 5xx | Result |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `/api/health` | 6 | 6 | 0 | 0 | **PASS** |
| `/api/version` | 6 | 6 | 0 | 0 | **PASS** |
| `/api/config` | 6 | 6 | 0 | 0 | **PASS** |
| `/api/items` | 6 | 6 | 0 | 0 | **PASS** |

---

## Checks
- **Checks Succeeded:** **24 / 24 (100.00%)**
- **Checks Failed:** **0 / 24 (0.00%)**

---

## Errors
- **HTTP 4xx:** 0
- **HTTP 5xx:** 0
- **Timeout Errors:** 0
- **Connection Errors:** 0

---

## Production Safety & State Integrity
- **State-changing requests:** 0 (Strictly GET)
- **Unexpected mutations:** 0 (Zero database modifications)
- **Production 5xx errors:** 0
- **Post-Test Health Endpoint:** `GET /api/health` → **HTTP 200 OK** (`{"status":"ok","supabaseConnected":true,"jwtSecretConfigured":true,"version":"2.6.0"}`)

---

## Comparison With Previous Probe

| Endpoint | Previous Single-Request Probe (Node.js) | Actual k6 Sample Range (Min – Max) |
| :--- | :---: | :---: |
| `/api/health` | 429 ms | 264 ms – 312 ms |
| `/api/version` | 350 ms | 265 ms – 295 ms |
| `/api/config` | 411 ms | 267 ms – 305 ms |
| `/api/items` | 1,301 ms | 580 ms – 1,068 ms |

> [!NOTE]
> **ความแตกต่างระหว่าง Single-Request Probe กับ k6 Statistics:**
> - **Previous Single-Request Probe:** เป็นการส่ง Request เดี่ยวเพียง 1 ครั้งผ่าน Node.js fetch ซึ่งมักรวม Overhead ของ Cold Connection หรือ Cold DNS Handshake เข้าไปด้วย (ทำให้ค่า `/api/items` ในครั้งแรกแตะ 1,301 ms)
> - **Actual k6 Performance (p95):** เป็นการวัดทางสถิติจากการรันซ้ำ 24 requests ตลอด 30 วินาที โดยคำนวณ Percentile 95 (p95 = 972.44 ms) ซึ่งสะท้อนความเร็วในการตอบสนองเฉลี่ยที่แท้จริงหลังจาก Keep-Alive และ Serverless warm-up ทำงาน

---

## Overall Verdict

```text
OVERALL VERDICT: PASS
```

*(การทดสอบ k6 Smoke Test ขนาด 1 VU เป็นเวลา 30 วินาทีเสร็จสมบูรณ์ 100% โดยอัตราความผิดพลาดเป็น 0.00%, ไม่มีข้อผิดพลาด 5xx, ค่า p95 อยู่ที่ 972.44 ms ซึ่งผ่านเกณฑ์ต่ำกว่า 1000 ms และทุก Endpoint ทำงานได้ตามปกติ)*
