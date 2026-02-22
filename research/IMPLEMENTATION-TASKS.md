# Implementation Tasks — Sprint Research Findings
**Generated:** February 22, 2026  
**Source:** Research sprint (6 topics completed)  
**Total Effort:** ~70 hours (all recommendations)  
**High-Priority:** ~24 hours

---

## Sprint 1: High-Impact Quick Wins (15-18 hours)

### Task 1: Bootstrap Dark Theme Migration
**Priority:** High  
**Effort:** 3 hours  
**Type:** Enhancement  
**Area:** Frontend > Theming

**Description:**
Migrate from custom `data-theme="dark"` to Bootstrap's native `data-bs-theme` attribute for better framework integration and consistency.

**Acceptance Criteria:**
- [ ] Replace all `data-theme` attributes with `data-bs-theme`
- [ ] Update CSS selectors from `[data-theme="dark"]` to `[data-bs-theme="dark"]`
- [ ] Ensure all Bootstrap components respect theme
- [ ] Test theme toggle functionality
- [ ] Verify browser testing on live site (screenshot dashboard + settings)

**Files to Modify:**
- `app/assets/css/design-tokens.css` (selector updates)
- `app/assets/js/theme-toggle.js` (attribute changes)
- All HTML files (attribute replacement)

**References:**
- `research/bootstrap-dark-theme-recommendations.md`
- Bootstrap docs: https://getbootstrap.com/docs/5.3/customize/color-modes/

---

### Task 2: Theme Toggle UI Component
**Priority:** High  
**Effort:** 2 hours  
**Type:** Feature  
**Area:** Frontend > UI Components

**Description:**
Add a theme toggle button with three options: Light / Dark / Auto (system preference).

**Acceptance Criteria:**
- [ ] Create toggle UI in navigation bar
- [ ] Support light/dark/auto modes
- [ ] Persist user choice to localStorage
- [ ] Respect `prefers-color-scheme` media query for auto mode
- [ ] Add smooth transition between themes
- [ ] Test on live site with screenshots

**Implementation:**
```html
<!-- Add to navigation -->
<div class="theme-toggle">
  <button id="theme-toggle-btn" aria-label="Toggle theme">
    <i class="bi bi-sun-fill"></i>
  </button>
</div>
```

**References:**
- `research/bootstrap-dark-theme-recommendations.md` (Section 2)

---

### Task 3: Chart.js Data Decimation
**Priority:** High  
**Effort:** 2 hours  
**Type:** Performance  
**Area:** Frontend > Charts

**Description:**
Implement automatic data decimation for Chart.js datasets with >100 points using LTTB (Largest Triangle Three Buckets) algorithm.

**Acceptance Criteria:**
- [ ] Enable decimation plugin for all time-series charts
- [ ] Configure threshold at 100 data points
- [ ] Use LTTB algorithm for sampling
- [ ] Test with large datasets (1000+ points)
- [ ] Verify performance improvement (should be 3-5x faster rendering)
- [ ] Screenshot before/after performance metrics

**Implementation:**
```javascript
options: {
  plugins: {
    decimation: {
      enabled: true,
      algorithm: 'lttb',
      samples: 100
    }
  }
}
```

**References:**
- `research/chartjs-performance-optimization.md` (Section 1)
- Chart.js decimation docs

---

### Task 4: Progressive Disclosure for Dashboard
**Priority:** High  
**Effort:** 4 hours  
**Type:** UX Enhancement  
**Area:** Frontend > Dashboard

**Description:**
Implement collapsible sections on the dashboard to reduce initial information overload. Show summary cards by default with expand/collapse controls.

**Acceptance Criteria:**
- [ ] Add collapse/expand controls to each dashboard section
- [ ] Persist expanded/collapsed state to localStorage
- [ ] Smooth animations (300ms ease)
- [ ] Keyboard accessible (Enter/Space to toggle)
- [ ] Mobile-optimized touch targets
- [ ] Test on live site with screenshots

**Sections to Target:**
- Assets overview
- Debts summary
- Bills upcoming
- Income sources
- Net worth trend chart

**Implementation Pattern:**
```html
<div class="dashboard-section" data-section="assets">
  <div class="section-header" role="button" tabindex="0">
    <h3>Assets</h3>
    <button class="collapse-toggle" aria-expanded="true">
      <i class="bi bi-chevron-down"></i>
    </button>
  </div>
  <div class="section-content" id="assets-content">
    <!-- Content -->
  </div>
</div>
```

