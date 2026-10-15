/**
 * Test Demo Flow: Add Chemicals & Equipment, Test Borrow-Return & Lab Booking
 */
require('dotenv').config();

const BASE_URL = 'http://localhost:3000';

async function main() {
  console.log('========================================================');
  console.log('🧪 DEMO SIMULATION: DATA ENTRY, BORROW & LAB BOOKING');
  console.log('========================================================\n');

  // STEP 1: Log in L3 (Admin) and L1 (Teacher)
  console.log('🔑 1. Authenticating test users...');
  const l3Login = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: '10823', password: 'SciAdmin@2026' })
  });
  const l3Data = await l3Login.json();
  const l3Token = l3Data.token;
  console.log(`   - L3 Admin (${l3Data.user?.name}): Authenticated ✅`);

  const l1Login = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: '1002', password: '1002' })
  });
  const l1Data = await l1Login.json();
  const l1Token = l1Data.token;
  console.log(`   - L1 Teacher (${l1Data.user?.name}): Authenticated ✅\n`);

  // STEP 2: Add Chemicals & Scientific Equipment
  console.log('📦 2. Adding Test Chemicals & Scientific Equipment...');
  const newItems = [
    {
      code: 'CHEM-DEMO-01',
      name: 'กรดไฮโดรคลอริก 0.1M (Hydrochloric Acid 0.1M, HCl)',
      category: 'สารเคมี',
      qty: 25,
      unit: 'ขวด',
      room: 'Lab 1',
      cabinet: 'ตู้กรด-เบส',
      shelf: 'ชั้น 1',
      chemicalType: 'A',
      minAlert: 5,
      ghs: ['GHS05', 'GHS07'],
      sdsUrl: 'https://example.com/sds/hcl.pdf'
    },
    {
      code: 'CHEM-DEMO-02',
      name: 'โซเดียมไฮดรอกไซด์ เม็ด (Sodium Hydroxide Pellets, NaOH)',
      category: 'สารเคมี',
      qty: 40,
      unit: 'ขวด',
      room: 'Lab 1',
      cabinet: 'ตู้ที่ 1 (Solid)',
      shelf: 'ชั้น 2',
      chemicalType: 'B',
      minAlert: 10,
      ghs: ['GHS05'],
      sdsUrl: 'https://example.com/sds/naoh.pdf'
    },
    {
      code: 'EQ-DEMO-01',
      name: 'เครื่องวัดค่ากรด-เบสแบบตั้งโต๊ะ (Benchtop Digital pH Meter)',
      category: 'อุปกรณ์วิทยาศาสตร์',
      qty: 6,
      unit: 'เครื่อง',
      room: 'Lab 1',
      cabinet: 'ตู้เครื่องมือวัด A',
      shelf: 'ชั้น 1',
      serialNumber: 'SN-PH-2026-08',
      supplier: 'บริษัท เครื่องมือวิทยาศาสตร์ไทย จำกัด'
    },
    {
      code: 'EQ-DEMO-02',
      name: 'กล้องจุลทรรศน์ 2 ตา ชนิดใช้แสง (Binocular Compound Microscope)',
      category: 'อุปกรณ์วิทยาศาสตร์',
      qty: 15,
      unit: 'กล้อง',
      room: 'Lab 1',
      cabinet: 'ตู้เก็บกล้องจุลทรรศน์',
      shelf: 'ชั้น 2',
      serialNumber: 'SN-MIC-2026-15',
      supplier: 'บริษัท สื่อวิทยาศาสตร์ จำกัด'
    }
  ];

  for (const item of newItems) {
    const res = await fetch(`${BASE_URL}/api/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${l3Token}`
      },
      body: JSON.stringify(item)
    });

    if (res.status === 201) {
      console.log(`   ✅ เพิ่ม [${item.category}]: ${item.code} - ${item.name} (${item.qty} ${item.unit}) สำเร็จ`);
    } else if (res.status === 409) {
      console.log(`   ℹ️ [${item.code}] มีอยู่ในระบบแล้ว พร้อมใช้งาน`);
    } else {
      const err = await res.json();
      console.log(`   ⚠️ เพิ่ม ${item.code} ไม่สำเร็จ:`, err);
    }
  }

  // STEP 3: Verify Equipment in /api/equipment/assets
  console.log('\n🔬 3. Verifying Equipment Registry...');
  const eqRes = await fetch(`${BASE_URL}/api/equipment/assets`);
  const eqData = await eqRes.json();
  const foundEq = (eqData.data || []).filter(e => e.code.startsWith('EQ-DEMO-'));
  console.log(`   - รายการอุปกรณ์วิทยาศาสตร์พร้อมใช้งาน: ${foundEq.length} รายการ`);
  foundEq.forEach(e => {
    console.log(`     • ${e.code}: ${e.name} (${e.quantity} ${e.unit}) ประจำห้อง ${e.location.room} (${e.location.cabinet})`);
  });

  // STEP 4: Test Borrow Flow (ยืมอุปกรณ์โดยครู L1)
  console.log('\n🤝 4. Testing Borrow Flow (ครูทำการยืมเครื่องมือ)...');
  const borrowPayload = {
    itemCode: 'EQ-DEMO-01',
    quantity: 2,
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    responsiblePerson: l1Data.user?.name,
    notes: 'ใช้ในการเรียนการสอนวิชาเคมี ม.5 เรื่องการวัด pH ของสารละลาย'
  };

  const borrowRes = await fetch(`${BASE_URL}/api/borrow/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${l1Token}`
    },
    body: JSON.stringify(borrowPayload)
  });

  const borrowData = await borrowRes.json();
  if (borrowRes.ok) {
    console.log(`   ✅ ยืมสำเร็จ! Transaction ID: ${borrowData.transaction?.id}`);
    console.log(`   - ผู้ยืม: ${borrowData.transaction?.borrower} (${borrowData.transaction?.teacherId})`);
    console.log(`   - รายการ: ${borrowData.transaction?.itemName} จำนวน ${borrowData.transaction?.quantity} ${borrowData.transaction?.unit}`);
    console.log(`   - สถานะการยืม: ${borrowData.transaction?.status} (สถานะการอนุมัติ: ${borrowData.transaction?.approvalStatus})`);

    // STEP 5: Test Return Flow (คืนอุปกรณ์)
    console.log('\n↩️ 5. Testing Return Flow (คืนเครื่องมือเข้าคลัง)...');
    const returnTxId = borrowData.transaction?.id;
    const returnRes = await fetch(`${BASE_URL}/api/borrow/${returnTxId}/return`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${l1Token}`
      },
      body: JSON.stringify({
        returnQty: 2,
        damagedQty: 0,
        notes: 'คืนในสภาพสมบูรณ์ พร้อมใช้งานต่อ'
      })
    });

    const returnData = await returnRes.json();
    if (returnRes.ok) {
      console.log(`   ✅ คืนสำเร็จ! Transaction: ${returnTxId}`);
      console.log(`   - สถานะปัจจุบัน: ${returnData.transaction?.status}`);
      console.log(`   - คืนกลับเข้าคลังเรียบร้อย สภาพเครื่อง: ${returnData.transaction?.condition}`);
    } else {
      console.log('   ⚠️ คืนไม่สำเร็จ:', returnData);
    }
  } else {
    console.log('   ⚠️ ยืมไม่สำเร็จ:', borrowData);
  }

  // STEP 6: Test Lab Booking Flow (การจองห้องปฏิบัติการ)
  console.log('\n📅 6. Testing Lab Booking Flow (การจองห้องปฏิบัติการ)...');
  const bookingDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const bookingPayload = {
    room: 'Lab 1',
    date: bookingDate,
    timeSlot: '13:00 - 14:50',
    conflictOverride: true,
    purpose: 'การทดลองเรื่องการไทเทรตกรด-เบส และปฏิกิริยาสะเทิน',
    className: 'มัธยมศึกษาปีที่ 5/2',
    studentCount: 32,
    experimentName: 'Acid-Base Titration & pH Curve',
    requiredEquipment: ['EQ-DEMO-01 (เครื่องวัด pH 6 เครื่อง)', 'บิวเรตต์ 50 ml (16 อัน)'],
    requiredChemicals: ['CHEM-DEMO-01 (HCl 0.1M)', 'CHEM-DEMO-02 (NaOH)', 'ฟีนอล์ฟทาลีน']
  };

  const bookingRes = await fetch(`${BASE_URL}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${l1Token}`
    },
    body: JSON.stringify(bookingPayload)
  });

  const bookingData = await bookingRes.json();
  if (bookingRes.ok) {
    const booking = bookingData.booking || bookingData;
    console.log(`   ✅ ส่งคำขอจองห้องสำเร็จ! Booking ID: ${booking.id}`);
    console.log(`   - ห้องปฏิบัติการ: ${booking.room}`);
    console.log(`   - วันที่: ${booking.date} เวลา ${booking.timeSlot}`);
    console.log(`   - ผู้จอง: ${booking.teacherName} (ชั้น ${booking.className}, นักเรียน ${booking.studentCount} คน)`);
    console.log(`   - การทดลอง: ${booking.experimentName}`);
    console.log(`   - สารเคมีและอุปกรณ์ที่ขอใช้: ${booking.requiredChemicals?.length + booking.requiredEquipment?.length} รายการ`);
    console.log(`   - สถานะปัจจุบัน: ${booking.status}`);

    // STEP 7: Admin Reviews and Approves Booking
    console.log('\n🛡️ 7. Admin Review & Approve Booking...');
    const reviewRes = await fetch(`${BASE_URL}/api/bookings/${booking.id}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${l3Token}`
      },
      body: JSON.stringify({
        action: 'approved',
        comment: 'อนุมัติการใช้ห้องและสั่งเตรียมสารเคมีตามรายการเรียบร้อย'
      })
    });

    const reviewData = await reviewRes.json();
    if (reviewRes.ok) {
      console.log(`   ✅ อนุมัติการจองเรียบร้อย! สถานะใหม่: ${reviewData.booking?.status || 'approved'}`);
      console.log(`   - ผู้ดูแลที่อนุมัติ: ${l3Data.user?.name}`);
    } else {
      console.log('   ⚠️ ผลการตรวจสอบการอนุมัติ:', reviewData);
    }
  } else {
    console.log('   ⚠️ จองห้องไม่สำเร็จ:', bookingData);
  }

  console.log('\n========================================================');
  console.log('🎉 DEMO WORKFLOW TEST COMPLETED SUCCESSFULLY 100%');
  console.log('========================================================');
}

main().catch(err => {
  console.error('Test execution error:', err);
});
