# Financial Dashboard UI Patterns Research — Fireside Capital
**Research Sprint**: February 20, 2026  
**Status**: In Progress 🔄  
**Priority**: High — Foundation for data visualization & UX

---

## Executive Summary

Research industry-standard UI patterns for personal finance dashboards to improve data visualization, user engagement, and decision-making. Financial dashboards must balance **information density** (show important data at a glance) with **usability** (avoid overwhelming users).

**Key Patterns to Implement**:
- 📊 **Data Visualization Hierarchy** — Most important metrics front and center
- 💰 **Net Worth Flow** — Visual timeline of wealth changes
- 🎯 **Goal Tracking** — Progress bars with target dates
- 🔔 **Smart Alerts** — Contextual warnings (budget exceeded, bill due)
- 📈 **Trend Indicators** — Up/down arrows with percentage changes
- 🗂️ **Category Pills** — Tag-based filtering for transactions
- 📱 **Mobile-First Cards** — Responsive, touch-friendly components

---

## Pattern 1: Metric Cards with Trends

### Overview
Large, scannable cards showing key financial metrics with trend indicators (↑/↓) and sparkline charts.

**Used By**: Mint, Personal Capital, YNAB  
**Purpose**: Quick status check ("Am I up or down this month?")

### Visual Example
```
┌─────────────────────────────────────┐
│ Net Worth                      ↑ 3.2% │
│ $127,350                             │
│ +$4,050 this month                   │
│ ▁▂▃▅▆█ (sparkline)                   │
└─────────────────────────────────────┘
```

### Implementation

**HTML** (`dashboard.html`):
```html
<div class="metric-card trend-up">
  <div class="metric-header">
    <span class="metric-label">Net Worth</span>
    <span class="metric-trend">
      <i class="bi bi-arrow-up"></i> 3.2%
    </span>
  </div>
  <div class="metric-value">$127,350</div>
  <div class="metric-change">+$4,050 this month</div>
  <canvas id="sparkline-networth" class="metric-sparkline"></canvas>
</div>
```

**CSS** (`components/metric-cards.css`):
```css
.metric-card {
  background: var(--surface-1);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-3);
  padding: var(--space-5);
  position: relative;
  transition: all 0.2s ease;
}

.metric-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-2);
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  border-radius: var(--radius-3) 0 0 var(--radius-3);
  background: var(--metric-accent);
}

.metric-card.trend-up::before {
  background: var(--color-success);
}

.metric-card.trend-down::before {
  background: var(--color-danger);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.metric-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: 0.875rem;
  font-weight: 600;
}

.trend-up .metric-trend {
  color: var(--color-success);
}

.trend-down .metric-trend {
  color: var(--color-danger);
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.metric-change {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: var(--space-3);
}

.metric-sparkline {
  height: 40px;
  width: 100%;
  opacity: 0.8;
}

/* Container queries for responsive card layout */
@container card-grid (max-width: 400px) {
  .metric-value {
    font-size: 1.5rem;
  }
  .metric-sparkline {
    height: 30px;
  }
}
```

**JavaScript** (`chart-factory.js` — sparkline renderer):
```javascript
/**
 * Generate sparkline chart (mini trend chart)
 * @param {string} canvasId - Canvas element ID
 * @param {number[]} data - Array of values
 * @param {string} color - Line color (hex)
 */
function createSparkline(canvasId, data, color = '#81b900') {
  const ctx = document.getElementById(canvasId).getContext('2d');
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map((_, i) => i), // Hidden labels
      datasets: [{
        data: data,
        borderColor: color,
        borderWidth: 2,
        fill: true,
        backgroundColor: `${color}22`, // 13% opacity
        pointRadius: 0,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      },
      scales: {
        x: { display: false },
        y: { display: false }
      },
      interaction: { mode: null }
    }
  });
}

// Usage
const netWorthData = [120000, 121500, 119800, 123000, 125000, 127350];
createSparkline('sparkline-networth', netWorthData, '#81b900');
```

---

## Pattern 2: Cash Flow Sankey Diagram

### Overview
Visualize money flow from income sources → expenses → savings/investments. Helps users understand where money goes.

**Used By**: Personal Capital, Copilot Money  
**Purpose**: Answer "Where does my money actually go?"

