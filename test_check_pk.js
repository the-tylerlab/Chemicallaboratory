const API_URL = 'https://avzneyaalenbyawfvykp.supabase.co/rest/v1';
const KEY = 'sb_publishable_iqpHDJXb983_PwFSoSDV9w_kd2pvKoj';
const headers = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' };
fetch(`${API_URL}/system?select=*`, { headers }).then(r=>r.json()).then(data => {
    console.log(data);
});
