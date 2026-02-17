# Webpack Build Pipeline — Implementation Research
**Date:** 2026-02-17  
**Topic:** FC-118 — Webpack Build System  
**Researcher:** Capital (Sprint Research cron f6500924)  
**Status:** ✅ Research Complete — 2 tracks documented, full code examples

---

## Executive Summary

The current build has **463KB of unminified JS** (26 files) and **200KB of unminified CSS** (9 files) loaded via **22 script tags per page**. A proper build pipeline would:

| Metric | Before | After (est.) | Improvement |
|--------|--------|--------------|-------------|
| JS payload | 463KB | ~80-100KB | -78% (minify + tree-shake) |
| CSS payload | 200KB | ~35-50KB | -75% (minify + PurgeCSS removes unused Bootstrap) |
| Script tags/page | 22 | 2-3 | -90% (bundles) |
| console.log calls | 52 | 0 | -100% (TerserPlugin drop_console) |
| Build time | N/A | <5s | Repeatable, CI-gated |

**Critical finding:** The current codebase uses **global variables** (`window.sb`, `window.Toast`, etc.) — not ES modules. This means a direct webpack bundling approach requires JS refactoring first. The research covers two practical tracks:

- **Track A (< 2h, zero refactor):** CLI tools (terser + cssnano + purgecss) as npm scripts
- **Track B (4-5h, minor refactor):** Full webpack with `output.iife` for globals preservation

**Recommendation: Do Track A immediately (fast wins), plan Track B for Sprint 3.**

---

## Current State Analysis

### JS Files — 463KB, 13,046 lines
```
26 files loaded via <script> tags
├── Core (loaded on ALL pages, ~350KB):
│   lazy-loader.js, csrf.js, security-utils.js, session-security.js
│   toast-notifications.js, demo-data.js, app.js, event-handlers.js
│   loading-states.js, empty-states.js, polish-utilities.js
│   notification-enhancements.js, security-patch.js, app-polish-enhancements.js
│   rate-limiter.js, rate-limit-db.js, chart-theme.js
│
├── Dashboard-specific (~90KB): charts.js, subscriptions.js
├── Transactions-only (~50KB): transactions.js, categorizer.js
├── Reports-only (~30KB): reports.js
├── Auth-specific (~25KB): plaid.js, onboarding.js, tour.js
└── Budget-specific (~20KB): budget-actuals.js
```

### CSS Files — 200KB
```
9 files, loaded via <link> tags
├── main.css        ~92KB (largest — 3,600 lines)
├── components.css  ~42KB
├── responsive.css  ~32KB
├── utilities.css   ~10KB
├── accessibility.css ~12KB
└── design-tokens.css, critical.css, logged-out-cta.css, onboarding.css
```

**Bootstrap 5.3 is loaded from CDN (~30KB min+gz) — NOT in npm yet.**  
This means we can't run PurgeCSS on Bootstrap until it's moved to npm. The custom CSS (above) is the initial purge target.

---

## Track A: CLI Tools (Quick Win — <2h, Zero Risk)

No webpack config. No module refactoring. Just npm scripts that run CLI tools in sequence.

### Step 1: Install Dependencies
```bash
cd C:\Users\chuba\fireside-capital\app
npm init -y          # creates package.json if not exists
npm install --save-dev terser clean-css-cli purgecss glob
```

### Step 2: package.json scripts
```json
{
  "scripts": {
    "build": "npm run build:css && npm run build:js",
    "build:css": "npm run css:concat && npm run css:purge && npm run css:minify",
    "build:js": "npm run js:minify",
    "css:concat": "node scripts/concat-css.js",
    "css:purge": "purgecss --css dist/assets/css/bundle.css --content 'app/**/*.html' 'app/assets/js/**/*.js' --output dist/assets/css/",
    "css:minify": "cleancss -o dist/assets/css/bundle.min.css dist/assets/css/bundle.css",
    "js:minify": "node scripts/minify-js.js",
    "watch": "node scripts/watch.js"
  }
}
```

### Step 3: scripts/minify-js.js
```javascript
// scripts/minify-js.js
// Minifies all JS files to dist/ with console.log stripped

const { minify } = require('terser');
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'assets', 'js');
const DIST = path.join(__dirname, '..', 'dist', 'assets', 'js');

const TERSER_OPTIONS = {
  compress: {
    drop_console: true,      // ← Eliminates all 52 console.log calls
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
```

