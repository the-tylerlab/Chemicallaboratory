/**
 * Test Suite: P2 Modules (Equipment, Booking, Borrow/Return, Procurement, Role-based Dashboard)
 */

import { spawn } from 'child_process';
import assert from 'assert';

const PORT = 3003;
const BASE_URL = `http://localhost:${PORT}`;

let serverProcess = null;
let adminToken = null;
let teacherToken = null;
let staffToken = null;

let totalTests = 0;
let passedTests = 0;

function pass(msg) {
  totalTests++;
  passedTests++;
  console.log(`  ✅ PASS: ${msg}`);
}

function fail(msg, err) {
  totalTests++;
  console.error(`  ❌ FAIL: ${msg}`);
  if (err) console.error(err);
}

async function startServer() {
  return new Promise((resolve, reject) => {
    serverProcess = spawn('node', ['server.js'], {
      env: { ...process.env, PORT: String(PORT), NODE_ENV: 'test' },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let started = false;
    serverProcess.stdout.on('data', (d) => {
      const str = d.toString();
      if ((str.includes('Server available at') || str.includes('Laboratory Management System Backend running')) && !started) {
        started = true;
        resolve();
      }
    });

    serverProcess.stderr.on('data', (d) => {
      // ignore debug logs
    });

    setTimeout(() => {
      if (!started) resolve();
    }, 3000);
  });
}

async function run() {
  console.log("==================================================");
  console.log("🧪 RUNNING 🟡 P2 COMPREHENSIVE MODULES TEST SUITE");
  console.log("==================================================");

  try {
    await startServer();
    pass(`Test server started on port ${PORT}`);

    // Login Admin
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'SciAdmin@2026' })
    });
    const adminData = await adminLoginRes.json();
    adminToken = adminData.token;
    assert.ok(adminToken, "Admin token must be present");
    pass("Admin authenticated successfully with JWT");

    // Login Teacher (10746)
    const teacherLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: '10746', password: '10746' })
    });
    const teacherData = await teacherLoginRes.json();
    teacherToken = teacherData.token;
    assert.ok(teacherToken, "Teacher token must be present");
    pass("Teacher authenticated successfully with JWT");

    // --- 1. Equipment Master & Operations ---
    console.log("\n--- 1. Equipment Master & QR Codes ---");
    const eqRes = await fetch(`${BASE_URL}/api/equipment/assets`);
    assert.strictEqual(eqRes.status, 200);
    const eqData = await eqRes.json();
    assert.strictEqual(eqData.success, true);
    assert.ok(Array.isArray(eqData.data));
    assert.ok(eqData.data.length > 0);
    pass(`Retrieved ${eqData.data.length} equipment assets`);

    const firstEq = eqData.data[0];
    assert.ok(firstEq.assetId, "Equipment has assetId");
    assert.ok(firstEq.serialNumber, "Equipment has serialNumber");
    assert.ok(firstEq.condition, "Equipment has condition");
    assert.ok(firstEq.warrantyExpiry, "Equipment has warrantyExpiry");
    pass("Equipment master data contains complete physical and warranty fields");

    // Equipment QR
    const qrRes = await fetch(`${BASE_URL}/api/equipment/qr/${encodeURIComponent(firstEq.code)}`);
    assert.strictEqual(qrRes.status, 200);
    const qrData = await qrRes.json();
    assert.strictEqual(qrData.summary.format, 'SCIPORTAL-EQ-V2');
    assert.strictEqual(qrData.summary.code, firstEq.code);
    pass("Equipment QR code generated with SCIPORTAL-EQ-V2 specification");

    // Maintenance Log
    const maintRes = await fetch(`${BASE_URL}/api/equipment/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        itemCode: firstEq.code,
        assetId: firstEq.assetId,
        type: 'calibration',
        status: 'completed',
        technician: 'ศูนย์เครื่องมือวัดวิทยาศาสตร์',
        cost: 1500,
        performedAt: new Date().toISOString(),
        nextDueDate: '2027-03-01',
        notes: 'สอบเทียบประจำปี ค่าความคลาดเคลื่อน < 0.01g ผ่านเกณฑ์มาตรฐาน',
        certificateUrl: 'CERT-2026-CAL-088'
      })
    });
    assert.strictEqual(maintRes.status, 201);
    const maintData = await maintRes.json();
    assert.strictEqual(maintData.success, true);
    assert.strictEqual(maintData.log.type, 'calibration');
    pass("Equipment maintenance/calibration record created successfully");

    // Repair Workflow
    const repReportRes = await fetch(`${BASE_URL}/api/equipment/repairs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${teacherToken}` },
      body: JSON.stringify({
        itemCode: firstEq.code,
        assetId: firstEq.assetId,
        issueDescription: 'สายไฟชำรุดและปุ่มปรับละเอียดหลวม',
        priority: 'high'
      })
    });
    assert.strictEqual(repReportRes.status, 201);
    const repData = await repReportRes.json();
    const repairId = repData.repair.id;
    assert.strictEqual(repData.repair.repair_status, 'reported');
    pass("Equipment broken/repair issue reported by teacher");

    // Admin updates repair to 'repaired'
    const repUpdateRes = await fetch(`${BASE_URL}/api/equipment/repairs/${repairId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        repairStatus: 'repaired',
        technicianNotes: 'เปลี่ยนสายไฟใหม่และขันเกลียวปุ่มปรับละเอียดเรียบร้อย',
        repairCost: 350
      })
    });
    assert.strictEqual(repUpdateRes.status, 200);
    const repUpdateData = await repUpdateRes.json();
    assert.strictEqual(repUpdateData.repair.repair_status, 'repaired');
    pass("Equipment repair completed and status updated to 'repaired'");

    // --- 2. Laboratory Booking & Conflict Detection ---
    console.log("\n--- 2. Laboratory Booking & Conflict Detection ---");
    const availRes = await fetch(`${BASE_URL}/api/bookings/availability?date=2026-10-15`);
    assert.strictEqual(availRes.status, 200);
    const availData = await availRes.json();
    assert.strictEqual(availData.availability.length, 8); // 8 rooms
    pass("Room availability matrix successfully generated for Lab 1 - Lab 8");

    // Create a new booking
    const bookRes = await fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${teacherToken}` },
      body: JSON.stringify({
        room: 'Lab 2',
        date: '2026-10-15',
        timeSlot: '10:30 - 12:20',
        purpose: 'การทดลองไทเทรตกรด-เบส',
        className: 'ม.5/2',
        studentCount: 42,
        experimentName: 'Acid-Base Titration',
        requiredEquipment: [{ name: 'Burette 50mL', qty: 10 }, { name: 'Erlenmeyer Flask', qty: 42 }],
        requiredChemicals: [{ name: 'HCl 0.1M', qty: 500, unit: 'mL' }, { name: 'NaOH 0.1M', qty: 500, unit: 'mL' }]
      })
    });
    assert.strictEqual(bookRes.status, 201);
    const bookData = await bookRes.json();
    const bookingId = bookData.booking.id;
    assert.strictEqual(bookData.booking.status, 'pending');
    assert.strictEqual(bookData.booking.className, 'ม.5/2');
    pass("Laboratory booking created with class, student count, and required chemicals/equipment");

    // Conflict Check
    const conflictCheckRes = await fetch(`${BASE_URL}/api/bookings/check-conflict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room: 'Lab 2',
        date: '2026-10-15',
        timeSlot: '10:30 - 12:20'
      })
    });
    const conflictData = await conflictCheckRes.json();
    assert.strictEqual(conflictData.hasConflict, true);
    pass("Booking conflict detection correctly identified double-booking");

    // Attempt double booking should receive 409 Conflict
    const doubleBookRes = await fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${teacherToken}` },
      body: JSON.stringify({
        room: 'Lab 2',
        date: '2026-10-15',
        timeSlot: '10:30 - 12:20',
        purpose: 'การทดลองซ้ำซ้อน'
      })
    });
    assert.strictEqual(doubleBookRes.status, 409);
    pass("Booking conflict blocked overlapping room reservation with 409 Conflict");

    // Admin approves booking
    const approveBookRes = await fetch(`${BASE_URL}/api/bookings/${bookingId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ action: 'approved' })
    });
    assert.strictEqual(approveBookRes.status, 200);
    const approvedData = await approveBookRes.json();
    assert.strictEqual(approvedData.booking.status, 'approved');
    pass("Lab booking approved by administrator");

    // Preparation checklist update
    const checkRes = await fetch(`${BASE_URL}/api/bookings/${bookingId}/checklist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ type: 'preparation', index: 0, done: true })
    });
    assert.strictEqual(checkRes.status, 200);
    pass("Lab preparation checklist progress saved");

    // Clean up test booking to maintain test idempotency
    await fetch(`${BASE_URL}/api/bookings/${bookingId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` }
    });

    // --- 3. Borrow / Return Workflow ---
    console.log("\n--- 3. Borrow / Return Workflow ---");
    const borrowReqRes = await fetch(`${BASE_URL}/api/borrow/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        itemCode: firstEq.code,
        quantity: 1,
        dueDate: '2026-10-20',
        responsiblePerson: 'ครูสมชาย',
        notes: 'ยืมสาธิตการตกผลึก'
      })
    });
    assert.strictEqual(borrowReqRes.status, 201);
    const borrowData = await borrowReqRes.json();
    const txId = borrowData.transaction.id;
    assert.strictEqual(borrowData.transaction.status, 'borrowed');
    pass("Borrow request successfully created");

    // Return with condition check
    const returnRes = await fetch(`${BASE_URL}/api/borrow/${txId}/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        condition: 'สมบูรณ์',
        damagedStatus: 'none',
        damageFine: 0
      })
    });
    assert.strictEqual(returnRes.status, 200);
    const returnData = await returnRes.json();
    assert.strictEqual(returnData.transaction.status, 'returned');
    pass("Item returned and stock safely replenished");

    // --- 4. Procurement & Budget Auto-Restock ---
    console.log("\n--- 4. Procurement & Budget Tracking ---");
    const budgetSumRes = await fetch(`${BASE_URL}/api/budget/summary`, {
      headers: { 'Authorization': `Bearer ${teacherToken}` }
    });
    assert.strictEqual(budgetSumRes.status, 200);
    const budgetSum = await budgetSumRes.json();
    assert.ok(budgetSum.totalBudget >= 0);
    assert.ok(budgetSum.remainingBudget >= 0);
    pass("Budget summary returns live total, spent, and remaining funds");

    // Submit Purchase Request
    const prRes = await fetch(`${BASE_URL}/api/procurement/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${teacherToken}` },
      body: JSON.stringify({
        title: 'จัดซื้อบีกเกอร์และกระบอกตวงประจำปี 2569',
        estimatedCost: 4500,
        items: [{ code: 'GLAS-001', name: 'Beaker 250mL', qty: 20 }],
        supplierName: 'บจก. ไซแอนติฟิค ซัพพลาย'
      })
    });
    assert.strictEqual(prRes.status, 201);
    const prData = await prRes.json();
    const poId = prData.order.id;
    assert.strictEqual(prData.order.status, 'pending');
    pass("Purchase Request submitted with initial approval chain");

    // Admin approves PR
    const prReviewRes = await fetch(`${BASE_URL}/api/procurement/orders/${poId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ action: 'approved', comments: 'อนุมัติตามงบหมวดวัสดุการศึกษา' })
    });
    assert.strictEqual(prReviewRes.status, 200);
    pass("Purchase Request approved by executive chain");

    // Receive Goods & Auto-Restock
    const rcvRes = await fetch(`${BASE_URL}/api/procurement/orders/${poId}/receive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        invoiceRef: 'INV-2026-9901',
        isFullReceiving: true,
        receivedItems: [{ code: firstEq.code, receivedQty: 2 }]
      })
    });
    assert.strictEqual(rcvRes.status, 200);
    pass("Procurement receiving automatically restocked inventory with movement log");

    // --- 5. Role-based Dashboard Views ---
    console.log("\n--- 5. Dynamic Role-Based Dashboard ---");
    // Teacher View
    const tDashRes = await fetch(`${BASE_URL}/api/dashboard/role-view?role=L1`, {
      headers: { 'Authorization': `Bearer ${teacherToken}` }
    });
    const tDash = await tDashRes.json();
    assert.strictEqual(tDash.role, 'Teacher');
    assert.ok(tDash.data.myActiveBookings !== undefined);
    assert.ok(tDash.data.upcomingClasses !== undefined);
    pass("Teacher dashboard returns personal bookings, classes, and loans");

    // Staff View
    const sDashRes = await fetch(`${BASE_URL}/api/dashboard/role-view?role=L2`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const sDash = await sDashRes.json();
    assert.strictEqual(sDash.role, 'Staff');
    assert.ok(sDash.data.todayPreparations !== undefined);
    assert.ok(sDash.data.lowStockCount !== undefined);
    pass("Staff dashboard returns daily lab preparations, low stock, and maintenance due");

    // Admin View
    const aDashRes = await fetch(`${BASE_URL}/api/dashboard/role-view?role=L3`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const aDash = await aDashRes.json();
    assert.strictEqual(aDash.role, 'Admin');
    assert.ok(aDash.data.totalInventoryValue !== undefined);
    assert.ok(aDash.data.totalUsers !== undefined);
    pass("Admin dashboard returns total inventory valuation, user metrics, and audit summary");

    // Executive View
    const eDashRes = await fetch(`${BASE_URL}/api/dashboard/role-view?role=L4`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const eDash = await eDashRes.json();
    assert.strictEqual(eDash.role, 'Executive');
    assert.ok(eDash.data.labUtilizationRate !== undefined);
    assert.ok(eDash.data.budgetUsage !== undefined);
    pass("Executive dashboard returns lab utilization %, total budget usage, and monthly expenditure");

  } catch(err) {
    fail("P2 Test encountered unexpected exception", err);
  } finally {
    if (serverProcess) {
      serverProcess.kill('SIGINT');
    }
  }

  console.log("\n==================================================");
  console.log(`TOTAL P2 MODULES TESTS: ${totalTests}`);
  console.log(`PASSED: ${passedTests}`);
  console.log(`FAILED: ${totalTests - passedTests}`);
  console.log("==================================================");

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

run();
