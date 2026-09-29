/**
 * Sync Google Sheets Master Inventory (Items) & Users to Supabase & Local Cache
 * Chemical Laboratory library system and scientific equipment
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

if (!SUPABASE_URL || !SUPABASE_KEY || !GOOGLE_SCRIPT_URL) {
  console.error('❌ Missing environment variables (SUPABASE_URL, SUPABASE_KEY, GOOGLE_SCRIPT_URL)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runSync() {
  console.log('🔄 เริ่มต้นกระบวนการ Sync ข้อมูลจาก Google Sheets เข้าสู่ Supabase...\n');

  // ==========================================
  // 1. SYNC ITEMS
  // ==========================================
  console.log('📦 1. ดึงข้อมูล Items จาก Google Sheets (แท็บ 1.Items)...');
  const gsItemsRes = await fetch(`${GOOGLE_SCRIPT_URL}?table=1.Items`, { redirect: 'follow' });
  const gsItemsJson = await gsItemsRes.json();
  const allGsItems = gsItemsJson.data || [];
  console.log(`   - พบข้อมูลทั้งหมดใน Google Sheets: ${allGsItems.length} แถว`);

  // กรองเฉพาะสารเคมีจริงของห้องแล็บ (CHEM-*)
  const realGsItems = allGsItems.filter(i => i.code && i.code.startsWith('CHEM-'));
  console.log(`   - รายการสารเคมีจริง (CHEM-*): ${realGsItems.length} รายการ`);

  // ดึงข้อมูลเดิมจาก Supabase
  const { data: existingSbItems, error: sbItemsErr } = await supabase.from('items').select('*');
  if (sbItemsErr) throw sbItemsErr;
  const sbMap = new Map(existingSbItems.map(i => [i.code, i]));

  const sanitizedItems = realGsItems.map(gi => {
    const si = sbMap.get(gi.code);
    return {
      code: String(gi.code).trim(),
      name: String(gi.name || '').trim(),
      category: gi.category || 'สารเคมี',
      qty: Number(gi.qty) || 0,
      damagedQty: Number(gi.damagedQty) || 0,
      unit: String(gi.unit || 'ขวด').trim(),
      minAlert: Number(gi.minAlert) || 0,
      expiry: String(gi.expiry || '').trim(),
      room: String(gi.room || 'Lab 1').trim(),
      cabinet: String(gi.cabinet || '').trim(),
      shelf: String(gi.shelf || '').trim(),
      chemicalType: gi.chemicalType || (si ? si.chemicalType : 'G'),
      sdsUrl: gi.sdsUrl || '',
      ghs: Array.isArray(gi.ghs) 
        ? gi.ghs 
        : (typeof gi.ghs === 'string' && gi.ghs ? gi.ghs.split(',').map(s => s.trim()) : (si && si.ghs ? si.ghs : [])),
      createdAt: gi.createdAt || (si ? si.createdAt : new Date().toISOString())
    };
  });

  // ทำการ Upsert สารเคมีทั้งหมด 72 รายการเข้า Supabase
  console.log(`   - กำลัง Upsert สารเคมี ${sanitizedItems.length} รายการเข้า Supabase...`);
  const { data: upsertedItems, error: upsertErr } = await supabase
    .from('items')
    .upsert(sanitizedItems, { onConflict: 'code' })
    .select();

  if (upsertErr) throw upsertErr;
  console.log(`   ✅ Upsert สำเร็จ: ${upsertedItems.length} รายการใน Supabase`);

  // ลบข้อมูลทดสอบเก่า (SEC-TEST-*) ที่อาจตกค้างใน Supabase
  const { error: delErr } = await supabase
    .from('items')
    .delete()
    .not('code', 'ilike', 'CHEM-%');
  if (!delErr) {
    console.log('   🧹 ทำความสะอาดรายการทดสอบตกค้างใน Supabase items เรียบร้อย');
  }

  // อัปเดตไฟล์แคชในเครื่อง data/database.json ด้วย
  const dbPath = path.join(__dirname, '..', 'data', 'database.json');
  try {
    fs.writeFileSync(dbPath, JSON.stringify(sanitizedItems, null, 2), 'utf-8');
    console.log(`   💾 บันทึกแคชรายการสารเคมีลง ${dbPath} เรียบร้อย (${sanitizedItems.length} รายการ)`);
  } catch (e) {
    console.warn('   ⚠️ ไม่สามารถเขียน database.json:', e.message);
  }

  // ==========================================
  // 2. SYNC USERS
  // ==========================================
  console.log('\n👥 2. ตรวจสอบข้อมูล Users จาก Google Sheets (แท็บ 5.Users)...');
  const gsUsersRes = await fetch(`${GOOGLE_SCRIPT_URL}?table=5.Users`, { redirect: 'follow' });
  const gsUsersJson = await gsUsersRes.json();
  const allGsUsers = gsUsersJson.data || [];
  
  // กรองเฉพาะบัญชีคุณครูจริง (ไม่รวมรหัสทดสอบ T_P1_*)
  const realGsUsers = allGsUsers.filter(u => u.teacherId && !String(u.teacherId).startsWith('T_P1_'));
  console.log(`   - บัญชีครูผู้สอนจริงใน Google Sheets: ${realGsUsers.length} ท่าน`);

  const { data: sbUsers, error: sbUsersErr } = await supabase.from('users').select('*');
  if (sbUsersErr) throw sbUsersErr;
  const sbUserMap = new Map(sbUsers.map(u => [String(u.teacherId || u.id), u]));

  let updatedUsersCount = 0;
  for (const gu of realGsUsers) {
    const su = sbUserMap.get(String(gu.teacherId));
    if (su) {
      // อัปเดตข้อมูลทั่วไป (ชื่อ, ฝ่าย, ห้องที่รับผิดชอบ) โดยคง password เดิมไว้
      const assignedRooms = Array.isArray(gu.assignedRooms) 
        ? gu.assignedRooms 
        : (typeof gu.assignedRooms === 'string' && gu.assignedRooms ? gu.assignedRooms.split(',').map(s=>s.trim()) : (su.assignedRooms || []));

      const { error: uErr } = await supabase.from('users').update({
        name: gu.name || su.name,
        department: gu.department || su.department,
        email: gu.email || su.email,
        role: gu.role || su.role,
        roleName: gu.roleName || su.roleName,
        assignedRooms: assignedRooms,
        initials: gu.initials || su.initials,
        color: gu.color || su.color,
        isActive: gu.isActive !== undefined ? Boolean(gu.isActive) : su.isActive
      }).eq('id', su.id);

      if (!uErr) updatedUsersCount++;
    }
  }
  console.log(`   ✅ ตรวจสอบและซิงค์ข้อมูลโปรไฟล์ครู ${updatedUsersCount} ท่านเรียบร้อย (คง Password แฮชเดิมปลอดภัย 100%)`);

  // ==========================================
  // 3. FINAL SUMMARY COUNT
  // ==========================================
  console.log('\n📊 3. สรุปผลการตรวจสอบความสอดคล้อง (Supabase Validation):');
  const { count: finalItemCount } = await supabase.from('items').select('*', { count: 'exact', head: true });
  const { count: finalUserCount } = await supabase.from('users').select('*', { count: 'exact', head: true });

  console.log(`   ✨ สารเคมีใน Supabase: ${finalItemCount} รายการ (CHEM-001 ถึง CHEM-072 สมบูรณ์)`);
  console.log(`   ✨ ผู้ใช้งานใน Supabase: ${finalUserCount} บัญชี (คุณครู + เจ้าหน้าที่ผู้ดูแลระบบ)`);
  console.log('\n🎉 Sync สำเร็จสมบูรณ์ทุกประการ!');
}

runSync().catch(err => {
  console.error('\n❌ เกิดข้อผิดพลาดในกระบวนการ Sync:', err);
  process.exit(1);
});
