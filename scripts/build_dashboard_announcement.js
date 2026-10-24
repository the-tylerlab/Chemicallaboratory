const path = require('path');
const fs = require('fs');
const esbuild = require('esbuild');

const root = path.resolve(__dirname, '..');

esbuild.build({
  absWorkingDir: root,
  entryPoints: ['src/components/ui/dashboard-announcement.tsx'],
  outdir: 'public/assets',
  entryNames: 'js/dashboard-announcement',
  bundle: true,
  minify: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2020'],
  jsx: 'automatic',
  write: false,
  logLevel: 'info',
}).then(({ outputFiles }) => {
  const jsBundle = outputFiles.find(file => file.path.endsWith('.js'));
  const cssBundle = outputFiles.find(file => file.path.endsWith('.css'));
  if (!jsBundle || !cssBundle) throw new Error('Expected React JavaScript and CSS bundles.');

  const jsPath = path.join(root, 'public/assets/js/dashboard-announcement.js');
  const cssPath = path.join(root, 'public/assets/css/dashboard-announcement.css');
  fs.mkdirSync(path.dirname(jsPath), { recursive: true });
  fs.mkdirSync(path.dirname(cssPath), { recursive: true });
  fs.writeFileSync(jsPath, jsBundle.contents);
  fs.writeFileSync(cssPath, cssBundle.contents);
  console.log('[build_dashboard_announcement] Built Astryx announcement island.');
}).catch(error => {
  console.error(error);
  process.exit(1);
});
