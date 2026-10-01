// Dev test script — reads credentials from environment variables only.
// Usage: SUPABASE_URL=... SUPABASE_KEY=... node test_system_insert.js
require('dotenv').config();
const API_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '') + '/rest/v1';
const KEY = process.env.SUPABASE_KEY || '';
if (!API_URL || !KEY) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_KEY must be set in environment or .env');
  process.exit(1);
}

const headers = {
  'apikey': KEY,
  'Authorization': `Bearer ${KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'resolution=merge-duplicates'
};

async function testInsert() {
  const res = await fetch(`${API_URL}/system?key=eq.budget`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ key: 'budget', value: { budget: 17000 } })
  });
  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Response:', text);
}
testInsert();
