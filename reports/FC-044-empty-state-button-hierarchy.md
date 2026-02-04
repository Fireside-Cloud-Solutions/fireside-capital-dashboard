# FC-044: Empty State Button Hierarchy Violations
**Filed:** February 4, 2026 — 10:20 AM EST  
**Severity:** MEDIUM  
**Status:** OPEN  
**Assigned:** Builder Agent

---

## Issue Summary
Empty state CTA buttons violate the tri-color button hierarchy design system by using `btn-primary` (flame orange) for preparatory actions.

---

## Design System Rule (FC-043)
> **PRIMARY actions - 1 per page max**  
> Reserved for critical commitment actions (modal Save buttons, final submissions).  
> Opening a modal or focusing a search field is a **preparatory step**, not a commitment action → should use `btn-secondary`.

---

## Violations Found

### 1. app/assets/js/empty-states.js (Line 148)
**Impact:** 8 pages affected (assets, bills, budget, debts, friends, income, investments, reports)  
**Current:**
```javascript
<button class="btn btn-primary" onclick="handleEmptyStateAction('${type}')">
  ${config.cta}
</button>
```

**Actions triggered:**
- `openAssetModal()` — Opens modal (preparatory)
- `openBillModal()` — Opens modal (preparatory)
- `openDebtModal()` — Opens modal (preparatory)
- `openIncomeModal()` — Opens modal (preparatory)
- `openInvestmentModal()` — Opens modal (preparatory)
- `generateBudget()` — Triggers generation (preparatory)
- `window.location.href` — Navigation (preparatory)

**Fix:**
```javascript
<button class="btn btn-secondary" onclick="handleEmptyStateAction('${type}')">
  ${config.cta}
</button>
```

---

### 2. app/friends.html (Lines 164, 184, 205)
**Context:** Three hardcoded empty states  
**Current:**
```html
<button class="btn btn-primary" onclick="document.getElementById('friendSearchInput').focus()">
  <i class="bi bi-search me-1"></i> Search for Friends
</button>
```

**Action:** Focuses a search input field (preparatory)

**Fix:**
```html
<button class="btn btn-secondary" onclick="document.getElementById('friendSearchInput').focus()">
  <i class="bi bi-search me-1"></i> Search for Friends
</button>
```

---

### 3. app/transactions.html (Line 216)
**Context:** Empty state "Connect Bank" button  
**Current:**
```html
<button class="btn btn-primary" id="connectBankFromEmpty">
  <i class="bi bi-bank"></i> Sync from Bank
</button>
```

**Action:** Opens Plaid connection flow (preparatory)

**Fix:**
```html
<button class="btn btn-secondary" id="connectBankFromEmpty">
  <i class="bi bi-bank"></i> Sync from Bank
</button>
```

---

## Files to Update

### High Priority
1. ✅ **app/assets/js/empty-states.js** (line 148)
   - Change `btn-primary` → `btn-secondary`
   - Affects 8 pages globally

### Medium Priority
2. ✅ **app/friends.html** (lines 164, 184, 205)
   - Change 3 empty state buttons to `btn-secondary`

3. ✅ **app/transactions.html** (line 216)
   - Change empty state button to `btn-secondary`

---

## Testing Checklist

After fix:
- [ ] Verify empty-states.js generates `btn-secondary` buttons
- [ ] Test all 8 pages with empty-states.js (assets, bills, budget, debts, friends, income, investments, reports)
- [ ] Verify friends.html empty states show gray buttons
- [ ] Verify transactions.html empty state shows gray button
- [ ] Confirm no regression in button functionality
- [ ] Verify visual consistency across all pages

---

## Rationale

### Why btn-secondary?
- **Consistency:** "Add Asset" buttons are btn-secondary → empty state "Add Your First Asset" should match
- **Hierarchy:** Flame orange should be reserved for commitment (Save, Submit, Confirm)
- **UX:** Gray buttons feel appropriate for "start a process" actions
- **Design system:** Matches FC-043 established pattern

### Counter-argument Addressed
**"Empty state CTA is the only action available"** → True, but:
- It's still not a commitment action
- Consistency with page header buttons is more important
- Gray buttons are still clearly clickable and don't reduce discoverability

---

## Related Issues
- **FC-043:** Button hierarchy violations across 7 pages (FIXED)
- **FC-038:** Button style standardization (FIXED)

---

## Impact Assessment
- **Visual:** Minor — buttons change from flame orange to gray outline
- **UX:** Positive — more consistent hierarchy across app
- **Accessibility:** No change — buttons remain keyboard-navigable
- **Performance:** No impact

---

## Recommendation
**FIX IMMEDIATELY** — This is a systematic design system violation that undermines the button hierarchy established in FC-043.

**Estimated effort:** 5 minutes  
**Risk:** LOW (simple class name change)  
**Priority:** MEDIUM (design consistency)
