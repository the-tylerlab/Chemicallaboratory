/**
 * @file test_password_hash_enforcement.js
 * @description Regression test suite ensuring:
 * 1. Plaintext & default password login channels are strictly closed in production.
 * 2. Accounts without a valid bcrypt hash ($2a$ or $2b$) are rejected immediately.
 * 3. Accounts with valid bcrypt hash can log in with the correct password.
 * 4. Breached historical credentials remain blocked.
 */

const bcrypt = require('bcryptjs');
const path = require('path');
const { Readable } = require('stream');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = '6217be650090ad98b19c98a4ffbec21f5d0a2f1d24480a969bf4190ab3f41dbed7a1e31e520250ab32ed43a5dcf06c4b35cb0ac54358efc40e6eeb67c8757bfc';
}

const app = require('../server.js');

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
      removeHeader(k) { delete resHeaders[k.toLowerCase()]; },
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
        resolve({ status: this.statusCode || statusCode, headers: resHeaders, body: json });
      }
    };

    app.handle(req, res);
  });
}

async function runTests() {
  console.log("===============================================================");
  console.log("🛡️ REGRESSION TEST: PASSWORD HASH ENFORCEMENT & PLAINTEXT CLOSURE");
  console.log("===============================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message, detail = "") {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message} ${detail ? `(${detail})` : ""}`);
      failed++;
    }
  }

  const { verifyPassword, sanitizeUser, LEAKED_HISTORICAL_PASSWORDS } = app;

  console.log("--- 1. Direct verifyPassword Function Unit Tests ---");

  // A. In Production Mode (isProd = true)
  const validHash = bcrypt.hashSync('MySecurePass@2026', 10);

  assert(
    verifyPassword('MySecurePass@2026', validHash, null, true) === true,
    'Valid bcrypt hash matches correct password in production mode'
  );

  assert(
    verifyPassword('WrongPassword', validHash, null, true) === false,
    'Incorrect password rejected with valid hash in production mode'
  );

  assert(
    verifyPassword('PlaintextSecret123', 'PlaintextSecret123', null, true) === false,
    'Plaintext password match is strictly REJECTED in production mode'
  );

  const teacherUser = { teacherId: '10999', name: 'Test Teacher' };
  assert(
    verifyPassword('10999', '10999', teacherUser, true) === false,
    'Teacher ID default password fallback is strictly REJECTED in production mode'
  );

  assert(
    verifyPassword('10999', null, teacherUser, true) === false,
    'Missing/null password hash with teacherId fallback is REJECTED in production mode'
  );

  assert(
    verifyPassword('10999', '', teacherUser, true) === false,
    'Empty password string is REJECTED in production mode'
  );

  assert(
    verifyPassword('md5_not_allowed', 'e10adc3949ba59abbe56e057f20f883e', null, true) === false,
    'Non-bcrypt hash (e.g. MD5) is strictly REJECTED in production mode'
  );

  assert(
    verifyPassword('1234', bcrypt.hashSync('1234', 10), null, true) === false,
    'Historical leaked password (1234) is blocked even if hashed in DB'
  );

  assert(
    verifyPassword('Admin@Lab2026', bcrypt.hashSync('Admin@Lab2026', 10), null, true) === false,
    'Historical leaked password (Admin@Lab2026) is permanently revoked'
  );

  console.log("\n--- 2. Direct verifyPassword Function (Development Mode Fallback) ---");
  assert(
    verifyPassword('DevPlain123', 'DevPlain123', null, false) === true,
    'In development mode only, local plaintext fallback is permitted for offline demo'
  );
  assert(
    verifyPassword('10999', '10999', teacherUser, false) === true,
    'In development mode only, teacher ID fallback is permitted for local offline demo'
  );

  console.log("\n--- 3. User Object Sanitization (No Leaked Passwords) ---");
  const rawUserWithSecrets = {
    id: 'u_test',
    teacherId: '10555',
    name: 'Test Teacher',
    password: '$2b$10$somelonghashstring...',
    password_hash: '$2b$10$somelonghashstring...',
    plain_password: 'ShouldNeverLeak',
    display_password: 'ShouldNeverLeak',
    role: 'L1'
  };

  const sanitized = sanitizeUser(rawUserWithSecrets);
  assert(!sanitized.password, 'sanitizeUser strips password');
  assert(!sanitized.password_hash, 'sanitizeUser strips password_hash');
  assert(!sanitized.plain_password, 'sanitizeUser strips plain_password');
  assert(!sanitized.display_password, 'sanitizeUser strips display_password');
  assert(sanitized.teacherId === '10555', 'sanitizeUser preserves non-sensitive user fields');

  console.log("\n--- 4. HTTP API Endpoint Login Enforcement ---");

  // Attempt login with empty credentials
  const resEmpty = await directRequest('POST', '/api/auth/login', {}, { username: '', password: '' });
  assert(resEmpty.status === 400, 'Empty login request returns 400 Bad Request');

  // Attempt login with leaked password
  const resLeaked = await directRequest('POST', '/api/auth/login', {}, { username: 'admin', password: 'password' });
  assert(
    resLeaked.status === 401 && resLeaked.body.code === 'CREDENTIAL_REVOKED_SECURITY_RESET',
    'Login with known breached password returns 401 CREDENTIAL_REVOKED_SECURITY_RESET'
  );

  // Attempt login with invalid password on existing account
  const resBadPass = await directRequest('POST', '/api/auth/login', {}, { username: '10823', password: 'WrongPassword@999' });
  assert(resBadPass.status === 401, 'Login with incorrect password returns 401 Unauthorized');

  // Non-existent user
  const resNonExistent = await directRequest('POST', '/api/auth/login', {}, { username: 'non_existent_99999', password: 'AnyPassword@123' });
  assert(resNonExistent.status === 401, 'Login with non-existent account returns 401 Unauthorized');

  console.log("\n===============================================================");
  console.log(`TOTAL TESTS: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log("===============================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
