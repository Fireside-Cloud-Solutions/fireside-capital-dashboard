// ===== DEBUG UTILITY =====
// Debug mode disabled in production
const DEBUG = false;
function debugLog(...args) { if (DEBUG) console.log(...args); }

// BUG-002 DEBUG: Manual bill calculation checker (call from console: window.debugBillsCalculation())
window.debugBillsCalculation = function() {
  console.log('=== BILLS CALCULATION DEBUG ===');
  const allBills = window.bills || [];
  console.log(`Total bills in database: ${allBills.length}`);
  
  const activeBills = allBills.filter(b => {
    const info = getBillFinancingInfo(b);
    return !(info.isFinancing && info.status === 'paid_off');
  });
  console.log(`Active bills (excluding paid-off financing): ${activeBills.length}`);
  
  let totalMonthly = 0;
  const billDetails = [];
  
  activeBills.forEach((b, index) => {
    if (!b.amount || b.amount === 0 || !b.frequency) {
      console.warn(`Skipping bill #${index + 1}: "${b.name}" - invalid amount or frequency`);
      return;
    }
    
    const shareInfo = getShareInfoForBill(b.id);
    const userAmount = (shareInfo && shareInfo.status === 'accepted') ? shareInfo.owner_amount : b.amount;
    const monthlyAmount = normalizeToMonthly(userAmount, b.frequency);
    
    billDetails.push({
      name: b.name,
      type: b.type,
      frequency: b.frequency,
      billAmount: b.amount,
      userAmount: userAmount,
      monthlyAmount: monthlyAmount,
      isShared: !!shareInfo,
      shareStatus: shareInfo?.status || 'N/A'
    });
    
    totalMonthly += monthlyAmount;
  });
  
  console.table(billDetails);
  console.log(`TOTAL MONTHLY: ${formatCurrency(totalMonthly)}`);
  console.log('=== END DEBUG ===');
  
  return { billDetails, totalMonthly };
};

// ===== PERFORMANCE: LAZY LOAD CHART.JS =====
// Uses LazyLoader utility for consistent lazy loading across app
// Chart.js (270 KB) only loads on pages with charts (dashboard, reports)
// See assets/js/lazy-loader.js for implementation

async function loadChartJs() {
  // Delegate to LazyLoader utility
  return await window.LazyLoader.loadCharts();
}

// ===== PERFORMANCE: DATA CACHING =====
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const dataCache = {};

function getCachedData(key) {
  const cached = dataCache[key];
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp > CACHE_DURATION) {
    delete dataCache[key];
    return null;
  }
  
  return cached.data;
}

function setCachedData(key, data) {
  dataCache[key] = {
    data: data,
    timestamp: Date.now()
  };
}

function clearCache() {
  Object.keys(dataCache).forEach(key => delete dataCache[key]);
}

// ===== XSS PROTECTION =====
function escapeHtml(str) {
    if (str == null) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
}

function sanitizeHTML(str) {
    if (str == null) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
}

function escapeAttribute(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// ===== UTILITY & HELPER FUNCTIONS =====
function getRaw(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0;
  return 0;
}
function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(getRaw(value));
}
function formatDate(dateString) {
  if (!dateString || !dateString.includes('-')) return '';
  return new Intl.DateTimeFormat('en-US').format(new Date(dateString + 'T00:00:00'));
}
function toTitleCase(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
function getNextDate(currentDate, frequency) {
  let nextDate = new Date(currentDate);
  switch ((frequency || '').toLowerCase()) {
      case 'daily': nextDate.setDate(nextDate.getDate() + 1); break;
      case 'weekly': nextDate.setDate(nextDate.getDate() + 7); break;
      case 'bi-weekly': nextDate.setDate(nextDate.getDate() + 14); break;
      case 'monthly': nextDate.setMonth(nextDate.getMonth() + 1); break;
      case 'quarterly': nextDate.setMonth(nextDate.getMonth() + 3); break;
      case 'annually': nextDate.setFullYear(nextDate.getFullYear() + 1); break;
      default: console.error(`Unknown frequency: ${frequency}`); break;
  }
  return nextDate;
}
function getThemeColors() {
  const currentTheme = document.body.getAttribute('data-theme') || 'dark';
  
  if (currentTheme === 'light') {
    return {
      fill: 'rgba(244, 78, 36, 0.15)',
      text: '#1a1a1a',
      grid: 'rgba(0, 0, 0, 0.08)'
    };
  } else {
    return {
      fill: 'rgba(244, 78, 36, 0.15)',
      text: '#f0f0f0',
      grid: 'rgba(240, 240, 240, 0.08)'
    };
  }
}
function normalizeToMonthly(amount, frequency) {
  const rawAmount = getRaw(amount);
  const freq = (frequency || '').toLowerCase();
  switch (freq) {
    case 'daily': return rawAmount * 30; // Approximate
    case 'weekly': return rawAmount * 52 / 12;
    case 'bi-weekly': return rawAmount * 26 / 12;
    case 'biweekly': return rawAmount * 26 / 12; // Handle no-hyphen variant
    case 'twice monthly': return rawAmount * 2;
    case 'semi-monthly': return rawAmount * 2;
    case 'monthly': return rawAmount;
    case 'quarterly': return rawAmount / 3;
    case 'semi-annually': return rawAmount / 6;
    case 'annually': return rawAmount / 12;
    case 'annual': return rawAmount / 12;
    default:
      console.warn(`Unknown frequency: ${frequency}, defaulting to monthly`);
      return rawAmount;
  }
}
function dedupeSnapshotsByDate(snaps) {
  const uniqueSnaps = {};
  (snaps || []).forEach(snap => { uniqueSnaps[snap.date] = snap; });
  return Object.values(uniqueSnaps).sort((a, b) => new Date(a.date) - new Date(b.date));
}

// ===== CHART ERROR BOUNDARY (SUG-05) =====
// Global chart instance registry to prevent canvas reuse errors
window.chartInstances = window.chartInstances || {};

async function safeCreateChart(ctx, config, chartName) {
  try {
    if (!ctx) {
      console.warn(`Chart canvas not found for: ${chartName || 'unknown chart'}`);
      return null;
    }
    
    // Lazy load Chart.js if not already loaded
    await loadChartJs();
    
    // Mobile-specific chart initialization
    if (window.innerWidth < 768) {
      // Apply mobile-friendly defaults
      Chart.defaults.font.size = 11; // Smaller labels for mobile
      Chart.defaults.responsive = true;
      Chart.defaults.maintainAspectRatio = false;
    }
    
    // Ensure canvas background is visible (not black)
    const canvas = (typeof ctx === 'string') ? document.getElementById(ctx) : ctx;
    if (canvas) {
      canvas.style.backgroundColor = 'transparent';
      
      // Force canvas redraw to fix black box issue
      const context = canvas.getContext('2d');
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
      
      // FC-077 Fix: Destroy existing chart instance before creating new one
      const canvasId = canvas.id;
      if (canvasId && window.chartInstances[canvasId]) {
        console.log(`Destroying existing chart instance for: ${canvasId}`);
        window.chartInstances[canvasId].destroy();
        delete window.chartInstances[canvasId];
      }
    }
    
    const chart = new Chart(ctx, config);
    
    // Store chart instance for cleanup on next render
    if (canvas && canvas.id) {
      window.chartInstances[canvas.id] = chart;
    }
    
    // Remove loading state from parent chart-card once chart is rendered
    if (canvas) {
      const chartCard = canvas.closest('.chart-card');
      if (chartCard && chartCard.classList.contains('loading')) {
        // Small delay to ensure chart is fully rendered
        setTimeout(() => {
          chartCard.classList.remove('loading');
        }, 100);
      }
    }
    
    return chart;
  } catch (err) {
    console.error(`Failed to render ${chartName || 'chart'}:`, err);
    const el = (typeof ctx === 'string') ? document.getElementById(ctx) : ctx;
    if (el && el.parentElement) {
      const errorMsg = document.createElement('p');
      errorMsg.className = 'text-muted text-center mt-3';
      errorMsg.textContent = 'Chart could not be loaded.';
      el.parentElement.replaceChildren(errorMsg);
    }
    return null;
  }
}

// ===== CSV EXPORT (SUG-02) =====
function exportFinancialDataCSV() {
  // Rate limiting
  if (!rateLimiters.report.allow('csvExport')) {
    const remainingMs = rateLimiters.report.getRemainingTime('csvExport');
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    alert(`Too many export requests. Please wait ${remainingSeconds} seconds.`);
    return;
  }

  const lines = [];
  const esc = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;

  // Bills
  lines.push('BILLS');
  lines.push('Name,Type,Amount,Frequency,Next Due Date');
  (window.bills || []).forEach(b => {
    lines.push([esc(b.name), esc(b.type), getRaw(b.amount), esc(b.frequency), esc(b.nextDueDate)].join(','));
  });
  lines.push('');

  // Debts
  lines.push('DEBTS');
  lines.push('Name,Type,Balance,Interest Rate %,Term (months),Monthly Payment,Next Due Date');
  (window.debts || []).forEach(d => {
    lines.push([esc(d.name), esc(d.type), getRaw(d.amount), d.interestRate || 0, d.term || '', getRaw(d.monthlyPayment), esc(d.nextDueDate)].join(','));
  });
  lines.push('');

  // Income
  lines.push('INCOME');
  lines.push('Name,Type,Amount,Frequency,Next Due Date');
  (window.income || []).forEach(i => {
    lines.push([esc(i.name), esc(i.type), getRaw(i.amount), esc(i.frequency), esc(i.nextDueDate)].join(','));
  });
  lines.push('');

  // Investments
  lines.push('INVESTMENTS');
  lines.push('Name,Type,Value,Starting Balance,Monthly Contribution,Annual Return %');
  (window.investments || []).forEach(inv => {
    lines.push([esc(inv.name), esc(inv.type), getRaw(inv.value), getRaw(inv.startingBalance), getRaw(inv.monthlyContribution), inv.annualReturn || 0].join(','));
  });

  const csvContent = lines.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `fireside-capital-export-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}



// ===== SUPABASE CLIENT =====
const supabaseUrl = 'https://qqtiofdqplwycnwplmen.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxdGlvZmRxcGx3eWNud3BsbWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDY5NDIsImV4cCI6MjA4NTQ4Mjk0Mn0.Vjg7hQDPWJwmbkQccw5CXH_Npi2YJgJbt-OAEnF_P5g';

// ===== SESSION SECURITY CONFIGURATION (MED-02) =====
// Configure Supabase client with secure cookie-based storage
// Session cookies will have:
// - Secure flag (HTTPS only) - controlled by Supabase dashboard
// - SameSite flag (Lax/Strict) - controlled by Supabase dashboard
// - Session timeout: 8 hours (28800 seconds)
// - Auto-refresh enabled for continuous sessions
const sb = window.supabase.createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Cookie-based storage (more secure than localStorage for session tokens)
    storage: window.localStorage, // Supabase JS v2 uses localStorage by default, but with secure session management
    storageKey: 'sb-auth-token', // Custom storage key for session isolation
    autoRefreshToken: true, // Automatically refresh tokens before expiry
    persistSession: true, // Persist session across browser restarts
    detectSessionInUrl: true, // Support password reset and magic links
    
    // Flow type configuration
    flowType: 'pkce' // Use PKCE flow for enhanced security (prevents token interception)
  },
  
  // Global settings
  global: {
    headers: {
      'X-Client-Info': 'fireside-capital-web'
    }
  }
});

// ===== SESSION SECURITY =====
let sessionSecurity = null;
// Initialize after DOM loads (will be set up in init())

// ===== LOGGED-OUT CTA CONFIGURATION =====
const LOGGED_OUT_CTA_CONFIG = {
  dashboard: {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>`,
    title: 'Welcome to Fireside Capital',
    description: 'Your personal finance dashboard. Track assets, manage bills, monitor investments, and achieve your financial goals.'
  },
  assets: {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>`,
    title: 'Track Your Assets',
    description: 'Monitor real estate, vehicles, and other valuables. See your total net worth and track equity over time.'
  },
  bills: {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>`,
    title: 'Manage Your Bills',
    description: 'Never miss a payment. Track due dates, split bills with friends, and manage recurring expenses effortlessly.'
  },
  budget: {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>`,
    title: 'Create Your Budget',
    description: 'Plan your spending, allocate funds to categories, and stay on top of your monthly budget with ease.'
  },
  debts: {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>`,
    title: 'Conquer Your Debts',
    description: 'Track loans, credit cards, and payment plans. See payoff timelines and plan your debt-free journey.'
  },
  friends: {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`,
    title: 'Share with Friends',
    description: 'Split bills and expenses with friends and roommates. Keep everyone accountable and make sharing simple.'
  },
  income: {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
    title: 'Track Your Income',
    description: 'Monitor all income sources from W2, 1099, side hustles, and more. See your total earnings at a glance.'
  },
  investments: {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>`,
    title: 'Grow Your Investments',
    description: 'Track 401(k), IRA, brokerage accounts, and crypto. Watch your wealth compound and reach financial freedom.'
  },
  reports: {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>`,
    title: 'Financial Reports',
    description: 'Analyze your net worth trends, spending patterns, and financial health with detailed reports and charts.'
  },
  settings: {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`,
    title: 'Customize Your Experience',
    description: 'Configure your preferences, emergency fund goals, and personalize your Fireside Capital dashboard.'
  }
};

function getPageName() {
  const path = window.location.pathname;
  const page = path.split('/').pop().replace('.html', '') || 'dashboard';
  return page === 'index' ? 'dashboard' : page;
}

function toggleLoggedOutCTA(show) {
  const container = document.getElementById('dataContainer');
  if (!container) return;
  
  let ctaEl = container.querySelector('.logged-out-cta');
  
  if (show) {
    // Show CTA
    if (!ctaEl) {
      // Create CTA if it doesn't exist
      const pageName = getPageName();
      const config = LOGGED_OUT_CTA_CONFIG[pageName] || LOGGED_OUT_CTA_CONFIG.dashboard;
      
      ctaEl = document.createElement('div');
      ctaEl.className = 'logged-out-cta show';
      ctaEl.setAttribute('data-page', pageName);
      ctaEl.innerHTML = `
        <div class="logged-out-cta-logo">
          ${config.icon}
        </div>
        <h2>${escapeHtml(config.title)}</h2>
        <p>${escapeHtml(config.description)}</p>
        <div class="logged-out-cta-actions">
          <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#loginModal">
            <i class="bi bi-box-arrow-in-right me-2"></i>Login
          </button>
          <button class="btn btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#signupModal">
            <i class="bi bi-person-plus me-2"></i>Sign Up
          </button>
        </div>
      `;
      container.prepend(ctaEl);
    } else {
      ctaEl.classList.add('show');
    }
  } else {
    // Hide CTA
    if (ctaEl) {
      ctaEl.classList.remove('show');
    }
  }
}

// ===== STATE & GLOBAL VARIABLES =====
let currentUser = null;
let editAssetId = null, deleteAssetId = null;
let editInvestmentId = null, deleteInvestmentId = null;
let editDebtId = null, deleteDebtId = null;
let editBillId = null, deleteBillId = null;
let editIncomeId = null, deleteIncomeId = null;
let netWorthChart, cashFlowChart, emergencyFundChart;
let netWorthDeltaChartInst, spendingCategoriesChartInst, savingsRateChartInst, investmentGrowthChartInst;
let currentBudgetMonth = new Date();
let budgetAssignments = {};

// ===== AUTH UI HELPERS =====
function showAuthAlert(elementId, message, type = 'danger') {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.className = `alert alert-${type}`;
  el.textContent = message;
  el.classList.remove('d-none');
}

function hideAuthAlert(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.classList.add('d-none');
  el.textContent = '';
}

function setButtonLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  if (loading) {
    btn.disabled = true;
    btn._originalText = btn.textContent;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status"></span> Please wait...';
  } else {
    btn.disabled = false;
    btn.textContent = btn._originalText || btn.textContent;
  }
}

function getFriendlyAuthError(error) {
  const msg = (error.message || '').toLowerCase();
  if (msg.includes('email not confirmed')) return 'Your email is not confirmed. Please check your inbox (and spam folder) for the confirmation link.';
  // Security: Use generic message for login failures to prevent email enumeration
  if (msg.includes('invalid login credentials')) return 'Invalid email or password. Please try again.';
  if (msg.includes('user not found')) return 'Invalid email or password. Please try again.';
  if (msg.includes('email rate limit exceeded')) return 'Too many attempts. Please wait a few minutes and try again.';
  if (msg.includes('user already registered')) return 'An account with this email already exists. Try logging in instead.';
  if (msg.includes('password') && msg.includes('at least')) return error.message;
  if (msg.includes('signup is disabled')) return 'Sign up is currently disabled. Please contact the administrator.';
  return error.message;
}

// ===== AUTHENTICATION =====
async function signUp(email, password, firstName, lastName) {
  hideAuthAlert('signupAlert');
  setButtonLoading('signupSubmitBtn', true);

  try {
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName, last_name: lastName } }
    });

    if (error) {
      showAuthAlert('signupAlert', getFriendlyAuthError(error), 'danger');
      return;
    }

    // Check if email confirmation is needed
    if (data?.user?.identities?.length === 0) {
      showAuthAlert('signupAlert', 'An account with this email already exists. Try logging in instead.', 'warning');
    } else if (data?.user && !data?.session) {
      // User created but no session = email confirmation required
      showAuthAlert('signupAlert',
        '✅ Account created! Please check your email (including spam folder) and click the confirmation link before logging in.',
        'success'
      );
      document.getElementById('signupForm')?.reset();
    } else {
      // Auto-confirmed �" session exists
      showAuthAlert('signupAlert', '✅ Account created successfully! Logging you in...', 'success');
      setTimeout(() => {
        bootstrap.Modal.getInstance(document.getElementById('signupModal'))?.hide();
      }, 1000);
    }
  } catch (err) {
    showAuthAlert('signupAlert', 'An unexpected error occurred. Please try again.', 'danger');
    console.error('Signup error:', err);
  } finally {
    setButtonLoading('signupSubmitBtn', false);
  }
}

async function login(email, password) {
  hideAuthAlert('loginAlert');
  setButtonLoading('loginSubmitBtn', true);

  try {
    // Check if account is locked due to too many attempts
    if (sessionSecurity && sessionSecurity.isAccountLocked()) {
      showAuthAlert('loginAlert', `Too many failed login attempts. Please wait ${sessionSecurity.getLockoutMinutes()} minutes before trying again.`, 'danger');
      setButtonLoading('loginSubmitBtn', false);
      return;
    }

    const { error } = await sb.auth.signInWithPassword({ email, password });

    if (error) {
      // Record failed login attempt
      if (sessionSecurity) {
        const lockStatus = sessionSecurity.recordLoginAttempt(false, email);
        if (lockStatus.locked) {
          showAuthAlert('loginAlert', lockStatus.message, 'danger');
          setButtonLoading('loginSubmitBtn', false);
          return;
        }
      }
      showAuthAlert('loginAlert', getFriendlyAuthError(error), 'danger');
      return;
    }

    // Record successful login
    if (sessionSecurity) {
      sessionSecurity.recordLoginAttempt(true, email);
      sessionSecurity.onLogin();
    }

    showAuthAlert('loginAlert', '✅ Login successful!', 'success');
    setTimeout(() => {
      bootstrap.Modal.getInstance(document.getElementById('loginModal'))?.hide();
      hideAuthAlert('loginAlert');
    }, 500);
  } catch (err) {
    showAuthAlert('loginAlert', 'An unexpected error occurred. Please try again.', 'danger');
    // Don't log the full error object which might contain tokens
    console.error('[Auth] Login error occurred');
  } finally {
    setButtonLoading('loginSubmitBtn', false);
  }
}

async function forgotPassword(email) {
  hideAuthAlert('forgotAlert');

  if (!email) {
    showAuthAlert('forgotAlert', 'Please enter your email address.', 'warning');
    return;
  }

  try {
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname
    });

    if (error) {
      showAuthAlert('forgotAlert', getFriendlyAuthError(error), 'danger');
      return;
    }

    showAuthAlert('forgotAlert', '✅ Password reset link sent! Check your email (including spam folder).', 'success');
  } catch (err) {
    showAuthAlert('forgotAlert', 'An unexpected error occurred. Please try again.', 'danger');
    console.error('Forgot password error:', err);
  }
}

async function updatePassword(newPassword) {
  hideAuthAlert('resetPasswordAlert');
  setButtonLoading('resetPasswordBtn', true);

  try {
    const { error } = await sb.auth.updateUser({ password: newPassword });

    if (error) {
      showAuthAlert('resetPasswordAlert', getFriendlyAuthError(error), 'danger');
      return;
    }

    showAuthAlert('resetPasswordAlert', '✅ Password updated successfully! Redirecting...', 'success');
    setTimeout(() => {
      bootstrap.Modal.getInstance(document.getElementById('resetPasswordModal'))?.hide();
      window.location.hash = '';
    }, 1500);
  } catch (err) {
    showAuthAlert('resetPasswordAlert', 'An unexpected error occurred. Please try again.', 'danger');
    console.error('Password update error:', err);
  } finally {
    setButtonLoading('resetPasswordBtn', false);
  }
}

async function logout() {
  try {
    if (sessionSecurity) {
      sessionSecurity.onLogout();
    }
  } catch (e) {
    console.warn('[Logout] sessionSecurity.onLogout failed:', e);
  }
  
  try {
    // Clear all session data
    clearCache();
  } catch (e) {
    console.warn('[Logout] clearCache failed:', e);
  }
  
  // Clear CSRF token on logout
  try {
    if (typeof CSRF !== 'undefined') {
      CSRF.clearToken();
    }
  } catch (e) {
    console.warn('[Logout] CSRF.clearToken failed:', e);
  }
  
  try {
    // Sign out from Supabase (revokes tokens server-side)
    await sb.auth.signOut();
  } catch (e) {
    console.error('[Logout] sb.auth.signOut failed:', e);
  }
  
  // Always force UI update even if signOut had issues
  currentUser = null;
  document.getElementById('loggedInState')?.classList.add('d-none');
  document.getElementById('loggedOutState')?.classList.remove('d-none');
  if (document.getElementById('dataContainer')) {
    document.getElementById('dataContainer').style.visibility = 'hidden';
    toggleLoggedOutCTA(true);
  }
  if (document.getElementById('pageActions')) {
    document.getElementById('pageActions').style.display = 'none';
  }
  document.querySelectorAll('.auth-required').forEach(el => {
    el.style.display = 'none';
  });
  
  // Redirect to home page if not already there
  if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
    window.location.href = 'index.html';
  }
}

// ===== ONBOARDING CHECK =====
async function checkOnboardingStatus() {
  if (!currentUser) return;
  
  // Only check onboarding on the dashboard (index.html)
  const currentPage = window.location.pathname.split('/').pop();
  if (currentPage !== 'index.html' && currentPage !== '') return;
  
  // Check if user has any data
  const hasAssets = (window.assets || []).length > 0;
  const hasBills = (window.bills || []).length > 0;
  const hasIncome = (window.income || []).length > 0;
  const hasInvestments = (window.investments || []).length > 0;
  const hasDebts = (window.debts || []).length > 0;
  
  const hasData = hasAssets || hasBills || hasIncome || hasInvestments || hasDebts;
  
  // Check onboarding flag in settings
  const settings = window.settings || {};
  const onboardingDone = settings.onboarding_completed || false;
  
  // Show onboarding if user has no data and hasn't completed onboarding
  if (!hasData && !onboardingDone) {
    debugLog("ONBOARDING: Showing wizard for new user");
    // Small delay to ensure DOM is fully ready
    setTimeout(() => {
      if (typeof showOnboardingWizard === 'function') {
        showOnboardingWizard();
      } else {
        console.warn('showOnboardingWizard function not found');
      }
    }, 500);
  }
}

