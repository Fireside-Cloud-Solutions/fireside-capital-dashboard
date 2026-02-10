// ===================================================================
// FIRESIDE CAPITAL - CHARTS MODULE (FC-011)
// Dashboard Data Visualization Improvements
// ===================================================================

// Chart instances storage
let chartInstances = {
  netWorth: null,
  cashFlow: null,
  netWorthDelta: null,
  spendingCategories: null,
  savingsRate: null,
  investmentGrowth: null,
  assetAllocation: null,
  dtiGauge: null
};

// Time range state (persisted in localStorage)
const TIME_RANGES = {
  '1M': { months: 1, label: '1 Month' },
  '3M': { months: 3, label: '3 Months' },
  '6M': { months: 6, label: '6 Months' },
  '1Y': { months: 12, label: '1 Year' },
  'All': { months: null, label: 'All Time' }
};

// Get stored time range or default to 6M
function getTimeRange(chartId) {
  const stored = localStorage.getItem(`timeRange_${chartId}`);
  return stored || '6M';
}

// Save time range preference
function setTimeRange(chartId, range) {
  localStorage.setItem(`timeRange_${chartId}`, range);
}

// Filter data based on time range
function filterDataByTimeRange(data, labels, range) {
  if (range === 'All' || !TIME_RANGES[range]) {
    return { data, labels };
  }
  
  const months = TIME_RANGES[range].months;
  const cutoffIndex = Math.max(0, data.length - months);
  
  return {
    data: data.slice(cutoffIndex),
    labels: labels.slice(cutoffIndex)
  };
}

// ===================================================================
// CHART.JS PERFORMANCE OPTIMIZATIONS (SPRINT-DEV 0615)
// ===================================================================

// Check if data decimation should be enabled (100+ data points)
function shouldEnableDecimation(dataLength) {
  return dataLength > 100;
}

// Get responsive legend position based on viewport
function getResponsiveLegendPosition() {
  return window.innerWidth < 768 ? 'bottom' : 'right';
}

// Update chart data without animation for instant time range changes
function updateChartData(chart, newData, newLabels, projectionData = null) {
  if (!chart) return;
  
  chart.data.labels = newLabels;
  chart.data.datasets[0].data = newData;
  
  // Update projection dataset if exists
  if (projectionData && chart.data.datasets.length > 1) {
    chart.data.datasets[1].data = projectionData;
  }
  
  // Update WITHOUT animation for instant response
  chart.update('none');
}

// Create time range filter buttons (optimized for instant updates)
function createTimeRangeFilter(chartId, onRangeChange, updateMode = 'full') {
  const currentRange = getTimeRange(chartId);
  
  const container = document.createElement('div');
  container.className = 'time-range-filter btn-group btn-group-sm mb-3';
  container.setAttribute('role', 'group');
  container.setAttribute('aria-label', 'Time range filter');
  
  Object.keys(TIME_RANGES).forEach(range => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `btn ${range === currentRange ? 'btn-primary' : 'btn-outline-secondary'}`;
    btn.textContent = range;
    btn.setAttribute('data-range', range);
    
    btn.addEventListener('click', () => {
      // Update active state
      container.querySelectorAll('.btn').forEach(b => {
        b.classList.remove('btn-primary');
        b.classList.add('btn-outline-secondary');
      });
      btn.classList.remove('btn-outline-secondary');
      btn.classList.add('btn-primary');
      
      // Save preference and trigger update
      setTimeRange(chartId, range);
      onRangeChange(range);
    });
    
    container.appendChild(btn);
  });
  
  return container;
}

// Enhanced tooltip configuration
function getEnhancedTooltipConfig(isCurrency = true) {
  return {
    backgroundColor: 'rgba(26, 26, 26, 0.95)',
    titleColor: '#ffffff',
    bodyColor: '#e0e0e0',
    borderColor: '#f44e24',
    borderWidth: 1,
    padding: 12,
    displayColors: true,
    callbacks: {
      label: function(context) {
        let label = context.dataset.label || '';
        if (label) {
          label += ': ';
        }
        if (isCurrency) {
          label += formatCurrency(context.parsed.y);
        } else {
          label += context.parsed.y.toFixed(2) + '%';
        }
        return label;
      },
      title: function(tooltipItems) {
        // Show full date for better context
        return tooltipItems[0].label;
      }
    }
  };
}

