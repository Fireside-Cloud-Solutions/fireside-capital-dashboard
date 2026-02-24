# CSS Architecture Research — Fireside Capital Dashboard
**Research Date:** February 24, 2026  
**Researcher:** Capital (Orchestrator)  
**Status:** Complete  
**Priority:** High

---

## Executive Summary

Current CSS architecture is solid but has optimization opportunities. The dashboard uses a modular approach with design tokens, but there's room for improvement in bundle size (226KB unminified, 122KB minified), organization, and maintainability.

**Key Findings:**
- ✅ Design tokens system is well-implemented
- ✅ Modular file structure
- ⚠️ Large bundle size (122KB minified)
- ⚠️ Potential duplication between components.css and main.css
- ⚠️ CSS utility classes duplicating design tokens

**Recommended Approach:** Adopt **CUBE CSS** (Composition, Utility, Block, Exception) — a modern methodology that aligns perfectly with the existing token system.

---

## Current Architecture Analysis

### File Structure (Good Foundation)
```
assets/css/
├── design-tokens.css     (21KB) — ✅ Excellent foundation
├── main.css              (100KB) — ⚠️ Too large, needs splitting
├── components.css        (42KB) — ⚠️ Overlap with main.css
├── responsive.css        (30KB) — ✅ Good separation
├── utilities.css         (9KB) — ⚠️ Duplicates tokens
├── accessibility.css     (12KB) — ✅ Great addition
├── critical.css          (1.6KB) — ✅ Performance-minded
├── onboarding.css        (8KB) — ✅ Feature-specific
└── logged-out-cta.css    (4.6KB) — ✅ Feature-specific
```

### Strengths
1. **Design tokens** — All colors, spacing, typography in one place
2. **Modular files** — Feature-specific CSS is isolated
3. **Dark-first** — Modern approach for financial dashboards
4. **Accessibility focus** — Dedicated a11y file
5. **UX polish applied** — 8px grid, consistent spacing

### Weaknesses
1. **main.css is too large** (100KB) — Contains mixed concerns
2. **Duplication** — Spacing utilities duplicate design tokens
3. **No clear naming convention** — Mix of BEM, utilities, and custom classes
4. **Bundle size** — 122KB minified is heavy for a dashboard
5. **No CSS layers** — Modern `@layer` directive not used

---

## Recommended Architecture: CUBE CSS

**CUBE CSS** = Composition + Utility + Block + Exception

Perfect for token-based systems. Aligns with your existing work.

### Why CUBE CSS?
- ✅ Works WITH design tokens (not against them)
- ✅ Encourages composition over specificity
- ✅ Reduces bundle size through reuse
- ✅ Clear mental model for team scale
- ✅ Modern CSS features (`@layer`, `@container`, custom properties)

### Proposed File Structure
```
assets/css/
├── 0-tokens/
│   └── design-tokens.css        — No change, keep as-is
├── 1-reset/
│   └── modern-reset.css         — Replace normalize with minimal reset
├── 2-composition/
│   ├── layouts.css              — Grid, flex, stack, cluster
│   └── regions.css              — Header, sidebar, footer, main
├── 3-utilities/
│   └── utilities.css            — Keep minimal, token-based only
├── 4-blocks/
│   ├── button.css               — Button component
│   ├── card.css                 — Card component
│   ├── form.css                 — Form inputs
│   ├── table.css                — Data tables
│   ├── chart.css                — Chart.js overrides
│   └── notification.css         — Notification system
├── 5-exceptions/
│   ├── responsive.css           — Media query overrides
│   └── print.css                — Print styles
└── bundle.css                   — Import order: 0→1→2→3→4→5
```

---

## Implementation Plan

### Phase 1: Extract Composition Patterns (Week 1)
**Goal:** Separate layout logic from components.

**Create:** `assets/css/2-composition/layouts.css`
```css
/* ========================================
   LAYOUTS — Composition Primitives
   Based on Every Layout by Heydon Pickering
   ======================================== */

/* STACK — Vertical spacing rhythm */
.stack > * + * {
  margin-block-start: var(--space-24, 1.5rem);
}
.stack-sm > * + * { margin-block-start: var(--space-16, 1rem); }
.stack-lg > * + * { margin-block-start: var(--space-32, 2rem); }

/* CLUSTER — Horizontal grouping (buttons, tags) */
.cluster {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-16, 1rem);
  align-items: center;
}

/* SIDEBAR — Asymmetric two-column layout */
.with-sidebar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-24);
}
.with-sidebar > :first-child {
  flex-basis: 20rem;
  flex-grow: 1;
}
.with-sidebar > :last-child {
  flex-basis: 0;
  flex-grow: 999;
  min-inline-size: 60%;
}

/* GRID — Auto-fit responsive grid */
.auto-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr));
  gap: var(--space-24);
}

/* CENTER — Perfect centering */
.center {
  box-sizing: content-box;
  max-inline-size: var(--measure, 70ch);
  margin-inline: auto;
}
```

