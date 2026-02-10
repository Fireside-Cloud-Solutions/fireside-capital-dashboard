# UI/UX Audit Report: Investments Page
**Fireside Capital Dashboard**

---

## Audit Metadata
- **Page:** investments.html
- **Date:** February 10, 2026 — 6:28 AM
- **Auditor:** Capital (Architect agent)
- **Status:** ✅ COMPLETE
- **Severity Breakdown:** 0 High | 3 Medium | 2 Low

---

## Executive Summary

The Investments page demonstrates solid foundational structure with proper empty state integration, responsive design, and accessibility patterns. However, several consistency and UX improvements are needed to match the quality standards established on previously audited pages.

**Production Readiness:** ⚠️ **MODERATE** — Medium-priority fixes recommended before launch.

---

## Issues Found

### ISSUE-INV001: Missing Empty State Modal Trigger Function
**Severity:** 🟡 MEDIUM  
**Location:** `investments.html` line 445 (empty-states.js reference)  
**Category:** JavaScript / UX

**Issue:**  
Empty state configuration references `openInvestmentModal()` but this function doesn't exist in the page. The modal trigger uses Bootstrap's data attributes (`data-bs-toggle`, `data-bs-target`).

**Expected:**
```javascript
action: () => typeof openInvestmentModal === 'function' && openInvestmentModal()
```

**Current State:**  
No `openInvestmentModal()` function defined in inline scripts or external JS files.

**Fix:**  
Add modal trigger helper function or update empty state config to use Bootstrap modal API:

```javascript
// Option 1: Add helper function
function openInvestmentModal() {
  const modal = new bootstrap.Modal(document.getElementById('addInvestmentModal'));
  modal.show();
}

// Option 2: Update empty-states.js config (preferred for consistency)
investments: {
  // ... existing config
  action: () => {
    const modal = new bootstrap.Modal(document.getElementById('addInvestmentModal'));
    modal.show();
  }
}
```

**Impact:** Empty state CTA button will fail silently when clicked.  
**Effort:** Small (5 minutes)  
**Priority:** Medium (affects new user experience)

---

### ISSUE-INV002: Inconsistent Form Validation Pattern
**Severity:** 🟡 MEDIUM  
**Location:** `investments.html` lines 220-267 (Add Investment Modal form)  
**Category:** Forms / Accessibility

**Issue:**  
Form has `required` attributes but lacks:
1. Visual `.is-invalid` class application on error
2. `<div class="invalid-feedback">` error message containers
3. `aria-describedby` attributes for screen readers
4. Client-side validation feedback

**Current State:**  
```html
<input type="text" class="form-control" id="investmentName" required placeholder="e.g., 401(k), Roth IRA, Brokerage">
<!-- Missing: aria-describedby, invalid-feedback div -->
```

**Expected Pattern (from other audited pages):**  
```html
<input 
  type="text" 
  class="form-control" 
  id="investmentName" 
  required 
  placeholder="e.g., 401(k), Roth IRA, Brokerage"
  aria-describedby="investmentNameHelp investmentNameError"
>
<div id="investmentNameError" class="invalid-feedback">
  Please provide an investment name.
</div>
```

**Fix:**  
1. Add `invalid-feedback` divs after each required field
2. Add `aria-describedby` attributes
3. Implement client-side validation in form submit handler
4. Apply `.is-invalid` class on validation failure

**Impact:** Poor accessibility for screen reader users; no visual feedback on validation errors.  
**Effort:** Medium (30-45 minutes for all fields)  
**Priority:** Medium (accessibility + UX consistency)

---

### ISSUE-INV003: Missing Helper Text for Complex Field
**Severity:** 🟢 LOW  
**Location:** `investments.html` line 250 (Annual Return field)  
**Category:** UX / Forms

**Issue:**  
The "Expected Annual Return (%)" field allows a wide range (-20% to 50%) but provides no context about:
- What's considered realistic (7-10% for stock indexes)
- Negative returns representing losses
- Impact on projections

**Current State:**  
```html
<label for="annualReturn" class="form-label">Expected Annual Return (%)</label>
<input type="number" class="form-control" id="annualReturn" required min="-20" max="50" step="0.1">
```

**Recommended Enhancement:**  
```html
<label for="annualReturn" class="form-label">Expected Annual Return (%)</label>
<input 
  type="number" 
  class="form-control" 
  id="annualReturn" 
  required 
  min="-20" 
  max="50" 
  step="0.1"
  aria-describedby="annualReturnHelp"
>
<div id="annualReturnHelp" class="form-text">
  <i class="bi bi-info-circle"></i> Historical avg: 7-10% for stocks, 4-6% for bonds. Use negative values for expected losses.
</div>
```

**Impact:** Low — Users may enter unrealistic values without understanding implications.  
**Effort:** Small (10 minutes)  
**Priority:** Low (enhancement, not critical)

---

### ISSUE-INV004: Mobile Table Responsiveness Concern
**Severity:** 🟡 MEDIUM  
**Location:** `investments.html` lines 168-182 (table structure)  
**Category:** Responsive Design / UX

**Issue:**  
Investment table has **8 columns** (Name, Type, Starting Balance, Monthly Contribution, Annual Return, Next Contribution, Current Value, Actions), which will cause horizontal scrolling on devices < 768px.

**Current State:**  
```html
<table class="table align-middle mb-0">
  <thead>
    <tr>
      <th>Name</th>
      <th>Type</th>
      <th>Starting Balance</th>
      <th>Monthly Contribution</th>
      <th>Annual Return</th>
      <th>Next Contribution</th>
      <th>Current Value</th>
      <th>Actions</th>
    </tr>
  </thead>
```

