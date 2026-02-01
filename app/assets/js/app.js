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
      // Auto-confirmed â€” session exists
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
  // Use 'totalInvestments' as the check â€” it only exists on the dashboard, not reports.html
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
              <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteAsset('${a.id}')"><i class="bi bi-trash"></i></button>
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
          f.assetName.value = asset.name;
          f.assetType.value = asset.type;
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
  const { error } = editAssetId ? await sb.from('assets').update(record).eq('id', editAssetId) : await sb.from('assets').insert(record);
  if (error) return alert(error.message);
  bootstrap.Modal.getInstance(f.closest('.modal')).hide();
  await fetchAllDataFromSupabase();
  renderAll();
}
function confirmDeleteAsset(id) {
  deleteAssetId = id;
  document.getElementById('deleteAssetName').textContent = `"${window.assets.find(a=>a.id===id).name}"`;
  bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmDeleteAssetModal')).show();
}
async function deleteAssetConfirmed() {
  const { error } = await sb.from('assets').delete().eq('id', deleteAssetId);
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
              <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteInvestment('${inv.id}')"><i class="bi bi-trash"></i></button>
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
          f.investmentName.value = inv.name; f.investmentType.value = inv.type; f.investmentValue.value = inv.value;
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
  const { error } = editInvestmentId ? await sb.from('investments').update(record).eq('id', editInvestmentId) : await sb.from('investments').insert(record);

  editInvestmentId = null;
  if (error) return alert(error.message);

  bootstrap.Modal.getInstance(f.closest('.modal')).hide();
  await fetchAllDataFromSupabase();
  renderAll();
}
function confirmDeleteInvestment(id) {
  if (confirm(`Are you sure you want to delete "${window.investments.find(i=>i.id===id).name}"?`)) {
      deleteInvestmentConfirmed(id);
  }
}
async function deleteInvestmentConfirmed(id) {
  const { error } = await sb.from('investments').delete().eq('id', id);
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
              <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteDebt('${d.id}')"><i class="bi bi-trash"></i></button>
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
          f.debtName.value = d.name; f.debtType.value = d.type; f.debtAmount.value = d.amount;
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
  const { error } = editDebtId ? await sb.from('debts').update(record).eq('id', editDebtId) : await sb.from('debts').insert(record);
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
  const { error } = await sb.from('debts').delete().eq('id', deleteDebtId);
  if (error) return alert(error.message);
  bootstrap.Modal.getInstance(document.getElementById('confirmDeleteDebtModal')).hide();
  await fetchAllDataFromSupabase();
  renderAll();
}