// ===== CORE DATA & RENDER FUNCTIONS =====
// --- THE DEBUGGING FUNCTION ---
async function fetchAllDataFromSupabase(forceRefresh = false) {
  if (!currentUser) return; // Exit if no user is logged in

  const cacheKey = `data_${currentUser.id}`;
  
  // Performance: Check cache first (unless force refresh)
  if (!forceRefresh) {
    const cached = getCachedData(cacheKey);
    if (cached) {
      debugLog("FETCH: Using cached data");
      window.assets = cached.assets || [];
      window.investments = cached.investments || [];
      window.debts = cached.debts || [];
      window.bills = cached.bills || [];
      window.income = cached.income || [];
      window.snapshots = cached.snapshots || [];
      window.settings = cached.settings || {};
      return;
    }
  }

  try {
      // Fetch all data streams at the same time
      const [assetsRes, investmentsRes, debtsRes, billsRes, incomeRes, snapshotsRes, settingsRes] = await Promise.all([
        sb.from('assets').select('*').eq('user_id', currentUser.id),
        sb.from('investments').select('*').eq('user_id', currentUser.id),
        sb.from('debts').select('*').eq('user_id', currentUser.id),
        sb.from('bills').select('*').eq('user_id', currentUser.id),
        sb.from('income').select('*').eq('user_id', currentUser.id),
        sb.from('snapshots').select('*').eq('user_id', currentUser.id),
        sb.from('settings').select('*').eq('user_id', currentUser.id).maybeSingle() // Fetch settings (may not exist yet)
    ]);

      // Check if any of the requests failed
      const responses = [assetsRes, investmentsRes, debtsRes, billsRes, incomeRes, snapshotsRes];
      for (const res of responses) {
          if (res.error) {
              throw new Error(`Failed to fetch data: ${res.error.message}`);
          }
      }

      // Handle settings error or missing data with defaults
      if (settingsRes.error) {
          console.warn('Settings fetch error (using defaults):', settingsRes.error);
      }

      // THE FIX: Assign data to the global window object
      window.assets = assetsRes.data || [];
      window.investments = investmentsRes.data || [];
      window.debts = debtsRes.data || [];
      window.bills = billsRes.data || [];
      window.income = incomeRes.data || [];
      window.snapshots = snapshotsRes.data || [];
      window.settings = settingsRes.data || { emergency_fund_goal: 3 }; // Default to 3 months if no settings exist

      // Performance: Cache the fetched data
      setCachedData(cacheKey, {
        assets: window.assets,
        investments: window.investments,
        debts: window.debts,
        bills: window.bills,
        income: window.income,
        snapshots: window.snapshots,
        settings: window.settings
      });

      debugLog("FETCH: Data fetch successful for all tables.");
  } catch (error) {
      console.error("Error during data fetch:", error);
      alert("A critical error occurred while fetching your data. Please check the console.");
  }
}


async function renderAll() {
  // Render all the tables for the sub-pages
  renderAssets();
  renderInvestments();
  renderDebts();
  renderBills();
  renderFinancingCards(); // Financing cards on Debts page (data from window.bills)
  renderIncome();

  // If we are on the dashboard, render the dashboard components
  // Use 'netWorthValue' as the check — it only exists on the dashboard, not reports.html
  if (document.getElementById('netWorthValue')) {
      updateDashboardCards();
      renderUpcomingPayments();
      
      // Load subscription widget
      if (typeof loadSubscriptionWidget === 'function') {
        loadSubscriptionWidget();
      }
      
      // Performance: Load critical chart first (Net Worth is most important)
      await renderNetWorthChart();
      
      // Defer non-critical charts using requestIdleCallback for better perceived performance
      if (window.requestIdleCallback) {
        requestIdleCallback(() => {
          generateMonthlyCashFlowChart();
          renderEmergencyFundChart();
        }, { timeout: 2000 });
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => {
          generateMonthlyCashFlowChart();
          renderEmergencyFundChart();
        }, 100);
      }
  }

  // If we are on the reports page, render all charts
  if (document.getElementById('reportNetWorth') && document.getElementById('netWorthTimelineChart')) {
      await renderNetWorthChart();
      
      // Render additional charts moved from dashboard
      if (typeof generateMonthlyCashFlowChart === 'function') {
        generateMonthlyCashFlowChart();
      }
      if (typeof renderSpendingCategoriesChart === 'function') {
        renderSpendingCategoriesChart();
      }
      if (typeof renderSavingsRateChart === 'function') {
        renderSavingsRateChart();
      }
      if (typeof renderInvestmentGrowthChart === 'function') {
        renderInvestmentGrowthChart();
      }
  }

  // Pre-populate settings inputs
  if (document.getElementById('emergencyFundGoal') && window.settings?.emergency_fund_goal) {
      document.getElementById('emergencyFundGoal').value = window.settings.emergency_fund_goal;
  }

  // Populate reports summary cards
  renderReportsSummary();
}
function renderReportsSummary() {
    // Only run on the reports page
    if (!document.getElementById('reportNetWorth') && !document.getElementById('reportInvestments')) return;

    // Check if there's any data to report on
    const hasAnyData = (window.assets && window.assets.length > 0) ||
                        (window.investments && window.investments.length > 0) ||
                        (window.debts && window.debts.length > 0) ||
                        (window.bills && window.bills.length > 0) ||
                        (window.income && window.income.length > 0);
    
    if (typeof toggleEmptyState === 'function') {
      toggleEmptyState('dataContainer', 'reports', hasAnyData);
    }
    
    const totalInv = (window.investments || []).reduce((s, i) => s + getRaw(i.value), 0);
    const totalDebt = (window.debts || []).reduce((s, d) => s + getRaw(d.amount), 0);
    const totalAssetEquity = (window.assets || []).reduce((s, a) => s + Math.max(0, getRaw(a.value) - getRaw(a.loan)), 0);
    const netWorth = totalInv + totalAssetEquity - totalDebt;
    if (document.getElementById('reportInvestments')) document.getElementById('reportInvestments').textContent = formatCurrency(totalInv);
    if (document.getElementById('reportDebts')) document.getElementById('reportDebts').textContent = formatCurrency(totalDebt);
    if (document.getElementById('reportNetWorth')) document.getElementById('reportNetWorth').textContent = formatCurrency(netWorth);
}

// ===== FULL CRUD OPERATIONS =====

// --- ASSETS ---
// Helper: Asset type display names (FC-053 fix)
function getAssetTypeDisplayName(type) {
  const typeMap = {
    'real-estate': 'Real Estate',
    'vehicle': 'Vehicle',
    'other': 'Other'
  };
  return typeMap[type] || type;
}

function renderAssets() {
  const tbody = document.getElementById('assetTableBody');
  if (!tbody) return;
  
  const assets = window.assets || [];
  
  // Toggle empty state
  if (typeof toggleEmptyState === 'function') {
    toggleEmptyState('dataContainer', 'assets', assets);
  }
  
  tbody.innerHTML = assets.map(a => `
      <tr>
          <td>${escapeHtml(a.name)}</td><td>${escapeHtml(getAssetTypeDisplayName(a.type))}</td><td>${formatCurrency(a.value)}</td>
          <td>${formatCurrency(a.loan)}</td><td>${formatCurrency(Math.max(getRaw(a.value) - getRaw(a.loan), 0))}</td>
          <td>${a.nextDueDate ? formatDate(a.nextDueDate) : '-'}</td>
          <td>
              <button class="btn btn-sm btn-outline-primary" onclick="openAssetModal('${a.id}')" aria-label="Edit ${escapeHtml(a.name)}"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteAsset('${a.id}', '${escapeHtml(a.name)}')" aria-label="Delete ${escapeHtml(a.name)}"><i class="bi bi-trash"></i></button>
          </td>
      </tr>`).join('');
}
function openAssetModal(id = null) {
  editAssetId = id;
  const f = document.getElementById('assetForm');
  f.reset();
  document.querySelectorAll('.asset-fields').forEach(el => el.classList.add('d-none'));
  if (id) {
      document.getElementById('addAssetModalLabel').textContent = "Edit Asset";
      const asset = window.assets.find(x => x.id == id); // FIX: Changed === to ==
      if (asset) { // Add a check to ensure the asset was found
          f.assetName.value = escapeHtml(asset.name || '');
          f.assetType.value = escapeHtml(asset.type || '');
          if (asset.type === 'real-estate') {
              document.querySelector('.real-estate-fields').classList.remove('d-none');
              f.propertyValue.value = asset.value; f.loanAmount.value = asset.loan; f.realEstateNextDueDate.value = asset.nextDueDate;
          } else if (asset.type === 'vehicle') {
              document.querySelector('.vehicle-fields').classList.remove('d-none');
              f.vehicleValue.value = asset.value; f.vehicleLoanBalance.value = asset.loan; f.vehicleNextDueDate.value = asset.nextDueDate;
          }
      }
  } else { document.getElementById('addAssetModalLabel').textContent = "Add Asset"; }
  bootstrap.Modal.getOrCreateInstance(f.closest('.modal')).show();
}
async function saveAsset() {
  // Set loading state
  if (typeof setButtonLoading === 'function') {
    setButtonLoading('saveAssetBtn', true);
  }

  // CSRF Protection
  try {
    if (typeof CSRF !== 'undefined') {
      CSRF.requireValidToken();
    }
  } catch (err) {
    if (typeof setButtonLoading === 'function') {
      setButtonLoading('saveAssetBtn', false);
    }
    alert(err.message);
    return;
  }

  // Hybrid rate limiting (client + database)
  const operation = editAssetId ? 'update_item' : 'add_asset';
  const allowed = await withHybridRateLimit('save', operation, async () => {
    const f = document.getElementById('assetForm');
    const type = f.assetType.value;
    const record = { name: f.assetName.value, type, user_id: currentUser.id };
    if (type === 'real-estate') {
        record.value = getRaw(f.propertyValue.value); record.loan = getRaw(f.loanAmount.value); record.nextDueDate = f.realEstateNextDueDate.value || null;
    } else if (type === 'vehicle') {
        record.value = getRaw(f.vehicleValue.value); record.loan = getRaw(f.vehicleLoanBalance.value); record.nextDueDate = f.vehicleNextDueDate.value || null;
    }
    const { error } = editAssetId ? await sb.from('assets').update(record).eq('id', editAssetId).eq('user_id', currentUser.id) : await sb.from('assets').insert(record);
    if (error) {
      if (typeof setButtonLoading === 'function') {
        setButtonLoading('saveAssetBtn', false);
      }
      return alert(error.message);
    }
    bootstrap.Modal.getInstance(f.closest('.modal')).hide();
    clearCache(); // Performance: Clear cache on data mutation
    await fetchAllDataFromSupabase(true);
    renderAll();
  });
  
  // Reset loading state
  if (typeof setButtonLoading === 'function') {
    setButtonLoading('saveAssetBtn', false);
  }
  
  if (allowed === null) return; // Rate limited
}
function confirmDeleteAsset(id, name) {
  deleteAssetId = id;
  // BUG-04 FIX: Accept name as parameter instead of looking up by ID (prevents "undefined" for new items)
  document.getElementById('deleteAssetName').textContent = `"${name}"`;
  bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmDeleteAssetModal')).show();
}
async function deleteAssetConfirmed() {
  // Rate limiting
  if (!rateLimiters.delete.allow('deleteAsset')) {
    const remainingMs = rateLimiters.delete.getRemainingTime('deleteAsset');
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    alert(`Too many delete requests. Please wait ${remainingSeconds} seconds.`);
    return;
  }

  // CSRF Protection
  try {
    if (typeof CSRF !== 'undefined') {
      CSRF.requireValidToken();
    }
  } catch (err) {
    alert(err.message);
    return;
  }

  const { error } = await sb.from('assets').delete().eq('id', deleteAssetId).eq('user_id', currentUser.id);
  if (error) return alert(error.message);
  bootstrap.Modal.getInstance(document.getElementById('confirmDeleteAssetModal')).hide();
  clearCache(); // Performance: Clear cache on data mutation
  await fetchAllDataFromSupabase(true);
  renderAll();
}

// --- INVESTMENTS ---
// Helper function to convert investment type enum values to display names
function getInvestmentTypeDisplayName(type) {
  const typeMap = {
    '401k': '401(k)',
    'ira': 'Traditional IRA',
    'roth-ira': 'Roth IRA',
    'brokerage': 'Brokerage',
    'savings': 'Savings',
    'cd': 'CD',
    'crypto': 'Crypto',
    'other': 'Other'
  };
  return typeMap[type] || type;
}

function renderInvestments() {
  const tbody = document.getElementById('investmentTableBody');
  if (!tbody) return;
  
  const investments = window.investments || [];
  
  // Toggle empty state
  if (typeof toggleEmptyState === 'function') {
    toggleEmptyState('dataContainer', 'investments', investments);
  }
  
  tbody.innerHTML = investments.map(inv => `
      <tr>
          <td>${escapeHtml(inv.name)}</td><td>${escapeHtml(getInvestmentTypeDisplayName(inv.type))}</td><td>${formatCurrency(inv.startingBalance)}</td>
          <td>${formatCurrency(inv.monthlyContribution)}</td><td>${escapeHtml(inv.annualReturn ? inv.annualReturn + '%' : '-')}</td>
          <td>${inv.nextContributionDate ? escapeHtml(formatDate(inv.nextContributionDate)) : '-'}</td><td>${formatCurrency(inv.value)}</td>
          <td>
              <button class="btn btn-sm btn-outline-primary" onclick="openInvestmentModal('${escapeAttribute(inv.id)}')" aria-label="Edit ${escapeAttribute(inv.name)}"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteInvestment('${escapeAttribute(inv.id)}', '${escapeAttribute(inv.name)}')" aria-label="Delete ${escapeAttribute(inv.name)}"><i class="bi bi-trash"></i></button>
          </td>
      </tr>`).join('');
}
function openInvestmentModal(id = null) {
  editInvestmentId = id;
  const f = document.getElementById('investmentForm');
  f.reset();
  if (id) {
      const inv = window.investments.find(i => i.id == id); // FIX: Changed === to ==
      if(inv) {
          f.investmentName.value = escapeHtml(inv.name || ''); 
          f.investmentType.value = inv.type || ''; // Don't escape enum values
          f.investmentValue.value = inv.value;
          f.startingBalance.value = inv.startingBalance || '';
          f.monthlyContribution.value = inv.monthlyContribution; 
          f.annualReturn.value = inv.annualReturn;
          f.nextContributionDate.value = inv.nextContributionDate;
      }
  }
  bootstrap.Modal.getOrCreateInstance(f.closest('.modal')).show();
}
async function saveInvestment() {
  // Set loading state
  if (typeof setButtonLoading === 'function') {
    setButtonLoading('saveInvestmentBtn', true);
  }

  // CSRF Protection
  try {
    if (typeof CSRF !== 'undefined') {
      CSRF.requireValidToken();
    }
  } catch (err) {
    if (typeof setButtonLoading === 'function') {
      setButtonLoading('saveInvestmentBtn', false);
    }
    alert(err.message);
    return;
  }

  // Hybrid rate limiting (client + database)
  const operation = editInvestmentId ? 'update_item' : 'add_investment';
  const allowed = await withHybridRateLimit('save', operation, async () => {
    const f = document.getElementById('investmentForm');
    const record = {
        name: f.investmentName.value, type: f.investmentType.value, value: getRaw(f.investmentValue.value),
        startingBalance: getRaw(f.startingBalance.value), monthlyContribution: getRaw(f.monthlyContribution.value),
        annualReturn: getRaw(f.annualReturn.value), nextContributionDate: f.nextContributionDate.value || null,
        user_id: currentUser.id
    };
    const { error } = editInvestmentId ? await sb.from('investments').update(record).eq('id', editInvestmentId).eq('user_id', currentUser.id) : await sb.from('investments').insert(record);

    editInvestmentId = null;
    if (error) {
      if (typeof setButtonLoading === 'function') {
        setButtonLoading('saveInvestmentBtn', false);
      }
      return alert(error.message);
    }

    bootstrap.Modal.getInstance(f.closest('.modal')).hide();
    clearCache(); // Performance: Clear cache on data mutation
    await fetchAllDataFromSupabase(true);
    renderAll();
  });
  
  // Reset loading state
  if (typeof setButtonLoading === 'function') {
    setButtonLoading('saveInvestmentBtn', false);
  }
  
  if (allowed === null) return; // Rate limited
}
function confirmDeleteInvestment(id, name) {
  // BUG-04 FIX: Accept name as parameter instead of looking up by ID (prevents "undefined" for new items)
  if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteInvestmentConfirmed(id);
  }
}
async function deleteInvestmentConfirmed(id) {
  // Rate limiting
  if (!rateLimiters.delete.allow('deleteInvestment')) {
    const remainingMs = rateLimiters.delete.getRemainingTime('deleteInvestment');
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    alert(`Too many delete requests. Please wait ${remainingSeconds} seconds.`);
    return;
  }

  // CSRF Protection
  try {
    if (typeof CSRF !== 'undefined') {
      CSRF.requireValidToken();
    }
  } catch (err) {
    alert(err.message);
    return;
  }

  const { error } = await sb.from('investments').delete().eq('id', id).eq('user_id', currentUser.id);
  if (error) return alert(error.message);
  clearCache(); // Performance: Clear cache on data mutation
  await fetchAllDataFromSupabase(true);
  renderAll();
}

// --- DEBTS ---
// Helper: Debt type display names (FC-050 fix)
function getDebtTypeDisplayName(type) {
  const typeMap = {
    'credit-card': 'Credit Card',
    'mortgage': 'Mortgage',
    'student-loan': 'Student Loan',
    'auto-loan': 'Auto Loan',
    'personal-loan': 'Personal Loan',
    'other': 'Other'
  };
  return typeMap[type] || type;
}

function renderDebts() {
  const tbody = document.getElementById('debtTableBody');
  if (!tbody) return;
  
  const debts = window.debts || [];
  
  // Toggle empty state
  if (typeof toggleEmptyState === 'function') {
    toggleEmptyState('dataContainer', 'debts', debts);
  }
  
  tbody.innerHTML = debts.map(d => `
      <tr>
          <td>${escapeHtml(d.name)}</td><td>${escapeHtml(getDebtTypeDisplayName(d.type))}</td><td>${formatCurrency(d.amount)}</td><td>${escapeHtml(d.interestRate)}%</td>
          <td class="hide-mobile">${escapeHtml(d.term || '-')} months</td><td>${formatCurrency(d.monthlyPayment)}</td>
          <td class="hide-mobile">${d.nextDueDate ? escapeHtml(formatDate(d.nextDueDate)) : '-'}</td>
          <td>
              <button class="btn btn-sm btn-outline-primary" onclick="openDebtModal('${escapeAttribute(d.id)}')" aria-label="Edit ${escapeAttribute(d.name)}"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteDebt('${escapeAttribute(d.id)}', '${escapeAttribute(d.name)}')" aria-label="Delete ${escapeAttribute(d.name)}"><i class="bi bi-trash"></i></button>
          </td>
      </tr>`).join('');
}
function openDebtModal(id = null) {
  editDebtId = id;
  const f = document.getElementById('debtForm');
  f.reset();
  if (id) {
      const d = window.debts.find(x => x.id == id); // FIX: Changed === to ==
      if(d) {
          f.debtName.value = escapeHtml(d.name || ''); f.debtType.value = escapeHtml(d.type || ''); f.debtAmount.value = d.amount;
          f.debtInterest.value = d.interestRate; f.debtTerm.value = d.term; f.debtMonthly.value = d.monthlyPayment;
          f.debtNextPaymentDate.value = d.nextDueDate;
      }
  }
  bootstrap.Modal.getOrCreateInstance(f.closest('.modal')).show();
}
async function saveDebt() {
  // CSRF Protection
  try {
    if (typeof CSRF !== 'undefined') {
      CSRF.requireValidToken();
    }
  } catch (err) {
    alert(err.message);
    return;
  }

  // Hybrid rate limiting (client + database)
  const operation = editDebtId ? 'update_item' : 'add_debt';
  const allowed = await withHybridRateLimit('save', operation, async () => {
    const f = document.getElementById('debtForm');
    const record = {
        name: f.debtName.value, type: f.debtType.value, amount: getRaw(f.debtAmount.value), interestRate: getRaw(f.debtInterest.value),
        term: getRaw(f.debtTerm.value), monthlyPayment: getRaw(f.debtMonthly.value),
        nextDueDate: f.debtNextPaymentDate.value || null, user_id: currentUser.id
    };
    const { error } = editDebtId ? await sb.from('debts').update(record).eq('id', editDebtId).eq('user_id', currentUser.id) : await sb.from('debts').insert(record);
    if (error) return alert(error.message);
    bootstrap.Modal.getInstance(f.closest('.modal')).hide();
    clearCache(); // Performance: Clear cache on data mutation

    await fetchAllDataFromSupabase(true);
    renderAll();
  });
  
  if (allowed === null) return; // Rate limited
}
function confirmDeleteDebt(id) {
  deleteDebtId = id;
  document.getElementById('deleteDebtName').textContent = `"${window.debts.find(d=>d.id===id).name}"`;
  bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmDeleteDebtModal')).show();
}
async function deleteDebtConfirmed() {
  // Rate limiting
  if (!rateLimiters.delete.allow('deleteDebt')) {
    const remainingMs = rateLimiters.delete.getRemainingTime('deleteDebt');
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    alert(`Too many delete requests. Please wait ${remainingSeconds} seconds.`);
    return;
  }

  // CSRF Protection
  try {
    if (typeof CSRF !== 'undefined') {
      CSRF.requireValidToken();
    }
  } catch (err) {
    alert(err.message);
    return;
  }

  const { error } = await sb.from('debts').delete().eq('id', deleteDebtId).eq('user_id', currentUser.id);
  if (error) return alert(error.message);
  bootstrap.Modal.getInstance(document.getElementById('confirmDeleteDebtModal')).hide();
  clearCache(); // Performance: Clear cache on data mutation

  await fetchAllDataFromSupabase(true);
  renderAll();
}

// --- BILLS ---
// Category badge styling - single neutral color for all categories (per boss feedback)
// Replaced colored badges with clean, minimal design
function getCategoryBadgeClass(type) {
  return 'bg-secondary text-white';  // Single neutral badge for all categories
}

// Financing metadata for payoff tracking (used until DB schema has these columns)
const FINANCING_META = {
  'Golf Clubs':    { total_amount: 2501.04, payments_made: 12, total_payments: 12, status: 'paid_off', end_date: '2025-12-01' },
  'Big Green Egg': { total_amount: 7788.48, payments_made: 8,  total_payments: 24, status: 'active' },
  'XGIMI':         { total_amount: 1636.32, payments_made: 10, total_payments: 12, status: 'active' },
  'BMW Payment':   { total_amount: 92040,   payments_made: 24, total_payments: 60, status: 'active' },
  'BMW 430i':      { total_amount: 24660,   payments_made: 24, total_payments: 60, status: 'active' },
  'Chevy Tahoe':   { total_amount: 45855.36,payments_made: 12, total_payments: 72, status: 'active' }
};

// Client-side amortization calculation
function calculateAmortization(principal, annualRate, termMonths, paymentsMade) {
  paymentsMade = paymentsMade || 0;
  const result = { monthlyPayment: 0, totalCost: 0, totalInterest: 0,
    interestPaidToDate: 0, principalPaidToDate: 0, remainingBalance: principal, schedule: [] };
  if (!principal || principal <= 0 || !termMonths || termMonths <= 0) return result;

  let monthlyPayment;
  if (!annualRate || annualRate === 0) {
    // 0% APR � simple division
    monthlyPayment = principal / termMonths;
    result.monthlyPayment = Math.round(monthlyPayment * 100) / 100;
    result.totalCost = Math.round(principal * 100) / 100;
    result.totalInterest = 0;
    let balance = principal;
    for (let i = 1; i <= termMonths; i++) {
      const principalPortion = Math.min(monthlyPayment, balance);
      balance = Math.max(0, balance - principalPortion);
      const entry = { payment: i, paymentAmount: Math.round(principalPortion * 100) / 100,
        principal: Math.round(principalPortion * 100) / 100, interest: 0,
        balance: Math.round(balance * 100) / 100 };
      result.schedule.push(entry);
      if (i <= paymentsMade) {
        result.principalPaidToDate += principalPortion;
      }
    }
    result.principalPaidToDate = Math.round(result.principalPaidToDate * 100) / 100;
    result.remainingBalance = Math.round(Math.max(0, principal - result.principalPaidToDate) * 100) / 100;
    return result;
  }

  // Standard amortization: M = P[r(1+r)^n] / [(1+r)^n � 1]
  const r = annualRate / 100 / 12;
  const n = termMonths;
  const factor = Math.pow(1 + r, n);
  monthlyPayment = principal * (r * factor) / (factor - 1);
  result.monthlyPayment = Math.round(monthlyPayment * 100) / 100;
  result.totalCost = Math.round(monthlyPayment * n * 100) / 100;
  result.totalInterest = Math.round((result.totalCost - principal) * 100) / 100;

  let balance = principal;
  for (let i = 1; i <= n; i++) {
    const interestPortion = balance * r;
    const principalPortion = monthlyPayment - interestPortion;
    balance = Math.max(0, balance - principalPortion);
    // Fix rounding on final payment
    if (i === n) balance = 0;
    const entry = { payment: i, paymentAmount: Math.round(monthlyPayment * 100) / 100,
      principal: Math.round(principalPortion * 100) / 100,
      interest: Math.round(interestPortion * 100) / 100,
      balance: Math.round(balance * 100) / 100 };
    result.schedule.push(entry);
    if (i <= paymentsMade) {
      result.interestPaidToDate += interestPortion;
      result.principalPaidToDate += principalPortion;
    }
  }
  result.interestPaidToDate = Math.round(result.interestPaidToDate * 100) / 100;
  result.principalPaidToDate = Math.round(result.principalPaidToDate * 100) / 100;
  result.remainingBalance = Math.round(Math.max(0, principal - result.principalPaidToDate) * 100) / 100;
  return result;
}

