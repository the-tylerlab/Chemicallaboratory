# RBAC SECURITY MATRIX REPORT

## Environment
- **Target:** `https://chemicallab.vercel.app`
- **Test Date:** Wed, 07 Oct 2026 08:33:40 GMT
- **Test Type:** Role-Based Access Control (RBAC) & Authorization Integrity Test
- **Read-Only Mode:** **YES** (Zero mutations, zero code changes)

---

## Role Architecture
From read-only source code inspection of `server.js`, the following role hierarchy is enforced:
- **L0:** Guest (Unauthenticated visitor)
- **L1:** Teacher / Basic User (`TEACHER` / `L1`)
- **L2:** Staff / Operator (`STAFF` / `L2`)
- **L3:** Admin / Manager (`ADMIN` / `L3`)
- **L4:** Executive / Director (`EXECUTIVE` / `L4`)

### Enforced Middleware & Token Claims
- **`authenticateToken`**: Strictly verifies `Authorization: Bearer <token>` using `jwt.verify(token, JWT_SECRET)`. Enforces revocation blacklist and expiration.
- **`requireRole(...allowedRoles)`**: Server-side role check matching `req.user.roleLevel` against normalized roles.
- **JWT Claims:** `{ jti, id, teacherId, name, role, roleLevel, department, assignedRooms, mustChangePassword, iat, exp }`

---

## Endpoint Authorization Matrix

| Endpoint | L0 | L1 | L2 | L3 | L4 | Type | Result |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- | :---: |
| `/api/health` | 200 | 200 | 200 | 200 | 200 | A. PUBLIC READ | **PASS** |
| `/api/version` | 200 | 200 | 200 | 200 | 200 | A. PUBLIC READ | **PASS** |
| `/api/config` | 200 | 200 | 200 | 200 | 200 | A. PUBLIC READ | **PASS** |
| `/api/items` | 200 | 200 | 200 | 200 | 200 | A. PUBLIC READ | **PASS** |
| `/api/auth/me` | 401 | 200 | 200 | 200 | 200 | B. AUTHENTICATED READ | **PASS** |
| `/api/transactions` | 401 | 200 | 200 | 200 | 200 | B. AUTHENTICATED READ | **PASS** |
| `/api/inventory/movements` | 401 | 200 | 200 | 200 | 200 | C. ROLE-RESTRICTED READ (L1-L4) | **PASS** |
| `/api/budget` | 401 | 200 | 200 | 200 | 200 | C. ROLE-RESTRICTED READ (L1-L4) | **PASS** |
| `/api/feedbacks` | 401 | 403 | 200 | 200 | 200 | C. ROLE-RESTRICTED READ (L2-L4) | **PASS** |
| `/api/audit-logs` | 401 | 403 | 403 | 200 | 200 | C. ROLE-RESTRICTED READ (L3-L4) | **PASS** |
| `/api/sync/all-cloud-data` | 401 | 403 | 403 | 200 | 403 | C. ROLE-RESTRICTED READ (L3) | **PASS** |
| `/api/push-subscriptions` | 401 | 403 | 403 | 200 | 403 | C. ROLE-RESTRICTED READ (L3) | **PASS** |

---

## Authentication Tests

| Test | Expected | Actual | Result | Details |
| :--- | :---: | :---: | :---: | :--- |
| No token | 401 | 401 | **PASS** | AUTH_REQUIRED |
| Empty Bearer token | 401 | 401 | **PASS** | AUTH_REQUIRED |
| Malformed Bearer token | 401 | 401 | **PASS** | TOKEN_INVALID |
| Fake/Untrusted JWT | 401 | 401 | **PASS** | TOKEN_INVALID |
| Expired JWT | 401 | 401 | **PASS** | TOKEN_INVALID |
| JWT signed with OLD compromised secret | 401 | 401 | **PASS** | TOKEN_INVALID |
| Valid Production JWT (L3) | 200 | 200 | **PASS** | Authenticated as L3 |

---

## Privilege Escalation & Authorization Bypass Tests

| Attack Vector | Expected | Actual | Result |
| :--- | :---: | :---: | :---: |
| `URL parameter ?admin=true (Guest/L0)` | No escalation (401) | 401 | **PASS** |
| `URL parameter ?admin=true (User/L1)` | No escalation (403) | 403 | **PASS** |
| `URL parameter ?role=admin (Guest/L0)` | No escalation (401) | 401 | **PASS** |
| `URL parameter ?role=admin (User/L1)` | No escalation (403) | 403 | **PASS** |
| `URL parameter ?level=4 (Guest/L0)` | No escalation (401) | 401 | **PASS** |
| `URL parameter ?level=4 (User/L1)` | No escalation (403) | 403 | **PASS** |
| `URL parameter ?isAdmin=true (Guest/L0)` | No escalation (401) | 401 | **PASS** |
| `URL parameter ?isAdmin=true (User/L1)` | No escalation (403) | 403 | **PASS** |
| `Header injection: X-Role=admin (User/L1)` | No escalation (403) | 403 | **PASS** |
| `Header injection: X-User-Role=L3 (User/L1)` | No escalation (403) | 403 | **PASS** |
| `Header injection: X-Admin=true (User/L1)` | No escalation (403) | 403 | **PASS** |
| `Header injection: X-Level=4 (User/L1)` | No escalation (403) | 403 | **PASS** |
| `Header injection: X-Permission=admin (User/L1)` | No escalation (403) | 403 | **PASS** |

---

## Client-Side JWT Tampering Tests

| Test Case | Expected | Actual | Result |
| :--- | :---: | :---: | :---: |
| JWT alg:none signature bypass | REJECTED (401/403) | 403 (REJECTED) | **PASS** |
| JWT role tampering (L1 -> L3 with forged signature) | REJECTED (401) | 401 (REJECTED) | **PASS** |
| JWT user ID tampering with forged signature | REJECTED (401) | 401 (REJECTED) | **PASS** |
| JWT signature stripped | REJECTED (401/403) | 403 (REJECTED) | **PASS** |
| Expired JWT | REJECTED (401) | 401 (REJECTED) | **PASS** |

### Tampering Summary
- **JWT role tampering** → **REJECTED**
- **JWT user ID tampering** → **REJECTED**
- **JWT signature tampering** → **REJECTED**
- **Expired JWT** → **REJECTED**

---

## Object-Level Authorization (IDOR / BOLA)
| Test Case | Expected | Actual | Result |
| :--- | :--- | :--- | :---: |
| `GET /api/auth/me?id=u_admin (User/L1)` | Returns authenticated user profile only (no IDOR) | User ID returned: u_1001 (Matches L1 token identity) | **PASS** |

- **Finding:** No IDOR/BOLA vulnerability detected on safe read endpoints. Identity is bound strictly to server-verified JWT claims.

---

## Sensitive Information Exposure & Health Check
- **`GET /api/health`:** HTTP 200 OK
- **`jwtSecretConfigured`:** `true` (Boolean confirmation)
- **Secret/Password Leakage:** **NONE** (No passwords, hashes, JWT secrets, private keys, or API secrets disclosed)
- **Token Redaction:** All tokens redacted as `<REDACTED_JWT>`

---

## Vulnerability Summary
- **Critical:** 0
- **High:** 0
- **Medium:** 0
- **Low:** 0
- **Informational:** 0

---

## Overall Verdict
```text
OVERALL VERDICT: PASS
```
*(All role boundaries, privilege restrictions, JWT verification checks, parameter tampering defenses, and error statuses are correctly and strictly enforced on the production environment).*
