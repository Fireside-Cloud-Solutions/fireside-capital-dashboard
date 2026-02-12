# UI/UX Audit — Budget Page
**Auditor:** Capital (Architect Agent)  
**Date:** 2026-02-12 04:07 AM EST  
**Page:** app/budget.html  
**Related Files:** app/assets/js/app.js (lines 2878, 3050+, budget logic embedded)  
**Session:** SPRINT UIUX — Cron ad7d7355

---

## 📋 AUDIT SUMMARY

**Status:** ⚠️ **FUNCTIONAL BUT INCOMPLETE**  
**Critical Issues:** 2 (P0)  
**High Issues:** 7 (P1)  
**Medium Issues:** 9 (P2)  
**Low Issues:** 4 (P3)  
**Total:** 22 issues

**Grade:** C+ (functional core, missing key features for production)

---

## 🟢 POSITIVE FINDINGS

**Good HTML Structure:**
- ✅ 4 summary cards (Income, Assigned, Spent, Remaining)
- ✅ Month navigation (prev/next buttons)
- ✅ "Generate Budget" button (AI feature)
- ✅ Add budget item modal
- ✅ Table structure with proper caption
- ✅ PWA meta tags
- ✅ Accessibility skip link

**Core Functions Exist (embedded in app.js):**
- ✅ `saveBudgetItem()` (line 2878)
- ✅ `generateBudgetForMonth()` (line 3050)

**UX Details:**
- ✅ Month selector with arrows
- ✅ Budget item form with validation (required fields)
- ✅ Clear column headers

---

## 🔴 CRITICAL ISSUES (P0)

### ARCH-BUDGET-001: Budget Logic Embedded in Monolithic app.js
**Issue:** All budget functionality is embedded in app.js (4000+ lines) instead of a dedicated budget.js module

**Location:** app.js lines 2878, 3050+ (partial review)

**Current State:**
```javascript
// app.js lines 2878-3200+ (in middle of 4000+ line file)
async function saveBudgetItem() { ... }
async function generateBudgetForMonth(monthString) { ... }
// Likely more budget functions scattered throughout
```

**Expected:** Dedicated budget.js file
```javascript
// budget.js (NEW FILE)
class BudgetManager {
  constructor() {
    this.currentMonth = new Date();
    this.budgetItems = [];
  }
  
  async init() {
    await this.loadBudgetForMonth(this.currentMonth);
    this.attachEventListeners();
    this.renderSummary();
    this.renderBudgetTable();
  }
  
  async loadBudgetForMonth(date) { ... }
  async saveBudgetItem(item) { ... }
  async updateBudgetItem(id, updates) { ... }
  async deleteBudgetItem(id) { ... }
  async generateBudget() { ... }
  
  renderSummary() { ... }
  renderBudgetTable() { ... }
  calculateRemaining() { ... }
  navigateMonth(direction) { ... }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('budgetAssignmentTable')) {
    const budgetManager = new BudgetManager();
    budgetManager.init();
  }
});
```

**Why This Matters:**
- **Maintainability:** 4000+ line files are hard to navigate
- **Code Organization:** Budget logic scattered across app.js
- **Testing:** Can't unit test budget logic in isolation
- **Performance:** Entire app.js loads even when only budget needed
- **Consistency:** Other pages use dedicated JS files

**Fix:** Extract budget logic into dedicated budget.js file

**Priority:** P0 — Architecture debt  
**Effort:** M (3-4 hours to extract and test)  
**Impact:** High — Improves maintainability

---

### FEATURE-BUDGET-001: No Budget Item Rendering Code
**Issue:** Table tbody is empty with no rendering logic visible

**Location:** budget.html line 239

**Current:**
```html
<tbody id="budgetAssignmentTable">
</tbody>
<!-- Empty tbody, no rendering shown -->
```

