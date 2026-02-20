# Azure DevOps Work Items — Financial Dashboard UI Patterns
**Created:** February 20, 2026  
**Project:** Fireside Capital  
**Area:** UI/UX → Implementation

---

## Work Item 1: Implement Metric Cards with Trend Indicators

**Type:** Task  
**Priority:** High  
**Effort:** 6 hours  
**Sprint:** Sprint 1  
**Assigned To:** Builder

### Description
Create metric cards showing key financial data (Net Worth, Total Assets, Total Debts, etc.) with trend indicators (↑/↓), percentage changes, and sparkline charts.

### Acceptance Criteria
- [ ] Create `components/metric-cards.css` with responsive card layout
- [ ] Add trend indicators (up/down arrows) with color coding
- [ ] Implement sparkline charts using Chart.js
- [ ] Create `createSparkline()` function in `chart-factory.js`
- [ ] Add metric cards to Dashboard page
- [ ] Show 4 primary metrics: Net Worth, Assets, Debts, Monthly Cash Flow
- [ ] Test responsive behavior (mobile, tablet, desktop)
- [ ] Test dark/light theme switching

### Implementation Notes
- Sparklines use Chart.js with hidden axes and tooltips
- Green for positive trends, red for negative trends
- Container queries for responsive card sizing
- Use `font-variant-numeric: tabular-nums` for aligned numbers

### Related Research
`reports/financial-dashboard-ui-patterns-research.md` — Section: "Pattern 1: Metric Cards with Trends"

---

## Work Item 2: Build Budget Progress Bars

**Type:** Task  
**Priority:** High  
**Effort:** 4 hours  
**Sprint:** Sprint 1  
**Assigned To:** Builder

### Description
Create visual budget tracking with progress bars showing spending vs. budget, color-coded by status (green = under budget, yellow = approaching, red = exceeded).

### Acceptance Criteria
- [ ] Create budget progress bar component (HTML + CSS)
- [ ] Implement dynamic status colors:
  - Green: < 75% of budget
  - Yellow: 75-99% of budget
  - Red: ≥ 100% of budget
- [ ] Add shimmer animation to progress bars
- [ ] Show remaining budget (or overage if exceeded)
- [ ] Display budget categories: Housing, Food, Transport, Entertainment, etc.
- [ ] Add to Budget page
- [ ] Test responsive layout (mobile: stack vertically)

### Implementation Notes
```javascript
function updateBudgetBar(spent, budgeted) {
  const percentage = (spent / budgeted) * 100;
  // Update width, color, and status text
}
```

### Related Research
`reports/financial-dashboard-ui-patterns-research.md` — Section: "Pattern 3: Budget Progress Bars"

---

## Work Item 3: Create Timeline/Activity Feed

**Type:** Task  
**Priority:** Medium  
**Effort:** 5 hours  
**Sprint:** Sprint 2  
**Assigned To:** Builder

### Description
Build a chronological activity feed showing recent transactions, bill payments, and financial events with icons, timestamps, and categories.

### Acceptance Criteria
- [ ] Create timeline component with date grouping (Today, Yesterday, Feb 18, etc.)
- [ ] Add transaction icons (income = ↑ green, expense = ↓ red)
- [ ] Show transaction title, category, amount, and time
- [ ] Implement hover state for timeline items
- [ ] Add to Dashboard page (below metric cards)
- [ ] Fetch data from Supabase `transactions` table (if it exists)
- [ ] Limit to 10 most recent items
- [ ] Test mobile layout (stack icon + content + amount vertically)

### Implementation Notes
- Group by date (use `Intl.DateTimeFormat` for relative dates)
- Income: green circle icon with up arrow
- Expense: red circle icon with down arrow
- Clickable items → navigate to transaction detail page (future)

### Related Research
`reports/financial-dashboard-ui-patterns-research.md` — Section: "Pattern 4: Timeline / Activity Feed"

---

## Work Item 4: Implement Goal Progress Cards

**Type:** Task  
**Priority:** Medium  
**Effort:** 6 hours  
**Sprint:** Sprint 2  
**Assigned To:** Builder

### Description
Create goal tracking cards showing savings goals with progress bars, projected completion dates, and monthly contribution amounts.

### Acceptance Criteria
- [ ] Create goal card component with emoji icon, title, and progress bar
- [ ] Calculate goal percentage (current / target * 100)
- [ ] Add gradient progress bar with shimmer animation
- [ ] Show projected completion date based on monthly contribution
- [ ] Display "On track" or "Behind schedule" status
- [ ] Create database table `goals` (id, user_id, title, icon, target_amount, current_amount, monthly_contribution, target_date)
- [ ] Add CRUD operations for goals (create, update, delete)
- [ ] Add to Dashboard or new "Goals" page

### Implementation Notes
```javascript
function calculateProjectedDate(current, target, monthlyContribution) {
  const remaining = target - current;
  const monthsRemaining = Math.ceil(remaining / monthlyContribution);
  return new Date(Date.now() + monthsRemaining * 30 * 24 * 60 * 60 * 1000);
}
```

### Related Research
`reports/financial-dashboard-ui-patterns-research.md` — Section: "Pattern 5: Goal Progress Cards"

