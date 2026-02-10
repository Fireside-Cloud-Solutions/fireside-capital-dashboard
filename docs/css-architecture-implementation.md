# CSS Architecture Implementation Guide
**Fireside Capital Dashboard**  
*Created: February 10, 2026*

## 📋 Overview

This guide documents the implementation of financial UI patterns and Chart.js integration for the Fireside Capital dashboard, based on research into best practices for financial dashboard interfaces.

## 🎨 New Files Created

### 1. `app/assets/css/financial-patterns.css` (10.5 KB)
Specialized CSS components for financial data display:

- **Data Density Controls** - Compact/Normal/Comfortable row heights
- **Financial Value Display** - Tabular nums, semantic colors
- **Trend Indicators** - Up/down/neutral with icons
- **Account Balances** - Hierarchical typography
- **Transaction Lists** - Optimized grid layout
- **Category Badges** - Color-coded tags
- **Account Cards** - Hover states, shadows
- **Budget Progress Bars** - With warning thresholds
- **Metric Cards** - KPI displays
- **Financial Tables** - Enhanced readability
- **Loading States** - Skeleton screens
- **Print Styles** - Statement-friendly

**Usage:**
```html
<!-- Add to HTML head after main.css -->
<link rel="stylesheet" href="assets/css/financial-patterns.css">
```

**Examples:**
```html
<!-- Financial amount with color coding -->
<span class="amount amount-large amount-positive">$12,345.67</span>

<!-- Trend indicator -->
<div class="trend trend--up">
  <span class="trend__value">12.5</span>
  <span class="trend__percentage"></span>
</div>

<!-- Transaction row -->
<div class="transaction-row">
  <div class="transaction-icon">💰</div>
  <div class="transaction-details">
    <div class="transaction-name">Grocery Store</div>
    <div class="transaction-meta">
      <span class="category-badge">Food</span>
      <span>•</span>
      <span>2 days ago</span>
    </div>
  </div>
  <div class="transaction-amount amount-negative">-$45.23</div>
  <div class="transaction-date">Feb 8</div>
</div>

<!-- Budget progress -->
<div class="budget-label">
  <span class="budget-label__name">Groceries</span>
  <span class="budget-label__values">$450 / $600</span>
</div>
<div class="budget-progress">
  <div class="budget-progress__bar budget-progress__bar--warning" style="width: 75%;"></div>
</div>
```

### 2. `app/assets/js/chart-config.js` (11 KB)
Chart.js configuration system with Fireside Capital theming:

**Features:**
- ✅ Design token integration (pulls from CSS custom properties)
- ✅ Currency/number/percent formatters
- ✅ Preset configurations (line, bar, doughnut, area)
- ✅ Brand color palettes
- ✅ Consistent tooltip/legend styling
- ✅ Axis formatting helpers
- ✅ Chart update utilities

**Usage:**
```html
<!-- Add after Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
<script src="assets/js/chart-config.js"></script>
```

**Examples:**
```javascript
// Access global configuration
const { defaults, colors, presets, utils, format } = window.FiresideCharts;

// Create a line chart with defaults
const ctx = document.getElementById('netWorthChart').getContext('2d');
const netWorthChart = new Chart(ctx, {
  ...presets.line(),
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Net Worth',
      data: [50000, 52000, 51500, 54000, 56000, 58000],
      borderColor: colors.primary[1],
      backgroundColor: colors.secondaryAlpha(0.1),
      fill: true,
      tension: 0.4
    }]
  }
});

// Create a bar chart for spending
const spendingChart = new Chart(ctx, {
  ...presets.bar(),
  data: {
    labels: ['Groceries', 'Utilities', 'Transport', 'Entertainment'],
    datasets: [{
      label: 'Spending',
      data: [450, 250, 180, 120],
      backgroundColor: colors.extended.slice(0, 4)
    }]
  }
});

// Create a doughnut chart for allocation
const allocationChart = new Chart(ctx, {
  ...presets.doughnut(),
  data: {
    labels: ['Stocks', 'Bonds', 'Cash', 'Real Estate'],
    datasets: [{
      data: [60000, 20000, 10000, 10000],
      backgroundColor: colors.extended.slice(0, 4)
    }]
  }
});

// Custom formatter for Y axis
const config = presets.line();
utils.applyAxisFormatter(config.options, 'y', 'currencyPrecise');

// Update chart data dynamically
utils.updateChartData(existingChart, {
  labels: newLabels,
  datasets: newDatasets
});
```

## 🎯 Implementation Checklist

### Phase 1: Core Integration (Immediate)

- [x] Create `financial-patterns.css`
- [x] Create `chart-config.js`
- [ ] Add CSS link to all HTML pages
- [ ] Add JS script to all HTML pages
- [ ] Update existing amount displays to use `.amount` class
- [ ] Apply `.trend` classes to change indicators
- [ ] Refactor transaction lists to use `.transaction-row`

### Phase 2: Chart Migration (Next Sprint)

- [ ] Update `dashboard.html` - Convert existing charts to use presets
- [ ] Update `investments.html` - Apply allocation doughnut preset
- [ ] Update `reports.html` - Apply all chart presets
- [ ] Test all charts in mobile viewport
- [ ] Add loading skeletons to chart containers

### Phase 3: Component Audit (Future)

- [ ] Identify all financial values in codebase
- [ ] Apply tabular-nums systematically
- [ ] Standardize all category badges
- [ ] Audit all hover states
- [ ] Add print styles to reports

## 🧪 Testing

### Visual Regression Tests
```bash
# Test all pages for visual consistency
npm run test:visual
```

### Accessibility Tests
```bash
# Ensure all financial data is accessible
npm run test:a11y
```

### Cross-Browser Tests
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## 📊 Performance Impact

**Before:**
- `main.css`: 91 KB
- Total CSS: ~160 KB

**After:**
- `main.css`: 91 KB (unchanged)
- `financial-patterns.css`: +10.5 KB
- Total CSS: ~170.5 KB (+6.6%)

**Recommendations:**
1. ✅ financial-patterns.css is well-scoped
2. ⚠️ Still need to split main.css into modules (high priority)
3. ✅ chart-config.js is minimal (11 KB)

## 🔄 Migration Path for Existing Code

### Before (old approach):
```html
<div style="color: #81b900; font-weight: bold;">
  $12,345.67 ↑ 5.2%
</div>
```

### After (new approach):
```html
<div class="amount amount-large amount-positive">
  $12,345.67
</div>
<div class="trend trend--up">
  <span class="trend__value">5.2</span>
  <span class="trend__percentage"></span>
</div>
```

### Before (old chart):
```javascript
new Chart(ctx, {
  type: 'line',
  data: data,
  options: {
    responsive: true,
    scales: {
      y: {
        ticks: {
          callback: function(value) {
            return '$' + value;
          }
        }
      }
    }
  }
});
```

### After (new chart):
```javascript
new Chart(ctx, {
  ...FiresideCharts.presets.line(),
  data: data
  // Defaults include currency formatting, theming, and responsive behavior
});
```

## 📚 Related Documentation

- [Design Tokens Reference](../app/assets/css/design-tokens.css)
- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [Financial Dashboard Best Practices](https://www.nngroup.com/articles/dashboard-design/)

## 🚀 Next Steps

1. **Immediate:** Add CSS/JS to HTML templates
2. **Sprint 2:** Refactor all charts to use presets
3. **Sprint 3:** Apply financial patterns to all pages
4. **Future:** Extract critical CSS for above-fold content

---

**Last Updated:** February 10, 2026  
**Maintained by:** Capital (Fireside Capital Orchestrator)
