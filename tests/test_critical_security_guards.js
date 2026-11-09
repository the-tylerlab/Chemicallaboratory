/** Regression checks for critical production security guards. */
const assert = require('assert');
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { Readable } = require('stream');

async function probeHttpConfig(nodeEnv) {
  process.env.NODE_ENV = nodeEnv;
  process.env.SUPABASE_URL = '';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test-marker';
  process.env.SUPABASE_ANON_KEY = 'anon-test-marker';
  process.env.SUPABASE_KEY = '';
  process.env.VAPID_PUBLIC_KEY = 'test-public-vapid-key';
  process.env.VAPID_PRIVATE_KEY = 'test-private-vapid-key';
  process.env.JWT_SECRET = 'local-regression-test-secret';

  const app = require('../server');
  await new Promise((resolve, reject) => {
    const req = Readable.from([]);
    req.method = 'GET';
    req.url = '/api/config';
    req.headers = { 'accept-encoding': 'identity' };
    req.socket = { remoteAddress: '127.0.0.1' };
    req.accepts = () => false;
    const headers = {};
    let status = 200;
    let responseBody = '';
    const res = {
      statusCode: 200,
      setHeader(name, value) { headers[name.toLowerCase()] = value; },
      getHeader(name) { return headers[name.toLowerCase()]; },
      removeHeader(name) { delete headers[name.toLowerCase()]; },
      writeHead(code, values) { status = code; this.statusCode = code; Object.assign(headers, values || {}); },
      status(code) { status = code; this.statusCode = code; return this; },
      write(chunk) { responseBody += chunk; return true; },
      end(chunk) {
        if (chunk) responseBody += chunk;
        try {
          const body = JSON.parse(responseBody);
          assert.strictEqual(this.statusCode || status, 200, `GET /api/config responds in ${nodeEnv}`);
          assert.strictEqual(body.supabaseKey, 'anon-test-marker', `HTTP config contains only public key in ${nodeEnv}`);
          assert(!responseBody.includes('service-role-test-marker'), `HTTP config excludes service key in ${nodeEnv}`);
          assert.strictEqual(body.nodeEnv, nodeEnv, `HTTP config reports ${nodeEnv}`);
          resolve();
        } catch (error) { reject(error); }
      }
    };
    app.handle(req, res);
  });
}

if (process.argv[2] === '--http-config-probe') {
  probeHttpConfig(process.argv[3]).then(() => process.exit(0)).catch(error => {
    console.error(error.message);
    process.exit(1);
  });
} else {
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

for (const nodeEnv of ['development', 'test', 'production']) {
  const probe = spawnSync(process.execPath, [__filename, '--http-config-probe', nodeEnv], {
    encoding: 'utf8',
    env: process.env
  });
  assert.strictEqual(probe.status, 0, `HTTP /api/config is safe in ${nodeEnv}: ${probe.stderr || probe.stdout}`);
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
for (const table of ['users', 'items', 'bookings', 'transactions', 'purchase_orders', 'audit_logs', 'system', 'schema_migrations', 'stock_movements', 'stock_adjustments', 'equipment_maintenance_logs', 'equipment_repairs']) {
  assert(rls.includes(`public.${table}`), `least-privilege migration covers ${table}`);
}
assert.match(rls, /REVOKE INSERT, UPDATE, DELETE[\s\S]*FROM anon, authenticated, PUBLIC/);
for (const policy of ['items_service_all', 'users_service_all', 'bookings_service_all', 'transactions_service_all', 'purchase_orders_service_all', 'audit_logs_service_all', 'system_service_all', 'schema_migrations_service_all', 'stock_movements_service_all', 'stock_adjustments_service_all', 'equipment_maintenance_service_all', 'equipment_repairs_service_all']) {
  assert(rls.includes(`CREATE POLICY \"${policy}\"`), `write policy ${policy} is service-role-only`);
}
assert.match(rls, /CREATE POLICY "users_service_all" ON public.users FOR ALL TO service_role/);
console.log('Critical security guard regression checks passed.');
}
