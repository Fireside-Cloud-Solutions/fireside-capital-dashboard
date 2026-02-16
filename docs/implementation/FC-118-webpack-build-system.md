# FC-118: Webpack Build System Implementation Guide

**Priority:** P1 (High)  
**Size:** M (4-5 hours)  
**Status:** Ready  
**Sprint Research:** Performance Optimization  
**Expected Impact:** +11% Lighthouse performance (69% → 80%)

---

## Executive Summary

Set up Webpack to bundle JavaScript modules, enable code splitting, minify production builds, and remove console.log statements automatically.

**Current State:**
- 15-20 individual `<script>` tags per page (slow parallel downloads)
- 216KB monolithic `app.js` loaded on every page (bloat)
- Console.log statements in production (unprofessional)
- No minification or tree-shaking

**Target State:**
- 3-5 optimized bundles with code splitting
- TerserPlugin minification + console removal
- Source maps for debugging
- GitHub Actions CI/CD integration

---

## Prerequisites

```powershell
# Install Node dependencies (run from app/)
npm install --save-dev webpack webpack-cli webpack-dev-server
npm install --save-dev terser-webpack-plugin css-minimizer-webpack-plugin
npm install --save-dev mini-css-extract-plugin html-webpack-plugin
```

---

## Step 1: Create `webpack.config.js`

**File:** `app/webpack.config.js`

```javascript
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';

  return {
    mode: isDevelopment ? 'development' : 'production',
    
    // Entry points for code splitting
    entry: {
      // Core bundle (shared across all pages)
      core: './assets/js/core.js',
      
      // Page-specific bundles
      dashboard: './assets/js/dashboard.js',
      transactions: './assets/js/transactions.js',
      bills: './assets/js/bills.js',
      budget: './assets/js/budget.js',
      debts: './assets/js/debts.js',
      income: './assets/js/income.js',
      investments: './assets/js/investments.js',
      assets: './assets/js/assets.js',
      reports: './assets/js/reports.js',
      settings: './assets/js/settings.js',
      auth: './assets/js/auth.js'
    },
    
    output: {
      filename: isDevelopment ? '[name].bundle.js' : '[name].[contenthash].js',
      path: path.resolve(__dirname, 'dist'),
      clean: true // Clean dist/ before each build
    },
    
    // Code splitting for vendor libraries
    optimization: {
      moduleIds: 'deterministic',
      runtimeChunk: 'single',
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'all',
            priority: 10
          },
          supabase: {
            test: /[\\/]node_modules[\\/]@supabase[\\/]/,
            name: 'supabase',
            chunks: 'all',
            priority: 20
          },
          chartjs: {
            test: /[\\/]node_modules[\\/]chart\.js[\\/]/,
            name: 'chartjs',
            chunks: 'all',
            priority: 20
          }
        }
      },
      minimize: !isDevelopment,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: !isDevelopment, // Remove console.log in production
              drop_debugger: true,
              pure_funcs: isDevelopment ? [] : ['console.log', 'console.debug']
            },
            format: {
              comments: false
            }
          },
          extractComments: false
        }),
        new CssMinimizerPlugin()
      ]
    },
    
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, 'css-loader']
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif|webp|avif)$/i,
          type: 'asset/resource'
        }
      ]
    },
    
    plugins: [
      new MiniCssExtractPlugin({
        filename: isDevelopment ? '[name].css' : '[name].[contenthash].css'
      })
    ],
    
    devtool: isDevelopment ? 'eval-source-map' : 'source-map',
    
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist')
      },
      compress: true,
      port: 3001,
      hot: true
    }
  };
};
```

---

## Step 2: Create Entry Point Files

Webpack needs explicit entry points. Create these files to extract shared code:

**File:** `app/assets/js/core.js`

```javascript
// Core bundle — shared across ALL pages
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase (shared)
const SUPABASE_URL = 'https://qqtiofdqplwycnwplmen.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxdGlvZmRxcGx3eWNud3BsbWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDY5NDIsImV4cCI6MjA4NTQ4Mjk0Mn0.Vjg7hQDPWJwmbkQccw5CXH_Npi2YJgJbt-OAEnF_P5g';

window.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export utilities
export { SUPABASE_URL, SUPABASE_ANON_KEY };

// Auth check (runs on all pages)
async function checkAuth() {
  const { data: { user } } = await window.supabase.auth.getUser();
  
  if (!user && !window.location.pathname.includes('auth.html')) {
    window.location.href = 'auth.html';
  } else if (user && window.location.pathname.includes('auth.html')) {
    window.location.href = 'dashboard.html';
  }
}

// Run auth check on page load
document.addEventListener('DOMContentLoaded', checkAuth);
```

**File:** `app/assets/js/dashboard.js`

```javascript
// Dashboard-specific code
import './core.js'; // Import core for Supabase client
import Chart from 'chart.js/auto';

// Dashboard initialization
async function initDashboard() {
  // Your existing dashboard.js logic here
  console.log('Dashboard initialized');
}

document.addEventListener('DOMContentLoaded', initDashboard);
```

