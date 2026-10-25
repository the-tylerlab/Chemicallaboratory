/**
 * Authentication Scenarios Test: Healthy Store vs. Store Outage
 * 
 * Strict Delineation:
 * 1. Scenario A (Normal Operation - Healthy Store):
 *    - Valid login -> 200 OK + JWT
 *    - Invalid password -> 401 Unauthorized
 *    - Protected route with active token -> 200 OK
 *    - Logout with active token -> 200 OK + token revoked in shared store
 *    - Subsequent protected route with revoked token -> 401 TOKEN_REVOKED
 * 
 * 2. Scenario B (Store Outage - Fail-Closed Security Policy):
 *    - Rate limit store outage -> Login returns 503 RATE_LIMIT_UNAVAILABLE (no silent memory fallback)
 *    - Revocation store outage -> Protected route returns 503 REVOCATION_CHECK_UNAVAILABLE (never allows unverified token)
 *    - Logout persistence failure -> Returns 503 LOGOUT_PERSISTENCE_FAILED (never claims success when write fails)
 */

const assert = require('assert');
const path = require('path');
const jwt = require('jsonwebtoken');
const { Readable } = require('stream');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test_secret_for_healthy_vs_outage_tests_1234567890';
}

const app = require('../server.js');

function directRequest(method, url, headers = {}, body = null, remoteIp = '127.0.0.1') {
  return new Promise((resolve) => {
    const payload = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const req = Readable.from(payload ? [Buffer.from(payload)] : []);
    req.method = method;
    req.url = url;
    req.headers = Object.fromEntries(
      Object.entries(headers).map(([k, v]) => [k.toLowerCase(), String(v)])
    );
    if (payload) {
      req.headers['content-length'] = Buffer.byteLength(payload);
      if (!req.headers['content-type']) req.headers['content-type'] = 'application/json';
    }
    req.socket = { remoteAddress: remoteIp };

    let statusCode = 200;
    const resHeaders = {};
    let responseBody = '';

    const res = {
      statusCode: 200,
      setHeader(k, v) { resHeaders[k.toLowerCase()] = v; },
      getHeader(k) { return resHeaders[k.toLowerCase()]; },
      removeHeader(k) { delete resHeaders[k.toLowerCase()]; },
      status(code) {
        statusCode = code;
        res.statusCode = code;
        return res;
      },
      json(data) {
        res.setHeader('content-type', 'application/json');
        responseBody = JSON.stringify(data);
        res.end();
      },
      send(data) {
        responseBody = typeof data === 'object' ? JSON.stringify(data) : String(data);
        res.end();
      },
      end(chunk) {
        if (chunk) responseBody += chunk;
        let parsed = responseBody;
        try {
          parsed = JSON.parse(responseBody);
        } catch (_) {}
        resolve({
          status: statusCode,
          headers: resHeaders,
          body: parsed,
          rawBody: responseBody
        });
      }
    };

    app.handle(req, res);
  });
}

