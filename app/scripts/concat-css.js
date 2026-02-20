// scripts/concat-css.js
// Concatenates CSS files in correct cascade order

const fs = require('fs');
const path = require('path');

const CSS_ORDER = [
  'design-tokens.css',     // Layer 1: Variables/tokens (must be first)
  'critical.css',          // Layer 2: Critical path
  'main.css',              // Layer 3: Base styles
  'components.css',        // Layer 4: Components
  'responsive.css',        // Layer 5: Responsive overrides
  'utilities.css',         // Layer 6: Utilities (must be last)
  'accessibility.css',     // Layer 7: Accessibility (high specificity OK)
  'onboarding.css',        // Layer 8: Feature-specific
  'logged-out-cta.css',    // Layer 9: Auth UI
];

const SRC = path.join(__dirname, '..', 'assets', 'css');
const DIST = path.join(__dirname, '..', 'dist', 'assets', 'css');

if (!fs.existsSync(DIST)) fs.mkdirSync(DIST, { recursive: true });

const combined = CSS_ORDER.map(file => {
  const filepath = path.join(SRC, file);
  if (!fs.existsSync(filepath)) {
    console.warn(`⚠ Missing: ${file}`);
    return '';
  }
  let content = fs.readFileSync(filepath, 'utf8');
  // Remove @import statements since we're concatenating everything
  content = content.replace(/@import\s+url\([^)]+\);?\s*/g, '');
  content = content.replace(/@import\s+["'][^"']+["'];?\s*/g, '');
  return `/* === ${file} === */\n${content}\n`;
}).join('\n');

const outPath = path.join(DIST, 'bundle.css');
fs.writeFileSync(outPath, combined);
console.log(`✓ CSS concatenated: ${Math.round(combined.length/1024)}KB → ${outPath}`);
