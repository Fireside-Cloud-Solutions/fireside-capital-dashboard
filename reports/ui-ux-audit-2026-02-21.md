# UI/UX Audit Report
**Date:** February 21, 2026, 5:22 AM  
**Auditor:** Capital (Architect sub-agent)  
**Sprint:** UI/UX Improvement Sprint

---

## 🎯 Audit Scope
Systematic review of all HTML pages and CSS files in the Fireside Capital dashboard for design consistency, accessibility, and user experience improvements.

---

## 📋 Transactions Page Audit (transactions.html)

### ✅ Strengths
1. **Clear page hierarchy** - H1 title, clear filters card, well-structured table
2. **Skeleton loaders** - Good loading states for initial render
3. **Empty state** - Includes helpful CTA to connect bank account
4. **Pagination controls** - Proper implementation with items-per-page selector
5. **Accessibility** - Table caption, aria-labels, tooltips on info icons
6. **Quick date range presets** - Good UX feature (Last 7/30/90 days, This Month, This Year)

### ⚠️ Issues Found

#### **Issue 1: Last Sync Time Clickable Element**
- **Location:** Line 213 - `<button id="lastSyncTime" class="btn btn-link p-0 text-decoration-underline">`
- **Problem:** Using a button styled as a link creates confusion. The underline suggests it's always clickable, even when it's not "Never". Also uses inline styles instead of CSS classes.
- **Fix:** 
  - Only make it clickable when the value is "Never" (first-time user state)
  - Use CSS classes instead of inline styles
  - Add proper aria-label for screen readers
  - Consider using a regular `<span>` with conditional click handler
- **Priority:** Medium

