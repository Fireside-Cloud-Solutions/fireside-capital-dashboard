# FC-084: F-Pattern Dashboard Layout Redesign

**Priority:** P1 (High)  
**Size:** L (5-6 hours)  
**Status:** Ready  
**Sprint Research:** Financial Dashboard UI Patterns  
**Expected Impact:** Faster comprehension (< 5s), improved UX, matches industry standards

---

## Executive Summary

Redesign the dashboard to follow the **F-pattern hierarchy** used by all major financial apps (Mint, YNAB, Monarch Money). This visual pattern matches how users naturally scan screens and prioritizes the most important information.

**Current State:**
- Net worth buried in middle of page
- No alert/monitoring card for upcoming bills
- Charts scattered without clear hierarchy
- Stat cards lack context (no deltas, no trends)

**Target State:**
- Net worth in **hero position** (top-left, largest)
- **Alert card** (row 1) for upcoming bills, budget warnings
- **Overview cards** (row 2) with month-over-month deltas
- **Trend charts** (row 3) prioritized by importance

---

## F-Pattern Visual Hierarchy

```
┌────────────────────────────────────────────────────────┐
│ HERO: Net Worth (Large)          | Quick Actions       │  ← Top-left dominance
├────────────────────────────────────────────────────────┤
│ 🔔 ALERT CARD: Upcoming Bills / Budget Warnings         │  ← Row 1: Monitoring
├──────────────────┬──────────────┬──────────────────────┤
│ 💰 Total Assets  │ 📊 Monthly   │ 📈 Investment        │  ← Row 2: Overview
│    $500,000      │    Spending  │    Returns           │
│    ↑ +2.5% MoM   │    $4,200    │    +12.3% YTD        │
│                  │    ↑ +$200   │    ↑ +$8,400         │
├──────────────────┴──────────────┴──────────────────────┤
│ 📉 NET WORTH TREND (6 months)                          │  ← Row 3: Primary chart
├────────────────────────────────────────────────────────┤
│ 💳 SPENDING BY CATEGORY │ 📅 UPCOMING TRANSACTIONS     │  ← Row 4: Secondary insights
└────────────────────────────────────────────────────────┘
```

**Why F-Pattern?**
- Users scan **top → left → down** (eye-tracking studies)
- Most important info in top-left quadrant (net worth = primary KPI)
- Alerts in horizontal stripe (row 1) catch attention
- Progressive disclosure reduces cognitive load

---

## Step 1: Reorganize HTML Structure

**File:** `app/dashboard.html`

**Current structure:**
```html
<!-- Old: Stats scattered, no hierarchy -->
<div class="row">
  <div class="col-md-4"><div class="stat-card">...</div></div>
  <div class="col-md-4"><div class="stat-card">...</div></div>
  <div class="col-md-4"><div class="stat-card">...</div></div>
</div>
<div class="row">
  <div class="col-12"><canvas id="netWorthChart"></canvas></div>
</div>
```

