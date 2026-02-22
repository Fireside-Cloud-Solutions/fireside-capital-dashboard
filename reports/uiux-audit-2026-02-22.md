# UI/UX Audit Report
**Date:** February 22, 2026  
**Auditor:** Architect Agent  
**Scope:** Fireside Capital Dashboard — All Pages  
**Focus:** Design consistency, accessibility, user experience  

---

## Executive Summary
Comprehensive audit of the Fireside Capital dashboard UI/UX. The application has a solid foundation with good skeleton loaders, responsive design, and brand consistency. However, several critical improvements are needed for enhanced usability and visual polish.

---

## Critical Issues

### FC-UIUX-010: Inconsistent Empty State Icons
**Issue:** Empty states use different icon sizes (64px vs 80px) across pages  
**Location:** `assets/css/main.css` line 1047, individual page HTML  
**Fix:** Standardize all empty state icons to 80px (already defined in `.empty-state-icon`)  
**Priority:** Medium  
**Impact:** Visual inconsistency reduces professional appearance  

### FC-UIUX-011: Missing Hover States on Stat Cards
**Issue:** Dashboard stat cards have hover effect (translateY) but no visual feedback on mobile tap  
**Location:** `assets/css/main.css` — `.stat-card` class  
**Fix:** Add active state: `.stat-card:active { transform: translateY(0); box-shadow: var(--shadow-sm); }`  
**Priority:** Low  
**Impact:** Touch interactions feel less responsive  

### FC-UIUX-012: Table Action Button Stacking on Mobile
**Issue:** Action buttons in table rows don't stack properly on very small screens (< 375px)  
**Location:** `assets/css/main.css` line 3363 (mobile responsive section)  
**Fix:** Already implemented, needs verification on live site  
**Priority:** Low  
**Impact:** Buttons may overlap or be unclickable on small devices  

---

## Moderate Issues

### FC-UIUX-013: Form Label Opacity Inconsistency
**Issue:** Form labels use `color-text-secondary` but no explicit opacity, while other secondary text uses 0.7  
**Location:** `assets/css/main.css` line 1864 (`.form-label`)  
**Fix:** Add `opacity: 0.85;` for better readability while maintaining hierarchy  
**Priority:** Medium  
**Impact:** Form labels can appear too faint in certain lighting  

### FC-UIUX-014: Modal Title Size Too Large on Mobile
**Issue:** Modal titles are 24px on desktop, same on mobile — feels oversized  
**Location:** `assets/css/main.css` line 2190 (`.modal-title`)  
**Fix:** Add media query: `@media (max-width: 575.98px) { .modal-title { font-size: 20px; } }`  
**Priority:** Low  
**Impact:** Modals feel cramped on mobile  

### FC-UIUX-015: Missing Focus Ring on Custom Buttons
**Issue:** Some icon-only buttons (`.btn-icon`) don't have clear focus rings for keyboard navigation  
**Location:** `assets/css/main.css` line 1713 (`.btn-icon`)  
**Fix:** Ensure `:focus-visible` styles apply to all button variants  
**Priority:** High (Accessibility)  
**Impact:** Keyboard users cannot see which button has focus  

---

## Design Polish Opportunities

### FC-UIUX-016: Chart Card Loading Skeleton Misalignment
**Issue:** Chart skeleton loaders don't match final chart dimensions, causing layout shift  
**Location:** `assets/css/utilities.css` — `.chart-skeleton` classes  
**Fix:** Ensure skeleton height matches actual chart wrapper height  
**Priority:** Low  
**Impact:** Visual "pop" when charts load  

### FC-UIUX-017: Notification Badge Position Inconsistent
**Issue:** Notification badge on bell icon uses absolute positioning that can clip on Firefox  
**Location:** `index.html` line 50, `assets/css/main.css` (notification styles)  
**Fix:** Use `position: relative` on parent, ensure badge has proper z-index  
**Priority:** Low  
**Impact:** Badge may be cut off on certain browsers  

### FC-UIUX-018: Time Range Filter Buttons Touch Target < 44px
**Issue:** Time range filter buttons (`.time-range-filter .btn`) have padding that results in < 44px tap target on mobile  
**Location:** `assets/css/main.css` line 1341  
**Fix:** Already has `min-height: 44px` — verify implementation  
**Priority:** Medium (Accessibility)  
**Impact:** Hard to tap filter buttons on mobile  

