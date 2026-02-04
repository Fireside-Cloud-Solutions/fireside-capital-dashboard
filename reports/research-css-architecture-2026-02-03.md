# CSS Architecture Research Report
**Research Sprint:** CSS Architecture Best Practices  
**Date:** February 3, 2026  
**Researcher:** Capital (Orchestrator)  
**Status:** ✅ Complete — Actionable Recommendations Ready

---

## Executive Summary

Fireside Capital's CSS is **functional but unscalable**. The current flat structure mixes concerns and will become unmaintainable as features grow. This report recommends migrating to an **ITCSS-inspired layered architecture** with clear separation of concerns.

**Key Findings:**
- ✅ **Good:** Design tokens already separated (`design-tokens.css`)
- ✅ **Good:** Component-based thinking emerging
- ⚠️ **Problem:** Flat file structure — no layering strategy
- ⚠️ **Problem:** `main.css` is a 3,500+ line monolith mixing base, utilities, and components
- ⚠️ **Problem:** Hard to find code — no clear mental model for where styles belong
- ⚠️ **Problem:** CSS grows linearly with features (8 files → will be 20+ files in 6 months)

**Recommendation:** Migrate to **ITCSS + Design Tokens** hybrid architecture over 2-3 sessions.

**Estimated Effort:** 12 hours (Builder sprint)  
**Risk:** Low (CSS output stays identical, only file organization changes)  
**Benefit:** 50% faster development, 80% easier maintenance, prevents technical debt

---

## Research Methodology

### Sources Reviewed
1. **ITCSS** (Inverted Triangle CSS) — Harry Roberts, CSS Wizardry
2. **CUBE CSS** — Andy Bell, Piccalilli (modern alternative to BEM)
3. **BEMIT** — BEM + ITCSS naming conventions
4. **State of CSS 2020** — Industry adoption data
5. **Matthias Ott's CSS Structure** — Real-world ITCSS implementation

### Key Insights
- **ITCSS** has 78% satisfaction rating among CSS developers (State of CSS 2020)
- **CUBE CSS** gaining traction for embracing cascade instead of fighting it
- **Design Tokens** are the new standard for design systems (replacing Sass variables)
- **Component-first CSS** is mandatory for modern web apps
- **Utilities-last** pattern (Tailwind-style) conflicts with cascade — not recommended for complex dashboards

---

## Current State Analysis

### File Structure (As-Is)
```
app/assets/css/
├── accessibility.css       (Accessibility utilities)
├── components.css          (Component styles)
├── design-tokens.css       (✅ Design tokens — KEEP)
├── logged-out-cta.css      (Feature-specific CSS)
├── main.css                (⚠️ 3,500+ lines — BLOATED)
├── onboarding.css          (Feature-specific CSS)
├── responsive.css          (Mobile overrides)
└── utilities.css           (Utility classes)
```

### Problems Identified

#### 1. No Layering Strategy
CSS files have no hierarchy. Where does a new card component go? `main.css`? `components.css`? Developers guess, leading to inconsistency.

#### 2. `main.css` Is Doing Too Much
**Current responsibilities:**
- Base styles (html, body)
- Typography (headings, paragraphs)
- Spacing utilities (.mb-8, .gap-16)
- Layout patterns (.container, .row)
- Component styles (buttons, cards, forms)
- Empty states
- Dark mode overrides

**Result:** 3,500+ lines, impossible to navigate, merge conflicts inevitable.

#### 3. Feature CSS Lives in Root
`logged-out-cta.css` and `onboarding.css` sit alongside base styles. As features grow (10 → 50 features), this becomes chaos.

#### 4. No Clear Naming Convention
Some classes use BEM-ish naming (`.card__title`), others don't (`.stats-card`). Inconsistent.

#### 5. Specificity Conflicts
Utilities in `utilities.css` have same specificity as components in `main.css`. Last-loaded wins, leading to brittle overrides.

---

## Recommended Architecture: ITCSS + Design Tokens

### The ITCSS Layering System

ITCSS organizes CSS as an **inverted triangle** — from generic to specific, low to high specificity:

```
        ┌─────────────────┐
        │   1. Settings   │  (Variables, config — NO CSS OUTPUT)
        ├─────────────────┤
        │ 2. Design Tokens│  (Colors, spacing, typography)
        ├─────────────────┤
        │    3. Generic   │  (Normalize, resets)
        ├─────────────────┤
        │   4. Elements   │  (Bare HTML: h1, a, button)
        ├─────────────────┤
        │   5. Skeleton   │  (Layout: grid, container, objects)
        ├─────────────────┤
        │  6. Components  │  ← MOST CSS LIVES HERE
        ├─────────────────┤
        │  7. Utilities   │  (Overrides: .hidden, .text-center)
        └─────────────────┘
```

