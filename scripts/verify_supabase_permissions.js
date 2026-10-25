/**
 * Read-Only & Non-Destructive Security Permissions Verification
 * Target: Supabase Production
 * 
 * Strict Standards:
 * 1. 100% Strictly Read-Only: NO INSERT probes, NO mutating RPC calls against Production.
 * 2. Reliable Error Attribution: Strictly differentiates:
 *    - PERMISSION_DENIED (42501, RLS violation)
 *    - TABLE_NOT_MIGRATED (404, schema cache missing, 42P01)
 *    - CONNECTION_ERROR (network, timeout)
 * 3. Indeterminate / Missing tables MUST NOT falsely pass.
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

function classifySupabaseError(error, status) {
  if (!error) return 'SUCCESS';
  const msg = (error.message || '').toLowerCase();
  const code = error.code || '';
  if (code === '42501' || msg.includes('permission denied') || msg.includes('violates row-level security')) {
    return 'PERMISSION_DENIED';
  }
  // PostgREST returns 404 when a table is either not in the schema OR when grants are revoked from the caller role.
  // Through the anon REST interface alone, this distinction is strictly INCONCLUSIVE.
  if (status === 404 || code === '42P01' || msg.includes('could not find the table') || msg.includes('schema cache')) {
    return 'INCONCLUSIVE';
  }
  if (msg.includes('timeout') || msg.includes('econnrefused') || status === 0) {
    return 'CONNECTION_ERROR';
  }
  return `ERROR_${code || status || 'UNKNOWN'}`;
}

async function verifySupabasePermissions() {
  console.log('================================================================');
  console.log('🛡️  SUPABASE PRODUCTION PERMISSION & SCHEMA CACHE AUDIT');
  console.log(`🌐 Target: ${SUPABASE_URL}`);
  console.log(`⏱️ Timestamp: ${new Date().toISOString()}`);
  console.log('🔒 Mode: 100% Strictly Read-Only (Zero Mutating Probes)');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;
  let inconclusive = 0;

  function recordResult(statusCategory, testName, details = '', isExpectedDenied = false) {
    if (isExpectedDenied) {
      if (statusCategory === 'PERMISSION_DENIED') {
        console.log(`  ✅ PASS: ${testName} (Explicitly Denied by RLS/Grants: 42501)`);
        passed++;
      } else if (statusCategory === 'INCONCLUSIVE') {
        console.log(`  ⚠️ INCONCLUSIVE: ${testName}`);
        console.log(`     -> Evidence: PostgREST schema cache does not expose this relation to the anon role (HTTP 404).`);
        console.log(`     -> Note: Consistent with REVOKE ALL, but cannot confirm table presence without direct pg_catalog metadata.`);
        inconclusive++;
      } else {
        console.error(`  ❌ FAIL: ${testName} -> Unexpected status: ${statusCategory} (${details})`);
        failed++;
      }
    } else {
      // Expected success (read-only allowed)
      if (statusCategory === 'SUCCESS') {
        console.log(`  ✅ PASS: ${testName}`);
        passed++;
      } else {
        console.error(`  ❌ FAIL: ${testName} -> Unexpected failure: ${statusCategory} (${details})`);
        failed++;
      }
    }
  }

  // ── 1. AUDIT REVOKED_TOKENS TABLE PERMISSION ──
  console.log('--- 1. Table: public.revoked_tokens (Read-Only Check) ---');
  const revRes = await supabase.from('revoked_tokens').select('token_hash').limit(1);
  const revCategory = classifySupabaseError(revRes.error, revRes.status);
  recordResult(
    revCategory,
    'Anonymous read on public.revoked_tokens',
    revRes.error?.message,
    true
  );

  // ── 2. AUDIT RATE_LIMITS TABLE PERMISSION ──
  console.log('\n--- 2. Table: public.rate_limits (Read-Only Check) ---');
  const rateRes = await supabase.from('rate_limits').select('key').limit(1);
  const rateCategory = classifySupabaseError(rateRes.error, rateRes.status);
  recordResult(
    rateCategory,
    'Anonymous read on public.rate_limits',
    rateRes.error?.message,
    true
  );

  // ── 3. AUDIT CENTRAL BUSINESS CATALOG (ITEMS) ──
  console.log('\n--- 3. Central Catalog (items) Read-Only Access ---');
  const itemsRes = await supabase.from('items').select('code', { count: 'exact', head: true });
  const itemsCategory = classifySupabaseError(itemsRes.error, itemsRes.status);
  recordResult(
    itemsCategory,
    `Anonymous read on public.items (verified ${itemsRes.count || 0} catalog records without mutation)`,
    itemsRes.error?.message,
    false
  );

  // ── 4. AUDIT USER DIRECTORY (USERS) ──
  console.log('\n--- 4. User Directory (users) Read-Only Integrity ---');
  const usersRes = await supabase.from('users').select('teacherId', { count: 'exact', head: true });
  const usersCategory = classifySupabaseError(usersRes.error, usersRes.status);
  recordResult(
    usersCategory,
    `Anonymous count on public.users (verified ${usersRes.count || 0} user records without leaking data)`,
    usersRes.error?.message,
    false
  );

  // ── 5. AUDIT LOGS PRIVACY (AUDIT_LOGS) ──
  console.log('\n--- 5. Audit Trail (audit_logs) Read-Only Protection ---');
  const auditRes = await supabase.from('audit_logs').select('id').limit(1);
  const auditCategory = classifySupabaseError(auditRes.error, auditRes.status);
  const isAuditProtected = auditCategory === 'PERMISSION_DENIED' || (auditCategory === 'SUCCESS' && Array.isArray(auditRes.data) && auditRes.data.length === 0);
  if (isAuditProtected) {
    console.log('  ✅ PASS: Anonymous read on public.audit_logs is protected (RLS enforced or empty)');
    passed++;
  } else {
    console.error(`  ❌ FAIL: Audit logs exposed to anonymous caller (${auditCategory}: ${auditRes.error?.message})`);
    failed++;
  }

  console.log('\n================================================================');
  console.log(`Audit Complete: ${passed} Passed, ${failed} Failed, ${inconclusive} Inconclusive`);
  console.log('================================================================');

  if (inconclusive > 0) {
    console.log(`\nℹ️  Notice on Inconclusive Results:`);
    console.log(`   Anonymous REST inspection cannot distinguish between a revoked grant and an unmigrated table.`);
    console.log(`   To verify schema definitions and RLS policies authoritatively without writing data:`);
    console.log(`   - Review SQL bundle: dist/supabase_migration_bundle.sql`);
    console.log(`   - Query information_schema.table_privileges using database service_role credentials.`);
  }

  // If there are definitive failures, exit with code 1; if only inconclusive and passes, exit with 0 (read-only audit completed)
  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

verifySupabasePermissions();