**Expected:** Render budget items in table
```javascript
function renderBudgetTable(items) {
  const tbody = document.getElementById('budgetAssignmentTable');
  
  if (items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-4">
          <div class="empty-state">
            <i class="bi bi-calculator empty-state-icon"></i>
            <h3>No Budget Items Yet</h3>
            <p>Add your first budget item or use "Generate Budget" to create one automatically.</p>
            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addBudgetItemModal">
              <i class="bi bi-plus-circle"></i> Add Budget Item
            </button>
          </div>
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = items.map(item => {
    const remaining = item.needed - item.assigned;
    const fundingPercent = (item.assigned / item.needed * 100).toFixed(0);
    const fundingClass = fundingPercent >= 100 ? 'text-success' : fundingPercent >= 50 ? 'text-warning' : 'text-danger';
    
    return `
      <tr>
        <td>${escapeHtml(item.name)}</td>
        <td><span class="badge bg-secondary">${escapeHtml(item.category)}</span></td>
        <td>$${formatCurrency(item.needed)}</td>
        <td>
          <input type="number" 
                 class="form-control form-control-sm" 
                 value="${item.assigned || 0}" 
                 onchange="updateBudgetAssignment('${item.id}', this.value)" 
                 min="0" 
                 step="0.01">
        </td>
        <td class="${remaining >= 0 ? 'text-success' : 'text-danger'}">
          $${formatCurrency(Math.abs(remaining))}
          ${remaining < 0 ? ' over' : ''}
        </td>
        <td>
          <div class="progress" style="height: 20px;">
            <div class="progress-bar ${fundingClass}" 
                 role="progressbar" 
                 style="width: ${fundingPercent}%"
                 aria-valuenow="${fundingPercent}" 
                 aria-valuemin="0" 
                 aria-valuemax="100">
              ${fundingPercent}%
            </div>
          </div>
        </td>
        <td>
          <button class="btn btn-sm btn-outline-secondary" onclick="editBudgetItem('${item.id}')">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteBudgetItem('${item.id}')">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}
