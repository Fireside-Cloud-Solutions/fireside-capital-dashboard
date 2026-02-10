// ===== DATABASE-BACKED RATE LIMITING =====
// Secure server-side rate limiting using Supabase
// This complements client-side rate-limiter.js with database enforcement

// Rate limit configurations
const RATE_LIMIT_CONFIG = {
  add_bill: { max: 20, windowMinutes: 1 },
  add_asset: { max: 20, windowMinutes: 1 },
  add_debt: { max: 20, windowMinutes: 1 },
  add_income: { max: 20, windowMinutes: 1 },
  add_investment: { max: 20, windowMinutes: 1 },
  plaid_connect: { max: 10, windowMinutes: 60 },
  email_scan: { max: 2, windowMinutes: 1 },
  friend_request: { max: 10, windowMinutes: 60 },
  delete_item: { max: 30, windowMinutes: 1 },
  update_item: { max: 50, windowMinutes: 1 }
};

/**
 * Check database rate limit before performing operation
 * @param {string} operation - Operation name (e.g., 'add_bill', 'plaid_connect')
 * @returns {Promise<boolean>} - true if allowed, false if rate limited
 */
async function checkDatabaseRateLimit(operation) {
  const config = RATE_LIMIT_CONFIG[operation];
  
  if (!config) {
    console.warn(`No rate limit config for operation: ${operation}`);
    return true; // Allow if no config
  }
  
  // Safety check: ensure Supabase client is initialized
  const sb = window.sb;
  if (!sb) {
    console.error('Rate limit check: Supabase client not initialized');
    return true; // Allow operation but log error
  }
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await sb.auth.getUser();
    
    if (userError || !user) {
      console.error('Rate limit check: User not authenticated', userError);
      return false;
    }
    
    // Call database function
    const { data, error } = await sb.rpc('check_rate_limit', {
      p_user_id: user.id,
      p_operation: operation,
      p_max_requests: config.max,
      p_window_minutes: config.windowMinutes
    });
    
    if (error) {
      console.error('Rate limit check failed:', error);
      // Fail open - allow operation if rate limit check fails
      // This prevents blocking users if the rate limit system has issues
      return true;
    }
    
    return data === true;
    
  } catch (error) {
    console.error('Rate limit check exception:', error);
    return true; // Fail open
  }
}

/**
 * Show rate limit error message to user
 * @param {string} operation - Operation that was rate limited
 * @param {number} windowMinutes - Time window in minutes
 */
function showRateLimitError(operation, windowMinutes) {
  const friendlyNames = {
    add_bill: 'bill creation',
    add_asset: 'asset creation',
    add_debt: 'debt creation',
    add_income: 'income creation',
    add_investment: 'investment creation',
    plaid_connect: 'bank connections',
    email_scan: 'email scanning',
    friend_request: 'friend requests',
    delete_item: 'deletions',
    update_item: 'updates'
  };
  
  const actionName = friendlyNames[operation] || operation;
  const timeMsg = windowMinutes >= 60 
    ? `${windowMinutes / 60} hour${windowMinutes > 60 ? 's' : ''}`
    : `${windowMinutes} minute${windowMinutes > 1 ? 's' : ''}`;
  
  // Create alert element
  const alert = document.createElement('div');
  alert.className = 'alert alert-warning alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
  alert.style.zIndex = '9999';
  alert.style.maxWidth = '500px';
  alert.innerHTML = `
    <i class="bi bi-exclamation-triangle-fill me-2"></i>
    <strong>Rate limit exceeded</strong><br>
    Too many ${actionName} requests. Please wait ${timeMsg} and try again.
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  document.body.appendChild(alert);
  
  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    alert.remove();
  }, 5000);
}

/**
 * Wrapper function to enforce rate limiting on async operations
 * @param {string} operation - Operation name
 * @param {Function} fn - Async function to execute if rate limit allows
 * @param {HTMLElement} button - Optional button to disable during rate limit
 * @returns {Promise<any>} - Result of fn() or null if rate limited
 */
async function withDatabaseRateLimit(operation, fn, button = null) {
  const allowed = await checkDatabaseRateLimit(operation);
  
  if (!allowed) {
    const config = RATE_LIMIT_CONFIG[operation];
    showRateLimitError(operation, config.windowMinutes);
    
    // Disable button temporarily if provided
    if (button) {
      const waitMs = config.windowMinutes * 60 * 1000;
      disableButtonTemporarily(button, Math.min(waitMs, 10000), button.innerHTML);
    }
    
    return null;
  }
  
  // Execute the function
  return await fn();
}

/**
 * Combined client + database rate limiting
 * Uses client-side limiter for UX, then database for security
 * @param {string} clientLimiterKey - Key for client-side rate limiter
 * @param {string} dbOperation - Database operation name
 * @param {Function} fn - Function to execute
 * @param {HTMLElement} button - Optional button element
 * @returns {Promise<any>}
 */
async function withHybridRateLimit(clientLimiterKey, dbOperation, fn, button = null) {
  // First check: client-side (fast UX feedback)
  const clientLimiter = window.rateLimiters?.[clientLimiterKey] || window.rateLimiters?.general;
  
  if (clientLimiter && !clientLimiter.allow(dbOperation)) {
    const remainingMs = clientLimiter.getRemainingTime(dbOperation);
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    
    const alert = document.createElement('div');
    alert.className = 'alert alert-warning alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
    alert.style.zIndex = '9999';
    alert.style.maxWidth = '500px';
    alert.innerHTML = `
      <i class="bi bi-hourglass-split me-2"></i>
      <strong>Please slow down</strong><br>
      Wait ${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''} before trying again.
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 3000);
    
    if (button) {
      disableButtonTemporarily(button, remainingMs, button.innerHTML);
    }
    
    return null;
  }
  
  // Second check: database (secure enforcement)
  return await withDatabaseRateLimit(dbOperation, fn, button);
}

// Export for use in app.js
if (typeof window !== 'undefined') {
  window.checkDatabaseRateLimit = checkDatabaseRateLimit;
  window.withDatabaseRateLimit = withDatabaseRateLimit;
  window.withHybridRateLimit = withHybridRateLimit;
  window.showRateLimitError = showRateLimitError;
  window.RATE_LIMIT_CONFIG = RATE_LIMIT_CONFIG;
}
