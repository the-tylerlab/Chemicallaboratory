/**
 * Automated Verification Suite for 🟡 P2 — Inventory:
 * Chemical Master Data, Alerts, Movements, Adjustments, QR & Compatibility
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

async function runInventoryTests() {
  console.log("==================================================");
  console.log("🧪 RUNNING 🟡 P2 INVENTORY SPECIFICATION TESTS");
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

  // 1. Verify Migration 004
  console.log("\n--- 1. Migration 004 Verification ---");
  const migPath = path.resolve(__dirname, '../migrations/004_p2_inventory_advanced.sql');
  assert(fs.existsSync(migPath), "004_p2_inventory_advanced.sql exists");
  const migSql = fs.readFileSync(migPath, 'utf-8');
  assert(migSql.includes('lot_number VARCHAR(64)'), "Schema includes lot_number");
  assert(migSql.includes('reorder_point NUMERIC'), "Schema includes reorder_point");
  assert(migSql.includes('safety_stock NUMERIC'), "Schema includes safety_stock");
  assert(migSql.includes('CREATE TABLE IF NOT EXISTS public.stock_movements'), "Schema defines stock_movements table");
  assert(migSql.includes('CREATE TABLE IF NOT EXISTS public.stock_adjustments'), "Schema defines stock_adjustments table");

  // 2. Start Test Server on port 3002
  console.log("\n--- 2. Starting Server on Port 3002 ---");
  const server = spawn('node', ['server.js'], {
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, PORT: '3002' }
  });

  let serverStarted = false;
  for (let i = 0; i < 20; i++) {
    await sleep(300);
    try {
      const res = await request({ host: '127.0.0.1', port: 3002, path: '/api/version', method: 'GET' });
      if (res.status === 200) {
        serverStarted = true;
        break;
      }
    } catch(e) {}
  }
  assert(serverStarted, "Server started successfully on port 3002");

  try {
    // Authenticate Admin
    const loginRes = await request({
      host: '127.0.0.1', port: 3002, path: '/api/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: 'admin', password: 'admin' });
    const token = loginRes.body.token;
    assert(!!token, "Admin login successful with valid JWT");

    // 3. Test Multi-factor Alerts
    console.log("\n--- 3. Multi-Factor Inventory Alerts ---");
    const alertsRes = await request({ host: '127.0.0.1', port: 3002, path: '/api/inventory/alerts', method: 'GET' });
    assert(alertsRes.status === 200 && alertsRes.body.success, "GET /api/inventory/alerts responds 200 OK");
    assert(alertsRes.body.counts !== undefined, "Alerts response contains counts summary");
    assert(Array.isArray(alertsRes.body.alerts.lowStock), "Alerts response contains lowStock list");
    assert(Array.isArray(alertsRes.body.alerts.reorderNeeded), "Alerts response contains reorderNeeded list");
    assert(Array.isArray(alertsRes.body.alerts.expired), "Alerts response contains expired list");

    // 4. Chemical Compatibility Matrix
    console.log("\n--- 4. Chemical Compatibility Matrix ---");
    const compatConflictRes = await request({
      host: '127.0.0.1', port: 3002, path: '/api/inventory/compatibility?groupA=Acids&groupB=Bases', method: 'GET'
    });
    assert(compatConflictRes.status === 200 && compatConflictRes.body.compatible === false, "Incompatibility detected for Acids + Bases");
    assert(compatConflictRes.body.severity === 'danger', "Severity evaluated as 'danger'");

    const compatSafeRes = await request({
      host: '127.0.0.1', port: 3002, path: '/api/inventory/compatibility?groupA=General&groupB=General', method: 'GET'
    });
    assert(compatSafeRes.status === 200 && compatSafeRes.body.compatible === true, "Compatibility confirmed for General + General");

    // 5. QR Code Asset Tagging
    console.log("\n--- 5. QR Code Asset Tagging ---");
    const qrRes = await request({ host: '127.0.0.1', port: 3002, path: '/api/inventory/qr/CHEM-001', method: 'GET' });
    assert(qrRes.status === 200 && qrRes.body.success, "GET /api/inventory/qr/:code responds 200 OK");
    assert(qrRes.body.summary.format === 'SCIPORTAL-LAB-V2', "QR payload formatted to SCIPORTAL-LAB-V2 standard");
    assert(qrRes.body.summary.code === 'CHEM-001', "QR payload contains matching asset code");

    // 6. Stock Movements (IN, OUT, DISPOSE)
    console.log("\n--- 6. Stock Movement Tracking ---");
    // Create a temporary test chemical
    const testCode = `P2-TEST-${Date.now()}`;
    await request({
      host: '127.0.0.1', port: 3002, path: '/api/items', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    }, {
      code: testCode,
      name: "กรดไฮโดรคลอริกสำหรับทดสอบสต็อก P2",
      category: "สารเคมี",
      qty: 20,
      unit: "ขวด",
      minAlert: 5,
      reorderPoint: 10,
      safetyStock: 3,
      room: "Lab 1",
      cabinet: "ตู้ A",
      shelf: "ชั้น 1",
      storageGroup: "Acids"
    });

    // Record OUT movement (dispensed 5 bottles)
    const movOutRes = await request({
      host: '127.0.0.1', port: 3002, path: '/api/inventory/movements', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    }, {
      itemCode: testCode,
      type: "OUT",
      quantity: 5,
      reason: "เบิกทำการทดลองการไทเทรต ม.5"
    });
    assert(movOutRes.status === 201 && movOutRes.body.success, "POST /api/inventory/movements records OUT movement (201 Created)");
    assert(movOutRes.body.currentStock === 15, "Current stock updated from 20 to 15 bottles");

    // Query movement history
    const histRes = await request({
      host: '127.0.0.1', port: 3002, path: `/api/inventory/movements?itemCode=${testCode}`, method: 'GET'
    });
    assert(histRes.status === 200 && histRes.body.movements.length > 0, "GET /api/inventory/movements retrieves movement history");
    assert(histRes.body.movements[0].type === 'OUT', "Movement log accurately records OUT transaction type");

    // 7. Stock Adjustment Request & Review Workflow
    console.log("\n--- 7. Stock Adjustment Request & Approval ---");
    const adjReqRes = await request({
      host: '127.0.0.1', port: 3002, path: '/api/inventory/adjustments', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    }, {
      itemCode: testCode,
      adjustedQuantity: 12,
      reason: "นับสต็อกประจำสัปดาห์ พบขวดแตกชำรุด 3 ขวด"
    });
    assert(adjReqRes.status === 201 && adjReqRes.body.success, "POST /api/inventory/adjustments creates adjustment request (201 Created)");
    const adjId = adjReqRes.body.adjustment.id;
    assert(adjReqRes.body.adjustment.status === 'pending', "New adjustment request is set to 'pending'");

    // Admin Approves Adjustment
    const reviewRes = await request({
      host: '127.0.0.1', port: 3002, path: `/api/inventory/adjustments/${adjId}/review`, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    }, {
      action: "approved",
      reviewNotes: "อนุมัติตามบันทึกข้อความขวดชำรุด"
    });
    assert(reviewRes.status === 200 && reviewRes.body.success, "Admin approved adjustment request (200 OK)");
    assert(reviewRes.body.adjustment.status === 'approved', "Adjustment status updated to 'approved'");

    // Verify stock is now 12
    const verifyItemRes = await request({ host: '127.0.0.1', port: 3002, path: '/api/items', method: 'GET' });
    const adjustedItem = verifyItemRes.body.find(i => i.code === testCode);
    assert(adjustedItem && adjustedItem.qty === 12, "Item stock accurately updated to 12 upon adjustment approval");

    // Clean up temporary item (Soft delete)
    await request({
      host: '127.0.0.1', port: 3002, path: `/api/items/${testCode}`, method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

  } finally {
    server.kill();
  }

  console.log("\n==================================================");
  console.log(`TOTAL P2 INVENTORY TESTS: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runInventoryTests().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
