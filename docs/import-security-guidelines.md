# Import Security Guidelines

**Feature:** FC-026 - Data Import System (Security)  
**Author:** Architect  
**Date:** 2025-01-26  
**Status:** Design Phase

---

## Overview

This document outlines security requirements, risks, and mitigation strategies for the Data Import System. Financial data is highly sensitive and requires special care at every stage.

### Security Principles

1. **Defense in Depth** - Multiple layers of security
2. **Principle of Least Privilege** - Minimal access rights
3. **Zero Trust** - Verify everything, trust nothing
4. **Fail Secure** - Errors should not expose data
5. **Audit Everything** - Complete audit trail

---

## Threat Model

### Assets to Protect

| Asset | Sensitivity | Impact if Compromised |
|-------|-------------|----------------------|
| User financial transactions | **Critical** | Identity theft, fraud |
| YNAB OAuth tokens | **Critical** | Unauthorized account access |
| User import mappings | Medium | Data leakage (column names) |
| Import job logs | Medium | Transaction pattern analysis |
| Uploaded files | **Critical** | Complete financial history |

### Threat Actors

1. **External Attackers** - Attempting to steal financial data
2. **Malicious Users** - Users trying to access other users' data
3. **Malicious Files** - CSV/XLSX files with embedded attacks

### Attack Vectors

1. **File Upload Attacks**
   - CSV Injection (formula execution)
   - Path Traversal (malicious filenames)
   - XXE Attacks (XLSX XML parsing)
   - Zip Bombs (compressed XLSX files)
   - Malicious Macros (Excel files)

2. **API Attacks**
   - SQL Injection (import data → database)
   - XSS (stored in transaction notes)
   - CSRF (unauthorized import operations)
   - Rate Limit Bypass (flooding imports)

3. **Data Exposure**
   - Inadequate RLS (cross-user data access)
   - Logging sensitive data
   - Token leakage (OAuth tokens in logs/frontend)

4. **YNAB Integration**
   - OAuth token theft
   - Token replay attacks
   - Man-in-the-middle (MITM)

---

## File Upload Security

### File Validation

**Step 1: Client-Side Validation** (convenience, not security)
```javascript
const ALLOWED_TYPES = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function validateFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Only CSV and XLSX allowed.');
  }
  
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large. Maximum size is 10MB.');
  }
  
  return true;
}
```

**Step 2: Server-Side Validation** (required)
```javascript
const fileType = require('file-type');

async function validateFileUpload(buffer, filename) {
  // Check file size
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error('File size exceeds limit');
  }
  
  // Validate actual MIME type (not just extension)
  const detectedType = await fileType.fromBuffer(buffer);
  
  if (!detectedType || !ALLOWED_TYPES.includes(detectedType.mime)) {
    throw new Error('Invalid file type detected');
  }
  
  // Sanitize filename (prevent path traversal)
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Reject suspicious extensions
  if (sanitizedFilename.match(/\.(exe|dll|bat|cmd|sh|php|js)$/i)) {
    throw new Error('Executable files not allowed');
  }
  
  return sanitizedFilename;
}
```

### CSV Injection Prevention

**What is CSV Injection?**

Malicious CSV files that start cells with `=`, `+`, `-`, `@` can execute formulas when opened in Excel/Sheets.

**Example Attack:**
```csv
Date,Merchant,Amount
2025-01-26,Starbucks,-5.43
2025-01-27,=cmd|'/c calc'!A1,-10.00
```

When opened in Excel, this executes `calc.exe` on Windows.

**Mitigation:**
```javascript
function sanitizeCSVValue(value) {
  if (typeof value !== 'string') return value;
  
  const dangerousChars = ['=', '+', '-', '@', '\t', '\r', '\n'];
  
  // If value starts with dangerous character, prefix with single quote
  if (dangerousChars.includes(value.charAt(0))) {
    return "'" + value;
  }
  
  // Also check for embedded formulas
  if (value.includes('=') && value.match(/^[\s]*=/)) {
    return "'" + value;
  }
  
  return value;
}
```

**Additional Protection:**
- Warn users before downloading error logs
- Add security notice in exported CSVs
- Consider exporting as JSON instead of CSV

### XLSX Security (XXE Prevention)