### Visual Example
```
Income               Expenses            Savings
┌──────────┐        ┌──────────┐        ┌──────────┐
│ Salary   ├───────►│ Housing  │        │ 401k     │
│ $8,000   │   ├───►│ $2,400   │        │ $800     │
└──────────┘   │    └──────────┘        └──────────┘
               │    ┌──────────┐        ┌──────────┐
               ├───►│ Food     │        │ Savings  │
               │    │ $600     │        │ $1,200   │
               │    └──────────┘        └──────────┘
               │    ┌──────────┐
               └───►│ Transport│
                    │ $400     │
                    └──────────┘
```

### Implementation (Chart.js with Sankey Plugin)

**Install Sankey Plugin**:
```html
<script src="https://cdn.jsdelivr.net/npm/chartjs-chart-sankey@0.12.0"></script>
```

**JavaScript** (`charts.js`):
```javascript
function createCashFlowChart(canvasId) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  
  // Data structure: [from, to, amount]
  const cashFlowData = [
    // Income → Expenses
    { from: 'Salary', to: 'Housing', flow: 2400 },
    { from: 'Salary', to: 'Food', flow: 600 },
    { from: 'Salary', to: 'Transport', flow: 400 },
    { from: 'Salary', to: 'Entertainment', flow: 300 },
    
    // Income → Savings
    { from: 'Salary', to: '401k', flow: 800 },
    { from: 'Salary', to: 'Emergency Fund', flow: 600 },
    { from: 'Salary', to: 'Investments', flow: 600 },
    
    // Side income
    { from: 'Freelance', to: 'Debt Repayment', flow: 1000 },
    { from: 'Freelance', to: 'Investments', flow: 500 }
  ];

  new Chart(ctx, {
    type: 'sankey',
    data: {
      datasets: [{
        label: 'Cash Flow',
        data: cashFlowData,
        colorFrom: (c) => getNodeColor(c.dataset.data[c.dataIndex].from),
        colorTo: (c) => getNodeColor(c.dataset.data[c.dataIndex].to),
        colorMode: 'gradient',
        size: 'max',
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => {
              const { from, to, flow } = context.raw;
              return `${from} → ${to}: $${flow.toLocaleString()}`;
            }
          }
        }
      }
    }
  });
}

function getNodeColor(nodeName) {
  const colors = {
    'Salary': '#01a4ef',
    'Freelance': '#f44e24',
    'Housing': '#d13438',
    'Food': '#f3c200',
    'Transport': '#81b900',
    '401k': '#00bcf2',
    'Investments': '#00b294',
    'Emergency Fund': '#0078d4'
  };
  return colors[nodeName] || '#6c757d';
}
```

---

## Pattern 3: Budget Progress Bars

### Overview
Visual representation of spending vs. budget with color-coded status (green = under budget, yellow = approaching, red = exceeded).

**Used By**: YNAB, Mint, EveryDollar  
**Purpose**: Immediate feedback on spending control

### Visual Example
```
Housing       ████████░░ 80% ($2,400 / $3,000)  [Green]
Food          ███████████ 110% ($660 / $600)   [Red]
Transport     ████░░░░░░ 40% ($160 / $400)     [Green]
```

### Implementation

**HTML**:
```html
<div class="budget-item">
  <div class="budget-header">
    <span class="budget-category">Housing</span>
    <span class="budget-amount">$2,400 / $3,000</span>
  </div>
  <div class="budget-bar-container">
    <div class="budget-bar budget-ok" style="width: 80%"></div>
  </div>
  <div class="budget-footer">
    <span class="budget-percentage">80%</span>
    <span class="budget-remaining">$600 remaining</span>
  </div>
</div>

<div class="budget-item">
  <div class="budget-header">
    <span class="budget-category">Food</span>
    <span class="budget-amount">$660 / $600</span>
  </div>
  <div class="budget-bar-container">
    <div class="budget-bar budget-exceeded" style="width: 110%"></div>
  </div>
  <div class="budget-footer">
    <span class="budget-percentage">110%</span>
    <span class="budget-overage">$60 over</span>
  </div>
</div>
```

