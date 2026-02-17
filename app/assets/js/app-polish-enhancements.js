// =====================================================================
// APP.JS POLISH ENHANCEMENTS
// This file enhances the main app.js with better UX
// Include AFTER app.js
// =====================================================================

// ===== ENHANCED ERROR HANDLER =====
function showError(error, context = '') {
  const friendlyMessage = getFriendlyError(error, context);
  ToastManager.error(friendlyMessage);
  console.error(`Error in ${context}:`, error);
}

function getFriendlyError(error, context) {
  const msg = (error?.message || error || '').toLowerCase();
  
  // Database errors
  if (msg.includes('permission denied') || msg.includes('rls')) {
    return 'You don\'t have permission to perform this action. Please try logging in again.';
  }
  if (msg.includes('unique constraint') || msg.includes('duplicate')) {
    return 'An item with this name already exists. Please use a different name.';
  }
  if (msg.includes('not found')) {
    return 'The requested item could not be found. It may have been deleted.';
  }
  if (msg.includes('network') || msg.includes('fetch failed')) {
    return 'Network error. Please check your connection and try again.';
  }
  if (msg.includes('timeout')) {
    return 'The request took too long. Please try again.';
  }
  
  // Context-specific errors
  if (context.includes('save') && msg.includes('column')) {
    return 'There was a problem saving your data. Some fields may not be supported.';
  }
  if (context.includes('delete')) {
    return 'Unable to delete this item. It may be in use elsewhere.';
  }
  if (context.includes('load') || context.includes('fetch')) {
    return 'Unable to load data. Please refresh the page and try again.';
  }
  
  // Default to the original message if it's user-friendly
  if (msg.length < 100 && !msg.includes('error')) {
    return error?.message || String(error);
  }
  
  return 'Something went wrong. Please try again or contact support if the problem persists.';
}

// ===== ENHANCED SAVE HANDLERS WITH LOADING STATES =====
// Override the original save functions with enhanced versions
if (typeof window.saveAsset === 'function') {
  const originalSaveAsset = window.saveAsset;
  window.saveAsset = async function() {
    const submitBtn = document.querySelector('#assetModal .btn-primary');
    LoadingState.buttonStart(submitBtn);
    
    try {
      await originalSaveAsset();
      ToastManager.success('Asset saved successfully!');
      LoadingState.buttonEnd(submitBtn);
    } catch (error) {
      showError(error, 'save asset');
      LoadingState.buttonEnd(submitBtn);
      throw error;
    }
  };
}

// ===== FORM VALIDATION ON BLUR =====
function setupFormValidation() {
  // Currency inputs
  document.querySelectorAll('input[type="number"][step="0.01"], input[placeholder*="$"]').forEach(input => {
    formatCurrencyInput(input);
    
    input.addEventListener('blur', () => {
      const value = input.value;
      if (value && input.hasAttribute('required')) {
        const result = FormValidation.validateCurrency(value, input.getAttribute('placeholder') || 'Amount');
        if (result.valid) {
          FormValidation.clearValidation(input);
        } else {
          FormValidation.setInvalid(input, result.message);
        }
      }
    });
  });
  
  // Required fields
  document.querySelectorAll('input[required], select[required], textarea[required]').forEach(input => {
    input.addEventListener('blur', () => {
      const value = input.value;
      if (!value || value.trim() === '') {
        const fieldName = input.getAttribute('placeholder') || input.getAttribute('name') || 'This field';
        FormValidation.setInvalid(input, `${fieldName} is required`);
      } else {
        FormValidation.clearValidation(input);
      }
    });
  });
  
  // Email inputs
  document.querySelectorAll('input[type="email"]').forEach(input => {
    input.addEventListener('blur', () => {
      const value = input.value;
      if (value) {
        const result = FormValidation.validateEmail(value);
        if (result.valid) {
          FormValidation.setValid(input);
        } else {
          FormValidation.setInvalid(input, result.message);
        }
      }
    });
  });
}

// ===== AUTO-FOCUS FIRST FIELD IN MODALS =====
function setupModalAutofocus() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('shown.bs.modal', () => {
      const firstInput = modal.querySelector('input:not([type="hidden"]), select, textarea');
      if (firstInput) {
        firstInput.focus();
      }
    });
    
    // Clear validation when modal is opened
    modal.addEventListener('show.bs.modal', () => {
      modal.querySelectorAll('.is-valid, .is-invalid').forEach(input => {
        FormValidation.clearValidation(input);
      });
    });
  });
}

// ===== PREVENT DOUBLE SUBMIT ON ALL FORMS =====
function setupDoubleSubmitPrevention() {
  document.querySelectorAll('form').forEach(form => {
    preventDoubleSubmit(form);
  });
}

// ===== ENHANCED DATA LOADING WITH LOADING STATES =====
const originalRenderAll = window.renderAll;
if (typeof originalRenderAll === 'function') {
  window.renderAll = async function() {
    const container = document.getElementById('dataContainer');
    if (container && !container.querySelector('.loading-overlay')) {
      LoadingState.overlayStart(container, 'Loading your financial data...');
    }
    
    try {
      await originalRenderAll();
      LoadingState.overlayEnd(container);
    } catch (error) {
      LoadingState.overlayEnd(container);
      showError(error, 'load data');
    }
  };
}

// ===== SETUP NULL/UNDEFINED PROTECTION IN UI =====
function safeDisplay(value, formatter = null) {
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  if (formatter) {
    return formatter(value);
  }
  return value;
}

// Override formatCurrency to handle null/undefined
const originalFormatCurrency = window.formatCurrency;
if (typeof originalFormatCurrency === 'function') {
  window.formatCurrency = function(value) {
    if (value === null || value === undefined) {
      return '$0.00';
    }
    return originalFormatCurrency(value);
  };
}

// Override formatDate to handle null/undefined
const originalFormatDate = window.formatDate;
if (typeof originalFormatDate === 'function') {
  window.formatDate = function(dateString) {
    if (!dateString || dateString === null || dateString === undefined) {
      return '—';
    }
    return originalFormatDate(dateString);
  };
}

// ===== TOOLTIPS FOR ABBREVIATIONS =====
function initializeTooltips() {
  // Bootstrap tooltip initialization
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
  
  // Add tooltips to common abbreviations
  document.querySelectorAll('abbr').forEach(abbr => {
    if (abbr.title && !abbr.hasAttribute('data-bs-toggle')) {
      new bootstrap.Tooltip(abbr);
    }
  });
}

// ===== RESPONSIVE TABLE WRAPPER =====
function makeTablesResponsive() {
  document.querySelectorAll('table:not(.table-responsive table)').forEach(table => {
    if (!table.closest('.table-responsive')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'table-responsive';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    }
  });
}

// ===== INITIALIZE ALL ENHANCEMENTS =====
function initializePolishEnhancements() {
  setupFormValidation();
  setupModalAutofocus();
  setupDoubleSubmitPrevention();
  initializeTooltips();
  makeTablesResponsive();
}

// Run on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePolishEnhancements);
} else {
  initializePolishEnhancements();
}

// Also run after the main app initializes
setTimeout(initializePolishEnhancements, 1000);
