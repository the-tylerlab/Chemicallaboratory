const API_URL = 'https://avzneyaalenbyawfvykp.supabase.co/rest/v1';
const KEY = 'REDACTED_SUPABASE_KEY';
const headers = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' };
fetch(`${API_URL}/system?key=eq.budget`, { headers }).then(r=>r.json()).then(data => console.log(JSON.stringify(data, null, 2)));
