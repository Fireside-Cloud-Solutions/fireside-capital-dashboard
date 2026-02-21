# QA Sprint Audit Report
**Date:** February 21, 2026, 7:00 AM EST  
**Auditor:** Builder Agent  
**Scope:** Full site functional testing + CSS review  
**Environment:** https://nice-cliff-05b13880f.2.azurestaticapps.net

---

## 🔴 CRITICAL BUGS

### BUG-DB-SNAPSHOTS-SCHEMA-001 (Priority: P0 - BLOCKING)
**Title:** Database schema mismatch - snapshots table missing required columns

**Description:**  
The application code attempts to insert 6 fields into the `snapshots` table, but the table only has 3 data columns.

**Current Schema:**
```sql
CREATE TABLE public.snapshots (
    user_id uuid NOT NULL,
    date date NOT NULL,
    "netWorth" numeric,
    created_at timestamp with time zone DEFAULT now()
);
```

**Code Attempt (app.js:3805-3817):**
```javascript
await sb.from('snapshots').upsert({
  date: today,
  netWorth,          // ✅ EXISTS
  totalAssets,       // ❌ MISSING
  totalInvestments,  // ❌ MISSING
  totalDebts,        // ❌ MISSING
  monthlyBills,      // ❌ MISSING
  monthlyIncome,     // ❌ MISSING
  user_id: currentUser.id
}, { onConflict: 'date,user_id' });
```

**Error in Console:**
```
Error saving snapshot: {
  code: PGRST204,
  message: Could not find the 'monthlyBills' column of 'snapshots' in the schema cache
}
```

**Impact:**
- ❌ Daily snapshots cannot be saved
- ❌ Reports page shows $0.00 for all metrics (depends on snapshots data)
- ❌ Net worth trends cannot be calculated
- ❌ Month-over-month comparisons broken

**Fix Required:**
Either:
1. **ADD COLUMNS** to snapshots table:
```sql
ALTER TABLE public.snapshots 
ADD COLUMN "totalAssets" numeric,
ADD COLUMN "totalInvestments" numeric,
ADD COLUMN "totalDebts" numeric,
ADD COLUMN "monthlyBills" numeric,
ADD COLUMN "monthlyIncome" numeric;
```

OR:

2. **REMOVE FIELDS** from app.js upsert (lines 3810-3813)

**Recommendation:** Option 1 (add columns) — retains full historical data tracking per FC-086 spec.

---

## 🟡 HIGH PRIORITY BUGS

### BUG-UI-REPORTS-ZERO-001 (Priority: P1)
**Title:** Reports page summary cards show $0.00 instead of actual data

**Location:** `reports.html`

**Description:**  
All 3 summary cards at top of Reports page display $0.00:
- Total Investments: Shows $0.00 (actual: $214,521.27)
- Total Debts: Shows $0.00 (actual: $9,799.73)
- Net Worth: Shows $0.00 (actual: $286,957.01)

**Root Cause:** Likely caused by BUG-DB-SNAPSHOTS-SCHEMA-001 — Reports page may calculate these from snapshots table which has no valid data.

**Fix:** Resolve BUG-DB-SNAPSHOTS-SCHEMA-001 first, then test if Reports auto-fixes.

**Screenshot:** See `qa-sprint-audit-2026-02-21-reports.jpg`

---

## 🟡 MEDIUM PRIORITY BUGS

### BUG-UI-TRANSACTIONS-SKELETON-002 (Priority: P2)
**Title:** Transactions page stuck in skeleton loading state when empty

**Location:** `transactions.html`

**Description:**  
When transactions table is empty (no data synced from bank), the page shows persistent skeleton loaders instead of an empty state message.

**Expected:**  
Show empty state:
```
📋 No Transactions Yet
Connect your bank account or add transactions manually to get started.
[Sync from Bank] [Add Transaction]
```

**Actual:**  
Permanent skeleton loader rows (dark bars animating indefinitely)

**Fix Location:** `app/assets/js/transactions.js` — Add empty state detection:
```javascript
if (transactions.length === 0) {
  showEmptyState('transactionsTable');
} else {
  renderTransactions(transactions);
}
```

**Screenshot:** See `qa-sprint-audit-2026-02-21-transactions.jpg`

---

### BUG-UI-SETTINGS-SKELETON-003 (Priority: P2)
**Title:** Settings page Emergency Fund Goal input showing skeleton loader

**Location:** `settings.html`

**Description:**  
The Emergency Fund Goal section shows a skeleton loader bar instead of the actual input field.

**Expected:**  
```
Emergency Fund Goal
[$ 20,000] input field
Recommended: 3-6 months of expenses ($5,000 - $50,000 typical range)
```

**Actual:**  
Gray animated skeleton bar where input should be

**Likely Cause:** JavaScript not removing `.loading` class from the element after data loads (or loads as empty).

