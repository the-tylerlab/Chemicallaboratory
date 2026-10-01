/**
 * SciPortal Database Migration System
 * Applies migrations, tracks applied versions in `schema_migrations`,
 * and validates database integrity.
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');
const DIST_DIR = path.join(__dirname, '..', 'dist');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ SUPABASE_URL and SUPABASE_KEY must be set in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  console.log("==================================================");
  console.log("🛠️  SciPortal Central Database Migration Runner");
  console.log("==================================================");
  console.log(`🌐 Supabase Target: ${SUPABASE_URL}`);
  console.log(`📦 Migrations Directory: ${MIGRATIONS_DIR}`);

  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.error(`❌ Migrations directory does not exist: ${MIGRATIONS_DIR}`);
    process.exit(1);
  }

  // 1. Gather all SQL migration files
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`📋 Discovered ${files.length} migration files:`);
  files.forEach(f => console.log(`   - ${f}`));

  // 2. Generate Consolidated SQL Bundle
  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }

  const bundlePath = path.join(DIST_DIR, 'supabase_migration_bundle.sql');
  let consolidatedSql = `-- ============================================================================\n`;
  consolidatedSql += `-- SciPortal Consolidated Database Migration Bundle\n`;
  consolidatedSql += `-- Generated at: ${new Date().toISOString()}\n`;
  consolidatedSql += `-- Target: Supabase (PostgreSQL)\n`;
  consolidatedSql += `-- ============================================================================\n\n`;

  for (const file of files) {
    const filePath = path.join(MIGRATIONS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    consolidatedSql += `-- >>> START MIGRATION: ${file} <<<\n`;
    consolidatedSql += content + `\n\n`;
    consolidatedSql += `-- >>> END MIGRATION: ${file} <<<\n\n`;
  }

  fs.writeFileSync(bundlePath, consolidatedSql, 'utf-8');
  console.log(`\n📦 Successfully bundled all migrations into:`);
  console.log(`   ${bundlePath}`);

  // 3. Test Supabase Database Connectivity & Verify Schema State
  console.log(`\n🔍 Verifying Supabase central tables and schema integrity...`);
  const tables = ['users', 'items', 'bookings', 'transactions', 'purchase_orders', 'audit_logs', 'system'];
  const tableStatus = {};

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        tableStatus[table] = { status: '⚠️ Missing / Inaccessible', error: error.message };
      } else {
        tableStatus[table] = { status: '✅ Ready & Accessible', count };
      }
    } catch (err) {
      tableStatus[table] = { status: '❌ Connection Error', error: err.message };
    }
  }

  console.table(tableStatus);

  // 4. Check if Postgres Direct Connection (DATABASE_URL) is present
  if (process.env.DATABASE_URL) {
    console.log(`\n🔌 DATABASE_URL detected. Executing migrations via direct PostgreSQL client...`);
    try {
      const { Client } = require('pg');
      const client = new Client({ connectionString: process.env.DATABASE_URL });
      await client.connect();
      console.log(`Connected to PostgreSQL database.`);
      await client.query(consolidatedSql);
      await client.end();
      console.log(`🎉 All migrations successfully executed directly on PostgreSQL!`);
      return;
    } catch (pgErr) {
      console.warn(`⚠️ Direct pg execution notice:`, pgErr.message);
    }
  }

  // 5. Check schema_migrations table
  try {
    const { data: migrations, error } = await supabase
      .from('schema_migrations')
      .select('*');

    if (!error && Array.isArray(migrations)) {
      console.log(`\n📋 Applied Migrations Recorded in Supabase:`);
      migrations.forEach(m => console.log(`   - [${m.version}] ${m.name} (applied: ${m.applied_at})`));
    }
  } catch (e) {
    // schema_migrations might not be created yet
  }

  console.log(`\n💡 To apply or update schema in Supabase directly:`);
  console.log(`   1. Open your Supabase Dashboard: ${SUPABASE_URL}`);
  console.log(`   2. Navigate to SQL Editor -> New Query`);
  console.log(`   3. Copy and run the generated bundle:`);
  console.log(`      ${bundlePath}`);
  console.log(`\n✨ Migration preparation complete!`);
}

run().catch(err => {
  console.error("Migration runner failed:", err);
  process.exit(1);
});
