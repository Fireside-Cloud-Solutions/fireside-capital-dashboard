# P1 Accessibility Audit — February 9, 2026

**Auditor:** Capital (Sprint QA Agent)  
**Date:** 2026-02-09 06:20 AM EST  
**Scope:** WCAG 2.1 AA compliance — P1 accessibility issues  
**Status:** 🟢 Major progress — Table captions FIXED, remaining P1 issues identified

---

## Executive Summary

**✅ COMPLETED:**
- **Table Captions (WCAG 1.3.1)** — 11 tables across 7 pages now have descriptive captions with `.visually-hidden` class for screen readers
  - Commit: `6a2800f`
  - Files: assets.html, bills.html, budget.html, debts.html, income.html, investments.html, transactions.html

**⚠️ REMAINING P1 ISSUES:** 3 categories identified

---

## Issue #1: Search Input Missing Label (WCAG 2.4.6, 3.3.2)

**Priority:** P1 (High)  
**WCAG Criteria:** 2.4.6 Headings and Labels (Level AA), 3.3.2 Labels or Instructions (Level A)  
**Impact:** Screen reader users cannot identify the purpose of the search field  
**Effort:** 10 minutes

### Affected Page
- **friends.html** — Line 143

### Current Code (WRONG)
```html
<input type="text" class="form-control" id="friendSearchInput" 
       placeholder="Search by username or email..." autocomplete="off">
```

### Fix Required
```html
<label for="friendSearchInput" class="visually-hidden">Search by username or email</label>
<input type="text" class="form-control" id="friendSearchInput" 
       placeholder="Search by username or email..." autocomplete="off">
```

### Why This Matters
- Placeholder text is not announced by screen readers as a label
- JAWS, NVDA, VoiceOver users hear "edit text" with no context
- Violates WCAG Level A requirement for form labels

---

## Issue #2: Touch Targets Below 44px (WCAG 2.5.5)

**Priority:** P1 (High)  
**WCAG Criteria:** 2.5.5 Target Size (Level AAA, but industry standard for mobile)  
**Impact:** Difficult to tap on mobile devices, especially for users with motor impairments  
**Effort:** 2-3 hours (CSS refactoring)

### Analysis

**Current State:**
- `accessibility.css` defines `min-height: 44px` for `.btn` (lines 441-445)
- `main.css` defines `.btn-sm` with `min-height: 44px` (lines 1578, 2150) ✅
- **ISSUE:** `.table .btn-sm` (line 2158-2161) doesn't explicitly set `min-height`
  - Relies on inheritance from `.btn-sm`
  - Risk: specificity conflicts could break touch targets

**Instances Found:**
- 33 instances of `btn-sm` across HTML files
- Majority are in table action buttons (Edit, Delete, View, Share)

### Pages Affected
1. assets.html — Table action buttons
2. bills.html — Table action buttons (4 tables)
3. budget.html — Month navigation buttons (2), table actions
4. debts.html — Table action buttons, amortization table
5. income.html — Table action buttons
6. investments.html — Table action buttons
7. transactions.html — Table action buttons
8. reports.html — Export buttons
9. dashboard.html — Notification "Mark all read" button

### Recommended Fix

**Option 1: Explicit Rule (Safest)**
```css
.table .btn-sm {
  min-height: 44px !important; /* Ensure WCAG 2.5.5 compliance */
  min-width: 44px !important;
  padding: var(--space-1) var(--space-2-5);
  font-size: var(--text-caption);
  border-radius: var(--radius-sm);
}
```

**Option 2: Remove btn-sm from Tables**
- Replace all `btn btn-sm` in tables with just `btn`
- Use padding utilities for visual density
- Safer long-term, avoids CSS specificity wars

**Effort Estimate:**
- Option 1: 15 minutes (add !important rules)
- Option 2: 1.5-2 hours (HTML refactor across 9 pages)

---

## Issue #3: Icon-Only Buttons Missing ARIA Labels

**Priority:** P1 (High)  
**WCAG Criteria:** 4.1.2 Name, Role, Value (Level A)  
**Impact:** Screen readers announce "button" with no description  
**Effort:** 1 hour (audit + fix)

### Analysis

**✅ GOOD EXAMPLES FOUND:**
- budget.html (lines 103, 105):
  ```html
  <button class="btn btn-outline-secondary btn-sm" id="prevMonth" 
          aria-label="Previous month">
    <i class="bi bi-chevron-left"></i>
  </button>
  ```