**CSS**:
```css
.budget-item {
  background: var(--surface-1);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-3);
  padding: var(--space-4);
  margin-bottom: var(--space-3);
}

.budget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.budget-category {
  font-weight: 600;
  color: var(--text-primary);
}

.budget-amount {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
}

.budget-bar-container {
  position: relative;
  height: 12px;
  background: var(--surface-3);
  border-radius: var(--radius-pill);
  overflow: hidden;
  margin-bottom: var(--space-2);
}

.budget-bar {
  height: 100%;
  border-radius: var(--radius-pill);
  transition: width 0.4s ease, background-color 0.3s ease;
  position: relative;
}

.budget-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Status colors */
.budget-ok {
  background: var(--color-success);
}

.budget-warning {
  background: var(--color-warning);
}

.budget-exceeded {
  background: var(--color-danger);
}

.budget-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.budget-percentage {
  font-weight: 600;
  color: var(--text-secondary);
}

.budget-remaining {
  color: var(--color-success);
}

.budget-overage {
  color: var(--color-danger);
  font-weight: 600;
}
```

**JavaScript** (dynamic status):
```javascript
function updateBudgetBar(spent, budgeted) {
  const percentage = (spent / budgeted) * 100;
  const bar = document.querySelector('.budget-bar');
  
  // Update width
  bar.style.width = `${Math.min(percentage, 100)}%`;
  
  // Update status class
  bar.classList.remove('budget-ok', 'budget-warning', 'budget-exceeded');
  if (percentage >= 100) {
    bar.classList.add('budget-exceeded');
  } else if (percentage >= 75) {
    bar.classList.add('budget-warning');
  } else {
    bar.classList.add('budget-ok');
  }
  
  // Show remaining or overage
  const footer = document.querySelector('.budget-footer');
  if (percentage > 100) {
    const overage = spent - budgeted;
    footer.querySelector('.budget-remaining').textContent = `$${overage} over`;
    footer.querySelector('.budget-remaining').className = 'budget-overage';
  } else {
    const remaining = budgeted - spent;
    footer.querySelector('.budget-remaining').textContent = `$${remaining} remaining`;
    footer.querySelector('.budget-remaining').className = 'budget-remaining';
  }
}

// Usage
updateBudgetBar(2400, 3000); // Housing: $2,400 / $3,000
updateBudgetBar(660, 600);   // Food: $660 / $600 (exceeded)
```

---

## Pattern 4: Timeline / Activity Feed

### Overview
Chronological list of financial events (transactions, bill payments, budget adjustments) with icons and timestamps.

**Used By**: Mint, Personal Capital, Monarch Money  
**Purpose**: Financial "social feed" — see what happened recently

### Visual Example
```
Today
  ⬇️ $45.20 — Whole Foods               2:35 PM
  ⬆️ $3,200 — Paycheck Deposit          9:00 AM

Yesterday
  ⬇️ $89.99 — Electric Bill (Auto-pay)  3:00 PM
  ⬇️ $12.50 — Netflix                   12:00 PM
  
Feb 18
  ⬇️ $1,450 — Rent Payment               8:00 AM
```

### Implementation

**HTML**:
```html
<div class="timeline">
  <div class="timeline-group">
    <div class="timeline-date">Today</div>
    
    <div class="timeline-item expense">
      <div class="timeline-icon">
        <i class="bi bi-arrow-down-circle"></i>
      </div>
      <div class="timeline-content">
        <div class="timeline-title">Whole Foods</div>
        <div class="timeline-category">Groceries</div>
      </div>
      <div class="timeline-meta">
        <div class="timeline-amount">-$45.20</div>
        <div class="timeline-time">2:35 PM</div>
      </div>
    </div>
    
    <div class="timeline-item income">
      <div class="timeline-icon">
        <i class="bi bi-arrow-up-circle"></i>
      </div>
      <div class="timeline-content">
        <div class="timeline-title">Paycheck Deposit</div>
        <div class="timeline-category">Salary</div>
      </div>
      <div class="timeline-meta">
        <div class="timeline-amount">+$3,200</div>
        <div class="timeline-time">9:00 AM</div>
      </div>
    </div>
  </div>
  
  <div class="timeline-group">
    <div class="timeline-date">Yesterday</div>
    <!-- More items -->
  </div>
</div>
```

