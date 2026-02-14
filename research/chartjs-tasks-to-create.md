# Chart.js — Enhancement Tasks for Azure DevOps
**Created:** February 14, 2026  
**Source:** research/chartjs-research.md

Copy these tasks into Azure DevOps (org: fireside365, project: Fireside Capital)

---

## Task 1: Chart.js Upgrade to 4.5.x
**Type:** Task  
**Priority:** 2 (Medium)  
**Tags:** Chart.js, Performance, Upgrade  
**Estimated Effort:** 15-30 minutes

### Description
Upgrade Chart.js from 4.4.7 to 4.5.2 (latest stable as of Feb 2026).

**Benefits:**
- 15% faster bar chart rendering
- Better TypeScript definitions
- New `interaction.axis` option for improved tooltip positioning
- Bug fixes for doughnut chart cutout calculation

### Implementation
1. Update CDN URL in `app/assets/js/lazy-loader.js`:
   ```javascript
   // BEFORE
   'https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js'
   
   // AFTER
   'https://cdn.jsdelivr.net/npm/chart.js@4.5.2/dist/chart.umd.min.js'
   ```

2. Test all 8 charts:
   - Net Worth Timeline (line + area)
   - Cash Flow (bar)
   - Net Worth Delta (line)
   - Spending Categories (doughnut)
   - Savings Rate (line)
   - Investment Growth (line + area)
   - Asset Allocation (doughnut)
   - DTI Gauge (doughnut gauge)

3. Verify functionality:
   - Time range filters (1M, 3M, 6M, 1Y, All)
   - Projection rendering (dashed line for forecasts)
   - Tooltips with currency formatting
   - Legend positioning (mobile vs desktop)
   - Decimation for 100+ data points

### Acceptance Criteria
- [ ] All 8 charts render correctly
- [ ] No console errors or warnings
- [ ] Time range filters work instantly
- [ ] Tooltips show correct currency formatting
- [ ] Visual regression test passes (screenshot comparison)
- [ ] Performance benchmark: bar charts render ≥10% faster

### Risk
**Low** — 4.4.x → 4.5.x is minor version, API compatible

### Reference
`research/chartjs-research.md` — Section 10.1: Upgrade to Chart.js 4.5.x

---

## Task 2: Add Chart Export (PNG & CSV)
**Type:** Feature  
**Priority:** 2 (Medium)  
**Tags:** Chart.js, Export, User Feature  
**Estimated Effort:** 2-3 hours

### Description
Allow users to export chart data as CSV (for Excel analysis) and PNG (for presentations/reports).

**Use Cases:**
- Export net worth data to Excel for custom analysis
- Save charts as PNG for financial advisor meetings
- Share charts in presentations/reports

### Implementation

#### 1. Create Export Functions
Add to `app/assets/js/charts.js`:

```javascript
/**
 * Export chart as PNG image
 * @param {string} chartId - Chart instance ID (e.g., 'netWorth')
 * @param {string} filename - Optional filename (defaults to 'chart.png')
 */
function exportChartAsPNG(chartId, filename) {
  const chart = chartInstances[chartId];
  if (!chart) {
    console.error(`Chart instance not found: ${chartId}`);
    return;
  }
  
  // Generate 2x resolution for crisp images
  const url = chart.toBase64Image('image/png', 2);
  const link = document.createElement('a');
  link.download = filename || `${chartId}-${new Date().toISOString().split('T')[0]}.png`;
  link.href = url;
  link.click();
}

/**
 * Export chart data as CSV
 * @param {string} chartId - Chart instance ID
 * @param {string} filename - Optional filename (defaults to 'chart-data.csv')
 */
function exportChartDataAsCSV(chartId, filename) {
  const chart = chartInstances[chartId];
  if (!chart) {
    console.error(`Chart instance not found: ${chartId}`);
    return;
  }
  
  const labels = chart.data.labels;
  const datasets = chart.data.datasets;
  
  // CSV Header
  let csv = 'Date,' + datasets.map(d => d.label).join(',') + '\n';
  
  // CSV Rows
  labels.forEach((label, i) => {
    const row = [label];
    datasets.forEach(dataset => {
      const value = dataset.data[i];
      row.push(value !== null && value !== undefined ? value : '');
    });
    csv += row.join(',') + '\n';
  });
  
  // Download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename || `${chartId}-data-${new Date().toISOString().split('T')[0]}.csv`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

// Make functions globally available
window.exportChartAsPNG = exportChartAsPNG;
window.exportChartDataAsCSV = exportChartDataAsCSV;
```

#### 2. Add UI Buttons
Update chart card HTML structure:

