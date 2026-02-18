/**
 * operations.js — Fireside Capital
 * Operations Dashboard: Cash Flow Command Center
 *
 * Sections:
 *   1. Safe to Spend KPI
 *   2. Cash Flow Projection Chart (30/60/90d)
 *   3. Bills Aging Widget (3 buckets, expandable)
 *   4. Budget vs Actuals (wired to budget-actuals.js)
 *   5. Upcoming 14-Day List with running balance
 *
 * Depends on: app.js (window.bills, window.income, sb, formatCurrency, getCurrentUser)
 *             budget-actuals.js (renderBudgetVsActuals)
 *             realtime.js (FiresideRealtime)
 *             demo-data.js (isDemoMode, DEMO_DATA)
 *
 * FC-173 | Priority: P1
 */

'use strict';

// ─── Constants ────────────────────────────────────────────────────────────────

const OPS_SAFETY_BUFFER = 500;        // Always subtract $500 as safety buffer
const OPS_UPCOMING_DAYS = 14;         // Upcoming list window
const OPS_STATUS_POLL_MS = 5000;      // Realtime badge poll interval

let opsCashFlowChart = null;          // Chart.js instance
let opsCashFlowDays = 30;             // Active toggle state
let opsStatusInterval = null;         // Realtime badge poll timer

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Get bills array — live or demo.
 */
function opsBills() {
  if (typeof isDemoMode === 'function' && isDemoMode()) {
    return (typeof DEMO_DATA !== 'undefined' && DEMO_DATA.bills) ? DEMO_DATA.bills : [];
  }
  return window.bills || [];
}

/**
 * Get income array — live or demo.
 */
function opsIncome() {
  if (typeof isDemoMode === 'function' && isDemoMode()) {
    return (typeof DEMO_DATA !== 'undefined' && DEMO_DATA.income) ? DEMO_DATA.income : [];
  }
  return window.income || [];
}

/**
 * Format currency — delegates to app.js formatCurrency if available.
 */
