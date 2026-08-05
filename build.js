// Precompiles the JSX sources to plain JS so the browser doesn't have to load
// Babel (3.1 MB) and compile on every page load.
//
//   npm install --no-save @babel/core @babel/preset-react
//   node build.js
//
// Edit the .jsx files; the .js files next to them are generated and checked in
// so the site stays a plain static deploy with no build step in CI.

const babel = require('@babel/core');
const fs = require('fs');

const SOURCES = ['app.jsx', 'tweaks-panel.jsx'];

for (const src of SOURCES) {
  const out = src.replace(/\.jsx$/, '.js');
  const { code } = babel.transformFileSync(src, {
    presets: [[require.resolve('@babel/preset-react'), { runtime: 'classic' }]],
    compact: false,
    comments: true,
    babelrc: false,
    configFile: false,
  });
  fs.writeFileSync(out, code + '\n');
  console.log(`${src} -> ${out} (${code.length} bytes)`);
}
