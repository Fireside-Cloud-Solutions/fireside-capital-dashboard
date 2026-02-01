// ===== RATE LIMITER =====
// Prevents spam and abuse by limiting API calls and user actions

class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map(); // key -> [timestamps]
  }
  
  allow(key) {
    const now = Date.now();
    
    // Get or initialize request history for this key
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const keyRequests = this.requests.get(key);
    
    // Remove expired requests outside the time window
    const validRequests = keyRequests.filter(t => t > now - this.windowMs);
    this.requests.set(key, validRequests);
    
    // Check if limit exceeded
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Allow request and record timestamp
    validRequests.push(now);
    return true;
  }
  
  getRemainingTime(key) {
    if (!this.requests.has(key)) return 0;
    
    const now = Date.now();
    const keyRequests = this.requests.get(key);
    const validRequests = keyRequests.filter(t => t > now - this.windowMs);
    
    if (validRequests.length < this.maxRequests) return 0;
    
    // Time until oldest request expires
    const oldestRequest = Math.min(...validRequests);
    return Math.max(0, this.windowMs - (now - oldestRequest));
  }
  
  reset(key) {
    this.requests.delete(key);
  }
  
  resetAll() {
    this.requests.clear();
  }
}

// Create global rate limiters for different operation types
const rateLimiters = {
  save: new RateLimiter(5, 10000),        // 5 saves per 10 seconds
  delete: new RateLimiter(3, 10000),      // 3 deletes per 10 seconds
  search: new RateLimiter(10, 10000),     // 10 searches per 10 seconds
  report: new RateLimiter(2, 60000),      // 2 reports per minute
  plaid: new RateLimiter(3, 30000),       // 3 Plaid operations per 30 seconds
  email: new RateLimiter(2, 60000),       // 2 email scans per minute
  general: new RateLimiter(20, 10000)     // 20 general actions per 10 seconds
};

// Visual feedback helper
function disableButtonTemporarily(button, ms, originalText) {
  if (!button) return;
  
  button.disabled = true;
  button.classList.add('disabled');
  const prevText = button.innerHTML;
  
  // Show countdown if wait time is significant
  if (ms > 2000) {
    let remainingSeconds = Math.ceil(ms / 1000);
    const countdownInterval = setInterval(() => {
      remainingSeconds--;
      if (remainingSeconds > 0) {
        button.innerHTML = `<i class="bi bi-hourglass-split"></i> Wait ${remainingSeconds}s`;
      }
    }, 1000);
    
    setTimeout(() => {
      clearInterval(countdownInterval);
      button.disabled = false;
      button.classList.remove('disabled');
      button.innerHTML = originalText || prevText;
    }, ms);
  } else {
    setTimeout(() => {
      button.disabled = false;
      button.classList.remove('disabled');
      button.innerHTML = originalText || prevText;
    }, ms);
  }
}

// Wrapper function to add rate limiting to any operation
function withRateLimit(limiterKey, operation, operationName = 'action', button = null) {
  const limiter = rateLimiters[limiterKey] || rateLimiters.general;
  
  if (!limiter.allow(operationName)) {
    const remainingMs = limiter.getRemainingTime(operationName);
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    
    // Show user-friendly alert
    const alert = document.createElement('div');
    alert.className = 'alert alert-warning alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
    alert.style.zIndex = '9999';
    alert.style.maxWidth = '500px';
    alert.innerHTML = `
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      <strong>Slow down!</strong> Too many ${operationName} requests. Please wait ${remainingSeconds} seconds.
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alert);
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      alert.remove();
    }, 3000);
    
    // Disable button temporarily if provided
    if (button) {
      disableButtonTemporarily(button, remainingMs, button.innerHTML);
    }
    
    return false;
  }
  
  // Execute the operation
  try {
    return operation();
  } catch (error) {
    console.error(`Rate-limited operation "${operationName}" failed:`, error);
    throw error;
  }
}

// Export for use in app.js
if (typeof window !== 'undefined') {
  window.RateLimiter = RateLimiter;
  window.rateLimiters = rateLimiters;
  window.withRateLimit = withRateLimit;
  window.disableButtonTemporarily = disableButtonTemporarily;
}