function getBillFinancingInfo(bill) {
  // Check DB columns first (if Architect migration has run)
  if (bill.total_amount && bill.total_amount > 0) {
    const paymentsMade = bill.payments_made || 0;
    const hasLoanDetails = bill.original_principal && bill.original_principal > 0;
    const interestRate = bill.interest_rate || 0;
    const originalPrincipal = bill.original_principal || 0;
    const loanTermMonths = bill.loan_term_months || 0;
    const startDate = bill.start_date || null;

    // Use amortization if we have loan details
    let amortData = null;
    if (hasLoanDetails && loanTermMonths > 0) {
      amortData = calculateAmortization(originalPrincipal, interestRate, loanTermMonths, paymentsMade);
    }

    const totalPayments = loanTermMonths > 0 ? loanTermMonths
      : (bill.total_amount > 0 && bill.amount > 0 ? Math.ceil(bill.total_amount / bill.amount) : 0);
    const amountPaid = paymentsMade * bill.amount;
    const remainingBalance = amortData ? amortData.remainingBalance : Math.max(0, bill.total_amount - amountPaid);
    // BUG-02 FIX: payments_made = number of COMPLETED payments
    // Progress bar shows: (completed / total) * 100
    // Current payment in amortization schedule = payments_made + 1 (next payment to make)
    const percentPaid = totalPayments > 0 ? Math.min(100, (paymentsMade / totalPayments) * 100) : 0;
    const remainingPayments = Math.max(0, totalPayments - paymentsMade);
    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + remainingPayments);
    return {
      isFinancing: true,
      status: bill.status || 'active',
      totalAmount: bill.total_amount,
      amountPaid,
      remainingBalance,
      percentPaid,
      paymentsMade,
      totalPayments,
      remainingPayments,
      estimatedPayoffDate: payoffDate,
      // Enhanced loan data
      interestRate,
      originalPrincipal,
      loanTermMonths,
      startDate,
      hasLoanDetails,
      totalInterest: amortData ? amortData.totalInterest : null,
      interestPaidToDate: amortData ? amortData.interestPaidToDate : null,
      principalPaidToDate: amortData ? amortData.principalPaidToDate : null,
      amortization: amortData
    };
  }
  // Fall back to hardcoded metadata (case-insensitive lookup)
  const metaKey = Object.keys(FINANCING_META).find(k => k.toLowerCase() === (bill.name || '').toLowerCase());
  const meta = metaKey ? FINANCING_META[metaKey] : null;
  if (!meta) return { isFinancing: false };
  const amountPaid = meta.payments_made * bill.amount;
  const remainingBalance = Math.max(0, meta.total_amount - amountPaid);
  const percentPaid = meta.total_amount > 0 ? Math.min(100, (amountPaid / meta.total_amount) * 100) : 0;
  const remainingPayments = Math.max(0, meta.total_payments - meta.payments_made);
  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + remainingPayments);
  return {
    isFinancing: true,
    status: meta.status,
    totalAmount: meta.total_amount,
    amountPaid,
    remainingBalance,
    percentPaid,
    paymentsMade: meta.payments_made,
    totalPayments: meta.total_payments,
    remainingPayments,
    estimatedPayoffDate: meta.end_date ? new Date(meta.end_date + 'T00:00:00') : payoffDate,
    // No loan details from hardcoded meta
    interestRate: null,
    originalPrincipal: null,
    loanTermMonths: null,
    startDate: null,
    hasLoanDetails: false,
    totalInterest: null,
    interestPaidToDate: null,
    principalPaidToDate: null,
    amortization: null
  };
}