```

**Priority:** P0 — Core feature missing  
**Effort:** M (2-3 hours)  
**Impact:** High — Can't see budget items

---

## 🟠 HIGH PRIORITY (P1)

### FEATURE-BUDGET-002: No Edit Budget Item Functionality
**Issue:** Cannot edit existing budget items after creation

**Current State:**
- ✅ Add budget item modal
- ❌ Edit budget item (reuse modal or separate)
- ❌ Update item name, category, or needed amount

**Expected:** Edit button in Actions column
```javascript
async function editBudgetItem(itemId) {
  const { data, error } = await sb
    .from('budgets')
    .select('*')
    .eq('id', itemId)
    .single();
  
  if (error) {
    showToast('Failed to load budget item', 'error');
    return;
  }
  
  // Populate modal
  document.getElementById('budgetItemName').value = data.name;
  document.getElementById('budgetItemCategory').value = data.category;
  document.getElementById('budgetItemNeeded').value = data.needed;
  
  // Change modal title and button
  document.getElementById('addBudgetItemLabel').textContent = 'Edit Budget Item';
  document.getElementById('saveBudgetItemBtn').textContent = 'Update Item';
  document.getElementById('saveBudgetItemBtn').dataset.mode = 'edit';
  document.getElementById('saveBudgetItemBtn').dataset.id = itemId;
  
  // Show modal
  const modal = new bootstrap.Modal(document.getElementById('addBudgetItemModal'));
  modal.show();
}
```

**Priority:** P1 — Core CRUD functionality  
**Effort:** S (1-2 hours)  
**Impact:** High — Users need to fix mistakes

---

### FEATURE-BUDGET-003: No Delete Budget Item Functionality
**Issue:** Cannot delete budget items

**Expected:** Delete button with confirmation
```javascript
async function deleteBudgetItem(itemId) {
  if (!confirm('Are you sure you want to delete this budget item?')) return;
  
  const { error } = await sb
    .from('budgets')
    .delete()
    .eq('id', itemId);
  
  if (error) {
    showToast('Failed to delete budget item', 'error');
    return;
  }
  
  showToast('Budget item deleted', 'success');
  await loadBudgetForMonth(currentMonth);
}
```

**Priority:** P1 — Core CRUD functionality  
**Effort:** S (1 hour)  
**Impact:** High — Users need to remove items

---

### FEATURE-BUDGET-004: No Actual Spending Tracking
**Issue:** "Spent" column shows $0.00 with no integration to Bills or Transactions

**Current State:**
- Summary card shows "Spent: $0.00"
- No connection to Bills page
- No connection to Transactions page

**Expected:** Calculate actual spending from Bills + Transactions
```javascript
async function calculateActualSpending(month, budgetItems) {
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  
  // Get bills for this month
  const { data: bills } = await sb
    .from('bills')
    .select('*')
    .gte('due_date', monthStart.toISOString())
    .lte('due_date', monthEnd.toISOString());
  
  // Get transactions for this month
  const { data: transactions } = await sb
    .from('transactions')
    .select('*')
    .gte('date', monthStart.toISOString())
    .lte('date', monthEnd.toISOString())
    .lt('amount', 0); // Expenses only
  
  // Map to budget categories
  const spendingByCategory = {};
  
  bills.forEach(bill => {
    const category = mapBillCategoryToBudget(bill.category);
    spendingByCategory[category] = (spendingByCategory[category] || 0) + parseFloat(bill.amount);
  });
  
  transactions.forEach(tx => {
    const category = mapTransactionCategoryToBudget(tx.category);
    spendingByCategory[category] = (spendingByCategory[category] || 0) + Math.abs(tx.amount);
  });
  
  // Update budget items with actual spending
  return budgetItems.map(item => ({
    ...item,
    actualSpent: spendingByCategory[item.category] || 0
  }));
}
```

**Priority:** P1 — Core feature missing  
**Effort:** M (3-4 hours with category mapping)  
**Impact:** High — This is WHY budgets exist

---

### FEATURE-BUDGET-005: No Budget vs Actual Comparison
**Issue:** Can't see if you're over/under budget per category

**Expected:** Additional column showing variance
```html
<th>Actual Spent</th>
<th>Variance</th>
```

```javascript
<td>$${formatCurrency(item.actualSpent || 0)}</td>
<td class="${variance >= 0 ? 'text-success' : 'text-danger'}">
  ${variance >= 0 ? '+' : ''}$${formatCurrency(variance)}
  ${variance < 0 ? '<span class="badge bg-danger">Over</span>' : ''}
</td>
```

**Priority:** P1 — Core budgeting feature  
**Effort:** S (1-2 hours, depends on FEATURE-BUDGET-004)  
**Impact:** High — Key insight

---

### FEATURE-BUDGET-006: No Budget Templates
**Issue:** Users must create budget from scratch

**Expected:** Budget templates to choose from
```javascript
const BUDGET_TEMPLATES = {
  '50-30-20': {
    name: '50/30/20 Rule',
    description: '50% Needs, 30% Wants, 20% Savings',
    categories: [
      { name: 'Housing', category: 'Needs', percent: 25 },
      { name: 'Utilities', category: 'Needs', percent: 10 },
      { name: 'Groceries', category: 'Needs', percent: 10 },
      { name: 'Transportation', category: 'Needs', percent: 5 },
      { name: 'Entertainment', category: 'Wants', percent: 15 },
      { name: 'Dining Out', category: 'Wants', percent: 10 },
      { name: 'Shopping', category: 'Wants', percent: 5 },
      { name: 'Savings', category: 'Savings', percent: 15 },
      { name: 'Investments', category: 'Savings', percent: 5 }
    ]
  },
  'zero-based': {
    name: 'Zero-Based Budget',
    description: 'Every dollar has a job',
    // ...
  },
  'envelope': {
    name: 'Envelope Method',
    description: 'Allocate fixed amounts per category',
    // ...
  }
};
```

**Modal to choose template:**
```html
<div class="modal" id="chooseBudgetTemplateModal">
  <div class="modal-body">
    <h5>Choose a Budget Template</h5>
    <div class="template-grid">
      <div class="template-card" onclick="applyTemplate('50-30-20')">
        <h6>50/30/20 Rule</h6>
        <p>50% Needs, 30% Wants, 20% Savings</p>
      </div>
      <div class="template-card" onclick="applyTemplate('zero-based')">
        <h6>Zero-Based Budget</h6>
        <p>Every dollar has a job</p>
      </div>
      <div class="template-card" onclick="applyTemplate('envelope')">
        <h6>Envelope Method</h6>
        <p>Fixed amounts per category</p>
      </div>
    </div>
  </div>
