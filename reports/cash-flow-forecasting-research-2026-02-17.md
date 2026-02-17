# Research Report: Cash Flow Forecasting — FC-164 Implementation Guide
**Date:** 2026-02-17  
**Researcher:** Capital (Orchestrator)  
**Sprint:** Research Cron (f6500924)  
**Topic:** Cash Flow 30/60/90-Day Projection for Operational Dashboard

---

## Summary

All 6 original research topics (CSS, Financial UI, Chart.js, Dark Theme, PWA, Performance) are **100% complete** as of Feb 16. This session pivots to a new high-value topic: **Cash Flow Forecasting** — the implementation detail blocker for FC-164 (Operational Dashboard, P1, 8-12h).

**Key finding:** Cash flow forecasting for Fireside Capital is achievable in ~4-6 hours using existing Supabase data (bills + income + debts). The algorithm is a simple day-by-day balance projection — no ML needed.

---

## 1. The Core Algorithm

### What We Have in Supabase
| Table | Useful Fields |
|-------|--------------|
| `bills` | `name`, `amount`, `frequency`, `due_date`, `is_active` |
| `income` | `name`, `amount`, `frequency`, `next_payment_date`, `type` |
| `debts` | `name`, `monthly_payment`, `next_payment_date` |
| `transactions` | Historical actuals (for "what actually happened" view) |

### The Algorithm

```javascript
// cash-flow.js — Core projection engine

const DAYS_IN_PERIOD = { daily: 1, weekly: 7, 'bi-weekly': 14, monthly: 30.44, quarterly: 91.31, 'semi-annual': 182.63, annual: 365.25 };

/**
 * Generate a day-by-day cash flow projection
 * @param {number} startBalance - Current checking account balance
 * @param {Array} incomes - From Supabase income table
 * @param {Array} bills - From Supabase bills table
 * @param {Array} debts - From Supabase debts table
 * @param {number} days - Projection window (30, 60, or 90)
 * @returns {Array} Daily projection objects
 */
function generateCashFlowProjection({ startBalance, incomes, bills, debts, days = 90 }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Initialize day-by-day ledger
  const ledger = {};
  for (let i = 0; i <= days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const key = date.toISOString().split('T')[0];
    ledger[key] = { date: key, inflows: [], outflows: [], net: 0, balance: 0 };
  }
  
  // Project income occurrences
  for (const income of incomes) {
    if (!income.is_active) continue;
    const occurrences = getOccurrences(income.next_payment_date, income.frequency, days);
    for (const dateKey of occurrences) {
      if (ledger[dateKey]) {
        ledger[dateKey].inflows.push({ name: income.name, amount: income.amount, type: 'income' });
      }
    }
  }
  
  // Project bill occurrences
  for (const bill of bills) {
    if (!bill.is_active) continue;
    const occurrences = getOccurrences(bill.due_date, bill.frequency, days);
    for (const dateKey of occurrences) {
      if (ledger[dateKey]) {
        ledger[dateKey].outflows.push({ name: bill.name, amount: bill.amount, type: 'bill' });
      }
    }
  }
  
  // Project debt payments (always monthly)
  for (const debt of debts) {
    const occurrences = getOccurrences(debt.next_payment_date, 'monthly', days);
    for (const dateKey of occurrences) {
      if (ledger[dateKey]) {
        ledger[dateKey].outflows.push({ name: debt.name, amount: debt.monthly_payment, type: 'debt' });
      }
    }
  }
  
  // Calculate running balance (day-by-day)
  let runningBalance = startBalance;
  const sorted = Object.values(ledger).sort((a, b) => a.date.localeCompare(b.date));
  
  for (const day of sorted) {
    const totalIn = day.inflows.reduce((sum, t) => sum + t.amount, 0);
    const totalOut = day.outflows.reduce((sum, t) => sum + t.amount, 0);
    day.net = totalIn - totalOut;
    runningBalance += day.net;
    day.balance = runningBalance;
  }
  
  return sorted;
}

/**
 * Get all occurrence dates for a recurring item within N days
 * @param {string} startDate - ISO date string (next_payment_date or due_date)
 * @param {string} frequency - 'monthly', 'weekly', 'bi-weekly', etc.
 * @param {number} days - How far ahead to project
 * @returns {string[]} Array of ISO date keys
 */
function getOccurrences(startDateStr, frequency, days) {
  const occurrences = [];
  if (!startDateStr || !frequency) return occurrences;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + days);
  
  let current = new Date(startDateStr);
  current.setHours(0, 0, 0, 0);
  
  // Wind forward to today if past date
  while (current < today) {
    current = advanceByFrequency(current, frequency);
  }
  
  // Collect all occurrences within range
  while (current <= endDate) {
    occurrences.push(current.toISOString().split('T')[0]);
    current = advanceByFrequency(current, frequency);
    
    // Safety valve for 'once' or unknown frequencies
    if (occurrences.length > 500) break;
  }
  
  return occurrences;
}

/**
 * Advance a date by one frequency period
 */
function advanceByFrequency(date, frequency) {
  const next = new Date(date);
  switch (frequency.toLowerCase()) {
    case 'daily':        next.setDate(next.getDate() + 1); break;
    case 'weekly':       next.setDate(next.getDate() + 7); break;
    case 'bi-weekly':    next.setDate(next.getDate() + 14); break;
    case 'monthly':      next.setMonth(next.getMonth() + 1); break;
    case 'bi-monthly':   next.setMonth(next.getMonth() + 2); break;
    case 'quarterly':    next.setMonth(next.getMonth() + 3); break;
    case 'semi-annual':  next.setMonth(next.getMonth() + 6); break;
    case 'annual':       next.setFullYear(next.getFullYear() + 1); break;
    default:             next.setMonth(next.getMonth() + 1); // fallback to monthly
  }
  return next;
}
```

