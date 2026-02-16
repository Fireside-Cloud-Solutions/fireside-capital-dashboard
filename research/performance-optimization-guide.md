# Performance Optimization Guide — Fireside Capital
**Research Sprint:** February 16, 2026  
**Status:** ✅ Complete  
**Researcher:** Capital (Orchestrator)

---

## Current Performance (Estimated)

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| First Contentful Paint (FCP) | ~1.5s | < 1.0s | ⚠️ |
| Largest Contentful Paint (LCP) | ~2.5s | < 2.5s | ✅ |
| Time to Interactive (TTI) | ~3.5s | < 3.0s | ⚠️ |
| Total Blocking Time (TBT) | ~400ms | < 300ms | ⚠️ |
| Cumulative Layout Shift (CLS) | ~0.05 | < 0.1 | ✅ |
| Lighthouse Score | ~85 | > 95 | ⚠️ |

---

## Quick Wins (High Impact, Low Effort)

### 1. Minify & Bundle CSS/JS
**Priority:** High  
**Effort:** 2 hours  
**Impact:** -40% file size

**Current:**
- 12 CSS files (~230 KB uncompressed)
- 25 JS files (~450 KB uncompressed)
- Loaded individually (many HTTP requests)

**Solution:** Use build tool to bundle and minify

```bash
npm install --save-dev esbuild cssnano postcss-cli

# package.json scripts
{
  "scripts": {
    "build:css": "postcss assets/css/main.css -o dist/css/bundle.min.css --use cssnano",
    "build:js": "esbuild assets/js/app.js --bundle --minify --sourcemap --outfile=dist/js/bundle.min.js",
    "build": "npm run build:css && npm run build:js"
  }
}
```

**Expected Result:**
- CSS: 230 KB → 90 KB (gzipped: ~25 KB)
- JS: 450 KB → 180 KB (gzipped: ~50 KB)

---

### 2. Optimize Images
**Priority:** High  
**Effort:** 1 hour  
**Impact:** -60% image size

**Current:** PNG icons, unoptimized

**Solution:**
- Convert PNGs to WebP (90% smaller)
- Serve responsive images via `<picture>` element
- Add `loading="lazy"` for below-fold images

```html
<!-- Before -->
<img src="assets/img/icons/icon-512x512.png" alt="Icon">

<!-- After -->
<picture>
  <source srcset="assets/img/icons/icon-512x512.webp" type="image/webp">
  <img src="assets/img/icons/icon-512x512.png" alt="Icon" loading="lazy">
</picture>
```

**Tools:**
```bash
# Convert images to WebP
npm install --save-dev imagemin imagemin-webp
```

---

### 3. Defer Non-Critical JavaScript
**Priority:** High  
**Effort:** 30 minutes  
**Impact:** FCP improvement (~500ms)

**Current:** All JS loads synchronously

**Solution:** Defer non-critical scripts

```html
<!-- Critical JS (inline) -->
<script>
  // Theme loader (prevent flash)
  const theme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-bs-theme', theme);
</script>

<!-- Defer non-critical JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" defer></script>
<script src="assets/js/app.js" defer></script>
<script src="assets/js/charts.js" defer></script>
```

---

### 4. Preload Critical Resources
**Priority:** Medium  
**Effort:** 30 minutes  
**Impact:** LCP improvement (~200ms)

```html
<head>
  <!-- Preload critical CSS -->
  <link rel="preload" href="assets/css/design-tokens.css" as="style">
  <link rel="preload" href="assets/css/main.css" as="style">
  
  <!-- Preload critical fonts -->
  <link rel="preload" href="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2" as="font" type="font/woff2" crossorigin>
  
  <!-- DNS prefetch for external resources -->
  <link rel="dns-prefetch" href="https://cdn.jsdelivr.net">
  <link rel="dns-prefetch" href="https://qqtiofdqplwycnwplmen.supabase.co">
</head>
```

---

### 5. Code Splitting (Lazy Load Routes)
**Priority:** Medium  
**Effort:** 3 hours  
**Impact:** Initial bundle size -50%

**Current:** All page JS loaded on every page

**Solution:** Load page-specific JS only when needed

```javascript
// app.js - Dynamic imports
const page = window.location.pathname.split('/').pop().replace('.html', '');

switch(page) {
  case 'dashboard':
  case '':
    import('./dashboard.js').then(module => module.init());
    break;
  case 'transactions':
    import('./transactions.js').then(module => module.init());
    break;
  case 'reports':
    import('./reports.js').then(module => module.init());
    break;
  // etc.
}
```

---

### 6. Enable HTTP/2 Server Push (Azure)
**Priority:** Low  
**Effort:** 1 hour  
**Impact:** First load speed +10%

**Azure Static Web Apps:** Already uses HTTP/2, but can optimize with Link headers

