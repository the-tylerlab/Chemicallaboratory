require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL || "https://dummy", process.env.VITE_SUPABASE_ANON_KEY || "dummy");

async function run() {
  const { data, error } = await supabase.from("purchase_orders").select("*");
  console.log("Error:", error);
  console.log("Data:", data);
}
run();
