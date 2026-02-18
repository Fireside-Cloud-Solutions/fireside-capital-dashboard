# Gmail Bill Parsing Research — EMAIL-002
**Date:** 2026-02-18 05:11 EST  
**Sprint Research Session:** 0511 (Sprint Research cron f6500924)  
**Topic:** Gmail API integration for automatic bill detection and import

---

## Summary

EMAIL-001 (spike) established the Gmail API was the right approach. This session establishes the **exact architecture, authentication flow, API patterns, parsing engine, and database changes** needed to build EMAIL-002 — the Gmail bill parsing feature that auto-imports recurring bills into Fireside Capital.

**Critical finding:** The Gmail API can be called entirely client-side for a static web app using Google Identity Services (GIS). No Azure Function required for the MVP. Background sync (scheduled) requires a server-side function, but the initial "Import from Gmail" button can ship as pure client-side code.

---

## Architecture Decision: Client-Side MVP vs. Server-Side Background Sync

### Option A: Client-Side (GIS Token Model) — **MVP**
```
User clicks "Import from Gmail"
  → Google OAuth popup (GIS initTokenClient + requestAccessToken)
  → Access token in memory (NOT in localStorage)
  → JS calls Gmail API REST directly with Bearer token
  → Parse results, show preview modal
  → User confirms → insert into Supabase bills table
```

**Pro:** Ships in 1 week, no Azure Function infrastructure, no refresh token management  
**Con:** Token expires in 1 hour — user must re-auth each session; no background sync

### Option B: Azure Function Background Sync — **Post-MVP**
```
User connects Gmail once
  → Authorization Code flow → Azure Function /api/gmail-auth
  → Exchanges code for tokens, stores refresh_token in Supabase gmail_connections (encrypted)
  → Daily Azure Function timer trigger: refresh token → scan → auto-import new bills
  → Push notification via Discord webhook when new bill detected
```

**Pro:** Set-and-forget, background sync, alerts before bills are due  
**Con:** Requires Google Cloud project backend credentials, Azure Function, more complex setup

**Recommendation:** Build Option A (MVP) in EMAIL-011 through EMAIL-015. Add Option B (EMAIL-016) as a P2 follow-on.

---

## Gmail OAuth Setup (Production Requirements)

### Google Cloud Console Steps (Matt TODO — EMAIL-010)
1. Create a Google Cloud project (or use existing if you have one)
2. Enable Gmail API in API Library
3. Configure OAuth consent screen:
   - User type: External
   - App name: "Fireside Capital"
   - Scopes: `https://www.googleapis.com/auth/gmail.readonly`
   - **IMPORTANT:** Add your email as test user during development
   - For production: Complete Google's verification process (needed for >100 users)
4. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Authorized JavaScript origins: `https://nice-cliff-05b13880f.2.azurestaticapps.net`
   - Authorized JavaScript origins (dev): `http://localhost:3000`
   - (**No redirect URI needed for token model**)
5. Copy Client ID to settings or environment config

### Scope Decision: `gmail.readonly`
Use `https://www.googleapis.com/auth/gmail.readonly` — read-only access. Never request write scopes. This minimizes OAuth consent screen friction and is the minimum needed.

**Important:** Google's sensitive scope review is required if you plan to publish the app publicly with Gmail access. For a personal-use app, you can stay in "Testing" mode indefinitely with up to 100 test users.

---

## Client-Side Implementation: `gmail-connector.js`

