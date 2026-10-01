// Dev test script — reads credentials from environment variables only.
// Usage: SUPABASE_URL=... SUPABASE_KEY=... node test_supabase_upsert.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_KEY must be set in environment or .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  const { data, error } = await supabase.from('system').upsert({ key: 'budget', value: { budget: 16001 } });
  console.log('Error:', error);
}
test();
