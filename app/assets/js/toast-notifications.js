/**
 * Fireside Capital — Toast Notification System
 * 
 * Replaces browser alert() with styled, non-blocking toast notifications
 * Supports success, error, warning, and info types
 * 
 * Usage:
 *   Toast.success('Bill saved successfully!');
 *   Toast.error('Failed to save bill. Please try again.');
 *   Toast.warning('This action cannot be undone.');
 *   Toast.info('Budget generated for February 2026.');
 * 
 * Advanced:
 *   Toast.show({
 *     type: 'success',
 *     message: 'Data saved!',
 *     duration: 5000,
 *     action: { text: 'Undo', callback: undoAction }
 *   });
 */

const Toast = (function() {
  'use strict';

  // ===== CONFIGURATION =====
  const CONFIG = {
    position: 'top-right', // top-left | top-right | bottom-left | bottom-right | top-center | bottom-center
    duration: 4000, // Default duration in milliseconds
    maxToasts: 5, // Maximum number of toasts visible at once
    animationDuration: 300, // Slide in/out animation duration
    stackSpacing: 12 // Spacing between stacked toasts
  };

  // ===== STATE =====
  let toastContainer = null;
  let toastCounter = 0;
  const activeToasts = [];

  // ===== INITIALIZATION =====

  /**
   * Initialize toast container
   */
  function init() {
    if (toastContainer) return;

    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = `toast-container toast-${CONFIG.position}`;
    document.body.appendChild(toastContainer);
  }

  // ===== TOAST CREATION =====

  /**
   * Show a toast notification
   * @param {object} options - Toast configuration
   * @returns {string} - Toast ID
   */
  function show(options = {}) {
    init();

    const {
      type = 'info', // success | error | warning | info
      message = '',
      title = null,
      duration = CONFIG.duration,
      action = null, // { text, callback }
      dismissible = true,
      icon = getDefaultIcon(type)
    } = options;

    // Remove oldest toast if max limit reached
    if (activeToasts.length >= CONFIG.maxToasts) {
      remove(activeToasts[0].id);
    }

    // Create toast element
    const toastId = `toast-${++toastCounter}`;
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
    toast.setAttribute('aria-atomic', 'true');

    // Build toast content
    let toastHTML = `
      <div class="toast-content">
        ${icon ? `<i class="toast-icon ${icon}"></i>` : ''}
        <div class="toast-body">
          ${title ? `<div class="toast-title">${escapeHtml(title)}</div>` : ''}
          <div class="toast-message">${escapeHtml(message)}</div>
        </div>
        ${dismissible ? '<button class="toast-close" aria-label="Close"><i class="bi bi-x"></i></button>' : ''}
      </div>
    `;

    // Add action button if provided
    if (action && action.text) {
      toastHTML += `
        <div class="toast-action">
          <button class="toast-action-btn">${escapeHtml(action.text)}</button>
        </div>
      `;
    }

    toast.innerHTML = toastHTML;

    // Add to container
    toastContainer.appendChild(toast);

    // Track active toast
    const toastObj = {
      id: toastId,
      element: toast,
      duration: duration,
      timeout: null
    };
    activeToasts.push(toastObj);

    // Set up event listeners
    if (dismissible) {
      const closeBtn = toast.querySelector('.toast-close');
      closeBtn.addEventListener('click', () => remove(toastId));
    }

    if (action && action.callback) {
      const actionBtn = toast.querySelector('.toast-action-btn');
      actionBtn.addEventListener('click', () => {
        action.callback();
        remove(toastId);
      });
    }

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.add('toast-show');
    });

    // Auto-dismiss after duration
    if (duration > 0) {
      toastObj.timeout = setTimeout(() => remove(toastId), duration);
    }

    return toastId;
  }

  /**
   * Remove a toast
   * @param {string} toastId - ID of toast to remove
   */
  function remove(toastId) {
    const index = activeToasts.findIndex(t => t.id === toastId);
    if (index === -1) return;

    const toastObj = activeToasts[index];
    const toast = toastObj.element;

    // Clear timeout if exists
    if (toastObj.timeout) {
      clearTimeout(toastObj.timeout);
    }

    // Animate out
    toast.classList.remove('toast-show');
    toast.classList.add('toast-hide');

    // Remove from DOM after animation
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      activeToasts.splice(index, 1);
    }, CONFIG.animationDuration);
  }

  /**
   * Remove all toasts
   */
  function clear() {
    activeToasts.forEach(toastObj => {
      if (toastObj.timeout) {
        clearTimeout(toastObj.timeout);
      }
      if (toastObj.element.parentNode) {
        toastObj.element.parentNode.removeChild(toastObj.element);
      }
    });
    activeToasts.length = 0;
  }

  // ===== CONVENIENCE METHODS =====

  /**
   * Show success toast
   * @param {string} message - Success message
   * @param {object} options - Additional options
   */
  function success(message, options = {}) {
    return show({ type: 'success', message, ...options });
  }

  /**
   * Show error toast
   * @param {string} message - Error message
   * @param {object} options - Additional options
   */
  function error(message, options = {}) {
    return show({ type: 'error', message, duration: 6000, ...options });
  }

  /**
   * Show warning toast
   * @param {string} message - Warning message
   * @param {object} options - Additional options
   */
  function warning(message, options = {}) {
    return show({ type: 'warning', message, duration: 5000, ...options });
  }

  /**
   * Show info toast
   * @param {string} message - Info message
   * @param {object} options - Additional options
   */
  function info(message, options = {}) {
    return show({ type: 'info', message, ...options });
  }

  /**
   * Show confirmation toast with action button
   * @param {string} message - Confirmation message
   * @param {function} callback - Action callback
   * @param {object} options - Additional options
   */
  function confirm(message, callback, options = {}) {
    return show({
      type: 'warning',
      message,
      duration: 0, // Don't auto-dismiss confirmations
      action: { text: 'Confirm', callback },
      ...options
    });
  }

  // ===== UTILITY FUNCTIONS =====

  /**
   * Get default icon for toast type
   * @param {string} type - Toast type
   * @returns {string} - Bootstrap icon class
   */
  function getDefaultIcon(type) {
    const icons = {
      success: 'bi bi-check-circle-fill',
      error: 'bi bi-exclamation-circle-fill',
      warning: 'bi bi-exclamation-triangle-fill',
      info: 'bi bi-info-circle-fill'
    };
    return icons[type] || icons.info;
  }

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

  // ===== CONFIGURATION =====

  /**
   * Update toast configuration
   * @param {object} newConfig - Configuration updates
   */
  function configure(newConfig) {
    Object.assign(CONFIG, newConfig);
    
    // Update container position if already created
    if (toastContainer) {
      toastContainer.className = `toast-container toast-${CONFIG.position}`;
    }
  }

  // ===== PUBLIC API =====
  return {
    show,
    remove,
    clear,
    success,
    error,
    warning,
    info,
    confirm,
    configure,
    getConfig: () => ({ ...CONFIG })
  };
})();