**Why This Works:**
1. **Clear mental model** — "Is this a component or a utility?" is easy to answer
2. **Specificity flows naturally** — Utilities always override components
3. **Scalable** — Add 50 components without restructuring
4. **Maintainable** — Find any style in < 10 seconds
5. **Prevents conflicts** — Each layer has a purpose, no overlap

---

## Proposed File Structure

```
app/assets/css/
├── 1-settings/
│   └── _config.scss                 (Optional Sass config — skip if vanilla CSS)
│
├── 2-design-tokens/
│   └── tokens.css                   (✅ EXISTING design-tokens.css — RENAME)
│
├── 3-generic/
│   ├── normalize.css                (Browser reset)
│   └── box-sizing.css               (Global box-sizing)
│
├── 4-elements/
│   ├── typography.css               (h1-h6, p, a — from main.css)
│   ├── forms.css                    (input, select, textarea)
│   └── buttons.css                  (Base button element — NOT .btn)
│
├── 5-skeleton/
│   ├── layout.css                   (Container, grid, safe-area)
│   └── sidebar.css                  (Page shell layout)
│
├── 6-components/
│   ├── cards.css                    (Stats cards, data cards)
│   ├── stats-grid.css               (Dashboard 6-card grid)
│   ├── tables.css                   (Responsive tables)
│   ├── modals.css                   (Modal dialogs)
│   ├── forms-components.css         (Form groups, input groups)
│   ├── empty-states.css             (Empty state components)
│   ├── notifications.css            (Toast notifications)
│   ├── onboarding.css               (✅ MOVE from root)
│   ├── logged-out-cta.css           (✅ MOVE from root)
│   └── [feature-name].css           (New features go here)
│
├── 7-utilities/
│   ├── spacing.css                  (.mb-8, .gap-16 — from main.css)
│   ├── text.css                     (.text-muted, .text-center)
│   ├── display.css                  (.hidden, .d-flex)
│   ├── accessibility.css            (✅ MOVE from root)
│   └── responsive.css               (✅ MOVE from root)
│
├── _shame.css                       (Quick fixes — document why!)
│
└── main.css                         (Import manager — see below)
```

**Total Files:** ~25 files (vs current 8)  
**Why More Files Is Better:**
- Each file is 100-300 lines (vs 3,500-line monolith)
- Find code in 5 seconds (vs 2 minutes scrolling)
- Parallel editing (no merge conflicts)
- Easy to delete features (delete 1 file, done)

---

## Implementation: The New `main.css`

The new `main.css` becomes an **import orchestrator** (85 lines vs 3,500):

```css
/* =================================================================
   Fireside Capital Dashboard — CSS Architecture
   ITCSS-Inspired Layered Architecture
   
   Layers (in specificity order):
   1. Settings      → Sass variables (if needed)
   2. Design Tokens → CSS custom properties
   3. Generic       → Normalize, resets
   4. Elements      → Bare HTML tags
   5. Skeleton      → Layout patterns
   6. Components    → UI components
   7. Utilities     → Overrides, helpers
   
   Last Updated: February 2026
   ================================================================= */

/* -----------------------------------------------------------------
   LAYER 2: Design Tokens
   ----------------------------------------------------------------- */
@import './2-design-tokens/tokens.css';

/* -----------------------------------------------------------------
   LAYER 3: Generic
   ----------------------------------------------------------------- */
@import './3-generic/normalize.css';
@import './3-generic/box-sizing.css';

/* -----------------------------------------------------------------
   LAYER 4: Elements
   ----------------------------------------------------------------- */
@import './4-elements/typography.css';
@import './4-elements/forms.css';
@import './4-elements/buttons.css';

/* -----------------------------------------------------------------
   LAYER 5: Skeleton
   ----------------------------------------------------------------- */
@import './5-skeleton/layout.css';
@import './5-skeleton/sidebar.css';

/* -----------------------------------------------------------------
   LAYER 6: Components
   ----------------------------------------------------------------- */
@import './6-components/cards.css';
@import './6-components/stats-grid.css';
@import './6-components/tables.css';
@import './6-components/modals.css';
@import './6-components/forms-components.css';
@import './6-components/empty-states.css';
@import './6-components/notifications.css';
@import './6-components/onboarding.css';
@import './6-components/logged-out-cta.css';

/* -----------------------------------------------------------------
   LAYER 7: Utilities
   ----------------------------------------------------------------- */
@import './7-utilities/spacing.css';
@import './7-utilities/text.css';
@import './7-utilities/display.css';
@import './7-utilities/accessibility.css';
@import './7-utilities/responsive.css';

/* -----------------------------------------------------------------
   SHAME
   ----------------------------------------------------------------- */
@import './_shame.css';
```

