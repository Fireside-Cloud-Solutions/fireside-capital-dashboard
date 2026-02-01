/**
 * Bill Parser — Fireside Capital
 * 
 * Extracts structured bill data from Gmail messages:
 *   - Vendor name
 *   - Amount due
 *   - Due date
 *   - Category (heuristic)
 *   - Confidence score
 * 
 * Output is ready for Supabase `bills` table insertion.
 */

// ---------------------------------------------------------------------------
// Amount Extraction
// ---------------------------------------------------------------------------

/**
 * Regex patterns for dollar amounts, ordered by specificity.
 * Each pattern captures the numeric portion.
 */
const AMOUNT_PATTERNS = [
  // "Amount Due: $1,234.56" or "Total Due: $85.50"
  /(?:amount\s*due|total\s*due|balance\s*due|total\s*amount|payment\s*due|minimum\s*due|new\s*balance|current\s*balance|total\s*charges|amount\s*owed)\s*[:\-–]?\s*\$?([\d,]+\.?\d{0,2})/gi,
  // "$1,234.56 due" or "$85.50 is due"
  /\$\s*([\d,]+\.\d{2})\s*(?:is\s+)?(?:due|owed|payable)/gi,
  // "Pay $85.50" or "pay $1,234.56"
  /pay\s*\$?\s*([\d,]+\.\d{2})/gi,
  // "due: $85.50" standalone
  /due\s*[:\-–]?\s*\$\s*([\d,]+\.\d{2})/gi,
  // Generic dollar amounts (fallback) — $85.50
  /\$([\d,]+\.\d{2})/g,
];

/**
 * Extract the most likely bill amount from email text.
 * Returns { amount: number, confidence: number } or null.
 */
