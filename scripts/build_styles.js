/**
 * scripts/build_styles.js
 * Manages modular CSS stylesheets for SciPortal Chemical Laboratory.
 * 
 * Features:
 * - Maintains modular CSS files in `public/assets/css/`
 * - Generates the `public/assets/css/style.css` entry point
 * - Provides `--bundle` option to concatenate modules into a unified production stylesheet
 * 
 * Usage:
 *   node scripts/build_styles.js            # Updates style.css with clean @import statements
 *   node scripts/build_styles.js --bundle   # Bundles public/assets/css/*.css into style.css for production
 *   node scripts/build_styles.js --extract  # (One-time) Extracts modules from original style.css
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const STYLES_DIR = path.join(ROOT_DIR, 'public', 'assets', 'css');
const MAIN_STYLE_PATH = path.join(ROOT_DIR, 'public', 'assets', 'css', 'style.css');

// Ordered list of CSS modules for proper cascading inheritance
const CSS_MODULES = [
  // 1. Foundations & Tokens
  'public/assets/css/fonts.css',
  'public/assets/css/variables.css',
  'public/assets/css/base.css',
  'public/assets/css/layout.css',

  // 2. Reusable UI Components
  'public/assets/css/components/buttons.css',
  'public/assets/css/components/forms.css',
  'public/assets/css/components/tables.css',
  'public/assets/css/components/cards.css',
  'public/assets/css/components/modals.css',
  'public/assets/css/components/help-safety-redesign.css',
  'public/assets/css/components/toast.css',
  'public/assets/css/components/chatbot.css',

  // 3. Page-Specific Styles
  'public/assets/css/pages/dashboard.css',
  'public/assets/css/pages/inventory.css',
  'public/assets/css/pages/lab-booking.css',
  'public/assets/css/pages/cabinet-layout.css',
  'public/assets/css/pages/borrow-return.css',
  'public/assets/css/pages/purchase-orders.css',
  'public/assets/css/pages/notifications.css',
  'public/assets/css/pages/admin.css',
  'public/assets/css/pages/admin-redesign.css',

  // 4. Responsive & Media Styles
  'public/assets/css/responsive.css',
  'public/assets/css/responsive-workspace.css',
  'public/assets/css/print.css'
];

/**
 * Generates modular @import statements for style.css
 */
function generateImportStyle() {
  const missingModules = CSS_MODULES.filter((file) => !fs.existsSync(path.join(ROOT_DIR, file)));
  if (missingModules.length) {
    throw new Error(`CSS modules missing: ${missingModules.join(', ')}`);
  }
  const header = `/* ==========================================================================
   SCIPORTAL CHEMICAL LABORATORY - MASTER STYLESHEET
   Modularized Architecture for Safe & Clean UI/UX Development
   
   To edit styles safely without risking data integrity:
   - Tokens & Colors:      styles/variables.css
   - Layout & Navigation:  styles/layout.css
   - UI Components:        styles/components/*.css
   - Page Views:           styles/pages/*.css
   - Mobile & Responsive:  styles/responsive.css
   ========================================================================== */

`;

  const imports = CSS_MODULES.map(file => `@import url("./${file.replace(/^public\/assets\/css\//, '')}");`).join('\n') + '\n';
  fs.writeFileSync(MAIN_STYLE_PATH, header + imports, 'utf8');
  console.log('[build_styles] Successfully generated modular style.css with @import declarations.');
}

/**
 * Bundles all modular CSS files into a single unified stylesheet
 */
function bundleStyles() {
  const missingModules = CSS_MODULES.filter((file) => !fs.existsSync(path.join(ROOT_DIR, file)));
  if (missingModules.length) {
    throw new Error(`CSS modules missing: ${missingModules.join(', ')}`);
  }
  let bundled = `/* ==========================================================================
   SCIPORTAL CHEMICAL LABORATORY - PRODUCTION BUNDLED STYLESHEET
   Generated automatically by scripts/build_styles.js --bundle
   ========================================================================== */\n\n`;

  let totalBytes = 0;
  for (const relPath of CSS_MODULES) {
    const fullPath = path.join(ROOT_DIR, relPath);
    if (!fs.existsSync(fullPath)) {
      console.warn(`[build_styles] Warning: File not found: ${fullPath}`);
      continue;
    }
    const content = fs.readFileSync(fullPath, 'utf8');
    totalBytes += content.length;
    bundled += `\n/* --- MODULE: ${relPath} --- */\n` + content + '\n';
  }

  fs.writeFileSync(MAIN_STYLE_PATH, bundled, 'utf8');
  console.log(`[build_styles] Successfully bundled ${CSS_MODULES.length} modules (${(totalBytes / 1024).toFixed(1)} KB) into style.css`);
}

/**
 * One-time extractor: Slices original monolithic style.css into modular files
 */