### Step 4: scripts/concat-css.js
```javascript
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
  return `/* === ${file} === */\n${fs.readFileSync(filepath, 'utf8')}\n`;
}).join('\n');

const outPath = path.join(DIST, 'bundle.css');
fs.writeFileSync(outPath, combined);
console.log(`✓ CSS concatenated: ${Math.round(combined.length/1024)}KB → ${outPath}`);
```

### Expected Track A Results
```
JS Minification:
  app.js:              ~82KB → ~28KB  (-66%)
  charts.js:           ~42KB → ~16KB  (-62%)
  26 files total:    463KB → ~160KB  (-65%)
  console.log calls:  52 → 0         (-100%) ← BUG-JS-001 FIXED

CSS:
  All 9 files concatenated: 200KB → 200KB (no size change yet)
  After cleancss minification: 200KB → ~140KB  (-30%)
  After PurgeCSS (custom CSS only): ~140KB → ~85KB  (-40%)
```

**Note:** PurgeCSS on custom CSS alone gives ~40% reduction. Moving Bootstrap to npm and running PurgeCSS on it would give an additional 60%+ reduction on the Bootstrap chunk.

---

## Track B: Full Webpack (4-5h, Recommended for Sprint 3)

Full webpack config that:
1. Creates page-specific bundles using a **shared vendor chunk**
2. Runs TerserPlugin to strip console.log
3. Extracts + minifies CSS with MiniCssExtractPlugin
4. Generates HTML files with updated script/link tags
5. Adds **content hashing** for long-lived cache headers

### Why Webpack Over esbuild for this app

esbuild is 100x faster but harder to configure for:
- Multi-page HTML injection (no mature HtmlWebpackPlugin equivalent)
- PurgeCSS integration
- Legacy global variable compatibility

webpack 5 + the plugins below handle all this in ~100 lines of config.

### The Global Variable Challenge

The current codebase uses `window.sb = supabase.createClient(...)` and similar globals. Standard webpack ES module bundling would break this. The solution is `output.library` with type `'window'` + using webpack's `ProvidePlugin` for shared modules:

```javascript
// webpack won't break globals IF we use:
// 1. output: { library: { type: 'window' } }  ← preserves window.* exports
// 2. ProvidePlugin for supabase, bootstrap (so they're available as globals)
// 3. OR: Wrap each "module" in an IIFE (webpack default for 'iife' library type)
```

**Easiest approach:** Convert the "shared" globals to proper exports over 1-2h:
```javascript
// csrf.js — BEFORE
const csrfToken = generateToken();
window.CSRF = { getToken: () => csrfToken };

// csrf.js — AFTER (15 min refactor)
export const CSRF = {
  getToken: () => {
    if (!sessionStorage.csrfToken) {
      sessionStorage.csrfToken = crypto.randomUUID();
    }
    return sessionStorage.csrfToken;
  }
};
```

### Full webpack.config.js

