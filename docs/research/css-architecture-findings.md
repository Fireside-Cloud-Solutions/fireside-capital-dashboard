# CSS Architecture Research — Fireside Capital

**Date:** 2026-02-22  
**Researcher:** Capital (Orchestrator)  
**Status:** Recommendations Ready

---

## Summary

Researched CSS architecture methodologies (BEM, SMACSS, ITCSS) to establish a scalable, maintainable CSS system for the Fireside Capital dashboard.

**Recommendation:** ITCSS + BEM naming convention

---

## Methodologies Evaluated

### BEM (Block Element Modifier)
- **Pros:** Clear naming, prevents collisions, self-documenting
- **Cons:** Verbose class names
- **Use Case:** Component naming within ITCSS

### SMACSS (Scalable and Modular Architecture for CSS)
- **Pros:** 5-category system (Base, Layout, Module, State, Theme)
- **Cons:** Less prescriptive than ITCSS
- **Use Case:** Good for smaller projects

### ITCSS (Inverted Triangle CSS)
- **Pros:** Organizes by specificity, perfect for Bootstrap apps, prevents specificity wars
- **Cons:** Requires disciplined file organization
- **Use Case:** **CHOSEN** — Best fit for our Bootstrap 5 + custom CSS setup

---

## Proposed ITCSS Structure

```
app/assets/css/
├── 1-settings/       # CSS variables, configuration
│   └── _variables.css
├── 2-tools/          # Mixins, functions (if preprocessor added)
├── 3-generic/        # Normalize, resets
│   └── _normalize.css
├── 4-elements/       # Base HTML element styling
│   └── _typography.css
├── 5-objects/        # Layout patterns (OOCSS)
│   └── _grid.css
├── 6-components/     # UI components (BEM naming)
│   ├── _card.css
│   ├── _chart-container.css
│   ├── _metric-box.css
│   └── _bill-item.css
├── 7-utilities/      # Helper classes
│   └── _utilities.css
└── main.css          # Master import file
```

**Naming Convention:**
- Components: `.c-block__element--modifier`
- Objects (layouts): `.o-layout__item`
- Utilities: `.u-text-center`, `.u-margin-top-lg`

---

## Implementation Example

### Before (Current Approach)
```css
.card {
  padding: 20px;
}
.card .title {
  font-size: 18px;
}
.card.important {
  border: 2px solid red;
}
```

### After (ITCSS + BEM)
```css
/* 6-components/_metric-card.css */
.c-metric-card {
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.c-metric-card__title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
}

.c-metric-card__value {
  font-size: var(--font-size-2xl);
  color: var(--color-primary);
}

.c-metric-card--alert {
  border-left: 4px solid var(--color-danger);
}
```

**HTML:**
```html
<div class="c-metric-card c-metric-card--alert">
  <h3 class="c-metric-card__title">Net Worth</h3>
  <p class="c-metric-card__value">$125,430</p>
</div>
```

---

## CSS Variable System (Settings Layer)

```css
/* 1-settings/_variables.css */
:root {
  /* Colors */
  --color-primary: #01a4ef;
  --color-secondary: #f44e24;
  --color-success: #81b900;
  --color-danger: #dc3545;
  --color-warning: #ffc107;
  --color-surface: #ffffff;
  --color-background: #f8f9fa;
  --color-text: #212529;
  --color-text-muted: #6c757d;
  
  /* Spacing */
  --spacing-xs: 0.25rem;   /* 4px */
  --spacing-sm: 0.5rem;    /* 8px */
  --spacing-md: 1rem;      /* 16px */
  --spacing-lg: 1.5rem;    /* 24px */
  --spacing-xl: 2rem;      /* 32px */
  --spacing-2xl: 3rem;     /* 48px */
  
  /* Typography */
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 2rem;      /* 32px */
  
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
}
```

---

## Benefits

### Scalability
- Easy to add new components without affecting existing ones
- Clear layer boundaries prevent specificity conflicts

### Maintainability
- Self-documenting class names reduce cognitive load
- Sub-agents can follow consistent naming patterns
- Easy to locate styles (component name = file name)

### Performance
- Eliminates redundant CSS
- Reduces specificity wars
- Smaller final CSS bundle

### Collaboration
- Clear conventions for multi-agent development
- Predictable structure for code review

---

## Migration Strategy

### Phase 1: Foundation (Week 1)
1. Create ITCSS folder structure
2. Implement CSS variable system
3. Extract Bootstrap overrides to settings layer

### Phase 2: Component Migration (Week 2-3)
1. Identify all current components
2. Create BEM-named component files
3. Migrate styles component-by-component
4. Update HTML templates

### Phase 3: Cleanup (Week 4)
1. Remove old CSS files
2. Optimize variable usage
3. Document component library
4. Create style guide

---

## Implementation Tasks

- [ ] Create ITCSS folder structure in `app/assets/css/`
- [ ] Build CSS variable system (`1-settings/_variables.css`)
- [ ] Audit existing `styles.css` and categorize rules
- [ ] Create component files with BEM naming
- [ ] Update HTML templates to use new class names
- [ ] Create `main.css` import manifest
- [ ] Document component usage in style guide

---

## References

- [ITCSS: Scalable and Maintainable CSS Architecture](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture)
- [BEM Methodology](http://getbem.com/)
- [Organizing CSS: OOCSS, SMACSS, and BEM](https://mattstauffer.com/blog/organizing-css-oocss-smacss-and-bem/)
- [5 Methodologies for Architecting CSS](https://www.valoremreply.com/resources/insights/blog/2020/november/5-methodologies-for-architecting-css/)
