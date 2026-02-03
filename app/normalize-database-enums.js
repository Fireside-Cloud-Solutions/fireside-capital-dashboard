/**
 * Normalize Database Enum Values
 * Standardizes type/frequency fields to lowercase kebab-case
 * 
 * Run this BEFORE adding enum constraints to database
 */

const { Client } = require('pg');
require('dotenv').config();

const NORMALIZATION_RULES = {
  // Assets types
  assets_type: {
    'realEstate': 'real-estate',
    'vehicle': 'vehicle',
    'other': 'other'
  },
  
  // Bills types
  bills_type: {
    'Housing': 'housing',
    'housing': 'housing',
    'Auto': 'auto',
    'auto': 'auto',
    'Utilities': 'utilities',
    'utilities': 'utilities',
    'Financing': 'financing',
    'financing': 'financing',
    'Health': 'health',
    'health': 'health',
    'Subscriptions': 'subscriptions',
    'subscriptions': 'subscriptions',
    'Other': 'other',
    'other': 'other'
  },
  
  // Bills frequency
  bills_frequency: {
    'Weekly': 'weekly',
    'weekly': 'weekly',
    'Bi-Weekly': 'bi-weekly',
    'bi-weekly': 'bi-weekly',
    'Semi-Monthly': 'semi-monthly',
    'semi-monthly': 'semi-monthly',
    'Monthly': 'monthly',
    'monthly': 'monthly',
    'Quarterly': 'quarterly',
    'quarterly': 'quarterly',
    'Semi-Annually': 'semi-annually',
    'semi-annually': 'semi-annually',
    'Annually': 'annually',
    'annually': 'annually'
  },
  
  // Debts types
  debts_type: {
    'Credit Card': 'credit-card',
    'credit-card': 'credit-card',
    'Student Loan': 'student-loan',
    'student-loan': 'student-loan',
    'Mortgage': 'mortgage',
    'mortgage': 'mortgage',
    'Auto Loan': 'auto-loan',
    'auto-loan': 'auto-loan',
    'Personal Loan': 'personal-loan',
    'personal-loan': 'personal-loan',
    'Other': 'other',
    'other': 'other'
  },
  
  // Income types
  income_type: {
    'W2': 'salary',
    '1099': 'freelance',
    'Salary': 'salary',
    'salary': 'salary',
    'Hourly': 'hourly',
    'hourly': 'hourly',
    'Commission': 'commission',
    'commission': 'commission',
    'Bonus': 'bonus',
    'bonus': 'bonus',
    'Freelance': 'freelance',
    'freelance': 'freelance',
    'Rental': 'rental',
    'rental': 'rental',
    'Investment': 'investment',
    'investment': 'investment',
    'Other': 'other',
    'other': 'other'
  },
  
  // Income frequency
  income_frequency: {
    'Weekly': 'weekly',
    'weekly': 'weekly',
    'Bi-Weekly': 'bi-weekly',
    'bi-weekly': 'bi-weekly',
    'Semi-Monthly': 'semi-monthly',
    'semi-monthly': 'semi-monthly',
    'Monthly': 'monthly',
    'monthly': 'monthly',
    'Quarterly': 'quarterly',
    'quarterly': 'quarterly',
    'Annually': 'annually',
    'annually': 'annually'
  },
  
  // Investments types
  investments_type: {
    '401(k)': '401k',
    '401k': '401k',
    'IRA': 'ira',
    'ira': 'ira',
    'Roth IRA': 'roth-ira',
    'roth-ira': 'roth-ira',
    'Brokerage': 'brokerage',
    'brokerage': 'brokerage',
    'Savings': 'savings',
    'savings': 'savings',
    'CD': 'cd',
    'cd': 'cd',
    'Crypto': 'crypto',
    'crypto': 'crypto',
    'Stock': 'brokerage', // Map "Stock" to brokerage
    'Other': 'other',
    'other': 'other'
  }
};

