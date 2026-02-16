# CSS Architecture Research — Fireside Capital Dashboard
**Research Sprint:** February 16, 2026  
**Status:** Complete  
**Researcher:** Capital (Orchestrator)

---

## Executive Summary

The Fireside Capital dashboard has a **solid CSS foundation** with design tokens, component-based architecture, and modern patterns. Current structure:

- **12 CSS files** totaling ~230 KB
- Design token system (`design-tokens.css`) defining colors, typography, spacing
- Modular components (accessibility, financial patterns, responsive, utilities)
- Bootstrap 5 base framework
- Dark theme by default

## Current Strengths ✅

1. **Design Token System** — All design decisions centralized in `design-tokens.css`
2. **Component Modularity** — Separate concerns (accessibility, responsive, utilities)
3. **Logo-Native Branding** — Colors match Fireside Cloud 365 logo (Orange, Blue, Green)
4. **Accessibility Built-In** — Dedicated accessibility.css with focus states, ARIA support
5. **Performance-Conscious** — Critical CSS, DNS prefetch, font optimization

## Recommendations for Improvement 🚀

### 1. **Implement CSS Custom Property Fallbacks**
**Priority:** Medium  
**Effort:** 2 hours  
**Impact:** Browser compatibility

**Problem:** Older browsers don't support CSS custom properties.

**Solution:** Add fallback values for critical properties.

```css
/* Before */
.card {
  background-color: var(--color-bg-2);
  border-radius: var(--radius-lg);
}

/* After */
.card {
  background-color: #1a1a1a; /* Fallback */
  background-color: var(--color-bg-2);
  border-radius: 0.75rem; /* Fallback */
  border-radius: var(--radius-lg);
}
```

**Implementation:**
Create a script to auto-inject fallbacks:

```javascript
// scripts/inject-css-fallbacks.js
const fs = require('fs');
const path = require('path');

const tokenMap = {
  '--color-bg-2': '#1a1a1a',
  '--radius-lg': '0.75rem',
  '--space-md': '1rem',
  // Add more mappings from design-tokens.css
};

function injectFallbacks(cssContent) {
  return cssContent.replace(/var\((--[\w-]+)\)/g, (match, varName) => {
    const fallback = tokenMap[varName];
    return fallback ? `${fallback}; ${match}` : match;
  });
}

// Process all CSS files in assets/css/
const cssDir = path.join(__dirname, '../app/assets/css');
fs.readdirSync(cssDir).forEach(file => {
  if (file.endsWith('.css') && file !== 'design-tokens.css') {
    const filePath = path.join(cssDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const processed = injectFallbacks(content);
    fs.writeFileSync(filePath, processed);
  }
});
```

---

### 2. **Introduce CSS Layers (@layer) for Cascade Control**
**Priority:** High  
**Effort:** 4 hours  
**Impact:** Maintainability, specificity wars prevention

**Problem:** Global CSS can create specificity conflicts. Bootstrap overrides can be fragile.

**Solution:** Use `@layer` to define explicit cascade order.

```css
/* design-tokens.css — Add at the top */
@layer tokens, bootstrap-overrides, components, utilities, states;

/* Then in each file: */

/* components.css */
@layer components {
  .card-financial {
    background: var(--color-bg-2);
    border-radius: var(--radius-lg);
  }
}

/* utilities.css */
@layer utilities {
  .text-balance { text-wrap: balance; }
}

/* bootstrap-overrides.css (NEW FILE) */
@layer bootstrap-overrides {
  .btn-primary {
    background-color: var(--color-primary);
    border-color: var(--color-primary);
  }
}
```

**File structure after refactor:**
```
assets/css/
├── design-tokens.css         [Layer: tokens]
├── bootstrap-overrides.css   [Layer: bootstrap-overrides] NEW
├── components.css            [Layer: components]
├── financial-patterns.css    [Layer: components]
├── utilities.css             [Layer: utilities]
├── accessibility.css         [Layer: utilities]
├── responsive.css            [Unlayered - media queries]
```

**Implementation Task:**
1. Create `bootstrap-overrides.css` with all Bootstrap customizations
2. Wrap existing CSS rules in appropriate `@layer` blocks
3. Update `index.html` to load in correct order

---

### 3. **Implement Container Queries for Responsive Components**
**Priority:** Medium  
**Effort:** 3 hours  
**Impact:** Better component responsiveness

**Problem:** Media queries are viewport-based, not component-based. A narrow sidebar card should respond differently than a full-width card.

**Solution:** Use CSS Container Queries (`@container`) for intrinsic responsiveness.

```css
/* financial-patterns.css */

/* Define containers */
.card-financial-container {
  container-type: inline-size;
  container-name: financial-card;
}

/* Component responds to its container, not viewport */
@container financial-card (max-width: 400px) {
  .card-financial .metric-value {
    font-size: var(--text-h3); /* Smaller in narrow containers */
  }
  
  .card-financial .metric-label {
    display: none; /* Hide labels when cramped */
  }
}

@container financial-card (min-width: 600px) {
  .card-financial {
    display: grid;
    grid-template-columns: 1fr 1fr; /* Two-column layout when wide */
  }
}
```