### Initialization (Load GIS library)
```html
<!-- Add to bills.html and any page with Gmail import -->
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

### Core Module
```javascript
// gmail-connector.js — Google Identity Services + Gmail API client
const GmailConnector = (() => {
  const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';
  const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';
  
  // Client ID from Google Cloud Console
  const CLIENT_ID = window.GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID.apps.googleusercontent.com';
  
  let _accessToken = null;
  let _tokenExpiresAt = 0;
  let _tokenClient = null;
  
  function init() {
    if (typeof google === 'undefined') {
      console.warn('[GmailConnector] GIS library not loaded');
      return;
    }
    _tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: GMAIL_SCOPE,
      callback: (response) => {
        if (response.error) {
          console.error('[GmailConnector] Token error:', response.error);
          return;
        }
        _accessToken = response.access_token;
        _tokenExpiresAt = Date.now() + (response.expires_in * 1000) - 60000; // 60s buffer
        _onTokenReady?.();
      },
    });
  }
  
  function isTokenValid() {
    return _accessToken && Date.now() < _tokenExpiresAt;
  }
  
  // Request token — triggers OAuth popup if needed
  // onReady: callback fired when token is available
  let _onTokenReady = null;
  function requestToken(onReady) {
    _onTokenReady = onReady;
    if (isTokenValid()) {
      onReady();
      return;
    }
    _tokenClient.requestAccessToken({ prompt: isTokenValid() ? 'none' : '' });
  }
  
  async function apiGet(path, params = {}) {
    const url = new URL(`${GMAIL_API_BASE}${path}`);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${_accessToken}` }
    });
    if (!resp.ok) throw new Error(`Gmail API ${resp.status}: ${await resp.text()}`);
    return resp.json();
  }
  
  // Search for bill-related messages
  // Returns array of { id, threadId }
  async function searchBillMessages(maxResults = 50) {
    const q = [
      'subject:(bill OR invoice OR statement OR "payment due" OR "amount due" OR "past due")',
      '-subject:("order confirmation" OR "receipt" OR "shipped" OR "delivered")',
      'newer_than:90d'
    ].join(' ');
    
    const data = await apiGet('/messages', { q, maxResults });
    return data.messages || [];
  }
  
  // Fetch metadata for a list of message IDs
  // Uses parallel fetch (max 10 at a time) with metadata format (fast, no body)
  async function fetchMessageMetadata(messageIds) {
    const CHUNK_SIZE = 10;
    const results = [];
    for (let i = 0; i < messageIds.length; i += CHUNK_SIZE) {
      const chunk = messageIds.slice(i, i + CHUNK_SIZE);
      const fetched = await Promise.all(
        chunk.map(({ id }) => apiGet(`/messages/${id}`, {
          format: 'metadata',
          metadataHeaders: ['Subject', 'From', 'Date'].join(',')
        }))
      );
      results.push(...fetched);
    }
    return results;
  }
  
  // Fetch full message body (only call for confirmed bill candidates)
  async function fetchMessageBody(messageId) {
    return apiGet(`/messages/${messageId}`, { format: 'full' });
  }
  
  return { init, requestToken, isTokenValid, searchBillMessages, fetchMessageMetadata, fetchMessageBody };
})();
```

---

## Bill Parser: `bill-parser.js`

### Multi-Regex Extraction Engine
```javascript
// bill-parser.js — Extract bill data from Gmail message objects

const BillParser = (() => {
  // ---- Amount Patterns ----
  // Priority order: most specific first
  const AMOUNT_PATTERNS = [
    /(?:total amount due|amount due|balance due|minimum payment due)[:\s]+\$?([\d,]+\.?\d{0,2})/i,
    /(?:total due|payment due|amount owed)[:\s]+\$?([\d,]+\.?\d{0,2})/i,
    /(?:your (?:current )?balance|account balance)[:\s]+\$?([\d,]+\.?\d{0,2})/i,
    /(?:please pay|pay this amount|amount to pay)[:\s]+\$?([\d,]+\.?\d{0,2})/i,
    /\$\s*([\d,]+\.\d{2})\s*(?:is due|due on|was charged)/i,
    /(?:total)[:\s]+\$?([\d,]+\.\d{2})\s*(?:USD)?(?:\s|$)/i,
    // Fallback: any dollar amount (last resort — least specific)
    /\$\s*([\d,]+\.\d{2})/,
  ];
  
  // ---- Due Date Patterns ----
  const DATE_PATTERNS = [
    // "Due: January 15, 2026" or "Due by Jan 15, 2026"
    /(?:due|payment due|pay by|due date|due on)[:\s]+([A-Za-z]+ \d{1,2},?\s*\d{4})/i,
    // "Due: 01/15/2026" or "Due: 01-15-26"
    /(?:due|pay by|due date)[:\s]+(0?[1-9]|1[0-2])[\/\-](\d{1,2})[\/\-](\d{2,4})/i,
    // ISO 8601: "Due: 2026-01-15"
    /(?:due|pay by|due date)[:\s]+(\d{4}-\d{2}-\d{2})/i,
    // "15th January 2026" or "January 15th"
    /(?:due|pay by)[:\s]+(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)\s+(\d{4})/i,
    // Lookahead: any date that follows bill language within 10 chars
    /(?:due|by)\s+(?:on\s+)?([A-Za-z]+ \d{1,2},?\s*\d{4})/i,
  ];
  
  // ---- Company Name Lookup (email domain → friendly name) ----
  const DOMAIN_MAP = {
    'att.com': 'AT&T', 'verizon.com': 'Verizon', 'comcast.com': 'Comcast / Xfinity',
    'xfinity.com': 'Comcast / Xfinity', 'spectrum.com': 'Spectrum', 't-mobile.com': 'T-Mobile',
    'sprint.com': 'Sprint', 'amazon.com': 'Amazon', 'netflix.com': 'Netflix',
    'hulu.com': 'Hulu', 'spotify.com': 'Spotify', 'apple.com': 'Apple',
    'google.com': 'Google', 'microsoft.com': 'Microsoft',
    'chase.com': 'Chase', 'bankofamerica.com': 'Bank of America', 'wellsfargo.com': 'Wells Fargo',
    'citi.com': 'Citi', 'discover.com': 'Discover', 'americanexpress.com': 'Amex',
    'capitalone.com': 'Capital One', 'usbank.com': 'US Bank',
    'geico.com': 'GEICO', 'statefarm.com': 'State Farm', 'progressive.com': 'Progressive',
    'allstate.com': 'Allstate', 'nationwide.com': 'Nationwide',
    'pge.com': 'PG&E', 'duke-energy.com': 'Duke Energy', 'dominion.com': 'Dominion Energy',
    'pgn.com': 'Peoples Gas', 'nationalgrid.com': 'National Grid',
  };
  
  // ---- Decode base64url Gmail body ----
  function decodeBody(data) {
    if (!data) return '';
    try {
      return atob(data.replace(/-/g, '+').replace(/_/g, '/'));
    } catch {
      return '';
    }
  }
  
  // ---- Recursively extract text from MIME payload ----
  function extractText(payload) {
    if (!payload) return { plain: '', html: '' };
    
    // Simple message (no parts)
    if (payload.body?.data) {
      const text = decodeBody(payload.body.data);
      return payload.mimeType === 'text/html' 
        ? { plain: '', html: text } 
        : { plain: text, html: '' };
    }
    
    // Multipart — recurse
    let plain = '', html = '';
    for (const part of (payload.parts || [])) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        plain += decodeBody(part.body.data);
      } else if (part.mimeType === 'text/html' && part.body?.data) {
        html += decodeBody(part.body.data);
      } else if (part.mimeType?.startsWith('multipart/')) {
        const sub = extractText(part);
        plain += sub.plain;
        html += sub.html;
      }
    }
    return { plain, html };
  }
  
  // ---- Strip HTML tags for regex parsing ----
  function stripHtml(html) {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ').trim();
  }
  
  // ---- Extract amount (returns float or null) ----
  function extractAmount(text) {
    for (const pattern of AMOUNT_PATTERNS) {
      const match = text.match(pattern);
      if (match) {
        const cleaned = match[1].replace(/,/g, '');
        const amount = parseFloat(cleaned);
        // Sanity check: bills are typically $1 - $50,000
        if (amount >= 1 && amount <= 50000) return amount;
      }
    }
    return null;
  }
  
  // ---- Extract due date (returns ISO string or null) ----
  function extractDueDate(text) {
    for (const pattern of DATE_PATTERNS) {
      const match = text.match(pattern);
      if (!match) continue;
      try {
        const dateStr = match[1] || `${match[2]}/${match[1]}/${match[3]}`;
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          // Must be in the future (within next 12 months)
          const now = new Date();
          const maxDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
          if (date >= now && date <= maxDate) {
            return date.toISOString().split('T')[0]; // YYYY-MM-DD
          }
        }
      } catch { /* try next pattern */ }
    }
    return null;
  }
  
  // ---- Extract company name from From header ----
  function extractCompany(fromHeader) {
    // "AT&T Billing <billing@att.com>" → "AT&T"
    // "billing@att.com" → "AT&T" (via domain map)
    
    // Extract display name if present
    const displayMatch = fromHeader.match(/^"?([^"<@]+?)"?\s*</);
    if (displayMatch) {
      const name = displayMatch[1].trim()
        .replace(/\s*(billing|payments?|no.?reply|noreply|alerts?|notifications?|statements?|accounts?)\s*/gi, '')
        .replace(/^\W+|\W+$/g, '').trim();
      if (name.length > 2 && name.length < 50) return name;
    }
    
    // Extract email domain
    const emailMatch = fromHeader.match(/@([\w.-]+\.[a-z]{2,})/i);
    if (emailMatch) {
      const domain = emailMatch[1].toLowerCase();
      if (DOMAIN_MAP[domain]) return DOMAIN_MAP[domain];
      // Capitalize domain root: "pge.com" → "PGE"
      const root = domain.split('.')[0].toUpperCase();
      return root;
    }
    
    return 'Unknown Biller';
  }
  
  // ---- Main: parse a Gmail message object ----
  // Returns: { name, amount, dueDate, company, source: 'email', gmailMessageId, confidence }
  function parseMessage(message) {
    const headers = message.payload?.headers || [];
    const getHeader = (name) => headers.find(h => h.name === name)?.value || '';
    
    const subject = getHeader('Subject');
    const from = getHeader('From');
    const dateHeader = getHeader('Date');
    
    // Extract body text
    const { plain, html } = extractText(message.payload);
    const body = plain || stripHtml(html);
    
    // Combine subject + body for pattern matching
    const fullText = `${subject}\n${body}`;
    
    const amount = extractAmount(fullText);
    const dueDate = extractDueDate(fullText);
    const company = extractCompany(from);
    
    // Clean up bill name from subject
    const name = subject
      .replace(/(?:re:|fwd:)/gi, '')
      .replace(/(?:your|monthly|bill|invoice|statement|payment|due|reminder)\s*/gi, '')
      .trim()
      || company;
    
    // Confidence score (0-100)
    let confidence = 0;
    if (amount) confidence += 50;
    if (dueDate) confidence += 30;
    if (/bill|invoice|statement|payment due/i.test(subject)) confidence += 20;
    
    return {
      name: name.slice(0, 100),
      amount,
      dueDate,
      company,
      emailSubject: subject,
      emailFrom: from,
      emailDate: dateHeader,
      source: 'email',
      gmailMessageId: message.id,
      confidence,
      // Supabase-ready fields
      frequency: 'monthly', // default — user can change
      is_paid: false,
    };
  }
  
  // ---- Classify: is this email actually a bill? ----
  function isBillEmail(subject, from) {
    const BILL_SIGNALS = [
      /(?:bill|invoice|statement|payment due|amount due|past due|balance due)/i,
      /(?:your (?:monthly |annual )?(?:bill|statement|invoice))/i,
    ];
    const NOT_BILL_SIGNALS = [
      /(?:order confirmation|shipped|delivered|receipt|thank you for your order)/i,
      /(?:newsletter|update|welcome|verify|confirm your email)/i,
    ];
    
    const text = `${subject} ${from}`;
    if (NOT_BILL_SIGNALS.some(p => p.test(text))) return false;
    return BILL_SIGNALS.some(p => p.test(text));
  }
  
  return { parseMessage, isBillEmail, extractAmount, extractDueDate, extractCompany };
})();
```

---

## Database Changes Required

### Migration 009: Bills Table Extensions
```sql
-- Migration 009: Add email import fields to bills table
ALTER TABLE public.bills
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual' 
    CHECK (source IN ('manual', 'email', 'plaid')),
  ADD COLUMN IF NOT EXISTS external_id TEXT,
  ADD COLUMN IF NOT EXISTS email_from TEXT,
  ADD COLUMN IF NOT EXISTS email_subject TEXT,
  ADD COLUMN IF NOT EXISTS email_detected_at TIMESTAMPTZ;

-- Unique constraint for deduplication (user can't import same Gmail message twice)
CREATE UNIQUE INDEX IF NOT EXISTS idx_bills_user_external_id
  ON public.bills (user_id, external_id)
  WHERE external_id IS NOT NULL;

-- Index for source queries (e.g., "show me all email-imported bills")
CREATE INDEX IF NOT EXISTS idx_bills_source ON public.bills (user_id, source);
```

### Updated Bills Table Schema
```
bills
├── id (UUID)
├── user_id (UUID → FK to auth.users)
├── name (TEXT)
├── amount (NUMERIC)
├── frequency (TEXT) — 'monthly', 'annual', etc.
├── due_day (INTEGER) — day of month for monthly bills
├── next_due_date (DATE) — NEW derived field
├── is_paid (BOOLEAN)
├── source (TEXT) — NEW: 'manual' | 'email' | 'plaid'   ← EMAIL-013
├── external_id (TEXT) — NEW: Gmail message ID / Plaid transaction ID
├── email_from (TEXT) — NEW: sender header from Gmail
├── email_subject (TEXT) — NEW: original email subject
├── email_detected_at (TIMESTAMPTZ) — NEW: when the email was processed
└── created_at (TIMESTAMPTZ)
```

---

## Import Preview UI (bills.html)

### "Import from Gmail" Button
```html
<!-- Add to bills.html page-header-actions -->
<button id="btnImportGmail" class="btn btn-outline-secondary" 
        data-action="import-gmail" title="Scan Gmail for bills">
  <i class="bi bi-envelope me-1"></i>Import from Gmail
</button>
```

### Preview Modal
```html
<!-- Gmail Import Preview Modal -->
<div class="modal fade" id="gmailImportModal" tabindex="-1" 
     aria-labelledby="gmailImportModalLabel" aria-modal="true">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="gmailImportModalLabel">
          <i class="bi bi-envelope-check me-2 text-primary"></i>Import Bills from Gmail
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <!-- Scanning state -->
        <div id="gmailScanningState" class="text-center py-4">
          <div class="spinner-border text-primary mb-3" role="status" aria-label="Scanning Gmail"></div>
          <p class="text-muted">Scanning your Gmail for bills...</p>
        </div>
        <!-- Results -->
        <div id="gmailResults" style="display:none">
          <p class="text-muted small mb-3">
            Review detected bills below. Uncheck any you don't want to import.
          </p>
          <div id="gmailBillList" class="list-group">
            <!-- Populated by JS -->
          </div>
          <div id="gmailNoResults" class="text-center py-4 text-muted" style="display:none">
            <i class="bi bi-inbox fs-2 mb-2 d-block"></i>
            No new bills found in your Gmail (last 90 days).
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="button" id="btnConfirmGmailImport" class="btn btn-primary" style="display:none">
          Import Selected Bills
        </button>
      </div>
    </div>
  </div>
</div>
```

### Bill Preview Card Template (generated by JS)
```javascript
function renderGmailBillCard(bill, index) {
  const confidence = bill.confidence >= 80 ? 'success' : bill.confidence >= 50 ? 'warning' : 'secondary';
  return `
    <label class="list-group-item list-group-item-action d-flex align-items-start gap-3 py-3"
           for="gmailBill_${index}">
      <input class="form-check-input mt-1 flex-shrink-0" type="checkbox" 
             id="gmailBill_${index}" data-bill-index="${index}" checked>
      <div class="flex-grow-1">
        <div class="d-flex justify-content-between align-items-start">
          <strong>${window.sanitizeHTML ? sanitizeHTML(bill.name) : bill.name}</strong>
          <span class="badge bg-${confidence}-subtle text-${confidence} ms-2">
            ${bill.confidence}% match
          </span>
        </div>
        <div class="text-muted small mt-1">
          ${bill.amount ? `<span class="me-3"><i class="bi bi-currency-dollar me-1"></i>$${bill.amount.toFixed(2)}/mo</span>` : ''}
          ${bill.dueDate ? `<span><i class="bi bi-calendar3 me-1"></i>Due: ${bill.dueDate}</span>` : ''}
        </div>
        <div class="text-muted small text-truncate" title="${bill.emailSubject}">
          <i class="bi bi-envelope me-1"></i>${bill.emailFrom}
        </div>
      </div>
    </label>
  `;
}
```

---

## Deduplication Logic

```javascript
// Before importing, check for existing bills with same name + similar amount
async function deduplicateBills(candidates) {
  const { data: existingBills } = await sb
    .from('bills')
    .select('id, name, amount, external_id')
    .eq('user_id', userId);
  
  return candidates.filter(candidate => {
    // Check by external_id (Gmail message ID) — exact dedup
    if (candidate.gmailMessageId) {
      const alreadyImported = existingBills?.some(b => b.external_id === candidate.gmailMessageId);
      if (alreadyImported) return false;
    }
    // Check by name similarity + amount (fuzzy dedup)
    const duplicate = existingBills?.some(b => {
      const nameMatch = b.name?.toLowerCase().includes(candidate.name?.toLowerCase().slice(0, 8));
      const amountMatch = candidate.amount && b.amount && Math.abs(b.amount - candidate.amount) < 2;
      return nameMatch && amountMatch;
    });
    return !duplicate;
  });
}
```

---

## Full Import Flow (orchestrator function)

```javascript
// In bills.html event handler (data-action="import-gmail")
async function handleGmailImport() {
  const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('gmailImportModal'));
  modal.show();
  
  // 1. Request OAuth token
  GmailConnector.requestToken(async () => {
    try {
      // 2. Search for bill emails
      const messageList = await GmailConnector.searchBillMessages(50);
      if (!messageList.length) {
        showNoResults(); return;
      }
      
      // 3. Fetch metadata for all candidates (fast — no body)
      const metaMessages = await GmailConnector.fetchMessageMetadata(messageList);
      
      // 4. Filter: classify which are actually bills
      const billCandidates = metaMessages.filter(msg => {
        const subject = msg.payload?.headers?.find(h => h.name === 'Subject')?.value || '';
        const from = msg.payload?.headers?.find(h => h.name === 'From')?.value || '';
        return BillParser.isBillEmail(subject, from);
      });
      
      // 5. Fetch full body only for confirmed bill candidates (max 20)
      const toFetch = billCandidates.slice(0, 20);
      const fullMessages = await Promise.all(
        toFetch.map(m => GmailConnector.fetchMessageBody(m.id))
      );
      
      // 6. Parse each message
      const parsed = fullMessages
        .map(BillParser.parseMessage)
        .filter(b => b.confidence >= 40); // Only confident matches
      
      // 7. Deduplicate
      const newBills = await deduplicateBills(parsed);
      
      // 8. Show preview
      renderBillPreview(newBills);
      
    } catch (err) {
      Toast.show(`Gmail scan failed: ${err.message}`, 'error');
      modal.hide();
    }
  });
}

// 9. On confirm — insert into Supabase
async function confirmGmailImport(selectedBills) {
  const toInsert = selectedBills.map(b => ({
    user_id: userId,
    name: b.name,
    amount: b.amount || 0,
    frequency: 'monthly',
    due_day: b.dueDate ? new Date(b.dueDate).getDate() : 1,
    is_paid: false,
    source: 'email',
    external_id: b.gmailMessageId,
    email_from: b.emailFrom,
    email_subject: b.emailSubject,
    email_detected_at: new Date().toISOString(),
  }));
  
  const { error } = await sb.from('bills').upsert(toInsert, {
    onConflict: 'user_id,external_id',
    ignoreDuplicates: true,
  });
  
  if (error) throw error;
  Toast.show(`Imported ${toInsert.length} bills from Gmail`, 'success');
  loadBills(); // Refresh bills table
}
```

---

## Gmail API Rate Limits & Performance

| Limit | Value | Impact |
|-------|-------|--------|
| Daily quota | 1 billion quota units/day | Not a concern |
| Per-user rate limit | 250 quota units/user/second | Max ~25 messages.get/second |
| messages.list | 5 units | Cheap |
| messages.get (metadata) | 5 units | Cheap |
| messages.get (full) | 5 units | Same cost |
| Batch requests | Max 100 per batch, recommended ≤50 | Use for initial bulk scan |

**Performance strategy:**
1. `messages.list` with search query — single request, returns IDs only
2. `messages.get` with `format=metadata` for all IDs — parallel, 10 at a time
3. `messages.get` with `format=full` only for confirmed bill candidates (≤20)

**Total API cost for 50-message scan:** ~550 quota units. Well within limits.

---

## New Work Items Created

| ID | Priority | Est | Description |
|----|----------|-----|-------------|
| EMAIL-010 | P1 | 1h | ⚠️ **Matt TODO**: Google Cloud project + Gmail API setup (Cloud Console: enable Gmail API, OAuth consent screen, Web app Client ID, add authorized origin for live URL) |
| EMAIL-011 | P1 | 2h | Build `gmail-connector.js` — GIS token client, `searchBillMessages()`, `fetchMessageMetadata()`, `fetchMessageBody()`, `requestToken()` with re-auth flow |
| EMAIL-012 | P1 | 3h | Build `bill-parser.js` — multi-pattern amount/date/company extraction, HTML decoder, `isBillEmail()` classifier, confidence scoring |
| EMAIL-013 | P1 | 30m | Supabase migration 009: add `source`, `external_id`, `email_from`, `email_subject`, `email_detected_at` columns to bills table + unique index for deduplication |
| EMAIL-014 | P1 | 2h | Bills page UI: "Import from Gmail" button in page-header-actions, `#gmailImportModal` preview modal with bill cards, checkboxes, confidence badges |
| EMAIL-015 | P1 | 1h | `deduplicateBills()` function + `confirmGmailImport()` Supabase upsert with conflict resolution |
| EMAIL-016 | P2 | 4h | Azure Function `/api/gmail-sync` for scheduled background sync (stores refresh token in Supabase, runs daily timer trigger) — post-MVP |

**Implementation order:**
```
EMAIL-010 (Matt: Google Cloud setup)
→ EMAIL-013 (DB migration)
→ EMAIL-011 (gmail-connector.js)
→ EMAIL-012 (bill-parser.js)
→ EMAIL-014 + EMAIL-015 (UI + import logic)
→ EMAIL-016 (background sync — post-MVP)
```

**Estimated total:** ~9.5h agent work + ~1h Matt's Google Cloud time

---

## Security Notes

- **Never store Gmail access tokens in localStorage** — keep in memory only (`_accessToken` in module scope)
- **No write scopes** — `gmail.readonly` is minimum and safest
- **No email content sent to server** — all parsing is client-side JavaScript
- **XSS protection** — all email content rendered through `sanitizeHTML()` before DOM injection
- **For production publishing:** Google requires app verification for sensitive scopes. For personal use (< 100 users), stay in Testing mode.