```html
<!-- Example: Net Worth Chart Card -->
<div class="chart-card">
  <div class="chart-header d-flex justify-content-between align-items-center mb-3">
    <h5 class="mb-0">Net Worth Timeline</h5>
    
    <!-- Export Actions -->
    <div class="chart-actions btn-group btn-group-sm">
      <button 
        onclick="exportChartAsPNG('netWorth')" 
        class="btn btn-outline-secondary"
        title="Export as PNG">
        <i class="bi bi-download"></i> PNG
      </button>
      <button 
        onclick="exportChartDataAsCSV('netWorth')" 
        class="btn btn-outline-secondary"
        title="Export as CSV">
        <i class="bi bi-file-earmark-spreadsheet"></i> CSV
      </button>
    </div>
  </div>
  
  <!-- Time Range Filter (existing) -->
  <div class="time-range-filter">...</div>
  
  <!-- Chart Canvas -->
  <div class="chart-container">
    <canvas id="netWorthTimelineChart"></canvas>
  </div>
</div>
```

#### 3. Apply to All Charts
Add export buttons to:
- [x] Net Worth Timeline
- [x] Cash Flow
- [x] Net Worth Delta
- [x] Spending Categories
- [x] Savings Rate
- [x] Investment Growth
- [x] Asset Allocation
- [x] DTI Gauge

### Acceptance Criteria
- [ ] PNG export produces high-quality image (2x resolution)
- [ ] PNG filename includes chart name + current date
- [ ] CSV export includes all data points and labels
- [ ] CSV handles null/undefined values gracefully
- [ ] CSV handles multi-dataset charts (e.g., Cash Flow with Income + Expenses)
- [ ] Export buttons styled consistently (Bootstrap button group)
- [ ] Works on all 8 charts
- [ ] Mobile-friendly (buttons stack on small screens)
- [ ] No console errors when exporting

### Reference
`research/chartjs-research.md` — Section 10.2: Add Chart Export (CSV/PNG)

---

## Task 3: Implement Chart Annotations for Financial Events
**Type:** Feature  
**Priority:** 3 (Low)  
**Tags:** Chart.js, Annotations, Financial Events  
**Estimated Effort:** 4-6 hours

### Description
Add ability to mark important financial events on charts (e.g., "Paid off car loan", "Started new job", "Major expense").

**Use Cases:**
- Mark debt payoffs on net worth chart
- Show income changes on cash flow chart
- Highlight major expenses (car purchase, home repair)
- Track financial milestones

**Visual Result:**
- Vertical lines on charts at event dates
- Labels showing event title
- Color-coded by event type (green=positive, red=negative, blue=neutral)

### Implementation

#### 1. Install Chart.js Annotation Plugin

```bash
npm install chartjs-plugin-annotation --save
```

Or use CDN in `lazy-loader.js`:
```javascript
// Add after Chart.js loads
static async loadChartAnnotations() {
  if (this.loadingPromises.annotations) return this.loadingPromises.annotations;
  if (window.annotationPlugin) return Promise.resolve();
  
  this.loadingPromises.annotations = this.loadScript(
    'https://cdn.jsdelivr.net/npm/chartjs-plugin-annotation@3.0.1/dist/chartjs-plugin-annotation.min.js'
  ).then(() => {
    Chart.register(annotationPlugin);
    delete this.loadingPromises.annotations;
  });
  
  return this.loadingPromises.annotations;
}
```

#### 2. Create Database Table

**Migration:** `supabase/migrations/create_financial_events.sql`

```sql
CREATE TABLE financial_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  event_date DATE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'debt_paid', 
    'income_change', 
    'windfall', 
    'expense', 
    'investment', 
    'other'
  )),
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Index for performance
CREATE INDEX idx_financial_events_user_date ON financial_events(user_id, event_date);

-- RLS Policy
ALTER TABLE financial_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own events"
  ON financial_events
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

#### 3. Add Annotations to Charts

**Example:** Net Worth Chart with Events

```javascript
// Fetch events from Supabase
async function loadFinancialEvents() {
  const { data, error } = await supabase
    .from('financial_events')
    .select('*')
    .order('event_date', { ascending: true });
  
  if (error) {
    console.error('Error loading financial events:', error);
    return [];
  }
  
  return data;
}

