# Research Report: Budget vs Actuals + Sample Data Architecture
**Date:** 2026-02-17 05:35 EST  
**Sprint:** Research (Sprint f6500924)  
**Topics:** Budget Variance Analysis + Sample/Demo Data Patterns

---

## Topic 1: Budget vs Actuals Engine

### Core Formula (Industry Standard)

```
Dollar Variance  = Actual Spend - Budget
Percent Variance = ((Actual / Budget) - 1) × 100

Favorable   = Actual < Budget (spent LESS than planned) ← GREEN
Unfavorable = Actual > Budget (spent MORE than planned) ← RED
```

### Gap Analysis: Current System vs What We Need

**Current `budgets` table (item-based, planning-only):**
```
budgets: { user_id, month, item_id, item_type, item_name, assigned_amount, needed_amount, suppressed }
```
- This tracks: "How much did I plan for each BILL?"  
- Budget = `assigned_amount`, Actual = bill amount when due  
- ❌ NOT a true budget vs actuals (no real transaction matching)

**What we need for Budget vs Actuals (category-based):**
```
Budget  = user-set monthly limit per category (dining: $300, groceries: $500...)
Actual  = SUM(transactions.amount) WHERE category = X AND month = YYYY-MM
Variance = Actual - Budget
```

The `transactions` table already has 12 categories:
`dining, groceries, transportation, utilities, entertainment, shopping, healthcare, travel, bills, income, other, uncategorized`

### Implementation Architecture

**Option A: Category budget settings in `settings` table (RECOMMENDED)**
```sql
-- Add to settings table (already exists, stores user prefs as JSON)
category_budgets: {
  dining: 300,
  groceries: 500,
  transportation: 150,
  utilities: 200,
  entertainment: 100,
  shopping: 200,
  healthcare: 100,
  travel: 0,
  bills: 0,       -- covered by bills table
  other: 100
}
```

**Option B: New `category_budgets` table (overkill for now)**

Option A wins — simpler, uses existing infrastructure.

### The Engine (budget-actuals.js — ~100 lines)

```javascript
/**
 * Budget vs Actuals Engine
 * Calculates monthly variance per spending category.
 * 
 * Data sources:
 *   - Budget: settings.category_budgets (user-defined monthly limits)
 *   - Actuals: transactions table (category + date + amount)
 */
async function calculateBudgetVsActuals(month = null) {
  const targetMonth = month || getCurrentMonth(); // 'YYYY-MM'
  const user = (await sb.auth.getUser()).data.user;
  if (!user) return null;

  // 1. Fetch budgets from settings
  const { data: settingsData } = await sb
    .from('settings')
    .select('category_budgets')
    .eq('user_id', user.id)
    .single();
  
  const budgets = settingsData?.category_budgets || {};

  // 2. Fetch all transactions for the month
  const startDate = `${targetMonth}-01`;
  const endDate = getLastDayOfMonth(targetMonth);
  
  const { data: transactions } = await sb
    .from('transactions')
    .select('category, amount')
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate)
    .neq('category', 'income'); // Exclude income from expense tracking

  // 3. Sum actuals by category
  const actuals = {};
  (transactions || []).forEach(t => {
    const cat = t.category || 'other';
    actuals[cat] = (actuals[cat] || 0) + Math.abs(t.amount);
  });

  // 4. Calculate variance per category
  const categories = ['dining', 'groceries', 'transportation', 'utilities',
    'entertainment', 'shopping', 'healthcare', 'travel', 'other'];
  
  const results = categories.map(cat => {
    const budget = budgets[cat] || 0;
    const actual = actuals[cat] || 0;
    const variance = actual - budget;
    const variancePct = budget > 0 ? ((actual / budget) - 1) * 100 : null;
    const status = budget === 0 ? 'unbudgeted'
      : actual > budget ? 'over'
      : actual > budget * 0.85 ? 'warning'  // Within 15% = amber warning
      : 'under';
    
    return {
      category: cat,
      budget,
      actual,
      variance,           // positive = overspent, negative = under
      variancePct,        // null if no budget set
      status,             // 'over' | 'warning' | 'under' | 'unbudgeted'
      progressPct: budget > 0 ? Math.min((actual / budget) * 100, 150) : null
    };
  });

  // 5. Totals
  const totalBudget = results.reduce((s, r) => s + r.budget, 0);
  const totalActual = results.reduce((s, r) => s + r.actual, 0);
  
  return {
    month: targetMonth,
    categories: results,
    totals: {
      budget: totalBudget,
      actual: totalActual,
      variance: totalActual - totalBudget,
      variancePct: totalBudget > 0
        ? ((totalActual / totalBudget) - 1) * 100
        : null
    }
  };
}

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getLastDayOfMonth(yearMonth) {
  const [year, month] = yearMonth.split('-').map(Number);
  return new Date(year, month, 0).toISOString().split('T')[0];
}
```