**References:**
- `research/financial-dashboard-ui-patterns.md` (Section 1)

---

### Task 5: Contextual Financial Tooltips
**Priority:** High  
**Effort:** 2 hours  
**Type:** UX Enhancement  
**Area:** Frontend > UI Components

**Description:**
Add tooltips to financial jargon terms (APR, equity, net worth, etc.) to educate users without cluttering the interface.

**Acceptance Criteria:**
- [ ] Create tooltip component (Bootstrap Popover)
- [ ] Add tooltips to 10+ financial terms
- [ ] Mobile-friendly (tap to show, tap outside to dismiss)
- [ ] Keyboard accessible
- [ ] Test on live site

**Terms to Tooltip:**
- Net Worth
- Equity
- APR (Annual Percentage Rate)
- DTI (Debt-to-Income Ratio)
- Emergency Fund
- Liquid Assets
- Compound Interest

**Implementation:**
```html
<span class="financial-term" data-bs-toggle="popover" data-bs-content="Your total assets minus total debts">Net Worth</span>
```

**References:**
- `research/financial-dashboard-ui-patterns.md` (Section 2)

---

### Task 6: CSS Layers Implementation
**Priority:** High  
**Effort:** 4 hours  
**Type:** Architecture  
**Area:** Frontend > CSS

**Description:**
Implement CSS `@layer` directive for better cascade control and to prevent specificity wars.

**Acceptance Criteria:**
- [ ] Define layer order in design-tokens.css
- [ ] Wrap existing CSS in appropriate layers
- [ ] Test cascade priority
- [ ] Verify no visual regressions
- [ ] Document layer usage for future developers

**Layer Structure:**
```css
@layer reset, tokens, base, components, utilities, overrides;

@layer tokens {
  /* Design tokens from design-tokens.css */
}

@layer base {
  /* Typography, forms, basic elements */
}

@layer components {
  /* Cards, buttons, navigation */
}

@layer utilities {
  /* Utility classes */
}
```

**References:**
- `research/css-architecture-recommendations.md` (Section 1)
- MDN CSS Layers: https://developer.mozilla.org/en-US/docs/Web/CSS/@layer

---

### Task 7: Minify & Bundle CSS/JS
**Priority:** High  
**Effort:** 2 hours  
**Type:** Performance  
**Area:** Build > Optimization

**Description:**
Set up build process to bundle and minify CSS/JS files, reducing page weight from 680 KB to ~240 KB.

**Acceptance Criteria:**
- [ ] Install esbuild and cssnano
- [ ] Create build scripts in package.json
- [ ] Generate bundles in `dist/` directory
- [ ] Update HTML to reference bundled files
- [ ] Set up sourcemaps for debugging
- [ ] Verify gzipped sizes (target: CSS <25 KB, JS <50 KB)
- [ ] Test on live site

**Build Scripts:**
```json
{
  "scripts": {
    "build:css": "postcss assets/css/main.css -o dist/css/bundle.min.css --use cssnano",
    "build:js": "esbuild assets/js/app.js --bundle --minify --sourcemap --outfile=dist/js/bundle.min.js",
    "build": "npm run build:css && npm run build:js",
    "watch": "npm run build:css -- --watch & npm run build:js -- --watch"
  }
}
```

**References:**
- `research/performance-optimization-guide.md` (Section 1)

---

### Task 8: Optimize Images (WebP Conversion)
**Priority:** High  
**Effort:** 1 hour  
**Type:** Performance  
**Area:** Assets > Images

**Description:**
Convert PNG icons to WebP format and implement responsive image loading with `<picture>` element. Expected size reduction: -60%.

**Acceptance Criteria:**
- [ ] Convert all PNG icons to WebP
- [ ] Keep PNG as fallback
- [ ] Update HTML to use `<picture>` element
- [ ] Add `loading="lazy"` for below-fold images
- [ ] Verify file sizes reduced
- [ ] Test fallback in older browsers

**Implementation:**
```bash
npm install --save-dev imagemin imagemin-webp
```

```html
<picture>
  <source srcset="assets/img/icons/icon-512x512.webp" type="image/webp">
  <img src="assets/img/icons/icon-512x512.png" alt="Icon" loading="lazy">
</picture>
```

**References:**
- `research/performance-optimization-guide.md` (Section 2)

---

### Task 9: Defer Non-Critical JavaScript
**Priority:** High  
**Effort:** 30 minutes  
**Type:** Performance  
**Area:** Frontend > Loading

**Description:**
Add `defer` attribute to non-critical scripts to improve First Contentful Paint by ~500ms.

