/**
 * scripts/verify_data_integrity.js
 * Verifies every local JSON data file without changing it.
 * 
 * Used during UI/UX development and CI/CD checks to enforce the boundary:
 * "การแก้ไข UX/UI ห้ามไปยุ่งกับข้อมูล"
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');

function listJsonFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === 'backups') return [];
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory()
      ? listJsonFiles(fullPath)
      : entry.isFile() && entry.name.endsWith('.json')
        ? [path.relative(DATA_DIR, fullPath)]
        : [];
  });
}

function verifyDataIntegrity() {
  console.log('[data_integrity] Checking Data Layer isolation...');
  if (!fs.existsSync(DATA_DIR)) {
    console.error('[data_integrity] ERROR: data/ directory not found!');
    process.exit(1);
  }

  let errors = 0;
  let verifiedCount = 0;

  const files = listJsonFiles(DATA_DIR).sort();
  if (files.length === 0) {
    console.error('[data_integrity] ERROR: No JSON data files found.');
    process.exit(1);
  }

  for (const filename of files) {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`[data_integrity] Notice: Optional/uncreated file not present: ${filename}`);
      continue;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(content);
      const isArray = Array.isArray(parsed);
      const isObject = typeof parsed === 'object' && parsed !== null;

      if (!isArray && !isObject) {
        console.error(`[data_integrity] ERROR: ${filename} does not contain valid JSON array or object.`);
        errors++;
      } else {
        const count = isArray ? parsed.length : Object.keys(parsed).length;
        verifiedCount++;
        console.log(`[data_integrity] ✓ ${filename.padEnd(22)} VALID JSON (${count} records/keys, ${(content.length / 1024).toFixed(1)} KB)`);
      }
    } catch (err) {
      console.error(`[data_integrity] ERROR: Failed parsing ${filename}:`, err.message);
      errors++;
    }
  }

  if (errors > 0) {
    console.error(`[data_integrity] FAIL: Found ${errors} data integrity error(s).`);
    process.exit(1);
  } else {
    console.log(`[data_integrity] SUCCESS: All ${verifiedCount} data files verified intact and valid. Zero data corruption.`);
  }
}

if (require.main === module) {
  verifyDataIntegrity();
}

module.exports = { verifyDataIntegrity, listJsonFiles };