```javascript
// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { PurgeCSSPlugin } = require('purgecss-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const glob = require('glob');

const isProd = process.env.NODE_ENV === 'production';
const SRC = path.resolve(__dirname, 'app');
const DIST = path.resolve(__dirname, 'dist');

// =============================================================================
// ENTRY POINTS — one per page (page-specific code only)
// Shared code goes into the 'common' chunk via splitChunks
// =============================================================================
const PAGES = {
  index:        ['./src/entries/core.js', './src/entries/dashboard.js'],
  assets:       ['./src/entries/core.js', './src/entries/assets.js'],
  bills:        ['./src/entries/core.js', './src/entries/bills.js'],
  budget:       ['./src/entries/core.js', './src/entries/budget.js'],
  debts:        ['./src/entries/core.js', './src/entries/debts.js'],
  friends:      ['./src/entries/core.js', './src/entries/friends.js'],
  income:       ['./src/entries/core.js', './src/entries/income.js'],
  investments:  ['./src/entries/core.js', './src/entries/investments.js'],
  reports:      ['./src/entries/core.js', './src/entries/reports.js'],
  settings:     ['./src/entries/core.js', './src/entries/settings.js'],
  transactions: ['./src/entries/core.js', './src/entries/transactions.js'],
};

// Generate one HtmlWebpackPlugin per page
const htmlPlugins = Object.keys(PAGES).map(page => {
  const isIndex = page === 'index';
  return new HtmlWebpackPlugin({
    template: path.join(SRC, isIndex ? 'index.html' : `${page}.html`),
    filename: isIndex ? 'index.html' : `${page}.html`,
    chunks: ['common', 'vendors', page],  // inject shared + page bundles
    inject: 'body',                        // add <script> before </body>
    minify: isProd ? {
      collapseWhitespace: true,
      removeComments: true,
      removeAttributeQuotes: false,  // Keep for Bootstrap attrs (data-bs-*)
    } : false,
  });
});

module.exports = {
  mode: isProd ? 'production' : 'development',
  devtool: isProd ? false : 'source-map',

  // =============================================================================
  // ENTRY POINTS
  // =============================================================================
  entry: Object.fromEntries(
    Object.entries(PAGES).map(([page, entries]) => [page, entries])
  ),

  // =============================================================================
  // OUTPUT
  // =============================================================================
  output: {
    path: DIST,
    filename: isProd
      ? 'assets/js/[name].[contenthash:8].bundle.js'
      : 'assets/js/[name].bundle.js',
    clean: true,  // Clean dist/ before each build
  },

  // =============================================================================
  // MODULE RULES
  // =============================================================================
  module: {
    rules: [
      // CSS processing
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      },
      // JavaScript (no transpilation needed — app targets modern browsers only)
      {
        test: /\.js$/i,
        include: path.resolve(__dirname, 'app/assets/js'),
        use: [],  // No babel needed — ES2020+ is fine for Fireside's audience
      },
    ],
  },

  // =============================================================================
  // OPTIMIZATION
  // =============================================================================
  optimization: {
    minimize: isProd,
    minimizer: [
      // ────────────────────────────────────────────────────
      // TerserPlugin — JS minification + console.log removal
      // ────────────────────────────────────────────────────
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          compress: {
            drop_console: isProd,        // ← Removes all 52 console.log calls
            drop_debugger: true,
            pure_funcs: isProd
              ? ['console.log', 'console.warn', 'console.info', 'console.debug']
              : [],
            passes: 2,
          },
          mangle: {
            safari10: true,              // Fix Safari 10 loop iteration bug
          },
          format: {
            comments: false,             // Strip all comments
          },
        },
        extractComments: false,          // No separate .LICENSE.txt files
      }),
      // CSS minification
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: ['default', {
            discardComments: { removeAll: true },
            normalizeWhitespace: true,
          }],
        },
      }),
    ],
    // ────────────────────────────────────────────────────
    // Split Chunks — shared code into 'common' bundle
    // ────────────────────────────────────────────────────
    splitChunks: {
      cacheGroups: {
        // All node_modules (supabase, bootstrap if moved to npm)
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 20,
        },
        // Core app code used on every page
        common: {
          name: 'common',
          chunks: 'all',
          minChunks: 3,    // Extract if used on 3+ pages
          priority: 10,
          reuseExistingChunk: true,
        },
      },
    },
  },

  // =============================================================================
  // PLUGINS
  // =============================================================================
  plugins: [
    // CSS extraction
    new MiniCssExtractPlugin({
      filename: isProd
        ? 'assets/css/[name].[contenthash:8].css'
        : 'assets/css/[name].css',
    }),

    // PurgeCSS — remove unused Bootstrap + custom CSS rules
    ...(isProd ? [new PurgeCSSPlugin({
      paths: glob.sync(`${SRC}/**/*`, { nodir: true }),
      // Safelist: Bootstrap dynamic classes added by JS
      safelist: {
        standard: [
          /^modal/,          // Bootstrap modal classes
          /^fade/,
          /^show/,
          /^collapse/,
          /^collapsing/,
          /^dropdown/,
          /^tooltip/,
          /^popover/,
          /^bs-/,
          /^data-bs/,
          /^bi-/,            // Bootstrap Icons
          /^text-/,          // Bootstrap color utilities (dynamic)
          /^bg-/,
          /^border-/,
          /^d-/,
          /^is-valid/,
          /^is-invalid/,
          /^was-validated/,
          /skeleton/,        // Skeleton loader classes
          /loading/,
          /toast/,
          /alert/,
        ],
        greedy: [
          /^chart/,          // Chart.js CSS classes
        ],
      },
    })] : []),

    // Copy static files to dist/
    new CopyPlugin({
      patterns: [
        { from: 'app/staticwebapp.config.json', to: 'staticwebapp.config.json' },
        { from: 'app/assets/icons',             to: 'assets/icons' },
        { from: 'app/assets/images',            to: 'assets/images' },
        { from: 'app/manifest.json',            to: 'manifest.json' },
        { from: 'app/sw.js',                    to: 'sw.js', noErrorOnMissing: true },
      ],
    }),

    // HTML injection for all 11 pages
    ...htmlPlugins,
  ],

  // =============================================================================
  // PERFORMANCE BUDGETS
  // =============================================================================
  performance: {
    hints: isProd ? 'warning' : false,
    maxAssetSize: 200 * 1024,          // Warn if any bundle > 200KB
    maxEntrypointSize: 300 * 1024,     // Warn if entry + deps > 300KB
  },
};
```