**Repeat for all pages:** `transactions.js`, `bills.js`, etc.

---

## Step 3: Update `package.json` Scripts

**File:** `app/package.json`

```json
{
  "name": "fireside-capital",
  "version": "1.0.0",
  "scripts": {
    "dev": "webpack serve --mode development",
    "build": "webpack --mode production",
    "watch": "webpack --watch --mode development",
    "analyze": "webpack-bundle-analyzer dist/stats.json"
  },
  "devDependencies": {
    "webpack": "^5.90.0",
    "webpack-cli": "^5.1.4",
    "webpack-dev-server": "^4.15.1",
    "terser-webpack-plugin": "^5.3.10",
    "css-minimizer-webpack-plugin": "^6.0.0",
    "mini-css-extract-plugin": "^2.8.0",
    "html-webpack-plugin": "^5.6.0",
    "webpack-bundle-analyzer": "^4.10.1"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "chart.js": "^4.4.1",
    "bootstrap": "^5.3.2"
  }
}
```

---

## Step 4: Update HTML Files

Replace multiple `<script>` tags with Webpack bundles.

**Before:**
```html
<script src="assets/js/supabase.js"></script>
<script src="assets/js/app.js"></script>
<script src="assets/js/dashboard.js"></script>
<script src="assets/js/charts.js"></script>
```

**After:**
```html
<!-- Webpack bundles (generated filenames) -->
<script src="dist/runtime.js"></script>
<script src="dist/vendor.js"></script>
<script src="dist/core.js"></script>
<script src="dist/dashboard.js"></script>
```

**Note:** Use `HtmlWebpackPlugin` to auto-inject scripts (optional advanced step).

---

## Step 5: Test Build

```powershell
cd app
npm run build
```

**Expected Output:**
```
asset runtime.abc123.js 5 KB [emitted] (name: runtime)
asset vendor.def456.js 85 KB [emitted] (name: vendor)
asset core.ghi789.js 12 KB [emitted] (name: core)
asset dashboard.jkl012.js 18 KB [emitted] (name: dashboard)
asset transactions.mno345.js 15 KB [emitted] (name: transactions)
...
webpack compiled successfully in 3421 ms
```

---

## Step 6: Update Azure Static Web Apps CI/CD

**File:** `.github/workflows/azure-static-web-apps.yml`

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd app
          npm ci

      - name: Build with Webpack
        run: |
          cd app
          npm run build

      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "app"
          api_location: ""
          output_location: "dist"
```

---

## Step 7: Performance Validation

### Before Webpack
```
Lighthouse Performance Score: 68-72%
- FCP: 4.2s
- LCP: 5.8s
- TBT: 280ms
- Total JS: 216 KB (unminified)
- Console logs: 151 statements
```

### After Webpack
```
Lighthouse Performance Score: 80-85%
- FCP: 2.8s (-33%)
- LCP: 3.9s (-33%)
- TBT: 150ms (-46%)
- Total JS: 140 KB (-35%, minified + split)
- Console logs: 0 (production)
```

**Expected Gains:**
- ✅ +11-13% Lighthouse performance
- ✅ -35% JavaScript bundle size
- ✅ -33% page load time
- ✅ Zero console.log statements in production
- ✅ Better caching (contenthash filenames)

---

## Troubleshooting

### Issue: "Module not found" errors
**Solution:** Check import paths are correct. Webpack uses ES6 imports (`import`), not `<script>` tags.

### Issue: Charts not rendering
**Solution:** Ensure Chart.js is imported in entry point:
```javascript
import Chart from 'chart.js/auto';
window.Chart = Chart; // If using global Chart object
```

### Issue: Supabase client undefined
**Solution:** Verify `core.js` is imported before page-specific code:
```javascript
import './core.js'; // Must be first line
```

### Issue: Large vendor bundle
**Solution:** Use dynamic imports for large libraries:
```javascript
// Instead of:
import Chart from 'chart.js/auto';

// Use:
const Chart = await import('chart.js/auto');
```

---

## Acceptance Criteria

- [ ] Webpack builds successfully (`npm run build`)
- [ ] Production bundles are minified (< 50 KB per chunk)
- [ ] Console.log statements removed in production
- [ ] Source maps generated for debugging
- [ ] All 11 pages load correctly with new bundles
- [ ] Lighthouse performance score +10-15%
- [ ] GitHub Actions workflow deploys successfully

---

## Next Steps

After FC-118 is complete, unlock:
- **FC-119:** Async/defer scripts (+5-8% performance)
- **FC-120:** Critical CSS inline (+2-3% performance)
- **FC-094:** Pre-parsed chart data (+62% chart rendering)

---

**Estimated Time:** 4-5 hours  
**Difficulty:** Medium (requires Node.js knowledge)  
**Risk:** Low (reversible, doesn't change app logic)  
**Impact:** High (+11% performance, -35% bundle size, professional production code)
