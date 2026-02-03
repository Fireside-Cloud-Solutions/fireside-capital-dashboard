// categorizer.js - AI-Powered Transaction Categorization
// Security: OpenAI API calls are proxied through the backend (/api/categorize-transaction)
//           to keep the API key secure. Never call OpenAI directly from frontend code.

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
  'other'
];

// Categorize a single transaction using OpenAI
async function categorizeTransaction(transaction) {
  try {
    // Check for learned patterns first
    const learned = await checkLearnedPattern(transaction.merchant_name);
    if (learned) {
      console.log(`[Categorizer] Using learned pattern for "${transaction.merchant_name}": ${learned.category}`);
      return {
        category: learned.category,
        confidence: learned.confidence,
        ai_generated: false
      };
    }
    
    // Call backend categorization endpoint (keeps API key secure)
    const response = await fetch('http://localhost:3000/api/categorize-transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        merchant_name: transaction.merchant_name || transaction.name,
        amount: transaction.amount
      })
    });
    
    if (!response.ok) {
      console.error(`[Categorizer] Backend error: ${response.status}`);
      return {
        category: 'other',
        confidence: 0.3,
        ai_generated: false
      };
    }
    
    const result = await response.json();
    console.log(`[Categorizer] AI categorized "${transaction.merchant_name || transaction.name}" as "${result.category}" (confidence: ${result.confidence})`);
    
    return result;
    
  } catch (error) {
    console.error('Categorization error:', error);
    return { category: 'other', confidence: 0, ai_generated: false };
  }
}

// Batch categorize multiple transactions
async function categorizeTransactionsBatch(transactions) {
  console.log(`[Categorizer] Categorizing ${transactions.length} transactions...`);
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
  
  console.log(`[Categorizer] Categorization complete`);
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
    
    console.log(`[Categorizer] Learning pattern: "${merchantPattern}" -> ${category}`);
    
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
    
    console.log(`[Categorizer] Pattern learned successfully`);
    
  } catch (error) {
    console.error('Learn pattern error:', error);
  }
}
