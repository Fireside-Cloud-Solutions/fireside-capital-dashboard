# CSS Architecture Research — Fireside Capital
**Research Date:** February 12, 2026  
**Researcher:** Capital (Fireside Capital AI)  
**Status:** Complete ✅

## Executive Summary
The Fireside Capital dashboard has a solid CSS foundation (design tokens, modular files) but lacks a formal architecture pattern. Implementing **ITCSS + BEMIT** will improve maintainability, reduce specificity conflicts, and make the codebase more scalable.

**Recommended Action:** Refactor to ITCSS layer structure with BEMIT naming conventions.

---

## Current State Analysis

### File Structure (8 CSS files, 210KB total)
```
app/assets/css/
├── accessibility.css       11.7 KB
├── components.css          33.3 KB
├── design-tokens.css       13.6 KB
├── financial-patterns.css  10.5 KB
├── logged-out-cta.css       4.6 KB
├── main.css                91.1 KB  ⚠️ Too large
├── onboarding.css           8.2 KB
├── responsive.css          28.3 KB
└── utilities.css            9.0 KB
```

### Strengths ✅
- **Design tokens system** — All brand colors, spacing, typography centralized in `design-tokens.css`
- **Modular approach** — Separate files for concerns (components, utilities, responsive)
- **Dark-first design** — Consistent with brand
- **Good documentation** — Comments explain purpose and usage

### Weaknesses ⚠️
- **No ITCSS layer structure** — Files organized by *type*, not *specificity*
- **`main.css` too large** (91KB) — Should be split into layers
- **No BEMIT naming** — Classes like `.card`, `.btn` lack namespaces (`.c-card`, `.o-media`)
- **Inconsistent nesting** — Some deep nesting increases specificity unnecessarily
- **No spacing system** — Margins/padding mixed into components (breaks encapsulation)

---

## Research Findings

### What is ITCSS? (Inverted Triangle CSS)
Created by Harry Roberts, ITCSS organizes CSS by **specificity** (low → high):

```
          Settings     ← Preprocessor variables (design tokens)
            Tools      ← Mixins, functions (no CSS output)
           Generic     ← Resets, normalize, box-sizing
          Elements     ← Bare HTML (h1, p, a)
         Objects       ← Layout patterns (.o-media, .o-container)
       Components      ← UI components (.c-card, .c-button)
      Utilities        ← Helpers (.u-hide, .u-mt-16)
```

### Why ITCSS?
- **Avoids specificity wars** — Layers increase in specificity naturally
- **Healthy CSS graph** — No spikes in specificity
- **Predictable** — Know where styles live
- **Flexible** — Don't need all layers

### BEMIT Naming Convention
Combines BEM with namespaces for clarity:

| Prefix | Type | Example |
|--------|------|---------|
| `.c-` | Component | `.c-card`, `.c-button` |
| `.o-` | Object (layout) | `.o-media`, `.o-container` |
| `.u-` | Utility | `.u-hide`, `.u-mt-16` |
| `.t-` | Theme | `.t-dark`, `.t-light` |
| `.is-` `.has-` | State | `.is-active`, `.has-error` |
| `.js-` | JavaScript hook | `.js-toggle` |

---

## Recommendations for Fireside Capital

### 1. Reorganize to ITCSS Structure (Priority: HIGH)

**Current:**
```
assets/css/
├── main.css
├── components.css
├── utilities.css
└── ...
```

**Proposed:**
```
assets/css/
├── 1-settings/
│   └── _design-tokens.css    (existing file, rename)
├── 2-tools/
│   └── _mixins.css            (future — optional)
├── 3-generic/
│   └── _reset.css             (extract from main.css)
├── 4-elements/
│   └── _base.css              (extract from main.css)
├── 5-objects/
│   ├── _container.css
│   ├── _media.css
│   └── _grid.css              (layout patterns only)
├── 6-components/
│   ├── _button.css
│   ├── _card.css
│   ├── _navbar.css
│   ├── _chart.css
│   └── ... (50+ components from main.css)
├── 7-utilities/
│   ├── _spacing.css           (NEW — spacing system)
│   ├── _visibility.css
│   └── _text.css
└── main.css                   (imports all layers)
```