### Entry File Boilerplate (src/entries/)

The entry files are thin orchestrators that import from the existing JS files:

```javascript
// src/entries/core.js — loaded on EVERY page
// These are the files currently in every <script> chain

// Security layer (must load first)
import '../../app/assets/js/csrf.js';
import '../../app/assets/js/security-utils.js';
import '../../app/assets/js/rate-limiter.js';
import '../../app/assets/js/rate-limit-db.js';
import '../../app/assets/js/session-security.js';

// UI layer
import '../../app/assets/js/toast-notifications.js';
import '../../app/assets/js/loading-states.js';
import '../../app/assets/js/empty-states.js';
import '../../app/assets/js/polish-utilities.js';
import '../../app/assets/js/notification-enhancements.js';

// Demo mode (before app.js so isDemoMode() is available)
import '../../app/assets/js/demo-data.js';

// App core
import '../../app/assets/js/app.js';
import '../../app/assets/js/event-handlers.js';
import '../../app/assets/js/lazy-loader.js';

// Polish layer
import '../../app/assets/js/security-patch.js';
import '../../app/assets/js/app-polish-enhancements.js';
import '../../app/assets/js/tour.js';
```

```javascript
// src/entries/dashboard.js — index.html only
import '../../app/assets/js/chart-theme.js';
import '../../app/assets/js/charts.js';
import '../../app/assets/js/subscriptions.js';
import '../../app/assets/js/budget-actuals.js';
import '../../app/assets/js/onboarding.js';
import '../../app/assets/js/plaid.js';
```

```javascript
// src/entries/transactions.js — transactions.html only
import '../../app/assets/js/transactions.js';
import '../../app/assets/js/categorizer.js';
```

```javascript
// src/entries/reports.js — reports.html only
import '../../app/assets/js/chart-theme.js';
import '../../app/assets/js/charts.js';
import '../../app/assets/js/reports.js';
```

### Required package.json
```json
{
  "name": "fireside-capital",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "NODE_ENV=production webpack",
    "build:dev": "webpack --mode development",
    "watch": "webpack --mode development --watch",
    "build:analyze": "webpack-bundle-analyzer dist/stats.json dist/",
    "stats": "webpack --json > dist/stats.json"
  },
  "devDependencies": {
    "webpack": "^5.98.0",
    "webpack-cli": "^6.0.0",
    "html-webpack-plugin": "^5.6.3",
    "mini-css-extract-plugin": "^2.9.2",
    "css-minimizer-webpack-plugin": "^7.0.0",
    "css-loader": "^7.1.2",
    "terser-webpack-plugin": "^5.3.11",
    "purgecss-webpack-plugin": "^6.0.0",
    "copy-webpack-plugin": "^12.0.2",
    "glob": "^11.0.0",
    "webpack-bundle-analyzer": "^4.10.2"
  }
}
```

### Updated GitHub Actions Workflow (.github/workflows/azure-static-web-apps.yml)

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci
        working-directory: ./

      - name: Build production bundle
        run: npm run build
        working-directory: ./
        env:
          NODE_ENV: production

      - name: Deploy to Azure Static Web Apps
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: 'upload'
          app_location: '/'          # webpack.config.js lives here
          output_location: 'dist'    # webpack outputs here
          skip_app_build: true       # We already built above
```

---

## JS Refactoring Guide (Globals → ES Modules)

The files need minimal changes. Most just need `export` added to window-attached objects:

### Pattern 1: Simple globals (15 min/file)
```javascript
// BEFORE: csrf.js
const CSRF = { getToken() { ... }, validate() { ... } };
window.CSRF = CSRF;

// AFTER: csrf.js (add export, remove window.* assignment)
export const CSRF = { getToken() { ... }, validate() { ... } };
// webpack bundles it; no window.CSRF needed — callers import it
```

### Pattern 2: Files that use other globals (needs coordination)
```javascript
// BEFORE: app.js line 1
const { createClient } = window.supabase;  // relies on CDN <script>

