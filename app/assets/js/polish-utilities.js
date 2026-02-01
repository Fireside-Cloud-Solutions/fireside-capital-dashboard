// =====================================================================
// POLISH UTILITIES — UI/UX Enhancements
// Toast notifications, loading states, form validation, empty states
// =====================================================================

// ===== TOAST NOTIFICATION SYSTEM =====
const ToastManager = {
  container: null,
  
  init() {
    if (this.container) return;
    
    // Create toast container
    this.container = document.createElement('div');
    this.container.className = 'toast-container position-fixed top-0 end-0 p-3';
    this.container.style.zIndex = '9999';
    document.body.appendChild(this.container);
  },
  
  show(message, type = 'success', duration = 3000) {
    this.init();
    
    const toastId = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const iconMap = {
      success: 'bi-check-circle-fill',
      error: 'bi-x-circle-fill',
      warning: 'bi-exclamation-triangle-fill',
      info: 'bi-info-circle-fill'
    };
    
    const bgMap = {
      success: 'bg-success',
      error: 'bg-danger',
      warning: 'bg-warning',
      info: 'bg-info'
    };
    
    const toastHtml = `
      <div id="${toastId}" class="toast align-items-center text-white ${bgMap[type]} border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">
            <i class="bi ${iconMap[type]} me-2"></i>
            ${message}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    `;
    
    this.container.insertAdjacentHTML('beforeend', toastHtml);
    
    const toastElement = document.getElementById(toastId);
    const bsToast = new bootstrap.Toast(toastElement, { 
      autohide: duration > 0,
      delay: duration 
    });
    
    bsToast.show();
    
    // Clean up after toast is hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
      toastElement.remove();
    });
    
    return toastId;
  },
  
  success(message, duration = 3000) {
    return this.show(message, 'success', duration);
  },
  
  error(message, duration = 5000) {
    return this.show(message, 'error', duration);
  },
  
  warning(message, duration = 4000) {
    return this.show(message, 'warning', duration);
  },
  
  info(message, duration = 3000) {
    return this.show(message, 'info', duration);
  }
};