**CSS**:
```css
.timeline {
  max-width: 800px;
  margin: 0 auto;
}

.timeline-group {
  margin-bottom: var(--space-6);
}

.timeline-date {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-3);
  padding-left: var(--space-12);
}

.timeline-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--surface-1);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-3);
  margin-bottom: var(--space-2);
  transition: all 0.2s ease;
}

.timeline-item:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-1);
}

.timeline-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.timeline-item.expense .timeline-icon {
  background: var(--color-danger-subtle);
  color: var(--color-danger);
}

.timeline-item.income .timeline-icon {
  background: var(--color-success-subtle);
  color: var(--color-success);
}

.timeline-content {
  flex: 1;
  min-width: 0;
}

.timeline-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.timeline-category {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.timeline-meta {
  text-align: right;
}

.timeline-amount {
  font-size: 1.125rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  margin-bottom: var(--space-1);
}

.timeline-item.expense .timeline-amount {
  color: var(--color-danger);
}

.timeline-item.income .timeline-amount {
  color: var(--color-success);
}

.timeline-time {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

/* Mobile optimization */
@media (max-width: 576px) {
  .timeline-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .timeline-meta {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
```

---

## Pattern 5: Goal Progress Cards

### Overview
Visual tracking of financial goals (e.g., "Save $10k for vacation") with progress bar, projected completion date, and motivational copy.

**Used By**: Qapital, Digit, Acorns  
**Purpose**: Gamification — make saving feel rewarding

### Visual Example
```
┌─────────────────────────────────────┐
│ 🏖️ Vacation Fund                     │
│ $6,500 / $10,000                    │
│ ████████░░░░░░ 65%                  │
│ On track to reach by Aug 2026       │
│ +$500/month                         │
└─────────────────────────────────────┘
```

### Implementation

**HTML**:
```html
<div class="goal-card goal-on-track">
  <div class="goal-icon">🏖️</div>
  <div class="goal-content">
    <h3 class="goal-title">Vacation Fund</h3>
    <div class="goal-progress-text">$6,500 / $10,000</div>
    <div class="goal-bar-container">
      <div class="goal-bar" style="width: 65%"></div>
    </div>
    <div class="goal-footer">
      <span class="goal-status">On track to reach by Aug 2026</span>
      <span class="goal-contribution">+$500/month</span>
    </div>
  </div>
</div>
```

**CSS**:
```css
.goal-card {
  background: var(--surface-1);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-3);
  padding: var(--space-5);
  display: flex;
  gap: var(--space-4);
  transition: all 0.2s ease;
}

.goal-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-2);
}

.goal-on-track {
  border-color: var(--color-success);
}

.goal-behind {
  border-color: var(--color-warning);
}

.goal-icon {
  font-size: 3rem;
  flex-shrink: 0;
}

.goal-content {
  flex: 1;
}

.goal-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: var(--space-2);
  color: var(--text-primary);
}

.goal-progress-text {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-3);
  font-variant-numeric: tabular-nums;
}

.goal-bar-container {
  position: relative;
  height: 16px;
  background: var(--surface-3);
  border-radius: var(--radius-pill);
  overflow: hidden;
  margin-bottom: var(--space-3);
}

.goal-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--color-success), var(--color-primary));
  border-radius: var(--radius-pill);
  transition: width 0.5s ease;
  position: relative;
}

.goal-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: goal-shimmer 3s infinite;
}

@keyframes goal-shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.goal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.goal-status {
  color: var(--text-secondary);
}

.goal-contribution {
  font-weight: 600;
  color: var(--color-success);
}
```

---

## Pattern 6: Comparison Tables (Accounts, Investments)

### Overview
Side-by-side comparison of accounts/investments with sortable columns, color-coded returns, and performance indicators.

**Used By**: Personal Capital, Empower  
**Purpose**: Portfolio analysis — which investments are performing?

### Visual Example
```
Account              Balance      YTD Return  Allocation
────────────────────────────────────────────────────────
Vanguard 401k        $45,200      ↑ +12.3%    ████░ 42%
Roth IRA (Fidelity)  $28,900      ↑ +8.7%     ███░░ 27%
Brokerage (Robinhood) $15,400     ↓ -2.1%     ██░░░ 14%
Savings (Marcus)     $18,000      ↑ +4.5%     ██░░░ 17%
```

### Implementation

