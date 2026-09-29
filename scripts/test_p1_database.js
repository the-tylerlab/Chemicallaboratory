/**
 * Automated Verification Suite for P1 — Database: New Source of Truth
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function sleep(ms) {
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

async function runDatabaseTests() {
  console.log("==================================================");
  console.log("🧪 RUNNING P1 DATABASE SOURCE OF TRUTH TEST SUITE");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, desc) {
    if (condition) {
      console.log(`  ✅ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${desc}`);
      failed++;
    }
  }

  // 1. Verify Migration Files & Bundles
  console.log("\n--- 1. Migration System Verification ---");
  const migrationsDir = path.resolve(__dirname, '../migrations');
  const migrationFiles = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
  assert(migrationFiles.includes('001_central_schema.sql'), "Migration 001_central_schema.sql exists");
  assert(migrationFiles.includes('002_rls_policies.sql'), "Migration 002_rls_policies.sql exists");
  assert(migrationFiles.includes('003_seed_production_core.sql'), "Migration 003_seed_production_core.sql exists");

  const bundleFile = path.resolve(__dirname, '../dist/supabase_migration_bundle.sql');
  assert(fs.existsSync(bundleFile), "Consolidated migration bundle dist/supabase_migration_bundle.sql generated");

  const schemaSql = fs.readFileSync(path.join(migrationsDir, '001_central_schema.sql'), 'utf-8');
  assert(schemaSql.includes('is_deleted BOOLEAN DEFAULT false'), "Schema includes is_deleted soft-delete field");
  assert(schemaSql.includes('deleted_at TIMESTAMPTZ'), "Schema includes deleted_at soft-delete timestamp");
  assert(schemaSql.includes('deleted_by VARCHAR(64)'), "Schema includes deleted_by actor field");
  assert(schemaSql.includes('created_by VARCHAR(64)'), "Schema includes created_by audit field");
  assert(schemaSql.includes('updated_by VARCHAR(64)'), "Schema includes updated_by audit field");
  assert(schemaSql.includes('trg_items_updated_at'), "Schema defines automatic trigger for updated_at");
  assert(schemaSql.includes('uq_booking_room_slot'), "Schema defines unique constraint on active bookings room/date/slot");

  const rlsSql = fs.readFileSync(path.join(migrationsDir, '002_rls_policies.sql'), 'utf-8');
  assert(rlsSql.includes('ALTER TABLE public.items ENABLE ROW LEVEL SECURITY'), "RLS enabled on items table");
  assert(rlsSql.includes('ALTER TABLE public.users ENABLE ROW LEVEL SECURITY'), "RLS enabled on users table");
  assert(rlsSql.includes('CREATE OR REPLACE VIEW public.user_directory'), "Safe user_directory view defined to mask passwords");

  // 2. Start server for live API tests
  console.log("\n--- 2. Starting Test Server ---");
  const server = spawn('node', ['server.js'], {
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, PORT: '3001' }
  });

  let serverStarted = false;
  for (let i = 0; i < 20; i++) {
    await sleep(300);
    try {
      const res = await request({ host: '127.0.0.1', port: 3001, path: '/api/version', method: 'GET' });
      if (res.status === 200) {
        serverStarted = true;
        break;
      }
    } catch(e) {}
  }
  assert(serverStarted, "Server started successfully on port 3001");

  try {
    // Authenticate as Admin
    const loginRes = await request({
      host: '127.0.0.1', port: 3001, path: '/api/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: 'admin', password: 'admin' });
    const token = loginRes.body.token;
    assert(!!token, "Admin login successful and returned JWT token");

    // 3. Test Item Creation with Audit Fields
    console.log("\n--- 3. Audit Fields & Source of Truth ---");
    const testItemCode = `TEST-P1-${Date.now()}`;
    const createRes = await request({
      host: '127.0.0.1', port: 3001, path: '/api/items', method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, {
      code: testItemCode,
      name: "กรดไนตริก 68% สำหรับทดสอบ P1",
      category: "สารเคมี",
      qty: 10,
      unit: "ขวด",
      minAlert: 2,
      room: "Lab 1",
      cabinet: "ตู้ A",
      shelf: "ชั้น 1"
    });

    assert(createRes.status === 201, "POST /api/items creates item successfully (201 Created)");
    assert(createRes.body.created_by || createRes.body.createdBy, "Item includes created_by / createdBy audit metadata");
    assert(createRes.body.updated_by || createRes.body.updatedBy, "Item includes updated_by / updatedBy audit metadata");
    assert(createRes.body.is_deleted === false, "Item explicitly flagged as is_deleted = false");

    // 4. Test Soft Delete
    console.log("\n--- 4. Soft Delete Verification ---");
    const deleteRes = await request({
      host: '127.0.0.1', port: 3001, path: `/api/items/${testItemCode}`, method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    assert(deleteRes.status === 200 && deleteRes.body.success, "DELETE /api/items/:code responds 200 OK");

    // Verify item is hidden from active list
    const listRes = await request({ host: '127.0.0.1', port: 3001, path: '/api/items', method: 'GET' });
    const stillPresent = Array.isArray(listRes.body) && listRes.body.some(i => i.code === testItemCode);
    assert(!stillPresent, "Soft-deleted item is excluded from subsequent GET /api/items queries");

    // 5. User Soft Delete
    console.log("\n--- 5. User Soft Delete Verification ---");
    const tempUserId = `u_test_p1_${Date.now()}`;
    const tempTeacherId = `T_P1_${Date.now()}`;
    const createUserRes = await request({
      host: '127.0.0.1', port: 3001, path: '/api/users', method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, {
      teacherId: tempTeacherId,
      name: "ครูทดสอบ P1",
      department: "กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี",
      role: "L1"
    });
    assert(createUserRes.status === 200, "POST /api/users created temporary test user");
    const createdUserId = createUserRes.body.user.id;

    const deleteUserRes = await request({
      host: '127.0.0.1', port: 3001, path: `/api/users/${createdUserId}`, method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    assert(deleteUserRes.status === 200, "DELETE /api/users/:id soft-deletes user successfully");

    const usersListRes = await request({ host: '127.0.0.1', port: 3001, path: '/api/users', method: 'GET' });
    const userStillPresent = Array.isArray(usersListRes.body) && usersListRes.body.some(u => u.id === createdUserId || u.teacherId === tempTeacherId);
    assert(!userStillPresent, "Soft-deleted user is excluded from GET /api/users");

  } finally {
    server.kill();
  }

  console.log("\n==================================================");
  console.log(`TOTAL DATABASE TESTS: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runDatabaseTests().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