</div>
```

**Priority:** P1 — Onboarding UX  
**Effort:** M (3-4 hours)  
**Impact:** High — Reduces friction for new users

---

### FEATURE-BUDGET-007: Generate Budget Unclear How It Works
**Issue:** "Generate Budget" button exists but unclear what it does or how

**Location:** budget.html line 150

**Expected:**
1. Tooltip or help text explaining it
2. Modal showing generated budget before applying
3. Option to adjust AI suggestions

**Implementation:**
```html
<button class="btn btn-secondary btn-sm" 
        id="generateBudgetBtn" 
        data-bs-toggle="tooltip" 
        title="Analyze your income and bills to suggest a budget">
  <i class="bi bi-magic"></i> Generate Budget
</button>
```

**Generated Budget Preview Modal:**
```html
<div class="modal" id="generatedBudgetPreview">
  <div class="modal-body">
    <h5>AI-Generated Budget for March 2026</h5>
    <p class="text-muted">Based on your income ($5,000) and recurring bills ($2,500)</p>
    
    <table class="table">
      <thead>
        <tr>
          <th>Category</th>
          <th>Suggested Amount</th>
          <th>Adjust</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Housing</td>
          <td>$1,250</td>
          <td><input type="number" class="form-control form-control-sm" value="1250"></td>
        </tr>
        <!-- More rows -->
      </tbody>
    </table>
    
    <div class="d-flex justify-content-end gap-2">
      <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
      <button class="btn btn-primary" onclick="applyGeneratedBudget()">Apply Budget</button>
    </div>
  </div>
</div>
```

**Priority:** P1 — UX clarity  
**Effort:** M (2-3 hours)  
**Impact:** High — Key feature needs clear UX

---

### BUG-BUDGET-001: Theme Toggle Only on Budget Page
**Issue:** Budget page has theme toggle in sidebar, but no other page does

**Location:** budget.html lines 119-125

**Current:**
```html
<div class="theme-toggle">
  <div class="form-check form-switch">
    <input class="form-check-input" type="checkbox" id="themeSwitch" />
    <label class="form-check-label" for="themeSwitch">Dark Mode</label>
  </div>
</div>
```

**Impact:**
- Inconsistent UI across pages
- Users expect theme toggle in same place everywhere
- Should be in Settings page or global navbar

**Fix Options:**
1. **Remove from Budget page** (quick fix)
2. **Add to all pages** (better UX, but more effort)
3. **Move to Settings page** (best practice)

**Recommendation:** Remove from Budget page for now, add to Settings page in Settings audit follow-up

**Priority:** P1 — UI consistency  
**Effort:** XS (5 minutes to remove)  
**Impact:** Medium — Visual inconsistency

---

## 🟡 MEDIUM PRIORITY (P2)

### FEATURE-BUDGET-008: No Rollover/Carry-Over from Previous Month
**Issue:** Unspent budget doesn't roll over to next month

**Expected:** Option to carry over unused budget
```javascript
// In budget settings
const carryOverUnspent = true; // User preference

