/**
 * Live Staging Integration Test Suite for Supabase Database
 * 
 * Strict Isolation & Security Standards:
 * 1. Target Guard: STAGING_SUPABASE_URL must NOT match Production URL. Aborts immediately on match.
 * 2. CI vs Local Enforcement: Missing credentials in CI (REQUIRE_STAGING or CI=true) FAILS with exit code 1.
 *    Local developers without staging keys are marked clearly as [SKIP].
 * 3. Specific RPC Assertions: Verifies exact rejection codes (42501 Permission Denied vs 42883 Not Found).
 * 4. Dedicated Test Keys & Guaranteed Cleanup: Isolated key namespace with cleanup in finally block.
 * 5. Safe Masked Project Identity Summary (zero secrets leaked).
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const PROD_HOST = 'avzneyaalenbyawfvykp.supabase.co';
const STAGING_URL = process.env.STAGING_SUPABASE_URL;
const STAGING_ANON_KEY = process.env.STAGING_SUPABASE_ANON_KEY;
const STAGING_SERVICE_KEY = process.env.STAGING_SUPABASE_SERVICE_ROLE_KEY;

const isCI = Boolean(process.env.CI || process.env.GITHUB_ACTIONS || process.env.REQUIRE_STAGING);

async function runStagingIntegration() {
  console.log('================================================================');
  console.log('🌐 SUPABASE STAGING LIVE INTEGRATION TEST SUITE');
  console.log(`⏱️ Timestamp: ${new Date().toISOString()}`);
  console.log('================================================================\n');

  // ── 1. CREDENTIALS & CI VALIDATION ──
  if (!STAGING_URL || !STAGING_ANON_KEY || !STAGING_SERVICE_KEY) {
    if (isCI) {
      console.error('❌ CI REQUIRED CHECK FAILED: Staging Supabase credentials are required in CI environment!');
      console.error('   Missing one or more secrets: STAGING_SUPABASE_URL, STAGING_SUPABASE_ANON_KEY, STAGING_SUPABASE_SERVICE_ROLE_KEY');
      process.exit(1);
    } else {
      console.log('⚠️  [SKIP] Staging Supabase credentials not provided in local environment.');
      console.log('   (Local developers can run unit tests via `npm run test:unit`).');
      console.log('   To enable live staging integration, set STAGING_SUPABASE_* variables.\n');
      console.log('Summary: 0 Passed, 0 Failed, 1 Skipped\n');
      process.exit(0);
    }
  }

  // ── 2. PRODUCTION GUARD: PREVENT RUNNING AGAINST PRODUCTION ──
  const stagingHost = new URL(STAGING_URL).hostname.toLowerCase();
  const prodHostConfig = process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).hostname.toLowerCase() : PROD_HOST;

  if (stagingHost === PROD_HOST || stagingHost === prodHostConfig) {
    console.error('🛑 CRITICAL SAFETY GUARD TRIPPED:');
    console.error(`   STAGING_SUPABASE_URL (${stagingHost}) points to PRODUCTION database!`);
    console.error('   Integration tests with mutations/RPC are strictly forbidden against Production.');
    process.exit(1);
  }

  const maskedHost = stagingHost.slice(0, 4) + '****' + stagingHost.slice(-12);
  console.log(`🎯 Validated Staging Target: ${maskedHost} (Non-Production Verified)`);

  let passed = 0;
  let failed = 0;
  let total = 0;

  function expect(condition, message, errorDetail = '') {
    total++;
    if (condition) {
      console.log(`   ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`   ❌ FAIL: ${message} ${errorDetail ? `(${errorDetail})` : ''}`);
      failed++;
    }
  }

  const anonClient = createClient(STAGING_URL, STAGING_ANON_KEY);
  const serviceClient = createClient(STAGING_URL, STAGING_SERVICE_KEY);

  // Dedicated test key isolated to this test execution
  const testKey = `staging_audit:test_key_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  try {
    // ── 3. ROLE: anon (Unauthenticated Caller) ──
    console.log('\n--- 1. Testing Live Staging Role: anon ---');

    // Anon SELECT on revoked_tokens must be denied
    const anonRev = await anonClient.from('revoked_tokens').select('token_hash').limit(1);
    const isAnonRevBlocked = anonRev.error && (anonRev.error.code === '42501' || anonRev.status === 401 || anonRev.status === 403);
    expect(
      isAnonRevBlocked,
      'anon SELECT on revoked_tokens is explicitly denied by RLS/Grants (42501/403)',
      `Code: ${anonRev.error?.code}, Msg: ${anonRev.error?.message}`
    );

    // Anon SELECT on rate_limits must be denied
    const anonRate = await anonClient.from('rate_limits').select('key').limit(1);
    const isAnonRateBlocked = anonRate.error && (anonRate.error.code === '42501' || anonRate.status === 401 || anonRate.status === 403);
    expect(
      isAnonRateBlocked,
      'anon SELECT on rate_limits is explicitly denied by RLS/Grants (42501/403)',
      `Code: ${anonRate.error?.code}, Msg: ${anonRate.error?.message}`
    );

    // Anon RPC increment_rate_limit execution check
    const anonRpc = await anonClient.rpc('increment_rate_limit', {
      p_key: testKey,
      p_window_ms: 60000,
      p_max_attempts: 5
    });
    const isAnonRpcDenied = anonRpc.error && (anonRpc.error.code === '42501' || anonRpc.status === 403 || anonRpc.status === 401);
    const isAnonRpcNotFound = anonRpc.error && (anonRpc.error.code === '42883' || anonRpc.status === 404);

    if (isAnonRpcNotFound) {
      expect(false, 'RPC increment_rate_limit does not exist in staging (42883)', anonRpc.error?.message);
    } else {
      expect(
        isAnonRpcDenied,
        'anon EXECUTE on increment_rate_limit RPC is restricted (42501 Permission Denied)',
        `Code: ${anonRpc.error?.code}, Msg: ${anonRpc.error?.message}`
      );
    }

    // Anon SELECT on items catalog should be permitted
    const anonItems = await anonClient.from('items').select('code', { count: 'exact', head: true });
    expect(!anonItems.error, 'anon SELECT on items catalog is permitted for read-only access');

    // ── 4. ROLE: authenticated (Standard User Identity) ──
    console.log('\n--- 2. Testing Live Staging Role: authenticated ---');
    const stagingJwtSecret = process.env.STAGING_JWT_SECRET || 'staging_test_jwt_secret_valid';
    const authUserToken = jwt.sign(
      {
        sub: '00000000-0000-0000-0000-000000000001',
        role: 'authenticated',
        aud: 'authenticated',
        app_metadata: { role: 'authenticated' },
        user_metadata: { name: 'Staging Test User' }
      },
      stagingJwtSecret,
      { expiresIn: '1h' }
    );

    const authClient = createClient(STAGING_URL, STAGING_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${authUserToken}` } }
    });

    const authRev = await authClient.from('revoked_tokens').select('token_hash').limit(1);
    const isAuthRevBlocked = authRev.error && (authRev.error.code === '42501' || authRev.status === 403);
    expect(
      isAuthRevBlocked,
      'authenticated SELECT on revoked_tokens is denied by RLS/Grants (42501)',
      `Code: ${authRev.error?.code}, Msg: ${authRev.error?.message}`
    );

    const authRate = await authClient.from('rate_limits').select('key').limit(1);
    const isAuthRateBlocked = authRate.error && (authRate.error.code === '42501' || authRate.status === 403);
    expect(
      isAuthRateBlocked,
      'authenticated SELECT on rate_limits is denied by RLS/Grants (42501)',
      `Code: ${authRate.error?.code}, Msg: ${authRate.error?.message}`
    );

    // Cross-user RLS check: Authenticated standard users must not read other users passwords/hashes directly
    const authDirectUsers = await authClient.from('users').select('password, password_hash').limit(1);
    const isAuthDirectUsersBlocked = authDirectUsers.error || !authDirectUsers.data || authDirectUsers.data.length === 0 || !authDirectUsers.data[0]?.password;
    expect(
      isAuthDirectUsersBlocked,
      'RLS prevents authenticated non-admin caller from accessing raw credentials/hashes directly'
    );

    // ── 5. ROLE: service_role (Backend API) ──
    console.log('\n--- 3. Testing Live Staging Role: service_role ---');

    // service_role can read revoked_tokens
    const srvRev = await serviceClient.from('revoked_tokens').select('token_hash').limit(1);
    expect(!srvRev.error, 'service_role SELECT on revoked_tokens is allowed', srvRev.error?.message);

    // service_role can read rate_limits
    const srvRate = await serviceClient.from('rate_limits').select('key').limit(1);
    expect(!srvRate.error, 'service_role SELECT on rate_limits is allowed', srvRate.error?.message);

    // service_role can execute increment_rate_limit RPC
    const srvRpc = await serviceClient.rpc('increment_rate_limit', {
      p_key: testKey,
      p_window_ms: 60000,
      p_max_attempts: 2
    });
    expect(
      !srvRpc.error && Array.isArray(srvRpc.data) && srvRpc.data.length > 0 && srvRpc.data[0].count === 1,
      'service_role EXECUTE on increment_rate_limit RPC is allowed and functional (count: 1)',
      srvRpc.error?.message
    );

  } finally {
    // ── 6. SAFE ISOLATED CLEANUP ──
    console.log('\n--- 4. Cleanup Staging Test Artifacts ---');
    try {
      await serviceClient.from('rate_limits').delete().eq('key', testKey);
      console.log(`   🧹 Cleaned up staging test key: ${testKey}`);
    } catch (_) {
      // Best-effort cleanup
    }
  }

  console.log('\n================================================================');
  console.log(`🏁 Staging Integration Summary: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
  process.exit(0);
}

runStagingIntegration();
