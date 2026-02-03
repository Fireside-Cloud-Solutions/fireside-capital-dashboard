/**
 * Fireside Capital — Loading States Utility
 * 
 * Provides consistent loading indicators across the application:
 * - Page-level loading overlays
 * - Card-level spinners
 * - Button loading states
 * - Table skeleton loaders
 * - Empty states
 * 
 * Usage:
 *   // Page loading
 *   LoadingStates.showPageLoading();
 *   LoadingStates.hidePageLoading();
 * 
 *   // Card loading
 *   LoadingStates.showCardLoading('stats-card-net-worth');
 *   LoadingStates.hideCardLoading('stats-card-net-worth');
 * 
 *   // Button loading
 *   LoadingStates.setButtonLoading('submitBtn', true, 'Saving...');
 *   LoadingStates.setButtonLoading('submitBtn', false);
 * 
 *   // Table loading
 *   LoadingStates.showTableLoading('billsTable', 5);
 *   LoadingStates.hideTableLoading('billsTable');
 */

const LoadingStates = (function() {
  'use strict';

  // ===== CONFIGURATION =====
  const CONFIG = {
    spinnerClass: 'spinner-border spinner-border-sm',
    overlayClass: 'loading-overlay',
    skeletonClass: 'skeleton-loader',
    fadeInDuration: 150,
    fadeOutDuration: 150
  };

  // ===== PAGE-LEVEL LOADING =====

  /**
   * Show full-page loading overlay
   * @param {string} message - Optional message to display
   */
  function showPageLoading(message = 'Loading...') {
    // Remove existing overlay if present
    hidePageLoading();

    const overlay = document.createElement('div');
    overlay.id = 'page-loading-overlay';
    overlay.className = CONFIG.overlayClass;
    overlay.innerHTML = `
      <div class="loading-content">
        <div class="${CONFIG.spinnerClass}" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 mb-0">${escapeHtml(message)}</p>
      </div>
    `;

    document.body.appendChild(overlay);
    
    // Fade in
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
    });
  }

  /**
   * Hide full-page loading overlay
   */
  function hidePageLoading() {
    const overlay = document.getElementById('page-loading-overlay');
    if (overlay) {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), CONFIG.fadeOutDuration);
    }
  }

  // ===== CARD-LEVEL LOADING =====

  /**
   * Show loading spinner in a card
   * @param {string} elementId - ID of card element
   * @param {string} message - Optional message
   */
  function showCardLoading(elementId, message = null) {
    const card = document.getElementById(elementId);
    if (!card) return;

    // Save original content
    if (!card.dataset.originalContent) {
      card.dataset.originalContent = card.innerHTML;
    }

    const spinnerHTML = `
      <div class="text-center py-5 loading-card-content">
        <div class="${CONFIG.spinnerClass}" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        ${message ? `<p class="mt-3 mb-0 text-muted">${escapeHtml(message)}</p>` : ''}
      </div>
    `;

    card.innerHTML = spinnerHTML;
    card.classList.add('loading');
  }

  /**
   * Hide loading spinner and restore card content
   * @param {string} elementId - ID of card element
   */
  function hideCardLoading(elementId) {
    const card = document.getElementById(elementId);
    if (!card) return;

    // Restore original content if it was saved
    if (card.dataset.originalContent) {
      card.innerHTML = card.dataset.originalContent;
      delete card.dataset.originalContent;
    }

    card.classList.remove('loading');
  }

  // ===== BUTTON LOADING =====

  /**
   * Set button loading state
   * @param {string} buttonId - ID of button element
   * @param {boolean} loading - True to show loading, false to restore
   * @param {string} loadingText - Text to show while loading
   */
  function setButtonLoading(buttonId, loading, loadingText = 'Please wait...') {
    const btn = document.getElementById(buttonId);
    if (!btn) return;

    if (loading) {
      btn.disabled = true;
      btn.dataset.originalText = btn.textContent;
      btn.innerHTML = `
        <span class="${CONFIG.spinnerClass} me-1" role="status" aria-hidden="true"></span>
        ${escapeHtml(loadingText)}
      `;
      btn.classList.add('loading');
    } else {
      btn.disabled = false;
      btn.textContent = btn.dataset.originalText || btn.textContent;
      delete btn.dataset.originalText;
      btn.classList.remove('loading');
    }
  }

  // ===== TABLE LOADING (SKELETON) =====

  /**
   * Show skeleton loader in table
   * @param {string} tableId - ID of table body element
   * @param {number} rows - Number of skeleton rows to show
   * @param {number} columns - Number of columns (defaults to 5)
   */
  function showTableLoading(tableId, rows = 3, columns = 5) {
    const tbody = document.getElementById(tableId);
    if (!tbody) return;

    // Save original content
    if (!tbody.dataset.originalContent) {
      tbody.dataset.originalContent = tbody.innerHTML;
    }

    let skeletonHTML = '';
    for (let i = 0; i < rows; i++) {
      skeletonHTML += '<tr class="skeleton-row">';
      for (let j = 0; j < columns; j++) {
        skeletonHTML += `
          <td>
            <div class="${CONFIG.skeletonClass}"></div>
          </td>
        `;
      }
      skeletonHTML += '</tr>';
    }

    tbody.innerHTML = skeletonHTML;
    tbody.classList.add('loading');
  }

  /**
   * Hide table skeleton loader and restore content
   * @param {string} tableId - ID of table body element
   */
  function hideTableLoading(tableId) {
    const tbody = document.getElementById(tableId);
    if (!tbody) return;

    // Restore original content if it was saved
    if (tbody.dataset.originalContent) {
      tbody.innerHTML = tbody.dataset.originalContent;
      delete tbody.dataset.originalContent;
    }

    tbody.classList.remove('loading');
  }

  /**
   * Show centered loading spinner in a table (alternative to skeleton)
   * @param {string} tableId - ID of table body element
   * @param {string} message - Optional message
   * @param {number} colspan - Number of columns to span
   */
  function showTableSpinner(tableId, message = 'Loading data...', colspan = 5) {
    const tbody = document.getElementById(tableId);
    if (!tbody) return;

    // Save original content
    if (!tbody.dataset.originalContent) {
      tbody.dataset.originalContent = tbody.innerHTML;
    }

    tbody.innerHTML = `
      <tr class="loading-row">
        <td colspan="${colspan}" class="text-center py-5">
          <div class="${CONFIG.spinnerClass}" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3 mb-0 text-muted">${escapeHtml(message)}</p>
        </td>
      </tr>
    `;

    tbody.classList.add('loading');
  }

  // ===== EMPTY STATES =====

  /**
   * Show empty state in a container
   * @param {string} elementId - ID of container element
   * @param {object} config - { icon, title, message, ctaText, ctaAction }
   */
  function showEmptyState(elementId, config = {}) {
    const container = document.getElementById(elementId);
    if (!container) return;

    const {
      icon = 'bi-inbox',
      title = 'No data',
      message = 'There is no data to display.',
      ctaText = null,
      ctaAction = null
    } = config;

    const ctaHTML = ctaText && ctaAction
      ? `<button class="btn btn-primary mt-3" onclick="${ctaAction}">${escapeHtml(ctaText)}</button>`
      : '';

    container.innerHTML = `
      <div class="empty-state text-center py-5">
        <i class="bi ${icon}" style="font-size: 4rem; opacity: 0.3;"></i>
        <h3 class="mt-3">${escapeHtml(title)}</h3>
        <p class="text-muted">${escapeHtml(message)}</p>
        ${ctaHTML}
      </div>
    `;
  }

  // ===== INLINE LOADING =====

  /**
   * Show inline loading indicator (for small sections)
   * @param {string} elementId - ID of element
   * @param {string} size - 'sm' | 'md' | 'lg'
   */
  function showInlineLoading(elementId, size = 'sm') {
    const element = document.getElementById(elementId);
    if (!element) return;

    const sizeClass = size === 'lg' ? '' : `spinner-border-${size}`;
    
    if (!element.dataset.originalContent) {
      element.dataset.originalContent = element.innerHTML;
    }

    element.innerHTML = `
      <span class="spinner-border ${sizeClass}" role="status" aria-hidden="true"></span>
    `;
  }

  /**
   * Hide inline loading and restore content
   * @param {string} elementId - ID of element
   */
  function hideInlineLoading(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    if (element.dataset.originalContent) {
      element.innerHTML = element.dataset.originalContent;
      delete element.dataset.originalContent;
    }
  }

  // ===== UTILITY FUNCTIONS =====

  /**
   * Escape HTML to prevent XSS
   * @param {string} str - String to escape
   * @returns {string} - Escaped string
   */
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ===== PUBLIC API =====
  return {
    // Page loading
    showPageLoading,
    hidePageLoading,
    
    // Card loading
    showCardLoading,
    hideCardLoading,
    
    // Button loading
    setButtonLoading,
    
    // Table loading
    showTableLoading,
    hideTableLoading,
    showTableSpinner,
    
    // Empty states
    showEmptyState,
    
    // Inline loading
    showInlineLoading,
    hideInlineLoading,
    
    // Config (read-only)
    getConfig: () => ({ ...CONFIG })
  };
})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LoadingStates;
}