// When loading next month's budget
if (carryOverUnspent) {
  const previousMonth = new Date(currentMonth);
  previousMonth.setMonth(previousMonth.getMonth() - 1);
  
  const { data: previousBudget } = await sb
    .from('budgets')
    .select('*')
    .eq('month', formatMonth(previousMonth));
  
  const carryOver = previousBudget.reduce((sum, item) => {
    const unspent = item.assigned - (item.actualSpent || 0);
    return sum + (unspent > 0 ? unspent : 0);
  }, 0);
  
  // Add to "Remaining to Budget"
  remainingToBudget += carryOver;
}
```

**Priority:** P2 — Advanced feature  
**Effort:** M (2-3 hours)  
**Impact:** Medium — Some budgeting methods use this

---

### FEATURE-BUDGET-009: No Budget Alerts/Warnings
**Issue:** No proactive alerts when overspending or approaching limits

**Expected:** 
- Alert when category reaches 80% of budget
- Warning when category exceeds budget
- Notification system integration

**Implementation:**
```javascript
function checkBudgetAlerts(budgetItems) {
  budgetItems.forEach(item => {
    const percentSpent = (item.actualSpent / item.assigned) * 100;
    
    if (percentSpent >= 100) {
      // Create notification
      createNotification({
        type: 'warning',
        title: `Budget Exceeded: ${item.name}`,
        message: `You've spent $${item.actualSpent} of your $${item.assigned} budget for ${item.name}.`,
        priority: 'high'
      });
    } else if (percentSpent >= 80) {
      createNotification({
        type: 'info',
        title: `Budget Alert: ${item.name}`,
        message: `You've used ${percentSpent.toFixed(0)}% of your ${item.name} budget.`,
        priority: 'medium'
      });
    }
  });
}
```

**Priority:** P2 — Proactive UX  
**Effort:** M (2-3 hours)  
**Impact:** Medium — Helps prevent overspending

---

### FEATURE-BUDGET-010: No Yearly Budget View
**Issue:** Can only view one month at a time

**Expected:** Annual budget view showing all 12 months
```html
<div class="btn-group mb-3" role="group">
  <button class="btn btn-outline-secondary active" onclick="showMonthlyView()">Monthly</button>
  <button class="btn btn-outline-secondary" onclick="showYearlyView()">Yearly</button>
</div>

<div id="yearlyBudgetView">
  <table class="table">
    <thead>
      <tr>
        <th>Category</th>
        <th>Jan</th>
        <th>Feb</th>
        <th>Mar</th>
        <!-- ... -->
        <th>Total</th>
        <th>Avg</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Housing</td>
        <td>$1,200</td>
        <td>$1,200</td>
        <td>$1,200</td>
        <!-- ... -->
        <td>$14,400</td>
        <td>$1,200</td>
      </tr>
    </tbody>
  </table>
</div>
```

**Priority:** P2 — Advanced view  
**Effort:** L (4-6 hours)  
**Impact:** Medium — Useful for annual planning

---

### FEATURE-BUDGET-011: No Budget History/Trends
**Issue:** Cannot see how budget has changed over time

**Expected:** Trend chart showing budget vs actual over months
```javascript
// Chart showing:
// - Budgeted amount per month (line)
// - Actual spending per month (line)
// - Variance (bar chart)
```

**Priority:** P2 — Analytics feature  
**Effort:** M (3-4 hours with Chart.js)  
**Impact:** Medium — Useful insight

---

### FEATURE-BUDGET-012: No Budget Goals
**Issue:** Cannot set savings or debt payoff goals within budget

**Expected:** Goals section linked to budget
```html
<div class="card mb-4">
  <div class="card-body">
    <h5>Budget Goals</h5>
    <div class="goal-item">
      <div class="d-flex justify-content-between">
        <span>Emergency Fund</span>
        <span>$3,000 / $10,000</span>
      </div>
      <div class="progress">
        <div class="progress-bar" style="width: 30%"></div>
      </div>
    </div>
  </div>
