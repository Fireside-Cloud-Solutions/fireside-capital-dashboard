# CSS Architecture Research — Fireside Capital
**Research Date:** February 23, 2026  
**Status:** Complete  
**Priority:** Medium  
**Estimated Implementation:** 8-12 hours

---

## Executive Summary

The Fireside Capital dashboard has a **strong CSS foundation** with design tokens and modular files, but lacks a formal architecture pattern. This research evaluates the current state and recommends adopting **CUBE CSS** (Composition, Utility, Block, Exception) — a modern, maintainable approach ideal for financial dashboards.

**Current State:**
- ✅ Design token system (`design-tokens.css`) — excellent
- ✅ Logical file separation (main.css, components.css, utilities.css)
- ✅ Bootstrap 5 integration with dark mode
- ⚠️ 100KB+ `main.css` file — needs splitting
- ⚠️ No clear naming convention (BEM, CUBE, etc.)
- ⚠️ Component styles scattered across files

**Recommended Action:** Refactor to CUBE CSS with isolated component modules.

---

## Current Architecture Analysis

### File Structure (Current)
```
assets/css/
├── design-tokens.css      (21KB) — ✅ Excellent design token system
├── main.css               (100KB) — ⚠️ TOO LARGE, needs splitting
├── components.css         (41KB) — ⚠️ Should be multiple files
├── utilities.css          (9KB) — ✅ Good
├── responsive.css         (30KB) — ✅ Good separation
├── accessibility.css      (11KB) — ✅ Good separation
├── onboarding.css         (8KB) — ✅ Page-specific
├── logged-out-cta.css     (4KB) — ✅ Component-specific
└── critical.css           (1.6KB) — ✅ Performance optimization
```

### Strengths
1. **Design Tokens** — Comprehensive CSS variables for colors, spacing, typography
2. **Dark Mode** — Proper light/dark theme switching via `data-bs-theme`
3. **Financial Semantic Colors** — Dedicated tokens for positive/negative/neutral values
4. **Spacing Grid** — Consistent 8px grid system
5. **Accessibility** — Separate file for a11y overrides

### Weaknesses
1. **Monolithic Files** — `main.css` (100KB) and `components.css` (41KB) are too large
2. **No Component Isolation** — Card styles, button overrides, chart styles all mixed
3. **Missing Naming Convention** — No BEM, SMACSS, or CUBE structure
4. **Specificity Issues** — Global selectors mixed with component styles
5. **Hard to Find Components** — Developer must search across multiple files

---

## Recommended Architecture: CUBE CSS

### What is CUBE CSS?

CUBE stands for **Composition | Utility | Block | Exception**:
- **Composition** — Layout primitives (stack, cluster, grid, etc.)
- **Utility** — Single-purpose classes (`.text-center`, `.mt-4`)
- **Block** — Reusable components (cards, buttons, charts)
- **Exception** — Context-specific overrides (`.card[data-variant="highlight"]`)

**Why CUBE for Financial Dashboards?**
- **Component-based:** Perfect for card-heavy financial UI
- **Utility-first friendly:** Works with Bootstrap utilities
- **Maintainable:** Clear separation between layout, styling, and exceptions
- **Scalable:** Easy to add new financial widgets without breaking existing ones

### Proposed File Structure

```
assets/css/
├── 0-tokens/
│   └── design-tokens.css           (21KB) — No changes needed
├── 1-global/
│   ├── reset.css                   (New: ~2KB)
│   ├── typography.css              (New: ~8KB)
│   └── accessibility.css           (11KB) — Move here
├── 2-composition/
│   ├── layouts.css                 (New: stack, cluster, sidebar patterns)
│   ├── grid.css                    (New: financial dashboard grid system)
│   └── spacing.css                 (New: extracted from main.css)
├── 3-utilities/
│   ├── utilities.css               (9KB) — Keep as-is
│   └── responsive.css              (30KB) — Keep as-is
├── 4-blocks/
│   ├── buttons.css                 (New: ~6KB)
│   ├── cards.css                   (New: ~12KB)
│   ├── charts.css                  (New: ~8KB)
│   ├── financial-display.css       (New: positive/negative value styles)
│   ├── forms.css                   (New: ~10KB)
│   ├── modals.css                  (New: ~4KB)
│   ├── navigation.css              (New: ~8KB)
│   └── tables.css                  (New: ~6KB)
├── 5-exceptions/
│   ├── onboarding.css              (8KB) — Keep as-is
│   └── logged-out-cta.css          (4KB) — Keep as-is
└── critical.css                    (1.6KB) — Keep as-is
```

