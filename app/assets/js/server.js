require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const { searchBillEmails } = require('../../integrations/gmail/gmail-client');
const { parseBillEmails } = require('../../integrations/gmail/bill-parser');

const app = express();
app.use(express.json());
app.use(cors({ origin: ['https://nice-cliff-05b13880f.2.azurestaticapps.net', 'http://localhost:3000'] }));

// ===== RATE LIMITING =====

// General API rate limiter - 20 requests per 10 seconds
const generalLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 20,
  message: { error: 'Too many requests. Please wait and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for sensitive operations - 5 requests per minute
const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { error: 'Too many requests. Please wait before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Email scan limiter - 2 requests per minute
const emailLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 2,
  message: { error: 'Too many email scan requests. Please wait 1 minute between scans.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limiting to all routes
app.use(generalLimiter);

const plaidClient = new PlaidApi(
  new Configuration({
    basePath: PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
        'PLAID-SECRET': process.env.PLAID_SECRET,
      },
    },
  })
);

app.post('/exchange_public_token', strictLimiter, async (req, res) => {
  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: req.body.public_token,
    });
    const accessToken = response.data.access_token;
    // TODO: Store accessToken server-side in a database, linked to the authenticated user.
    // The access token should NEVER be sent to the frontend.
    res.json({ success: true });
  } catch (error) {
    console.error('Error exchanging public token:', error);
    res.status(500).json({ error: 'Failed to exchange public token' });
  }
});

app.post('/create_link_token', strictLimiter, async (req, res) => {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: 'user_good', // Use a unique identifier for the user
      },
      client_name: 'Your App Name',
      products: ['auth', 'transactions'], // Specify the products you need
      country_codes: ['US'],
      language: 'en',
    });
    res.json({ link_token: response.data.link_token });
  } catch (error) {
    console.error('Error creating link token:', error);
    res.status(500).json({ error: 'Failed to create link token' });
  }
});

// ===== GMAIL BILL SCANNING ENDPOINT =====

/**
 * POST /api/scan-email-bills
 * Scans user's Gmail for bills and returns parsed results.
 * 
 * Body: { days: number (optional, default: 30) }
 * Returns: { bills: Array, count: number }
 */
app.post('/api/scan-email-bills', emailLimiter, async (req, res) => {
  try {
    const days = req.body.days || 30;
    const minConfidence = req.body.minConfidence || 0.4;

    console.log(`[Gmail Scanner] Scanning for bills from last ${days} days...`);

    // Search Gmail for bill-related emails
    const emails = await searchBillEmails({ days });
    console.log(`[Gmail Scanner] Found ${emails.length} potential bill emails`);

    // Parse emails into structured bill data
    const bills = parseBillEmails(emails, { minConfidence });
    console.log(`[Gmail Scanner] Parsed ${bills.length} bills`);

    // Return parsed bills to frontend
    res.json({
      success: true,
      bills: bills,
      count: bills.length,
      scanned: emails.length,
    });
  } catch (error) {
    console.error('[Gmail Scanner] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to scan email for bills',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

// ===== PLAID TRANSACTION SYNC ENDPOINT =====

/**
 * POST /api/transactions/sync
 * Fetches recent transactions from Plaid and returns them for client-side storage.
 * 
 * Body: { accessToken: string, startDate?: string, endDate?: string }
 * Returns: { transactions: Array, count: number, startDate: string, endDate: string }
 */
app.post('/api/transactions/sync', strictLimiter, async (req, res) => {
  try {
    const { accessToken, startDate, endDate } = req.body;
    
    if (!accessToken) {
      return res.status(400).json({ error: 'Access token required' });
    }
    
    // Default to last 30 days if no date range provided
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];
    
    console.log(`[Transaction Sync] Fetching transactions from ${start} to ${end}...`);
    
    // Fetch transactions from Plaid
    const response = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: start,
      end_date: end,
      options: {
        count: 250,
        offset: 0,
      },
    });
    
    const transactions = response.data.transactions;
    console.log(`[Transaction Sync] Retrieved ${transactions.length} transactions`);
    
    // Transform to our schema
    const formatted = transactions.map(t => ({
      plaid_transaction_id: t.transaction_id,
      plaid_account_id: t.account_id,
      date: t.date,
      amount: -t.amount,  // Plaid uses negative for spending, we use positive for expenses
      name: t.name,
      merchant_name: t.merchant_name || t.name,
      category: 'other',  // Will be AI-categorized on client side
      pending: t.pending,
      confidence: 0,
      user_confirmed: false
    }));
    
    res.json({ 
      transactions: formatted,
      count: formatted.length,
      startDate: start,
      endDate: end
    });
    
  } catch (error) {
    console.error('[Transaction Sync] Error:', error);
    res.status(500).json({ 
      error: 'Failed to sync transactions', 
      details: error.message,
      code: error.response?.data?.error_code || 'UNKNOWN_ERROR'
    });
  }
});

// ===== AI CATEGORIZATION ENDPOINT =====

/**
 * POST /api/categorize-transaction
 * Uses OpenAI to categorize a transaction based on merchant name and amount.
 * 
 * Body: { merchant_name: string, amount: number }
 * Returns: { category: string, confidence: number }
 */
app.post('/api/categorize-transaction', strictLimiter, async (req, res) => {
  try {
    const { merchant_name, amount } = req.body;
    
    if (!merchant_name || amount === undefined) {
      return res.status(400).json({ error: 'Missing merchant_name or amount' });
    }
    
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY') {
      console.warn('[Categorizer] OpenAI API key not configured - using fallback');
      return res.json({
        category: 'other',
        confidence: 0.5,
        ai_generated: false,
        note: 'OpenAI API key not configured'
      });
    }
    
    // Call OpenAI API
    const prompt = `Categorize this transaction into ONE of these categories: dining, groceries, transportation, utilities, entertainment, shopping, healthcare, travel, bills, income, other.

Merchant: ${merchant_name}
Amount: $${Math.abs(amount).toFixed(2)}

Respond with ONLY the category name (lowercase, one word).`;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a transaction categorization expert. Respond with only the category name.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 10
      })
    });
    
    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status} ${openaiResponse.statusText}`);
    }
    
    const data = await openaiResponse.json();
    const category = data.choices[0].message.content.trim().toLowerCase();
    
    // Validate category
    const validCategories = ['dining', 'groceries', 'transportation', 'utilities', 'entertainment', 'shopping', 'healthcare', 'travel', 'bills', 'income', 'other'];
    const finalCategory = validCategories.includes(category) ? category : 'other';
    
    // Calculate confidence (OpenAI doesn't provide this, so we estimate based on response quality)
    const confidence = finalCategory === category ? 0.9 : 0.5;
    
    res.json({
      category: finalCategory,
      confidence,
      ai_generated: true
    });
    
  } catch (error) {
    console.error('[Categorizer] Error calling OpenAI:', error);
    res.status(500).json({ 
      error: 'Categorization failed',
      category: 'other',
      confidence: 0.3,
      ai_generated: false
    });
  }
});

// ===== START SERVER =====

app.listen(3000, () => console.log('Server running on port 3000'));