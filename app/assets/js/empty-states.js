/**
 * Empty State Components for Fireside Capital
 * Provides modern, brand-aligned empty states for all pages
 */

// Empty state configurations with Heroicons SVG paths
const EMPTY_STATES = {
  dashboard: {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>`,
    title: "Welcome to Fireside Capital",
    text: "Start by adding your assets, income, bills, and debts to track your financial health.",
    cta: "Get Started",
    action: () => window.location.href = 'assets.html'
  },
  assets: {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>`,
    title: "No assets yet",
    text: "Start tracking your real estate, vehicles, and other valuables to see your total net worth.",
    cta: "Add Your First Asset",
    action: () => typeof openAssetModal === 'function' && openAssetModal()
  },
  bills: {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>`,
    title: "No bills yet",
    text: "Add your recurring bills to track payment due dates and budget more effectively.",
    cta: "Add Your First Bill",
    action: () => typeof openBillModal === 'function' && openBillModal()
  },
  budget: {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>`,
    title: "No budget yet",
    text: "Generate your first monthly budget based on your bills, income, and goals.",
    cta: "Generate Budget",
    action: () => typeof generateBudget === 'function' && generateBudget()
  },
  debts: {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>`,
    title: "No debts tracked",
    text: "Add loans, credit cards, and other debts to plan your payoff strategy.",
    cta: "Add Your First Debt",
    action: () => typeof openDebtModal === 'function' && openDebtModal()
  },
  friends: {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>`,
    title: "No friends yet",
    text: "Add friends to split bills and share expenses easily.",
    cta: "Add Your First Friend",
    action: () => typeof openAddFriendModal === 'function' && openAddFriendModal()
  },
  income: {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>`,
    title: "No income sources yet",
    text: "Track your W2, 1099, and other income sources to understand your total earnings.",
    cta: "Add Your First Income Source",
    action: () => typeof openIncomeModal === 'function' && openIncomeModal()
  },
  investments: {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>`,
    title: "No investments yet",
    text: "Track your 401(k), IRA, brokerage accounts, and watch your wealth grow.",
    cta: "Add Your First Investment",
    action: () => typeof openInvestmentModal === 'function' && openInvestmentModal()
  },
  reports: {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>`,
    title: "No data to report",
    text: "Add assets, bills, income, and debts to generate financial reports.",
    cta: "Get Started",
    action: () => window.location.href = 'assets.html'
  },
  subscriptions: {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3-3v8a3 3 0 003 3z" />
    </svg>`,
    title: "No subscriptions yet",
    text: "Add monthly bills to automatically track your recurring subscriptions and memberships.",
    cta: "Add a Bill",
    action: () => window.location.href = 'bills.html'
  },
  upcomingPayments: {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>`,
    title: "No upcoming payments",
    text: "You're all clear for the next 7 days! Add bills or debts to track future payment due dates.",
    cta: "Add a Bill",
    action: () => window.location.href = 'bills.html'
  }
};

/**
 * Generate HTML for an empty state
 * @param {string} type - The type of empty state (assets, bills, etc.)
 * @returns {string} HTML string for the empty state
 */
function generateEmptyStateHTML(type) {
  const config = EMPTY_STATES[type];
  if (!config) {
    console.warn(`Empty state type "${type}" not found`);
    return '';
  }

  return `
    <div class="empty-state" data-empty-state="${type}">
      <div class="empty-state-icon">
        ${config.icon}
      </div>
      <h3 class="empty-state-title">${config.title}</h3>
      <p class="empty-state-text">${config.text}</p>
      <button class="btn btn-secondary" onclick="handleEmptyStateAction('${type}')">
        ${config.cta}
      </button>
    </div>
  `;
}

/**
 * Handle empty state CTA button clicks
 * @param {string} type - The type of empty state
 */
function handleEmptyStateAction(type) {
  const config = EMPTY_STATES[type];
  if (config && config.action) {
    config.action();
  }
}

/**
 * Show empty state in a container, hide data table
 * @param {string} containerId - ID of the container element
 * @param {string} type - The type of empty state
 */
function showEmptyState(containerId, type) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Hide table if it exists
  const table = container.querySelector('.table-card, .table-responsive, table');
  if (table) {
    table.style.display = 'none';
  }

  // Check if empty state already exists
  let emptyStateEl = container.querySelector('.empty-state');
  if (!emptyStateEl) {
    container.insertAdjacentHTML('beforeend', generateEmptyStateHTML(type));
  } else {
    emptyStateEl.style.display = 'block';
  }
}

/**
 * Hide empty state, show data table
 * @param {string} containerId - ID of the container element
 */
function hideEmptyState(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Show table if it exists
  const table = container.querySelector('.table-card, .table-responsive, table');
  if (table) {
    table.style.display = '';
  }

  // Hide empty state
  const emptyStateEl = container.querySelector('.empty-state');
  if (emptyStateEl) {
    emptyStateEl.style.display = 'none';
  }
}

/**
 * Toggle empty state based on data availability
 * @param {string} containerId - ID of the container element
 * @param {string} type - The type of empty state
 * @param {Array|boolean} data - Data array or boolean indicating if data exists
 */
function toggleEmptyState(containerId, type, data) {
  const hasData = Array.isArray(data) ? data.length > 0 : !!data;
  
  if (hasData) {
    hideEmptyState(containerId);
  } else {
    showEmptyState(containerId, type);
  }
}

// Make functions globally available
window.generateEmptyStateHTML = generateEmptyStateHTML;
window.handleEmptyStateAction = handleEmptyStateAction;
window.showEmptyState = showEmptyState;
window.hideEmptyState = hideEmptyState;
window.toggleEmptyState = toggleEmptyState;