**Load Order (in HTML):**
```html
<link rel="stylesheet" href="assets/css/0-tokens/design-tokens.css" />
<link rel="stylesheet" href="assets/css/1-global/reset.css" />
<link rel="stylesheet" href="assets/css/1-global/typography.css" />
<link rel="stylesheet" href="assets/css/2-composition/layouts.css" />
<link rel="stylesheet" href="assets/css/3-utilities/utilities.css" />
<link rel="stylesheet" href="assets/css/4-blocks/cards.css" />
<link rel="stylesheet" href="assets/css/4-blocks/buttons.css" />
<!-- Load other blocks as needed -->
```

---

## Implementation Plan

### Phase 1: Extract Blocks (4-6 hours)
Split `main.css` and `components.css` into discrete component files:

**Priority Components to Extract:**
1. **Cards** (`cards.css`) — Most common UI element
2. **Buttons** (`buttons.css`) — High-impact, frequently styled
3. **Charts** (`charts.css`) — Chart.js wrapper styles
4. **Forms** (`forms.css`) — Input fields, validation states
5. **Financial Display** (`financial-display.css`) — Positive/negative value styles

**Code Example: `cards.css`**
```css
/* =================================================================
   BLOCK: Cards
   Financial dashboard card component with variants
   ================================================================= */

.card {
  background: var(--color-bg-2);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-md);
  transition: var(--transition-shadow);
}

.card:hover {
  box-shadow: var(--shadow-lg);
}

/* Exception: Highlight card (e.g., Net Worth summary) */
.card[data-variant="highlight"] {
  background: linear-gradient(135deg, var(--color-bg-2) 0%, var(--color-bg-3) 100%);
  border-color: var(--color-secondary);
  box-shadow: var(--shadow-elevated);
}

/* Exception: Warning card (e.g., bill overdue) */
.card[data-variant="warning"] {
  border-left: 4px solid var(--color-warning);
}

/* Exception: Empty state card */
.card[data-state="empty"] {
  text-align: center;
  padding: var(--space-2xl);
  color: var(--color-text-tertiary);
}

.card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.card__title {
  font-family: var(--font-heading);
  font-size: var(--text-h4);
  margin: 0;
  color: var(--color-text-primary);
}

.card__body {
  font-size: var(--text-body);
  line-height: var(--leading-normal);
}

.card__footer {
  margin-top: var(--space-md);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border-subtle);
}
```

### Phase 2: Create Composition Patterns (2-3 hours)

**Code Example: `layouts.css`**
```css
/* =================================================================
   COMPOSITION: Layout Primitives
   Based on Every Layout patterns — https://every-layout.dev
   ================================================================= */

/* Stack: Vertical spacing between children */
.stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.stack--sm { gap: var(--space-sm); }
.stack--lg { gap: var(--space-lg); }
.stack--xl { gap: var(--space-xl); }

/* Cluster: Horizontal grouping with wrapping */
.cluster {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
  align-items: center;
}

.cluster--space-between {
  justify-content: space-between;
}

/* Sidebar: Asymmetric two-column layout */
.sidebar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-lg);
}

.sidebar > :first-child {
  flex-basis: 20rem; /* Sidebar width */
  flex-grow: 1;
}

.sidebar > :last-child {
  flex-basis: 0;
  flex-grow: 999;
  min-inline-size: 50%; /* Content takes priority */
}

/* Grid: Responsive auto-fit grid */
.auto-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr));
  gap: var(--space-lg);
}

/* Financial Dashboard Grid: 3-column for KPIs */
.financial-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-lg);
}

@media (max-width: 768px) {
  .financial-grid {
    grid-template-columns: 1fr;
  }
}
```