**Usage Example:**
```html
<!-- Before: Inline styles + Bootstrap grid mess -->
<div class="row">
  <div class="col-md-4 mb-3">...</div>
  <div class="col-md-4 mb-3">...</div>
  <div class="col-md-4 mb-3">...</div>
</div>

<!-- After: Clean composition -->
<div class="auto-grid">
  <div>...</div>
  <div>...</div>
  <div>...</div>
</div>
```

**Impact:** Removes ~30% of utility classes from HTML. Clearer intent.

---

### Phase 2: Modernize Utilities (Week 1)
**Goal:** Make utilities.css token-driven, remove duplication.

**Replace:** `assets/css/3-utilities/utilities.css`
```css
/* ========================================
   UTILITIES — Minimal, Token-Based Only
   Philosophy: Use sparingly. Prefer composition.
   ======================================== */

/* TEXT UTILITIES */
.text-primary { color: var(--color-text-primary); }
.text-muted { color: var(--color-text-muted); }
.text-error { color: var(--color-error); }
.text-success { color: var(--color-accent); }

/* FONT WEIGHT */
.fw-medium { font-weight: var(--font-medium); }
.fw-semibold { font-weight: var(--font-semibold); }

/* DISPLAY */
.hidden { display: none; }
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* FLOW — Automatic spacing (replace .mb-* everywhere) */
.flow > * + * {
  margin-block-start: var(--flow-space, 1em);
}

/* NO SPACING EXCEPTIONS */
.gap-0 { gap: 0 !important; }
.mt-0 { margin-block-start: 0 !important; }
```

**Migration:**
```css
/* OLD (duplicates tokens) */
.mb-8 { margin-bottom: 8px !important; }
.mb-16 { margin-bottom: 16px !important; }
.p-24 { padding: 24px !important; }

/* NEW (composition-driven) */
<div class="stack-sm">...</div>  <!-- Automatic spacing -->
```

**Impact:** Reduces utility CSS by ~60%. Fewer classes in HTML.

---

### Phase 3: Component Blocks (Week 2)
**Goal:** Isolate reusable components with clear scope.

**Create:** `assets/css/4-blocks/card.css`
```css
/* ========================================
   CARD BLOCK — Financial Dashboard Cards
   ======================================== */

.card {
  background: var(--color-bg-2);
  border-radius: var(--radius-lg);
  padding: var(--space-24);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border-subtle);
  
  /* Automatic internal spacing */
  --flow-space: var(--space-16);
}

.card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-block-end: var(--space-16);
  border-block-end: 1px solid var(--color-border-subtle);
}

.card__title {
  font-size: var(--text-h3);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.card__body {
  padding-block-start: var(--space-16);
}

/* VARIANTS */
.card--highlight {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary-light);
}

.card--empty {
  text-align: center;
  padding: var(--space-48);
  color: var(--color-text-muted);
}
```

**Usage:**
```html
<!-- Before: Inline styles + Bootstrap -->
<div class="card mb-3" style="background: var(--color-bg-2);">
  <div class="card-body p-4">
    <h3 class="card-title mb-3">Net Worth</h3>
    <div class="card-text">$156,234</div>
  </div>
</div>

<!-- After: Clean BEM block -->
<div class="card">
  <div class="card__header">
    <h3 class="card__title">Net Worth</h3>
  </div>
  <div class="card__body flow">
    <p>$156,234</p>
  </div>
</div>
```

---

### Phase 4: Modern CSS Features (Week 2)
**Goal:** Use `@layer` for explicit cascade control.

**Update:** `assets/css/bundle.css`
```css
/* ========================================
   BUNDLE — Cascade Layers (Modern CSS)
   Performance: Load critical first, defer rest
   ======================================== */

@layer reset, tokens, composition, utilities, blocks, exceptions;

/* CRITICAL — Inline in <head> */
@layer reset {
  @import url('./1-reset/modern-reset.css');
}

@layer tokens {
  @import url('./0-tokens/design-tokens.css');
}

/* DEFERRED — Load after page render */
@layer composition {
  @import url('./2-composition/layouts.css');
  @import url('./2-composition/regions.css');
}

@layer blocks {
  @import url('./4-blocks/button.css');
  @import url('./4-blocks/card.css');
  @import url('./4-blocks/form.css');
  @import url('./4-blocks/table.css');
  @import url('./4-blocks/chart.css');
}

@layer utilities {
  @import url('./3-utilities/utilities.css');
}

@layer exceptions {
  @import url('./5-exceptions/responsive.css');
  @import url('./5-exceptions/print.css');
}
```