---

## 2. The UI — What to Build for FC-164

### Dashboard Layout (Operational View)

```
┌─────────────────────────────────────────────────┐
│  💰 Cash Flow Forecast          [30d] [60d] [90d] │
├─────────────────────────────────────────────────┤
│  Current Balance: $4,200         Projected:       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  30 Day  │  │  60 Day  │  │  90 Day  │       │
│  │  $3,840  │  │  $5,120  │  │  $4,670  │       │
│  │  ▼ -8%  │  │  ▲ +22%  │  │  ▲ +11%  │       │
│  └──────────┘  └──────────┘  └──────────┘       │
├─────────────────────────────────────────────────┤
│  [Chart: Running balance line, day-by-day]       │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  ⚠️ Low point: $1,842 on Feb 28 (rent day)      │
├─────────────────────────────────────────────────┤
│  📅 Upcoming (Next 14 Days)                      │
│  Feb 18  ▲ Paycheck         +$2,400             │
│  Feb 20  ▼ Electric Bill    -$147               │
│  Feb 25  ▼ Rent             -$1,800  ← DANGER   │
│  Feb 28  ▲ Paycheck         +$2,400             │
└─────────────────────────────────────────────────┘
```

### Chart.js Implementation

```javascript
// The running balance line chart
function renderCashFlowChart(projection, ctx) {
  const labels = projection.map(d => formatShortDate(d.date));
  const balances = projection.map(d => d.balance);
  const minBalance = Math.min(...balances);
  const dangerThreshold = 500; // User-configurable
  
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Projected Balance',
        data: balances,
        borderColor: (ctx) => {
          // Color segments based on safe/warning/danger zones
          return balances[ctx.dataIndex] < dangerThreshold 
            ? '#f44e24'   // Danger: orange  
            : balances[ctx.dataIndex] < 1000 
              ? '#ffc107'  // Warning: yellow
              : '#81b900'; // Safe: green
        },
        fill: true,
        backgroundColor: 'rgba(1, 164, 239, 0.08)',
        tension: 0.4,
        pointRadius: 0, // No dots for 90-day chart (too many)
        pointHoverRadius: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false, // Performance
      scales: {
        x: {
          ticks: {
            maxTicksLimit: 10, // Show ~10 dates for 90-day
            maxRotation: 0,
          }
        },
        y: {
          ticks: {
            callback: (value) => formatCurrency(value)
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            title: (ctx) => formatFullDate(projection[ctx[0].dataIndex].date),
            afterBody: (ctx) => {
              const day = projection[ctx[0].dataIndex];
              const lines = [];
              if (day.inflows.length) lines.push('  ▲ ' + day.inflows.map(i => `${i.name} +${formatCurrency(i.amount)}`).join('\n  ▲ '));
              if (day.outflows.length) lines.push('  ▼ ' + day.outflows.map(o => `${o.name} -${formatCurrency(o.amount)}`).join('\n  ▼ '));
              return lines;
            }
          }
        },
        // Danger zone annotation
        annotation: {
          annotations: {
            dangerLine: {
              type: 'line',
              yMin: dangerThreshold,
              yMax: dangerThreshold,
              borderColor: '#f44e24',
              borderWidth: 1,
              borderDash: [5, 5],
              label: { content: 'Low Balance Alert', enabled: true, position: 'start' }
            }
          }
        }
      }
    }
  });
}
```

---

## 3. Bills Aging / AP View

Similar to accounts payable aging in business finance:

```javascript
// Categorize upcoming bills by urgency
function getBillsAging(projection) {
  const next7days = [], next8to30days = [], next31to60days = [];
  const today = new Date().toISOString().split('T')[0];
  const in7 = addDays(today, 7);
  const in30 = addDays(today, 30);
  const in60 = addDays(today, 60);
  
  for (const day of projection) {
    for (const outflow of day.outflows) {
      const item = { ...outflow, date: day.date };
      if (day.date <= in7) next7days.push(item);
      else if (day.date <= in30) next8to30days.push(item);
      else if (day.date <= in60) next31to60days.push(item);
    }
  }
  
  return {
    critical: { items: next7days, total: sum(next7days) },     // 🔴 Due in 7 days
    upcoming: { items: next8to30days, total: sum(next8to30days) }, // 🟡 Due in 30 days
    planned:  { items: next31to60days, total: sum(next31to60days) } // 🟢 Due in 60 days
  };
}
```

```html
<!-- Bills Aging Widget -->
<div class="aging-grid">
  <div class="aging-bucket aging-critical">
    <div class="aging-label">Due ≤ 7 Days</div>
    <div class="aging-amount">$1,947</div>
    <div class="aging-count">3 bills</div>
  </div>
  <div class="aging-bucket aging-warning">
    <div class="aging-label">8–30 Days</div>
    <div class="aging-amount">$3,200</div>
    <div class="aging-count">8 bills</div>
  </div>
  <div class="aging-bucket aging-ok">
    <div class="aging-label">31–60 Days</div>
    <div class="aging-amount">$3,200</div>
    <div class="aging-count">8 bills</div>
  </div>
</div>
```

---

## 4. Budget vs. Actuals Bar Chart

```javascript
// Compare budgeted spending to actual transactions this month
async function getBudgetVsActuals(supabase, userId) {
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());
  
  // Get budgets
  const { data: budgets } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId);
  
  // Get actual spending by category this month
  const { data: transactions } = await supabase
    .from('transactions')
    .select('category, amount')
    .eq('user_id', userId)
    .gte('date', monthStart.toISOString())
    .lte('date', monthEnd.toISOString())
    .eq('type', 'debit');
  
  // Group actuals by category
  const actuals = {};
  for (const t of transactions) {
    actuals[t.category] = (actuals[t.category] || 0) + t.amount;
  }
  
  // Build comparison
  return budgets.map(b => ({
    category: b.category,
    budgeted: b.amount,
    actual: actuals[b.category] || 0,
    variance: b.amount - (actuals[b.category] || 0),
    pct: Math.round(((actuals[b.category] || 0) / b.amount) * 100)
  }));
}
```

```javascript
// Horizontal bar chart: Budget vs Actuals
new Chart(ctx, {
  type: 'bar',
  data: {
    labels: comparison.map(c => c.category),
    datasets: [
      {
        label: 'Budgeted',
        data: comparison.map(c => c.budgeted),
        backgroundColor: 'rgba(1, 164, 239, 0.3)', // Blue outline
      },
      {
        label: 'Actual',
        data: comparison.map(c => c.actual),
        backgroundColor: comparison.map(c =>
          c.actual > c.budgeted ? '#f44e24' : '#81b900' // Red if over, green if under
        ),
      }
    ]
  },
  options: {
    indexAxis: 'y', // Horizontal bars
    responsive: true,
    scales: {
      x: { ticks: { callback: v => '$' + v } }
    }
  }
});
```

---

## 5. "Safe to Spend" Calculation

The most actionable metric from CashFlowForecaster.io — a single number answering "Can I afford it?"

```javascript
/**
 * Calculate "Safe to Spend" — lowest projected balance over next 14 days
 * minus a safety buffer
 */
function calculateSafeToSpend(projection, safetyBuffer = 500) {
  const next14Days = projection.slice(0, 14);
  const lowestBalance = Math.min(...next14Days.map(d => d.balance));
  const safeToSpend = Math.max(0, lowestBalance - safetyBuffer);
  
  return {
    safeToSpend,
    lowestBalance,
    lowestDate: next14Days.find(d => d.balance === lowestBalance)?.date,
    safetyBuffer,
    isComfortable: safeToSpend > 1000,
    isTight: safeToSpend > 0 && safeToSpend <= 1000,
    isDanger: safeToSpend <= 0
  };
}
```

```html
<!-- Safe to Spend KPI Card -->
<div class="stat-card stat-card--primary">
  <div class="stat-label">
    Safe to Spend
    <button class="info-tooltip" data-bs-toggle="tooltip" 
      title="Your lowest projected balance in the next 14 days, minus a $500 safety buffer">
      <i class="bi bi-info-circle"></i>
    </button>
  </div>
  <div class="stat-value" id="safeToSpendAmount">$2,340</div>
  <div class="stat-context text-success">
    <i class="bi bi-shield-check"></i> Comfortable — lowest point $840 on Mar 1
  </div>
</div>
```