function extractFromOriginal() {
  const originalBackupPath = path.join(ROOT_DIR, 'public', 'assets', 'css', 'style.css.bak');
  let sourcePath = MAIN_STYLE_PATH;
  if (fs.existsSync(originalBackupPath)) {
    sourcePath = originalBackupPath;
  } else {
    fs.copyFileSync(MAIN_STYLE_PATH, originalBackupPath);
  }

  const lines = fs.readFileSync(sourcePath, 'utf8').split('\n');

  const fileMappings = {
    'public/assets/css/fonts.css': [
      { start: 1, end: 306, desc: 'Self-hosted IBM Plex Sans Thai Fonts' }
    ],
    'public/assets/css/variables.css': [
      { start: 307, end: 432, desc: 'Design System Tokens & CSS Variables' }
    ],
    'public/assets/css/base.css': [
      { start: 433, end: 648, desc: 'Base Styles, Resets & Standard Typography' }
    ],
    'public/assets/css/layout.css': [
      { start: 649, end: 2870, desc: 'Application Layout, Fluid Sidebar & Navigation' },
      { start: 7018, end: 7066, desc: 'Side Drawer Navigation' },
      { start: 13514, end: 13842, desc: 'App Skeleton Loader' }
    ],
    'public/assets/css/components/buttons.css': [
      { start: 24770, end: 24879, desc: 'Hold-to-Confirm & Interactive Buttons' }
    ],
    'public/assets/css/components/forms.css': [
      { start: 4894, end: 5487, desc: 'Form Controls, Inputs & Validation' },
      { start: 6812, end: 7017, desc: 'Searchable Select Controls' }
    ],
    'public/assets/css/components/tables.css': [
      { start: 5488, end: 6124, desc: 'Data Tables, Pagination & Filters' }
    ],
    'public/assets/css/components/cards.css': [
      { start: 4747, end: 4893, desc: 'Card Components & Empty States' }
    ],
    'public/assets/css/components/modals.css': [
      { start: 2871, end: 4349, desc: 'Modals: QR Asset, Booking Passport, Help Safety' },
      { start: 7067, end: 7502, desc: 'Modals: CSV Import & Overlays' },
      { start: 21885, end: 23254, desc: 'Modals: Minimalist Login & User Import' },
      { start: 24880, end: lines.length, desc: 'Modals: Admin User Management' }
    ],
    'public/assets/css/components/toast.css': [
      { start: 14483, end: 14556, desc: 'Toast Notifications & Status Alerts' }
    ],
    'public/assets/css/components/chatbot.css': [
      { start: 8973, end: 9936, desc: 'Lab AI Chatbot Assistant Widget' }
    ],
    'public/assets/css/pages/dashboard.css': [
      { start: 4350, end: 4746, desc: 'Dashboard Panels & Stat Cards' },
      { start: 16290, end: 17006, desc: 'Public Dashboard & Announcement Ticker' },
      { start: 17007, end: 19317, desc: 'Lab Usage Calendar & Timeline' }
    ],
    'public/assets/css/pages/inventory.css': [
      { start: 21332, end: 21884, desc: 'Inventory Category Pills & Item Lists' }
    ],
    'public/assets/css/pages/lab-booking.css': [
      { start: 8600, end: 8747, desc: 'Laboratory Booking Styles' },
      { start: 11951, end: 12442, desc: 'Booking Calendar Overrides' },
      { start: 13843, end: 14482, desc: 'Booking Stats Cards' }
    ],
    'public/assets/css/pages/cabinet-layout.css': [
      { start: 11273, end: 11442, desc: 'Lab Diagram Planner' },
      { start: 14557, end: 16289, desc: 'SHECU Cabinet Map & Storage Cards' }
    ],
    'public/assets/css/pages/borrow-return.css': [
      { start: 7503, end: 7657, desc: 'Borrow & Return Workflow' }
    ],
    'public/assets/css/pages/purchase-orders.css': [
      { start: 9937, end: 11272, desc: 'Purchase Orders & Budget Management' },
      { start: 12443, end: 13513, desc: 'Smart Stock & Auto-PO System' }
    ],
    'public/assets/css/pages/notifications.css': [
      { start: 6125, end: 6811, desc: 'Alerts & Notifications Center' }
    ],
    'public/assets/css/pages/admin.css': [
      { start: 19318, end: 21331, desc: 'Admin Panel, Command Deck & Modern Tabs' },
      { start: 23490, end: 24769, desc: 'Admin Lab Rooms & Metro Signboard Modals' }
    ],
    'public/assets/css/responsive.css': [
      { start: 7658, end: 8599, desc: 'Responsive Design Media Queries' },
      { start: 8748, end: 8772, desc: 'iOS & Mobile Input Fixes' },
      { start: 23255, end: 23489, desc: 'Device-Specific Adaptive Breakpoints' }
    ],
    'public/assets/css/print.css': [
      { start: 8773, end: 8972, desc: 'Print Media & Thermal Barcode Labels' },
      { start: 11443, end: 11950, desc: 'Receipt Printer Animation & Format' }
    ]
  };

  // Ensure directories exist
  fs.mkdirSync(path.join(STYLES_DIR, 'components'), { recursive: true });
  fs.mkdirSync(path.join(STYLES_DIR, 'pages'), { recursive: true });

  for (const [relFile, ranges] of Object.entries(fileMappings)) {
    const fullTarget = path.join(ROOT_DIR, relFile);
    let chunks = [];
    ranges.forEach(r => {
      chunks.push(lines.slice(r.start - 1, r.end).join('\n'));
    });
    fs.writeFileSync(fullTarget, chunks.join('\n\n'), 'utf8');
    console.log(`[build_styles] Wrote ${relFile} (${ranges.reduce((acc, r) => acc + (r.end - r.start + 1), 0)} lines)`);
  }

  generateImportStyle();
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes('--extract')) {
    extractFromOriginal();
  } else if (args.includes('--bundle')) {
    bundleStyles();
  } else {
    generateImportStyle();
  }
}

module.exports = {
  CSS_MODULES,
  generateImportStyle,
  bundleStyles,
  extractFromOriginal
};