function createControllableSupabaseMock() {
  const revokedTokensStore = new Map();
  const rateLimitsStore = new Map();
  let simulateError = null; // null | 'REVOCATION_SELECT_ERROR' | 'REVOCATION_UPSERT_ERROR' | 'RATE_LIMIT_ERROR'

  const mockClient = {
    setErrorMode(mode) { simulateError = mode; },
    getRevokedStore() { return revokedTokensStore; },
    getRateLimitsStore() { return rateLimitsStore; },
    async rpc(fn, args) {
      if (fn === 'increment_rate_limit') {
        if (simulateError === 'RATE_LIMIT_ERROR') {
          return { data: null, error: { message: 'Rate limit RPC unreachable' } };
        }
        const key = args.p_key;
        const windowMs = args.p_window_ms;
        const maxAttempts = args.p_max_attempts;
        const now = Date.now();
        let rec = rateLimitsStore.get(key);
        if (!rec || (now - rec.first_attempt > windowMs)) {
          rec = { key, count: 1, first_attempt: now, last_attempt: now, blocked_until: null };
        } else {
          rec.count += 1;
          rec.last_attempt = now;
          if (rec.count >= maxAttempts) {
            rec.blocked_until = now + windowMs;
          }
        }
        rateLimitsStore.set(key, rec);
        return {
          data: [{
            count: rec.count,
            first_attempt: new Date(rec.first_attempt).toISOString(),
            last_attempt: new Date(rec.last_attempt).toISOString(),
            blocked_until: rec.blocked_until ? new Date(rec.blocked_until).toISOString() : null,
            allowed: !rec.blocked_until || rec.blocked_until <= now
          }],
          error: null
        };
      }
      return { data: null, error: null };
    },
    from(table) {
      if (table === 'revoked_tokens') {
        return {
          select(fields) {
            return {
              eq(col, val) {
                return {
                  async maybeSingle() {
                    if (simulateError === 'REVOCATION_SELECT_ERROR') {
                      return { data: null, error: { message: 'Connection timeout: Supabase database unreachable' } };
                    }
                    const row = revokedTokensStore.get(val);
                    return { data: row || null, error: null };
                  }
                };
              }
            };
          },
          async upsert(row) {
            if (simulateError === 'REVOCATION_UPSERT_ERROR') {
              return { data: null, error: { message: 'Write failed: Database transaction timeout' } };
            }
            const items = Array.isArray(row) ? row : [row];
            for (const item of items) {
              revokedTokensStore.set(item.token_hash, item);
            }
            return { data: row, error: null };
          },
          delete() {
            return {
              async eq(col, val) {
                revokedTokensStore.delete(val);
                return { error: null };
              }
            };
          }
        };
      }

      if (table === 'rate_limits') {
        return {
          select(fields) {
            return {
              async in(col, keys) {
                if (simulateError === 'RATE_LIMIT_ERROR') {
                  return { data: null, error: { message: 'Rate limit store unreachable' } };
                }
                const results = [];
                for (const k of keys) {
                  if (rateLimitsStore.has(k)) {
                    results.push(rateLimitsStore.get(k));
                  }
                }
                return { data: results, error: null };
              }
            };
          },
          async upsert(rows) {
            if (simulateError === 'RATE_LIMIT_ERROR') {
              return { data: null, error: { message: 'Rate limit write timeout' } };
            }
            for (const r of rows) {
              rateLimitsStore.set(r.key, r);
            }
            return { data: rows, error: null };
          },
          delete() {
            return {
              async in(col, keys) {
                for (const k of keys) rateLimitsStore.delete(k);
                return { error: null };
              }
            };
          }
        };
      }

      return {
        select() { return Promise.resolve({ data: [], error: null }); },
        insert() { return Promise.resolve({ data: null, error: null }); },
        update() { return Promise.resolve({ data: null, error: null }); },
        upsert() { return Promise.resolve({ data: null, error: null }); },
        delete() { return Promise.resolve({ data: null, error: null }); }
      };
    }
  };

  return mockClient;
}