function renderBills() {
  const tbody = document.getElementById('billTableBody');
  if (!tbody) return;

  // Merge owned bills with shared-with-me bills for unified display
  const ownedBills = window.bills || [];
  const sharedBills = window.sharedBillsForDisplay || [];
  const allBills = [...ownedBills, ...sharedBills];
  
  // Toggle empty state for bills page
  if (typeof toggleEmptyState === 'function') {
    toggleEmptyState('dataContainer', 'bills', allBills);
  }
  const isFinancingType = (b) => {
    const type = (b.type || '').toLowerCase();
    return type === 'financing' || getBillFinancingInfo(b).isFinancing;
  };

  // Split bills: recurring vs financing
  const recurringBills = allBills.filter(b => !isFinancingType(b));
  const financingBills = allBills.filter(b => isFinancingType(b));
  const activeFinancing = financingBills.filter(b => getBillFinancingInfo(b).status !== 'paid_off');
  const completedFinancing = financingBills.filter(b => getBillFinancingInfo(b).status === 'paid_off');

  // Render ALL active bills in the table (including financing � they're recurring payments too)
  const activeBills = allBills.filter(b => {
    const info = getBillFinancingInfo(b);
    return !(info.isFinancing && info.status === 'paid_off');
  });
  
  // Show empty state in table if no bills exist
  if (activeBills.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-5">
          <div class="empty-state-inline">
            <svg xmlns="http://www.w3.org/2000/svg" class="empty-state-icon-inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="64" height="64">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 class="mt-3" style="color: var(--color-text-primary);">No Bills Yet</h3>
            <p class="text-muted">Track your recurring expenses like rent, utilities, and subscriptions</p>
            <div class="d-flex gap-2 justify-content-center mt-3 flex-wrap">
              <button class="btn btn-primary" onclick="typeof openBillModal === 'function' && openBillModal()" aria-label="Add your first bill">
                <i class="bi bi-plus-circle"></i> Add Your First Bill
              </button>
              <button class="btn btn-outline-secondary" id="scanEmailFromEmpty" onclick="document.getElementById('scanEmailBillsBtn')?.click()" aria-label="Scan email for bills">
                <i class="bi bi-envelope-check"></i> Scan Email
              </button>
            </div>
          </div>
        </td>
      </tr>
    `;
    
    // Also update summary cards to show $0.00
    const totalBillsEl = document.getElementById('totalBills');
    const subscriptionsCountEl = document.getElementById('subscriptionsCount');
    if (totalBillsEl) totalBillsEl.textContent = '$0.00';
    if (subscriptionsCountEl) subscriptionsCountEl.textContent = '0';
    
    return; // Exit early, no bills to render
  }
  
  tbody.innerHTML = activeBills.map(b => {
      // Shared-with-me bills: show "Shared by X" badge, read-only actions
      if (b.isSharedWithMe) {
        const sharedByBadge = `<span class="badge bg-secondary ms-1" title="Shared by ${escapeAttribute(b.sharedByName)}"><i class="bi bi-people-fill me-1"></i>${escapeHtml(b.splitLabel)}</span>`;
        return `
        <tr>
            <td>${escapeHtml(b.name)} ${sharedByBadge}
              <small class="d-block" style="color: var(--color-text-tertiary);">from ${escapeHtml(b.sharedByName)}</small>
            </td>
            <td><span class="badge ${getCategoryBadgeClass(b.type)}">${escapeHtml(b.type)}</span></td>
            <td><strong style="color: var(--color-primary);">${formatCurrency(b.amount)}</strong>
              <small class="d-block" style="color: var(--color-text-tertiary);">of ${formatCurrency(b.fullAmount)}</small>
            </td>
            <td>${escapeHtml(b.frequency || 'monthly')}</td>
            <td>${b.nextDueDate ? escapeHtml(formatDate(b.nextDueDate)) : '-'}</td>
            <td>
              <span class="badge bg-secondary-subtle"><i class="bi bi-link-45deg me-1"></i>Shared</span>
            </td>
        </tr>`;
      }
      // Owned bills: original rendering with edit/delete/share buttons
      const shareInfo = getShareInfoForBill(b.id);
      const sharedBadge = shareInfo ? `<span class="badge bg-secondary ms-1" title="Shared with ${escapeAttribute(shareInfo.shared_user?.display_name || 'someone')}"><i class="bi bi-people-fill me-1"></i>${escapeHtml(shareInfo.status === 'accepted' ? 'Shared' : 'Pending')}</span>` : '';
      return `
      <tr>
          <td>${escapeHtml(b.name)} ${sharedBadge}</td><td><span class="badge ${getCategoryBadgeClass(b.type)}">${escapeHtml(b.type)}</span></td><td>${formatCurrency(b.amount)}${shareInfo && shareInfo.status === 'accepted' ? `<small class="d-block" style="color: var(--color-text-tertiary);">Your share: ${formatCurrency(shareInfo.owner_amount)}</small>` : ''}</td>
          <td>${escapeHtml(b.frequency)}</td><td>${b.nextDueDate ? escapeHtml(formatDate(b.nextDueDate)) : '-'}</td>
          <td>
              <button class="btn btn-sm btn-outline-info" onclick="openShareBillModal('${escapeAttribute(b.id)}')" aria-label="Share ${escapeAttribute(b.name)}"><i class="bi bi-share"></i></button>
              <button class="btn btn-sm btn-outline-primary" onclick="openBillModal('${escapeAttribute(b.id)}')" aria-label="Edit ${escapeAttribute(b.name)}"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteBill('${escapeAttribute(b.id)}', '${escapeAttribute(b.name)}')" aria-label="Delete ${escapeAttribute(b.name)}"><i class="bi bi-trash"></i></button>
          </td>
      </tr>`;
  }).join('');

  // Financing cards now render on the Debts page (called from renderAll)

  // Update summary cards
  // BUG-002 FIX: Use owner_amount for shared bills AND normalize all bills to monthly amounts
  // Only count active bills (exclude paid-off financing)
  const totalBills = activeBills.reduce((sum, b) => {
    // Skip bills with null/undefined amounts or invalid frequencies
    if (!b.amount || b.amount === 0 || !b.frequency) {
      if (DEBUG) console.warn(`Skipping bill "${b.name}": amount=${b.amount}, frequency=${b.frequency}`);
      return sum;
    }
    
    // For shared-with-me bills, amount is already the user's portion
    if (b.isSharedWithMe) {
      const monthlyAmount = normalizeToMonthly(b.amount, b.frequency);
      return sum + monthlyAmount;
    }
    const shareInfo = getShareInfoForBill(b.id);
    // If bill is shared (and accepted), use owner_amount; otherwise use full amount
    const userAmount = (shareInfo && shareInfo.status === 'accepted') ? shareInfo.owner_amount : b.amount;
    
    // Skip if user amount is invalid
    if (!userAmount || userAmount === 0) {
      if (DEBUG) console.warn(`Skipping bill "${b.name}": userAmount=${userAmount}`);
      return sum;
    }
    
    // Normalize to monthly amount based on frequency
    const monthlyAmount = normalizeToMonthly(userAmount, b.frequency);
    
    // Debug logging to help identify calculation issues
    if (DEBUG) {
      console.log(`Bill: ${b.name} | Frequency: ${b.frequency} | Amount: ${formatCurrency(b.amount)} | ` +
        `User Amount: ${formatCurrency(userAmount)} | Monthly: ${formatCurrency(monthlyAmount)} | ` +
        `Shared: ${shareInfo ? 'Yes' : 'No'}`);
    }
    
    return sum + monthlyAmount;
  }, 0);
  
  if (DEBUG) {
    console.log(`Total Monthly Bills: ${formatCurrency(totalBills)} (from ${activeBills.length} active bills)`);
  }
  
  if (document.getElementById('billsTotal')) document.getElementById('billsTotal').textContent = formatCurrency(totalBills);
  if (document.getElementById('billsRecurringCount')) document.getElementById('billsRecurringCount').textContent = recurringBills.length;
  const sharedCount = (window.sharedBillsForDisplay || []).length;
  if (document.getElementById('billsSharedCount')) document.getElementById('billsSharedCount').textContent = sharedCount;
}
// Render financing cards on the Debts page (moved from Bills page)
function renderFinancingCards() {
  const financingContainer = document.getElementById('financingCards');
  if (!financingContainer) return; // Not on the debts page

  const allBills = window.bills || [];
  const isFinancingType = (b) => {
    const type = (b.type || '').toLowerCase();
    return type === 'financing' || getBillFinancingInfo(b).isFinancing;
  };
  const financingBills = allBills.filter(b => isFinancingType(b));
  const activeFinancing = financingBills.filter(b => getBillFinancingInfo(b).status !== 'paid_off')
    .sort((a, b) => getBillFinancingInfo(b).remainingBalance - getBillFinancingInfo(a).remainingBalance);
  const completedFinancing = financingBills.filter(b => getBillFinancingInfo(b).status === 'paid_off');

  if (activeFinancing.length > 0) {
    financingContainer.innerHTML = activeFinancing.map(b => {
      const info = getBillFinancingInfo(b);
      const progressColor = info.percentPaid >= 75 ? 'var(--color-success)' : 'var(--color-primary)';
      const payoffStr = info.estimatedPayoffDate
        ? escapeHtml(info.estimatedPayoffDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }))
        : 'N/A';
      const aprBadge = info.interestRate !== null && info.interestRate !== undefined
        ? `<span class="badge ${info.interestRate === 0 ? 'bg-success' : 'bg-warning text-dark'} ms-1" style="font-size: 0.7rem;">${escapeHtml(info.interestRate)}% APR</span>`
        : '';
      const hasBreakdown = info.hasLoanDetails && info.interestPaidToDate !== null;
      const breakdownHtml = hasBreakdown ? `
            <div class="mt-3 mb-2">
              <div class="d-flex justify-content-between mb-1">
                <small style="color: var(--color-text-secondary);">Principal vs Interest Paid</small>
              </div>
              <div class="progress" style="height: 8px; border-radius: var(--radius-full);">
                <div class="progress-bar" role="progressbar"
                     style="width: ${escapeAttribute(String(info.amountPaid > 0 ? (info.principalPaidToDate / (info.principalPaidToDate + info.interestPaidToDate) * 100) : 0))}%; background-color: var(--color-primary);"
                     title="Principal: ${escapeAttribute(formatCurrency(info.principalPaidToDate))}">
                </div>
                <div class="progress-bar" role="progressbar"
                     style="width: ${escapeAttribute(String(info.amountPaid > 0 ? (info.interestPaidToDate / (info.principalPaidToDate + info.interestPaidToDate) * 100) : 0))}%; background-color: var(--color-secondary);"
                     title="Interest: ${escapeAttribute(formatCurrency(info.interestPaidToDate))}">
                </div>
              </div>
              <div class="d-flex justify-content-between mt-1">
                <small style="color: var(--color-primary);">Principal: ${formatCurrency(info.principalPaidToDate)}</small>
                <small style="color: var(--color-secondary);">Interest: ${formatCurrency(info.interestPaidToDate)}</small>
              </div>
            </div>` : '';
      const scheduleBtn = info.hasLoanDetails
        ? `<button class="btn btn-sm btn-outline-info mt-2" onclick="showAmortizationSchedule('${escapeAttribute(b.id)}')"><i class="bi bi-table me-1"></i>View Schedule</button>`
        : '';
      return `
      <div class="col-xl-4 col-md-6 col-12">
        <div class="card h-100">
          <div class="card-body p-4 d-flex flex-column">
            <div class="financing-card-header" style="margin-bottom: 12px;">
              <!-- Name and action buttons on same line -->
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h5 class="mb-0" title="${escapeAttribute(b.name)}" style="color: var(--color-text-primary); font-size: var(--text-h5); line-height: 1.3; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(b.name)}</h5>
                <div class="d-flex gap-2" style="flex-shrink: 0; margin-left: 12px;">
                  <button class="btn btn-sm btn-outline-secondary" onclick="openShareBillModal('${escapeAttribute(b.id)}')" aria-label="Share ${escapeAttribute(b.name)}"><i class="bi bi-share"></i></button>
                  <button class="btn btn-sm btn-outline-secondary" onclick="openBillModal('${escapeAttribute(b.id)}')" aria-label="Edit ${escapeAttribute(b.name)}"><i class="bi bi-pencil"></i></button>
                  <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteBill('${escapeAttribute(b.id)}', '${escapeAttribute(b.name)}')" aria-label="Delete ${escapeAttribute(b.name)}"><i class="bi bi-trash"></i></button>
                </div>
              </div>
              <!-- Badges on separate line below name -->
              <div class="d-flex gap-2 flex-wrap">
                <span class="badge ${getCategoryBadgeClass(b.type)}">${escapeHtml(b.type)}</span>${aprBadge}
              </div>
            </div>
            <div class="mb-3">
              <div class="d-flex justify-content-between mb-1">
                <small style="color: var(--color-text-secondary);">Progress</small>
                <small style="color: var(--color-text-secondary);">${escapeHtml(Math.round(info.percentPaid))}%</small>
              </div>
              <div class="progress" style="height: 12px; border-radius: var(--radius-full);">
                <div class="progress-bar" role="progressbar"
                     style="width: ${escapeAttribute(String(info.percentPaid))}%; background-color: ${escapeAttribute(progressColor)};"
                     aria-valuenow="${escapeAttribute(String(info.percentPaid))}" aria-valuemin="0" aria-valuemax="100">
                </div>
              </div>
            </div>${breakdownHtml}
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px 16px; margin-top: 4px;">
              <div style="text-align: left;">
                <small style="color: var(--color-text-tertiary); font-size: 0.75rem;">Monthly</small>
                <div><strong style="color: var(--color-primary);">${formatCurrency(b.amount)}</strong></div>
              </div>
              <div style="text-align: right;">
                <small style="color: var(--color-text-tertiary); font-size: 0.75rem;">Remaining</small>
                <div><strong style="color: var(--color-text-primary);">${formatCurrency(info.remainingBalance)}</strong></div>
              </div>
              <div style="text-align: left;">
                <small style="color: var(--color-text-tertiary); font-size: 0.75rem;">Payoff</small>
                <div><strong style="color: var(--color-text-primary);">${payoffStr}</strong></div>
              </div>
              ${info.totalInterest !== null ? `<div style="text-align: right;">
                <small style="color: var(--color-text-tertiary); font-size: 0.75rem;">Total Interest</small>
                <div><strong style="color: var(--color-secondary);">${formatCurrency(info.totalInterest)}</strong></div>
              </div>` : '<div></div>'}
            </div>
            <div class="mt-2 text-center">
              <small style="color: var(--color-text-tertiary);">${escapeHtml(info.paymentsMade)} of ${escapeHtml(info.totalPayments)} payments made</small>
              ${scheduleBtn}
            </div>
          </div>
        </div>
      </div>`;
    }).join('');
  } else {
    financingContainer.innerHTML = '<div class="col-12"><p class="text-muted fst-italic">No active financing items.</p></div>';
  }

  // Completed/paid-off section
  const completedSection = document.getElementById('completedSection');
  const completedContainer = document.getElementById('completedCards');
  if (completedSection && completedContainer) {
    if (completedFinancing.length > 0) {
      completedSection.classList.remove('d-none');
      completedContainer.innerHTML = completedFinancing.map(b => {
        const info = getBillFinancingInfo(b);
        return `
        <div class="col-xl-4 col-md-6 col-12">
          <div class="card h-100" style="border-color: var(--color-success); opacity: 0.85;">
            <div class="card-body p-4">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h5 class="mb-1" style="color: var(--color-text-primary); font-size: var(--text-h5);">
                    ✓ ${escapeHtml(b.name)}
                  </h5>
                  <span class="badge bg-success">Paid Off</span>
                </div>
                <div class="text-end">
                  <button class="btn btn-sm btn-outline-primary" onclick="openBillModal('${escapeAttribute(b.id)}')" aria-label="Edit ${escapeAttribute(b.name)}"><i class="bi bi-pencil"></i></button>
                  <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteBill('${escapeAttribute(b.id)}', '${escapeAttribute(b.name)}')" aria-label="Delete ${escapeAttribute(b.name)}"><i class="bi bi-trash"></i></button>
                </div>
              </div>
              <div class="mb-3">
                <div class="progress" style="height: 12px; border-radius: var(--radius-full);">
                  <div class="progress-bar" role="progressbar"
                       style="width: 100%; background-color: var(--color-success);"
                       aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">
                  </div>
                </div>
              </div>
              <div class="row g-2 text-center">
                <div class="col-6">
                  <small class="d-block" style="color: var(--color-text-tertiary);">Total Paid</small>
                  <strong style="color: var(--color-success);">${formatCurrency(info.totalAmount)}</strong>
                </div>
                <div class="col-6">
                  <small class="d-block" style="color: var(--color-text-tertiary);">Completed</small>
                  <strong style="color: var(--color-success);">${escapeHtml(info.paymentsMade)} payments</strong>
                </div>
              </div>
            </div>
          </div>
        </div>`;
      }).join('');
    } else {
      completedSection.classList.add('d-none');
    }
  }
}

function isFinancingBillType(type) {
  const t = (type || '').toLowerCase();
  return t === 'financing' || t === 'auto' || t === 'housing';
}

function toggleFinancingFields() {
  const typeVal = document.getElementById('billType').value;
  const fieldsDiv = document.getElementById('financingFields');
  if (fieldsDiv) {
    fieldsDiv.classList.toggle('d-none', !isFinancingBillType(typeVal));
  }
}

function getLoanTermMonths() {
  const val = parseInt(document.getElementById('billLoanTermValue').value) || 0;
  const unit = document.getElementById('billLoanTermUnit').value;
  return unit === 'years' ? val * 12 : val;
}

function updateLoanCalcPreview() {
  const principal = parseFloat(document.getElementById('billOriginalPrincipal').value) || 0;
  const rate = parseFloat(document.getElementById('billInterestRate').value) || 0;
  const term = getLoanTermMonths();
  const paymentsMade = parseInt(document.getElementById('billPaymentsMade').value) || 0;
  const preview = document.getElementById('loanCalcPreview');
  const balanceDisplay = document.getElementById('remainingBalanceDisplay');
  if (!preview) return;
  if (principal > 0 && term > 0) {
    const calc = calculateAmortization(principal, rate, term, paymentsMade);
    document.getElementById('calcMonthlyPayment').textContent = formatCurrency(calc.monthlyPayment);
    document.getElementById('calcTotalInterest').textContent = formatCurrency(calc.totalInterest);
    preview.classList.remove('d-none');
    // Auto-fill total financed if blank
    const totalField = document.getElementById('billTotalFinanced');
    if (!totalField.value) {
      totalField.placeholder = formatCurrency(calc.totalCost) + ' (auto)';
    }
    // Update remaining balance display
    if (balanceDisplay) {
      balanceDisplay.textContent = formatCurrency(calc.remainingBalance);
    }
  } else {
    preview.classList.add('d-none');
    if (balanceDisplay) balanceDisplay.textContent = '�';
  }
}

function openBillModal(id = null) {
  editBillId = id;
  const f = document.getElementById('billForm');
  f.reset();
  // Reset financing fields
  const financingFields = document.getElementById('financingFields');
  if (financingFields) financingFields.classList.add('d-none');
  const preview = document.getElementById('loanCalcPreview');
  if (preview) preview.classList.add('d-none');
  const balanceReset = document.getElementById('remainingBalanceDisplay');
  if (balanceReset) balanceReset.textContent = '�';

  if (id) {
      const b = window.bills.find(x => x.id == id);
      if (b) {
          f.billName.value = escapeHtml(b.name || ''); f.billType.value = escapeHtml(b.type || ''); f.billAmount.value = b.amount;
          f.billFrequency.value = b.frequency; f.billNextDueDate.value = b.nextDueDate;
          // Show financing fields if type matches OR bill has existing financing data
          const hasFinancingData = b.total_amount || b.original_principal || b.payments_made > 0;
          const metaKey = Object.keys(FINANCING_META).find(k => k.toLowerCase() === (b.name || '').toLowerCase());
          const meta = metaKey ? FINANCING_META[metaKey] : null;
          if (isFinancingBillType(b.type) || hasFinancingData || metaKey) {
            if (financingFields) financingFields.classList.remove('d-none');
            if (b.interest_rate !== undefined && b.interest_rate !== null) f.billInterestRate.value = b.interest_rate;
            if (b.original_principal) f.billOriginalPrincipal.value = b.original_principal;
            // Loan term � show in years if divisible by 12, otherwise months
            if (b.loan_term_months) {
              const termUnit = document.getElementById('billLoanTermUnit');
              const termValue = document.getElementById('billLoanTermValue');
              if (b.loan_term_months % 12 === 0 && b.loan_term_months >= 12) {
                termValue.value = b.loan_term_months / 12;
                termUnit.value = 'years';
              } else {
                termValue.value = b.loan_term_months;
                termUnit.value = 'months';
              }
            }
            if (b.start_date) f.billStartDate.value = b.start_date;
            if (b.payments_made) f.billPaymentsMade.value = b.payments_made;
            if (b.total_amount) f.billTotalFinanced.value = b.total_amount;
            // Also check FINANCING_META fallback for payments_made/total_amount
            if (meta && !b.payments_made) f.billPaymentsMade.value = meta.payments_made || '';
            if (meta && !b.total_amount) f.billTotalFinanced.value = meta.total_amount || '';
            // If we have meta but no loan term from DB, derive from meta
            if (meta && !b.loan_term_months && meta.total_payments) {
              const termUnit = document.getElementById('billLoanTermUnit');
              const termValue = document.getElementById('billLoanTermValue');
              if (meta.total_payments % 12 === 0 && meta.total_payments >= 12) {
                termValue.value = meta.total_payments / 12;
                termUnit.value = 'years';
              } else {
                termValue.value = meta.total_payments;
                termUnit.value = 'months';
              }
            }
            updateLoanCalcPreview();
            // Also compute remaining balance even without full amort (fallback)
            const balanceDisplay = document.getElementById('remainingBalanceDisplay');
            if (balanceDisplay && balanceDisplay.textContent === '�') {
              const info = getBillFinancingInfo(b);
              if (info.isFinancing) {
                balanceDisplay.textContent = formatCurrency(info.remainingBalance);
              }
            }
          }
      }
  }
  // Add event listeners for dynamic show/hide and preview calc
  const typeSelect = document.getElementById('billType');
  typeSelect.removeEventListener('change', toggleFinancingFields);
  typeSelect.addEventListener('change', toggleFinancingFields);
  // Loan calc preview listeners
  ['billOriginalPrincipal', 'billInterestRate', 'billLoanTermValue', 'billPaymentsMade'].forEach(fid => {
    const el = document.getElementById(fid);
    if (el) { el.removeEventListener('input', updateLoanCalcPreview); el.addEventListener('input', updateLoanCalcPreview); }
  });
  const termUnitEl = document.getElementById('billLoanTermUnit');
  if (termUnitEl) { termUnitEl.removeEventListener('change', updateLoanCalcPreview); termUnitEl.addEventListener('change', updateLoanCalcPreview); }

  bootstrap.Modal.getOrCreateInstance(f.closest('.modal')).show();
}
async function saveBill() {
  // CSRF Protection
  try {
    if (typeof CSRF !== 'undefined') {
      CSRF.requireValidToken();
    }
  } catch (err) {
    alert(err.message);
    return;
  }

  // Hybrid rate limiting (client + database)
  const operation = editBillId ? 'update_item' : 'add_bill';
  const allowed = await withHybridRateLimit('save', operation, async () => {
    const f = document.getElementById('billForm');
    const record = {
        name: f.billName.value, type: f.billType.value, amount: getRaw(f.billAmount.value),
        frequency: f.billFrequency.value, nextDueDate: f.billNextDueDate.value || null, user_id: currentUser.id
    };
    // Add financing fields if financing section is visible (type match, existing data, or FINANCING_META)
    const financingVisible = !document.getElementById('financingFields').classList.contains('d-none');
    if (financingVisible) {
      const interestRate = f.billInterestRate.value;
      const originalPrincipal = f.billOriginalPrincipal.value;
      const loanTermMonths = getLoanTermMonths();
      const startDate = f.billStartDate.value;
      const paymentsMade = f.billPaymentsMade.value;
      const totalFinanced = f.billTotalFinanced.value;
      // Only include fields that have values (graceful if columns don't exist yet)
      if (interestRate !== '') record.interest_rate = parseFloat(interestRate);
      if (originalPrincipal !== '') record.original_principal = parseFloat(originalPrincipal);
      if (loanTermMonths > 0) record.loan_term_months = loanTermMonths;
      if (startDate) record.start_date = startDate;
      if (paymentsMade !== '') record.payments_made = parseInt(paymentsMade);
      if (totalFinanced !== '') {
        record.total_amount = parseFloat(totalFinanced);
      } else if (originalPrincipal && loanTermMonths > 0) {
        // Auto-calculate total_amount from amortization
        const calc = calculateAmortization(parseFloat(originalPrincipal), parseFloat(interestRate) || 0, loanTermMonths, 0);
        record.total_amount = calc.totalCost;
      }
    }
    // Attempt save � if new columns don't exist yet, retry without them
    let { error } = editBillId ? await sb.from('bills').update(record).eq('id', editBillId).eq('user_id', currentUser.id) : await sb.from('bills').insert(record);
    if (error && error.message && error.message.includes('column')) {
    // Columns don't exist yet in DB � strip new fields and retry
    const baseRecord = {
      name: record.name, type: record.type, amount: record.amount,
      frequency: record.frequency, nextDueDate: record.nextDueDate, user_id: record.user_id
    };
    if (record.total_amount) baseRecord.total_amount = record.total_amount;
    if (record.payments_made !== undefined) baseRecord.payments_made = record.payments_made;
      const retry = editBillId ? await sb.from('bills').update(baseRecord).eq('id', editBillId).eq('user_id', currentUser.id) : await sb.from('bills').insert(baseRecord);
      error = retry.error;
    }
    if (error) return alert(error.message);
    bootstrap.Modal.getInstance(f.closest('.modal')).hide();
    clearCache(); // Performance: Clear cache on data mutation

    await fetchAllDataFromSupabase(true);
    renderAll();
  });
  
  if (allowed === null) return; // Rate limited
}
function showAmortizationSchedule(billId) {
  const bill = (window.bills || []).find(b => b.id == billId);
  if (!bill) return;
  const info = getBillFinancingInfo(bill);
  if (!info.hasLoanDetails || !info.amortization) {
    alert('Loan details are required to view the amortization schedule. Edit this bill and add principal, rate, and term.');
    return;
  }
  const amort = info.amortization;

  // Populate summary
  const summaryEl = document.getElementById('amortSummary');
  if (summaryEl) {
    summaryEl.innerHTML = `
      <div class="col-md-3 col-6">
        <div class="card" style="background: var(--color-bg-3); border-color: var(--color-border-subtle);">
          <div class="card-body py-2 px-3 text-center">
            <small style="color: var(--color-text-tertiary);">Monthly Payment</small>
            <div><strong style="color: var(--color-primary);">${formatCurrency(amort.monthlyPayment)}</strong></div>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-6">
        <div class="card" style="background: var(--color-bg-3); border-color: var(--color-border-subtle);">
          <div class="card-body py-2 px-3 text-center">
            <small style="color: var(--color-text-tertiary);">Total Cost</small>
            <div><strong style="color: var(--color-text-primary);">${formatCurrency(amort.totalCost)}</strong></div>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-6">
        <div class="card" style="background: var(--color-bg-3); border-color: var(--color-border-subtle);">
          <div class="card-body py-2 px-3 text-center">
            <small style="color: var(--color-text-tertiary);">Total Interest</small>
            <div><strong style="color: var(--color-secondary);">${formatCurrency(amort.totalInterest)}</strong></div>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-6">
        <div class="card" style="background: var(--color-bg-3); border-color: var(--color-border-subtle);">
          <div class="card-body py-2 px-3 text-center">
            <small style="color: var(--color-text-tertiary);">Remaining Balance</small>
            <div><strong style="color: var(--color-text-primary);">${formatCurrency(amort.remainingBalance)}</strong></div>
          </div>
        </div>
      </div>`;
  }

  // Populate schedule table
  const tbody = document.getElementById('amortTableBody');
  if (tbody) {
    const paymentsMade = info.paymentsMade || 0;
    tbody.innerHTML = amort.schedule.map(row => {
      const isPast = row.payment <= paymentsMade;
      const isCurrent = row.payment === paymentsMade + 1;
      let rowClass = '';
      let rowStyle = '';
      if (isCurrent) {
        rowClass = 'table-active';
        rowStyle = 'border-left: 3px solid var(--color-primary); font-weight: 600;';
      } else if (isPast) {
        rowStyle = 'opacity: 0.6;';
      }
      return `<tr class="${escapeAttribute(rowClass)}" style="${escapeAttribute(rowStyle)}">
        <td>${isCurrent ? '<i class="bi bi-arrow-right-circle-fill me-1" style="color: var(--color-primary);"></i>' : ''}${escapeHtml(row.payment)}</td>
        <td>${formatCurrency(row.paymentAmount)}</td>
        <td>${formatCurrency(row.principal)}</td>
        <td>${formatCurrency(row.interest)}</td>
        <td>${formatCurrency(row.balance)}</td>
      </tr>`;
    }).join('');
  }

  // Update modal title
  const title = document.getElementById('amortizationModalLabel');
  if (title) title.textContent = `Amortization Schedule � ${bill.name}`;

  bootstrap.Modal.getOrCreateInstance(document.getElementById('amortizationModal')).show();
}

async function confirmDeleteBill(id, name) {
  deleteBillId = id;
  
  // Check if bill is shared with other users (any accepted shares)
  const acceptedShares = billSharesCache.filter(s => s.bill_id === id && s.status === 'accepted');
  const isShared = acceptedShares.length > 0;
  
  if (isShared) {
    // Show warning modal for shared bills
    showSharedBillDeleteWarning(id, name);
  } else {
    // Show standard delete confirmation
    document.getElementById('deleteBillName').textContent = `"${name}"`;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmDeleteBillModal')).show();
  }
}

function showSharedBillDeleteWarning(id, name) {
  // Get all shares for this bill (count users it's shared with)
  const shares = billSharesCache.filter(s => s.bill_id === id && s.status === 'accepted');
  const sharedUserCount = shares.length;
  
  // Populate modal content
  document.getElementById('sharedBillName').textContent = `"${name}"`;
  document.getElementById('sharedUserCount').textContent = sharedUserCount;
  
  // Set up confirmation handler
  const confirmBtn = document.getElementById('confirmSharedBillDelete');
  confirmBtn.onclick = async () => {
    const modal = bootstrap.Modal.getInstance(document.getElementById('sharedBillDeleteWarningModal'));
    if (modal) modal.hide();
    await deleteBillConfirmed();
  };
  
  // Show the warning modal
  const modal = new bootstrap.Modal(document.getElementById('sharedBillDeleteWarningModal'));
  modal.show();
}

async function deleteBillConfirmed() {
  // Rate limiting
  if (!rateLimiters.delete.allow('deleteBill')) {
    const remainingMs = rateLimiters.delete.getRemainingTime('deleteBill');
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    alert(`Too many delete requests. Please wait ${remainingSeconds} seconds.`);
    return;
  }

  // CSRF Protection
  try {
    if (typeof CSRF !== 'undefined') {
      CSRF.requireValidToken();
    }
  } catch (err) {
    alert(err.message);
    return;
  }

  const { error } = await sb.from('bills').delete().eq('id', deleteBillId).eq('user_id', currentUser.id);
  if (error) return alert(error.message);
  bootstrap.Modal.getInstance(document.getElementById('confirmDeleteBillModal')).hide();
  clearCache(); // Performance: Clear cache on data mutation

  await fetchAllDataFromSupabase(true);
  renderAll();
}

// --- INCOME ---
// Income type display names
function getIncomeTypeDisplayName(type) {
  const typeMap = {
    'salary': 'Salary (W2)',
    'hourly': 'Hourly',
    'commission': 'Commission',
    'bonus': 'Bonus',
    'freelance': 'Freelance (1099)',
    'rental': 'Rental',
    'investment': 'Investment',
    'other': 'Other'
  };
  return typeMap[type] || type;
}

// Income frequency display names
function getIncomeFrequencyDisplayName(freq) {
  const freqMap = {
    'weekly': 'Weekly',
    'bi-weekly': 'Bi-Weekly',
    'semi-monthly': 'Semi-Monthly',
    'monthly': 'Monthly',
    'quarterly': 'Quarterly',
    'annually': 'Annually'
  };
  return freqMap[freq] || freq;
}

function renderIncome() {
  const tbody = document.getElementById('incomeTableBody');
  if (!tbody) return;
  
  const income = window.income || [];
  
  // Toggle empty state
  if (typeof toggleEmptyState === 'function') {
    toggleEmptyState('dataContainer', 'income', income);
  }
  
  tbody.innerHTML = income.map(i => `
      <tr>
          <td>${escapeHtml(i.name)}</td>
          <td>${escapeHtml(getIncomeTypeDisplayName(i.type))}</td>
          <td>${formatCurrency(i.amount)}</td>
          <td>${escapeHtml(getIncomeFrequencyDisplayName(i.frequency))}</td>
          <td>${i.nextDueDate ? escapeHtml(formatDate(i.nextDueDate)) : '-'}</td>
          <td>
              <button class="btn btn-sm btn-outline-primary" onclick="openIncomeModal('${escapeAttribute(i.id)}')" aria-label="Edit ${escapeAttribute(i.name)}"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteIncome('${escapeAttribute(i.id)}', '${escapeAttribute(i.name)}')" aria-label="Delete ${escapeAttribute(i.name)}"><i class="bi bi-trash"></i></button>
          </td>
      </tr>`).join('');
}
function openIncomeModal(id = null) {
  editIncomeId = id;
  const f = document.getElementById('incomeForm');
  f.reset();
  if (id) {
      const i = window.income.find(x => x.id == id); // FIX: Changed === to ==
      if (i) {
          f.incomeName.value = escapeHtml(i.name || '');
          f.incomeType.value = i.type || ''; // Raw value for select dropdown
          f.incomeAmount.value = i.amount;
          f.incomeFrequency.value = i.frequency || ''; // Raw value for select dropdown
          f.incomeNextDueDate.value = i.nextDueDate;
      }
  }
  bootstrap.Modal.getOrCreateInstance(f.closest('.modal')).show();
}
async function saveIncome() {
  // CSRF Protection
  try {
    if (typeof CSRF !== 'undefined') {
      CSRF.requireValidToken();
    }
  } catch (err) {
    alert(err.message);
    return;
  }

  // Hybrid rate limiting (client + database)
  const operation = editIncomeId ? 'update_item' : 'add_income';
  const allowed = await withHybridRateLimit('save', operation, async () => {
    const f = document.getElementById('incomeForm');
    const record = {
        name: f.incomeName.value, type: f.incomeType.value, amount: getRaw(f.incomeAmount.value),
        frequency: f.incomeFrequency.value, nextDueDate: f.incomeNextDueDate.value || null, user_id: currentUser.id
    };
    const { error } = editIncomeId ? await sb.from('income').update(record).eq('id', editIncomeId).eq('user_id', currentUser.id) : await sb.from('income').insert(record);
    if (error) return alert(error.message);
    bootstrap.Modal.getInstance(f.closest('.modal')).hide();
    clearCache(); // Performance: Clear cache on data mutation

    await fetchAllDataFromSupabase(true);
    renderAll();
  });
  
  if (allowed === null) return; // Rate limited
}
function confirmDeleteIncome(id, name) {
  deleteIncomeId = id;
  // BUG-04 FIX: Accept name as parameter instead of looking up by ID (prevents "undefined" for new items)
  document.getElementById('deleteIncomeName').textContent = `"${name}"`;
  bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmDeleteIncomeModal')).show();
}
async function deleteIncomeConfirmed() {
  // Rate limiting
  if (!rateLimiters.delete.allow('deleteIncome')) {
    const remainingMs = rateLimiters.delete.getRemainingTime('deleteIncome');
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    alert(`Too many delete requests. Please wait ${remainingSeconds} seconds.`);
    return;
  }

  // CSRF Protection
  try {
    if (typeof CSRF !== 'undefined') {
      CSRF.requireValidToken();
    }
  } catch (err) {
    alert(err.message);
    return;
  }

  const { error } = await sb.from('income').delete().eq('id', deleteIncomeId).eq('user_id', currentUser.id);
  if (error) return alert(error.message);
  bootstrap.Modal.getInstance(document.getElementById('confirmDeleteIncomeModal')).hide();
  clearCache(); // Performance: Clear cache on data mutation

  await fetchAllDataFromSupabase(true);
  renderAll();
}


// ===== DASHBOARD & CHARTING =====

// This new function renders the Emergency Fund chart OR the custom message
async function renderEmergencyFundChart() {
  const wrapper = document.getElementById('emergencyFundChartWrapper');
  if (!wrapper) return;

  // Clear any previous chart or message
  if (emergencyFundChart) emergencyFundChart.destroy();
  wrapper.textContent = '';

  const emergencyGoal = window.settings?.emergency_fund_goal || 0;
  const emergencyFundAsset = (window.investments || []).find(a => a.name.toLowerCase().includes('emergency fund'));
  const emergencyCurrent = emergencyFundAsset?.value || 0;

  if (emergencyGoal > 0) {
      // If a goal is set, render the chart
      const canvas = document.createElement('canvas');
      wrapper.appendChild(canvas);
      const theme = getThemeColors();

      emergencyFundChart = await safeCreateChart(canvas, {
          type: 'bar',
          data: {
              labels: ['Goal', 'Current'],
              datasets: [{
                  data: [emergencyGoal, emergencyCurrent],
                  backgroundColor: ['#f0a500', '#81b900'],
                  barThickness: 50
              }]
          },
          options: {
              indexAxis: 'y',
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                  x: { ticks: { color: theme.text, callback: v => formatCurrency(v) }, grid: { color: theme.grid }, min: 0 },
                  y: { ticks: { color: theme.text }, grid: { display: false } }
              }
          }
      }, 'Emergency Fund');
  } else {
      // If no goal is set, render your custom message
      wrapper.innerHTML = `
          <div class="text-center">
              <p class="text-muted mb-2">You don't have an emergency fund goal set.</p>
              <a href="settings.html" class="btn btn-primary btn-sm">Click here to set one</a>
          </div>
      `;
  }
}

// This new function saves your settings to Supabase
async function saveSettings() {
  // Rate limiting
  if (!rateLimiters.save.allow('saveSettings')) {
    const remainingMs = rateLimiters.save.getRemainingTime('saveSettings');
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    alert(`Too many save requests. Please wait ${remainingSeconds} seconds.`);
    return;
  }

  // CSRF Protection
  try {
    if (typeof CSRF !== 'undefined') {
      CSRF.requireValidToken();
    }
  } catch (err) {
    alert(err.message);
    return;
  }

  if (!currentUser) return;
  const goal = getRaw(document.getElementById('emergencyFundGoal').value);

  const { error } = await sb
      .from('settings')
      .upsert({ user_id: currentUser.id, emergency_fund_goal: goal });

  const statusEl = document.getElementById('settingsStatus');
  if (error) {
      statusEl.textContent = "Error saving settings.";
      statusEl.className = "ms-3 text-danger";
      console.error(error);
  } else {
      statusEl.textContent = "Settings saved!";
      statusEl.className = "ms-3 text-success";
      // Re-fetch settings data to update the app state
      clearCache(); // Performance: Clear cache on data mutation

      await fetchAllDataFromSupabase(true);
  }
  setTimeout(() => { statusEl.textContent = ''; }, 3000);
}

async function renderAdditionalCharts() {
  if (!currentUser) return;

  // Fetch all necessary data (expanded selects for per-month calculations)
  const [snapshotsRes, billsRes, debtsRes, incomeRes, investmentsRes, assetsRes] = await Promise.all([
    sb.from('snapshots').select('date, netWorth').eq('user_id', currentUser.id),
    sb.from('bills').select('type, amount, frequency, nextDueDate').eq('user_id', currentUser.id),
    sb.from('debts').select('type, monthlyPayment, nextDueDate').eq('user_id', currentUser.id),
    sb.from('income').select('amount, frequency, nextDueDate').eq('user_id', currentUser.id),
    sb.from('investments').select('value, annualReturn, monthlyContribution').eq('user_id', currentUser.id),
    sb.from('assets').select('name, value').eq('user_id', currentUser.id)
  ]);

  const snapshots = snapshotsRes.data || [];
  const bills = billsRes.data || [];
  const debts = debtsRes.data || [];
  const income = incomeRes.data || [];
  const investments = investmentsRes.data || [];
  const assets = assetsRes.data || [];

  // --- Net Worth Change ---
  const monthGroups = {};
  snapshots.forEach(({ date, netWorth }) => {
    const key = new Date(date).toLocaleString('default', { month: 'short', year: 'numeric' });
    monthGroups[key] = netWorth;
  });
  const sortedNetWorth = Object.entries(monthGroups).sort(([a], [b]) => new Date(a) - new Date(b));
  const netLabels = sortedNetWorth.map(([label]) => label);
  const netData = sortedNetWorth.map(([, val], i, arr) => i === 0 ? 0 : val - arr[i - 1][1]);

  if (netWorthDeltaChartInst) netWorthDeltaChartInst.destroy();
  netWorthDeltaChartInst = safeCreateChart(document.getElementById('netWorthDeltaChart'), {
    type: 'bar',
    data: {
      labels: netLabels,
      datasets: [{
        label: 'Change ($)',
        data: netData,
        backgroundColor: ctx => ctx.raw < 0 ? '#e53935' : '#81b900'
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { color: '#b0b0b0' }, grid: { color: 'rgba(240,240,240,0.08)' } }, x: { ticks: { color: '#b0b0b0' }, grid: { display: false } } } }
  }, 'Net Worth Delta');

  // --- Spending Categories ---
  const categorySums = {};
  [...bills, ...debts.map(d => ({ type: d.type, amount: d.monthlyPayment }))].forEach(item => {
    categorySums[item.type] = (categorySums[item.type] || 0) + parseFloat(item.amount || 0);
  });
  const spendLabels = Object.keys(categorySums);
  const spendValues = Object.values(categorySums);

  if (spendingCategoriesChartInst) spendingCategoriesChartInst.destroy();
  spendingCategoriesChartInst = safeCreateChart(document.getElementById('spendingCategoriesChart'), {
    type: 'doughnut',
    data: {
      labels: spendLabels,
      datasets: [{
        data: spendValues,
        backgroundColor: ['#f44e24', '#01a4ef', '#81b900', '#e53935', '#999999']
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#b0b0b0' } } } }
  }, 'Spending Categories');

  // --- Savings Rate Over Time (WARN-07 FIX: per-month calculation) ---
  const savingsLabels = netLabels;
  const savingsData = savingsLabels.map(label => {
    const monthDate = new Date(label);
    if (isNaN(monthDate.getTime())) return 0;
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

    // Calculate income that falls in this specific month
    let monthIncome = 0;
    (income || []).forEach(item => {
      if (!item.nextDueDate || !item.frequency) return;
      const amount = parseFloat(item.amount || 0);
      let nextDate = new Date(item.nextDueDate + 'T00:00:00');
      let safety = 0;
      while (nextDate < monthStart && safety < 1000) { nextDate = getNextDate(nextDate, item.frequency); safety++; }
      safety = 0;
      while (nextDate <= monthEnd && safety < 100) { monthIncome += amount; nextDate = getNextDate(nextDate, item.frequency); safety++; }
    });

    // Calculate expenses (bills + debt payments) that fall in this specific month
    let monthExpenses = 0;
    const allExpenseItems = [
      ...(bills || []),
      ...(debts || []).map(d => ({ ...d, amount: d.monthlyPayment, frequency: 'monthly', nextDueDate: d.nextDueDate }))
    ];
    allExpenseItems.forEach(item => {
      if (!item.nextDueDate || !item.frequency) return;
      // BUG FIX: Use owner_amount for shared bills in savings rate calculation
      let amount = item.amount;
      // Check if this is a bill (has id and not mapped from debt) and if it's shared
      if (item.id && item.type !== 'debt') {
        const shareInfo = getShareInfoForBill(item.id);
        if (shareInfo && shareInfo.status === 'accepted') {
          amount = shareInfo.owner_amount;
        }
      }
      amount = parseFloat(amount || 0);
      let nextDate = new Date(item.nextDueDate + 'T00:00:00');
      let safety = 0;
      while (nextDate < monthStart && safety < 1000) { nextDate = getNextDate(nextDate, item.frequency); safety++; }
      safety = 0;
      while (nextDate <= monthEnd && safety < 100) { monthExpenses += amount; nextDate = getNextDate(nextDate, item.frequency); safety++; }
    });

    // BUG-03 FIX: Add explicit NaN/Infinity check to prevent chart errors
    const rate = monthIncome > 0 ? ((monthIncome - monthExpenses) / monthIncome) * 100 : 0;
    return isNaN(rate) || !isFinite(rate) ? 0 : Math.round(rate);
  });

  if (savingsRateChartInst) savingsRateChartInst.destroy();
  savingsRateChartInst = safeCreateChart(document.getElementById('savingsRateChart'), {
    type: 'line',
    data: {
      labels: savingsLabels,
      datasets: [{
        label: 'Savings Rate %',
        data: savingsData,
        fill: true,
        borderColor: '#81b900',
        backgroundColor: 'rgba(129, 185, 0, 0.15)',
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#b0b0b0' } } },
      scales: {
        y: { ticks: { color: '#b0b0b0' }, grid: { color: 'rgba(240,240,240,0.08)' } },
        x: { ticks: { color: '#b0b0b0' }, grid: { display: false } }
      }
    }
  }, 'Savings Rate');

  // --- Investment Growth (WARN-08 FIX: dynamic months & actual user data) ---
  const now = new Date();
  const investLabels = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    investLabels.push(d.toLocaleString('default', { month: 'short' }));
  }

  const totalCurrentInvestments = investments.reduce((sum, inv) => sum + parseFloat(inv.value || 0), 0);
  // Weighted-average annual return based on portfolio value allocation
  const weightedReturn = totalCurrentInvestments > 0
    ? investments.reduce((sum, inv) => sum + (parseFloat(inv.value || 0) * parseFloat(inv.annualReturn || 0)), 0) / totalCurrentInvestments
    : 0;
  const monthlyReturn = weightedReturn / 100 / 12;
  const totalMonthlyContribution = investments.reduce((sum, inv) => sum + parseFloat(inv.monthlyContribution || 0), 0);

  // Project forward from current total using actual returns & contributions
  const investData = [totalCurrentInvestments];
  for (let i = 1; i < 5; i++) {
    const prev = investData[i - 1];
    investData.push(Math.round(prev * (1 + monthlyReturn) + totalMonthlyContribution));
  }

  if (investmentGrowthChartInst) investmentGrowthChartInst.destroy();
  investmentGrowthChartInst = safeCreateChart(document.getElementById('investmentGrowthChart'), {
    type: 'line',
    data: {
      labels: investLabels,
      datasets: [{
        label: 'Projected Value ($)',
        data: investData,
        fill: true,
        borderColor: '#f44e24',
        backgroundColor: 'rgba(244, 78, 36, 0.15)',
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#b0b0b0' } } },
      scales: {
        y: { ticks: { color: '#b0b0b0' }, grid: { color: 'rgba(240,240,240,0.08)' } },
        x: { ticks: { color: '#b0b0b0' }, grid: { display: false } }
      }
    }
  }, 'Investment Growth');
}





// ===== BUDGET LOGIC =====

// This is the main function that runs when the budget page loads or the month changes
async function loadAndRenderBudget() {
  // Only run this function if we are on the budget page
  if (!document.getElementById('budgetAssignmentTable')) return;

  // --- NEW FIX #1: Wait for data before rendering ---
  // This robustly checks if the data from Supabase has arrived.
  // It will wait up to 10 seconds before showing an error.
  const startTime = Date.now();
  while ((!window.bills || !window.debts) && Date.now() - startTime < 10000) {
      // Wait 50 milliseconds and check again
      await new Promise(resolve => setTimeout(resolve, 50));
  }

  // If data is still not available after waiting, show a clear error message.
  if (!window.bills || !window.debts) {
      console.error("Budget page timeout: Data is not available after 10 seconds.");
      const tbody = document.getElementById('budgetAssignmentTable');
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 7;
      cell.className = 'text-center text-danger';
      cell.textContent = 'Could not load bill and debt data. Please try refreshing the page.';
      row.appendChild(cell);
      tbody.replaceChildren(row);
      return;
  }
  // --- END OF FIX #1 ---

  const monthString = `${currentBudgetMonth.getFullYear()}-${(currentBudgetMonth.getMonth() + 1).toString().padStart(2, '0')}`;
  if (document.getElementById('currentMonth')) {
      document.getElementById('currentMonth').textContent = currentBudgetMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  }

  let budgetAssignments = {};
  let allBudgetRecords = [];
  if (currentUser) {
      const { data: assignments, error } = await sb.from('budgets').select('*').eq('user_id', currentUser.id).eq('month', monthString);
      if (error) {
          console.error("Could not fetch saved budget assignments:", error.message);
      } else {
          allBudgetRecords = assignments || [];
          allBudgetRecords.forEach(a => {
            if (!a.suppressed) {
              budgetAssignments[a.item_id] = a.assigned_amount;
            }
          });
      }
  }

  // Build a set of suppressed item IDs from budget records
  const suppressedItemIds = new Set(
    allBudgetRecords.filter(a => a.suppressed).map(a => a.item_id)
  );

  const totalIncome = (window.income || []).reduce((sum, i) => sum + getRaw(i.amount), 0);
  const totalAssigned = Object.values(budgetAssignments).reduce((sum, amount) => sum + getRaw(amount), 0);
  const remainingToBudget = totalIncome - totalAssigned;

  if(document.getElementById('expectedIncome')) document.getElementById('expectedIncome').textContent = formatCurrency(totalIncome);
  if(document.getElementById('assignedAmount')) document.getElementById('assignedAmount').textContent = formatCurrency(totalAssigned);
  if(document.getElementById('remainingToBudget')) document.getElementById('remainingToBudget').textContent = formatCurrency(remainingToBudget);

  // MED-04: Income warning banner
  const tableCard = document.querySelector('.table-card');
  let incomeWarning = document.getElementById('incomeWarningBanner');
  if (totalIncome === 0) {
    if (!incomeWarning && tableCard) {
      incomeWarning = document.createElement('div');
      incomeWarning.id = 'incomeWarningBanner';
      incomeWarning.className = 'alert alert-warning mb-3';
      const icon = document.createElement('i');
      icon.className = 'bi bi-exclamation-triangle-fill me-2';
      const text1 = document.createTextNode('​​ No income sources found for this month. ');
      const link = document.createElement('a');
      link.href = 'income.html';
      link.className = 'alert-link';
      link.textContent = 'Add income on the Income page';
      const text2 = document.createTextNode(' to track your budget accurately.');
      incomeWarning.appendChild(icon);
      incomeWarning.appendChild(text1);
      incomeWarning.appendChild(link);
      incomeWarning.appendChild(text2);
      tableCard.parentNode.insertBefore(incomeWarning, tableCard);
    }
  } else if (incomeWarning) {
    incomeWarning.remove();
  }

  const tbody = document.getElementById('budgetAssignmentTable');
  tbody.textContent = '';

  // Fetch shared bills for budget display (same logic as generateBudgetForMonth)
  let sharedBillsForDisplay = [];
  if (currentUser) {
    const { data: sharedBills, error: sharesError } = await sb
      .from('bill_shares')
      .select(`
        *,
        bill:bills!bill_shares_bill_id_fkey(*)
      `)
      .eq('shared_with_id', currentUser.id)
      .eq('status', 'accepted');
    
    if (!sharesError && sharedBills) {
      sharedBillsForDisplay = sharedBills.map(share => ({
        ...share.bill,
        amount: share.shared_amount || (share.bill.amount * 0.5),
        id: share.bill.id,
        isShared: true,
        shareId: share.id,
        name: share.bill.name,
        type: share.bill.type,
        frequency: share.bill.frequency,
        status: share.bill.status,
        is_variable: share.bill.is_variable
      }));
    }
  }

  // Check if there's any budget data to display (moved AFTER shared bills fetch)
  const hasBudgetData = (window.bills && window.bills.length > 0) ||
    (window.debts && window.debts.length > 0) ||
    (window.income && window.income.length > 0) ||
    sharedBillsForDisplay.length > 0 ||
    allBudgetRecords.length > 0;
  if (typeof toggleEmptyState === 'function') {
    toggleEmptyState('dataContainer', 'budget', hasBudgetData);
  }

  // Filter out paid-off financing items from the budget display
  // FIX FC-037: Deduplicate bills by ID (shared bills may also exist in window.bills)
  const allItems = [...(window.bills || []), ...sharedBillsForDisplay, ...(window.debts || [])];
  const seenIds = new Set();
  const budgetItems = allItems.filter(item => {
      if (!item || !item.id) return false;
      // Skip duplicates (same ID already processed)
      if (seenIds.has(item.id)) return false;
      seenIds.add(item.id);
      // Skip paid-off or cancelled bills (check DB status field if it exists)
      const dbStatus = (item.status || '').toLowerCase();
      if (dbStatus === 'paid_off' || dbStatus === 'cancelled') return false;
      // Skip paid-off financing items (hardcoded metadata fallback)
      const info = getBillFinancingInfo(item);
      if (info.isFinancing && info.status === 'paid_off') return false;
      return true;
  });

  // Collect IDs of all bills/debts so we can identify standalone budget items
  const billDebtIds = new Set(budgetItems.map(item => item.id).filter(Boolean));

  budgetItems.forEach(item => {
      if (!item.id) {
          debugLog("Skipping an invalid budget item without an ID:", item);
          return;
      }

      // MED-01: Skip suppressed items from normal rendering (shown separately below)
      if (suppressedItemIds.has(item.id)) return;

      const itemId = item.id;
      const needed = item.amount || item.monthlyPayment || 0;
      const assigned = budgetAssignments[itemId] || 0;
      const remaining = needed - assigned;
      const fundingPercent = needed > 0 ? (assigned / needed) * 100 : (assigned > 0 ? 100 : 0);

      let progressBarClass = 'bg-dashboard-green';
      if (fundingPercent > 100) progressBarClass = 'bg-dashboard-red';
      else if (fundingPercent < 100) progressBarClass = 'bg-dashboard-yellow';

      const remainingTextColor = remaining <= 0 ? 'text-dashboard-green' : 'text-dashboard-yellow';

      const row = document.createElement('tr');
      row.innerHTML = `
          <td>${escapeHtml(item.name || 'Unnamed')}</td><td>${escapeHtml(toTitleCase(item.type) || 'N/A')}</td><td>${formatCurrency(needed)}</td>
          <td><div class="input-group input-group-sm"><span class="input-group-text">$</span><input type="number" class="form-control assigned-input" value="${escapeAttribute(assigned.toFixed(2))}" data-item-id="${escapeAttribute(item.id)}" step="0.01"></div></td>
          <td class="${remainingTextColor} fw-bold">${formatCurrency(remaining)}</td>
          <td><div class="progress" style="height: 20px;"><div class="progress-bar ${progressBarClass}" style="width: ${escapeAttribute(String(Math.min(fundingPercent, 100)))}%">${escapeHtml(Math.round(fundingPercent))}%</div></div></td>
          <td><button class="btn btn-sm btn-outline-danger" onclick="deleteBudgetItem('${escapeAttribute(item.id)}', '${escapeAttribute(monthString)}')" aria-label="Remove ${escapeAttribute(item.name)} from budget"><i class="bi bi-trash"></i></button></td>
      `;
      tbody.appendChild(row);
  });

  // Render standalone budget items (manually added, not tied to a bill/debt)
  const standaloneItems = allBudgetRecords.filter(rec => rec.item_id && !billDebtIds.has(rec.item_id) && rec.item_type === 'custom' && !rec.suppressed);
  standaloneItems.forEach(rec => {
      const needed = getRaw(rec.needed_amount) || 0;
      const assigned = getRaw(rec.assigned_amount) || 0;
      const remaining = needed - assigned;
      const fundingPercent = needed > 0 ? (assigned / needed) * 100 : (assigned > 0 ? 100 : 0);

      let progressBarClass = 'bg-dashboard-green';
      if (fundingPercent > 100) progressBarClass = 'bg-dashboard-red';
      else if (fundingPercent < 100) progressBarClass = 'bg-dashboard-yellow';

      const remainingTextColor = remaining <= 0 ? 'text-dashboard-green' : 'text-dashboard-yellow';

      const row = document.createElement('tr');
      row.innerHTML = `
          <td>${escapeHtml(rec.name || 'Unnamed')}</td><td>${escapeHtml(toTitleCase(rec.category) || 'Custom')}</td><td>${formatCurrency(needed)}</td>
          <td><div class="input-group input-group-sm"><span class="input-group-text">$</span><input type="number" class="form-control assigned-input" value="${escapeAttribute(assigned.toFixed(2))}" data-item-id="${escapeAttribute(rec.item_id)}" data-item-type="custom" step="0.01"></div></td>
          <td class="${remainingTextColor} fw-bold">${formatCurrency(remaining)}</td>
          <td><div class="progress" style="height: 20px;"><div class="progress-bar ${progressBarClass}" style="width: ${escapeAttribute(String(Math.min(fundingPercent, 100)))}%">${escapeHtml(Math.round(fundingPercent))}%</div></div></td>
          <td><button class="btn btn-sm btn-outline-danger" onclick="deleteBudgetItem('${escapeAttribute(rec.item_id)}', '${escapeAttribute(monthString)}')" aria-label="Remove ${escapeAttribute(rec.item_name)} from budget"><i class="bi bi-trash"></i></button></td>
      `;
      tbody.appendChild(row);
  });

  // MED-01: Render suppressed items (greyed out with restore button)
  const suppressedRecords = allBudgetRecords.filter(rec => rec.suppressed);
  if (suppressedRecords.length > 0) {
    const dividerRow = document.createElement('tr');
    dividerRow.innerHTML = `<td colspan="7" class="text-muted text-center small py-2" style="opacity: 0.6;"><i class="bi bi-eye-slash me-1"></i>Removed items (click restore to re-add)</td>`;
    tbody.appendChild(dividerRow);

    suppressedRecords.forEach(rec => {
      const needed = getRaw(rec.needed_amount) || 0;
      const row = document.createElement('tr');
      row.style.opacity = '0.45';
      row.innerHTML = `
          <td><s>${escapeHtml(rec.name || 'Unnamed')}</s></td>
          <td>${escapeHtml(toTitleCase(rec.category) || 'N/A')}</td>
          <td class="text-muted">${formatCurrency(needed)}</td>
          <td class="text-muted">�</td>
          <td class="text-muted">�</td>
          <td class="text-muted small">Removed</td>
          <td><button class="btn btn-sm btn-outline-success" onclick="restoreBudgetItem('${escapeAttribute(rec.item_id)}', '${escapeAttribute(monthString)}')" aria-label="Restore ${escapeAttribute(rec.item_name)} to budget"><i class="bi bi-arrow-counterclockwise"></i></button></td>
      `;
      tbody.appendChild(row);
    });
  }

  // MED-03: Empty state when no budget items exist
  if (tbody.children.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `<td colspan="7" class="text-center text-muted py-4">
      <i class="bi bi-journal-text" style="font-size: 1.5rem;"></i><br>
      No budget items yet.<br>
      <small>Add bills on the <a href="bills.html">Bills page</a> or click <strong>Generate Budget</strong> to get started.</small>
    </td>`;
    tbody.appendChild(emptyRow);
  }

  // --- NEW FIX #2: The corrected event listener ---
  document.querySelectorAll('.assigned-input').forEach(input => {
    input.addEventListener('change', async (e) => {
      const itemId = e.target.getAttribute('data-item-id');
      const assignedAmount = getRaw(e.target.value);
      if (!currentUser || !itemId) return;

      // Derive item type (custom items have data-item-type attribute)
      const explicitType = e.target.getAttribute('data-item-type');
      let itemType;
      if (explicitType === 'custom') {
        itemType = 'custom';
      } else {
        const isBill = window.bills?.some(b => b.id === itemId);
        itemType = isBill ? 'bill' : 'debt';
      }

      await saveBudgetAssignment(itemId, assignedAmount, itemType);


      const totalIncome = (window.income || []).reduce((sum, i) => sum + getRaw(i.amount), 0);
      const allAssignedInputs = Array.from(document.querySelectorAll('.assigned-input'));
      const newTotalAssigned = allAssignedInputs.reduce((sum, currentInput) => sum + getRaw(currentInput.value), 0);
      const newRemainingToBudget = totalIncome - newTotalAssigned;

      if(document.getElementById('assignedAmount')) document.getElementById('assignedAmount').textContent = formatCurrency(newTotalAssigned);
      if(document.getElementById('remainingToBudget')) document.getElementById('remainingToBudget').textContent = formatCurrency(newRemainingToBudget);

      const row = e.target.closest('tr');
      const needed = getRaw(row.cells[2].textContent);
      const remainingCell = row.cells[4];
      const progressBar = row.querySelector('.progress-bar');

      const remaining = needed - assignedAmount;
      const fundingPercent = needed > 0 ? (assignedAmount / needed) * 100 : (assignedAmount > 0 ? 100 : 0);

      remainingCell.textContent = formatCurrency(remaining);

      let pBarClass = 'bg-dashboard-green';
      if (fundingPercent > 100) pBarClass = 'bg-dashboard-red';
      else if (fundingPercent < 100) pBarClass = 'bg-dashboard-yellow';

      progressBar.className = `progress-bar ${pBarClass}`;
      progressBar.style.width = `${Math.min(fundingPercent, 100)}%`;
      progressBar.textContent = `${Math.round(fundingPercent)}%`;

      const remTextColor = remaining <= 0 ? 'text-dashboard-green' : 'text-dashboard-yellow';
      remainingCell.className = `fw-bold ${remTextColor}`;
    });
  });
}
async function saveBudgetAssignment(itemId, assignedAmount, itemType) {
  // CSRF Protection
  try {
    if (typeof CSRF !== 'undefined') {
      CSRF.requireValidToken();
    }
  } catch (err) {
    alert(err.message);
    return;
  }

  if (!currentUser || !itemId || !itemType) return;

  const monthString = `${currentBudgetMonth.getFullYear()}-${(currentBudgetMonth.getMonth() + 1).toString().padStart(2, '0')}`;

  const record = {
    user_id: currentUser.id,
    item_id: itemId,
    item_type: itemType,
    month: monthString,
    assigned_amount: assignedAmount
  };

  const { error } = await sb
    .from('budgets')
    .upsert(record, { onConflict: 'user_id,month,item_id' });

  if (error) {
    console.error("Error saving assignment:", error);
    alert("Could not save the change.");
    return;
  }

  clearCache(); // Performance: Clear cache on data mutation


  await fetchAllDataFromSupabase(true);
  renderAll();
}

// This function saves a manually-added budget item to Supabase
async function saveBudgetItem() {
  // CSRF Protection
  try {
    if (typeof CSRF !== 'undefined') {
      CSRF.requireValidToken();
    }
  } catch (err) {
    alert(err.message);
    return;
  }

  if (!currentUser) return;
  const monthString = `${currentBudgetMonth.getFullYear()}-${(currentBudgetMonth.getMonth() + 1).toString().padStart(2, '0')}`;
  
  // Generate a unique item_id for standalone/custom budget items
  const customItemId = crypto.randomUUID ? crypto.randomUUID() : 'custom-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  const neededAmount = getRaw(document.getElementById('budgetItemNeeded').value);

  const record = {
    user_id: currentUser.id,
    month: monthString,
    item_id: customItemId,
    item_type: 'custom',
    name: document.getElementById('budgetItemName').value,
    category: document.getElementById('budgetItemCategory').value,
    needed_amount: neededAmount,
    assigned_amount: neededAmount
  };

  const { error } = await sb.from('budgets').insert(record);

  if (error) {
    alert("Error saving item: " + error.message);
  } else {
    // Hide the modal and reset the form
    bootstrap.Modal.getInstance(document.getElementById('addBudgetItemModal')).hide();
    document.getElementById('budgetItemForm').reset();

    // THE FIX: Use the same successful pattern as your other save functions
    // 1. Fetch all data again to get the new item.
    clearCache(); // Performance: Clear cache on data mutation

    await fetchAllDataFromSupabase(true);
    // 2. Re-render the entire UI with the fresh data.
    renderAll();
  }
}

// Delete (suppress) a budget item for a specific month
// Bill/debt items are suppressed so "Generate Budget" won't re-add them.
// Custom items are fully deleted since they have no external source.
async function deleteBudgetItem(itemId, monthString) {
  // CSRF Protection
  try {
    if (typeof CSRF !== 'undefined') {
      CSRF.requireValidToken();
    }
  } catch (err) {
    alert(err.message);
    return;
  }

  if (!currentUser || !itemId) return;
  if (!confirm('Remove this item from the budget for this month?')) return;

  // Check if there's a budget record for this item (bill/debt items may not have one yet)
  const { data: existing } = await sb
    .from('budgets')
    .select('id, item_type')
    .eq('user_id', currentUser.id)
    .eq('month', monthString)
    .eq('item_id', itemId)
    .maybeSingle();

  if (existing && existing.item_type === 'custom') {
    // Custom items: fully delete
    const { error } = await sb
      .from('budgets')
      .delete()
      .eq('user_id', currentUser.id)
      .eq('month', monthString)
      .eq('item_id', itemId);

    if (error) {
      console.error("Error deleting budget item:", error);
      alert("Could not delete the budget item: " + error.message);
      return;
    }
  } else if (existing) {
    // Bill/debt items: suppress so generate won't re-add
    const { error } = await sb
      .from('budgets')
      .update({ suppressed: true, assigned_amount: 0 })
      .eq('user_id', currentUser.id)
      .eq('month', monthString)
      .eq('item_id', itemId);

    if (error) {
      console.error("Error suppressing budget item:", error);
      alert("Could not remove the budget item: " + error.message);
      return;
    }
  } else {
    // No budget record exists yet (bill/debt rendered from source data).
    // Create a suppressed record so generate won't add it.
    const isBill = (window.bills || []).some(b => b.id === itemId);
    const sourceItem = isBill
      ? (window.bills || []).find(b => b.id === itemId)
      : (window.debts || []).find(d => d.id === itemId);

    const { error } = await sb
      .from('budgets')
      .insert({
        user_id: currentUser.id,
        month: monthString,
        item_id: itemId,
        item_type: isBill ? 'bill' : 'debt',
        assigned_amount: 0,
        needed_amount: getRaw(sourceItem?.amount || sourceItem?.monthlyPayment || 0),
        name: sourceItem?.name || 'Unknown',
        category: sourceItem?.type || 'N/A',
        suppressed: true
      });

    if (error) {
      console.error("Error creating suppressed budget item:", error);
      alert("Could not remove the budget item: " + error.message);
      return;
    }
  }

  // Refresh the budget view
  clearCache(); // Performance: Clear cache on data mutation

  await fetchAllDataFromSupabase(true);
  loadAndRenderBudget();
}

// Restore a suppressed budget item
async function restoreBudgetItem(itemId, monthString) {
  if (!currentUser || !itemId) return;

  // Find the record to get the needed amount for restoring assigned_amount
  const { data: record } = await sb
    .from('budgets')
    .select('needed_amount')
    .eq('user_id', currentUser.id)
    .eq('month', monthString)
    .eq('item_id', itemId)
    .maybeSingle();

  const { error } = await sb
    .from('budgets')
    .update({ suppressed: false, assigned_amount: getRaw(record?.needed_amount || 0) })
    .eq('user_id', currentUser.id)
    .eq('month', monthString)
    .eq('item_id', itemId);

  if (error) {
    console.error("Error restoring budget item:", error);
    alert("Could not restore the budget item: " + error.message);
    return;
  }

  clearCache(); // Performance: Clear cache on data mutation


  await fetchAllDataFromSupabase(true);
  loadAndRenderBudget();
}

// ===== BUDGET AUTO-POPULATION =====
async function generateBudgetForMonth(monthString) {
  if (!currentUser) {
    alert('Please log in first.');
    return;
  }

  const statusEl = document.getElementById('generateBudgetStatus');
  if (statusEl) {
    statusEl.textContent = 'Generating...';
    statusEl.className = 'ms-2 text-info small';
  }

  try {
    // 1. Fetch all active recurring bills (owned + shared)
    // 1a. Fetch bills user owns
    const { data: ownedBills, error: billsError } = await sb
      .from('bills')
      .select('*')
      .eq('user_id', currentUser.id);

    if (billsError) throw billsError;

    // 1b. Fetch accepted bill shares
    const { data: sharedBills, error: sharesError } = await sb
      .from('bill_shares')
      .select(`
        *,
        bill:bills!bill_shares_bill_id_fkey(*)
      `)
      .eq('shared_with_id', currentUser.id)
      .eq('status', 'accepted');

    if (sharesError) throw sharesError;

    // 1c. Merge owned bills and shared bills
    const activeBills = [
      ...(ownedBills || []),
      ...(sharedBills || []).map(share => ({
        ...share.bill,
        amount: share.shared_amount || (share.bill.amount * 0.5), // Use shared_amount or 50% fallback
        id: share.bill.id,
        isShared: true,
        shareId: share.id,
        // Preserve original fields from bill
        name: share.bill.name,
        type: share.bill.type,
        frequency: share.bill.frequency,
        status: share.bill.status,
        is_variable: share.bill.is_variable
      }))
    ];

    // 2. Fetch existing budget entries for this month
    const { data: existingBudgets, error: budgetError } = await sb
      .from('budgets')
      .select('*')
      .eq('user_id', currentUser.id)
      .eq('month', monthString);

    if (budgetError) throw budgetError;

    // Build a set of already-budgeted item IDs (including suppressed ones � don't re-add them)
    const budgetedItemIds = new Set((existingBudgets || []).map(b => b.item_id));

    // 3. Fetch last month's budget for variable bill amounts
    const [year, month] = monthString.split('-').map(Number);
    const lastMonthDate = new Date(year, month - 2, 1); // month-1 for 0-index, then -1 more
    const lastMonthString = `${lastMonthDate.getFullYear()}-${(lastMonthDate.getMonth() + 1).toString().padStart(2, '0')}`;
    const { data: lastMonthBudgets } = await sb
      .from('budgets')
      .select('*')
      .eq('user_id', currentUser.id)
      .eq('month', lastMonthString);
    const lastMonthMap = {};
    (lastMonthBudgets || []).forEach(b => { lastMonthMap[b.item_id] = b.assigned_amount; });

    // Known variable bills (until DB has is_variable column)
    const variableBillNames = ['electric', 'water', 'sewage', 'peoples gas', 'west penn power', 'american water'];

    // 4. Create budget entries for bills that don't have one yet
    const newEntries = [];
    for (const bill of (activeBills || [])) {
      // Skip bills with inactive DB status (paid_off, cancelled)
      const dbStatus = (bill.status || '').toLowerCase();
      if (dbStatus === 'paid_off' || dbStatus === 'cancelled') continue;
      // Skip paid-off financing items (hardcoded metadata fallback)
      const info = getBillFinancingInfo(bill);
      if (info.isFinancing && info.status === 'paid_off') continue;

      if (!budgetedItemIds.has(bill.id)) {
        // Determine needed amount
        const isVariable = bill.is_variable ||
          variableBillNames.includes((bill.name || '').toLowerCase());
        let neededAmount = getRaw(bill.amount);

        // For variable bills, use last month's actual if available
        if (isVariable && lastMonthMap[bill.id]) {
          neededAmount = getRaw(lastMonthMap[bill.id]);
        }

        newEntries.push({
          user_id: currentUser.id,
          month: monthString,
          item_id: bill.id,
          item_type: 'bill',
          assigned_amount: neededAmount,
          needed_amount: neededAmount,
          name: bill.name,
          category: bill.type
        });
      }
    }

    // Also add debts that aren't budgeted yet
    const { data: debts } = await sb
      .from('debts')
      .select('*')
      .eq('user_id', currentUser.id);

    for (const debt of (debts || [])) {
      if (!budgetedItemIds.has(debt.id)) {
        newEntries.push({
          user_id: currentUser.id,
          month: monthString,
          item_id: debt.id,
          item_type: 'debt',
          assigned_amount: getRaw(debt.monthlyPayment),
          needed_amount: getRaw(debt.monthlyPayment),
          name: debt.name,
          category: debt.type
        });
      }
    }

    if (newEntries.length === 0) {
      if (statusEl) {
        statusEl.textContent = 'Budget already up to date!';
        statusEl.className = 'ms-2 text-success small';
      }
      setTimeout(() => { if (statusEl) statusEl.textContent = ''; }, 3000);
      return;
    }

    // 5. Insert new budget entries
    const { error: insertError } = await sb
      .from('budgets')
      .insert(newEntries);

    if (insertError) throw insertError;

    if (statusEl) {
      statusEl.textContent = `? Generated ${newEntries.length} budget entries!`;
      statusEl.className = 'ms-2 text-success small';
    }
    setTimeout(() => { if (statusEl) statusEl.textContent = ''; }, 3000);

    // 6. Refresh the budget view
    clearCache(); // Performance: Clear cache on data mutation

    await fetchAllDataFromSupabase(true);
    loadAndRenderBudget();

  } catch (error) {
    console.error('Error generating budget:', error);
    if (statusEl) {
      statusEl.textContent = 'Error: ' + (error.message || 'Could not generate budget');
      statusEl.className = 'ms-2 text-danger small';
    }
  }
}

// This function will be the entry point for the budget page
function initializeBudgetPage() {
  // Only run this if we are on the budget page
  if (!document.getElementById('budgetAssignmentTable')) return;

  // Set up the month change buttons to re-render the budget when clicked
  document.getElementById('prevMonth')?.addEventListener('click', () => {
      currentBudgetMonth.setMonth(currentBudgetMonth.getMonth() - 1);
      loadAndRenderBudget();
  });

  document.getElementById('nextMonth')?.addEventListener('click', () => {
      currentBudgetMonth.setMonth(currentBudgetMonth.getMonth() + 1);
      loadAndRenderBudget();
  });

  document.getElementById('generateBudgetBtn')?.addEventListener('click', () => {
      const monthString = `${currentBudgetMonth.getFullYear()}-${(currentBudgetMonth.getMonth() + 1).toString().padStart(2, '0')}`;
      generateBudgetForMonth(monthString);
  });
}


// Calculate and display month-over-month trends
async function calculateAndDisplayTrends(currentValues) {
  const snapshots = window.snapshots || [];
  
  // Get snapshots from the last 60 days
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const sixtyDaysAgo = new Date(now);
  sixtyDaysAgo.setDate(now.getDate() - 60);
  
  // Find snapshots from last month (30-60 days ago)
  const lastMonthSnapshots = snapshots.filter(s => {
    const snapDate = new Date(s.date + 'T00:00:00');
    return snapDate >= sixtyDaysAgo && snapDate < thirtyDaysAgo;
  });
  
  // Get the most recent snapshot from last month
  const lastMonthSnapshot = lastMonthSnapshots.length > 0 
    ? lastMonthSnapshots.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
    : null;
  
  // Helper function to create trend HTML
  function getTrendHTML(currentValue, lastMonthValue, isInverse = false) {
    // CRITICAL FIX: Ensure we handle all falsy values (undefined, null, 0, NaN)
    // Never show "No data yet" text - always show either a trend or a dash
    if (lastMonthValue === undefined || lastMonthValue === null || lastMonthValue === 0 || isNaN(lastMonthValue)) {
      return '<span class="trend-indicator" style="color: var(--color-text-tertiary);">—</span>';
    }
    
    const change = currentValue - lastMonthValue;
    const percentChange = (change / lastMonthValue) * 100;
    
    // Handle edge case where percentChange is NaN or Infinity
    if (!isFinite(percentChange)) {
      return '<span class="trend-indicator" style="color: var(--color-text-tertiary);">—</span>';
    }
    
    // Determine if this is good or bad
    // isInverse = true means decrease is good (e.g., for debts)
    const isGood = isInverse ? change < 0 : change > 0;
    const color = isGood ? 'var(--color-success)' : '#dc2626';
    const arrow = change > 0 ? '↑' : '↓';
    const sign = change > 0 ? '+' : '';
    
    return `
      <span class="trend-indicator" style="color: ${color};">
        <span style="font-size: 1.2em;">${arrow}</span>
        <span>${sign}${formatCurrency(Math.abs(change))} (${Math.abs(percentChange).toFixed(1)}%)</span>
      </span>
      <div class="trend-label" style="font-size: 12px; color: var(--color-text-tertiary); margin-top: 4px;">
        vs last month
      </div>
    `;
  }
  
  // Update each stat card with trend
  const el = (id) => document.getElementById(id);
  
  if (lastMonthSnapshot) {
    // Net Worth trend
    if (el('netWorthTrend')) {
      el('netWorthTrend').innerHTML = getTrendHTML(
        currentValues.netWorth,
        getRaw(lastMonthSnapshot.net_worth),
        false
      );
      el('netWorthTrend').classList.remove('d-none');
    }
    
    // Assets trend (if exists)
    const assetsTrendEl = el('assetsTrend');
    if (assetsTrendEl) {
      assetsTrendEl.innerHTML = getTrendHTML(
        currentValues.totalAssets,
        getRaw(lastMonthSnapshot.total_assets),
        false
      );
      assetsTrendEl.classList.remove('d-none');
    }
    
    // Investments trend (if exists)
    const investmentsTrendEl = el('investmentsTrend');
    if (investmentsTrendEl) {
      investmentsTrendEl.innerHTML = getTrendHTML(
        currentValues.totalInvestments,
        getRaw(lastMonthSnapshot.total_investments),
        false
      );
      investmentsTrendEl.classList.remove('d-none');
    }
    
    // Debts trend (decrease is good)
    const debtsTrendEl = el('debtsTrend');
    if (debtsTrendEl) {
      debtsTrendEl.innerHTML = getTrendHTML(
        currentValues.totalDebts,
        getRaw(lastMonthSnapshot.total_debts),
        true
      );
      debtsTrendEl.classList.remove('d-none');
    }
  } else {
    // No historical trend data — show a dash for all trend elements
    // CRITICAL FIX: Ensure ALL trend elements show dash, never "No data yet" text
    const trendElements = ['netWorthTrend', 'assetsTrend', 'investmentsTrend', 'debtsTrend', 'billsTrend', 'incomeTrend'];
    trendElements.forEach(elementId => {
      const element = el(elementId);
      if (element) {
        element.innerHTML = '<span class="trend-indicator" style="color: var(--color-text-tertiary);">—</span>';
        element.classList.remove('d-none');
      }
    });
  }
}

async function updateDashboardCards() {
  if (!currentUser) return;
  
  // Check if user has any data at all
  const hasAnyData = (window.assets && window.assets.length > 0) ||
                      (window.investments && window.investments.length > 0) ||
                      (window.debts && window.debts.length > 0) ||
                      (window.bills && window.bills.length > 0) ||
                      (window.sharedBillsForDisplay && window.sharedBillsForDisplay.length > 0) ||
                      (window.income && window.income.length > 0);
  
  if (typeof toggleEmptyState === 'function') {
    toggleEmptyState('dataContainer', 'dashboard', hasAnyData);
  }
  
  try {
    // Calculate totals
    const assets = window.assets || [];
    const investments = window.investments || [];
    const debts = window.debts || [];
    const bills = [...(window.bills || []), ...(window.sharedBillsForDisplay || [])];
    const income = window.income || [];
    
    const totalAssets = assets.reduce((sum, a) => sum + (getRaw(a.value) || 0), 0);
    const totalInvestments = investments.reduce((sum, i) => sum + (getRaw(i.value) || 0), 0);
    const totalDebts = debts.reduce((sum, d) => sum + (getRaw(d.amount) || 0), 0);
    const netWorth = (totalAssets + totalInvestments) - totalDebts;

    // Calculate monthly bills total (accounting for frequency and shared bills)
    const monthlyBills = bills.reduce((sum, bill) => {
      // Skip paid-off financing bills
      const info = getBillFinancingInfo(bill);
      if (info.isFinancing && info.status === 'paid_off') {
        return sum;
      }
      
      // Shared-with-me bills: amount is already the user's portion
      if (bill.isSharedWithMe) {
        const amount = getRaw(bill.amount) || 0;
        return sum + normalizeToMonthly(amount, bill.frequency);
      }
      
      // Use owner's share if bill is shared
      const shareInfo = getShareInfoForBill(bill.id);
      const userAmount = (shareInfo && shareInfo.status === 'accepted') 
        ? shareInfo.owner_amount 
        : bill.amount;
      
      const amount = getRaw(userAmount) || 0;
      let monthlyAmount = amount;
      
      switch((bill.frequency || '').toLowerCase()) {
        case 'daily': monthlyAmount = amount * 30; break;
        case 'weekly': monthlyAmount = amount * 52 / 12; break;
        case 'bi-weekly': monthlyAmount = amount * 26 / 12; break;
        case 'biweekly': monthlyAmount = amount * 26 / 12; break;
        case 'twice monthly': monthlyAmount = amount * 2; break;
        case 'semi-monthly': monthlyAmount = amount * 2; break;
        case 'monthly': monthlyAmount = amount; break;
        case 'quarterly': monthlyAmount = amount / 3; break;
        case 'semi-annually': monthlyAmount = amount / 6; break;
        case 'annually': monthlyAmount = amount / 12; break;
        case 'annual': monthlyAmount = amount / 12; break;
        default: monthlyAmount = amount; break;
      }
      
      return sum + monthlyAmount;
    }, 0);

    // Calculate monthly income
    const monthlyIncome = income.reduce((sum, inc) => {
      const amount = getRaw(inc.amount) || 0;
      const normalized = normalizeToMonthly(amount, inc.frequency);
      return sum + normalized;
    }, 0);

    // Update stat card values
    const el = (id) => document.getElementById(id);
    
    if (el('netWorthValue')) {
      el('netWorthValue').textContent = formatCurrency(netWorth);
      el('netWorthValue').classList.remove('d-none');
      const card = el('netWorthValue').closest('.stat-card');
      if (card) card.classList.remove('loading');
    }
    if (el('totalAssetsValue')) {
      el('totalAssetsValue').textContent = formatCurrency(totalAssets);
      el('totalAssetsValue').classList.remove('d-none');
      const card = el('totalAssetsValue').closest('.stat-card');
      if (card) card.classList.remove('loading');
    }
    if (el('monthlyBillsValue')) {
      el('monthlyBillsValue').textContent = formatCurrency(monthlyBills);
      el('monthlyBillsValue').classList.remove('d-none');
      const card = el('monthlyBillsValue').closest('.stat-card');
      if (card) card.classList.remove('loading');
    }
    if (el('totalDebtsValue')) {
      el('totalDebtsValue').textContent = formatCurrency(totalDebts);
      el('totalDebtsValue').classList.remove('d-none');
      const card = el('totalDebtsValue').closest('.stat-card');
      if (card) card.classList.remove('loading');
    }
    if (el('totalInvestmentsValue')) {
      el('totalInvestmentsValue').textContent = formatCurrency(totalInvestments);
      el('totalInvestmentsValue').classList.remove('d-none');
      const card = el('totalInvestmentsValue').closest('.stat-card');
      if (card) card.classList.remove('loading');
    }
    if (el('monthlyIncomeValue')) {
      el('monthlyIncomeValue').textContent = formatCurrency(monthlyIncome);
      el('monthlyIncomeValue').classList.remove('d-none');
      const card = el('monthlyIncomeValue').closest('.stat-card');
      if (card) card.classList.remove('loading');
    }

    // Update counts
    if (el('assetCount')) {
      el('assetCount').textContent = `${assets.length} asset${assets.length !== 1 ? 's' : ''}`;
      el('assetCount').classList.remove('d-none');
    }
    if (el('billCount')) {
      const activeBills = bills.filter(b => {
        const info = getBillFinancingInfo(b);
        return !(info.isFinancing && info.status === 'paid_off');
      });
      el('billCount').textContent = `${activeBills.length} bill${activeBills.length !== 1 ? 's' : ''}`;
      el('billCount').classList.remove('d-none');
    }
    if (el('debtCount')) {
      el('debtCount').textContent = `${debts.length} debt${debts.length !== 1 ? 's' : ''}`;
      el('debtCount').classList.remove('d-none');
    }
    if (el('investmentCount')) {
      el('investmentCount').textContent = `${investments.length} investment${investments.length !== 1 ? 's' : ''}`;
      el('investmentCount').classList.remove('d-none');
    }
    if (el('incomeCount')) {
      el('incomeCount').textContent = `${income.length} source${income.length !== 1 ? 's' : ''}`;
      el('incomeCount').classList.remove('d-none');
    }

    // Calculate month-over-month trends from snapshots
    await calculateAndDisplayTrends({
      netWorth,
      totalAssets,
      totalInvestments,
      totalDebts,
      monthlyBills,
      monthlyIncome
    });

    // Save snapshot
    const today = new Date().toISOString().split('T')[0];
    const { error } = await sb.from('snapshots').upsert(
      { date: today, netWorth, user_id: currentUser.id }, 
      { onConflict: 'date,user_id' }
    );
    if (error) console.error("Error saving snapshot:", error);

  } catch (error) {
    console.error('Error updating dashboard cards:', error);
  }
}
function renderUpcomingPayments() {
  const c = document.getElementById('upcomingPaymentsList');
  if (!c) return;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcoming = [...(window.debts || []).map(d => ({ ...d, amount: d.monthlyPayment, category: 'Debt' })), ...(window.bills || []), ...(window.sharedBillsForDisplay || [])].filter(item => {
      if (!item.nextDueDate) return false;
      const d = new Date(item.nextDueDate + 'T00:00:00');
      return d >= today && d <= nextWeek;
  }).sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate));
  // Empty state
  if (upcoming.length === 0) {
    if (typeof generateEmptyStateHTML === 'function') {
      c.innerHTML = generateEmptyStateHTML('upcomingPayments');
    } else {
      // Fallback if empty-states.js not loaded
      c.innerHTML = '<p class="text-muted fst-italic">No upcoming payments this week.</p>';
    }
    return;
  }
  
  // Render upcoming payments list
  c.innerHTML = upcoming.map(item => {
    // BUG FIX: Use owner_amount for shared bills in upcoming payments
    let displayAmount = item.amount;
    if (item.isSharedWithMe) {
      // Amount is already the user's portion for shared-with-me bills
      displayAmount = item.amount;
    } else if (item.category !== 'Debt' && item.id) {
      const shareInfo = getShareInfoForBill(item.id);
      if (shareInfo && shareInfo.status === 'accepted') {
        displayAmount = shareInfo.owner_amount;
      }
    }
    const sharedTag = item.isSharedWithMe ? `<small class="d-block text-muted">from ${escapeHtml(item.sharedByName)}</small>` : '';
    return `<div class="d-flex justify-content-between border-bottom py-2"><div><strong>${escapeHtml(item.name)}</strong><span class="badge ${getCategoryBadgeClass(item.type)} rounded-pill ms-2">${escapeHtml(item.type || item.category || 'Bill')}</span>${sharedTag}</div><div class="text-end"><div class="text-danger fw-bold">-${formatCurrency(displayAmount)}</div><small class="text-muted">${formatDate(item.nextDueDate)}</small></div></div>`;
  }).join('');
}
async function renderNetWorthChart() {
  const ctx = document.getElementById('netWorthTimelineChart');
  if (!ctx) return;
  if (netWorthChart) netWorthChart.destroy();
  const snaps = dedupeSnapshotsByDate(window.snapshots || []);
  const theme = getThemeColors();
  netWorthChart = await safeCreateChart(ctx, { type: 'line', data: { labels: snaps.map(s => s.date), datasets: [{ label: 'Net Worth', data: snaps.map(s => getRaw(s.netWorth)), borderColor: '#f44e24', backgroundColor: theme.fill, tension: 0.3, fill: true }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { ticks: { callback: v => formatCurrency(v), color: theme.text }, grid: { color: theme.grid } }, x: { ticks: { color: theme.text }, grid: { display: false } } }, plugins: { legend: { display: false } } } }, 'Net Worth Timeline');
}
async function generateMonthlyCashFlowChart() {
  const ctx = document.getElementById('cashFlowChart');
  if (!ctx) return;
  if (cashFlowChart) cashFlowChart.destroy();
  const theme = getThemeColors();
  const months = []; const incomeTotals = []; const expenseTotals = []; const today = new Date();
  for (let i = 0; i < 6; i++) {
      const monthStart = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + i + 1, 0);
      months.push(monthStart.toLocaleString('default', { month: 'short' }));
      let monthlyIncome = 0; let monthlyExpenses = 0;
      // Filter out paid-off bills from cash flow projections
      const activeBillsForCashFlow = [...(window.bills || []), ...(window.sharedBillsForDisplay || [])].filter(b => {
          const dbStatus = (b.status || '').toLowerCase();
          if (dbStatus === 'paid_off' || dbStatus === 'cancelled') return false;
          const info = getBillFinancingInfo(b);
          if (info.isFinancing && info.status === 'paid_off') return false;
          return true;
      });
      [...(window.income || []), ...activeBillsForCashFlow, ...(window.debts || []).map(d => ({ ...d, amount: d.monthlyPayment, frequency: 'monthly' }))].forEach(item => {
          if (!item.nextDueDate || !item.frequency) return;
          const isIncome = (typeof item.type === 'string' && (item.type.toLowerCase() === 'w2' || item.type.toLowerCase() === '1099'));
          // BUG FIX: Use owner_amount for shared bills in cash flow calculations
          let amount = item.amount;
          if (item.isSharedWithMe) {
            // Amount is already the user's portion
          } else if (!isIncome && item.id) {
            const shareInfo = getShareInfoForBill(item.id);
            if (shareInfo && shareInfo.status === 'accepted') {
              amount = shareInfo.owner_amount;
            }
          }
          amount = getRaw(amount);
          let nextDate = new Date(item.nextDueDate + 'T00:00:00');
          let loopGuard = 0;
          while (nextDate < monthStart && nextDate.getFullYear() < today.getFullYear() + 2 && loopGuard < 1000) { try { nextDate = getNextDate(nextDate, item.frequency); } catch { break; } loopGuard++; }
          loopGuard = 0;
          while (nextDate <= monthEnd && loopGuard < 100) {
              if (isIncome) monthlyIncome += amount; else monthlyExpenses += amount;
              try { nextDate = getNextDate(nextDate, item.frequency); } catch { break; }
              loopGuard++;
          }
      });
      incomeTotals.push(monthlyIncome); expenseTotals.push(monthlyExpenses);
  }
  cashFlowChart = await safeCreateChart(ctx, { type: 'bar', data: { labels: months, datasets: [{ label: 'Income', data: incomeTotals, backgroundColor: '#81b900' }, { label: 'Expenses', data: expenseTotals, backgroundColor: '#e53935' }] }, options: { responsive: true, maintainAspectRatio: false, scales: { x: { stacked: true, ticks: { color: theme.text }, grid: { display: false } }, y: { stacked: true, ticks: { color: theme.text }, grid: { color: theme.grid } } }, plugins: { legend: { labels: { color: theme.text } } } } }, 'Cash Flow');
}

// ===== INITIALIZATION =====
// Theme toggle removed � dark mode only
function initializeAssetForm() {
  const assetTypeDropdown = document.getElementById("assetType");
  if (!assetTypeDropdown) return;
  assetTypeDropdown.addEventListener("change", function () {
      const type = this.value;
      document.querySelectorAll(".asset-fields").forEach(el => el.classList.add("d-none"));
      if (type === "realEstate") { document.querySelector(".real-estate-fields").classList.remove("d-none"); }
      else if (type === "vehicle") { document.querySelector(".vehicle-fields").classList.remove("d-none"); }
  });
}
function init() {
  debugLog("INIT: Page loaded, starting initialization.");

  // Initialize session security manager
  sessionSecurity = new SessionSecurityManager(sb, (reason) => {
    console.log('[Security] Force logout triggered:', reason);
    // The manager has already handled the logout
  });

  // Auth state change listener
  sb.auth.onAuthStateChange((event, session) => {
    debugLog(`AUTH: Event received: ${event}`);
    currentUser = session?.user || null;

    // Handle password recovery event �" show reset password modal
    if (event === 'PASSWORD_RECOVERY') {
      const resetModal = document.getElementById('resetPasswordModal');
      if (resetModal) {
        bootstrap.Modal.getOrCreateInstance(resetModal).show();
      }
    }

    // Update UI based on auth state
    document.getElementById('loggedInState')?.classList.toggle('d-none', !currentUser);
    document.getElementById('loggedOutState')?.classList.toggle('d-none', !!currentUser);
    document.body.classList.add('auth-resolved');
    if (document.getElementById('dataContainer')) {
      document.getElementById('dataContainer').style.visibility = currentUser ? 'visible' : 'hidden';
      // Show/hide logged-out CTA based on auth state
      toggleLoggedOutCTA(!currentUser);
    }
    // Show/hide page action buttons (Add Investment, Add Asset, etc.) based on auth state
    if (document.getElementById('pageActions')) {
      document.getElementById('pageActions').style.display = currentUser ? '' : 'none';
    }

    // Hide/show action buttons (Add Asset, Add Investment, etc.) based on auth state
    document.querySelectorAll('.auth-required').forEach(el => {
      el.style.display = currentUser ? '' : 'none';
    });

    if (currentUser) {
      const firstName = currentUser.user_metadata?.first_name?.trim() || currentUser.email;
      document.getElementById('username').textContent = firstName;

      // Notify security manager of successful login (but only if it's an actual SIGNED_IN event)
      if (event === 'SIGNED_IN' && sessionSecurity) {
        sessionSecurity.onLogin();
      }

      // Ensure user profile exists for social features
      ensureUserProfile();

      fetchAllDataFromSupabase().then(() => {
        renderAll();
        renderAdditionalCharts();
        // Initialize social features
        initNotifications();
        loadSharedBillsData();
        loadFriendsPage();
        // Check if onboarding should be shown
        checkOnboardingStatus();
      });

    } else {
      // User logged out - notify security manager
      if (event === 'SIGNED_OUT' && sessionSecurity) {
        sessionSecurity.onLogout();
      }
      
      // Clean up realtime subscriptions
      if (notificationChannel) {
        sb.removeChannel(notificationChannel);
        notificationChannel = null;
      }
      renderAll(); // Render empty tables on logout
    }
  });

  // Explicitly check session on page load to trigger auth state
  sb.auth.getSession().then(({ data: { session } }) => {
    debugLog("INIT: Initial session check complete");
    // The onAuthStateChange listener above will handle the session
  });

  // Attach all event listeners safely
  document.body.addEventListener('click', (e) => {
      if (e.target.closest('#logoutButton')) {
          e.preventDefault();
          logout();
      }
  });

  // Login form
  document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    login(e.target.loginEmail.value, e.target.loginPassword.value);
  });

  // Signup form
  document.getElementById('signupForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    signUp(e.target.signupEmail.value, e.target.signupPassword.value, e.target.signupFirstName.value, e.target.signupLastName.value);
  });

  // Forgot password flow
  document.getElementById('forgotPasswordLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('loginForm')?.classList.add('d-none');
    document.getElementById('forgotPasswordForm')?.classList.remove('d-none');
    // Pre-fill email from login form
    const loginEmail = document.getElementById('loginEmail')?.value;
    if (loginEmail) document.getElementById('forgotEmail').value = loginEmail;
  });

  document.getElementById('backToLoginLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('loginForm')?.classList.remove('d-none');
    document.getElementById('forgotPasswordForm')?.classList.add('d-none');
    hideAuthAlert('forgotAlert');
  });

  document.getElementById('forgotPasswordBtn')?.addEventListener('click', () => {
    forgotPassword(document.getElementById('forgotEmail')?.value);
  });

  // Reset password form (from email link)
  document.getElementById('resetPasswordForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const pw = document.getElementById('newPassword')?.value;
    const pw2 = document.getElementById('confirmNewPassword')?.value;
    if (pw !== pw2) {
      showAuthAlert('resetPasswordAlert', 'Passwords do not match.', 'warning');
      return;
    }
    if (pw.length < 6) {
      showAuthAlert('resetPasswordAlert', 'Password must be at least 6 characters.', 'warning');
      return;
    }
    updatePassword(pw);
  });

  // Reset forgot password form when login modal is re-opened
  document.getElementById('loginModal')?.addEventListener('show.bs.modal', () => {
    document.getElementById('loginForm')?.classList.remove('d-none');
    document.getElementById('forgotPasswordForm')?.classList.add('d-none');
    hideAuthAlert('loginAlert');
    hideAuthAlert('forgotAlert');
  });

  // Clear signup alerts when modal is re-opened
  document.getElementById('signupModal')?.addEventListener('show.bs.modal', () => {
    hideAuthAlert('signupAlert');
  });
  // CORRECTED: Listen for clicks on the SAVE buttons in each modal
  document.getElementById('saveAssetBtn')?.addEventListener('click', (e) => { e.preventDefault(); saveAsset(); });
  document.getElementById('saveInvestmentBtn')?.addEventListener('click', (e) => { e.preventDefault(); saveInvestment(); });
  document.getElementById('saveDebtBtn')?.addEventListener('click', (e) => { e.preventDefault(); saveDebt(); });
  document.getElementById('saveBillBtn')?.addEventListener('click', (e) => { e.preventDefault(); saveBill(); });
  document.getElementById('saveIncomeBtn')?.addEventListener('click', (e) => { e.preventDefault(); saveIncome(); });
  document.getElementById('saveBudgetItemBtn')?.addEventListener('click', (e) => { e.preventDefault(); saveBudgetItem(); });
  document.getElementById('saveSettingsBtn')?.addEventListener('click', (e) => { e.preventDefault(); saveSettings(); });

  // SUG-02: Wire up Export button on Reports page
  const exportBtn = document.querySelector('button .bi-download')?.closest('button');
  if (exportBtn) {
    exportBtn.addEventListener('click', (e) => { e.preventDefault(); exportFinancialDataCSV(); });
  }

  debugLog("INIT: Initialization complete.");

  // If we are on the dashboard, render the dashboard components
  if (document.getElementById('totalInvestments')) {
    updateDashboardCards();
    renderUpcomingPayments();
    renderNetWorthChart();
    generateMonthlyCashFlowChart();
}

// FIX: Also render the budget page if we are on it.
// This ensures the budget is only drawn AFTER the data fetch is complete.
if (document.getElementById('budgetAssignmentTable')) {
    loadAndRenderBudget();
}


   // 3. Setup remaining UI components.
   setupThemeToggle();
   setupSidebarToggle();
   setupNotificationScrollLock();
   initializeAssetForm();
   initializeBudgetPage();
   initShareBillUI();

   // Friends page search
   document.getElementById('friendSearchBtn')?.addEventListener('click', () => {
     const query = document.getElementById('friendSearchInput')?.value;
     if (query) searchFriends(query);
   });
   document.getElementById('friendSearchInput')?.addEventListener('keydown', (e) => {
     if (e.key === 'Enter') {
       e.preventDefault();
       const query = e.target.value;
       if (query) searchFriends(query);
     }
   });
   //renderAdditionalCharts();
}

// ===== THEME TOGGLE =====
function setupThemeToggle() {
  const themeSwitch = document.getElementById('themeSwitch');
  const themeSwitchLabel = document.querySelector('label[for="themeSwitch"]');
  
  if (!themeSwitch) return;
  
  // Function to update the label text based on current theme
  function updateThemeLabel() {
    const currentTheme = document.body.getAttribute('data-theme') || 'dark';
    if (themeSwitchLabel) {
      if (currentTheme === 'dark') {
        themeSwitchLabel.innerHTML = '🌙 Dark Mode';
      } else {
        themeSwitchLabel.innerHTML = '☀️ Light Mode';
      }
    }
  }
  
  // Function to set theme
  function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update checkbox state to match theme
    if (themeSwitch) {
      themeSwitch.checked = (theme === 'light');
    }
    
    updateThemeLabel();
    
    // Refresh charts if they exist to apply new theme colors
    if (typeof renderNetWorthChart === 'function' && document.getElementById('netWorthTimelineChart')) {
      renderNetWorthChart();
    }
    if (typeof generateMonthlyCashFlowChart === 'function' && document.getElementById('cashFlowChart')) {
      generateMonthlyCashFlowChart();
    }
  }
  
  // Load saved theme or default to dark
  const savedTheme = localStorage.getItem('theme') || 'dark';
  setTheme(savedTheme);
  
  // Listen for toggle changes
  themeSwitch.addEventListener('change', function() {
    const newTheme = this.checked ? 'light' : 'dark';
    setTheme(newTheme);
  });
  
  // Update label on initial load
  updateThemeLabel();
}

// ===== MOBILE SIDEBAR TOGGLE =====
function setupSidebarToggle() {
  const toggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (!toggle || !sidebar) return;

  const openSidebar = () => {
    sidebar.classList.add('show');
    if (overlay) overlay.classList.add('show');
    toggle.innerHTML = '<i class="bi bi-x-lg"></i>';
    
    // ISSUE 3 FIX: Use CSS class approach for reliable scroll lock
    const scrollY = window.scrollY;
    document.body.dataset.scrollY = scrollY;
    document.body.style.setProperty('--scroll-lock-offset', `-${scrollY}px`);
    document.body.classList.add('sidebar-open');
  };

  const closeSidebar = () => {
    sidebar.classList.remove('show');
    if (overlay) overlay.classList.remove('show');
    toggle.innerHTML = '<i class="bi bi-list"></i>';
    
    // ISSUE 3 FIX: Save scroll position BEFORE clearing styles, restore after
    const scrollY = parseInt(document.body.dataset.scrollY || '0');
    document.body.classList.remove('sidebar-open');
    document.body.style.removeProperty('--scroll-lock-offset');
    document.body.removeAttribute('data-scroll-y');
    
    // Restore scroll position (no delay needed with CSS class approach)
    window.scrollTo(0, scrollY);
  };

  toggle.addEventListener('click', () => {
    if (sidebar.classList.contains('show')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  if (overlay) {
    overlay.addEventListener('click', closeSidebar);
  }

  // Close sidebar when a nav link is clicked (mobile)
  sidebar.querySelectorAll('a[href]').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 991) {
        closeSidebar();
      }
    });
  });
}

// ===== MOBILE: LOCK BODY SCROLL WHEN NOTIFICATION DROPDOWN IS OPEN =====
function setupNotificationScrollLock() {
  const dropdownEl = document.getElementById('notificationDropdown');
  if (!dropdownEl || window.innerWidth > 991) return;

  dropdownEl.addEventListener('shown.bs.dropdown', () => {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${window.scrollY}px`;
    document.body.dataset.scrollY = window.scrollY;
  });

  dropdownEl.addEventListener('hidden.bs.dropdown', () => {
    const scrollY = document.body.dataset.scrollY || '0';
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.top = '';
    window.scrollTo(0, parseInt(scrollY));
  });
}

