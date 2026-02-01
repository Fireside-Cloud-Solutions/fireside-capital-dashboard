/**
 * Security Patch for Fireside Capital
 * Adds CSRF validation to all state-changing operations
 * Load this AFTER app.js to wrap critical functions
 */

(function() {
  if (typeof CSRF === 'undefined') {
    console.error('[Security] CSRF module not loaded! Security patch cannot be applied.');
    return;
  }

  console.log('[Security] Applying CSRF protection patches...');

  // List of functions that require CSRF validation
  const protectedOperations = [
    'saveAsset',
    'deleteAsset',
    'saveInvestment',
    'deleteInvestment',
    'saveDebt',
    'deleteDebt',
    'saveBill',
    'deleteBill',
    'saveIncome',
    'deleteIncome',
    'saveSettings',
    'saveBudgetAssignment',
    'saveBudgetItem',
    'removeBudgetItem',
    'shareBill',
    'approveBill',
    'rejectBill'
  ];

  // Wrap each function with CSRF validation
  protectedOperations.forEach(funcName => {
    if (typeof window[funcName] === 'function') {
      const original = window[funcName];
      window[funcName] = async function(...args) {
        try {
          // Validate CSRF token before proceeding
          CSRF.requireValidToken();
          return await original.apply(this, args);
        } catch (error) {
          if (error.message.includes('CSRF')) {
            // Show user-friendly error
            if (typeof showToast === 'function') {
              showToast('Security validation failed. Please refresh the page and try again.', 'danger');
            } else {
              alert('Security validation failed. Please refresh the page and try again.');
            }
            console.error('[Security] CSRF validation failed for', funcName);
            return;
          }
          throw error;
        }
      };
      console.log(`[Security] Protected: ${funcName}`);
    }
  });

  console.log(`[Security] CSRF protection applied to ${protectedOperations.length} operations`);

  // Add CSRF header to all fetch requests
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const [url, options = {}] = args;
    
    // Only add CSRF token to POST/PUT/DELETE/PATCH requests
    const method = (options.method || 'GET').toUpperCase();
    const requiresCSRF = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
    
    if (requiresCSRF) {
      const token = CSRF.getToken();
      if (token) {
        options.headers = options.headers || {};
        if (options.headers instanceof Headers) {
          options.headers.set('X-CSRF-Token', token);
        } else {
          options.headers['X-CSRF-Token'] = token;
        }
      }
    }
    
    return originalFetch.apply(this, [url, options]);
  };

  console.log('[Security] CSRF headers will be added to all state-changing fetch requests');

  // Add cookie security reminder
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkCookieSecurity);
  } else {
    checkCookieSecurity();
  }

  function checkCookieSecurity() {
    const cookies = document.cookie.split(';');
    const hasInsecureCookie = cookies.some(cookie => {
      const [name] = cookie.trim().split('=');
      return name.startsWith('sb-') && !cookie.includes('Secure') && location.protocol === 'https:';
    });

    if (hasInsecureCookie && location.protocol === 'https:') {
      console.warn('[Security] Some cookies may not have Secure flag set. This should be configured server-side (Supabase handles this).');
    }
  }

  console.log('[Security] Security patch complete ✓');
})();
