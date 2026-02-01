/**
 * Azure Function: Scan Email Bills
 * 
 * Searches Gmail for bill-related emails and parses them into structured data.
 * Endpoint: /api/scan-email-bills
 */

const { searchBillEmails } = require('../../integrations/gmail/gmail-client');
const { parseBillEmails } = require('../../integrations/gmail/bill-parser');

module.exports = async function (context, req) {
  context.log('[scan-email-bills] Function invoked');

  try {
    // Extract parameters
    const days = req.query.days || req.body?.days || 30;
    const maxResults = req.query.maxResults || req.body?.maxResults || 100;
    const minConfidence = req.query.minConfidence || req.body?.minConfidence || 0.4;

    context.log(`[scan-email-bills] Scanning last ${days} days, maxResults=${maxResults}, minConfidence=${minConfidence}`);

    // Search Gmail for bill emails
    const emails = await searchBillEmails({ 
      days: parseInt(days), 
      maxResults: parseInt(maxResults) 
    });

    context.log(`[scan-email-bills] Found ${emails.length} email(s)`);

    // Parse emails into structured bills
    const bills = parseBillEmails(emails, { 
      minConfidence: parseFloat(minConfidence) 
    });

    context.log(`[scan-email-bills] Parsed ${bills.length} bill(s)`);

    // Return success response
    context.res = {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Azure SWA handles CORS, but explicit for safety
      },
      body: {
        success: true,
        count: bills.length,
        bills: bills,
        scanned: {
          days: parseInt(days),
          emailCount: emails.length,
          billCount: bills.length,
        },
      },
    };
  } catch (error) {
    context.log.error('[scan-email-bills] Error:', error);

    // Return error response
    context.res = {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: {
        success: false,
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
    };
  }
};
