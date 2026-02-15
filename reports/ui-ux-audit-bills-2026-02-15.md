# UI/UX Audit: Bills (bills.html)
**Date:** February 15, 2026, 7:21 AM  
**Auditor:** Capital (Builder sub-agent)  
**Page:** bills.html (Bills & Subscriptions)  
**Status:** Audit Complete — 8 Issues Identified

---

## Executive Summary
Conducted comprehensive UI/UX audit of the Bills page. Found **8 issues** ranging from critical design violations (button hierarchy, z-index conflicts) to accessibility concerns (missing Cancel button in reset password modal). The page has strong functionality (loan amortization, bill sharing, email parsing) but suffers from the same systemic issues found across other pages.

---

## Issues Identified

### 🚨 ISSUE 1: Z-Index Conflict - Mobile Hamburger Menu [CRITICAL - P0]
**Location:** Inline `<style>` block, line ~44  
**Problem:** Hamburger menu uses `z-index: var(--z-modal)` (400) which conflicts with modal overlays

**Current State:**
```css
.sidebar-toggle {
  z-index: var(--z-modal) !important; /* 400 */
}
```

**Impact:**
- Hamburger menu appears ABOVE modals (login, signup, add bill)
- Users can click hamburger while modal is open
- Breaks modal focus trap
- UX confusion — can't tell if they're in modal or main page

**Root Cause:** Same systemic issue found on index.html, assets.html, transactions.html

**Fix:**
```css
.sidebar-toggle {
  z-index: var(--z-sticky) !important; /* 200 */
}
```

**Effort:** 1 minute (find-replace across all HTML files)

**Work Item:** BUG-UI-NAV-001 (already documented in dashboard audit)

---

### 🚨 ISSUE 2: Button Hierarchy Violation - Dual Secondary Buttons [HIGH - P1]
**Location:** Page header actions (line ~129)  
**Problem:** Two adjacent buttons both use `btn-secondary` (blue), violating design hierarchy

**Current State:**
```html
<button class="btn btn-secondary" id="scanEmailBillsBtn">
  <i class="bi bi-envelope-check"></i> Scan Email for Bills
</button>
<button class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#addBillModal">
  <i class="bi bi-plus-circle"></i> Add Bill
</button>
```

**Design Philosophy:**
> "Flame Orange (#f44e24): PRIMARY actions - 1 per page max"  
> "Link Blue (#01a4ef): SECONDARY actions - supporting functions"  
> "Gray (--color-text-secondary): TERTIARY - low-priority actions"

**Problem:** Both buttons are blue — no visual hierarchy. User doesn't know which is the primary action.

**Expected Pattern:**
- **Primary action** (Add Bill) → `btn-primary` (orange)
- **Secondary action** (Scan Email) → `btn-secondary` (blue)

**Fix:**
```html
<button class="btn btn-secondary" id="scanEmailBillsBtn">
  <i class="bi bi-envelope-check"></i> Scan Email for Bills
</button>
<button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addBillModal">
  <i class="bi bi-plus-circle"></i> Add Bill
</button>
```

**Effort:** 2 minutes

**Work Item:** BUG-UI-BTN-002: Bills Page Button Hierarchy Violation

---

### ⚠️ ISSUE 3: Password Reset Modal Traps Users [MEDIUM - P2]
**Location:** `#resetPasswordModal` (line ~785)  
**Problem:** Static backdrop prevents closing modal — users stuck if error occurs

**Current State:**
```html
<div class="modal fade" id="resetPasswordModal" 
     data-bs-backdrop="static" 
     aria-hidden="true">
```

**Risk Scenario:**
1. User clicks "Forgot Password" link
2. Password reset flow fails (network error, invalid token, expired link)
3. User cannot close modal (static backdrop)
4. User is trapped, must reload page

**Impact:** Poor UX, violates WAI-ARIA authoring practices (modals should always be dismissible)

**Fix:** Add Cancel button
```html
<div class="modal-footer">
  <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
  <button type="submit" class="btn btn-primary" id="resetPasswordBtn">Update Password</button>
</div>
```

**Effort:** 2 minutes