</div>
```

**Priority:** P2 — Motivation feature  
**Effort:** M (2-3 hours)  
**Impact:** Medium — Increases engagement

---

### BUG-BUDGET-002: Summary Cards Always Show $0.00 Initially
**Issue:** Summary cards show $0.00 until budget loads

**Expected:** Skeleton loaders during fetch
```html
<div class="summary-card loading">
  <h6>Expected Income</h6>
  <div class="skeleton-loader skeleton-value"></div>
</div>
```

**Priority:** P2 — Perceived performance  
**Effort:** XS (30 minutes)  
**Impact:** Medium — Better UX

---

### BUG-BUDGET-003: Month Navigation Doesn't Prevent Future Months
**Issue:** Can navigate to future months that don't exist yet

**Expected:** Disable "Next Month" button when at current month
```javascript
function updateMonthNavigation() {
  const now = new Date();
  const isCurrentMonth = currentMonth.getMonth() === now.getMonth() && 
                         currentMonth.getFullYear() === now.getFullYear();
  
  document.getElementById('nextMonth').disabled = isCurrentMonth;
}
```

**Priority:** P2 — UX polish  
**Effort:** XS (15 minutes)  
**Impact:** Medium — Prevents confusion

---

### DESIGN-BUDGET-001: No Inline Assignment Editing
**Issue:** Must open modal to change assigned amounts

**Expected:** Inline input fields in "Assigned" column (as shown in rendering example above)

**Priority:** P2 — UX convenience  
**Effort:** S (1 hour)  
**Impact:** Medium — Faster editing

---

### DESIGN-BUDGET-002: No Budget Summary Chart
**Issue:** Only shows numbers, no visual breakdown

**Expected:** Pie/donut chart showing budget allocation
```javascript
// Chart showing:
// - Housing: 40%
// - Food: 15%
// - Transportation: 10%
// - etc.
```

**Priority:** P2 — Visual enhancement  
**Effort:** S (1-2 hours with Chart.js)  
**Impact:** Medium — Better at-a-glance view

---

## 🟢 LOW PRIORITY (P3)

### FEATURE-BUDGET-013: No Budget Copy from Previous Month
**Issue:** Must recreate budget each month

**Expected:** "Copy from Last Month" button
```html
<button class="btn btn-outline-secondary" onclick="copyFromLastMonth()">
  <i class="bi bi-files"></i> Copy from Last Month
</button>
```

**Implementation:**
```javascript
async function copyFromLastMonth() {
  const lastMonth = new Date(currentMonth);
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  const { data: items } = await sb
    .from('budgets')
    .select('*')
    .eq('month', formatMonth(lastMonth));
  
  // Copy to current month
  const newItems = items.map(item => ({
    ...item,
    id: undefined,
    month: formatMonth(currentMonth),
    assigned: item.assigned,
    actualSpent: 0
  }));
  
  await sb.from('budgets').insert(newItems);
  await loadBudgetForMonth(currentMonth);
}
```

**Priority:** P3 — Convenience feature  
**Effort:** S (1-2 hours)  
**Impact:** Low — Nice-to-have

---

### FEATURE-BUDGET-014: No Budget Notes
**Issue:** Cannot add notes to budget items

**Example:** "This month includes birthday party"

**Expected:** Notes field in budget item form and display

**Priority:** P3 — Nice-to-have  
**Effort:** S (1 hour)  
**Impact:** Low — Some users would use

---

### FEATURE-BUDGET-015: No Export Budget to CSV/PDF
**Issue:** Cannot export budget for printing or sharing

**Expected:** Export button
```html
<button class="btn btn-outline-secondary" onclick="exportBudget('pdf')">
  <i class="bi bi-file-pdf"></i> Export PDF