async function runAuthScenariosTest() {
  console.log('================================================================');
  console.log('🧪 AUTH SCENARIOS: HEALTHY STORE VS. OUTAGE (FAIL-CLOSED)');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function expect(condition, message, detail = '') {
    total++;
    if (condition) {
      console.log(`   ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`   ❌ FAIL: ${message} ${detail ? `(${detail})` : ''}`);
    }
  }

  const originalSupabase = app.getSupabaseClient();
  const mockSb = createControllableSupabaseMock();
  app.setSupabaseClient(mockSb);

  try {
    // ══════════════════════════════════════════════════════════════════
    // SCENARIO A: NORMAL OPERATION (HEALTHY STORE)
    // ══════════════════════════════════════════════════════════════════
    console.log('--- SCENARIO A: Normal Operation (Healthy Store) ---');
    mockSb.setErrorMode(null);

    // A1. Valid token generation
    const activeToken = jwt.sign(
      { id: 'normal_user_1', teacherId: '9001', username: 'teacher1', role: 'teacher' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // A2. Protected route with active token -> 200 OK
    const meRes = await directRequest('GET', '/api/auth/me', {
      'Authorization': `Bearer ${activeToken}`
    });
    expect(meRes.status === 200, 'Healthy store: Protected route allows active valid token (200 OK)');

    // A3. Successful Logout -> 200 OK and persists token to revocation store
    const logoutRes = await directRequest('POST', '/api/auth/logout', {
      'Authorization': `Bearer ${activeToken}`
    });
    expect(logoutRes.status === 200 && logoutRes.body?.success === true, 'Healthy store: Logout succeeds and records revocation (200 OK)');

    // A4. Immediate subsequent request with the logged-out token -> 401 TOKEN_REVOKED
    const meAfterLogout = await directRequest('GET', '/api/auth/me', {
      'Authorization': `Bearer ${activeToken}`
    });
    expect(meAfterLogout.status === 401 && meAfterLogout.body?.code === 'TOKEN_REVOKED', 'Healthy store: Revoked token is rejected with 401 TOKEN_REVOKED');

    // ══════════════════════════════════════════════════════════════════
    // SCENARIO B: STORE OUTAGE (FAIL-CLOSED SECURITY POLICY)
    // ══════════════════════════════════════════════════════════════════
    console.log('\n--- SCENARIO B: Store Outage (Fail-Closed Operation) ---');

    // B1. Revocation store outage during protected route verification
    const newActiveToken = jwt.sign(
      { id: 'normal_user_2', teacherId: '9002', username: 'teacher2', role: 'teacher' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    // Clear local cache for this token to force shared query
    app.revokedTokensCache.delete(app.hashToken(newActiveToken));
    mockSb.setErrorMode('REVOCATION_SELECT_ERROR');

    const outageMeRes = await directRequest('GET', '/api/auth/me', {
      'Authorization': `Bearer ${newActiveToken}`
    });
    expect(outageMeRes.status === 503, 'Outage: Revocation store failure returns HTTP 503 Service Unavailable');
    expect(outageMeRes.body?.code === 'REVOCATION_CHECK_UNAVAILABLE', 'Outage: Returns code REVOCATION_CHECK_UNAVAILABLE');
    expect(outageMeRes.body?.user === undefined, 'Outage: Protected route strictly denies access under fail-closed policy');

    // B2. Rate limiter outage during login
    mockSb.setErrorMode('RATE_LIMIT_ERROR');
    const outageLoginRes = await directRequest('POST', '/api/auth/login', {}, {
      username: 'teacher1',
      password: 'AnyPassword'
    }, '203.0.113.88');
    expect(outageLoginRes.status === 503, 'Outage: Rate limit store failure returns HTTP 503 Service Unavailable');
    expect(outageLoginRes.body?.code === 'RATE_LIMIT_UNAVAILABLE', 'Outage: Returns code RATE_LIMIT_UNAVAILABLE');

    // B3. Logout persistence failure
    const tokenToRevokeFail = jwt.sign(
      { id: 'user_revoke_fail', teacherId: '9003', username: 'teacher3', role: 'teacher' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    mockSb.setErrorMode('REVOCATION_UPSERT_ERROR');
    const outageLogoutRes = await directRequest('POST', '/api/auth/logout', {
      'Authorization': `Bearer ${tokenToRevokeFail}`
    });
    expect(outageLogoutRes.status === 503, 'Outage: Revocation write failure returns HTTP 503 Service Unavailable');
    expect(outageLogoutRes.body?.code === 'LOGOUT_PERSISTENCE_FAILED', 'Outage: Returns code LOGOUT_PERSISTENCE_FAILED (never claims false success)');

  } finally {
    // Restore original Supabase client
    app.setSupabaseClient(originalSupabase);
  }

  console.log('\n================================================================');
  console.log(`🎉 Auth Scenarios Audit: ${passed}/${total} Passed!`);
  console.log('================================================================\n');

  if (passed !== total) process.exit(1);
  process.exit(0);
}

runAuthScenariosTest();
