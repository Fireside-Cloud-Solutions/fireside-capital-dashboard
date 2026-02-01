// ===== DEBUG UTILITY =====
const DEBUG = false;
function debugLog(...args) { if (DEBUG) console.log(...args); }

// ===== XSS PROTECTION =====
function escapeHtml(str) {
    if (str == null) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
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
  const isDark = document.body.getAttribute('data-theme') !== 'light';
  return {
      fill: isDark ? 'rgba(244, 78, 36, 0.15)' : 'rgba(244, 78, 36, 0.1)',
      text: isDark ? '#f0f0f0' : '#0f0f0f',
      grid: isDark ? 'rgba(240, 240, 240, 0.08)' : 'rgba(15, 15, 15, 0.1)'
  };
}
function dedupeSnapshotsByDate(snaps) {
  const uniqueSnaps = {};
  (snaps || []).forEach(snap => { uniqueSnaps[snap.date] = snap; });
  return Object.values(uniqueSnaps).sort((a, b) => new Date(a.date) - new Date(b.date));
}

// ===== CHART ERROR BOUNDARY (SUG-05) =====
function safeCreateChart(ctx, config, chartName) {
  try {
    if (!ctx) {
      console.warn(`Chart canvas not found for: ${chartName || 'unknown chart'}`);
      return null;
    }
    return new Chart(ctx, config);
  } catch (err) {
    console.error(`Failed to render ${chartName || 'chart'}:`, err);
    const el = (typeof ctx === 'string') ? document.getElementById(ctx) : ctx;
    if (el && el.parentElement) {
      el.parentElement.innerHTML = '<p class="text-muted text-center mt-3">Chart could not be loaded.</p>';
    }
    return null;
  }
}

