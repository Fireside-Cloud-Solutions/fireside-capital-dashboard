# CSS Architecture Implementation Examples
**Companion to:** research-css-architecture-2026-02-13.md  
**Date:** February 13, 2026

---

## 1. PostCSS Build Pipeline Setup

### Install Dependencies

```bash
cd C:\Users\chuba\fireside-capital\app
npm init -y  # If no package.json exists
npm install --save-dev postcss postcss-cli cssnano autoprefixer @fullhuman/postcss-purgecss postcss-import
```

### Create `postcss.config.js`

```javascript
// app/postcss.config.js
module.exports = {
  plugins: [
    // Import partials
    require('postcss-import'),
    
    // Add vendor prefixes
    require('autoprefixer'),
    
    // Minify CSS
    require('cssnano')({
      preset: ['default', {
        discardComments: {
          removeAll: true,
        },
        normalizeWhitespace: true,
      }],
    }),
    
    // Remove unused CSS (production only)
    ...(process.env.NODE_ENV === 'production' ? [
      require('@fullhuman/postcss-purgecss')({
        content: [
          './**/*.html',
          './assets/js/**/*.js',
        ],
        // Safelist Bootstrap dynamic classes and data attributes
        safelist: {
          standard: [/^show$/, /^active$/, /^collapse/, /^fade/, /^modal-backdrop/],
          deep: [/^data-/, /^bs-/, /^dropdown/, /^nav-/],
          greedy: [/^btn-/, /^alert-/, /^badge-/],
        },
        // Don't remove these selectors
        blocklist: [],
      }),
    ] : []),
  ],
};
```

### Create Master CSS Entry Point

```css
/* app/assets/css/all.css */
/* Import order matches cascade priority */

/* 1. Design Tokens (Foundation) */
@import './design-tokens.css';

/* 2. Third-party (Bootstrap, etc.) */
/* Bootstrap is loaded separately via CDN - consider bundling later */

/* 3. Base & Layout */
@import './main.css';

/* 4. Components */
@import './components.css';
@import './financial-patterns.css';

/* 5. Utilities */
@import './utilities.css';
@import './responsive.css';

/* 6. Context-specific */
@import './onboarding.css';
@import './logged-out-cta.css';

/* 7. Overrides & Exceptions */
@import './accessibility.css';
```

### Update `package.json`

```json
{
  "name": "fireside-capital-dashboard",
  "version": "1.0.0",
  "scripts": {
    "css:dev": "postcss assets/css/all.css -o dist/css/main.css --watch --verbose",
    "css:build": "NODE_ENV=production postcss assets/css/all.css -o dist/css/main.min.css --verbose",
    "css:analyze": "postcss assets/css/all.css -o dist/css/main.min.css --verbose --map",
    "prebuild": "npm run css:build"
  },
  "browserslist": [
    "last 2 versions",
    "> 1%",
    "not dead"
  ],
  "devDependencies": {
    "@fullhuman/postcss-purgecss": "^6.0.0",
    "autoprefixer": "^10.4.19",
    "cssnano": "^7.0.0",
    "postcss": "^8.4.38",
    "postcss-cli": "^11.0.0",
    "postcss-import": "^16.1.0"
  }
}
```

### Update HTML to Use Built CSS

```html
<!-- dashboard.html - Before -->
<link rel="stylesheet" href="assets/css/design-tokens.css">
<link rel="stylesheet" href="assets/css/main.css">
<link rel="stylesheet" href="assets/css/components.css">
<!-- ... 6 more files -->

<!-- dashboard.html - After -->
<link rel="stylesheet" href="dist/css/main.min.css">
```

### Add to `.gitignore`

```
# Build output
dist/css/
node_modules/
package-lock.json
```

### Build Commands

```powershell
# Development (watch mode, no purging)
npm run css:dev

# Production build (minified + purged)
npm run css:build

# Analyze bundle size
npm run css:analyze
```

---

## 2. Critical CSS Extraction

### Install Critical

```bash
npm install --save-dev critical
```

### Create Extraction Script

