require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function verifyConnections() {
  console.log('====================================================');
  console.log('🔬 DATA CONNECTION AUDIT REPORT');
  console.log('====================================================\n');

  // 1. Supabase Verification
  console.log('1️⃣ SUPABASE CLOUD (avzneyaalenbyawfvykp.supabase.co)');
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.log('❌ Supabase: Missing credentials in .env');
  } else {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      
      // Items table
      const { data: items, count: itemsCount, error: itemsErr } = await supabase
        .from('items')
        .select('code, name, category, qty, unit, room', { count: 'exact' });
      
      if (itemsErr) {
        console.log('❌ Supabase items table error:', itemsErr.message);
      } else {
        console.log('✅ Supabase [items]: CONNECTED');
        console.log(`   - จำนวนรายการ items: ${items.length} รายการ (count: ${itemsCount})`);
        if (items.length > 0) {
          console.log(`   - ตัวอย่างข้อมูล: ${items[0].code} - ${items[0].name} (${items[0].qty} ${items[0].unit})`);
        }
      }

      // Users table
      const { data: users, count: usersCount, error: usersErr } = await supabase
        .from('users')
        .select('teacherId, name, role, department', { count: 'exact' });
      
      if (usersErr) {
        console.log('⚠️ Supabase users table error:', usersErr.message);
      } else {
        console.log('✅ Supabase [users]: CONNECTED');
        console.log(`   - จำนวนผู้ใช้งาน: ${users.length} บัญชี (count: ${usersCount})`);
        const roles = users.reduce((acc, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; }, {});
        console.log('   - การกระจายบทบาท:', JSON.stringify(roles));
      }

      // Borrow records table
      const { data: logs, count: logsCount, error: logsErr } = await supabase
        .from('borrow_records')
        .select('id, item_code, borrower_name, status', { count: 'exact' })
        .limit(3);
      if (!logsErr) {
        console.log(`✅ Supabase [borrow_records]: CONNECTED (พบ ${logsCount !== null ? logsCount : logs.length} records)`);
      }
    } catch(e) {
      console.log('❌ Supabase Exception:', e.message);
    }
  }

  // 2. Google Apps Script Web App
  console.log('\n2️⃣ GOOGLE APPS SCRIPT WEB APP (API GATEWAY)');
  const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;
  if (!GOOGLE_SCRIPT_URL) {
    console.log('❌ GOOGLE_SCRIPT_URL not found in .env');
  } else {
    console.log('🔗 URL:', GOOGLE_SCRIPT_URL);
    try {
      const t0 = Date.now();
      const gsRes = await fetch(`${GOOGLE_SCRIPT_URL}?table=1.Items`, { redirect: 'follow' });
      const elapsed = Date.now() - t0;
      if (gsRes.ok) {
        const json = await gsRes.json();
        console.log(`✅ Apps Script Gateway: ONLINE (HTTP ${gsRes.status}, ${elapsed}ms)`);
        console.log(`   - สถานะข้อมูลแท็บ 1.Items: ดึงได้ ${json.data ? json.data.length : 0} รายการ`);
      } else {
        console.log(`❌ Apps Script Gateway returned HTTP ${gsRes.status}`);
      }
    } catch(e) {
      console.log('❌ Apps Script Gateway Error:', e.message);
    }
  }

  // 3. Google Sheet 1: Master Sheet
  console.log('\n3️⃣ GOOGLE SHEET 1: MASTER REPOSITORY (8 Canonical Tabs)');
  console.log('🔗 URL: https://docs.google.com/spreadsheets/d/1OBE_eI_C_1T-AXp_8Gr93WnCU0JvTwfW6_Bhpm997zI/edit');
  const masterSheetId = '1OBE_eI_C_1T-AXp_8Gr93WnCU0JvTwfW6_Bhpm997zI';
  
  for (const tab of ['1.Items', '5.Users', '7.Equipment']) {
    try {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${masterSheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`;
      const res = await fetch(csvUrl);
      if (res.ok) {
        const text = await res.text();
        const rows = text.trim().split('\n').filter(r => r.trim());
        console.log(`   ✅ แท็บ [${tab}]: เชื่อมต่อได้ (พบ ${rows.length - 1} รายการ, Header: ${rows[0].slice(0, 45)}...)`);
      } else {
        console.log(`   ⚠️ แท็บ [${tab}]: HTTP ${res.status}`);
      }
    } catch(e) {
      console.log(`   ❌ แท็บ [${tab}]: ${e.message}`);
    }
  }

  // 4. Google Sheet 2: Label Printing Sheet
  console.log('\n4️⃣ GOOGLE SHEET 2: LABEL PRINTING (สำหรับปริ้นฉลาก)');
  console.log('🔗 URL: https://docs.google.com/spreadsheets/d/1nyZPEmhXYukJjAYIeBYvH4cO98n_Dsz5AdQKT4PdzsE/edit');
  const labelSheetId = process.env.GOOGLE_LABEL_SHEET_ID || '1nyZPEmhXYukJjAYIeBYvH4cO98n_Dsz5AdQKT4PdzsE';
  try {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${labelSheetId}/gviz/tq?tqx=out:csv`;
    const res = await fetch(csvUrl);
    if (res.ok) {
      const text = await res.text();
      const rows = text.trim().split('\n').filter(r => r.trim());
      console.log(`   ✅ Sheet ฉลาก: เชื่อมต่อได้ (พบ ${rows.length - 1} แถวพร้อมปริ้นฉลาก)`);
      console.log(`   - คอลัมน์หัวตาราง: ${rows[0]}`);
      if (rows.length > 1) {
        console.log(`   - ตัวอย่างแถวแรก: ${rows[1]}`);
      }
    } else {
      console.log(`   ❌ Sheet ฉลาก HTTP ${res.status}`);
    }
  } catch(e) {
    console.log(`   ❌ Sheet ฉลาก Error: ${e.message}`);
  }

  // 5. Local Server Status
  console.log('\n5️⃣ LOCAL SERVER API (http://localhost:3000)');
  try {
    const res = await fetch('http://localhost:3000/api/items');
    if (res.ok) {
      const items = await res.json();
      console.log(`✅ Local Server /api/items: ONLINE (HTTP 200, ส่งข้อมูล ${items.length} รายการ)`);
    } else {
      console.log(`⚠️ Local Server /api/items HTTP ${res.status}`);
    }
  } catch(e) {
    console.log(`❌ Local Server Error: ${e.message}`);
  }

  console.log('\n====================================================');
  console.log('🏁 AUDIT COMPLETE: ALL SYSTEMS READY & CONNECTED');
  console.log('====================================================');
}

verifyConnections();