**Acceptance Criteria:**
- [ ] Add `defer` to Bootstrap JS
- [ ] Add `defer` to app.js
- [ ] Add `defer` to chart.js
- [ ] Keep critical theme loader inline
- [ ] Verify no functionality breaks
- [ ] Test Lighthouse FCP improvement

**Implementation:**
```html
<!-- Critical (inline) -->
<script>
  const theme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-bs-theme', theme);
</script>

<!-- Defer non-critical -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" defer></script>
<script src="dist/js/bundle.min.js" defer></script>
```

**References:**
- `research/performance-optimization-guide.md` (Section 3)

---

## Sprint 2: User Experience Enhancements (12 hours)

### Task 10: Comparison Views (vs. Last Month)
**Priority:** Medium  
**Effort:** 6 hours  
**Type:** Feature  
**Area:** Frontend > Dashboard

**Description:**
Add comparison indicators showing change vs. previous month for key metrics (net worth, spending, income).

**Acceptance Criteria:**
- [ ] Calculate month-over-month deltas
- [ ] Display percentage change with up/down arrows
- [ ] Color-code: green (positive), red (negative), blue (neutral)
- [ ] Add mini trend sparklines
- [ ] Test with real data
- [ ] Screenshot comparisons on live site

**UI Pattern:**
```
Net Worth: $125,430
↑ +$3,210 (+2.6%) vs. last month
[Mini sparkline showing 6-month trend]
```

**References:**
- `research/financial-dashboard-ui-patterns.md` (Section 3)

---

### Task 11: Chart Lazy Loading
**Priority:** Medium  
**Effort:** 2 hours  
**Type:** Performance  
**Area:** Frontend > Charts

**Description:**
Lazy load Chart.js library and charts using Intersection Observer API. Load charts only when they scroll into viewport.

**Acceptance Criteria:**
- [ ] Wrap charts in Intersection Observer
- [ ] Load Chart.js only when needed
- [ ] Show loading skeleton until chart initializes
- [ ] Test on slow connections
- [ ] Verify page load improvement

**Implementation:**
```javascript
const chartObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadChart(entry.target);
      chartObserver.unobserve(entry.target);
    }
  });
});

document.querySelectorAll('.lazy-chart').forEach(chart => {
  chartObserver.observe(chart);
});
```

**References:**
- `research/chartjs-performance-optimization.md` (Section 3)

---

### Task 12: Critical CSS Per Page
**Priority:** Medium  
**Effort:** 2 hours  
**Type:** Performance  
**Area:** Build > Optimization

**Description:**
Generate and inline critical CSS for each page to improve First Contentful Paint.

**Acceptance Criteria:**
- [ ] Install critical CSS generator
- [ ] Generate critical CSS for each page
- [ ] Inline critical CSS in `<head>`
- [ ] Defer non-critical CSS
- [ ] Test FCP improvement (target: <1.0s)

**Tool:**
```bash
npm install --save-dev critical
```

**References:**
- `research/css-architecture-recommendations.md` (Section 2)

---

### Task 13: Data Density Controls
**Priority:** Medium  
**Effort:** 2 hours  
**Type:** Feature  
**Area:** Frontend > Settings

**Description:**
Add user preference for data density: Compact / Normal / Comfortable (affects spacing, font sizes, table row height).

**Acceptance Criteria:**
- [ ] Add density toggle in Settings
- [ ] Apply density class to body element
- [ ] Define CSS variables for each density level
- [ ] Persist choice to localStorage
- [ ] Test all pages in each density mode

**CSS Variables:**
```css
[data-density="compact"] {
  --row-height: 32px;
  --card-padding: 12px;
}

[data-density="normal"] {
  --row-height: 48px;
  --card-padding: 16px;
}

[data-density="comfortable"] {
  --row-height: 64px;
  --card-padding: 24px;
}
```

**References:**
- `research/financial-dashboard-ui-patterns.md` (Section 5)

---

## Sprint 3: Polish & Advanced Features (14 hours)

### Task 14: Empty States with CTAs
**Priority:** Medium  
**Effort:** 3 hours  
**Type:** UX Enhancement  
**Area:** Frontend > UI Components

**Description:**
Design and implement empty state screens for when users have no data (bills, assets, transactions, etc.).

**Acceptance Criteria:**
- [ ] Create empty state component
- [ ] Add friendly illustrations/icons
- [ ] Include clear CTA buttons ("Add Your First Bill")
- [ ] Provide brief educational text
- [ ] Test on fresh accounts
- [ ] Screenshot all empty states