// ===== LOADING STATE MANAGER =====
const LoadingState = {
  // Show loading spinner on button
  buttonStart(buttonElement) {
    if (typeof buttonElement === 'string') {
      buttonElement = document.getElementById(buttonElement);
    }
    if (!buttonElement) return;
    
    buttonElement.disabled = true;
    buttonElement.dataset.originalHtml = buttonElement.innerHTML;
    buttonElement.innerHTML = `
      <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      Loading...
    `;
  },
  
  // Restore button to original state
  buttonEnd(buttonElement, newText = null) {
    if (typeof buttonElement === 'string') {
      buttonElement = document.getElementById(buttonElement);
    }
    if (!buttonElement) return;
    
    buttonElement.disabled = false;
    buttonElement.innerHTML = newText || buttonElement.dataset.originalHtml || buttonElement.innerHTML;
    delete buttonElement.dataset.originalHtml;
  },
  
  // Show loading overlay on container
  overlayStart(containerElement, message = 'Loading...') {
    if (typeof containerElement === 'string') {
      containerElement = document.getElementById(containerElement);
    }
    if (!containerElement) return;
    
    const loaderId = `loader-${Date.now()}`;
    const overlay = document.createElement('div');
    overlay.id = loaderId;
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">${message}</p>
      </div>
    `;
    
    containerElement.style.position = 'relative';
    containerElement.appendChild(overlay);
    
    return loaderId;
  },
  
  // Remove loading overlay
  overlayEnd(containerElement) {
    if (typeof containerElement === 'string') {
      containerElement = document.getElementById(containerElement);
    }
    if (!containerElement) return;
    
    const overlay = containerElement.querySelector('.loading-overlay');
    if (overlay) {
      overlay.remove();
    }
  },
  
  // Show skeleton loader
  skeleton(containerElement, count = 3) {
    if (typeof containerElement === 'string') {
      containerElement = document.getElementById(containerElement);
    }
    if (!containerElement) return;
    
    const skeletons = Array(count).fill(0).map(() => `
      <div class="skeleton-loader mb-3">
        <div class="skeleton-line" style="width: 60%;"></div>
        <div class="skeleton-line" style="width: 80%;"></div>
        <div class="skeleton-line" style="width: 40%;"></div>
      </div>
    `).join('');
    
    containerElement.innerHTML = skeletons;
  }
};

// ===== FORM VALIDATION HELPERS =====
const FormValidation = {
  // Add validation feedback to input
  setValid(inputElement, message = '') {
    if (typeof inputElement === 'string') {
      inputElement = document.getElementById(inputElement);
    }
    if (!inputElement) return;
    
    inputElement.classList.remove('is-invalid');
    inputElement.classList.add('is-valid');
    
    // Remove old feedback
    const oldFeedback = inputElement.parentElement.querySelector('.invalid-feedback, .valid-feedback');
    if (oldFeedback) oldFeedback.remove();
    
    if (message) {
      const feedback = document.createElement('div');
      feedback.className = 'valid-feedback';
      feedback.textContent = message;
      inputElement.parentElement.appendChild(feedback);
    }
  },
  
  setInvalid(inputElement, message) {
    if (typeof inputElement === 'string') {
      inputElement = document.getElementById(inputElement);
    }
    if (!inputElement) return;
    
    inputElement.classList.remove('is-valid');
    inputElement.classList.add('is-invalid');
    
    // Remove old feedback
    const oldFeedback = inputElement.parentElement.querySelector('.invalid-feedback, .valid-feedback');
    if (oldFeedback) oldFeedback.remove();
    
    const feedback = document.createElement('div');
    feedback.className = 'invalid-feedback';
    feedback.textContent = message;
    feedback.style.display = 'block';
    inputElement.parentElement.appendChild(feedback);
  },
  
  clearValidation(inputElement) {
    if (typeof inputElement === 'string') {
      inputElement = document.getElementById(inputElement);
    }
    if (!inputElement) return;
    
    inputElement.classList.remove('is-valid', 'is-invalid');
    const feedback = inputElement.parentElement.querySelector('.invalid-feedback, .valid-feedback');
    if (feedback) feedback.remove();
  },
  
  // Validate required fields
  validateRequired(value, fieldName = 'This field') {
    if (!value || String(value).trim() === '') {
      return { valid: false, message: `${fieldName} is required` };
    }
    return { valid: true };
  },
  
  // Validate email
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, message: 'Please enter a valid email address' };
    }
    return { valid: true };
  },
  
  // Validate number
  validateNumber(value, min = null, max = null, fieldName = 'Value') {
    const num = parseFloat(value);
    if (isNaN(num)) {
      return { valid: false, message: `${fieldName} must be a number` };
    }
    if (min !== null && num < min) {
      return { valid: false, message: `${fieldName} must be at least ${min}` };
    }
    if (max !== null && num > max) {
      return { valid: false, message: `${fieldName} must be at most ${max}` };
    }
    return { valid: true };
  },
  
  // Validate currency (positive number)
  validateCurrency(value, fieldName = 'Amount') {
    const result = this.validateNumber(value, 0, null, fieldName);
    if (!result.valid) return result;
    
    const num = parseFloat(value);
    if (num < 0) {
      return { valid: false, message: `${fieldName} must be positive` };
    }
    return { valid: true };
  }
};

// ===== EMPTY STATE HELPERS =====
const EmptyState = {
  render(containerElement, options = {}) {
    if (typeof containerElement === 'string') {
      containerElement = document.getElementById(containerElement);
    }
    if (!containerElement) return;
    
    const {
      icon = 'bi-inbox',
      title = 'No items yet',
      message = 'Get started by adding your first item.',
      actionText = 'Add Item',
      actionCallback = null,
      actionId = null
    } = options;
    
    const emptyHtml = `
      <div class="empty-state text-center py-5">
        <i class="bi ${icon}" style="font-size: 4rem; color: var(--color-text-secondary); opacity: 0.5;"></i>
        <h4 class="mt-4 mb-2">${title}</h4>
        <p class="text-muted mb-4">${message}</p>
        ${actionText ? `<button class="btn btn-primary" id="${actionId || 'emptyStateAction'}">
          <i class="bi bi-plus-lg me-2"></i>${actionText}
        </button>` : ''}
      </div>
    `;
    
    containerElement.innerHTML = emptyHtml;
    
    if (actionCallback && actionText) {
      const btn = document.getElementById(actionId || 'emptyStateAction');
      if (btn) {
        btn.addEventListener('click', actionCallback);
      }
    }
  }
};

// ===== CONFIRMATION DIALOG =====
const ConfirmDialog = {
  show(options = {}) {
    const {
      title = 'Confirm Action',
      message = 'Are you sure you want to proceed?',
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      confirmClass = 'btn-danger',
      onConfirm = () => {},
      onCancel = () => {}
    } = options;
    
    return new Promise((resolve) => {
      const modalId = `confirmModal-${Date.now()}`;
      const modalHtml = `
        <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">${title}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <p>${message}</p>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${cancelText}</button>
                <button type="button" class="btn ${confirmClass}" id="${modalId}-confirm">${confirmText}</button>
              </div>
            </div>
          </div>
        </div>
      `;
      
      document.body.insertAdjacentHTML('beforeend', modalHtml);
      
      const modalElement = document.getElementById(modalId);
      const modal = new bootstrap.Modal(modalElement);
      
      const confirmBtn = document.getElementById(`${modalId}-confirm`);
      confirmBtn.addEventListener('click', () => {
        onConfirm();
        resolve(true);
        modal.hide();
      });
      
      modalElement.addEventListener('hidden.bs.modal', () => {
        if (!confirmBtn.dataset.confirmed) {
          onCancel();
          resolve(false);
        }
        modalElement.remove();
      });
      
      confirmBtn.addEventListener('click', () => {
        confirmBtn.dataset.confirmed = 'true';
      });
      
      modal.show();
    });
  }
};

// ===== DEBOUNCE UTILITY =====
function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ===== AUTO-FORMAT CURRENCY INPUT =====
function formatCurrencyInput(inputElement) {
  if (typeof inputElement === 'string') {
    inputElement = document.getElementById(inputElement);
  }
  if (!inputElement) return;
  
  inputElement.addEventListener('blur', (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    if (value && !isNaN(value)) {
      e.target.value = parseFloat(value).toFixed(2);
    }
  });
  
  inputElement.addEventListener('focus', (e) => {
    e.target.value = e.target.value.replace(/[^0-9.]/g, '');
  });
}

// ===== PREVENT DOUBLE SUBMIT =====
function preventDoubleSubmit(formElement) {
  if (typeof formElement === 'string') {
    formElement = document.getElementById(formElement);
  }
  if (!formElement) return;
  
  formElement.addEventListener('submit', (e) => {
    const submitBtn = formElement.querySelector('[type="submit"]');
    if (submitBtn && !submitBtn.disabled) {
      LoadingState.buttonStart(submitBtn);
      
      // Re-enable after 5 seconds as a safety fallback
      setTimeout(() => {
        LoadingState.buttonEnd(submitBtn);
      }, 5000);
    }
  });
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.ToastManager = ToastManager;
  window.LoadingState = LoadingState;
  window.FormValidation = FormValidation;
  window.EmptyState = EmptyState;
  window.ConfirmDialog = ConfirmDialog;
  window.debounce = debounce;
  window.formatCurrencyInput = formatCurrencyInput;
  window.preventDoubleSubmit = preventDoubleSubmit;
}