async function normalizeEnums() {
  console.log('🔧 Starting database enum normalization...\n');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    let totalUpdates = 0;
    
    // Assets type
    console.log('📦 Normalizing assets.type...');
    for (const [oldValue, newValue] of Object.entries(NORMALIZATION_RULES.assets_type)) {
      if (oldValue !== newValue) {
        const result = await client.query(
          'UPDATE public.assets SET type = $1 WHERE type = $2',
          [newValue, oldValue]
        );
        if (result.rowCount > 0) {
          console.log(`  - Updated ${result.rowCount} rows: "${oldValue}" → "${newValue}"`);
          totalUpdates += result.rowCount;
        }
      }
    }
    
    // Bills type
    console.log('\n📄 Normalizing bills.type...');
    for (const [oldValue, newValue] of Object.entries(NORMALIZATION_RULES.bills_type)) {
      if (oldValue !== newValue) {
        const result = await client.query(
          'UPDATE public.bills SET type = $1 WHERE type = $2',
          [newValue, oldValue]
        );
        if (result.rowCount > 0) {
          console.log(`  - Updated ${result.rowCount} rows: "${oldValue}" → "${newValue}"`);
          totalUpdates += result.rowCount;
        }
      }
    }
    
    // Bills frequency
    console.log('\n📄 Normalizing bills.frequency...');
    for (const [oldValue, newValue] of Object.entries(NORMALIZATION_RULES.bills_frequency)) {
      if (oldValue !== newValue) {
        const result = await client.query(
          'UPDATE public.bills SET frequency = $1 WHERE frequency = $2',
          [newValue, oldValue]
        );
        if (result.rowCount > 0) {
          console.log(`  - Updated ${result.rowCount} rows: "${oldValue}" → "${newValue}"`);
          totalUpdates += result.rowCount;
        }
      }
    }
    
    // Debts type
    console.log('\n💳 Normalizing debts.type...');
    for (const [oldValue, newValue] of Object.entries(NORMALIZATION_RULES.debts_type)) {
      if (oldValue !== newValue) {
        const result = await client.query(
          'UPDATE public.debts SET type = $1 WHERE type = $2',
          [newValue, oldValue]
        );
        if (result.rowCount > 0) {
          console.log(`  - Updated ${result.rowCount} rows: "${oldValue}" → "${newValue}"`);
          totalUpdates += result.rowCount;
        }
      }
    }
    
    // Income type
    console.log('\n💰 Normalizing income.type...');
    for (const [oldValue, newValue] of Object.entries(NORMALIZATION_RULES.income_type)) {
      if (oldValue !== newValue) {
        const result = await client.query(
          'UPDATE public.income SET type = $1 WHERE type = $2',
          [newValue, oldValue]
        );
        if (result.rowCount > 0) {
          console.log(`  - Updated ${result.rowCount} rows: "${oldValue}" → "${newValue}"`);
          totalUpdates += result.rowCount;
        }
      }
    }
    
    // Income frequency
    console.log('\n💰 Normalizing income.frequency...');
    for (const [oldValue, newValue] of Object.entries(NORMALIZATION_RULES.income_frequency)) {
      if (oldValue !== newValue) {
        const result = await client.query(
          'UPDATE public.income SET frequency = $1 WHERE frequency = $2',
          [newValue, oldValue]
        );
        if (result.rowCount > 0) {
          console.log(`  - Updated ${result.rowCount} rows: "${oldValue}" → "${newValue}"`);
          totalUpdates += result.rowCount;
        }
      }
    }
    
    // Investments type
    console.log('\n📈 Normalizing investments.type...');
    for (const [oldValue, newValue] of Object.entries(NORMALIZATION_RULES.investments_type)) {
      if (oldValue !== newValue) {
        const result = await client.query(
          'UPDATE public.investments SET type = $1 WHERE type = $2',
          [newValue, oldValue]
        );
        if (result.rowCount > 0) {
          console.log(`  - Updated ${result.rowCount} rows: "${oldValue}" → "${newValue}"`);
          totalUpdates += result.rowCount;
        }
      }
    }
    
    console.log(`\n\n🎉 Normalization complete! Total updates: ${totalUpdates}`);
    
    // Verify
    console.log('\n🔍 Verifying normalized values...\n');
    
    const verifyQueries = [
      { name: 'Assets types', query: 'SELECT DISTINCT type FROM public.assets ORDER BY type' },
      { name: 'Bills types', query: 'SELECT DISTINCT type FROM public.bills ORDER BY type' },
      { name: 'Bills frequencies', query: 'SELECT DISTINCT frequency FROM public.bills ORDER BY frequency' },
      { name: 'Debts types', query: 'SELECT DISTINCT type FROM public.debts ORDER BY type' },
      { name: 'Income types', query: 'SELECT DISTINCT type FROM public.income ORDER BY type' },
      { name: 'Income frequencies', query: 'SELECT DISTINCT frequency FROM public.income ORDER BY frequency' },
      { name: 'Investments types', query: 'SELECT DISTINCT type FROM public.investments ORDER BY type' }
    ];
    
    for (const { name, query } of verifyQueries) {
      const result = await client.query(query);
      console.log(`${name}:`);
      result.rows.forEach(row => {
        const value = Object.values(row)[0];
        console.log(`  - "${value}"`);
      });
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

normalizeEnums();
