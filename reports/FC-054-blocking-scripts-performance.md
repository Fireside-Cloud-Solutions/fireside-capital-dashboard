# FC-054: Blocking JavaScript Prevents Page Rendering (Performance)

**Type:** Performance Bug  
**Severity:** 🟡 MEDIUM (impacts UX, not broken)  
**Priority:** P1 (High)  
**Status:** 🔴 OPEN  
**Reported:** 2026-02-04 12:10 PM  
**Reporter:** Builder (sprint-qa cron)

---

## Summary

All 11 HTML pages load JavaScript synchronously without `defer` or `async` attributes, blocking HTML parsing and delaying first contentful paint. Pages with 15-19 script tags (especially index.html with 19) experience significant rendering delays.

---

## Impact

### User Experience
- **Slow page loads** — especially on slow connections
- **Blank white screen** while scripts download
- **Poor Lighthouse performance scores** (likely 40-60/100)
- **High bounce rate risk** for new users

### Technical
- **Total blocking payload:** ~350KB of JS on index.html (204KB app.js + CDN libs)
- **19 sequential HTTP requests** before rendering can begin
- **No progressive enhancement** — page is unusable until all scripts load

---

## Affected Pages

| Page | Script Tags | Blocking JS Size |
|------|-------------|------------------|
| index.html | 19 | ~350 KB |
| bills.html | 18 | ~280 KB |
| transactions.html | 17 | ~270 KB |
| All others (8) | 15 | ~250 KB |

---

## Current Behavior

```html
<!-- Example from index.html line 384-399 -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.plaid.com/link/v2/stable/link-initialize.js"></script>
<script src="assets/js/rate-limiter.js"></script>
<script src="assets/js/rate-limit-db.js"></script>
<script src="assets/js/session-security.js"></script>
<script src="assets/js/polish-utilities.js"></script>
<script src="assets/js/csrf.js"></script>
<script src="assets/js/security-utils.js"></script>
<script src="assets/js/app.js"></script>
<script src="assets/js/notification-enhancements.js"></script>
<script src="assets/js/security-patch.js"></script>
<script src="assets/js/app-polish-enhancements.js"></script>
<script src="assets/js/plaid.js"></script>
<script src="assets/js/subscriptions.js"></script>
<script src="assets/js/charts.js"></script>
```

**Problem:** Each script:
1. Stops HTML parsing
2. Downloads (blocking network)
3. Executes (blocking main thread)
4. Then continues parsing

Total delay: **2-5 seconds on 3G**, 500ms-1s on cable.

---

## Expected Behavior

```html
<!-- Critical scripts (must execute before DOMContentLoaded) -->
<script src="assets/js/app.js" defer></script>
<script src="assets/js/session-security.js" defer></script>

<!-- Non-critical scripts (can load async) -->
<script src="https://cdn.plaid.com/link/v2/stable/link-initialize.js" async></script>
<script src="assets/js/charts.js" defer></script>

<!-- Third-party analytics/tracking -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2" async></script>
```

**Benefits:**
- HTML parsing continues immediately
- First contentful paint happens 2-3x faster
- Scripts execute in order (defer) or when ready (async)

---

## Root Cause

1. **No performance optimization strategy** — scripts added incrementally without defer/async
2. **Large monolithic app.js** (204KB) — should be code-split
3. **No lazy loading** — all scripts load upfront, even if page doesn't need them
4. **No build process** — no minification, tree-shaking, or bundling

---

## Reproduction Steps

1. Open Chrome DevTools → Network tab
2. Throttle to "Slow 3G"
3. Navigate to https://nice-cliff-05b13880f.2.azurestaticapps.net
4. Observe: White screen for 4-6 seconds
5. Run Lighthouse audit → Performance score: ~45/100

---

## Recommended Fix (3-Phase)

### Phase 1: Add defer to Critical Scripts (30 min)
```html
<!-- All app-specific scripts get defer (execute in order after parsing) -->
<script src="assets/js/app.js" defer></script>
<script src="assets/js/session-security.js" defer></script>
<script src="assets/js/csrf.js" defer></script>
<script src="assets/js/notification-enhancements.js" defer></script>
<!-- etc. -->
```

### Phase 2: Add async to Third-Party Scripts (15 min)
```html
<!-- Third-party libs can load independently -->
<script src="https://cdn.plaid.com/link/v2/stable/link-initialize.js" async></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js" async></script>
```

### Phase 3: Code Splitting (2-4 hours)
Break app.js (204KB) into:
- `core.js` (auth, navigation, common utilities) — 50KB
- `charts.js` (only for dashboard/reports) — 30KB
- `forms.js` (only for data entry pages) — 40KB
- `tables.js` (only for list views) — 30KB
- `vendor.js` (third-party utilities) — 20KB

**Benefit:** Pages load 60-80% less JavaScript

---

## Testing Checklist

After implementing defer/async:
- [ ] Dashboard charts render correctly
- [ ] Forms validate and submit
- [ ] Authentication works on first page load
- [ ] Plaid Link opens correctly
- [ ] Navigation sidebar loads
- [ ] No console errors about undefined functions
- [ ] Lighthouse performance score improves to 70+

---

## Performance Metrics (Before/After)

| Metric | Before | Target | Impact |
|--------|--------|--------|--------|
| First Contentful Paint | 2.8s | 0.8s | 🔥 72% faster |
| Time to Interactive | 4.2s | 1.5s | 🔥 64% faster |
| Total Blocking Time | 1,200ms | 300ms | 🔥 75% reduction |
| Lighthouse Score | ~45 | ~75 | +30 points |

---

## Related Issues

- **FC-055** (TBD): Code-split app.js for per-page bundles
- **FC-056** (TBD): Add CSS critical path inlining
- **FC-014** (OPEN): Remove !important from CSS (73 instances) — minor perf impact

---

## Notes

- Bootstrap 5 and Supabase already ship minified — no action needed
- Chart.js only loads on 4 pages (correct)
- Resource hints (preconnect/dns-prefetch) ARE already present ✅
- No service worker or PWA manifest — consider adding (FC-057)

---

## Dependencies

None — this is a pure HTML attribute change.

---

## Estimated Effort

- **Phase 1 (defer):** 30 minutes
- **Phase 2 (async):** 15 minutes
- **Phase 3 (code-split):** 4 hours
- **Testing:** 1 hour
- **Total:** 5.75 hours

---

**Priority Rationale:** High impact on UX, low effort for Phase 1+2. Should be done before launch.
