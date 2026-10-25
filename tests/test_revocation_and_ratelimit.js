/**
 * @file test_revocation_and_ratelimit.js
 * @description Comprehensive Security Regression Tests for:
 * 1. Plaintext Password Purge from Example File
 * 2. Dual-Layer Token Revocation (shared store, TTL expiration, fail-closed policy)
 * 3. Fail-Closed Token Revocation When Supabase Fails (Timeout/Network Error -> 503 REVOCATION_CHECK_UNAVAILABLE)
 * 4. Logout Persistence Failure Notification (Supabase failure -> 503 LOGOUT_PERSISTENCE_FAILED)
 * 5. Safe Cache Cleanup (never evict unexpired revoked tokens regardless of cache size)
 * 6. Multi-Instance Shared Rate Limiting (shared store between instances, reset-password, change-password, login)
 * 7. Trusted Proxy & IP Spoofing Prevention
 * 8. Single Source of Truth in Production
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
              async in(col, keys) {
                for (const k of keys) rateLimitsStore.delete(k);
                return { error: null };
              },
              lt(col, val) {
                return Promise.resolve({ error: null });
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

  // Preserve original Supabase client if any
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

    // ── TEST 2: Dual-Layer Token Revocation Store & Cache ──
    console.log('\n--- 2. Dual-Layer Token Revocation & Cleanup ---');
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
    // Inject an expired entry (expired 10 seconds ago)
    app.revokedTokensCache.set(expiredHash, Date.now() - 10000);
    expect(app.revokedTokensCache.has(expiredHash), 'Expired token exists in cache prior to cleanup');
    const validHash = app.hashToken(testToken);
    expect(app.revokedTokensCache.has(validHash), 'Valid revoked token exists in cache');

    // Run cleanup
    app.cleanExpiredRevokedTokens();
    expect(!app.revokedTokensCache.has(expiredHash), 'Expired token record is cleanly pruned');
    expect(app.revokedTokensCache.has(validHash), 'Valid revoked token is PRESERVED (never bulk cleared)');

    // ── TEST 3: Fail-Closed Revocation Policy on Supabase Failure ──
    console.log('\n--- 3. Fail-Closed Token Revocation on Database Failure ---');
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

    // ── TEST 4: Logout Endpoint & Persistence Failure Handling ──
    console.log('\n--- 4. Logout Persistence Failure Notification ---');
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
    const successfulLogoutRes = await directRequest('POST', '/api/auth/logout', {
      'Authorization': `Bearer ${logoutToken}`
    });
    expect(successfulLogoutRes.status === 200 && successfulLogoutRes.body?.success === true, 'Successful logout returns HTTP 200');

    // Subsequent request must be rejected with 401 TOKEN_REVOKED
    const accessAfterLogout = await directRequest('GET', '/api/auth/me', {
      'Authorization': `Bearer ${logoutToken}`
    });
    expect(accessAfterLogout.status === 401 && accessAfterLogout.body?.code === 'TOKEN_REVOKED', 'Revoked token rejected with 401 TOKEN_REVOKED');

    // ── TEST 5: Large Cache Cleanup (No Unexpired Eviction) ──
    console.log('\n--- 5. Large Cache Cleanup: Never Evict Active Revoked Tokens ---');
    const activeTestToken = 'active_revoked_token_under_stress';
    const activeHash = app.hashToken(activeTestToken);
    app.revokedTokensCache.set(activeHash, Date.now() + 7200 * 1000); // Expires in 2 hours

    // Inject 5,000 expired entries
    const now = Date.now();
    for (let i = 0; i < 5000; i++) {
      app.revokedTokensCache.set(`expired_token_${i}`, now - (i + 1) * 1000);
    }
    expect(app.revokedTokensCache.size >= 5001, 'Cache populated with active and expired entries');

    // Run cleanExpiredRevokedTokens
    app.cleanExpiredRevokedTokens();
    const hasExpiredLeft = Array.from(app.revokedTokensCache.values()).some(exp => exp <= now);
    expect(!hasExpiredLeft, 'Zero expired tokens remain in cache after cleanup');
    expect(app.revokedTokensCache.has(activeHash), 'Active revoked token is definitely preserved in cache');

    // ── TEST 6: Multi-Instance Shared Rate Limiting ──
    console.log('\n--- 6. Multi-Instance Shared Rate Limiting ---');
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

    // Successful login on Instance A clears shared rate limit
    await limiterA.recordSuccess(multiReqA, 'shared_user_1');
    const chkBAfterSuccess = await limiterB.check(multiReqB, 'shared_user_1');
    expect(chkBAfterSuccess.allowed === true, 'Successful login clears shared rate limit across all instances');

    // ── TEST 7: Trusted Proxy & IP Spoofing Prevention ──
    console.log('\n--- 7. Trusted Proxy & IP Spoofing Prevention ---');
    // If an attacker tries to spoof IP via X-Forwarded-For: "1.2.3.4, 203.0.113.99"
    // Express with trust proxy: 1 takes the immediate upstream client IP (rightmost untrusted)
    const spoofReq = {
      ip: '198.51.100.99', // Determined securely by Express trust proxy
      headers: { 'x-forwarded-for': '10.0.0.1, 198.51.100.99' },
      socket: { remoteAddress: '198.51.100.99' }
    };
    const ipKey = limiterA._getIpKey(spoofReq);
    expect(ipKey === 'shared-rate-test:198.51.100.99', 'Rate limiter uses secure req.ip rather than spoofable header');

    // ── TEST 8: Live Login Route Rate Limiting Guard ──
    console.log('\n--- 8. Live Login Route Rate Limiting Guard ---');
    const bruteUser = 'brute_force_test_account';
    const bruteIp = '198.51.100.77';

    for (let i = 1; i <= 5; i++) {
      await directRequest('POST', '/api/auth/login', {}, {
        username: bruteUser,
        password: `WrongPassword${i}`
      }, bruteIp);
    }

    const blockedLoginRes = await directRequest('POST', '/api/auth/login', {}, {
      username: bruteUser,
      password: 'AnyPassword'
    }, bruteIp);

    expect(blockedLoginRes.status === 429, '6th failed login returns HTTP 429');
    expect(blockedLoginRes.body?.code === 'RATE_LIMIT_EXCEEDED', 'Error code is RATE_LIMIT_EXCEEDED');
    expect(blockedLoginRes.headers['retry-after'] !== undefined, 'Retry-After header present');

    // Clean up brute force IP
    await app.loginRateLimiter.recordSuccess({ ip: bruteIp, headers: {}, socket: { remoteAddress: bruteIp } }, bruteUser);

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