**HTML** (with sortable columns):
```html
<table class="comparison-table">
  <thead>
    <tr>
      <th class="sortable" data-sort="name">Account</th>
      <th class="sortable" data-sort="balance">Balance</th>
      <th class="sortable" data-sort="return">YTD Return</th>
      <th>Allocation</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="account-name">
        <i class="bi bi-wallet2 me-2"></i>
        Vanguard 401k
      </td>
      <td class="account-balance">$45,200</td>
      <td class="account-return positive">
        <i class="bi bi-arrow-up"></i> +12.3%
      </td>
      <td>
        <div class="allocation-bar" style="width: 42%"></div>
        <span class="allocation-label">42%</span>
      </td>
    </tr>
    <tr>
      <td class="account-name">
        <i class="bi bi-piggy-bank me-2"></i>
        Roth IRA (Fidelity)
      </td>
      <td class="account-balance">$28,900</td>
      <td class="account-return positive">
        <i class="bi bi-arrow-up"></i> +8.7%
      </td>
      <td>
        <div class="allocation-bar" style="width: 27%"></div>
        <span class="allocation-label">27%</span>
      </td>
    </tr>
    <tr>
      <td class="account-name">
        <i class="bi bi-graph-up me-2"></i>
        Brokerage (Robinhood)
      </td>
      <td class="account-balance">$15,400</td>
      <td class="account-return negative">
        <i class="bi bi-arrow-down"></i> -2.1%
      </td>
      <td>
        <div class="allocation-bar" style="width: 14%"></div>
        <span class="allocation-label">14%</span>
      </td>
    </tr>
  </tbody>
</table>
```

**CSS**:
```css
.comparison-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: var(--surface-1);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-3);
  overflow: hidden;
}

.comparison-table thead {
  background: var(--surface-2);
}

.comparison-table th {
  padding: var(--space-4);
  text-align: left;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  border-bottom: 2px solid var(--border-color);
}

.comparison-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.comparison-table th.sortable:hover {
  color: var(--color-primary);
}

.comparison-table td {
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
}

.comparison-table tbody tr:last-child td {
  border-bottom: none;
}

.comparison-table tbody tr:hover {
  background: var(--surface-2);
}

.account-name {
  font-weight: 600;
  display: flex;
  align-items: center;
}

.account-balance {
  font-size: 1.125rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.account-return {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.account-return.positive {
  color: var(--color-success);
}

.account-return.negative {
  color: var(--color-danger);
}

.allocation-bar {
  height: 8px;
  background: var(--color-primary);
  border-radius: var(--radius-pill);
  margin-bottom: var(--space-1);
}

.allocation-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}
```

**JavaScript** (sortable columns):
```javascript
document.querySelectorAll('.sortable').forEach((th) => {
  th.addEventListener('click', () => {
    const table = th.closest('table');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const sortKey = th.dataset.sort;
    const isAsc = th.classList.contains('sort-asc');
    
    // Clear previous sort indicators
    table.querySelectorAll('.sortable').forEach((header) => {
      header.classList.remove('sort-asc', 'sort-desc');
    });
    
    // Sort rows
    rows.sort((a, b) => {
      const aValue = getSortValue(a, sortKey);
      const bValue = getSortValue(b, sortKey);
      return isAsc ? bValue - aValue : aValue - bValue;
    });
    
    // Update DOM
    rows.forEach((row) => tbody.appendChild(row));
    
    // Update sort indicator
    th.classList.add(isAsc ? 'sort-desc' : 'sort-asc');
  });
});

function getSortValue(row, key) {
  const cell = row.querySelector(`.account-${key}`);
  if (!cell) return 0;
  
  const text = cell.textContent.trim();
  return parseFloat(text.replace(/[$,%]/g, '')) || 0;
}
```

---

## Pattern 7: Smart Alerts & Notifications

### Overview
Contextual alerts that appear when user attention is needed (budget exceeded, bill due, unusual spending detected).

**Used By**: Mint, Cleo, Rocket Money  
**Purpose**: Proactive guidance — catch issues before they escalate

### Types of Alerts
1. **Critical** (Red) — Requires immediate action
   - Bill due in 2 days
   - Account overdrawn
   - Budget exceeded by 50%

