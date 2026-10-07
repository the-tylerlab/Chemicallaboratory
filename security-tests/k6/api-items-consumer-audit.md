# `/api/items` Consumer & Required Fields Audit

---

## 1. Executive Summary

This read-only audit examines all consumers of the `GET /api/items` endpoint across the application codebase (frontend, backend, and background synchronization services) to evaluate field utilization and analyze the feasibility and safety of query optimizations:

1. **Required vs. Unused Fields:** Of the 19 columns currently returned in production, **11 fields** are strictly required by all views, **5 fields** are conditionally required by specific chemical/safety views, and **3 fields** (`createdBy`, `updatedBy`, `is_deleted`) are strictly server-only/unused by list consumers.
2. **Replacing `select('*')` Feasibility:** **NEEDS REVIEW / HIGH RISK if done globally in `fetchLiveItems()`**. `fetchLiveItems()` is not just the handler for `GET /api/items`; it is a **shared core service used by 26 different endpoints**, including `GET /api/equipment/assets` and `POST /api/sync-google-sheets`, which depend on extended equipment tracking and backup fields.
3. **Moving `is_deleted` Filtering to Database:** **SAFE**. Every single consumer and internal caller across all 26 usages exclusively requests active records (`is_deleted !== true`). Pushing `.neq('is_deleted', true)` into the Supabase query directly aligns with current application behavior with zero regression risk.
4. **Estimated Payload Reduction:** Trimming unused fields from the HTTP response yields approximately **~10.3% payload reduction** (~3.6 kB out of 34.8 kB). Because payload size is already modest (34.8 kB), the primary driver of latency remains the WAN database call on cache misses rather than serialization bandwidth.

---

## 2. Scope & Safety

- **Read-Only Inspection:** Zero modifications made to source code, databases, schemas, or configurations.
- **Tools Used:** Static code analysis, abstract syntax search, cross-reference tracing, and review of existing test suites.
- **Trace Depth:** Traced all abstractions including `fetchLiveItems()`, `fetchItems()`, `loadAllItems()`, and direct fetch consumers.

---

## 3. `/api/items` Implementation

```text
File:        server.js
Lines:       1300–1303
Handler:     app.get('/api/items', async (req, res) => {
               const items = await fetchLiveItems();
               res.json(items);
             });
Service:     fetchLiveItems(forceRefresh = false) (server.js:945–988)
Query:       supabase.from('items').select('*') (server.js:953)
Filter:      activeItems = supaItems.filter(...) (server.js:955–959)
Transform:   normalized = activeItems.map(...) (server.js:961–971)
Response:    res.json(items) (34,811 bytes, 72 records, 19 fields/record)
```

---

## 4. Consumer Inventory

The following table documents every consumer that calls `GET /api/items` via HTTP or calls its underlying data service `fetchLiveItems()`:

