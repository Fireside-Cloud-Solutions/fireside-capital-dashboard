/**
 * Gmail API Client — Fireside Capital
 * 
 * Handles OAuth 2.0 authentication and Gmail API interactions
 * for searching and retrieving bill-related emails.
 * 
 * Requirements:
 *   npm install googleapis
 * 
 * Environment variables (in app/.env):
 *   GMAIL_CLIENT_ID      — Google OAuth 2.0 Client ID
 *   GMAIL_CLIENT_SECRET   — Google OAuth 2.0 Client Secret
 *   GMAIL_REDIRECT_URI    — OAuth redirect URI (default: http://localhost:3000/auth/google/callback)
 *   GMAIL_REFRESH_TOKEN   — Stored after initial OAuth flow
 */

require('dotenv').config();
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_PATH = path.join(__dirname, '.gmail-token.json');

const BILL_SEARCH_QUERIES = [
  'subject:(bill OR statement OR invoice)',
  'subject:(payment due OR amount due)',
  'subject:(your bill is ready OR payment reminder)',
  'subject:(monthly statement OR account summary)',
  'from:(noreply OR billing OR payments OR invoices)',
];

// ---------------------------------------------------------------------------
// OAuth 2.0 Client
// ---------------------------------------------------------------------------

/**
 * Create an OAuth2 client from environment variables.
 */
function createOAuth2Client() {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const redirectUri = process.env.GMAIL_REDIRECT_URI || 'http://localhost:3000/auth/google/callback';

  if (!clientId || !clientSecret) {
    throw new Error(
      'Missing GMAIL_CLIENT_ID or GMAIL_CLIENT_SECRET in environment variables. ' +
      'See app/integrations/gmail/README.md for setup instructions.'
    );
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/**
 * Get an authenticated OAuth2 client.
 * 
 * Priority:
 *   1. GMAIL_REFRESH_TOKEN env var
 *   2. Saved token file (.gmail-token.json)
 *   3. Interactive consent flow (CLI)
 */
async function getAuthenticatedClient() {
  const oauth2Client = createOAuth2Client();

  // Try refresh token from env first
  if (process.env.GMAIL_REFRESH_TOKEN) {
    oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    });
    try {
      await oauth2Client.getAccessToken();
      return oauth2Client;
    } catch (err) {
      console.warn('[Gmail] Refresh token from env failed, trying saved token...', err.message);
    }
  }

  // Try saved token file
  if (fs.existsSync(TOKEN_PATH)) {
    try {
      const tokenData = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
      oauth2Client.setCredentials(tokenData);
      await oauth2Client.getAccessToken();
      return oauth2Client;
    } catch (err) {
      console.warn('[Gmail] Saved token expired or invalid, re-authorizing...', err.message);
    }
  }

  // Interactive consent flow
  const tokens = await runConsentFlow(oauth2Client);
  oauth2Client.setCredentials(tokens);
  return oauth2Client;
}

/**
 * Generate the authorization URL for the user to visit.
 */
function getAuthUrl() {
  const oauth2Client = createOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
  });
}

/**
 * Exchange an authorization code for tokens and save them.
 */
async function exchangeCode(code) {
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Persist tokens
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  console.log('[Gmail] Token saved to', TOKEN_PATH);
  console.log('[Gmail] Add this to your .env for persistent auth:');
  console.log(`  GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);

  return oauth2Client;
}

/**
 * Interactive CLI consent flow — prompts the user to visit a URL
 * and paste the authorization code.
 */
async function runConsentFlow(oauth2Client) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
  });

  console.log('\n=== Gmail OAuth Setup ===');
  console.log('Visit this URL to authorize the application:\n');
  console.log(authUrl);
  console.log('');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const code = await new Promise((resolve) => {
    rl.question('Paste the authorization code here: ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });

  const { tokens } = await oauth2Client.getToken(code);

  // Persist tokens
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  console.log('[Gmail] Token saved to', TOKEN_PATH);
  if (tokens.refresh_token) {
    console.log('[Gmail] Add this to your .env for persistent auth:');
    console.log(`  GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);
  }

  return tokens;
}

// ---------------------------------------------------------------------------
// Gmail API Wrapper
// ---------------------------------------------------------------------------

/**
 * Search Gmail for bill-related emails within a date range.
 * 
 * @param {object} options
 * @param {number} options.days — Look back this many days (default: 30)
 * @param {number} options.maxResults — Max emails to return (default: 100)
 * @param {string} options.customQuery — Override default search queries
 * @returns {Promise<Array>} — Array of parsed email objects
 */
