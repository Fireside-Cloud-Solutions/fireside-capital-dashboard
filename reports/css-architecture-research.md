# CSS Architecture Research — February 10, 2026

## Recommendation: ITCSS + BEMIT Naming

After researching CSS architecture methodologies, I recommend **ITCSS (Inverted Triangle CSS)** with **BEMIT naming conventions** for the Fireside Capital dashboard.

---

## Why ITCSS?

- **Manages specificity naturally** — Styles flow from generic to specific, preventing specificity wars
- **Highly flexible** — Only use the layers you need (no boilerplate overhead)
- **Battle-tested** — 78% satisfaction rating (State of CSS 2020)
- **Works with existing tools** — Compatible with Bootstrap, preprocessors, vanilla CSS
- **Perfect for financial dashboards** — Excels at organizing complex component libraries

---

## ITCSS Layers (Inverted Triangle)

1. **Settings** — Variables (colors, fonts, breakpoints)
2. **Tools** — Mixins and functions
3. **Generic** — Resets, normalize, box-sizing
4. **Elements** — Base HTML element styles (h1, a, p)
5. **Objects** — Unstyled design patterns (layouts, grids)
6. **Components** — Specific UI components (cards, buttons, charts)
7. **Utilities** — Helper classes (spacing, hide, text-center)

Specificity increases as you go down the triangle. Generic styles at the top, specific overrides at the bottom.

---

## BEMIT Naming Convention

Combine BEM (Block Element Modifier) with namespace prefixes:

- **c-** = Component (`.c-card`, `.c-button`, `.c-dashboard-card`)
- **o-** = Object (`.o-layout`, `.o-media`, `.o-container`)
- **u-** = Utility (`.u-mt-2`, `.u-hide`, `.u-text-center`)
- **t-** = Theme (`.t-dark`, `.t-light`)
- **is-** / **has-** = State (`.is-active`, `.has-error`, `.is-loading`)

### BEM Structure:
```css
.block { }
.block__element { }
.block--modifier { }
.block__element--modifier { }
```

### BEMIT Example:
```css
.c-dashboard-card { }                      /* component */
.c-dashboard-card__header { }              /* element */
.c-dashboard-card__title { }               /* element */
.c-dashboard-card--highlight { }           /* modifier */
.c-dashboard-card.is-loading { }           /* state */
```

---

## Recommended File Structure

```
app/assets/css/
├── 1-settings/
│   ├── _colors.css
│   ├── _typography.css
│   └── _breakpoints.css
├── 2-tools/
│   └── _mixins.css
├── 3-generic/
│   ├── _reset.css
│   └── _box-sizing.css
├── 4-elements/
│   ├── _headings.css
│   ├── _links.css
│   └── _forms.css
├── 5-objects/
│   ├── _o-container.css
│   ├── _o-layout.css
│   └── _o-grid.css
├── 6-components/
│   ├── _c-dashboard-card.css
│   ├── _c-chart-container.css
│   ├── _c-transaction-list.css
│   ├── _c-bill-reminder.css
│   ├── _c-net-worth-display.css
│   ├── _c-asset-summary.css
│   ├── _c-debt-tracker.css
│   └── ...
├── 7-utilities/
│   ├── _u-spacing.css
│   ├── _u-visibility.css
│   └── _u-text.css
└── main.css (imports all in order)
```

### main.css imports in ITCSS order:
```css
/* Settings */
@import '1-settings/_colors.css';
@import '1-settings/_typography.css';
@import '1-settings/_breakpoints.css';

/* Tools */
@import '2-tools/_mixins.css';

/* Generic */
@import '3-generic/_reset.css';
@import '3-generic/_box-sizing.css';

/* Elements */
@import '4-elements/_headings.css';
@import '4-elements/_links.css';
@import '4-elements/_forms.css';

/* Objects */
@import '5-objects/_o-container.css';
@import '5-objects/_o-layout.css';
@import '5-objects/_o-grid.css';

/* Components */
@import '6-components/_c-dashboard-card.css';
@import '6-components/_c-chart-container.css';
/* ... */

/* Utilities */
@import '7-utilities/_u-spacing.css';
@import '7-utilities/_u-visibility.css';
@import '7-utilities/_u-text.css';
```

---

## Key Principles

1. **One file per component** — Easy to find and maintain
2. **Limit nesting to 2 levels** — Avoid overqualified selectors
3. **Separate spacing from components** — Use utility classes for margins
4. **Don't overuse objects** — When in doubt, make it a component
5. **Keep components independent** — No external margins on components
6. **No styles in first 2 layers** — Settings and Tools generate no CSS output
7. **Use namespaces religiously** — Makes code self-documenting

---

## Example: Dashboard Card Component

```css
/* 6-components/_c-dashboard-card.css */

.c-dashboard-card {
  background: var(--card-bg);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.c-dashboard-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.c-dashboard-card__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.c-dashboard-card__icon {
  width: 24px;
  height: 24px;
  opacity: 0.7;
}

.c-dashboard-card__body {
  /* card content area */
}

.c-dashboard-card__footer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

/* Modifiers */
.c-dashboard-card--highlight {
  border-left: 4px solid var(--primary-color);
}

.c-dashboard-card--warning {
  border-left: 4px solid var(--warning-color);
}

.c-dashboard-card--error {
  border-left: 4px solid var(--danger-color);
}

.c-dashboard-card--compact {
  padding: 1rem;
}

/* States */
.c-dashboard-card.is-loading {
  opacity: 0.6;
  pointer-events: none;
}
```