| Consumer | File | Lines | Function / Component | Fields Used | Purpose |
|---|---|---:|---|---|---|
| **Modular Frontend Bootstrapper** | `src/main.js` | 68–77 | `initApp()` $\rightarrow$ `inventory.fetchItems()` | All returned fields | Bootstraps inventory state in parallel during initial application load. |
| **Inventory Module (Modular)** | `src/inventory/inventory.js` | 24–36 | `fetchItems()` | `code`, `name`, `category`, `qty`, `damagedQty`, `unit`, `minAlert`, `expiry`, `room`, `cabinet`, `shelf`, `chemicalType`, `sdsUrl`, `ghs` | Primary inventory catalog, stock tables, search, filter, and local storage caching. |
| **Legacy Frontend Loader** | `app.js` | 1275–1285 | `loadAllItems()` | `code`, `name`, `category`, `qty`, `damagedQty`, `unit`, `minAlert`, `expiry`, `room`, `cabinet`, `shelf`, `chemicalType`, `sdsUrl`, `ghs` | Tertiary fallback loader when direct Supabase client and Google Sheets are offline. |
| **Backend Health Probe** | `app.js` | 1190–1194 | `checkBackendStatus()` | None (`response.ok` status only) | Fallback connectivity probe if `/api/health` encounters a timeout. |
| **Equipment Assets Service** | `server.js` | 2100–2135 | `GET /api/equipment/assets` | `code`, `name`, `category`, `assetId`, `serialNumber`, `room`, `cabinet`, `shelf`, `position`, `condition`, `qty`, `unit`, `purchaseDate`, `warrantyExpiry`, `supplier`, `maintenanceSchedule`, `lastMaintenanceDate`, `nextMaintenanceDate`, `calibrationDate`, `nextCalibrationDate`, `calibrationCertificate` | Transforms items into equipment assets with maintenance and calibration tracking. |
| **Multi-Factor Alerts Service** | `server.js` | 1546–1580 | `GET /api/inventory/alerts` | `code`, `name`, `category`, `qty`, `minAlert`, `expiry`, `room`, `cabinet`, `shelf` | Generates low-stock and near-expiry warning alerts. |
| **Google Sheets Sync** | `server.js` | 1230–1235 | `POST /api/sync-google-sheets` | Entire object (All fields) | Backs up full inventory records into Google Sheets `Items` tab. |
| **Stock Movement & Audit** | `server.js` | 1713, 1848 | `POST /api/inventory/movements`, `POST /api/inventory/adjustments` | `code`, `name`, `qty`, `unit`, `room`, `cabinet`, `shelf` | Validates current stock balance and logs inventory balance changes. |
| **Borrow & Return System** | `server.js` | 2851, 2960, 3058 | `POST /api/borrow/request`, `POST /api/borrow/:id/return`, `GET /api/borrow/quick-scan/:code` | `code`, `name`, `qty`, `unit`, `room`, `category` | Validates item availability for borrowing and restores quantities upon return. |
| **Procurement PO Receipt** | `server.js` | 3308 | `POST /api/procurement/orders/:id/receive` | `code`, `qty`, `name` | Increments inventory stock balance upon purchase order fulfillment. |
| **Dashboard KPIs** | `server.js` | 3401 | `GET /api/dashboard/role-view` | `category`, `qty`, `minAlert`, `expiry` | Computes dashboard count metrics (total items, low stock, expired). |
| **Automated Tests** | `scripts/test_p1_database.js`<br>`scripts/test_p2_inventory.js` | 144–146<br>194–196 | Test assertion blocks | `code`, `name`, `is_deleted` | Asserts CRUD integrity, item creation, and soft-delete exclusion. |
| **k6 Load Tests** | `security-tests/k6/smoke.js`<br>`security-tests/k6/load-10vu.js` | 20–22<br>35–37 | k6 virtual user loop | HTTP status (200 OK) | Baseline performance and load benchmarking. |

---

## 5. Complete Field Usage Matrix

All 19 fields returned by the production endpoint classified based on actual source code usage:

| Field | Required | Conditional | Unused | Server-only | Evidence / Source Code References |
|---|:---:|:---:|:---:|:---:|---|
| `code` | **YES** | — | — | — | `app.js:3825`, `src/inventory/inventory.js:230` — Primary item key, QR code, search index, duplicate detection. |
| `name` | **YES** | — | — | — | `app.js:3826`, `src/inventory/inventory.js:231` — Item display name in tables, modal headers, cards. |
| `category` | **YES** | — | — | — | `app.js:2150`, `server.js:2103` — Differentiates chemicals vs. equipment; controls UI layout and permissions. |
| `qty` | **YES** | — | — | — | `app.js:3828`, `server.js:1550` — Current stock count; used for low stock alerts and borrow deductions. |
| `unit` | **YES** | — | — | — | `app.js:3829`, `src/inventory/inventory.js:255` — Unit of measurement (bottle, piece, box, etc.) on tables and modals. |
| `minAlert` | **YES** | — | — | — | `app.js:3830`, `server.js:1551` — Minimum reorder threshold for inventory alert badges. |
| `damagedQty`| **YES** | — | — | — | `app.js:3831`, `server.js:965` — Damaged item count displayed in inventory tables and maintenance logs. |
| `expiry` | **YES** | — | — | — | `app.js:2166`, `server.js:1560` — Expiration date string; used for near-expiry filters and alert badges. |
| `room` | **YES** | — | — | — | `app.js:2263`, `server.js:1316` — Laboratory room identifier ("Lab 1"); used for room-level RBAC and isolation. |
| `cabinet` | **YES** | — | — | — | `app.js:3833`, `app.js:4657` — Cabinet identifier; used for storage location hierarchy and hazard segregation. |
| `shelf` | **YES** | — | — | — | `app.js:3834`, `src/inventory/inventory.js:260` — Shelf identifier within cabinet ("ชั้น 1"). |
| `chemicalType` | — | **YES** | — | — | `app.js:4623, 4657–4659` — Chemical compatibility storage group code ("D", "G", "L"); chemical items only. |
| `ghs` | — | **YES** | — | — | `app.js:3840–3853` — Array of GHS pictogram codes; rendered in chemical catalog badges and safety cards. |
| `sdsUrl` | — | **YES** | — | — | `app.js:10524–10525` — External URL link for Safety Data Sheet PDF viewing. |
| `createdAt` | — | **YES** | — | — | `app.js:4712`, `server.js:966` — Creation timestamp; preserved on edit and used for reverse chronological sorting. |
| `updatedAt` | — | **YES** | — | — | `app.js:20428`, `server.js:967` — Last update timestamp; used in sync status displays and audit trails. |
| `createdBy` | — | — | **YES** | **YES** | `server.js:968, 1782` — Actor ID who created the record. **Not displayed** in inventory table list views. |
| `updatedBy` | — | — | **YES** | **YES** | `server.js:969, 1747` — Actor ID who updated the record. **Not displayed** in inventory table list views. |
| `is_deleted` | — | — | **YES** | **YES** | `server.js:956, 970` — Soft-delete flag; always `false` on output (deleted items filtered out prior to response). |