// ===================================================================
// NET WORTH OVER TIME CHART (with time range filter & projection)
// ===================================================================
async function renderNetWorthChart() {
  const ctx = document.getElementById('netWorthTimelineChart');
  if (!ctx) return;
  
  // Add time range filter if not already present
  const chartCard = ctx.closest('.chart-card');
  if (chartCard && !chartCard.querySelector('.time-range-filter')) {
    const filterContainer = document.createElement('div');
    filterContainer.className = 'd-flex justify-content-between align-items-center mb-2';
    
    const filter = createTimeRangeFilter('netWorth', (range) => {
      renderNetWorthChart();
    });
    
    filterContainer.appendChild(filter);
    const h5 = chartCard.querySelector('h5');
    h5.parentNode.insertBefore(filterContainer, h5.nextSibling);
  }
  
  if (chartInstances.netWorth) chartInstances.netWorth.destroy();
  
  const snaps = dedupeSnapshotsByDate(window.snapshots || []);
  const allLabels = snaps.map(s => s.date);
  const allData = snaps.map(s => getRaw(s.netWorth));
  
  // Apply time range filter
  const range = getTimeRange('netWorth');
  const filtered = filterDataByTimeRange(allData, allLabels, range);
  
  // Calculate net worth projection (12 months forward)
  const projectionLabels = [];
  const projectionData = [];
  
  if (filtered.data.length >= 2) {
    // Calculate average monthly change from available data
    const changes = [];
    for (let i = 1; i < filtered.data.length; i++) {
      changes.push(filtered.data[i] - filtered.data[i - 1]);
    }
    const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
    
    // Project 12 months forward
    const lastValue = filtered.data[filtered.data.length - 1];
    const lastDate = new Date(filtered.labels[filtered.labels.length - 1]);
    
    for (let i = 1; i <= 12; i++) {
      const futureDate = new Date(lastDate);
      futureDate.setMonth(futureDate.getMonth() + i);
      projectionLabels.push(futureDate.toISOString().split('T')[0]);
      projectionData.push(lastValue + (avgChange * i));
    }
  }
  
  const theme = getThemeColors();
  
  const datasets = [
    {
      label: 'Net Worth',
      data: filtered.data,
      borderColor: '#f44e24',
      backgroundColor: 'rgba(244, 78, 36, 0.15)',
      tension: 0.3,
      fill: true,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: '#f44e24',
      pointBorderColor: '#fff',
      pointBorderWidth: 2
    }
  ];
  
  // Add projection dataset if available
  if (projectionData.length > 0) {
    datasets.push({
      label: 'Projected (based on avg trend)',
      data: [...Array(filtered.data.length - 1).fill(null), filtered.data[filtered.data.length - 1], ...projectionData],
      borderColor: '#01a4ef',
      backgroundColor: 'transparent',
      borderDash: [5, 5],
      tension: 0.3,
      fill: false,
      pointRadius: 0,
      pointHoverRadius: 4
    });
  }
  
  chartInstances.netWorth = await safeCreateChart(ctx, {
    type: 'line',
    data: {
      labels: projectionData.length > 0 ? [...filtered.labels, ...projectionLabels] : filtered.labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      parsing: false, // Performance: disable parsing for faster rendering
      normalized: true, // Performance: data is pre-sorted
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        decimation: {
          enabled: shouldEnableDecimation(filtered.data.length),
          algorithm: 'lttb', // Largest-Triangle-Three-Buckets (best for time series)
          samples: 50, // Max data points to render
          threshold: 100 // Only enable if dataset has 100+ points
        },
        legend: {
          labels: { color: theme.text }
        },
        tooltip: getEnhancedTooltipConfig(true)
      },
      scales: {
        y: {
          ticks: {
            callback: v => formatCurrency(v),
            color: theme.text
          },
          grid: { color: theme.grid }
        },
        x: {
          ticks: { color: theme.text },
          grid: { display: false }
        }
      }
    }
  }, 'Net Worth Timeline');
}

