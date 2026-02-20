# Azure DevOps Work Items — Performance Optimization
**Created:** February 20, 2026  
**Project:** Fireside Capital  
**Area:** Performance → Implementation

---

## Work Item 1: Extract and Inline Critical CSS

**Type:** Task  
**Priority:** High  
**Effort:** 3 hours  
**Sprint:** Sprint 1  
**Assigned To:** Builder

### Description
Extract above-the-fold CSS and inline it in `<head>` to improve First Contentful Paint (FCP). Defer non-critical CSS loading.

### Acceptance Criteria
- [ ] Install `critical` npm package
- [ ] Create `scripts/extract-critical-css.js` automation script
- [ ] Extract critical CSS for: dashboard.html, assets.html, bills.html, budget.html
- [ ] Inline critical CSS in `<head>` of each page
- [ ] Defer non-critical CSS with `<link rel="preload" as="style" onload="...">`
- [ ] Add `<noscript>` fallback for no-JS scenarios
- [ ] Test page rendering (no flash of unstyled content)
- [ ] Run Lighthouse audit: target FCP < 1.5s

### Implementation Notes
```html
<head>
  <style>/* Critical CSS inlined */</style>
  <link rel="preload" href="assets/css/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="assets/css/main.css"></noscript>
</head>
```

### Related Research
`reports/performance-optimization-research.md` — Section: "Strategy 1: Critical CSS Extraction"

---

## Work Item 2: Implement Lazy Chart Loading

**Type:** Task  
**Priority:** High  
**Effort:** 2 hours  
**Sprint:** Sprint 1  
**Assigned To:** Builder

### Description
Use Intersection Observer to lazy-load Chart.js charts only when they enter the viewport. Improves Time to Interactive (TTI).

### Acceptance Criteria
- [ ] Create `assets/js/lazy-charts.js` module
- [ ] Implement `registerLazyChart()` and `initLazyCharts()` functions
- [ ] Update `charts.js` to use lazy loading instead of immediate rendering
- [ ] Test charts render when scrolled into view
- [ ] Add 100px rootMargin for preloading before visible
- [ ] Verify charts don't re-render on subsequent scrolls
- [ ] Run Lighthouse audit: target TTI < 3.5s

### Implementation Notes
```javascript
registerLazyChart('chart-net-worth', () => createNetWorthChart('chart-net-worth'));
initLazyCharts();
```

### Related Research
`reports/performance-optimization-research.md` — Section: "Strategy 2: Lazy-Load Charts"

---

## Work Item 3: Debounce Search and Filter Operations

**Type:** Task  
**Priority:** Medium  
**Effort:** 1 hour  
**Sprint:** Sprint 1  
**Assigned To:** Builder

### Description
Add debouncing to search inputs and throttling to scroll events to reduce unnecessary re-renders and improve responsiveness.

### Acceptance Criteria
- [ ] Create `assets/js/debounce.js` with `debounce()` and `throttle()` utilities
- [ ] Apply debounce (300ms) to transaction search input
- [ ] Apply throttle (100ms) to scroll event for sticky navbar
- [ ] Test: search waits 300ms after user stops typing
- [ ] Test: navbar updates max once per 100ms during scroll
- [ ] Measure input lag reduction (before/after)

### Implementation Notes
```javascript
const searchTransactions = debounce((query) => {
  renderTransactionList(filteredTransactions);
}, 300);

searchInput.addEventListener('input', (e) => searchTransactions(e.target.value));
```

### Related Research
`reports/performance-optimization-research.md` — Section: "Strategy 3: Debounce Expensive Operations"

---

## Work Item 4: Optimize Script Loading with Defer/Async

**Type:** Task  
**Priority:** High  
**Effort:** 1 hour  
**Sprint:** Sprint 1  
**Assigned To:** Builder

### Description
Add `defer` to critical scripts and `async` to non-critical scripts to reduce Total Blocking Time (TBT).

### Acceptance Criteria
- [ ] Add `defer` to `app.js` (execute after DOM ready)
- [ ] Add `async` to Chart.js CDN script (load in background)
- [ ] Add `async` to Bootstrap JS CDN script
- [ ] Move all `<script>` tags to end of `<body>` (if not already)
- [ ] Test: page renders before scripts execute
- [ ] Run Lighthouse audit: target TBT < 300ms

