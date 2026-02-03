// scripts/categorize-transactions.js
// Helper script for Capital to categorize uncategorized transactions

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = 'https://qqtiofdqplwycnwplmen.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const CATEGORIES = [
  'dining',
  'groceries',
  'transportation',
  'utilities',
  'entertainment',
  'shopping',
  'healthcare',
  'travel',
  'bills',
  'income',
  'other'
];

/**
 * Get all uncategorized transactions
 */
async function getUncategorizedTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('category', 'uncategorized')
    .order('date', { ascending: false });
  
  if (error) {
    console.error('Error fetching uncategorized transactions:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Update a transaction's category
 */
async function updateTransactionCategory(id, category, confidence) {
  const { error } = await supabase
    .from('transactions')
    .update({ 
      category,
      confidence,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);
  
  if (error) {
    console.error(`Error updating transaction ${id}:`, error);
    return false;
  }
  
  return true;
}

/**
 * Learn a category pattern for future use
 */
async function learnPattern(merchantName, category, confidence) {
  const { error } = await supabase
    .from('transaction_category_patterns')
    .upsert({
      merchant_name: merchantName,
      category,
      confidence,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'merchant_name'
    });
  
  if (error) {
    console.error(`Error learning pattern for ${merchantName}:`, error);
  }
}

/**
 * Main function - to be called by Capital with categorization decisions
 * 
 * @param {Array} categorizations - Array of { id, category, confidence, merchantName }
 */
async function applyCategorizations(categorizations) {
  console.log(`Applying ${categorizations.length} categorizations...`);
  
  let successCount = 0;
  
  for (const cat of categorizations) {
    const success = await updateTransactionCategory(cat.id, cat.category, cat.confidence);
    if (success) {
      successCount++;
      
      // Learn the pattern for future transactions
      if (cat.merchantName) {
        await learnPattern(cat.merchantName, cat.category, cat.confidence);
      }
    }
  }
  
  console.log(`✅ Successfully categorized ${successCount}/${categorizations.length} transactions`);
  return { success: successCount, total: categorizations.length };
}

module.exports = {
  getUncategorizedTransactions,
  applyCategorizations
};

// If run directly from command line
if (require.main === module) {
  getUncategorizedTransactions().then(transactions => {
    console.log(`Found ${transactions.length} uncategorized transactions:`);
    transactions.forEach(t => {
      console.log(`- ${t.date}: ${t.merchant_name} ($${Math.abs(t.amount).toFixed(2)})`);
    });
  });
}