function opsFmt(amount) {
  if (typeof formatCurrency === 'function') return formatCurrency(amount);
  return '$' + parseFloat(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Get today as a JS Date (midnight local).
 */
function opsToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Format a date as "Feb 18".
 */
function opsFmtDate(d) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Calculate monthly income estimate from income array.
 * Normalises all frequencies to monthly.
 */
function opsMonthlyIncome(incomeArr) {
  return (incomeArr || []).reduce((sum, inc) => {
    const amt = parseFloat(inc.amount) || 0;
    switch ((inc.frequency || '').toLowerCase()) {
      case 'weekly':     return sum + amt * 4.333;
      case 'bi-weekly':
      case 'biweekly':   return sum + amt * 2.167;
      case 'semi-monthly':
      case 'semimonthly': return sum + amt * 2;
      case 'annually':
      case 'yearly':     return sum + amt / 12;
      default:           return sum + amt; // monthly
    }
  }, 0);
}

/**
 * Convert a bill's due_date (day-of-month integer) to the next
 * occurrence on or after `from` date. Returns a JS Date.
 */
function opsNextDueDate(dayOfMonth, from) {
  const ref = from || opsToday();
  const d = new Date(ref.getFullYear(), ref.getMonth(), dayOfMonth);
  if (d < ref) {
    // Roll to next month
    d.setMonth(d.getMonth() + 1);
  }
  return d;
}

/**
 * Days until a date from today.
 */
function opsDaysUntil(date) {
  const today = opsToday();
  const diff = date - today;
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

// ─── 1. Safe to Spend ─────────────────────────────────────────────────────────

/**
 * Calculate Safe to Spend.
 * Formula: Monthly Income − Bills due ≤7 days − $500 safety buffer
 * (We use monthly income as a proxy for "available balance" until Plaid balance is wired.)
 */
function calculateSafeToSpend() {
  const bills   = opsBills();
  const income  = opsIncome();

  const monthlyIncome = opsMonthlyIncome(income);
  const today = opsToday();

  // Bills due within 7 days
  const bills7d = bills.filter(b => {
    if (b.is_paid) return false;
    const due = opsNextDueDate(parseInt(b.due_date) || 1, today);
    return opsDaysUntil(due) <= 7;
  });
  const bills7dTotal = bills7d.reduce((s, b) => s + (parseFloat(b.amount) || 0), 0);

  const safeAmount = monthlyIncome - bills7dTotal - OPS_SAFETY_BUFFER;

  let state;
  if (safeAmount < 0)    state = 'danger';
  else if (safeAmount < 1000) state = 'warning';
  else                   state = 'positive';

  return {
    safeAmount,
    monthlyIncome,
    bills7dTotal,
    bills7dCount: bills7d.length,
    bufferAmount: OPS_SAFETY_BUFFER,
    state
  };
}

function renderSafeToSpend() {
  const card    = document.getElementById('safeToSpend');
  const skel    = document.getElementById('safeToSpendSkeleton');
  const content = document.getElementById('safeToSpendContent');
  const amtEl   = document.getElementById('safeToSpendAmount');
  const iconEl  = document.getElementById('safeToSpendIcon');
  const brkEl   = document.getElementById('safeToSpendBreakdown');
  if (!card) return;

  const data = calculateSafeToSpend();

  // Update card state class
  card.classList.remove('safe-to-spend-positive', 'safe-to-spend-warning', 'safe-to-spend-danger');
  card.classList.add(`safe-to-spend-${data.state}`);

  // Icon + colour
  if (data.state === 'danger') {
    iconEl.className = 'bi bi-exclamation-triangle-fill fs-4 text-danger';
    amtEl.className  = 'safe-amount-value text-danger';
  } else if (data.state === 'warning') {
    iconEl.className = 'bi bi-exclamation-circle-fill fs-4 text-warning';
    amtEl.className  = 'safe-amount-value text-warning';
  } else {
    iconEl.className = 'bi bi-shield-check-fill fs-4 text-success';
    amtEl.className  = 'safe-amount-value text-success';
  }

  amtEl.textContent = opsFmt(Math.max(data.safeAmount, 0));

  brkEl.innerHTML = `
    <span title="Estimated monthly income">${opsFmt(data.monthlyIncome)} income</span>
    &minus; <span title="Bills due within 7 days (${data.bills7dCount} bill${data.bills7dCount !== 1 ? 's' : ''})">${opsFmt(data.bills7dTotal)} due&nbsp;≤7d</span>
    &minus; <span title="Safety buffer">${opsFmt(data.bufferAmount)} buffer</span>
    ${data.safeAmount < 0 ? '<br><strong class="text-danger">⚠ Negative — cash crunch incoming</strong>' : ''}
  `;

  skel.classList.add('d-none');
  content.classList.remove('d-none');
}

// ─── 2. Cash Flow Chart ───────────────────────────────────────────────────────

/**
 * Build a day-by-day cash flow projection.
 * Returns { labels, balanceData, incomePoints, expensePoints }
 */
function buildCashFlowProjection(days) {
  const bills  = opsBills();
  const income = opsIncome();
  const today  = opsToday();

  // Estimate starting balance as monthly income * 0.5 (mid-cycle proxy)
  let balance = opsMonthlyIncome(income) * 0.5;

  const labels        = [];
  const balanceData   = [];
  const incomePoints  = [];
  const expensePoints = [];

  for (let i = 0; i < days; i++) {
    const day = new Date(today);
    day.setDate(today.getDate() + i);

    labels.push(opsFmtDate(day));

    // Income events: check each income source for its pay date
    income.forEach(inc => {
      const amt = parseFloat(inc.amount) || 0;
      const freq = (inc.frequency || '').toLowerCase();

      let hits = false;
      switch (freq) {
        case 'weekly':
          hits = (i % 7 === 0) && i > 0;
          break;
        case 'bi-weekly':
        case 'biweekly':
          hits = (i % 14 === 0) && i > 0;
          break;
        case 'monthly':
          // Assume 1st or 15th — use due_date if available, else 1st
          const payDay = parseInt(inc.pay_date) || 1;
          hits = day.getDate() === payDay;
          break;
        default:
          hits = false;
      }

      if (hits) {
        balance += amt;
        incomePoints.push({ x: i, y: balance, label: inc.name, amount: amt });
      }
    });

    // Bill events: check each bill's due_date
    bills.forEach(b => {
      if (b.is_paid) return;
      const dueDay = parseInt(b.due_date) || 1;
      if (day.getDate() === dueDay) {
        const amt = parseFloat(b.amount) || 0;
        balance -= amt;
        expensePoints.push({ x: i, y: balance, label: b.name, amount: amt });
      }
    });

    balanceData.push(parseFloat(balance.toFixed(2)));
  }

  return { labels, balanceData, incomePoints, expensePoints };
}

function renderCashFlowChart(days) {
  const skel    = document.getElementById('cashFlowSkeleton');
  const canvas  = document.getElementById('cashFlowChart');
  if (!canvas) return;

  const proj = buildCashFlowProjection(days);

  if (opsCashFlowChart) {
    opsCashFlowChart.destroy();
    opsCashFlowChart = null;
  }

  // Build event annotation datasets (dots on income/expense dates)
  const incomeScatter = proj.incomePoints.map(p => ({ x: p.x, y: p.y }));
  const expenseScatter = proj.expensePoints.map(p => ({ x: p.x, y: p.y }));

  opsCashFlowChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: proj.labels,
      datasets: [
        {
          label: 'Projected Balance',
          data: proj.balanceData,
          borderColor: '#01a4ef',
          backgroundColor: 'rgba(1,164,239,0.08)',
          borderWidth: 2,
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          pointHoverRadius: 4
        },
        {
          label: 'Income Event',
          data: incomeScatter,
          type: 'scatter',
          backgroundColor: '#81b900',
          borderColor: '#81b900',
          pointRadius: 6,
          pointHoverRadius: 8,
          showLine: false,
          parsing: false
        },
        {
          label: 'Bill Event',
          data: expenseScatter,
          type: 'scatter',
          backgroundColor: '#dc3545',
          borderColor: '#dc3545',
          pointRadius: 6,
          pointHoverRadius: 8,
          showLine: false,
          parsing: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true,
          labels: {
            color: '#aaa',
            font: { size: 11 },
            boxWidth: 10
          }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              if (ctx.dataset.label === 'Projected Balance') {
                return ` Balance: ${opsFmt(ctx.parsed.y)}`;
              }
              return ` ${ctx.dataset.label}: ${opsFmt(ctx.parsed.y)}`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#888',
            maxTicksLimit: 10,
            font: { size: 10 }
          },
          grid: { color: 'rgba(255,255,255,0.05)' }
        },
        y: {
          ticks: {
            color: '#888',
            font: { size: 10 },
            callback: (v) => opsFmt(v)
          },
          grid: { color: 'rgba(255,255,255,0.05)' }
        }
      }
    }
  });

  skel.classList.add('d-none');
  canvas.classList.remove('d-none');
}