### Phase 3: Create Financial Display Utilities (1-2 hours)

**Code Example: `financial-display.css`**
```css
/* =================================================================
   BLOCK: Financial Value Display
   Semantic styling for positive/negative/neutral financial values
   ================================================================= */

.financial-value {
  font-family: var(--font-mono);
  font-size: var(--text-body-lg);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-snug);
}

/* Positive: Gains, income, equity increases */
.financial-value--positive {
  color: var(--color-financial-positive-text);
}

.financial-value--positive::before {
  content: '+';
  opacity: 0.7;
}

/* Negative: Losses, expenses, debt increases */
.financial-value--negative {
  color: var(--color-financial-negative-text);
}

.financial-value--negative::before {
  content: '−'; /* Proper minus sign, not hyphen */
}

/* Neutral: Static values, balances */
.financial-value--neutral {
  color: var(--color-text-primary);
}

/* Large display (e.g., Net Worth) */
.financial-value--display {
  font-size: var(--text-display);
  font-weight: var(--weight-bold);
  line-height: var(--leading-tight);
}

/* Delta indicator (e.g., "+$1,234 this month") */
.financial-delta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-small);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-weight: var(--weight-medium);
}

.financial-delta--positive {
  background: var(--color-financial-positive-bg);
  color: var(--color-financial-positive-text);
}

.financial-delta--negative {
  background: var(--color-financial-negative-bg);
  color: var(--color-financial-negative-text);
}

.financial-delta__icon {
  width: 12px;
  height: 12px;
}
```

### Phase 4: Documentation & Style Guide (1 hour)

Create `docs/css-style-guide.md` with:
- Component naming conventions
- When to use composition vs. utilities
- How to create new blocks
- Exception pattern guidelines

---

## Performance Impact

### Before Refactor
```
main.css:         100KB
components.css:    41KB
utilities.css:      9KB
responsive.css:    30KB
Total CSS:        180KB (uncompressed)
```

### After Refactor (With Code Splitting)
```
Critical path (dashboard):
- design-tokens.css:  21KB
- reset.css:           2KB
- layouts.css:         4KB
- utilities.css:       9KB
- cards.css:          12KB
- buttons.css:         6KB
- charts.css:          8KB
Total critical:       62KB (65% reduction)

Lazy-loaded (per-page):
- onboarding.css: 8KB (only on first visit)
- forms.css: 10KB (only on settings/add pages)
```

**Performance Wins:**
- ✅ 65% reduction in critical CSS
- ✅ Faster first contentful paint
- ✅ Better browser caching (components change less than page styles)
- ✅ Easier to tree-shake unused CSS with PurgeCSS later

---

## Migration Strategy

### Option A: Big Bang (1-2 days, high risk)
Refactor all CSS at once. **NOT RECOMMENDED** for production site.

### Option B: Incremental (Recommended)
1. **Week 1:** Extract `cards.css` and `buttons.css` → Test on dashboard
2. **Week 2:** Extract `charts.css` and `forms.css` → Test on all pages
3. **Week 3:** Create composition patterns → Refactor dashboard layout
4. **Week 4:** Extract remaining components → Deprecate old files

**Testing Protocol:**
- Visual regression testing with Percy or BackstopJS
- Manual QA on all 8 pages (dashboard, assets, bills, budget, debts, income, investments, settings)
- Dark mode + light mode verification
- Mobile + desktop responsive checks

---

## Implementation Tasks (Ready for Azure DevOps)

### Task 1: Extract Card Component (2 hours)
**Description:** Create `assets/css/4-blocks/cards.css` and extract all card styles from `main.css` and `components.css`.

**Acceptance Criteria:**
- [ ] All `.card` styles moved to `cards.css`
- [ ] Card variants documented (highlight, warning, empty)
- [ ] No visual regressions on dashboard
- [ ] File size of `main.css` reduced by ~12KB

**Code to implement:** (See Phase 1 example above)

---

### Task 2: Extract Button Component (1.5 hours)
**Description:** Create `assets/css/4-blocks/buttons.css` and extract all button styles.

