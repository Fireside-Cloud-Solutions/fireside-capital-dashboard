/**
 * Check all type/frequency enums in database
 */

const { Client } = require('pg');
require('dotenv').config();

async function checkAllTypes() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Assets types
    console.log('\n📦 ASSETS - type field:');
    const assets = await client.query('SELECT DISTINCT type FROM public.assets WHERE type IS NOT NULL');
    assets.rows.forEach(r => console.log(`  - "${r.type}"`));
    
    // Bills types and frequencies
    console.log('\n📄 BILLS - type field:');
    const billTypes = await client.query('SELECT DISTINCT type FROM public.bills WHERE type IS NOT NULL');
    billTypes.rows.forEach(r => console.log(`  - "${r.type}"`));
    
    console.log('\n📄 BILLS - frequency field:');
    const billFreq = await client.query('SELECT DISTINCT frequency FROM public.bills WHERE frequency IS NOT NULL');
    billFreq.rows.forEach(r => console.log(`  - "${r.frequency}"`));
    
    // Debts types
    console.log('\n💳 DEBTS - type field:');
    const debts = await client.query('SELECT DISTINCT type FROM public.debts WHERE type IS NOT NULL');
    debts.rows.forEach(r => console.log(`  - "${r.type}"`));
    
    // Income types and frequencies
    console.log('\n💰 INCOME - type field:');
    const incomeTypes = await client.query('SELECT DISTINCT type FROM public.income WHERE type IS NOT NULL');
    incomeTypes.rows.forEach(r => console.log(`  - "${r.type}"`));
    
    console.log('\n💰 INCOME - frequency field:');
    const incomeFreq = await client.query('SELECT DISTINCT frequency FROM public.income WHERE frequency IS NOT NULL');
    incomeFreq.rows.forEach(r => console.log(`  - "${r.frequency}"`));
    
    // Investments types
    console.log('\n📈 INVESTMENTS - type field:');
    const investments = await client.query('SELECT DISTINCT type FROM public.investments WHERE type IS NOT NULL');
    investments.rows.forEach(r => console.log(`  - "${r.type}"`));
    
    // Budgets item_type
    console.log('\n💵 BUDGETS - item_type field:');
    const budgets = await client.query('SELECT DISTINCT item_type FROM public.budgets WHERE item_type IS NOT NULL');
    budgets.rows.forEach(r => console.log(`  - "${r.item_type}"`));
    
    console.log('\n');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkAllTypes();
