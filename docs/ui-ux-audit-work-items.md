# UI/UX Audit Work Items — Fireside Capital Dashboard
**Audit Date:** February 22, 2026  
**Auditor:** Architect (Capital)  
**Platform:** Azure DevOps (fireside365 / Fireside Capital)  

---

## 📝 WORK ITEMS TO CREATE

### USER STORY #1: Standardize Empty State Typography
**Title:** As a user, I want consistent empty state headings across all pages  
**Description:**  
Empty states currently use inconsistent heading levels (`<h5>` on some pages, `<h3>` on others). The design system (main.css line 1165) specifies `<h3>` for empty state headings.

**Acceptance Criteria:**
- [ ] All empty state headings use `<h3>` (not `<h5>`)
- [ ] Pages to fix: assets.html, bills.html, settings.html
- [ ] Pages already correct: investments.html, debts.html, budget.html

**Priority:** Medium  
**Effort:** 1 hour  
**Tags:** UI/UX, Typography, Design System

---

### TASK #2: Add Skeleton Loader Fade Transition
**Title:** Implement fade-out transition for skeleton loaders  
**Description:**  
Currently, skeleton loaders instantly swap to real content, causing a jarring flash. Add a 150ms fade-out transition for smoother loading UX.

**Implementation:**
```css
/* Add to utilities.css or components.css */
.skeleton-loader {
  transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.skeleton-loader.fade-out {
  opacity: 0;
}
```

**Acceptance Criteria:**
- [ ] Add CSS transition to .skeleton-loader class
- [ ] Update JavaScript to add .fade-out class before removing skeletons
- [ ] Test on all pages with loading states (dashboard, bills, assets, investments, debts)

**Priority:** Medium  
**Effort:** 2 hours  
**Tags:** UI/UX, Loading States, Animation

---

### TASK #3: Verify Chart Wrapper Height Behavior
**Title:** Test chart sizing after max-height override removal  
**Description:**  
main.css line 1291 has a comment indicating a removed CSS rule that was overriding utilities.css for chart wrapper heights. Need to verify all charts still size correctly, especially on mobile.

**Acceptance Criteria:**
- [ ] Test all dashboard charts (Net Worth Timeline, Cash Flow, Monthly Delta, etc.)
- [ ] Verify charts don't overflow or shrink incorrectly
- [ ] Test on mobile breakpoints (375px, 360px)
- [ ] Document findings in test report

**Priority:** High  
**Effort:** 2 hours  
**Tags:** UI/UX, Layout, Charts, Testing

---

### TASK #4: Optimize Stat Card Trend Spacing
**Title:** Fix excessive whitespace in stat card trends  
**Description:**  
Stat card trend indicators have `min-height: 40px` (main.css line 1124) which causes excessive whitespace when no trend data exists.

**Implementation:**
```css
.stat-trend:empty {
  min-height: 0;
  margin-top: 0;
}
```

**Acceptance Criteria:**
- [ ] Add empty state styling to .stat-trend
- [ ] Test on dashboard stat cards with and without trend data
- [ ] Verify no layout shift when trend data loads

**Priority:** Low  
**Effort:** 30 minutes  
**Tags:** UI/UX, Dashboard, Spacing

---

### TASK #5: Mobile Table Scroll Testing
**Title:** Test table horizontal scroll on small devices  
**Description:**  
Tables have `min-width: 600px` at <576px breakpoint, forcing horizontal scroll. Need to verify this works smoothly on 320px-375px devices and doesn't break layout.

**Acceptance Criteria:**
- [ ] Test on iPhone SE (375px)
- [ ] Test on small Android (360px)
- [ ] Test on very small devices (320px)
- [ ] Verify smooth touch scrolling
- [ ] Verify table headers stay aligned
- [ ] Document any issues or adjustments needed

**Priority:** Medium  
**Effort:** 2 hours  
**Tags:** UI/UX, Mobile, Tables, Testing

---

### TASK #6: Verify Notification Dropdown Width
**Title:** Test notification dropdown width on mobile  
**Description:**  
Notification dropdown has `width: 550px` which could exceed viewport on small devices. components.css (line 65-68) has responsive rules, but needs real device testing.

**Acceptance Criteria:**
- [ ] Test notification dropdown on mobile devices
- [ ] Verify no horizontal overflow
- [ ] Verify text wrapping works correctly
- [ ] Test with long notification messages
- [ ] Document findings

**Priority:** Low (Already Fixed per CSS, Verify)  
**Effort:** 1 hour  
**Tags:** UI/UX, Mobile, Notifications, Testing

---

### TASK #7: Page Header Button Height Consistency
**Title:** Ensure all page header buttons have consistent height  
**Description:**  
Some buttons in page header have explicit 44px height enforcement, others rely on padding. Need to ensure all buttons in .page-header align properly.

**Acceptance Criteria:**
- [ ] Review all pages for button height consistency
- [ ] Apply `.page-header .btn` rule to all button variants
- [ ] Test with icon-only buttons
- [ ] Test with text + icon buttons
- [ ] Verify on all breakpoints

**Priority:** High  
**Effort:** 2 hours  
**Tags:** UI/UX, Buttons, Layout

---

## 📊 AUDIT SUMMARY

**Total Issues Found:** 7  
**High Priority:** 2 (Chart Heights, Button Consistency)  
**Medium Priority:** 4 (Empty States, Skeleton Transitions, Table Scroll, Dropdown Width)  
**Low Priority:** 1 (Stat Card Spacing)  

**Pages Audited:** 5/12 (Dashboard, Bills, Assets, Investments, Debts)  
**Pages Remaining:** 7 (Income, Transactions, Operations, Friends, Budget, Reports, Settings)  

**Estimated Total Effort:** ~10-12 hours  
**Recommended Sprint:** 1 week (includes testing on real devices)

---

## ✅ CONFIRMED GOOD PRACTICES

- ✓ 8px spacing grid consistently applied
- ✓ 150-200ms transitions on interactive elements
- ✓ 44px minimum touch targets (WCAG 2.5.5)
- ✓ Design tokens properly used
- ✓ Skeleton loaders on all data tables/cards
- ✓ Empty states have clear CTAs
- ✓ Focus states implemented
- ✓ 16px minimum font size on forms (prevents iOS zoom)

---

## 🔄 NEXT STEPS

1. Create these work items in Azure DevOps
2. Continue audit on remaining 7 pages
3. Schedule mobile device testing session
4. Prioritize High priority items for next sprint
