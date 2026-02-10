/* =================================================================
   Fireside Capital — Chart.js Configuration
   Default settings and theme integration for all charts
   Version: 1.0 | February 2026
   ================================================================= */

/**
 * Chart.js Default Configuration
 * Integrates with Fireside Capital design tokens and provides
 * consistent styling across all financial charts
 */

// Get CSS custom property value
function getCSSVar(name) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

// Convert RGB custom property to rgba
function getRGBA(rgbVar, alpha = 1) {
  const rgb = getCSSVar(rgbVar);
  return `rgba(${rgb}, ${alpha})`;
}

// Currency formatter
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

const currencyFormatterPrecise = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

// Number formatter (for percentages, counts)
const numberFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

// Percentage formatter
const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
});

/**
 * Default Chart.js Configuration
 * Apply to all charts for consistent theming
 */
const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  
  // Animation settings
  animation: {
    duration: 500,
    easing: 'easeInOutQuart'
  },
  
  // Interaction settings
  interaction: {
    mode: 'index',
    intersect: false
  },
  
  // Plugin defaults
  plugins: {
    // Legend configuration
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        color: getCSSVar('--color-text-primary'),
        font: {
          family: getCSSVar('--font-body'),
          size: 12,
          weight: 500
        },
        padding: 16,
        usePointStyle: true,
        pointStyle: 'circle',
        boxWidth: 8,
        boxHeight: 8
      }
    },
    
    // Tooltip configuration
    tooltip: {
      backgroundColor: getCSSVar('--color-bg-2'),
      titleColor: getCSSVar('--color-text-primary'),
      bodyColor: getCSSVar('--color-text-secondary'),
      borderColor: getCSSVar('--color-border-default'),
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      displayColors: true,
      boxWidth: 12,
      boxHeight: 12,
      boxPadding: 6,
      usePointStyle: true,
      titleFont: {
        family: getCSSVar('--font-body'),
        size: 13,
        weight: 600
      },
      bodyFont: {
        family: getCSSVar('--font-body'),
        size: 12,
        weight: 400
      },
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          // Format as currency by default
          if (context.parsed.y !== null && context.parsed.y !== undefined) {
            label += currencyFormatter.format(context.parsed.y);
          }
          return label;
        }
      }
    }
  },
  
  // Scale defaults
  scales: {
    x: {
      grid: {
        color: getRGBA('--color-border-subtle-rgb', 0.3),
        drawBorder: false,
        drawTicks: false
      },
      ticks: {
        color: getCSSVar('--color-text-secondary'),
        font: {
          family: getCSSVar('--font-body'),
          size: 11,
          weight: 400
        },
        padding: 8
      },
      border: {
        display: false
      }
    },
    y: {
      grid: {
        color: getRGBA('--color-border-subtle-rgb', 0.3),
        drawBorder: false,
        drawTicks: false
      },
      ticks: {
        color: getCSSVar('--color-text-secondary'),
        font: {
          family: getCSSVar('--font-body'),
          size: 11,
          weight: 400
        },
        padding: 8,
        callback: function(value) {
          return currencyFormatter.format(value);
        }
      },
      border: {
        display: false
      }
    }
  }
};

/**
 * Chart Color Palettes
 * Based on Fireside Capital brand colors
 */
const chartColors = {
  // Primary palette (for main data series)
  primary: [
    getCSSVar('--color-primary'),      // Flame Orange
    getCSSVar('--color-secondary'),    // Sky Blue
    getCSSVar('--color-accent'),       // Lime Green
    getCSSVar('--color-tertiary'),     // Neutral Gray
  ],
  
  // Extended palette (for multi-series charts)
  extended: [
    getCSSVar('--color-primary'),
    getCSSVar('--color-secondary'),
    getCSSVar('--color-accent'),
    '#ffc107', // Amber
    '#9c27b0', // Purple
    '#00bcd4', // Cyan
    '#ff9800', // Deep Orange
    '#4caf50', // Green
  ],
  
  // Semantic colors
  positive: getCSSVar('--color-accent'),
  negative: getCSSVar('--color-danger'),
  neutral: getCSSVar('--color-text-secondary'),
  
  // Income vs Expense
  income: getCSSVar('--color-accent'),
  expense: getCSSVar('--color-primary'),
  
  // Asset categories
  assets: getCSSVar('--color-accent'),
  liabilities: getCSSVar('--color-danger'),
  equity: getCSSVar('--color-secondary'),
  
  // Transparent versions (for area fills)
  primaryAlpha: (alpha = 0.2) => getRGBA('--color-primary-rgb', alpha),
  secondaryAlpha: (alpha = 0.2) => getRGBA('--color-secondary-rgb', alpha),
  accentAlpha: (alpha = 0.2) => getRGBA('--color-accent-rgb', alpha),
};

/**
 * Preset Chart Configurations
 */
