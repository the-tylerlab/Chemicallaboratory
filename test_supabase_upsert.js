const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = "https://avzneyaalenbyawfvykp.supabase.co";
const SUPABASE_KEY = "sb_publishable_iqpHDJXb983_PwFSoSDV9w_kd2pvKoj";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  const { data, error } = await supabase.from("system").upsert({ key: "budget", value: { budget: 16001 } });
  console.log("Error:", error);
}
test();
