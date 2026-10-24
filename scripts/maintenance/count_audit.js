require('dotenv').config();
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

async function getStats() {
  console.log('=== COUNT AUDIT ===');
  
  // 1. Local Database (data/database.json)
  const localDb = JSON.parse(fs.readFileSync('data/database.json', 'utf8'));
  const localActive = localDb.filter(i => !i.is_deleted);
  const localCat = localActive.reduce((acc, i) => { acc[i.category || 'ไม่ระบุ'] = (acc[i.category || 'ไม่ระบุ'] || 0) + 1; return acc; }, {});
  console.log('1. Local Database (data/database.json):', localActive.length, 'รายการ');
  console.log('   - แยกตามหมวดหมู่:', JSON.stringify(localCat));

  // 2. Local Server API (/api/items)
  try {
    const res = await fetch('http://localhost:3000/api/items');
    const items = await res.json();
    console.log('2. Local Server (/api/items):', items.length, 'รายการ');
  } catch(e) {
    console.log('2. Local Server:', e.message);
  }

  // 3. Supabase Cloud (items table)
  try {
    const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    const { count, data, error } = await sb.from('items').select('*', { count: 'exact' });
    if (error) console.log('3. Supabase Error:', error.message);
    else {
      const sbCat = (data || []).reduce((acc, i) => { acc[i.category || 'ไม่ระบุ'] = (acc[i.category || 'ไม่ระบุ'] || 0) + 1; return acc; }, {});
      console.log('3. Supabase Cloud (items):', count, 'รายการ');
      console.log('   - แยกตามหมวดหมู่:', JSON.stringify(sbCat));
    }
  } catch(e) {
    console.log('3. Supabase:', e.message);
  }

  // 4. Google Sheet 1: Master Sheet (1.Items)
  try {
    const csvUrl = 'https://docs.google.com/spreadsheets/d/1OBE_eI_C_1T-AXp_8Gr93WnCU0JvTwfW6_Bhpm997zI/gviz/tq?tqx=out:csv&sheet=1.Items';
    const res = await fetch(csvUrl);
    const text = await res.text();
    const rows = text.trim().split('\n').filter(r => r.trim());
    console.log('4. Google Sheet 1 (Master 1.Items):', rows.length - 1, 'รายการ (แถวข้อมูล)');
  } catch(e) {
    console.log('4. Google Sheet 1:', e.message);
  }

  // 5. Google Sheet 2: Label Printing Sheet (1nyZ...)
  try {
    const labelSheetId = process.env.GOOGLE_LABEL_SHEET_ID || '1nyZPEmhXYukJjAYIeBYvH4cO98n_Dsz5AdQKT4PdzsE';
    const csvUrl = 'https://docs.google.com/spreadsheets/d/' + labelSheetId + '/gviz/tq?tqx=out:csv';
    const res = await fetch(csvUrl);
    const text = await res.text();
    const rows = text.trim().split('\n').filter(r => r.trim());
    console.log('5. Google Sheet 2 (Label Print):', rows.length - 1, 'รายการ (แถวพร้อมพิมพ์)');
  } catch(e) {
    console.log('5. Google Sheet 2:', e.message);
  }
}

getStats();