// ===================================================================
// MONTHLY CASH FLOW CHART
// ===================================================================
async function generateMonthlyCashFlowChart() {
  const ctx = document.getElementById('cashFlowChart');
  if (!ctx) return;
  
  if (chartInstances.cashFlow) chartInstances.cashFlow.destroy();
  
  const theme = getThemeColors();
  const months = [];
  const incomeTotals = [];
  const expenseTotals = [];
  const today = new Date();
  
  for (let i = 0; i < 6; i++) {
    const monthStart = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + i + 1, 0);
    months.push(monthStart.toLocaleString('default', { month: 'short' }));
    
    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    
    const activeBillsForCashFlow = [...(window.bills || []), ...(window.sharedBillsForDisplay || [])].filter(b => {
      const dbStatus = (b.status || '').toLowerCase();
      if (dbStatus === 'paid_off' || dbStatus === 'cancelled') return false;
      const info = getBillFinancingInfo(b);
      if (info.isFinancing && info.status === 'paid_off') return false;
      return true;
    });
    
    [...(window.income || []), ...activeBillsForCashFlow, ...(window.debts || []).map(d => ({ ...d, amount: d.monthlyPayment, frequency: 'monthly' }))].forEach(item => {
      if (!item.nextDueDate || !item.frequency) return;
      
      const isIncome = (typeof item.type === 'string' && (item.type.toLowerCase() === 'w2' || item.type.toLowerCase() === '1099'));
      let amount = item.amount;
      
      if (item.isSharedWithMe) {
        // Amount is already the user's portion
      } else if (!isIncome && item.id) {
        const shareInfo = getShareInfoForBill(item.id);
        if (shareInfo && shareInfo.status === 'accepted') {
          amount = shareInfo.owner_amount;
        }
      }
      
      amount = getRaw(amount);
      let nextDate = new Date(item.nextDueDate + 'T00:00:00');
      let loopGuard = 0;
      
      while (nextDate < monthStart && nextDate.getFullYear() < today.getFullYear() + 2 && loopGuard < 1000) {
        try {
          nextDate = getNextDate(nextDate, item.frequency);
        } catch {
          break;
        }
        loopGuard++;
      }
      
      loopGuard = 0;
      while (nextDate <= monthEnd && loopGuard < 100) {
        if (isIncome) monthlyIncome += amount;
        else monthlyExpenses += amount;
        try {
          nextDate = getNextDate(nextDate, item.frequency);
        } catch {
          break;
        }
        loopGuard++;
      }
    });
    
    incomeTotals.push(monthlyIncome);
    expenseTotals.push(monthlyExpenses);
  }
  
  chartInstances.cashFlow = await safeCreateChart(ctx, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        {
          label: 'Income',
          data: incomeTotals,
          backgroundColor: '#81b900'
        },
        {
          label: 'Expenses',
          data: expenseTotals,
          backgroundColor: '#e53935'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      scales: {
        x: {
          stacked: false,
          ticks: { color: theme.text },
          grid: { display: false }
        },
        y: {
          stacked: false,
          ticks: {
            callback: v => formatCurrency(v),
            color: theme.text
          },
          grid: { color: theme.grid }
        }
      },
      plugins: {
        legend: { labels: { color: theme.text } },
        tooltip: getEnhancedTooltipConfig(true)
      }
    }
  }, 'Cash Flow');
}

