/** Create a timestamped snapshot of local JSON data without modifying the source files. */
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const TARGET_DIR = path.join(BACKUP_DIR, timestamp);

function copyJsonFiles(source, destination) {
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (entry.name === 'backups') continue;
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(to, { recursive: true });
      copyJsonFiles(from, to);
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      JSON.parse(fs.readFileSync(from, 'utf8'));
      fs.copyFileSync(from, to, fs.constants.COPYFILE_EXCL);
    }
  }
}

if (!fs.existsSync(DATA_DIR)) throw new Error(`Data directory not found: ${DATA_DIR}`);
fs.mkdirSync(TARGET_DIR, { recursive: true });
try {
  copyJsonFiles(DATA_DIR, TARGET_DIR);
  console.log(`[data_backup] Snapshot created: ${path.relative(ROOT_DIR, TARGET_DIR)}`);
} catch (error) {
  fs.rmSync(TARGET_DIR, { recursive: true, force: true });
  throw error;
}
