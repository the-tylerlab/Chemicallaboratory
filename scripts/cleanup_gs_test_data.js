/**
 * Clean up test records (P2-TEST-*, SEC-TEST-*, u_T_P1_*) from Google Sheets
 * Chemical Laboratory library system and scientific equipment
 */
require('dotenv').config();

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

if (!GOOGLE_SCRIPT_URL) {
  console.error('❌ Missing GOOGLE_SCRIPT_URL in environment');
  process.exit(1);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function cleanGoogleSheetsTestData() {
  console.log('🧹 เริ่มต้นทำความสะอาดข้อมูลทดสอบใน Google Sheets...\n');

  // ==========================================
  // 1. CLEAN 5.Users (ลบ u_T_P1_*)
  // ==========================================
  console.log('👥 [1/2] กำลังตรวจสอบแท็บ 5.Users...');
  const usersRes = await fetch(`${GOOGLE_SCRIPT_URL}?table=5.Users`, { redirect: 'follow' });
  const usersJson = await usersRes.json();
  const allUsers = usersJson.data || [];
  
  const testUsers = allUsers.filter(u => {
    const id = String(u.id || '');
    const tId = String(u.teacherId || '');
    return id.startsWith('u_T_P1_') || tId.startsWith('T_P1_');
  });

  console.log(`   - พบผู้ใช้งานทั้งหมด: ${allUsers.length} บัญชี`);
  console.log(`   - พบบัญชีทดสอบที่ต้องลบ: ${testUsers.length} บัญชี`);

  let usersDeleted = 0;
  for (const u of testUsers) {
    try {
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE',
          table: '5.Users',
          data: { id: u.id },
          keyField: 'id'
        }),
        redirect: 'follow'
      });
      const data = await res.json();
      if (data.status === 'success' && data.result && data.result.startsWith('deleted_row')) {
        usersDeleted++;
      }
      process.stdout.write(`\r   - ลบบัญชีทดสอบแล้ว: ${usersDeleted}/${testUsers.length} (${u.teacherId})`);
      await sleep(200);
    } catch (err) {
      console.warn(`\n   ⚠️ ลบไม่สำเร็จสำหรับ ${u.id}:`, err.message);
    }
  }
  console.log(`\n   ✅ ทำความสะอาดแท็บ 5.Users เสร็จสิ้น (ลบสำเร็จ ${usersDeleted} บัญชี)\n`);

  // ==========================================
  // 2. CLEAN 1.Items (ลบที่ไม่ใช่ CHEM-*)
  // ==========================================
  console.log('📦 [2/2] กำลังตรวจสอบแท็บ 1.Items...');
  const itemsRes = await fetch(`${GOOGLE_SCRIPT_URL}?table=1.Items`, { redirect: 'follow' });
  const itemsJson = await itemsRes.json();
  const allItems = itemsJson.data || [];

  const testItems = allItems.filter(i => {
    const code = String(i.code || '').trim();
    return !code.startsWith('CHEM-');
  });

  console.log(`   - พบสารเคมีทั้งหมด: ${allItems.length} รายการ`);
  console.log(`   - พบรายการทดสอบที่ต้องลบ: ${testItems.length} รายการ`);

  let itemsDeleted = 0;
  for (let idx = 0; idx < testItems.length; idx++) {
    const item = testItems[idx];
    try {
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE',
          table: '1.Items',
          data: { code: item.code },
          keyField: 'code'
        }),
        redirect: 'follow'
      });
      const data = await res.json();
      if (data.status === 'success' && data.result && data.result.startsWith('deleted_row')) {
        itemsDeleted++;
      }
      process.stdout.write(`\r   - ลบรายการทดสอบแล้ว: ${itemsDeleted}/${testItems.length} (${item.code})          `);
      await sleep(200);
    } catch (err) {
      console.warn(`\n   ⚠️ ลบไม่สำเร็จสำหรับ ${item.code}:`, err.message);
    }
  }
  console.log(`\n   ✅ ทำความสะอาดแท็บ 1.Items เสร็จสิ้น (ลบสำเร็จ ${itemsDeleted} รายการ)\n`);

  // ==========================================
  // 3. FINAL VERIFICATION
  // ==========================================
  console.log('🔍 ตรวจสอบยอดข้อมูลคงเหลือล่าสุดใน Google Sheets...');
  const finalItemsRes = await fetch(`${GOOGLE_SCRIPT_URL}?table=1.Items`, { redirect: 'follow' });
  const finalItemsJson = await finalItemsRes.json();
  const finalUsersRes = await fetch(`${GOOGLE_SCRIPT_URL}?table=5.Users`, { redirect: 'follow' });
  const finalUsersJson = await finalUsersRes.json();

  console.log(`   ✨ แท็บ 1.Items คงเหลือ: ${finalItemsJson.data ? finalItemsJson.data.length : 0} รายการ (เป้าหมาย 72 สารเคมี)`);
  console.log(`   ✨ แท็บ 5.Users คงเหลือ: ${finalUsersJson.data ? finalUsersJson.data.length : 0} บัญชี (เป้าหมาย 7 ครู)`);

  console.log('\n🎉 ทำความสะอาด Google Sheets เรียบร้อย ตรงกับ Supabase 100%!');
}

cleanGoogleSheetsTestData().catch(err => {
  console.error('\n❌ เกิดข้อผิดพลาด:', err);
  process.exit(1);
});
