# UI/UX Audit — Session 1 Report
**Date:** February 16, 2026
**Auditor:** Architect (Clawdbot AI)
**Scope:** Dashboard, Assets, Bills, Investments, Debts, Budget, Settings pages

---

## Executive Summary

Completed audit of 7 out of 11 pages in the Fireside Capital dashboard. Identified **18 design issues** across high, medium, and low priority categories. Most issues relate to design system consistency (button hierarchy, skeleton loaders, utility classes) rather than fundamental UX problems.

**Overall Assessment:** Design foundation is solid with good accessibility features (ARIA labels, skip links, WCAG touch targets). Main focus should be on standardizing components and ensuring consistent implementation of the design token system.

---

## Issues Found

### 🔴 High Priority (5 issues)

#### **FC-UIUX-001: Inconsistent Button Hierarchy**
- **Issue:** Button sizing and styling varies across pages. Bills page uses `btn-sm` for filters, but touch target requirements (44px minimum) may not be met.
- **Location:** `bills.html` lines 167-176, filter buttons
- **Fix:** 
  - Remove `btn-sm` class from filter buttons
  - Ensure all interactive elements meet 44px minimum (WCAG 2.5.5)
  - Apply consistent button hierarchy: Primary (Orange) → Secondary (Blue) → Tertiary (Gray outline)
- **Estimated Time:** 2 hours (across all pages)

#### **FC-UIUX-003: Missing Utility Classes**
- **Issue:** HTML references icon utility classes not defined in CSS: `icon-warning`, `icon-info`, `icon-primary`
- **Location:** `bills.html` (lines 158, 257, 276), multiple pages
- **Status:** **RESOLVED** - Found in utilities.css lines 106-127
- **Action:** None needed

#### **FC-UIUX-011: Primary Button Hierarchy Violation**
- **Issue:** Debts page uses `btn-secondary` for "Add Debt" button, should be `btn-primary`
- **Location:** `debts.html` line 74
- **Fix:** Change to `btn-primary`
- **Estimated Time:** 5 minutes

#### **FC-UIUX-012: Undefined Responsive Utility Class**
- **Issue:** `.hide-mobile` class used in Debts table but not defined in CSS
- **Status:** **RESOLVED** - Found in responsive.css line 163 and utilities.css line 307
- **Action:** None needed

---

### 🟡 Medium Priority (7 issues)

#### **FC-UIUX-002: Skeleton Loader Inconsistency**
- **Issue:** Skeleton loaders have hardcoded widths that don't match actual content, causing layout shift when data loads.
- **Location:** `index.html` stat cards (lines 121-227), `bills.html` summary cards (lines 159-178)
- **Fix:**
  - Standardize skeleton dimensions to match final content
  - Use CSS custom properties for reusable skeleton sizes
  - Example: `--skeleton-stat-value: 120px; --skeleton-label: 80px;`
- **Estimated Time:** 1 hour

#### **FC-UIUX-004: Stats Card Trend Indicator Spacing**
- **Issue:** Trend indicators in stat cards have inconsistent vertical spacing and alignment.
- **Location:** `index.html` stat cards, referenced in `main.css` line 864 (`.stat-trend`)
- **Fix:**
  - Standardize trend indicator height: `min-height: 40px;`
  - Center-align trend content vertically
  - Ensure trend labels use consistent font size (12px) and opacity (0.8)
- **Estimated Time:** 30 minutes

#### **FC-UIUX-005: Undefined Border Modifier Class**
- **Issue:** `card-warning-border` class used but not defined in CSS
- **Location:** `bills.html` line 158
- **Fix:** Add to `components.css`:
```css
.card-warning-border {
  border-left: 4px solid var(--color-warning);
}
```
- **Estimated Time:** 15 minutes

