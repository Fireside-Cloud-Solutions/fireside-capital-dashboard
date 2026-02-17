/**
 * demo-data.js — FC-184: Sample Data for Preview/Demo Mode
 *
 * Architecture:
 *   - Client-side only — NO Supabase writes
 *   - localStorage flag: 'fireside_demo_mode' = 'true'
 *   - isDemoMode() exported as global for use by app.js / DataLayer
 *   - Realistic "Alex Johnson" persona — young professional, mixed income
 *
 * Usage:
 *   isDemoMode()    → boolean
 *   enableDemoMode()  → sets flag, reloads
 *   disableDemoMode() → clears flag, reloads
 *   DEMO_DATA.*     → structured data matching each Supabase table schema
 */

const DEMO_MODE_KEY = 'fireside_demo_mode';

// ─── Toggle Helpers ──────────────────────────────────────────────────────────

function isDemoMode() {
  return localStorage.getItem(DEMO_MODE_KEY) === 'true';
}

function enableDemoMode() {
  localStorage.setItem(DEMO_MODE_KEY, 'true');
  window.location.reload();
}

function disableDemoMode() {
  localStorage.removeItem(DEMO_MODE_KEY);
  window.location.reload();
}

// ─── Date Helpers ─────────────────────────────────────────────────────────────