// ─── 3. Bills Aging ───────────────────────────────────────────────────────────

function renderBillsAging() {
  const skel    = document.getElementById('billsAgingSkeleton');
  const content = document.getElementById('billsAgingContent');
  if (!content) return;

  const bills = opsBills();
  const today = opsToday();

  const buckets = [
    { key: 'red',    label: 'Due within 7 days',  minDays: 0,  maxDays: 7,  colorClass: 'danger',  icon: 'bi-circle-fill text-danger',  items: [] },
    { key: 'amber',  label: 'Due in 8–30 days',   minDays: 8,  maxDays: 30, colorClass: 'warning', icon: 'bi-circle-fill text-warning', items: [] },
    { key: 'green',  label: 'Due in 31–60 days',  minDays: 31, maxDays: 60, colorClass: 'success', icon: 'bi-circle-fill text-success', items: [] }
  ];

  bills.forEach(b => {
    if (b.is_paid) return;
    const dueDate = opsNextDueDate(parseInt(b.due_date) || 1, today);
    const days    = opsDaysUntil(dueDate);
    const bucket  = buckets.find(bk => days >= bk.minDays && days <= bk.maxDays);
    if (bucket) {
      bucket.items.push({ ...b, daysUntil: days, nextDue: dueDate });
    }
  });

  if (bills.length === 0) {
    content.innerHTML = `
      <div class="empty-state py-4 text-center">
        <i class="bi bi-receipt fs-2 text-muted d-block mb-2"></i>
        <p class="text-muted">No bills tracked yet.</p>
        <a href="bills.html" class="btn btn-sm btn-primary">Add Bills</a>
      </div>`;
  } else {
    content.innerHTML = buckets.map((bk, idx) => {
      const total = bk.items.reduce((s, b) => s + (parseFloat(b.amount) || 0), 0);
      const isEmpty = bk.items.length === 0;
      const itemsHtml = isEmpty ? '' : bk.items.map(b => `
        <div class="bills-bucket-item">
          <span>${b.name || 'Bill'}</span>
          <span class="d-flex align-items-center gap-3">
            <small class="text-muted">${opsFmtDate(b.nextDue)} (${b.daysUntil}d)</small>
            <strong>${opsFmt(b.amount)}</strong>
          </span>
        </div>`).join('');

      return `
        <div class="bills-bucket border rounded" data-bucket-idx="${idx}" role="button" aria-expanded="false">
          <div class="d-flex justify-content-between align-items-center">
            <span class="d-flex align-items-center gap-2">
              <i class="bi bi-circle-fill ${bk.colorClass === 'danger' ? 'text-danger' : bk.colorClass === 'warning' ? 'text-warning' : 'text-success'}" style="font-size:0.6rem"></i>
              <span class="fw-medium">${bk.label}</span>
              <span class="badge bg-secondary">${bk.items.length}</span>
            </span>
            <span class="d-flex align-items-center gap-2">
              <strong class="text-${bk.colorClass}">${opsFmt(total)}</strong>
              <i class="bi bi-chevron-down text-muted" style="font-size:0.75rem;transition:transform 0.2s" id="chevron-${idx}"></i>
            </span>
          </div>
          <div class="bills-bucket-list" id="bucket-list-${idx}">
            ${isEmpty
              ? '<p class="text-muted small mb-0 pt-2">No bills in this window.</p>'
              : itemsHtml}
          </div>
        </div>`;
    }).join('');

    // Attach toggle handlers
    content.querySelectorAll('[data-bucket-idx]').forEach(el => {
      el.addEventListener('click', () => {
        const idx  = el.dataset.bucketIdx;
        const list = document.getElementById(`bucket-list-${idx}`);
        const chev = document.getElementById(`chevron-${idx}`);
        const open = list.classList.toggle('expanded');
        el.setAttribute('aria-expanded', open);
        if (chev) chev.style.transform = open ? 'rotate(180deg)' : '';
      });
    });
  }

  skel.classList.add('d-none');
  content.classList.remove('d-none');
}