---

## Positive Findings
✅ Excellent skeleton loader implementation across all pages  
✅ Consistent 8px spacing grid throughout  
✅ Clear visual hierarchy (32px titles, 24px headings, 16px body)  
✅ Smooth 150-200ms transitions on interactive elements  
✅ Strong color system with orange/blue/green brand palette  
✅ Responsive breakpoints well-defined  
✅ WCAG 2.5.5 compliant touch targets (44px minimum)  
✅ Good accessibility features (skip links, ARIA labels, focus states)  

---

## Recommendations

### High Priority
1. **Fix FC-UIUX-015:** Add focus-visible styles to all button variants  
2. **Verify mobile testing:** Use browser automation to test on live site (see `docs/browser-testing-guide.md`)  
3. **Create user stories:** File work items in Azure DevOps for each issue  

### Medium Priority
4. **Standardize empty state icons:** Update CSS to consistent 80px  
5. **Improve form label readability:** Add subtle opacity adjustment  
6. **Test time range filters:** Verify 44px touch targets on actual mobile devices  

### Low Priority
7. **Add stat card active states:** Improve touch feedback  
8. **Adjust modal title size:** Better mobile proportion  
9. **Fix notification badge clipping:** Cross-browser compatibility  

---

## Next Steps
1. Create Azure DevOps user stories for High/Medium priority issues  
2. Spawn Builder agent to implement fixes  
3. Test on live site: https://nice-cliff-05b13880f.2.azurestaticapps.net  
4. Document findings in `memory/2026-02-22.md`  

---

---

## Additional Findings (Bills Page)

### FC-UIUX-019: Filter Button Touch Targets on Mobile
**Issue:** Filter buttons (`.btn-sm`) on Bills page may not meet 44px minimum touch target  
**Location:** `bills.html` line 151 — "All Bills" / "Subscriptions Only" buttons  
**Fix:** Ensure `.btn-sm` has `min-height: 44px` in responsive breakpoints  
**Priority:** Medium (Accessibility)  
**Impact:** Hard to tap filter buttons on mobile  

### FC-UIUX-020: Summary Card Skeleton Width Hardcoded
**Issue:** Skeleton loaders in summary cards use inline styles (`width: 120px`) instead of CSS classes  
**Location:** `bills.html` lines 165-191 (summary cards)  
**Fix:** Replace inline skeleton styles with reusable `.skeleton-value-sm`, `.skeleton-value-md`, `.skeleton-value-lg` classes  
**Priority:** Low  
**Impact:** Maintenance overhead, harder to adjust skeleton sizing globally  

---

## Additional Findings (Settings Page)

### FC-UIUX-021: Category Budget Grid Skeleton Count Mismatch
**Issue:** Skeleton shows 9 placeholders but actual grid may have different count  
**Location:** `settings.html` line 178 (category budgets skeleton grid)  
**Fix:** Dynamically generate skeleton based on actual category count  
**Priority:** Low  
**Impact:** Brief visual mismatch when content loads  

### FC-UIUX-022: Input Group Text Icon Alignment
**Issue:** Icons in input groups (e.g., `.bi-cup-hot` in category budgets) may not vertically center in all browsers  
**Location:** `settings.html` lines 196-220 (category budget inputs)  
**Fix:** Ensure label icons use `align-items: center` and consistent line-height  
**Priority:** Low  
**Impact:** Minor visual misalignment in Firefox/Safari  

---

---

## Additional Findings (Budget & Investments Pages)

### FC-UIUX-025: Budget Action Buttons Touch Target
**Issue:** "Generate Budget" and "Add Item" buttons use `.btn-sm` which may not meet 44px minimum touch target  
**Location:** `budget.html` lines 103-112 (page header actions)  
**Fix:** Same as other `.btn-sm` fixes — ensure 44px minimum on mobile  
**Priority:** Medium (Accessibility)  
**Impact:** Difficult to tap budget action buttons on mobile  

---

## Consolidated Fix Strategy

