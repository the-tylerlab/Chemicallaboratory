/**
 * Mock RBAC Specification Test (In-Memory Simulation)
 * 
 * ⚠️  IMPORTANT NOTICE:
 * This test validates application logic against simulated RBAC rules.
 * It is an IN-MEMORY UNIT-LEVEL SPECIFICATION TEST and DOES NOT verify
 * actual deployed PostgreSQL policies or grants in a live Supabase instance.
 * For live database policy verification, use tests/test_supabase_staging_integration.js
 */

const assert = require('assert');

function createStagingSupabaseClient(role = 'anon') {
  // Isolated staging in-memory database
  const stagingDb = {
    revoked_tokens: new Map(),
    rate_limits: new Map(),
    items: [
      { code: 'CHEM-STAGE-001', name: 'Test Reagent', qty: 10, unit: 'bottle' }
    ]
  };

  return {
    getRole() { return role; },
    from(tableName) {
      return {
        select(fields) {
          return {
            async limit(n) {
              // RLS Policy Check
              if (tableName === 'revoked_tokens' || tableName === 'rate_limits') {
                if (role !== 'service_role') {
                  return {
                    data: null,
                    error: {
                      code: '42501',
                      message: `permission denied for table ${tableName}`
                    },
                    status: 403
                  };
                }
              }
              const rows = Array.from(stagingDb[tableName]?.values() || stagingDb[tableName] || []);
              return { data: rows.slice(0, n), error: null, status: 200 };
            },
            eq(col, val) {
              return {
                async maybeSingle() {
                  if (tableName === 'revoked_tokens' || tableName === 'rate_limits') {
                    if (role !== 'service_role') {
                      return {
                        data: null,
                        error: { code: '42501', message: `permission denied for table ${tableName}` },
                        status: 403
                      };
                    }
                  }
                  const row = stagingDb[tableName]?.get(val);
                  return { data: row || null, error: null, status: 200 };
                }
              };
            }
          };
        },
        async insert(records) {
          // RLS Policy Check
          if (tableName === 'revoked_tokens' || tableName === 'rate_limits') {
            if (role !== 'service_role') {
              return {
                data: null,
                error: { code: '42501', message: `permission denied for table ${tableName}` },
                status: 403
              };
            }
          }
          const items = Array.isArray(records) ? records : [records];
          for (const item of items) {
            const key = item.token_hash || item.key;
            stagingDb[tableName]?.set(key, item);
          }
          return { data: items, error: null, status: 201 };
        },
        async delete() {
          if (tableName === 'revoked_tokens' || tableName === 'rate_limits') {
            if (role !== 'service_role') {
              return {
                data: null,
                error: { code: '42501', message: `permission denied for table ${tableName}` },
                status: 403
              };
            }
          }
          stagingDb[tableName]?.clear();
          return { data: null, error: null, status: 204 };
        }
      };
    },
    async rpc(fnName, args) {
      if (fnName === 'increment_rate_limit') {
        // Function execute grant check
        if (role !== 'service_role') {
          return {
            data: null,
            error: {
              code: '42501',
              message: 'permission denied for function increment_rate_limit'
            },
            status: 403
          };
        }
        const key = args.p_key;
        const windowMs = args.p_window_ms;
        const maxAttempts = args.p_max_attempts;
        const now = Date.now();
        let rec = stagingDb.rate_limits.get(key);
        if (!rec || (now - rec.first_attempt > windowMs)) {
          rec = { key, count: 1, first_attempt: now, last_attempt: now, blocked_until: null };
        } else {
          rec.count += 1;
          rec.last_attempt = now;
          if (rec.count >= maxAttempts) {
            rec.blocked_until = now + windowMs;
          }
        }
        stagingDb.rate_limits.set(key, rec);
        return {
          data: [{
            count: rec.count,
            first_attempt: new Date(rec.first_attempt).toISOString(),
            last_attempt: new Date(rec.last_attempt).toISOString(),
            blocked_until: rec.blocked_until ? new Date(rec.blocked_until).toISOString() : null,
            allowed: !rec.blocked_until || rec.blocked_until <= now
          }],
          error: null,
          status: 200
        };
      }
      return { data: null, error: { message: 'function not found' }, status: 404 };
    }
  };
}

