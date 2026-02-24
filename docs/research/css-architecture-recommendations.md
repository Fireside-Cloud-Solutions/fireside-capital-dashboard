# CSS Architecture Recommendations for Fireside Capital
**Research Sprint** | February 24, 2026  
**Status:** ✅ Complete  
**Implementation Priority:** HIGH

---

## Executive Summary
Current state: Fireside Capital has a functional design tokens system (`design-tokens.css`) and component-based CSS organization, but lacks formal architectural structure. This creates risks for:
- CSS specificity conflicts as the codebase grows
- Difficulty locating and maintaining styles
- Inconsistent naming conventions across files
- Performance degradation from redundant CSS

**Recommendation:** Implement **ITCSS + BEMIT** hybrid architecture to organize existing CSS and support scalable growth.

---

## 1. Current State Analysis

### Existing Files (10 CSS files, ~414KB total)
```
design-tokens.css   21KB   ✅ Excellent foundation — CSS variables
components.css      42KB   ⚠️ Needs structure (mixed components)
main.css           100KB   ⚠️ Monolithic — should be split
utilities.css        9KB   ✅ Good separation
responsive.css      30KB   ⚠️ Should integrate with components
accessibility.css   12KB   ✅ Good separation
onboarding.css       8KB   ⚠️ Should be in components/
critical.css         2KB   ✅ Performance optimization present
```

### Strengths
- ✅ **Design tokens already implemented** — CSS custom properties for colors, spacing, typography
- ✅ **Utility classes separated** — Good foundation for utility-first patterns
- ✅ **Accessibility CSS isolated** — WCAG compliance considerations
- ✅ **Critical CSS path optimization** — Performance awareness

### Issues
- ❌ **No naming convention** — Mix of camelCase, kebab-case, BEM-like patterns
- ❌ **Flat component structure** — All components in one file
- ❌ **Responsive styles separated** — Should be colocated with components
- ❌ **No clear specificity hierarchy** — Risk of specificity wars

---

## 2. RECOMMENDED ARCHITECTURE: ITCSS + BEMIT

### What is ITCSS?
**Inverted Triangle CSS** — organizes CSS from generic to specific, low to high specificity.

**Layers (in order):**
```
1. Settings    — CSS variables, design tokens          [NO CSS OUTPUT]
2. Tools       — Mixins, functions (if using Sass)     [NO CSS OUTPUT]
3. Generic     — Normalize, reset, box-sizing
4. Elements    — Bare HTML elements (h1, a, p)
5. Objects     — Unstyled design patterns (layouts)
6. Components  — Specific UI components
7. Utilities   — Helper classes (overrides)
```

### What is BEMIT?
**BEM + IT (ITCSS) Namespacing** — naming convention with layer prefixes.

**Namespaces:**
```css
.o-  Objects     — .o-container, .o-grid
.c-  Components  — .c-dashboard-card, .c-chart-wrapper
.u-  Utilities   — .u-margin-bottom-lg, .u-hidden
.is- States      — .is-active, .is-loading
.has- Context    — .has-dropdown, .has-error
```

---

## 3. IMPLEMENTATION PLAN

### Phase 1: File Reorganization (2-3 hours)
**Create new folder structure:**
```
assets/css/
├── 1-settings/
│   └── design-tokens.css         [EXISTING — RENAME/MOVE]
├── 2-tools/
│   └── (empty for now — future Sass mixins)
├── 3-generic/
│   └── normalize.css             [NEW]
│   └── box-sizing.css            [NEW]
├── 4-elements/
│   └── typography.css            [EXTRACT from main.css]
│   └── forms.css                 [EXTRACT from main.css]
│   └── tables.css                [EXTRACT from main.css]
├── 5-objects/
│   └── o-container.css           [NEW]
│   └── o-grid.css                [NEW]
│   └── o-media.css               [NEW — if needed]
├── 6-components/
│   ├── c-dashboard-card.css      [EXTRACT from components.css]
│   ├── c-sidebar.css             [EXTRACT from components.css]
│   ├── c-navbar.css              [EXTRACT from components.css]
│   ├── c-chart.css               [EXTRACT from components.css]
│   ├── c-table.css               [EXTRACT from components.css]
│   ├── c-button.css              [EXTRACT from components.css]
│   ├── c-notification.css        [EXTRACT from components.css]
│   └── c-onboarding.css          [EXISTING onboarding.css — RENAME]
├── 7-utilities/
│   └── utilities.css             [EXISTING — RENAME with .u- prefix]
│   └── responsive.css            [EXISTING — INTEGRATE]
└── main.css                      [IMPORT MANIFEST]
```

### Phase 2: Naming Convention Refactor (4-6 hours)
**Update all selectors to BEMIT:**