### UI: Budget vs Actuals Card

```html
<!-- Budget vs Actuals — for operations.html or budget.html -->
<div class="card mb-4">
  <div class="card-header d-flex justify-content-between align-items-center">
    <h5 class="mb-0">Budget vs Actuals — February 2026</h5>
    <select class="form-select form-select-sm w-auto" id="bvaMonthSelect">
      <option>February 2026</option>
      <option>January 2026</option>
    </select>
  </div>
  <div class="card-body">
    <!-- Summary row -->
    <div class="row mb-4">
      <div class="col-4 text-center">
        <div class="fs-3 fw-bold">$1,850</div>
        <div class="text-muted small">Total Budget</div>
      </div>
      <div class="col-4 text-center">
        <div class="fs-3 fw-bold text-danger">$2,140</div>
        <div class="text-muted small">Actual Spend</div>
      </div>
      <div class="col-4 text-center">
        <div class="fs-3 fw-bold text-danger">+$290</div>
        <div class="text-muted small">Over Budget (15.7%)</div>
      </div>
    </div>
    
    <!-- Category breakdown -->
    <div id="bvaCategoryList"></div>
  </div>
</div>
```

```javascript
// Render category row with progress bar
function renderBVACategory(item) {
  const { category, budget, actual, variance, status, progressPct } = item;
  const barColor = status === 'over' ? 'danger'
    : status === 'warning' ? 'warning'
    : 'success';
  const varLabel = variance > 0
    ? `<span class="text-danger">+${formatCurrency(variance)}</span>`
    : `<span class="text-success">${formatCurrency(variance)}</span>`;
  
  return `
    <div class="mb-3">
      <div class="d-flex justify-content-between mb-1">
        <span class="text-capitalize fw-medium">${category}</span>
        <span>${formatCurrency(actual)} / ${formatCurrency(budget)} ${varLabel}</span>
      </div>
      <div class="progress" style="height: 10px;">
        <div class="progress-bar bg-${barColor}" 
             role="progressbar" 
             style="width: ${progressPct ?? 0}%"
             aria-valuenow="${progressPct ?? 0}" aria-valuemin="0" aria-valuemax="100">
        </div>
      </div>
    </div>
  `;
}
```

### "3 Amber Rule"
Best practice from F9 Finance: highlight a category when actual reaches 85% of budget (amber/warning state). Gives users time to course-correct before going over.

---

## Topic 2: Sample Data / Demo Mode Architecture

### The Problem
New users land on a blank dashboard with empty states everywhere. This is the #1 onboarding killer. The fix: a "Preview with Sample Data" toggle that shows what the app looks like with real data — without any API calls.

### Pattern Analysis: How Leading Finance Apps Do It

**Copilot Money:** "Try Demo" button — uses static JSON seeded into local state  
**YNAB:** Onboarding wizard seeds demo budget before first sync  
**Monarch Money:** Demo mode with 90 days of fake transactions, full feature preview  

**Key principle:** Sample data should be:
- Realistic (not "Test Bill 1, $999.99")
- Demographically appropriate (young professional, mixed income/bills)
- Stored client-side (not in Supabase) — no DB writes for demo
- Toggle-able without page reload

### Architecture: Client-Side Demo Mode

**File:** `app/assets/js/demo-data.js`

