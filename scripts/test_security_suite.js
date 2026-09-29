const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(body);
        } catch(e) {
          json = body;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log("=== STARTING SECURITY & ARCHITECTURE TEST SUITE ===");
  
  // 1. Start server process
  const serverProcess = spawn('node', ['server.js'], {
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, PORT: '3000' }
  });

  serverProcess.stdout.on('data', (d) => process.stdout.write(`[SERVER] ${d}`));
  serverProcess.stderr.on('data', (d) => process.stderr.write(`[SERVER ERR] ${d}`));

  let serverStarted = false;
  for (let i = 0; i < 20; i++) {
    await sleep(300);
    try {
      const res = await request({ host: 'localhost', port: 3000, path: '/api/version', method: 'GET' });
      if (res.status === 200) {
        serverStarted = true;
        break;
      }
    } catch(e) {}
  }

  if (!serverStarted) {
    console.error("❌ Server failed to start on port 3000");
    serverProcess.kill();
    process.exit(1);
  }

  console.log("✅ Server started successfully on port 3000\n");

  let testPassed = 0;
  let testFailed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      testPassed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      testFailed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // Test 1 & 2: Authentication & Password Hashing
    // -------------------------------------------------------------
    console.log("--- 1. Authentication & Password Hashing ---");
    // Verify data/users.json has no plaintext passwords
    const usersData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/users.json'), 'utf8'));
    const allHashed = usersData.every(u => u.password && u.password.startsWith('$2b$10$'));
    assert(allHashed, "All passwords in data/users.json are hashed with bcrypt ($2b$10$)");

    // Invalid login
    const failLogin = await request({
      host: 'localhost', port: 3000, path: '/api/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: 'admin', password: 'wrongpassword' });
    assert(failLogin.status === 401 && failLogin.body.success === false, "Reject invalid credentials with 401");

    // Valid admin login
    const adminLogin = await request({
      host: 'localhost', port: 3000, path: '/api/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: 'admin', password: 'admin' });
    assert(adminLogin.status === 200 && adminLogin.body.token, "Valid admin login returns JWT token");
    assert(adminLogin.body.user && !adminLogin.body.user.password, "Login response sanitizes and strips password");
    const adminToken = adminLogin.body.token;

    // Valid teacher login (L1)
    const teacherLogin = await request({
      host: 'localhost', port: 3000, path: '/api/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: '10746', password: '10746' });
    assert(teacherLogin.status === 200 && teacherLogin.body.user.role === 'L1', "Teacher login returns L1 user profile");
    const teacherToken = teacherLogin.body.token;

    // -------------------------------------------------------------
    // Test 3: Session Expiry & Server-Side Logout (Item 11)
    // -------------------------------------------------------------
    console.log("\n--- 2. Session Management & Logout ---");
    const meBefore = await request({
      host: 'localhost', port: 3000, path: '/api/auth/me', method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(meBefore.status === 200 && meBefore.body.user.teacherId === 'admin', "GET /api/auth/me authenticates valid JWT");

    // Server-side logout (revocation)
    const logoutRes = await request({
      host: 'localhost', port: 3000, path: '/api/auth/logout', method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(logoutRes.status === 200 && logoutRes.body.success, "POST /api/auth/logout revokes token on server");

    // Re-check me with revoked token
    const meAfter = await request({
      host: 'localhost', port: 3000, path: '/api/auth/me', method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(meAfter.status === 401 && meAfter.body.code === 'TOKEN_REVOKED', "Revoked token is rejected on subsequent calls (401 TOKEN_REVOKED)");

    // Login fresh admin for subsequent tests
    const freshAdminLogin = await request({
      host: 'localhost', port: 3000, path: '/api/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: 'admin', password: 'admin' });
    const freshAdminToken = freshAdminLogin.body.token;

    // -------------------------------------------------------------
    // Test 4 & 7: RBAC & API Authorization (Items 4, 7)
    // -------------------------------------------------------------
    console.log("\n--- 3. RBAC & API Authorization ---");
    
    // Unauthenticated request to protected endpoint
    const unauthItem = await request({
      host: 'localhost', port: 3000, path: '/api/items', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { code: 'TEST-001', name: 'สารทดสอบ' });
    assert(unauthItem.status === 401, "Unauthenticated POST /api/items returns 401 Unauthorized");

    // L1 Teacher attempting to create item (L2/L3 required)
    const teacherItem = await request({
      host: 'localhost', port: 3000, path: '/api/items', method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${teacherToken}`
      }
    }, { code: 'TEST-001', name: 'สารทดสอบ' });
    assert(teacherItem.status === 403, "L1 Teacher attempting POST /api/items returns 403 Forbidden");

    // L3 Admin creating item
    const testItemCode = 'SEC-TEST-' + Date.now();
    const adminItem = await request({
      host: 'localhost', port: 3000, path: '/api/items', method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${freshAdminToken}`
      }
    }, { code: testItemCode, name: 'สารทดสอบความปลอดภัย', room: 'Lab 1', cabinet: 'ตู้ 1', shelf: 'ชั้น 1', qty: 5, unit: 'ขวด', category: 'สารเคมี' });
    if (adminItem.status !== 201) console.log("adminItem error:", adminItem.status, adminItem.body);
    assert(adminItem.status === 201, "L3 Admin can create items (201 Created)");

    // Clean up created item
    const deleteItem = await request({
      host: 'localhost', port: 3000, path: `/api/items/${testItemCode}`, method: 'DELETE',
      headers: { 'Authorization': `Bearer ${freshAdminToken}` }
    });
    assert(deleteItem.status === 200, "L3 Admin can delete item (200 OK)");

    // -------------------------------------------------------------
    // Test 5: Data Access Isolation (Item 12)
    // -------------------------------------------------------------
    console.log("\n--- 4. Data Access Isolation (Item 12) ---");
    
    // Non-admin GET /api/users returns safe directory, no sensitive info
    const publicUsers = await request({
      host: 'localhost', port: 3000, path: '/api/users', method: 'GET',
      headers: { 'Authorization': `Bearer ${teacherToken}` }
    });
    assert(publicUsers.status === 200, "Non-admin can read user directory");
    const noPasswordsInDirectory = publicUsers.body.every(u => !u.password && !u.email);
    assert(noPasswordsInDirectory, "Public user directory exposes NO passwords and NO emails");

    // Admin GET /api/users
    const adminUsers = await request({
      host: 'localhost', port: 3000, path: '/api/users', method: 'GET',
      headers: { 'Authorization': `Bearer ${freshAdminToken}` }
    });
    const noAdminPasswords = adminUsers.body.every(u => !u.password);
    assert(noAdminPasswords, "Admin user management list exposes NO passwords");

    // -------------------------------------------------------------
    // Test 6: Audit Logging (Item 10)
    // -------------------------------------------------------------
    console.log("\n--- 5. Audit Logging (Item 10) ---");
    const auditLogsRes = await request({
      host: 'localhost', port: 3000, path: '/api/audit-logs', method: 'GET',
      headers: { 'Authorization': `Bearer ${freshAdminToken}` }
    });
    if (auditLogsRes.status !== 200) console.log("auditLogsRes err:", auditLogsRes.status, auditLogsRes.body);
    assert(auditLogsRes.status === 200 && Array.isArray(auditLogsRes.body), "Admin can fetch audit logs");
    const hasLoginAudit = Array.isArray(auditLogsRes.body) && auditLogsRes.body.some(log => (log.action === 'USER_LOGIN' || log.action === 'AUTH_LOGIN') && (log.actorId === 'admin' || log.actorId === 'u_admin'));
    const hasItemAudit = Array.isArray(auditLogsRes.body) && auditLogsRes.body.some(log => log.action === 'ITEM_CREATE');
    assert(hasLoginAudit, "Audit log records USER_LOGIN action with actor ID");
    assert(hasItemAudit, "Audit log records ITEM_CREATE action with resource details");

    // -------------------------------------------------------------
    // Test 7: Secrets & Environment (Item 9)
    // -------------------------------------------------------------
    console.log("\n--- 6. Secrets & Environment (Item 9) ---");
    assert(fs.existsSync(path.resolve(__dirname, '../.env')), ".env file exists");
    assert(fs.existsSync(path.resolve(__dirname, '../.env.example')), ".env.example file exists");
    const gitignoreContent = fs.readFileSync(path.resolve(__dirname, '../.gitignore'), 'utf8');
    assert(gitignoreContent.includes('.env*'), ".gitignore includes .env* pattern to protect secrets");

    // -------------------------------------------------------------
    // Summary
    // -------------------------------------------------------------
    console.log(`\n========================================`);
    console.log(`TOTAL TESTS: ${testPassed + testFailed}`);
    console.log(`PASSED: ${testPassed}`);
    console.log(`FAILED: ${testFailed}`);
    console.log(`========================================`);

  } catch(err) {
    console.error("Test error:", err);
  } finally {
    serverProcess.kill('SIGINT');
  }
}

runTestSuite();
