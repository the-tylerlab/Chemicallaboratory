/**
 * Live Staging Integration Test Suite for Supabase Database
 * 
 * Tests real live PostgreSQL RLS policies, table grants, and RPC execution
 * across all 3 roles (anon, authenticated, service_role) using isolated STAGING credentials.
 * 
 * Environment Variables Required (Separated from Production):
 * - STAGING_SUPABASE_URL
 * - STAGING_SUPABASE_ANON_KEY
 * - STAGING_SUPABASE_SERVICE_ROLE_KEY
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const STAGING_URL = process.env.STAGING_SUPABASE_URL;
const STAGING_ANON_KEY = process.env.STAGING_SUPABASE_ANON_KEY;
const STAGING_SERVICE_KEY = process.env.STAGING_SUPABASE_SERVICE_ROLE_KEY;

async function runStagingIntegration() {
  console.log('================================================================');
  console.log('🌐 SUPABASE STAGING LIVE INTEGRATION TEST SUITE');
  console.log('================================================================\n');

  if (!STAGING_URL || !STAGING_ANON_KEY || !STAGING_SERVICE_KEY) {
    console.log('⚠️  STAGING CREDENTIALS NOT CONFIGURED:');
    console.log('   STAGING_SUPABASE_URL:', STAGING_URL ? 'Configured' : 'Missing');
    console.log('   STAGING_SUPABASE_ANON_KEY:', STAGING_ANON_KEY ? 'Configured' : 'Missing');
    console.log('   STAGING_SUPABASE_SERVICE_ROLE_KEY:', STAGING_SERVICE_KEY ? 'Configured' : 'Missing');
    console.log('\n💡 Notice:');
    console.log('   To execute live staging integration tests against an active Supabase instance,');
    console.log('   configure the isolated staging keys above in your .env or CI/CD environment.');
    console.log('   (Production credentials will NEVER be used for staging mutation tests).\n');
    console.log('⏭️  Skipping staging integration test (Zero Side-Effects).\n');
    process.exit(0);
  }

  console.log(`🎯 Staging Target: ${STAGING_URL}`);
  console.log(`⏱️ Timestamp: ${new Date().toISOString()}\n`);

  let passed = 0;
  let total = 0;

  function expect(condition, message, errorDetail = '') {
    total++;
    if (condition) {
      console.log(`   ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`   ❌ FAIL: ${message} ${errorDetail ? `(${errorDetail})` : ''}`);
    }
  }

  // ── 1. ROLE: anon ──
  console.log('--- 1. Testing Live Staging Role: anon ---');
  const anonClient = createClient(STAGING_URL, STAGING_ANON_KEY);

  // Anon SELECT on revoked_tokens must be denied (42501)
  const anonRev = await anonClient.from('revoked_tokens').select('*').limit(1);
  expect(
    anonRev.error && (anonRev.error.code === '42501' || anonRev.status === 401 || anonRev.status === 403),
    'anon SELECT on revoked_tokens is denied by RLS/Grants',
    anonRev.error?.message
  );

  // Anon SELECT on rate_limits must be denied (42501)
  const anonRate = await anonClient.from('rate_limits').select('*').limit(1);
  expect(
    anonRate.error && (anonRate.error.code === '42501' || anonRate.status === 401 || anonRate.status === 403),
    'anon SELECT on rate_limits is denied by RLS/Grants',
    anonRate.error?.message
  );

  // Anon RPC increment_rate_limit must be denied
  const anonRpc = await anonClient.rpc('increment_rate_limit', {
    p_key: 'probe_anon',
    p_window_ms: 60000,
    p_max_attempts: 5
  });
  expect(
    anonRpc.error !== null,
    'anon EXECUTE on increment_rate_limit RPC is restricted',
    anonRpc.error?.message
  );

  // Anon SELECT on items catalog should be permitted
  const anonItems = await anonClient.from('items').select('code', { count: 'exact', head: true });
  expect(
    !anonItems.error,
    'anon SELECT on items catalog is permitted',
    anonItems.error?.message
  );

  // ── 2. ROLE: authenticated ──
  console.log('\n--- 2. Testing Live Staging Role: authenticated ---');
  // Generate a test authenticated JWT
  const testSecret = process.env.STAGING_JWT_SECRET || 'staging_jwt_secret_for_tests';
  const userToken = jwt.sign(
    { sub: '00000000-0000-0000-0000-000000000001', role: 'authenticated', aud: 'authenticated' },
    testSecret,
    { expiresIn: '1h' }
  );
  const authClient = createClient(STAGING_URL, STAGING_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${userToken}` } }
  });

  const authRev = await authClient.from('revoked_tokens').select('*').limit(1);
  expect(
    authRev.error && (authRev.error.code === '42501' || authRev.status === 403),
    'authenticated SELECT on revoked_tokens is denied by RLS/Grants',
    authRev.error?.message
  );

  const authRate = await authClient.from('rate_limits').select('*').limit(1);
  expect(
    authRate.error && (authRate.error.code === '42501' || authRate.status === 403),
    'authenticated SELECT on rate_limits is denied by RLS/Grants',
    authRate.error?.message
  );

  // ── 3. ROLE: service_role ──
  console.log('\n--- 3. Testing Live Staging Role: service_role ---');
  const serviceClient = createClient(STAGING_URL, STAGING_SERVICE_KEY);

  // Read revoked_tokens with service_role
  const srvRev = await serviceClient.from('revoked_tokens').select('token_hash').limit(1);
  expect(
    !srvRev.error,
    'service_role SELECT on revoked_tokens is allowed',
    srvRev.error?.message
  );

  // Read rate_limits with service_role
  const srvRate = await serviceClient.from('rate_limits').select('key').limit(1);
  expect(
    !srvRate.error,
    'service_role SELECT on rate_limits is allowed',
    srvRate.error?.message
  );

  // Execute RPC with service_role
  const srvRpc = await serviceClient.rpc('increment_rate_limit', {
    p_key: 'staging_test_counter',
    p_window_ms: 60000,
    p_max_attempts: 5
  });
  expect(
    !srvRpc.error && Array.isArray(srvRpc.data) && srvRpc.data.length > 0,
    'service_role EXECUTE on increment_rate_limit RPC is allowed and functional',
    srvRpc.error?.message
  );

  console.log('\n================================================================');
  console.log(`Live Staging Integration Audit: ${passed}/${total} Passed!`);
  console.log('================================================================\n');

  if (passed !== total) process.exit(1);
  process.exit(0);
}

runStagingIntegration();