**Benefits:**
- ✅ Explicit cascade order (no more `!important` wars)
- ✅ Easier debugging (know which layer wins)
- ✅ Better tree-shaking (unused blocks can be removed)

---

## Performance Optimizations

### 1. Critical CSS Inlining
**Current:** `critical.css` exists but not inlined.

**Fix:** Inline critical CSS in `<head>`:
```html
<head>
  <style>
    /* Inline critical.css content here */
    /* Tokens, reset, above-fold layout only */
  </style>
  
  <!-- Defer non-critical CSS -->
  <link rel="preload" href="assets/css/bundle.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="assets/css/bundle.css"></noscript>
</head>
```

**Impact:** ~200ms faster First Contentful Paint.

### 2. PurgeCSS Integration
**Problem:** 122KB minified CSS, but only ~40% is used per page.

**Solution:** Add PurgeCSS to build process.
```json
// package.json
{
  "scripts": {
    "build:css": "purgecss --css dist/assets/css/bundle.css --content app/**/*.html app/**/*.js --output dist/assets/css/bundle.min.css"
  }
}
```

**Expected:** ~50KB minified (60% reduction).

### 3. Container Queries (Modern CSS)
**Use Case:** Responsive components without media queries.

**Example:** Card adapts to container width, not viewport.
```css
/* Replace: Media query hell */
@media (max-width: 768px) {
  .card { padding: 16px; }
}

/* With: Container queries */
.dashboard {
  container-type: inline-size;
}

.card {
  padding: var(--space-24);
}

@container (max-width: 400px) {
  .card {
    padding: var(--space-16);
  }
}
```

**Impact:** More maintainable, components become truly reusable.

---

## Actionable Tasks

### Immediate (This Sprint)
1. **Create `2-composition/layouts.css`** — Extract stack, cluster, grid patterns
2. **Refactor `utilities.css`** — Remove spacing utils, keep token-based only
3. **Inline critical CSS** — Move tokens + reset into `<head>`
4. **Add PurgeCSS to build** — Reduce bundle size by 60%

### Next Sprint
5. **Extract component blocks** — card.css, button.css, form.css
6. **Implement @layer cascade** — Modern CSS organization
7. **Add container queries** — For truly responsive components
8. **Remove Bootstrap grid** — Replace with composition primitives

### Future Consideration
9. **CSS Modules or Scope** — If team grows beyond 1-2 developers
10. **Design System Documentation** — Storybook or similar for component library

---

## Risk Assessment

**Low Risk:**
- Adding composition patterns (non-breaking)
- Inlining critical CSS (progressive enhancement)
- PurgeCSS (build-time only)

**Medium Risk:**
- Refactoring utilities.css (HTML changes required)
- Removing Bootstrap grid (HTML refactor across all pages)

**High Risk:**
- Complete rewrite (not recommended — incremental approach is safer)

---

## Estimated Impact

| Metric | Current | After Phase 1-2 | After Phase 3-4 |
|--------|---------|-----------------|-----------------|
| Bundle Size | 122KB | ~80KB | ~50KB |
| HTML Classes/Page | ~150 | ~100 | ~60 |
| First Paint | ~800ms | ~600ms | ~400ms |
| Maintainability | 6/10 | 8/10 | 9/10 |

---

## References
- [CUBE CSS Methodology](https://cube.fyi)
- [Every Layout (Composition Patterns)](https://every-layout.dev)
- [Modern CSS Cascade Layers](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)
- [Container Queries Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_container_queries)
- [PurgeCSS Documentation](https://purgecss.com)

---

## Next Research Topics
1. ✅ CSS Architecture — COMPLETE
2. 🔄 **Chart.js Optimization** — Performance for financial charts (NEXT)
3. 📋 Bootstrap Dark Theme — Custom theming guide
4. 📋 Financial Dashboard UI Patterns — Best practices for data visualization
5. 📋 PWA Implementation — Offline-first strategy
6. 📋 Performance Audit — Lighthouse optimization

---

**Status:** Ready for implementation. Recommend starting with composition patterns (low risk, high impact).
