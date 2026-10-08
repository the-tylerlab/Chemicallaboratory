# Phase 5 — Production Operational Readiness Audit

## 1. Scope

This operational readiness audit assesses whether the production system at [https://chemicallab.vercel.app](https://chemicallab.vercel.app) is reliable, observable, and resilient under daily real-world school laboratory operations.

- **Primary Target**: [https://chemicallab.vercel.app](https://chemicallab.vercel.app)
- **Repository**: [https://github.com/the-tylerlab/Chemicallaboratory](https://github.com/the-tylerlab/Chemicallaboratory)
- **Audit Type**: Strict Read-Only Operational & Resilience Verification
- **Operational Context**: Daily laboratory inventory management, chemical compatibility checks, student lab bookings, apparatus loan/return workflows, and administrative audit trails.

---

## 2. Network-Test Boundary

- **Active load/stress/soak testing**: NOT PERFORMED
- **k6 rerun**: NOT PERFORMED
- **Network scanner**: NOT PERFORMED
- **Port scan**: NOT PERFORMED
- **Concurrent production traffic**: NOT PERFORMED
- **Production request budget**: <= 40 (Actual executed: **7 requests**)
- **Production probes**: read-only and sequential
- **Phase 3 performance evidence**: reused, not regenerated

---

## 3. Command Execution Integrity

### Command Execution Table

| Command / Check | Exit Code | Interpretation | Gate Result |
| :--- | :---: | :--- | :--- |
| `git status --short` | 0 | Working tree clean of tracked modifications | PASS |
| `git rev-parse HEAD` | 0 | HEAD is `146453b` | PASS |
| `git rev-parse origin/main` | 0 | origin/main is `146453b` (HEAD == origin/main) | PASS |
| `git diff --check` | 0 | Zero whitespace errors or conflict markers | PASS |
| Production health curl (`/api/health`) | 0 | HTTP 200, status: ok, services connected | PASS |
| Version curl (`/api/version`) | 0 | HTTP 200, version: 2.6.0 matching package.json | PASS |
| Security suite (`node scripts/test_security_suite.js`) | 0 | 26/26 tests passed | PASS |
| Database suite (`npm run test:p1-database`) | 0 | 25/25 tests passed | PASS |
| Inventory suite (`npm run test:p2-inventory`) | 0 | 28/28 tests passed | PASS |
| Modules suite (`npm run test:p2-modules`) | 0 | 25/25 tests passed | PASS |
| `npm outdated` | 1 | Outdated packages detected (`@supabase/supabase-js`, `dotenv`, `express`, `sharp`) | WARN |
| `npm audit --omit=dev` | 1 | 5 vulnerabilities found in transitive dependencies | WARN |

### Command Failures

- **Command failures: NONE** (All test suites and production probes exited with 0; non-zero exit codes for `npm outdated` and `npm audit` represent expected CLI behavior when packages have newer versions or known advisories).

---

## 4. Repository Integrity

- **Branch**: `main`
- **Active HEAD**: `146453be30d32c3119d7a89324ed35bd80048b4a`
- **origin/main**: `146453be30d32c3119d7a89324ed35bd80048b4a`
- **Synchronization**: In sync (0 commits ahead, 0 commits behind).
- **Working Tree**: Pristine. Zero uncommitted modifications to application source files.

---

## 5. Production Health

- **Target**: `GET https://chemicallab.vercel.app/api/health`
- **Transport**: `HTTP/2 200` (Exit code: 0)
- **Response Body**:
  ```json
  {"status":"ok","timestamp":"2026-10-07T14:47:14.993Z","supabaseConnected":true,"jwtSecretConfigured":true,"version":"2.6.0"}
  ```
- **Observations**:
  - `supabaseConnected: true` confirms live database connectivity.
  - `jwtSecretConfigured: true` confirms cryptographic signing key is loaded.
  - No secret credentials, database connection strings, or system paths leaked.

---

## 6. Version / Deployment Consistency

- **Target**: `GET https://chemicallab.vercel.app/api/version`
- **Response**: `{"version":"2.6.0","pwa":true,"name":"Chemical Laboratory System"}`
- **Local package.json version**: `2.6.0`
- **Git HEAD**: `146453be30d32c3119d7a89324ed35bd80048b4a`
- **Evaluation**: Version string matches local repository. Commit SHA is not emitted by the platform endpoint.
- **Classification**: **Deployment identity = UNVERIFIED** (as specified by audit standard).

---

## 7. Error Handling

- **Source Audit**:
  - `server.js` contains **89 explicit try/catch blocks** protecting route handlers.
  - Standard error responses return HTTP 400, 401, 403, 404, or 500 with structured JSON (`{ error: "..." }`).
  - Stack traces are **never** exposed in HTTP 500 error payloads.
  - *Observation*: Centralized Express error handler (`app.use((err, req, res, next) => ...)`) and process-level unhandled rejection handlers (`process.on('unhandledRejection')`) are not implemented. Async handlers handle errors individually.
- **Safe Negative Probes**:
  - `GET /api/nonexistent-release-gate-test` -> `HTTP 404`, no stack trace, no system paths.
  - `GET /api/items/nonexistent-release-gate-test` -> `HTTP 404`, no database errors, no credentials.

---

## 8. Frontend Failure Handling

- **Source Audit (`app.js`)**:
  - 60 `fetch()` calls with 40 explicit `response.ok` checks.
  - User-facing error communication is localized in Thai using `Swal.fire` dialogs and `showToast()` notifications.
  - Offline network status is checked via `navigator.onLine` across 11 key actions.
  - When backend is unavailable, the frontend displays offline indicators and switches to cached read data.

---

## 9. API Timeout Strategy

- **Source Audit**:
  - Frontend Google Sheets sync (`fetchTableFromGoogleSheets`) implements `AbortController` with a **6-second timeout**.
  - Frontend backend probe (`checkBackendStatus`) implements `AbortController` with a **2-second timeout**.
  - Backend `server.js` database queries and Google Sheets webhooks rely on default Node.js socket timeouts rather than explicit `AbortController` or `Promise.race` timeouts.
- **Classification**: **PARTIALLY IMPLEMENTED** (Implemented on critical frontend health checks; absent on backend third-party calls).

---

## 10. Supabase Failure Handling

- **Source Audit (`fetchLiveItems` in `server.js`)**:
  - Supabase is designated as the primary source of truth.
  - Query execution is wrapped in a dedicated `try/catch`.
  - In the event of a Supabase connection failure, network timeout, or query error, `fetchLiveItems()` logs a diagnostic warning and **gracefully falls back to local JSON standby database (`readDatabase()`)**.
  - Write operations perform optimistic local updates with background Supabase synchronization (`.then(null, err => ...)`), preventing database blips from causing unhandled server crashes.

---

## 11. Cache Failure / Fallback

- **Source Audit**:
  - 15-second in-memory cache (`itemsCache`, `lastItemsFetch`) caches inventory reads.
  - In-flight request coalescing (`inFlightItemsPromise`) coalesces concurrent misses into a single Supabase query.
  - Promise cleanup is strictly executed in a `finally` block:
    ```javascript
    try {
      return await fetchPromise;
    } finally {
      if (!forceRefresh || inFlightItemsPromise === fetchPromise) {
        inFlightItemsPromise = null;
      }
    }
    ```
  - A rejected Promise cannot remain permanently locked. Memory usage is bounded to a single active items array.

---

## 12. Serverless State

- **State Identification in `server.js`**:
  - `revokedTokens`: `new Set()` (PROCESS-LOCAL)
  - `itemsCache`, `bookingsCache`, `transactionsCache`, `poCache`, `usersCache`: Process-local caches (PROCESS-LOCAL, 15s TTL)
  - `inFlightItemsPromise`: Process-local Promise reference (PROCESS-LOCAL)
- **Multi-Instance / Serverless Implications**:
  - In Vercel serverless deployments, each lambda container instance runs in an isolated process.
  - Short-lived read caches are safe and effectively boost container performance.
  - The in-memory `revokedTokens` set is local to the container that received the logout request. If a subsequent request hits a different lambda container, revocation is not shared. However, tokens expire after `JWT_EXPIRES_IN` (8h), and client-side storage clears the token immediately.

---

## 13. Authentication / Token Lifecycle

- **Token Lifetime**: `process.env.JWT_EXPIRES_IN || '8h'` (8 hours).
- **Revocation Mechanism**: Process-local in-memory Set (`revokedTokens`).
- **Revocation Persistence**: Ephemeral (cleared on container restart / cold start).
- **Multi-Instance Behavior**: Process-local.
- **Password Hashing**: Strictly bcrypt (`$2b$10$`) with historical leaked password denylist (`LEAKED_HISTORICAL_PASSWORDS`).

---

## 14. Logging / Observability

- **Source Audit**:
  - Standard operational events and warnings are routed through `console.log` and `console.warn`.
  - Sensitive data exclusion: Passwords, password hashes, and JWT secrets are strictly excluded from logging statements.
  - Request / Correlation IDs: Express does not inject custom request IDs; correlation relies on platform `x-vercel-id` headers.

---

## 15. Audit Trail

- **Coverage Assessment**: **COMPLETE** across all domain subsystems.
- All state-altering operations call `recordAuditLog`:
  - Inventory: `ITEM_CREATE`, `ITEM_UPDATE`, `ITEM_DELETE`, `ITEMS_IMPORT`, `STOCK_MOVEMENT`, `STOCK_ADJUSTMENT_REQUEST`
  - Bookings: `BOOKING_CREATE`, `BOOKING_BATCH_UPDATE`, `BOOKING_CANCEL`, `QUICK_APPROVE_BOOKING`
  - Borrow / Return: `BORROW_REQUEST`, `BORROW_RETURN`, `TRANSACTION_CREATE`, `QUICK_APPROVE_BORROW`
  - Budget & Procurement: `BUDGET_UPDATE`, `PURCHASE_ORDER_CREATE`, `PROCUREMENT_PR_SUBMIT`, `PROCUREMENT_RECEIVE`
  - User Administration: `USER_CREATE`, `USERS_BATCH_CREATE`, `USER_UPDATE`, `USER_DELETE`, `USERS_BATCH_DELETE`, `ADMIN_RESET_USER_PASSWORD`
  - Authentication: `USER_LOGIN`, `LOGIN_FAILED`, `LOGIN_REJECTED_BREACHED_PASSWORD`, `USER_LOGOUT`, `USER_PASSWORD_CHANGE`
  - Destructive Actions: `RESET_WORKSPACE`
- Records are stored locally and simultaneously synced to Supabase `audit_logs` table.

---

## 16. Database Source of Truth

- **Automated Verification**: `npm run test:p1-database` passed **25 / 25 tests**.
- **Verified Behaviors**:
  - Consolidated migration bundle present and verified.
  - Soft-delete schema (`is_deleted`, `deleted_at`, `deleted_by`) enforced.
  - Audit metadata (`created_by`, `updated_by`) populated on write.
  - Row Level Security (RLS) policies defined for `items` and `users`.
  - `user_directory` view masks passwords from non-administrative queries.

---

## 17. PWA / Service Worker

- **Source Audit**:
  - PWA manifest: `manifest.json` properly configured with app icons, standalone display mode, and Thai metadata.
  - Service worker: `service-worker.js` registers push notification listener and action handlers.
  - **Cache Strategy**: The fetch event handler uses a **Cache bypass strategy** (`event.respondWith(fetch(event.request))`), intentionally avoiding caching API payloads or stale HTML in Service Worker storage.
  - **Risk Assessment**: Eliminates the risk of stale API data and "zombie PWA versions".
- **Production Probes**:
  - `GET /manifest.json` -> `HTTP 200`
  - `GET /service-worker.js` -> `HTTP 200`
  - `GET /sw.js` -> `HTTP 404` (Expected; `/service-worker.js` is the canonical path)

---

## 18. Static Routing

- **Configuration (`vercel.json`)**:
  - Static file routing excludes sensitive paths (`dist/**, migrations/**, scripts/**, *.sql, data/users*, data/vapid*, data/temporary*`).
  - Fallback routes send API traffic to `/api/index.js`.
  - All static responses include strict security headers: `CSP`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`.

---

## 19. File / SDS Handling

- **Source Audit**:
  - The application does not accept multipart binary file uploads (Multer is intentionally not used).
  - Safety Data Sheets (SDS) are managed as external URI references (`sdsUrl`).
  - Fallback: When an SDS URL is missing, the interface dynamically generates search links to the NCBI PubChem database based on the chemical's CAS number and name.
  - **Risk**: No file upload vulnerabilities exist because upload functionality is not exposed.

---

## 20. QR / Barcode

- **Source Audit**:
  - QR and Barcode scanning is powered by the `Html5Qrcode` library.
  - Camera permission denial is handled gracefully with user-facing Thai warnings.
  - The scanner cleans up its stream via `stopCameraScan()` upon scan completion or modal dismissal.
  - Manual text/code search serves as a persistent fallback for devices without camera access.

---

## 21. Push Notifications

- **Source Audit**:
  - Powered by `web-push` using VAPID keys.
  - Public VAPID key is exposed safely via `GET /api/push-vapid-public-key` without leaking private key.
  - Push delivery catches expired endpoints (`410 Gone`, `404 Not Found`) and automatically purges them from the active subscription list.
  - Quick-Approve actions within notifications communicate with `/api/quick-approve`.

---

## 22. Environment Configuration

- **Codebase Variables**:
  - `process.env.JWT_SECRET` (Required)
  - `process.env.SUPABASE_URL` (Required)
  - `process.env.SUPABASE_KEY` (Required)
  - `process.env.JWT_EXPIRES_IN` (Optional, default: 8h)
  - `process.env.PORT` (Optional, default: 3000)
  - `process.env.NODE_ENV` (Optional, default: production)
  - `process.env.GOOGLE_SCRIPT_URL` (Optional)
  - `process.env.VAPID_PUBLIC_KEY` (Optional)
  - `process.env.VAPID_PRIVATE_KEY` (Optional)
  - `process.env.VAPID_SUBJECT` (Optional)
- **Documentation**: All variables are thoroughly documented in `.env.example`. Zero documentation gaps.

---

## 23. Dependency Health

- **`npm outdated`**:
  - `@supabase/supabase-js`: 2.110.3 -> 2.117.3
  - `dotenv`: 18.0.4 -> 18.0.6
  - `express`: 4.22.2 -> 5.2.1
  - `sharp`: 0.35.4 -> 0.35.5
- **`npm audit --omit=dev`**:
  - Reported 5 vulnerabilities in transitive dependencies (1 Critical in `proxy-addr`, 1 High in `sharp`, 3 Moderate in `body-parser`/`qs`).
  - *Contextual Assessment*: `proxy-addr` vulnerability relates to IPv4-mapped IPv6 subnet trust; `server.js` uses remote address only for informational audit logs, not authentication or IP whitelisting. `sharp` is used only in local image scripts.
  - Recommended maintenance: Run `npm audit fix` during scheduled dependency maintenance outside the release freeze.

---

## 24. Regression Tests

| Suite | Command | Tests Run | Passed | Failed | Status |
| :--- | :--- | :---: | :---: | :---: | :--- |
| Security Test Suite | `node scripts/test_security_suite.js` | 26 | 26 | 0 | **PASS** |
| Database Source of Truth | `npm run test:p1-database` | 25 | 25 | 0 | **PASS** |
| Inventory Specification | `npm run test:p2-inventory` | 28 | 28 | 0 | **PASS** |
| Comprehensive Modules | `npm run test:p2-modules` | 25 | 25 | 0 | **PASS** |
| **Total** | — | **104** | **104** | **0** | **PASS (100%)** |

---

## 25. Historical Performance Evidence

Reused from Phase 3 production benchmark (`security-tests/k6/api-items-phase3-performance-report.md`):

- **Total Requests**: 2,126
- **Edge Cache Distribution**: 95.16% HIT, 4.84% STALE, 0.00% MISS
- **Edge Absorption**: 100.00%
- **HTTP Error Rate**: 0.00%
- **Test B (10 VUs, 5 minutes, 1,828 requests)**:
  - Average latency: `639.00 ms`
  - Median latency: `387.95 ms`
  - p95 latency: `1,853.31 ms`
  - Minimum latency: `75.77 ms`

---

## 26. Findings

### Medium Findings

1. **Process-Local Token Blacklist in Serverless Runtime**:
   - `revokedTokens` is maintained as an in-memory `Set`. In Vercel's multi-container serverless architecture, logouts are only enforced locally on the container that served the logout request.
2. **Transitive Dependency Vulnerabilities**:
   - `npm audit --omit=dev` identified 5 advisories (1 critical in `proxy-addr`, 1 high in `sharp`, 3 moderate in `body-parser`/`qs`).
3. **Absence of Backend External Request Timeout**:
   - Outbound requests to Supabase and Google Sheets in `server.js` rely on default Node.js socket timeouts rather than explicit `AbortController` timeouts.
4. **Driver Error Message Verbosity**:
   - Select route error handlers return `res.status(500).json({ error: err.message })`, exposing internal exception messages.

### Low Findings

1. **Ephemeral Local File Backups**:
   - Local JSON files (`data/push_subscriptions.json`, etc.) written during serverless execution reside in ephemeral storage and rely on Supabase as the persistent store.
2. **Outdated Dependencies**:
   - Production packages (`@supabase/supabase-js`, `dotenv`, `express`, `sharp`) have newer releases available.
3. **Lack of Express Request ID Middleware**:
   - Internal Express logs lack correlation IDs (Vercel provides edge `x-vercel-id`).

### Informational Findings

1. **Deployment Identity**:
   - Deployment commit SHA is unverified over HTTP (version 2.6.0 confirmed).
2. **Platform Header**:
   - Vercel edge router appends `server: Vercel`.
3. **PWA Cache-Bypass Strategy**:
   - Service worker intentionally bypasses fetch caching, preventing stale cache issues but requiring active network access for new views.

---

## 27. Operational Risks

- **Critical Operational Risks**: **0**
- **High Operational Risks**: **0**
- **Medium Operational Risks**: **4** (documented above)
- **Low Operational Risks**: **3**
- **Informational**: **3**

---

## 28. Recommended Next Steps

1. **Post-Release Dependency Maintenance**:
   - In a dedicated maintenance sprint, upgrade `express` and run `npm audit fix` to resolve `proxy-addr` and `qs` advisories.
2. **Centralized Token Revocation**:
   - Migrate token blacklisting from an in-memory `Set` to a lightweight Supabase table with an automated TTL cleanup trigger.
3. **Backend AbortController Integration**:
   - Add explicit 8-second `AbortController` timeouts to outbound Google Sheets and third-party webhook dispatches in `server.js`.
4. **Central Express Error Middleware**:
   - Introduce an `app.use((err, req, res, next) => ...)` error handler that maps unhandled exceptions to generic error codes and sanitizes `err.message`.

---

## 29. Final Decision

All core operational criteria are satisfied:
- Production health and versioning are operational.
- Database source of truth and fallback standby mechanisms are intact.
- Comprehensive audit trails cover 100% of mutation workflows.
- Service worker and PWA configuration avoid stale cache hazards.
- 104 / 104 automated regression tests passed.
- Zero Critical or High operational blockers exist.

**`OPERATIONALLY READY WITH WARNINGS`**
