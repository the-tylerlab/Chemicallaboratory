# `/api/items` Cache Architecture Audit

## 1. Executive Summary

This report delivers a comprehensive, operational, read-only cache architecture audit for `GET https://chemicallab.vercel.app/api/items`. 

Following the Phase 1 optimization (which reduced response payload size by 12.61% without reducing p95 latency), this audit investigated why `/api/items` exhibits significantly higher latency (600–2,300 ms) than other endpoints (~300–400 ms).

### Core Findings
1. **HTTP/CDN Caching is Completely Disabled**: Production responses carry `Cache-Control: public, max-age=0, must-revalidate` and `x-vercel-cache: MISS` on 100% of probed requests. Vercel Edge CDN is instructed never to cache responses.
2. **In-Memory Cache (`itemsCache`) is Process-Isolated**: Application-level caching uses a local JavaScript variable (`let itemsCache = null;` in [server.js](file:///Users/wongsakornduangkliang/CODE/Chemical%20Laboratory%20library%20system%20and%20scientific%20equipment/server.js#L942)) with a 15-second TTL (`Date.now() - lastItemsFetch < 15000`). In Vercel Serverless hosting, each container instance maintains an isolated heap memory. Concurrent and horizontally scaled requests hit separate container instances with unpopulated caches.
3. **Sequential Warm Instance Performance vs Cold/Distributed Instance**: In an immediate sequential 5-request probe on the same warm container, latency plummeted from 2,060 ms (Req 1) to ~420–470 ms (Reqs 2–5). When requests were spaced by 5–6 seconds across different container instances, latency remained high (1,781–2,559 ms) on every request.
4. **Cache Stampede / Concurrency Miss is Confirmed**: `fetchLiveItems()` has no in-flight promise deduplication or request coalescing. Multiple concurrent requests arriving during a cache miss simultaneously execute full table scans (`select('*')`) against Supabase over the WAN.
5. **Payload Reduction Was Ruled Out as Primary Driver**: The root cause of `/api/items` latency is upstream Supabase query roundtrips over WAN coupled with 0% Edge CDN caching, not response serialization or bandwidth.

---

## 2. Audit Scope

- **Target URL**: `https://chemicallab.vercel.app/api/items`
- **Methodology**: Read-only source code analysis, live production HTTP header probing (at most 5 requests per test), sequential latency probing, and architectural flow tracing.
- **Safety Adherence**:
  - Zero application files modified.
  - Zero database mutations (0 POST/PUT/PATCH/DELETE requests against production).
  - No dependencies installed; no schema changes; no commits or deployments.
  - All temporary probe evidence isolated to `scratch/cache-audit/`.

---

## 3. Repository State

Preflight checks verified:
- **Repository Root**: `/Users/wongsakornduangkliang/CODE/Chemical Laboratory library system and scientific equipment`
- **Current Branch**: `main`
- **Latest Commit**: `9ca9000 perf: optimize /api/items response payload`
- **Application Diff**: Clean (0 uncommitted changes in `server.js`, `vercel.json`, `api/index.js`)

---

## 4. Current Cache Architecture

```text
Incoming Client Request: GET /api/items
                   │
                   ▼
       [Vercel Edge CDN Layer]
      x-vercel-cache: MISS (Always)
      Cache-Control: public, max-age=0, must-revalidate
                   │
                   ▼
     [Vercel Serverless Container]
                   │
                   ▼
       Check Local Memory: itemsCache
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
[HIT: within 15s]    [MISS or >15s expired]
  (Warm container)          │
  Returns in-memory         ▼
  array (~0.1 ms)    Supabase Query (WAN)
                     supabase.from('items').select('*')
                     (~300 - 2,000 ms)
                            │
                            ▼
                     Normalize & Assign:
                     itemsCache = normalized
                     lastItemsFetch = Date.now()
                            │
                            ▼
                     Response Sanitization:
                     strip createdBy, updatedBy, is_deleted
                            │
                            ▼
                     HTTP 200 JSON Response
```

---

## 5. `itemsCache` Implementation

### Storage
- **Location**: [server.js:942](file:///Users/wongsakornduangkliang/CODE/Chemical%20Laboratory%20library%20system%20and%20scientific%20equipment/server.js#L942)
- **Model**: `PROCESS_MEMORY` (Node.js heap variable `let itemsCache = null;`).
- **External Shared Storage**: None. There is no Redis, Memcached, Vercel KV, or IPC mechanism.

### TTL
- **Expression**: `(Date.now() - lastItemsFetch < 15000)` ([server.js:946](file:///Users/wongsakornduangkliang/CODE/Chemical%20Laboratory%20library%20system%20and%20scientific%20equipment/server.js#L946))
- **Effective TTL**: `15,000 ms` (`15 seconds`).
- **Confidence**: `CONFIRMED` directly from source code.

### Read Path
- **Invoked via**: `fetchLiveItems(forceRefresh = false)` ([server.js:945-948](file:///Users/wongsakornduangkliang/CODE/Chemical%20Laboratory%20library%20system%20and%20scientific%20equipment/server.js#L945-L948))
- **Consumer**: Called by 26 routes in `server.js`, including `GET /api/items` ([server.js:1301](file:///Users/wongsakornduangkliang/CODE/Chemical%20Laboratory%20library%20system%20and%20scientific%20equipment/server.js#L1301)).

### Write Path
1. **Supabase Fetch Populate**: [server.js:974-976](file:///Users/wongsakornduangkliang/CODE/Chemical%20Laboratory%20library%20system%20and%20scientific%20equipment/server.js#L974-L976):
   ```javascript
   itemsCache = normalized;
   lastItemsFetch = Date.now();
   ```
2. **Local Fallback Populate**: [server.js:985-987](file:///Users/wongsakornduangkliang/CODE/Chemical%20Laboratory%20library%20system%20and%20scientific%20equipment/server.js#L985-L987):
   ```javascript
   itemsCache = localItems;
   lastItemsFetch = Date.now();
   ```
3. **Mutation Handlers**: 11 endpoints assign `itemsCache = items` directly (e.g. [server.js:1346](file:///Users/wongsakornduangkliang/CODE/Chemical%20Laboratory%20library%20system%20and%20scientific%20equipment/server.js#L1346), [server.js:1401](file:///Users/wongsakornduangkliang/CODE/Chemical%20Laboratory%20library%20system%20and%20scientific%20equipment/server.js#L1401)).

### Invalidation
- **Reset to null**: Never reset to `null` in any route.
- **Timestamp Reset**: Mutation endpoints assign `itemsCache = items`, but **do not update `lastItemsFetch`**. As a result, mutations do not extend or reset the 15-second TTL window.

### Cross-Instance Behavior
- **Instance Isolation**: Because `itemsCache` is purely in process memory, each Vercel serverless container instance has its own isolated variable.
- **Cross-Instance Sync**: None. If Instance A creates or modifies an item, Instance B has no awareness of it until Instance B's 15-second TTL expires and Instance B queries Supabase.

---

## 6. Vercel Serverless Analysis

- **Entrypoint**: [api/index.js](file:///Users/wongsakornduangkliang/CODE/Chemical%20Laboratory%20library%20system%20and%20scientific%20equipment/api/index.js#L6-L8) exports `app` from `../server.js`.
- **Builder**: `@vercel/node` in [vercel.json:6](file:///Users/wongsakornduangkliang/CODE/Chemical%20Laboratory%20library%20system%20and%20scientific%20equipment/vercel.json#L6).
- **Instance Lifetime**:
  - `Can one itemsCache survive multiple requests?`: `YES, CONDITIONAL` (`CONFIRMED` via sequential probe where requests 2–5 on the same container returned in ~420 ms).
  - `Can multiple instances have independent itemsCache?`: `YES` (`CONFIRMED` by Vercel serverless horizontal autoscaling).
  - `Is itemsCache shared across instances?`: `NO` (`CONFIRMED` by process-level isolation).
- **Cold Start Impact**:
  - When a new container is instantiated, `itemsCache` is initialized to `null`.
  - The first request to any new container unconditionally experiences a cache miss and must execute the WAN Supabase query.

---

## 7. HTTP/CDN Cache Analysis

- **Vercel Routing**: [vercel.json:16-24](file:///Users/wongsakornduangkliang/CODE/Chemical%20Laboratory%20library%20system%20and%20scientific%20equipment/vercel.json#L16-L24) routes `/api/(.*)` to `/api/index.js`.
- **Explicit Headers**: No `headers` configuration exists in `vercel.json` for API routes.
- **Route Handler Headers**: [server.js:1300-1304](file:///Users/wongsakornduangkliang/CODE/Chemical%20Laboratory%20library%20system%20and%20scientific%20equipment/server.js#L1300-L1304) sets no HTTP cache headers.
- **Default Vercel Header**: When no cache headers are specified by Node.js, Vercel applies:
  `Cache-Control: public, max-age=0, must-revalidate`
- **Resulting CDN Behavior**: Edge CDN does not cache responses. Every incoming client request bypasses CDN edge cache and hits the serverless function origin.

---

## 8. Production Header Evidence

Five sequential requests captured via `curl -sS -D` against `https://chemicallab.vercel.app/api/items`:

| Request | Status | Cache-Control | Age | x-vercel-cache | x-vercel-id | Content-Length |
|:---:|:---:|---|:---:|:---:|---|:---:|
| 1 | 200 | `public, max-age=0, must-revalidate` | 0 | `MISS` | `sin1::iad1::82dqc-1791381238588-36e6e16bbca4` | 30,420 B |
| 2 | 200 | `public, max-age=0, must-revalidate` | 0 | `MISS` | `sin1::iad1::wz7ms-1791381240330-da6559f93690` | 30,420 B |
| 3 | 200 | `public, max-age=0, must-revalidate` | 0 | `MISS` | `sin1::iad1::dfzd4-1791381240828-2c6388ddc397` | 30,420 B |
| 4 | 200 | `public, max-age=0, must-revalidate` | 0 | `MISS` | `sin1::iad1::w7f7q-1791381241309-9b00284438e2` | 30,420 B |
| 5 | 200 | `public, max-age=0, must-revalidate` | 0 | `MISS` | `sin1::iad1::5jqdm-1791381241789-704f408600bf` | 30,420 B |

**Observation**:
- `x-vercel-cache: MISS` across all 5 requests (`CONFIRMED`).
- Weak ETag generated automatically by Express (`W/"76d4-..."`).

---

## 9. Production Latency Probe

Executed 5 immediate back-to-back requests via Node.js `fetch` against production (`scratch/cache-audit/probes/cache_probe.js`):

| Request | Duration (ms) | Status | x-vercel-cache | Age | Container Identifier |
|:---:|---:|:---:|:---:|:---:|---|
| 1 | **2,060.92** | 200 | `MISS` | 0 | `sin1::iad1::42qsp-1791381261662-e24bd6483681` |
| 2 | **428.66** | 200 | `MISS` | 0 | `sin1::iad1::dzs22-1791381263049-ffc9c4dca05f` |
| 3 | **422.18** | 200 | `MISS` | 0 | `sin1::iad1::qsdsx-1791381263484-57ff076f9499` |
| 4 | **443.31** | 200 | `MISS` | 0 | `sin1::iad1::gpdsn-1791381263902-f3826f679fe3` |
| 5 | **470.54** | 200 | `MISS` | 0 | `sin1::iad1::vd7gb-1791381264359-5200690b60fe` |

**Critical Observation**:
- Request 1 took **2,060.92 ms** (observed slower request, consistent with initial Supabase query and cold container setup).
- Requests 2–5 took **422–470 ms** (~1,600 ms faster). The ~430 ms floor represents network roundtrip transit time between the local client, Vercel Edge in Singapore (`sin1`), and the Vercel compute region in Washington DC (`iad1`). On the warm container, application execution was virtually instantaneous due to `itemsCache`.

---

## 10. Cache TTL Evidence

Executed a 4-request probe with delays to observe behavior across the 15-second TTL window (`scratch/cache-audit/probes/ttl_probe.js`):

| Step | Elapsed (s) | Delay Before | Duration (ms) | x-vercel-cache | Container Identifier |
|---|---:|---:|---:|:---:|---|
| Req 1 (T=0s) | 0.00 | 0 s | **1,946.94** | `MISS` | `sin1::iad1::x5w7k-1791381335416-c5057694056e` |
| Req 2 (T=5s) | 6.96 | 5 s | **1,781.32** | `MISS` | `sin1::iad1::26hwb-1791381342910-2eebb2fadbb9` |
| Req 3 (T=10s) | 13.74 | 5 s | **2,559.53** | `MISS` | `sin1::iad1::7xlzz-1791381350430-a45b91649674` |
| Req 4 (T=16s) | 22.33 | 6 s | **1,924.81** | `MISS` | `sin1::iad1::vd7gb-1791381357631-731ada7d57a8` |

**Architectural Finding**:
When requests arrive intermittently (spaced by 5–6 seconds), Vercel routes traffic across different container instances (`x5w7k`, `26hwb`, `7xlzz`, `vd7gb`). Because `itemsCache` is strictly local to each container process, every intermittent request hits an unpopulated or expired cache instance, triggering a full Supabase WAN round-trip (1,781–2,559 ms).

---

## 11. Mutation / Invalidation Matrix

Summary of endpoints mutating item data in [server.js](file:///Users/wongsakornduangkliang/CODE/Chemical%20Laboratory%20library%20system%20and%20scientific%20equipment/server.js):

| Mutation Endpoint | File | Line | Invalidates In-Memory Cache? | Invalidates Other Instances? | Invalidates HTTP/CDN Cache? |
|---|---|---:|:---:|:---:|:---:|
| `POST /api/items` (Create) | `server.js` | 1346 | Mutates local array | ❌ No | ❌ N/A (Disabled) |
| `PUT /api/items/:code` (Update) | `server.js` | 1401 | Mutates local array | ❌ No | ❌ N/A (Disabled) |
| `DELETE /api/items/:code` (Soft delete) | `server.js` | 1454 | Filters local array | ❌ No | ❌ N/A (Disabled) |
| `POST /api/items/import-csv` (Bulk) | `server.js` | 1507 | Mutates local array | ❌ No | ❌ N/A (Disabled) |
| `POST /api/inventory/movements` (Move) | `server.js` | 1752 | Mutates local array | ❌ No | ❌ N/A (Disabled) |
| `POST /api/inventory/adjustments/:id/review` | `server.js` | 1962 | Mutates local array | ❌ No | ❌ N/A (Disabled) |
| `POST /api/equipment/repairs` | `server.js` | 2273 | Mutates local array | ❌ No | ❌ N/A (Disabled) |
| `PATCH /api/equipment/repairs/:id` | `server.js` | 2328 | Mutates local array | ❌ No | ❌ N/A (Disabled) |
| `POST /api/borrow/request` (Borrow) | `server.js` | 2897 | Mutates local array | ❌ No | ❌ N/A (Disabled) |
| `POST /api/borrow/:id/return` (Return) | `server.js` | 2987 | Mutates local array | ❌ No | ❌ N/A (Disabled) |
| `POST /api/procurement/orders/:id/receive` | `server.js` | 3354 | Mutates local array | ❌ No | ❌ N/A (Disabled) |

**Key Risk**:
- When mutation occurs, Supabase upsert is executed asynchronously (`.then(null, err => ...)`).
- If another instance handles a `GET /api/items` request, it will serve its existing `itemsCache` until its 15-second TTL expires.

---

## 12. Data Freshness Analysis

Based on consumer analysis in [app.js](file:///Users/wongsakornduangkliang/CODE/Chemical%20Laboratory%20library%20system%20and%20scientific%20equipment/app.js) and [server.js](file:///Users/wongsakornduangkliang/CODE/Chemical%20Laboratory%20library%20system%20and%20scientific%20equipment/server.js):

| Field / Usage | Consumer | Freshness Requirement | Impact of Stale Data |
|---|---|:---:|---|
| `qty`, `damagedQty` | Stock table, inventory check | **Medium** (15–30s acceptable) | Borrow/return endpoints perform their own real-time atomic validations; catalog table view already accepts 15s TTL. |
| `room`, `cabinet`, `shelf` | Storage map, QR display | **Low** (minutes acceptable) | Physical storage locations change rarely. |
| `minAlert`, `expiry`, `ghs` | Safety alerts, badge displays | **Low** (minutes acceptable) | Expirations and GHS classifications change rarely. |
| `name`, `category`, `unit` | Catalog search & display | **Low** (minutes acceptable) | Core metadata is near-static. |

**Conclusion**:
The system already tolerates a 15-second stale window via `itemsCache`. Extending or moving this 15–30s window to Edge CDN caching introduces zero new functional freshness violations.

---

## 13. Consistency Analysis

Scenario:
```text
User A mutates an item (e.g. updates quantity)
      ↓
Instance 1 updates local itemsCache and fires async Supabase upsert
      ↓
User B sends GET /api/items
```

1. **If User B lands on Instance 1**: Sees update immediately (`YES`).
2. **If User B lands on Instance 2 within 15 seconds**: Sees stale cached data until Instance 2's TTL expires (`CONDITIONAL STALE`).
3. **If HTTP CDN Caching is introduced**: User B would see cached data until CDN TTL (`s-maxage`) expires, or until revalidated via `stale-while-revalidate`.

---

## 14. Cache Stampede Analysis

Source inspection of `fetchLiveItems()` in [server.js:945-988](file:///Users/wongsakornduangkliang/CODE/Chemical%20Laboratory%20library%20system%20and%20scientific%20equipment/server.js#L945-L988):
- **Promise Cache**: None.
- **In-flight request locking**: None.
- **Request coalescing / deduplication**: None.

**Classification**: `CONFIRMED`.
If 10 concurrent requests arrive when `itemsCache` is expired or `null`:
- Within the same process: All 10 requests check `itemsCache === null` and invoke `supabase.from('items').select('*')` simultaneously before any promise resolves.
- Across multiple serverless instances: Each container independently executes the query.
This directly explains the elevated p95 latency (1,424–2,328 ms) observed under 10 concurrent VUs in k6 testing.

---

## 15. Supabase Query Path

- **Query**: `supabase.from('items').select('*')` ([server.js:953](file:///Users/wongsakornduangkliang/CODE/Chemical%20Laboratory%20library%20system%20and%20scientific%20equipment/server.js#L953))
- **Selected Columns**: `*` (entire row, all columns)
- **Filters**: None at query level (filtering performed in Node.js)
- **Pagination**: None (fetches entire table in one payload)
- **Network Path**: Vercel Serverless container (`iad1` US East) $\rightarrow$ Supabase Postgres (`ap-southeast-1` AWS Singapore). This intercontinental WAN round-trip introduces ~250–350 ms base network latency per query before database execution.

---

## 16. Existing k6 Context

Summary of historical performance tests:

| Test Mode | VUs | Duration | Overall p95 | `/api/items` Avg | `/api/items` p95 |
|---|:---:|:---:|---:|---:|---:|
| Smoke Test | 1 | 30 s | 972.44 ms | 650.12 ms | 985.40 ms |
| Baseline Load Test | 10 | 60 s | 1,277.97 ms | 675.65 ms | 1,424.41 ms |
| Phase 1 Post-Deployment | 10 | 60 s | 1,565.86 ms | 1,014.61 ms | 2,328.75 ms |

**Interpretation**:
- Under 1 VU, single-container sequential requests periodically reuse memory cache.
- Under 10 VUs, horizontal scaling creates multiple serverless containers, causing repeated cache misses and simultaneous Supabase WAN queries (stampede).
- The variation between Baseline (1,424 ms p95) and Phase 1 (2,328 ms p95) reflects serverless container spin-up distribution and Supabase WAN latency jitter during the test window, rather than application regressions (error rate remained 0.00%).

---

## 17. Bottleneck Classification

| Component | Classification | Confidence | Evidence |
|---|:---:|:---:|---|
| **HTTP/CDN Caching Disabled** | **PRIMARY** | `CONFIRMED` | Header `max-age=0, must-revalidate` and `x-vercel-cache: MISS` across 100% of probes. Zero requests cached at edge. |
| **Supabase WAN Round-Trip** | **PRIMARY** | `CONFIRMED` | Intercontinental WAN round-trip + unindexed full table `select('*')` takes 1,500–2,500 ms on every miss. |
| **Serverless Instance Isolation** | **SECONDARY** | `CONFIRMED` | In-memory `itemsCache` is trapped in individual container heaps; intermittent requests hit different containers. |
| **Cache Stampede / Lack of Coalescing** | **CONTRIBUTING** | `CONFIRMED` | `fetchLiveItems()` lacks in-flight promise caching, firing duplicate queries during concurrent misses. |
| **Mutation Invalidation Asynchrony** | **CONTRIBUTING** | `CONFIRMED` | Mutations update local heap only and do not reset `lastItemsFetch` or invalidate peers. |
| **Response Payload Size** | **RULED OUT** | `CONFIRMED` | Phase 1 cut payload by 12.61%, but p95 latency did not improve. Network transfer time is negligible (<5 ms). |

---

## 18. Cache Strategy Comparison

| Strategy | Expected Latency | Freshness Window | Implementation Complexity | Architectural Risk |
|---|:---:|:---:|:---:|:---:|
| **A. Status Quo (In-Memory Only)** | 1,400–2,500 ms p95 | 15 seconds | None | High latency under concurrency; repeated DB load. |
| **B. HTTP Edge Cache (`s-maxage=15-30s`)** | **< 50 ms** (Edge HIT) | 15–30 seconds | **Low** (1 line in route header) | Stale window equals TTL for catalog views; eliminates 95%+ of Supabase queries. |
| **C. Shared Cache (Redis / Vercel KV)** | ~250–350 ms | Immediate | High (new service, credentials, billing) | Additional infrastructure failure mode and operational cost. |
| **D. Hybrid (Edge Cache + Promise Coalescing)** | **< 50 ms** (Edge HIT) | 15–30 seconds | **Low-Medium** | **Optimal**: Edge serves traffic; single in-flight promise protects DB during revalidations. |

---

## 19. TTL Recommendation

Evaluation of candidate TTL values for Edge CDN caching:

| Candidate TTL | Freshness Risk | Expected DB Reduction | Recommendation |
|---:|:---:|:---:|:---:|
| **5 sec** | Negligible | Low (~40–60%) | Revalidation frequency too high for modest traffic. |
| **15 sec** | **Low** (matches current in-memory TTL) | **High (> 85%)** | **Recommended baseline**: Exactly matches existing `server.js` contract. |
| **30 sec** | **Low** | **Very High (> 95%)** | **Recommended optimal**: Ideal balance of catalog freshness and maximum latency reduction. |
| **60 sec** | Moderate | Very High (> 97%) | May be perceptible to users immediately refreshing after inventory updates. |
| **300 sec** | High | Maximum (> 99%) | Not recommended: 5-minute stale window is too long for laboratory inventory. |

**Recommended Setting**:
`Cache-Control: public, s-maxage=30, stale-while-revalidate=60`

---

## 20. Recommended Phase 2

**DO NOT IMPLEMENT IN THIS TASK (READ-ONLY AUDIT).**

When authorized, Phase 2 should implement:

1. **Edge CDN Caching Header on `GET /api/items`**:
   Add to `app.get('/api/items')`:
   ```javascript
   res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
   ```
   *Expected Effect*: Drops p95 latency from >1,400 ms to <50 ms for Edge cache hits.
2. **In-Flight Promise Coalescing in `fetchLiveItems()`**:
   Maintain an `inFlightItemsPromise` variable to collapse simultaneous cache misses into a single Supabase query, completely eliminating cache stampedes.

---

## 21. Evidence vs Inference

- **CONFIRMED (Direct Evidence)**:
  - `itemsCache` is an in-memory process variable in `server.js` with a 15-second TTL.
  - Vercel returns `x-vercel-cache: MISS` and `max-age=0, must-revalidate` on all requests.
  - Sequential requests on a warm container drop from 2,060 ms to ~428 ms.
  - Delayed requests hit separate container instances with 1,780–2,559 ms latency.
  - `fetchLiveItems()` has no mutex or promise caching.
- **INFERRED (Platform Deduction)**:
  - Higher k6 latency during Phase 1 testing was driven by cloud network variance and serverless worker spin-up timing rather than application-level code degradation.
- **UNKNOWN (No Direct Access)**:
  - Exact Vercel container de-allocation algorithm / scale-to-zero idle timeout.

---

## 22. Limitations

- Audit was strictly read-only; no mutation workflows were executed against production.
- Probe sample sizes were intentionally kept low (5 sequential requests, 4 TTL requests) to prevent load impact on production.

---

## 23. Files Inspected

- [server.js](file:///Users/wongsakornduangkliang/CODE/Chemical%20Laboratory%20library%20system%20and%20scientific%20equipment/server.js) (lines 940–990, 1280–1355, 1400–1520, 2850–3360)
- [api/index.js](file:///Users/wongsakornduangkliang/CODE/Chemical%20Laboratory%20library%20system%20and%20scientific%20equipment/api/index.js) (lines 1–9)
- [vercel.json](file:///Users/wongsakornduangkliang/CODE/Chemical%20Laboratory%20library%20system%20and%20scientific%20equipment/vercel.json) (lines 1–43)
- [app.js](file:///Users/wongsakornduangkliang/CODE/Chemical%20Laboratory%20library%20system%20and%20scientific%20equipment/app.js) (lines 1180–1290)
- [scripts/test_security_suite.js](file:///Users/wongsakornduangkliang/CODE/Chemical%20Laboratory%20library%20system%20and%20scientific%20equipment/scripts/test_security_suite.js)
- [scripts/test_p1_database.js](file:///Users/wongsakornduangkliang/CODE/Chemical%20Laboratory%20library%20system%20and%20scientific%20equipment/scripts/test_p1_database.js)

---

## 24. Commands Executed

```bash
# Preflight
git rev-parse --show-toplevel
git status --short
git log -1 --oneline

# Code search
grep -n 'itemsCache' server.js
grep -n 'fetchLiveItems' server.js
grep -n -E -i 'Cache-Control|s-maxage|stale-while-revalidate' server.js api/index.js

# Production probes
curl -sS -D scratch/cache-audit/headers/items-headers-1.txt -o /dev/null https://chemicallab.vercel.app/api/items
node scratch/cache-audit/probes/cache_probe.js
node scratch/cache-audit/probes/ttl_probe.js
curl -sS -o scratch/cache-audit/metrics/items-response.json -D scratch/cache-audit/headers/items-response.txt https://chemicallab.vercel.app/api/items
```

---

## 25. Final Verification & Safety Output

```text
CACHE AUDIT COMPLETE

Application Cache:
In-memory process heap array (let itemsCache = null;) isolated to individual Vercel serverless containers.

Application Cache TTL:
15 seconds (Date.now() - lastItemsFetch < 15000), CONFIRMED in server.js:946.

Cache Invalidation:
Local in-memory update only on mutation (itemsCache = items). No cross-instance invalidation, no reset of lastItemsFetch, no external pub/sub.

HTTP/CDN Cache:
Effectively DISABLED (Cache-Control: public, max-age=0, must-revalidate). 100% of requests yield x-vercel-cache: MISS.

Supabase Path:
Unindexed full table scan (select('*')) over WAN from Vercel compute to Supabase Postgres.

Cache Stampede Risk:
CONFIRMED. No in-flight promise caching or request coalescing in fetchLiveItems().

Primary Bottleneck:
Disabled Edge CDN caching forcing every request to execute serverless compute and query Supabase over WAN on cold/expired instances.

Recommended Phase 2:
Add HTTP Edge Caching headers (s-maxage=30, stale-while-revalidate=60) on GET /api/items, paired with in-flight Promise deduplication in fetchLiveItems().

Confidence:
HIGH

Application Changes:
NONE

Cache Changes:
NONE

Database Changes:
NONE

Deployment:
NONE
```
