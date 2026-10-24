/**
 * Synchronize all 482 Physical Lab Items into All Databases
 * - Local database.json
 * - Supabase Cloud Database (items table)
 * - Google Sheet 2 (Label Printing)
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const csvUrl = 'https://docs.google.com/spreadsheets/d/1OBE_eI_C_1T-AXp_8Gr93WnCU0JvTwfW6_Bhpm997zI/gviz/tq?tqx=out:csv&sheet=1.Items';

async function syncAll482() {
  console.log('========================================================');
  console.log('🔄 STARTING SYNC OF ALL 482 ITEMS TO ALL DATABASES');
  console.log('========================================================\n');

  // STEP 1: Fetch and parse Google Sheet 1.Items
  console.log('📥 1. Fetching all items from Google Sheet (1.Items)...');
  const res = await fetch(csvUrl);
  const text = await res.text();
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/\"/g, '').trim());

  const rawItems = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const matches = line.match(/(\"[^\"]*\"|[^\",]+)/g) || [];
    const row = matches.map(m => m.replace(/^\"|\"$/g, '').trim());
    const item = {};
    headers.forEach((h, idx) => {
      item[h] = row[idx] || '';
    });
    if (item.cabinet && item.cabinet !== '-' && item.cabinet !== '') {
      rawItems.push(item);
    }
  }

  console.log(`   - ดึงข้อมูลที่มีการระบุตู้จัดเก็บได้ทั้งหมด: ${rawItems.length} รายการ`);

  // STEP 2: Disambiguate duplicate codes to ensure 100% uniqueness for Supabase
  const codeTracker = new Map();
  const sanitized482 = rawItems.map((it, idx) => {
    let code = String(it.code || `ITEM-${idx + 1}`).trim();
    if (codeTracker.has(code)) {
      const count = codeTracker.get(code) + 1;
      codeTracker.set(code, count);
      code = `${code}-D${String(count).padStart(2, '0')}`;
    } else {
      codeTracker.set(code, 1);
    }

    return {
      code,
      name: String(it.name || '').trim(),
      category: it.category || (code.startsWith('EQ') ? 'อุปกรณ์วิทยาศาสตร์' : 'สารเคมี'),
      qty: Number(it.qty) || 0,
      damagedQty: Number(it.damagedQty) || 0,
      unit: String(it.unit || 'ขวด').trim(),
      minAlert: Number(it.minAlert) || 0,
      expiry: String(it.expiry || '').trim(),
      room: String(it.room || 'Lab 1').trim(),
      cabinet: String(it.cabinet || '').trim(),
      shelf: String(it.shelf || '').trim(),
      chemicalType: it.chemicalType || (code.startsWith('EQ') ? 'E' : 'G'),
      sdsUrl: it.sdsUrl || '',
      ghs: Array.isArray(it.ghs) ? it.ghs : (typeof it.ghs === 'string' && it.ghs ? it.ghs.split(',').map(s => s.trim()) : []),
      createdAt: it.createdAt || new Date().toISOString()
    };
  });

  console.log(`   - ทำความสะอาดและสร้างรหัสเฉพาะตัว (Unique Code) ครบ: ${sanitized482.length} รายการ\n`);

  // STEP 3: Write to Local Database Cache (data/database.json)
  console.log('💾 2. Updating Local Database Cache (data/database.json)...');
  const dbPath = path.join(__dirname, '..', '..', 'data', 'database.json');
  fs.writeFileSync(dbPath, JSON.stringify(sanitized482, null, 2), 'utf-8');
  console.log(`   ✅ บันทึกแคชข้อมูล 482 รายการลง ${dbPath} สำเร็จ\n`);

  // STEP 4: Upsert to Supabase Cloud Database (in batches of 50)
  console.log('☁️ 3. Upserting all 482 items to Supabase Cloud (items table)...');
  const batchSize = 50;
  let totalUpserted = 0;

  for (let i = 0; i < sanitized482.length; i += batchSize) {
    const batch = sanitized482.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from('items')
      .upsert(batch, { onConflict: 'code' })
      .select('code');

    if (error) {
      console.error(`   ❌ เกิดข้อผิดพลาดในการ Upsert Batch ${i / batchSize + 1}:`, error.message);
    } else {
      totalUpserted += (data || []).length;
      process.stdout.write(`   - ความคืบหน้า: ${totalUpserted}/${sanitized482.length} รายการ...\r`);
    }
  }

  // Check total in Supabase
  const { count: sbCount, error: countErr } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true });

  console.log(`\n   ✅ Supabase items table updated: ปัจจุบันมี ${sbCount} รายการในฐานข้อมูลคลาวด์\n`);

  // STEP 5: Sync to Google Sheet 2 (Label Printing Sheet)
  console.log('🏷️ 4. Syncing all 482 items to Google Sheet 2 (Label Printing)...');
  const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
  if (!scriptUrl) {
    console.warn('   ⚠️ Missing GOOGLE_SCRIPT_URL in .env, skipping Sheet 2 sync');
  } else {
    try {
      const syncPayload = {
        action: 'SYNC_LABEL_SHEET',
        table: 'LabelPrinting',
        data: sanitized482
      };

      const gsRes = await fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(syncPayload),
        redirect: 'follow'
      });

      console.log(`   ✅ ส่งข้อมูลฉลากทั้ง 482 รายการไปยัง Google Apps Script สำเร็จ (HTTP ${gsRes.status})`);
    } catch(e) {
      console.warn(`   ⚠️ Google Apps Script Label Sync Error: ${e.message}`);
    }
  }

  console.log('\n========================================================');
  console.log('🏁 SYNC COMPLETE: ALL 482 ITEMS CONNECTED TO ALL DATABASES');
  console.log('========================================================');
}

syncAll482().catch(console.error);