// ─── 4. Budget vs Actuals ────────────────────────────────────────────────────

/**
 * Populate the BVA month selector with current + 3 prior months.
 */
function populateBvaMonthSelect() {
  const sel = document.getElementById('bvaMonthSelect');
  if (!sel) return;

  const now = new Date();
  sel.innerHTML = '';
  for (let i = 0; i < 4; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const val   = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const opt   = document.createElement('option');
    opt.value   = val;
    opt.textContent = label;
    if (i === 0) opt.selected = true;
    sel.appendChild(opt);
  }

  sel.addEventListener('change', () => {
    if (typeof renderBudgetVsActuals === 'function') {
      renderBudgetVsActuals('bvaHorizontal', sel.value);
    }
  });
}

async function renderBvaSection() {
  populateBvaMonthSelect();
  const sel = document.getElementById('bvaMonthSelect');
  const month = sel ? sel.value : null;
  if (typeof renderBudgetVsActuals === 'function') {
    await renderBudgetVsActuals('bvaHorizontal', month);
  } else {
    const container = document.getElementById('bvaHorizontal');
    if (container) {
      container.innerHTML = `<p class="text-muted text-center py-3">Budget data unavailable. <a href="settings.html">Set up budgets →</a></p>`;
    }
  }
}

// ─── 5. Upcoming 14-Day List ──────────────────────────────────────────────────