---

## 6. Implementation Plan for FC-164

### File Structure
```
app/assets/js/
├── cash-flow.js          ← NEW — projection engine (algorithm above)
├── operations.js         ← NEW — page controller (like investments.js)
└── app.js                ← MODIFIED — add renderOperationalDashboard()

app/
└── operations.html       ← NEW — Operational Dashboard page
```

### Supabase Queries Needed
```javascript
// operations.js — Load all data in parallel
async function loadOperationalData() {
  const [bills, income, debts, transactions] = await Promise.all([
    supabase.from('bills').select('*').eq('user_id', userId).eq('is_active', true),
    supabase.from('income').select('*').eq('user_id', userId),
    supabase.from('debts').select('*').eq('user_id', userId),
    supabase.from('transactions').select('category, amount, date').eq('user_id', userId)
      .gte('date', startOfMonth(new Date()).toISOString())
  ]);
  
  // Get starting balance (user-entered or from most recent Plaid sync)
  const { data: settings } = await supabase
    .from('settings')
    .select('current_balance')
    .eq('user_id', userId)
    .single();
  
  return { bills: bills.data, income: income.data, debts: debts.data, 
           transactions: transactions.data, startBalance: settings?.data?.current_balance || 0 };
}
```

### Effort Breakdown (Revised from FC-164 estimate)
| Task | Hours |
|------|-------|
| cash-flow.js engine (algorithm + tests) | 2h |
| operations.html layout + UI | 2h |
| Chart.js integration (balance line + budget bars) | 2h |
| Bills aging widget | 1h |
| Safe to Spend KPI | 30 min |
| Nav link + sidebar integration | 30 min |
| **Total** | **~8h** |

---

## 7. New Backlog Items

### FC-172: Cash Flow Projection Engine
**Priority:** P1 | **Size:** M (2-3h) | **Status:** Ready  
Implement `cash-flow.js` with `generateCashFlowProjection()`, `getOccurrences()`, `advanceByFrequency()`. Include unit tests for edge cases (month-end dates, leap years, frequency rollover). Creates the data engine for FC-164.

### FC-173: Operational Dashboard Page (FC-164 breakdown)
**Priority:** P1 | **Size:** L (5-6h) | **Status:** Ready  
Build `operations.html` + `operations.js` with:
- Cash flow line chart (30/60/90 day toggle)
- Bills aging widget (3 buckets)
- Budget vs. actuals horizontal bar chart
- Safe to Spend KPI card
- Upcoming transactions list (next 14 days)
Depends on FC-172.

### FC-174: "Safe to Spend" Setting in Settings Page
**Priority:** P2 | **Size:** XS (30 min) | **Status:** Ready  
Add `safety_buffer` field to settings table and FC-UIUX-023 settings expansion. User-configurable buffer for Safe to Spend calculation (default $500). Feeds into FC-172 engine.

### FC-175: "Current Balance" Manual Entry
**Priority:** P2 | **Size:** XS (45 min) | **Status:** Ready  
Add `current_balance` field to settings table. Until Plaid production is live, users need to manually enter their checking balance as the projection starting point. Show in Settings page and/or a quick-entry modal on Operations page.

---

## 8. Key Insights

1. **The algorithm is simple** — day-by-day ledger, no ML needed. All data already exists in Supabase.
2. **"Safe to Spend" is the killer feature** — one number that answers the daily question. Highest user value, 30 min to implement.
3. **Starting balance is the only missing piece** — need `current_balance` in settings table (FC-175). Without it, projection starts at $0.
4. **Frequency normalization matters** — all 8 frequency types (daily → annual) need coverage; month-end edge cases (Feb 28 → Mar 31) must use `setMonth()` not fixed-day arithmetic.
5. **Bills aging is visual** — 3-bucket color-coded widget (red/yellow/green) is more scannable than a table.
6. **90-day is the sweet spot** — CashFlowForecaster, Xero, and US Bank all default to 30/60/90. PocketSmith allows 30 years but that's overkill for personal.
7. **Tooltip rich data** — Chart tooltips should show individual inflows/outflows for that day (not just the net balance). This is what makes the chart useful vs. confusing.

---

## Conclusion

**Cash flow forecasting is fully achievable with our current data model.** The only new database field needed is `current_balance` in the `settings` table. The algorithm is ~100 lines of clean JavaScript.

**FC-164 has been broken into more manageable tasks:**
- FC-172 (P1, 2-3h): Data engine
- FC-173 (P1, 5-6h): Full Operational Dashboard UI
- FC-174 (P2, 30min): Safety buffer setting
- FC-175 (P2, 45min): Balance entry

**Estimated total: 8.5-10.5h** — within the original 8-12h FC-164 estimate.