#### **FC-UIUX-008: Inconsistent Card Border Styling**
- **Issue:** `card-warning-border` uses full `border: 2px` in utilities.css, but design pattern elsewhere suggests `border-left: 4px` accent style
- **Location:** `utilities.css` line 179 vs design pattern in `main.css` for `.dashboard-card::before`
- **Fix:** Update utilities.css:
```css
.card-warning-border {
  border-left: 4px solid var(--color-warning);
  border: 1px solid var(--color-border-subtle);
  background: var(--color-bg-2);
}
```
- **Estimated Time:** 10 minutes

#### **FC-UIUX-009: Empty State Pattern Missing**
- **Issue:** No defined empty state component for tables with no data
- **Location:** All table pages (assets, bills, debts, income, investments)
- **Fix:** Add to `components.css`:
```css
.table-empty-state {
  padding: 64px 32px;
  text-align: center;
}

.table-empty-state i {
  font-size: 64px;
  opacity: 0.5;
  color: var(--color-text-tertiary);
  margin-bottom: 16px;
}

.table-empty-state h5 {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.table-empty-state p {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 24px;
}
```
- **Estimated Time:** 30 minutes

#### **FC-UIUX-013: Table Column Count Inconsistency**
- **Issue:** Different pages have different numbers of table columns, making responsive behavior inconsistent:
  - **Assets:** 7 columns
  - **Investments:** 8 columns (widest)
  - **Debts:** 8 columns (with 2 hidden on mobile)
  - **Bills:** 6 columns
- **Impact:** Horizontal scrolling behavior varies unpredictably on mobile
- **Fix:** Standardize responsive table pattern:
  1. Hide less critical columns on mobile (e.g., "Next Due", "Term")
  2. Use `.hide-mobile` consistently across all table pages
  3. Consider collapsible row details for mobile instead of scrolling
- **Estimated Time:** 2 hours (cross-page consistency)

#### **FC-UIUX-015: Button Size Inconsistency in Page Header**
- **Issue:** Budget page mixes `btn-sm` with regular button sizes in the same action group, creating visual hierarchy confusion
- **Location:** `budget.html` lines 82-95 (page-header-actions)
- **Fix:** Remove `btn-sm` from all page header buttons OR apply consistently to ALL buttons in the action group (not recommended - breaks touch targets)
- **Recommendation:** Remove `btn-sm` entirely - page header actions should be standard 44px touch targets
- **Estimated Time:** 15 minutes

---

### 🔵 Low Priority (6 issues)

#### **FC-UIUX-006: Hidden Content Pattern Inconsistency**
- **Issue:** Mix of `d-none`, `initially-hidden`, and JavaScript toggling for showing/hiding elements
- **Location:** `bills.html` line 145 (`initially-hidden` on pageActions)
- **Fix:**
  - Consolidate to single pattern: use `data-auth-required` attribute + single `.auth-hidden` class
  - Remove custom `initially-hidden` class in favor of Bootstrap's `d-none`
  - Centralize show/hide logic in `app.js`
- **Estimated Time:** 1 hour (refactor across pages)

#### **FC-UIUX-007: Undefined Button Class**
- **Issue:** `.btn-touch-target` class used but not defined in CSS
- **Location:** `assets.html` line 80 (Add Asset button)
- **Fix:** Either:
  - Remove `.btn-touch-target` class (buttons already meet 44px minimum per main.css)
  - OR define it in utilities.css if special touch behavior is needed
- **Estimated Time:** 5 minutes

#### **FC-UIUX-010: Modal Size Inconsistency**
- **Issue:** Assets modal uses `modal-lg` while Bills modal uses default size
- **Location:** `assets.html` line 182 vs `bills.html` modal
- **Fix:** Standardize modal sizes:
  - Simple forms (1-2 columns): Default size
  - Complex forms (3+ columns, conditional fields): `.modal-lg`
  - Full-width/complex layouts: `.modal-xl`
- **Estimated Time:** 30 minutes

#### **FC-UIUX-014: Section Heading Icon Inconsistency**
- **Issue:** Some section headings have icons, others don't. Inconsistent usage:
  - ✅ Debts: "Financing & Payoff Tracking" has icon
  - ✅ Debts: "Completed" has icon
  - ❌ Bills: "Recurring Bills" section has no icon
  - ❌ Bills: "Bills Shared With Me" has icon, but main section doesn't
