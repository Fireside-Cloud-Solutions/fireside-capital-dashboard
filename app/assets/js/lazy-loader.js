/**
 * LazyLoader - Performance optimization utility
 * Loads heavy dependencies only when needed
 * 
 * Benefits:
 * - Chart.js (270 KB) only loads on dashboard page
 * - Plaid Link (95 KB) only loads when user connects bank
 * - Onboarding (30 KB) only loads for new users
 * 
 * Usage:
 *   await LazyLoader.loadCharts();
 *   await LazyLoader.loadPlaid();
 * 
 * @see reports/SPRINT-RESEARCH-PERFORMANCE-OPTIMIZATION-2026-02-04.md
 */

class LazyLoader {
  static loadingPromises = {};

  /**
   * Load Chart.js library (270 KB)
   * Only needed on dashboard and reports pages
   * 
   * @returns {Promise<void>} Resolves when Chart.js is loaded
   */
  static async loadCharts() {
    // Return existing promise if already loading
    if (this.loadingPromises.charts) {
      return this.loadingPromises.charts;
    }

    // Already loaded
    if (window.Chart) {
      return Promise.resolve();
    }

    console.log('[LazyLoader] Loading Chart.js...');

    this.loadingPromises.charts = this.loadScript(
      'https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js'
    ).then(() => {
      console.log('[LazyLoader] Chart.js loaded successfully');
      delete this.loadingPromises.charts;
    });

    return this.loadingPromises.charts;
  }

  /**
   * Load Plaid Link library (95 KB)
   * Only needed when user clicks "Connect Bank"
   * 
   * @returns {Promise<void>} Resolves when Plaid Link is loaded
   */
  static async loadPlaid() {
    if (this.loadingPromises.plaid) {
      return this.loadingPromises.plaid;
    }

    if (window.Plaid) {
      return Promise.resolve();
    }

    console.log('[LazyLoader] Loading Plaid Link...');

    this.loadingPromises.plaid = this.loadScript(
      'https://cdn.plaid.com/link/v2/stable/link-initialize.js'
    ).then(() => {
      console.log('[LazyLoader] Plaid Link loaded successfully');
      delete this.loadingPromises.plaid;
    });

    return this.loadingPromises.plaid;
  }

  /**
   * Load a JavaScript file dynamically
   * 
   * @param {string} src - Script URL
   * @param {object} options - Script attributes (async, defer, etc.)
   * @returns {Promise<void>} Resolves when script loads
   */
  static loadScript(src, options = {}) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));

      // Apply custom attributes
      Object.entries(options).forEach(([key, value]) => {
        script.setAttribute(key, value);
      });

      document.body.appendChild(script);
    });
  }

  /**
   * Preload a resource (hint to browser to fetch in background)
   * Useful for resources needed soon but not immediately
   * 
   * @param {string} href - Resource URL
   * @param {string} as - Resource type (script, style, font, etc.)
   */
  static preload(href, as) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  }

  /**
   * Prefetch a resource (low-priority background fetch)
   * For resources likely needed on next navigation
   * 
   * @param {string} href - Resource URL
   */
  static prefetch(href) {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  }
}

// Make available globally
window.LazyLoader = LazyLoader;
