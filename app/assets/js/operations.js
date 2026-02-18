/**
 * operations.js — FC-173: Operations Dashboard
 *
 * Cash flow command center for Fireside Capital.
 * Sections:
 *   1. Safe to Spend KPI (#safeToSpend)
 *   2. Cash Flow Chart (#cashFlowCanvas)  [Chart.js line chart]
 *   3. Bills Aging Widget (#billsAging)   [3 expandable buckets]
 *   4. Budget vs Actuals (#bvaHorizontal) [delegates to budget-actuals.js]
 *   5. Upcoming 14-Day List (#upcomingTx)
 *
 * Depends on: app.js, demo-data.js, budget-actuals.js, realtime.js
 */

'use strict';

// ─── Module State ─────────────────────────────────────────────────────────────

const OPS_SAFETY_BUFFER = 500;
let opsCashFlowChart = null;
let opsCurrentDays = 30;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Format a number as currency, falling back to Intl if app.js formatCurrency is unavailable.
 */
function opsFormatCurrency(amount) {
  if (typeof formatCurrency === 'function') return formatCurrency(amount);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
}

/**
 * Safely escape HTML to prevent XSS.
 */
function opsEscape(str) {
  if (typeof escapeHtml === 'function') return escapeHtml(str);
  const d = document.createElement('div');
  d.textContent = String(str == null ? '' : str);
  return d.innerHTML;
}

/**
 * Get the day-of-month a bill is due.
 * Real data uses `due_date` (integer); DEMO_DATA uses `due_day`.
 */
function getBillDueDay(bill) {
  return parseInt(bill.due_date || bill.due_day || 1, 10);
}

/**
 * Normalize any income frequency to a monthly dollar amount.
 */
function normalizeIncomeToMonthly(income) {
  const amount = parseFloat(income.amount) || 0;
  switch ((income.frequency || '').toLowerCase()) {
    case 'weekly':    return (amount * 52) / 12;
    case 'bi-weekly': return (amount * 26) / 12;
    case 'monthly':   return amount;
    case 'annually':  return amount / 12;
    default:          return amount;
  }
}

/**
 * Return the active bills array — demo or live.
 */
function opsGetBills() {
  const demo = typeof isDemoMode === 'function' && isDemoMode();
  const bills = demo ? (DEMO_DATA.bills || []) : (window.bills || []);
  // Exclude already-paid one-time bills
  return bills.filter(b => b.status !== 'inactive' && !b.is_paid);
}

/**
 * Return the income array — demo or live.
 */
function opsGetIncome() {
  const demo = typeof isDemoMode === 'function' && isDemoMode();
  return demo ? (DEMO_DATA.income || []) : (window.income || []);
}

/**
 * How many days until a bill is due next.
 * Uses the due_date day-of-month, checks this month then next month.
 */
function daysUntilBillDue(bill) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDay = getBillDueDay(bill);
  const thisMonthDue = new Date(today.getFullYear(), today.getMonth(), dueDay);
  let daysUntil = Math.round((thisMonthDue - today) / 864e5);

  if (daysUntil < 0) {
    // Due date this month has already passed — look at next month
    const nextMonthDue = new Date(today.getFullYear(), today.getMonth() + 1, dueDay);
    daysUntil = Math.round((nextMonthDue - today) / 864e5);
  }
  return daysUntil;
}

// ─── Section 1: Safe to Spend ─────────────────────────────────────────────────

/**
 * Calculate the Safe to Spend amount.
 * Formula: Monthly Income − Bills due ≤7 days − Safety Buffer ($500)
 * @returns {{ safeAmount, balance, billsDue7d, billsDue7dTotal, bufferAmount, state }}
 */
