#!/usr/bin/env node

/**
 * Fireside Capital — Automatic Monthly Budget Generation
 * 
 * Automatically creates a new month's budget based on the previous month's allocations
 * Designed to run on the 1st of each month via cron
 * 
 * Features:
 * - Copies previous month's budget assignments
 * - Creates budget entries for all active bills/income
 * - Skips one-time bills that were already paid
 * - Posts notification to Discord when complete
 * 
 * Usage:
 *   node scripts/generate-monthly-budget.js [YYYY-MM]
 * 
 * Environment Variables:
 *   SUPABASE_URL - Supabase project URL
 *   SUPABASE_KEY - Supabase anon/service key
 *   DISCORD_WEBHOOK_URL - (optional) Discord webhook for notifications
 */

const https = require('https');
const { URL } = require('url');

// ===== CONFIGURATION =====
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qqtiofdqplwycnwplmen.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

// Target month (defaults to current month, or pass YYYY-MM as first argument)
const TARGET_MONTH = process.argv[2] || new Date().toISOString().slice(0, 7);

// ===== UTILITY FUNCTIONS =====

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

function getPreviousMonth(yearMonth) {
  const [year, month] = yearMonth.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  date.setMonth(date.getMonth() - 1);
  return date.toISOString().slice(0, 7); // YYYY-MM
}

// ===== SUPABASE FUNCTIONS =====

