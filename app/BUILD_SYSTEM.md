# Fireside Capital — Build System

**Status:** ✅ Implemented (FC-188)  
**Date:** 2026-02-20  
**Type:** Track A (CLI tools, zero code refactoring)

---

## Overview

Production build pipeline that:
- Minifies all JavaScript (566KB → 308KB, **-46%**)
- Strips all console.log calls (fixes BUG-JS-001)
- Concatenates & minifies CSS (221KB → ~135KB, **-39%**)
- Zero code refactoring required

## Build Commands

```bash
# Full build (CSS + JS)
npm run build

# CSS only
npm run build:css

# JS only
npm run build:js
```

## Output

All minified assets are written to `dist/`:
```
dist/
├── assets/
│   ├── css/
│   │   ├── bundle.css         # Concatenated (221KB)
│   │   └── bundle.min.css     # Minified (~135KB)
│   └── js/
│       ├── app.js             # 227KB → 140KB
│       ├── charts.js          # 33KB → 16KB
│       ├── operations.js      # 37KB → 19KB
│       └── [29 more files]    # All minified with console.log stripped
```

## Performance Gains

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Total JS | 566KB | 308KB | **-46%** |
| Total CSS | 221KB | ~135KB | **-39%** |
| console.log calls | 52 | **0** | **-100%** ✅ |
| app.js (largest file) | 227KB | 140KB | -38% |
| realtime.js (best compression) | 11KB | 2KB | **-80%** |

## What Gets Stripped

### JavaScript (Terser)
- All `console.log()` calls (52 instances removed)
- All `console.warn()` and `console.info()` calls
- All comments
- Whitespace
- Variable name mangling (local vars only)

### CSS (CleanCSS)
- All @import statements (redundant after concatenation)
- Comments
- Whitespace
- Duplicate rules

## Scripts Breakdown

### `scripts/minify-js.js`
Minifies all JS files in `assets/js/` to `dist/assets/js/`.

**Terser options:**
```js
{
  compress: {
    drop_console: true,      // Remove console.log
    drop_debugger: true,
    pure_funcs: ['console.log', 'console.warn', 'console.info'],
    passes: 2                // 2 compression passes
  },
  mangle: true,              // Rename local variables
  format: {
    comments: false          // Strip comments
  }
}
```

### `scripts/concat-css.js`
Concatenates CSS files in **cascade order** (design tokens first, utilities last).

**CSS load order:**
1. design-tokens.css (variables)
2. critical.css
3. main.css
4. components.css
5. responsive.css
6. utilities.css
7. accessibility.css
8. onboarding.css
9. logged-out-cta.css

## Integration with Azure Static Web Apps

### Option A: Commit dist/ to repo (Simplest)
1. Remove `dist/` from `.gitignore`
2. Run `npm run build` before each commit
3. Update HTML `<script>` tags to point to `dist/assets/js/app.js`
4. Azure serves minified files directly

### Option B: Build in CI/CD (Recommended)
Add to `.github/workflows/azure-static-web-apps-*.yml`:

```yaml
- name: Build assets
  run: |
    cd app
    npm ci
    npm run build

- name: Deploy to Azure
  uses: Azure/static-web-apps-deploy@v1
  with:
    azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
    app_location: "app/dist"  # ← Serve from dist/
```

## Limitations (Track A)

❌ **NOT included in Track A:**
- Webpack bundling (Track B)
- PurgeCSS on Bootstrap (needs npm package)
- Content hashing for cache busting
- Tree shaking
- Code splitting

✅ **What Track A DOES provide:**
- 46% JS size reduction
- 39% CSS size reduction
- All console.logs removed
- Production-ready minification
- Zero code refactoring
- 100% compatible with current codebase

## Next Steps (Track B)

For even more optimization:
1. Convert to ES modules (global variable refactor)
2. Webpack bundling with shared vendor chunk
3. Add Bootstrap to npm, run PurgeCSS on it
4. Add content hashing (app.abc123.js)
5. Code splitting per page

**Estimated effort:** 4-5 hours  
**Additional savings:** ~30% (mostly from PurgeCSS on Bootstrap)

---

## Verification

Test the build output:
```bash
# Run build
npm run build

# Check output sizes
ls -lh dist/assets/js/*.js
ls -lh dist/assets/css/*.css

# Verify console.log removal
grep -r "console.log" dist/assets/js/
# (Should return no results)
```

---

**Document Owner:** Capital (Lead Dev)  
**Research:** See `reports/webpack-build-pipeline-research-2026-02-17.md`