function demoRelativeDate(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

function demoMonthDate(monthsAgo, day = 1) {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  d.setDate(day);
  return d.toISOString().split('T')[0];
}

// ─── Demo User ────────────────────────────────────────────────────────────────

const DEMO_USER = {
  id: 'demo-user-001',
  email: 'alex@example.com',
  name: 'Alex Johnson'
};

// ─── Static Demo Data ────────────────────────────────────────────────────────

const DEMO_ASSETS = [
  {
    id: 'demo-asset-1', user_id: DEMO_USER.id,
    name: 'Primary Residence', type: 'real_estate',
    current_value: 385000, loan_balance: 290000, equity: 95000,
    created_at: '2022-06-15'
  },
  {
    id: 'demo-asset-2', user_id: DEMO_USER.id,
    name: '2021 Honda Civic', type: 'vehicle',
    current_value: 18500, loan_balance: 11200, equity: 7300,
    created_at: '2021-03-01'
  }
];

const DEMO_INCOME = [
  {
    id: 'demo-inc-1', user_id: DEMO_USER.id,
    source: 'Tech Corp - Salary', type: 'W2',
    amount: 5200, frequency: 'bi-weekly',
    next_date: demoRelativeDate(5), created_at: '2024-01-01'
  },
  {
    id: 'demo-inc-2', user_id: DEMO_USER.id,
    source: 'Freelance Design', type: '1099',
    amount: 800, frequency: 'monthly',
    next_date: demoRelativeDate(15), created_at: '2024-03-01'
  }
];

const DEMO_BILLS = [
  { id: 'demo-bill-1', user_id: DEMO_USER.id, name: 'Mortgage', amount: 1850, frequency: 'monthly', due_day: 1, category: 'bills', status: 'active' },
  { id: 'demo-bill-2', user_id: DEMO_USER.id, name: 'Electric', amount: 95, frequency: 'monthly', due_day: 15, category: 'utilities', status: 'active' },
  { id: 'demo-bill-3', user_id: DEMO_USER.id, name: 'Internet', amount: 65, frequency: 'monthly', due_day: 20, category: 'utilities', status: 'active' },
  { id: 'demo-bill-4', user_id: DEMO_USER.id, name: 'Netflix', amount: 22.99, frequency: 'monthly', due_day: 8, category: 'entertainment', status: 'active' },
  { id: 'demo-bill-5', user_id: DEMO_USER.id, name: 'Spotify', amount: 10.99, frequency: 'monthly', due_day: 12, category: 'entertainment', status: 'active' },
  { id: 'demo-bill-6', user_id: DEMO_USER.id, name: 'Gym Membership', amount: 45, frequency: 'monthly', due_day: 1, category: 'healthcare', status: 'active' },
  { id: 'demo-bill-7', user_id: DEMO_USER.id, name: 'Car Insurance', amount: 145, frequency: 'monthly', due_day: 10, category: 'transportation', status: 'active' },
  { id: 'demo-bill-8', user_id: DEMO_USER.id, name: 'Phone Plan', amount: 85, frequency: 'monthly', due_day: 18, category: 'utilities', status: 'active' }
];

const DEMO_DEBTS = [
  {
    id: 'demo-debt-1', user_id: DEMO_USER.id,
    name: 'Student Loan', type: 'student_loan',
    principal: 32000, current_balance: 24500,
    interest_rate: 5.5, monthly_payment: 350, remaining_months: 70
  },
  {
    id: 'demo-debt-2', user_id: DEMO_USER.id,
    name: 'Car Loan', type: 'auto',
    principal: 22000, current_balance: 11200,
    interest_rate: 4.9, monthly_payment: 385, remaining_months: 29
  }
];

const DEMO_INVESTMENTS = [
  { id: 'demo-inv-1', user_id: DEMO_USER.id, name: '401(k) - Fidelity', type: 'retirement', balance: 45200, contributions_ytd: 3900, return_ytd: 5.2 },
  { id: 'demo-inv-2', user_id: DEMO_USER.id, name: 'Roth IRA - Vanguard', type: 'roth_ira', balance: 18700, contributions_ytd: 700, return_ytd: 4.8 },
  { id: 'demo-inv-3', user_id: DEMO_USER.id, name: 'Taxable - Robinhood', type: 'brokerage', balance: 8300, contributions_ytd: 2400, return_ytd: 7.1 }
];

const DEMO_SETTINGS = {
  user_id: DEMO_USER.id,
  emergency_fund_goal: 25000,
  current_balance: 12400,
  safety_buffer: 1000,
  category_budgets: {
    dining: 300,
    groceries: 500,
    transportation: 150,
    utilities: 250,
    entertainment: 100,
    shopping: 200,
    healthcare: 100,
    travel: 200,
    other: 150
  }
};

// ─── Generated Demo Data ─────────────────────────────────────────────────────

function generateDemoTransactions() {
  const txns = [];
  let id = 1;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const merchantsByCategory = {
    dining:         [['Chipotle', 13.50], ['Starbucks', 6.75], ['Uber Eats', 28.40], ['Panera Bread', 11.20], ['Local Pizza Co', 22.00]],
    groceries:      [['Whole Foods', 84.30], ['Trader Joes', 67.15], ['Kroger', 92.40], ['Costco', 143.80]],
    transportation: [['Shell Gas', 48.20], ['Uber', 14.50], ['Metro Card', 33.00], ['Parking Garage', 22.00]],
    entertainment:  [['AMC Theaters', 18.50], ['Steam', 29.99], ['Audible', 14.95]],
    shopping:       [['Amazon', 54.99], ['Target', 38.45], ['Best Buy', 89.99], ['Gap', 62.00]],
    healthcare:     [['CVS Pharmacy', 24.50], ['Doctor Co-pay', 30.00], ['Walgreens', 18.70]],
    other:          [['ATM Withdrawal', 60.00], ['Venmo Transfer', 25.00]]
  };

  Object.entries(merchantsByCategory).forEach(([category, merchants]) => {
    merchants.forEach(([merchant, baseAmount]) => {
      // Add small variance to amounts
      const variance = (Math.random() - 0.5) * baseAmount * 0.2;
      const amount = parseFloat((baseAmount + variance).toFixed(2));
      const day = Math.max(1, Math.floor(Math.random() * Math.min(now.getDate(), 28)) + 1);
      txns.push({
        id: `demo-txn-${id++}`,
        user_id: DEMO_USER.id,
        date: new Date(year, month, day).toISOString().split('T')[0],
        merchant_name: merchant,
        description: `${merchant}`,
        amount,
        category,
        status: 'cleared'
      });
    });
  });

  // Add a few last-month transactions for trend context
  const lastMonthMerchants = [
    ['Chipotle', 'dining', 12.80],
    ['Whole Foods', 'groceries', 78.50],
    ['Shell Gas', 'transportation', 51.20],
    ['Amazon', 'shopping', 43.99],
    ['Netflix', 'entertainment', 22.99]
  ];
  lastMonthMerchants.forEach(([merchant, category, amount]) => {
    const day = Math.floor(Math.random() * 28) + 1;
    txns.push({
      id: `demo-txn-${id++}`,
      user_id: DEMO_USER.id,
      date: new Date(year, month - 1, day).toISOString().split('T')[0],
      merchant_name: merchant,
      description: `${merchant}`,
      amount,
      category,
      status: 'cleared'
    });
  });

  return txns.sort((a, b) => b.date.localeCompare(a.date));
}

function generateDemoSnapshots() {
  const snapshots = [];
  let netWorth = 118000; // Starting net worth 12 months ago

  for (let i = 11; i >= 0; i--) {
    // Realistic month-over-month growth: $1,200–$2,800 with occasional dips
    const isDownMonth = i === 9 || i === 5; // simulate 2 dip months
    const delta = isDownMonth
      ? -(Math.random() * 800 + 200)
      : (Math.random() * 1600 + 1200);
    netWorth += delta;

    const totalAssets = 403500 + (netWorth - 145000) * 0.3; // grows with net worth
    const totalLiabilities = totalAssets - netWorth;

    snapshots.push({
      id: `demo-snap-${i}`,
      user_id: DEMO_USER.id,
      date: demoMonthDate(i),
      net_worth: Math.round(netWorth),
      total_assets: Math.round(totalAssets),
      total_liabilities: Math.round(Math.max(0, totalLiabilities))
    });
  }

  return snapshots;
}

// ─── Main DEMO_DATA Export ────────────────────────────────────────────────────

// Memoized demo data — generated once per page session, consistent across calls
let _demoTransactionsCache = null;
let _demoSnapshotsCache = null;

const DEMO_DATA = {
  user: DEMO_USER,
  assets: DEMO_ASSETS,
  income: DEMO_INCOME,
  bills: DEMO_BILLS,
  debts: DEMO_DEBTS,
  investments: DEMO_INVESTMENTS,
  settings: DEMO_SETTINGS,

  // Memoized getters — generated once, then cached for page session consistency
  // (enableDemoMode/disableDemoMode reload the page, so cache is always fresh)
  get transactions() {
    if (!_demoTransactionsCache) _demoTransactionsCache = generateDemoTransactions();
    return _demoTransactionsCache;
  },
  get snapshots() {
    if (!_demoSnapshotsCache) _demoSnapshotsCache = generateDemoSnapshots();
    return _demoSnapshotsCache;
  }
};

// ─── Demo Banner Init ────────────────────────────────────────────────────────

/**
 * Shows/hides the #demoBanner element based on demo mode state.
 * Banner HTML must be present in the page (added to each HTML file).
 */
function initDemoBanner() {
  const banner = document.getElementById('demoBanner');
  if (!banner) return;

  if (isDemoMode()) {
    banner.classList.remove('d-none');
  } else {
    banner.classList.add('d-none');
  }
}

// Auto-init banner when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDemoBanner);
} else {
  initDemoBanner();
}