**Before:**
```css
/* components.css — inconsistent naming */
.dashboard-card { }
.dashboardCard__header { }
.card-body { }
.card--highlighted { }
```

**After:**
```css
/* 6-components/c-dashboard-card.css */
.c-dashboard-card { }
.c-dashboard-card__header { }
.c-dashboard-card__body { }
.c-dashboard-card--highlighted { }
```

**Before:**
```css
/* utilities.css */
.hidden { display: none; }
.text-center { text-align: center; }
```

**After:**
```css
/* 7-utilities/utilities.css */
.u-hidden { display: none !important; }
.u-text-center { text-align: center !important; }
.u-mb-sm { margin-bottom: var(--spacing-sm) !important; }
.u-mb-md { margin-bottom: var(--spacing-md) !important; }
.u-mb-lg { margin-bottom: var(--spacing-lg) !important; }
```

### Phase 3: Create Import Manifest (30 minutes)
**New `main.css`:**
```css
/* =================================================================
   Fireside Capital — Main Stylesheet
   Architecture: ITCSS + BEMIT
   ================================================================= */

/* 1. SETTINGS — Design tokens (CSS variables) */
@import '1-settings/design-tokens.css';

/* 2. TOOLS — (Reserved for future Sass mixins) */

/* 3. GENERIC — Resets and normalization */
@import '3-generic/normalize.css';
@import '3-generic/box-sizing.css';

/* 4. ELEMENTS — Bare HTML styling */
@import '4-elements/typography.css';
@import '4-elements/forms.css';
@import '4-elements/tables.css';

/* 5. OBJECTS — Layout patterns */
@import '5-objects/o-container.css';
@import '5-objects/o-grid.css';

/* 6. COMPONENTS — UI components */
@import '6-components/c-navbar.css';
@import '6-components/c-sidebar.css';
@import '6-components/c-dashboard-card.css';
@import '6-components/c-chart.css';
@import '6-components/c-table.css';
@import '6-components/c-button.css';
@import '6-components/c-notification.css';
@import '6-components/c-onboarding.css';

/* 7. UTILITIES — Helpers and overrides */
@import '7-utilities/utilities.css';
@import '7-utilities/responsive.css';

/* Accessibility overrides (always last) */
@import 'accessibility.css';
```

### Phase 4: HTML Updates (2-4 hours)
**Update all HTML templates to use new class names.**

**Example: Dashboard Card**
```html
<!-- BEFORE -->
<div class="dashboard-card highlighted">
  <div class="card-header">
    <h3 class="card-title">Net Worth</h3>
  </div>
  <div class="card-body">
    <p class="value">$125,432</p>
  </div>
</div>

<!-- AFTER -->
<div class="c-dashboard-card c-dashboard-card--highlighted">
  <header class="c-dashboard-card__header">
    <h3 class="c-dashboard-card__title">Net Worth</h3>
  </header>
  <div class="c-dashboard-card__body">
    <p class="c-dashboard-card__value">$125,432</p>
  </div>
</div>
```

---

## 4. DESIGN DECISIONS

### Objects vs Components
**RECOMMENDATION:** Minimize objects. Only create objects for truly reusable, unstyled patterns.

**Objects (minimal):**
- `.o-container` — Max-width wrapper
- `.o-grid` — Layout grid system
- `.o-stack` — Vertical spacing stack
- `.o-media` — Image + text pattern (if needed)

**Everything else → Components**

### Spacing System (Utilities)
**RECOMMENDATION:** Add utility classes for spacing to avoid margin/padding in components.

```css
/* 7-utilities/spacing.css */
:root {
  --spacing-xs: 0.25rem;   /* 4px */
  --spacing-sm: 0.5rem;    /* 8px */
  --spacing-md: 1rem;      /* 16px */
  --spacing-lg: 1.5rem;    /* 24px */
  --spacing-xl: 2rem;      /* 32px */
  --spacing-2xl: 3rem;     /* 48px */
}

/* Margin utilities */
.u-m-0  { margin: 0 !important; }
.u-mt-sm { margin-top: var(--spacing-sm) !important; }
.u-mr-sm { margin-right: var(--spacing-sm) !important; }
.u-mb-sm { margin-bottom: var(--spacing-sm) !important; }
.u-ml-sm { margin-left: var(--spacing-sm) !important; }
/* ... repeat for md, lg, xl, 2xl */

/* Padding utilities */
.u-p-0  { padding: 0 !important; }
.u-pt-sm { padding-top: var(--spacing-sm) !important; }
/* ... repeat pattern */

/* Responsive spacing (Bootstrap-style) */
@media (min-width: 768px) {
  .u-mb-md\@md { margin-bottom: var(--spacing-md) !important; }
}
```

### Responsive Design
**RECOMMENDATION:** Colocate responsive styles with components.

