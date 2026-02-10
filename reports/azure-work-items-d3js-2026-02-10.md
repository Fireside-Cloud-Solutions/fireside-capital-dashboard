# Azure DevOps Work Items: D3.js Advanced Visualization
**Generated:** February 10, 2026 @ 5:58 AM EST  
**Source:** reports/SPRINT-RESEARCH-D3JS-ADVANCED-VISUALIZATION-2026-02-10.md  
**Status:** Ready for Azure DevOps Creation

---

## Work Item 1: D3.js Foundation Setup

**Type:** Task  
**Priority:** High  
**Area Path:** Fireside Capital\Frontend  
**Iteration:** Sprint 2  
**Effort:** 4 hours  
**Tags:** research, d3js, foundation, technical-debt

### Description
Set up D3.js v7 infrastructure with shared utilities, styling, and tooltip implementation to support advanced financial visualizations.

### Acceptance Criteria
- [ ] D3.js v7 imported via ESM CDN
- [ ] `app/assets/js/d3-utils.js` created with:
  - Currency formatter
  - Percentage formatter
  - Date parser
  - Tooltip show/hide functions
  - Color scale matching Fireside brand
  - Responsive sizing helper
- [ ] `app/assets/css/d3-charts.css` created with:
  - Chart container styles
  - Axis styling
  - Tooltip styles
  - Responsive breakpoints
- [ ] Tooltip working on test page

### Implementation Notes
```javascript
// Import in HTML
<script type="module">
  import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
</script>

// Utility file structure:
// - formatCurrency(value)
// - formatPercent(value)
// - parseDate(dateStr)
// - showTooltip(event, content)
// - hideTooltip()
// - colorScale (d3.scaleOrdinal)
// - getChartDimensions(containerId)
```

### Testing
- [ ] Tooltip displays on hover
- [ ] Formatters return expected strings
- [ ] Colors match brand guide
- [ ] Responsive sizing works on mobile

---

## Work Item 2: Sankey Diagram - Money Flow Visualization

**Type:** Task  
**Priority:** High  
**Area Path:** Fireside Capital\Frontend  
**Iteration:** Sprint 2  
**Effort:** 8 hours  
**Tags:** research, d3js, sankey, visualization, reports

### Description
Implement interactive Sankey diagram showing money flow from income sources → expense categories → subcategories. This provides transparency into where money goes each month.

### Acceptance Criteria
- [ ] `app/assets/js/d3-sankey.js` implemented
- [ ] Supabase query fetches income + spending data
- [ ] Sankey renders with:
  - Income flows (green)
  - Expense flows (orange/red)
  - Interactive tooltips showing amounts
  - Responsive layout
- [ ] Added to Reports page (`reports.html`)
- [ ] Performance: < 500ms render time with 50+ nodes
- [ ] Mobile responsive (text scales appropriately)

### Data Structure
```javascript
{
  nodes: [
    { name: 'Salary', layer: 0 },
    { name: 'Freelance', layer: 0 },
    { name: 'Housing', layer: 1 },
    { name: 'Rent', layer: 2 }
  ],
  links: [
    { source: 0, target: 2, value: 2000 }
  ]
}
```

### Supabase Query
```sql
-- Income sources
SELECT source, monthly_amount FROM income WHERE user_id = ?

-- Spending by category (would need transactions table)
SELECT category, subcategory, SUM(amount) 
FROM transactions 
WHERE user_id = ? AND date >= DATE_TRUNC('month', CURRENT_DATE) AND amount < 0
GROUP BY category, subcategory
```

### Testing
- [ ] Sankey shows income → expense flow correctly
- [ ] Tooltips display exact amounts
- [ ] Responsive on mobile (320px width)
- [ ] Performance benchmark < 500ms
- [ ] Real user data renders without errors

---

## Work Item 3: Treemap - Spending Hierarchy

**Type:** Task  
**Priority:** Medium  
**Area Path:** Fireside Capital\Frontend  
**Iteration:** Sprint 2  
**Effort:** 6 hours  
**Tags:** research, d3js, treemap, visualization, reports

### Description
Implement treemap visualization showing proportional spending breakdown. Larger rectangles = more spending. Enables quick identification of overspending categories.

### Acceptance Criteria
- [ ] `app/assets/js/d3-treemap.js` implemented
- [ ] Supabase query builds hierarchical data from transactions
- [ ] Treemap renders with:
  - Proportional sizing based on spending amount
  - Color-coded by top-level category
  - Interactive tooltips
  - Nested subcategories
- [ ] Added to Reports page
- [ ] Click to drill down into subcategories (optional)
- [ ] Performance: < 100ms render time with 50+ categories
- [ ] Mobile-friendly (text scales appropriately)

### Data Structure
```javascript
{
  name: 'Spending',
  children: [
    {
      name: 'Housing',
      children: [
        { name: 'Rent', value: 1500 },
        { name: 'Utilities', value: 200 }
      ]
    }
  ]
}
```

### Testing
- [ ] Treemap shows proportional rectangles
- [ ] Colors match category
- [ ] Tooltips work on hover
- [ ] Mobile responsive (text visible at 320px)
- [ ] Performance benchmark < 100ms

---

## Work Item 4: Brush & Zoom Time Series - Interactive Net Worth

**Type:** Task  
**Priority:** Medium  
**Area Path:** Fireside Capital\Frontend  
**Iteration:** Sprint 3  
**Effort:** 8 hours  
**Tags:** research, d3js, brush, zoom, time-series, reports

### Description
Enhance existing net worth chart with brush & zoom functionality. Users can select date ranges to zoom into specific periods for detailed analysis.