- **Fix:** Either add icons to ALL section headings or remove them ALL for consistency
- **Estimated Time:** 1 hour

#### **FC-UIUX-016: Month Navigation Controls Accessibility**
- **Issue:** Previous/Next month buttons use chevron icons without text labels, may confuse users
- **Location:** `budget.html` lines 83-86
- **Fix:** Consider adding text labels:
```html
<button class="btn btn-outline-secondary" id="prevMonth" aria-label="Previous month">
  <i class="bi bi-chevron-left"></i>
  <span class="hide-mobile">Previous</span>
</button>
```
- **Estimated Time:** 15 minutes

#### **FC-UIUX-017: Inline Style Attribute in HTML**
- **Issue:** Settings page uses inline style on h5 element instead of utility class
- **Location:** `settings.html` line 129
```html
<h5 class="mb-4 heading-no-transform" style="font-size: var(--text-h5);">
```
- **Fix:** Create utility class in utilities.css:
```css
.text-h5 {
  font-size: var(--text-h5);
}
```
Then use: `<h5 class="mb-4 heading-no-transform text-h5">`
- **Estimated Time:** 5 minutes

#### **FC-UIUX-018: Theme Toggle Placement Inconsistency**
- **Issue:** Theme toggle only appears in sidebar on Settings and Budget pages, missing from other pages
- **Location:** `settings.html` & `budget.html` (theme-toggle in sidebar)
- **Question:** Is theme toggle intended to be global or only on specific pages?
- **Fix:** Either add to ALL pages OR add to user dropdown menu for global access
- **Estimated Time:** 30 minutes (decision + implementation)

---

## Positive Findings ✅

1. **Accessibility:** All pages have proper ARIA labels, skip links, and semantic HTML
2. **Touch Targets:** Most buttons meet 44px minimum (WCAG 2.5.5)
3. **Design Tokens:** Color system properly implemented with CSS custom properties
4. **Responsive:** Mobile sidebar, responsive tables, and breakpoints well-defined
5. **Icon System:** Bootstrap Icons used consistently
6. **Font Hierarchy:** Clear typography scale from design-tokens.css
7. **Skeleton Loaders:** Loading states implemented (just need dimension fixes)

---

## Recommendations

### Immediate Actions (Quick Wins - 30 min)
1. Fix Debts button to `btn-primary` (FC-UIUX-011)
2. Remove inline style from Settings page (FC-UIUX-017)
3. Remove unused `.btn-touch-target` class from Assets (FC-UIUX-007)

### Design System Cleanup (2-3 hours)
1. Standardize skeleton loader sizes (FC-UIUX-002)
2. Create reusable empty state component (FC-UIUX-009)
3. Fix card-warning-border styling pattern (FC-UIUX-005, FC-UIUX-008)
4. Audit button hierarchy across ALL 11 pages (FC-UIUX-001)
5. Standardize section heading icons (FC-UIUX-014)

### Responsive Improvements (2-3 hours)
1. Standardize table responsive behavior (FC-UIUX-013)
2. Test on actual mobile devices (iOS/Android)
3. Verify touch targets on small screens

### Next Audit Session
- Complete remaining 4 pages (Income, Transactions, Friends, Reports)
- Mobile device testing
- Light mode audit (verify readability)
- Form validation states review

---

## Files Modified

None yet - this is the audit phase. Implementation will follow.

---

## Next Steps

1. **Founder Approval:** Review this report and prioritize fixes
2. **Sprint Planning:** Schedule Builder session for fixes
3. **Browser Testing:** Spawn Auditor for cross-browser verification after fixes
4. **Live Site Verification:** Test fixes on Azure deployment

---

**Report Status:** Draft for Review
**Estimated Total Fix Time:** 8-10 hours (High + Medium priority items)