**Expected Behavior:**  
Responsive table should:
1. Show only essential columns on mobile (Name, Current Value, Actions)
2. Hide secondary columns with `.d-none .d-md-table-cell` classes
3. OR implement card-based layout for mobile breakpoints

**Recommended Fix:**  
```html
<th>Name</th>
<th class="d-none d-md-table-cell">Type</th>
<th class="d-none d-lg-table-cell">Starting Balance</th>
<th class="d-none d-lg-table-cell">Monthly Contribution</th>
<th class="d-none d-lg-table-cell">Annual Return</th>
<th class="d-none d-md-table-cell">Next Contribution</th>
<th>Current Value</th>
<th>Actions</th>
```

**Mobile Priority Columns:**  
- **Always show:** Name, Current Value, Actions (3 columns)
- **Tablet+:** Add Type, Next Contribution (5 columns)
- **Desktop+:** Show all (8 columns)

**Impact:** Horizontal scrolling on mobile creates poor UX; users can't see all data without panning.  
**Effort:** Medium (requires JS table rendering update + responsive classes)  
**Priority:** Medium (affects mobile usability)

---

### ISSUE-INV005: Missing "Starting Balance" Helper Text
**Severity:** 🟢 LOW  
**Location:** `investments.html` line 240 (Starting Balance field)  
**Category:** UX / Forms

**Issue:**  
"Starting Balance" field is optional but lacks explanation of:
- When to use it (account opened before tracking began)
- Impact on growth calculations
- Difference from "Current Value"

**Current State:**  
```html
<label for="startingBalance" class="form-label">Starting Balance ($)</label>
<input type="number" class="form-control" id="startingBalance" min="0" step="0.01">
```

**Recommended Enhancement:**  
```html
<label for="startingBalance" class="form-label">Starting Balance ($)</label>
<input 
  type="number" 
  class="form-control" 
  id="startingBalance" 
  min="0" 
  step="0.01"
  aria-describedby="startingBalanceHelp"
>
<div id="startingBalanceHelp" class="form-text">
  <i class="bi bi-info-circle"></i> Optional. Use if you opened this account before starting to track in Fireside.
</div>
```

**Impact:** Low — May cause user confusion but won't break functionality.  
**Effort:** Small (5 minutes)  
**Priority:** Low (nice-to-have clarity)

---

## Positive Observations ✅

1. **Empty State Integration:** Proper use of `empty-states.js` system (though needs modal trigger fix)
2. **Semantic HTML:** Good use of semantic elements (`<caption>`, `<thead>`, `<tbody>`)
3. **Accessibility Foundation:** Has `visually-hidden` caption for screen readers
4. **Auth State Handling:** Consistent auth pattern with other pages
5. **Modal Structure:** Proper ARIA labels, Bootstrap modal patterns
6. **Form Field Types:** Correct input types (`number`, `date`, `select`)
7. **Required Field Indicators:** Visual `<span class="text-danger">*</span>` markers
8. **Consistent Design Language:** Matches brand colors, typography, button hierarchy

---

## Recommendations Summary

### High Priority (Block Launch)
None

### Medium Priority (Fix Before Launch)
1. **INV001:** Add `openInvestmentModal()` helper function for empty state CTA
2. **INV002:** Implement form validation feedback (`.is-invalid`, `invalid-feedback`, `aria-describedby`)
3. **INV004:** Make table responsive with column priority classes

### Low Priority (Post-Launch Polish)
1. **INV003:** Add helper text for "Annual Return" field
2. **INV005:** Add helper text for "Starting Balance" field

---

## Code Quality Assessment

| Category | Score | Notes |
|----------|-------|-------|
| HTML Structure | 9/10 | Semantic, accessible, well-organized |
| Form Validation | 6/10 | Missing visual feedback + ARIA attributes |
| Responsive Design | 7/10 | Mobile table overflow concern |
| Accessibility | 7/10 | Missing form error descriptions |
| Empty State Handling | 8/10 | Integrated but modal trigger missing |
| Brand Consistency | 10/10 | Perfect alignment with design system |
| **Overall** | **7.8/10** | **Good foundation, needs UX polish** |

---

## Testing Recommendations

### Manual Testing Checklist
- [ ] Test empty state CTA button (will currently fail)
- [ ] Submit form with missing required fields → verify error messaging
- [ ] Test table on 375px mobile viewport → check for horizontal scroll
- [ ] Screen reader test: verify form field descriptions
- [ ] Test form validation for all fields (name, type, value, etc.)
- [ ] Verify modal opens correctly from "Add Investment" button
- [ ] Test date picker for "Next Contribution Date" field
- [ ] Verify number field constraints (min/max/step values)

### Browser Testing
- Chrome (desktop + mobile viewport)
- Safari iOS (table responsiveness critical)
- Firefox (form validation styling)

---

## Next Actions

1. **Immediate (30 min):**
   - Add `openInvestmentModal()` helper function
   - Test empty state flow end-to-end

2. **Before Launch (1-2 hours):**
   - Implement form validation feedback system
   - Add responsive table classes (column priority)
   - Test on real mobile device (iPhone SE, Galaxy S21)

3. **Post-Launch Polish:**
   - Add contextual helper text for complex fields
   - Consider card-based mobile layout for investment table

---

## Audit Status

**Page:** investments.html  
**Issues Found:** 5 (0 high, 3 medium, 2 low)  
**Status:** ⚠️ Ready for fixes  
**Estimated Fix Time:** 2-3 hours  
**Next Audit:** reports.html

---

*Audit completed by Capital (Architect) on February 10, 2026 at 6:28 AM*