### HTML Usage:
```html
<div class="c-dashboard-card c-dashboard-card--highlight u-mb-3">
  <div class="c-dashboard-card__header">
    <h3 class="c-dashboard-card__title">Net Worth</h3>
    <span class="c-dashboard-card__icon">💰</span>
  </div>
  <div class="c-dashboard-card__body">
    <p class="c-dashboard-card__value">$125,430</p>
    <p class="c-dashboard-card__change u-text-success">+$2,340 this month</p>
  </div>
</div>
```

---

## Example: Spacing Utilities

```css
/* 7-utilities/_u-spacing.css */

/* Margin utilities */
.u-m-0 { margin: 0 !important; }
.u-m-1 { margin: 0.25rem !important; }
.u-m-2 { margin: 0.5rem !important; }
.u-m-3 { margin: 1rem !important; }
.u-m-4 { margin: 1.5rem !important; }
.u-m-5 { margin: 3rem !important; }

/* Margin top */
.u-mt-0 { margin-top: 0 !important; }
.u-mt-1 { margin-top: 0.25rem !important; }
.u-mt-2 { margin-top: 0.5rem !important; }
.u-mt-3 { margin-top: 1rem !important; }
.u-mt-4 { margin-top: 1.5rem !important; }
.u-mt-5 { margin-top: 3rem !important; }

/* Margin bottom */
.u-mb-0 { margin-bottom: 0 !important; }
.u-mb-1 { margin-bottom: 0.25rem !important; }
.u-mb-2 { margin-bottom: 0.5rem !important; }
.u-mb-3 { margin-bottom: 1rem !important; }
.u-mb-4 { margin-bottom: 1.5rem !important; }
.u-mb-5 { margin-bottom: 3rem !important; }

/* ... similar for ml, mr, mx, my, p, pt, pb, pl, pr, px, py */
```

**Why !important on utilities?** Because utilities are intentionally high-specificity overrides that should always win. They're the last layer in ITCSS.

---

## Integration with Bootstrap

Current setup uses Bootstrap 5. Here's how ITCSS fits:

1. **Keep Bootstrap as the Generic layer** — Use Bootstrap's reset, grid system, base styles
2. **Override Bootstrap variables in Settings layer** — Customize colors, spacing, typography
3. **Build custom components in Components layer** — Don't rely on Bootstrap components like `.card`, `.btn` — create `.c-dashboard-card`, `.c-primary-button` instead
4. **Use Bootstrap utilities sparingly** — Prefer custom utilities with BEMIT naming for consistency
5. **Let ITCSS take over specificity management** — Bootstrap's specificity can be tamed by ITCSS ordering

### Example: Customizing Bootstrap
```css
/* 1-settings/_colors.css */
:root {
  --bs-primary: #01a4ef;  /* Override Bootstrap primary */
  --bs-success: #81b900;
  --bs-danger: #f44e24;
  
  /* Custom variables */
  --card-bg: #ffffff;
  --text-primary: #333333;
  --border-color: #e5e5e5;
}
```

---

## Benefits for Fireside Capital

1. **Scalability** — Easy to add new financial components (budgets, investments, debts)
2. **Maintainability** — Clear structure for finding and updating styles
3. **Team collaboration** — Namespaces make it obvious where styles belong
4. **Specificity control** — No more `!important` hacks (except in utilities where intended)
5. **Performance** — Easier to audit unused CSS and tree-shake
6. **Consistency** — Naming conventions enforce design system compliance
7. **Documentation** — Code becomes self-documenting with BEMIT

---

## Migration Strategy

### Phase 1: Setup (1-2 hours)
1. Create ITCSS folder structure in `app/assets/css/`
2. Create `main.css` with layer imports
3. Move existing color/font variables to `1-settings/`

### Phase 2: Extract Components (3-4 hours)
1. Identify existing components (dashboard cards, charts, transaction lists)
2. Extract each component to separate file in `6-components/`
3. Refactor class names to use BEMIT conventions
4. Remove external margins, replace with utility classes

### Phase 3: Build Utilities (1-2 hours)
1. Create spacing utilities (`7-utilities/_u-spacing.css`)
2. Create visibility utilities (`7-utilities/_u-visibility.css`)
3. Create text utilities (`7-utilities/_u-text.css`)

### Phase 4: Migrate Pages (2-3 hours per page)
1. Update HTML to use new class names
2. Test each page thoroughly
3. Remove old CSS once verified
4. Migrate one page at a time (start with dashboard)

**Total estimated effort:** 2-3 days

---

## Resources

- **ITCSS Guide:** https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture
- **BEMIT Naming:** https://csswizardry.com/2015/08/bemit-taking-the-bem-naming-convention-a-step-further/
- **CSS Guidelines:** https://cssguidelin.es/
- **BEM Methodology:** https://en.bem.info/methodology/
- **BEM Cheat Sheet:** https://9elements.com/bem-cheat-sheet/

---

## Next Steps

1. ✅ **Research complete** — Document saved
2. ⬜ **Create ITCSS folder structure**
3. ⬜ **Build spacing utility system**
4. ⬜ **Migrate first component** (dashboard card)
5. ⬜ **Update component library documentation**

---

**Research completed:** February 10, 2026  
**Researcher:** Capital (Fireside Capital AI)  
**Status:** Ready for implementation