// ===== CSV EXPORT (SUG-02) =====
function exportFinancialDataCSV() {
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
const sb = window.supabase.createClient(supabaseUrl, supabaseKey);

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
  if (msg.includes('invalid login credentials')) return 'Invalid email or password. Please try again.';
  if (msg.includes('user not found')) return 'No account found with that email address.';
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
        'âœ… Account created! Please check your email (including spam folder) and click the confirmation link before logging in.',
        'success'
      );
      document.getElementById('signupForm')?.reset();
    } else {
      // Auto-confirmed â€" session exists
      showAuthAlert('signupAlert', 'âœ… Account created successfully! Logging you in...', 'success');
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
    const { error } = await sb.auth.signInWithPassword({ email, password });

    if (error) {
      showAuthAlert('loginAlert', getFriendlyAuthError(error), 'danger');
      return;
    }

    showAuthAlert('loginAlert', 'âœ… Login successful!', 'success');
    setTimeout(() => {
      bootstrap.Modal.getInstance(document.getElementById('loginModal'))?.hide();
      hideAuthAlert('loginAlert');
    }, 500);
  } catch (err) {
    showAuthAlert('loginAlert', 'An unexpected error occurred. Please try again.', 'danger');
    console.error('Login error:', err);
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

    showAuthAlert('forgotAlert', 'âœ… Password reset link sent! Check your email (including spam folder).', 'success');
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

    showAuthAlert('resetPasswordAlert', 'âœ… Password updated successfully! Redirecting...', 'success');
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

async function logout() { await sb.auth.signOut(); }

// ===== CORE DATA & RENDER FUNCTIONS =====
// --- THE DEBUGGING FUNCTION ---
async function fetchAllDataFromSupabase() {
  if (!currentUser) return; // Exit if no user is logged in

  try {
      // Fetch all data streams at the same time
      const [assetsRes, investmentsRes, debtsRes, billsRes, incomeRes, snapshotsRes, settingsRes] = await Promise.all([
        sb.from('assets').select('*').eq('user_id', currentUser.id),
        sb.from('investments').select('*').eq('user_id', currentUser.id),
        sb.from('debts').select('*').eq('user_id', currentUser.id),
        sb.from('bills').select('*').eq('user_id', currentUser.id),
        sb.from('income').select('*').eq('user_id', currentUser.id),
        sb.from('snapshots').select('*').eq('user_id', currentUser.id),
        sb.from('settings').select('*').eq('user_id', currentUser.id).single() // Fetch settings
    ]);

      // Check if any of the requests failed
      const responses = [assetsRes, investmentsRes, debtsRes, billsRes, incomeRes, snapshotsRes];
      for (const res of responses) {
          if (res.error) {
              throw new Error(`Failed to fetch data: ${res.error.message}`);
          }
      }

      // THE FIX: Assign data to the global window object
      window.assets = assetsRes.data || [];
      window.investments = investmentsRes.data || [];
      window.debts = debtsRes.data || [];
      window.bills = billsRes.data || [];
      window.income = incomeRes.data || [];
      window.snapshots = snapshotsRes.data || [];
      window.settings = settingsRes.data || {};

      debugLog("FETCH: Data fetch successful for all tables.");
  } catch (error) {
      console.error("Error during data fetch:", error);
      alert("A critical error occurred while fetching your data. Please check the console.");
  }
}


function renderAll() {
  // Render all the tables for the sub-pages
  renderAssets();
  renderInvestments();
  renderDebts();
  renderBills();
  renderIncome();

  // If we are on the dashboard, render the dashboard components
  // Use 'totalInvestments' as the check â€" it only exists on the dashboard, not reports.html
  if (document.getElementById('totalInvestments')) {
      updateDashboardCards();
      renderUpcomingPayments();
      renderNetWorthChart();
      generateMonthlyCashFlowChart();
      renderEmergencyFundChart();
  }

  // If we are on the reports page, render the net worth chart (without writing snapshots)
  if (document.getElementById('reportNetWorth') && document.getElementById('netWorthTimelineChart')) {
      renderNetWorthChart();
  }

  // Pre-populate settings inputs
  if (document.getElementById('emergencyFundGoal') && window.settings?.emergency_fund_goal) {
      document.getElementById('emergencyFundGoal').value = window.settings.emergency_fund_goal;
  }

  // Populate reports summary cards
  renderReportsSummary();
}
function renderReportsSummary() {
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
function renderAssets() {
  const tbody = document.getElementById('assetTableBody');
  if (!tbody) return;
  tbody.innerHTML = (window.assets || []).map(a => `
      <tr>
          <td>${escapeHtml(a.name)}</td><td>${escapeHtml(a.type)}</td><td>${formatCurrency(a.value)}</td>
          <td>${formatCurrency(a.loan)}</td><td>${formatCurrency(Math.max(getRaw(a.value) - getRaw(a.loan), 0))}</td>
          <td>${a.nextDueDate ? formatDate(a.nextDueDate) : '-'}</td>
          <td>
              <button class="btn btn-sm btn-outline-primary" onclick="openAssetModal('${a.id}')"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteAsset('${a.id}', '${escapeHtml(a.name)}')"><i class="bi bi-trash"></i></button>
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
          if (asset.type === 'realEstate') {
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
  const f = document.getElementById('assetForm');
  const type = f.assetType.value;
  const record = { name: f.assetName.value, type, user_id: currentUser.id };
  if (type === 'realEstate') {
      record.value = getRaw(f.propertyValue.value); record.loan = getRaw(f.loanAmount.value); record.nextDueDate = f.realEstateNextDueDate.value || null;
  } else if (type === 'vehicle') {
      record.value = getRaw(f.vehicleValue.value); record.loan = getRaw(f.vehicleLoanBalance.value); record.nextDueDate = f.vehicleNextDueDate.value || null;
  }
  const { error } = editAssetId ? await sb.from('assets').update(record).eq('id', editAssetId).eq('user_id', currentUser.id) : await sb.from('assets').insert(record);
  if (error) return alert(error.message);
  bootstrap.Modal.getInstance(f.closest('.modal')).hide();
  await fetchAllDataFromSupabase();
  renderAll();
}
function confirmDeleteAsset(id, name) {
  deleteAssetId = id;
  // BUG-04 FIX: Accept name as parameter instead of looking up by ID (prevents "undefined" for new items)
  document.getElementById('deleteAssetName').textContent = `"${name}"`;
  bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmDeleteAssetModal')).show();
}
async function deleteAssetConfirmed() {
  const { error } = await sb.from('assets').delete().eq('id', deleteAssetId).eq('user_id', currentUser.id);
  if (error) return alert(error.message);
  bootstrap.Modal.getInstance(document.getElementById('confirmDeleteAssetModal')).hide();
  await fetchAllDataFromSupabase();
  renderAll();
}

// --- INVESTMENTS ---
function renderInvestments() {
  const tbody = document.getElementById('investmentTableBody');
  if (!tbody) return;
  tbody.innerHTML = (window.investments || []).map(inv => `
      <tr>
          <td>${escapeHtml(inv.name)}</td><td>${escapeHtml(inv.type)}</td><td>${formatCurrency(inv.startingBalance)}</td>
          <td>${formatCurrency(inv.monthlyContribution)}</td><td>${inv.annualReturn ? inv.annualReturn + '%' : '-'}</td>
          <td>${inv.nextContributionDate ? formatDate(inv.nextContributionDate) : '-'}</td><td>${formatCurrency(inv.value)}</td>
          <td>
              <button class="btn btn-sm btn-outline-primary" onclick="openInvestmentModal('${inv.id}')"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteInvestment('${inv.id}', '${escapeHtml(inv.name)}')"><i class="bi bi-trash"></i></button>
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
          f.investmentName.value = escapeHtml(inv.name || ''); f.investmentType.value = escapeHtml(inv.type || ''); f.investmentValue.value = inv.value;
          f.startingBalance.value = inv.startingBalance || '';
          f.monthlyContribution.value = inv.monthlyContribution; f.annualReturn.value = inv.annualReturn;
          f.nextContributionDate.value = inv.nextContributionDate;
      }
  }
  bootstrap.Modal.getOrCreateInstance(f.closest('.modal')).show();
}
async function saveInvestment() {
  const f = document.getElementById('investmentForm');
  const record = {
      name: f.investmentName.value, type: f.investmentType.value, value: getRaw(f.investmentValue.value),
      startingBalance: getRaw(f.startingBalance.value), monthlyContribution: getRaw(f.monthlyContribution.value),
      annualReturn: getRaw(f.annualReturn.value), nextContributionDate: f.nextContributionDate.value || null,
      user_id: currentUser.id
  };
  const { error } = editInvestmentId ? await sb.from('investments').update(record).eq('id', editInvestmentId).eq('user_id', currentUser.id) : await sb.from('investments').insert(record);

  editInvestmentId = null;
  if (error) return alert(error.message);

  bootstrap.Modal.getInstance(f.closest('.modal')).hide();
  await fetchAllDataFromSupabase();
  renderAll();
}
function confirmDeleteInvestment(id, name) {
  // BUG-04 FIX: Accept name as parameter instead of looking up by ID (prevents "undefined" for new items)
  if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteInvestmentConfirmed(id);
  }
}
async function deleteInvestmentConfirmed(id) {
  const { error } = await sb.from('investments').delete().eq('id', id).eq('user_id', currentUser.id);
  if (error) return alert(error.message);
  await fetchAllDataFromSupabase();
  renderAll();
}