**Empty States Needed:**
- No bills
- No assets
- No debts
- No transactions
- No income sources
- No snapshots (first-time user)

**References:**
- `research/financial-dashboard-ui-patterns.md` (Section 4)

---

### Task 15: Container Queries for Components
**Priority:** Medium  
**Effort:** 3 hours  
**Type:** Enhancement  
**Area:** Frontend > Responsive Design

**Description:**
Implement CSS Container Queries for dashboard cards so they adapt to their container size, not viewport size.

**Acceptance Criteria:**
- [ ] Define container contexts for dashboard sections
- [ ] Rewrite card responsive styles using @container
- [ ] Test in different layout configurations
- [ ] Verify browser support (fallback for older browsers)

**Implementation:**
```css
.dashboard-section {
  container-type: inline-size;
  container-name: section;
}

@container section (min-width: 400px) {
  .card {
    flex-direction: row;
  }
}
```

**References:**
- `research/css-architecture-recommendations.md` (Section 3)
- MDN: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries

---

### Task 16: Chart Min/Max Bounds
**Priority:** Low  
**Effort:** 1 hour  
**Type:** Performance  
**Area:** Frontend > Charts

**Description:**
Specify min/max values for Y-axis scales in Chart.js to prevent unnecessary recalculations.

**Acceptance Criteria:**
- [ ] Set scale bounds for all charts
- [ ] Test with varying data ranges
- [ ] Verify performance improvement

**Implementation:**
```javascript
options: {
  scales: {
    y: {
      min: 0,
      max: 200000 // Net worth chart
    }
  }
}
```

**References:**
- `research/chartjs-performance-optimization.md` (Section 2)

---

### Task 17: Service Worker Implementation
**Priority:** Medium  
**Effort:** 4 hours  
**Type:** Feature  
**Area:** PWA

**Description:**
Implement service worker for offline support and asset caching. Enable PWA installation.

**Acceptance Criteria:**
- [ ] Create sw.js with caching strategies
- [ ] Register service worker in app.js
- [ ] Create offline.html fallback page
- [ ] Test offline functionality
- [ ] Verify cache updates on new deployments
- [ ] Test install prompt on mobile

**References:**
- `research/pwa-implementation-guide.md`

---

### Task 18: Database Query Optimization
**Priority:** High  
**Effort:** 2 hours  
**Type:** Performance  
**Area:** Backend > Database

**Description:**
Batch Supabase queries into a single RPC call to reduce API roundtrips from 4+ to 1.

**Acceptance Criteria:**
- [ ] Create Supabase RPC function `get_dashboard_data()`
- [ ] Replace sequential queries with single RPC call
- [ ] Measure performance improvement (should be 50%+ faster)
- [ ] Test with real user accounts
- [ ] Document RPC function usage

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

**References:**
- `research/performance-optimization-guide.md` (Section 8)

---

### Task 19: Code Splitting (Lazy Load Routes)
**Priority:** Medium  
**Effort:** 3 hours  
**Type:** Performance  
**Area:** Frontend > Build

**Description:**
Implement route-based code splitting so page-specific JavaScript loads only when needed.

**Acceptance Criteria:**
- [ ] Set up dynamic imports for page modules
- [ ] Split bundle by route
- [ ] Measure initial bundle size reduction (target: -50%)
- [ ] Test all page transitions
- [ ] Verify sourcemaps work

**References:**
- `research/performance-optimization-guide.md` (Section 5)

---

## Summary

**Total Tasks:** 19  
**Total Effort:** ~51 hours

### By Priority
- **High:** 9 tasks (18.5 hours)
- **Medium:** 9 tasks (30.5 hours)
- **Low:** 1 task (1 hour)

### By Sprint
- **Sprint 1 (Week 1):** 9 tasks (18.5 hours) — Quick wins
- **Sprint 2 (Week 2):** 4 tasks (12 hours) — UX enhancements
- **Sprint 3 (Week 3):** 6 tasks (20.5 hours) — Polish & advanced

---

## Next Actions

1. ✅ Research documentation complete
2. ⏭️ Create Azure DevOps work items (use this document as reference)
3. ⏭️ Assign to Builder for Sprint 1 implementation
4. ⏭️ Set up CI/CD for automated testing
5. ⏭️ Schedule Auditor review after each sprint

---

**Generated:** February 22, 2026 4:20 AM  
**Status:** Ready for Azure DevOps import  
**Research Phase:** Complete ✅