// ===== GLOBAL ALERT REPLACEMENT (OPTIONAL) =====

/**
 * Override native alert() to use Toast.info()
 * Uncomment to enable globally
 */
window.alert = function(message) {
  Toast.warning(message);
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Toast;
}

// ===== BOOTSTRAP CONFIRMATION MODAL =====

/**
 * Show a Bootstrap confirmation modal for destructive actions.
 * Replaces native confirm() with a styled, non-blocking modal.
 *
 * @param {string}   title        - Modal heading (e.g. "Delete Investment")
 * @param {string}   message      - Body text (e.g. "Are you sure you want to delete…")
 * @param {Function} onConfirm    - Called when user clicks the confirm button
 * @param {Object}   [opts]
 * @param {string}   [opts.confirmText='Confirm']    - Confirm button label
 * @param {string}   [opts.confirmClass='btn-danger'] - Bootstrap button class
 */
function showConfirmModal(title, message, onConfirm, opts = {}) {
  const {
    confirmText  = 'Confirm',
    confirmClass = 'btn-danger',
  } = opts;

  // Lazily inject the modal HTML once
  const MODAL_ID = 'globalConfirmModal';
  if (!document.getElementById(MODAL_ID)) {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="modal fade" id="${MODAL_ID}" tabindex="-1"
           aria-labelledby="${MODAL_ID}Label" aria-modal="true" role="dialog">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="${MODAL_ID}Label"></h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" id="${MODAL_ID}Body"></div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn" id="${MODAL_ID}Btn"></button>
            </div>
          </div>
        </div>
      </div>`);
  }

  // Populate title & body
  document.getElementById(`${MODAL_ID}Label`).textContent = title;
  document.getElementById(`${MODAL_ID}Body`).textContent  = message;

  // Update confirm button (clone to wipe old click listeners)
  const oldBtn  = document.getElementById(`${MODAL_ID}Btn`);
  const newBtn  = oldBtn.cloneNode(true);
  newBtn.textContent  = confirmText;
  newBtn.className    = `btn ${confirmClass}`;
  oldBtn.replaceWith(newBtn);

  newBtn.addEventListener('click', () => {
    bootstrap.Modal.getInstance(document.getElementById(MODAL_ID))?.hide();
    onConfirm();
  });

  // Show
  new bootstrap.Modal(document.getElementById(MODAL_ID)).show();
}
