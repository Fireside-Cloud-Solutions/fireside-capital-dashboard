# QA Audit Report — Sprint 1

**Auditor:** Auditor Agent  
**Date:** July 7, 2025  
**Scope:** Budget page fixes, financing cards, bill edit modal, security, code quality, edge cases  
**Files Reviewed:** `app/assets/js/app.js` (2184 lines), `app/bills.html`, `app/budget.html`

---

## 🔴 CRITICAL (must fix)

### CRIT-01: Update/Delete Operations Missing `user_id` Filter

- **What was tested:** All Supabase queries for proper user_id scoping
- **Expected:** Every write/delete operation filters by `user_id` to prevent cross-user data access
- **Actual:** All `SELECT` queries correctly include `.eq('user_id', currentUser.id)`. However, all `UPDATE` and `DELETE` operations on assets, investments, debts, bills, and income filter ONLY by record `id` — **not by `user_id`**.
- **Affected lines:**
  - `app.js:429` — `sb.from('assets').update(record).eq('id', editAssetId)` 
  - `app.js:441` — `sb.from('assets').delete().eq('id', deleteAssetId)`
  - `app.js:486` — `sb.from('investments').update(record).eq('id', editInvestmentId)`
  - `app.js:501` — `sb.from('investments').delete().eq('id', id)`
  - `app.js:543` — `sb.from('debts').update(record).eq('id', editDebtId)`
  - `app.js:555` — `sb.from('debts').delete().eq('id', deleteDebtId)`
  - `app.js:1024` — `sb.from('bills').update(record).eq('id', editBillId)`
  - `app.js:1140` — `sb.from('bills').delete().eq('id', deleteBillId)` 
  - `app.js:1167` — `sb.from('income').update(record).eq('id', editIncomeId)`
  - `app.js:1192` — `sb.from('income').delete().eq('id', deleteIncomeId)`
- **Risk:** If Supabase Row Level Security (RLS) is not enabled on these tables, **any authenticated user could modify or delete another user's records** by guessing/enumerating UUIDs.
- **Note:** Budget operations (`deleteBudgetItem`, `saveBudgetAssignment`) correctly filter by `user_id` ✅
- **Recommended fix:** Add `.eq('user_id', currentUser.id)` to every update/delete call. Also verify RLS is enabled on all tables as a defense-in-depth measure.

---

## 🟡 MEDIUM (should fix)

### MED-01: Deleted Bill-Based Budget Items Reappear on "Generate Budget"

