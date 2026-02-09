# Azure DevOps Work Items — CSS Architecture Research
**Created:** February 9, 2026  
**Project:** Fireside Capital  
**Area:** Research → Implementation

---

## Work Item 1: Split main.css into Logical Modules

**Type:** Task  
**Priority:** High  
**Effort:** 4 hours  
**Sprint:** Sprint 1  
**Assigned To:** Builder

### Description
Split the monolithic `main.css` (3,600 lines) into logical, maintainable modules following industry best practices.

### Acceptance Criteria
- [ ] Create new directory structure: `css/base/`, `css/components/`, `css/pages/`, `css/vendors/`
- [ ] Split main.css into:
  - `base/typography.css`
  - `base/layout.css`
  - `base/reset.css`
  - `components/buttons.css`
  - `components/cards.css`
  - `components/forms.css`
  - `components/tables.css`
  - `components/modals.css`
  - `vendors/bootstrap-overrides.css`
- [ ] Update `index.html` to reference new CSS files (or create a build process)
- [ ] Verify no visual regressions on all pages
- [ ] Test on desktop, tablet, mobile breakpoints
- [ ] Test dark/light theme switching

### Implementation Notes
- Keep `design-tokens.css` as-is (it's already well-structured)
- Preserve all existing functionality
- Maintain import order for CSS cascade
- Document any breaking changes

### Related Research
`reports/css-architecture-research.md` — Section: "Split main.css into Logical Modules"

---

## Work Item 2: Expand Utility Class System

**Type:** Task  
**Priority:** High  
**Effort:** 2 hours  
**Sprint:** Sprint 1  
**Assigned To:** Builder

### Description
Generate comprehensive utility classes for spacing, layout, and typography using the auto-generator script.

### Acceptance Criteria
- [ ] Run `node scripts/generate-utilities.js` to create `utilities-generated.css`
- [ ] Add generated utilities to `index.html`
- [ ] Verify utilities work correctly (test margin/padding/gap classes)
- [ ] Document utility class naming convention in README
- [ ] Refactor 3-5 existing components to use utility classes instead of custom CSS
- [ ] Measure CSS file size reduction (if any)

### Implementation Notes
- Script location: `scripts/generate-utilities.js`
- Output: `app/assets/css/utilities-generated.css`
- Naming convention: `.m-{size}`, `.p-{size}`, `.gap-{size}`, `.d-flex`, etc.
- All utilities use `!important` to ensure they override component styles

### Related Research
`reports/css-architecture-research.md` — Section: "Expand Utility Class System"

---

## Work Item 3: Implement CSS Container Queries

**Type:** Task  
**Priority:** High  
**Effort:** 3 hours  
**Sprint:** Sprint 2  
**Assigned To:** Builder

### Description
Add CSS container queries to dashboard cards and charts for component-level responsiveness.

### Acceptance Criteria
- [ ] Enable `container-type: inline-size` on `.card-grid` and `.chart-wrapper`
- [ ] Implement container queries for `.dashboard-card` (3 breakpoints: < 300px, < 400px, < 600px)
- [ ] Implement container queries for `.chart-card` (2 breakpoints: < 400px, < 600px)
- [ ] Test cards in different grid layouts (1-col, 2-col, 3-col, 4-col)
- [ ] Verify responsive behavior on mobile, tablet, desktop
- [ ] Document browser support (Chrome 106+, Firefox 110+, Safari 16+)

### Implementation Notes
```css
.card-grid {
  container-type: inline-size;
  container-name: card-grid;
}

@container card-grid (max-width: 400px) {
  .dashboard-card {
    padding: var(--space-4);
  }
  .dashboard-card p {
    font-size: 1.5rem;
  }
}
```

### Browser Support
- Chrome 106+ ✅
- Firefox 110+ ✅
- Safari 16+ ✅
- Edge 106+ ✅

### Related Research
`reports/css-architecture-research.md` — Section: "Add CSS Container Queries"

---

## Work Item 4: Extract Critical CSS

**Type:** Task  
**Priority:** Medium  
**Effort:** 6 hours  
**Sprint:** Sprint 2  
**Assigned To:** Builder

### Description
Implement critical CSS extraction to improve First Contentful Paint (FCP) performance.

### Acceptance Criteria
- [ ] Extract critical CSS for above-the-fold content
- [ ] Inline critical CSS in `<head>`
- [ ] Defer non-critical CSS loading
- [ ] Add fallback for no-JS scenarios
- [ ] Test on Dashboard, Assets, Bills, Budget pages
- [ ] Measure FCP improvement (baseline vs optimized)
- [ ] Target: < 1.5s FCP on 3G connection

### Implementation Notes
```html
<head>
  <!-- Inline critical CSS -->
  <style>
    /* design-tokens.css + base layout styles */
  </style>
  
  <!-- Defer non-critical CSS -->
  <link rel="preload" href="assets/css/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="assets/css/main.css"></noscript>
</head>
```

**Tools:**
- Critical CSS generator: `npm install critical --save-dev`
- Lighthouse CI for performance testing

### Related Research
`reports/css-architecture-research.md` — Section: "Implement Critical CSS Extraction"

---

## Work Item 5: Migrate to CSS Logical Properties

**Type:** Task  
**Priority:** Medium  
**Effort:** 4 hours  
**Sprint:** Sprint 3  
**Assigned To:** Builder

### Description
Migrate from physical properties (left, right) to logical properties (inline-start, inline-end) for better internationalization support.

### Acceptance Criteria
- [ ] Audit all CSS files for physical direction properties
- [ ] Replace physical properties with logical equivalents:
  - `margin-left` → `margin-inline-start`
  - `margin-right` → `margin-inline-end`
  - `padding-left` → `padding-inline-start`
  - `padding-right` → `padding-inline-end`
  - `border-left` → `border-inline-start`
  - `border-right` → `border-inline-end`
  - `left` → `inset-inline-start`
  - `right` → `inset-inline-end`
- [ ] Test in LTR mode (default)
- [ ] Test in RTL mode (add `dir="rtl"` to `<html>`)
- [ ] Verify all layouts work correctly in both directions
- [ ] Document RTL testing procedure

### Implementation Notes
```css
/* OLD */
.sidebar {
  padding-left: 20px;
  border-left: 3px solid var(--color-primary);
}

/* NEW */
.sidebar {
  padding-inline-start: 20px;
  border-inline-start: 3px solid var(--color-primary);
}
```

### Browser Support
- All modern browsers (Chrome 87+, Firefox 66+, Safari 14.1+)

### Related Research
`reports/css-architecture-research.md` — Section: "Add CSS Logical Properties"

---

## How to Create These Work Items in Azure DevOps

### Manual Creation (Azure DevOps Web UI)
1. Navigate to: https://dev.azure.com/fireside365/Fireside%20Capital/_workitems
2. Click **New Work Item** → **Task**
3. Copy title, description, and acceptance criteria from above
4. Set fields:
   - **Assigned To:** Builder (or team member)
   - **Priority:** As specified
   - **Original Estimate:** As specified (in hours)
   - **Iteration:** Appropriate sprint
   - **Area Path:** Research
   - **Tags:** css, architecture, research, frontend

### CLI Creation (If Azure CLI becomes available)
```bash
# Work Item 1
az boards work-item create \
  --title "Split main.css into Logical Modules" \
  --type "Task" \
  --project "Fireside Capital" \
  --description "Split monolithic main.css (3,600 lines) into logical modules..." \
  --assigned-to "Builder" \
  --priority 1 \
  --estimate 4

# Work Item 2
az boards work-item create \
  --title "Expand Utility Class System" \
  --type "Task" \
  --project "Fireside Capital" \
  --description "Generate comprehensive utility classes..." \
  --assigned-to "Builder" \
  --priority 1 \
  --estimate 2

# Work Item 3
az boards work-item create \
  --title "Implement CSS Container Queries" \
  --type "Task" \
  --project "Fireside Capital" \
  --description "Add container queries for component-level responsiveness..." \
  --assigned-to "Builder" \
  --priority 1 \
  --estimate 3
```

---

**Status:** Ready for manual creation in Azure DevOps  
**Total Effort:** 19 hours across 5 tasks  
**Expected Completion:** Sprint 3 (if starting now)