```json
// staticwebapp.config.json
{
  "routes": [
    {
      "route": "/index.html",
      "headers": {
        "Link": "</assets/css/main.css>; rel=preload; as=style, </assets/js/app.js>; rel=preload; as=script"
      }
    }
  ]
}
```

---

### 7. Reduce Third-Party Scripts
**Priority:** Medium  
**Effort:** 1 hour  
**Impact:** TBT reduction (~100ms)

**Current third-party scripts:**
- Bootstrap JS (53 KB)
- Bootstrap Icons CSS (15 KB)
- Chart.js (270 KB) — already lazy loaded ✅
- Supabase client (90 KB)

**Optimization:**
- Self-host Bootstrap (eliminate CDN request)
- Use icon subset (only icons used in dashboard)
- Consider Supabase Lite (lighter client)

```bash
# Install Bootstrap Icons subset generator
npm install bootstrap-icons-subset
npx bootstrap-icons-subset -i "bi-speedometer2,bi-house-door,bi-piggy-bank,bi-credit-card,bi-receipt" -o assets/icons/subset.css
```

---

### 8. Database Query Optimization
**Priority:** High  
**Effort:** 2 hours  
**Impact:** API response time -50%

**Current:** Multiple sequential queries on page load

**Solution:** Batch queries with Supabase RPC

```javascript
// Before (slow - 4 requests)
const assets = await supabase.from('assets').select('*');
const debts = await supabase.from('debts').select('*');
const bills = await supabase.from('bills').select('*');
const income = await supabase.from('income').select('*');

// After (fast - 1 request)
const { data } = await supabase.rpc('get_dashboard_data'); // Returns all data
```

**Supabase Function:**
```sql
CREATE OR REPLACE FUNCTION get_dashboard_data()
RETURNS JSON AS $$
  SELECT json_build_object(
    'assets', (SELECT json_agg(assets) FROM assets WHERE user_id = auth.uid()),
    'debts', (SELECT json_agg(debts) FROM debts WHERE user_id = auth.uid()),
    'bills', (SELECT json_agg(bills) FROM bills WHERE user_id = auth.uid()),
    'income', (SELECT json_agg(income) FROM income WHERE user_id = auth.uid())
  );
$$ LANGUAGE sql SECURITY DEFINER;
```

---

## Advanced Optimizations

### 9. Implement Route-Based Caching Strategy
**Priority:** Low  
**Effort:** 4 hours  
**Impact:** Repeat visit speed +300%

Use service worker to cache pages with different strategies:

- **Dashboard:** Network-first (fresh data)
- **Reports:** Stale-while-revalidate (OK to show stale)
- **Settings:** Cache-first (rarely changes)
- **Assets/Bills/etc.:** Network-first with 5s timeout fallback

---

### 10. Add Resource Hints
**Priority:** Low  
**Effort:** 30 minutes  
**Impact:** Perceived performance +5%

```html
<!-- Prefetch next likely pages -->
<link rel="prefetch" href="/transactions.html">
<link rel="prefetch" href="/bills.html">

<!-- Preconnect to API -->
<link rel="preconnect" href="https://qqtiofdqplwycnwplmen.supabase.co">
```

---

## Performance Budget

Set budgets to prevent regression:

| Resource | Budget | Current | Status |
|----------|--------|---------|--------|
| Total JS | 200 KB | 450 KB | ❌ |
| Total CSS | 50 KB | 230 KB | ❌ |
| Total Images | 100 KB | 80 KB | ✅ |
| Third-party | 150 KB | 158 KB | ⚠️ |
| **Total Page Weight** | **500 KB** | **918 KB** | ❌ |

---

## Monitoring Tools

1. **Lighthouse CI** — Automated performance testing in CI/CD
2. **WebPageTest** — Real-world speed testing
3. **Chrome DevTools Performance** — Profiling bottlenecks
4. **Supabase Performance Insights** — Database query analysis

---

## Implementation Priority

| Task | Priority | Effort | Impact | Quick Win |
|------|----------|--------|--------|-----------|
| Minify & bundle | High | 2h | High | ✅ |
| Optimize images | High | 1h | High | ✅ |
| Defer JS | High | 30m | High | ✅ |
| Database optimization | High | 2h | High | - |
| Code splitting | Medium | 3h | Medium | - |
| Preload resources | Medium | 30m | Medium | ✅ |
| Third-party reduction | Medium | 1h | Medium | - |
| HTTP/2 push | Low | 1h | Low | - |
| Resource hints | Low | 30m | Low | ✅ |

**Total Effort:** ~12 hours  
**Quick Wins Total:** ~5 hours (minify, images, defer, preload, hints)

---

## Expected Results

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Page Weight | 918 KB | 400 KB | -56% |
| FCP | 1.5s | 0.8s | -47% |
| LCP | 2.5s | 1.8s | -28% |
| TTI | 3.5s | 2.2s | -37% |
| Lighthouse | 85 | 96 | +11 pts |

---

**Research Status:** ✅ Complete  
**Total Sprint Research:** 6/6 topics ✅
