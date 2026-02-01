require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const { searchBillEmails } = require('../integrations/gmail/gmail-client');
const { parseBillEmails } = require('../integrations/gmail/bill-parser');

const app = express();
app.use(express.json());
app.use(cors({ origin: ['https://nice-cliff-05b13880f.2.azurestaticapps.net', 'http://localhost:3000'] }));

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

app.post('/exchange_public_token', async (req, res) => {
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

app.post('/create_link_token', async (req, res) => {
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
app.post('/api/scan-email-bills', async (req, res) => {
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

// ===== START SERVER =====

app.listen(3000, () => console.log('Server running on port 3000'));