async function searchBillEmails({ days = 30, maxResults = 100, customQuery = null } = {}) {
  const auth = await getAuthenticatedClient();
  const gmail = google.gmail({ version: 'v1', auth });

  const afterDate = new Date();
  afterDate.setDate(afterDate.getDate() - days);
  const dateFilter = `after:${afterDate.getFullYear()}/${afterDate.getMonth() + 1}/${afterDate.getDate()}`;

  // Build combined query
  const query = customQuery
    ? `${customQuery} ${dateFilter}`
    : `(${BILL_SEARCH_QUERIES.join(' OR ')}) ${dateFilter}`;

  console.log(`[Gmail] Searching: ${query}`);

  const allMessages = [];
  let pageToken = null;

  // Paginate through results
  do {
    const res = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: Math.min(maxResults - allMessages.length, 100),
      pageToken: pageToken || undefined,
    });

    if (res.data.messages) {
      allMessages.push(...res.data.messages);
    }

    pageToken = res.data.nextPageToken;

    // Rate limiting — small delay between pages
    if (pageToken && allMessages.length < maxResults) {
      await sleep(200);
    }
  } while (pageToken && allMessages.length < maxResults);

  console.log(`[Gmail] Found ${allMessages.length} potential bill emails`);

  // Fetch full message details
  const emails = [];
  for (let i = 0; i < allMessages.length; i++) {
    try {
      const msg = await getMessageDetails(gmail, allMessages[i].id);
      emails.push(msg);

      // Rate limiting — 50ms between requests
      if (i < allMessages.length - 1) {
        await sleep(50);
      }
    } catch (err) {
      console.warn(`[Gmail] Failed to fetch message ${allMessages[i].id}:`, err.message);
    }
  }

  return emails;
}

/**
 * Fetch full details of a single Gmail message.
 * 
 * @param {object} gmail — Gmail API instance
 * @param {string} messageId — Message ID
 * @returns {object} — Parsed message with headers, body, and metadata
 */
async function getMessageDetails(gmail, messageId) {
  const res = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'full',
  });

  const message = res.data;
  const headers = parseHeaders(message.payload.headers);
  const body = extractBody(message.payload);

  return {
    id: message.id,
    threadId: message.threadId,
    internalDate: new Date(parseInt(message.internalDate)),
    from: headers.from || '',
    to: headers.to || '',
    subject: headers.subject || '',
    date: headers.date || '',
    body: body,
    snippet: message.snippet || '',
    labelIds: message.labelIds || [],
  };
}

/**
 * Parse email headers into a key-value object.
 */
function parseHeaders(headers) {
  if (!headers) return {};
  const result = {};
  for (const header of headers) {
    result[header.name.toLowerCase()] = header.value;
  }
  return result;
}

/**
 * Extract the email body text from a MIME message payload.
 * Handles multipart and nested structures.
 * Prefers text/plain, falls back to text/html (stripped).
 */
function extractBody(payload) {
  if (!payload) return '';

  // Direct body
  if (payload.body && payload.body.data) {
    const decoded = Buffer.from(payload.body.data, 'base64url').toString('utf8');
    if (payload.mimeType === 'text/plain') return decoded;
    if (payload.mimeType === 'text/html') return stripHtml(decoded);
  }

  // Multipart — recurse
  if (payload.parts) {
    let plainText = '';
    let htmlText = '';

    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body && part.body.data) {
        plainText += Buffer.from(part.body.data, 'base64url').toString('utf8');
      } else if (part.mimeType === 'text/html' && part.body && part.body.data) {
        htmlText += Buffer.from(part.body.data, 'base64url').toString('utf8');
      } else if (part.parts) {
        // Nested multipart (e.g., multipart/alternative inside multipart/mixed)
        const nested = extractBody(part);
        if (nested) plainText += nested;
      }
    }

    if (plainText) return plainText;
    if (htmlText) return stripHtml(htmlText);
  }

  return '';
}

/**
 * Basic HTML tag stripping — removes tags, decodes common entities,
 * and collapses whitespace.
 */
function stripHtml(html) {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Utility: sleep for ms milliseconds.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
module.exports = {
  createOAuth2Client,
  getAuthenticatedClient,
  getAuthUrl,
  exchangeCode,
  searchBillEmails,
  getMessageDetails,
  BILL_SEARCH_QUERIES,
};