async function calculateSafeToSpend() {
  const bills  = opsGetBills();
  const income = opsGetIncome();

  // Estimated available balance = sum of normalized monthly income
  const balance = income.reduce((sum, inc) => sum + normalizeIncomeToMonthly(inc), 0);

  // Bills due within 7 days
  const billsDue7d = bills.filter(b => {
    const d = daysUntilBillDue(b);
    return d >= 0 && d <= 7;
  });
  const billsDue7dTotal = billsDue7d.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);

  const safeAmount = balance - billsDue7dTotal - OPS_SAFETY_BUFFER;

  let state;
  if (safeAmount < 0)        state = 'danger';
  else if (safeAmount < 1000) state = 'warning';
  else                        state = 'positive';

  return { safeAmount, balance, billsDue7d, billsDue7dTotal, bufferAmount: OPS_SAFETY_BUFFER, state };
}

/**
 * Render the Safe to Spend KPI card into #safeToSpend.
 */
function renderSafeToSpend(data) {
  const el = document.getElementById('safeToSpend');
  if (!el) return;

  const { safeAmount, balance, billsDue7d, billsDue7dTotal, bufferAmount, state } = data;

  // Base card classes
  let cardClass = 'card h-100';
  let stateClass = '';
  let amountClass = 'display-6 fw-bold mb-2';
  let icon = '';
  let subtextMuted = 'text-muted';
  let hrClass = '';

  if (state === 'danger') {
    cardClass += ' bg-danger text-white';
    icon = '<i class="bi bi-exclamation-triangle me-2"></i>';
    subtextMuted = 'opacity-75';
    hrClass = 'border-white-50 opacity-25';
  } else if (state === 'warning') {
    stateClass = 'safe-to-spend-warning';
    amountClass += ' fw-bold';
    // Use amber/warning color inline
  } else {
    stateClass = 'safe-to-spend-positive';
    amountClass += ' text-success';
  }

  const amountStyle = state === 'warning' ? 'color:#f44e24' : '';

  const billsList = billsDue7d.length > 0
    ? billsDue7d.map(b =>
        `<span class="badge ${state === 'danger' ? 'bg-light text-danger' : 'bg-danger-subtle text-danger'} me-1 mb-1">${opsEscape(b.name)}</span>`
      ).join('')
    : '';

  el.innerHTML = `
    <div class="${cardClass} ${stateClass}">
      <div class="card-body d-flex flex-column">
        <h6 class="card-subtitle mb-3 ${state === 'danger' ? subtextMuted : 'text-muted'} small text-uppercase fw-semibold letter-spacing-wide">
          ${icon}Safe to Spend
        </h6>
        <div class="${amountClass}" style="${amountStyle}">${opsFormatCurrency(safeAmount)}</div>
        ${billsList ? `<div class="mb-2">${billsList}</div>` : ''}
        <hr class="${hrClass}">
        <div class="small ${state === 'danger' ? subtextMuted : 'text-muted'} mt-auto">
          <div class="d-flex justify-content-between mb-1">
            <span>Est. Monthly Income</span>
            <span class="${state !== 'danger' ? 'text-success' : ''}">+${opsFormatCurrency(balance)}</span>
          </div>
          <div class="d-flex justify-content-between mb-1">
            <span>Bills ≤7 days <span class="badge bg-${state === 'danger' ? 'light text-danger' : 'danger'} ms-1">${billsDue7d.length}</span></span>
            <span>−${opsFormatCurrency(billsDue7dTotal)}</span>
          </div>
          <div class="d-flex justify-content-between">
            <span>Safety Buffer</span>
            <span>−${opsFormatCurrency(bufferAmount)}</span>
          </div>
        </div>
      </div>
    </div>`;
}

// ─── Section 2: Cash Flow Chart ───────────────────────────────────────────────

/**
 * Build a day-by-day cash flow projection.
 * Places income and bill events on their expected dates.
 * @param {number} days  - Number of days to project (30 | 60 | 90)
 * @returns {{ labels, balanceData, events }}
 */