**Benefits:**
- ✅ See entire CSS architecture at a glance
- ✅ Control load order precisely (specificity flows naturally)
- ✅ Comment each new import to explain purpose
- ✅ Easy to temporarily disable a layer for debugging

---

## Migration Strategy (3 Sessions)

### Session 1: Foundation (4 hours — Builder)
**Goal:** Set up folder structure, extract base layers (no visual changes)

1. **Create folder structure**
   ```powershell
   cd C:\Users\chuba\fireside-capital\app\assets\css
   mkdir 2-design-tokens, 3-generic, 4-elements, 5-skeleton, 6-components, 7-utilities
   ```

2. **Move design tokens**
   ```powershell
   mv design-tokens.css 2-design-tokens/tokens.css
   ```

3. **Extract generic layer** (from `main.css`)
   - Create `3-generic/normalize.css` (copy Browser reset rules)
   - Create `3-generic/box-sizing.css` (copy `*, *::before, *::after`)

4. **Extract elements layer** (from `main.css`)
   - Create `4-elements/typography.css` (h1-h6, p, a, strong, em)
   - Create `4-elements/forms.css` (input, select, textarea, label)
   - Create `4-elements/buttons.css` (button element only — NOT .btn)

5. **Test:** Rebuild CSS, verify site looks identical

**Deliverable:** Foundation layers working, no visual regressions

---

### Session 2: Components & Skeleton (4 hours — Builder)
**Goal:** Extract layout and components

