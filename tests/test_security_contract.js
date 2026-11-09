const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const migration = read('migrations/008_lock_down_public_data_access.sql');
const server = read('server.js');
const frontend = read('public/assets/js/main.js');
const workflow = read('.github/workflows/security.yml');

assert.match(migration, /REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM PUBLIC, anon, authenticated/i);
assert.match(migration, /GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role/i);
assert.match(migration, /CREATE POLICY backend_service_role_all[\s\S]*?TO service_role USING \(true\) WITH CHECK \(true\)/i);
assert.doesNotMatch(migration, /GRANT [^;]+ TO (?:PUBLIC|anon|authenticated)/i);
assert.doesNotMatch(migration, /CREATE POLICY[^;]*?TO (?:PUBLIC|anon|authenticated)/i);

const configHandler = server.slice(server.indexOf("app.get('/api/config'"), server.indexOf("});", server.indexOf("app.get('/api/config'")) + 3);
assert.ok(configHandler, 'API config handler exists');
assert.doesNotMatch(configHandler, /supabaseKey|SUPABASE_KEY|SUPABASE_SERVICE_ROLE_KEY/);
assert.match(frontend, /supabase = null;[\s\S]*?isSupabaseOnline = false;/);
assert.doesNotMatch(frontend, /sb_publishable_[A-Za-z0-9_-]+/);
assert.doesNotMatch(frontend, /AIza[0-9A-Za-z_-]{35}/);
assert.ok(!fs.existsSync(path.join(root, 'app.js')), 'Legacy monolithic app.js must not exist in repository root');
assert.ok(!fs.existsSync(path.join(root, 'public', 'app.js')), 'app.js must not exist in public directory');

assert.match(workflow, /actions\/checkout@[0-9a-f]{40}/g);
assert.match(workflow, /actions\/setup-node@[0-9a-f]{40}/g);
assert.match(workflow, /if: github\.event_name == 'push' && github\.ref == 'refs\/heads\/main'/);
assert.match(workflow, /persist-credentials: false/);
assert.match(workflow, /test:security-contract/);

console.log('Security contract checks passed (local static checks only; no database or network access).');