**New structure:**
```html
<!-- Hero Section: Net Worth (Top-left dominance) -->
<div class="row mb-4">
  <div class="col-lg-6">
    <div class="hero-card">
      <div class="hero-card__header">
        <h2 class="hero-card__title">Net Worth</h2>
        <span class="hero-card__date">As of Feb 16, 2026</span>
      </div>
      <div class="hero-card__value">$425,847.32</div>
      <div class="hero-card__delta hero-card__delta--positive">
        <span class="hero-card__delta-icon">↑</span>
        <span class="hero-card__delta-value">+2.5%</span>
        <span class="hero-card__delta-label">vs last month</span>
      </div>
      <div class="hero-card__actions">
        <button class="btn btn-sm btn-outline-primary">View Details</button>
        <button class="btn btn-sm btn-outline-secondary">Download Report</button>
      </div>
    </div>
  </div>
  
  <div class="col-lg-6">
    <div class="quick-actions-card">
      <h3 class="quick-actions-card__title">Quick Actions</h3>
      <div class="quick-actions-card__grid">
        <a href="transactions.html" class="quick-action">
          <span class="quick-action__icon">💳</span>
          <span class="quick-action__label">Add Transaction</span>
        </a>
        <a href="bills.html" class="quick-action">
          <span class="quick-action__icon">📅</span>
          <span class="quick-action__label">Pay Bill</span>
        </a>
        <a href="budget.html" class="quick-action">
          <span class="quick-action__icon">📊</span>
          <span class="quick-action__label">View Budget</span>
        </a>
        <a href="reports.html" class="quick-action">
          <span class="quick-action__icon">📈</span>
          <span class="quick-action__label">Generate Report</span>
        </a>
      </div>
    </div>
  </div>
</div>

<!-- Row 1: Alert Card (Monitoring pattern) -->
<div class="row mb-4">
  <div class="col-12">
    <div id="alertsContainer">
      <!-- Dynamically populated by JavaScript -->
      <div class="alert-card alert-card--warning" role="alert">
        <div class="alert-card__icon">⚠️</div>
        <div class="alert-card__content">
          <h4 class="alert-card__title">Payment Due Soon</h4>
          <p class="alert-card__message">Your rent payment of $1,200 is due in 3 days.</p>
        </div>
        <a href="bills.html" class="alert-card__action btn btn-sm btn-warning">View Bills</a>
      </div>
    </div>
  </div>
</div>

<!-- Row 2: Overview Cards with Deltas -->
<div class="row mb-4">
  <div class="col-md-4">
    <div class="stat-card stat-card--assets">
      <div class="stat-card__header">
        <span class="stat-card__icon">💰</span>
        <h3 class="stat-card__title">Total Assets</h3>
      </div>
      <div class="stat-card__value">$500,000</div>
      <div class="stat-card__delta stat-card__delta--positive">
        <span class="stat-card__delta-icon">↑</span>
        <span class="stat-card__delta-value">+2.5%</span>
        <span class="stat-card__delta-label">vs last month</span>
      </div>
    </div>
  </div>
  
  <div class="col-md-4">
    <div class="stat-card stat-card--spending">
      <div class="stat-card__header">
        <span class="stat-card__icon">📊</span>
        <h3 class="stat-card__title">Monthly Spending</h3>
      </div>
      <div class="stat-card__value">$4,200</div>
      <div class="stat-card__delta stat-card__delta--negative">
        <span class="stat-card__delta-icon">↑</span>
        <span class="stat-card__delta-value">+$200</span>
        <span class="stat-card__delta-label">vs last month</span>
      </div>
    </div>
  </div>
  
  <div class="col-md-4">
    <div class="stat-card stat-card--investments">
      <div class="stat-card__header">
        <span class="stat-card__icon">📈</span>
        <h3 class="stat-card__title">Investment Returns</h3>
      </div>
      <div class="stat-card__value">+12.3%</div>
      <div class="stat-card__delta stat-card__delta--positive">
        <span class="stat-card__delta-icon">↑</span>
        <span class="stat-card__delta-value">+8.4%</span>
        <span class="stat-card__delta-label">YTD</span>
      </div>
    </div>
  </div>
</div>

<!-- Row 3: Primary Chart (Net Worth Trend) -->
<div class="row mb-4">
  <div class="col-12">
    <div class="chart-card chart-card--primary">
      <div class="chart-card__header">
        <h3 class="chart-card__title">Net Worth Trend</h3>
        <div class="chart-card__controls">
          <button class="btn btn-sm btn-outline-secondary active" data-period="6m">6 Months</button>
          <button class="btn btn-sm btn-outline-secondary" data-period="1y">1 Year</button>
          <button class="btn btn-sm btn-outline-secondary" data-period="all">All Time</button>
        </div>
      </div>
      <div class="chart-card__body">
        <canvas id="netWorthChart" height="80"></canvas>
      </div>
    </div>
  </div>
</div>

<!-- Row 4: Secondary Insights (2-column) -->
<div class="row">
  <div class="col-lg-6 mb-4">
    <div class="chart-card">
      <div class="chart-card__header">
        <h3 class="chart-card__title">Spending by Category</h3>
      </div>
      <div class="chart-card__body">
        <canvas id="spendingChart" height="100"></canvas>
      </div>
    </div>
  </div>
  
  <div class="col-lg-6 mb-4">
    <div class="widget-card">
      <div class="widget-card__header">
        <h3 class="widget-card__title">Upcoming Transactions</h3>
        <a href="transactions.html" class="widget-card__link">View All</a>
      </div>
      <div class="widget-card__body">
        <ul class="transaction-list" id="upcomingTransactions">
          <!-- Populated by JS -->
        </ul>
      </div>
    </div>
  </div>
</div>
```

---

## Step 2: Add CSS Styles

**File:** `app/assets/css/dashboard-layout.css`