// --- DEBTS ---
function renderDebts() {
  const tbody = document.getElementById('debtTableBody');
  if (!tbody) return;
  tbody.innerHTML = (window.debts || []).map(d => `
      <tr>
          <td>${escapeHtml(d.name)}</td><td>${escapeHtml(d.type)}</td><td>${formatCurrency(d.amount)}</td><td>${escapeHtml(d.interestRate)}%</td>
          <td>${d.term || '-'} months</td><td>${formatCurrency(d.monthlyPayment)}</td>
          <td>${d.nextDueDate ? formatDate(d.nextDueDate) : '-'}</td>
          <td>
              <button class="btn btn-sm btn-outline-primary" onclick="openDebtModal('${d.id}')"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteDebt('${d.id}', '${escapeHtml(d.name)}')"><i class="bi bi-trash"></i></button>
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
  const f = document.getElementById('debtForm');
  const record = {
      name: f.debtName.value, type: f.debtType.value, amount: getRaw(f.debtAmount.value), interestRate: getRaw(f.debtInterest.value),
      term: getRaw(f.debtTerm.value), monthlyPayment: getRaw(f.debtMonthly.value),
      nextDueDate: f.debtNextPaymentDate.value || null, user_id: currentUser.id
  };
  const { error } = editDebtId ? await sb.from('debts').update(record).eq('id', editDebtId).eq('user_id', currentUser.id) : await sb.from('debts').insert(record);
  if (error) return alert(error.message);
  bootstrap.Modal.getInstance(f.closest('.modal')).hide();
  await fetchAllDataFromSupabase();
  renderAll();
}
function confirmDeleteDebt(id) {
  deleteDebtId = id;
  document.getElementById('deleteDebtName').textContent = `"${window.debts.find(d=>d.id===id).name}"`;
  bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmDeleteDebtModal')).show();
}
async function deleteDebtConfirmed() {
  const { error } = await sb.from('debts').delete().eq('id', deleteDebtId).eq('user_id', currentUser.id);
  if (error) return alert(error.message);
  bootstrap.Modal.getInstance(document.getElementById('confirmDeleteDebtModal')).hide();
  await fetchAllDataFromSupabase();
  renderAll();
}

// --- BILLS ---
// Category badge color mapping for bill types
function getCategoryBadgeClass(type) {
  switch ((type || '').toLowerCase()) {
    case 'housing':       return 'bg-primary';           // blue
    case 'utilities':     return 'bg-info text-dark';    // teal/cyan
    case 'auto':          return 'bg-warning text-dark'; // orange
    case 'financing':     return 'bg-purple';            // purple (custom)
    case 'subscriptions': return 'bg-indigo';            // indigo/violet (custom)
    case 'health':        return 'bg-success';           // green (reserved)
    default:              return 'bg-secondary';         // fallback grey
  }
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
    // 0% APR — simple division
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

  // Standard amortization: M = P[r(1+r)^n] / [(1+r)^n – 1]
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

  const allBills = window.bills || [];
  const isFinancingType = (b) => {
    const type = (b.type || '').toLowerCase();
    return type === 'financing' || getBillFinancingInfo(b).isFinancing;
  };

  // Split bills: recurring vs financing
  const recurringBills = allBills.filter(b => !isFinancingType(b));
  const financingBills = allBills.filter(b => isFinancingType(b));
  const activeFinancing = financingBills.filter(b => getBillFinancingInfo(b).status !== 'paid_off');
  const completedFinancing = financingBills.filter(b => getBillFinancingInfo(b).status === 'paid_off');

  // Render ALL active bills in the table (including financing — they're recurring payments too)
  const activeBills = allBills.filter(b => {
    const info = getBillFinancingInfo(b);
    return !(info.isFinancing && info.status === 'paid_off');
  });
  tbody.innerHTML = activeBills.map(b => {
      const shareInfo = getShareInfoForBill(b.id);
      const sharedBadge = shareInfo ? `<span class="badge bg-info ms-1" title="Shared with ${escapeHtml(shareInfo.shared_user?.display_name || 'someone')}"><i class="bi bi-link-45deg me-1"></i>${shareInfo.status === 'accepted' ? 'Shared' : 'Pending'}</span>` : '';
      return `
      <tr>
          <td>${escapeHtml(b.name)} ${sharedBadge}</td><td><span class="badge ${getCategoryBadgeClass(b.type)}">${escapeHtml(b.type)}</span></td><td>${formatCurrency(b.amount)}${shareInfo && shareInfo.status === 'accepted' ? `<small class="d-block" style="color: var(--color-text-tertiary);">Your share: ${formatCurrency(shareInfo.owner_amount)}</small>` : ''}</td>
          <td>${escapeHtml(b.frequency)}</td><td>${b.nextDueDate ? formatDate(b.nextDueDate) : '-'}</td>
          <td>
              <button class="btn btn-sm btn-outline-info" onclick="openShareBillModal('${b.id}')" title="Share bill"><i class="bi bi-share"></i></button>
              <button class="btn btn-sm btn-outline-primary" onclick="openBillModal('${b.id}')"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteBill('${b.id}', '${escapeHtml(b.name)}')"><i class="bi bi-trash"></i></button>
          </td>
      </tr>`;
  }).join('');

  // Render financing cards with progress bars
  const financingContainer = document.getElementById('financingCards');
  if (financingContainer) {
    financingContainer.innerHTML = activeFinancing.length > 0
      ? activeFinancing.map(b => {
          const info = getBillFinancingInfo(b);
          const progressColor = info.percentPaid >= 75 ? 'var(--color-success)' : 'var(--color-primary)';
          const payoffStr = info.estimatedPayoffDate
            ? info.estimatedPayoffDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            : 'N/A';
          // APR badge
          const aprBadge = info.interestRate !== null && info.interestRate !== undefined
            ? `<span class="badge ${info.interestRate === 0 ? 'bg-success' : 'bg-warning text-dark'} ms-1" style="font-size: 0.7rem;">${info.interestRate}% APR</span>`
            : '';
          // Principal vs Interest breakdown (only when loan details exist)
          const hasBreakdown = info.hasLoanDetails && info.interestPaidToDate !== null;
          const breakdownHtml = hasBreakdown ? `
                <div class="mt-3 mb-2">
                  <div class="d-flex justify-content-between mb-1">
                    <small style="color: var(--color-text-secondary);">Principal vs Interest Paid</small>
                  </div>
                  <div class="progress" style="height: 8px; border-radius: var(--radius-full);">
                    <div class="progress-bar" role="progressbar"
                         style="width: ${info.amountPaid > 0 ? (info.principalPaidToDate / (info.principalPaidToDate + info.interestPaidToDate) * 100) : 0}%; background-color: var(--color-primary);"
                         title="Principal: ${formatCurrency(info.principalPaidToDate)}">
                    </div>
                    <div class="progress-bar" role="progressbar"
                         style="width: ${info.amountPaid > 0 ? (info.interestPaidToDate / (info.principalPaidToDate + info.interestPaidToDate) * 100) : 0}%; background-color: var(--color-secondary);"
                         title="Interest: ${formatCurrency(info.interestPaidToDate)}">
                    </div>
                  </div>
                  <div class="d-flex justify-content-between mt-1">
                    <small style="color: var(--color-primary);">Principal: ${formatCurrency(info.principalPaidToDate)}</small>
                    <small style="color: var(--color-secondary);">Interest: ${formatCurrency(info.interestPaidToDate)}</small>
                  </div>
                </div>` : '';
          // Total interest line
          const totalInterestHtml = info.totalInterest !== null
            ? `<div class="col-4">
                    <small class="d-block" style="color: var(--color-text-tertiary);">Total Interest</small>
                    <strong style="color: var(--color-secondary);">${formatCurrency(info.totalInterest)}</strong>
                  </div>` : '';
          // View Schedule button (only when loan details exist)
          const scheduleBtn = info.hasLoanDetails
            ? `<button class="btn btn-sm btn-outline-info mt-2" onclick="showAmortizationSchedule('${b.id}')"><i class="bi bi-table me-1"></i>View Schedule</button>`
            : '';
          return `
          <div class="col-xl-4 col-md-6 col-12">
            <div class="card h-100">
              <div class="card-body p-4">
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5 class="mb-1" style="color: var(--color-text-primary); font-size: var(--text-h5);">${escapeHtml(b.name)}</h5>
                    <span class="badge ${getCategoryBadgeClass(b.type)}">${escapeHtml(b.type)}</span>${aprBadge}
                  </div>
                  <div class="text-end">
                    <button class="btn btn-sm btn-outline-info" onclick="openShareBillModal('${b.id}')" title="Share bill"><i class="bi bi-share"></i></button>
                    <button class="btn btn-sm btn-outline-primary" onclick="openBillModal('${b.id}')"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteBill('${b.id}', '${escapeHtml(b.name)}')"><i class="bi bi-trash"></i></button>
                  </div>
                </div>
                <div class="mb-3">
                  <div class="d-flex justify-content-between mb-1">
                    <small style="color: var(--color-text-secondary);">Progress</small>
                    <small style="color: var(--color-text-secondary);">${Math.round(info.percentPaid)}%</small>
                  </div>
                  <div class="progress" style="height: 12px; border-radius: var(--radius-full);">
                    <div class="progress-bar" role="progressbar"
                         style="width: ${info.percentPaid}%; background-color: ${progressColor};"
                         aria-valuenow="${info.percentPaid}" aria-valuemin="0" aria-valuemax="100">
                    </div>
                  </div>
                </div>${breakdownHtml}
                <div class="row g-2 text-center">
                  <div class="${totalInterestHtml ? 'col-3' : 'col-4'}">
                    <small class="d-block" style="color: var(--color-text-tertiary);">Monthly</small>
                    <strong style="color: var(--color-primary);">${formatCurrency(b.amount)}</strong>
                  </div>
                  <div class="${totalInterestHtml ? 'col-3' : 'col-4'}">
                    <small class="d-block" style="color: var(--color-text-tertiary);">Remaining</small>
                    <strong style="color: var(--color-text-primary);">${formatCurrency(info.remainingBalance)}</strong>
                  </div>
                  <div class="${totalInterestHtml ? 'col-2' : 'col-4'}">
                    <small class="d-block" style="color: var(--color-text-tertiary);">Payoff</small>
                    <strong style="color: var(--color-text-primary);">${payoffStr}</strong>
                  </div>${totalInterestHtml}
                </div>
                <div class="mt-2 text-center">
                  <small style="color: var(--color-text-tertiary);">${info.paymentsMade} of ${info.totalPayments} payments made</small>
                  ${scheduleBtn}
                </div>
              </div>
            </div>
          </div>`;
        }).join('')
      : '<div class="col-12"><p class="text-muted fst-italic">No active financing items.</p></div>';
  }

  // Render completed/paid-off section
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
                    ✅ ${escapeHtml(b.name)}
                  </h5>
                  <span class="badge bg-success">Paid Off</span>
                </div>
                <div class="text-end">
                  <button class="btn btn-sm btn-outline-primary" onclick="openBillModal('${b.id}')"><i class="bi bi-pencil"></i></button>
                  <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteBill('${b.id}', '${escapeHtml(b.name)}')"><i class="bi bi-trash"></i></button>
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
                  <strong style="color: var(--color-success);">${info.paymentsMade} payments</strong>
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

  // Update summary cards
  const totalBills = allBills.reduce((sum, b) => sum + getRaw(b.amount), 0);
  if (document.getElementById('billsTotal')) document.getElementById('billsTotal').textContent = formatCurrency(totalBills);
  if (document.getElementById('billsRecurringCount')) document.getElementById('billsRecurringCount').textContent = recurringBills.length;
  if (document.getElementById('billsFinancingCount')) document.getElementById('billsFinancingCount').textContent = activeFinancing.length;
  if (document.getElementById('billsPaidOffCount')) document.getElementById('billsPaidOffCount').textContent = completedFinancing.length;
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
    if (balanceDisplay) balanceDisplay.textContent = '—';
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
  if (balanceReset) balanceReset.textContent = '—';

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
            // Loan term — show in years if divisible by 12, otherwise months
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
            if (balanceDisplay && balanceDisplay.textContent === '—') {
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
  // Attempt save — if new columns don't exist yet, retry without them
  let { error } = editBillId ? await sb.from('bills').update(record).eq('id', editBillId).eq('user_id', currentUser.id) : await sb.from('bills').insert(record);
  if (error && error.message && error.message.includes('column')) {
    // Columns don't exist yet in DB — strip new fields and retry
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
  await fetchAllDataFromSupabase();
  renderAll();
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
      return `<tr class="${rowClass}" style="${rowStyle}">
        <td>${isCurrent ? '<i class="bi bi-arrow-right-circle-fill me-1" style="color: var(--color-primary);"></i>' : ''}${row.payment}</td>
        <td>${formatCurrency(row.paymentAmount)}</td>
        <td>${formatCurrency(row.principal)}</td>
        <td>${formatCurrency(row.interest)}</td>
        <td>${formatCurrency(row.balance)}</td>
      </tr>`;
    }).join('');
  }

  // Update modal title
  const title = document.getElementById('amortizationModalLabel');
  if (title) title.textContent = `Amortization Schedule — ${bill.name}`;

  bootstrap.Modal.getOrCreateInstance(document.getElementById('amortizationModal')).show();
}

function confirmDeleteBill(id, name) {
  deleteBillId = id;
  // BUG-04 FIX: Accept name as parameter instead of looking up by ID (prevents "undefined" for new items)
  document.getElementById('deleteBillName').textContent = `"${name}"`;
  bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmDeleteBillModal')).show();
}
async function deleteBillConfirmed() {
  const { error } = await sb.from('bills').delete().eq('id', deleteBillId).eq('user_id', currentUser.id);
  if (error) return alert(error.message);
  bootstrap.Modal.getInstance(document.getElementById('confirmDeleteBillModal')).hide();
  await fetchAllDataFromSupabase();
  renderAll();
}

// --- INCOME ---
function renderIncome() {
  const tbody = document.getElementById('incomeTableBody');
  if (!tbody) return;
  tbody.innerHTML = (window.income || []).map(i => `
      <tr>
          <td>${escapeHtml(i.name)}</td><td>${escapeHtml(i.type)}</td><td>${formatCurrency(i.amount)}</td>
          <td>${escapeHtml(i.frequency)}</td><td>${i.nextDueDate ? formatDate(i.nextDueDate) : '-'}</td>
          <td>
              <button class="btn btn-sm btn-outline-primary" onclick="openIncomeModal('${i.id}')"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteIncome('${i.id}')"><i class="bi bi-trash"></i></button>
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
          f.incomeName.value = escapeHtml(i.name || ''); f.incomeType.value = escapeHtml(i.type || ''); f.incomeAmount.value = i.amount;
          f.incomeFrequency.value = i.frequency; f.incomeNextDueDate.value = i.nextDueDate;
      }
  }
  bootstrap.Modal.getOrCreateInstance(f.closest('.modal')).show();
}
async function saveIncome() {
  const f = document.getElementById('incomeForm');
  const record = {
      name: f.incomeName.value, type: f.incomeType.value, amount: getRaw(f.incomeAmount.value),
      frequency: f.incomeFrequency.value, nextDueDate: f.incomeNextDueDate.value || null, user_id: currentUser.id
  };
  const { error } = editIncomeId ? await sb.from('income').update(record).eq('id', editIncomeId).eq('user_id', currentUser.id) : await sb.from('income').insert(record);
  if (error) return alert(error.message);
  bootstrap.Modal.getInstance(f.closest('.modal')).hide();
  await fetchAllDataFromSupabase();
  renderAll();
}
function confirmDeleteIncome(id, name) {
  deleteIncomeId = id;
  // BUG-04 FIX: Accept name as parameter instead of looking up by ID (prevents "undefined" for new items)
  document.getElementById('deleteIncomeName').textContent = `"${name}"`;
  bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmDeleteIncomeModal')).show();
}
async function deleteIncomeConfirmed() {
  const { error } = await sb.from('income').delete().eq('id', deleteIncomeId).eq('user_id', currentUser.id);
  if (error) return alert(error.message);
  bootstrap.Modal.getInstance(document.getElementById('confirmDeleteIncomeModal')).hide();
  await fetchAllDataFromSupabase();
  renderAll();
}


