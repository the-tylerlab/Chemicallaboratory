// Dev test script — reads credentials from environment variables only.
// Usage: SUPABASE_URL=... SUPABASE_KEY=... node test_check_budget.js
require('dotenv').config();
const API_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '') + '/rest/v1';
const KEY = process.env.SUPABASE_KEY || '';
if (!API_URL || !KEY) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_KEY must be set in environment or .env');
  process.exit(1);
}
const headers = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' };
fetch(`${API_URL}/system?key=eq.budget`, { headers }).then(r => r.json()).then(data => console.log(JSON.stringify(data, null, 2)));