**main.css becomes:**
```css
/* ITCSS Layer Imports */
@import '1-settings/_design-tokens.css';
@import '3-generic/_reset.css';
@import '4-elements/_base.css';
@import '5-objects/_container.css';
@import '6-components/_button.css';
@import '6-components/_card.css';
/* ... */
@import '7-utilities/_spacing.css';
```

**Implementation Code:**
```powershell
# Create ITCSS folder structure
New-Item -ItemType Directory -Path "app/assets/css/1-settings"
New-Item -ItemType Directory -Path "app/assets/css/3-generic"
New-Item -ItemType Directory -Path "app/assets/css/4-elements"
New-Item -ItemType Directory -Path "app/assets/css/5-objects"
New-Item -ItemType Directory -Path "app/assets/css/6-components"
New-Item -ItemType Directory -Path "app/assets/css/7-utilities"

# Move existing files
Move-Item "app/assets/css/design-tokens.css" "app/assets/css/1-settings/_design-tokens.css"
Move-Item "app/assets/css/utilities.css" "app/assets/css/7-utilities/_utilities.css"
```

---

### 2. Adopt BEMIT Naming (Priority: MEDIUM)

**Before:**
```css
.card { ... }
.card-header { ... }
.card-body { ... }
.card.card-dark { ... }
```

**After:**
```css
.c-card { ... }
.c-card__header { ... }
.c-card__body { ... }
.c-card--dark { ... }
```

**Migration Strategy:**
1. Keep old classes for compatibility
2. Add new BEMIT classes alongside
3. Update HTML templates to use new classes
4. Remove old classes after verification

**Example Migration:**
```css
/* Backward compatible during transition */
.card,
.c-card {
  background: var(--color-bg-2);
  border-radius: var(--radius-md);
  padding: var(--space-24);
}

.card-header,
.c-card__header {
  font-size: var(--text-lg);
  font-weight: 600;
  margin-bottom: var(--space-16);
}
```

---

### 3. Create Spacing System (Priority: HIGH)

**Problem:** Components have hardcoded margins, breaking encapsulation.

**Solution:** Utility classes for spacing (like Tailwind).

**Create `7-utilities/_spacing.css`:**
```css
/* Spacing Utility System — 8px Grid
   Usage: <div class="u-mt-16 u-mb-24">
   Replaces: margin-top/bottom in components
*/

/* Margin Top */
.u-mt-0 { margin-top: 0 !important; }
.u-mt-8 { margin-top: 8px !important; }
.u-mt-16 { margin-top: 16px !important; }
.u-mt-24 { margin-top: 24px !important; }
.u-mt-32 { margin-top: 32px !important; }
.u-mt-48 { margin-top: 48px !important; }

/* Margin Bottom */
.u-mb-0 { margin-bottom: 0 !important; }
.u-mb-8 { margin-bottom: 8px !important; }
.u-mb-16 { margin-bottom: 16px !important; }
.u-mb-24 { margin-bottom: 24px !important; }
.u-mb-32 { margin-bottom: 32px !important; }
.u-mb-48 { margin-bottom: 48px !important; }

/* Margin Left/Right */
.u-ml-8 { margin-left: 8px !important; }
.u-ml-16 { margin-left: 16px !important; }
.u-mr-8 { margin-right: 8px !important; }
.u-mr-16 { margin-right: 16px !important; }

/* Padding variants (same pattern) */
.u-p-0 { padding: 0 !important; }
.u-p-8 { padding: 8px !important; }
.u-p-16 { padding: 16px !important; }
.u-p-24 { padding: 24px !important; }
.u-p-32 { padding: 32px !important; }

/* Responsive spacing (mobile override) */
@media (max-width: 767px) {
  .u-mt-16-mobile { margin-top: 16px !important; }
  .u-mb-16-mobile { margin-bottom: 16px !important; }
}
```