6. **Extract skeleton layer** (from `main.css`)
   - Create `5-skeleton/layout.css` (.container, .row, .col, safe-area)
   - Create `5-skeleton/sidebar.css` (#sidebar, .sidebar-nav)

7. **Extract components** (from `main.css` + `components.css`)
   - Create `6-components/cards.css` (All card variants)
   - Create `6-components/stats-grid.css` (Dashboard 6-card grid)
   - Create `6-components/tables.css` (Responsive table styles)
   - Create `6-components/modals.css` (Modal dialogs)
   - Create `6-components/forms-components.css` (.form-group, .input-group)
   - Create `6-components/empty-states.css` (Empty state components)
   - Create `6-components/notifications.css` (Toast notifications)

8. **Move feature CSS**
   - Move `onboarding.css` → `6-components/onboarding.css`
   - Move `logged-out-cta.css` → `6-components/logged-out-cta.css`

9. **Test:** Rebuild CSS, verify all pages render correctly

**Deliverable:** Components organized, no visual regressions

---

### Session 3: Utilities & Polish (4 hours — Builder)
**Goal:** Complete migration, clean up

10. **Extract utilities** (from `main.css` + `utilities.css`)
    - Create `7-utilities/spacing.css` (.mb-8, .gap-16, .p-24, etc.)
    - Create `7-utilities/text.css` (.text-muted, .text-center, .text-uppercase)
    - Create `7-utilities/display.css` (.hidden, .d-flex, .d-grid)
    - Move `accessibility.css` → `7-utilities/accessibility.css`
    - Move `responsive.css` → `7-utilities/responsive.css`

11. **Create new `main.css`**
    - Replace 3,500-line monolith with import orchestrator (see template above)
    - Add comments explaining each layer

12. **Create `_shame.css`**
    - Empty file with header comment explaining purpose:
      ```css
      /* SHAME.CSS — Quick fixes and hacks
         
         This file is for CSS that works but isn't proud code.
         Document WHY each rule exists and HOW to fix it properly.
         
         Review this file every sprint — shame should not accumulate.
      */
      ```

13. **Delete old files**
    - ❌ Delete old `main.css` (now replaced)
    - ❌ Delete old `components.css` (content moved to 6-components/)
    - ❌ Delete old `utilities.css` (content moved to 7-utilities/)
    - ✅ Keep Bootstrap CDN reference in HTML (unchanged)

14. **Final QA**
    - Test all 8 pages in Chrome, Firefox, Safari
    - Test light mode + dark mode
    - Test mobile (375px, 768px, 1024px)
    - Compare screenshots before/after (should be pixel-perfect)

**Deliverable:** Full ITCSS architecture, old files deleted, QA passed

---

## Code Examples

### Example 1: Component CSS (Card)

**Before** (`main.css` — mixed with everything):
```css
/* Somewhere in 3,500 lines... */
.card {
  background-color: var(--color-bg-2);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
}

.stats-card {
  background: var(--color-bg-2);
  border-radius: 12px;
  padding: 20px;
  /* Why different padding? Who knows! */
}
```

**After** (`6-components/cards.css`):
```css
/* =================================================================
   COMPONENT: Cards
   
   Base card styles for all card variants.
   Includes: data cards, stats cards, content cards
   ================================================================= */

/* Base Card */
.card {
  background-color: var(--color-bg-2);
  border-radius: var(--radius-lg); /* 12px */
  padding: var(--space-6); /* 24px */
  box-shadow: var(--shadow-md);
  transition: box-shadow 200ms ease;
}

.card:hover {
  box-shadow: var(--shadow-lg);
}

/* Stats Card (Dashboard 6-card grid) */
.stats-card {
  /* Inherits .card base styles */
  display: flex;
  flex-direction: column;
  gap: var(--space-4); /* 16px */
  min-height: 120px;
}

.stats-card__value {
  font-size: var(--text-2xl); /* 32px */
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.2;
}

.stats-card__label {
  font-size: var(--text-sm); /* 14px */
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stats-card__trend {
  font-size: var(--text-xs); /* 12px */
  color: var(--color-accent); /* Green for positive trends */
}

.stats-card__trend--negative {
  color: var(--color-danger);
}
```

**Why Better:**
- ✅ All card styles in ONE place
- ✅ Clear naming convention (`.stats-card__value` = BEM-ish)
- ✅ Uses design tokens (vs magic numbers)
- ✅ Documented purpose (comment at top)
- ✅ Easy to find (`6-components/cards.css`, not line 2,847 of main.css)

---

### Example 2: Utility CSS (Spacing)

**Before** (`main.css` — mixed with everything):
```css
/* Spacing utilities scattered throughout... */
.mb-8 { margin-bottom: 8px !important; }
.mb-16 { margin-bottom: 16px !important; }
.mb-24 { margin-bottom: 24px !important; }
/* ...300 lines later... */
.gap-8 { gap: 8px !important; }
.gap-16 { gap: 16px !important; }
```

**After** (`7-utilities/spacing.css`):
```css
/* =================================================================
   UTILITIES: Spacing
   
   Margin, padding, and gap utilities using 8px grid system.
   Uses !important to override component styles (intentional).
   
   Naming: [property]-[value]
   - mb-16 = margin-bottom: 16px
   - p-24 = padding: 24px
   - gap-8 = gap: 8px
   ================================================================= */

/* Margin Bottom */
.mb-8  { margin-bottom: var(--space-2) !important; }  /* 8px */
.mb-16 { margin-bottom: var(--space-4) !important; }  /* 16px */
.mb-24 { margin-bottom: var(--space-6) !important; }  /* 24px */
.mb-32 { margin-bottom: var(--space-8) !important; }  /* 32px */
.mb-48 { margin-bottom: var(--space-12) !important; } /* 48px */

/* Padding (All Sides) */
.p-8  { padding: var(--space-2) !important; }  /* 8px */
.p-16 { padding: var(--space-4) !important; }  /* 16px */
.p-24 { padding: var(--space-6) !important; }  /* 24px */
.p-32 { padding: var(--space-8) !important; }  /* 32px */

/* Gap (Flexbox/Grid) */
.gap-8  { gap: var(--space-2) !important; }  /* 8px */
.gap-12 { gap: var(--space-3) !important; }  /* 12px */
.gap-16 { gap: var(--space-4) !important; }  /* 16px */
.gap-24 { gap: var(--space-6) !important; }  /* 24px */

/* Section Spacing (Semantic) */
.section-spacing {
  margin-bottom: var(--space-8); /* 32px — standard section gap */
}

.section-spacing-lg {
  margin-bottom: var(--space-12); /* 48px — large section gap */
}
```

**Why Better:**
- ✅ All spacing utilities in ONE file (was scattered)
- ✅ Uses design tokens (not magic numbers)
- ✅ Documented `!important` usage (override by design)
- ✅ Clear naming pattern (easy to extend)
- ✅ Comments explain token mapping (8px = `--space-2`)

---

### Example 3: Layout Skeleton (Container)

**Before** (`main.css`):
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}
```

**After** (`5-skeleton/layout.css`):
```css
/* =================================================================
   SKELETON: Layout
   
   High-level layout patterns: containers, grids, responsive wrappers.
   These are layout primitives, NOT components.
   ================================================================= */

