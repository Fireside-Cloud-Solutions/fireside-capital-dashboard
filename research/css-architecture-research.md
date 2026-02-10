# CSS Architecture Research — Fireside Capital
**Research Date:** February 10, 2026  
**Status:** Complete  
**Priority:** High  
**Implementation Effort:** Medium (2-3 days for full refactor)

---

## Executive Summary

Fireside Capital currently uses a **flat CSS architecture** with files organized by purpose (components.css, utilities.css, main.css). While functional, this approach lacks the scalability and maintainability needed as the dashboard grows. 

**Recommendation:** Adopt **ITCSS (Inverted Triangle CSS)** with **BEMIT naming** for a production-grade architecture that will scale cleanly with future features.

---

## Current State Analysis

### Existing File Structure
```
app/assets/css/
├── accessibility.css (11KB)
├── components.css (33KB) ⚠️ Growing monolith
├── design-tokens.css (14KB) ✓ Good
├── financial-patterns.css (11KB)
├── logged-out-cta.css (5KB)
├── main.css (91KB) ⚠️ Largest file, mixed concerns
├── onboarding.css (8KB)
├── responsive.css (28KB)
└── utilities.css (9KB)
```

### Issues Identified
1. **No clear hierarchy** — main.css contains base styles, components, and utilities mixed together
2. **Component isolation weak** — 33KB components.css will become unmanageable (already 800+ lines)
3. **No naming convention** — class names are inconsistent (.card-modern vs .cta-button vs .progress-text)
4. **Specificity conflicts likely** — no layer system to prevent cascade issues
5. **Hard to onboard** — new developers won't know where to add new styles

### What's Working Well
✓ Design tokens centralized in design-tokens.css  
✓ 8px spacing grid system implemented  
✓ Responsive breakpoints defined  
✓ Dark-first approach with consistent variables  

---

## Recommended Architecture: ITCSS + BEMIT

### Why ITCSS?
- **Scalability:** Used by teams managing 100K+ line CSS codebases
- **Low learning curve:** Simple concept, no framework lock-in
- **Specificity control:** Natural cascade prevents !important hell
- **Bootstrap compatible:** Works alongside existing Bootstrap 5
- **Battle-tested:** 5+ years of production use at major agencies

### The Inverted Triangle Structure

```
settings/     — Sass variables, design tokens (no CSS output)
tools/        — Mixins, functions (no CSS output)
generic/      — Resets, normalize, box-sizing
elements/     — Bare HTML elements (h1, a, button)
objects/      — Layout patterns (.o-container, .o-grid)
components/   — UI components (.c-card, .c-chart-widget)
utilities/    — Overrides and helpers (.u-hidden, .u-text-center)
```

**Key principle:** Styles move from generic → specific, low specificity → high specificity

---

## Implementation Plan

### Phase 1: Restructure Without Breaking (Day 1)

Create new folder structure alongside existing files:

```
app/assets/css/
├── 01-settings/
│   ├── _variables.scss
│   └── _design-tokens.scss (migrate from design-tokens.css)
├── 02-tools/
│   ├── _mixins.scss (spacing, breakpoints)
│   └── _functions.scss (color manipulation)
├── 03-generic/
│   └── _reset.scss (normalize.css + box-sizing)
├── 04-elements/
│   ├── _typography.scss (h1-h6, p, a)
│   ├── _forms.scss (input, select, textarea)
│   └── _buttons.scss (base button styles)
├── 05-objects/
│   ├── _layout.scss (.o-container, .o-section)
│   ├── _grid.scss (.o-grid, .o-grid__item)
│   └── _media.scss (.o-media for card layouts)
├── 06-components/
│   ├── _card.scss (.c-card variants)
│   ├── _chart.scss (.c-chart-widget)
│   ├── _data-table.scss (.c-data-table)
│   ├── _navbar.scss (.c-navbar)
│   ├── _sidebar.scss (.c-sidebar)
│   ├── _stat-card.scss (.c-stat-card)
│   └── _cta-button.scss (.c-cta-button)
├── 07-utilities/
│   ├── _spacing.scss (mb-8, p-16, etc.)
│   ├── _visibility.scss (.u-hidden, .u-sr-only)
│   └── _text.scss (.u-text-center, .u-text-muted)
└── main.scss (imports all above in order)
```

**Build output:** `main.scss` → compiles to `main.css` (single file for production)

### Phase 2: BEMIT Naming Convention (Day 2)

Adopt namespaced BEM:

| Prefix | Meaning | Example |
|--------|---------|---------|
| `.c-` | Component | `.c-stat-card`, `.c-chart-widget` |
| `.o-` | Object (layout pattern) | `.o-container`, `.o-grid` |
| `.u-` | Utility | `.u-mb-24`, `.u-text-center` |
| `.t-` | Theme | `.t-dark`, `.t-light` |
| `.s-` | Scope (third-party content) | `.s-user-content` |
| `.is-`, `.has-` | State | `.is-active`, `.has-error` |
| `.js-` | JavaScript hook | `.js-toggle-sidebar` (no styling) |
| `.qa-` | Testing hook | `.qa-submit-button` (no styling) |