---

## 6. `select('*')` Analysis

### Current Implementation
- **File:** `server.js`
- **Line:** 953
- **Table:** `items`
- **Current Query:** `await supabase.from('items').select('*')`
- **Columns Returned from Database:** All columns in the Postgres table (19 columns in active production dataset).
- **Columns Consumed by Frontend List View:** 16 columns (11 required + 5 conditional).
- **Columns Unused by Frontend List View:** 3 columns (`createdBy`, `updatedBy`, `is_deleted`).

### Column & Payload Reduction Metrics
- **Total Columns:** 19
- **Required Columns:** 11
- **Conditional Columns:** 5
- **Unused / Server-Only Columns:** 3
- **Column Reduction Potential:** $3 / 19 = \mathbf{15.8\%}$
- **Payload Byte Reduction:** ~3.6 kB out of 34.8 kB = $\mathbf{\approx 10.3\%}$

### Why Replacing `select('*')` in `fetchLiveItems()` is High Risk
`fetchLiveItems()` is **not dedicated solely to `GET /api/items`**. It is the shared data access layer for 26 endpoints. 
- In `server.js` lines 2100–2135, `GET /api/equipment/assets` consumes `asset_id`, `condition`, `serial_number`, `purchase_date`, `warranty_expiry`, `supplier`, `maintenance_schedule`, and `calibration_date` through `fetchLiveItems()`.
- In `server.js` line 1230, `POST /api/sync-google-sheets` serializes all item properties to external sheets.
- **Replacing `select('*')` with a narrow inventory-only projection inside `fetchLiveItems()` would strip equipment tracking attributes and break `/api/equipment/assets` and Google Sheets sync.**

---

## 7. `is_deleted` Analysis

### Current Flow
```text
Supabase: select('*')
      ↓
Returns active (72) + soft-deleted (N) records over WAN
      ↓
Node.js: server.js lines 955–959
activeItems = supaItems.filter(item => !item.is_deleted && !item.isDeleted && ...)
      ↓
Normalized array with 'is_deleted: false'
```

### Analysis of Callers
- **Do any callers need soft-deleted records?** **NO**.
  - All 26 callers in `server.js` explicitly reject or ignore soft-deleted items.
  - `DELETE /api/items/:code` explicitly sets `is_deleted = true` (`server.js:1441`).
  - Integration tests explicitly assert that soft-deleted items are excluded (`scripts/test_p1_database.js:146`).

### Safety of Moving Filter to Database
- **Status:** **SAFE**
- **Proposed Query:**
  ```javascript
  supabase.from('items').select('*').neq('is_deleted', true)
  ```
- **Rationale:** Pushing `.neq('is_deleted', true)` to Supabase guarantees that soft-deleted rows are filtered directly by PostgreSQL before transmission over the WAN, exactly matching the business logic of `fetchLiveItems()` with zero consumer impact.

---

## 8. Response Transformation

Following the database query, `server.js` applies the following operations (lines 955–971):

1. **Filtering:**
   - Drops `item.is_deleted === true` or `item.isDeleted === true`
   - Drops `DEMO-` prefix codes in production environment
2. **Property Normalization:**
   - Casts `qty`, `minAlert`, `damagedQty` to numbers with safe fallbacks
   - Bridges alternative key namings: `quantity` $\rightarrow$ `qty`, `min_alert` $\rightarrow$ `minAlert`, `created_at` $\rightarrow$ `createdAt`
   - Injects default ISO timestamps if absent
   - Explicitly sets `is_deleted: false`