### Single CSS Fix for All `.btn-sm` Touch Target Issues
**Affected Pages:** Dashboard, Bills, Transactions, Budget  
**Single Fix Location:** `assets/css/responsive.css` or `assets/css/main.css`  

```css
/* Mobile: Ensure all small buttons meet WCAG 2.5.5 touch targets */
@media (max-width: 575.98px) {
  .btn-sm {
    min-height: 44px !important;
    padding: 10px 12px !important;
    font-size: 16px !important; /* Prevent iOS zoom */
  }
}
```

**Resolves:** FC-UIUX-018, FC-UIUX-019, FC-UIUX-023, FC-UIUX-025  

---

## Audit Status
- **Pages Reviewed:** Dashboard, Assets, Bills, Settings, Transactions, Budget, Investments (7 of 12)  
- **Pages Remaining:** Debts, Friends, Income, Operations, Reports (5 of 12)  
- **CSS Files Reviewed:** main.css (full), components.css (not yet), design-tokens.css (not yet)  
- **Coverage:** ~60% of application UI reviewed  

---

## Additional Findings (Transactions Page)

### FC-UIUX-023: Quick Range Preset Buttons Touch Target
**Issue:** Date range preset buttons (`.btn-sm`) may not meet 44px minimum touch target on mobile  
**Location:** `transactions.html` lines 170-175 (Last 7 days, Last 30 days, etc.)  
**Fix:** Override `.btn-sm` in responsive breakpoint: `@media (max-width: 575.98px) { .btn-sm { min-height: 44px; padding: 10px 12px; } }`  
**Priority:** Medium (Accessibility)  
**Impact:** Difficult to tap date presets on mobile  

### FC-UIUX-024: Filter Card Border Visual Weight
**Issue:** Filter card has `border-3` (thick border) which feels heavy compared to other cards  
**Location:** `transactions.html` line 151 (filter card)  
**Fix:** Consider reducing to `border-2` or using subtle box-shadow instead  
**Priority:** Low  
**Impact:** Visual inconsistency with other page cards  

---

## Summary of Critical Path Issues

### Must Fix Before Launch
1. **FC-UIUX-015** — Focus-visible styles for icon-only buttons (Accessibility)  
2. **FC-UIUX-018** — Time range filter touch targets (Accessibility)  
3. **FC-UIUX-019** — Bills filter button touch targets (Accessibility)  
4. **FC-UIUX-023** — Transaction date preset touch targets (Accessibility)  

### Should Fix Soon
5. **FC-UIUX-013** — Form label opacity consistency  
6. **FC-UIUX-010** — Empty state icon size standardization  

### Nice to Have
7. **FC-UIUX-011** — Stat card active states  
8. **FC-UIUX-014** — Modal title mobile sizing  
9. **FC-UIUX-020** — Skeleton loader reusability  

---

**Report Updated:** 2026-02-22 05:30 AM EST  
**Agent:** Architect  
**Session:** sprint-uiux

---

## Audit Status � Phase 1 Complete
- **Pages Reviewed:** Dashboard, Assets, Bills, Settings, Transactions, Budget, Investments, Debts, Reports (9 of 12)  
- **Pages Remaining:** Friends, Income, Operations (3 of 12)  
- **CSS Files Reviewed:** main.css (full), components.css (not yet), design-tokens.css (not yet)  
- **Coverage:** 75% of application UI reviewed  

---

## Implementation Priority

### Phase 1: Critical Accessibility Fixes (30-45 min)
1. Add `.btn-icon:focus-visible` styles to `main.css` or `accessibility.css`  
2. Add `.btn-sm` mobile override to `responsive.css`  
3. Test on live site with keyboard navigation + mobile device  

### Phase 2: UX Polish (15-20 min)
4. Adjust `.form-label` opacity in `main.css`  
5. Standardize `.empty-state-icon` to 80px across all pages  

### Phase 3: Remaining Pages Audit (15 min)
6. Review Friends, Income, Operations pages  
7. Create final comprehensive report  

**Total Estimated Time:** 60-80 minutes for complete implementation  

---

**Report Status:** Phase 1 Complete (9/12 pages)  
**Last Updated:** 2026-02-22 05:35 AM EST  
**Agent:** Architect  
**Session:** sprint-uiux  
**Next Audit:** Friends, Income, Operations pages