### Acceptance Criteria
- [ ] `app/assets/js/d3-brush-zoom.js` implemented
- [ ] Fetch snapshots data from Supabase
- [ ] Interactive features:
  - Brush selector on context chart (bottom)
  - Zoom into selected date range
  - Smooth transitions
  - Axis labels update dynamically
- [ ] Added to Reports page (replace/enhance existing chart)
- [ ] Performance: 60fps with 1,000+ data points
- [ ] Mobile responsive (touch-friendly brush)

### Implementation Notes
- Main chart: Full detail
- Context chart: Mini view below with brush selector
- Brush selection updates main chart domain
- Use `d3.brushX()` for horizontal brush

### Testing
- [ ] Brush selector works (mouse + touch)
- [ ] Zooming into date range updates main chart
- [ ] Smooth transitions (no jank)
- [ ] Performance: 60fps measured with Chrome DevTools
- [ ] 12+ months of data tested

---

## Work Item 5: Waterfall Chart - Cash Flow Breakdown

**Type:** Task  
**Priority:** Low  
**Area Path:** Fireside Capital\Frontend  
**Iteration:** Sprint 3  
**Effort:** 6 hours  
**Tags:** research, d3js, waterfall, cash-flow, reports

### Description
Implement waterfall chart showing monthly cash flow: starting balance, income (up), expenses (down), ending balance. Visualizes financial health at a glance.

### Acceptance Criteria
- [ ] `app/assets/js/d3-waterfall.js` implemented
- [ ] Calculate cumulative cash flow values
- [ ] Waterfall renders with:
  - Starting balance (blue)
  - Income bars (green, upward)
  - Expense bars (red, downward)
  - Ending balance (blue)
  - Connecting lines between bars
- [ ] Added to Reports page
- [ ] Performance: < 50ms render time with 20-30 bars
- [ ] Responsive layout

### Data Structure
```javascript
[
  { label: 'Starting Balance', value: 5000, isTotal: true },
  { label: 'Salary', value: 4000, isTotal: false },
  { label: 'Rent', value: -1500, isTotal: false },
  { label: 'Ending Balance', value: 0, isTotal: true } // Calculated
]
```

### Testing
- [ ] Waterfall shows correct cash flow sequence
- [ ] Colors: green (income), red (expenses), blue (totals)
- [ ] Connecting lines display
- [ ] Responsive (mobile-friendly)
- [ ] Performance < 50ms

---

## Work Item 6: Insights Page - Advanced Analytics Hub

**Type:** Feature  
**Priority:** High  
**Area Path:** Fireside Capital\Frontend  
**Iteration:** Sprint 2  
**Effort:** 8 hours  
**Tags:** research, d3js, page, navigation, ux

### Description
Create new `insights.html` page dedicated to advanced data visualizations. This page consolidates all D3.js charts in one place for deep financial analysis.

### Acceptance Criteria
- [ ] `app/insights.html` created
- [ ] Page structure:
  - Header with page title
  - 4-5 D3 chart containers in responsive grid
  - Sidebar navigation link ("Insights")
  - Same layout/styling as other pages
- [ ] Charts display:
  - Sankey diagram (money flow)
  - Treemap (spending hierarchy)
  - Brush & zoom time series (net worth)
  - Waterfall chart (cash flow)
- [ ] Lazy loading:
  - Charts only render when visible (Intersection Observer)
  - Improves initial page load
- [ ] Responsive grid (1 column mobile, 2 columns tablet, 2 columns desktop)
- [ ] Navigation: Add "Insights" link to sidebar on all pages

### Page Layout
```html
<div class="container mt-5">
  <h1>Financial Insights</h1>
  
  <div class="row">
    <div class="col-lg-6 mb-4">
      <div id="sankey-chart" class="d3-chart"></div>
    </div>
    <div class="col-lg-6 mb-4">
      <div id="treemap-chart" class="d3-chart"></div>
    </div>
  </div>
  
  <div class="row">
    <div class="col-12 mb-4">
      <div id="brush-zoom-chart" class="d3-chart"></div>
    </div>
  </div>
  
  <div class="row">
    <div class="col-12 mb-4">
      <div id="waterfall-chart" class="d3-chart"></div>
    </div>
  </div>
</div>
```

### Testing
- [ ] All charts render correctly
- [ ] Lazy loading works (charts render on scroll into view)
- [ ] Sidebar link navigates to Insights page
- [ ] Responsive on mobile/tablet/desktop
- [ ] Page loads < 2s (initial, before chart data)

---

## Summary

**Total Work Items:** 6  
**Total Effort:** 40 hours  
**Sprint Distribution:**
- Sprint 2 (High Priority): 4 items, 26 hours
- Sprint 3 (Medium/Low): 2 items, 14 hours

**Dependencies:**
1. Work Item 1 (Foundation) must be completed before all others
2. Work Item 6 (Insights Page) should be completed after 2-3 visualizations are ready
3. Work Items 2-5 (visualizations) can be done in parallel after foundation is complete

**Recommended Implementation Order:**
1. D3.js Foundation (4h)
2. Sankey Diagram (8h) — Highest impact
3. Insights Page (8h) — Gives Sankey a home
4. Treemap (6h) — Complementary to Sankey
5. Brush & Zoom (8h) — Enhances existing chart
6. Waterfall (6h) — Nice-to-have

**Quick Win Path (12 hours):**
1. Foundation (4h)
2. Sankey (8h)
3. Add to Reports page
4. Deploy → Users see interactive money flow immediately

---

**Document Status:** ✅ Ready for Azure DevOps Import  
**Related Research:** reports/SPRINT-RESEARCH-D3JS-ADVANCED-VISUALIZATION-2026-02-10.md  
**Created By:** Capital (Sprint Research Agent)  
**Date:** February 10, 2026 @ 5:58 AM EST
