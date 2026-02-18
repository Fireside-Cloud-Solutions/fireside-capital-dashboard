/**
 * budget-actuals.js — FC-181: Budget vs Actuals Engine
 *
 * Calculates monthly spending variance per category:
 *   Budget  = user-defined monthly limit per category (settings.category_budgets JSON)
 *   Actual  = SUM(transactions.amount) WHERE category = X AND month = YYYY-MM
 *   Variance = Actual − Budget  (positive = overspent 🔴, negative = under ✅)
 *
 * "3 Amber Rule" (F9 Finance best practice):
 *   - Under 85% of budget  → status: 'under'   (green)
 *   - 85–100% of budget    → status: 'warning' (amber — course-correct now)
 *   - Over 100% of budget  → status: 'over'    (red)
 *   - No budget set        → status: 'unbudgeted'
 *
 * Depends on: data-layer.js (DataLayer — routes demo/live automatically), demo-data.js (isDemoMode)
 */

// ─── Constants ────────────────────────────────────────────────────────────────

const BVA_CATEGORIES = [
  'dining', 'groceries', 'transportation', 'utilities',
  'entertainment', 'shopping', 'healthcare', 'travel', 'other'
];

const BVA_CATEGORY_ICONS = {
  dining:         'bi-cup-hot',
  groceries:      'bi-cart3',
  transportation: 'bi-car-front',
  utilities:      'bi-lightning-charge',
  entertainment:  'bi-controller',
  shopping:       'bi-bag',
  healthcare:     'bi-heart-pulse',
  travel:         'bi-airplane',
  other:          'bi-three-dots'
};

// ─── Core Engine ──────────────────────────────────────────────────────────────

/**
 * Calculate budget vs actuals for a given month.
 * @param {string|null} month  - 'YYYY-MM' format, defaults to current month
 * @returns {Promise<BVAResult|null>}
 */
async function calculateBudgetVsActuals(month = null) {
  const targetMonth = month || bvaGetCurrentMonth();

  let budgets = {};
  let transactions = [];

  // ── Route through DataLayer (handles demo/live automatically) ────────────
  if (typeof DataLayer === 'undefined') return null;

  const settingsResult = await DataLayer.getSettings();
  budgets = settingsResult.data?.category_budgets || {};

  const startDate = `${targetMonth}-01`;
  const endDate = bvaGetLastDayOfMonth(targetMonth);

  const txnResult = await DataLayer.getTransactions({ startDate, endDate });
  // Exclude income-category entries (same rule as before)
  transactions = (txnResult.data || []).filter(t => t.category !== 'income');

  // ── Sum actuals by category ───────────────────────────────────────────────
  const actuals = {};
  transactions.forEach(t => {
    const cat = t.category || 'other';
    actuals[cat] = (actuals[cat] || 0) + Math.abs(parseFloat(t.amount) || 0);
  });

  // ── Build per-category results ────────────────────────────────────────────
  const categories = BVA_CATEGORIES.map(cat => {
    const budget = parseFloat(budgets[cat]) || 0;
    const actual = parseFloat((actuals[cat] || 0).toFixed(2));
    const variance = parseFloat((actual - budget).toFixed(2));
    const variancePct = budget > 0
      ? parseFloat((((actual / budget) - 1) * 100).toFixed(1))
      : null;

    let status;
    if (budget === 0) {
      status = 'unbudgeted';
    } else if (actual > budget) {
      status = 'over';
    } else if (actual > budget * 0.85) {
      status = 'warning';  // "3 Amber Rule" — within 15% of limit
    } else {
      status = 'under';
    }

    const progressPct = budget > 0
      ? Math.min(parseFloat(((actual / budget) * 100).toFixed(1)), 150)
      : null;

    return { category: cat, budget, actual, variance, variancePct, status, progressPct };
  });

  // ── Totals ────────────────────────────────────────────────────────────────
  const totalBudget = parseFloat(categories.reduce((s, r) => s + r.budget, 0).toFixed(2));
  const totalActual = parseFloat(categories.reduce((s, r) => s + r.actual, 0).toFixed(2));
  const totalVariance = parseFloat((totalActual - totalBudget).toFixed(2));
  const totalVariancePct = totalBudget > 0
    ? parseFloat((((totalActual / totalBudget) - 1) * 100).toFixed(1))
    : null;

  return {
    month: targetMonth,
    categories,
    totals: {
      budget: totalBudget,
      actual: totalActual,
      variance: totalVariance,
      variancePct: totalVariancePct,
      status: totalVariance > 0 ? 'over' : totalVariance > -(totalBudget * 0.15) ? 'warning' : 'under'
    }
  };
}

// ─── UI Renderer ─────────────────────────────────────────────────────────────

/**
 * Renders a full Budget vs Actuals card into a container element.
 * @param {string} containerId  - ID of the container element
 * @param {string|null} month   - 'YYYY-MM' or null for current month
 */