function renderUpcomingList() {
  const skel    = document.getElementById('upcomingTxSkeleton');
  const content = document.getElementById('upcomingTxContent');
  const list    = document.getElementById('upcomingTxList');
  const rangeEl = document.getElementById('upcomingDateRange');
  if (!list) return;

  const bills  = opsBills();
  const income = opsIncome();
  const today  = opsToday();

  // Build events for next 14 days
  const events = [];

  // Income events
  income.forEach(inc => {
    const amt  = parseFloat(inc.amount) || 0;
    const freq = (inc.frequency || '').toLowerCase();

    for (let i = 0; i <= OPS_UPCOMING_DAYS; i++) {
      const day = new Date(today);
      day.setDate(today.getDate() + i);

      let hits = false;
      switch (freq) {
        case 'weekly':     hits = (i % 7 === 0) && i > 0; break;
        case 'bi-weekly':
        case 'biweekly':   hits = (i % 14 === 0) && i > 0; break;
        case 'monthly': {
          const payDay = parseInt(inc.pay_date) || 1;
          hits = day.getDate() === payDay;
          break;
        }
      }

      if (hits) {
        events.push({ date: day, name: inc.name || 'Income', amount: amt, type: 'income' });
      }
    }
  });

  // Bill events
  bills.forEach(b => {
    if (b.is_paid) return;
    const dueDay = parseInt(b.due_date) || 1;
    const amt    = parseFloat(b.amount) || 0;

    for (let i = 0; i <= OPS_UPCOMING_DAYS; i++) {
      const day = new Date(today);
      day.setDate(today.getDate() + i);
      if (day.getDate() === dueDay) {
        events.push({ date: day, name: b.name || 'Bill', amount: amt, type: 'expense' });
      }
    }
  });

  // Sort chronologically
  events.sort((a, b) => a.date - b.date);

  if (rangeEl) {
    const end = new Date(today);
    end.setDate(today.getDate() + OPS_UPCOMING_DAYS);
    rangeEl.textContent = `${opsFmtDate(today)} – ${opsFmtDate(end)}`;
  }

  // Build running balance
  let balance = opsMonthlyIncome(income) * 0.5;

  if (events.length === 0) {
    list.innerHTML = `<p class="text-muted text-center py-3">No income or bill events in the next ${OPS_UPCOMING_DAYS} days.</p>`;
  } else {
    list.innerHTML = events.map(ev => {
      if (ev.type === 'income') balance += ev.amount;
      else                      balance -= ev.amount;

      const amtLabel   = ev.type === 'income'
        ? `<span class="upcoming-amount text-success">+${opsFmt(ev.amount)}</span>`
        : `<span class="upcoming-amount text-danger">&minus;${opsFmt(ev.amount)}</span>`;
      const balColor   = balance < 0 ? 'text-danger' : balance < 500 ? 'text-warning' : 'text-muted';

      return `
        <div class="upcoming-item ${ev.type === 'income' ? 'income-row' : 'expense-row'}">
          <span class="upcoming-date">${opsFmtDate(ev.date)}</span>
          <span class="upcoming-name">${ev.name}</span>
          ${amtLabel}
          <span class="upcoming-balance ${balColor}">${opsFmt(balance)}</span>
        </div>`;
    }).join('');
  }

  skel.classList.add('d-none');
  content.classList.remove('d-none');
}

// ─── Realtime Status Badge ────────────────────────────────────────────────────

