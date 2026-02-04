# FC-043: Button Hierarchy Violations Across Multiple Pages
**Date:** February 4, 2026 - 9:39 AM EST  
**Severity:** MEDIUM (Design System Compliance)  
**Auditor:** Builder (Sprint QA Cron)  
**Status:** 🔴 OPEN

---

## Executive Summary

**6 pages** violate the tri-color button hierarchy design system rule: "Flame Orange (#f44e24): PRIMARY actions - 1 per page max" (documented in main.css line 7).

All page header "Add [Resource]" buttons use `btn-primary` (flame orange) when they should use `btn-secondary` (gray) to maintain proper visual hierarchy. Modal "Save" buttons correctly use `btn-primary` as the critical action within that context.

---

## Design System Rule

From `main.css` lines 6-9:
```css
Design Philosophy (Tri-Color Hierarchy):
- Flame Orange (#f44e24): PRIMARY actions - 1 per page max
- Sky Blue (#01a4ef): SECONDARY actions - 2 per page max
- Neutral Gray: TERTIARY actions - unlimited
```

**Intent:** Primary buttons (flame orange) should be reserved for the MOST CRITICAL action on a page. When a modal opens, the modal becomes the active context, so its "Save" button can be primary.

---

## Affected Pages

### 1. **assets.html** (Line ~97)
**Current:**
```html
<button class="btn btn-primary" onclick="openAssetModal()" aria-label="Add new asset">
  <i class="bi bi-plus-circle"></i> Add Asset
</button>
```

**Expected:**
```html
<button class="btn btn-secondary" onclick="openAssetModal()" aria-label="Add new asset">
  <i class="bi bi-plus-circle"></i> Add Asset
</button>
```

---

### 2. **bills.html** (Line ~97)
**Current:**
```html
<button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addBillModal" aria-label="Add new bill">
  <i class="bi bi-plus-circle"></i> Add Bill
</button>
```

**Expected:**
```html
<button class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#addBillModal" aria-label="Add new bill">
  <i class="bi bi-plus-circle"></i> Add Bill
</button>
```

---

### 3. **debts.html** (Line ~97)
**Current:**
```html
<button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addDebtModal" aria-label="Add new debt">
  <i class="bi bi-plus-circle"></i> Add Debt
</button>
```

**Expected:**
```html
<button class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#addDebtModal" aria-label="Add new debt">
  <i class="bi bi-plus-circle"></i> Add Debt
</button>
```

---

### 4. **income.html** (Line ~97)
**Current:**
```html
<button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addIncomeModal" aria-label="Add new income source">
  <i class="bi bi-plus-circle"></i> Add Income
</button>
```

**Expected:**
```html
<button class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#addIncomeModal" aria-label="Add new income source">
  <i class="bi bi-plus-circle"></i> Add Income
</button>
```

---

### 5. **investments.html** (Line 97)
**Current:**
```html
<button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addInvestmentModal" aria-label="Add new investment">
  <i class="bi bi-plus-circle"></i> Add Investment
</button>
```

**Expected:**
```html
<button class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#addInvestmentModal" aria-label="Add new investment">
  <i class="bi bi-plus-circle"></i> Add Investment
</button>
```

---

### 6. **budget.html** (Line ~135)
**Current:**
```html
<button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#addBudgetItemModal" aria-label="Add new budget item">
  <i class="bi bi-plus-circle"></i> Add Item
</button>
```

**Expected:**
```html
<button class="btn btn-secondary btn-sm" data-bs-toggle="modal" data-bs-target="#addBudgetItemModal" aria-label="Add new budget item">
  <i class="bi bi-plus-circle"></i> Add Item
</button>
```

---

## Impact

### Visual Hierarchy Confusion
- Users see multiple orange "danger/critical" buttons, diluting the visual signal
- Flame orange should mean "this is THE action" — not "one of several actions"
- Reduces clarity of UI navigation

### Design System Integrity
- Violates documented tri-color hierarchy
- Inconsistent with brand guidelines (Fireside Cloud Solutions family)
- Makes future design decisions ambiguous

### User Experience
- Low severity for functionality (buttons still work)
- Medium severity for polish and professional appearance
- High severity for design system compliance

---

## Rationale for Change

### Why Page Header Buttons Should Be Secondary
1. **Opening a modal is not a commitment** — it's a preparatory step
2. **The actual commitment happens in the modal** — "Save [Resource]" button (which correctly uses btn-primary)
3. **Gray secondary buttons feel appropriate** for "start adding something" actions
4. **Flame orange feels too aggressive** for non-destructive preparatory actions

### Why Modal Save Buttons Should Stay Primary
1. **Modal context becomes the active UI** — page header fades to background
2. **Save action IS the critical commitment** — user is about to write data
3. **One primary button per context** — page has one (now secondary), modal has one (primary)

---

## Comparison with Other Pages

### ✅ **Correctly Implemented**
- **friends.html**: Search button uses `btn-secondary` (fixed in FC-039)
- **transactions.html**: Auto-categorize button uses `btn-secondary`
- **settings.html**: Save Settings uses `btn-primary` (acceptable — primary page action with no modal)

### ❌ **Incorrectly Implemented**
- All resource management pages (assets, bills, debts, income, investments, budget)

---

## Recommendations

### High Priority (This Sprint)
✅ **Fix all 6 violations** — simple one-line changes per file  
Estimated time: 15 minutes total

### Medium Priority (Next Sprint)
⚠️ **Document button usage guidelines** — add to DESIGN-SYSTEM.md or README  
⚠️ **Add CSS linting rules** — prevent future violations

### Low Priority (Future)
💡 **Consider button color semantics** — should "Add" actions use blue secondary instead of gray?  
💡 **Audit other button usages** — ensure consistency across all interactive elements

---

## Testing Instructions

After fix:
1. Visit each affected page while logged in
2. Verify "Add [Resource]" button renders as **gray secondary** (not orange primary)
3. Click button to open modal
4. Verify modal "Save [Resource]" button renders as **orange primary**
5. Ensure no visual regressions (button sizing, spacing, icons)

---

## Related Issues

- ✅ **FC-038:** Button styling inconsistencies (friends.html auth buttons) — FIXED
- ✅ **FC-039:** Friends search button using btn-primary — FIXED
- ⚠️ **FC-034:** Bills page filter button consistency — FIXED (different pattern)

---

## Files to Modify

1. `app/assets.html` (line ~97)
2. `app/bills.html` (line ~97)
3. `app/debts.html` (line ~97)
4. `app/income.html` (line ~97)
5. `app/investments.html` (line 97)
6. `app/budget.html` (line ~135)

**Total:** 6 files, 6 one-line changes  
**Estimated Fix Time:** 15 minutes

---

## Priority Justification

**Medium Severity** because:
- ✅ No functional impact (buttons work correctly)
- ❌ Violates documented design system
- ❌ Affects 6 of 11 pages (55% of app)
- ❌ Undermines professional polish and brand consistency
- ✅ Easy to fix (low effort, high impact)

**Should be fixed before production launch** to maintain design system integrity.

---

**Auditor:** Builder (Capital sub-agent)  
**Session:** sprint-qa (cron job 2c47f0fa-ed35-4903-ab7c-ce1da8198488)  
**Next Steps:** Await approval from Capital, then implement fix
