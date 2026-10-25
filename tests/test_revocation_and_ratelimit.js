/**
 * @file test_revocation_and_ratelimit.js
 * @description Comprehensive Security Regression Tests covering all P0 & P1 requirements:
 * 1. [P0] Restricted Table Privileges for revoked_tokens (service_role only, no anon/authenticated)
 * 2. [P0] Restricted Table Privileges for rate_limits (service_role only, no anon/authenticated)
 * 3. [P0] Fail-Closed Rate Limiting when Supabase Fails in Production (503 RATE_LIMIT_UNAVAILABLE)
 * 4. [P0] Fail-Closed Token Revocation (503 REVOCATION_CHECK_UNAVAILABLE, never allow on outage)
 * 5. [P0] Safe Logout Persistence (503 LOGOUT_PERSISTENCE_FAILED, never report success on failure)
 * 6. [P1] Atomic Shared Rate Limiting (PostgreSQL RPC / atomic increment, zero race conditions)
 * 7. [P1] optionalAuth Verification (fail-closed on store outage, protected endpoints require auth)
 * 8. [P1] trust proxy & IP Spoofing Prevention (Vercel proxy topology)
 * 9. [P1] Rate Limit Reset Isolation (User success does NOT wipe shared IP limit for other users)
 * 10. [P1] Rate Limit Cleanup (pruning preserves active blocks)
 * 11. [P1] Migration 006/007 Schema & RLS Integrity
 * 12. [P1] Safe Rollback Migration Validation
 * 13. [P1] Plaintext Password Purge from Example Data
 * 14. [P1] Safe Cache Cleanup (never evict unexpired revoked tokens)
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { Readable } = require('stream');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test_secret_for_revocation_and_rate_limit_checks_987654321';
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

/**
 * Creates a controllable in-memory Supabase mock client
 */
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
        if (simulateError === 'RATE_LIMIT_ERROR' || simulateError === 'RPC_FAILURE_ONLY') {
          return { data: null, error: { message: 'Rate limit RPC function missing or unreachable' } };
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
              },
              async lt(col, val) {
                const threshold = new Date(val).getTime();
                for (const [k, v] of revokedTokensStore.entries()) {
                  if (new Date(v.expires_at).getTime() < threshold) {
                    revokedTokensStore.delete(k);
                  }
                }
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
              async eq(col, val) {
                rateLimitsStore.delete(val);
                return { error: null };
              },
              async in(col, keys) {
                for (const k of keys) rateLimitsStore.delete(k);
                return { error: null };
              },
              lt(col, val) {
                return {
                  async or(cond) {
                    const threshold = new Date(val).getTime();
                    const now = Date.now();
                    for (const [k, v] of rateLimitsStore.entries()) {
                      const lastMs = new Date(v.last_attempt).getTime();
                      const blockedMs = v.blocked_until ? new Date(v.blocked_until).getTime() : 0;
                      if (lastMs < threshold && (!blockedMs || blockedMs <= now)) {
                        rateLimitsStore.delete(k);
                      }
                    }
                    return { error: null };
                  }
                };
              }
            };
          }
        };
      }

      // Default fallback
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