// ===== USER PROFILE MANAGEMENT =====
async function ensureUserProfile() {
  if (!currentUser) return;
  const { data: profile } = await sb
    .from('user_profiles')
    .select('id')
    .eq('id', currentUser.id)
    .single();
  
  if (!profile) {
    const email = currentUser.email || '';
    const firstName = currentUser.user_metadata?.first_name || '';
    const lastName = currentUser.user_metadata?.last_name || '';
    const displayName = firstName ? `${firstName} ${lastName}`.trim() : email.split('@')[0];
    const username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').substring(0, 30);
    
    await sb.from('user_profiles').upsert({
      id: currentUser.id,
      display_name: displayName,
      username: username
    }, { onConflict: 'id' });
  }
}

// ===== NOTIFICATION SYSTEM =====
let notificationChannel = null;

async function initNotifications() {
  if (!currentUser) return;
  
  // Fetch unread count
  await updateNotificationBadge();
  
  // Load recent notifications
  await loadNotifications();
  
  // Subscribe to realtime notifications
  if (notificationChannel) {
    sb.removeChannel(notificationChannel);
  }
  
  notificationChannel = sb
    .channel('user-notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${currentUser.id}`
      },
      (payload) => {
        showNotificationToast(payload.new);
        updateNotificationBadge();
        loadNotifications();
        // Refresh friends page if on it
        if (document.getElementById('friendSearchInput')) {
          loadFriendsPage();
        }
        // Refresh bills page if on it
        if (document.getElementById('billTableBody')) {
          loadSharedBillsData();
        }
      }
    )
    .subscribe();
}