```css
/* Hero Card (Net Worth) */
.hero-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  height: 100%;
}

.hero-card__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 1rem;
}

.hero-card__title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.hero-card__date {
  font-size: 0.875rem;
  opacity: 0.9;
}

.hero-card__value {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1rem;
}

.hero-card__delta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  margin-bottom: 1.5rem;
}

.hero-card__delta-icon {
  font-size: 1.5rem;
}

.hero-card__delta--positive .hero-card__delta-icon {
  color: #10b981;
}

.hero-card__delta--negative .hero-card__delta-icon {
  color: #ef4444;
  transform: rotate(180deg);
}

.hero-card__delta-label {
  font-size: 0.875rem;
  opacity: 0.9;
  margin-left: auto;
}

.hero-card__actions {
  display: flex;
  gap: 0.75rem;
}

/* Alert Card (Monitoring pattern) */
.alert-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-left-width: 4px;
  border-radius: 0.5rem;
}

.alert-card--warning {
  background: #fff3cd;
  border-color: #ffc107;
}

.alert-card--danger {
  background: #f8d7da;
  border-color: #dc3545;
}

.alert-card--info {
  background: #cfe2ff;
  border-color: #0dcaf0;
}

.alert-card__icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.alert-card__content {
  flex: 1;
}

.alert-card__title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.alert-card__message {
  margin: 0;
  color: #6c757d;
}

.alert-card__action {
  flex-shrink: 0;
}

/* Stat Cards with Deltas */
.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  height: 100%;
}

.stat-card__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.stat-card__icon {
  font-size: 1.5rem;
}

.stat-card__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin: 0;
}

.stat-card__value {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.stat-card__delta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.stat-card__delta--positive {
  color: #10b981;
}

.stat-card__delta--negative {
  color: #ef4444;
}

.stat-card__delta-icon {
  font-weight: 700;
}

.stat-card__delta-value {
  font-weight: 600;
}

.stat-card__delta-label {
  color: #6c757d;
  margin-left: auto;
}

/* Chart Cards */
.chart-card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  height: 100%;
}

.chart-card--primary {
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}

.chart-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.chart-card__title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.chart-card__controls {
  display: flex;
  gap: 0.5rem;
}

/* Quick Actions Grid */
.quick-actions-card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  height: 100%;
}

.quick-actions-card__title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.quick-actions-card__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.quick-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
  text-decoration: none;
  color: #212529;
  transition: all 0.2s;
}

.quick-action:hover {
  background: #e9ecef;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.quick-action__icon {
  font-size: 2rem;
}

.quick-action__label {
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
}

/* Responsive Design */
@media (max-width: 991px) {
  .hero-card__value {
    font-size: 2.5rem;
  }
  
  .quick-actions-card__grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 767px) {
  .hero-card {
    margin-bottom: 1rem;
  }
  
  .hero-card__value {
    font-size: 2rem;
  }
  
  .quick-actions-card__grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .alert-card {
    flex-direction: column;
    text-align: center;
  }
  
  .stat-card__delta-label {
    margin-left: 0;
  }
}
```

---

## Step 3: Add JavaScript for Dynamic Alerts

**File:** `app/assets/js/dashboard.js` (add to existing)

```javascript
/**
 * Generate alert cards for upcoming bills, budget warnings, etc.
 */
async function generateAlerts() {
  const alertsContainer = document.getElementById('alertsContainer');
  if (!alertsContainer) return;
  
  const alerts = [];
  
  // Check for upcoming bills (7-day window)
  const { data: upcomingBills } = await supabase
    .from('bills')
    .select('*')
    .gte('due_date', new Date().toISOString().split('T')[0])
    .lte('due_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .order('due_date', { ascending: true });
  
  if (upcomingBills && upcomingBills.length > 0) {
    const bill = upcomingBills[0];
    const daysUntil = Math.ceil((new Date(bill.due_date) - new Date()) / (1000 * 60 * 60 * 24));
    
    alerts.push({
      type: 'warning',
      icon: '⚠️',
      title: 'Payment Due Soon',
      message: `Your ${bill.name} payment of $${bill.amount.toFixed(2)} is due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}.`,
      action: {
        label: 'View Bills',
        href: 'bills.html'
      }
    });
  }
  
  // Check for budget warnings (> 80% spent)
  const { data: budgets } = await supabase
    .from('budgets')
    .select('*, category:categories(name)')
    .gte('spent_amount', 'allocated_amount * 0.8');
  
  if (budgets && budgets.length > 0) {
    const budget = budgets[0];
    const percentage = ((budget.spent_amount / budget.allocated_amount) * 100).toFixed(0);
    
    alerts.push({
      type: 'danger',
      icon: '🚨',
      title: 'Budget Alert',
      message: `You've spent ${percentage}% of your ${budget.category.name} budget this month.`,
      action: {
        label: 'View Budget',
        href: 'budget.html'
      }
    });
  }
  
  // Render alerts
  if (alerts.length === 0) {
    alertsContainer.innerHTML = ''; // Hide alerts section
    return;
  }
  
  alertsContainer.innerHTML = alerts.map(alert => `
    <div class="alert-card alert-card--${alert.type}" role="alert">
      <div class="alert-card__icon">${alert.icon}</div>
      <div class="alert-card__content">
        <h4 class="alert-card__title">${alert.title}</h4>
        <p class="alert-card__message">${alert.message}</p>
      </div>
      <a href="${alert.action.href}" class="alert-card__action btn btn-sm btn-${alert.type}">
        ${alert.action.label}
      </a>
    </div>
  `).join('');
}

