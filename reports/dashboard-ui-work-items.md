# Azure DevOps Work Items — Dashboard UI Patterns Research
**Created:** February 9, 2026  
**Project:** Fireside Capital  
**Area:** Dashboard Enhancement  

---

## Work Item 6: Add Stat Trend Indicators to Dashboard Cards

**Type:** Task  
**Priority:** High  
**Effort:** 2 hours  
**Sprint:** Sprint 1  
**Assigned To:** Builder

### Description
Enhance dashboard stat cards to include trend indicators showing direction, value change, and percentage change compared to the previous period.

### Acceptance Criteria
- [ ] Add trend indicator component to all dashboard cards
- [ ] Show direction (up/down arrow icon)
- [ ] Display absolute change (e.g., "+$2,450")
- [ ] Display percentage change (e.g., "2.0%")
- [ ] Color-code trends: green (positive), red (negative), gray (neutral)
- [ ] Add "vs last month" metadata below trend
- [ ] Update Net Worth, Investments, Assets, Debts, Budget cards
- [ ] Ensure trends calculate correctly from historical data

### Implementation Notes
```html
<!-- Example enhanced card -->
<div class="dashboard-card card-networth">
  <h5 class="stat-label">Net Worth</h5>
  <p class="stat-value">$124,567</p>
  <div class="stat-trend positive">
    <i class="bi bi-arrow-up stat-trend-icon"></i>
    <span>+$2,450 (2.0%)</span>
  </div>
  <small class="stat-meta">vs last month</small>
</div>
```

**CSS:**
```css
.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  width: fit-content;
}

.stat-trend.positive {
  color: var(--color-success);
  background: rgba(129, 185, 0, 0.1);
}

.stat-trend.negative {
  color: var(--color-error);
  background: rgba(220, 53, 69, 0.1);
}
```

### Related Research
`reports/financial-dashboard-ui-patterns-research.md` — Section: "Data Visual Hierarchy"

---

## Work Item 7: Implement Time Range Filters for Charts

**Type:** Task  
**Priority:** High  
**Effort:** 4 hours  
**Sprint:** Sprint 1  
**Assigned To:** Builder

### Description
Add interactive time range filter buttons (1M, 3M, 6M, YTD, 1Y, All) above charts to allow users to dynamically change the date range without page reload.

### Acceptance Criteria
- [ ] Create time range button group component
- [ ] Add to Net Worth Over Time chart
- [ ] Add to Asset Allocation chart (if time-based)
- [ ] Implement JavaScript to filter data based on selected range
- [ ] Update chart smoothly (animated transition)
- [ ] Persist selected range in localStorage
- [ ] Default to 6M (6 months) view
- [ ] Style buttons with active state indicator
- [ ] Ensure mobile-responsive layout (buttons stack on small screens)

### Implementation Notes
```html
<div class="time-range-filter">
  <button class="btn btn-sm btn-outline-secondary" data-range="1M">1M</button>
  <button class="btn btn-sm btn-outline-secondary" data-range="3M">3M</button>
  <button class="btn btn-sm btn-outline-secondary active" data-range="6M">6M</button>
  <button class="btn btn-sm btn-outline-secondary" data-range="YTD">YTD</button>
  <button class="btn btn-sm btn-outline-secondary" data-range="1Y">1Y</button>
  <button class="btn btn-sm btn-outline-secondary" data-range="ALL">All</button>
</div>
```

**JavaScript:**
```javascript
document.querySelectorAll('.time-range-filter button').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const range = e.target.dataset.range;
    const filteredData = filterDataByRange(snapshotData, range);
    updateChart(netWorthChart, filteredData);
    
    // Update active state
    document.querySelectorAll('.time-range-filter button').forEach(b => 
      b.classList.remove('active')
    );
    e.target.classList.add('active');
    
    // Save preference
    localStorage.setItem('preferred_time_range', range);
  });
});
```

### Related Research
`reports/financial-dashboard-ui-patterns-research.md` — Section: "Dynamic Filtering & Drill-Downs"

---

## Work Item 8: Add Drill-Down Modals for Stat Cards

**Type:** Task  
**Priority:** High  
**Effort:** 6 hours  
**Sprint:** Sprint 2  
**Assigned To:** Builder

### Description
Make dashboard stat cards interactive. When clicked, show a modal with detailed breakdown, historical data, and actionable insights.

### Acceptance Criteria
- [ ] Add click event listeners to all stat cards
- [ ] Create detail modal component (Bootstrap Modal)
- [ ] Fetch detailed data via Supabase API
- [ ] Show historical trend chart in modal (Chart.js line chart)
- [ ] Show breakdown table (e.g., Net Worth → Assets + Debts breakdown)
- [ ] Add "View Full Page" button linking to relevant page
- [ ] Include visual cursor pointer indicator on cards
- [ ] Add ARIA labels for accessibility
- [ ] Test on desktop, tablet, mobile

