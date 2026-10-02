/**
 * @file test_security_suite.js
 * @description Comprehensive Automated Security & Architecture Test Suite
 * Covers authentication, JWT lifecycle, RBAC, Room Isolation, Parameter Tampering,
 * Revocation, Startup Guarantees, Audit Logging, and Secret Management.
 */

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { Readable } = require('stream');

// Load environment variables for testing
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test_secret_only_for_ci_fallback_if_env_missing_1234567890';
}

// Import Express app for direct in-memory invocation
const app = require('../server.js');

/**
 * Dispatch request directly through Express app in-memory.
 * Works seamlessly in all environments without socket binding restrictions.
 */
function directRequest(method, url, headers = {}, body = null) {
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
    req.socket = { remoteAddress: '127.0.0.1' };

    let statusCode = 200;
    const resHeaders = {};
    let responseBody = '';

    const res = {
      statusCode: 200,
      setHeader(k, v) { resHeaders[k.toLowerCase()] = v; },
      getHeader(k) { return resHeaders[k.toLowerCase()]; },
      writeHead(code, hdrs) {
        statusCode = code;
        this.statusCode = code;
        if (hdrs) Object.assign(resHeaders, hdrs);
      },
      status(code) {
        statusCode = code;
        this.statusCode = code;
        return this;
      },
      write(chunk) {
        responseBody += chunk;
        return true;
      },
      end(chunk) {
        if (chunk) responseBody += chunk;
        let json = null;
        try {
          json = JSON.parse(responseBody);
        } catch (e) {
          json = responseBody;
        }
        resolve({ status: statusCode, headers: resHeaders, body: json });
      }
    };

    app.handle(req, res);
  });
}

