// scripts/minify-js.js
// Minifies all JS files to dist/ with console.log stripped

const { minify } = require('terser');
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'assets', 'js');
const DIST = path.join(__dirname, '..', 'dist', 'assets', 'js');

const TERSER_OPTIONS = {
  compress: {
    drop_console: true,      // ← Eliminates all console.log calls
    drop_debugger: true,
    pure_funcs: ['console.log', 'console.warn', 'console.info'],
    passes: 2,               // Two compression passes for smaller output
  },
  mangle: true,              // Rename local variables (app.js: 26KB → ~14KB)
  format: {
    comments: false,         // Strip all comments
  },
};

async function minifyAll() {
  if (!fs.existsSync(DIST)) fs.mkdirSync(DIST, { recursive: true });
  
  const files = fs.readdirSync(SRC).filter(f => f.endsWith('.js'));
  let totalBefore = 0, totalAfter = 0;

  for (const file of files) {
    const src = path.join(SRC, file);
    const dest = path.join(DIST, file);
    const code = fs.readFileSync(src, 'utf8');
    totalBefore += code.length;
    
    try {
      const result = await minify(code, TERSER_OPTIONS);
      fs.writeFileSync(dest, result.code);
      totalAfter += result.code.length;
      const pct = Math.round((1 - result.code.length / code.length) * 100);
      console.log(`✓ ${file}: ${Math.round(code.length/1024)}KB → ${Math.round(result.code.length/1024)}KB (-${pct}%)`);
    } catch (err) {
      console.error(`✗ ${file}: ${err.message}`);
      // Copy unminified as fallback
      fs.copyFileSync(src, dest);
    }
  }
  
  const totalPct = Math.round((1 - totalAfter / totalBefore) * 100);
  console.log(`\nTotal: ${Math.round(totalBefore/1024)}KB → ${Math.round(totalAfter/1024)}KB (-${totalPct}%)`);
}

minifyAll().catch(console.error);
