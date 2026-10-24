/**
 * scripts/build_pages.js
 * Assembles modular HTML pages from `src/pages/*.html` into `public/index.html`.
 * 
 * Usage:
 *   node scripts/build_pages.js          # Single build
 *   node scripts/build_pages.js --watch  # Watch mode
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SOURCE_DIR = path.join(ROOT_DIR, 'src');
const TEMPLATE_PATH = path.join(SOURCE_DIR, 'index.template.html');
const OUTPUT_PATH = path.join(ROOT_DIR, 'public', 'index.html');
const PAGES_DIR = path.join(SOURCE_DIR, 'pages');
const COMPONENTS_DIR = path.join(SOURCE_DIR, 'components');

function buildPages(verbose = true) {
  const startTime = Date.now();
  if (!fs.existsSync(TEMPLATE_PATH)) {
    throw new Error(`Template not found at: ${TEMPLATE_PATH}`);
  }

  let template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

  // Replace <!-- @include pages/xxx.html --> with contents of the referenced file
  const includeRegex = /<!--\s*@include\s+['"]?([^'"]+?)['"]?\s*-->/g;
  
  let compiled = template;
  let matchCount = 0;
  let iteration = 0;
  const maxIterations = 5;

  while (iteration < maxIterations) {
    let replacedInPass = 0;
    compiled = compiled.replace(includeRegex, (match, relPath) => {
      const fullIncludePath = path.resolve(SOURCE_DIR, relPath.trim());
      if (!fs.existsSync(fullIncludePath)) {
        console.warn(`[build_pages] Warning: include file not found: ${fullIncludePath}`);
        return match;
      }
      matchCount++;
      replacedInPass++;
      return fs.readFileSync(fullIncludePath, 'utf8');
    });
    if (replacedInPass === 0) break;
    iteration++;
  }

  fs.writeFileSync(OUTPUT_PATH, compiled, 'utf8');
  const duration = Date.now() - startTime;
  if (verbose) {
    console.log(`[build_pages] Successfully compiled ${matchCount} partials into index.html in ${duration}ms`);
  }
  return { matchCount, duration };
}

// Watch mode support
function watchPages() {
  buildPages(true);
  console.log('[build_pages] Watching src/pages/, src/components/, and src/index.template.html for changes...');

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

  for (const [directory, prefix] of [[PAGES_DIR, 'pages'], [COMPONENTS_DIR, 'components']]) {
    if (fs.existsSync(directory)) {
      fs.watch(directory, { recursive: true }, (_eventType, filename) => {
        if (filename && filename.endsWith('.html')) {
          triggerRebuild(`src/${prefix}/${filename}`);
        }
      });
    }
  }

  if (fs.existsSync(TEMPLATE_PATH)) {
    fs.watch(TEMPLATE_PATH, () => {
      triggerRebuild('src/index.template.html');
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
