// categorizer.js - AI-Powered Transaction Categorization

const OPENAI_API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY';  // TODO: Move to backend for security

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
    
    // Use OpenAI for unknown merchants
    const prompt = `Categorize this transaction into ONE of these categories: dining, groceries, transportation, utilities, entertainment, shopping, healthcare, travel, bills, income, other.

Merchant: ${transaction.merchant_name || transaction.name}
Amount: $${Math.abs(transaction.amount).toFixed(2)}

Respond with ONLY the category name (lowercase, one word).`;

    const response = await fetch(OPENAI_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 10
      })
    });
    
    if (!response.ok) {
      console.warn('[Categorizer] OpenAI API error, falling back to "other"');
      return { category: 'other', confidence: 0, ai_generated: false };
    }
    
    const data = await response.json();
    const category = data.choices[0].message.content.trim().toLowerCase();
    
    // Validate category
    if (!CATEGORIES.includes(category)) {
      console.warn(`[Categorizer] Invalid category "${category}", using "other"`);
      return { category: 'other', confidence: 0, ai_generated: false };
    }
    
    console.log(`[Categorizer] AI categorized "${transaction.merchant_name}" as "${category}"`);
    
    return {
      category,
      confidence: 0.8,
      ai_generated: true
    };
    
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