**Work Item:** BUG-UI-MODAL-001: Password Reset Modal Lacks Cancel Button (same as Issue #4 from Dashboard audit)

---

### ⚠️ ISSUE 4: Inline Critical CSS Duplication [MEDIUM - P2]
**Location:** `<style>` block in `<head>` (lines 33-76)  
**Problem:** 44 lines of identical inline CSS in all 11 HTML files

**Current State:**
- Same 44-line CSS block copied across:
  - index.html
  - assets.html
  - bills.html
  - debts.html
  - income.html
  - transactions.html
  - investments.html
  - reports.html
  - settings.html
  - budget.html
  - friends.html

**Impact:**
- Maintenance nightmare — changing 1 line requires 11-file update
- Violates DRY principle
- Increases HTML file size
- Future updates will cause drift/inconsistency

**Fix:**
1. Extract to `app/assets/css/critical.css`
2. Link from all pages: `<link rel="stylesheet" href="assets/css/critical.css">`
3. OR: Inline via build process (Webpack/Vite)

**Effort:** 15 minutes

**Work Item:** BUG-UI-CSS-001: Extract Inline Critical CSS (already documented)

---

### ⚠️ ISSUE 5: Missing Skeleton Loaders [MEDIUM - P2]
**Location:** Bills table, subscription insights widget  
**Problem:** No loading states — users see blank page while data loads

**Current State:**
- Page shows empty `<tbody>` until bills load from Supabase
- Subscription Insights widget appears suddenly (no loading indicator)
- Summary cards show "$0.00" until data loads (looks like no data vs still loading)

**Expected Behavior:**
- Show skeleton loaders for:
  - 3 summary cards (Monthly Bills Total, Recurring, Shared With Me)
  - Bills table (5-7 skeleton rows)
  - Subscription Insights widget (skeleton cards)

**Example (from Dashboard):**
```html
<div class="stat-card-skeleton">
  <div class="skeleton-loader skeleton-value"></div>
  <div class="skeleton-loader skeleton-trend"></div>
</div>
```

**Impact:** Poor perceived performance — users think page is broken or slow

**Effort:** 30 minutes

**Work Item:** BUG-UI-LOAD-001: Bills Page Missing Skeleton Loaders

---

### ISSUE 6: Font Weight Optimization [LOW - P3]
**Location:** Google Fonts link (line 22)  
**Problem:** Loading `Inter:400` but design tokens only use 600 and 700

**Current State:**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,600;1,8..60,400&display=swap" rel="stylesheet">
```

**Wait — this is CORRECT!** Inter:400 is NOT in the URL. Bills page already has the fix.

**Status:** ✅ NOT AN ISSUE — Bills page is correct

---

### ISSUE 7: Excessive Script Tags [LOW - P3]
**Location:** Bottom of `bills.html` (lines ~747-764)  
**Problem:** 16 individual script tags create multiple HTTP requests

**Current Scripts:**
1. @supabase/supabase-js
2. bootstrap.bundle.min.js
3. link-initialize.js (Plaid)
4. csrf.js
5. security-utils.js
6. session-security.js
7. empty-states.js
8. app.js
9. event-handlers.js
10. rate-limiter.js (defer)
11. rate-limit-db.js (defer)
12. polish-utilities.js (defer)
13. security-patch.js (defer)
14. app-polish-enhancements.js (defer)
15. notification-enhancements.js (defer)
16. loading-states.js (defer)
17. plaid.js (defer)
18. subscriptions.js (defer)
19. email-bills.js (defer)

**Proposed Fix:**
Bundle non-critical scripts (10-19) into `bills-bundle.js`

**Expected Impact:**
- Reduce from 19 requests → 10 requests
- Faster page load on slow connections
- Easier maintenance

**Effort:** Same as Dashboard (global fix) — 30 minutes

**Work Item:** BUG-PERF-003: Bundle Non-Critical Scripts (global)

---

### ISSUE 8: Amortization Modal Missing Close Button Keyboard Shortcut [LOW - P3]
**Location:** `#amortizationModal` (line ~779)  
**Problem:** Modal can only be closed via "Close" button — no ESC key support

**Current State:**
```html
<div class="modal fade" id="amortizationModal" tabindex="-1" aria-labelledby="amortizationModalLabel" aria-hidden="true">
```

**Expected:** Bootstrap modals support ESC by default UNLESS `data-bs-keyboard="false"` is set

**Status:** ✅ NOT AN ISSUE — ESC works by default

---

## Page-Specific Strengths

### ✅ Excellent Features
1. **Loan Amortization Calculator** — shows payment breakdown, interest, balance over time
2. **Bill Sharing System** — split bills with friends (equal/percentage/fixed)
3. **Email Bill Parsing** — scan Gmail for bills, auto-import
4. **Subscription Insights** — dedicated widget for subscription analytics
5. **Financing Fields** — loan details (APR, term, payments made, remaining balance)

### ✅ Good Accessibility
- Proper ARIA labels on buttons (`aria-label="Add new bill"`)
- `<caption class="visually-hidden">` on tables
- Semantic HTML (`<main>`, `<thead>`, `<tbody>`)
- Keyboard focus management (modals, dropdowns)

### ✅ Responsive Design
- Mobile-first layout (summary cards stack on mobile)
- Table horizontal scroll on small screens (`.table-responsive`)
- Fixed positioning for auth state (prevents layout shift)

---

## Issues Summary Table

| ID | Priority | Type | Title | Effort |
|----|----------|------|-------|--------|
| 1 | P0 | Bug | Z-Index Conflict - Mobile Hamburger Menu | 1 min |
| 2 | P1 | Bug | Button Hierarchy Violation (Dual Secondary) | 2 min |
| 3 | P2 | Bug | Password Reset Modal Traps Users | 2 min |
| 4 | P2 | Chore | Inline Critical CSS Duplication | 15 min |
| 5 | P2 | Feature | Missing Skeleton Loaders | 30 min |
| 7 | P3 | Chore | Excessive Script Tags | 30 min (global) |

**Total Issues:** 6 (2 already documented globally)  
**New Issues:** 2 (BUG-UI-BTN-002, BUG-UI-LOAD-001)  
**Total Effort:** ~50 minutes (excluding global fixes)

---

## Recommendations

### Immediate Actions (This Sprint)
1. ✅ Fix ISSUE 1 (Z-Index) — P0 CRITICAL — Mobile nav broken
2. ✅ Fix ISSUE 2 (Button Hierarchy) — P1 HIGH — Design violation
3. ✅ Fix ISSUE 3 (Modal Trap) — P2 MEDIUM — UX trap

### Next Sprint
4. Fix ISSUE 5 (Skeleton Loaders) — P2 MEDIUM — Perceived performance
5. Fix ISSUE 4 (Critical CSS) — P2 MEDIUM — Maintainability

### Backlog
6. Fix ISSUE 7 (Script Bundling) — P3 LOW — Real performance gain (global fix)

---

## Comparison to Other Pages

| Issue | Dashboard | Assets | Transactions | Bills |
|-------|-----------|--------|--------------|-------|
| Z-Index Conflict | ❌ | ❌ | ❌ | ❌ |
| Button Hierarchy | ❌ | ✅ | ❌ | ❌ |
| Modal Trap | ❌ | ❌ | ? | ❌ |
| Inline CSS Dup | ❌ | ❌ | ❌ | ❌ |
| Skeleton Loaders | ✅ (fixed) | ? | ✅ (fixed) | ❌ |
| Font Optimization | ❌ | ? | ? | ✅ |
| Script Bundling | ❌ | ❌ | ❌ | ❌ |

**Pattern:** Systemic issues across all pages — z-index, inline CSS, script bundling affect entire app.

---

## Next Audit Target
**Page:** `budget.html` (Budget page)  
**Expected Issues:** Same systemic issues (z-index, CSS duplication), likely button hierarchy violations

---

## Azure DevOps Work Items (To Be Created)

### Bugs
1. **BUG-UI-BTN-002: Bills Page Button Hierarchy Violation**
   - Area: UI/UX
   - Priority: 1 (High)
   - Description: See ISSUE 2 above
   - Acceptance Criteria:
     - "Add Bill" button uses btn-primary
     - "Scan Email for Bills" button uses btn-secondary
     - Visual hierarchy is clear

2. **BUG-UI-LOAD-001: Bills Page Missing Skeleton Loaders**
   - Area: UI/UX
   - Priority: 2 (Medium)
   - Description: See ISSUE 5 above
   - Acceptance Criteria:
     - Summary cards show skeleton loaders while data loads
     - Bills table shows 5-7 skeleton rows
     - Subscription Insights shows skeleton cards

---

**Audit Complete**  
**Pages Audited:** 4 of 11 (Dashboard, Assets, Transactions, Bills)  
**Pages Remaining:** 7 (budget.html, debts.html, income.html, investments.html, reports.html, settings.html, friends.html)  
**Progress:** 36% complete

**Next Sprint:** Continue audit of budget.html
