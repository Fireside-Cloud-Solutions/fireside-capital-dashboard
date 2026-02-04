# ISSUE-UX-CONSISTENCY-001 — Inconsistent Empty State on Transactions Page

**Severity:** 🟡 LOW (UX Polish)  
**Filed:** February 3, 2026 — 10:15 PM  
**Status:** OPEN  

## Summary
The transactions page uses a minimal text-only empty state, while all other data pages use the full `.empty-state` component with icon, heading, description, and CTA button.

## Current Implementation (transactions.html line 212-213)
```html
<div id="emptyState" class="text-center text-muted d-none">
  <p>No transactions found. Click "Sync from Bank" to import.</p>
</div>
```

## Standard Pattern (Used on 7 Other Pages)
```html
<div id="assetsEmptyState" class="empty-state text-center">
  <i class="bi bi-house-door empty-state-icon"></i>
  <h3>No Assets Yet</h3>
  <p>Start by adding your first asset to track your equity and net worth.</p>
  <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addAssetModal">
    <i class="bi bi-plus-circle"></i> Add Asset
  </button>
</div>
```

**Other pages using full empty state component:**
- assets.html
- bills.html
- budget.html
- debts.html
- income.html
- investments.html
- reports.html

## Impact
- **User confusion:** Inconsistent UI pattern breaks user expectations
- **Less discoverable:** No visual icon or clear CTA button
- **Accessibility:** Missing semantic heading structure

## Recommended Fix
Replace minimal empty state with full component:

```html
<div id="emptyState" class="empty-state text-center d-none">
  <i class="bi bi-credit-card empty-state-icon"></i>
  <h3>No Transactions Yet</h3>
  <p>Connect your bank account with Plaid to automatically import and categorize transactions.</p>
  <button class="btn btn-primary" id="connectBankBtn">
    <i class="bi bi-bank"></i> Sync from Bank
  </button>
</div>
```

**CSS:** Already exists in `assets/css/main.css` (lines 885-913)

## Effort
- **Time:** 5 minutes
- **Risk:** Low (CSS already exists, just update HTML)
- **Files:** 1 (transactions.html)

## Priority
Low — cosmetic consistency issue, no functional impact.

---

**Assignee:** Builder (when time allows)  
**Related:** Part of UX polish sprint