**What is XXE (XML External Entity)?**

XLSX files are ZIP archives containing XML files. Malicious XML can reference external entities to read server files or trigger SSRF attacks.

**Example Attack:**
```xml
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<worksheet>
  <cell>&xxe;</cell>
</worksheet>
```

**Mitigation:**

Use SheetJS with safe parsing options:
```javascript
const XLSX = require('xlsx');

function parseXLSXSafely(buffer) {
  const workbook = XLSX.read(buffer, {
    type: 'buffer',
    cellDates: true,
    cellNF: false,
    cellText: false,
    sheetRows: 10000,    // Limit rows to prevent DoS
    bookVBA: false,      // Reject files with macros
    bookFiles: false,    // Don't extract embedded files
    bookProps: false,    // Don't parse properties
    WTF: false           // Disable debug mode
  });
  
  // Reject files with embedded objects or macros
  if (workbook.vbaraw || workbook.Workbook?.WBProps?.macroEnabled) {
    throw new Error('Files with macros are not allowed');
  }
  
  return workbook;
}
```

### Filename Sanitization

**Path Traversal Prevention:**
```javascript
const path = require('path');

function sanitizeFilename(filename) {
  // Remove path components
  const basename = path.basename(filename);
  
  // Remove special characters (keep alphanumeric, dots, dashes, underscores)
  const sanitized = basename.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Prevent double extensions (.csv.exe)
  const parts = sanitized.split('.');
  if (parts.length > 2) {
    return parts.slice(0, 2).join('.');
  }
  
  // Prevent hidden files
  if (sanitized.startsWith('.')) {
    return 'file_' + sanitized;
  }
  
  return sanitized;
}
```

### File Storage Security

**Supabase Storage Configuration:**

```sql
-- Create bucket for temporary imports
INSERT INTO storage.buckets (id, name, public) 
VALUES ('import-uploads', 'import-uploads', false);

-- RLS Policy: Users can only upload to their own folder
CREATE POLICY "Users can upload to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'import-uploads' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- RLS Policy: Users can only read their own files
CREATE POLICY "Users can read own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'import-uploads' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- RLS Policy: Users can delete their own files
CREATE POLICY "Users can delete own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'import-uploads' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

**Automatic File Cleanup:**
```javascript
// Supabase Edge Function or cron job
async function cleanupOldImportFiles() {
  const { data, error } = await supabase.storage
    .from('import-uploads')
    .list();
  
  const now = new Date();
  const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours
  
  for (const file of data) {
    const fileDate = new Date(file.created_at);
    
    if (fileDate < cutoff) {
      await supabase.storage
        .from('import-uploads')
        .remove([file.name]);
      
      console.log(`Deleted old file: ${file.name}`);
    }
  }
}
```

---

## YNAB OAuth Security

### Token Storage

**DO NOT:**
- ❌ Store tokens in localStorage/sessionStorage
- ❌ Send tokens to frontend
- ❌ Log tokens in application logs
- ❌ Include tokens in error messages

**DO:**
- ✅ Store in database with Row-Level Security
- ✅ Encrypt tokens at rest
- ✅ Use server-side sessions only
- ✅ Implement token refresh logic

**Encryption Implementation:**
```javascript
const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32-byte key
const ALGORITHM = 'aes-256-gcm';

function encryptToken(token) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Return format: iv:authTag:encrypted
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

function decryptToken(encryptedToken) {
  const parts = encryptedToken.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

### OAuth State Parameter (CSRF Protection)

**Generate Secure State Token:**
```javascript
function generateStateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function storeStateToken(userId, stateToken) {
  // Store in session or encrypted cookie
  // Associate with user_id
  // Set expiration (5 minutes)
  const expiration = Date.now() + 5 * 60 * 1000;
  
  return jwt.sign(
    { state: stateToken, userId, exp: Math.floor(expiration / 1000) },
    process.env.JWT_SECRET
  );
}

function verifyStateToken(receivedState, sessionToken) {
  try {
    const decoded = jwt.verify(sessionToken, process.env.JWT_SECRET);
    return decoded.state === receivedState;
  } catch (error) {
    return false;
  }
}
```

**OAuth Flow with State:**
```javascript
// Step 1: Generate authorization URL
app.post('/api/ynab/authorize', async (req, res) => {
  const userId = req.user.id;
  const stateToken = generateStateToken();
  const sessionToken = storeStateToken(userId, stateToken);
  
  // Store in secure cookie
  res.cookie('oauth_state', sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 5 * 60 * 1000
  });
  
  const authUrl = `https://app.ynab.com/oauth/authorize?` +
    `client_id=${YNAB_CLIENT_ID}` +
    `&redirect_uri=${REDIRECT_URI}` +
    `&response_type=code` +
    `&state=${stateToken}`;
  
  res.json({ authorization_url: authUrl });
});

