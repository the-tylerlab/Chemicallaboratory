/** Return only the browser-safe Supabase anon/publishable key. */
function getPublicSupabaseKey(env = process.env) {
  return env.SUPABASE_ANON_KEY || env.SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_KEY || null;
}

module.exports = { getPublicSupabaseKey };