### Implementation Notes
```html
<!-- Detail Modal Structure -->
<div class="modal fade" id="detailModal" tabindex="-1">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="detailTitle"></h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <div id="detailChart" class="chart-wrapper" style="height: 300px;"></div>
        <hr>
        <div id="detailTable"></div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
        <a href="#" id="viewFullPageBtn" class="btn btn-primary">View Full Page</a>
      </div>
    </div>
  </div>
</div>
```

**JavaScript:**
```javascript
document.querySelectorAll('.dashboard-card').forEach(card => {
  card.addEventListener('click', async (e) => {
    const metricType = e.currentTarget.dataset.metric;
    const modal = new bootstrap.Modal(document.getElementById('detailModal'));
    
    // Fetch detailed data
    const data = await fetch(`/api/details/${metricType}`).then(r => r.json());
    
    // Update modal content
    document.getElementById('detailTitle').textContent = data.title;
    renderDetailChart(data.chartData);
    renderDetailTable(data.tableData);
    document.getElementById('viewFullPageBtn').href = data.pageUrl;
    
    modal.show();
  });
  
  // Add visual cue
  card.style.cursor = 'pointer';
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `Click for detailed ${card.dataset.metric} breakdown`);
});
```

### Related Research
`reports/financial-dashboard-ui-patterns-research.md` — Section: "Dynamic Filtering & Drill-Downs"

---

## Work Item 9: Reorganize Dashboard Metric Grouping

**Type:** Task  
**Priority:** High  
**Effort:** 3 hours  
**Sprint:** Sprint 1  
**Assigned To:** Builder

### Description
Reorganize dashboard stat cards into logical sections (Wealth Overview, Cash Flow, Investments, Obligations) with clear visual separation and section headers.

### Acceptance Criteria
- [ ] Create section headers with icons
- [ ] Group existing cards into 4 sections:
  - **Wealth Overview:** Net Worth, Assets, Debts, Equity
  - **Cash Flow:** Income (Monthly), Expenses (Monthly), Savings Rate, Savings (This Month)
  - **Investments:** Portfolio Value, Returns (%), This Month Contribution, YTD Return
  - **Obligations:** Upcoming Payments (list format)
- [ ] Add visual section dividers (border-top or subtle background)
- [ ] Update HTML structure with semantic `<section>` tags
- [ ] Maintain responsive grid layout (4 columns → 2 columns → 1 column)
- [ ] Add CSS for section styling
- [ ] Test visual hierarchy on all breakpoints

### Implementation Notes
```html
<!-- Wealth Overview Section -->
<section class="dashboard-section">
  <h3 class="section-header">
    <i class="bi bi-bank"></i> Wealth Overview
  </h3>
  <div class="row g-3">
    <div class="col-md-3">
      <!-- Net Worth Card -->
    </div>
    <div class="col-md-3">
      <!-- Assets Card -->
    </div>
    <div class="col-md-3">
      <!-- Debts Card -->
    </div>
    <div class="col-md-3">
      <!-- Equity Card -->
    </div>
  </div>
</section>

<!-- Cash Flow Section -->
<section class="dashboard-section">
  <h3 class="section-header">
    <i class="bi bi-graph-up-arrow"></i> Cash Flow
  </h3>
  <div class="row g-3">
    <!-- Income, Expenses, Savings Rate, Savings cards -->
  </div>
</section>
```

**CSS:**
```css
.dashboard-section {
  margin-bottom: 48px;
  padding-bottom: 32px;
  border-bottom: 1px solid var(--color-border-subtle);
}

.dashboard-section:last-child {
  border-bottom: none;
}

.section-header {
  font-family: var(--font-heading);
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-header i {
  color: var(--color-primary);
  font-size: 28px;
}
```

### Related Research
`reports/financial-dashboard-ui-patterns-research.md` — Section: "Effective Metric Grouping"

---

## Work Item 10: Dashboard Customization Settings

**Type:** Task  
**Priority:** Medium  
**Effort:** 8 hours  
**Sprint:** Sprint 2  
**Assigned To:** Builder

### Description
Allow users to customize their dashboard by selecting which cards to show, preferred time ranges, and chart styles. Save preferences to localStorage and Supabase.

### Acceptance Criteria
- [ ] Add "Customize" button to dashboard header
- [ ] Create customization settings modal
- [ ] Include options:
  - **Visible Cards:** Checkboxes for each card type
  - **Default Time Range:** Dropdown (1M, 3M, 6M, 1Y)
  - **Chart Style:** Radio buttons (Line, Bar, Area)
  - **Theme:** Light/Dark toggle (if not already global)
- [ ] Save preferences to `localStorage` for quick access
- [ ] Sync preferences to Supabase `user_preferences` table
- [ ] Load and apply preferences on page load
- [ ] Show/hide cards based on user selection
- [ ] Provide "Reset to Default" button
- [ ] Test persistence across sessions

