# Transaction Categorization System

## Overview
Transactions are categorized using a two-tier system:
1. **Pattern matching** - Check if merchant has been seen before
2. **Capital AI processing** - Uncategorized transactions are processed by Capital (Claude AI agent)

## How It Works

### Automatic Pattern Matching
When transactions sync from Plaid:
1. System checks `transaction_category_patterns` table for known merchants
2. If match found, category is applied automatically
3. If no match, transaction is marked as `uncategorized`

### Manual Categorization by User
1. User views transactions on transactions.html page
2. User can manually change category via dropdown
3. System learns the pattern and stores it for future transactions

### AI Categorization by Capital
1. User clicks "Auto-Categorize Uncategorized" button
2. Capital (Claude AI) receives list of uncategorized transactions
3. Capital analyzes merchant names and amounts, assigns categories
4. Capital updates database with categorizations
5. Patterns are learned for future automatic categorization

## Benefits
- ✅ $0 cost (uses existing Claude subscription via Clawdbot)
- ✅ Learns from every correction
- ✅ Gets smarter over time
- ✅ No external API dependencies

## For Capital (AI Agent)
When you receive a categorization request:
1. Read uncategorized transactions from database
2. For each transaction, determine best category based on:
   - Merchant name (e.g., "SHELL" → transportation)
   - Amount (e.g., large amounts might be bills/rent)
   - Context (use your judgment)
3. Use the helper script to apply categorizations:
   ```javascript
   const { applyCategorizations } = require('./scripts/categorize-transactions.js');
   await applyCategorizations([
     { id: 1, category: 'groceries', confidence: 0.9, merchantName: 'KROGER' },
     { id: 2, category: 'transportation', confidence: 0.95, merchantName: 'SHELL' }
   ]);
   ```

## Valid Categories
- `dining` - Restaurants, cafes, fast food
- `groceries` - Supermarkets, grocery stores
- `transportation` - Gas, parking, public transit, rideshare
- `utilities` - Electric, water, internet, phone
- `entertainment` - Movies, concerts, streaming services
- `shopping` - Retail purchases, online shopping
- `healthcare` - Medical, pharmacy, insurance
- `travel` - Hotels, flights, vacation expenses
- `bills` - Recurring bills not covered by other categories
- `income` - Paycheck deposits, refunds, reimbursements
- `other` - Anything that doesn't fit above categories

## Database Schema

### transactions table
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key)
- plaid_transaction_id (text)
- plaid_account_id (text)
- date (date)
- amount (numeric) -- positive for expenses, negative for income
- name (text) -- transaction name from Plaid
- merchant_name (text) -- normalized merchant name
- category (text) -- one of the valid categories above
- confidence (numeric) -- 0.0 to 1.0
- user_confirmed (boolean) -- true if user manually set category
- pending (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

### transaction_category_patterns table
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key)
- merchant_name (text, unique per user)
- category (text)
- confidence (numeric)
- times_used (integer)
- last_used (timestamp)
- created_at (timestamp)
- updated_at (timestamp)
```

## Implementation Details

### Pattern Matching Algorithm
1. Normalize merchant name (lowercase, remove special chars)
2. Check `transaction_category_patterns` table for exact match
3. If found, use stored category with stored confidence
4. If not found, mark as `uncategorized`

### Learning from User Corrections
When user manually changes a category:
1. System stores merchant pattern in `transaction_category_patterns`
2. Confidence starts at 1.0 for manual corrections
3. Future transactions from same merchant auto-categorize
4. Confidence increases with each use (up to 1.0)

### Capital AI Categorization
Capital uses Claude's reasoning to categorize based on:
- **Merchant name patterns** (e.g., "Starbucks" → dining)
- **Amount heuristics** (e.g., $1500 might be rent → bills)
- **Context clues** (e.g., "CVS PHARMACY" → healthcare)
- **Common sense** (e.g., "UBER" → transportation)

Capital applies categorizations through the helper script, which:
1. Updates transaction records
2. Learns patterns for future use
3. Returns success/failure counts

## Testing

### Test the Pattern Matcher
```javascript
// In browser console on transactions.html
const testTx = { merchant_name: 'KROGER', amount: 45.23 };
const result = await categorizeTransaction(testTx);
console.log(result); // Should return learned pattern or 'uncategorized'
```

### Test the Helper Script
```bash
# From project root
cd C:\Users\chuba\fireside-capital
node scripts/categorize-transactions.js
# Should list all uncategorized transactions
```

### Manually Trigger Capital Categorization
1. Go to transactions.html
2. Click "Auto-Categorize Uncategorized" button
3. Check console for log message
4. Capital should receive request and process transactions

## Future Enhancements
- [ ] Integrate Clawdbot messaging API to auto-notify Capital
- [ ] Add "Suggest Category" feature for individual transactions
- [ ] Batch categorization progress bar
- [ ] Category suggestion based on similar merchants
- [ ] Export/import category patterns between users