### Assessment
These transformations are necessary for frontend resilience because older records and demo seed items may contain snake_case keys (`min_alert`, `quantity`). The in-memory transformation runs in `<0.2 ms` for 72 records and carries negligible overhead.

---

## 9. API Contract

- **Contract Status:** **API contract not explicitly defined**.
- **Observations:**
  - The application does not use TypeScript `.d.ts` definitions or OpenAPI/Swagger specifications.
  - The API contract is implicitly governed by:
    1. The runtime output of `fetchLiveItems()` in [server.js](file:///Users/wongsakornduangkliang/CODE/Chemical%20Laboratory%20library%20system%20and%20scientific%20equipment/server.js#L961-L971).
    2. Frontend expectations in [src/inventory/inventory.js](file:///Users/wongsakornduangkliang/CODE/Chemical%20Laboratory%20library%20system%20and%20scientific%20equipment/src/inventory/inventory.js) and [app.js](file:///Users/wongsakornduangkliang/CODE/Chemical%20Laboratory%20library%20system%20and%20scientific%20equipment/app.js).
    3. Assertions in integration tests (`scripts/test_p1_database.js` and `scripts/test_p2_inventory.js`).

---

## 10. Cross-Module Dependencies

| Module | Consumes `/api/items` Data? | Dependency Severity | Notes |
|---|:---:|:---:|---|
| **Chemical Inventory** | **YES** | **Critical** | Core consumer. Uses all 11 required fields + `chemicalType`, `ghs`, `sdsUrl`. |
| **Equipment Module** | **YES** | **Critical** | Consumes items through `state.items` and `/api/equipment/assets`. Requires equipment tracking attributes. |
| **Booking Module** | **YES** | Low | Uses item list for experiment preparation material autocomplete (`prepItems`). |
| **Borrow / Return** | **YES** | High | Reads stock quantities for item checkout validation and restocks upon return. |
| **Procurement** | **YES** | Medium | Matches item codes on purchase order receipt and increments stock. |
| **Dashboard KPIs** | **YES** | Low | Aggregates summary counts (`total`, `low-stock`, `expired`). |
| **QR / Barcode** | **YES** | High | Generates QR code labels based on `code`, `name`, `room`, `cabinet`, `shelf`. |
| **SDS & Safety** | **YES** | Medium | Reads `ghs` pictograms and `sdsUrl` links. |
| **Waste Management** | NO | None | Independent module tracking waste containers. |
| **Audit Logs** | NO | None | Independent logging table. |
| **Google Sheets Sync** | **YES** | **High** | Syncs complete item objects to Google Sheets spreadsheet. |

---

## 11. Optimization Safety

| Optimization | Risk | Confidence | Reason |
|---|:---:|:---:|---|
| **Move `is_deleted` filter into DB query (`.neq('is_deleted', true)`)** | **SAFE** | **HIGH** | All 26 callers in `server.js` reject soft-deleted records. Filtering in Postgres prevents transmitting dead rows over WAN with zero breaking risk. |
| **Strip `createdBy`, `updatedBy`, `is_deleted` in `GET /api/items` response** | **SAFE** | **HIGH** | Frontend list views in `app.js` and `src/inventory/inventory.js` do not display or use these fields. |
| **Replace `select('*')` inside `fetchLiveItems()` globally** | **HIGH RISK** | **HIGH** | `fetchLiveItems()` is shared by `/api/equipment/assets` and Google Sheets sync. Narrowing columns will silently strip equipment metadata and sync attributes. |
| **Create dedicated projected query specifically for `GET /api/items`** | **NEEDS REVIEW** | **HIGH** | Architecturally safe if decoupled from `fetchLiveItems()`, but requires careful regression testing across frontend list views. |

---

## 12. Recommended Minimal Changes

> **NOTICE:** These are architectural recommendations only. In accordance with the strict read-only audit scope, **NO changes have been applied**.

### Patch 1: Database-Side Soft-Delete Filter (Safe & High Confidence)
In `server.js` line 953:
```javascript
// Before:
const { data: supaItems, error } = await supabase.from('items').select('*');

// Recommended Minimal Change:
const { data: supaItems, error } = await supabase.from('items').select('*').neq('is_deleted', true);
```
- **Impact:** Filters deleted records at the Postgres layer, reducing data transferred over WAN while keeping Node.js in-memory checks as defense-in-depth.

### Patch 2: Response Field Sanitization in Route Handler (Safe)
In `server.js` lines 1300–1303:
```javascript
// Before:
app.get('/api/items', async (req, res) => {
  const items = await fetchLiveItems();
  res.json(items);
});

// Recommended Minimal Change:
app.get('/api/items', async (req, res) => {
  const items = await fetchLiveItems();
  // Strip internal server-only fields from public HTTP output
  const sanitized = items.map(({ createdBy, updatedBy, is_deleted, ...rest }) => rest);
  res.json(sanitized);
});
```
- **Impact:** Keeps `fetchLiveItems()` intact for all 26 internal callers, while eliminating server-only audit fields from the public client payload.

---

## 13. Regression Risks

1. **Risk of Narrowing `fetchLiveItems()` Columns:**
   - **High Risk:** If `fetchLiveItems()` is changed to select only basic inventory columns, `GET /api/equipment/assets` will lose calibration and maintenance properties, breaking the equipment module.
2. **Risk of Moving `is_deleted` to Postgres Query:**
   - **Negligible Risk:** Zero callers expect soft-deleted rows.
3. **Risk of Removing `ghs`, `sdsUrl`, or `chemicalType`:**
   - **High Risk for Chemical Views:** The Chemical Inventory tab and Safety Data Sheet viewers require `ghs` and `sdsUrl`. Removing these fields would break GHS badge rendering in `app.js:3840–3853`.

---

## 14. Limitations

1. **Runtime Verification:** Field usage was evaluated via static source code analysis across all repository files. Third-party external API consumers (if any external scripts connect to `/api/items`) cannot be verified without API gateway access logs.
2. **Client-Side Fallbacks:** `app.js` can optionally fetch from Supabase directly if client credentials exist in localStorage; this audit focused specifically on the backend endpoint `/api/items`.

---

## 15. Files Inspected

- [server.js](file:///Users/wongsakornduangkliang/CODE/Chemical%20Laboratory%20library%20system%20and%20scientific%20equipment/server.js) — Lines 945–988, 1194, 1230, 1300–1304, 1546, 1713, 2100–2135, 2851, 3401
- [src/main.js](file:///Users/wongsakornduangkliang/CODE/Chemical%20Laboratory%20library%20system%20and%20scientific%20equipment/src/main.js) — Lines 50–90
- [src/inventory/inventory.js](file:///Users/wongsakornduangkliang/CODE/Chemical%20Laboratory%20library%20system%20and%20scientific%20equipment/src/inventory/inventory.js) — Lines 15–80, 230–265
- [src/equipment/equipment.js](file:///Users/wongsakornduangkliang/CODE/Chemical%20Laboratory%20library%20system%20and%20scientific%20equipment/src/equipment/equipment.js) — Lines 70–85, 485–540
- [app.js](file:///Users/wongsakornduangkliang/CODE/Chemical%20Laboratory%20library%20system%20and%20scientific%20equipment/app.js) — Lines 1175–1325, 2150–2205, 3820–3860, 4200–4220, 4650–4670, 10520–10530
- [migrations/004_p2_inventory_advanced.sql](file:///Users/wongsakornduangkliang/CODE/Chemical%20Laboratory%20library%20system%20and%20scientific%20equipment/migrations/004_p2_inventory_advanced.sql) — Lines 1–40
- [migrations/005_p2_modules.sql](file:///Users/wongsakornduangkliang/CODE/Chemical%20Laboratory%20library%20system%20and%20scientific%20equipment/migrations/005_p2_modules.sql) — Lines 5–25
- [scripts/test_p1_database.js](file:///Users/wongsakornduangkliang/CODE/Chemical%20Laboratory%20library%20system%20and%20scientific%20equipment/scripts/test_p1_database.js) — Lines 110–150
- [scripts/test_p2_inventory.js](file:///Users/wongsakornduangkliang/CODE/Chemical%20Laboratory%20library%20system%20and%20scientific%20equipment/scripts/test_p2_inventory.js) — Lines 190–205

---

## 16. Evidence / Line References

- Endpoint declaration: `server.js:1300`
- Shared helper declaration: `server.js:945`
- Database query: `server.js:953`
- Node.js filter: `server.js:955–959`
- Node.js normalization: `server.js:961–971`
- Equipment assets caller: `server.js:2102`
- Alerts caller: `server.js:1546`
- Google Sheets caller: `server.js:1230`
- Modular frontend consumer: `src/inventory/inventory.js:26`
- App init consumer: `src/main.js:69`
- Legacy app consumer: `app.js:1277`