function updateRealtimeBadge() {
  const badge = document.getElementById('realtimeStatus');
  if (!badge) return;

  if (typeof FiresideRealtime === 'undefined') {
    badge.className = 'badge bg-secondary';
    badge.innerHTML = '<i class="bi bi-circle me-1" style="font-size:0.5rem"></i> Offline';
    return;
  }

  const st = FiresideRealtime.status();

  if (st.isSubscribed) {
    badge.className = 'badge bg-success';
    badge.innerHTML = '<i class="bi bi-circle-fill me-1" style="font-size:0.5rem"></i> Live';
  } else if (st.retryCount > 0 && st.retryCount < st.maxRetries) {
    badge.className = 'badge bg-warning text-dark';
    badge.innerHTML = '<i class="bi bi-circle me-1" style="font-size:0.5rem"></i> Reconnecting...';
  } else if (st.retryCount >= st.maxRetries) {
    badge.className = 'badge bg-danger';
    badge.innerHTML = '<i class="bi bi-circle-fill me-1" style="font-size:0.5rem"></i> Offline';
  } else {
    badge.className = 'badge bg-secondary';
    badge.innerHTML = '<i class="bi bi-circle me-1" style="font-size:0.5rem"></i> Connecting...';
  }
}

// ─── Cash Flow Toggle ─────────────────────────────────────────────────────────

function initCashFlowToggle() {
  const group = document.getElementById('cashFlowToggle');
  if (!group) return;

  group.querySelectorAll('button[data-days]').forEach(btn => {
    btn.addEventListener('click', () => {
      group.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      opsCashFlowDays = parseInt(btn.dataset.days);
      renderCashFlowChart(opsCashFlowDays);
    });
  });
}

// ─── Page Init ────────────────────────────────────────────────────────────────

/**
 * Wait for app.js to finish loading data (bills + income).
 * app.js sets window.bills and window.income when data is ready.
 * We poll until they're available or timeout after 8 seconds.
 */
function waitForAppData(timeoutMs = 8000) {
  return new Promise((resolve) => {
    // If demo mode, data is synchronously available
    if (typeof isDemoMode === 'function' && isDemoMode()) {
      return resolve();
    }

    const start = Date.now();
    const interval = setInterval(() => {
      const ready = Array.isArray(window.bills) && Array.isArray(window.income);
      if (ready || Date.now() - start > timeoutMs) {
        clearInterval(interval);
        resolve();
      }
    }, 100);
  });
}

async function initOperations() {
  // Wire up UI interactions immediately
  initCashFlowToggle();

  // Start realtime badge polling
  updateRealtimeBadge();
  opsStatusInterval = setInterval(updateRealtimeBadge, OPS_STATUS_POLL_MS);

  // Wait for data
  await waitForAppData();

  // Render all 5 sections
  try { renderSafeToSpend();   } catch (e) { console.error('[Ops] Safe to Spend error:', e); }
  try { renderCashFlowChart(opsCashFlowDays); } catch (e) { console.error('[Ops] Cash flow chart error:', e); }
  try { renderBillsAging();    } catch (e) { console.error('[Ops] Bills aging error:', e); }
  try { renderUpcomingList();  } catch (e) { console.error('[Ops] Upcoming list error:', e); }
  try { await renderBvaSection(); } catch (e) { console.error('[Ops] BvA error:', e); }

  // Subscribe to realtime (no-op in demo mode)
  if (typeof FiresideRealtime !== 'undefined') {
    try {
      await FiresideRealtime.subscribe();
      updateRealtimeBadge();

      // Live refresh on realtime events
      FiresideRealtime.on('bill:update', () => {
        renderSafeToSpend();
        renderBillsAging();
        renderCashFlowChart(opsCashFlowDays);
        renderUpcomingList();
      });
      FiresideRealtime.on('transaction:insert', () => {
        // Could refresh BvA if we want live spending updates
      });
      FiresideRealtime.on('snapshot:insert', () => {
        // Future: could update balance estimate
      });
    } catch (e) {
      console.warn('[Ops] Realtime subscribe error:', e);
    }
  }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (opsStatusInterval) clearInterval(opsStatusInterval);
});

// Boot when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initOperations);
} else {
  initOperations();
}
