// categorizer.js - Transaction Categorization (Pattern Matching + Capital AI Agent)
// Uses learned patterns to categorize known merchants instantly.
// Uncategorized transactions are processed by Capital (Clawdbot AI agent) on demand.

// Debug mode (set to true for development logging)
const DEBUG_CATEGORIZER = false;
function debugLog(...args) { if (DEBUG_CATEGORIZER) console.log('[Categorizer]', ...args); }

// Standard categories (must match transactions.js)
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
  'other',
  'uncategorized'
];

/**
 * Categorize a single transaction using learned patterns only.
 * Does NOT call external APIs - uncategorized transactions are handled by Capital.
 * 
 * @param {Object} transaction - Transaction object with merchant_name, amount, etc.
 * @returns {Object} { category, confidence, ai_generated }
 */
async function categorizeTransaction(transaction) {
  try {
    // Check for learned patterns first
    const learned = await checkLearnedPattern(transaction.merchant_name);
    if (learned) {
      debugLog(`Using learned pattern for "${transaction.merchant_name}": ${learned.category}`);
      return {
        category: learned.category,
        confidence: learned.confidence,
        ai_generated: false
      };
    }
    
    // No pattern found - mark as uncategorized for Capital to process later
    debugLog(`No pattern for "${transaction.merchant_name}" - marking uncategorized`);
    return {
      category: 'uncategorized',
      confidence: 0.0,
      ai_generated: false
    };
    
  } catch (error) {
    console.error('[Categorizer] Error checking patterns:', error);
    return {
      category: 'uncategorized',
      confidence: 0.0,
      ai_generated: false
    };
  }
}

// Batch categorize multiple transactions
async function categorizeTransactionsBatch(transactions) {
  debugLog(`Categorizing ${transactions.length} transactions...`);
  const results = [];
  
  for (const t of transactions) {
    const result = await categorizeTransaction(t);
    results.push({
      ...t,
      category: result.category,
      confidence: result.confidence
    });
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  debugLog('Categorization complete');
  return results;
}

// Check learned patterns
async function checkLearnedPattern(merchantName) {
  try {
    const user = await sb.auth.getUser();
    if (!user.data.user) return null;
    
    // Normalize merchant name for pattern matching
    const pattern = merchantName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const { data, error } = await sb
      .from('transaction_category_patterns')
      .select('*')
      .eq('user_id', user.data.user.id)
      .ilike('merchant_pattern', `%${pattern}%`)
      .order('confidence', { ascending: false })
      .limit(1);
    
    if (error || !data || data.length === 0) return null;
    
    return data[0];
    
  } catch (error) {
    console.error('Pattern check error:', error);
    return null;
  }
}

// Learn from user correction
async function learnCategoryPattern(transactionId, category) {
  try {
    const user = await sb.auth.getUser();
    if (!user.data.user) return;
    
    // Get transaction
    const { data: transaction } = await sb
      .from('transactions')
      .select('merchant_name, name')
      .eq('id', transactionId)
      .single();
    
    if (!transaction) return;
    
    // Normalize merchant name for pattern storage
    const merchantPattern = (transaction.merchant_name || transaction.name)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    
    debugLog(`Learning pattern: "${merchantPattern}" -> ${category}`);
    
    // Check if pattern already exists
    const { data: existing } = await sb
      .from('transaction_category_patterns')
      .select('*')
      .eq('user_id', user.data.user.id)
      .eq('merchant_pattern', merchantPattern)
      .eq('category', category)
      .single();
    
    if (existing) {
      // Update existing pattern
      await sb
        .from('transaction_category_patterns')
        .update({
          confidence: Math.min(1.0, existing.confidence + 0.1),
          times_used: existing.times_used + 1,
          last_used: new Date().toISOString()
        })
        .eq('id', existing.id);
    } else {
      // Insert new pattern
      await sb
        .from('transaction_category_patterns')
        .insert({
          user_id: user.data.user.id,
          merchant_pattern: merchantPattern,
          category,
          confidence: 1.0,
          times_used: 1,
          last_used: new Date().toISOString()
        });
    }
    
    debugLog('Pattern learned successfully');
    
  } catch (error) {
    console.error('[Categorizer] Learn pattern error:', error);
  }
}
