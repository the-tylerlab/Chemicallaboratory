const path = require('path');
const fs = require('fs');
const esbuild = require('esbuild');

const root = path.resolve(__dirname, '..');

esbuild.build({
  absWorkingDir: root,
  entryPoints: ['src/components/ui/rolling-counter-entry.tsx'],
  outfile: 'public/assets/js/rolling-counter.js',
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
  if (!jsBundle) throw new Error('Expected the RollingCounter JavaScript bundle.');
  fs.mkdirSync(path.join(root, 'public/assets/js'), { recursive: true });
  fs.mkdirSync(path.join(root, 'public/assets/css'), { recursive: true });
  fs.writeFileSync(path.join(root, 'public/assets/js/rolling-counter.js'), jsBundle.contents);
  fs.copyFileSync(
    path.join(root, 'src/components/ui/rolling-counter.css'),
    path.join(root, 'public/assets/css/rolling-counter.css'),
  );
  console.log('[build_rolling_counter] Built RollingCounter component.');
}).catch(error => {
  console.error(error);
  process.exit(1);
});