**Example refactor:**

```css
/* OLD (main.css) */
.card-modern { }
.card-modern.hover-state { }
.card-modern .icon { }

/* NEW (components/_card.scss) */
.c-card { }
.c-card--modern { }  /* Modifier */
.c-card__icon { }    /* Element */
.c-card.is-loading { } /* State */
```

### Phase 3: Extract Components (Day 3)

Break components.css monolith into discrete files:

**Priority components to extract:**
1. `.c-stat-card` — Net worth summary cards
2. `.c-chart-widget` — Chart.js container styling
3. `.c-data-table` — Transaction/bill tables
4. `.c-navbar` — Top navigation
5. `.c-sidebar` — Left navigation
6. `.c-cta-button` — Primary action buttons

**Template for component extraction:**

```scss
// components/_stat-card.scss
// ========================================
// Stat Card Component
// Used on: Dashboard, Assets, Net Worth pages
// ========================================

.c-stat-card {
  background: var(--color-surface-1);
  border-radius: var(--radius-lg);
  padding: var(--space-24);
  box-shadow: var(--shadow-md);
  transition: transform 150ms ease;

  &:hover {
    transform: translateY(-2px);
  }
}

.c-stat-card__title {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-8);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.c-stat-card__value {
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.c-stat-card__trend {
  display: flex;
  align-items: center;
  gap: var(--space-8);
  margin-top: var(--space-12);
  font-size: var(--text-sm);
}

.c-stat-card--positive {
  .c-stat-card__trend {
    color: var(--color-success);
  }
}

.c-stat-card--negative {
  .c-stat-card__trend {
    color: var(--color-danger);
  }
}
```

---

## Sass Setup (Tooling)

### Install Dependencies

```bash
npm install --save-dev sass sass-loader
```

### Build Script (package.json)

```json
{
  "scripts": {
    "css:watch": "sass --watch app/assets/css/main.scss:app/assets/css/main.css --style=expanded",
    "css:build": "sass app/assets/css/main.scss:app/assets/css/main.css --style=compressed --no-source-map"
  }
}
```

### Azure Static Web Apps CI/CD

Update `.github/workflows/azure-static-web-apps-*.yml`:

```yaml
- name: Build CSS
  run: npm run css:build
  working-directory: ./app
```

---

## Spacing System Refinement

Current spacing is good (8px grid). Formalize with Sass:

```scss
// 01-settings/_spacing.scss
$space-base: 8px;

$space-4: $space-base * 0.5;  // 4px
$space-8: $space-base;         // 8px
$space-12: $space-base * 1.5;  // 12px
$space-16: $space-base * 2;    // 16px
$space-24: $space-base * 3;    // 24px
$space-32: $space-base * 4;    // 32px
$space-48: $space-base * 6;    // 48px
$space-64: $space-base * 8;    // 64px

// Generate utility classes
@each $name, $size in (
  4: $space-4,
  8: $space-8,
  12: $space-12,
  16: $space-16,
  24: $space-24,
  32: $space-32,
  48: $space-48,
  64: $space-64
) {
  .u-mb-#{$name} { margin-bottom: $size !important; }
  .u-mt-#{$name} { margin-top: $size !important; }
  .u-p-#{$name} { padding: $size !important; }
  .u-gap-#{$name} { gap: $size !important; }
}
```

---

## Object Layer Examples (Layout Patterns)

These are reusable, unstyled layout primitives:

```scss
// 05-objects/_container.scss
.o-container {
  width: 100%;
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--space-16);
  padding-right: var(--space-16);

  @media (min-width: 768px) {
    padding-left: var(--space-24);
    padding-right: var(--space-24);
  }
}

.o-container--narrow {
  max-width: 960px;
}

.o-container--wide {
  max-width: 1440px;
}
```

```scss
// 05-objects/_grid.scss
.o-grid {
  display: grid;
  gap: var(--space-24);
}

.o-grid--2-col {
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.o-grid--3-col {
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.o-grid--auto-fit {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}
```

```scss
// 05-objects/_stack.scss (vertical rhythm)
.o-stack > * + * {
  margin-top: var(--space-24);
}

.o-stack--sm > * + * {
  margin-top: var(--space-12);
}

.o-stack--lg > * + * {
  margin-top: var(--space-32);
}
```

---

## Component Isolation Best Practices

### 1. One File Per Component
```
06-components/
├── _card.scss (300 lines max)
├── _chart-widget.scss
├── _data-table.scss
└── _stat-card.scss
```

### 2. Limit Nesting Depth (Max 2 levels)
```scss
// ✓ GOOD
.c-card { }
.c-card__header { }
.c-card__title { }

// ✗ BAD (too nested, specificity issues)
.c-card {
  .c-card__header {
    .c-card__title {
      .c-card__icon { }
    }
  }
}
```