function buildCashFlowProjection(days = 30) {
  const bills  = opsGetBills();
  const income = opsGetIncome();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Starting balance = estimated monthly income
  let runningBalance = income.reduce((sum, inc) => sum + normalizeIncomeToMonthly(inc), 0);

  const labels      = [];
  const balanceData = [];
  const events      = [];  // { day, type: 'income'|'bill', amount, name }

  // ── Build income schedule ──────────────────────────────────────
  income.forEach(inc => {
    const freq   = (inc.frequency || '').toLowerCase();
    const amount = parseFloat(inc.amount) || 0;
    const name   = inc.name || inc.source || 'Income';

    if (freq === 'monthly') {
      // Hit on a specific day of month
      let targetDay = 1;
      if (inc.next_date) {
        targetDay = new Date(inc.next_date + 'T00:00:00').getDate();
      }
      for (let d = 0; d <= days; d++) {
        const dt = new Date(today);
        dt.setDate(today.getDate() + d);
        if (dt.getDate() === targetDay) {
          events.push({ day: d, type: 'income', amount, name });
        }
      }
    } else {
      // Periodic: weekly, bi-weekly, annually
      const intervalDays = freq === 'weekly' ? 7 : freq === 'bi-weekly' ? 14 : 365;
      const anchor = inc.next_date ? new Date(inc.next_date + 'T00:00:00') : new Date(today);

      for (let d = 0; d <= days; d++) {
        const dt = new Date(today);
        dt.setDate(today.getDate() + d);
        const diff = Math.round((dt - anchor) / 864e5);
        if (diff >= 0 && diff % intervalDays === 0) {
          events.push({ day: d, type: 'income', amount, name });
        }
      }
    }
  });

  // ── Build bill schedule ────────────────────────────────────────
  bills.forEach(bill => {
    const dueDay = getBillDueDay(bill);
    const amount = parseFloat(bill.amount) || 0;
    const name   = bill.name || 'Bill';

    for (let d = 0; d <= days; d++) {
      const dt = new Date(today);
      dt.setDate(today.getDate() + d);
      if (dt.getDate() === dueDay) {
        events.push({ day: d, type: 'bill', amount, name });
      }
    }
  });

  // ── Build day-by-day balance ────────────────────────────────────
  for (let d = 0; d <= days; d++) {
    const dt = new Date(today);
    dt.setDate(today.getDate() + d);

    labels.push(dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

    // Apply events for this day
    events
      .filter(e => e.day === d)
      .forEach(e => {
        runningBalance += e.type === 'income' ? e.amount : -e.amount;
      });

    balanceData.push(parseFloat(runningBalance.toFixed(2)));
  }

  return { labels, balanceData, events };
}

/**
 * Load Chart.js from CDN (fallback if LazyLoader not available).
 */
async function opsLoadChartJs() {
  if (typeof Chart !== 'undefined') return; // already loaded

  // Try LazyLoader first (from app.js)
  if (typeof window.LazyLoader !== 'undefined' && window.LazyLoader.loadCharts) {
    await window.LazyLoader.loadCharts();
    return;
  }

  // Fallback: load directly from CDN
  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
    script.onload  = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Render (or re-render) the cash flow Chart.js line chart.
 * @param {number} days
 */
async function renderCashFlowChart(days = 30) {
  const canvas = document.getElementById('cashFlowCanvas');
  if (!canvas) return;

  // Update subtitle label
  const subtitle = document.getElementById('cashFlowSubtitle');
  if (subtitle) subtitle.textContent = `Next ${days} days`;

  try {
    await opsLoadChartJs();
  } catch (err) {
    console.warn('[Operations] Chart.js failed to load:', err);
    const container = document.getElementById('cashFlowChartContainer');
    if (container) {
      container.innerHTML = '<p class="text-muted text-center py-4">Chart unavailable</p>';
    }
    return;
  }

  const { labels, balanceData, events } = buildCashFlowProjection(days);

  // Point styling — green for income days, red for bill days
  const pointColors = labels.map((_, i) => {
    const dayEvents = events.filter(e => e.day === i);
    if (dayEvents.some(e => e.type === 'income')) return '#81b900';
    if (dayEvents.some(e => e.type === 'bill'))   return '#dc3545';
    return 'rgba(0,0,0,0)';
  });

  const pointRadii = labels.map((_, i) =>
    events.some(e => e.day === i) ? 6 : 0
  );
  const pointHoverRadii = labels.map((_, i) =>
    events.some(e => e.day === i) ? 9 : 4
  );

  // Destroy previous chart before re-rendering
  if (opsCashFlowChart) {
    opsCashFlowChart.destroy();
    opsCashFlowChart = null;
  }

  opsCashFlowChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Projected Balance',
        data: balanceData,
        borderColor: '#01a4ef',
        backgroundColor: 'rgba(1, 164, 239, 0.08)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: pointColors,
        pointBorderColor: pointColors,
        pointRadius: pointRadii,
        pointHoverRadius: pointHoverRadii
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400 },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label(ctx) {
              return `Balance: ${opsFormatCurrency(ctx.raw)}`;
            },
            afterBody(ctxArr) {
              const idx = ctxArr[0].dataIndex;
              const dayEvents = events.filter(e => e.day === idx);
              if (!dayEvents.length) return [];
              return dayEvents.map(e =>
                `${e.type === 'income' ? '▲ In' : '▼ Out'}: ${opsEscape(e.name)} ${opsFormatCurrency(e.amount)}`
              );
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            maxTicksLimit: Math.min(10, days),
            color: '#adb5bd',
            font: { size: 11 }
          },
          grid: { color: 'rgba(255,255,255,0.04)' }
        },
        y: {
          ticks: {
            color: '#adb5bd',
            font: { size: 11 },
            callback: v => opsFormatCurrency(v)
          },
          grid: { color: 'rgba(255,255,255,0.04)' }
        }
      }
    }
  });
}