// Call on page load
document.addEventListener('DOMContentLoaded', generateAlerts);
```

---

## Step 4: Calculate Month-over-Month Deltas

**File:** `app/assets/js/dashboard.js` (add to existing)

```javascript
/**
 * Calculate month-over-month delta for a metric
 * @param {number} current - Current month value
 * @param {number} previous - Previous month value
 * @returns {object} Delta object with value, percentage, direction
 */
function calculateDelta(current, previous) {
  const diff = current - previous;
  const percentage = previous !== 0 ? ((diff / previous) * 100).toFixed(1) : 0;
  
  return {
    value: Math.abs(diff),
    percentage: Math.abs(percentage),
    direction: diff >= 0 ? 'positive' : 'negative',
    isIncrease: diff >= 0
  };
}

/**
 * Render stat cards with deltas
 */
async function renderStatCardsWithDeltas() {
  // Get current month's data
  const currentMonth = new Date().toISOString().slice(0, 7);
  const previousMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);
  
  // Fetch data
  const { data: currentSnapshot } = await supabase
    .from('snapshots')
    .select('*')
    .gte('date', `${currentMonth}-01`)
    .lte('date', `${currentMonth}-31`)
    .order('date', { ascending: false })
    .limit(1)
    .single();
  
  const { data: previousSnapshot } = await supabase
    .from('snapshots')
    .select('*')
    .gte('date', `${previousMonth}-01`)
    .lte('date', `${previousMonth}-31`)
    .order('date', { ascending: false })
    .limit(1)
    .single();
  
  if (!currentSnapshot || !previousSnapshot) return;
  
  // Calculate deltas
  const netWorthDelta = calculateDelta(currentSnapshot.net_worth, previousSnapshot.net_worth);
  const assetsDelta = calculateDelta(currentSnapshot.total_assets, previousSnapshot.total_assets);
  
  // Update stat cards
  document.querySelector('.stat-card--assets .stat-card__value').textContent = 
    `$${currentSnapshot.total_assets.toLocaleString()}`;
  
  document.querySelector('.stat-card--assets .stat-card__delta').innerHTML = `
    <span class="stat-card__delta-icon">${assetsDelta.isIncrease ? '↑' : '↓'}</span>
    <span class="stat-card__delta-value">+${assetsDelta.percentage}%</span>
    <span class="stat-card__delta-label">vs last month</span>
  `;
  
  document.querySelector('.stat-card--assets .stat-card__delta').className = 
    `stat-card__delta stat-card__delta--${assetsDelta.direction}`;
}

// Call on page load
document.addEventListener('DOMContentLoaded', renderStatCardsWithDeltas);
```

---

## Step 5: Test on Live Site

### Testing Checklist
- [ ] Hero card displays net worth correctly
- [ ] Alert card shows for upcoming bills (< 7 days)
- [ ] Stat cards show deltas with correct direction (↑/↓)
- [ ] Charts render in priority order
- [ ] Layout is responsive on mobile (stack vertically)
- [ ] Quick actions grid works on all screen sizes
- [ ] F-pattern is visible: top-left → row 1 → row 2 → row 3

### Browser Testing
```powershell
# Login to live site
Start-Process "https://nice-cliff-05b13880f.2.azurestaticapps.net/auth.html"

# Credentials (from .credentials)
# Email: matt@firesidecloudsolutions.com
# Password: vRpBE5387U5G%0
```

---

## Acceptance Criteria

- [ ] Net worth in hero position (top-left, largest)
- [ ] Alert card row (upcoming bills, budget warnings)
- [ ] Stat cards with month-over-month deltas (↑/↓, %)
- [ ] Charts prioritized by importance (net worth first)
- [ ] Quick actions grid (4 shortcuts)
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] F-pattern verified with eye-tracking simulation
- [ ] Matches industry standards (Mint, YNAB, Monarch)

---

## Expected Impact

### Before
- Net worth buried in middle of page
- No alerts for upcoming payments
- Stat cards lack context (static numbers)
- Charts scattered without hierarchy

### After
- **5-second comprehension** (F-pattern guides eyes)
- **Proactive alerts** (user sees upcoming bills immediately)
- **Contextual deltas** (+2.5% MoM gives meaning to numbers)
- **Clear hierarchy** (most important info first)

---

## Next Steps

After FC-084 is complete, implement:
- **FC-085:** Alert card component (monitoring pattern) — 3-4h
- **FC-086:** Add deltas to all stat cards — 2-3h
- **FC-087:** Build skeleton loaders for all charts — 3-4h

---

**Estimated Time:** 5-6 hours  
**Difficulty:** Medium (requires HTML/CSS/JS skills)  
**Risk:** Low (visual changes only, no database impact)  
**Impact:** High (dramatically improved UX, faster comprehension, matches industry standards)