async function renderBudgetVsActuals(containerId, month = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Show loading state
  container.innerHTML = `
    <div class="d-flex align-items-center justify-content-center py-4">
      <div class="spinner-border spinner-border-sm text-primary me-2" role="status" aria-hidden="true"></div>
      <span class="text-muted">Loading budget data...</span>
    </div>`;

  const result = await calculateBudgetVsActuals(month);

  if (!result) {
    container.innerHTML = `
      <div class="empty-state py-4">
        <i class="bi bi-calculator empty-state-icon"></i>
        <h5>No budget data</h5>
        <p class="text-muted">Set category budgets in Settings to track your spending.</p>
        <a href="settings.html" class="btn btn-primary">Set Up Budgets</a>
      </div>`;
    return;
  }

  const { month: targetMonth, categories, totals } = result;
  const monthLabel = bvaFormatMonthLabel(targetMonth);

  // ── Summary row ────────────────────────────────────────────────────────────
  const totalStatusColor = totals.status === 'over' ? 'danger'
    : totals.status === 'warning' ? 'warning' : 'success';
  const totalVarianceLabel = totals.variance > 0
    ? `<span class="text-danger">+${bvaFormatCurrency(totals.variance)} over</span>`
    : `<span class="text-success">${bvaFormatCurrency(Math.abs(totals.variance))} under</span>`;

  // Filter to only categories with budget set OR spending > 0
  const activeCategories = categories.filter(c => c.budget > 0 || c.actual > 0);

  const categoryRows = activeCategories.length > 0
    ? activeCategories.map(renderBVACategoryRow).join('')
    : `<p class="text-muted small text-center py-3">No category budgets set yet.
         <a href="settings.html">Add budgets in Settings →</a></p>`;

  container.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <span class="text-muted small">${monthLabel}</span>
      <a href="settings.html" class="text-muted small">Edit Budgets →</a>
    </div>
    <div class="row mb-4 text-center">
      <div class="col-4">
        <div class="fs-4 fw-bold">${bvaFormatCurrency(totals.budget)}</div>
        <div class="text-muted small">Total Budget</div>
      </div>
      <div class="col-4">
        <div class="fs-4 fw-bold text-${totalStatusColor}">${bvaFormatCurrency(totals.actual)}</div>
        <div class="text-muted small">Actual Spend</div>
      </div>
      <div class="col-4">
        <div class="fs-4 fw-bold text-${totalStatusColor}">
          ${totals.variancePct !== null ? Math.abs(totals.variancePct).toFixed(1) + '%' : '—'}
        </div>
        <div class="text-muted small">${totalVarianceLabel}</div>
      </div>
    </div>
    <div id="bvaCategoryBreakdown">
      ${categoryRows}
    </div>
    <div class="text-end mt-2">
      <a href="transactions.html" class="text-muted small">View all transactions →</a>
    </div>`;
}

/**
 * Renders a single category row with progress bar.
 * @param {Object} item - Category result object
 * @returns {string} HTML string
 */
function renderBVACategoryRow(item) {
  const { category, budget, actual, variance, status, progressPct } = item;
  const icon = BVA_CATEGORY_ICONS[category] || 'bi-tag';
  const barColor = status === 'over' ? 'danger'
    : status === 'warning' ? 'warning'
    : status === 'unbudgeted' ? 'secondary'
    : 'success';

  const varLabel = budget > 0
    ? (variance > 0
        ? `<small class="text-danger ms-1">+${bvaFormatCurrency(variance)}</small>`
        : `<small class="text-success ms-1">-${bvaFormatCurrency(Math.abs(variance))}</small>`)
    : '<small class="text-muted ms-1">no budget</small>';

  const progressWidth = progressPct !== null ? progressPct : 0;

  return `
    <div class="mb-3">
      <div class="d-flex justify-content-between align-items-center mb-1">
        <span class="d-flex align-items-center gap-2">
          <i class="bi ${icon} text-muted"></i>
          <span class="text-capitalize fw-medium">${category}</span>
        </span>
        <span class="text-end">
          <small>${bvaFormatCurrency(actual)}</small>
          <small class="text-muted"> / ${budget > 0 ? bvaFormatCurrency(budget) : 'unset'}</small>
          ${varLabel}
        </span>
      </div>
      <div class="progress progress-thin" role="progressbar"
           aria-valuenow="${progressWidth}" aria-valuemin="0" aria-valuemax="150">
        <div class="progress-bar bg-${barColor}" style="width: ${Math.min(progressWidth, 100)}%"></div>
      </div>
    </div>`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function bvaGetCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function bvaGetLastDayOfMonth(yearMonth) {
  const [year, month] = yearMonth.split('-').map(Number);
  return new Date(year, month, 0).toISOString().split('T')[0];
}

function bvaFormatCurrency(amount) {
  if (typeof formatCurrency === 'function') return formatCurrency(amount);
  return '$' + parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function bvaFormatMonthLabel(yearMonth) {
  const [year, month] = yearMonth.split('-').map(Number);
  const d = new Date(year, month - 1, 1);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Get a simple summary of current month budget status.
 * Returns null if no budgets set. Useful for dashboard alert cards.
 * @returns {Promise<{overCount: number, warningCount: number, totalVariance: number}|null>}
 */
async function getBudgetAlertSummary() {
  const result = await calculateBudgetVsActuals();
  if (!result) return null;

  const overCount = result.categories.filter(c => c.status === 'over').length;
  const warningCount = result.categories.filter(c => c.status === 'warning').length;
  const budgetedCategories = result.categories.filter(c => c.budget > 0).length;

  return {
    overCount,
    warningCount,
    budgetedCategories,
    totalVariance: result.totals.variance,
    totalVariancePct: result.totals.variancePct,
    overallStatus: result.totals.status,
    month: result.month
  };
}