// Step 2: Handle callback
app.get('/api/ynab/callback', async (req, res) => {
  const { code, state } = req.query;
  const sessionToken = req.cookies.oauth_state;
  
  // Verify state (CSRF protection)
  if (!verifyStateToken(state, sessionToken)) {
    return res.status(403).json({ error: 'Invalid state parameter' });
  }
  
  // Exchange code for token
  // ... (token exchange logic)
  
  // Clear state cookie
  res.clearCookie('oauth_state');
  
  res.redirect('/import?status=success');
});
```

### Token Refresh

**Check Token Expiration:**
```javascript
async function getValidYNABToken(userId) {
  const { data: tokenRecord } = await supabase
    .from('user_oauth_tokens')
    .select('*')
    .eq('user_id', userId)
    .eq('service', 'ynab')
    .single();
  
  if (!tokenRecord) {
    throw new Error('No YNAB token found. Please reconnect.');
  }
  
  const now = new Date();
  const expiresAt = new Date(tokenRecord.expires_at);
  
  // If token expires within 5 minutes, refresh it
  if (expiresAt - now < 5 * 60 * 1000) {
    return await refreshYNABToken(tokenRecord);
  }
  
  return decryptToken(tokenRecord.access_token);
}

async function refreshYNABToken(tokenRecord) {
  const refreshToken = decryptToken(tokenRecord.refresh_token);
  
  const response = await fetch('https://app.ynab.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.YNAB_CLIENT_ID,
      client_secret: process.env.YNAB_CLIENT_SECRET
    })
  });
  
  const { access_token, refresh_token, expires_in } = await response.json();
  
  // Update database
  await supabase
    .from('user_oauth_tokens')
    .update({
      access_token: encryptToken(access_token),
      refresh_token: encryptToken(refresh_token),
      expires_at: new Date(Date.now() + expires_in * 1000),
      last_used_at: new Date()
    })
    .eq('id', tokenRecord.id);
  
  return access_token;
}
```

---

## Data Validation & Sanitization

### Input Validation

**Required Field Validation:**
```javascript
const validators = {
  date: (value) => {
    const date = new Date(value);
    if (isNaN(date)) return { valid: false, error: 'Invalid date format' };
    if (date > new Date()) return { valid: false, error: 'Future dates not allowed' };
    if (date < new Date('1900-01-01')) return { valid: false, error: 'Date too old' };
    return { valid: true };
  },
  
  merchant_name: (value) => {
    if (!value || value.trim() === '') {
      return { valid: false, error: 'Merchant name required' };
    }
    if (value.length > 255) {
      return { valid: false, error: 'Merchant name too long (max 255 chars)' };
    }
    // Sanitize for XSS
    const sanitized = value.replace(/[<>\"']/g, '');
    if (sanitized !== value) {
      return { valid: false, error: 'Invalid characters in merchant name' };
    }
    return { valid: true };
  },
  
  amount: (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return { valid: false, error: 'Invalid amount' };
    if (num === 0) return { valid: false, error: 'Amount cannot be zero' };
    if (Math.abs(num) > 1000000) return { valid: false, error: 'Amount too large' };
    if (!Number.isFinite(num)) return { valid: false, error: 'Invalid number' };
    return { valid: true };
  }
};
```

### SQL Injection Prevention

**Use Parameterized Queries:**
```javascript
// ❌ NEVER DO THIS (SQL Injection vulnerability)
const { data } = await supabase
  .from('transactions')
  .select('*')
  .where(`merchant_name = '${userInput}'`);

// ✅ DO THIS (Supabase automatically parameterizes)
const { data } = await supabase
  .from('transactions')
  .select('*')
  .eq('merchant_name', userInput);
```

### XSS Prevention

**Sanitize User Input:**
```javascript
const DOMPurify = require('isomorphic-dompurify');

function sanitizeForStorage(value) {
  if (typeof value !== 'string') return value;
  
  // Remove HTML tags and dangerous characters
  const cleaned = DOMPurify.sanitize(value, {
    ALLOWED_TAGS: [],       // No HTML tags
    ALLOWED_ATTR: []        // No attributes
  });
  
  return cleaned.trim();
}
```

**Frontend Output Escaping:**
```javascript
// When displaying user data in HTML
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Or use framework's built-in escaping (React, Vue automatically escape)
<td>{transaction.merchant_name}</td>  // React escapes by default
```

---

## Row-Level Security (RLS)

### Database Policies

**Critical: Every query must filter by user_id**

```sql
-- Enable RLS on transactions table
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own transactions
CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users cannot update others' transactions
CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);

-- Users cannot delete others' transactions
CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);
```

**Import Jobs RLS:**
```sql
-- Users can only see their own import jobs
CREATE POLICY "Users can view own import jobs"
  ON import_jobs FOR SELECT
  USING (auth.uid() = user_id);

