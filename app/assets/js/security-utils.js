/**
 * Security Utilities for Fireside Capital
 * Prevents XSS vulnerabilities by escaping user input
 */

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} unsafe - Unsanitized user input
 * @returns {string} - HTML-escaped safe string
 */
function escapeHtml(unsafe) {
  if (unsafe === null || unsafe === undefined) {
    return '';
  }
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Sanitize user HTML by removing dangerous tags
 * Used for rich text fields where some HTML is allowed
 * @param {string} dirty - User-provided HTML
 * @returns {string} - Sanitized HTML
 */
function sanitizeUserHTML(dirty) {
  if (dirty === null || dirty === undefined) {
    return '';
  }
  
  // Remove script tags and event handlers
  let clean = String(dirty);
  
  // Remove script tags
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers (onclick, onerror, etc.)
  clean = clean.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');
  clean = clean.replace(/\son\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: protocol
  clean = clean.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
  clean = clean.replace(/src\s*=\s*["']javascript:[^"']*["']/gi, 'src=""');
  
  return clean;
}

/**
 * Generate a cryptographically secure random token
 * Used for CSRF protection
 * @returns {string} - Random hex token
 */
function generateSecureToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Set CSRF token in sessionStorage and return it
 * @returns {string} - CSRF token
 */
function initCSRFToken() {
  let token = sessionStorage.getItem('csrfToken');
  if (!token) {
    token = generateSecureToken();
    sessionStorage.setItem('csrfToken', token);
  }
  return token;
}

/**
 * Get CSRF token from sessionStorage
 * @returns {string|null} - CSRF token or null
 */
function getCSRFToken() {
  return sessionStorage.getItem('csrfToken');
}

/**
 * Add CSRF token to request headers
 * @param {object} headers - Existing headers object
 * @returns {object} - Headers with CSRF token added
 */
function addCSRFHeader(headers = {}) {
  const token = getCSRFToken();
  if (token) {
    headers['X-CSRF-Token'] = token;
  }
  return headers;
}

// Initialize CSRF token on page load
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initCSRFToken();
  });
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    escapeHtml,
    sanitizeUserHTML,
    generateSecureToken,
    initCSRFToken,
    getCSRFToken,
    addCSRFHeader
  };
}

// Make available globally for inline scripts
window.SecurityUtils = {
  escapeHtml,
  sanitizeUserHTML,
  generateSecureToken,
  initCSRFToken,
  getCSRFToken,
  addCSRFHeader
};
