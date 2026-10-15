/**
 * scripts/sync_to_label_sheet.js
 * Synchronizes inventory items to the dedicated Google Sheet for label printing.
 * 
 * Target Google Sheet: https://docs.google.com/spreadsheets/d/1nyZPEmhXYukJjAYIeBYvH4cO98n_Dsz5AdQKT4PdzsE
 * Columns: Code, Name, Category, qty, unit, room, cabinet, shelf, QR_Target_URL
 * 
 * Usage:
 *   node scripts/sync_to_label_sheet.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;
const LABEL_SHEET_ID = process.env.GOOGLE_LABEL_SHEET_ID || '1nyZPEmhXYukJjAYIeBYvH4cO98n_Dsz5AdQKT4PdzsE';
const APP_BASE_URL = process.env.APP_BASE_URL || 'https://chemicallab.vercel.app';

async function fetchAllItems() {
  // 1. Try Supabase
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
      const { data, error } = await sb
        .from('items')
        .select('*')
        .eq('is_deleted', false)
        .order('code', { ascending: true });
      if (!error && Array.isArray(data) && data.length > 0) {
        console.log(`📦 Retrieved ${data.length} items from Supabase cloud database.`);
        return data;
      }
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to local database.json:', e.message);
    }
  }

  // 2. Fallback to data/database.json
  const dbPath = path.resolve(__dirname, '../data/database.json');
  if (fs.existsSync(dbPath)) {
    try {
      const raw = fs.readFileSync(dbPath, 'utf8');
      const items = JSON.parse(raw);
      console.log(`📂 Retrieved ${items.length} items from local database.json.`);
      return items;
    } catch (e) {
      console.error('Failed to parse local database.json:', e.message);
    }
  }

  return [];
}

async function main() {
  console.log('===========================================================');
  console.log('🏷️  SYNC ITEMS TO GOOGLE SHEET FOR LABEL PRINTING');
  console.log(`🎯 Target Sheet ID: ${LABEL_SHEET_ID}`);
  console.log('===========================================================');

  if (!GOOGLE_SCRIPT_URL) {
    console.error('❌ GOOGLE_SCRIPT_URL not configured in environment!');
    process.exit(1);
  }

  const items = await fetchAllItems();
  if (items.length === 0) {
    console.warn('⚠️ No items found to sync.');
    return;
  }

  // Format records for label sheet
  const formattedItems = items.map(item => {
    const code = item.code || '';
    return {
      Code: code,
      Name: item.name || '',
      Category: item.category || '',
      qty: item.qty !== undefined ? item.qty : (item.quantity !== undefined ? item.quantity : 0),
      unit: item.unit || '',
      room: item.room || '',
      cabinet: item.cabinet || '',
      shelf: item.shelf || '',
      QR_Target_URL: `${APP_BASE_URL}/#/item?id=${encodeURIComponent(code)}`
    };
  });

  console.log(`🚀 Dispatching ${formattedItems.length} records to Google Apps Script Webhook...`);

  try {
    const res = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'SYNC_LABEL_SHEET',
        targetSheetId: LABEL_SHEET_ID,
        data: formattedItems
      })
    });

    console.log(`✅ Google Apps Script responded with HTTP status ${res.status}.`);
    console.log('===========================================================');
    console.log('🎉 Label Printing Sheet sync completed successfully!');
    console.log(`🔗 Sheet URL: https://docs.google.com/spreadsheets/d/${LABEL_SHEET_ID}/edit`);
    console.log('===========================================================');
  } catch (err) {
    console.error('❌ Failed to dispatch sync to Google Apps Script:', err.message);
  }
}

main();