#### **Issue 2: Page Header Actions Hidden on Load**
- **Location:** Line 175 - `<div id="pageActions" class="initially-hidden">`
- **Problem:** The "Add Transaction" and "Sync from Bank" buttons are hidden until data loads. This creates a FOUC (Flash of Unstyled Content) issue and delays user access to primary actions.
- **Fix:** 
  - Remove `initially-hidden` class
  - Show buttons immediately (they're auth-gated anyway)
  - Use skeleton/disabled state if necessary during initial load
- **Priority:** High

#### **Issue 3: Filter Card Visual Hierarchy**
- **Location:** Lines 221-270 - Filter card section
- **Problem:** The filter card has adequate styling but could benefit from better visual hierarchy. The "Quick Ranges" label is small and muted, making it easy to miss this useful feature.
- **Fix:**
  - Increase font size for "Quick Ranges:" label to 14px (from small/12px)
  - Consider using a badge or pill style for the preset buttons
  - Add slight hover animation to preset buttons (already handled in main.css for .btn)
- **Priority:** Low

#### **Issue 4: Table Responsiveness**
- **Location:** Lines 274-318 - Transactions table
- **Problem:** On mobile devices, the 5-column table (Date, Description, Category, Amount, Confidence) will be cramped. No mobile-optimized view is implemented.
- **Fix:**
  - Add mobile card view for transactions on screens < 576px
  - Stack data vertically in card format on small screens
  - Hide "Confidence" column on mobile (least important metric)
- **Priority:** Medium

#### **Issue 5: Tooltip on Mobile**
- **Location:** Line 293 - Confidence column tooltip
- **Problem:** Bootstrap tooltips don't work well on mobile touch devices (requires hover). The confidence score explanation won't be accessible to mobile users.
- **Fix:**
  - Add a small `(?)` icon that opens a modal with explanation on tap for mobile
  - Or use a popover instead of tooltip (click/tap to show)
  - Consider adding the explanation text permanently below the column header on mobile
- **Priority:** Medium

#### **Issue 6: Empty State Icon Size**
- **Location:** Line 348 - `<i class="bi bi-credit-card empty-state-icon"></i>`
- **Problem:** The CSS defines empty-state-icon as 64px (utilities.css), but UX polish guidelines suggest 80px for better visual impact.
- **Fix:** Already noted in main.css comments (FC-UIUX-004) - increase to 80px globally
- **Priority:** Low (already documented in CSS)

#### **Issue 7: Auto-Categorize Button Missing Icon**
- **Location:** Line 208 - Auto-Categorize button has icon, but it's using `btn-secondary` styling
- **Problem:** "Auto-Categorize Uncategorized" is a utility action, but uses secondary (blue) button styling. Should be outline-secondary for tertiary actions.
- **Fix:** Change `btn-secondary` to `btn-outline-secondary`
- **Priority:** Low

#### **Issue 8: Missing Visual Feedback for Applied Filters**
- **Location:** Lines 253-256 - Apply/Clear filter buttons
- **Problem:** When filters are applied, there's no persistent visual indicator showing which filters are active. Users have to remember or re-open the filter card.
- **Fix:**
  - Add a "Filters Applied" badge or chip display above the table
  - Show active filter tags with X to clear individual filters
  - Highlight the filter card border when filters are active
- **Priority:** Medium

---

## 🎨 Design Tokens & Brand Consistency Check

### ✅ Consistent Implementation
- All buttons follow the tri-color hierarchy (Orange primary, Blue secondary, Gray tertiary)
- Proper use of design tokens for spacing (8px grid system)
- Dark-first theme implementation is consistent
- Typography hierarchy matches design system (32px titles, 24px headings, 16px body)

### ⚠️ Minor Inconsistencies
- Some inline styles still present (e.g., lastSyncTime button)
- Empty state icon size not yet updated to 80px (pending)

---

## 📱 Accessibility Review

### ✅ Good Practices
- Semantic HTML (`<table>`, `<caption>`, proper heading hierarchy)
- ARIA labels on buttons and icons
- Skip link for keyboard navigation
- Form labels properly associated with inputs
- Min 44px touch targets (WCAG 2.5.5 compliant)

### ⚠️ Improvements Needed
1. Tooltip on Confidence column not mobile-accessible
2. "Last synced: Never" button needs better aria-label context
3. Consider adding aria-live region for filter application feedback

---

## 🚀 Recommended Next Steps

### High Priority
1. **Fix page header actions visibility** - Remove `initially-hidden` class (Issue #2)

### Medium Priority
2. **Add mobile card view for transactions** - Better mobile UX (Issue #4)
3. **Make tooltips mobile-friendly** - Popover or inline help (Issue #5)
4. **Add active filter indicators** - Visual feedback for applied filters (Issue #8)
5. **Refactor "Last Sync Time" interaction** - Cleaner implementation (Issue #1)

### Low Priority
6. **Update Auto-Categorize button style** - Use outline-secondary (Issue #7)
7. **Enhance Quick Ranges visibility** - Better label styling (Issue #3)

---

## 📋 Bills Page Quick Check (bills.html)

### ⚠️ Issue Found

**Same Hidden Actions Issue** (Line 95)
- Bills page also uses `<div id="pageActions" class="initially-hidden">` for "Scan Email for Bills" and "Add Bill" buttons
- **Priority:** High (same as Transactions page)
- **Fix:** Remove `initially-hidden` class across all pages

### Note
This is a **PATTERN** affecting multiple pages. Need to audit all 12 HTML files for this issue.

---

## 🎯 Cross-Page Patterns Identified

### Pattern #1: Hidden Page Actions ⚠️ CRITICAL
- **Affects:** 9/12 pages (assets, bills, budget, debts, friends, income, investments, reports, transactions)
- **Issue:** Primary action buttons hidden until data loads (FOUC + delayed UX)
- **Fix:** Remove `class="initially-hidden"` from `<div id="pageActions">` in all affected files
- **Priority:** **CRITICAL** - Affects 75% of pages
- **Estimated fix time:** 10 minutes (batch edit)

### Pattern #2: Notification System
- **Status:** ✅ Well-implemented in components.css
- Proper 550px width for dropdown (no truncation)
- Good mobile responsiveness
- Smooth animations
- Unread indicators working correctly

---

## 📊 Audit Status
- **Pages Audited:** 2/12 (Transactions, Bills partial)
- **Pages Remaining:** Dashboard, Assets, Investments, Debts, Income, Operations, Friends, Budget, Reports, Settings
- **Issues Found:** 9 (1 cross-page pattern)
- **High Priority:** 2 (including cross-page fix)
- **Medium Priority:** 5
- **Low Priority:** 2

---

## 🔧 Immediate Action Items

### Quick Win (High Priority)
**Remove `initially-hidden` from all page actions**
- **Command:** Global search for `id="pageActions" class="initially-hidden"`
- **Estimated time:** 5 minutes
- **Impact:** Immediate UX improvement across multiple pages
- **Files to check:** All 12 HTML pages

---

---

## ✅ Previous Recommendations Check

### Empty State Icon Size (FC-UIUX-004)
**Status:** ⚠️ NOT YET IMPLEMENTED  
**Current:** 64px (utilities.css)  
**Recommended:** 80px for better visual impact  
**Note:** Issue documented in main.css comments but not yet applied

---

*Next audit session will review: Dashboard (index.html) for stat cards, charts, and mobile responsiveness*

---

## 📝 Sprint Check Complete

**Timestamp:** Saturday, February 21, 2026 @ 5:22 AM  
**Duration:** ~35 minutes  
**Deliverables:**
- ✅ Audit report created (this file)
- ✅ Fix guide documented (`docs/ui-ux-fix-hidden-actions.md`)
- ✅ Critical pattern identified (hidden page actions)
- ✅ Discord updates posted (#dashboard channel)

**Next Actions:**
1. Builder session: Fix FC-UIUX-001 (hidden actions)
2. Continue audit: Dashboard page deep dive
3. Create Azure DevOps work items for medium-priority issues