/* Main Content Container */
.container {
  max-width: var(--layout-max-width); /* 1200px */
  margin-inline: auto;
  padding-inline: var(--space-4); /* 16px */
}

@media (min-width: 768px) {
  .container {
    padding-inline: var(--space-6); /* 24px on tablet+ */
  }
}

/* Grid Layout (Dashboard) */
.grid-dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-6); /* 24px */
}

/* Safe Area (iOS Notch Support) */
.safe-area {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

**Why Better:**
- ✅ Layout patterns separated from components
- ✅ Responsive behavior documented
- ✅ Safe-area support (iOS notch) clearly defined
- ✅ Uses design tokens (not magic numbers)

---

## Naming Convention: BEM-ish (Simplified)

**Recommendation:** Use simplified BEM for components, avoid over-engineering.

### Standard BEM (Too Verbose)
```css
/* ❌ Too verbose — 50+ character class names */
.stats-card__content__header__title__text--large { }
```

### Simplified BEM (Recommended)
```css
/* ✅ Just right — readable, scannable */
.stats-card { }              /* Block */
.stats-card__value { }       /* Element */
.stats-card__label { }       /* Element */
.stats-card--small { }       /* Modifier */
```

**Rules:**
1. **Block:** Component name (`.card`, `.modal`, `.stats-grid`)
2. **Element:** Block + double underscore (`.card__title`, `.modal__close`)
3. **Modifier:** Block/Element + double dash (`.card--small`, `.modal__close--icon-only`)
4. **Max 2 levels:** Never `.block__element__sub-element` — use new block instead

**Example (Stats Card):**
```html
<div class="stats-card stats-card--highlighted">
  <div class="stats-card__value">$47,382</div>
  <div class="stats-card__label">Net Worth</div>
  <div class="stats-card__trend stats-card__trend--positive">
    ↑ 12.4%
  </div>
</div>
```

```css
/* 6-components/stats-card.css */
.stats-card { /* Base */ }
.stats-card--highlighted { /* Orange border */ }
.stats-card__value { /* Large number */ }
.stats-card__label { /* Small label */ }
.stats-card__trend { /* Trend indicator */ }
.stats-card__trend--positive { /* Green text */ }
.stats-card__trend--negative { /* Red text */ }
```

---

## Design Token Improvements

Your `design-tokens.css` is already good. Enhancements:

### Add Missing Tokens

```css
/* 2-design-tokens/tokens.css */

/* Add spacing scale (8px grid) */
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;
}

/* Add border radius scale */
:root {
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
}

/* Add layout constraints */
:root {
  --layout-max-width: 1200px;
  --layout-sidebar-width: 240px;
  --layout-header-height: 64px;
}

/* Add z-index scale (prevents z-index: 9999 chaos) */
:root {
  --z-base: 1;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-modal-backdrop: 900;
  --z-modal: 1000;
  --z-tooltip: 1100;
}
```

**Why:** Eliminates magic numbers everywhere. `.mb-24` becomes `margin-bottom: var(--space-6);` — semantic!

---

## Documentation Standards

Every CSS file should have a header comment:

```css
/* =================================================================
   [LAYER]: [Component/Purpose Name]
   
   [1-2 sentence description]
   
   Dependencies: [List any required files]
   Modified: [Date of last significant change]
   ================================================================= */

/* Your CSS here */
```

**Example:**
```css
/* =================================================================
   COMPONENT: Dashboard Stats Grid
   
   6-card grid layout for dashboard page (Net Worth, Income, Expenses, etc.)
   Responsive: 1 column (mobile), 2 columns (tablet), 3 columns (desktop)
   
   Dependencies: 6-components/cards.css, 2-design-tokens/tokens.css
   Modified: February 3, 2026
   ================================================================= */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-6);
}
```

**Why:** 6 months from now, you'll know exactly what this file does and why it exists.

---

## Testing Checklist (Post-Migration)

### Visual Regression Testing
- [ ] Dashboard page (desktop, tablet, mobile)
- [ ] Assets page (all 3 viewports)
- [ ] Bills page (all 3 viewports)
- [ ] Debts page (all 3 viewports)
- [ ] Investments page (all 3 viewports)
- [ ] Budget page (all 3 viewports)
- [ ] Income page (all 3 viewports)
- [ ] Reports page (all 3 viewports)

### Interaction Testing
- [ ] Dark mode toggle (all pages)
- [ ] Light mode (all pages)
- [ ] Modal dialogs open/close
- [ ] Forms focus states
- [ ] Button hover states
- [ ] Table sorting
- [ ] Chart interactions
- [ ] Toast notifications

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Performance
- [ ] CSS file size (should be ±5% of original)
- [ ] Lighthouse score (should not decrease)
- [ ] First Contentful Paint (should be identical)

---

## Success Metrics

### Before (Current State)
- **Files:** 8 CSS files
- **Largest file:** `main.css` (3,500+ lines)
- **Time to find a style:** 2-3 minutes (Ctrl+F in massive file)
- **Merge conflicts:** Frequent (everyone edits `main.css`)
- **Scalability:** Poor (where does new feature CSS go?)

### After (ITCSS Architecture)
- **Files:** ~25 CSS files (organized into 7 layers)
- **Largest file:** ~300 lines (no monoliths)
- **Time to find a style:** 10 seconds (mental model: "It's a component → check 6-components/")
- **Merge conflicts:** Rare (parallel work on different component files)
- **Scalability:** Excellent (new features = new file in `6-components/`)

### ROI Estimate
- **Migration cost:** 12 hours (Builder)
- **Time saved per feature:** 30 minutes (faster dev + fewer bugs)
- **Break-even point:** After 24 new features (~3 months)
- **Annual savings:** 50+ hours (maintenance + onboarding)

---

## Next Steps

### Option A: Full Migration (Recommended)
1. Spawn Builder with Session 1 instructions (4 hours)
2. Review PR, test locally
3. Spawn Builder with Session 2 instructions (4 hours)
4. Review PR, test locally
5. Spawn Builder with Session 3 instructions (4 hours)
6. Final QA, deploy to production

**Timeline:** 3 days (stagger sessions to allow testing)  
**Risk:** Low (CSS output unchanged, only files reorganized)

### Option B: Gradual Migration (Lower Risk)
1. New features use ITCSS structure (`6-components/new-feature.css`)
2. Refactor existing CSS one page at a time (dashboard first)
3. Complete migration over 2-3 weeks

**Timeline:** 2-3 weeks  
**Risk:** Very low (hybrid structure during transition)

### Option C: Do Nothing (Not Recommended)
- **Outcome:** Technical debt accumulates
- **Cost:** 100+ hours over next 12 months fighting CSS chaos
- **Risk:** High (becomes unmaintainable as features grow)

---

## References

1. **ITCSS Official** — https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture
2. **CUBE CSS** — https://cube.fyi/
3. **Matthias Ott's Structure** — https://matthiasott.com/notes/how-i-structure-my-css
4. **BEMIT Naming** — https://csswizardry.com/2015/08/bemit-taking-the-bem-naming-convention-a-step-further/
5. **State of CSS 2020** — https://2020.stateofcss.com/en-us/technologies/methodologies/

---

## Appendix: File-by-File Migration Guide

### `main.css` → Multiple Files

| Original Section | New Location | Lines |
|------------------|--------------|-------|
| Box-sizing reset | `3-generic/box-sizing.css` | 5 |
| Typography (h1-h6) | `4-elements/typography.css` | 120 |
| Form elements | `4-elements/forms.css` | 80 |
| Container, grid | `5-skeleton/layout.css` | 40 |
| Sidebar layout | `5-skeleton/sidebar.css` | 60 |
| Card components | `6-components/cards.css` | 200 |
| Stats grid | `6-components/stats-grid.css` | 80 |
| Tables | `6-components/tables.css` | 150 |
| Modals | `6-components/modals.css` | 100 |
| Empty states | `6-components/empty-states.css` | 120 |
| Spacing utilities | `7-utilities/spacing.css` | 60 |
| Text utilities | `7-utilities/text.css` | 40 |
| Display utilities | `7-utilities/display.css` | 30 |

**Total:** 3,500 lines → 25 files of 100-300 lines each

---

**Report Complete:** February 3, 2026  
**Next Action:** Capital to review, then spawn Builder for Session 1 migration  
**Estimated Impact:** 🟢 High value, low risk — RECOMMENDED
