// ===== FIRESIDE CAPITAL - CENTRALIZED EVENT HANDLERS =====
// FC-060/FC-061: Removed inline onclick handlers for CSP compliance
// All event listeners are registered here on DOMContentLoaded

document.addEventListener('DOMContentLoaded', function() {
  setupGlobalEventListeners();
});

function setupGlobalEventListeners() {
  // === PLAID LINK (appears on all pages) ===
  const plaidLinks = document.querySelectorAll('[data-action="open-plaid-link"]');
  plaidLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof openPlaidLink === 'function') {
        openPlaidLink();
      }
    });
  });

  // === MARK ALL NOTIFICATIONS READ (appears on all pages) ===
  const markAllReadBtn = document.getElementById('markAllReadBtn');
  if (markAllReadBtn) {
    markAllReadBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof markAllNotificationsRead === 'function') {
        markAllNotificationsRead();
      }
    });
  }

  // === DELETE CONFIRMATIONS ===
  setupDeleteConfirmations();

  // === PAGE-SPECIFIC HANDLERS ===
  setupAssetsPageHandlers();
  setupBillsPageHandlers();
  setupFriendsPageHandlers();
  setupOnboardingHandlers();
}

// === DELETE CONFIRMATION HANDLERS ===
function setupDeleteConfirmations() {
  // Asset delete confirmation
  const deleteAssetBtn = document.getElementById('confirmDeleteAssetBtn');
  if (deleteAssetBtn) {
    deleteAssetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof deleteAssetConfirmed === 'function') {
        deleteAssetConfirmed();
      }
    });
  }

  // Bill delete confirmation
  const deleteBillBtn = document.getElementById('confirmDeleteBillBtn');
  if (deleteBillBtn) {
    deleteBillBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof deleteBillConfirmed === 'function') {
        deleteBillConfirmed();
      }
    });
  }

  // Debt delete confirmation
  const deleteDebtBtn = document.getElementById('confirmDeleteDebtBtn');
  if (deleteDebtBtn) {
    deleteDebtBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof deleteDebtConfirmed === 'function') {
        deleteDebtConfirmed();
      }
    });
  }

  // Income delete confirmation
  const deleteIncomeBtn = document.getElementById('confirmDeleteIncomeBtn');
  if (deleteIncomeBtn) {
    deleteIncomeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof deleteIncomeConfirmed === 'function') {
        deleteIncomeConfirmed();
      }
    });
  }
}

// === ASSETS PAGE HANDLERS ===
function setupAssetsPageHandlers() {
  const openAssetModalBtn = document.getElementById('openAssetModalBtn');
  if (openAssetModalBtn) {
    openAssetModalBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof openAssetModal === 'function') {
        openAssetModal();
      }
    });
  }
}

// === BILLS PAGE HANDLERS ===
function setupBillsPageHandlers() {
  // Show all bills button
  const showAllBillsBtn = document.getElementById('showAllBillsBtn');
  if (showAllBillsBtn) {
    showAllBillsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof showAllBills === 'function') {
        showAllBills();
      }
    });
  }

  // Filter to subscriptions button
  const showSubscriptionsBtn = document.getElementById('showSubscriptionsBtn');
  if (showSubscriptionsBtn) {
    showSubscriptionsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof filterBillsToSubscriptions === 'function') {
        filterBillsToSubscriptions();
      }
    });
  }
}

// === FRIENDS PAGE HANDLERS ===
function setupFriendsPageHandlers() {
  // Focus friend search input buttons
  const focusSearchBtns = document.querySelectorAll('[data-action="focus-friend-search"]');
  focusSearchBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const searchInput = document.getElementById('friendSearchInput');
      if (searchInput) {
        searchInput.focus();
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });
}

// === ONBOARDING HANDLERS ===
function setupOnboardingHandlers() {
  // Get Started button
  const getStartedBtn = document.getElementById('onboardingGetStartedBtn');
  if (getStartedBtn) {
    getStartedBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof onboardingGetStarted === 'function') {
        onboardingGetStarted();
      }
    });
  }

  // Skip welcome button
  const skipWelcomeBtn = document.getElementById('onboardingSkipWelcomeBtn');
  if (skipWelcomeBtn) {
    skipWelcomeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof onboardingSkipWelcome === 'function') {
        onboardingSkipWelcome();
      }
    });
  }

  // Skip profile link
  const skipProfileLink = document.getElementById('onboardingSkipProfileLink');
  if (skipProfileLink) {
    skipProfileLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof onboardingSkipProfile === 'function') {
        onboardingSkipProfile();
      }
      return false;
    });
  }

  // Continue profile button
  const continueProfileBtn = document.getElementById('onboardingContinueProfileBtn');
  if (continueProfileBtn) {
    continueProfileBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof onboardingContinueProfile === 'function') {
        onboardingContinueProfile();
      }
    });
  }

  // Quick start action cards (event delegation)
  const quickStartCards = document.querySelectorAll('[data-onboarding-action]');
  quickStartCards.forEach(card => {
    card.addEventListener('click', (e) => {
      const action = e.currentTarget.dataset.onboardingAction;
      if (action && typeof onboardingQuickStartAction === 'function') {
        onboardingQuickStartAction(action);
      }
    });
  });

  // Skip quick start link
  const skipQuickStartLink = document.getElementById('onboardingSkipQuickStartLink');
  if (skipQuickStartLink) {
    skipQuickStartLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof onboardingSkipQuickStart === 'function') {
        onboardingSkipQuickStart();
      }
      return false;
    });
  }

  // Skip tour button
  const skipTourBtn = document.getElementById('onboardingSkipTourBtn');
  if (skipTourBtn) {
    skipTourBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof onboardingSkipTour === 'function') {
        onboardingSkipTour();
      }
    });
  }

  // Start tour button
  const startTourBtn = document.getElementById('onboardingStartTourBtn');
  if (startTourBtn) {
    startTourBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof onboardingStartTour === 'function') {
        onboardingStartTour();
      }
    });
  }

  // Complete onboarding button
  const completeBtn = document.getElementById('onboardingCompleteBtn');
  if (completeBtn) {
    completeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof onboardingComplete === 'function') {
        onboardingComplete();
      }
    });
  }
}