</button>
```

**Priority:** P3 — Reporting feature  
**Effort:** M (2-3 hours)  
**Impact:** Low — Some users would use

---

### DESIGN-BUDGET-003: No Budget Categories Color Coding
**Issue:** All category badges same color

**Expected:** Different colors per category
```javascript
const CATEGORY_COLORS = {
  'Housing': 'bg-primary',
  'Food': 'bg-success',
  'Transportation': 'bg-warning',
  'Entertainment': 'bg-info',
  'Savings': 'bg-success',
  'Debt': 'bg-danger'
};
```

**Priority:** P3 — Visual enhancement  
**Effort:** XS (30 minutes)  
**Impact:** Low — Slightly easier scanning

---

## 📊 IMPLEMENTATION PRIORITY

### Sprint 1 (Critical — P0)
**Estimated:** 1 day (6-8 hours)

1. **ARCH-BUDGET-001:** Extract budget logic into budget.js (M)
2. **FEATURE-BUDGET-001:** Implement budget item rendering (M)

### Sprint 2 (High Priority — P1)
**Estimated:** 2 days (12-16 hours)

3. **FEATURE-BUDGET-002:** Add edit functionality (S)
4. **FEATURE-BUDGET-003:** Add delete functionality (S)
5. **FEATURE-BUDGET-004:** Track actual spending from Bills + Transactions (M)
6. **FEATURE-BUDGET-005:** Show budget vs actual comparison (S)
7. **FEATURE-BUDGET-006:** Add budget templates (M)
8. **FEATURE-BUDGET-007:** Improve "Generate Budget" UX (M)
9. **BUG-BUDGET-001:** Remove theme toggle (XS)

### Sprint 3 (Medium Priority — P2)
**Estimated:** 2 days (12-16 hours)

10. **FEATURE-BUDGET-008:** Rollover/carry-over (M)
11. **FEATURE-BUDGET-009:** Budget alerts (M)
12. **FEATURE-BUDGET-010:** Yearly budget view (L)
13. **FEATURE-BUDGET-011:** Budget history/trends (M)
14. **FEATURE-BUDGET-012:** Budget goals (M)
15. **BUG-BUDGET-002:** Skeleton loaders (XS)
16. **BUG-BUDGET-003:** Prevent future months (XS)
17. **DESIGN-BUDGET-001:** Inline assignment editing (S)
18. **DESIGN-BUDGET-002:** Budget summary chart (S)

### Sprint 4 (Low Priority — P3 — Optional)
**Estimated:** 1 day (6-8 hours)

19. **FEATURE-BUDGET-013:** Copy from last month (S)
20. **FEATURE-BUDGET-014:** Budget notes (S)
21. **FEATURE-BUDGET-015:** Export budget (M)
22. **DESIGN-BUDGET-003:** Category color coding (XS)

---

## ✅ ACCEPTANCE CRITERIA

**Page is considered "Production-Ready" when:**

- [ ] All P0 issues resolved (2 issues)
- [ ] All P1 issues resolved (7 issues)
- [ ] budget.js module created and functional
- [ ] Budget items render in table
- [ ] Edit/delete functionality working
- [ ] Actual spending tracked from Bills + Transactions
- [ ] Budget vs actual comparison visible
- [ ] Budget templates available
- [ ] Generate Budget UX clear with preview
- [ ] Theme toggle removed (consistency)
- [ ] Mobile responsive (test at 375px, 768px, 1024px)
- [ ] All CRUD operations work
- [ ] Tested on live site with browser automation

---

## 🎯 NEXT STEPS

1. **Post to Discord:** Summary in #dashboard channel
2. **Create Work Items:** Azure DevOps backlog for P0/P1 issues
3. **Verify Database:** Check budgets table schema
4. **ALL 11 PAGES AUDITED** ✅ — Compile comprehensive summary
5. **Create Azure DevOps Work Items** for all P0/P1 issues across all pages

---

**Document Owner:** Capital (Architect Agent)  
**Session:** SPRINT UIUX — Cron ad7d7355  
**Status:** ✅ Budget Page Audit Complete  
**Next:** Post summary and create comprehensive action plan