async function supabaseQuery(table, params = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const options = {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(`Supabase error: ${parsed.message || data}`));
          } else {
            resolve(parsed);
          }
        } catch (err) {
          reject(new Error(`Failed to parse response: ${err.message}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function supabaseInsert(table, records) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
    
    const options = {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`Supabase insert error: ${parsed.message || data}`));
          }
        } catch (err) {
          reject(new Error(`Failed to parse response: ${err.message}`));
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify(records));
    req.end();
  });
}

// ===== BUDGET GENERATION LOGIC =====

function normalizeToMonthly(amount, frequency) {
  const frequencyMap = {
    'daily': 30,
    'weekly': 4.33,
    'bi-weekly': 2.17,
    'monthly': 1,
    'quarterly': 1/3,
    'semi-annual': 1/6,
    'annual': 1/12,
    'one-time': 0 // Skip one-time bills
  };
  return amount * (frequencyMap[frequency] || 1);
}

async function generateBudget(targetMonth) {
  console.log(`[Budget Generator] Generating budget for ${targetMonth}...`);

  // 1. Check if budget already exists for target month
  const existingBudget = await supabaseQuery('budgets', {
    select: 'id',
    month: `eq.${targetMonth}`,
    limit: '1'
  });

  if (existingBudget.length > 0) {
    console.log(`⚠️  Budget for ${targetMonth} already exists. Skipping.`);
    return { skipped: true, reason: 'already_exists' };
  }

  // 2. Fetch previous month's budget (if exists)
  const previousMonth = getPreviousMonth(targetMonth);
  const previousBudget = await supabaseQuery('budgets', {
    select: '*',
    month: `eq.${previousMonth}`
  });

  console.log(`[Budget Generator] Found ${previousBudget.length} assignments from ${previousMonth}`);

  // 3. Fetch all active bills and income
  const [bills, income] = await Promise.all([
    supabaseQuery('bills', { select: '*' }),
    supabaseQuery('income', { select: '*' })
  ]);

  console.log(`[Budget Generator] Found ${bills.length} bills, ${income.length} income sources`);

  // 4. Build budget assignments
  const budgetAssignments = [];

  // Add bills
  bills
    .filter(b => b.frequency !== 'one-time') // Skip one-time bills
    .forEach(bill => {
      const monthlyAmount = normalizeToMonthly(bill.amount || 0, bill.frequency);
      
      // Check if there was a previous budget override
      const previousAssignment = previousBudget.find(a => a.item_id === bill.id && a.item_type === 'bill');
      const budgetAmount = previousAssignment?.amount || monthlyAmount;

      budgetAssignments.push({
        month: targetMonth,
        item_type: 'bill',
        item_id: bill.id,
        item_name: bill.name,
        amount: budgetAmount,
        actual_amount: 0, // Will be updated as payments are made
        category: bill.type || 'Other'
      });
    });

  // Add income
  income
    .filter(i => i.frequency !== 'one-time')
    .forEach(inc => {
      const monthlyAmount = normalizeToMonthly(inc.amount || 0, inc.frequency);
      
      const previousAssignment = previousBudget.find(a => a.item_id === inc.id && a.item_type === 'income');
      const budgetAmount = previousAssignment?.amount || monthlyAmount;

      budgetAssignments.push({
        month: targetMonth,
        item_type: 'income',
        item_id: inc.id,
        item_name: inc.name,
        amount: budgetAmount,
        actual_amount: 0,
        category: inc.type || 'Other'
      });
    });

  console.log(`[Budget Generator] Created ${budgetAssignments.length} budget assignments`);

  // 5. Insert budget into database
  if (budgetAssignments.length > 0) {
    await supabaseInsert('budgets', budgetAssignments);
    console.log('✅ [Budget Generator] Budget inserted successfully');
  } else {
    console.log('⚠️  No budget assignments to create (no active bills/income)');
    return { skipped: true, reason: 'no_items' };
  }

  // 6. Calculate totals
  const totalBudgetedIncome = budgetAssignments
    .filter(a => a.item_type === 'income')
    .reduce((sum, a) => sum + a.amount, 0);

  const totalBudgetedExpenses = budgetAssignments
    .filter(a => a.item_type === 'bill')
    .reduce((sum, a) => sum + a.amount, 0);

  const projectedSavings = totalBudgetedIncome - totalBudgetedExpenses;

  return {
    success: true,
    month: targetMonth,
    itemCount: budgetAssignments.length,
    totalIncome: totalBudgetedIncome,
    totalExpenses: totalBudgetedExpenses,
    projectedSavings: projectedSavings
  };
}

// ===== DISCORD NOTIFICATION =====

async function notifyDiscord(result) {
  if (!DISCORD_WEBHOOK_URL) {
    console.log('[Budget Generator] No Discord webhook configured, skipping notification');
    return;
  }

  let message;

  if (result.skipped) {
    if (result.reason === 'already_exists') {
      message = `⚠️  Budget for **${result.month}** already exists. Skipping generation.`;
    } else if (result.reason === 'no_items') {
      message = `⚠️  No active bills or income to budget for **${result.month}**.`;
    }
  } else {
    message = `✅ **Budget Generated for ${result.month}**\n\n` +
      `📊 **${result.itemCount} items** budgeted\n` +
      `💰 **Income:** ${formatCurrency(result.totalIncome)}\n` +
      `💸 **Expenses:** ${formatCurrency(result.totalExpenses)}\n` +
      `💵 **Projected Savings:** ${formatCurrency(result.projectedSavings)} ` +
      `(${result.totalIncome > 0 ? ((result.projectedSavings / result.totalIncome) * 100).toFixed(1) : 0}%)`;
  }

  const payload = {
    content: message,
    username: 'Fireside Capital',
    avatar_url: 'https://orange-river-0823ed310.2.azurestaticapps.net/assets/img/fireside-logo.png'
  };

  return new Promise((resolve, reject) => {
    const url = new URL(DISCORD_WEBHOOK_URL);
    
    const options = {
      method: 'POST',
      hostname: url.hostname,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('[Budget Generator] Discord notification sent');
          resolve({ success: true });
        } else {
          console.warn(`[Budget Generator] Discord notification failed (${res.statusCode})`);
          resolve({ success: false });
        }
      });
    });

    req.on('error', err => {
      console.warn(`[Budget Generator] Discord notification error: ${err.message}`);
      resolve({ success: false });
    });

    req.write(JSON.stringify(payload));
    req.end();
  });
}

// ===== MAIN =====

async function main() {
  console.log('[Budget Generator] Starting automatic budget generation...');
  console.log(`[Budget Generator] Target month: ${TARGET_MONTH}`);

  // Validate environment
  if (!SUPABASE_KEY) {
    throw new Error('SUPABASE_KEY environment variable not set');
  }

  // Generate budget
  const result = await generateBudget(TARGET_MONTH);

  // Notify Discord
  if (!result.skipped) {
    await notifyDiscord(result);
  }

  console.log('[Budget Generator] Complete!');
}

// Run
main().catch(err => {
  console.error('❌ [Budget Generator] Error:', err.message);
  process.exit(1);
});
