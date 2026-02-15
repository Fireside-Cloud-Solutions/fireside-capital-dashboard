# UI/UX Audit: Debts & Income Pages
**Date:** February 15, 2026, 7:28 AM  
**Auditor:** Capital (Builder sub-agent)  
**Pages:** debts.html, income.html  
**Status:** Audit Complete — 5 Issues Identified (per page)

---

## Executive Summary
Both pages share identical systemic issues. **NEW**: Single-button pages incorrectly use `btn-secondary` instead of `btn-primary`.

---

## Issues Found (Both Pages)

### 🚨 ISSUE 1: Z-Index Conflict [P0 CRITICAL]
**Status:** ❌ Global issue (all 11 pages)  
**Work Item:** BUG-UI-NAV-001

### 🚨 ISSUE 2: Button Hierarchy Violation - Single Button Uses Secondary [P1 HIGH]
**Location:** Page header actions  
**Problem:** Only one button on page, but it uses `btn-secondary` (blue) instead of `btn-primary` (orange)

**Debts Page:**
```html
<button class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#addDebtModal">
  <i class="bi bi-plus-circle"></i> Add Debt
</button>
```

**Income Page:**
```html
<button class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#addIncomeModal">
  <i class="bi bi-plus-circle"></i> Add Income
</button>
```

**Expected:** When there's only ONE action button on a page, it should be PRIMARY (orange).

**Fix:** Change both to `btn-primary`

**Effort:** 2 minutes (2 pages × 1 line each)

**Work Items:**
- BUG-UI-BTN-004: Debts Page Button Hierarchy Violation
- BUG-UI-BTN-005: Income Page Button Hierarchy Violation

---

### ⚠️ ISSUE 3: Password Reset Modal Traps Users [P2 MEDIUM]
**Status:** ❌ Global issue  
**Work Item:** BUG-UI-MODAL-001

---

### ⚠️ ISSUE 4: Inline Critical CSS Duplication [P2 MEDIUM]
**Status:** ❌ Global issue  
**Work Item:** BUG-UI-CSS-001

---

### ⚠️ ISSUE 5: Missing Skeleton Loaders [P2 MEDIUM]
**Location:** Tables (both pages have single table)  
**Problem:** No loading states — users see empty table while data loads

**Expected:** 5-7 skeleton rows in `<tbody>`

**Effort:** 20 minutes (per page)

**Work Items:**
- BUG-UI-LOAD-003: Debts Page Missing Skeleton Loaders
- BUG-UI-LOAD-004: Income Page Missing Skeleton Loaders

---

## Page-Specific Strengths

### Debts Page ✅
- Financing & Payoff Tracking section (moved from Bills)
- Completed/Paid Off section
- Amortization schedule modal
- Interest rate tracking

### Income Page ✅
- Simple, focused table layout
- Next Pay Day tracking
- Multiple income types (W2, 1099, rental, investment)

---

## Issues Summary

| Page | P0 | P1 | P2 | P3 | Total | New Issues |
|------|----|----|----|----|-------|------------|
| Debts | 1 | 1 | 3 | 0 | 5 | 2 |
| Income | 1 | 1 | 3 | 0 | 5 | 2 |

**Total New Issues:** 4 (button hierarchy × 2, skeleton loaders × 2)

---

**Audit Complete**  
**Pages Audited:** 7 of 11  
**Pages Remaining:** 4 (investments.html, reports.html, settings.html, friends.html)  
**Progress:** 64% complete