### Implementation Notes
```html
<script src="assets/js/app.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js" async></script>
```

### Related Research
`reports/performance-optimization-research.md` — Section: "Strategy 4: Code Splitting & Lazy Loading JS"

---

## Work Item 5: Add Preconnect/DNS-Prefetch Hints

**Type:** Task  
**Priority:** Medium  
**Effort:** 30 minutes  
**Sprint:** Sprint 1  
**Assigned To:** Builder

### Description
Add `<link rel="preconnect">` and `<link rel="dns-prefetch">` hints to reduce DNS lookup and TLS handshake latency for CDNs.

### Acceptance Criteria
- [ ] Add preconnect to: cdn.jsdelivr.net, Supabase URL
- [ ] Add dns-prefetch to: fonts.googleapis.com
- [ ] Preload critical fonts (Inter-Regular.woff2, SourceSerif4-SemiBold.woff2)
- [ ] Test: network waterfall shows earlier CDN connections
- [ ] Measure TTFB reduction (before/after)

### Implementation Notes
```html
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="preconnect" href="https://qqtiofdqplwycnwplmen.supabase.co" crossorigin>
<link rel="dns-prefetch" href="https://fonts.googleapis.com">
```

### Related Research
`reports/performance-optimization-research.md` — Section: "Strategy 7: Prefetch/Preconnect Critical Resources"

---

## Work Item 6: Run PurgeCSS to Remove Unused Bootstrap Styles

**Type:** Task  
**Priority:** Medium  
**Effort:** 2 hours  
**Sprint:** Sprint 2  
**Assigned To:** Builder

### Description
Use PurgeCSS to remove unused CSS classes from Bootstrap and custom stylesheets, reducing file size by ~85%.

### Acceptance Criteria
- [ ] Install `@fullhuman/postcss-purgecss` npm package
- [ ] Create `purgecss.config.js` configuration
- [ ] Scan all HTML and JS files for used classes
- [ ] Add safelist for dynamic classes (show, active, modal-open, etc.)
- [ ] Generate optimized CSS in `assets/css/optimized/`
- [ ] Update HTML to reference optimized CSS
- [ ] Test: no visual regressions on all pages
- [ ] Measure CSS size reduction (before/after)

### Implementation Notes
**Before**: Bootstrap CSS ~200KB  
**After**: Optimized CSS ~30KB (85% reduction)

### Related Research
`reports/performance-optimization-research.md` — Section: "Strategy 6: Reduce CSS Bloat (PurgeCSS)"

---

## Work Item 7: Optimize Images (Convert to WebP)

**Type:** Task  
**Priority:** Medium  
**Effort:** 2 hours  
**Sprint:** Sprint 2  
**Assigned To:** Builder

### Description
Convert PNG/JPG images to WebP format and implement responsive images with `<picture>` element.

### Acceptance Criteria
- [ ] Audit all images in `assets/images/` directory
- [ ] Convert images to WebP format (ImageMagick or online tool)
- [ ] Implement `<picture>` element with WebP + fallback
- [ ] Add `loading="lazy"` to below-the-fold images
- [ ] Add `width` and `height` attributes to prevent CLS
- [ ] Test: images load correctly on Chrome, Safari, Firefox
- [ ] Measure image payload reduction (before/after)

### Implementation Notes
```html
<picture>
  <source srcset="dashboard.webp" type="image/webp">
  <img src="dashboard.png" alt="Dashboard" loading="lazy" width="1200" height="800">
</picture>
```

**Target**: 40-70% image size reduction

### Related Research
`reports/performance-optimization-research.md` — Section: "Strategy 5: Image Optimization"

---

## Work Item 8: Implement Virtual Scrolling for Transaction List

**Type:** Task  
**Priority:** Low  
**Effort:** 4 hours  
**Sprint:** Sprint 3  
**Assigned To:** Builder

### Description
Implement virtual scrolling (windowing) for long transaction lists to render only visible rows, improving performance with 1,000+ items.