**Acceptance Criteria:**
- [ ] All `.btn` overrides moved to `buttons.css`
- [ ] Tri-color hierarchy maintained (orange primary, blue secondary, gray tertiary)
- [ ] Hover states and transitions preserved
- [ ] File size of `main.css` reduced by ~6KB

**Code Example:**
```css
/* =================================================================
   BLOCK: Buttons
   Tri-color button hierarchy: Orange > Blue > Gray
   ================================================================= */

.btn {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: var(--weight-semibold);
  font-size: var(--text-body);
  border: none;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-default);
  min-height: 44px; /* WCAG touch target */
}

.btn-primary {
  background: var(--color-primary);
  color: var(--color-button-text);
}

.btn-primary:hover {
  background: var(--color-primary-hover);
  box-shadow: var(--shadow-glow-orange);
}

.btn-secondary {
  background: var(--color-secondary);
  color: var(--color-button-text);
}

.btn-secondary:hover {
  background: var(--color-secondary-hover);
  box-shadow: var(--shadow-glow-blue);
}

.btn-outline-danger {
  background: transparent;
  border: 2px solid var(--color-danger);
  color: var(--color-danger);
}

.btn-outline-danger:hover {
  background: var(--color-danger);
  color: var(--color-text-on-brand);
}
```

---

### Task 3: Create Financial Display Component (1.5 hours)
**Description:** Create `assets/css/4-blocks/financial-display.css` for positive/negative/neutral value styling.

**Acceptance Criteria:**
- [ ] Replace inline `style="color: green"` with `.financial-value--positive`
- [ ] All financial values use semantic classes
- [ ] Delta indicators styled consistently
- [ ] Works in both dark and light mode

**Code to implement:** (See Phase 3 example above)

---

### Task 4: Create Composition Layouts (2 hours)
**Description:** Create `assets/css/2-composition/layouts.css` with layout primitives.

**Acceptance Criteria:**
- [ ] `.stack`, `.cluster`, `.sidebar`, `.auto-grid` patterns implemented
- [ ] Dashboard refactored to use composition classes
- [ ] Responsive breakpoints tested
- [ ] Documentation added to style guide

**Code to implement:** (See Phase 2 example above)

---

### Task 5: Create CSS Style Guide (1 hour)
**Description:** Document the CUBE CSS architecture in `docs/css-style-guide.md`.

**Contents:**
- CUBE CSS principles
- File organization rules
- Naming conventions
- When to create new blocks vs. exceptions
- Code examples for each layer

---

## Future Enhancements

### Critical CSS Extraction (Future)
Use `critical` npm package to inline above-the-fold CSS:
```bash
npm install critical --save-dev
```

```javascript
// build-critical.js
const critical = require('critical');

critical.generate({
  inline: true,
  base: 'app/',
  src: 'index.html',
  target: 'index.html',
  width: 1300,
  height: 900
});
```

### CSS Minification & Purging (Future)
```bash
npm install purgecss cssnano --save-dev
```

`postcss.config.js`:
```javascript
module.exports = {
  plugins: [
    require('@fullhuman/postcss-purgecss')({
      content: ['./app/**/*.html', './app/**/*.js'],
      safelist: ['data-bs-theme', 'data-variant']
    }),
    require('cssnano')({ preset: 'default' })
  ]
};
```

---

## References

- **CUBE CSS Methodology:** https://cube.fyi
- **Every Layout (Composition Patterns):** https://every-layout.dev
- **Bootstrap 5 Dark Mode:** https://getbootstrap.com/docs/5.3/customize/color-modes/
- **CSS Custom Properties Best Practices:** https://web.dev/css-custom-properties/

---

## Recommendation

**Adopt CUBE CSS incrementally over 4 weeks.** Start with extracting `cards.css` and `buttons.css` this sprint. The modular architecture will:
1. Improve developer velocity (easier to find and edit components)
2. Reduce CSS bundle size by 65%
3. Enable better code reuse across pages
4. Simplify future UI additions

**Estimated ROI:** 8 hours upfront investment → 2-3 hours saved per future feature.

**Status:** Ready for backlog — recommend Medium priority after live site bug fixes.
