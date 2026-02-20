/**
 * cash-flow.js — Cash Flow Projection Engine
 * Generates day-by-day balance forecasts from bills + income + debts
 * Powers Operations Dashboard (FC-173)
 * 
 * @author Capital (Lead Dev)
 * @created 2026-02-20
 * @ticket FC-172
 */

// Frequency conversion constants
const DAYS_IN_PERIOD = {
  'daily': 1,
  'weekly': 7,
  'bi-weekly': 14,
  'monthly': 30.44,      // Average month
  'bi-monthly': 60.88,
  'quarterly': 91.31,
  'semi-annual': 182.63,
  'annual': 365.25
};

/**
 * Generate a day-by-day cash flow projection
 * @param {Object} params
 * @param {number} params.startBalance - Current checking account balance
 * @param {Array} params.incomes - From Supabase income table
 * @param {Array} params.bills - From Supabase bills table
 * @param {Array} params.debts - From Supabase debts table
 * @param {number} [params.days=90] - Projection window (30, 60, or 90)
 * @returns {Array<Object>} Daily projection objects with date, inflows, outflows, net, balance
 */
function generateCashFlowProjection({ startBalance, incomes = [], bills = [], debts = [], days = 90 }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Initialize day-by-day ledger
  const ledger = {};
  for (let i = 0; i <= days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const key = date.toISOString().split('T')[0];
    ledger[key] = {
      date: key,
      inflows: [],
      outflows: [],
      net: 0,
      balance: 0
    };
  }
  
  // Project income occurrences
  for (const income of incomes) {
    if (!income.is_active) continue;
    const occurrences = getOccurrences(
      income.next_payment_date || income.nextPaymentDate,
      income.frequency,
      days
    );
    for (const dateKey of occurrences) {
      if (ledger[dateKey]) {
        ledger[dateKey].inflows.push({
          name: income.name,
          amount: income.amount,
          type: 'income'
        });
      }
    }
  }
  
  // Project bill occurrences
  for (const bill of bills) {
    if (!bill.is_active && bill.is_active !== undefined) continue;
    const occurrences = getOccurrences(
      bill.due_date || bill.nextDueDate,
      bill.frequency,
      days
    );
    for (const dateKey of occurrences) {
      if (ledger[dateKey]) {
        ledger[dateKey].outflows.push({
          name: bill.name,
          amount: bill.amount,
          type: 'bill'
        });
      }
    }
  }
  
  // Project debt payments (always monthly)
  for (const debt of debts) {
    const occurrences = getOccurrences(
      debt.next_payment_date || debt.nextPaymentDate,
      'monthly',
      days
    );
    for (const dateKey of occurrences) {
      if (ledger[dateKey]) {
        ledger[dateKey].outflows.push({
          name: debt.name,
          amount: debt.monthly_payment || debt.monthlyPayment,
          type: 'debt'
        });
      }
    }
  }
  
  // Calculate running balance (day-by-day)
  let runningBalance = startBalance || 0;
  const sorted = Object.values(ledger).sort((a, b) => a.date.localeCompare(b.date));
  
  for (const day of sorted) {
    const totalIn = day.inflows.reduce((sum, t) => sum + t.amount, 0);
    const totalOut = day.outflows.reduce((sum, t) => sum + t.amount, 0);
    day.net = totalIn - totalOut;
    runningBalance += day.net;
    day.balance = runningBalance;
  }
  
  return sorted;
}

/**
 * Get all occurrence dates for a recurring item within N days
 * @param {string|Date} startDate - ISO date string or Date (next_payment_date or due_date)
 * @param {string} frequency - 'monthly', 'weekly', 'bi-weekly', etc.
 * @param {number} days - How far ahead to project
 * @returns {string[]} Array of ISO date keys (YYYY-MM-DD)
 */
function getOccurrences(startDate, frequency, days) {
  const occurrences = [];
  if (!startDate || !frequency) return occurrences;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + days);
  
  let current = new Date(startDate);
  current.setHours(0, 0, 0, 0);
  
  // Wind forward to today if past date
  while (current < today) {
    current = advanceByFrequency(current, frequency);
  }
  
  // Collect all occurrences within range
  while (current <= endDate) {
    occurrences.push(current.toISOString().split('T')[0]);
    current = advanceByFrequency(current, frequency);
    
    // Safety valve for 'once' or unknown frequencies
    if (occurrences.length > 500) break;
  }
  
  return occurrences;
}

/**
 * Advance a date by one frequency period
 * Handles month-end edge cases correctly (Feb 28 → Mar 31, not Mar 28)
 * @param {Date} date - Starting date
 * @param {string} frequency - 'monthly', 'weekly', etc.
 * @returns {Date} New date advanced by one period
 */