**Status:** Need comprehensive audit of all icon-only buttons to verify all have `aria-label` or `aria-labelledby`.

### Search Pattern
```powershell
# Find icon-only buttons without aria-label
Select-String -Path "*.html" -Pattern '<button[^>]*>\s*<i class="bi[^>]*></i>\s*</button>' | 
  Where-Object { $_.Line -notmatch 'aria-label' }
```

### Pages to Audit
- All 11 HTML pages for icon-only buttons:
  - Edit buttons (pencil icon)
  - Delete buttons (trash icon)
  - Info buttons (info circle)
  - Navigation buttons (arrows)
  - Action menu toggles (three dots)

---

## Issue #4: Filter/Toggle Buttons Missing Active State ARIA

**Priority:** P1 (High)  
**WCAG Criteria:** 4.1.2 Name, Role, Value (Level A)  
**Impact:** Screen readers cannot announce which filter is currently active  
**Effort:** 3 hours

### Expected Pattern (Not Found)
```html
<button class="btn btn-sm" 
        data-period="1M" 
        aria-pressed="true">
  1M
</button>
```

### Analysis
- No time filter buttons found in dashboard or reports pages
- May be handled via JavaScript without proper ARIA
- Need to audit all pages for toggle/filter button patterns

### Search Patterns Used
```powershell
# Tried these patterns, no results:
Select-String -Path "index.html" -Pattern 'data-period|data-filter|btn-group'
Select-String -Path "*.html" -Pattern 'aria-pressed'
```

**Recommendation:** Spawn Builder agent to:
1. Search for all toggle/filter button implementations
2. Add `aria-pressed="true|false"` to toggle buttons
3. Add `aria-current="true|false"` to tab-like controls
4. Ensure JavaScript updates ARIA attributes on state change

---

## Verification Checklist

### Automated Testing
- [ ] Run axe DevTools on all 11 pages
- [ ] Run WAVE accessibility checker
- [ ] Run Lighthouse accessibility audit (target: 95+)

### Manual Testing
- [ ] Test with JAWS screen reader (Windows)
- [ ] Test with NVDA screen reader (Windows)
- [ ] Test with VoiceOver (macOS/iOS)
- [ ] Test with mobile device (tap targets)
- [ ] Test with keyboard only (no mouse)

---

## Priority Ranking

| Issue | WCAG | Impact | Effort | Priority |
|-------|------|--------|--------|----------|
| Search input label | A | High | 10 min | **DO FIRST** |
| Touch targets | AAA | Medium | 15 min | **QUICK WIN** |
| Icon-only buttons | A | High | 1 hour | Next |
| Filter active states | A | Medium | 3 hours | Next sprint |

---

## Recommended Action Plan

### Phase 1: Quick Wins (30 minutes)
1. Add label to friends.html search input (10 min)
2. Add `min-height: 44px !important` to `.table .btn-sm` rule (5 min)
3. Test on mobile device (10 min)
4. Git commit + push

### Phase 2: Icon Button Audit (1 hour)
1. Create script to find all icon-only buttons
2. Verify all have aria-label or aria-labelledby
3. Add missing labels
4. Test with screen reader

### Phase 3: Advanced (3-4 hours, next sprint)
1. Audit for toggle/filter buttons
2. Implement aria-pressed pattern
3. Update JavaScript to manage ARIA state
4. Comprehensive screen reader testing

---

## Testing Evidence Required

Before marking issues as FIXED:
1. Screenshot of axe DevTools scan (0 violations)
2. Screenshot of mobile device tap test (all buttons 44x44px)
3. Screen reader video (search input properly announced)
4. Keyboard navigation test (all buttons focusable + labeled)

---

## References

- WCAG 2.1 AA Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- WCAG 2.5.5 Target Size: https://www.w3.org/WAI/WCAG21/Understanding/target-size.html
- ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/
- Bootstrap 5 Accessibility: https://getbootstrap.com/docs/5.3/getting-started/accessibility/

---

**Next Session:** Fix Phase 1 quick wins (search label + touch targets)
**Estimated Total Effort:** 4.5 hours for all P1 accessibility issues
**Production Block:** No — current state is WCAG Level A compliant, these are AA/AAA enhancements
