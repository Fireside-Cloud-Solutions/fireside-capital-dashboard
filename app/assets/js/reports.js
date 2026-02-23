// ===================================================================
// FIRESIDE CAPITAL - REPORTS PAGE MODULE
// Comprehensive financial reporting with charts and export functionality
// ===================================================================

// ===================================================================
// INITIALIZE REPORTS PAGE
// ===================================================================
async function initReportsPage() {
  // Verify user authentication
  const user = await sb.auth.getUser();
  if (!user.data.user) {
    console.error('[Reports] User not authenticated');
    return;
  }
  
  const userId = user.data.user.id;
  
  // Load report summary data
  await loadReportSummary(userId);
  
  // Initialize all charts (functions already exist in charts.js)
  await initializeReportCharts();
}

// ===================================================================
// LOAD REPORT SUMMARY DATA
// ===================================================================
async function loadReportSummary(userId) {
  try {
    // Fetch latest snapshot for summary cards
    const { data: snapshots, error } = await sb
      .from('snapshots')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1);
      
    if (error) {
      console.error('[Reports] Error fetching snapshots:', error);
      throw error;
    }
    
    if (snapshots && snapshots.length > 0) {
      const latest = snapshots[0];
      
      // Update summary cards with real data
      document.getElementById('reportInvestments').textContent = 
        formatCurrency(latest.total_assets || 0);
      document.getElementById('reportDebts').textContent = 
        formatCurrency(latest.total_debts || 0);
      
      // Net worth with dynamic color coding
      const netWorthElement = document.getElementById('reportNetWorth');
      const netWorthValue = latest.net_worth || 0;
      netWorthElement.textContent = formatCurrency(netWorthValue);
      netWorthElement.className = netWorthValue >= 0 ? 'text-success' : 'text-danger';
    } else {
      // No data yet - show 0.00
      console.warn('[Reports] No snapshot data found, showing $0.00');
      document.getElementById('reportInvestments').textContent = '$0.00';
      document.getElementById('reportDebts').textContent = '$0.00';
      document.getElementById('reportNetWorth').textContent = '$0.00';
    }
    
    // Remove loading class and show values
    document.querySelectorAll('.summary-card.loading').forEach(card => {
      card.classList.remove('loading');
      const skeleton = card.querySelector('.skeleton-loader');
      const value = card.querySelector('h4');
      if (skeleton) skeleton.classList.add('d-none');
      if (value) value.classList.remove('d-none');
    });
  } catch (error) {
    console.error('[Reports] Error loading report summary:', error);
    // Keep default $0.00 values on error
    document.getElementById('reportInvestments').textContent = '$0.00';
    document.getElementById('reportDebts').textContent = '$0.00';
    document.getElementById('reportNetWorth').textContent = '$0.00';
    
    // Show empty state if error (likely no data)
    showEmptyState();
  }
}

// ===================================================================
// SHOW EMPTY STATE
// ===================================================================
function showEmptyState() {
  const dataContainer = document.getElementById('dataContainer');
  const emptyState = document.getElementById('reportEmptyState');
  
  if (dataContainer && emptyState) {
    dataContainer.style.display = 'none';
    emptyState.style.display = 'block';
  }
}

// ===================================================================
// INITIALIZE ALL REPORT CHARTS
// ===================================================================
async function initializeReportCharts() {
  try {
    // Chart functions already exist in charts.js
    // We just need to call them if their canvas elements exist
    
    if (document.getElementById('netWorthTimelineChart')) {
      if (typeof window.renderNetWorthChart === 'function') {
        await window.renderNetWorthChart();
        // Hide skeleton loader after chart renders
        document.getElementById('netWorthSkeleton')?.classList.add('d-none');
      } else {
        console.warn('[Reports] renderNetWorthChart function not found');
      }
    }
    
    if (document.getElementById('monthlyCashFlowChart')) {
      if (typeof window.generateMonthlyCashFlowChart === 'function') {
        await window.generateMonthlyCashFlowChart();
        // Hide skeleton loader after chart renders
        document.getElementById('monthlyCashFlowSkeleton')?.classList.add('d-none');
      } else {
        console.warn('[Reports] generateMonthlyCashFlowChart function not found');
      }
    }
    
    if (document.getElementById('spendingCategoriesChart')) {
      if (typeof window.renderAdditionalCharts === 'function') {
        // renderAdditionalCharts includes spendingCategories, savingsRate, and investmentGrowth
        await window.renderAdditionalCharts();
        // Hide skeleton loaders for all additional charts after render
        document.getElementById('spendingCategoriesSkeleton')?.classList.add('d-none');
        document.getElementById('savingsRateSkeleton')?.classList.add('d-none');
        document.getElementById('investmentGrowthSkeleton')?.classList.add('d-none');
      } else {
        console.warn('[Reports] renderAdditionalCharts function not found');
      }
    }
  } catch (error) {
    console.error('[Reports] Error initializing charts:', error);
  }
}

// ===================================================================
// EXPORT REPORTS DATA
// ===================================================================
function exportReportsData() {
  try {
    // Get values from summary cards
    const investmentsValue = document.getElementById('reportInvestments').textContent;
    const debtsValue = document.getElementById('reportDebts').textContent;
    const netWorthValue = document.getElementById('reportNetWorth').textContent;
    
    // Get current date for filename
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Create CSV content
    const csv = `Fireside Capital - Financial Report\n` +
                `Generated: ${dateStr}\n\n` +
                `Metric,Value\n` +
                `Total Investments,${investmentsValue}\n` +
                `Total Debts,${debtsValue}\n` +
                `Net Worth,${netWorthValue}\n`;
    
    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fireside-capital-report-${dateStr}.csv`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('[Reports] Error exporting reports data:', error);
    alert('Error exporting report. Please try again.');
  }
}

// ===================================================================
// EVENT LISTENERS
// ===================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on the reports page by looking for report-specific elements
  if (document.getElementById('reportInvestments')) {
    // Initialize the reports page
    initReportsPage();
    
    // Add export button handler
    const exportBtn = document.getElementById('exportReportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', exportReportsData);
    } else {
      console.warn('[Reports] Export button not found');
    }
  }
});

// Export functions for potential external use
window.initReportsPage = initReportsPage;
window.exportReportsData = exportReportsData;
