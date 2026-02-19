/**
 * chart-factory.js — Fireside Capital
 * Centralized chart creation with built-in optimizations.
 *
 * Implements:
 *   FC-095 — createOptimizedChart() factory
 *   FC-094 — prepareTimeSeriesData() timestamp pre-parsing (62% faster)
 *   FC-097 — updateAllChartThemes() dark/light mode color sync
 *   FC-177 — renderChartsParallel() parallel chart rendering
 *   FC-178 — Fixed tick rotation applied automatically (42% faster)
 *
 * Load order: after app.js (provides safeCreateChart) + before charts.js
 *
 * Usage:
 *   const chart = await createOptimizedChart(ctx, config);
 *   const chart = await createOptimizedChart(ctx, config, { decimation: true, samples: 180 });
 */

(function (global) {
  'use strict';

  // ─────────────────────────────────────────────────────────────
  // FC-094 — Timestamp Pre-Parsing
  // Converts date strings to numeric timestamps before handing to
  // Chart.js, enabling parsing: false + normalized: true (62% faster).
  // ─────────────────────────────────────────────────────────────

  /**
   * Prepare time-series data for Chart.js with pre-parsed timestamps.
   *
   * @param {Array<Object>} rawData     Source array
   * @param {string}        dateField   Property name holding the date value
   * @param {string|string[]} valueField Property name(s) for the numeric value(s)
   * @returns {{ x: number, y: number }[]} Chart-ready data points
   *
   * @example
   *   const points = prepareTimeSeriesData(snapshots, 'date', 'netWorth');
   *   // → [{ x: 1706745600000, y: 142000 }, …]
   */
  function prepareTimeSeriesData(rawData, dateField, valueField) {
    if (!Array.isArray(rawData) || rawData.length === 0) return [];

    return rawData
      .filter(row => row[dateField] != null && row[valueField] != null)
      .map(row => ({
        x: typeof row[dateField] === 'number'
          ? row[dateField]
          : new Date(row[dateField]).getTime(),
        y: parseFloat(row[valueField]) || 0
      }))
      .sort((a, b) => a.x - b.x);   // ensure sorted (normalized: true is safe)
  }

  /**
   * Prepare multi-field time-series data (e.g., income + expenses on same axis).
   *
   * @param {Array<Object>} rawData    Source array
   * @param {string}        dateField  Property holding the date
   * @param {string[]}      valueFields Array of property names to extract
   * @returns {{ x: number, [field]: number }[]}
   */
  function prepareMultiSeriesData(rawData, dateField, valueFields) {
    if (!Array.isArray(rawData) || rawData.length === 0) return [];

    return rawData
      .filter(row => row[dateField] != null)
      .map(row => {
        const point = { x: typeof row[dateField] === 'number'
          ? row[dateField]
          : new Date(row[dateField]).getTime() };
        valueFields.forEach(f => { point[f] = parseFloat(row[f]) || 0; });
        return point;
      })
      .sort((a, b) => a.x - b.x);
  }

  // ─────────────────────────────────────────────────────────────
  // FC-095 — createOptimizedChart() Factory
  // ─────────────────────────────────────────────────────────────

  /**
   * Default optimization flags.
   * All can be overridden per call via the `options` parameter.
   */
  const FACTORY_DEFAULTS = {
    // Decimation (FC-096): reduce data points for line charts > 100pts
    decimation: false,
    decimationAlgorithm: 'lttb',
    samples: 365,                 // target sample count after decimation

    // Tick rotation (FC-178): skip auto-calculation, always 0°
    fixedRotation: true,
    tickSampleSize: 10,           // measure 10 labels instead of all

    // Mobile (FC-098): auto-detect and strip heavy features on small screens
    mobileOptimize: true,
    mobileBreakpoint: 768,

    // Point rendering: suppress points for large datasets
    suppressPointsThreshold: 100, // hide points when > N data points

    // pre-parsed timestamps: tell Chart.js to skip parsing
    preFormatted: false,          // set true when using prepareTimeSeriesData()
  };

  /**
   * Is the viewport mobile-sized?
   * @returns {boolean}
   */
  function _isMobile() {
    return window.innerWidth < FACTORY_DEFAULTS.mobileBreakpoint;
  }

  /**
   * Deep-merge two plain objects (non-recursive arrays replaced, objects merged).
   */
  function _deepMerge(target, source) {
    if (!source || typeof source !== 'object') return target;
    const out = Object.assign({}, target);
    Object.keys(source).forEach(k => {
      if (source[k] && typeof source[k] === 'object' && !Array.isArray(source[k])) {
        out[k] = _deepMerge(out[k] || {}, source[k]);
      } else {
        out[k] = source[k];
      }
    });
    return out;
  }

  /**
   * Apply fixed tick rotation to a scales config object (FC-178).
   * Mutates in place for efficiency.
   */
  function _applyFixedRotation(scales, sampleSize) {
    if (!scales) return;
    ['x', 'x1', 'xAxes'].forEach(key => {
      if (scales[key]) {
        scales[key].ticks = scales[key].ticks || {};
        scales[key].ticks.minRotation  = scales[key].ticks.minRotation  ?? 0;
        scales[key].ticks.maxRotation  = scales[key].ticks.maxRotation  ?? 0;
        scales[key].ticks.sampleSize   = scales[key].ticks.sampleSize   ?? sampleSize;
      }
    });
    // Also apply to the default 'x' scale if no explicit scales are set
    if (!scales.x && !scales.xAxes) {
      scales.x = {
        ticks: { minRotation: 0, maxRotation: 0, sampleSize }
      };
    }
  }

  /**
   * Apply mobile-specific chart options (FC-098).
   * Strips legends, disables tooltips, reduces tick density.
   */
  function _applyMobileOptions(config) {
    config.options = config.options || {};
    config.options.plugins = config.options.plugins || {};

    // Suppress legend on mobile (saves ~30px height + render time)
    if (config.options.plugins.legend == null) {
      config.options.plugins.legend = { display: false };
    } else {
      config.options.plugins.legend.display = false;
    }

    // Disable interactive tooltips on touch (they fire on tap, not hover)
    if (config.options.plugins.tooltip == null) {
      config.options.plugins.tooltip = { enabled: false };
    } else {
      config.options.plugins.tooltip.enabled = false;
    }

    // Reduce tick density
    config.options.scales = config.options.scales || {};
    const axes = config.options.scales;
    ['x', 'y'].forEach(axis => {
      axes[axis] = axes[axis] || {};
      axes[axis].ticks = axes[axis].ticks || {};
      if (axes[axis].ticks.maxTicksLimit == null) {
        axes[axis].ticks.maxTicksLimit = axis === 'x' ? 4 : 5;
      }
    });
  }

  /**
   * Apply decimation plugin config to a line chart (FC-096).
   */
  function _applyDecimation(config, algorithm, samples) {
    config.options = config.options || {};
    config.options.plugins = config.options.plugins || {};
    config.options.plugins.decimation = {
      enabled: true,
      algorithm,
      samples
    };
  }

  /**
   * Suppress point rendering for large datasets (pure canvas perf win).
   */
  function _suppressPoints(config, threshold) {
    if (!config.data || !Array.isArray(config.data.datasets)) return;
    config.data.datasets.forEach(ds => {
      const len = Array.isArray(ds.data) ? ds.data.length : 0;
      if (len > threshold) {
        ds.pointRadius       = ds.pointRadius       ?? 0;
        ds.pointHoverRadius  = ds.pointHoverRadius  ?? 3;
      }
    });
  }

  /**
   * Mark pre-formatted datasets so Chart.js skips internal parsing (FC-094).
   */
  function _markPreFormatted(config) {
    if (!config.data || !Array.isArray(config.data.datasets)) return;
    config.data.datasets.forEach(ds => {
      if (ds.parsing == null)    ds.parsing    = false;
      if (ds.normalized == null) ds.normalized = true;
    });
  }

  /**
   * createOptimizedChart — the main factory function.
   *
   * Applies all FC-095/094/096/097/098/178 optimizations, then delegates
   * to the existing safeCreateChart() for canvas management + error handling.
   *
   * @param {HTMLCanvasElement|string} ctx    Canvas element or ID string
   * @param {Object}                   config Chart.js config object
   * @param {Object}                   opts   Optional overrides (see FACTORY_DEFAULTS)
   * @returns {Promise<Chart|null>}
   *
   * @example
   *   const chart = await createOptimizedChart('netWorthTimelineChart', {
   *     type: 'line',
   *     data: { datasets: [{ label: 'Net Worth', data: points }] },
   *     options: { scales: { x: { type: 'time' } } }
   *   }, { preFormatted: true, decimation: true, samples: 180 });
   */
  async function createOptimizedChart(ctx, config, opts = {}) {
    // Merge caller options over factory defaults
    const o = Object.assign({}, FACTORY_DEFAULTS, opts);

    // Clone config shallowly to avoid mutating the caller's object
    config = _deepMerge({}, config);
    config.options = config.options || {};

    const chartType = (config.type || '').toLowerCase();
    const isLine    = chartType === 'line';
    const isBar     = chartType === 'bar';
    const hasScales = isLine || isBar || chartType === 'scatter' || chartType === 'bubble';

    // ── FC-178: Fixed tick rotation (all chart types with axes) ──────
    if (o.fixedRotation && hasScales) {
      config.options.scales = config.options.scales || {};
      _applyFixedRotation(config.options.scales, o.tickSampleSize);
    }

    // ── FC-096/095: Decimation for large line datasets ─────────────
    if (o.decimation && isLine) {
      _applyDecimation(config, o.decimationAlgorithm, o.samples);
    }

    // ── FC-094: Mark pre-formatted data (parsing: false) ─────────────
    if (o.preFormatted) {
      _markPreFormatted(config);
    }

    // ── Suppress points for large datasets (auto) ─────────────────────
    if (isLine && o.suppressPointsThreshold > 0) {
      _suppressPoints(config, o.suppressPointsThreshold);
    }

    // ── FC-098: Mobile-specific optimizations ─────────────────────────
    if (o.mobileOptimize && _isMobile()) {
      _applyMobileOptions(config);
    }

    // ── Delegate to safeCreateChart for canvas management ─────────────
    if (typeof safeCreateChart !== 'function') {
      console.error('[chart-factory] safeCreateChart not found — load app.js first');
      return null;
    }

    const chartName = (typeof ctx === 'string' ? ctx : (ctx && ctx.id)) || 'chart';
    return safeCreateChart(ctx, config, chartName);
  }

  // ─────────────────────────────────────────────────────────────
  // FC-097 — Dark/Light Mode Color Sync
  // ─────────────────────────────────────────────────────────────

  /**
   * Color palettes for light and dark themes.
   * Matches design tokens in main.css + dark-theme overrides.
   */
  const THEME_PALETTES = {
    dark: {
      textPrimary:     '#f0f0f0',              // --color-text-primary dark
      textSecondary:   '#b0b0b0',              // --color-text-secondary dark
      textTertiary:    '#999999',              // --color-text-tertiary dark
      gridColor:       'rgba(255, 255, 255, 0.06)',
      borderColor:     'rgba(255, 255, 255, 0.10)',
      tooltipBg:       'rgba(26, 26, 26, 0.97)', // --color-bg-2 dark
      tooltipTitle:    '#f0f0f0',
      tooltipBody:     '#b0b0b0',
      // Financial data series colors
      positive:        '#a3d400',              // --color-financial-positive-text dark
      negative:        '#fc8181',              // --color-financial-negative-text dark
      neutral:         '#63b3ed',              // --color-financial-neutral-text dark
      primarySeries:   '#01a4ef',              // Brand blue — net worth line
      secondarySeries: '#f44e24',              // Brand orange — expenses
      tertiarySeries:  '#81b900',              // Brand green — income
    },
    light: {
      textPrimary:     '#1a1e27',              // --color-text-primary light
      textSecondary:   '#4a5568',              // --color-text-secondary light
      textTertiary:    '#718096',              // --color-text-tertiary light
      gridColor:       'rgba(0, 0, 0, 0.06)',
      borderColor:     'rgba(0, 0, 0, 0.10)',
      tooltipBg:       'rgba(255, 255, 255, 0.97)',
      tooltipTitle:    '#1a1e27',
      tooltipBody:     '#4a5568',
      // Financial data series colors
      positive:        '#4a7c00',              // --color-financial-positive-text light
      negative:        '#c53030',              // --color-financial-negative-text light
      neutral:         '#0073a8',              // --color-financial-neutral-text light
      primarySeries:   '#0190d4',              // Brand blue — slightly deeper for light bg
      secondarySeries: '#e04420',              // Brand orange — slightly deeper for light bg
      tertiarySeries:  '#6aa300',              // Brand green — slightly deeper for light bg
    }
  };

  /**
   * Update a single chart's colors to match the current theme.
   *
   * @param {Chart}   chart  Chart.js instance
   * @param {boolean} isDark True for dark mode
   */
  function updateChartTheme(chart, isDark) {
    if (!chart || chart.data == null) return;

    const palette = isDark ? THEME_PALETTES.dark : THEME_PALETTES.light;

    try {
      // Axes ticks + grid
      ['x', 'y', 'x1', 'y1'].forEach(axis => {
        const scale = chart.options.scales && chart.options.scales[axis];
        if (!scale) return;
        scale.ticks  = scale.ticks  || {};
        scale.grid   = scale.grid   || {};
        scale.ticks.color = palette.textSecondary;
        scale.grid.color  = palette.gridColor;
        if (scale.border) scale.border.color = palette.borderColor;
      });

      // Legend labels
      const legend = chart.options.plugins && chart.options.plugins.legend;
      if (legend && legend.labels) {
        legend.labels.color = palette.textSecondary;
      }

      // Tooltip
      const tooltip = chart.options.plugins && chart.options.plugins.tooltip;
      if (tooltip) {
        tooltip.backgroundColor  = palette.tooltipBg;
        tooltip.titleColor       = palette.tooltipTitle;
        tooltip.bodyColor        = palette.tooltipBody;
        tooltip.borderColor      = isDark
          ? 'rgba(255,255,255,0.15)'
          : 'rgba(0,0,0,0.12)';
      }

      chart.update('none');  // no animation, instant
    } catch (e) {
      // Chart may have been destroyed; silently ignore
    }
  }

  /**
   * Update ALL registered chart instances to match the current theme.
   *
   * @param {boolean} [isDark] If omitted, reads from <html data-bs-theme>
   */
  function updateAllChartThemes(isDark) {
    if (isDark === undefined) {
      isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    }

    const registry = window.chartInstances || {};
    Object.values(registry).forEach(chart => {
      if (chart && typeof chart.update === 'function') {
        updateChartTheme(chart, isDark);
      }
    });
  }

  // ── FC-103: MutationObserver to react to Bootstrap theme changes ──
  (function _installThemeObserver() {
    // Run once DOM is ready
    function _observe() {
      const html = document.documentElement;
      if (!html) return;

      const observer = new MutationObserver(mutations => {
        mutations.forEach(m => {
          if (m.attributeName === 'data-bs-theme') {
            const isDark = html.getAttribute('data-bs-theme') === 'dark';
            updateAllChartThemes(isDark);
          }
        });
      });

      observer.observe(html, { attributes: true, attributeFilter: ['data-bs-theme'] });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', _observe);
    } else {
      _observe();
    }
  })();

  // ─────────────────────────────────────────────────────────────
  // FC-177 — Parallel Chart Rendering
  // Replace sequential await chains with Promise.all()
  // ─────────────────────────────────────────────────────────────

  /**
   * Render multiple charts in parallel.
   * Each renderer is an async function that returns a Chart instance (or null).
   *
   * @param {Array<Function>} renderers Array of async () => Chart|null functions
   * @returns {Promise<Array<Chart|null>>}
   *
   * @example
   *   await renderChartsParallel([
   *     renderNetWorthChart,
   *     renderCashFlowChart,
   *     renderSpendingCategoriesChart
   *   ]);
   */
  async function renderChartsParallel(renderers) {
    if (!Array.isArray(renderers) || renderers.length === 0) return [];
    return Promise.all(renderers.map(fn => {
      try { return fn(); }
      catch (e) { return Promise.resolve(null); }
    }));
  }

  // ─────────────────────────────────────────────────────────────
  // Public API — expose on window
  // ─────────────────────────────────────────────────────────────

  Object.assign(global, {
    // Core factory (FC-095)
    createOptimizedChart,

    // Data helpers (FC-094)
    prepareTimeSeriesData,
    prepareMultiSeriesData,

    // Theme utilities (FC-097)
    updateChartTheme,
    updateAllChartThemes,

    // Parallel rendering (FC-177)
    renderChartsParallel,

    // Expose palettes for external use
    CHART_THEME_PALETTES: THEME_PALETTES,
  });

  console.log('✅ Fireside Capital chart-factory.js loaded (FC-095/094/097/177/178)');

})(window);