### Implementation Notes
```javascript
// Default preferences
const defaultPreferences = {
  visibleCards: ['networth', 'investments', 'assets', 'debts', 'budget', 'income'],
  defaultTimeRange: '6M',
  chartStyle: 'line'
};

// Save preferences
async function savePreferences(prefs) {
  localStorage.setItem('dashboard_prefs', JSON.stringify(prefs));
  
  // Sync to Supabase
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: currentUser.id,
      preferences: prefs,
      updated_at: new Date()
    });
  
  if (error) console.error('Error saving preferences:', error);
  else showToast('Preferences saved successfully', 'success');
}

// Load and apply preferences
async function loadPreferences() {
  // Try localStorage first (faster)
  let prefs = localStorage.getItem('dashboard_prefs');
  if (prefs) {
    prefs = JSON.parse(prefs);
  } else {
    // Fallback to Supabase
    const { data } = await supabase
      .from('user_preferences')
      .select('preferences')
      .eq('user_id', currentUser.id)
      .single();
    
    prefs = data?.preferences || defaultPreferences;
    localStorage.setItem('dashboard_prefs', JSON.stringify(prefs));
  }
  
  applyPreferences(prefs);
}

// Apply preferences to UI
function applyPreferences(prefs) {
  // Show/hide cards
  document.querySelectorAll('.dashboard-card').forEach(card => {
    const cardType = card.dataset.metric;
    card.closest('.col-md-3').style.display = 
      prefs.visibleCards.includes(cardType) ? 'block' : 'none';
  });
  
  // Set default time range
  document.querySelector(`[data-range="${prefs.defaultTimeRange}"]`)?.click();
  
  // Set chart style (if implemented)
  // updateChartType(prefs.chartStyle);
}
```

### Related Research
`reports/financial-dashboard-ui-patterns-research.md` — Section: "Personalized Data Views"

---

## Work Item 11: Real-Time Dashboard Updates via Supabase

**Type:** Task  
**Priority:** Medium  
**Effort:** 6 hours  
**Sprint:** Sprint 2  
**Assigned To:** Builder

### Description
Implement Supabase Realtime subscriptions to automatically update dashboard metrics when data changes (e.g., new transaction, bill payment).

### Acceptance Criteria
- [ ] Set up Supabase Realtime channels
- [ ] Subscribe to `transactions` table changes
- [ ] Subscribe to `bills` table changes
- [ ] Subscribe to `snapshots` table changes
- [ ] Update affected dashboard cards when data changes
- [ ] Show toast notification for updates
- [ ] Animate value changes (number count-up effect)
- [ ] Handle errors and reconnection gracefully
- [ ] Test with manual database updates

### Implementation Notes
```javascript
// Subscribe to realtime updates
const transactionChannel = supabase
  .channel('transactions')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'transactions' },
    (payload) => {
      console.log('New transaction:', payload.new);
      updateDashboardMetrics();
      showToast(`New transaction: ${payload.new.description} - ${formatCurrency(payload.new.amount)}`, 'info');
    }
  )
  .subscribe();

// Update metrics with animation
async function updateDashboardMetrics() {
  const data = await loadDashboardData();
  
  // Animate value changes
  animateValue('.card-networth .stat-value', currentNetWorth, data.netWorth, 1000);
  animateValue('.card-budget .stat-value', currentBudget, data.remainingBudget, 1000);
  
  // Update trend indicators
  updateTrendIndicator('.card-networth', data.netWorthTrend);
}

function animateValue(selector, start, end, duration) {
  const element = document.querySelector(selector);
  const range = end - start;
  const increment = range / (duration / 16); // 60fps
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
      current = end;
      clearInterval(timer);
    }
    element.textContent = formatCurrency(current);
  }, 16);
}
```

### Related Research
`reports/financial-dashboard-ui-patterns-research.md` — Section: "Real-Time Data Updates"

---

## Summary of Work Items

| ID | Title | Priority | Effort | Sprint |
|----|-------|----------|--------|--------|
| 6 | Add Stat Trend Indicators | HIGH | 2h | Sprint 1 |
| 7 | Implement Time Range Filters | HIGH | 4h | Sprint 1 |
| 8 | Add Drill-Down Modals | HIGH | 6h | Sprint 2 |
| 9 | Reorganize Metric Grouping | HIGH | 3h | Sprint 1 |
| 10 | Dashboard Customization Settings | MEDIUM | 8h | Sprint 2 |
| 11 | Real-Time Dashboard Updates | MEDIUM | 6h | Sprint 2 |

**Total Effort:** 29 hours across 6 tasks  
**High Priority Total:** 15 hours (Sprint 1 focus)  
**Expected Completion:** End of Sprint 2

---

**Status:** Ready for manual creation in Azure DevOps  
**Next Steps:** Assign to Builder and prioritize for Sprint 1
