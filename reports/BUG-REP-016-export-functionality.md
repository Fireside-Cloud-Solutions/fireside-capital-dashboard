# BUG-REP-016: Reports Page Export Functionality Missing

**Created**: February 14, 2026 — 6:20 AM  
**Severity**: MEDIUM (P2)  
**Impact**: Feature gap, user expectations  
**Estimated Fix Time**: 2-3 hours

---

## Summary

Reports page has an "Export" button in the page header but no JavaScript implementation. Users expect to download their financial report data as CSV, but clicking the button does nothing.

---

## Location

**File**: `app/reports.html` line 93  
**Element**: `#pageActions button[aria-label*="Export"]`  
**Live URL**: https://nice-cliff-05b13880f.2.azurestaticapps.net/reports.html

---

## Current Code

```html
<div id="pageActions" class="d-flex gap-2">
  <button class="btn btn-primary" aria-label="Export financial report as CSV" 
    title="Download current report data as CSV">
    <i class="bi bi-download"></i> Export
  </button>
</div>
```

**Issue**: No event handler, no export functionality implemented.

---

## Expected Behavior

1. User clicks "Export" button
2. JavaScript generates CSV containing:
   - Summary metrics (Investments, Debts, Net Worth)
   - Net Worth Timeline data points
   - Asset Allocation breakdown
   - Monthly Trends data
3. Browser triggers download: `financial-report-YYYY-MM-DD.csv`
4. Button shows loading state during generation

---

## Fix Required

### Step 1: Add Event Handler (reports.js)

```javascript
// Export report data as CSV
document.querySelector('#pageActions button[aria-label*="Export"]')
  ?.addEventListener('click', async () => {
    const btn = event.currentTarget;
    const originalHTML = btn.innerHTML;
    
    // Show loading state
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Exporting...';
    
    try {
      const data = await generateReportData();
      downloadCSV(data, `financial-report-${new Date().toISOString().split('T')[0]}.csv`);
      
      // Success feedback
      btn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Downloaded';
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
      }, 2000);
    } catch (error) {
      console.error('[Reports] Export failed:', error);
      btn.innerHTML = '<i class="bi bi-x-circle me-2"></i>Export Failed';
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
      }, 2000);
    }
  });
```

### Step 2: Generate Report Data

```javascript
async function generateReportData() {
  const { data: snapshots, error } = await supabase
    .from('snapshots')
    .select('*')
    .order('date', { ascending: true });
    
  if (error) throw error;
  
  return {
    summary: {
      investments: document.getElementById('reportInvestments').textContent,
      debts: document.getElementById('reportDebts').textContent,
      netWorth: document.getElementById('reportNetWorth').textContent,
      generatedDate: new Date().toISOString()
    },
    timeline: snapshots.map(s => ({
      date: s.date,
      netWorth: s.net_worth,
      assets: s.total_assets,
      debts: s.total_debts
    }))
  };
}
```

### Step 3: CSV Download Utility (create assets/js/export-utils.js)

```javascript
/**
 * Convert data to CSV format
 */
function convertToCSV(data) {
  // Summary section
  let csv = 'Fireside Capital - Financial Report\n';
  csv += `Generated: ${new Date().toLocaleDateString()}\n\n`;
  csv += 'Summary\n';
  csv += `Total Investments,${data.summary.investments}\n`;
  csv += `Total Debts,${data.summary.debts}\n`;
  csv += `Net Worth,${data.summary.netWorth}\n\n`;
  
  // Timeline section
  csv += 'Net Worth Timeline\n';
  csv += 'Date,Net Worth,Total Assets,Total Debts\n';
  data.timeline.forEach(row => {
    csv += `${row.date},${row.netWorth},${row.assets},${row.debts}\n`;
  });
  
  return csv;
}

/**
 * Trigger browser download of CSV file
 */
function downloadCSV(data, filename) {
  const csv = convertToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
```

---

## Files to Update

1. **assets/js/reports.js** — Add export event handler (20 lines)
2. **assets/js/export-utils.js** (NEW) — Reusable CSV export utilities (40 lines)
3. **reports.html** — Include export-utils.js script tag (1 line)

---

## Testing Checklist

- [ ] Click Export button → CSV downloads
- [ ] CSV contains correct summary data
- [ ] CSV contains timeline data (all snapshots)
- [ ] Filename format: `financial-report-2026-02-14.csv`
- [ ] Button shows loading state during export
- [ ] Button shows success feedback after download
- [ ] Error handling if Supabase query fails

---

## Priority Justification

**MEDIUM (P2)** because:
- ✅ Not blocking core functionality
- ✅ Feature is advertised but non-functional (user expectation issue)
- ✅ Common use case (users want to export data for taxes, analysis)
- ✅ Moderate effort (2-3h implementation)

---

## Related Issues

- Issue #17: Reports page missing skeleton loaders (UI consistency)
- ~~Issue #18: Script loading order~~ ✅ FIXED (commit 8782bfe)
- ~~Issue #19: Summary card color coding~~ ✅ FIXED (commit 8782bfe)

---

## Notes

- Consider adding PDF export option in future (requires jsPDF library)
- Could add date range selector for timeline export (export last 30/90/365 days)
- Reusable `export-utils.js` can be used for other pages (Budget, Assets, Debts export)