const chartPresets = {
  /**
   * Line Chart - For trends over time (net worth, balance history)
   */
  line: (options = {}) => ({
    type: 'line',
    options: {
      ...chartDefaults,
      ...options,
      scales: {
        ...chartDefaults.scales,
        ...(options.scales || {})
      },
      plugins: {
        ...chartDefaults.plugins,
        ...(options.plugins || {})
      }
    }
  }),
  
  /**
   * Bar Chart - For comparisons (monthly spending, category breakdown)
   */
  bar: (options = {}) => ({
    type: 'bar',
    options: {
      ...chartDefaults,
      ...options,
      scales: {
        ...chartDefaults.scales,
        x: {
          ...chartDefaults.scales.x,
          grid: {
            ...chartDefaults.scales.x.grid,
            display: false // Hide vertical grid lines for bar charts
          }
        },
        ...(options.scales || {})
      },
      plugins: {
        ...chartDefaults.plugins,
        ...(options.plugins || {})
      }
    }
  }),
  
  /**
   * Doughnut Chart - For allocation (asset allocation, budget breakdown)
   */
  doughnut: (options = {}) => ({
    type: 'doughnut',
    options: {
      ...chartDefaults,
      cutout: '70%',
      ...options,
      plugins: {
        ...chartDefaults.plugins,
        legend: {
          ...chartDefaults.plugins.legend,
          position: 'right',
          ...(options.plugins?.legend || {})
        },
        tooltip: {
          ...chartDefaults.plugins.tooltip,
          callbacks: {
            label: function(context) {
              let label = context.label || '';
              if (label) {
                label += ': ';
              }
              const value = context.parsed;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              label += currencyFormatter.format(value);
              label += ` (${percentage}%)`;
              return label;
            }
          },
          ...(options.plugins?.tooltip || {})
        },
        ...(options.plugins || {})
      }
    }
  }),
  
  /**
   * Area Chart - For stacked trends (income vs expenses)
   */
  area: (options = {}) => ({
    type: 'line',
    options: {
      ...chartDefaults,
      ...options,
      elements: {
        line: {
          fill: true,
          tension: 0.4
        }
      },
      plugins: {
        ...chartDefaults.plugins,
        filler: {
          propagate: false
        },
        ...(options.plugins || {})
      }
    }
  })
};

/**
 * Helper Functions
 */

/**
 * Create gradient for area charts
 */
function createGradient(ctx, colorStart, colorEnd, alpha = 0.3) {
  const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
  gradient.addColorStop(0, colorStart.replace(')', `, ${alpha})`).replace('rgb', 'rgba'));
  gradient.addColorStop(1, (colorEnd || colorStart).replace(')', ', 0)').replace('rgb', 'rgba'));
  return gradient;
}

/**
 * Format axis labels by type
 */
const axisFormatters = {
  currency: (value) => currencyFormatter.format(value),
  currencyPrecise: (value) => currencyFormatterPrecise.format(value),
  number: (value) => numberFormatter.format(value),
  percent: (value) => percentFormatter.format(value / 100),
  month: (value) => new Date(value).toLocaleDateString('en-US', { month: 'short' }),
  monthYear: (value) => new Date(value).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
  shortDate: (value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
};

/**
 * Apply axis formatter
 */
function applyAxisFormatter(chartOptions, axis, formatterName) {
  const formatter = axisFormatters[formatterName];
  if (!formatter) {
    console.warn(`Unknown axis formatter: ${formatterName}`);
    return chartOptions;
  }
  
  if (!chartOptions.scales) chartOptions.scales = {};
  if (!chartOptions.scales[axis]) chartOptions.scales[axis] = {};
  if (!chartOptions.scales[axis].ticks) chartOptions.scales[axis].ticks = {};
  
  chartOptions.scales[axis].ticks.callback = formatter;
  
  return chartOptions;
}

/**
 * Update chart data with animation
 */
function updateChartData(chart, newData) {
  chart.data = newData;
  chart.update('active');
}

/**
 * Destroy and recreate chart (for major config changes)
 */
function recreateChart(canvasId, config) {
  const existingChart = Chart.getChart(canvasId);
  if (existingChart) {
    existingChart.destroy();
  }
  
  const ctx = document.getElementById(canvasId).getContext('2d');
  return new Chart(ctx, config);
}

/**
 * Export for use in other scripts
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    chartDefaults,
    chartColors,
    chartPresets,
    axisFormatters,
    applyAxisFormatter,
    updateChartData,
    recreateChart,
    createGradient,
    currencyFormatter,
    currencyFormatterPrecise,
    numberFormatter,
    percentFormatter
  };
}

// Make available globally
window.FiresideCharts = {
  defaults: chartDefaults,
  colors: chartColors,
  presets: chartPresets,
  formatters: axisFormatters,
  utils: {
    applyAxisFormatter,
    updateChartData,
    recreateChart,
    createGradient
  },
  format: {
    currency: currencyFormatter,
    currencyPrecise: currencyFormatterPrecise,
    number: numberFormatter,
    percent: percentFormatter
  }
};

console.log('✅ Fireside Capital Chart Configuration loaded');