// ===== DASHBOARD & CHARTING =====

// This new function renders the Emergency Fund chart OR the custom message
function renderEmergencyFundChart() {
  const wrapper = document.getElementById('emergencyFundChartWrapper');
  if (!wrapper) return;

  // Clear any previous chart or message
  if (emergencyFundChart) emergencyFundChart.destroy();
  wrapper.innerHTML = '';

  const emergencyGoal = window.settings?.emergency_fund_goal || 0;
  const emergencyFundAsset = (window.investments || []).find(a => a.name.toLowerCase().includes('emergency fund'));
  const emergencyCurrent = emergencyFundAsset?.value || 0;

  if (emergencyGoal > 0) {
      // If a goal is set, render the chart
      const canvas = document.createElement('canvas');
      wrapper.appendChild(canvas);
      const theme = getThemeColors();

      emergencyFundChart = safeCreateChart(canvas, {
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
      await fetchAllDataFromSupabase();
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
      const amount = parseFloat(item.amount || 0);
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
      document.getElementById('budgetAssignmentTable').innerHTML = `<tr><td colspan="7" class="text-center text-danger">Could not load bill and debt data. Please try refreshing the page.</td></tr>`;
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
      incomeWarning.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-2"></i>⚠️ No income sources found for this month. <a href="income.html" class="alert-link">Add income on the Income page</a> to track your budget accurately.';
      tableCard.parentNode.insertBefore(incomeWarning, tableCard);
    }
  } else if (incomeWarning) {
    incomeWarning.remove();
  }

  const tbody = document.getElementById('budgetAssignmentTable');
  tbody.innerHTML = '';

  // Filter out paid-off financing items from the budget display
  const budgetItems = [...(window.bills || []), ...(window.debts || [])].filter(item => {
      if (!item) return false;
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
          <td>${escapeHtml(item.type || 'N/A')}</td><td>${escapeHtml(item.name || 'Unnamed')}</td><td>${formatCurrency(needed)}</td>
          <td><div class="input-group input-group-sm"><span class="input-group-text">$</span><input type="number" class="form-control assigned-input" value="${assigned.toFixed(2)}" data-item-id="${item.id}" step="0.01"></div></td>
          <td class="${remainingTextColor} fw-bold">${formatCurrency(remaining)}</td>
          <td><div class="progress" style="height: 20px;"><div class="progress-bar ${progressBarClass}" style="width: ${Math.min(fundingPercent, 100)}%">${Math.round(fundingPercent)}%</div></div></td>
          <td><button class="btn btn-sm btn-outline-danger" onclick="deleteBudgetItem('${item.id}', '${monthString}')" title="Remove from budget"><i class="bi bi-trash"></i></button></td>
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
          <td>${escapeHtml(rec.category || 'Custom')}</td><td>${escapeHtml(rec.name || 'Unnamed')}</td><td>${formatCurrency(needed)}</td>
          <td><div class="input-group input-group-sm"><span class="input-group-text">$</span><input type="number" class="form-control assigned-input" value="${assigned.toFixed(2)}" data-item-id="${rec.item_id}" data-item-type="custom" step="0.01"></div></td>
          <td class="${remainingTextColor} fw-bold">${formatCurrency(remaining)}</td>
          <td><div class="progress" style="height: 20px;"><div class="progress-bar ${progressBarClass}" style="width: ${Math.min(fundingPercent, 100)}%">${Math.round(fundingPercent)}%</div></div></td>
          <td><button class="btn btn-sm btn-outline-danger" onclick="deleteBudgetItem('${rec.item_id}', '${monthString}')" title="Remove from budget"><i class="bi bi-trash"></i></button></td>
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
          <td>${escapeHtml(rec.category || 'N/A')}</td>
          <td><s>${escapeHtml(rec.name || 'Unnamed')}</s></td>
          <td class="text-muted">${formatCurrency(needed)}</td>
          <td class="text-muted">—</td>
          <td class="text-muted">—</td>
          <td class="text-muted small">Removed</td>
          <td><button class="btn btn-sm btn-outline-success" onclick="restoreBudgetItem('${rec.item_id}', '${monthString}')" title="Restore to budget"><i class="bi bi-arrow-counterclockwise"></i></button></td>
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

  await fetchAllDataFromSupabase();
  renderAll();
}

// This function saves a manually-added budget item to Supabase
async function saveBudgetItem() {
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
    await fetchAllDataFromSupabase();
    // 2. Re-render the entire UI with the fresh data.
    renderAll();
  }
}

// Delete (suppress) a budget item for a specific month
// Bill/debt items are suppressed so "Generate Budget" won't re-add them.
// Custom items are fully deleted since they have no external source.
async function deleteBudgetItem(itemId, monthString) {
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
  await fetchAllDataFromSupabase();
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

  await fetchAllDataFromSupabase();
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
    // 1. Fetch all active recurring bills
    const { data: activeBills, error: billsError } = await sb
      .from('bills')
      .select('*')
      .eq('user_id', currentUser.id);

    if (billsError) throw billsError;

    // 2. Fetch existing budget entries for this month
    const { data: existingBudgets, error: budgetError } = await sb
      .from('budgets')
      .select('*')
      .eq('user_id', currentUser.id)
      .eq('month', monthString);

    if (budgetError) throw budgetError;

    // Build a set of already-budgeted item IDs (including suppressed ones — don't re-add them)
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
      statusEl.textContent = `✅ Generated ${newEntries.length} budget entries!`;
      statusEl.className = 'ms-2 text-success small';
    }
    setTimeout(() => { if (statusEl) statusEl.textContent = ''; }, 3000);

    // 6. Refresh the budget view
    await fetchAllDataFromSupabase();
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


async function updateDashboardCards() {
  if (!currentUser) return;
  const totalInv = (window.investments || []).reduce((s, i) => s + getRaw(i.value), 0);
  const totalDebt = (window.debts || []).reduce((s, d) => s + getRaw(d.amount), 0);
  const totalAssetEquity = (window.assets || []).reduce((s, a) => s + Math.max(0, getRaw(a.value) - getRaw(a.loan)), 0);
  const netWorth = totalInv + totalAssetEquity - totalDebt;
  [['totalInvestments', totalInv], ['totalDebts', totalDebt], ['totalAssets', totalAssetEquity], ['netWorth', netWorth]].forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = formatCurrency(val);
  });
  const today = new Date().toISOString().split('T')[0];
  const { error } = await sb.from('snapshots').upsert({ date: today, netWorth, user_id: currentUser.id }, { onConflict: 'date,user_id' });
  if (error) console.error("Error saving snapshot:", error);
}
function renderUpcomingPayments() {
  const c = document.getElementById('upcomingPaymentsList');
  if (!c) return;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcoming = [...(window.debts || []).map(d => ({ ...d, amount: d.monthlyPayment, category: 'Debt' })), ...(window.bills || [])].filter(item => {
      if (!item.nextDueDate) return false;
      const d = new Date(item.nextDueDate + 'T00:00:00');
      return d >= today && d <= nextWeek;
  }).sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate));
  c.innerHTML = upcoming.length ? upcoming.map(item => `<div class="d-flex justify-content-between border-bottom py-2"><div><strong>${escapeHtml(item.name)}</strong><span class="badge ${getCategoryBadgeClass(item.type)} rounded-pill ms-2">${escapeHtml(item.type || item.category || 'Bill')}</span></div><div class="text-end"><div class="text-danger fw-bold">-${formatCurrency(item.amount)}</div><small class="text-muted">${formatDate(item.nextDueDate)}</small></div></div>`).join('') : '<p class="text-muted fst-italic">No upcoming payments this week.</p>';
}
function renderNetWorthChart() {
  const ctx = document.getElementById('netWorthTimelineChart');
  if (!ctx) return;
  if (netWorthChart) netWorthChart.destroy();
  const snaps = dedupeSnapshotsByDate(window.snapshots || []);
  const theme = getThemeColors();
  netWorthChart = safeCreateChart(ctx, { type: 'line', data: { labels: snaps.map(s => s.date), datasets: [{ label: 'Net Worth', data: snaps.map(s => getRaw(s.netWorth)), borderColor: '#f44e24', backgroundColor: theme.fill, tension: 0.3, fill: true }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { ticks: { callback: v => formatCurrency(v), color: theme.text }, grid: { color: theme.grid } }, x: { ticks: { color: theme.text }, grid: { display: false } } }, plugins: { legend: { display: false } } } }, 'Net Worth Timeline');
}
function generateMonthlyCashFlowChart() {
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
      const activeBillsForCashFlow = (window.bills || []).filter(b => {
          const dbStatus = (b.status || '').toLowerCase();
          if (dbStatus === 'paid_off' || dbStatus === 'cancelled') return false;
          const info = getBillFinancingInfo(b);
          if (info.isFinancing && info.status === 'paid_off') return false;
          return true;
      });
      [...(window.income || []), ...activeBillsForCashFlow, ...(window.debts || []).map(d => ({ ...d, amount: d.monthlyPayment, frequency: 'monthly' }))].forEach(item => {
          if (!item.nextDueDate || !item.frequency) return;
          const isIncome = (typeof item.type === 'string' && (item.type.toLowerCase() === 'w2' || item.type.toLowerCase() === '1099'));
          const amount = getRaw(item.amount);
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
  cashFlowChart = safeCreateChart(ctx, { type: 'bar', data: { labels: months, datasets: [{ label: 'Income', data: incomeTotals, backgroundColor: '#81b900' }, { label: 'Expenses', data: expenseTotals, backgroundColor: '#e53935' }] }, options: { responsive: true, maintainAspectRatio: false, scales: { x: { stacked: true, ticks: { color: theme.text }, grid: { display: false } }, y: { stacked: true, ticks: { color: theme.text }, grid: { color: theme.grid } } }, plugins: { legend: { labels: { color: theme.text } } } } }, 'Cash Flow');
}

// ===== INITIALIZATION =====
function setupThemeToggle() {
  const themeSwitch = document.getElementById('themeSwitch');
  if (!themeSwitch) return; // Exit if the toggle isn't on this page

  const themeLabel = document.querySelector('label[for="themeSwitch"]');

  // This function applies the selected theme to the page
  const applyTheme = (isDark) => {
      document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
      themeSwitch.checked = isDark;
      if (themeLabel) {
          themeLabel.textContent = isDark ? 'â˜€ï¸ Light Mode' : 'ðŸŒ™ Dark Mode';
      }
  };

  // Listen for when the user clicks the toggle
  themeSwitch.addEventListener('change', () => {
      const isDark = themeSwitch.checked;
      // Save the user's preference in their browser
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      applyTheme(isDark);
      // Re-render all components so the charts can adopt the new colors
      if (typeof renderAll === 'function') {
          renderAll();
      }
  });

  // On page load, apply the theme that was saved in localStorage
  applyTheme(localStorage.getItem('theme') !== 'light');
}
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

  // Auth state change listener
  sb.auth.onAuthStateChange((event, session) => {
    debugLog(`AUTH: Event received: ${event}`);
    currentUser = session?.user || null;

    // Handle password recovery event â€" show reset password modal
    if (event === 'PASSWORD_RECOVERY') {
      const resetModal = document.getElementById('resetPasswordModal');
      if (resetModal) {
        bootstrap.Modal.getOrCreateInstance(resetModal).show();
      }
    }

    // Update UI based on auth state
    document.getElementById('loggedInState')?.classList.toggle('d-none', !currentUser);
    document.getElementById('loggedOutState')?.classList.toggle('d-none', !!currentUser);
    if (document.getElementById('dataContainer')) {
      document.getElementById('dataContainer').style.visibility = currentUser ? 'visible' : 'hidden';
    }

    if (currentUser) {
      document.getElementById('username').textContent = currentUser.user_metadata?.first_name || currentUser.email;

      // Ensure user profile exists for social features
      ensureUserProfile();

      fetchAllDataFromSupabase().then(() => {
        renderAll();
        renderAdditionalCharts();
        // Initialize social features
        initNotifications();
        loadSharedBillsData();
        loadFriendsPage();
      });

    } else {
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
  };

  const closeSidebar = () => {
    sidebar.classList.remove('show');
    if (overlay) overlay.classList.remove('show');
    toggle.innerHTML = '<i class="bi bi-list"></i>';
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
      <a class="dropdown-item py-2 px-3 ${isUnread ? '' : 'opacity-75'}" href="#" onclick="handleNotificationClick('${notif.id}', '${notif.type}', ${escapeHtml(JSON.stringify(notif.data || {}))})">
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
    if (container) container.innerHTML = '';
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
    container.innerHTML = '<p class="text-muted mt-2">No users found matching your search.</p>';
    return;
  }
  
  container.innerHTML = filtered.map(p => `
    <div class="card mb-2">
      <div class="card-body p-3 d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-3">
          <div class="rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; background: var(--color-bg-3); border: 1px solid var(--color-border-subtle);">
            ${p.avatar_url ? `<img src="${escapeHtml(p.avatar_url)}" class="rounded-circle" width="40" height="40">` : `<i class="bi bi-person" style="font-size: 1.2rem;"></i>`}
          </div>
          <div>
            <strong style="color: var(--color-text-primary);">${escapeHtml(p.display_name || 'Unknown')}</strong>
            ${p.username ? `<div style="font-size: 0.8rem; color: var(--color-text-tertiary);">@${escapeHtml(p.username)}</div>` : ''}
          </div>
        </div>
        <button class="btn btn-sm btn-primary" onclick="sendFriendRequest('${p.id}')">
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
  
  // Load pending requests (incoming)
  const { data: pendingIncoming } = await sb
    .from('connections')
    .select('id, created_at, requester_id, requester:user_profiles!connections_requester_id_user_profiles_fkey(id, username, display_name, avatar_url)')
    .eq('addressee_id', currentUser.id)
    .eq('status', 'pending');
  
  const pendingContainer = document.getElementById('pendingRequestsContainer');
  const pendingSection = document.getElementById('pendingRequestsSection');
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
                <button class="btn btn-sm btn-success" onclick="acceptFriendRequest('${req.id}')"><i class="bi bi-check-lg"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick="declineFriendRequest('${req.id}')"><i class="bi bi-x-lg"></i></button>
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
  
  const friendsContainer = document.getElementById('myFriendsContainer');
  if (friendsContainer) {
    const friends = (myConnections || []).map(conn => ({
      connectionId: conn.id,
      friend: conn.requester?.id === currentUser.id ? conn.addressee : conn.requester,
      since: conn.created_at
    }));
    
    if (friends.length > 0) {
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
              <button class="btn btn-sm btn-outline-danger" onclick="removeFriend('${f.connectionId}', '${escapeHtml(f.friend?.display_name || 'this friend')}')">
                <i class="bi bi-person-dash"></i>
              </button>
            </div>
          </div>
        </div>
      `).join('');
    } else {
      friendsContainer.innerHTML = '<div class="col-12"><p class="text-muted fst-italic">No friends yet. Search for people to connect with!</p></div>';
    }
  }
  
  // Load outgoing requests
  const { data: outgoing } = await sb
    .from('connections')
    .select('id, created_at, addressee:user_profiles!connections_addressee_id_user_profiles_fkey(id, username, display_name, avatar_url)')
    .eq('requester_id', currentUser.id)
    .eq('status', 'pending');
  
  const outgoingContainer = document.getElementById('outgoingRequestsContainer');
  const outgoingSection = document.getElementById('outgoingRequestsSection');
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
              <button class="btn btn-sm btn-outline-secondary" onclick="cancelFriendRequest('${req.id}')">
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
  
  // Load outgoing shares (bills I'm sharing with others) — with bill + friend details
  const { data: myOutgoingShares } = await sb
    .from('bill_shares')
    .select('*, bill:bills!bill_shares_bill_id_fkey(*), shared_user:user_profiles!bill_shares_shared_with_id_user_profiles_fkey(id, username, display_name)')
    .eq('owner_id', currentUser.id);

  renderSharedWithMe(sharedWithMeCache);
  renderPendingShares(pendingShares || []);
  renderMySharedBills(myOutgoingShares || []);
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
    const splitLabel = share.split_type === 'equal' ? '50/50' : share.split_type === 'percentage' ? `${share.shared_percent}%` : formatCurrency(share.shared_fixed);
    return `
      <tr>
        <td>${escapeHtml(share.bill?.name || 'Unknown')}</td>
        <td>
          <span style="color: var(--color-text-secondary);">${escapeHtml(share.owner?.display_name || 'Unknown')}</span>
          ${share.owner?.username ? `<small class="d-block" style="color: var(--color-text-tertiary);">@${escapeHtml(share.owner.username)}</small>` : ''}
        </td>
        <td><strong style="color: var(--color-primary);">${formatCurrency(share.shared_amount)}</strong></td>
        <td style="color: var(--color-text-tertiary);">${formatCurrency(share.bill?.amount)}</td>
        <td><span class="badge bg-info">${splitLabel}</span></td>
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
    const splitLabel = share.split_type === 'equal' ? '50/50' : share.split_type === 'percentage' ? `${share.owner_percent}/${share.shared_percent}` : 'Fixed';
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
              <span class="badge bg-info">${splitLabel}</span>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-success btn-sm flex-grow-1" onclick="acceptBillShare('${share.id}')">
                <i class="bi bi-check-lg me-1"></i>Accept
              </button>
              <button class="btn btn-outline-danger btn-sm flex-grow-1" onclick="declineBillShare('${share.id}')">
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
    const splitLabel = share.split_type === 'equal' ? '50/50' : share.split_type === 'percentage' ? `${share.shared_percent}%` : formatCurrency(share.shared_fixed);
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
        <td><span class="badge bg-info">${splitLabel}</span></td>
        <td><span class="badge bg-${statusColor}">${statusLabel}</span></td>
        <td>
          <button class="btn btn-outline-danger btn-sm" onclick="revokeShareBill('${share.id}')" title="Revoke share">
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
  friendSelect.innerHTML = '<option value="">Select a friend...</option>';
  
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
  await sb.from('bill_shares').update({
    status: 'accepted',
    accepted_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }).eq('id', shareId).eq('shared_with_id', currentUser.id);
  await loadSharedBillsData();
}

async function declineBillShare(shareId) {
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