// ===================================================================
// MONTHLY NET WORTH CHANGE CHART (with time range filter)
// ===================================================================
async function renderNetWorthDeltaChart() {
  const ctx = document.getElementById('netWorthDeltaChart');
  if (!ctx) return;
  
  // Add time range filter
  const chartCard = ctx.closest('.chart-card');
  if (chartCard && !chartCard.querySelector('.time-range-filter')) {
    const filterContainer = document.createElement('div');
    filterContainer.className = 'd-flex justify-content-between align-items-center mb-2';
    
    const filter = createTimeRangeFilter('netWorthDelta', (range) => {
      renderNetWorthDeltaChart();
    });
    
    filterContainer.appendChild(filter);
    const h5 = chartCard.querySelector('h5');
    h5.parentNode.insertBefore(filterContainer, h5.nextSibling);
  }
  
  if (chartInstances.netWorthDelta) chartInstances.netWorthDelta.destroy();
  
  const snaps = dedupeSnapshotsByDate(window.snapshots || []);
  const allDeltas = [];
  const allLabels = [];
  
  for (let i = 1; i < snaps.length; i++) {
    const delta = getRaw(snaps[i].netWorth) - getRaw(snaps[i - 1].netWorth);
    allDeltas.push(delta);
    allLabels.push(snaps[i].date);
  }
  
  // Apply time range filter
  const range = getTimeRange('netWorthDelta');
  const filtered = filterDataByTimeRange(allDeltas, allLabels, range);
  
  const theme = getThemeColors();
  
  chartInstances.netWorthDelta = await safeCreateChart(ctx, {
    type: 'bar',
    data: {
      labels: filtered.labels,
      datasets: [{
        label: 'Net Worth Change',
        data: filtered.data,
        backgroundColor: filtered.data.map(d => d >= 0 ? '#81b900' : '#e53935')
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: { display: false },
        tooltip: getEnhancedTooltipConfig(true)
      },
      scales: {
        y: {
          ticks: {
            callback: v => formatCurrency(v),
            color: theme.text
          },
          grid: { color: theme.grid }
        },
        x: {
          ticks: { color: theme.text },
          grid: { display: false }
        }
      }
    }
  }, 'Net Worth Delta');
}

// ===================================================================
// SAVINGS RATE OVER TIME CHART (with time range filter)
// ===================================================================
async function renderSavingsRateChart() {
  const ctx = document.getElementById('savingsRateChart');
  if (!ctx) return;
  
  // Add time range filter
  const chartCard = ctx.closest('.chart-card');
  if (chartCard && !chartCard.querySelector('.time-range-filter')) {
    const filterContainer = document.createElement('div');
    filterContainer.className = 'd-flex justify-content-between align-items-center mb-2';
    
    const filter = createTimeRangeFilter('savingsRate', (range) => {
      renderSavingsRateChart();
    });
    
    filterContainer.appendChild(filter);
    const h5 = chartCard.querySelector('h5');
    h5.parentNode.insertBefore(filterContainer, h5.nextSibling);
  }
  
  if (chartInstances.savingsRate) chartInstances.savingsRate.destroy();
  
  const today = new Date();
  const allSavingsLabels = [];
  const allSavingsData = [];
  
  for (let i = 0; i < 12; i++) {
    const monthStart = new Date(today.getFullYear(), today.getMonth() - (11 - i), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() - (11 - i) + 1, 0);
    allSavingsLabels.push(monthStart.toLocaleString('default', { month: 'short', year: 'numeric' }));
    
    let monthIncome = 0;
    let monthExpenses = 0;
    
    [...(window.income || []), ...(window.bills || []), ...(window.debts || []).map(d => ({ ...d, amount: d.monthlyPayment, frequency: 'monthly' }))].forEach(item => {
      if (!item.nextDueDate || !item.frequency) return;
      const isIncome = (typeof item.type === 'string' && (item.type.toLowerCase() === 'w2' || item.type.toLowerCase() === '1099'));
      let amount = getRaw(item.amount);
      
      let nextDate = new Date(item.nextDueDate + 'T00:00:00');
      let safety = 0;
      while (nextDate < monthStart && safety < 1000) {
        nextDate = getNextDate(nextDate, item.frequency);
        safety++;
      }
      
      safety = 0;
      while (nextDate <= monthEnd && safety < 100) {
        if (isIncome) monthIncome += amount;
        else monthExpenses += amount;
        nextDate = getNextDate(nextDate, item.frequency);
        safety++;
      }
    });
    
    const rate = monthIncome > 0 ? ((monthIncome - monthExpenses) / monthIncome) * 100 : 0;
    allSavingsData.push(isNaN(rate) || !isFinite(rate) ? 0 : Math.round(rate));
  }
  
  // Apply time range filter
  const range = getTimeRange('savingsRate');
  const filtered = filterDataByTimeRange(allSavingsData, allSavingsLabels, range);
  
  const theme = getThemeColors();
  
  chartInstances.savingsRate = await safeCreateChart(ctx, {
    type: 'line',
    data: {
      labels: filtered.labels,
      datasets: [{
        label: 'Savings Rate %',
        data: filtered.data,
        fill: true,
        borderColor: '#81b900',
        backgroundColor: 'rgba(129, 185, 0, 0.15)',
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#81b900',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: { labels: { color: theme.text } },
        tooltip: getEnhancedTooltipConfig(false)
      },
      scales: {
        y: {
          ticks: {
            callback: v => v + '%',
            color: theme.text
          },
          grid: { color: theme.grid }
        },
        x: {
          ticks: { color: theme.text },
          grid: { display: false }
        }
      }
    }
  }, 'Savings Rate');
}

// ===================================================================
// INVESTMENT GROWTH OVER TIME CHART (with time range filter)
// ===================================================================
async function renderInvestmentGrowthChart() {
  const ctx = document.getElementById('investmentGrowthChart');
  if (!ctx) return;
  
  // Add time range filter
  const chartCard = ctx.closest('.chart-card');
  if (chartCard && !chartCard.querySelector('.time-range-filter')) {
    const filterContainer = document.createElement('div');
    filterContainer.className = 'd-flex justify-content-between align-items-center mb-2';
    
    const filter = createTimeRangeFilter('investmentGrowth', (range) => {
      renderInvestmentGrowthChart();
    });
    
    filterContainer.appendChild(filter);
    const h5 = chartCard.querySelector('h5');
    h5.parentNode.insertBefore(filterContainer, h5.nextSibling);
  }
  
  if (chartInstances.investmentGrowth) chartInstances.investmentGrowth.destroy();
  
  const investments = window.investments || [];
  const now = new Date();
  const allInvestLabels = [];
  const allInvestData = [];
  
  const totalCurrentInvestments = investments.reduce((sum, inv) => sum + parseFloat(inv.value || 0), 0);
  const weightedReturn = totalCurrentInvestments > 0
    ? investments.reduce((sum, inv) => sum + (parseFloat(inv.value || 0) * parseFloat(inv.annualReturn || 0)), 0) / totalCurrentInvestments
    : 0;
  const monthlyReturn = weightedReturn / 100 / 12;
  const totalMonthlyContribution = investments.reduce((sum, inv) => sum + parseFloat(inv.monthlyContribution || 0), 0);
  
  // Generate 12 months of data
  allInvestData.push(totalCurrentInvestments);
  allInvestLabels.push(now.toLocaleString('default', { month: 'short' }));
  
  for (let i = 1; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    allInvestLabels.push(d.toLocaleString('default', { month: 'short' }));
    const prev = allInvestData[i - 1];
    allInvestData.push(Math.round(prev * (1 + monthlyReturn) + totalMonthlyContribution));
  }
  
  // Apply time range filter
  const range = getTimeRange('investmentGrowth');
  const filtered = filterDataByTimeRange(allInvestData, allInvestLabels, range);
  
  const theme = getThemeColors();
  
  chartInstances.investmentGrowth = await safeCreateChart(ctx, {
    type: 'line',
    data: {
      labels: filtered.labels,
      datasets: [{
        label: 'Projected Value',
        data: filtered.data,
        fill: true,
        borderColor: '#f44e24',
        backgroundColor: 'rgba(244, 78, 36, 0.15)',
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#f44e24',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: { labels: { color: theme.text } },
        tooltip: getEnhancedTooltipConfig(true)
      },
      scales: {
        y: {
          ticks: {
            callback: v => formatCurrency(v),
            color: theme.text
          },
          grid: { color: theme.grid }
        },
        x: {
          ticks: { color: theme.text },
          grid: { display: false }
        }
      }
    }
  }, 'Investment Growth');
}

// ===================================================================
// TOP SPENDING CATEGORIES CHART (with clickable interactions)
// ===================================================================
async function renderSpendingCategoriesChart() {
  const ctx = document.getElementById('spendingCategoriesChart');
  if (!ctx) return;
  
  if (chartInstances.spendingCategories) chartInstances.spendingCategories.destroy();
  
  const categoryTotals = {};
  [...(window.bills || []), ...(window.debts || []).map(d => ({ ...d, amount: d.monthlyPayment, type: 'Debt Payment' }))].forEach(item => {
    const type = item.type || 'Other';
    const amount = getRaw(item.amount);
    categoryTotals[type] = (categoryTotals[type] || 0) + amount;
  });
  
  const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const labels = sorted.map(s => s[0]);
  const data = sorted.map(s => s[1]);
  
  const colors = ['#f44e24', '#01a4ef', '#81b900', '#ffa726', '#ab47bc', '#26c6da'];
  
  const theme = getThemeColors();
  
  chartInstances.spendingCategories = await safeCreateChart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: getResponsiveLegendPosition(), // Responsive: bottom on mobile, right on desktop
          labels: {
            color: theme.text,
            font: {
              size: window.innerWidth < 768 ? 11 : 14, // Smaller on mobile
              weight: '500' // Bolder text for better contrast
            },
            padding: window.innerWidth < 768 ? 10 : 20, // Less padding on mobile
            boxWidth: window.innerWidth < 768 ? 15 : 20, // Smaller boxes on mobile
            boxHeight: window.innerWidth < 768 ? 15 : 20,
            generateLabels: (chart) => {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                return data.labels.map((label, i) => {
                  const value = data.datasets[0].data[i];
                  const percentage = ((value / total) * 100).toFixed(1);
                  return {
                    text: `${label}: ${formatCurrency(value)} (${percentage}%)`,
                    fillStyle: data.datasets[0].backgroundColor[i],
                    hidden: false,
                    index: i
                  };
                });
              }
              return [];
            }
          }
        },
        tooltip: {
          ...getEnhancedTooltipConfig(true),
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${formatCurrency(value)} (${percentage}%)`;
            }
          }
        }
      },
      onClick: (event, elements) => {
        if (elements.length > 0) {
          const index = elements[0].index;
          const category = labels[index];
          const amount = data[index];
          alert(`${category}\n\nMonthly Total: ${formatCurrency(amount)}\n\nClick on a specific bill or debt to view details.`);
        }
      }
    }
  }, 'Spending Categories');
}

// ===================================================================
// ASSET ALLOCATION PIE CHART (NEW)
// ===================================================================
async function renderAssetAllocationChart() {
  const ctx = document.getElementById('assetAllocationChart');
  if (!ctx) return;
  
  if (chartInstances.assetAllocation) chartInstances.assetAllocation.destroy();
  
  const assets = window.assets || [];
  const allocation = {
    'Real Estate': 0,
    'Vehicles': 0,
    'Other': 0
  };
  
  assets.forEach(asset => {
    const value = getRaw(asset.value);
    if (asset.type === 'realEstate') {
      allocation['Real Estate'] += value;
    } else if (asset.type === 'vehicle') {
      allocation['Vehicles'] += value;
    } else {
      allocation['Other'] += value;
    }
  });
  
  const labels = Object.keys(allocation).filter(k => allocation[k] > 0);
  const data = labels.map(k => allocation[k]);
  const colors = {
    'Real Estate': '#01a4ef',
    'Vehicles': '#ffa726',
    'Other': '#9e9e9e'
  };
  
  const theme = getThemeColors();
  
  // Handle empty state
  if (data.length === 0 || data.every(d => d === 0)) {
    ctx.parentElement.innerHTML = '<p class="text-muted text-center">No assets to display. Add assets to see allocation.</p>';
    return;
  }
  
  chartInstances.assetAllocation = await safeCreateChart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: labels.map(l => colors[l]),
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: theme.text,
            padding: 15,
            font: { size: 12 },
            generateLabels: (chart) => {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                return data.labels.map((label, i) => {
                  const value = data.datasets[0].data[i];
                  const percentage = ((value / total) * 100).toFixed(1);
                  return {
                    text: `${label}: ${formatCurrency(value)} (${percentage}%)`,
                    fillStyle: data.datasets[0].backgroundColor[i],
                    hidden: false,
                    index: i
                  };
                });
              }
              return [];
            }
          }
        },
        tooltip: getEnhancedTooltipConfig(true)
      }
    }
  }, 'Asset Allocation');
}

// ===================================================================
// DEBT-TO-INCOME RATIO GAUGE (NEW)
// ===================================================================
async function renderDTIGauge() {
  const ctx = document.getElementById('dtiGaugeChart');
  if (!ctx) return;
  
  if (chartInstances.dtiGauge) chartInstances.dtiGauge.destroy();
  
  // Calculate total monthly debt payments
  const debts = window.debts || [];
  const bills = window.bills || [];
  
  let totalMonthlyDebt = 0;
  
  // Add debt monthly payments
  debts.forEach(debt => {
    totalMonthlyDebt += getRaw(debt.monthlyPayment);
  });
  
  // Add bills that are debt-related (loans, financing)
  bills.forEach(bill => {
    if (bill.type && (bill.type.toLowerCase().includes('loan') || bill.type.toLowerCase().includes('financing'))) {
      totalMonthlyDebt += normalizeToMonthly(getRaw(bill.amount), bill.frequency);
    }
  });
  
  // Calculate total monthly income
  const income = window.income || [];
  let totalMonthlyIncome = 0;
  
  income.forEach(inc => {
    totalMonthlyIncome += normalizeToMonthly(getRaw(inc.amount), inc.frequency);
  });
  
  // Calculate DTI ratio
  const dtiRatio = totalMonthlyIncome > 0 ? (totalMonthlyDebt / totalMonthlyIncome) * 100 : 0;
  const dtiRounded = Math.round(dtiRatio);
  
  // Determine color based on DTI thresholds
  let gaugeColor, statusText;
  if (dtiRatio < 20) {
    gaugeColor = '#81b900'; // Good (green)
    statusText = 'Excellent';
  } else if (dtiRatio < 36) {
    gaugeColor = '#ffa726'; // Warning (yellow/orange)
    statusText = 'Manageable';
  } else {
    gaugeColor = '#e53935'; // Danger (red)
    statusText = 'High';
  }
  
  const theme = getThemeColors();
  
  // Create gauge as semi-doughnut
  chartInstances.dtiGauge = await safeCreateChart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['DTI Ratio', 'Available'],
      datasets: [{
        data: [dtiRounded, Math.max(0, 100 - dtiRounded)],
        backgroundColor: [gaugeColor, theme.grid],
        borderWidth: 0,
        circumference: 180,
        rotation: 270
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      }
    },
    plugins: [{
      id: 'gaugeText',
      afterDraw: (chart) => {
        const { ctx, chartArea: { left, right, top, bottom } } = chart;
        const centerX = (left + right) / 2;
        const centerY = bottom - 20;
        
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Main value
        ctx.font = 'bold 32px Inter';
        ctx.fillStyle = gaugeColor;
        ctx.fillText(`${dtiRounded}%`, centerX, centerY - 25);
        
        // Status label
        ctx.font = '14px Inter';
        ctx.fillStyle = theme.text;
        ctx.fillText(statusText, centerX, centerY);
        
        ctx.restore();
      }
    }]
  }, 'DTI Gauge');
  
  // Add descriptive text below the gauge
  const wrapper = ctx.closest('.chart-wrapper');
  if (wrapper && !wrapper.querySelector('.dti-description')) {
    const desc = document.createElement('div');
    desc.className = 'dti-description text-center mt-3';
    desc.innerHTML = `
      <p class="text-muted mb-1" style="font-size: 12px;">
        Monthly Debt: ${formatCurrency(totalMonthlyDebt)} / Income: ${formatCurrency(totalMonthlyIncome)}
      </p>
      <p class="text-muted" style="font-size: 11px;">
        <strong>Good:</strong> &lt;20% | <strong>Warning:</strong> 20-36% | <strong>High:</strong> &gt;36%
      </p>
    `;
    wrapper.appendChild(desc);
  }
}

// ===================================================================
// RENDER ALL ADDITIONAL CHARTS
// ===================================================================
async function renderAdditionalCharts() {
  await renderNetWorthDeltaChart();
  await renderSpendingCategoriesChart();
  await renderSavingsRateChart();
  await renderInvestmentGrowthChart();
  await renderAssetAllocationChart();
  await renderDTIGauge();
}

// Export functions for use in app.js
window.renderNetWorthChart = renderNetWorthChart;
window.generateMonthlyCashFlowChart = generateMonthlyCashFlowChart;
window.renderAdditionalCharts = renderAdditionalCharts;