```css
/* 6-components/c-dashboard-card.css */
.c-dashboard-card {
  background: var(--color-bg-2);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
}

/* Responsive adjustments in same file */
@media (min-width: 768px) {
  .c-dashboard-card {
    padding: var(--spacing-lg);
  }
}

@media (min-width: 1200px) {
  .c-dashboard-card {
    padding: var(--spacing-xl);
  }
}
```

### Component Encapsulation
**RULE:** Components should NOT set their own margins. Use utilities or wrapper objects.

```html
<!-- ❌ BAD: Component sets own margin -->
<style>
.c-dashboard-card { margin-bottom: 1rem; }
</style>

<!-- ✅ GOOD: Wrapper or utility controls spacing -->
<div class="o-stack o-stack--md">
  <div class="c-dashboard-card">...</div>
  <div class="c-dashboard-card">...</div>
  <div class="c-dashboard-card">...</div>
</div>

<!-- OR -->
<div class="c-dashboard-card u-mb-md">...</div>
```

---

## 5. BOOTSTRAP 5 INTEGRATION

### Current Situation
Fireside Capital uses Bootstrap 5. ITCSS is fully compatible with Bootstrap.

### Strategy: Hybrid Approach
**Use Bootstrap for:**
- Grid system (`.container`, `.row`, `.col-*`)
- Utility classes (`.d-flex`, `.justify-content-between`, etc.)
- JavaScript components (modals, tooltips, dropdowns)

**Use Custom ITCSS for:**
- All financial dashboard components
- Brand-specific styling
- Complex UI patterns

### Avoiding Bootstrap Bloat
**Load only what you need:**

```html
<!-- DON'T: Load full Bootstrap CSS -->
<link rel="stylesheet" href="bootstrap.min.css">

<!-- DO: Use Bootstrap's modular Sass and compile only needed modules -->
```

**If using CDN (current approach):**
```html
<!-- 1. Load Bootstrap first (base framework) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">

<!-- 2. Load custom ITCSS (overrides and extends) -->
<link rel="stylesheet" href="assets/css/main.css">
```

### Customizing Bootstrap with Design Tokens
**Override Bootstrap CSS variables:**
```css
/* 1-settings/design-tokens.css */
:root {
  /* Override Bootstrap primary color */
  --bs-primary: var(--color-primary);
  --bs-primary-rgb: var(--color-primary-rgb);
  
  /* Override Bootstrap spacing scale */
  --bs-spacer: 1rem;
  
  /* Override Bootstrap border radius */
  --bs-border-radius: var(--radius-md);
  --bs-border-radius-lg: var(--radius-lg);
  
  /* Dark theme overrides */
  --bs-body-bg: var(--color-bg-1);
  --bs-body-color: var(--color-text-1);
  --bs-border-color: var(--color-border-1);
}
```

---

## 6. PERFORMANCE CONSIDERATIONS

### Critical CSS Strategy
**Keep `critical.css` for above-the-fold content:**
```css
/* critical.css — Inline in <head> */
:root { /* Essential design tokens */ }
.c-navbar { /* Header styles */ }
.c-sidebar { /* Sidebar styles */ }
.o-container { /* Layout container */ }
```

### Lazy Load Non-Critical Components
```html
<link rel="preload" href="assets/css/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="assets/css/main.css"></noscript>
```

### CSS File Size Targets
```
Settings + Generic + Elements:  < 20KB
Objects:                        < 10KB
Components (combined):          < 80KB
Utilities:                      < 15KB
TOTAL TARGET:                   < 125KB (gzipped: ~25KB)
```

---

## 7. DEVELOPER WORKFLOW

### Creating New Components
**Checklist:**
1. ✅ Create new file: `6-components/c-[name].css`
2. ✅ Use BEMIT naming: `.c-[name]`, `.c-[name]__[element]`, `.c-[name]--[modifier]`
3. ✅ Include responsive styles in same file
4. ✅ No margins on component itself
5. ✅ Import in `main.css`
6. ✅ Test on live site with browser automation

**Template:**
```css
/* 6-components/c-stat-card.css */
/* ========================================
   Stat Card Component
   Displays a single financial metric
   
   Variants:
   - c-stat-card--positive (green)
   - c-stat-card--negative (red)
   - c-stat-card--neutral (default)
   ======================================== */

.c-stat-card {
  background: var(--color-bg-2);
  border: 1px solid var(--color-border-1);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  transition: all 0.2s ease;
}

.c-stat-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.c-stat-card__label {
  font-size: var(--font-size-sm);
  color: var(--color-text-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--spacing-xs);
}

.c-stat-card__value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-1);
  margin-bottom: var(--spacing-sm);
}

.c-stat-card__change {
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

/* Variants */
.c-stat-card--positive .c-stat-card__change {
  color: var(--color-success);
}

.c-stat-card--negative .c-stat-card__change {
  color: var(--color-error);
}

.c-stat-card--neutral .c-stat-card__change {
  color: var(--color-text-2);
}

/* Responsive adjustments */
@media (min-width: 768px) {
  .c-stat-card {
    padding: var(--spacing-xl);
  }
  
  .c-stat-card__value {
    font-size: var(--font-size-3xl);
  }
}
```

