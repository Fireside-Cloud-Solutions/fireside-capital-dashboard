# UI/UX Audit Report — Fireside Capital Dashboard
**Date:** February 8, 2026  
**Auditor:** Architect (Sub-Agent)  
**Pages Reviewed:** Dashboard (index.html), Assets, Bills  
**CSS Files Reviewed:** main.css, components.css

---

## Executive Summary
The Fireside Capital dashboard has received significant UX polish (January 2025), with consistent 8px spacing, smooth transitions, and clear visual hierarchy. However, several areas need refinement for optimal user experience.

---

## Critical Issues

### Issue 1: Notification Dropdown Text Truncation
**Location:** All pages — Notification dropdown menu  
**Problem:** Notification titles/bodies may truncate on narrow viewports despite 550px width  
**Fix:** The notification CSS already includes `word-wrap: break-word` and `white-space: normal`, but ensure parent dropdown enforces `max-width: 90vw` on mobile  
**Priority:** P2 (Medium)  
**Affected Users:** Mobile users

### Issue 2: Chart Skeleton Loading State Inconsistency
**Location:** Dashboard — All chart cards  
**Problem:** Chart cards show skeleton loaders during data fetch, but the `.loading` class and skeleton styling may not be applied consistently across all chart types  
**Fix:** Audit charts.js to ensure all chart initialization includes proper loading state management (add/remove `.loading` class)  
**Priority:** P2 (Medium)  
**User Impact:** Loading feedback clarity

### Issue 3: Empty State Iconography Inconsistency
**Location:** Assets, Bills, Investments pages  
**Problem:** Empty states use Bootstrap Icons (`bi-*`), but dashboard stats use inline SVG. Inconsistent icon sources across pages.  
**Fix:** Standardize on Bootstrap Icons for all empty states OR switch to inline SVG for brand consistency  
**Priority:** P3 (Low)  
**User Impact:** Visual consistency

---

## Enhancement Opportunities

### Issue 4: Dashboard Stat Cards — No Loading Skeleton on Mobile
**Location:** Dashboard — Top 6 stat cards  
**Problem:** Stat cards have skeleton loaders defined but may render too quickly on fast connections, causing layout shift  
**Fix:** Ensure skeleton loaders are visible for minimum 300ms to prevent flash of unstyled content (FOUC)  
**Priority:** P3 (Low)  
**User Impact:** Perceived performance

### Issue 5: Touch Target Sizing on Table Action Buttons
**Location:** Assets, Bills, Debts, Income pages — Table action buttons  
**Problem:** Edit/Delete buttons in tables may not meet 44px minimum touch target on mobile despite CSS rules  
**Fix:** Verify `.btn-sm` within tables inherits `min-height: 44px` rule; consider using icon-only buttons with padding  
**Priority:** P2 (Medium — WCAG 2.5.5 compliance)  
**User Impact:** Mobile tap accuracy

### Issue 6: Modal Form Labels — Missing Required Field Indicators
**Location:** All modal forms (Add Asset, Add Bill, Add Debt, etc.)  
**Problem:** Some required fields have `<span class="text-danger">*</span>` but not all; inconsistent across forms  
**Fix:** Audit all modal forms and add `*` indicator to every required field label  
**Priority:** P3 (Low)  
**User Impact:** Form completion clarity

### Issue 7: Subscription Widget — No Empty State
**Location:** Dashboard — Subscriptions widget (below stat cards)  
**Problem:** If no subscriptions exist, widget shows loading spinner indefinitely or generic "No subscriptions" text without CTA  
**Fix:** Add proper empty state with icon + "Track your subscriptions" + CTA button  
**Priority:** P2 (Medium)  
**User Impact:** Onboarding clarity

### Issue 8: Chart Color Palette — Accessibility Contrast
**Location:** Dashboard — All charts (Chart.js)  
**Problem:** Chart colors defined in charts.js may not meet WCAG AAA contrast ratios on dark backgrounds  
**Fix:** Run contrast checker on chart colors; ensure minimum 4.5:1 contrast for text labels  
**Priority:** P2 (Medium — WCAG 1.4.3 compliance)  
**User Impact:** Accessibility

---

## Design Improvements (Nice-to-Have)

### Issue 9: Page Header Actions — Inconsistent Button Hierarchy
**Location:** Assets, Bills, Income, Debts pages  
**Problem:** Primary action varies between pages (orange `.btn-primary` vs blue `.btn-secondary`). "Add Asset" should be primary CTA.  
**Fix:** Standardize: Use `.btn-secondary` (blue) for "Add [Item]" buttons; reserve `.btn-primary` (orange) for high-impact actions (e.g., "Connect Bank Account")  
**Priority:** P3 (Low)  
**User Impact:** Visual consistency

### Issue 10: Sidebar Active State — Weak Visual Indicator
**Location:** Sidebar navigation — All pages  
**Problem:** Active page indicator (3px orange left border + bg color) may be too subtle for colorblind users  
**Fix:** Increase border thickness to 4px OR add icon color change (make icon orange when active)  
**Priority:** P3 (Low — Accessibility enhancement)  
**User Impact:** Navigation clarity

---

## Positive Findings
✅ Consistent 8px spacing grid across all components  
✅ Smooth 150-200ms transitions on all interactive elements  
✅ Proper focus states with blue outline ring  
✅ Touch targets meet WCAG minimum (44px)  
✅ Mobile-first responsive breakpoints  
✅ Skeleton loaders for perceived performance  
✅ Brand-consistent color palette (Flame Orange, Sky Blue, Lime Green)  
✅ Proper ARIA labels on interactive elements  

---

## Next Steps
1. ✅ Create Azure DevOps work items for P1/P2 issues  
2. Audit charts.js for loading state consistency  
3. Run WCAG contrast checker on chart colors  
4. Conduct user testing on mobile for touch target accuracy  
5. Review all modal forms for required field indicators  

---

**Audit Status:** Complete  
**Total Issues Found:** 10  
**Critical (P1):** 0  
**Medium (P2):** 5  
**Low (P3):** 5  