// ─── Section 3: Bills Aging Widget ───────────────────────────────────────────

/**
 * Render the 3-bucket bills aging widget into #billsAging.
 * Buckets: ≤7 days (danger), 8–30 days (warning), 31–60 days (success).
 */
function renderBillsAging() {
  const el = document.getElementById('billsAging');
  if (!el) return;

  const bills = opsGetBills();

  if (bills.length === 0) {
    el.innerHTML = `
      <div class="text-center py-4 text-muted">
        <i class="bi bi-receipt fs-2 mb-2 d-block opacity-50"></i>
        <p class="mb-0">No active bills found.</p>
        <a href="bills.html" class="btn btn-sm btn-outline-primary mt-2">Add Bills</a>
      </div>`;
    return;
  }

  // Categorise bills
  const urgent   = bills.filter(b => { const d = daysUntilBillDue(b); return d >= 0 && d <= 7; });
  const soon     = bills.filter(b => { const d = daysUntilBillDue(b); return d > 7  && d <= 30; });
  const upcoming = bills.filter(b => { const d = daysUntilBillDue(b); return d > 30 && d <= 60; });

  /**
   * Build one collapsible bucket card.
   */
  function makeBucket(bucketBills, variant, label, emoji) {
    const total = bucketBills.reduce((s, b) => s + (parseFloat(b.amount) || 0), 0);
    const bucketId = `bucket-${variant}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const rows = bucketBills.length > 0
      ? bucketBills.map(b => {
          const d = daysUntilBillDue(b);
          return `
            <div class="d-flex justify-content-between align-items-center py-2 px-1 border-bottom border-secondary border-opacity-25">
              <div>
                <span class="fw-medium small">${opsEscape(b.name)}</span>
                <span class="text-muted ms-2 small">due in ${d}d</span>
              </div>
              <span class="text-${variant} fw-semibold small">${opsFormatCurrency(b.amount)}</span>
            </div>`;
        }).join('')
      : '<p class="text-muted small mb-0 py-2 ps-1">No bills in this range</p>';

    return `
      <div class="bills-bucket card border mb-2 border-${variant} border-opacity-25"
           role="button"
           aria-expanded="false"
           data-action="toggle-bucket"
           aria-label="${label} — ${bucketBills.length} bills totalling ${opsFormatCurrency(total)}">
        <div class="card-body py-2 px-3">
          <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-${variant} rounded-pill">${bucketBills.length}</span>
              <span class="fw-medium small">${emoji} ${label}</span>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span class="fw-bold text-${variant}">${opsFormatCurrency(total)}</span>
              <i class="bi bi-chevron-down text-muted small"></i>
            </div>
          </div>
          <div class="bills-bucket-list">
            ${rows}
          </div>
        </div>
      </div>`;
  }

  el.innerHTML = `
    ${makeBucket(urgent,   'danger',  'Due ≤7 days',   '🔴')}
    ${makeBucket(soon,     'warning', 'Due 8–30 days',  '🟡')}
    ${makeBucket(upcoming, 'success', 'Due 31–60 days', '🟢')}`;

  // Event delegation for toggle — CSP-compliant, no inline onclick
  // Also updates aria-expanded for screen reader accessibility (BUG-OPS-BILLS-ARIA-001)
  el.addEventListener('click', (e) => {
    const bucket = e.target.closest('[data-action="toggle-bucket"]');
    if (!bucket) return;
    const list = bucket.querySelector('.bills-bucket-list');
    if (!list) return;
    const expanded = list.classList.toggle('expanded');
    bucket.setAttribute('aria-expanded', expanded);
  });
}

// ─── Section 4: Budget vs Actuals ────────────────────────────────────────────

/**
 * Populate the month selector dropdown with current + prev 3 months.
 */
function buildBvaMonthOptions() {
  const select = document.getElementById('bvaMonthSelect');
  if (!select) return;

  select.innerHTML = ''; // clear any existing options
  const now = new Date();

  for (let i = 0; i < 4; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const val   = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const opt   = document.createElement('option');
    opt.value       = val;
    opt.textContent = label;
    if (i === 0) opt.selected = true;
    select.appendChild(opt);
  }
}

/**
 * Wire up the Budget vs Actuals section — populate month picker, call renderer.
 */
function initBudgetVsActuals() {
  if (typeof renderBudgetVsActuals !== 'function') {
    // budget-actuals.js not ready yet — retry after a brief delay
    setTimeout(initBudgetVsActuals, 500);
    return;
  }

  buildBvaMonthOptions();

  const select = document.getElementById('bvaMonthSelect');
  const selectedMonth = select ? select.value : null;

  renderBudgetVsActuals('bvaHorizontal', selectedMonth);

  if (select) {
    select.addEventListener('change', () => {
      renderBudgetVsActuals('bvaHorizontal', select.value || null);
    });
  }
}

// ─── Section 5: Upcoming 14-Day List ─────────────────────────────────────────

/**
 * Build the projected event list for the next 14 days and render into #upcomingTx.
 * Shows a running balance column.
 */
function renderUpcomingList() {
  const el = document.getElementById('upcomingTx');
  if (!el) return;

  const bills  = opsGetBills();
  const income = opsGetIncome();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Starting balance = estimated monthly income
  let runningBalance = income.reduce((sum, inc) => sum + normalizeIncomeToMonthly(inc), 0);

  const events = [];

  // ── Collect income events ──────────────────────────────────────
  income.forEach(inc => {
    const freq   = (inc.frequency || '').toLowerCase();
    const amount = parseFloat(inc.amount) || 0;
    const name   = inc.name || inc.source || 'Income';

    for (let d = 0; d <= 14; d++) {
      const dt = new Date(today);
      dt.setDate(today.getDate() + d);
      let hits = false;

      if (freq === 'monthly') {
        const targetDay = inc.next_date ? new Date(inc.next_date + 'T00:00:00').getDate() : 1;
        hits = dt.getDate() === targetDay;
      } else if (freq === 'weekly' || freq === 'bi-weekly') {
        const anchor   = inc.next_date ? new Date(inc.next_date + 'T00:00:00') : new Date(today);
        const interval = freq === 'weekly' ? 7 : 14;
        const diff     = Math.round((dt - anchor) / 864e5);
        hits = diff >= 0 && diff % interval === 0;
      }

      if (hits) {
        events.push({ date: new Date(dt), amount, name, type: 'income' });
      }
    }
  });

  // ── Collect bill events ────────────────────────────────────────
  bills.forEach(bill => {
    const dueDay = getBillDueDay(bill);
    const amount = parseFloat(bill.amount) || 0;
    const name   = bill.name || 'Bill';

    for (let d = 0; d <= 14; d++) {
      const dt = new Date(today);
      dt.setDate(today.getDate() + d);
      if (dt.getDate() === dueDay) {
        events.push({ date: new Date(dt), amount, name, type: 'bill' });
      }
    }
  });

  // Sort chronologically (earliest first, income before bills on same day)
  events.sort((a, b) => {
    const timeDiff = a.date - b.date;
    if (timeDiff !== 0) return timeDiff;
    // On same day: income first
    if (a.type === 'income' && b.type !== 'income') return -1;
    if (b.type === 'income' && a.type !== 'income') return  1;
    return 0;
  });

  if (events.length === 0) {
    el.innerHTML = `
      <div class="text-center py-4 text-muted">
        <i class="bi bi-calendar-check fs-2 mb-2 d-block opacity-50"></i>
        <p class="mb-0">No scheduled events in the next 14 days.</p>
        <div class="mt-2">
          <a href="bills.html" class="btn btn-sm btn-outline-secondary me-2">Add Bills</a>
          <a href="income.html" class="btn btn-sm btn-outline-secondary">Add Income</a>
        </div>
      </div>`;
    return;
  }

  // ── Build rows with running balance ───────────────────────────
  const rows = events.map(evt => {
    if (evt.type === 'income') {
      runningBalance += evt.amount;
    } else {
      runningBalance -= evt.amount;
    }

    const isIncome  = evt.type === 'income';
    const dateLabel = evt.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const isToday   = evt.date.getTime() === today.getTime();

    const amountHtml = isIncome
      ? `<span class="text-success fw-bold">+${opsFormatCurrency(evt.amount)}</span>`
      : `<span class="text-danger fw-bold">−${opsFormatCurrency(evt.amount)}</span>`;

    const balanceColor = runningBalance < 0 ? 'text-danger' : runningBalance < 500 ? 'text-warning' : 'text-muted';
    const todayBadge   = isToday ? '<span class="badge bg-primary ms-2">Today</span>' : '';

    return `
      <div class="upcoming-item ${isIncome ? 'income' : 'expense'} d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-25">
        <div class="d-flex align-items-center gap-3">
          <i class="bi ${isIncome ? 'bi-arrow-down-circle text-success' : 'bi-arrow-up-circle text-danger'} fs-5"></i>
          <div>
            <div class="fw-medium small">${opsEscape(evt.name)}${todayBadge}</div>
            <div class="text-muted" style="font-size:0.78rem">${dateLabel}</div>
          </div>
        </div>
        <div class="text-end">
          <div>${amountHtml}</div>
          <div class="upcoming-balance ${balanceColor}" style="font-size:0.78rem">${opsFormatCurrency(runningBalance)}</div>
        </div>
      </div>`;
  });

  el.innerHTML = `
    <div class="d-flex justify-content-between text-muted border-bottom border-secondary border-opacity-25 pb-2 mb-1 px-3" style="font-size:0.78rem">
      <span>Event / Date</span>
      <span>Amount · Running Balance</span>
    </div>
    ${rows.join('')}`;
}

// ─── Realtime Status Badge ────────────────────────────────────────────────────

/**
 * Poll FiresideRealtime.status() and update the badge every 5 seconds.
 */
function updateRealtimeBadge() {
  const badge = document.getElementById('realtimeStatus');
  if (!badge) return;

  if (typeof FiresideRealtime === 'undefined') {
    badge.className = 'badge bg-secondary ms-2';
    badge.innerHTML = '<i class="bi bi-circle me-1" style="font-size:0.5rem"></i> Unavailable';
    return;
  }

  // FiresideRealtime.status() returns an object {isSubscribed, retryCount, channelActive, ...}
  // NOT a string — check properties directly (BUG-OPS-REALTIME-STATUS-TYPE-001)
  const statusObj = (typeof FiresideRealtime.status === 'function')
    ? FiresideRealtime.status()
    : null;

  if (!statusObj) {
    badge.className = 'badge bg-secondary ms-2';
    badge.innerHTML = '<i class="bi bi-circle me-1" style="font-size:0.5rem"></i> Unavailable';
  } else if (statusObj.isSubscribed && statusObj.channelActive) {
    badge.className = 'badge bg-success ms-2';
    badge.innerHTML = '<i class="bi bi-circle-fill me-1" style="font-size:0.5rem"></i> Live';
  } else if (statusObj.retryCount > 0 && statusObj.retryCount < statusObj.maxRetries) {
    badge.className = 'badge bg-warning text-dark ms-2';
    badge.innerHTML = '<i class="bi bi-circle me-1" style="font-size:0.5rem"></i> Reconnecting...';
  } else {
    badge.className = 'badge bg-danger ms-2';
    badge.innerHTML = '<i class="bi bi-circle-fill me-1" style="font-size:0.5rem"></i> Offline';
  }
}

// ─── Page Initialisation ─────────────────────────────────────────────────────

/**
 * Wait for window.bills to be populated by app.js.
 * Returns a Promise that resolves when data is ready or after a timeout.
 */
function waitForAppData() {
  return new Promise(resolve => {
    // Demo mode has data immediately
    if (typeof isDemoMode === 'function' && isDemoMode()) {
      resolve();
      return;
    }

    // Data already populated
    if (window.bills !== undefined) {
      resolve();
      return;
    }

    // Listen for the custom 'dataLoaded' event fired by app.js
    document.addEventListener('dataLoaded', () => resolve(), { once: true });

    // Fallback poll — up to 6 seconds
    let attempts = 0;
    const poll = setInterval(() => {
      attempts++;
      if (window.bills !== undefined || attempts >= 30) {
        clearInterval(poll);
        resolve();
      }
    }, 200);
  });
}

/**
 * Main entry point for the Operations Dashboard.
 */
async function initOperations() {
  try {
    // ── 1. Safe to Spend ──────────────────────────────────────────
    const safeData = await calculateSafeToSpend();
    renderSafeToSpend(safeData);

    // ── 2. Cash Flow Chart ────────────────────────────────────────
    await renderCashFlowChart(opsCurrentDays);

    // ── 3. Bills Aging ────────────────────────────────────────────
    renderBillsAging();

    // ── 4. Budget vs Actuals ──────────────────────────────────────
    initBudgetVsActuals();

    // ── 5. Upcoming 14-Day List ───────────────────────────────────
    renderUpcomingList();

    // ── Realtime badge ────────────────────────────────────────────
    updateRealtimeBadge();
    setInterval(updateRealtimeBadge, 5000);

    // ── Cash flow time-range toggle ───────────────────────────────
    document.querySelectorAll('#cashFlowToggle button').forEach(btn => {
      btn.addEventListener('click', async () => {
        document.querySelectorAll('#cashFlowToggle button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        opsCurrentDays = parseInt(btn.dataset.days, 10);
        await renderCashFlowChart(opsCurrentDays);
      });
    });

    // ── Realtime subscriptions ────────────────────────────────────
    if (typeof FiresideRealtime !== 'undefined' && typeof FiresideRealtime.on === 'function') {
      FiresideRealtime.on('bill:update', async () => {
        renderBillsAging();
        renderUpcomingList();
        const fresh = await calculateSafeToSpend();
        renderSafeToSpend(fresh);
        await renderCashFlowChart(opsCurrentDays);
      });

      FiresideRealtime.on('transaction:insert', () => {
        renderUpcomingList();
      });
    }

  } catch (err) {
    console.error('[Operations] Initialisation error:', err);
    if (typeof showToast === 'function') {
      showToast('Error loading the Operations dashboard. Please refresh.', 'danger');
    }
  }
}

// ── Bootstrap: wait for DOM + app data, then init ─────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await waitForAppData();
  await initOperations();
});
