# CSS Architecture Research: ITCSS + BEMIT
**Date:** February 13, 2026  
**Status:** Complete  
**Tags:** research, css, architecture, sprint

## Summary
Researched CSS architecture methodologies (BEM, SMACSS, ITCSS, OOCSS) for financial dashboard. **Recommendation: ITCSS + BEMIT** for scalable, maintainable CSS.

## Why ITCSS?
- **Inverted Triangle CSS** organizes styles by specificity (low → high)
- **High satisfaction** (78%) among developers who use it
- **Prevents specificity wars** through layered architecture
- **Compatible with BEM** naming convention
- **Framework-agnostic** (works with vanilla CSS or preprocessors)
- **Low usage but high satisfaction** (State of CSS 2020)

## ITCSS Layers (7)
1. **Settings** – Variables (colors, fonts, breakpoints)
2. **Tools** – Mixins/functions (no CSS output)
3. **Generic** – Reset/normalize, box-sizing
4. **Elements** – Bare HTML styling (h1, a, p)
5. **Objects** – Layout patterns (grid, media object)
6. **Components** – UI components (cards, charts, tables)
7. **Utilities** – Helpers (hide, spacing overrides)

## BEMIT Naming Convention
Combines BEM with namespaces for clarity:
- `.c-card` = Component
- `.o-grid` = Object
- `.u-hide` = Utility
- `.is-active` = State
- `.js-toggle` = JavaScript hook

## Recommendations for Fireside Capital

### 1. File Structure
```
app/assets/css/
  01-settings/
    _colors.css
    _typography.css
    _spacing.css
  02-tools/
    (skip - not using preprocessor)
  03-generic/
    _reset.css
    _box-sizing.css
  04-elements/
    _headings.css
    _links.css
    _tables.css
  05-objects/
    _o-container.css
    _o-grid.css
    _o-media.css
  06-components/
    _c-dashboard-card.css
    _c-nav.css
    _c-chart.css
    _c-transaction-list.css
  07-utilities/
    _u-spacing.css
    _u-display.css
    _u-text.css
  main.css (imports all layers)
```

### 2. CSS Custom Properties for Theming
```css
/* 01-settings/_colors.css */
:root {
  /* Brand */
  --color-brand-blue: #01a4ef;
  --color-brand-orange: #f44e24;
  --color-brand-green: #81b900;
  
  /* Semantic */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8f9fa;
  --color-text-primary: #212529;
  --color-text-secondary: #6c757d;
  
  /* Financial */
  --color-positive: #28a745;
  --color-negative: #dc3545;
  --color-neutral: #6c757d;
}

[data-theme="dark"] {
  --color-bg-primary: #1a1d23;
  --color-bg-secondary: #2c2f36;
  --color-text-primary: #e9ecef;
  --color-text-secondary: #adb5bd;
}
```

### 3. Component Example
```css
/* 06-components/_c-dashboard-card.css */
.c-dashboard-card {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
}

.c-dashboard-card__title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-text-primary);
}

.c-dashboard-card__value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-brand-blue);
}

.c-dashboard-card--positive .c-dashboard-card__value {
  color: var(--color-positive);
}

.c-dashboard-card--negative .c-dashboard-card__value {
  color: var(--color-negative);
}
```

### 4. Spacing Utilities (avoid margin on components)
```css
/* 07-utilities/_u-spacing.css */
.u-mt-1 { margin-top: 0.5rem; }
.u-mt-2 { margin-top: 1rem; }
.u-mt-3 { margin-top: 1.5rem; }
.u-mt-4 { margin-top: 2rem; }

.u-mb-1 { margin-bottom: 0.5rem; }
.u-mb-2 { margin-bottom: 1rem; }
.u-mb-3 { margin-bottom: 1.5rem; }
.u-mb-4 { margin-bottom: 2rem; }

.u-gap-1 { gap: 0.5rem; }
.u-gap-2 { gap: 1rem; }
.u-gap-3 { gap: 1.5rem; }
.u-gap-4 { gap: 2rem; }
```

## Best Practices
1. **One file per component** – easier to maintain
2. **Limit nesting to 2 levels** – avoid overqualified selectors
3. **Don't abstract too early** – repetition is OK in independent components
4. **Keep components self-contained** – use utilities for spacing, not component margins
5. **Use namespaces consistently** – makes code scannable
6. **Separate spacing from components** – "Margin breaks component encapsulation"

## Migration Strategy
1. Create ITCSS folder structure in `app/assets/css/`
2. Extract existing Bootstrap overrides → Settings layer
3. Move component styles → Components layer
4. Create utilities for spacing → Utilities layer
5. Update HTML pages to use BEMIT class names
6. Update `index.html` to load `main.css` instead of inline styles

## Implementation Tasks
- [ ] Set up ITCSS folder structure in app/assets/css/
- [ ] Create CSS custom properties for theming (dark mode ready)
- [ ] Migrate inline styles to component files
- [ ] Build spacing utility classes
- [ ] Update HTML with BEMIT class names
- [ ] Document naming conventions in README

## Resources
- **ITCSS Guide:** https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture
- **BEMIT Naming:** https://csswizardry.com/2015/08/bemit-taking-the-bem-naming-convention-a-step-further/
- **BEM Cheat Sheet:** https://9elements.com/bem-cheat-sheet/
- **Harry Roberts ITCSS Talk:** https://www.youtube.com/watch?v=1OKZOV-iLj4
- **State of CSS 2020:** https://2020.stateofcss.com/

## Notes
- ITCSS has high satisfaction (78%) but declining usage trend
- Partially proprietary (best learned via Harry Roberts' Skillshare class)
- Works great for projects without built-in CSS scoping (like plain HTML/Bootstrap)
- Xfive has used it successfully for 5+ years in WordPress and React projects