// --- BILLS ---
function renderBills() {
  const tbody = document.getElementById('billTableBody');
  if (!tbody) return;
  tbody.innerHTML = (window.bills || []).map(b => `
      <tr>
          <td>${escapeHtml(b.name)}</td><td>${escapeHtml(b.type)}</td><td>${formatCurrency(b.amount)}</td>
          <td>${escapeHtml(b.frequency)}</td><td>${b.nextDueDate ? formatDate(b.nextDueDate) : '-'}</td>
          <td>
              <button class="btn btn-sm btn-outline-primary" onclick="openBillModal('${b.id}')"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteBill('${b.id}')"><i class="bi bi-trash"></i></button>
          </td>
      </tr>`).join('');
}
function openBillModal(id = null) {
  editBillId = id;
  const f = document.getElementById('billForm');
  f.reset();
  if (id) {
      const b = window.bills.find(x => x.id == id); // FIX: Changed === to ==
      if (b) {
          f.billName.value = b.name; f.billType.value = b.type; f.billAmount.value = b.amount;
          f.billFrequency.value = b.frequency; f.billNextDueDate.value = b.nextDueDate;
      }
  }
  bootstrap.Modal.getOrCreateInstance(f.closest('.modal')).show();
}
async function saveBill() {
  const f = document.getElementById('billForm');
  const record = {
      name: f.billName.value, type: f.billType.value, amount: getRaw(f.billAmount.value),
      frequency: f.billFrequency.value, nextDueDate: f.billNextDueDate.value || null, user_id: currentUser.id
  };
  const { error } = editBillId ? await sb.from('bills').update(record).eq('id', editBillId) : await sb.from('bills').insert(record);
  if (error) return alert(error.message);
  bootstrap.Modal.getInstance(f.closest('.modal')).hide();
  await fetchAllDataFromSupabase();
  renderAll();
}
function confirmDeleteBill(id) {
  deleteBillId = id;
  document.getElementById('deleteBillName').textContent = `"${window.bills.find(b=>b.id===id).name}"`;
  bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmDeleteBillModal')).show();
}
async function deleteBillConfirmed() {
  const { error } = await sb.from('bills').delete().eq('id', deleteBillId);
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
          f.incomeName.value = i.name; f.incomeType.value = i.type; f.incomeAmount.value = i.amount;
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
  const { error } = editIncomeId ? await sb.from('income').update(record).eq('id', editIncomeId) : await sb.from('income').insert(record);
  if (error) return alert(error.message);
  bootstrap.Modal.getInstance(f.closest('.modal')).hide();
  await fetchAllDataFromSupabase();
  renderAll();
}
function confirmDeleteIncome(id) {
  deleteIncomeId = id;
  document.getElementById('deleteIncomeName').textContent = `"${window.income.find(i=>i.id===id).name}"`;
  bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmDeleteIncomeModal')).show();
}
async function deleteIncomeConfirmed() {
  const { error } = await sb.from('income').delete().eq('id', deleteIncomeId);
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

    return monthIncome > 0 ? Math.round(((monthIncome - monthExpenses) / monthIncome) * 100) : 0;
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
  // It will wait up to 3 seconds before showing an error.
  const startTime = Date.now();
  while ((!window.bills || !window.debts) && Date.now() - startTime < 3000) {
      // Wait 50 milliseconds and check again
      await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  // If data is still not available after waiting, show a clear error message.
  if (!window.bills || !window.debts) {
      console.error("Budget page timeout: Data is not available after 3 seconds.");
      document.getElementById('budgetAssignmentTable').innerHTML = `<tr><td colspan="6" class="text-center text-danger">Could not load bill and debt data. Please try refreshing the page.</td></tr>`;
      return;
  }
  // --- END OF FIX #1 ---

  const monthString = `${currentBudgetMonth.getFullYear()}-${(currentBudgetMonth.getMonth() + 1).toString().padStart(2, '0')}`;
  if (document.getElementById('currentMonth')) {
      document.getElementById('currentMonth').textContent = currentBudgetMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  }

  let budgetAssignments = {};
  if (currentUser) {
      const { data: assignments, error } = await sb.from('budgets').select('*').eq('user_id', currentUser.id).eq('month', monthString);
      if (error) {
          console.error("Could not fetch saved budget assignments:", error.message);
      } else {
          (assignments || []).forEach(a => { budgetAssignments[a.item_id] = a.assigned_amount; });
      }
  }

  const totalIncome = (window.income || []).reduce((sum, i) => sum + getRaw(i.amount), 0);
  const totalAssigned = Object.values(budgetAssignments).reduce((sum, amount) => sum + getRaw(amount), 0);
  const remainingToBudget = totalIncome - totalAssigned;

  if(document.getElementById('expectedIncome')) document.getElementById('expectedIncome').textContent = formatCurrency(totalIncome);
  if(document.getElementById('assignedAmount')) document.getElementById('assignedAmount').textContent = formatCurrency(totalAssigned);
  if(document.getElementById('remainingToBudget')) document.getElementById('remainingToBudget').textContent = formatCurrency(remainingToBudget);

  const tbody = document.getElementById('budgetAssignmentTable');
  tbody.innerHTML = '';
  
  const budgetItems = [...(window.bills || []), ...(window.debts || [])].filter(Boolean);

  budgetItems.forEach(item => {
      if (!item.id) {
          debugLog("Skipping an invalid budget item without an ID:", item);
          return;
      }
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
      `;
      tbody.appendChild(row);
  });

  // --- NEW FIX #2: The corrected event listener ---
  document.querySelectorAll('.assigned-input').forEach(input => {
    input.addEventListener('change', async (e) => {
      const itemId = e.target.getAttribute('data-item-id');
      const assignedAmount = getRaw(e.target.value);
      if (!currentUser || !itemId) return;
    
      // ðŸ§  NEW: Derive item type
      const isBill = window.bills?.some(b => b.id === itemId);
      const itemType = isBill ? 'bill' : 'debt';
    
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

// This function saves a single assignment value to Supabase
async function saveBudgetItem() {
  if (!currentUser) return;
  const monthString = `${currentBudgetMonth.getFullYear()}-${(currentBudgetMonth.getMonth() + 1).toString().padStart(2, '0')}`;
  
  const record = {
    user_id: currentUser.id,
    month: monthString,
    name: document.getElementById('budgetItemName').value,
    category: document.getElementById('budgetItemCategory').value,
    needed_amount: getRaw(document.getElementById('budgetItemNeeded').value),
    assigned_amount: getRaw(document.getElementById('budgetItemNeeded').value)
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
  c.innerHTML = upcoming.length ? upcoming.map(item => `<div class="d-flex justify-content-between border-bottom py-2"><div><strong>${escapeHtml(item.name)}</strong><span class="badge bg-secondary-subtle text-secondary-emphasis rounded-pill ms-2">${escapeHtml(item.category || 'Bill')}</span></div><div class="text-end"><div class="text-danger fw-bold">-${formatCurrency(item.amount)}</div><small class="text-muted">${formatDate(item.nextDueDate)}</small></div></div>`).join('') : '<p class="text-muted fst-italic">No upcoming payments this week.</p>';
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
      [...(window.income || []), ...(window.bills || []), ...(window.debts || []).map(d => ({ ...d, amount: d.monthlyPayment, frequency: 'monthly' }))].forEach(item => {
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
  
    // Handle password recovery event â€” show reset password modal
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
  
      fetchAllDataFromSupabase().then(() => {
        renderAll();
        renderAdditionalCharts();
      });
  
    } else {
      renderAll(); // Render empty tables on logout
    }
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