---

## Work Item 5: Build Comparison Table for Investments

**Type:** Task  
**Priority:** Medium  
**Effort:** 5 hours  
**Sprint:** Sprint 3  
**Assigned To:** Builder

### Description
Create sortable comparison table for investment accounts showing balance, YTD return, and allocation percentage with visual bars.

### Acceptance Criteria
- [ ] Create comparison table component (HTML + CSS)
- [ ] Add sortable column headers (click to sort by balance, return, or name)
- [ ] Show account name with icon, balance, YTD return (with ↑/↓), and allocation bar
- [ ] Implement sort functionality (ascending/descending)
- [ ] Color-code returns (green = positive, red = negative)
- [ ] Add to Investments page
- [ ] Fetch data from Supabase `investments` table
- [ ] Calculate allocation percentage (account balance / total balance)
- [ ] Test responsive layout (mobile: hide allocation column, stack vertically)

### Implementation Notes
```javascript
document.querySelectorAll('.sortable').forEach((th) => {
  th.addEventListener('click', () => {
    sortTable(th.dataset.sort);
  });
});
```

### Related Research
`reports/financial-dashboard-ui-patterns-research.md` — Section: "Pattern 6: Comparison Tables"

---

## Work Item 6: Implement Smart Alerts System

**Type:** Task  
**Priority:** High  
**Effort:** 8 hours  
**Sprint:** Sprint 3  
**Assigned To:** Builder + Analyst

### Description
Build contextual alert system that proactively notifies users about bills due, budgets exceeded, and unusual spending patterns.

### Acceptance Criteria
- [ ] Create alert card component (critical, warning, info)
- [ ] Define alert types:
  - **Critical**: Bill due ≤ 2 days, account overdrawn, budget exceeded 150%
  - **Warning**: Bill due ≤ 5 days, budget at 75%, unusual spending spike
  - **Info**: Net worth milestone, new paycheck, goal reached
- [ ] Create database table `alerts` (id, user_id, type, title, body, action_url, dismissed, created_at)
- [ ] Implement alert generation logic (triggered by Supabase functions or cron jobs)
- [ ] Add alert dismissal (mark as read)
- [ ] Show alerts on Dashboard (top of page)
- [ ] Add notification badge to navbar (count of unread alerts)
- [ ] Post alerts to Discord #alerts channel

### Implementation Notes
**Alert Generation** (Supabase Edge Function):
```javascript
// Check for bills due in 2 days
const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
const { data: upcomingBills } = await supabase
  .from('bills')
  .select('*')
  .lte('due_date', twoDaysFromNow.toISOString())
  .eq('paid', false);

// Create alerts
upcomingBills.forEach(async (bill) => {
  await supabase.from('alerts').insert({
    user_id: bill.user_id,
    type: 'critical',
    title: `${bill.name} due in 2 days`,
    body: `$${bill.amount} due ${bill.due_date}`,
    action_url: '/bills.html'
  });
});
```

### Related Research
`reports/financial-dashboard-ui-patterns-research.md` — Section: "Pattern 7: Smart Alerts & Notifications"

---

## Work Item 7: Implement Cash Flow Sankey Diagram (Optional)

**Type:** Task  
**Priority:** Low (Nice-to-Have)  
**Effort:** 6 hours  
**Sprint:** Sprint 4  
**Assigned To:** Builder

### Description
Create Sankey diagram visualizing money flow from income sources → expenses → savings/investments.

### Acceptance Criteria
- [ ] Install Chart.js Sankey plugin (`chartjs-chart-sankey`)
- [ ] Create cash flow data structure (from, to, amount)
- [ ] Implement `createCashFlowChart()` function
- [ ] Add to Reports page or new "Cash Flow" tab
- [ ] Fetch data from Supabase (aggregate transactions by category)
- [ ] Test with sample data (salary → housing, food, savings, etc.)
- [ ] Ensure responsive layout (chart scales on mobile)

### Implementation Notes
```javascript
const cashFlowData = [
  { from: 'Salary', to: 'Housing', flow: 2400 },
  { from: 'Salary', to: 'Food', flow: 600 },
  { from: 'Salary', to: '401k', flow: 800 }
];
```

**Note**: Sankey charts are resource-intensive. Only implement if requested by user.

### Related Research
`reports/financial-dashboard-ui-patterns-research.md` — Section: "Pattern 2: Cash Flow Sankey Diagram"

---

## How to Create These Work Items in Azure DevOps

### Manual Creation (Azure DevOps Web UI)
1. Navigate to: https://dev.azure.com/fireside365/Fireside%20Capital/_workitems
2. Click **New Work Item** → **Task**
3. Copy title, description, and acceptance criteria from above
4. Set fields:
   - **Assigned To:** Builder (or team member)
   - **Priority:** As specified
   - **Original Estimate:** As specified (in hours)
   - **Iteration:** Appropriate sprint
   - **Area Path:** UI/UX
   - **Tags:** ui-patterns, dashboard, frontend, research

---

**Status:** Ready for manual creation in Azure DevOps  
**Total Effort:** 40 hours across 7 tasks  
**Expected Completion:** Sprint 4 (if starting now)
