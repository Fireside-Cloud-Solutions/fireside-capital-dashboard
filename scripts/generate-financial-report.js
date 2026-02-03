#!/usr/bin/env node

/**
 * Fireside Capital — Discord Financial Report Generator
 * 
 * Generates weekly/monthly financial summaries and posts to Discord #reports channel
 * Can be run manually or scheduled via cron
 * 
 * Usage:
 *   node scripts/generate-financial-report.js [weekly|monthly]
 * 
 * Environment Variables:
 *   SUPABASE_URL - Supabase project URL
 *   SUPABASE_KEY - Supabase anon/service key
 *   DISCORD_WEBHOOK_URL - Discord webhook URL for #reports channel
 */

const https = require('https');
const { URL } = require('url');

// ===== CONFIGURATION =====
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qqtiofdqplwycnwplmen.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const USER_ID = process.env.USER_ID; // Target user ID (for multi-user future support)

// Report type: 'weekly' or 'monthly'
const REPORT_TYPE = process.argv[2] || 'weekly';

// ===== UTILITY FUNCTIONS =====

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

function formatPercent(value) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ===== SUPABASE QUERIES =====

async function supabaseQuery(table, params = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
    
    // Add query parameters
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

async function fetchFinancialData() {
  const [assets, investments, debts, bills, income, snapshots] = await Promise.all([
    supabaseQuery('assets', { select: '*' }),
    supabaseQuery('investments', { select: '*' }),
    supabaseQuery('debts', { select: '*' }),
    supabaseQuery('bills', { select: '*' }),
    supabaseQuery('income', { select: '*' }),
    supabaseQuery('snapshots', { select: '*', order: 'created_at.desc', limit: '30' })
  ]);

  return { assets, investments, debts, bills, income, snapshots };
}

// ===== CALCULATION FUNCTIONS =====

function calculateTotalAssets(assets) {
  return assets.reduce((sum, a) => sum + (a.value || 0), 0);
}

function calculateTotalInvestments(investments) {
  return investments.reduce((sum, inv) => sum + (inv.starting_balance || 0), 0);
}

function calculateTotalDebts(debts) {
  return debts.reduce((sum, d) => sum + (d.balance || 0), 0);
}

function normalizeToMonthly(amount, frequency) {
  const frequencyMap = {
    'daily': 30,
    'weekly': 4.33,
    'bi-weekly': 2.17,
    'monthly': 1,
    'quarterly': 1/3,
    'semi-annual': 1/6,
    'annual': 1/12,
    'one-time': 0
  };
  return amount * (frequencyMap[frequency] || 1);
}

function calculateMonthlyBills(bills) {
  return bills
    .filter(b => b.frequency !== 'one-time')
    .reduce((sum, b) => sum + normalizeToMonthly(b.amount || 0, b.frequency), 0);
}

function calculateMonthlyIncome(income) {
  return income
    .filter(i => i.frequency !== 'one-time')
    .reduce((sum, i) => sum + normalizeToMonthly(i.amount || 0, i.frequency), 0);
}

function calculateNetWorth(assets, investments, debts) {
  const totalAssets = calculateTotalAssets(assets);
  const totalInvestments = calculateTotalInvestments(investments);
  const totalDebts = calculateTotalDebts(debts);
  return totalAssets + totalInvestments - totalDebts;
}

function calculateNetWorthTrend(snapshots, days) {
  if (snapshots.length < 2) return null;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const recentSnapshots = snapshots
    .filter(s => new Date(s.created_at) >= cutoffDate)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  if (recentSnapshots.length < 2) return null;

  const oldest = recentSnapshots[0].net_worth;
  const newest = recentSnapshots[recentSnapshots.length - 1].net_worth;
  
  const change = newest - oldest;
  const percentChange = oldest !== 0 ? (change / Math.abs(oldest)) * 100 : 0;

  return { change, percentChange, oldest, newest };
}

function getUpcomingBills(bills, days = 7) {
  const today = new Date();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + days);

  return bills
    .filter(b => {
      if (!b.due_date) return false;
      const dueDate = new Date(b.due_date);
      return dueDate >= today && dueDate <= cutoff;
    })
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
}

// ===== REPORT GENERATION =====