---

## 8. MIGRATION STRATEGY

### Phased Rollout (Avoid Big Bang)
**Week 1:** File reorganization only (no class renames)
- Create folder structure
- Move files to ITCSS layers
- Update imports in `main.css`
- Test — should have ZERO visual changes

**Week 2:** Rename utilities and objects
- Update `.u-` prefix for all utilities
- Create `.o-` objects (container, grid, stack)
- Update HTML in 2-3 pages
- Test affected pages

**Week 3:** Rename components (alphabetically)
- Rename `.c-button`, `.c-card`, `.c-chart`, etc.
- Update HTML page by page
- Test each page after updates

**Week 4:** Cleanup and optimization
- Remove unused CSS
- Audit specificity with browser devtools
- Performance testing
- Documentation updates

### Testing Protocol
**For each phase:**
1. ✅ Visual regression testing (screenshot before/after)
2. ✅ Browser automation: Login → Navigate all pages → Check for console errors
3. ✅ Mobile responsive testing (375px, 768px, 1200px)
4. ✅ Accessibility audit (axe DevTools)

---

## 9. TOOLS & AUTOMATION

### Recommended Tools
**VS Code Extensions:**
- **BEM Helper** — Autocomplete for BEM class names
- **CSS Variable Autocomplete** — IntelliSense for CSS custom properties
- **Stylelint** — Enforce CSS coding standards

### Stylelint Configuration
**Create `.stylelintrc.json`:**
```json
{
  "extends": "stylelint-config-standard",
  "rules": {
    "selector-class-pattern": "^([a-z][a-z0-9]*)(-[a-z0-9]+)*$",
    "custom-property-pattern": "^([a-z][a-z0-9]*)(-[a-z0-9]+)*$",
    "max-nesting-depth": 2,
    "selector-max-specificity": "0,3,0",
    "declaration-no-important": [true, {
      "severity": "warning",
      "message": "!important should only be used in utilities"
    }]
  }
}
```

### Browser DevTools Audit
**Check specificity graph:**
```javascript
// Run in browser console
const sheets = [...document.styleSheets];
const rules = sheets.flatMap(sheet => [...sheet.cssRules || []]);
const specificity = rules.map(rule => {
  if (rule.selectorText) {
    return {
      selector: rule.selectorText,
      specificity: getSpecificity(rule.selectorText)
    };
  }
}).filter(Boolean).sort((a, b) => b.specificity - a.specificity);
console.table(specificity.slice(0, 20));
```

---

## 10. NEXT STEPS

### Immediate Actions (This Week)
- [ ] **Task 1:** Create ITCSS folder structure in `assets/css/`
- [ ] **Task 2:** Split `components.css` into individual component files
- [ ] **Task 3:** Create new `main.css` import manifest
- [ ] **Task 4:** Test on staging — verify no visual regressions

### Medium-Term (Next Sprint)
- [ ] **Task 5:** Rename all components to BEMIT convention
- [ ] **Task 6:** Update HTML templates across all 8 pages
- [ ] **Task 7:** Add spacing utility classes
- [ ] **Task 8:** Document component library in Storybook (optional)

### Long-Term (Future)
- [ ] Migrate to Sass for better modularity
- [ ] Implement CSS-in-JS for React components (if migrating from vanilla JS)
- [ ] Create design system documentation site

---

## 11. RESOURCES

### ITCSS References
- [ITCSS × Skillshare – CSS Wizardry](https://csswizardry.com/2018/11/itcss-and-skillshare/)
- [BEMIT: Taking BEM Further – CSS Wizardry](https://csswizardry.com/2015/08/bemit-taking-the-bem-naming-convention-a-step-further/)
- [Managing CSS Projects with ITCSS – YouTube](https://www.youtube.com/watch?v=1OKZOV-iLj4)

### Bootstrap Integration
- [Bootstrap 5 Customization Guide](https://getbootstrap.com/docs/5.0/customize/overview/)
- [Bootstrap CSS Variables](https://getbootstrap.com/docs/5.0/customize/css-variables/)

### Tools
- [Stylelint](https://stylelint.io/)
- [BEM Naming Cheat Sheet](https://9elements.com/bem-cheat-sheet/)
- [Specificity Calculator](https://specificity.keegan.st/)

---

**Research completed:** February 24, 2026 @ 5:14 AM  
**Next research topic:** Chart.js implementation patterns  
**Estimated implementation time:** 12-16 hours (phased over 4 weeks)