-- Prevent privilege escalation
CREATE POLICY "Users can only create jobs for themselves"
  ON import_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Backend Validation

**Always verify user_id in application code too:**
```javascript
// Double-check before processing import
async function startImport(userId, importJobId) {
  const { data: job } = await supabase
    .from('import_jobs')
    .select('*')
    .eq('id', importJobId)
    .eq('user_id', userId)  // CRITICAL: verify ownership
    .single();
  
  if (!job) {
    throw new Error('Import job not found or access denied');
  }
  
  // Continue with import...
}
```

---

## Rate Limiting

### API Rate Limits

**Per-User Limits:**
- Import jobs: 5 per hour
- File uploads: 10 per hour
- YNAB API calls: Follow YNAB limits (200/hour)

**Implementation:**
```javascript
const rateLimit = require('express-rate-limit');

const importLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour
  keyGenerator: (req) => req.user.id, // Per user, not per IP
  message: 'Too many imports. Please try again in an hour.',
  standardHeaders: true,
  legacyHeaders: false
});

app.post('/api/import/start', importLimiter, async (req, res) => {
  // Import logic
});
```

### YNAB Rate Limit Handling

**Respect YNAB's 200 req/hour limit:**
```javascript
const Bottleneck = require('bottleneck');

const ynabLimiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 2000,  // 2 seconds between requests (max 1800/hour, buffer for safety)
  reservoir: 180, // 180 requests per hour
  reservoirRefreshAmount: 180,
  reservoirRefreshInterval: 60 * 60 * 1000 // 1 hour
});

async function fetchYNABTransactions(budgetId, accessToken) {
  return ynabLimiter.schedule(async () => {
    const response = await fetch(`https://api.ynab.com/v1/budgets/${budgetId}/transactions`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (response.status === 429) {
      throw new Error('YNAB rate limit reached. Please try again later.');
    }
    
    return response.json();
  });
}
```

---

## Logging & Monitoring

### What to Log

**DO Log:**
- ✅ Import job started (user_id, source, timestamp)
- ✅ Import job completed (duration, row counts)
- ✅ Validation errors (sanitized)
- ✅ Failed import attempts
- ✅ OAuth authorization events
- ✅ File upload events (filename, size, type)

**DO NOT Log:**
- ❌ OAuth tokens (access or refresh)
- ❌ Full transaction data
- ❌ User passwords
- ❌ Raw file contents
- ❌ Personal identifiable information (PII)

### Audit Trail

**Log Structure:**
```javascript
{
  "event": "import_started",
  "timestamp": "2025-01-26T10:42:00Z",
  "user_id": "uuid",
  "import_job_id": "uuid",
  "source": "csv",
  "metadata": {
    "filename": "transactions.csv",
    "file_size": 2048,
    "row_count": 523
  }
}
```

**Sensitive Data Redaction:**
```javascript
function sanitizeLogData(data) {
  const redactedKeys = ['access_token', 'refresh_token', 'password', 'api_key'];
  
  const sanitized = { ...data };
  
  for (const key of redactedKeys) {
    if (key in sanitized) {
      sanitized[key] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

console.log('Import started:', sanitizeLogData(importJob));
```

---

## Security Testing Checklist

### Penetration Testing Scenarios

- [ ] **File Upload Attacks**
  - [ ] Upload CSV with formula injection (`=cmd|...`)
  - [ ] Upload XLSX with XXE payload
  - [ ] Upload file with path traversal filename (`../../etc/passwd`)
  - [ ] Upload file exceeding size limit (>10MB)
  - [ ] Upload executable disguised as CSV (`.csv.exe`)

- [ ] **SQL Injection**
  - [ ] Merchant name: `'; DROP TABLE transactions; --`
  - [ ] Amount: `1 OR 1=1`
  - [ ] Category: `<script>alert('XSS')</script>`

- [ ] **XSS Attacks**
  - [ ] Import transaction with `<script>` tag in notes
  - [ ] Merchant name: `<img src=x onerror=alert(1)>`

- [ ] **Authorization Bypass**
  - [ ] Try to access another user's import job
  - [ ] Try to import transactions as another user
  - [ ] Try to read another user's YNAB token

- [ ] **OAuth Attacks**
  - [ ] CSRF (tamper with state parameter)
  - [ ] Token theft (intercept callback URL)
  - [ ] Token replay (reuse old authorization code)

### Automated Security Scans

**Tools to Use:**
- OWASP ZAP (web application security scanner)
- npm audit (dependency vulnerabilities)
- Snyk (dependency and code security)
- ESLint security plugins

**Commands:**
```bash
# Check for vulnerable dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# Scan with Snyk
npx snyk test

# Run security-focused linter
npx eslint --plugin security --plugin no-unsanitized
```

---

## Incident Response Plan

### Data Breach Procedure

1. **Detect**
   - Monitor for unauthorized access attempts
   - Alert on unusual import patterns
   - Review audit logs daily

2. **Contain**
   - Disable affected user accounts
   - Revoke compromised OAuth tokens
   - Block suspicious IP addresses

3. **Investigate**
   - Review access logs
   - Identify scope of breach
   - Determine root cause

4. **Remediate**
   - Patch vulnerability
   - Rotate encryption keys
   - Force password resets if needed

5. **Notify**
   - Notify affected users
   - Report to authorities if required (GDPR, etc.)
   - Document incident for future prevention

---

## Compliance Considerations

### GDPR (Europe)

- ✅ Right to data export (provide CSV export)
- ✅ Right to erasure (delete all user data on request)
- ✅ Data minimization (only store necessary fields)
- ✅ Encryption at rest and in transit
- ✅ Breach notification (within 72 hours)

### CCPA (California)

- ✅ Disclose data collection practices
- ✅ Provide opt-out of data sale (not applicable)
- ✅ Allow data deletion requests

### PCI DSS (if processing payments)

- Not applicable (we don't store credit card numbers)
- YNAB/Plaid handle payment processing

---

## Security Checklist Summary

### Before Launch

- [ ] Enable RLS on all tables
- [ ] Encrypt OAuth tokens at rest
- [ ] Implement CSRF protection (state parameter)
- [ ] Sanitize all file uploads (CSV injection, XXE)
- [ ] Validate and sanitize all user input
- [ ] Implement rate limiting
- [ ] Configure Supabase Storage with RLS
- [ ] Set up automatic file cleanup (24-hour retention)
- [ ] Add audit logging for sensitive operations
- [ ] Run security scanner (OWASP ZAP, Snyk)
- [ ] Penetration testing on staging environment
- [ ] Security code review

### Ongoing

- [ ] Monitor audit logs weekly
- [ ] Rotate encryption keys quarterly
- [ ] Review and update dependencies monthly
- [ ] Conduct security training for developers
- [ ] Perform quarterly penetration testing
- [ ] Review and update security policies annually

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP CSV Injection](https://owasp.org/www-community/attacks/CSV_Injection)
- [YNAB API Security](https://api.ynab.com/#authentication)
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

**Next Steps:**
- Security review of existing codebase
- Implement encryption for OAuth tokens
- Configure rate limiting middleware
- Set up security monitoring and alerting
- Schedule penetration testing with security firm