async function generateWeeklyReport(data) {
  const { assets, investments, debts, bills, income, snapshots } = data;

  const netWorth = calculateNetWorth(assets, investments, debts);
  const weeklyTrend = calculateNetWorthTrend(snapshots, 7);
  const monthlyBills = calculateMonthlyBills(bills);
  const monthlyIncome = calculateMonthlyIncome(income);
  const monthlyCashFlow = monthlyIncome - monthlyBills;
  const upcomingBills = getUpcomingBills(bills, 7);

  // Build Discord embed
  const embed = {
    title: '📊 Weekly Financial Summary',
    description: `Report generated on ${formatDate(new Date())}`,
    color: 0x01a4ef, // Fireside blue
    fields: [
      {
        name: '💰 Net Worth',
        value: formatCurrency(netWorth),
        inline: true
      },
      {
        name: '📈 7-Day Change',
        value: weeklyTrend 
          ? `${formatCurrency(weeklyTrend.change)} (${formatPercent(weeklyTrend.percentChange)})`
          : 'Not enough data',
        inline: true
      },
      {
        name: '💵 Monthly Cash Flow',
        value: `${formatCurrency(monthlyCashFlow)} (${monthlyIncome > 0 ? formatPercent((monthlyCashFlow / monthlyIncome) * 100) : '—'})`,
        inline: true
      },
      {
        name: '🏠 Assets',
        value: formatCurrency(calculateTotalAssets(assets)),
        inline: true
      },
      {
        name: '📊 Investments',
        value: formatCurrency(calculateTotalInvestments(investments)),
        inline: true
      },
      {
        name: '💳 Debts',
        value: formatCurrency(calculateTotalDebts(debts)),
        inline: true
      },
      {
        name: '💸 Monthly Bills',
        value: formatCurrency(monthlyBills),
        inline: true
      },
      {
        name: '💰 Monthly Income',
        value: formatCurrency(monthlyIncome),
        inline: true
      },
      {
        name: '\u200B', // Spacer
        value: '\u200B',
        inline: true
      }
    ],
    footer: {
      text: 'Fireside Capital • Weekly Report'
    },
    timestamp: new Date().toISOString()
  };

  // Add upcoming bills section if any
  if (upcomingBills.length > 0) {
    const billsList = upcomingBills
      .slice(0, 5) // Max 5 bills
      .map(b => `• **${b.name}** — ${formatCurrency(b.amount)} due ${formatDate(b.due_date)}`)
      .join('\n');
    
    embed.fields.push({
      name: '⏰ Upcoming Bills (Next 7 Days)',
      value: billsList + (upcomingBills.length > 5 ? `\n...and ${upcomingBills.length - 5} more` : ''),
      inline: false
    });
  }

  return { embeds: [embed] };
}

async function generateMonthlyReport(data) {
  const { assets, investments, debts, bills, income, snapshots } = data;

  const netWorth = calculateNetWorth(assets, investments, debts);
  const monthlyTrend = calculateNetWorthTrend(snapshots, 30);
  const monthlyBills = calculateMonthlyBills(bills);
  const monthlyIncome = calculateMonthlyIncome(income);
  const monthlyCashFlow = monthlyIncome - monthlyBills;

  // Top spending categories
  const billsByCategory = bills.reduce((acc, b) => {
    const category = b.type || 'Other';
    acc[category] = (acc[category] || 0) + normalizeToMonthly(b.amount || 0, b.frequency);
    return acc;
  }, {});

  const topCategories = Object.entries(billsByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, amt]) => `• **${cat}** — ${formatCurrency(amt)}`)
    .join('\n');

  const embed = {
    title: '📊 Monthly Financial Summary',
    description: `Report generated on ${formatDate(new Date())}`,
    color: 0xf44e24, // Fireside orange
    fields: [
      {
        name: '💰 Net Worth',
        value: formatCurrency(netWorth),
        inline: true
      },
      {
        name: '📈 30-Day Change',
        value: monthlyTrend 
          ? `${formatCurrency(monthlyTrend.change)} (${formatPercent(monthlyTrend.percentChange)})`
          : 'Not enough data',
        inline: true
      },
      {
        name: '💵 Monthly Cash Flow',
        value: `${formatCurrency(monthlyCashFlow)}`,
        inline: true
      },
      {
        name: '🏠 Total Assets',
        value: formatCurrency(calculateTotalAssets(assets)),
        inline: true
      },
      {
        name: '📊 Total Investments',
        value: formatCurrency(calculateTotalInvestments(investments)),
        inline: true
      },
      {
        name: '💳 Total Debts',
        value: formatCurrency(calculateTotalDebts(debts)),
        inline: true
      },
      {
        name: '💸 Monthly Bills',
        value: formatCurrency(monthlyBills) + ` (${bills.length} bills)`,
        inline: true
      },
      {
        name: '💰 Monthly Income',
        value: formatCurrency(monthlyIncome) + ` (${income.length} sources)`,
        inline: true
      },
      {
        name: '📊 Savings Rate',
        value: monthlyIncome > 0 ? formatPercent((monthlyCashFlow / monthlyIncome) * 100) : '—',
        inline: true
      },
      {
        name: '💰 Top Spending Categories',
        value: topCategories || 'No bills tracked',
        inline: false
      }
    ],
    footer: {
      text: 'Fireside Capital • Monthly Report'
    },
    timestamp: new Date().toISOString()
  };

  return { embeds: [embed] };
}

// ===== DISCORD POSTING =====

async function postToDiscord(payload) {
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
          resolve({ success: true, status: res.statusCode });
        } else {
          reject(new Error(`Discord webhook error (${res.statusCode}): ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify(payload));
    req.end();
  });
}

// ===== MAIN =====

async function main() {
  console.log(`[Report Generator] Starting ${REPORT_TYPE} report generation...`);

  // Validate environment
  if (!SUPABASE_KEY) {
    throw new Error('SUPABASE_KEY environment variable not set');
  }
  if (!DISCORD_WEBHOOK_URL) {
    throw new Error('DISCORD_WEBHOOK_URL environment variable not set');
  }

  // Fetch data
  console.log('[Report Generator] Fetching financial data from Supabase...');
  const data = await fetchFinancialData();
  console.log(`[Report Generator] Loaded: ${data.assets.length} assets, ${data.bills.length} bills, ${data.snapshots.length} snapshots`);

  // Generate report
  console.log(`[Report Generator] Generating ${REPORT_TYPE} report...`);
  const report = REPORT_TYPE === 'monthly' 
    ? await generateMonthlyReport(data)
    : await generateWeeklyReport(data);

  // Post to Discord
  console.log('[Report Generator] Posting to Discord...');
  await postToDiscord(report);
  console.log('✅ [Report Generator] Report posted successfully!');
}

// Run
main().catch(err => {
  console.error('❌ [Report Generator] Error:', err.message);
  process.exit(1);
});