// Convert events to Chart.js annotations
function createEventAnnotations(events, chartStartDate, chartEndDate) {
  const annotations = {};
  
  events.forEach((event, index) => {
    const eventDate = new Date(event.event_date);
    
    // Only show events within chart date range
    if (eventDate < new Date(chartStartDate) || eventDate > new Date(chartEndDate)) {
      return;
    }
    
    // Color by event type
    const colors = {
      debt_paid: '#81b900',        // Green (positive)
      income_change: '#01a4ef',    // Blue (neutral)
      windfall: '#81b900',         // Green (positive)
      expense: '#e53935',          // Red (negative)
      investment: '#01a4ef',       // Blue (neutral)
      other: '#999999'             // Gray (neutral)
    };
    
    annotations[`event_${event.id}`] = {
      type: 'line',
      xMin: event.event_date,
      xMax: event.event_date,
      borderColor: colors[event.event_type] || '#999999',
      borderWidth: 2,
      borderDash: [3, 3],
      label: {
        content: event.title,
        enabled: true,
        position: 'start',
        backgroundColor: 'rgba(26, 26, 26, 0.9)',
        color: '#f0f0f0',
        padding: 4,
        font: {
          size: 11,
          weight: '600'
        }
      }
    };
  });
  
  return annotations;
}

// Update chart config to include annotations
async function renderNetWorthChart() {
  // ... existing code ...
  
  const events = await loadFinancialEvents();
  const annotations = createEventAnnotations(
    events, 
    filtered.labels[0], 
    filtered.labels[filtered.labels.length - 1]
  );
  
  chartInstances.netWorth = await safeCreateChart(ctx, {
    type: 'line',
    data: { /* ... */ },
    options: {
      plugins: {
        annotation: { annotations },
        // ... other plugins ...
      }
    }
  });
}
```

#### 4. Create Event Management UI

**Modal for Adding Events:**

```html
<!-- Add to index.html -->
<div class="modal fade" id="addEventModal" tabindex="-1">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Add Financial Event</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <form id="addEventForm">
          <div class="mb-3">
            <label for="eventDate" class="form-label">Date</label>
            <input type="date" class="form-control" id="eventDate" required>
          </div>
          
          <div class="mb-3">
            <label for="eventType" class="form-label">Type</label>
            <select class="form-select" id="eventType" required>
              <option value="debt_paid">Debt Paid Off</option>
              <option value="income_change">Income Change</option>
              <option value="windfall">Windfall</option>
              <option value="expense">Major Expense</option>
              <option value="investment">Investment</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div class="mb-3">
            <label for="eventTitle" class="form-label">Title</label>
            <input type="text" class="form-control" id="eventTitle" required placeholder="e.g., Paid off car loan">
          </div>
          
          <div class="mb-3">
            <label for="eventDescription" class="form-label">Description (Optional)</label>
            <textarea class="form-control" id="eventDescription" rows="2"></textarea>
          </div>
          
          <div class="mb-3">
            <label for="eventAmount" class="form-label">Amount (Optional)</label>
            <input type="number" class="form-control" id="eventAmount" step="0.01" placeholder="0.00">
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-primary" onclick="saveFinancialEvent()">Save Event</button>
      </div>
    </div>
  </div>
</div>
```

**Save Event Function:**

```javascript
async function saveFinancialEvent() {
  const eventData = {
    user_id: (await supabase.auth.getUser()).data.user.id,
    event_date: document.getElementById('eventDate').value,
    event_type: document.getElementById('eventType').value,
    title: document.getElementById('eventTitle').value,
    description: document.getElementById('eventDescription').value || null,
    amount: document.getElementById('eventAmount').value || null
  };
  
  const { data, error } = await supabase
    .from('financial_events')
    .insert([eventData])
    .select();
  
  if (error) {
    console.error('Error saving event:', error);
    alert('Failed to save event');
    return;
  }
  
  // Close modal
  bootstrap.Modal.getInstance(document.getElementById('addEventModal')).hide();
  
  // Refresh charts
  renderNetWorthChart();
  renderCashFlowChart();
  
  toast('Event added successfully', 'success');
}
```

#### 5. Add Event Management Button to Dashboard

```html
<button class="btn btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#addEventModal">
  <i class="bi bi-calendar-event"></i> Add Event
</button>
```

### Acceptance Criteria
- [ ] `chartjs-plugin-annotation` installed and loaded
- [ ] `financial_events` table created with RLS policies
- [ ] Events render as vertical lines on net worth chart
- [ ] Events color-coded by type (green/red/blue/gray)
- [ ] Events filter by chart date range (only show visible events)
- [ ] Modal UI for adding events (with validation)
- [ ] Save event to Supabase with user_id
- [ ] Charts refresh automatically after adding event
- [ ] Event management page (list, edit, delete events)
- [ ] Hover on annotation line shows event details

### Reference
`research/chartjs-research.md` — Section 10.3: Chart Annotations (Financial Events)

---

## Summary
- **Total Tasks:** 3
- **Total Effort:** 9-10 hours (~1.5 days)
- **Expected Value:** Medium-High (export feature highly requested)

## Recommended Order
1. **Task 1** — Upgrade Chart.js (quick win, 30 min)
2. **Task 2** — Add export (high user value, 3 hours)
3. **Task 3** — Annotations (nice-to-have, 6 hours)
