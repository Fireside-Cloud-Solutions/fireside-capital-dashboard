/**
 * Chart.js Global Theme Configuration
 * Fireside Capital Dashboard
 * 
 * Syncs Chart.js defaults with CSS design tokens for consistent dark theme.
 * Load this AFTER Chart.js but BEFORE creating any charts.
 * 
 * Usage:
 *   <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
 *   <script src="assets/js/chart-theme.js"></script>
 */

(function() {
  'use strict';

  if (typeof Chart === 'undefined') {
    console.warn('Chart.js not loaded — chart-theme.js must load after Chart.js');
    return;
  }

  const rootStyles = getComputedStyle(document.documentElement);
  
  /**
   * Helper: Get CSS custom property value
   * @param {string} property - CSS variable name (e.g., '--color-text-primary')
   * @returns {string} Computed value (trimmed)
   */
  function getToken(property) {
    return rootStyles.getPropertyValue(property).trim();
  }

  // ===== GLOBAL DEFAULTS =====
  Chart.defaults.color = getToken('--color-text-secondary');
  Chart.defaults.borderColor = getToken('--color-border-subtle');
  Chart.defaults.backgroundColor = getToken('--color-bg-2');
  Chart.defaults.font.family = getToken('--font-body');
  Chart.defaults.font.size = 13;

  // ===== PERFORMANCE DEFAULTS =====
  // Assume data is pre-formatted in internal format
  Chart.defaults.parsing = false;
  Chart.defaults.normalized = true;
  
  // Disable animations for financial dashboards (faster render)
  Chart.defaults.animation = false;

  // ===== LEGEND =====
  Chart.defaults.plugins.legend.labels.color = getToken('--color-text-secondary');
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.legend.labels.padding = 16;
  Chart.defaults.plugins.legend.labels.font = {
    size: 13,
    weight: '500',
    family: getToken('--font-body')
  };

  // ===== TOOLTIP =====
  Chart.defaults.plugins.tooltip.enabled = true;
  Chart.defaults.plugins.tooltip.backgroundColor = getToken('--color-bg-3');
  Chart.defaults.plugins.tooltip.borderColor = getToken('--color-border-default');
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.plugins.tooltip.titleColor = getToken('--color-text-primary');
  Chart.defaults.plugins.tooltip.bodyColor = getToken('--color-text-secondary');
  Chart.defaults.plugins.tooltip.padding = 12;
  Chart.defaults.plugins.tooltip.cornerRadius = 8;
  Chart.defaults.plugins.tooltip.displayColors = true;
  Chart.defaults.plugins.tooltip.boxPadding = 6;
  Chart.defaults.plugins.tooltip.titleFont = {
    size: 14,
    weight: '600',
    family: getToken('--font-body')
  };
  Chart.defaults.plugins.tooltip.bodyFont = {
    size: 13,
    weight: '400',
    family: getToken('--font-body')
  };

  // Custom tooltip callbacks for financial formatting
  Chart.defaults.plugins.tooltip.callbacks = {
    label: function(context) {
      let label = context.dataset.label || '';
      if (label) {
        label += ': ';
      }
      
      // Format as currency if value looks like money
      if (context.parsed.y !== null && typeof context.parsed.y === 'number') {
        label += new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(context.parsed.y);
      }
      
      return label;
    }
  };

  // ===== TITLE =====
  Chart.defaults.plugins.title.color = getToken('--color-text-primary');
  Chart.defaults.plugins.title.font = {
    size: 16,
    weight: '600',
    family: getToken('--font-heading')
  };
  Chart.defaults.plugins.title.padding = {
    top: 16,
    bottom: 16
  };

  // ===== AXES (for line/bar charts) =====
  Chart.defaults.scale.grid.color = getToken('--color-border-subtle');
  Chart.defaults.scale.grid.lineWidth = 1;
  Chart.defaults.scale.ticks.color = getToken('--color-text-tertiary');
  Chart.defaults.scale.ticks.font = {
    size: 12,
    weight: '400',
    family: getToken('--font-body')
  };

  // Format Y-axis as currency
  Chart.defaults.scales.linear.ticks.callback = function(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // ===== FINANCIAL COLOR PALETTE =====
  // Export as global for chart creation scripts
  window.firesideChartColors = {
    // Brand colors (from design tokens)
    primary: getToken('--color-primary'),         // Flame Orange
    secondary: getToken('--color-secondary'),     // Sky Blue
    accent: getToken('--color-accent'),           // Lime Green
    
    // Semantic colors
    danger: getToken('--color-danger'),           // Red
    warning: getToken('--color-warning'),         // Amber
    success: getToken('--color-success'),         // Lime Green
    info: getToken('--color-info'),               // Sky Blue
    
    // Financial states
    positive: getToken('--color-accent'),         // Income/Gains
    negative: getToken('--color-danger'),         // Expenses/Losses
    neutral: getToken('--color-text-tertiary'),   // Zero/Neutral
    
    // Chart series (for multi-line/bar charts)
    series: [
      getToken('--color-primary'),      // Orange
      getToken('--color-secondary'),    // Blue
      getToken('--color-accent'),       // Green
      getToken('--color-warning'),      // Amber
      '#9333ea',                         // Purple
      '#ec4899',                         // Pink
      '#14b8a6',                         // Teal
      '#f59e0b'                          // Yellow
    ],
    
    // Transparent variants (for area charts)
    primaryAlpha: 'rgba(244, 78, 36, 0.2)',
    secondaryAlpha: 'rgba(1, 164, 239, 0.2)',
    accentAlpha: 'rgba(129, 185, 0, 0.2)',
    dangerAlpha: 'rgba(220, 53, 69, 0.2)',
  };

  // ===== RESPONSIVE CONFIGURATION =====
  Chart.defaults.responsive = true;
  Chart.defaults.maintainAspectRatio = true;
  Chart.defaults.aspectRatio = 2; // Default 2:1 (width:height)

  // ===== ANIMATION =====
  Chart.defaults.animation.duration = 400;
  Chart.defaults.animation.easing = 'easeOutQuart';

  // Respect reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    Chart.defaults.animation = false;
  }

  // ===== INTERACTION =====
  Chart.defaults.interaction.mode = 'index';
  Chart.defaults.interaction.intersect = false;

  console.log('✅ Fireside Capital Chart.js theme loaded');
})();
