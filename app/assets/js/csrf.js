// ===== CSRF PROTECTION =====
// This module provides CSRF token generation and validation for all state-changing operations

const CSRF = (function() {
  // Debug mode (set to true for development logging)
  const DEBUG_CSRF = false;
  function debugLog(...args) { if (DEBUG_CSRF) console.log('[CSRF]', ...args); }
  
  const CSRF_TOKEN_KEY = 'csrfToken';
  const TOKEN_EXPIRY_MS = 3600000; // 1 hour
  const TOKEN_EXPIRY_KEY = 'csrfTokenExpiry';

  /**
   * Generate a cryptographically secure CSRF token
   * @returns {string} 64-character hex string
   */
  function generateCSRFToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Initialize CSRF protection - generate token if needed
   */
  function initializeCSRF() {
    const existingToken = sessionStorage.getItem(CSRF_TOKEN_KEY);
    const expiry = parseInt(sessionStorage.getItem(TOKEN_EXPIRY_KEY)) || 0;
    const now = Date.now();

    // Generate new token if none exists or if expired
    if (!existingToken || now > expiry) {
      const token = generateCSRFToken();
      sessionStorage.setItem(CSRF_TOKEN_KEY, token);
      sessionStorage.setItem(TOKEN_EXPIRY_KEY, (now + TOKEN_EXPIRY_MS).toString());
      debugLog('CSRF token generated');
      return token;
    }

    return existingToken;
  }

  /**
   * Get current CSRF token
   * @returns {string|null} Current token or null if not initialized
   */
  function getToken() {
    return sessionStorage.getItem(CSRF_TOKEN_KEY);
  }

  /**
   * Validate CSRF token
   * @param {string} token - Token to validate
   * @returns {boolean} True if valid, false otherwise
   */
  function validateToken(token) {
    if (!token) {
      console.error('CSRF validation failed: No token provided');
      return false;
    }

    const storedToken = getToken();
    if (!storedToken) {
      console.error('CSRF validation failed: No stored token found');
      return false;
    }

    const expiry = parseInt(sessionStorage.getItem(TOKEN_EXPIRY_KEY)) || 0;
    if (Date.now() > expiry) {
      console.error('CSRF validation failed: Token expired');
      return false;
    }

    if (token !== storedToken) {
      console.error('CSRF validation failed: Token mismatch');
      return false;
    }

    return true;
  }

  /**
   * Add CSRF token to a form
   * @param {string} formId - ID of the form element
   */
  function addTokenToForm(formId) {
    const form = document.getElementById(formId);
    if (!form) {
      console.warn(`CSRF: Form with ID "${formId}" not found`);
      return;
    }

    // Remove existing CSRF input if present
    const existingInput = form.querySelector('input[name="csrf_token"]');
    if (existingInput) {
      existingInput.remove();
    }

    // Create and add new CSRF input
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'csrf_token';
    input.id = 'csrfToken';
    input.value = getToken() || '';
    form.insertBefore(input, form.firstChild);
  }

  /**
   * Add CSRF tokens to all forms on the page
   */
  function protectAllForms() {
    const token = getToken();
    if (!token) {
      console.warn('CSRF: No token available to protect forms');
      return;
    }

    // Find all forms that modify data (exclude login/signup forms)
    const protectedFormIds = [
      'assetForm',
      'investmentForm',
      'debtForm',
      'billForm',
      'incomeForm',
      'settingsForm',
      'budgetForm',
      'shareBillForm',
      'emailReviewForm'
    ];

    protectedFormIds.forEach(formId => {
      addTokenToForm(formId);
    });

    debugLog(`CSRF protection applied to ${protectedFormIds.length} forms`);
  }

  /**
   * Validate CSRF token from a form
   * @param {string} formId - ID of the form element
   * @returns {boolean} True if valid, false otherwise
   */
  function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) {
      console.error(`CSRF: Form with ID "${formId}" not found`);
      return false;
    }

    const tokenInput = form.querySelector('input[name="csrf_token"]');
    if (!tokenInput) {
      console.error(`CSRF: No token found in form "${formId}"`);
      return false;
    }

    return validateToken(tokenInput.value);
  }

  /**
   * Validate CSRF token before an operation
   * Throws an error if validation fails
   */
  function requireValidToken() {
    const token = getToken();
    if (!validateToken(token)) {
      throw new Error('CSRF validation failed. Please refresh the page and try again.');
    }
  }

  /**
   * Refresh the CSRF token (regenerate a new one)
   */
  function refreshToken() {
    sessionStorage.removeItem(CSRF_TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
    const token = initializeCSRF();
    protectAllForms();
    return token;
  }

  /**
   * Clear CSRF token (on logout)
   */
  function clearToken() {
    sessionStorage.removeItem(CSRF_TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
    debugLog('CSRF token cleared');
  }

  // Auto-initialize on module load
  initializeCSRF();

  // Public API
  return {
    init: initializeCSRF,
    getToken: getToken,
    validateToken: validateToken,
    addTokenToForm: addTokenToForm,
    protectAllForms: protectAllForms,
    validateForm: validateForm,
    requireValidToken: requireValidToken,
    refreshToken: refreshToken,
    clearToken: clearToken
  };
})();

// Auto-protect forms when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    CSRF.protectAllForms();
  });
} else {
  CSRF.protectAllForms();
}
