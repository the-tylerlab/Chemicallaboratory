/**
 * Populate Google Sheets 5.Users with 14 users
 * Top 7: Mock demo accounts with "บัญชีจำลอง" remarks
 * Bottom 7: Genuine teacher accounts
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log('🔄 เริ่มต้นจัดระเบียบ 5.Users ใน Google Sheets ให้มีครบ 14 บัญชี...\n');

  // 1. ดึงข้อมูล 7 คุณครูจริงจาก Google Sheets
  const gsRes = await fetch(`${GOOGLE_SCRIPT_URL}?table=5.Users`, { redirect: 'follow' });
  const gsJson = await gsRes.json();
  const teachers = gsJson.data || [];
  console.log(`📋 [1/4] ข้อมูลคุณครูจริงในระบบ: ${teachers.length} ท่าน`);

  // 2. ดึงข้อมูล 7 บัญชีจำลองจาก Supabase
  const { data: supaUsers } = await supabase.from('users').select('*');
  const mockTeacherIds = ['1001', '1002', '2001', '2002', '3001', '4001', '10797'];
  const rawMocks = supaUsers.filter(u => mockTeacherIds.includes(String(u.teacherId)));

  // จัดเรียงลำดับบัญชีจำลองตามลำดับ L1, L2, L3, L4
  const mockSortOrder = { '1001': 1, '1002': 2, '2001': 3, '2002': 4, '3001': 5, '4001': 6, '10797': 7 };
  rawMocks.sort((a, b) => (mockSortOrder[String(a.teacherId)] || 99) - (mockSortOrder[String(b.teacherId)] || 99));

  const mockUsers = rawMocks.map(m => {
    return {
      id: m.id,
      teacherId: m.teacherId,
      name: `${m.name} (บัญชีจำลอง)`,
      department: `${m.department} (บัญชีจำลอง)`,
      email: m.email || '',
      role: m.role || 'L1',
      roleName: `${m.roleName || 'Teacher / User'} (บัญชีจำลอง)`,
      assignedRooms: Array.isArray(m.assignedRooms) ? m.assignedRooms : [],
      initials: m.initials || 'จำลอง',
      color: m.color || '#94a3b8',
      isActive: true,
      createdAt: m.createdAt || new Date().toISOString()
    };
  });
  console.log(`📋 [2/4] จัดเตรียมบัญชีจำลอง: ${mockUsers.length} บัญชี (พร้อมรีมาร์ค 'บัญชีจำลอง')`);

  // 3. ลบแถวเดิม 7 แถวใน Google Sheets ชั่วคราว เพื่อให้แทรกบัญชีจำลองไว้บนสุดได้
  console.log('\n🧹 [3/4] กำลังเคลียร์แถวเดิมชั่วคราวเพื่อจัดเรียงลำดับใหม่...');
  for (const t of teachers) {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'DELETE', table: '5.Users', data: { id: t.id }, keyField: 'id' }),
      redirect: 'follow'
    });
    process.stdout.write(`   - ลบ ${t.teacherId} แล้ว\n`);
    await sleep(250);
  }

  // 4. แทรก 7 บัญชีจำลองไว้ด้านบนสุด (แถว 2 - 8)
  console.log('\n📥 [4/4] แทรก 7 บัญชีจำลองไว้ด้านบนสุดของตาราง...');
  for (const mu of mockUsers) {
    const res = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'UPSERT', table: '5.Users', data: mu, keyField: 'id' }),
      redirect: 'follow'
    });
    const json = await res.json();
    console.log(`   + [บนสุด] บัญชีจำลอง: ${mu.teacherId} - ${mu.name}`);
    await sleep(250);
  }

  // 5. แทรก 7 คุณครูจริงไว้ด้านล่าง (แถว 9 - 15)
  console.log('\n📥 แทรก 7 คุณครูจริงต่อด้านล่าง...');
  for (const tu of teachers) {
    const res = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'UPSERT', table: '5.Users', data: tu, keyField: 'id' }),
      redirect: 'follow'
    });
    const json = await res.json();
    console.log(`   + [คุณครูจริง]: ${tu.teacherId} - ${tu.name}`);
    await sleep(250);
  }

  // 6. ตรวจสอบผลลัพธ์
  console.log('\n🔍 กำลังตรวจสอบตาราง 5.Users ล่าสุดใน Google Sheets...');
  const checkRes = await fetch(`${GOOGLE_SCRIPT_URL}?table=5.Users`, { redirect: 'follow' });
  const checkJson = await checkRes.json();
  const finalUsers = checkJson.data || [];

  console.log(`✨ จำนวนบัญชีคงเหลือใน Google Sheets ทั้งหมด: ${finalUsers.length} บัญชี (เป้าหมาย 14 บัญชี)`);
  finalUsers.forEach((u, i) => {
    console.log(`   ${String(i + 1).padStart(2, ' ')}. [${u.teacherId}] ${u.name} | ${u.roleName}`);
  });

  console.log('\n🎉 ดำเนินการเสร็จสมบูรณ์เรียบร้อยแล้ว!');
}

run().catch(err => {
  console.error('\n❌ เกิดข้อผิดพลาด:', err);
  process.exit(1);
});
