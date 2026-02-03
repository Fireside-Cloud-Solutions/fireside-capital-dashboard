/**
 * Fireside Capital — User-Friendly Error Messages
 * 
 * Converts technical error messages into helpful, actionable user-facing text
 * Provides consistent error handling across the application
 * 
 * Usage:
 *   const friendlyError = ErrorMessages.getFriendlyError(error);
 *   Toast.error(friendlyError);
 * 
 *   // Or use helper methods:
 *   ErrorMessages.handleAuthError(error);
 *   ErrorMessages.handleDatabaseError(error);
 *   ErrorMessages.handleNetworkError(error);
 */

const ErrorMessages = (function() {
  'use strict';

  // ===== ERROR MESSAGE MAPPINGS =====

  const AUTH_ERRORS = {
    'email not confirmed': {
      message: 'Please confirm your email before logging in.',
      action: 'Check your inbox (and spam folder) for the confirmation link.'
    },
    'invalid login credentials': {
      message: 'Incorrect email or password.',
      action: 'Please check your credentials and try again.'
    },
    'user already registered': {
      message: 'An account with this email already exists.',
      action: 'Try logging in instead, or use the "Forgot Password" link.'
    },
    'password should be at least': {
      message: 'Password is too short.',
      action: 'Please use at least 6 characters.'
    },
    'invalid email': {
      message: 'Email address is not valid.',
      action: 'Please enter a valid email address.'
    },
    'email rate limit exceeded': {
      message: 'Too many requests.',
      action: 'Please wait a few minutes before trying again.'
    },
    'jwt expired': {
      message: 'Your session has expired.',
      action: 'Please log in again.'
    },
    'refresh token not found': {
      message: 'Your session has expired.',
      action: 'Please log in again.'
    }
  };

  const DATABASE_ERRORS = {
    'unique constraint': {
      message: 'This item already exists.',
      action: 'Please use a different name or check your existing records.'
    },
    'foreign key constraint': {
      message: 'Cannot delete this item because it is being used elsewhere.',
      action: 'Remove dependencies first, then try again.'
    },
    'not null violation': {
      message: 'Required field is missing.',
      action: 'Please fill in all required fields and try again.'
    },
    'check constraint': {
      message: 'Invalid data entered.',
      action: 'Please check your input values and try again.'
    },
    'permission denied': {
      message: 'You do not have permission to perform this action.',
      action: 'Contact support if you believe this is an error.'
    },
    'row level security': {
      message: 'Access denied.',
      action: 'You can only access your own data.'
    },
    'insufficient_privilege': {
      message: 'Insufficient permissions.',
      action: 'Please log in with an authorized account.'
    }
  };

  const NETWORK_ERRORS = {
    'Failed to fetch': {
      message: 'Network error.',
      action: 'Check your internet connection and try again.'
    },
    'NetworkError': {
      message: 'Unable to connect to server.',
      action: 'Check your internet connection or try again later.'
    },
    'timeout': {
      message: 'Request timed out.',
      action: 'The server is taking too long to respond. Please try again.'
    },
    'cors': {
      message: 'Connection blocked.',
      action: 'This request is not allowed. Contact support.'
    }
  };

  const VALIDATION_ERRORS = {
    'amount must be positive': {
      message: 'Amount cannot be negative.',
      action: 'Please enter a positive number.'
    },
    'invalid frequency': {
      message: 'Invalid frequency selected.',
      action: 'Please select a valid frequency (monthly, weekly, etc.).'
    },
    'invalid date': {
      message: 'Invalid date.',
      action: 'Please enter a valid date.'
    },
    'future date': {
      message: 'Date cannot be in the future.',
      action: 'Please enter today or a past date.'
    },
    'required field': {
      message: 'Required field is empty.',
      action: 'Please fill in all required fields.'
    }
  };

  // ===== DETECTION FUNCTIONS =====

  /**
   * Get friendly error message from error object or string
   * @param {Error|string|object} error - Error to convert
   * @returns {string} - User-friendly error message
   */
  function getFriendlyError(error) {
    if (!error) return 'An unknown error occurred. Please try again.';

    const errorText = getErrorText(error);
    const errorLower = errorText.toLowerCase();

    // Try auth errors
    for (const [pattern, config] of Object.entries(AUTH_ERRORS)) {
      if (errorLower.includes(pattern)) {
        return formatError(config);
      }
    }

    // Try database errors
    for (const [pattern, config] of Object.entries(DATABASE_ERRORS)) {
      if (errorLower.includes(pattern)) {
        return formatError(config);
      }
    }

    // Try network errors
    for (const [pattern, config] of Object.entries(NETWORK_ERRORS)) {
      if (errorLower.includes(pattern)) {
        return formatError(config);
      }
    }

    // Try validation errors
    for (const [pattern, config] of Object.entries(VALIDATION_ERRORS)) {
      if (errorLower.includes(pattern)) {
        return formatError(config);
      }
    }

    // Generic error
    return `Something went wrong. ${errorText || 'Please try again.'}`;
  }

  /**
   * Extract error text from various error formats
   * @param {Error|string|object} error - Error object
   * @returns {string} - Error message text
   */
  function getErrorText(error) {
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    if (error.error) return getErrorText(error.error);
    if (error.msg) return error.msg;
    if (error.detail) return error.detail;
    if (error.hint) return error.hint;
    return 'Unknown error';
  }

  /**
   * Format error config into user-facing message
   * @param {object} config - Error config with message and action
   * @returns {string} - Formatted error message
   */
  function formatError(config) {
    if (config.action) {
      return `${config.message} ${config.action}`;
    }
    return config.message;
  }

  // ===== CATEGORY-SPECIFIC HANDLERS =====

  /**
   * Handle authentication errors
   * @param {Error|string|object} error - Auth error
   * @param {boolean} showToast - Whether to show toast (default: true)
   * @returns {string} - Friendly error message
   */
  function handleAuthError(error, showToast = true) {
    const friendlyError = getFriendlyError(error);
    
    if (showToast && typeof Toast !== 'undefined') {
      Toast.error(friendlyError);
    }
    
    console.error('[Auth Error]', error);
    return friendlyError;
  }

  /**
   * Handle database errors
   * @param {Error|string|object} error - Database error
   * @param {boolean} showToast - Whether to show toast (default: true)
   * @returns {string} - Friendly error message
   */
  function handleDatabaseError(error, showToast = true) {
    const friendlyError = getFriendlyError(error);
    
    if (showToast && typeof Toast !== 'undefined') {
      Toast.error(friendlyError);
    }
    
    console.error('[Database Error]', error);
    return friendlyError;
  }

  /**
   * Handle network errors
   * @param {Error|string|object} error - Network error
   * @param {boolean} showToast - Whether to show toast (default: true)
   * @returns {string} - Friendly error message
   */
  function handleNetworkError(error, showToast = true) {
    const friendlyError = getFriendlyError(error);
    
    if (showToast && typeof Toast !== 'undefined') {
      Toast.error(friendlyError);
    }
    
    console.error('[Network Error]', error);
    return friendlyError;
  }

  /**
   * Handle validation errors
   * @param {Error|string|object} error - Validation error
   * @param {boolean} showToast - Whether to show toast (default: true)
   * @returns {string} - Friendly error message
   */
  function handleValidationError(error, showToast = true) {
    const friendlyError = getFriendlyError(error);
    
    if (showToast && typeof Toast !== 'undefined') {
      Toast.warning(friendlyError); // Use warning instead of error
    }
    
    console.warn('[Validation Error]', error);
    return friendlyError;
  }

  /**
   * Handle generic errors with automatic toast
   * @param {Error|string|object} error - Any error
   * @param {string} context - Context where error occurred (e.g., 'saving bill')
   * @returns {string} - Friendly error message
   */
  function handle(error, context = '') {
    const friendlyError = getFriendlyError(error);
    const message = context ? `Failed to ${context}. ${friendlyError}` : friendlyError;
    
    if (typeof Toast !== 'undefined') {
      Toast.error(message);
    }
    
    console.error(context ? `[Error: ${context}]` : '[Error]', error);
    return message;
  }

  // ===== CUSTOM ERROR MESSAGES =====

  /**
   * Register custom error pattern
   * @param {string} pattern - Pattern to match (case-insensitive)
   * @param {object} config - Error config { message, action }
   * @param {string} category - Category ('auth'|'database'|'network'|'validation')
   */
  function registerCustomError(pattern, config, category = 'validation') {
    const categoryMap = {
      auth: AUTH_ERRORS,
      database: DATABASE_ERRORS,
      network: NETWORK_ERRORS,
      validation: VALIDATION_ERRORS
    };

    const targetMap = categoryMap[category] || VALIDATION_ERRORS;
    targetMap[pattern] = config;
  }

  // ===== FORM VALIDATION HELPERS =====

  /**
   * Validate required field
   * @param {string} value - Field value
   * @param {string} fieldName - Field name for error message
   * @throws {Error} - If validation fails
   */
  function requireField(value, fieldName) {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      throw new Error(`${fieldName} is required`);
    }
  }

  /**
   * Validate positive number
   * @param {number} value - Number to validate
   * @param {string} fieldName - Field name for error message
   * @throws {Error} - If validation fails
   */
  function requirePositive(value, fieldName) {
    if (value <= 0) {
      throw new Error(`${fieldName} must be positive`);
    }
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @throws {Error} - If validation fails
   */
  function requireEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email address');
    }
  }

  // ===== PUBLIC API =====
  return {
    // Main error handler
    getFriendlyError,
    handle,
    
    // Category-specific handlers
    handleAuthError,
    handleDatabaseError,
    handleNetworkError,
    handleValidationError,
    
    // Custom error registration
    registerCustomError,
    
    // Validation helpers
    requireField,
    requirePositive,
    requireEmail
  };
})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ErrorMessages;
}
