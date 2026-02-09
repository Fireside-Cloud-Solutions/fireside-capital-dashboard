#!/usr/bin/env node
/**
 * Generate comprehensive utility classes for Fireside Capital
 * Run: node scripts/generate-utilities.js
 * Output: assets/css/utilities-generated.css
 */

const fs = require('fs');
const path = require('path');

// Spacing scale (from design-tokens.css)
const spacingScale = {
  0: '0',
  px: '1px',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
};

const directions = {
  t: 'top',
  r: 'right',
  b: 'bottom',
  l: 'left',
  x: ['left', 'right'],
  y: ['top', 'bottom'],
};

let css = `/* =================================================================
   AUTO-GENERATED UTILITY CLASSES
   Generated: ${new Date().toISOString()}
   DO NOT EDIT MANUALLY — Run: node scripts/generate-utilities.js
   ================================================================= */\n\n`;

// Generate margin utilities
css += `/* === MARGIN UTILITIES === */\n`;
Object.entries(spacingScale).forEach(([key, value]) => {
  css += `.m-${key} { margin: ${value} !important; }\n`;
  
  Object.entries(directions).forEach(([dirKey, dirValue]) => {
    if (Array.isArray(dirValue)) {
      dirValue.forEach(side => {
        css += `.m${dirKey}-${key} { margin-${side}: ${value} !important; }\n`;
      });
    } else {
      css += `.m${dirKey}-${key} { margin-${dirValue}: ${value} !important; }\n`;
    }
  });
});

css += `\n/* === PADDING UTILITIES === */\n`;
Object.entries(spacingScale).forEach(([key, value]) => {
  css += `.p-${key} { padding: ${value} !important; }\n`;
  
  Object.entries(directions).forEach(([dirKey, dirValue]) => {
    if (Array.isArray(dirValue)) {
      dirValue.forEach(side => {
        css += `.p${dirKey}-${key} { padding-${side}: ${value} !important; }\n`;
      });
    } else {
      css += `.p${dirKey}-${key} { padding-${dirValue}: ${value} !important; }\n`;
    }
  });
});

css += `\n/* === GAP UTILITIES === */\n`;
Object.entries(spacingScale).forEach(([key, value]) => {
  css += `.gap-${key} { gap: ${value} !important; }\n`;
});

css += `\n/* === FLEXBOX UTILITIES === */\n`;
css += `.d-flex { display: flex !important; }\n`;
css += `.d-inline-flex { display: inline-flex !important; }\n`;
css += `.flex-row { flex-direction: row !important; }\n`;
css += `.flex-column { flex-direction: column !important; }\n`;
css += `.align-items-start { align-items: flex-start !important; }\n`;
css += `.align-items-center { align-items: center !important; }\n`;
css += `.align-items-end { align-items: flex-end !important; }\n`;
css += `.justify-content-start { justify-content: flex-start !important; }\n`;
css += `.justify-content-center { justify-content: center !important; }\n`;
css += `.justify-content-end { justify-content: flex-end !important; }\n`;
css += `.justify-content-between { justify-content: space-between !important; }\n`;
css += `.flex-wrap { flex-wrap: wrap !important; }\n`;
css += `.flex-nowrap { flex-wrap: nowrap !important; }\n`;

css += `\n/* === TEXT UTILITIES === */\n`;
css += `.text-left { text-align: left !important; }\n`;
css += `.text-center { text-align: center !important; }\n`;
css += `.text-right { text-align: right !important; }\n`;
css += `.fw-regular { font-weight: var(--weight-regular) !important; }\n`;
css += `.fw-medium { font-weight: var(--weight-medium) !important; }\n`;
css += `.fw-semibold { font-weight: var(--weight-semibold) !important; }\n`;
css += `.fw-bold { font-weight: var(--weight-bold) !important; }\n`;

// Write to file
const outputPath = path.join(__dirname, '../app/assets/css/utilities-generated.css');
fs.writeFileSync(outputPath, css, 'utf8');
console.log(`✅ Generated utilities: ${outputPath}`);
console.log(`📊 File size: ${(css.length / 1024).toFixed(2)} KB`);