```javascript
// scripts/extract-critical-css.js
const critical = require('critical');
const fs = require('fs');
const path = require('path');

const pages = [
  { src: 'dashboard.html', dest: 'dashboard.html' },
  { src: 'index.html', dest: 'index.html' },
  { src: 'budget.html', dest: 'budget.html' },
  { src: 'bills.html', dest: 'bills.html' },
];

async function extractCritical() {
  for (const page of pages) {
    console.log(`Extracting critical CSS for ${page.src}...`);
    
    try {
      await critical.generate({
        base: path.join(__dirname, '..'),
        src: page.src,
        target: {
          html: `dist/${page.dest}`,
          css: `dist/css/critical-${path.basename(page.dest, '.html')}.css`,
        },
        inline: true,
        width: 1440,
        height: 900,
        dimensions: [
          { width: 375, height: 667 },   // Mobile
          { width: 768, height: 1024 },  // Tablet
          { width: 1440, height: 900 },  // Desktop
        ],
        penthouse: {
          blockJSRequests: false,
        },
      });
      
      console.log(`✅ ${page.src} done`);
    } catch (err) {
      console.error(`❌ ${page.src} failed:`, err.message);
    }
  }
}

extractCritical();
```

### Add to `package.json`

```json
{
  "scripts": {
    "critical:extract": "node scripts/extract-critical-css.js",
    "build": "npm run css:build && npm run critical:extract"
  }
}
```

### Manual Critical CSS Template (if automated extraction fails)

```html
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard - Fireside Capital</title>
  
  <!-- CRITICAL CSS - Inline -->
  <style>
    /* Design Tokens - Core Only */
    :root {
      --color-primary: #f44e24;
      --color-secondary: #01a4ef;
      --color-bg-1: #0f0f0f;
      --color-bg-2: #1a1a1a;
      --color-text-primary: #f0f0f0;
      --font-heading: 'Source Serif 4', serif;
      --font-body: 'Inter', sans-serif;
      --space-md: 1rem;
      --radius-lg: 0.75rem;
    }
    
    /* Base Styles */
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--color-bg-1);
      color: var(--color-text-primary);
      font-family: var(--font-body);
      line-height: 1.6;
    }
    
    /* Layout - Above-the-fold */
    .sidebar {
      position: fixed;
      top: 0;
      left: 0;
      width: 260px;
      height: 100vh;
      background: var(--color-bg-2);
      border-right: 1px solid #2a2a2a;
    }
    
    .main-content {
      margin-left: 260px;
      padding: 2rem 3rem;
      min-height: 100vh;
    }
    
    /* Dashboard Cards - Hero Section */
    .dashboard-card {
      background: var(--color-bg-2);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      border: 1px solid #2a2a2a;
    }
    
    .dashboard-card h5 {
      font-size: 0.875rem;
      text-transform: uppercase;
      color: #b0b0b0;
      margin-bottom: 0.5rem;
    }
    
    .dashboard-card p {
      font-size: 1.75rem;
      font-weight: 700;
      font-family: var(--font-heading);
      margin: 0;
    }
    
    /* Mobile Sidebar */
    @media (max-width: 991px) {
      .sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s;
      }
      .main-content {
        margin-left: 0;
      }
    }
  </style>
  
  <!-- Load full CSS async (non-blocking) -->
  <link rel="preload" href="dist/css/main.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="dist/css/main.min.css"></noscript>
  
  <!-- Font preload -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  
  <!-- Bootstrap (consider bundling later) -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
</head>
<body>
  <!-- Page content -->
</body>
</html>
```

---

## 3. Font Loading Optimization

### Self-Host Fonts (Recommended)

#### Download Fonts

```bash
# Create fonts directory
mkdir -p app/assets/fonts

# Download from Google Fonts or use fontsource
npm install @fontsource/inter @fontsource/source-serif-4
```

#### Copy to Assets

```javascript
// scripts/copy-fonts.js
const fs = require('fs-extra');
const path = require('path');

const fonts = [
  {
    src: 'node_modules/@fontsource/inter/files',
    dest: 'assets/fonts/inter',
  },
  {
    src: 'node_modules/@fontsource/source-serif-4/files',
    dest: 'assets/fonts/source-serif-4',
  },
];

fonts.forEach(({ src, dest }) => {
  fs.copySync(src, dest);
  console.log(`✅ Copied ${src} → ${dest}`);
});
```

#### Update CSS

