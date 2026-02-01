// ===== SESSION SECURITY MODULE =====
// Implements inactivity timeout, absolute timeout, and security monitoring

// ===== SESSION SECURITY CONFIGURATION (MED-02) =====
// Updated timeouts for financial application security requirements
const SESSION_CONFIG = {
  INACTIVITY_TIMEOUT: 30 * 60 * 1000, // 30 minutes of inactivity
  ABSOLUTE_TIMEOUT: 8 * 60 * 60 * 1000, // 8 hours maximum session duration (stricter for finance apps)
  ACTIVITY_CHECK_INTERVAL: 60 * 1000, // Check every minute
  MAX_LOGIN_ATTEMPTS: 5, // Lock account after 5 failed attempts
  LOGIN_ATTEMPT_WINDOW: 15 * 60 * 1000, // 15 minute window for failed attempts
  WARNING_THRESHOLD: 5 * 60 * 1000 // Warn 5 minutes before timeout
};

class SessionSecurityManager {
  constructor(supabaseClient, onForceLogout) {
    this.sb = supabaseClient;
    this.onForceLogout = onForceLogout;
    this.lastActivity = Date.now();
    this.sessionStartTime = null;
    this.activityMonitor = null;
    this.loginAttempts = this.loadLoginAttempts();
    this.warningShown = false;
    this.isActive = false;
    
    this.init();
  }