function extractAmount(text) {
  if (!text) return null;

  for (let i = 0; i < AMOUNT_PATTERNS.length; i++) {
    const pattern = new RegExp(AMOUNT_PATTERNS[i].source, AMOUNT_PATTERNS[i].flags);
    const matches = [];
    let match;

    while ((match = pattern.exec(text)) !== null) {
      const raw = match[1].replace(/,/g, '');
      const amount = parseFloat(raw);
      if (amount > 0 && amount < 100000) {
        // Higher confidence for specific patterns (first few), lower for generic
        const confidence = i < 4 ? 0.9 - i * 0.05 : 0.5;
        matches.push({ amount, confidence });
      }
    }

    if (matches.length > 0) {
      // Return the first match from this pattern tier
      return matches[0];
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Due Date Extraction
// ---------------------------------------------------------------------------

/**
 * Regex patterns for due dates.
 */
const DATE_PATTERNS = [
  // "Due Date: January 15, 2026" or "Due by: Jan 15, 2026"
  /(?:due\s*(?:date|by|on)?)\s*[:\-–]?\s*(\w+\.?\s+\d{1,2},?\s*\d{2,4})/gi,
  // "Due Date: 01/15/2026" or "Due by: 1/15/26"
  /(?:due\s*(?:date|by|on)?)\s*[:\-–]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi,
  // "Payment due January 15" (no year — assume current/next)
  /(?:payment\s*due|due)\s*[:\-–]?\s*(\w+\.?\s+\d{1,2})(?!\d)/gi,
  // "by January 15, 2026"
  /\bby\s+(\w+\.?\s+\d{1,2},?\s*\d{2,4})/gi,
  // "01/15/2026" near "due" keyword
  /due[\s\S]{0,30}?(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi,
];

const MONTH_MAP = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

/**
 * Parse a date string into a Date object.
 * Handles: "January 15, 2026", "Jan 15, 2026", "01/15/2026", "1-15-26"
 */
function parseDateString(dateStr) {
  if (!dateStr) return null;

  const cleaned = dateStr.trim().replace(/\./g, '');

  // Try "Month Day, Year" format
  const namedMatch = cleaned.match(/^(\w+)\s+(\d{1,2}),?\s*(\d{2,4})?$/);
  if (namedMatch) {
    const month = MONTH_MAP[namedMatch[1].toLowerCase()];
    if (month !== undefined) {
      const day = parseInt(namedMatch[2]);
      let year = namedMatch[3] ? parseInt(namedMatch[3]) : new Date().getFullYear();
      if (year < 100) year += 2000;
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) return date;
    }
  }

  // Try "MM/DD/YYYY" or "MM-DD-YYYY" format
  const numericMatch = cleaned.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (numericMatch) {
    const month = parseInt(numericMatch[1]) - 1;
    const day = parseInt(numericMatch[2]);
    let year = parseInt(numericMatch[3]);
    if (year < 100) year += 2000;
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) return date;
  }

  // Fallback to native Date parsing
  const fallback = new Date(cleaned);
  if (!isNaN(fallback.getTime())) return fallback;

  return null;
}

/**
 * Extract the most likely due date from email text.
 * Returns { date: string (YYYY-MM-DD), confidence: number } or null.
 */
function extractDueDate(text) {
  if (!text) return null;

  for (let i = 0; i < DATE_PATTERNS.length; i++) {
    const pattern = new RegExp(DATE_PATTERNS[i].source, DATE_PATTERNS[i].flags);
    let match;

    while ((match = pattern.exec(text)) !== null) {
      const parsed = parseDateString(match[1]);
      if (parsed) {
        const formatted = parsed.toISOString().split('T')[0]; // YYYY-MM-DD
        const confidence = i < 2 ? 0.9 : 0.7;
        return { date: formatted, confidence };
      }
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Vendor Extraction
// ---------------------------------------------------------------------------

/**
 * Known vendor aliases — maps sender domains/names to clean vendor names.
 * Extend this as the user processes more bills.
 */
const VENDOR_MAP = {
  // Utilities
  'att.com': 'AT&T',
  'att.net': 'AT&T',
  'verizon.com': 'Verizon',
  'vzw.com': 'Verizon Wireless',
  't-mobile.com': 'T-Mobile',
  'xfinity.com': 'Xfinity',
  'comcast.com': 'Comcast/Xfinity',
  'spectrum.com': 'Spectrum',
  'duke-energy.com': 'Duke Energy',
  'pge.com': 'PG&E',
  'coned.com': 'Con Edison',
  'nationalgrid.com': 'National Grid',
  'dominionenergy.com': 'Dominion Energy',
  'sce.com': 'Southern California Edison',
  'waterutility.com': 'Water Utility',

  // Insurance
  'geico.com': 'GEICO',
  'statefarm.com': 'State Farm',
  'progressive.com': 'Progressive',
  'allstate.com': 'Allstate',
  'usaa.com': 'USAA',
  'libertymutual.com': 'Liberty Mutual',

  // Subscriptions
  'netflix.com': 'Netflix',
  'spotify.com': 'Spotify',
  'apple.com': 'Apple',
  'google.com': 'Google',
  'amazon.com': 'Amazon',
  'hulu.com': 'Hulu',
  'disneyplus.com': 'Disney+',
  'youtube.com': 'YouTube',
  'adobe.com': 'Adobe',
  'microsoft.com': 'Microsoft',
  'dropbox.com': 'Dropbox',

  // Financial
  'chase.com': 'Chase',
  'bankofamerica.com': 'Bank of America',
  'wellsfargo.com': 'Wells Fargo',
  'capitalone.com': 'Capital One',
  'discover.com': 'Discover',
  'americanexpress.com': 'American Express',
  'citi.com': 'Citi',
  'paypal.com': 'PayPal',
  'sofi.com': 'SoFi',
  'navient.com': 'Navient',
  'salliemae.com': 'Sallie Mae',
  'nelnet.com': 'Nelnet',
  'greatLakes.org': 'Great Lakes',

  // Rent / Housing
  'zillow.com': 'Zillow',
  'apartments.com': 'Apartments.com',
  'rent.com': 'Rent.com',
};

/**
 * Extract vendor name from the "From" header.
 * Returns a clean vendor name.
 */
function extractVendor(fromHeader, subject) {
  if (!fromHeader) return 'Unknown';

  // Try to extract domain from email address
  const emailMatch = fromHeader.match(/<([^>]+)>/);
  const email = emailMatch ? emailMatch[1].toLowerCase() : fromHeader.toLowerCase();
  const domainMatch = email.match(/@([^@]+)$/);

  if (domainMatch) {
    const domain = domainMatch[1];
    // Check known vendor map
    if (VENDOR_MAP[domain]) {
      return VENDOR_MAP[domain];
    }
    // Try parent domain (e.g., "billing.att.com" → "att.com")
    const parts = domain.split('.');
    if (parts.length > 2) {
      const parentDomain = parts.slice(-2).join('.');
      if (VENDOR_MAP[parentDomain]) {
        return VENDOR_MAP[parentDomain];
      }
    }
  }

  // Try the display name from "From" header
  const nameMatch = fromHeader.match(/^"?([^"<]+)"?\s*</);
  if (nameMatch) {
    return nameMatch[1].trim()
      .replace(/\b(billing|noreply|no-reply|notifications?|alerts?|payments?|support)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim() || 'Unknown';
  }

  // Fallback: use subject line to guess vendor
  if (subject) {
    const subjectVendor = subject.match(/(?:from|your)\s+(\w[\w\s&.'-]+?)(?:\s+(?:bill|statement|invoice|account))/i);
    if (subjectVendor) return subjectVendor[1].trim();
  }

  return 'Unknown';
}

// ---------------------------------------------------------------------------
// Category Classification
// ---------------------------------------------------------------------------

/**
 * Heuristic category classifier based on vendor name, sender, and email content.
 */
const CATEGORY_RULES = [
  {
    category: 'utilities',
    keywords: ['electric', 'gas', 'water', 'power', 'energy', 'utility', 'sewer', 'trash', 'waste', 'internet', 'wifi', 'broadband', 'cable', 'phone', 'mobile', 'wireless', 'cellular'],
    vendors: ['AT&T', 'Verizon', 'T-Mobile', 'Xfinity', 'Comcast', 'Spectrum', 'Duke Energy', 'PG&E', 'Con Edison', 'National Grid', 'Dominion Energy', 'Verizon Wireless'],
  },
  {
    category: 'insurance',
    keywords: ['insurance', 'premium', 'policy', 'coverage', 'deductible', 'claim'],
    vendors: ['GEICO', 'State Farm', 'Progressive', 'Allstate', 'USAA', 'Liberty Mutual'],
  },
  {
    category: 'subscriptions',
    keywords: ['subscription', 'membership', 'renewal', 'recurring', 'plan', 'streaming'],
    vendors: ['Netflix', 'Spotify', 'Apple', 'Hulu', 'Disney+', 'YouTube', 'Adobe', 'Dropbox', 'Amazon Prime'],
  },
  {
    category: 'housing',
    keywords: ['rent', 'mortgage', 'lease', 'hoa', 'property', 'housing', 'apartment'],
    vendors: ['Zillow', 'Apartments.com', 'Rent.com'],
  },
  {
    category: 'loans',
    keywords: ['loan', 'student', 'auto loan', 'personal loan', 'installment', 'repayment', 'principal', 'interest rate'],
    vendors: ['Navient', 'Sallie Mae', 'Nelnet', 'Great Lakes', 'SoFi'],
  },
  {
    category: 'credit_cards',
    keywords: ['credit card', 'card statement', 'minimum payment', 'credit limit', 'card ending'],
    vendors: ['Chase', 'Bank of America', 'Wells Fargo', 'Capital One', 'Discover', 'American Express', 'Citi'],
  },
  {
    category: 'medical',
    keywords: ['medical', 'health', 'doctor', 'hospital', 'pharmacy', 'dental', 'vision', 'copay', 'deductible', 'patient'],
    vendors: [],
  },
];

/**
 * Classify an email into a bill category.
 * Returns { category: string, confidence: number }
 */
function classifyCategory(vendor, subject, body) {
  const searchText = `${vendor} ${subject} ${body}`.toLowerCase();

  let bestMatch = { category: 'other', confidence: 0.3 };

  for (const rule of CATEGORY_RULES) {
    let score = 0;

    // Check vendor match (high confidence)
    if (rule.vendors.some((v) => vendor.toLowerCase().includes(v.toLowerCase()))) {
      score += 0.6;
    }

    // Check keyword matches in text
    const keywordHits = rule.keywords.filter((kw) => searchText.includes(kw));
    score += Math.min(keywordHits.length * 0.15, 0.45);

    if (score > bestMatch.confidence) {
      bestMatch = { category: rule.category, confidence: Math.min(score, 0.95) };
    }
  }

  return bestMatch;
}

// ---------------------------------------------------------------------------
// Main Parser Pipeline
// ---------------------------------------------------------------------------

/**
 * Parse a single email into a structured bill record.
 * 
 * @param {object} email — Email object from gmail-client.js
 * @returns {object|null} — Structured bill data or null if not a bill
 */
function parseEmail(email) {
  const fullText = `${email.subject} ${email.snippet} ${email.body}`;

  // Extract vendor
  const vendor = extractVendor(email.from, email.subject);

  // Extract amount
  const amountResult = extractAmount(fullText);
  if (!amountResult) {
    // Can't extract an amount — probably not a bill
    return null;
  }

  // Extract due date
  const dateResult = extractDueDate(fullText);

  // Classify category
  const categoryResult = classifyCategory(vendor, email.subject, email.body);

  // Overall confidence = average of component confidences
  const confidenceFactors = [amountResult.confidence, categoryResult.confidence];
  if (dateResult) confidenceFactors.push(dateResult.confidence);
  const overallConfidence = confidenceFactors.reduce((a, b) => a + b, 0) / confidenceFactors.length;

  return {
    vendor: vendor,
    amount: amountResult.amount,
    due_date: dateResult ? dateResult.date : null,
    category: categoryResult.category,
    source_email_id: email.id,
    confidence: Math.round(overallConfidence * 100) / 100,
    // Metadata (not stored in Supabase, useful for debugging)
    _meta: {
      subject: email.subject,
      from: email.from,
      date: email.date,
      amount_confidence: amountResult.confidence,
      date_confidence: dateResult ? dateResult.confidence : 0,
      category_confidence: categoryResult.confidence,
    },
  };
}

/**
 * Parse an array of emails into structured bill records.
 * Filters out non-bills and deduplicates by vendor + amount + date.
 * 
 * @param {Array} emails — Array of email objects from gmail-client.js
 * @param {object} options
 * @param {number} options.minConfidence — Minimum confidence to include (default: 0.4)
 * @returns {Array} — Array of structured bill records
 */
function parseBillEmails(emails, { minConfidence = 0.4 } = {}) {
  const bills = [];
  const seen = new Set();

  for (const email of emails) {
    try {
      const bill = parseEmail(email);
      if (!bill) continue;
      if (bill.confidence < minConfidence) continue;

      // Deduplicate: same vendor + amount + due_date = same bill
      const dedupeKey = `${bill.vendor}|${bill.amount}|${bill.due_date}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      bills.push(bill);
    } catch (err) {
      console.warn(`[BillParser] Failed to parse email ${email.id}:`, err.message);
    }
  }

  // Sort by due date (soonest first), nulls last
  bills.sort((a, b) => {
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return a.due_date.localeCompare(b.due_date);
  });

  console.log(`[BillParser] Parsed ${bills.length} bills from ${emails.length} emails`);
  return bills;
}

// ---------------------------------------------------------------------------
// CLI Runner — for testing
// ---------------------------------------------------------------------------

async function main() {
  const { searchBillEmails } = require('./gmail-client');

  const days = parseInt(process.argv[2]) || 30;
  const minConfidence = parseFloat(process.argv[3]) || 0.4;

  console.log(`\n🔍 Searching Gmail for bills from the last ${days} days...`);
  console.log(`   Minimum confidence: ${minConfidence}\n`);

  const emails = await searchBillEmails({ days });
  const bills = parseBillEmails(emails, { minConfidence });

  console.log(`\n📋 Found ${bills.length} bills:\n`);
  console.log(JSON.stringify(bills.map(({ _meta, ...bill }) => bill), null, 2));

  // Summary
  const totalDue = bills.reduce((sum, b) => sum + b.amount, 0);
  console.log(`\n💰 Total due: $${totalDue.toFixed(2)}`);

  const byCategory = {};
  for (const bill of bills) {
    byCategory[bill.category] = (byCategory[bill.category] || 0) + bill.amount;
  }
  console.log('\n📊 By Category:');
  for (const [cat, total] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${cat}: $${total.toFixed(2)}`);
  }

  return bills;
}

// Run if executed directly
if (require.main === module) {
  main().catch((err) => {
    console.error('[BillParser] Error:', err.message);
    process.exit(1);
  });
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
module.exports = {
  parseEmail,
  parseBillEmails,
  extractAmount,
  extractDueDate,
  extractVendor,
  classifyCategory,
  VENDOR_MAP,
  CATEGORY_RULES,
};
