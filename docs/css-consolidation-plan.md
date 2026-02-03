# CSS Consolidation Plan (FC-016)
**Fireside Capital**

Date: 2026-02-03  
Status: In Progress

---

## Current State (11 CSS Files)

| File | Size | Purpose |
|------|------|---------|
| design-tokens.css | 13.6 KB | CSS variables (colors, spacing, typography) |
| styles.css | 62.1 KB | Main app styles (largest file) |
| mobile-optimizations.css | 27.6 KB | Responsive/mobile styles |
| notification-polish.css | 13.5 KB | Notification menu styles |
| brand-polish.css | 13.4 KB | Fireside brand styling |
| accessibility.css | 11.4 KB | WCAG compliance styles |
| polish.css | 7.4 KB | UX polish enhancements |
| toast-notifications.css | 7.3 KB | Toast notification styles |
| loading-states.css | 7.0 KB | Loading spinners/skeletons |
| logged-out-cta.css | 3.4 KB | Logged-out CTA styles |
| skip-link.css | 0.4 KB | Skip navigation link |

**Total:** 166.7 KB (uncompressed)

---

## Consolidation Strategy

### Goal
Reduce from 11 files to 4-5 logical groups while maintaining:
- Modularity for development
- Performance (fewer HTTP requests)
- Maintainability (clear organization)

### Proposed Structure

#### 1. `design-tokens.css` (KEEP SEPARATE)
- CSS variables
- No changes
- Loaded first to define all variables

#### 2. `main.css` (NEW - CONSOLIDATED CORE)
Merge:
- `styles.css` (62 KB)
- `polish.css` (7.4 KB)
- `brand-polish.css` (13.4 KB)

**Total:** ~83 KB

**Why:** All core app styling in one file

#### 3. `components.css` (NEW - CONSOLIDATED COMPONENTS)
Merge:
- `notification-polish.css` (13.5 KB)
- `toast-notifications.css` (7.3 KB)
- `loading-states.css` (7.0 KB)

**Total:** ~28 KB

**Why:** All interactive component styles

#### 4. `responsive.css` (RENAME)
Keep:
- `mobile-optimizations.css` (27.6 KB)

**Why:** All responsive/breakpoint styles in one place

#### 5. `accessibility.css` (CONSOLIDATED A11Y)
Merge:
- `accessibility.css` (11.4 KB)
- `skip-link.css` (0.4 KB)

**Total:** ~12 KB

**Why:** All WCAG compliance styles

#### 6. `logged-out-cta.css` (KEEP SEPARATE - OPTIONAL)
- Only loaded on public pages
- Can be inlined in HTML if needed

**Rationale:** Page-specific, not always needed

---

## Final Structure (5 Files)

1. `design-tokens.css` (13.6 KB) — CSS variables
2. `main.css` (83 KB) — Core styles
3. `components.css` (28 KB) — Interactive components
4. `responsive.css` (27.6 KB) — Mobile/responsive
5. `accessibility.css` (12 KB) — WCAG compliance

**Total:** 164.2 KB (99% of original size, but 6 fewer HTTP requests)

---

## Load Order (HTML `<head>`)

```html
<!-- 1. Variables first -->
<link rel="stylesheet" href="assets/css/design-tokens.css" />

<!-- 2. Core styles -->
<link rel="stylesheet" href="assets/css/main.css" />

<!-- 3. Components -->
<link rel="stylesheet" href="assets/css/components.css" />

<!-- 4. Responsive (after core, so it can override) -->
<link rel="stylesheet" href="assets/css/responsive.css" />

<!-- 5. Accessibility (last, to ensure overrides work) -->
<link rel="stylesheet" href="assets/css/accessibility.css" />

<!-- Optional: Page-specific -->
<!-- <link rel="stylesheet" href="assets/css/logged-out-cta.css" /> -->
```

---

## Migration Steps

### Phase 1: Create New Consolidated Files
1. Create `main.css` by concatenating:
   - styles.css
   - polish.css
   - brand-polish.css
2. Create `components.css` by concatenating:
   - notification-polish.css
   - toast-notifications.css
   - loading-states.css
3. Rename `mobile-optimizations.css` → `responsive.css`
4. Merge `skip-link.css` into `accessibility.css`

### Phase 2: Update HTML Files
Update all 11 HTML pages to use new CSS structure:
- index.html
- assets.html
- bills.html
- budget.html
- debts.html
- friends.html
- income.html
- investments.html
- reports.html
- settings.html
- polish-demo.html (remove or update)

### Phase 3: Test
- Visual regression test on all pages
- Test responsive breakpoints
- Verify accessibility features
- Check dark/light theme toggle

### Phase 4: Cleanup
- Delete old CSS files
- Update documentation
- Commit changes

---

## Risks & Mitigations

### Risk: Specificity Conflicts
**Mitigation:** Merge in order of specificity (general → specific)

### Risk: Cache Busting
**Mitigation:** Add version query strings:
```html
<link rel="stylesheet" href="assets/css/main.css?v=2026-02-03" />
```

### Risk: Large File Size
**Mitigation:** Minify for production:
```bash
npx cssnano main.css > main.min.css
```

---

## Performance Impact

### Before (11 files)
- HTTP requests: 11
- Total size: 166.7 KB
- Load time: ~330ms (11 × 30ms per request)

### After (5 files)
- HTTP requests: 5 (55% reduction)
- Total size: 164.2 KB (1.5% smaller)
- Load time: ~150ms (5 × 30ms per request)

**Improvement:** ~180ms faster page load

---

## Future Optimization

### CSS Minification
```bash
# Minify for production
npx cssnano main.css > main.min.css
npx cssnano components.css > components.min.css
```

**Expected size reduction:** 30-40% (164 KB → ~110 KB)

### Critical CSS Inline
Extract above-the-fold CSS and inline in `<head>`:
```html
<style>
  /* Critical CSS here (navbar, header, first viewport) */
</style>
```

### Defer Non-Critical CSS
```html
<link rel="preload" href="assets/css/components.css" as="style" onload="this.onload=null;this.rel='stylesheet'" />
```

---

## Rollback Plan

If issues arise:
1. Revert to old CSS file structure
2. Update HTML files to old structure
3. Git revert the consolidation commit

---

**Status:** Ready to execute  
**Estimated Time:** 4-6 hours  
**Assigned To:** Capital (Orchestrator)