**Fix Location:** `app/assets/js/settings.js` — Check `loadSettings()` function completion

**Screenshot:** See `qa-sprint-audit-2026-02-21-settings.jpg`

---

## 🟢 LOW PRIORITY ISSUES

### BUG-UI-DASHBOARD-EMERGENCY-CHART-004 (Priority: P3)
**Title:** Emergency Fund Progress chart appears empty on Dashboard

**Location:** `index.html` (Dashboard)

**Description:**  
The "Emergency Fund Progress" chart card shows only axis labels ("Goal" and "Current") but no visible chart rendering.

**Possible Causes:**
1. Chart data is zero/null
2. Chart canvas not rendering (CSS or Chart.js config issue)
3. Missing emergency fund goal in settings

**Investigation Needed:**  
Check if emergency fund goal is set in `settings` table. If null, chart may intentionally be hidden.

**Screenshot:** See `qa-sprint-audit-2026-02-21-dashboard.jpg`

---

## ✅ PAGES TESTED - ALL FUNCTIONAL

| Page | Status | Notes |
|------|--------|-------|
| **Dashboard** | ✅ PASS | All summary cards load, charts render, subscriptions widget works |
| **Assets** | ✅ PASS | Table displays 2 assets correctly with edit/delete actions |
| **Investments** | ✅ PASS | 5 investments showing with proper formatting |
| **Debts** | ✅ PASS | Credit cards + financing cards + completed section all working |
| **Bills** | ✅ PASS | Recurring bills table + shared bills section functional |
| **Income** | ✅ PASS | 2 income sources displayed, summary stats accurate |
| **Transactions** | ⚠️ PARTIAL | UI works, but stuck in skeleton state (see BUG-002) |
| **Operations** | ✅ PASS | Excellent page - Safe to Spend, Cash Flow, Bills Aging all working |
| **Friends** | ✅ PASS | Search, friend list, sent requests all functional |
| **Budget** | ✅ PASS | Month selector, budget table, Generate Budget button all working |
| **Reports** | ⚠️ PARTIAL | Charts render, but summary cards show $0 (see BUG-001) |
| **Settings** | ⚠️ PARTIAL | Category budgets work, but Emergency Fund input skeleton (see BUG-003) |

---

## 📋 CSS REVIEW FINDINGS

**Files Reviewed:**
- `main.css` (3674 lines)
- `components.css` (extensive skeleton loader definitions)
- `design-tokens.css`
- `responsive.css`
- `accessibility.css`
- `critical.css`
- `utilities.css`
- `onboarding.css`
- `logged-out-cta.css`

**Result:** ✅ **No CSS bugs found**

**Notes:**
- Well-documented with clear sections
- Skeleton loaders properly defined with animations
- CSS includes fix for BUG-SKEL-001 (hiding skeletons when .loading removed)
- Responsive design properly implemented
- WCAG compliance styles present
- 8px grid system consistently applied
- Dark mode theming works correctly

**Skeleton CSS is correct** — bugs are JavaScript-side (`.loading` class not being removed).

---

## 🔧 RECOMMENDED ACTIONS

### Immediate (Today):
1. **Fix BUG-DB-SNAPSHOTS-SCHEMA-001** — Run migration to add missing columns to `snapshots` table
2. **Test Reports page** — After schema fix, verify if $0.00 issue auto-resolves
3. **Fix Transactions skeleton** — Add empty state detection in `transactions.js`
4. **Fix Settings skeleton** — Debug `loadSettings()` completion in `settings.js`

### This Week:
5. **Investigate Emergency Fund chart** — Determine if intentional behavior or bug
6. **Add error handling** — Catch schema errors gracefully instead of logging to console
7. **Regression test** — After schema migration, test all pages again

---

## 📊 SUMMARY

| Category | Count |
|----------|-------|
| **Critical Bugs** | 1 |
| **High Priority** | 1 |
| **Medium Priority** | 2 |
| **Low Priority** | 1 |
| **Total Issues** | 5 |
| **Pages Tested** | 12/12 |
| **CSS Files Reviewed** | 9/9 |

**Overall Assessment:** Application is functionally solid with excellent UI/UX. One critical database schema bug is blocking core functionality (snapshots + reports). Three skeleton loader issues need JavaScript fixes.

**Test Coverage:** 100% of pages tested with live site authentication and browser automation.

---

## 📸 SCREENSHOTS CAPTURED

All screenshots saved to `.clawdbot/media/browser/`:
- Dashboard (logged out + logged in)
- Assets
- Investments
- Debts
- Bills
- Income
- Transactions (skeleton issue)
- Operations
- Friends
- Budget
- Reports ($0 issue)
- Settings (skeleton issue)

---

**Report Generated:** February 21, 2026 at 7:30 AM EST  
**Next Audit:** After schema migration completion