function advanceByFrequency(date, frequency) {
  const next = new Date(date);
  const freq = (frequency || '').toLowerCase();
  
  switch (freq) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'bi-weekly':
    case 'biweekly':
      next.setDate(next.getDate() + 14);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'bi-monthly':
    case 'bimonthly':
      next.setMonth(next.getMonth() + 2);
      break;
    case 'quarterly':
      next.setMonth(next.getMonth() + 3);
      break;
    case 'semi-annual':
    case 'semiannual':
      next.setMonth(next.getMonth() + 6);
      break;
    case 'annual':
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      // Fallback to monthly if frequency is unknown
      next.setMonth(next.getMonth() + 1);
  }
  
  return next;
}

/**
 * Calculate "Safe to Spend" — lowest projected balance over next 14 days
 * minus a safety buffer
 * @param {Array} projection - Output from generateCashFlowProjection()
 * @param {number} [safetyBuffer=500] - Safety cushion in dollars
 * @returns {Object} Safe to spend metrics
 */
function calculateSafeToSpend(projection, safetyBuffer = 500) {
  const next14Days = projection.slice(0, 15); // Include today + 14 ahead
  const lowestBalance = Math.min(...next14Days.map(d => d.balance));
  const safeToSpend = Math.max(0, lowestBalance - safetyBuffer);
  
  return {
    safeToSpend,
    lowestBalance,
    lowestDate: next14Days.find(d => d.balance === lowestBalance)?.date,
    safetyBuffer,
    isComfortable: safeToSpend > 1000,
    isTight: safeToSpend > 0 && safeToSpend <= 1000,
    isDanger: safeToSpend <= 0
  };
}

/**
 * Categorize upcoming bills by urgency (bills aging / AP view)
 * @param {Array} projection - Output from generateCashFlowProjection()
 * @returns {Object} Bills aging buckets (critical, upcoming, planned)
 */
function getBillsAging(projection) {
  const next7days = [], next8to30days = [], next31to60days = [];
  const today = new Date().toISOString().split('T')[0];
  
  for (const day of projection) {
    if (day.date < today) continue; // Skip past
    
    const daysOut = Math.ceil((new Date(day.date) - new Date(today)) / (1000 * 60 * 60 * 24));
    
    for (const outflow of day.outflows) {
      const item = { ...outflow, date: day.date, daysOut };
      
      if (daysOut <= 7) {
        next7days.push(item);
      } else if (daysOut <= 30) {
        next8to30days.push(item);
      } else if (daysOut <= 60) {
        next31to60days.push(item);
      }
    }
  }
  
  const sum = (arr) => arr.reduce((total, item) => total + item.amount, 0);
  
  return {
    critical: {
      items: next7days,
      total: sum(next7days),
      label: '≤ 7 Days',
      color: 'danger'
    },
    upcoming: {
      items: next8to30days,
      total: sum(next8to30days),
      label: '8–30 Days',
      color: 'warning'
    },
    planned: {
      items: next31to60days,
      total: sum(next31to60days),
      label: '31–60 Days',
      color: 'success'
    }
  };
}

/**
 * Get upcoming transactions list (next 14 days) with running balance
 * @param {Array} projection - Output from generateCashFlowProjection()
 * @returns {Array} Transaction items with running balance
 */
function getUpcomingTransactions(projection) {
  const today = new Date().toISOString().split('T')[0];
  const next14Days = projection.filter(day => day.date >= today).slice(0, 15);
  const upcoming = [];
  
  for (const day of next14Days) {
    // Add all inflows for this day
    for (const inflow of day.inflows) {
      upcoming.push({
        date: day.date,
        name: inflow.name,
        amount: inflow.amount,
        type: 'inflow',
        runningBalance: day.balance
      });
    }
    
    // Add all outflows for this day
    for (const outflow of day.outflows) {
      upcoming.push({
        date: day.date,
        name: outflow.name,
        amount: outflow.amount,
        type: 'outflow',
        runningBalance: day.balance
      });
    }
  }
  
  // Sort by date, then inflows before outflows (income deposits clear before bills)
  upcoming.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.type === 'inflow' ? -1 : 1; // Inflows first
  });
  
  return upcoming;
}

/**
 * Format a date as "Feb 20" (short month + day)
 * @param {string|Date} date - ISO date string or Date object
 * @returns {string} Formatted short date
 */
function formatShortDate(date) {
  const d = new Date(date);
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  const day = d.getDate();
  return `${month} ${day}`;
}

/**
 * Format a date as "Thursday, February 20, 2026" (full date)
 * @param {string|Date} date - ISO date string or Date object
 * @returns {string} Formatted full date
 */
function formatFullDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Expose functions to global scope
window.CashFlow = {
  generateCashFlowProjection,
  getOccurrences,
  advanceByFrequency,
  calculateSafeToSpend,
  getBillsAging,
  getUpcomingTransactions,
  formatShortDate,
  formatFullDate
};
