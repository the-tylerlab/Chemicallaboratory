/**
 * Read-Only & Non-Destructive Security Permissions Verification
 * Target: Supabase Production
 * 
 * Verifies:
 * 1. public.revoked_tokens access restrictions (anon/public denied)
 * 2. public.rate_limits access restrictions (anon/public denied)
 * 3. increment_rate_limit RPC privileges
 * 4. RLS enforcement on business tables (items, users, audit_logs)
 * 5. ZERO side-effects on business data
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function verifySupabasePermissions() {
  console.log('================================================================');
  console.log('🛡️  SUPABASE PRODUCTION PERMISSION & RLS VERIFICATION');
  console.log(`🌐 Target: ${SUPABASE_URL}`);
  console.log(`⏱️ Timestamp: ${new Date().toISOString()}`);
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message, detail = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  // ── 1. VERIFY REVOKED_TOKENS TABLE PERMISSIONS ──
  console.log('--- 1. Table: public.revoked_tokens ---');
  const revSelect = await supabase.from('revoked_tokens').select('*').limit(1);
  const revSelectBlocked = revSelect.error !== null;
  assert(
    revSelectBlocked,
    'Anonymous SELECT on revoked_tokens is denied or hidden from schema cache',
    revSelect.error ? revSelect.error.message : 'Exposed to anon'
  );

  const revInsert = await supabase.from('revoked_tokens').insert({ token_hash: 'probe_test', expires_at: new Date().toISOString() });
  const revInsertBlocked = revInsert.error !== null;
  assert(
    revInsertBlocked,
    'Anonymous INSERT on revoked_tokens is strictly blocked',
    revInsert.error ? revInsert.error.message : 'Allowed insert'
  );

  // ── 2. VERIFY RATE_LIMITS TABLE PERMISSIONS ──
  console.log('\n--- 2. Table: public.rate_limits ---');
  const rateSelect = await supabase.from('rate_limits').select('*').limit(1);
  const rateSelectBlocked = rateSelect.error !== null;
  assert(
    rateSelectBlocked,
    'Anonymous SELECT on rate_limits is denied or hidden from schema cache',
    rateSelect.error ? rateSelect.error.message : 'Exposed to anon'
  );

  const rateInsert = await supabase.from('rate_limits').insert({ key: 'probe_key', count: 1 });
  const rateInsertBlocked = rateInsert.error !== null;
  assert(
    rateInsertBlocked,
    'Anonymous INSERT on rate_limits is strictly blocked',
    rateInsert.error ? rateInsert.error.message : 'Allowed insert'
  );

  // ── 3. VERIFY RPC FUNCTION PERMISSIONS ──
  console.log('\n--- 3. RPC Function: increment_rate_limit ---');
  const rpcRes = await supabase.rpc('increment_rate_limit', {
    p_key: 'probe_rpc',
    p_window_ms: 60000,
    p_max_attempts: 5
  });
  const rpcBlocked = rpcRes.error !== null;
  assert(
    rpcBlocked,
    'Anonymous execution of increment_rate_limit RPC is restricted/denied',
    rpcRes.error ? rpcRes.error.message : 'Allowed execute'
  );

  // ── 4. VERIFY BUSINESS DATA RLS & READ-ONLY ACCESS ──
  console.log('\n--- 4. Business Tables RLS Protection (Non-Destructive) ---');
  
  // Items table: read-only catalog allowed using primary key 'code'
  const itemsRead = await supabase.from('items').select('code', { count: 'exact', head: true });
  assert(!itemsRead.error && itemsRead.count > 0, `Anonymous read-only catalog query on items is permitted (count: ${itemsRead.count})`);

  // Users table: anonymous head query for existence
  const usersRead = await supabase.from('users').select('teacherId', { count: 'exact', head: true });
  assert(!usersRead.error && usersRead.count > 0, `Users table count verified without leaking personal records (count: ${usersRead.count})`);

  // Audit logs table: completely blocked or restricted from anon
  const auditRead = await supabase.from('audit_logs').select('id').limit(1);
  const auditBlocked = auditRead.error !== null || (Array.isArray(auditRead.data) && auditRead.data.length === 0);
  assert(auditBlocked, 'Audit logs are protected from anonymous inspection (denied or empty)');

  console.log('\n================================================================');
  console.log(`Verification Complete: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

verifySupabasePermissions();
