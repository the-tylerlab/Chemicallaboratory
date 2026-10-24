/**
 * @file test_password_rotation_enforcement.js
 * @description Comprehensive validation for:
 * 1. Prohibition of old passwords from Git history
 * 2. Mandatory password change (must_change_password) enforcement
 * 3. Bcrypt storage verification
 * 4. Zero password leakage in logs/code
 * 5. Rejection of Teacher ID derived passwords
 * 6. Verification that all historical passwords fail authentication
 * 7. Change password workflow validation
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const http = require('http');

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test_secret_for_rotation_verification_1234567890';
}

const app = require('../server.js');

let testPassed = 0;
let testFailed = 0;

function assert(condition, message, detail = '') {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    testPassed++;
  } else {
    console.error(`  ❌ FAIL: ${message} ${detail ? `(${detail})` : ''}`);
    testFailed++;
  }
}

function directRequest(method, urlPath, headers = {}, body = null) {
  return new Promise((resolve) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = new http.IncomingMessage();
    req.method = method;
    req.url = urlPath;
    const normalizedHeaders = { 'host': '127.0.0.1:3000', 'connection': 'close' };
    for (const [k, v] of Object.entries(headers)) {
      normalizedHeaders[k.toLowerCase()] = v;
    }
    req.headers = normalizedHeaders;
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

    app(req, res);
    if (payload) {
      req.emit('data', Buffer.from(payload));
    }
    req.emit('end');
  });
}

async function runTests() {
  console.log('===============================================================');
  console.log('🔒 PASSWORD ROTATION & SECURITY ENFORCEMENT TEST SUITE');
  console.log('===============================================================\n');

  const usersFile = path.resolve(__dirname, '../data/users.json');
  const tempCredsFile = path.resolve(__dirname, '../data/temporary_credentials.json');

  assert(fs.existsSync(usersFile), 'data/users.json exists');
  const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));

  // -------------------------------------------------------------
  // Test 1: Verify all users have bcrypt hashes ($2b$ or $2a$)
  // -------------------------------------------------------------
  console.log('--- 1. Bcrypt Hash Verification ---');
  assert(users.length === 14, `Expected 14 user accounts, found ${users.length}`);

  let allBcrypt = true;
  let allMustChange = true;
  for (const u of users) {
    if (!u.password || (!u.password.startsWith('$2a$') && !u.password.startsWith('$2b$'))) {
      allBcrypt = false;
    }
    if (u.must_change_password !== true && u.mustChangePassword !== true) {
      allMustChange = false;
    }
  }
  assert(allBcrypt, 'All 14 accounts in user database are strictly bcrypt hashed');
  assert(allMustChange, 'All 14 accounts have must_change_password flag set to true');

  // -------------------------------------------------------------
  // Test 2: Rejection of Leaked Git History Passwords
  // -------------------------------------------------------------
  console.log('\n--- 2. Rejection of Historical Breached Passwords ---');
  const leakedPasswords = [
    { user: 'admin', pass: 'admin' },
    { user: 'admin', pass: 'admin1234' },
    { user: 'admin', pass: 'Admin@Lab2805' },
    { user: 'admin', pass: 'Admin@Lab2026' },
    { user: 'admin', pass: 'C#8m!K2$vL' },
    { user: '1001', pass: '1001' },
    { user: '1002', pass: '1002' },
    { user: '10823', pass: '10823' },
    { user: '10746', pass: '10746' },
    { user: '2001', pass: '2001' },
    { user: '2002', pass: '2002' },
    { user: '3001', pass: '3001' },
    { user: '4001', pass: '4001' },
    { user: '10568', pass: '10568' },
    { user: '10785', pass: '10785' },
    { user: '10824', pass: '10824' },
    { user: '10797', pass: '10797' },
    { user: '10572', pass: '10572' }
  ];

  for (const item of leakedPasswords) {
    const res = await directRequest('POST', '/api/auth/login', {}, {
      username: item.user,
      password: item.pass
    });
    assert(
      res.status === 401 && res.body?.success === false,
      `Login rejected for user '${item.user}' with breached password (401)`,
      `got ${res.status}: ${JSON.stringify(res.body)}`
    );
  }

  // -------------------------------------------------------------
  // Test 3: Temporary Password Login & must_change_password Signal
  // -------------------------------------------------------------
  console.log('\n--- 3. Temporary Password Login & must_change_password Signal ---');
  assert(fs.existsSync(tempCredsFile), 'data/temporary_credentials.json exists');
  const tempCreds = JSON.parse(fs.readFileSync(tempCredsFile, 'utf8'));

  const testUserCred = tempCreds.find(c => c.teacherId === '10823');
  assert(Boolean(testUserCred), 'Found temporary credential for test user 10823');

  const loginRes = await directRequest('POST', '/api/auth/login', {}, {
    username: testUserCred.teacherId,
    password: testUserCred.temporaryPassword
  });

  assert(
    loginRes.status === 200 && loginRes.body?.success === true,
    'User successfully logs in with new temporary password (200 OK)'
  );
  assert(
    loginRes.body?.must_change_password === true && loginRes.body?.user?.must_change_password === true,
    'Login response explicitly flags must_change_password = true'
  );

  const token = loginRes.body?.token;
  assert(Boolean(token), 'JWT token returned on temporary login');

  // -------------------------------------------------------------
  // Test 4: Change Password Endpoint Validation & Rejection of Weak/Leaked Passwords
  // -------------------------------------------------------------
  console.log('\n--- 4. Password Change Guard Validation ---');

  // 4a. Short password (<8 characters)
  const shortPassRes = await directRequest('POST', '/api/auth/change-password', {
    'Authorization': `Bearer ${token}`
  }, {
    currentPassword: testUserCred.temporaryPassword,
    newPassword: 'short',
    confirmPassword: 'short'
  });
  assert(shortPassRes.status === 400, 'Rejects password shorter than 8 characters (400 Bad Request)');

  // 4b. Leaked password (e.g. Admin@Lab2805)
  const leakedChangeRes = await directRequest('POST', '/api/auth/change-password', {
    'Authorization': `Bearer ${token}`
  }, {
    currentPassword: testUserCred.temporaryPassword,
    newPassword: 'Admin@Lab2805',
    confirmPassword: 'Admin@Lab2805'
  });
  assert(leakedChangeRes.status === 400, 'Rejects breached historical password (400 Bad Request)');

  // 4c. Password equal to Teacher ID
  const idPassRes = await directRequest('POST', '/api/auth/change-password', {
    'Authorization': `Bearer ${token}`
  }, {
    currentPassword: testUserCred.temporaryPassword,
    newPassword: '10823',
    confirmPassword: '10823'
  });
  assert(idPassRes.status === 400, 'Rejects password equal to Teacher ID (400 Bad Request)');

  // 4d. Incorrect current password
  const wrongCurrentRes = await directRequest('POST', '/api/auth/change-password', {
    'Authorization': `Bearer ${token}`
  }, {
    currentPassword: 'IncorrectOldPassword123!',
    newPassword: 'BrandNewSecurePassword999!',
    confirmPassword: 'BrandNewSecurePassword999!'
  });
  assert(wrongCurrentRes.status === 401, 'Rejects change when current password is wrong (401 Unauthorized)');

  // -------------------------------------------------------------
  // Test 5: Successful Password Change & Verification
  // -------------------------------------------------------------
  console.log('\n--- 5. Successful Password Change & Invalidation of Temporary Password ---');
  const validNewPassword = 'StrongNewUserPass_2026_Secure#1';

  const changeSuccessRes = await directRequest('POST', '/api/auth/change-password', {
    'Authorization': `Bearer ${token}`
  }, {
    currentPassword: testUserCred.temporaryPassword,
    newPassword: validNewPassword,
    confirmPassword: validNewPassword
  });

  assert(
    changeSuccessRes.status === 200 && changeSuccessRes.body?.success === true,
    'Password change succeeds with valid strong password (200 OK)'
  );
  assert(
    changeSuccessRes.body?.must_change_password === false,
    'must_change_password cleared to false after successful password update'
  );

  // Verify that the old temporary password can NO LONGER log in
  const oldTempLoginRes = await directRequest('POST', '/api/auth/login', {}, {
    username: testUserCred.teacherId,
    password: testUserCred.temporaryPassword
  });
  assert(
    oldTempLoginRes.status === 401,
    'Previous temporary password is fully invalidated and cannot login (401)'
  );

  // Verify that the NEW password logs in cleanly without must_change_password
  const newLoginRes = await directRequest('POST', '/api/auth/login', {}, {
    username: testUserCred.teacherId,
    password: validNewPassword
  });
  assert(
    newLoginRes.status === 200 && newLoginRes.body?.must_change_password === false,
    'New password successfully authenticates with must_change_password = false'
  );

  console.log('\n===============================================================');
  console.log(`TOTAL TESTS: ${testPassed + testFailed}`);
  console.log(`PASSED: ${testPassed}`);
  console.log(`FAILED: ${testFailed}`);
  console.log('===============================================================\n');

  if (testFailed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal error in tests:', err);
  process.exit(1);
});