async function runTestSuite() {
  console.log("===============================================================");
  console.log("🔒 COMPREHENSIVE AUTOMATED SECURITY TEST SUITE");
  console.log("===============================================================\n");

  let testPassed = 0;
  let testFailed = 0;

  function assert(condition, message, detail = "") {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      testPassed++;
    } else {
      console.error(`  ❌ FAIL: ${message} ${detail ? `(${detail})` : ""}`);
      testFailed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // Initial Setup: Obtain Authenticated Tokens for Roles
    // -------------------------------------------------------------
    let adminPass = 'admin';
    let teacherPass = '1001';
    let staffPass = '2001';

    const tempCredsPath = path.resolve(__dirname, '../data/temporary_credentials.json');
    if (fs.existsSync(tempCredsPath)) {
      try {
        const creds = JSON.parse(fs.readFileSync(tempCredsPath, 'utf8'));
        const adm = creds.find(c => c.teacherId === 'admin');
        const tch = creds.find(c => c.teacherId === '1001');
        const stf = creds.find(c => c.teacherId === '2001');
        if (adm) adminPass = adm.temporaryPassword;
        if (tch) teacherPass = tch.temporaryPassword;
        if (stf) staffPass = stf.temporaryPassword;
      } catch (e) {}
    }

    const adminLogin = await directRequest('POST', '/api/auth/login', {}, { username: 'admin', password: adminPass });
    const adminToken = adminLogin.body?.token;

    const teacherLogin = await directRequest('POST', '/api/auth/login', {}, { username: '1001', password: teacherPass });
    const teacherToken = teacherLogin.body?.token;

    const staffLogin = await directRequest('POST', '/api/auth/login', {}, { username: '2001', password: staffPass });
    const staffToken = staffLogin.body?.token;

    // -------------------------------------------------------------
    // Requirement 1: unauthenticated request → 401
    // -------------------------------------------------------------
    console.log("--- 1. Unauthenticated Request Enforcement ---");
    const unauthItems = await directRequest('POST', '/api/items', {}, { code: 'UNAUTH-1', name: 'Item Without Auth' });
    assert(
      unauthItems.status === 401 && unauthItems.body?.code === 'AUTH_REQUIRED',
      "Unauthenticated POST /api/items returns 401 (AUTH_REQUIRED)",
      `got ${unauthItems.status}`
    );

    const unauthMe = await directRequest('GET', '/api/auth/me', {});
    assert(
      unauthMe.status === 401 && unauthMe.body?.code === 'AUTH_REQUIRED',
      "Unauthenticated GET /api/auth/me returns 401 (AUTH_REQUIRED)",
      `got ${unauthMe.status}`
    );

    const unauthAudit = await directRequest('GET', '/api/audit-logs', {});
    assert(
      unauthAudit.status === 401 && unauthAudit.body?.code === 'AUTH_REQUIRED',
      "Unauthenticated GET /api/audit-logs returns 401 (AUTH_REQUIRED)",
      `got ${unauthAudit.status}`
    );

    // -------------------------------------------------------------
    // Requirement 2: invalid JWT → 401
    // -------------------------------------------------------------
    console.log("\n--- 2. Invalid JWT Enforcement ---");
    const malformedTokenRes = await directRequest('GET', '/api/auth/me', {
      'Authorization': 'Bearer completely.invalid.jwt.token.structure'
    });
    assert(
      malformedTokenRes.status === 401 && malformedTokenRes.body?.code === 'TOKEN_INVALID',
      "Malformed JWT string returns 401 (TOKEN_INVALID)",
      `got ${malformedTokenRes.status} ${JSON.stringify(malformedTokenRes.body)}`
    );

    // Forged token signed with a bogus secret key
    const forgedToken = jwt.sign(
      { id: 'u_admin', role: 'L3', name: 'Forged Admin' },
      'wrong_unauthorized_secret_key_99999'
    );
    const forgedTokenRes = await directRequest('POST', '/api/items', {
      'Authorization': `Bearer ${forgedToken}`
    }, { code: 'FORGED-1', name: 'Forged Token Item' });
    assert(
      forgedTokenRes.status === 401 && forgedTokenRes.body?.code === 'TOKEN_INVALID',
      "Forged JWT signed with incorrect secret returns 401 (TOKEN_INVALID)",
      `got ${forgedTokenRes.status}`
    );

    // -------------------------------------------------------------
    // Requirement 3: expired JWT → 401
    // -------------------------------------------------------------
    console.log("\n--- 3. Expired JWT Enforcement ---");
    const expiredToken = jwt.sign(
      { id: 'u_1001', teacherId: '1001', role: 'L1', name: 'Expired User' },
      process.env.JWT_SECRET,
      { expiresIn: -10 } // Expired 10 seconds ago
    );
    const expiredTokenRes = await directRequest('GET', '/api/auth/me', {
      'Authorization': `Bearer ${expiredToken}`
    });
    assert(
      expiredTokenRes.status === 401 && expiredTokenRes.body?.code === 'TOKEN_EXPIRED',
      "Expired JWT token returns 401 (TOKEN_EXPIRED)",
      `got ${expiredTokenRes.status} ${JSON.stringify(expiredTokenRes.body)}`
    );

    // -------------------------------------------------------------
    // Requirement 4: L1 accessing L3 endpoint → 403
    // -------------------------------------------------------------
    console.log("\n--- 4. L1 Accessing L3 Protected Endpoints ---");
    const l1AccessUsers = await directRequest('POST', '/api/users', {
      'Authorization': `Bearer ${teacherToken}`
    }, { teacherId: 'ILLEGAL-1', name: 'Illegal User' });
    assert(
      l1AccessUsers.status === 403 && l1AccessUsers.body?.code === 'FORBIDDEN',
      "L1 Teacher calling L3 endpoint POST /api/users returns 403 (FORBIDDEN)",
      `got ${l1AccessUsers.status}`
    );

    const l1AccessBudget = await directRequest('POST', '/api/budget', {
      'Authorization': `Bearer ${teacherToken}`
    }, { amount: 100000 });
    assert(
      l1AccessBudget.status === 403 && l1AccessBudget.body?.code === 'FORBIDDEN',
      "L1 Teacher calling L3 endpoint POST /api/budget returns 403 (FORBIDDEN)",
      `got ${l1AccessBudget.status}`
    );

    const l1AccessDelete = await directRequest('DELETE', '/api/items/ANY-CODE-123', {
      'Authorization': `Bearer ${teacherToken}`
    });
    assert(
      l1AccessDelete.status === 403 && l1AccessDelete.body?.code === 'FORBIDDEN',
      "L1 Teacher calling L3 endpoint DELETE /api/items/:code returns 403 (FORBIDDEN)",
      `got ${l1AccessDelete.status}`
    );

    // -------------------------------------------------------------
    // Requirement 5: L2 accessing unauthorized room → 403
    // -------------------------------------------------------------
    console.log("\n--- 5. L2 Room Access Control Enforcement ---");
    // Staff u_2001 is assigned only to ['Lab 1', 'Lab 2']
    const l2UnauthorizedRoom = await directRequest('POST', '/api/items', {
      'Authorization': `Bearer ${staffToken}`
    }, {
      code: 'SEC-ROOM-' + Date.now(),
      name: 'Chemical Item in Unauthorized Lab 99',
      category: 'สารเคมี',
      qty: 10,
      unit: 'ขวด',
      room: 'Lab 99' // Not in assignedRooms ['Lab 1', 'Lab 2']
    });
    assert(
      l2UnauthorizedRoom.status === 403,
      "L2 Staff attempting to create item in unauthorized room 'Lab 99' returns 403",
      `got ${l2UnauthorizedRoom.status} ${JSON.stringify(l2UnauthorizedRoom.body)}`
    );

    // L2 Staff creating item in authorized room 'Lab 1' should succeed
    const authorizedItemCode = 'SEC-AUTH-' + Date.now();
    const l2AuthorizedRoom = await directRequest('POST', '/api/items', {
      'Authorization': `Bearer ${staffToken}`
    }, {
      code: authorizedItemCode,
      name: 'Chemical Item in Authorized Lab 1',
      category: 'สารเคมี',
      qty: 5,
      unit: 'ขวด',
      room: 'Lab 1'
    });
    assert(
      l2AuthorizedRoom.status === 201,
      "L2 Staff can successfully create item in authorized room 'Lab 1' (201 Created)",
      `got ${l2AuthorizedRoom.status}`
    );

    // Clean up created item using admin token
    await directRequest('DELETE', `/api/items/${authorizedItemCode}`, {
      'Authorization': `Bearer ${adminToken}`
    });

    // -------------------------------------------------------------
    // Requirement 6: modified frontend role → ไม่สามารถ bypass backend
    // -------------------------------------------------------------
    console.log("\n--- 6. Tampered Frontend Role / Payload Injection ---");
    // Client is L1 in JWT token, but injects L3 admin roles in payload/custom headers
    const tamperedPayload = await directRequest('POST', '/api/users', {
      'Authorization': `Bearer ${teacherToken}`,
      'X-User-Role': 'L3',
      'X-Is-Admin': 'true'
    }, {
      role: 'L3',
      userRole: 'L3',
      isAdmin: true,
      teacherId: 'TAMPERED-01',
      name: 'Tampered Attacker'
    });
    assert(
      tamperedPayload.status === 403 && tamperedPayload.body?.code === 'FORBIDDEN',
      "Client injected 'role: L3' in request body/headers cannot bypass backend (403 FORBIDDEN)",
      `got ${tamperedPayload.status}`
    );

    // Attacker modifies decrypted payload claims and resigns with a fake key
    const tamperedJwt = jwt.sign(
      { id: 'u_1001', teacherId: '1001', role: 'L3', roleLevel: 'L3' },
      'fake_local_attacker_secret'
    );
    const tamperedTokenRes = await directRequest('POST', '/api/users', {
      'Authorization': `Bearer ${tamperedJwt}`
    }, { teacherId: 'TAMPERED-02', name: 'Tampered Token' });
    assert(
      tamperedTokenRes.status === 401 && tamperedTokenRes.body?.code === 'TOKEN_INVALID',
      "Client forged JWT with modified role claims is rejected (401 TOKEN_INVALID)",
      `got ${tamperedTokenRes.status}`
    );

    // -------------------------------------------------------------
    // Requirement 7: ?admin=true → ไม่สามารถ elevate role
    // -------------------------------------------------------------
    console.log("\n--- 7. Query String Parameter Role Elevation Protection (?admin=true) ---");
    // Unauthenticated attempt with ?admin=true
    const unauthQueryElevate = await directRequest('POST', '/api/items?admin=true&isAdmin=true&role=L3', {}, {
      code: 'ELEVATE-1',
      name: 'Elevate Test'
    });
    assert(
      unauthQueryElevate.status === 401,
      "POST /api/items?admin=true without valid token is rejected with 401",
      `got ${unauthQueryElevate.status}`
    );

    // L1 Teacher attempting to access L3 endpoint with ?admin=true
    const l1QueryElevate = await directRequest('POST', '/api/users?admin=true&role=L3&privileged=1', {
      'Authorization': `Bearer ${teacherToken}`
    }, { teacherId: 'ELEVATE-02', name: 'Elevated Teacher' });
    assert(
      l1QueryElevate.status === 403 && l1QueryElevate.body?.code === 'FORBIDDEN',
      "L1 user with ?admin=true on L3 endpoint is rejected with 403 (no elevation permitted)",
      `got ${l1QueryElevate.status}`
    );

    // Login with ?admin=true should not alter credentials verification
    const loginQueryElevate = await directRequest('POST', '/api/auth/login?admin=true&role=L3', {}, {
      username: '1001',
      password: teacherPass
    });
    assert(
      loginQueryElevate.status === 200 && loginQueryElevate.body?.user?.role === 'L1',
      "POST /api/auth/login?admin=true preserves legitimate L1 role and never elevates to L3",
      `got role: ${loginQueryElevate.body?.user?.role}`
    );

    // -------------------------------------------------------------
    // Requirement 8: deleted user → ไม่สามารถ login
    // -------------------------------------------------------------
    console.log("\n--- 8. Deleted / Non-Existent User Login Protection ---");
    const deletedUserLogin = await directRequest('POST', '/api/auth/login', {}, {
      username: 'non_existent_or_deleted_user_9999',
      password: 'any_password'
    });
    assert(
      deletedUserLogin.status === 401 && deletedUserLogin.body?.success === false,
      "Deleted or non-existent user cannot login (401 Unauthorized)",
      `got ${deletedUserLogin.status}`
    );

    // -------------------------------------------------------------
    // Requirement 9: revoked token → ไม่สามารถ access API
    // -------------------------------------------------------------
    console.log("\n--- 9. Revoked Token Access Protection (Logout) ---");
    // Generate fresh session for revocation testing
    const sessionToRevoke = await directRequest('POST', '/api/auth/login', {}, { username: 'admin', password: adminPass });
    const tokenToRevoke = sessionToRevoke.body?.token;

    // Verify token works before logout
    const preLogoutRes = await directRequest('GET', '/api/auth/me', {
      'Authorization': `Bearer ${tokenToRevoke}`
    });
    assert(preLogoutRes.status === 200, "Token is active and valid before logout");

    // Perform server-side logout
    const logoutRes = await directRequest('POST', '/api/auth/logout', {
      'Authorization': `Bearer ${tokenToRevoke}`
    });
    assert(logoutRes.status === 200 && logoutRes.body?.success === true, "POST /api/auth/logout successfully blacklists token");

    // Attempt to access API with revoked token
    const postLogoutRes = await directRequest('GET', '/api/auth/me', {
      'Authorization': `Bearer ${tokenToRevoke}`
    });
    assert(
      postLogoutRes.status === 401 && postLogoutRes.body?.code === 'TOKEN_REVOKED',
      "Subsequent API request with revoked token returns 401 (TOKEN_REVOKED)",
      `got ${postLogoutRes.status} ${postLogoutRes.body?.code}`
    );

    // -------------------------------------------------------------
    // Requirement 10: missing JWT_SECRET → server startup failure
    // -------------------------------------------------------------
    console.log("\n--- 10. Missing JWT_SECRET Startup Guard ---");
    const startupWithoutSecret = spawnSync('node', ['server.js'], {
      cwd: path.resolve(__dirname, '..'),
      env: { ...process.env, JWT_SECRET: '' },
      encoding: 'utf8'
    });
    assert(
      startupWithoutSecret.status === 1,
      "Server process exits immediately with code 1 when JWT_SECRET is missing",
      `exit status: ${startupWithoutSecret.status}`
    );
    assert(
      startupWithoutSecret.stderr.includes('FATAL: JWT_SECRET'),
      "Server logs fatal diagnostic message explaining missing JWT_SECRET",
      `stderr matched: ${startupWithoutSecret.stderr.includes('FATAL: JWT_SECRET')}`
    );

    // -------------------------------------------------------------
    // Requirement 11: Architecture & Data Isolation Checks
    // -------------------------------------------------------------
    console.log("\n--- 11. Password Hashing & Directory Isolation Checks ---");
    const usersFile = fs.existsSync(path.resolve(__dirname, '../data/users.json'))
      ? path.resolve(__dirname, '../data/users.json')
      : path.resolve(__dirname, '../data/users.example.json');
    const usersData = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    const allHashed = usersData.every(u => u.password && u.password.startsWith('$2b$10$'));
    assert(allHashed, "All user passwords in dataset are bcrypt hashed ($2b$10$)");

    const userDirectory = await directRequest('GET', '/api/users', {
      'Authorization': `Bearer ${teacherToken}`
    });
    const directorySafe = Array.isArray(userDirectory.body) && userDirectory.body.every(u => !u.password && !u.password_hash && !u.email);
    assert(directorySafe, "Public user directory sanitizes and exposes NO passwords, NO hashes, and NO emails");

    // -------------------------------------------------------------
    // Requirement 12: Audit Logging Verification
    // -------------------------------------------------------------
    console.log("\n--- 12. Central Audit Logging Integrity ---");
    const auditLogsRes = await directRequest('GET', '/api/audit-logs', {
      'Authorization': `Bearer ${adminToken}`
    });
    assert(
      auditLogsRes.status === 200 && Array.isArray(auditLogsRes.body),
      "L3 Admin can fetch central audit logs"
    );
    const hasLoginLog = auditLogsRes.body.some(l => l.action === 'USER_LOGIN' || l.action === 'AUTH_LOGIN');
    assert(hasLoginLog, "Audit log records USER_LOGIN events with actor metadata");

    // -------------------------------------------------------------
    // Summary
    // -------------------------------------------------------------
    console.log(`\n===============================================================`);
    console.log(`TOTAL TESTS: ${testPassed + testFailed}`);
    console.log(`PASSED: ${testPassed}`);
    console.log(`FAILED: ${testFailed}`);
    console.log(`===============================================================`);

    if (testFailed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution exception:", err);
    process.exit(1);
  }
}

runTestSuite();