2. **Warning** (Yellow) — Needs attention soon
   - Budget at 75%
   - Bill due in 5 days
   - Unusual spending spike detected

3. **Info** (Blue) — FYI, no action required
   - Net worth increased 10%
   - New paycheck deposited
   - Goal milestone reached

### Implementation

**HTML**:
```html
<!-- Critical Alert -->
<div class="alert-card alert-critical">
  <div class="alert-icon">
    <i class="bi bi-exclamation-triangle-fill"></i>
  </div>
  <div class="alert-content">
    <div class="alert-title">Electric bill due in 2 days</div>
    <div class="alert-body">$89.99 due Feb 22 — Set up auto-pay?</div>
  </div>
  <div class="alert-actions">
    <button class="btn btn-sm btn-danger">Pay Now</button>
    <button class="btn btn-sm btn-outline-secondary">Snooze</button>
  </div>
</div>

<!-- Warning Alert -->
<div class="alert-card alert-warning">
  <div class="alert-icon">
    <i class="bi bi-exclamation-circle-fill"></i>
  </div>
  <div class="alert-content">
    <div class="alert-title">Food budget at 85%</div>
    <div class="alert-body">You've spent $510 of $600 this month</div>
  </div>
  <div class="alert-actions">
    <button class="btn btn-sm btn-warning">View Details</button>
  </div>
</div>

<!-- Info Alert -->
<div class="alert-card alert-info">
  <div class="alert-icon">
    <i class="bi bi-info-circle-fill"></i>
  </div>
  <div class="alert-content">
    <div class="alert-title">Goal milestone reached!</div>
    <div class="alert-body">You're halfway to your vacation fund ($5,000)</div>
  </div>
  <div class="alert-actions">
    <button class="btn btn-sm btn-primary">Celebrate 🎉</button>
  </div>
</div>
```

**CSS**:
```css
.alert-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  border-radius: var(--radius-3);
  margin-bottom: var(--space-3);
  border-left: 4px solid;
}

.alert-critical {
  background: var(--color-danger-subtle);
  border-left-color: var(--color-danger);
}

.alert-warning {
  background: var(--color-warning-subtle);
  border-left-color: var(--color-warning);
}

.alert-info {
  background: var(--color-info-subtle);
  border-left-color: var(--color-info);
}

.alert-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.alert-critical .alert-icon {
  background: var(--color-danger);
  color: white;
}

.alert-warning .alert-icon {
  background: var(--color-warning);
  color: var(--text-inverse);
}

.alert-info .alert-icon {
  background: var(--color-info);
  color: white;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.alert-body {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.alert-actions {
  display: flex;
  gap: var(--space-2);
}
```

---

## Implementation Roadmap

### Sprint 1: Core Patterns (Week 1-2)
- [ ] Metric cards with trends + sparklines
- [ ] Budget progress bars
- [ ] Timeline/activity feed
- [ ] Update design tokens for new components

### Sprint 2: Advanced Visualizations (Week 3-4)
- [ ] Cash flow Sankey diagram (with Chart.js Sankey plugin)
- [ ] Goal progress cards
- [ ] Comparison tables with sorting
- [ ] Implement smart alerts system

### Sprint 3: Polish & Testing (Week 5)
- [ ] Responsive testing (mobile, tablet, desktop)
- [ ] Dark theme verification
- [ ] Accessibility audit (WCAG AA)
- [ ] Cross-browser testing

---

## Performance Considerations

### Lazy-Load Charts
Only render charts when they're in viewport:

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const chartId = entry.target.id;
      renderChart(chartId);
      observer.unobserve(entry.target);
    }
  });
});

document.querySelectorAll('.chart-canvas').forEach((canvas) => {
  observer.observe(canvas);
});
```

### Debounce Expensive Operations
```javascript
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Usage: debounce table sorting
const handleSort = debounce((sortKey) => {
  sortTable(sortKey);
}, 300);
```

---

## Next Steps

1. **Create Task Work Items** for each pattern
2. **Design System Update** — Add new components to design tokens
3. **Component Library** — Build reusable React/Vue components (future)
4. **A/B Testing** — Test user engagement with different patterns

---

**Researcher**: Capital (Orchestrator)  
**Status**: Complete ✅  
**Ready for Implementation**: Yes ✅