### Acceptance Criteria
- [ ] Create custom virtual scroller or use `virtual-scroller` library
- [ ] Apply to transaction list on Dashboard/Reports pages
- [ ] Set fixed item height (60px per row)
- [ ] Render only visible rows + buffer (10 rows above/below)
- [ ] Test with 1,000+ transactions (performance should remain smooth)
- [ ] Test scrolling on mobile devices (no jank)
- [ ] Add loading indicator when scrolling fast

### Implementation Notes
**Without Virtual Scrolling**: 1,000 rows = 60,000px container, all rendered  
**With Virtual Scrolling**: Only ~20 rows rendered at a time

**Target**: Handle 10,000+ items without UI lag

### Related Research
`reports/performance-optimization-research.md` — Section: "Strategy 8: Virtual Scrolling for Long Lists"

---

## Work Item 9: Create Web Worker for Budget Calculations

**Type:** Task  
**Priority:** Low  
**Effort:** 3 hours  
**Sprint:** Sprint 3  
**Assigned To:** Builder

### Description
Offload heavy budget projection calculations to a Web Worker (background thread) to keep UI responsive.

### Acceptance Criteria
- [ ] Create `assets/js/workers/budget-calculator.worker.js`
- [ ] Implement `calculate-projection` message handler
- [ ] Move budget projection logic from `app.js` to worker
- [ ] Update `app.js` to send calculation requests to worker
- [ ] Test: UI remains responsive during 12-month projection calculation
- [ ] Test: worker returns results < 500ms
- [ ] Add fallback for browsers without Web Worker support

### Implementation Notes
```javascript
const worker = new Worker('assets/js/workers/budget-calculator.worker.js');
worker.postMessage({ type: 'calculate-projection', data: { income: 8000, months: 12 } });
worker.addEventListener('message', (e) => renderProjection(e.data.projection));
```

### Related Research
`reports/performance-optimization-research.md` — Section: "Strategy 9: Web Workers for Heavy Calculations"

---

## Work Item 10: Establish Performance Budget & CI Checks

**Type:** Task  
**Priority:** Medium  
**Effort:** 2 hours  
**Sprint:** Sprint 3  
**Assigned To:** Builder + PM

### Description
Define performance budgets (max file sizes) and add Lighthouse CI to fail builds that exceed limits.

### Acceptance Criteria
- [ ] Define performance budget:
  - Total page: < 1 MB
  - JavaScript: < 300 KB
  - CSS: < 50 KB
  - Images: < 200 KB
- [ ] Create `budget.json` file
- [ ] Add Lighthouse CI to GitHub Actions workflow
- [ ] Configure CI to fail if Lighthouse performance score < 90
- [ ] Add performance badge to README
- [ ] Document performance testing process in `/docs`

### Implementation Notes
**GitHub Actions** (`.github/workflows/lighthouse-ci.yml`):
```yaml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install -g @lhci/cli
      - run: lhci autorun --config=lighthouserc.json
```

### Related Research
`reports/performance-optimization-research.md` — Section: "Performance Budget"

---

## Quick Wins Checklist (2 hours, 50% improvement)

**Implement these first** for maximum impact with minimal effort:

- [ ] Work Item 4: Defer non-critical scripts (1 hour)
- [ ] Work Item 5: Add preconnect hints (30 min)
- [ ] Work Item 3: Debounce search input (15 min)
- [ ] Work Item 1: Inline critical CSS (partial — just dashboard.html, 15 min)

**Total Time**: 2 hours  
**Expected Improvement**: ~50% faster load time

---

## How to Create These Work Items in Azure DevOps

### Manual Creation (Azure DevOps Web UI)
1. Navigate to: https://dev.azure.com/fireside365/Fireside%20Capital/_workitems
2. Click **New Work Item** → **Task**
3. Copy title, description, and acceptance criteria from above
4. Set fields:
   - **Assigned To:** Builder (or team member)
   - **Priority:** As specified
   - **Original Estimate:** As specified (in hours)
   - **Iteration:** Appropriate sprint
   - **Area Path:** Performance
   - **Tags:** performance, optimization, frontend, research

---

**Status:** Ready for manual creation in Azure DevOps  
**Total Effort:** 20.5 hours across 10 tasks  
**Expected Completion:** Sprint 3 (if starting now)  
**Quick Wins**: 2 hours for 50% improvement