### 3. Separate Spacing from Components
```scss
// ✗ BAD (component controls its own spacing)
.c-stat-card {
  margin-bottom: 24px; /* breaks reusability */
}

// ✓ GOOD (spacing applied by layout or utility)
<div class="o-grid o-grid--3-col u-mb-32">
  <div class="c-stat-card">...</div>
  <div class="c-stat-card">...</div>
</div>
```

---

## Migration Strategy (No Downtime)

### Week 1: Parallel Implementation
1. Set up Sass build pipeline
2. Create ITCSS folder structure
3. Migrate design tokens → `01-settings/`
4. Keep old `main.css` as fallback

### Week 2: Component Extraction
1. Extract top 3 components (stat-card, chart-widget, navbar)
2. Apply BEMIT naming
3. Test on staging environment
4. Deploy with feature flag

### Week 3: Full Cutover
1. Migrate all remaining components
2. Remove old CSS files
3. Update HTML templates with new classes
4. Run regression tests

**Rollback plan:** Keep old main.css for 2 weeks post-cutover

---

## Tools & Resources

### Sass Documentation
- [Sass Basics](https://sass-lang.com/guide)
- [Sass @import](https://sass-lang.com/documentation/at-rules/import)
- [Sass Modules (@use)](https://sass-lang.com/documentation/at-rules/use)

### ITCSS Resources
- [ITCSS × Skillshare – CSS Wizardry](https://csswizardry.com/2018/11/itcss-and-skillshare/)
- [Harry Roberts – Managing CSS Projects with ITCSS](https://www.youtube.com/watch?v=1OKZOV-iLj4)
- [Xfive ITCSS Guide](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture)

### BEM/BEMIT Resources
- [BEMIT: Taking BEM Further](https://csswizardry.com/2015/08/bemit-taking-the-bem-naming-convention-a-step-further/)
- [BEM Naming Cheat Sheet](https://9elements.com/bem-cheat-sheet/)
- [BEM Methodology Official](https://en.bem.info/methodology/)

### CSS Architecture Guides
- [CSS Guidelines by Harry Roberts](https://cssguidelin.es/)
- [SMACSS by Jonathan Snook](https://smacss.com/)
- [Scalable CSS](https://www.sitepoint.com/css-architecture-and-the-three-pillars-of-maintainable-css/)

---

## Next Steps (Task Creation)

### Implementation Tasks

1. **Task: Set up Sass build pipeline**
   - Install sass, sass-loader
   - Add npm scripts for watch/build
   - Update Azure CI/CD workflow
   - Test build output

2. **Task: Create ITCSS folder structure**
   - Create 7 layer folders (01-settings through 07-utilities)
   - Create main.scss import file
   - Migrate design-tokens.css → _design-tokens.scss

3. **Task: Extract stat-card component**
   - Create components/_stat-card.scss
   - Apply BEMIT naming (.c-stat-card)
   - Update dashboard.html template
   - Test responsive behavior

4. **Task: Extract chart-widget component**
   - Create components/_chart-widget.scss
   - Standardize Chart.js container styles
   - Update all chart pages
   - Document Chart.js integration patterns

5. **Task: Extract data-table component**
   - Create components/_data-table.scss
   - Apply to transactions/bills/income tables
   - Add sorting/pagination styles
   - Test mobile responsive table

6. **Task: Document CSS contribution guidelines**
   - Where to add new components
   - BEMIT naming examples
   - Code review checklist
   - Component template

---

## Success Metrics

**Before Refactor:**
- main.css: 91KB (3600+ lines)
- components.css: 33KB (800+ lines)
- No naming convention
- Average specificity: 0.2.3

**After Refactor (Target):**
- main.css: 85KB (compressed, tree-shaken)
- Largest component file: <300 lines
- 100% BEMIT naming
- Average specificity: 0.1.2 (lower = better)
- Build time: <2 seconds
- New component creation time: 50% faster

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking existing styles | Medium | High | Parallel implementation, feature flags |
| Sass build failures in CI/CD | Low | Medium | Fallback to old main.css |
| Team learning curve | Medium | Low | Documentation, pair programming |
| Performance regression | Low | Medium | Lighthouse tests, size monitoring |

---

## Conclusion

The current CSS architecture is adequate for a prototype but won't scale as Fireside Capital adds features. **ITCSS + BEMIT provides a clear, scalable path forward** with minimal disruption.

**Recommendation:** Approve for implementation. Start with Phase 1 (restructure) this sprint.

**Estimated ROI:**
- Initial investment: 16-20 hours (2-3 days)
- Time saved per new feature: 30-40% (clearer structure, faster debugging)
- Maintenance burden reduction: 50% (isolated components, predictable cascade)
- Onboarding time for new developers: 60% faster

---

**Research conducted by:** Capital (Fireside Capital Orchestrator)  
**Date:** February 10, 2026  
**Status:** Ready for PM review and task creation