```javascript
/**
 * demo-data.js — Sample Data for FC-169 (Preview Mode)
 * All amounts in USD, dates relative to current month.
 */
const DEMO_MODE_KEY = 'fireside_demo_mode';

const DEMO_DATA = {
  // User profile
  user: {
    name: 'Alex Johnson',
    email: 'alex@example.com'
  },
  
  // assets table
  assets: [
    { id: 'demo-asset-1', name: 'Primary Residence', type: 'real_estate',
      current_value: 385000, loan_balance: 290000,
      equity: 95000, created_at: '2022-06-15' },
    { id: 'demo-asset-2', name: '2021 Honda Civic', type: 'vehicle',
      current_value: 18500, loan_balance: 11200,
      equity: 7300, created_at: '2021-03-01' }
  ],
  
  // income table
  income: [
    { id: 'demo-inc-1', source: 'Tech Corp - Salary', type: 'W2',
      amount: 5200, frequency: 'bi-weekly', next_date: getRelativeDate(5) },
    { id: 'demo-inc-2', source: 'Freelance Design', type: '1099',
      amount: 800, frequency: 'monthly', next_date: getRelativeDate(15) }
  ],
  
  // bills table
  bills: [
    { id: 'demo-bill-1', name: 'Mortgage', amount: 1850, frequency: 'monthly',
      due_day: 1, category: 'housing', status: 'active' },
    { id: 'demo-bill-2', name: 'Electric', amount: 95, frequency: 'monthly',
      due_day: 15, category: 'utilities', status: 'active' },
    { id: 'demo-bill-3', name: 'Internet', amount: 65, frequency: 'monthly',
      due_day: 20, category: 'utilities', status: 'active' },
    { id: 'demo-bill-4', name: 'Netflix', amount: 22.99, frequency: 'monthly',
      due_day: 8, category: 'entertainment', status: 'active' },
    { id: 'demo-bill-5', name: 'Spotify', amount: 10.99, frequency: 'monthly',
      due_day: 12, category: 'entertainment', status: 'active' },
    { id: 'demo-bill-6', name: 'Gym Membership', amount: 45, frequency: 'monthly',
      due_day: 1, category: 'healthcare', status: 'active' },
    { id: 'demo-bill-7', name: 'Car Insurance', amount: 145, frequency: 'monthly',
      due_day: 10, category: 'transportation', status: 'active' },
    { id: 'demo-bill-8', name: 'Phone Plan', amount: 85, frequency: 'monthly',
      due_day: 18, category: 'utilities', status: 'active' }
  ],
  
  // debts table
  debts: [
    { id: 'demo-debt-1', name: 'Student Loan', type: 'student_loan',
      principal: 32000, current_balance: 24500, interest_rate: 5.5,
      monthly_payment: 350, remaining_months: 70 },
    { id: 'demo-debt-2', name: 'Car Loan', type: 'auto',
      principal: 22000, current_balance: 11200, interest_rate: 4.9,
      monthly_payment: 385, remaining_months: 29 }
  ],
  
  // investments table
  investments: [
    { id: 'demo-inv-1', name: '401(k) - Fidelity', type: 'retirement',
      balance: 45200, contributions_ytd: 3900, return_ytd: 5.2 },
    { id: 'demo-inv-2', name: 'Roth IRA - Vanguard', type: 'roth_ira',
      balance: 18700, contributions_ytd: 700, return_ytd: 4.8 },
    { id: 'demo-inv-3', name: 'Taxable - Robinhood', type: 'brokerage',
      balance: 8300, contributions_ytd: 2400, return_ytd: 7.1 }
  ],
  
  // transactions (last 30 days, generated dynamically)
  get transactions() {
    return generateDemoTransactions();
  },
  
  // snapshots (last 12 months)
  get snapshots() {
    return generateDemoSnapshots();
  },
  
  // settings
  settings: {
    emergency_fund_goal: 25000,
    category_budgets: {
      dining: 300, groceries: 500, transportation: 150,
      utilities: 250, entertainment: 100, shopping: 200,
      healthcare: 100, travel: 200, other: 150
    }
  }
};

function getRelativeDate(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

function generateDemoTransactions() {
  const transactions = [];
  const merchants = {
    dining: ['Chipotle', 'Starbucks', 'Uber Eats', 'Panera Bread', 'Local Pizza Co'],
    groceries: ['Whole Foods', 'Trader Joes', 'Kroger', 'Costco'],
    transportation: ['Shell Gas', 'Uber', 'Metro Card', 'Parking Garage'],
    entertainment: ['AMC Theaters', 'Steam', 'Xbox Live', 'Audible'],
    shopping: ['Amazon', 'Target', 'Best Buy', 'Gap'],
    healthcare: ['CVS Pharmacy', 'Co-pay', 'Walgreens'],
    other: ['ATM Withdrawal', 'Venmo']
  };
  
  // Generate ~40 realistic transactions for current month
  let id = 1;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  Object.entries(merchants).forEach(([category, names]) => {
    names.forEach(merchant => {
      const amount = {
        dining: Math.random() * 30 + 8,
        groceries: Math.random() * 80 + 20,
        transportation: Math.random() * 45 + 5,
        entertainment: Math.random() * 20 + 5,
        shopping: Math.random() * 60 + 15,
        healthcare: Math.random() * 25 + 10,
        other: Math.random() * 40 + 10
      }[category];
      
      const day = Math.floor(Math.random() * now.getDate()) + 1;
      transactions.push({
        id: `demo-txn-${id++}`,
        date: new Date(year, month, day).toISOString().split('T')[0],
        merchant_name: merchant,
        description: `${merchant} purchase`,
        amount: parseFloat(amount.toFixed(2)),
        category,
        status: 'cleared'
      });
    });
  });
  
  return transactions.sort((a, b) => b.date.localeCompare(a.date));
}

function generateDemoSnapshots() {
  const snapshots = [];
  let netWorth = 175000; // Starting net worth 12 months ago
  
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    
    // Realistic growth: +$1,200-2,800/month with some variance
    netWorth += (Math.random() * 1600 + 1200);
    
    snapshots.push({
      id: `demo-snap-${i}`,
      date: monthStr,
      net_worth: Math.round(netWorth),
      total_assets: Math.round(netWorth + 340000), // assets incl. mortgage value
      total_liabilities: Math.round(340000 - netWorth + 340000)
    });
  }
  return snapshots;
}

// Demo mode toggle
function isDemoMode() {
  return localStorage.getItem(DEMO_MODE_KEY) === 'true';
}

function enableDemoMode() {
  localStorage.setItem(DEMO_MODE_KEY, 'true');
  window.location.reload();
}

function disableDemoMode() {
  localStorage.removeItem(DEMO_MODE_KEY);
  window.location.reload();
}
```