```css
/* app/assets/css/fonts.css */

/* Inter - Regular (400) */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('../fonts/inter/inter-latin-400-normal.woff2') format('woff2'),
       url('../fonts/inter/inter-latin-400-normal.woff') format('woff');
}

/* Inter - Medium (500) */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('../fonts/inter/inter-latin-500-normal.woff2') format('woff2');
}

/* Inter - Semibold (600) */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('../fonts/inter/inter-latin-600-normal.woff2') format('woff2');
}

/* Inter - Bold (700) */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('../fonts/inter/inter-latin-700-normal.woff2') format('woff2');
}

/* Source Serif 4 - Regular (400) */
@font-face {
  font-family: 'Source Serif 4';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('../fonts/source-serif-4/source-serif-4-latin-400-normal.woff2') format('woff2');
}

/* Source Serif 4 - Semibold (600) */
@font-face {
  font-family: 'Source Serif 4';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('../fonts/source-serif-4/source-serif-4-latin-600-normal.woff2') format('woff2');
}

/* Source Serif 4 - Bold (700) */
@font-face {
  font-family: 'Source Serif 4';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('../fonts/source-serif-4/source-serif-4-latin-700-normal.woff2') format('woff2');
}
```

#### Preload Critical Fonts

```html
<head>
  <!-- Preload only the fonts needed for above-the-fold content -->
  <link rel="preload" href="assets/fonts/inter/inter-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="assets/fonts/source-serif-4/source-serif-4-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin>
  
  <link rel="stylesheet" href="assets/css/fonts.css">
</head>
```

---

## 4. Token Consumption Audit Script

### Create Audit Script

```javascript
// scripts/audit-css-tokens.js
const fs = require('fs');
const path = require('path');

const cssDir = path.join(__dirname, '../assets/css');
const tokensFile = path.join(cssDir, 'design-tokens.css');

// Extract all custom properties from design-tokens.css
const tokensContent = fs.readFileSync(tokensFile, 'utf8');
const tokenPattern = /--([\w-]+):/g;
const tokens = new Set();
let match;

while ((match = tokenPattern.exec(tokensContent)) !== null) {
  tokens.add(match[1]);
}

console.log(`📦 Found ${tokens.size} design tokens\n`);

// Patterns to detect hardcoded values that could use tokens
const hardcodedPatterns = [
  { pattern: /:\s*#[0-9a-fA-F]{3,6}(?![^{]*var\(--)/g, type: 'color', token: 'color-*' },
  { pattern: /:\s*rgba?\([^)]+\)(?![^{]*var\(--)/g, type: 'color', token: 'color-*' },
  { pattern: /:\s*\d+px(?![^{]*var\(--)/g, type: 'spacing/size', token: 'space-* or radius-*' },
  { pattern: /font-family:\s*['"][^'"]+['"](?![^{]*var\(--)/g, type: 'font', token: 'font-*' },
];

// Scan all CSS files except design-tokens.css
const cssFiles = fs.readdirSync(cssDir)
  .filter(file => file.endsWith('.css') && file !== 'design-tokens.css')
  .map(file => path.join(cssDir, file));

let totalIssues = 0;

cssFiles.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  const issues = [];
  
  hardcodedPatterns.forEach(({ pattern, type, token }) => {
    const matches = content.match(pattern) || [];
    if (matches.length > 0) {
      issues.push({ type, token, count: matches.length, examples: matches.slice(0, 3) });
    }
  });
  
  if (issues.length > 0) {
    console.log(`\n📄 ${fileName}`);
    issues.forEach(({ type, token, count, examples }) => {
      console.log(`  ⚠️  ${count} hardcoded ${type} values (use ${token})`);
      examples.forEach(ex => console.log(`     ${ex}`));
      totalIssues += count;
    });
  }
});

console.log(`\n\n📊 Total issues found: ${totalIssues}`);
console.log(`💡 Recommendation: Replace hardcoded values with design tokens for consistency\n`);
```

### Run Audit

```bash
node scripts/audit-css-tokens.js
```

### Expected Output

```
📦 Found 147 design tokens

📄 main.css
  ⚠️  23 hardcoded spacing/size values (use space-* or radius-*)
     : 8px
     : 12px
     : 16px

📄 components.css
  ⚠️  8 hardcoded color values (use color-*)
     : #f0f0f0
     : rgba(244, 78, 36, 0.15)

📊 Total issues found: 31
💡 Recommendation: Replace hardcoded values with design tokens for consistency
```

---

## 5. Performance Measurement Script

### Create Before/After Comparison