  init() {
    // Track user activity
    this.registerActivityListeners();
    
    // Check for existing session
    this.sb.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        this.startSessionMonitoring();
      }
    });
  }

  registerActivityListeners() {
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, () => this.recordActivity(), { passive: true });
    });
  }

  recordActivity() {
    if (!this.isActive) return;
    
    this.lastActivity = Date.now();
    this.warningShown = false;
    
    // Clear any session warning
    this.hideSessionWarning();
  }

  startSessionMonitoring() {
    this.isActive = true;
    this.sessionStartTime = Date.now();
    this.lastActivity = Date.now();
    this.warningShown = false;
    
    // Clear any existing monitor
    if (this.activityMonitor) {
      clearInterval(this.activityMonitor);
    }
    
    // Start monitoring
    this.activityMonitor = setInterval(() => this.checkSessionValidity(), SESSION_CONFIG.ACTIVITY_CHECK_INTERVAL);
    
    console.log('[Security] Session monitoring started');
  }

  stopSessionMonitoring() {
    this.isActive = false;
    
    if (this.activityMonitor) {
      clearInterval(this.activityMonitor);
      this.activityMonitor = null;
    }
    
    this.sessionStartTime = null;
    this.hideSessionWarning();
    
    console.log('[Security] Session monitoring stopped');
  }

  checkSessionValidity() {
    if (!this.isActive) return;
    
    const now = Date.now();
    const inactiveTime = now - this.lastActivity;
    const sessionDuration = now - this.sessionStartTime;
    
    // Check absolute timeout (8 hours for financial app security)
    if (sessionDuration > SESSION_CONFIG.ABSOLUTE_TIMEOUT) {
      console.warn('[Security] Absolute session timeout reached (8 hours)');
      this.forceLogout('Your session has expired after 8 hours. Please log in again for security.');
      return;
    }
    
    // Check inactivity timeout (30 minutes)
    if (inactiveTime > SESSION_CONFIG.INACTIVITY_TIMEOUT) {
      console.warn('[Security] Inactivity timeout reached (30 minutes)');
      this.forceLogout('You have been logged out due to inactivity.');
      return;
    }
    
    // Show warning 5 minutes before timeout
    const timeUntilTimeout = SESSION_CONFIG.INACTIVITY_TIMEOUT - inactiveTime;
    if (timeUntilTimeout <= SESSION_CONFIG.WARNING_THRESHOLD && !this.warningShown) {
      this.showSessionWarning(Math.ceil(timeUntilTimeout / 60000));
      this.warningShown = true;
    }
  }

  showSessionWarning(minutesRemaining) {
    // Create or update warning banner
    let banner = document.getElementById('sessionWarningBanner');
    
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'sessionWarningBanner';
      banner.className = 'alert alert-warning position-fixed top-0 start-50 translate-middle-x mt-3';
      banner.style.cssText = 'z-index: 9999; max-width: 500px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
      banner.innerHTML = `
        <div class="d-flex align-items-center justify-content-between">
          <div>
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            <strong>Session expiring soon!</strong>
            <p class="mb-0 small">You'll be logged out in <span id="sessionWarningTime">${minutesRemaining}</span> minute(s) due to inactivity.</p>
          </div>
          <button type="button" class="btn-close" onclick="sessionSecurity.hideSessionWarning()"></button>
        </div>
      `;
      document.body.appendChild(banner);
    } else {
      document.getElementById('sessionWarningTime').textContent = minutesRemaining;
    }
  }

  hideSessionWarning() {
    const banner = document.getElementById('sessionWarningBanner');
    if (banner) {
      banner.remove();
    }
  }

  async forceLogout(reason) {
    this.stopSessionMonitoring();
    
    // Clear all session data
    this.clearAllSessionData();
    
    // Sign out from Supabase
    await this.sb.auth.signOut();
    
    // Show logout reason
    if (reason) {
      this.showLogoutMessage(reason);
    }
    
    // Call the logout callback
    if (this.onForceLogout) {
      this.onForceLogout(reason);
    }
  }

  clearAllSessionData() {
    // Clear data cache
    if (window.dataCache) {
      Object.keys(window.dataCache).forEach(key => delete window.dataCache[key]);
    }
    
    // Clear global data variables
    window.assets = [];
    window.investments = [];
    window.debts = [];
    window.bills = [];
    window.income = [];
    window.snapshots = [];
    window.settings = {};
    
    // Clear any charts
    if (window.netWorthChart) window.netWorthChart.destroy();
    if (window.cashFlowChart) window.cashFlowChart.destroy();
    if (window.emergencyFundChart) window.emergencyFundChart.destroy();
    
    console.log('[Security] All session data cleared');
  }

  showLogoutMessage(message) {
    // Check if we're on a page with a modal container
    const existingModal = document.getElementById('sessionTimeoutModal');
    if (existingModal) {
      existingModal.remove();
    }
    
    const modalHtml = `
      <div class="modal fade" id="sessionTimeoutModal" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header bg-warning">
              <h5 class="modal-title">
                <i class="bi bi-shield-exclamation me-2"></i>Session Expired
              </h5>
            </div>
            <div class="modal-body">
              <p>${message}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" data-bs-dismiss="modal" onclick="location.reload()">
                <i class="bi bi-box-arrow-in-right me-1"></i>Log In Again
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('sessionTimeoutModal'));
    modal.show();
  }

  // ===== LOGIN ATTEMPT TRACKING =====
  
  loadLoginAttempts() {
    try {
      const stored = sessionStorage.getItem('login_attempts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  saveLoginAttempts() {
    try {
      sessionStorage.setItem('login_attempts', JSON.stringify(this.loginAttempts));
    } catch (e) {
      console.error('[Security] Failed to save login attempts:', e);
    }
  }

  recordLoginAttempt(success, email) {
    const now = Date.now();
    
    // Clean old attempts (older than 15 minutes)
    this.loginAttempts = this.loginAttempts.filter(
      attempt => now - attempt.timestamp < SESSION_CONFIG.LOGIN_ATTEMPT_WINDOW
    );
    
    // Add new attempt
    this.loginAttempts.push({
      timestamp: now,
      success,
      email: email ? this.hashEmail(email) : null
    });
    
    this.saveLoginAttempts();
    
    // Check if account should be locked
    if (!success && this.isAccountLocked()) {
      return {
        locked: true,
        message: `Too many failed login attempts. Please wait ${this.getLockoutMinutes()} minutes before trying again.`
      };
    }
    
    return { locked: false };
  }

  isAccountLocked() {
    const now = Date.now();
    const recentFailures = this.loginAttempts.filter(
      attempt => !attempt.success && now - attempt.timestamp < SESSION_CONFIG.LOGIN_ATTEMPT_WINDOW
    );
    
    return recentFailures.length >= SESSION_CONFIG.MAX_LOGIN_ATTEMPTS;
  }

  getLockoutMinutes() {
    if (this.loginAttempts.length === 0) return 0;
    
    const oldestAttempt = this.loginAttempts[0];
    const now = Date.now();
    const elapsed = now - oldestAttempt.timestamp;
    const remaining = SESSION_CONFIG.LOGIN_ATTEMPT_WINDOW - elapsed;
    
    return Math.ceil(remaining / 60000);
  }

  clearLoginAttempts() {
    this.loginAttempts = [];
    this.saveLoginAttempts();
  }

  // Simple email hash for privacy (not for security)
  hashEmail(email) {
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      const char = email.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  // ===== TOKEN SECURITY =====
  
  async validateSessionIntegrity() {
    try {
      // Get current session
      const { data: { session }, error } = await this.sb.auth.getSession();
      
      if (error) {
        console.error('[Security] Session validation error:', error);
        this.forceLogout('Session validation failed. Please log in again.');
        return false;
      }
      
      if (!session) {
        return false;
      }
      
      // Check if token is expired
      if (session.expires_at && session.expires_at * 1000 < Date.now()) {
        console.warn('[Security] Token expired');
        this.forceLogout('Your session has expired. Please log in again.');
        return false;
      }
      
      return true;
    } catch (e) {
      console.error('[Security] Session integrity check failed:', e);
      this.forceLogout('Session integrity check failed. Please log in again.');
      return false;
    }
  }

  // ===== PUBLIC API =====
  
  onLogin() {
    this.clearLoginAttempts();
    this.startSessionMonitoring();
  }

  onLogout() {
    this.stopSessionMonitoring();
    this.clearAllSessionData();
  }

  extendSession() {
    // User can manually extend session
    this.recordActivity();
  }
}

// Export for global use
window.SessionSecurityManager = SessionSecurityManager;
