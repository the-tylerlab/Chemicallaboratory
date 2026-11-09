/** Regression checks for critical production security guards. */
const assert = require('assert');
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const root = path.resolve(__dirname, '..');
const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const configStart = server.indexOf("app.get('/api/config'");
const configEnd = server.indexOf("// 1. GET /api/items", configStart);
assert(configStart >= 0 && configEnd > configStart, 'config endpoint exists');
const configHandler = server.slice(configStart, configEnd);
assert(configHandler.includes('SUPABASE_PUBLIC_KEY'), 'config serves the public key');
assert(!configHandler.includes('SUPABASE_KEY'), 'config does not reference the server Supabase key');
const { getPublicSupabaseKey } = require('../src/security/public_supabase_key');
for (const nodeEnv of ['development', 'test', 'production']) {
  const responseKey = getPublicSupabaseKey({
    NODE_ENV: nodeEnv, SUPABASE_SERVICE_ROLE_KEY: 'service-role-test-marker',
    SUPABASE_ANON_KEY: 'anon-test-marker'
  });
  assert.strictEqual(responseKey, 'anon-test-marker', `public config key is safe in ${nodeEnv}`);
  assert(!String(responseKey).includes('service-role-test-marker'), `service key never appears in ${nodeEnv} config`);
}

const seeder = path.join(root, 'scripts/seed_demo.js');
for (const args of [[], ['--force'], ['--clean', '--force']]) {
  const result = spawnSync(process.execPath, [seeder, ...args], {
    encoding: 'utf8',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  assert.notStrictEqual(result.status, 0, `seeder rejects production ${args.join(' ')}`);
  assert.match(result.stderr + result.stdout, /Refusing to seed or clean demo data in PRODUCTION/);
}
const noEnv = spawnSync(process.execPath, [seeder, '--force'], {
  encoding: 'utf8',
  cwd: os.tmpdir(),
  env: Object.fromEntries(Object.entries(process.env).filter(([key]) => !['NODE_ENV', 'SUPABASE_URL', 'SUPABASE_KEY', 'SUPABASE_SERVICE_ROLE_KEY'].includes(key)))
});
assert.notStrictEqual(noEnv.status, 0, 'seeder default environment refuses execution');
assert.match(noEnv.stderr + noEnv.stdout, /PRODUCTION/);

const rls = fs.readFileSync(path.join(root, 'migrations/008_least_privilege_writes.sql'), 'utf8');
for (const table of ['users', 'items', 'bookings', 'transactions', 'purchase_orders', 'audit_logs', 'system']) {
  assert(rls.includes(`public.${table}`), `least-privilege migration covers ${table}`);
}
assert.match(rls, /REVOKE INSERT, UPDATE, DELETE[\s\S]*FROM anon, authenticated, PUBLIC/);
assert.match(rls, /CREATE POLICY "users_service_all" ON public.users FOR ALL TO service_role/);
console.log('Critical security guard regression checks passed.');
