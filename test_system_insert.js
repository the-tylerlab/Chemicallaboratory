const API_URL = 'https://avzneyaalenbyawfvykp.supabase.co/rest/v1';
const KEY = 'sb_publishable_iqpHDJXb983_PwFSoSDV9w_kd2pvKoj';

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
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text);
}
testInsert();
