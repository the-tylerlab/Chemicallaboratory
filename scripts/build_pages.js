/**
 * scripts/build_pages.js
 * Assembles modular HTML pages from `pages/*.html` into `index.html` using `index.template.html`.
 * 
 * Usage:
 *   node scripts/build_pages.js          # Single build
 *   node scripts/build_pages.js --watch  # Watch mode
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const TEMPLATE_PATH = path.join(ROOT_DIR, 'index.template.html');
const OUTPUT_PATH = path.join(ROOT_DIR, 'index.html');
const PAGES_DIR = path.join(ROOT_DIR, 'pages');

function buildPages(verbose = true) {
  const startTime = Date.now();
  if (!fs.existsSync(TEMPLATE_PATH)) {
    throw new Error(`Template not found at: ${TEMPLATE_PATH}`);
  }

  let template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

  // Replace <!-- @include pages/xxx.html --> with contents of the referenced file
  const includeRegex = /<!--\s*@include\s+['"]?([^'"]+?)['"]?\s*-->/g;
  
  let matchCount = 0;
  const compiled = template.replace(includeRegex, (match, relPath) => {
    const fullIncludePath = path.resolve(ROOT_DIR, relPath.trim());
    if (!fs.existsSync(fullIncludePath)) {
      console.warn(`[build_pages] Warning: include file not found: ${fullIncludePath}`);
      return match;
    }
    matchCount++;
    return fs.readFileSync(fullIncludePath, 'utf8');
  });

  fs.writeFileSync(OUTPUT_PATH, compiled, 'utf8');
  const duration = Date.now() - startTime;
  if (verbose) {
    console.log(`[build_pages] Successfully compiled ${matchCount} page partials into index.html in ${duration}ms`);
  }
  return { matchCount, duration };
}

// Watch mode support
function watchPages() {
  buildPages(true);
  console.log('[build_pages] Watching pages/ and index.template.html for changes...');

  let debounceTimer = null;
  const sourceSignatures = new Map();
  const getSourceSignature = (file) => {
    try {
      const stat = fs.statSync(path.resolve(ROOT_DIR, file));
      return `${stat.dev}:${stat.ino}:${stat.size}:${stat.mtimeMs}:${stat.ctimeMs}`;
    } catch {
      return null;
    }
  };

  const triggerRebuild = (file) => {
    const signature = getSourceSignature(file);
    if (!signature || sourceSignatures.get(file) === signature) return;
    sourceSignatures.set(file, signature);

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      console.log(`[build_pages] Change detected in ${file}, rebuilding index.html...`);
      try {
        buildPages(true);
      } catch (err) {
        console.error('[build_pages] Error during rebuild:', err);
      }
    }, 80);
  };

  if (fs.existsSync(PAGES_DIR)) {
    fs.watch(PAGES_DIR, { recursive: true }, (eventType, filename) => {
      if (filename && filename.endsWith('.html')) {
        triggerRebuild(`pages/${filename}`);
      }
    });
  }

  if (fs.existsSync(TEMPLATE_PATH)) {
    fs.watch(TEMPLATE_PATH, () => {
      triggerRebuild('index.template.html');
    });
  }
}

if (require.main === module) {
  const isWatch = process.argv.includes('--watch');
  if (isWatch) {
    watchPages();
  } else {
    buildPages(true);
  }
}

module.exports = { buildPages, watchPages };