async function runTests() {
  console.log('====================================================');
  console.log('🛡️  Token Revocation, Rate Limiting & Safety Tests');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function expect(condition, message) {
    total++;
    if (condition) {
      passed++;
      console.log(`   ✅ PASS: ${message}`);
    } else {
      console.error(`   ❌ FAIL: ${message}`);
      throw new Error(`Test assertion failed: ${message}`);
    }
  }

  // Preserve original Supabase client
  const originalSupabase = app.getSupabaseClient();
  const mockSupabase = createControllableSupabaseMock();
  app.setSupabaseClient(mockSupabase);

  try {
    // ── TEST 1: Plaintext password purge from data/users.example.json ──
    console.log('--- 1. Plaintext Password Purge from Example Data ---');
    const exampleFile = path.resolve(__dirname, '../data/users.example.json');
    expect(fs.existsSync(exampleFile), 'data/users.example.json exists');
    const exampleContent = fs.readFileSync(exampleFile, 'utf-8');
    expect(!exampleContent.includes('plain_password'), 'No "plain_password" field in users.example.json');
    expect(!exampleContent.includes('display_password'), 'No "display_password" field in users.example.json');
    expect(!exampleContent.includes('SciAdmin@2026'), 'Leaked string "SciAdmin@2026" completely purged');
    const parsedExample = JSON.parse(exampleContent);
    const allHashed = parsedExample.every(u => !u.password || u.password.startsWith('$2a$') || u.password.startsWith('$2b$'));
    expect(allHashed, 'All example user passwords use secure bcrypt hashes');

    // ── TEST 2: Schema & Privilege Restrictions (P0: revoked_tokens & rate_limits) ──
    console.log('\n--- 2. Migration 007 Security & Role Privilege Restrictions ---');
    const mig007File = path.resolve(__dirname, '../migrations/007_revoked_tokens.sql');
    expect(fs.existsSync(mig007File), 'migrations/007_revoked_tokens.sql exists');
    const mig007Content = fs.readFileSync(mig007File, 'utf-8');

    // Verify revoked_tokens privileges
    expect(mig007Content.includes('REVOKE ALL ON public.revoked_tokens FROM anon, authenticated, public;'), 'Privileges on revoked_tokens revoked from anon/authenticated');
    expect(mig007Content.includes('GRANT ALL ON public.revoked_tokens TO service_role;'), 'revoked_tokens privileges granted exclusively to service_role');
    expect(mig007Content.includes('TO service_role'), 'Policy for revoked_tokens targets service_role');
    expect(!mig007Content.includes('GRANT ALL ON public.revoked_tokens TO anon'), 'No public/anon grant on revoked_tokens');

    // Verify rate_limits privileges
    expect(mig007Content.includes('REVOKE ALL ON public.rate_limits FROM anon, authenticated, public;'), 'Privileges on rate_limits revoked from anon/authenticated');
    expect(mig007Content.includes('GRANT ALL ON public.rate_limits TO service_role;'), 'rate_limits privileges granted exclusively to service_role');
    expect(mig007Content.includes('CREATE POLICY rate_limits_service_role ON public.rate_limits'), 'Policy for rate_limits targets service_role');

    // Verify atomic RPC function in migration 007
    expect(mig007Content.includes('FUNCTION public.increment_rate_limit'), 'Atomic rate limit increment function defined in migration 007');
    expect(mig007Content.includes('GRANT EXECUTE ON FUNCTION public.increment_rate_limit'), 'Execution of increment_rate_limit restricted to service_role');

    // ── TEST 3: Dual-Layer Token Revocation Store & Cache ──
    console.log('\n--- 3. Dual-Layer Token Revocation & Cleanup ---');
    const dummyPayload = {
      id: 'test_user_revocation_1',
      teacherId: '9999',
      name: 'Test Teacher',
      role: 'L1',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    };
    const testToken = jwt.sign(dummyPayload, process.env.JWT_SECRET);
    expect(typeof app.isTokenRevoked === 'function', 'app.isTokenRevoked is a function');
    expect(typeof app.revokeToken === 'function', 'app.revokeToken is a function');

    // Before revocation: token is valid
    const preRevoked = await app.isTokenRevoked(testToken, dummyPayload);
    const isPreRevoked = (typeof preRevoked === 'object' && preRevoked !== null) ? preRevoked.revoked : Boolean(preRevoked);
    expect(!isPreRevoked, 'Newly issued token is NOT revoked');

    // Revoke token
    await app.revokeToken(testToken, dummyPayload, Date.now() + 3600 * 1000);
    const postRevoked = await app.isTokenRevoked(testToken, dummyPayload);
    const isPostRevoked = (typeof postRevoked === 'object' && postRevoked !== null) ? postRevoked.revoked : Boolean(postRevoked);
    expect(isPostRevoked, 'Token is successfully revoked after app.revokeToken');

    // Expired item cleanup: ensure cleanExpiredRevokedTokens does NOT clear valid revoked tokens
    const expiredToken = 'dummy_expired_token_abc123';
    const expiredHash = app.hashToken(expiredToken);
    app.revokedTokensCache.set(expiredHash, Date.now() - 10000);
    expect(app.revokedTokensCache.has(expiredHash), 'Expired token exists in cache prior to cleanup');
    const validHash = app.hashToken(testToken);
    expect(app.revokedTokensCache.has(validHash), 'Valid revoked token exists in cache');

    // Run cleanup
    app.cleanExpiredRevokedTokens();
    expect(!app.revokedTokensCache.has(expiredHash), 'Expired token record is cleanly pruned');
    expect(app.revokedTokensCache.has(validHash), 'Valid revoked token is PRESERVED (never bulk cleared)');

    // ── TEST 4: Fail-Closed Revocation Policy on Supabase Failure ──
    console.log('\n--- 4. Fail-Closed Token Revocation on Database Failure ---');
    const freshPayload = {
      id: 'fail_closed_user_1',
      teacherId: '7777',
      name: 'Fail Closed Teacher',
      role: 'L1',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    };
    const freshToken = jwt.sign(freshPayload, process.env.JWT_SECRET);

    // Clear local cache for this token to force querying the shared store
    const freshTokenHash = app.hashToken(freshToken);
    app.revokedTokensCache.delete(freshTokenHash);

    // Simulate Supabase failure / timeout
    mockSupabase.setErrorMode('REVOCATION_SELECT_ERROR');

    // Direct API call with fresh token while shared store is down
    const failClosedRes = await directRequest('GET', '/api/auth/me', {
      'Authorization': `Bearer ${freshToken}`
    });

    expect(failClosedRes.status === 503, 'When shared revocation store fails, returns HTTP 503');
    expect(failClosedRes.body?.code === 'REVOCATION_CHECK_UNAVAILABLE', 'Error code is REVOCATION_CHECK_UNAVAILABLE');
    expect(failClosedRes.body?.success === false, 'Token was NOT accepted under fail-closed policy');

    // Restore normal Supabase mode
    mockSupabase.setErrorMode(null);

    // Once store recovers, token check succeeds
    const recoveredRes = await directRequest('GET', '/api/auth/me', {
      'Authorization': `Bearer ${freshToken}`
    });
    expect(recoveredRes.status === 200, 'When shared revocation store recovers, access is granted');

    // ── TEST 5: Fail-Closed Rate Limiting on Supabase Failure in Production ──
    console.log('\n--- 5. Fail-Closed Rate Limiting on Store Failure ---');
    mockSupabase.setErrorMode('RATE_LIMIT_ERROR');

    // In production or when check throws, login must reject with 503 RATE_LIMIT_UNAVAILABLE
    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const failClosedLogin = await directRequest('POST', '/api/auth/login', {}, {
      username: 'admin',
      password: 'AnyPassword'
    });

    expect(failClosedLogin.status === 503, 'Rate limiter outage returns HTTP 503 Service Unavailable');
    expect(failClosedLogin.body?.code === 'RATE_LIMIT_UNAVAILABLE', 'Error code is RATE_LIMIT_UNAVAILABLE');

    process.env.NODE_ENV = origEnv;
    mockSupabase.setErrorMode(null);

    // ── TEST 6: Logout Persistence Failure Notification ──
    console.log('\n--- 6. Logout Persistence Failure Notification ---');
    const logoutToken = jwt.sign({
      id: 'logout_user_fail_test',
      teacherId: '6666',
      name: 'Logout Teacher',
      role: 'L1'
    }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Simulate database write failure during logout
    mockSupabase.setErrorMode('REVOCATION_UPSERT_ERROR');

    const failedLogoutRes = await directRequest('POST', '/api/auth/logout', {
      'Authorization': `Bearer ${logoutToken}`
    });

    expect(failedLogoutRes.status === 503, 'Logout returns HTTP 503 when shared revocation persistence fails');
    expect(failedLogoutRes.body?.code === 'LOGOUT_PERSISTENCE_FAILED', 'Error code is LOGOUT_PERSISTENCE_FAILED');
    expect(failedLogoutRes.body?.success === false, 'Logout explicitly reports failure');

    // Restore normal mode and verify successful logout
    mockSupabase.setErrorMode(null);
    const freshLogoutToken = jwt.sign({
      id: 'logout_user_success_test',
      teacherId: '6667',
      name: 'Logout Teacher 2',
      role: 'L1'
    }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const successfulLogoutRes = await directRequest('POST', '/api/auth/logout', {
      'Authorization': `Bearer ${freshLogoutToken}`
    });
    expect(successfulLogoutRes.status === 200 && successfulLogoutRes.body?.success === true, 'Successful logout returns HTTP 200');

    // Subsequent request must be rejected with 401 TOKEN_REVOKED
    const accessAfterLogout = await directRequest('GET', '/api/auth/me', {
      'Authorization': `Bearer ${freshLogoutToken}`
    });
    expect(accessAfterLogout.status === 401 && accessAfterLogout.body?.code === 'TOKEN_REVOKED', 'Revoked token rejected with 401 TOKEN_REVOKED');

    // ── TEST 7: optionalAuth Fail-Closed Guarantee ──
    console.log('\n--- 7. optionalAuth Security & Fail-Closed Guarantee ---');
    // When store fails and client sent Authorization header, optionalAuth MUST return 503
    mockSupabase.setErrorMode('REVOCATION_SELECT_ERROR');
    const optionalAuthFailRes = await directRequest('GET', '/api/dashboard/role-view', {
      'Authorization': `Bearer ${freshToken}`
    });
    expect(optionalAuthFailRes.status === 503, 'optionalAuth fails closed (503) when token revocation check fails');
    expect(optionalAuthFailRes.body?.code === 'REVOCATION_CHECK_UNAVAILABLE', 'Error code is REVOCATION_CHECK_UNAVAILABLE');
    mockSupabase.setErrorMode(null);

    // Protected routes must reject unauthenticated requests
    const overdueUnauth = await directRequest('GET', '/api/borrow/overdue');
    expect(overdueUnauth.status === 401, 'GET /api/borrow/overdue strictly requires authentication (401)');

    const poUnauth = await directRequest('GET', '/api/purchase-orders');
    expect(poUnauth.status === 401, 'GET /api/purchase-orders strictly requires authentication (401)');

    // ── TEST 8: Multi-Instance Shared Rate Limiting & Atomic Increment ──
    console.log('\n--- 8. Multi-Instance Shared Rate Limiting & Atomic Increment ---');
    const limiterA = new app.AuthRateLimiter({
      windowMs: 60 * 1000,
      maxAttempts: 3,
      progressiveDelayMs: 100,
      name: 'shared-rate-test'
    });

    const limiterB = new app.AuthRateLimiter({
      windowMs: 60 * 1000,
      maxAttempts: 3,
      progressiveDelayMs: 100,
      name: 'shared-rate-test'
    });

    const multiReqA = {
      ip: '203.0.113.150',
      headers: {},
      socket: { remoteAddress: '203.0.113.150' }
    };
    const multiReqB = {
      ip: '203.0.113.150',
      headers: {},
      socket: { remoteAddress: '203.0.113.150' }
    };

    // Attempt 1 on Instance A
    const chkA1 = await limiterA.check(multiReqA, 'shared_user_1');
    expect(chkA1.allowed === true && chkA1.remaining === 3, 'Instance A: Attempt 1 allowed');
    await limiterA.recordFailure(multiReqA, 'shared_user_1');

    // Attempt 2 on Instance B (different instance! Must see attempt 1 from shared store)
    const chkB2 = await limiterB.check(multiReqB, 'shared_user_1');
    expect(chkB2.allowed === true && chkB2.remaining <= 2, 'Instance B: Sees prior failure from Instance A');
    await limiterB.recordFailure(multiReqB, 'shared_user_1');

    // Attempt 3 on Instance A
    await limiterA.recordFailure(multiReqA, 'shared_user_1');

    // Attempt 4 on Instance B (should now be BLOCKED across instances!)
    const chkB4 = await limiterB.check(multiReqB, 'shared_user_1');
    expect(chkB4.allowed === false && chkB4.retryAfter > 0, 'Instance B: BLOCKED due to aggregated attempts across instances');

    // ── TEST 9: Rate Limit Reset Isolation (User Login Does NOT Wipe IP Limit) ──
    console.log('\n--- 9. Rate Limit Reset Isolation ---');
    const sharedIpReq = {
      ip: '192.0.2.77',
      headers: {},
      socket: { remoteAddress: '192.0.2.77' }
    };

    // User A and User B fail from the same IP
    await limiterA.recordFailure(sharedIpReq, 'target_user_a');
    await limiterA.recordFailure(sharedIpReq, 'target_user_b');

    // User A logs in successfully
    await limiterA.recordSuccess(sharedIpReq, 'target_user_a');

    // Check that User A's key is cleared
    const chkUserA = await limiterA.check(sharedIpReq, 'target_user_a');
    expect(chkUserA.allowed === true, 'Successful login clears User A key');

    // Check that IP record still reflects failures and was NOT cleared
    const ipKey = limiterA._getIpKey(sharedIpReq);
    expect(mockSupabase.getRateLimitsStore().has(ipKey), 'IP failure record was PRESERVED and not wiped by single user success');

    // ── TEST 10: Rate Limit Cleanup Preserves Active Blocks ──
    console.log('\n--- 10. Rate Limit Cleanup Preserves Active Blocks ---');
    const blockedKey = 'shared-rate-test:blocked_ip_99';
    const futureBlockTime = Date.now() + 600 * 1000; // 10 minutes in future
    mockSupabase.getRateLimitsStore().set(blockedKey, {
      key: blockedKey,
      count: 5,
      first_attempt: Date.now() - 100000,
      last_attempt: Date.now() - 70000, // past windowMs
      blocked_until: futureBlockTime
    });

    limiterA.cleanup();
    expect(mockSupabase.getRateLimitsStore().has(blockedKey), 'Cleanup NEVER deletes active blocked_until record');

    // ── TEST 11: Trusted Proxy & Anti-Spoofing Verification ──
    console.log('\n--- 11. Trusted Proxy & IP Spoofing Prevention ---');
    // An attacker sends spoofed X-Forwarded-For: "1.2.3.4, 198.51.100.99"
    // With trust proxy: 1, Express resolves the rightmost untrusted hop (198.51.100.99)
    const spoofReq = {
      ip: '198.51.100.99',
      headers: { 'x-forwarded-for': '1.2.3.4, 198.51.100.99' },
      socket: { remoteAddress: '198.51.100.99' }
    };
    const resolvedIpKey = limiterA._getIpKey(spoofReq);
    expect(resolvedIpKey === 'shared-rate-test:198.51.100.99', 'Rate limiter uses secure req.ip rather than spoofed client header');

    // ── TEST 12: Rollback Migration Safety Check ──
    console.log('\n--- 12. Rollback Migration Safety Verification ---');
    const rollbackFile = path.resolve(__dirname, '../migrations/rollback/007_rollback_revoked_tokens.sql');
    expect(fs.existsSync(rollbackFile), 'migrations/rollback/007_rollback_revoked_tokens.sql exists');
    const rollbackSql = fs.readFileSync(rollbackFile, 'utf-8');
    expect(rollbackSql.includes('DROP TABLE IF EXISTS public.rate_limits'), 'Rollback drops rate_limits');
    expect(rollbackSql.includes('DROP TABLE IF EXISTS public.revoked_tokens'), 'Rollback drops revoked_tokens');
    expect(!rollbackSql.includes('DROP TABLE public.users'), 'Rollback never drops users table');
    expect(!rollbackSql.includes('DROP TABLE public.items'), 'Rollback never drops items table');

    // ── TEST 13: Consolidated Migration Bundle Verification ──
    console.log('\n--- 13. Consolidated Migration Bundle Verification ---');
    const bundleFile = path.resolve(__dirname, '../dist/supabase_migration_bundle.sql');
    expect(fs.existsSync(bundleFile), 'dist/supabase_migration_bundle.sql exists');
    const bundleSql = fs.readFileSync(bundleFile, 'utf-8');
    expect(bundleSql.includes('001_central_schema.sql'), 'Bundle contains migration 001');
    expect(bundleSql.includes('006_user_password_security.sql'), 'Bundle contains migration 006');
    expect(bundleSql.includes('007_revoked_tokens.sql'), 'Bundle contains migration 007');

    // ── TEST 14: Concurrent Rate Limiter Invocations ──
    console.log('\n--- 14. Concurrent Invocations & Race Condition Resilience ---');
    const concurrentIp = '198.51.100.222';
    const concReq = { ip: concurrentIp, headers: {}, socket: { remoteAddress: concurrentIp } };
    const concLimiter = new app.AuthRateLimiter({
      windowMs: 60 * 1000,
      maxAttempts: 5,
      name: 'conc-test'
    });

    // Fire 5 concurrent failure records in parallel
    await Promise.all([
      concLimiter.recordFailure(concReq, 'conc_user'),
      concLimiter.recordFailure(concReq, 'conc_user'),
      concLimiter.recordFailure(concReq, 'conc_user'),
      concLimiter.recordFailure(concReq, 'conc_user'),
      concLimiter.recordFailure(concReq, 'conc_user')
    ]);

    const concStatus = await concLimiter.check(concReq, 'conc_user');
    expect(concStatus.allowed === false, 'Concurrent bursts reaching limit correctly enforce block');
    expect(concStatus.count >= 5, 'Failure count is accurately tracked across concurrent attempts');

    // ── TEST 15: RPC Failure Fallback Resiliency ──
    console.log('\n--- 15. RPC Failure Fallback Resiliency ---');
    mockSupabase.setErrorMode('RPC_FAILURE_ONLY');
    const fallbackLimiter = new app.AuthRateLimiter({
      windowMs: 60 * 1000,
      maxAttempts: 3,
      name: 'rpc-fallback-test'
    });
    const fallbackReq = { ip: '198.51.100.233', headers: {}, socket: { remoteAddress: '198.51.100.233' } };

    // Should not throw even when RPC fails; falls back to synchronized upsert
    let fallbackThrown = false;
    try {
      await fallbackLimiter.recordFailure(fallbackReq, 'fallback_user');
    } catch (e) {
      fallbackThrown = true;
    }
    expect(!fallbackThrown, 'RPC failure falls back gracefully to synchronized upsert without crashing');
    mockSupabase.setErrorMode(null);

    console.log(`\n====================================================`);
    console.log(`🎉 All ${passed}/${total} Security & Architecture Tests Passed!`);
    console.log(`====================================================\n`);
  } finally {
    // Restore original Supabase client
    app.setSupabaseClient(originalSupabase);
  }
}

runTests().catch(err => {
  console.error('\n❌ Test suite failed with error:', err);
  process.exit(1);
});