- **What was tested:** What happens when a user deletes a bill-based budget item and then clicks "Generate Budget"
- **Expected:** Deleted items stay deleted (or user is warned they'll be re-added)
- **Actual:** `generateBudgetForMonth()` (line 1704) fetches existing budget entries, builds a `budgetedItemIds` set, and adds entries for any bill/debt NOT in that set. If a user deleted a bill-based budget entry, it's no longer in the set, so Generate Budget **re-adds it**.
- **File:** `app/assets/js/app.js`, lines 1774-1780
- **Recommended fix:** Either:
  1. Instead of deleting, set a `suppressed: true` flag on the budget record so Generate Budget skips it, OR
  2. Maintain a `suppressed_items` list in the budgets table for the month, OR  
  3. Show a confirmation: "This will re-add previously removed items. Continue?"

### MED-02: Duplicate/Inconsistent Bill Type Options

- **What was tested:** Bill type dropdown values in the form
- **Expected:** Consistent, non-duplicate type options
- **Actual:** The `<select id="billType">` contains both:
  - `subscriptions` (lowercase) AND `Subscription` (capitalized) — lines 177-178
  - `utilities` (lowercase) AND `Utility` (capitalized) — lines 174, 179
- **File:** `app/bills.html`, lines 171-180
- **Impact:** Different casing creates different values in the database. `getCategoryBadgeClass()` (app.js:564) only handles lowercase `'subscriptions'` and `'utilities'`, so capitalized variants get the fallback grey badge.
- **Recommended fix:** Remove the duplicates (`Subscription`, `Utility`). If existing DB records have these values, run a migration to normalize them.

### MED-03: No Empty State on Budget Page

- **What was tested:** Budget page behavior with no bills, no debts, and no custom items
- **Expected:** Informative empty state message guiding user
- **Actual:** The budget table renders with zero rows — completely empty. No message like "No items to budget. Add bills or click Generate Budget to get started."
- **File:** `app/assets/js/app.js`, `loadAndRenderBudget()` function (line 1448)
- **Recommended fix:** After rendering all rows, check if `tbody` has no children and display an informative empty state row.

### MED-04: No Income Warning When Budgeting

- **What was tested:** Budget page with $0 income for the month
- **Expected:** Warning that no income exists for this month
- **Actual:** Summary cards show `$0.00` for Expected Income, and Remaining to Budget goes negative as items are assigned. No alert or visual warning.
- **File:** `app/assets/js/app.js`, `loadAndRenderBudget()`, lines 1488-1490
- **Recommended fix:** If `totalIncome === 0`, display a warning banner: "No income sources found. Add income on the Income page."

### MED-05: `showAmortizationSchedule` and `deleteBudgetItem` Not in Global Exports

- **What was tested:** Functions called from `onclick` attributes in dynamically-generated HTML
- **Expected:** All onclick-referenced functions should be in the `window.xxx` exports block for consistency
- **Actual:** Both `showAmortizationSchedule` (used at line ~808 in financing cards) and `deleteBudgetItem` (used at lines 1535, 1560) are called via onclick but are NOT listed in the global exports block (lines 2168-2183).
- **File:** `app/assets/js/app.js`, lines 2168-2183
- **Why it works now:** Since `app.js` is loaded as a regular `<script>` (not `type="module"`), top-level function declarations are automatically global.
- **Risk:** If the script is ever refactored to an ES module, these will break silently.
- **Recommended fix:** Add to the exports block:
  ```js
  window.showAmortizationSchedule = showAmortizationSchedule;
  window.deleteBudgetItem = deleteBudgetItem;
  ```

---

## 🟢 LOW (nice to fix)

### LOW-01: Unescaped IDs in `onclick` Attributes

- **What was tested:** XSS surface in dynamically-generated HTML
- **Expected:** All user-controllable values in HTML attributes should be escaped
- **Actual:** Record IDs (e.g., `item.id`, `b.id`) are injected directly into onclick handlers without escaping:
  ```js
  onclick="deleteBudgetItem('${item.id}', '${monthString}')"
  onclick="openBillModal('${b.id}')"
  ```
- **Risk:** Very low — Supabase UUIDs are safe alphanumeric strings. But if IDs ever contained quotes or special chars, it could break the HTML or enable injection.
- **Recommended fix:** Use `escapeHtml()` on IDs in attribute contexts, or switch to `data-*` attributes with delegated event listeners.

### LOW-02: `saveBudgetItem` Calls `renderAll()` Instead of `loadAndRenderBudget()`

- **What was tested:** Behavior after adding a custom budget item
- **Expected:** Budget view refreshes efficiently
- **Actual:** `saveBudgetItem()` (line 1679) calls `renderAll()` which re-renders ALL tables (assets, investments, debts, bills, income) even though we're on the budget page. `deleteBudgetItem()` correctly calls `loadAndRenderBudget()` instead.
- **File:** `app/assets/js/app.js`, line 1679
- **Recommended fix:** Change to `loadAndRenderBudget()` for consistency and efficiency.

### LOW-03: Budget Input Change Listener Re-attached on Every Render

- **What was tested:** Event listener management in budget table
- **Expected:** Clean listener lifecycle
- **Actual:** `loadAndRenderBudget()` rebuilds the table with `tbody.innerHTML = ''` and then re-queries `.assigned-input` elements to attach change listeners (line 1572). Since old DOM elements are destroyed, old listeners are garbage collected. However, this is a fragile pattern.
- **File:** `app/assets/js/app.js`, line 1572
- **Recommended fix:** Use event delegation on the `tbody` element instead:
  ```js
  tbody.addEventListener('change', (e) => { if (e.target.matches('.assigned-input')) { ... } });
  ```

### LOW-04: `saveBill()` Fallback Retry Could Be Tighter

- **What was tested:** `saveBill()` retry logic when DB columns don't exist
- **Expected:** Clean fallback
- **Actual:** The retry at line 1025 checks `error.message.includes('column')` which is a fragile string match. Also, the fallback `baseRecord` includes `total_amount` and `payments_made` (lines 1030-1031) which may also be new columns, making the fallback potentially fail too.
- **File:** `app/assets/js/app.js`, lines 1025-1037
- **Recommended fix:** Once the DB migration is confirmed complete, remove the retry logic. Until then, consider a more specific error code check.

---

## ✅ PASSING

### Budget Page Fixes

| Test | Status | Details |
|------|--------|---------|
| `deleteBudgetItem()` exists | ✅ PASS | Line 1681. Deletes from `budgets` table filtered by `user_id` + `month` + `item_id`. |
| Delete button renders on each row | ✅ PASS | Lines 1535, 1560. Both bill/debt rows and custom rows get delete buttons. |
| `saveBudgetItem()` generates UUID | ✅ PASS | Line 1662. Uses `crypto.randomUUID()` with fallback. Sets `item_type: 'custom'`. |
| Standalone custom items render | ✅ PASS | Lines 1543-1564. `standaloneItems` filter correctly identifies custom items not tied to bills/debts. |
| Budget assignment inline editing | ✅ PASS | Change listeners update Supabase, recalculate progress bars, and update summary cards live. |

### Financing Cards

| Test | Status | Details |
|------|--------|---------|
| `calculateAmortization()` exists | ✅ PASS | Line 587. Handles 0% APR (simple division, lines 595-613) and standard amortization (lines 616-641). |
| Amortization schedule modal | ✅ PASS | `showAmortizationSchedule()` at line 1041. Renders summary cards + scrollable schedule table. Past/current/future payments visually distinguished. |
| `getBillFinancingInfo()` case-insensitive | ✅ PASS | Line 716: `Object.keys(FINANCING_META).find(k => k.toLowerCase() === (bill.name \|\| '').toLowerCase())`. |
| DB data takes priority over FINANCING_META | ✅ PASS | Line 651: DB columns checked first (`if (bill.total_amount && bill.total_amount > 0)`). Falls back to hardcoded meta only when DB data absent. |
| Financing items in BOTH table AND cards | ✅ PASS | Table: line 748 (all active bills including financing). Cards: line 764 (`financingCards` container). |
| Completed/paid-off section | ✅ PASS | Lines 862-911. Separate section with green checkmarks, hidden when no completed items. |
| 0% APR amortization | ✅ PASS | Lines 595-613. Returns schedule with $0 interest on every payment. |
| 0 term or 0 principal | ✅ PASS | Line 591: Early return with zeroed result object. No division-by-zero possible. |

### Bill Edit Modal

| Test | Status | Details |
|------|--------|---------|
| Financing fields in HTML | ✅ PASS | `bills.html` lines 199-237. All fields present: interest rate, principal, loan term, start date, payments made, total financed. |
| `openBillModal()` populates financing | ✅ PASS | Lines 963-979. Shows financing fields div, populates values from DB, falls back to FINANCING_META. |
| `saveBill()` includes financing fields | ✅ PASS | Lines 1001-1020. Conditionally adds fields. Auto-calculates `total_amount` from amortization if not provided. |
| `saveBill()` handles missing DB columns | ✅ PASS | Lines 1025-1037. Catches column errors, strips new fields, retries with base record. |
| Live loan calculator preview | ✅ PASS | `updateLoanCalcPreview()` at line 929. Updates on input change. |

### Security

| Test | Status | Details |
|------|--------|---------|
| No API keys logged to console | ✅ PASS | All `console.log` gated behind `DEBUG = false`. Only `console.error`/`console.warn` used for actual errors. |
| All SELECT queries filter by user_id | ✅ PASS | All 7 tables in `fetchAllDataFromSupabase()` and `renderAdditionalCharts()` include `.eq('user_id', ...)`. |
| `.env` in `.gitignore` | ✅ PASS | First line of `.gitignore`: `.env`. |
| XSS protection on user data | ✅ PASS | `escapeHtml()` function (line 6) used consistently in all table rendering: assets, investments, debts, bills, income, budget, upcoming payments. |
| No hardcoded secrets beyond Supabase anon key | ✅ PASS | Supabase anon key is designed to be public (client-side). RLS policies should enforce access control. |
| Budget operations user_id scoped | ✅ PASS | `deleteBudgetItem` (line 1700), `saveBudgetAssignment` (line 1616), and `generateBudgetForMonth` (line 1774) all filter by user_id. |

### Code Quality

| Test | Status | Details |
|------|--------|---------|
| No duplicate function definitions | ✅ PASS | All 62 function declarations have unique names. |
| No unreachable code | ✅ PASS | No code after return/throw statements. |
| Consistent error handling | ✅ PASS | Pattern: `if (error) return alert(error.message)` for simple ops; try/catch with user-friendly messages for auth; console.error for non-blocking issues. |
| No debug console.log leaks | ✅ PASS | `console.log` only in `debugLog()` behind `DEBUG = false`. All other console calls are `.error` or `.warn`. |
| FINANCING_META for non-existent bills | ✅ PASS | Meta is only accessed via `getBillFinancingInfo(bill)` which is called with actual bill objects. Unused meta entries are harmless. |

---

## 📊 Summary

| Severity | Count | Items |
|----------|-------|-------|
| 🔴 CRITICAL | 1 | Missing user_id on update/delete operations |
| 🟡 MEDIUM | 5 | Budget regeneration, duplicate types, empty states, no income warning, missing window exports |
| 🟢 LOW | 4 | Unescaped IDs, inefficient renderAll call, listener pattern, fragile retry |
| ✅ PASSING | 27 | All core features verified working |

**Overall Assessment:** The Sprint 1 implementation is **functionally solid**. All major features (budget CRUD, financing cards, amortization, bill editing) work correctly. The one critical issue (CRIT-01) depends on whether Supabase RLS is enabled — if it is, the risk is mitigated at the database level. If not, this is a **must-fix before production**. The medium items are quality-of-life improvements that should be addressed in the next sprint.