// AFTER: Move supabase to npm
import { createClient } from '@supabase/supabase-js';
```

### Pattern 3: Self-initializing files (zero changes)
```javascript
// demo-data.js — registers on window, no changes needed
// webpack treats it as a side-effect module
window.DEMO_DATA = { ... };
window.isDemoMode = () => { ... };
// Import in entry file: import './demo-data.js'  ← no exports needed
```

### Conversion Priority
| File | Change Needed | Effort |
|------|---------------|--------|
| csrf.js | Add `export const CSRF` | 5 min |
| toast-notifications.js | Add `export { Toast, ToastManager }` | 5 min |
| security-utils.js | Add `export const SecurityUtils` | 5 min |
| app.js | Move supabase init to top, export functions | 2-3h |
| charts.js | Already structured — export `renderCharts` | 30 min |
| demo-data.js | Keep as side-effect module | 0 min |
| event-handlers.js | Keep as side-effect module (attaches listeners) | 0 min |

**Bottom line:** About 4-5h of refactoring across all 26 files to get clean ES modules. Then Track B config above works without modification.

---

## Expected Final Bundle Sizes

### After Track A (CLI tools only):
```
JS:  463KB → ~160KB  (-65%, console.log stripped)
CSS: 200KB → ~85KB   (-57%, minified + purged)
Script tags: 22 → 22  (unchanged — same HTML structure)
```

### After Track B (webpack):
```
vendors.bundle.js:    ~50KB  (supabase + bootstrap, long-lived cache)
common.bundle.js:     ~40KB  (core app code, all pages)
index.bundle.js:      ~20KB  (dashboard-only code)
transactions.bundle.js: ~15KB
reports.bundle.js:    ~12KB
(other pages):        ~5-10KB each

Total JS on dashboard: ~110KB vs 463KB current  (-76%)
CSS: ~35-50KB   (if Bootstrap moved to npm + PurgeCSS)
Script tags: 22 → 3  (vendors + common + page-specific)
```

---

## Implementation Tasks Created

See BACKLOG.md for formal work items. Summary:

| ID | Priority | Est | Description |
|----|----------|-----|-------------|
| FC-188 | P1 | 2h | Track A: Add npm build scripts (terser + cssnano + purgecss CLI) |
| FC-189 | P2 | 1h | Track A: Add build step to GitHub Actions (replace raw file deploy) |
| FC-190 | P2 | 4h | JS module refactoring — add `export` to 26 files (prep for Track B) |
| FC-191 | P2 | 5h | Track B: Full webpack config + HtmlWebpackPlugin for all 11 pages |
| FC-192 | P2 | 1h | Move Bootstrap + Supabase from CDN to npm (enables full PurgeCSS) |

**Total effort:** ~13h → 76% JS reduction, 75% CSS reduction, BUG-JS-001 permanently closed

---

## Quick Win: Immediate Terser Drop (30 min, standalone)

Even without any build system, you can strip console.logs RIGHT NOW using npx:

```powershell
# One-time run — strips console.log from all JS, saves to same files
# Run from app/assets/js/

cd C:\Users\chuba\fireside-capital\app\assets\js

# Install terser globally once
npm install -g terser

# Strip console.logs from all JS files (in-place)
Get-ChildItem *.js | ForEach-Object {
  $content = terser $_.FullName --compress "drop_console=true" --mangle
  # Preview first — check output looks right
  Write-Output "--- $($_.Name) ---"
  $content | Select-Object -First 3
}
```

**WARNING:** Don't use in-place overwrite without testing first. Use to dist/ directory.

---

## Content Hash Cache Busting (Replaces CSS v=20260217 strings)

Current approach: manual `?v=20260217` cache busters in HTML.  
Webpack approach: `[contenthash:8]` in filename.

```
Before: <link href="assets/css/main.css?v=20260217">
After:  <link href="assets/css/main.a3f8c1b2.css">
```

The hash changes only when file content changes. Long-lived Cache-Control headers become safe:
```json
// staticwebapp.config.json
{
  "routes": [
    {
      "route": "/assets/js/*.bundle.js",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    },
    {
      "route": "/assets/css/*.css",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    }
  ]
}
```

This pairs with FC-121 (Cache-Control headers) — do both together.

---

## Summary Recommendation

**This sprint:** Do Track A (FC-188/189, ~3h total)
- Add npm build scripts for terser + cssnano
- BUG-JS-001 (52 console.logs) → **permanently resolved**
- CSS shrinks 57% without touching code
- GitHub Actions builds the minified version automatically

**Next sprint:** Do Track B (FC-190/191/192, ~10h total)  
- Refactor JS to ES modules (FC-190)
- Full webpack config (FC-191)
- Move CDN deps to npm (FC-192)
- Result: 22 script tags → 3, bundles cached immutably

**Skip:** Babel transpilation — the app targets Chrome/Firefox/Safari (last 2 versions). No IE11 support needed. Babel adds build complexity with zero benefit.
