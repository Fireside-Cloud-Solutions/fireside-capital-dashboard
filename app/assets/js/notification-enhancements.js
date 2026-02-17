/**
 * Notification Enhancements — Fireside Capital
 * 
 * Adds modern UX features to the notification system:
 * - Dismissible notifications
 * - Keyboard navigation (Arrow keys, Escape)
 * - Improved empty state
 * - Unread indicators
 * - Notification categories
 * - Toast notifications
 * 
 * Dependencies: Requires app.js to be loaded first
 * 
 * Implementation: Add to index.html after app.js
 * <script src="assets/js/notification-enhancements.js"></script>
 */

(function() {
  'use strict';

  // ===== CONFIGURATION =====
  const NOTIFICATION_CONFIG = {
    maxNotifications: 20,
    toastDuration: 5000, // 5 seconds
    categories: {
      'bill_due': { icon: 'bi-receipt', color: '#f44e24', label: 'Bill' },
      'bill_paid': { icon: 'bi-check-circle', color: '#81b900', label: 'Bill' },
      'budget_alert': { icon: 'bi-exclamation-triangle', color: '#ffc107', label: 'Budget' },
      'investment_update': { icon: 'bi-graph-up', color: '#81b900', label: 'Investment' },
      'connection_added': { icon: 'bi-person-plus', color: '#01a4ef', label: 'Friends' },
      'connection_removed': { icon: 'bi-person-dash', color: '#f44e24', label: 'Friends' },
      'system': { icon: 'bi-info-circle', color: '#01a4ef', label: 'System' }
    }
  };

  // ===== IMPROVED EMPTY STATE =====
  function renderEmptyState() {
    const noNotifEl = document.getElementById('noNotifications');
    if (noNotifEl) {
      noNotifEl.innerHTML = `
        <i class="bi bi-bell-slash"></i>
        <p class="mb-1">No notifications yet</p>
        <small>You'll see bill reminders and updates here</small>
      `;
    }
  }

  // ===== DISMISSIBLE NOTIFICATIONS =====
  window.dismissNotification = async function(notifId, event) {
    if (event) {
      event.stopPropagation(); // Prevent notification click
    }

    try {
      // Delete notification from database
      const { error } = await sb
        .from('notifications')
        .delete()
        .eq('id', notifId);

      if (error) throw error;

      // Remove from UI with fade out animation
      const notifItem = document.querySelector(`[data-notification-id="${notifId}"]`);
      if (notifItem) {
        notifItem.style.opacity = '0';
        notifItem.style.transform = 'translateX(20px)';
        setTimeout(() => {
          notifItem.remove();
          
          // Check if list is now empty
          const listEl = document.getElementById('notificationList');
          const items = listEl.querySelectorAll('.notification-item');
          if (items.length === 0) {
            const noNotifEl = document.getElementById('noNotifications');
            if (noNotifEl) noNotifEl.classList.remove('d-none');
          }
        }, 200);
      }

      // Update badge count
      if (window.updateNotificationBadge) {
        await window.updateNotificationBadge();
      }
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  // ===== KEYBOARD NAVIGATION =====
  function initKeyboardNavigation() {
    const dropdown = document.getElementById('notificationList');
    const bell = document.getElementById('notificationBell');
    
    if (!dropdown || !bell) return;

    document.addEventListener('keydown', (e) => {
      // Check if dropdown is open
      const isOpen = dropdown.classList.contains('show');
      
      if (!isOpen) return;

      // Escape key — Close dropdown
      if (e.key === 'Escape') {
        e.preventDefault();
        bell.click();
        bell.focus();
        return;
      }

      // Arrow navigation
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        
        const items = Array.from(dropdown.querySelectorAll('.notification-item'));
        if (items.length === 0) return;

        const currentFocus = document.activeElement;
        const currentIndex = items.indexOf(currentFocus);

        let nextIndex;
        if (e.key === 'ArrowDown') {
          nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        } else {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        }

        items[nextIndex].focus();
      }

      // Enter key — Activate focused notification
      if (e.key === 'Enter') {
        const focused = document.activeElement;
        if (focused.classList.contains('notification-item')) {
          focused.click();
        }
      }
    });

    // Make notification items focusable
    const observer = new MutationObserver(() => {
      const items = dropdown.querySelectorAll('.notification-item');
      items.forEach(item => {
        if (!item.hasAttribute('tabindex')) {
          item.setAttribute('tabindex', '0');
        }
      });
    });

    observer.observe(dropdown, { childList: true, subtree: true });
  }

  // ===== BELL ANIMATION FOR NEW NOTIFICATIONS =====
  function animateBellForNewNotification() {
    const bell = document.getElementById('notificationBell');
    if (!bell) return;

    bell.classList.add('has-unread');
    
    // Remove animation class after it completes
    setTimeout(() => {
      bell.classList.remove('has-unread');
    }, 500);
  }

  // ===== TOAST NOTIFICATION FOR REAL-TIME UPDATES =====
  function showToastNotification(notification) {
    // Remove existing toast if present
    const existingToast = document.querySelector('.notification-toast');
    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    
    const category = NOTIFICATION_CONFIG.categories[notification.type] || NOTIFICATION_CONFIG.categories['system'];
    
    toast.innerHTML = `
      <div class="toast show" role="alert" aria-live="polite" aria-atomic="true">
        <div class="toast-header">
          <i class="${category.icon} me-2" style="color: ${category.color};"></i>
          <strong class="me-auto">${escapeHtml(notification.title)}</strong>
          <button type="button" class="btn-close" aria-label="Close" onclick="this.closest('.notification-toast').remove()"></button>
        </div>
        <div class="toast-body">
          ${escapeHtml(notification.body || '')}
        </div>
      </div>
    `;

    document.body.appendChild(toast);

    // Auto-dismiss after duration
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, NOTIFICATION_CONFIG.toastDuration);

    // Animate bell
    animateBellForNewNotification();
  }

  // ===== ENHANCED MARK ALL AS READ =====
  const originalMarkAllRead = window.markAllNotificationsRead;
  window.markAllNotificationsRead = async function() {
    if (originalMarkAllRead) {
      await originalMarkAllRead();
    }

    // Remove unread class from all items
    const items = document.querySelectorAll('.notification-item.unread');
    items.forEach(item => item.classList.remove('unread'));

    // Provide visual feedback
    const btn = document.querySelector('.dropdown-header button');
    if (btn) {
      const originalText = btn.textContent;
      btn.textContent = '✓ Marked all read';
      btn.style.color = 'var(--color-success)';
      
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.color = '';
      }, 2000);
    }
  };

  // ===== LOADING STATE =====
  function showLoadingState() {
    const listEl = document.getElementById('notificationList');
    if (!listEl) return;

    // Remove old items
    const existingItems = listEl.querySelectorAll('.notification-item, .notification-loading');
    existingItems.forEach(el => el.remove());

    const loadingLi = document.createElement('li');
    loadingLi.className = 'notification-loading';
    loadingLi.innerHTML = `
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    `;

    listEl.appendChild(loadingLi);
  }

  // ===== ACCESSIBILITY: SCREEN READER ANNOUNCEMENTS =====
  function announceToScreenReader(message) {
    let liveRegion = document.getElementById('notificationLiveRegion');
    
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'notificationLiveRegion';
      liveRegion.className = 'sr-only';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      document.body.appendChild(liveRegion);
    }

    liveRegion.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 1000);
  }

  // ===== ENHANCE EXISTING NOTIFICATION SYSTEM =====
  function enhanceExistingSystem() {
    // Override loadNotifications to add enhancements
    const originalLoadNotifications = window.loadNotifications;
    
    if (originalLoadNotifications) {
      window.loadNotifications = async function() {
        showLoadingState();
        
        try {
          await originalLoadNotifications();
          
          // Apply enhancements to loaded notifications
          const items = document.querySelectorAll('.notification-item');
          items.forEach(item => {
            // Add tabindex for keyboard navigation
            item.setAttribute('tabindex', '0');
            
            // Add transition
            item.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
          });

          // Announce to screen reader
          announceToScreenReader(`${items.length} notification${items.length !== 1 ? 's' : ''} loaded`);

          // Render empty state if needed
          if (items.length === 0) {
            renderEmptyState();
          }
        } finally {
          // Always hide the loading spinner
          const loadingEl = document.querySelector('.notification-loading');
          if (loadingEl) {
            loadingEl.remove();
          }
        }
      };
    }

    // Enhance initNotifications to add toast support
    const originalInitNotifications = window.initNotifications;
    
    if (originalInitNotifications) {
      window.initNotifications = async function() {
        await originalInitNotifications();
        
        // Listen for new notifications and show toast
        if (window.sb && window.currentUser) {
          const channel = window.sb
            .channel('notification-toasts')
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${window.currentUser.id}`
              },
              (payload) => {
                if (payload.new) {
                  showToastNotification(payload.new);
                  announceToScreenReader(`New notification: ${payload.new.title}`);
                }
              }
            )
            .subscribe();
        }
      };
    }
  }

  // ===== INITIALIZATION =====
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Initialize enhancements
    initKeyboardNavigation();
    enhanceExistingSystem();
    renderEmptyState();

    // Add ARIA labels to notification button
    const bell = document.getElementById('notificationBell');
    if (bell && !bell.hasAttribute('aria-label')) {
      bell.setAttribute('aria-label', 'View notifications');
    }

  }

  // ===== HELPER: HTML ESCAPE =====
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Start initialization
  init();
})();