**Before (component with hardcoded margin):**
```css
.c-card {
  margin-bottom: 24px; /* ❌ Breaks encapsulation */
}
```

**After (component + utility):**
```css
/* Component — no margin */
.c-card {
  background: var(--color-bg-2);
  padding: var(--space-24);
}
```

```html
<!-- HTML — spacing controlled at layout level -->
<div class="c-card u-mb-24">...</div>
```

---

### 4. Reduce Nesting Depth (Priority: MEDIUM)

**Current Problem:**
```css
.card {
  .card-header {
    .card-title {
      span {
        /* 4 levels deep — hard to override */
      }
    }
  }
}
```

**Recommended:**
```css
/* Flat structure — easier to scan, search, override */
.c-card { ... }
.c-card__header { ... }
.c-card__title { ... }
.c-card__title-icon { ... }
```

**Rule:** Max 2 levels of nesting. Use BEM for structure, not nesting.

---

### 5. Component Documentation Template (Priority: LOW)

Each component file should have a header:

```css
/* ===================================================================
   Component: Card (.c-card)
   Description: Generic card container with header, body, footer
   
   Modifiers:
   - .c-card--dark     Dark background variant
   - .c-card--compact  Reduced padding
   
   Elements:
   - .c-card__header   Card header (optional)
   - .c-card__body     Main content area
   - .c-card__footer   Footer actions (optional)
   
   Usage:
   <div class="c-card u-mb-24">
     <div class="c-card__header">Title</div>
     <div class="c-card__body">Content</div>
   </div>
   
   Dependencies: design-tokens.css
   =================================================================== */

.c-card { ... }
```

---

## Implementation Priority

| Task | Priority | Effort | Impact |
|------|----------|--------|--------|
| Create spacing utility system | **HIGH** | 2h | Immediate DX improvement |
| Reorganize to ITCSS folders | **HIGH** | 4h | Foundation for growth |
| Split `main.css` into components | **HIGH** | 6h | Maintainability |
| Add BEMIT naming (gradual) | MEDIUM | Ongoing | Clarity |
| Reduce nesting depth | MEDIUM | 3h | Specificity health |
| Add component documentation | LOW | Ongoing | Team onboarding |

**Total Estimated Effort:** 15-20 hours for full refactor

---

## Success Metrics

### Before
- ❌ `main.css` = 91KB (2800+ lines)
- ❌ No naming convention
- ❌ Specificity conflicts in responsive.css
- ❌ Hard to find component styles

### After
- ✅ Largest file < 20KB
- ✅ BEMIT naming → instant recognition
- ✅ ITCSS layers → predictable specificity
- ✅ Spacing system → consistent layouts
- ✅ Component-per-file → easy location

---

## References

- [ITCSS: Scalable CSS Architecture](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture)
- [BEMIT Naming Convention](https://csswizardry.com/2015/08/bemit-taking-the-bem-naming-convention-a-step-further/)
- [BEM Official Methodology](https://en.bem.info/methodology/)
- [Margin Breaks Component Encapsulation](https://mxstbr.com/thoughts/margin/)
- [State of CSS 2020 — ITCSS](https://2020.stateofcss.com/en-US/technologies/)

---

## Next Steps

1. ✅ Research complete — documented in `reports/css-architecture-research.md`
2. ⏭️ Create Azure DevOps work items for implementation tasks
3. ⏭️ Get founder approval on ITCSS refactor approach
4. ⏭️ Spawn Builder sub-agent to execute refactor in phases

---

**Research Status:** ✅ COMPLETE  
**Recommendations:** 6 actionable improvements with code examples  
**Ready for Implementation:** YES