### Intercepting Supabase Calls (The Clean Pattern)

Instead of adding demo checks to every function, use a **data layer wrapper**:

```javascript
// data-layer.js — Thin wrapper that routes to demo or Supabase
const DataLayer = {
  async getBills() {
    if (isDemoMode()) return { data: DEMO_DATA.bills, error: null };
    return await sb.from('bills').select('*').eq('user_id', currentUser.id);
  },
  
  async getIncome() {
    if (isDemoMode()) return { data: DEMO_DATA.income, error: null };
    return await sb.from('income').select('*').eq('user_id', currentUser.id);
  },
  
  async getTransactions(opts = {}) {
    if (isDemoMode()) {
      let data = DEMO_DATA.transactions;
      if (opts.category) data = data.filter(t => t.category === opts.category);
      return { data, count: data.length, error: null };
    }
    // ... real Supabase query
  },
  
  async getSnapshots() {
    if (isDemoMode()) return { data: DEMO_DATA.snapshots, error: null };
    return await sb.from('snapshots').select('*').eq('user_id', currentUser.id);
  }
};
```

### Demo Mode Banner

```html
<!-- Shown when demo mode is active — sticky top banner -->
<div id="demoBanner" class="alert alert-info alert-dismissible d-none" 
     style="border-radius: 0; margin: 0; position: sticky; top: 0; z-index: 1050;">
  <i class="bi bi-eye me-2"></i>
  <strong>Preview Mode</strong> — You're viewing sample data. 
  <a href="#" onclick="disableDemoMode()" class="alert-link">Sign in for real data →</a>
</div>
```

---

## Summary: New Backlog Items

### Budget vs Actuals:

| ID | Priority | Est | Description |
|----|----------|-----|-------------|
| FC-180 | P1 | 1h | Add `category_budgets` JSON field to `settings` table + budget settings UI |
| FC-181 | P1 | 2h | Build `budget-actuals.js` engine — variance calc per category |
| FC-182 | P1 | 3h | Budget vs Actuals card in Operations page (progress bars, color coding) |
| FC-183 | P2 | 1h | Historical budget comparison (month-over-month variance trend) |

**Total: ~7h** — Completes the "Operational Dashboard" FC-173 budget section

### Sample Data / Demo Mode:

| ID | Priority | Est | Description |
|----|----------|-----|-------------|
| FC-184 | P1 | 3h | Build `demo-data.js` with realistic data for all 6 tables |
| FC-185 | P1 | 2h | Build `data-layer.js` wrapper to route all DB calls through demo check |
| FC-186 | P2 | 1h | Demo mode banner + toggle button in empty states |
| FC-187 | P2 | 30 min | Demo mode toggle in Settings page |

**Total: ~6.5h** — Implements FC-169 (P1, empty states with sample data)

---

## Priority Recommendation

**Week priority order:**
1. **FC-180+181** (Budget category settings + engine, 3h) — Enables real actuals tracking
2. **FC-182** (BvA card in Operations, 3h) — Visible win in the operational dashboard  
3. **FC-184+185** (Demo mode data + wrapper, 5h) — Biggest UX impact for new users
4. **FC-172+173** (Cash Flow engine + Operations page, 8-12h) — Full operational dashboard

**Combined:** All of above = ~19-22h → Full operational dashboard + demo mode complete
