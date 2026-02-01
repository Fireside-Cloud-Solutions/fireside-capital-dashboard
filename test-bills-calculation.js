// Test bills calculation fix
// Based on bug report data

function getRaw(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0;
  return 0;
}

function normalizeToMonthly(amount, frequency) {
  const rawAmount = getRaw(amount);
  const freq = (frequency || '').toLowerCase();
  switch (freq) {
    case 'daily': return rawAmount * 30;
    case 'weekly': return rawAmount * 52 / 12;
    case 'bi-weekly': return rawAmount * 26 / 12;
    case 'twice monthly': return rawAmount * 2;
    case 'semi-monthly': return rawAmount * 2;
    case 'monthly': return rawAmount;
    case 'quarterly': return rawAmount / 3;
    case 'annually': return rawAmount / 12;
    case 'annual': return rawAmount / 12;
    default:
      console.warn(`Unknown frequency: ${frequency}, defaulting to monthly`);
      return rawAmount;
  }
}

// Test data from bug report
const bills = [
  { name: 'Sewage', amount: 117.00, frequency: 'monthly', shared: false },
  { name: 'Big Green Egg', amount: 324.52, frequency: 'monthly', shared: false },
  { name: 'XGIMI', amount: 136.36, frequency: 'monthly', shared: false },
  { name: 'Internet', amount: 99.99, frequency: 'monthly', shared: true, userAmount: 0 },
  { name: 'Mortgage', amount: 2124.80, frequency: 'monthly', shared: false },
  { name: 'HOA Fees', amount: 170.00, frequency: 'monthly', shared: true, userAmount: 85.00 },
  { name: 'Cell Phone', amount: 200.51, frequency: 'monthly', shared: false },
  { name: 'USC Rec', amount: 52.00, frequency: 'monthly', shared: false },
  { name: 'BMW Payment', amount: 1534.00, frequency: 'monthly', shared: false },
  { name: 'BMW 430i', amount: 411.00, frequency: 'monthly', shared: false },
  { name: 'Chevy Tahoe', amount: 636.88, frequency: 'monthly', shared: false },
  { name: 'American Water', amount: 101.03, frequency: 'monthly', shared: false },
  { name: 'West Penn Power', amount: 87.44, frequency: 'monthly', shared: false },
  { name: 'Peoples Gas', amount: 133.64, frequency: 'monthly', shared: false }
];

console.log('=== BILL CALCULATION TEST ===\n');

let total = 0;
bills.forEach(b => {
  const userAmount = b.shared ? b.userAmount : b.amount;
  const monthlyAmount = normalizeToMonthly(userAmount, b.frequency);
  total += monthlyAmount;
  console.log(`${b.name.padEnd(20)} $${b.amount.toFixed(2).padStart(10)} (${b.frequency}) → Monthly: $${monthlyAmount.toFixed(2).padStart(10)}`);
  if (b.shared) {
    console.log(`${' '.repeat(20)} User share: $${userAmount.toFixed(2)}`);
  }
});

console.log('\n' + '='.repeat(60));
console.log(`TOTAL MONTHLY BILLS: $${total.toFixed(2)}`);
console.log('Expected from manual calc: $5,944.18');
console.log('Old buggy display showed: $6,337.59');
console.log(`Difference from expected: $${(total - 5944.18).toFixed(2)}`);