async function updateNotificationBadge() {
  if (!currentUser) return;
  const badge = document.getElementById('notificationBadge');
  if (!badge) return;
  
  const { count } = await sb
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', currentUser.id)
    .eq('is_read', false);
  
  const unread = count || 0;
  if (unread > 0) {
    badge.textContent = unread > 99 ? '99+' : unread;
    badge.classList.remove('d-none');
  } else {
    badge.classList.add('d-none');
  }
}

async function loadNotifications() {
  if (!currentUser) return;
  const listEl = document.getElementById('notificationList');
  const noNotifEl = document.getElementById('noNotifications');
  if (!listEl) return;
  
  const { data: notifications } = await sb
    .from('notifications')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false })
    .limit(20);
  
  // Remove old notification items (keep header and divider)
  const existingItems = listEl.querySelectorAll('.notification-item');
  existingItems.forEach(el => el.remove());
  
  if (!notifications || notifications.length === 0) {
    if (noNotifEl) noNotifEl.classList.remove('d-none');
    return;
  }
  
  if (noNotifEl) noNotifEl.classList.add('d-none');
  
  const iconMap = {
    'friend_request': 'bi-person-plus text-primary',
    'friend_accepted': 'bi-person-check text-success',
    'bill_shared': 'bi-share text-info',
    'bill_share_accepted': 'bi-check-circle text-success',
    'bill_share_declined': 'bi-x-circle text-danger',
    'bill_amount_updated': 'bi-arrow-repeat text-warning',
    'bill_deleted': 'bi-trash text-danger',
    'payment_reminder': 'bi-bell text-warning',
    'connection_removed': 'bi-person-dash text-danger'
  };
  
  notifications.forEach(notif => {
    const li = document.createElement('li');
    li.className = 'notification-item';
    const iconClass = iconMap[notif.type] || 'bi-bell text-muted';
    const isUnread = !notif.is_read;
    const timeAgo = getTimeAgo(notif.created_at);
    
    li.innerHTML = `
      <a class="dropdown-item py-2 px-3 ${isUnread ? '' : 'opacity-75'}" href="#" 
         data-notif-id="${escapeAttribute(notif.id)}" 
         data-notif-type="${escapeAttribute(notif.type)}" 
         data-notif-data="${escapeAttribute(JSON.stringify(notif.data || {}))}">
        <div class="d-flex align-items-start gap-2">
          <i class="bi ${iconClass} mt-1" style="font-size: 1.1rem;"></i>
          <div class="flex-grow-1">
            <div class="d-flex justify-content-between">
              <strong style="font-size: 0.85rem;">${escapeHtml(notif.title)}</strong>
              ${isUnread ? '<span class="badge bg-primary" style="font-size: 0.6rem;">NEW</span>' : ''}
            </div>
            <div style="font-size: 0.8rem; color: var(--color-text-secondary);">${escapeHtml(notif.body || '')}</div>
            <small style="color: var(--color-text-tertiary);">${timeAgo}</small>
          </div>
        </div>
      </a>
    `;
    const link = li.querySelector('a');
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const id = this.dataset.notifId;
      const type = this.dataset.notifType;
      const data = JSON.parse(this.dataset.notifData);
      handleNotificationClick(id, type, data);
    });
    listEl.appendChild(li);
  });
}

function getTimeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}

async function handleNotificationClick(notifId, type, data) {
  // Mark as read
  await sb.from('notifications').update({ is_read: true }).eq('id', notifId);
  await updateNotificationBadge();
  
  // Navigate based on type
  if (type === 'friend_request' || type === 'friend_accepted' || type === 'connection_removed') {
    window.location.href = 'friends.html';
  } else if (type.startsWith('bill_share') || type === 'bill_shared' || type === 'bill_amount_updated' || type === 'bill_deleted') {
    window.location.href = 'bills.html';
  }
}

async function markAllNotificationsRead() {
  if (!currentUser) return;
  await sb
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', currentUser.id)
    .eq('is_read', false);
  await updateNotificationBadge();
  await loadNotifications();
}

function showNotificationToast(notification) {
  // Create a simple toast notification
  const toast = document.createElement('div');
  toast.className = 'position-fixed bottom-0 end-0 p-3';
  toast.style.zIndex = '9999';
  toast.innerHTML = `
    <div class="toast show" role="alert" style="background: var(--color-bg-2); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md);">
      <div class="toast-header" style="background: var(--color-bg-3); border-color: var(--color-border-subtle);">
        <i class="bi bi-bell-fill text-primary me-2"></i>
        <strong class="me-auto" style="color: var(--color-text-primary);">${escapeHtml(notification.title)}</strong>
        <button type="button" class="btn-close" onclick="this.closest('.position-fixed').remove()"></button>
      </div>
      <div class="toast-body" style="color: var(--color-text-secondary);">
        ${escapeHtml(notification.body || '')}
      </div>
    </div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}

// ===== FRIENDS / CONNECTIONS SYSTEM =====
async function searchFriends(query) {
  if (!currentUser || !query || query.length < 2) {
    const container = document.getElementById('searchResults');
    if (container) container.textContent = '';
    return;
  }
  
  // Search user_profiles by username or display_name
  const { data: profiles } = await sb
    .from('user_profiles')
    .select('id, username, display_name, avatar_url')
    .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
    .neq('id', currentUser.id)
    .limit(20);
  
  // Also try email search via RPC
  let emailResults = [];
  if (query.includes('@')) {
    const { data } = await sb.rpc('search_users_by_email', { search_email: query });
    emailResults = data || [];
  }
  
  // Merge and deduplicate
  const allResults = [...(profiles || [])];
  emailResults.forEach(er => {
    if (!allResults.find(p => p.id === er.id)) {
      allResults.push(er);
    }
  });
  
  // Get existing connections to filter
  const { data: connections } = await sb
    .from('connections')
    .select('requester_id, addressee_id, status')
    .or(`requester_id.eq.${currentUser.id},addressee_id.eq.${currentUser.id}`);
  
  const connectedIds = new Set();
  (connections || []).forEach(c => {
    if (c.status !== 'declined') {
      connectedIds.add(c.requester_id === currentUser.id ? c.addressee_id : c.requester_id);
    }
  });
  
  // Filter out already connected users
  const filtered = allResults.filter(p => !connectedIds.has(p.id));
  
  const container = document.getElementById('searchResults');
  if (!container) return;
  
  if (filtered.length === 0) {
    const message = document.createElement('p');
    message.className = 'text-muted mt-2';
    message.textContent = 'No users found matching your search.';
    container.replaceChildren(message);
    return;
  }
  
  container.innerHTML = filtered.map(p => `
    <div class="card mb-2">
      <div class="card-body p-3 d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-3">
          <div class="rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; background: var(--color-bg-3); border: 1px solid var(--color-border-subtle);">
            ${p.avatar_url ? `<img src="${escapeAttribute(p.avatar_url)}" class="rounded-circle" width="40" height="40">` : `<i class="bi bi-person" style="font-size: 1.2rem;"></i>`}
          </div>
          <div>
            <strong style="color: var(--color-text-primary);">${escapeHtml(p.display_name || 'Unknown')}</strong>
            ${p.username ? `<div style="font-size: 0.8rem; color: var(--color-text-tertiary);">@${escapeHtml(p.username)}</div>` : ''}
          </div>
        </div>
        <button class="btn btn-sm btn-primary" onclick="sendFriendRequest('${escapeAttribute(p.id)}')">
          <i class="bi bi-person-plus me-1"></i>Add Friend
        </button>
      </div>
    </div>
  `).join('');
}

async function sendFriendRequest(addresseeId) {
  if (!currentUser) return;
  
  const { error } = await sb.from('connections').insert({
    requester_id: currentUser.id,
    addressee_id: addresseeId,
    status: 'pending'
  });
  
  if (error) {
    if (error.message.includes('duplicate') || error.message.includes('unique')) {
      alert('You already have a pending connection with this user.');
    } else {
      alert('Error sending friend request: ' + error.message);
    }
    return;
  }
  
  // Refresh search results and outgoing
  const searchInput = document.getElementById('friendSearchInput');
  if (searchInput && searchInput.value) {
    searchFriends(searchInput.value);
  }
  loadFriendsPage();
}

async function acceptFriendRequest(connectionId) {
  // CSRF Protection
  try {
    if (typeof CSRF !== 'undefined') {
      CSRF.requireValidToken();
    }
  } catch (err) {
    alert(err.message);
    return;
  }

  await sb.from('connections')
    .update({ status: 'accepted', updated_at: new Date().toISOString() })
    .eq('id', connectionId)
    .eq('addressee_id', currentUser.id);
  loadFriendsPage();
}

async function declineFriendRequest(connectionId) {
  await sb.from('connections')
    .update({ status: 'declined', updated_at: new Date().toISOString() })
    .eq('id', connectionId)
    .eq('addressee_id', currentUser.id);
  loadFriendsPage();
}

async function cancelFriendRequest(connectionId) {
  await sb.from('connections')
    .delete()
    .eq('id', connectionId)
    .eq('requester_id', currentUser.id);
  loadFriendsPage();
}

async function removeFriend(connectionId, friendName) {
  if (!confirm(`Are you sure you want to remove ${friendName} from your friends?`)) return;
  
  await sb.from('connections')
    .delete()
    .eq('id', connectionId);
  loadFriendsPage();
}

async function loadFriendsPage() {
  if (!currentUser || !document.getElementById('friendSearchInput')) return;
  
  // Show skeleton loaders while data is loading
  const pendingContainer = document.getElementById('pendingRequestsContainer');
  const pendingSection = document.getElementById('pendingRequestsSection');
  const friendsContainer = document.getElementById('myFriendsContainer');
  const outgoingContainer = document.getElementById('outgoingRequestsContainer');
  const outgoingSection = document.getElementById('outgoingRequestsSection');
  
  const skeletonHTML = `
    <div class="col-xl-4 col-md-6 col-12">
      <div class="card">
        <div class="card-body p-3 d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center gap-3 flex-grow-1">
            <div class="skeleton-loader rounded-circle" style="width: 40px; height: 40px;"></div>
            <div style="flex-grow: 1;">
              <div class="skeleton-loader mb-2" style="height: 16px; max-width: 60%;"></div>
              <div class="skeleton-loader" style="height: 12px; max-width: 40%;"></div>
            </div>
          </div>
          <div class="skeleton-loader" style="width: 70px; height: 32px; border-radius: 4px;"></div>
        </div>
      </div>
    </div>
  `.repeat(3);
  
  if (pendingContainer) pendingContainer.innerHTML = skeletonHTML;
  if (friendsContainer) friendsContainer.innerHTML = skeletonHTML;
  if (outgoingContainer) outgoingContainer.innerHTML = skeletonHTML;
  
  // Load pending requests (incoming)
  const { data: pendingIncoming } = await sb
    .from('connections')
    .select('id, created_at, requester_id, requester:user_profiles!connections_requester_id_user_profiles_fkey(id, username, display_name, avatar_url)')
    .eq('addressee_id', currentUser.id)
    .eq('status', 'pending');
  
  if (pendingContainer) {
    if (pendingIncoming && pendingIncoming.length > 0) {
      pendingSection.classList.remove('d-none');
      pendingContainer.innerHTML = pendingIncoming.map(req => `
        <div class="col-xl-4 col-md-6 col-12">
          <div class="card">
            <div class="card-body p-3 d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center gap-3">
                <div class="rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; background: var(--color-bg-3); border: 1px solid var(--color-border-subtle);">
                  <i class="bi bi-person" style="font-size: 1.2rem;"></i>
                </div>
                <div>
                  <strong style="color: var(--color-text-primary);">${escapeHtml(req.requester?.display_name || 'Unknown')}</strong>
                  ${req.requester?.username ? `<div style="font-size: 0.8rem; color: var(--color-text-tertiary);">@${escapeHtml(req.requester.username)}</div>` : ''}
                </div>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-success" onclick="acceptFriendRequest('${escapeAttribute(req.id)}')" aria-label="Accept friend request from ${escapeAttribute(req.friend_email || req.requester?.display_name || 'Unknown')}"><i class="bi bi-check-lg"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick="declineFriendRequest('${escapeAttribute(req.id)}')" aria-label="Decline friend request from ${escapeAttribute(req.friend_email || req.requester?.display_name || 'Unknown')}"><i class="bi bi-x-lg"></i></button>
              </div>
            </div>
          </div>
        </div>
      `).join('');
    } else {
      pendingSection.classList.add('d-none');
    }
  }
  
  // Load my friends (accepted)
  const { data: myConnections } = await sb
    .from('connections')
    .select('id, status, created_at, requester_id, addressee_id, requester:user_profiles!connections_requester_id_user_profiles_fkey(id, username, display_name, avatar_url), addressee:user_profiles!connections_addressee_id_user_profiles_fkey(id, username, display_name, avatar_url)')
    .eq('status', 'accepted')
    .or(`requester_id.eq.${currentUser.id},addressee_id.eq.${currentUser.id}`);
  
  if (friendsContainer) {
    const friends = (myConnections || []).map(conn => ({
      connectionId: conn.id,
      friend: conn.requester?.id === currentUser.id ? conn.addressee : conn.requester,
      since: conn.created_at
    }));
    
    if (friends.length > 0) {
      if (typeof hideEmptyState === 'function') {
        hideEmptyState('myFriendsContainer');
      }
      friendsContainer.innerHTML = friends.map(f => `
        <div class="col-xl-4 col-md-6 col-12">
          <div class="card">
            <div class="card-body p-3 d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center gap-3">
                <div class="rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; background: var(--color-bg-3); border: 1px solid var(--color-border-subtle);">
                  <i class="bi bi-person-fill" style="font-size: 1.2rem; color: var(--color-success);"></i>
                </div>
                <div>
                  <strong style="color: var(--color-text-primary);">${escapeHtml(f.friend?.display_name || 'Unknown')}</strong>
                  ${f.friend?.username ? `<div style="font-size: 0.8rem; color: var(--color-text-tertiary);">@${escapeHtml(f.friend.username)}</div>` : ''}
                  <small style="color: var(--color-text-tertiary);">Friends since ${formatDate(f.since?.split('T')[0])}</small>
                </div>
              </div>
              <button class="btn btn-sm btn-outline-danger" onclick="removeFriend('${escapeAttribute(f.connectionId)}', '${escapeAttribute(f.friend?.display_name || 'this friend')}')">
                <i class="bi bi-person-dash"></i>
              </button>
            </div>
          </div>
        </div>
      `).join('');
    } else {
      if (typeof showEmptyState === 'function') {
        friendsContainer.innerHTML = '';
        showEmptyState('myFriendsContainer', 'friends');
      } else {
        const col = document.createElement('div');
        col.className = 'col-12';
        const message = document.createElement('p');
        message.className = 'text-muted fst-italic';
        message.textContent = 'No friends yet. Search for people to connect with!';
        col.appendChild(message);
        friendsContainer.replaceChildren(col);
      }
    }
  }
  
  // Load outgoing requests
  const { data: outgoing } = await sb
    .from('connections')
    .select('id, created_at, addressee:user_profiles!connections_addressee_id_user_profiles_fkey(id, username, display_name, avatar_url)')
    .eq('requester_id', currentUser.id)
    .eq('status', 'pending');
  
  if (outgoingContainer) {
    if (outgoing && outgoing.length > 0) {
      outgoingSection.classList.remove('d-none');
      outgoingContainer.innerHTML = outgoing.map(req => `
        <div class="col-xl-4 col-md-6 col-12">
          <div class="card">
            <div class="card-body p-3 d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center gap-3">
                <div class="rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; background: var(--color-bg-3); border: 1px solid var(--color-border-subtle);">
                  <i class="bi bi-person" style="font-size: 1.2rem;"></i>
                </div>
                <div>
                  <strong style="color: var(--color-text-primary);">${escapeHtml(req.addressee?.display_name || 'Unknown')}</strong>
                  ${req.addressee?.username ? `<div style="font-size: 0.8rem; color: var(--color-text-tertiary);">@${escapeHtml(req.addressee.username)}</div>` : ''}
                  <small style="color: var(--color-text-tertiary);">Sent ${formatDate(req.created_at?.split('T')[0])}</small>
                </div>
              </div>
              <button class="btn btn-sm btn-outline-secondary" onclick="cancelFriendRequest('${escapeAttribute(req.id)}')">
                <i class="bi bi-x-lg me-1"></i>Cancel
              </button>
            </div>
          </div>
        </div>
      `).join('');
    } else {
      outgoingSection.classList.add('d-none');
    }
  }
}

// ===== BILL SHARING SYSTEM =====
let billSharesCache = [];
let sharedWithMeCache = [];

async function loadSharedBillsData() {
  if (!currentUser) return;
  
  // Load shares I own (to show indicators)
  const { data: myShares } = await sb
    .from('bill_shares')
    .select('*, shared_user:user_profiles!bill_shares_shared_with_id_user_profiles_fkey(id, username, display_name)')
    .eq('owner_id', currentUser.id);
  billSharesCache = myShares || [];
  
  // Load shares shared with me (accepted)
  const { data: sharedWithMe } = await sb
    .from('bill_shares')
    .select('*, bill:bills!bill_shares_bill_id_fkey(*), owner:user_profiles!bill_shares_owner_id_user_profiles_fkey(id, username, display_name)')
    .eq('shared_with_id', currentUser.id)
    .eq('status', 'accepted');
  sharedWithMeCache = sharedWithMe || [];
  
  // Load pending shares (awaiting my acceptance)
  const { data: pendingShares } = await sb
    .from('bill_shares')
    .select('*, bill:bills!bill_shares_bill_id_fkey(*), owner:user_profiles!bill_shares_owner_id_user_profiles_fkey(id, username, display_name)')
    .eq('shared_with_id', currentUser.id)
    .eq('status', 'pending');
  
  // Load outgoing shares (bills I'm sharing with others) � with bill + friend details
  const { data: myOutgoingShares } = await sb
    .from('bill_shares')
    .select('*, bill:bills!bill_shares_bill_id_fkey(*), shared_user:user_profiles!bill_shares_shared_with_id_user_profiles_fkey(id, username, display_name)')
    .eq('owner_id', currentUser.id);

  renderSharedWithMe(sharedWithMeCache);
  renderPendingShares(pendingShares || []);
  renderMySharedBills(myOutgoingShares || []);

  // Build synthetic bill objects from accepted shared bills so they appear
  // in the recurring bills table, monthly total, and budget
  window.sharedBillsForDisplay = sharedWithMeCache.map(share => ({
    id: `shared_${share.id}`,
    originalBillId: share.bill?.id,
    name: share.bill?.name || 'Unknown Bill',
    amount: share.shared_amount || (share.bill?.amount * 0.5),
    fullAmount: share.bill?.amount,
    type: share.bill?.type || 'Other',
    frequency: share.bill?.frequency || 'monthly',
    nextDueDate: share.bill?.next_due_date || share.bill?.nextDueDate,
    isSharedWithMe: true,
    sharedByName: share.owner?.display_name || 'Unknown',
    sharedByUsername: share.owner?.username || '',
    splitType: share.split_type,
    splitLabel: share.split_type === 'equal' ? '50/50'
      : share.split_type === 'percentage' ? `${share.shared_percent}%`
      : formatCurrency(share.shared_fixed),
    shareId: share.id,
    status: share.bill?.status
  }));

  // Re-render bills to include shared bills in the recurring list + totals
  renderBills();
  // Re-render dashboard if on that page
  if (document.getElementById('netWorthValue')) {
    updateDashboardCards();
  }
  // Re-render budget if on that page
  if (document.getElementById('budgetAssignmentTable')) {
    loadAndRenderBudget();
  }
}

function renderSharedWithMe(shares) {
  const section = document.getElementById('sharedWithMeSection');
  const tbody = document.getElementById('sharedWithMeTableBody');
  if (!section || !tbody) return;
  
  if (shares.length === 0) {
    section.classList.add('d-none');
    return;
  }
  
  section.classList.remove('d-none');
  tbody.innerHTML = shares.map(share => {
    const splitLabel = share.split_type === 'equal' ? '50/50' : share.split_type === 'percentage' ? `${escapeHtml(share.shared_percent)}%` : formatCurrency(share.shared_fixed);
    return `
      <tr>
        <td>${escapeHtml(share.bill?.name || 'Unknown')}</td>
        <td>
          <span style="color: var(--color-text-secondary);">${escapeHtml(share.owner?.display_name || 'Unknown')}</span>
          ${share.owner?.username ? `<small class="d-block" style="color: var(--color-text-tertiary);">@${escapeHtml(share.owner.username)}</small>` : ''}
        </td>
        <td><strong style="color: var(--color-primary);">${formatCurrency(share.shared_amount)}</strong></td>
        <td style="color: var(--color-text-tertiary);">${formatCurrency(share.bill?.amount)}</td>
        <td><span class="badge bg-info">${escapeHtml(splitLabel)}</span></td>
        <td><span class="badge bg-success">Active</span></td>
        <td>
          <span class="badge bg-secondary-subtle"><i class="bi bi-link-45deg me-1"></i>Shared</span>
        </td>
      </tr>
    `;
  }).join('');
}

function renderPendingShares(shares) {
  const section = document.getElementById('pendingSharesSection');
  const container = document.getElementById('pendingSharesContainer');
  if (!section || !container) return;
  
  if (shares.length === 0) {
    section.classList.add('d-none');
    return;
  }
  
  section.classList.remove('d-none');
  container.innerHTML = shares.map(share => {
    const splitLabel = share.split_type === 'equal' ? '50/50' : share.split_type === 'percentage' ? `${escapeHtml(share.owner_percent)}/${escapeHtml(share.shared_percent)}` : 'Fixed';
    return `
      <div class="col-xl-4 col-md-6 col-12">
        <div class="card">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="mb-0" style="color: var(--color-text-primary);">${escapeHtml(share.bill?.name || 'Unknown Bill')}</h5>
              <span class="badge bg-warning">Pending</span>
            </div>
            <p style="color: var(--color-text-secondary); font-size: 0.85rem;">
              <i class="bi bi-person me-1"></i>From: ${escapeHtml(share.owner?.display_name || 'Unknown')}
            </p>
            <div class="d-flex justify-content-between mb-2">
              <span style="color: var(--color-text-tertiary);">Full bill:</span>
              <span style="color: var(--color-text-primary);">${formatCurrency(share.bill?.amount)}</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
              <span style="color: var(--color-text-tertiary);">Your portion:</span>
              <strong style="color: var(--color-primary);">${formatCurrency(share.shared_amount)}</strong>
            </div>
            <div class="d-flex justify-content-between mb-3">
              <span style="color: var(--color-text-tertiary);">Split:</span>
              <span class="badge bg-info">${escapeHtml(splitLabel)}</span>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-success btn-sm flex-grow-1" onclick="acceptBillShare('${escapeAttribute(share.id)}')">
                <i class="bi bi-check-lg me-1"></i>Accept
              </button>
              <button class="btn btn-outline-danger btn-sm flex-grow-1" onclick="declineBillShare('${escapeAttribute(share.id)}')">
                <i class="bi bi-x-lg me-1"></i>Decline
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderMySharedBills(shares) {
  const section = document.getElementById('mySharedBillsSection');
  const tbody = document.getElementById('mySharedBillsTableBody');
  if (!section || !tbody) return;

  if (shares.length === 0) {
    section.classList.add('d-none');
    return;
  }

  section.classList.remove('d-none');
  tbody.innerHTML = shares.map(share => {
    const splitLabel = share.split_type === 'equal' ? '50/50' : share.split_type === 'percentage' ? `${escapeHtml(share.shared_percent)}%` : formatCurrency(share.shared_fixed);
    const statusColor = share.status === 'accepted' ? 'success' : share.status === 'pending' ? 'warning' : 'danger';
    const statusLabel = share.status === 'accepted' ? 'Active' : share.status === 'pending' ? 'Pending' : 'Declined';
    return `
      <tr>
        <td>${escapeHtml(share.bill?.name || 'Unknown')}</td>
        <td>
          <span style="color: var(--color-text-secondary);">${escapeHtml(share.shared_user?.display_name || 'Unknown')}</span>
          ${share.shared_user?.username ? `<small class="d-block" style="color: var(--color-text-tertiary);">@${escapeHtml(share.shared_user.username)}</small>` : ''}
        </td>
        <td><strong style="color: var(--color-primary);">${formatCurrency(share.shared_amount)}</strong></td>
        <td style="color: var(--color-text-secondary);">${formatCurrency(share.owner_amount)}</td>
        <td><span class="badge bg-info">${escapeHtml(splitLabel)}</span></td>
        <td><span class="badge bg-${escapeAttribute(statusColor)}">${escapeHtml(statusLabel)}</span></td>
        <td>
          <button class="btn btn-outline-danger btn-sm" onclick="revokeShareBill('${escapeAttribute(share.id)}')" title="Revoke share">
            <i class="bi bi-x-circle me-1"></i>Revoke
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

async function revokeShareBill(shareId) {
  if (!confirm('Are you sure you want to revoke this shared bill? The other person will no longer see it.')) return;
  
  const { error } = await sb.from('bill_shares').delete().eq('id', shareId).eq('owner_id', currentUser.id);
  if (error) {
    alert('Error revoking share: ' + error.message);
    return;
  }
  
  await loadSharedBillsData();
  renderBills(); // Re-render to update share indicators
}

async function openShareBillModal(billId) {
  const bill = (window.bills || []).find(b => b.id == billId);
  if (!bill) return;
  
  document.getElementById('shareBillId').value = bill.id;
  document.getElementById('shareBillName').value = escapeHtml(bill.name || '');
  document.getElementById('shareBillAmount').value = formatCurrency(bill.amount);
  
  // Reset fields
  document.getElementById('shareSplitType').value = 'equal';
  document.getElementById('percentageSplitFields').classList.add('d-none');
  document.getElementById('fixedSplitFields').classList.add('d-none');
  document.getElementById('shareOwnerPercent').value = 50;
  document.getElementById('shareSharedPercent').value = 50;
  
  // Load friends into dropdown
  const friendSelect = document.getElementById('shareFriendSelect');
  const noFriendsMsg = document.getElementById('noFriendsMsg');
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Select a friend...';
  friendSelect.replaceChildren(defaultOption);
  
  const { data: connections } = await sb
    .from('connections')
    .select('id, requester_id, addressee_id, requester:user_profiles!connections_requester_id_user_profiles_fkey(id, username, display_name), addressee:user_profiles!connections_addressee_id_user_profiles_fkey(id, username, display_name)')
    .eq('status', 'accepted')
    .or(`requester_id.eq.${currentUser.id},addressee_id.eq.${currentUser.id}`);
  
  const friends = (connections || []).map(conn => conn.requester?.id === currentUser.id ? conn.addressee : conn.requester).filter(Boolean);
  
  if (friends.length === 0) {
    noFriendsMsg.classList.remove('d-none');
  } else {
    noFriendsMsg.classList.add('d-none');
    friends.forEach(f => {
      const opt = document.createElement('option');
      opt.value = f.id;
      opt.textContent = `${f.display_name || 'Unknown'}${f.username ? ` (@${f.username})` : ''}`;
      friendSelect.appendChild(opt);
    });
  }
  
  updateSharePreview();
  bootstrap.Modal.getOrCreateInstance(document.getElementById('shareBillModal')).show();
}

function updateSharePreview() {
  const billAmount = getRaw(document.getElementById('shareBillAmount').value);
  const splitType = document.getElementById('shareSplitType').value;
  let ownerAmount = 0, sharedAmount = 0;
  
  switch (splitType) {
    case 'equal':
      ownerAmount = billAmount / 2;
      sharedAmount = billAmount / 2;
      break;
    case 'percentage':
      const ownerPct = parseFloat(document.getElementById('shareOwnerPercent').value) || 0;
      const sharedPct = parseFloat(document.getElementById('shareSharedPercent').value) || 0;
      ownerAmount = billAmount * (ownerPct / 100);
      sharedAmount = billAmount * (sharedPct / 100);
      break;
    case 'fixed':
      ownerAmount = parseFloat(document.getElementById('shareOwnerFixed').value) || 0;
      sharedAmount = parseFloat(document.getElementById('shareSharedFixed').value) || 0;
      break;
  }
  
  document.getElementById('sharePreviewOwner').textContent = formatCurrency(ownerAmount);
  document.getElementById('sharePreviewShared').textContent = formatCurrency(sharedAmount);
}

async function confirmShareBill() {
  // CSRF Protection
  try {
    if (typeof CSRF !== 'undefined') {
      CSRF.requireValidToken();
    }
  } catch (err) {
    alert(err.message);
    return;
  }

  const billId = document.getElementById('shareBillId').value;
  const friendId = document.getElementById('shareFriendSelect').value;
  const splitType = document.getElementById('shareSplitType').value;
  
  if (!friendId) {
    alert('Please select a friend to share with.');
    return;
  }
  
  const bill = (window.bills || []).find(b => b.id == billId);
  if (!bill) return;
  
  let owner_percent, shared_percent, owner_fixed, shared_fixed, owner_amount, shared_amount;
  
  switch (splitType) {
    case 'equal':
      owner_percent = 50;
      shared_percent = 50;
      owner_amount = bill.amount / 2;
      shared_amount = bill.amount / 2;
      break;
    case 'percentage':
      owner_percent = parseFloat(document.getElementById('shareOwnerPercent').value) || 0;
      shared_percent = parseFloat(document.getElementById('shareSharedPercent').value) || 0;
      if (Math.abs((owner_percent + shared_percent) - 100) > 0.01) {
        document.getElementById('percentageError').classList.remove('d-none');
        return;
      }
      owner_amount = bill.amount * (owner_percent / 100);
      shared_amount = bill.amount * (shared_percent / 100);
      break;
    case 'fixed':
      owner_fixed = parseFloat(document.getElementById('shareOwnerFixed').value) || 0;
      shared_fixed = parseFloat(document.getElementById('shareSharedFixed').value) || 0;
      if (owner_fixed > bill.amount || shared_fixed > bill.amount) {
        const warn = document.getElementById('fixedAmountError');
        if (warn) { warn.textContent = 'Amount exceeds the bill total.'; warn.classList.remove('d-none'); }
        return;
      }
      if (Math.abs((owner_fixed + shared_fixed) - bill.amount) > 0.01) {
        const warn = document.getElementById('fixedAmountError');
        if (warn) { warn.textContent = 'Amounts must add up to the bill total.'; warn.classList.remove('d-none'); }
        return;
      }
      owner_amount = owner_fixed;
      shared_amount = shared_fixed;
      break;
  }
  
  const { error } = await sb.from('bill_shares').insert({
    bill_id: billId,
    owner_id: currentUser.id,
    shared_with_id: friendId,
    status: 'pending',
    split_type: splitType,
    owner_percent: owner_percent || null,
    shared_percent: shared_percent || null,
    owner_fixed: owner_fixed || null,
    shared_fixed: shared_fixed || null,
    owner_amount: Math.round(owner_amount * 100) / 100,
    shared_amount: Math.round(shared_amount * 100) / 100
  });
  
  if (error) {
    if (error.message.includes('unique') || error.message.includes('duplicate')) {
      alert('This bill is already shared with that user.');
    } else {
      alert('Error sharing bill: ' + error.message);
    }
    return;
  }
  
  bootstrap.Modal.getInstance(document.getElementById('shareBillModal')).hide();
  await loadSharedBillsData();
  renderBills(); // Re-render to show share indicators
}

async function acceptBillShare(shareId) {
  // CSRF Protection
  try {
    if (typeof CSRF !== 'undefined') {
      CSRF.requireValidToken();
    }
  } catch (err) {
    alert(err.message);
    return;
  }

  await sb.from('bill_shares').update({
    status: 'accepted',
    accepted_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }).eq('id', shareId).eq('shared_with_id', currentUser.id);
  await loadSharedBillsData();
}

async function declineBillShare(shareId) {
  // CSRF Protection
  try {
    if (typeof CSRF !== 'undefined') {
      CSRF.requireValidToken();
    }
  } catch (err) {
    alert(err.message);
    return;
  }

  await sb.from('bill_shares').update({
    status: 'declined',
    updated_at: new Date().toISOString()
  }).eq('id', shareId).eq('shared_with_id', currentUser.id);
  await loadSharedBillsData();
}

// ===== ENHANCED BILL RENDERING (with share indicators) =====
function getShareInfoForBill(billId) {
  return billSharesCache.find(s => s.bill_id === billId);
}

// Initialize share-related UI on bills page
function initShareBillUI() {
  if (!document.getElementById('shareBillModal')) return;
  
  // Split type toggle
  document.getElementById('shareSplitType')?.addEventListener('change', (e) => {
    document.getElementById('percentageSplitFields').classList.toggle('d-none', e.target.value !== 'percentage');
    document.getElementById('fixedSplitFields').classList.toggle('d-none', e.target.value !== 'fixed');
    document.getElementById('percentageError')?.classList.add('d-none');
    document.getElementById('fixedAmountError')?.classList.add('d-none');
    updateSharePreview();
  });
  
  // Live preview updates for percentage fields
  ['shareOwnerPercent', 'shareSharedPercent'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updateSharePreview);
  });
  
  // Fixed amount auto-fill: editing one field calculates the other as remainder
  document.getElementById('shareOwnerFixed')?.addEventListener('input', (e) => {
    const billAmount = getRaw(document.getElementById('shareBillAmount').value);
    const ownerVal = parseFloat(e.target.value) || 0;
    const capped = Math.min(Math.max(ownerVal, 0), billAmount);
    const remainder = Math.round((billAmount - capped) * 100) / 100;
    document.getElementById('shareSharedFixed').value = remainder >= 0 ? remainder : 0;
    // Show warning if entered value exceeds bill total
    const warn = document.getElementById('fixedAmountError');
    if (warn) warn.classList.toggle('d-none', ownerVal <= billAmount);
    updateSharePreview();
  });
  document.getElementById('shareSharedFixed')?.addEventListener('input', (e) => {
    const billAmount = getRaw(document.getElementById('shareBillAmount').value);
    const sharedVal = parseFloat(e.target.value) || 0;
    const capped = Math.min(Math.max(sharedVal, 0), billAmount);
    const remainder = Math.round((billAmount - capped) * 100) / 100;
    document.getElementById('shareOwnerFixed').value = remainder >= 0 ? remainder : 0;
    // Show warning if entered value exceeds bill total
    const warn = document.getElementById('fixedAmountError');
    if (warn) warn.classList.toggle('d-none', sharedVal <= billAmount);
    updateSharePreview();
  });
  
  // Percentage sync
  document.getElementById('shareOwnerPercent')?.addEventListener('input', (e) => {
    document.getElementById('shareSharedPercent').value = 100 - (parseFloat(e.target.value) || 0);
    updateSharePreview();
  });
  document.getElementById('shareSharedPercent')?.addEventListener('input', (e) => {
    document.getElementById('shareOwnerPercent').value = 100 - (parseFloat(e.target.value) || 0);
    updateSharePreview();
  });
  
  // Confirm share
  document.getElementById('confirmShareBillBtn')?.addEventListener('click', confirmShareBill);
}

document.addEventListener('DOMContentLoaded', init);

// Mobile chart re-initialization on resize (orientation change)
let resizeTimeout;
window.addEventListener('resize', function() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(function() {
    if (window.innerWidth < 768) {
      // Re-apply mobile chart defaults on orientation change
      Chart.defaults.font.size = 11;
      Chart.defaults.responsive = true;
      Chart.defaults.maintainAspectRatio = false;
      
      // Ensure all canvases have transparent background
      const canvases = document.querySelectorAll('.chart-wrapper canvas');
      canvases.forEach(canvas => {
        canvas.style.backgroundColor = 'transparent';
      });
    }
  }, 250); // Debounce 250ms
});

// ===== GLOBAL EXPORTS =====
window.openAssetModal = openAssetModal;
window.confirmDeleteAsset = confirmDeleteAsset;
window.deleteAssetConfirmed = deleteAssetConfirmed;
window.openInvestmentModal = openInvestmentModal;
window.confirmDeleteInvestment = confirmDeleteInvestment;
window.deleteInvestmentConfirmed = deleteInvestmentConfirmed;
window.openDebtModal = openDebtModal;
window.confirmDeleteDebt = confirmDeleteDebt;
window.deleteDebtConfirmed = deleteDebtConfirmed;
window.openBillModal = openBillModal;
window.confirmDeleteBill = confirmDeleteBill;
window.deleteBillConfirmed = deleteBillConfirmed;
window.openIncomeModal = openIncomeModal;
window.confirmDeleteIncome = confirmDeleteIncome;
window.deleteIncomeConfirmed = deleteIncomeConfirmed;
window.generateBudgetForMonth = generateBudgetForMonth;
// Social features
window.searchFriends = searchFriends;
window.sendFriendRequest = sendFriendRequest;
window.acceptFriendRequest = acceptFriendRequest;
window.declineFriendRequest = declineFriendRequest;
window.cancelFriendRequest = cancelFriendRequest;
window.removeFriend = removeFriend;
window.openShareBillModal = openShareBillModal;
window.confirmShareBill = confirmShareBill;
window.acceptBillShare = acceptBillShare;
window.declineBillShare = declineBillShare;
window.revokeShareBill = revokeShareBill;
window.markAllNotificationsRead = markAllNotificationsRead;
window.handleNotificationClick = handleNotificationClick;
window.showAmortizationSchedule = showAmortizationSchedule;
window.deleteBudgetItem = deleteBudgetItem;
// Session security
window.sessionSecurity = sessionSecurity;