**Usage in HTML:**
```html
<div class="card-financial-container">
  <div class="card card-financial">
    <span class="metric-value">$125,432</span>
    <span class="metric-label">Net Worth</span>
  </div>
</div>
```

**Browser Support:** Chrome/Edge 105+, Safari 16+, Firefox 110+. (Add `@supports` check for graceful degradation.)

---

### 4. **Create Critical CSS Per Page**
**Priority:** High  
**Effort:** 2 hours  
**Impact:** Performance (FCP, LCP)

**Problem:** All pages load the same `critical.css` — but each page needs different above-the-fold styles.

**Solution:** Generate page-specific critical CSS.

**Implementation:**
```bash
# Install critical CSS tool
npm install --save-dev critical

# Create script: scripts/generate-critical-css.js
```

```javascript
// scripts/generate-critical-css.js
const critical = require('critical');
const fs = require('fs');

const pages = [
  { url: 'index.html', output: 'assets/css/critical-dashboard.css' },
  { url: 'assets.html', output: 'assets/css/critical-assets.css' },
  { url: 'bills.html', output: 'assets/css/critical-bills.css' },
  { url: 'budget.html', output: 'assets/css/critical-budget.css' },
  // Add other pages
];

pages.forEach(async ({ url, output }) => {
  await critical.generate({
    base: 'app/',
    src: url,
    target: output,
    width: 1300,
    height: 900,
    inline: false,
    extract: true,
    minify: true,
  });
  console.log(`✅ Generated ${output}`);
});
```

**Then update each HTML file:**
```html
<!-- index.html -->
<link rel="stylesheet" href="assets/css/critical-dashboard.css" />

<!-- assets.html -->
<link rel="stylesheet" href="assets/css/critical-assets.css" />
```

---

### 5. **Add CSS Logical Properties for Internationalization**
**Priority:** Low  
**Effort:** 2 hours  
**Impact:** Future-proofing for RTL support

**Problem:** Hard-coded `left`, `right`, `margin-left` won't work for RTL languages.

**Solution:** Use logical properties.

```css
/* Before */
.sidebar {
  margin-right: 1rem;
  padding-left: 1.5rem;
  border-left: 2px solid var(--color-border-default);
}

/* After */
.sidebar {
  margin-inline-end: 1rem;      /* margin-right in LTR, margin-left in RTL */
  padding-inline-start: 1.5rem; /* padding-left in LTR, padding-right in RTL */
  border-inline-start: 2px solid var(--color-border-default);
}
```

**Full mapping:**
| Physical | Logical |
|----------|---------|
| `margin-left` | `margin-inline-start` |
| `margin-right` | `margin-inline-end` |
| `padding-top` | `padding-block-start` |
| `padding-bottom` | `padding-block-end` |
| `border-left` | `border-inline-start` |
| `text-align: left` | `text-align: start` |

---

### 6. **Optimize Font Loading with font-display**
**Priority:** Medium  
**Effort:** 1 hour  
**Impact:** Performance (CLS reduction)

**Problem:** Fonts block rendering, causing Cumulative Layout Shift (CLS).

**Current:**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,600;1,8..60,400&display=swap" rel="stylesheet">
```

**Recommendation:** Use `font-display: optional` for body text, `swap` for headings.

```css
/* design-tokens.css */
@font-face {
  font-family: 'Inter';
  src: url('https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2') format('woff2');
  font-weight: 600;
  font-style: normal;
  font-display: optional; /* Fallback to system font if not loaded in 100ms */
}

@font-face {
  font-family: 'Source Serif 4';
  src: url('https://fonts.gstatic.com/s/sourceserif4/v7/vEFy2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6OAVIJmeUDygwjipdqrhxXD-wGvjU.woff2') format('woff2');
  font-weight: 600;
  font-style: normal;
  font-display: swap; /* Show fallback, then swap when loaded */
}
```

**Better:** Self-host fonts for faster delivery and full control.

---

## Implementation Priority

| Task | Priority | Effort | Impact | Assigned To |
|------|----------|--------|--------|-------------|
| CSS Layers (@layer) | High | 4h | Maintainability | Builder |
| Critical CSS per page | High | 2h | Performance | Builder |
| Container queries | Medium | 3h | Responsiveness | Builder |
| Font loading optimization | Medium | 1h | Performance | Builder |
| Custom property fallbacks | Medium | 2h | Compatibility | Builder |
| Logical properties | Low | 2h | Future-proofing | Builder |

---

## Next Steps

1. **Create Azure DevOps work items** for each recommendation
2. **Builder** to implement CSS Layers first (foundation for other improvements)
3. **Auditor** to verify no regressions after each change
4. **Test on live site** with browser automation (see `docs/browser-testing-guide.md`)

---

## References

- [MDN: CSS Cascade Layers](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)
- [MDN: CSS Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries)
- [Web.dev: Critical CSS](https://web.dev/extract-critical-css/)
- [MDN: CSS Logical Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties)

---

**Research Status:** ✅ Complete  
**Next Research Topic:** Financial Dashboard UI Patterns