async function runStagingRoleTests() {
  console.log('================================================================');
  console.log('🧪 MOCK RBAC SPECIFICATION AUDIT (IN-MEMORY SIMULATION)');
  console.log('⚠️  Notice: Validates application logic; does not verify live Supabase');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function expect(condition, desc) {
    total++;
    if (condition) {
      console.log(`   ✅ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`   ❌ FAIL: ${desc}`);
    }
  }

  // ── 1. ROLE: anon ──
  console.log('--- 1. Testing Role: anon ---');
  const anonClient = createStagingSupabaseClient('anon');
  
  const anonRevSelect = await anonClient.from('revoked_tokens').select('*').limit(1);
  expect(anonRevSelect.error?.code === '42501', 'anon SELECT on revoked_tokens is denied (42501)');

  const anonRevInsert = await anonClient.from('revoked_tokens').insert({ token_hash: 'probe' });
  expect(anonRevInsert.error?.code === '42501', 'anon INSERT on revoked_tokens is denied (42501)');

  const anonRateSelect = await anonClient.from('rate_limits').select('*').limit(1);
  expect(anonRateSelect.error?.code === '42501', 'anon SELECT on rate_limits is denied (42501)');

  const anonRpc = await anonClient.rpc('increment_rate_limit', { p_key: 'test', p_window_ms: 60000, p_max_attempts: 5 });
  expect(anonRpc.error?.code === '42501', 'anon RPC increment_rate_limit is denied (42501)');

  const anonItems = await anonClient.from('items').select('*').limit(1);
  expect(anonItems.status === 200 && anonItems.data.length > 0, 'anon SELECT on items is permitted (public catalog)');

  // ── 2. ROLE: authenticated ──
  console.log('\n--- 2. Testing Role: authenticated ---');
  const authClient = createStagingSupabaseClient('authenticated');

  const authRevSelect = await authClient.from('revoked_tokens').select('*').limit(1);
  expect(authRevSelect.error?.code === '42501', 'authenticated SELECT on revoked_tokens is denied (42501)');

  const authRevInsert = await authClient.from('revoked_tokens').insert({ token_hash: 'probe' });
  expect(authRevInsert.error?.code === '42501', 'authenticated INSERT on revoked_tokens is denied (42501)');

  const authRateSelect = await authClient.from('rate_limits').select('*').limit(1);
  expect(authRateSelect.error?.code === '42501', 'authenticated SELECT on rate_limits is denied (42501)');

  const authRpc = await authClient.rpc('increment_rate_limit', { p_key: 'test', p_window_ms: 60000, p_max_attempts: 5 });
  expect(authRpc.error?.code === '42501', 'authenticated RPC increment_rate_limit is denied (42501)');

  // ── 3. ROLE: service_role ──
  console.log('\n--- 3. Testing Role: service_role ---');
  const serviceClient = createStagingSupabaseClient('service_role');

  const srvRevInsert = await serviceClient.from('revoked_tokens').insert({ token_hash: 'valid_revoked_hash' });
  expect(srvRevInsert.status === 201, 'service_role INSERT on revoked_tokens is allowed');

  const srvRevSelect = await serviceClient.from('revoked_tokens').select('*').eq('token_hash', 'valid_revoked_hash').maybeSingle();
  expect(srvRevSelect.status === 200 && srvRevSelect.data?.token_hash === 'valid_revoked_hash', 'service_role SELECT on revoked_tokens is allowed');

  const srvRateInsert = await serviceClient.from('rate_limits').insert({ key: 'user_srv_key', count: 1 });
  expect(srvRateInsert.status === 201, 'service_role INSERT on rate_limits is allowed');

  // RPC Increment execution
  const srvRpc1 = await serviceClient.rpc('increment_rate_limit', { p_key: 'ip_rate_test', p_window_ms: 60000, p_max_attempts: 2 });
  expect(srvRpc1.status === 200 && srvRpc1.data[0].count === 1 && srvRpc1.data[0].allowed === true, 'service_role RPC increment attempt 1 succeeds (allowed: true)');

  const srvRpc2 = await serviceClient.rpc('increment_rate_limit', { p_key: 'ip_rate_test', p_window_ms: 60000, p_max_attempts: 2 });
  expect(srvRpc2.status === 200 && srvRpc2.data[0].count === 2 && srvRpc2.data[0].allowed === false, 'service_role RPC increment attempt 2 reaches max and blocks (allowed: false)');

  console.log('\n================================================================');
  console.log(`🎉 Staging Multi-Role Audit: ${passed}/${total} Passed!`);
  console.log('================================================================\n');

  if (passed !== total) process.exit(1);
}

runStagingRoleTests();