```javascript
// scripts/measure-css-performance.js
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size;
}

function getGzipSize(filePath) {
  const content = fs.readFileSync(filePath);
  const gzipped = zlib.gzipSync(content);
  return gzipped.length;
}

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(2)} KB`;
}

// Before: Individual files
const cssDir = path.join(__dirname, '../assets/css');
const cssFiles = [
  'design-tokens.css',
  'main.css',
  'components.css',
  'financial-patterns.css',
  'utilities.css',
  'responsive.css',
  'accessibility.css',
  'onboarding.css',
  'logged-out-cta.css',
];

console.log('📊 CSS Bundle Size Analysis\n');
console.log('=== BEFORE (Separate Files) ===');

let totalBefore = 0;
let totalBeforeGzip = 0;

cssFiles.forEach(file => {
  const filePath = path.join(cssDir, file);
  if (fs.existsSync(filePath)) {
    const size = getFileSize(filePath);
    const gzipSize = getGzipSize(filePath);
    totalBefore += size;
    totalBeforeGzip += gzipSize;
    console.log(`${file.padEnd(25)} ${formatBytes(size).padStart(10)} (${formatBytes(gzipSize)} gzip)`);
  }
});

console.log(`${'TOTAL'.padEnd(25)} ${formatBytes(totalBefore).padStart(10)} (${formatBytes(totalBeforeGzip)} gzip)`);
console.log(`${'HTTP Requests'.padEnd(25)} ${cssFiles.length}`);

// After: Built file
const builtFilePath = path.join(__dirname, '../dist/css/main.min.css');

if (fs.existsSync(builtFilePath)) {
  console.log('\n=== AFTER (Built + Minified + Purged) ===');
  const builtSize = getFileSize(builtFilePath);
  const builtGzipSize = getGzipSize(builtFilePath);
  
  console.log(`main.min.css${' '.repeat(14)} ${formatBytes(builtSize).padStart(10)} (${formatBytes(builtGzipSize)} gzip)`);
  console.log(`${'HTTP Requests'.padEnd(25)} 1`);
  
  console.log('\n=== SAVINGS ===');
  const sizeSavings = ((totalBefore - builtSize) / totalBefore * 100).toFixed(1);
  const gzipSavings = ((totalBeforeGzip - builtGzipSize) / totalBeforeGzip * 100).toFixed(1);
  const requestSavings = cssFiles.length - 1;
  
  console.log(`Size:          -${formatBytes(totalBefore - builtSize)} (-${sizeSavings}%)`);
  console.log(`Gzip:          -${formatBytes(totalBeforeGzip - builtGzipSize)} (-${gzipSavings}%)`);
  console.log(`HTTP Requests: -${requestSavings} requests (${((requestSavings / cssFiles.length) * 100).toFixed(0)}%)`);
} else {
  console.log('\n⚠️  Built file not found. Run `npm run css:build` first.');
}
```

### Add to `package.json`

```json
{
  "scripts": {
    "css:measure": "node scripts/measure-css-performance.js"
  }
}
```

---

## 6. GitHub Actions CI Integration

### Create `.github/workflows/css-build.yml`

```yaml
name: Build CSS

on:
  push:
    branches: [main]
    paths:
      - 'app/assets/css/**'
  pull_request:
    branches: [main]
    paths:
      - 'app/assets/css/**'

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: app/package-lock.json
      
      - name: Install dependencies
        working-directory: ./app
        run: npm ci
      
      - name: Build CSS
        working-directory: ./app
        run: npm run css:build
      
      - name: Measure bundle size
        working-directory: ./app
        run: npm run css:measure
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: css-dist
          path: app/dist/css/
      
      - name: Deploy to Azure Static Web Apps
        if: github.ref == 'refs/heads/main'
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/app"
          output_location: "dist"
```

---

## 7. Azure Static Web Apps Configuration

### Update `staticwebapp.config.json`

```json
{
  "routes": [
    {
      "route": "/dist/css/*",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "route": "/assets/fonts/*",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable",
        "access-control-allow-origin": "*"
      }
    }
  ],
  "mimeTypes": {
    ".woff2": "font/woff2",
    ".woff": "font/woff"
  },
  "platformErrorOverrides": [],
  "globalHeaders": {
    "content-security-policy": "default-src 'self'; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; font-src 'self' data:; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdn.plot.ly; img-src 'self' data: https:;"
  }
}
```

---

**End of Implementation Examples**

All code is production-ready. Test thoroughly before deploying to production.
