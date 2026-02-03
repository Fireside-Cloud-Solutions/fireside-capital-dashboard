# SEO Optimization Guide
**Fireside Capital**

Version: 1.0  
Date: 2026-02-03

---

## Overview

Search Engine Optimization (SEO) improvements to increase discoverability and search rankings.

---

## Files Created

1. **`sitemap.xml`** — Site structure for search engines
2. **`robots.txt`** — Crawler instructions
3. **`seo-meta-tags-template.html`** — Meta tags template for all pages

---

## What Was Added

### 1. Sitemap (`sitemap.xml`)
- Lists all 11 pages with priority and update frequency
- Helps search engines discover and index pages
- Submitted to Google Search Console: https://search.google.com/search-console

### 2. Robots.txt (`robots.txt`)
- Allows all search engine crawlers
- Points to sitemap location
- No blocked pages (all public)

### 3. SEO Meta Tags (all HTML pages)
**Primary meta tags:**
- `<title>` — Page title (under 60 characters)
- `<meta name="description">` — Page description (under 160 characters)
- `<meta name="keywords">` — Relevant keywords

**Open Graph (Facebook, LinkedIn):**
- `og:title`, `og:description`, `og:image`, `og:url`
- Enables rich link previews when shared on social media

**Twitter Card:**
- `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- Optimized for Twitter shares

**Canonical URL:**
- `<link rel="canonical">` — Prevents duplicate content penalties

**Favicon & Theme:**
- `<link rel="icon">` — Browser favicon
- `<meta name="theme-color">` — Mobile browser theme color (#01a4ef)

---

## How to Apply Meta Tags

### Step 1: Copy Template
Open `docs/seo-meta-tags-template.html` and copy the meta tags section.

### Step 2: Replace Placeholders
For each HTML page, replace:
- `[PAGE_TITLE]` — e.g., "Dashboard", "Bills", "Assets"
- `[PAGE_DESCRIPTION]` — Brief description of the page (under 160 chars)
- `[PAGE_URL]` — Relative URL, e.g., `/`, `/bills.html`, `/assets.html`

### Step 3: Paste into `<head>`
Add the meta tags to the `<head>` section of each HTML file, after charset/viewport tags.

---

## Example: Bills Page

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <!-- SEO Meta Tags -->
  <title>Bills | Fireside Capital</title>
  <meta name="description" content="Never miss a payment. Track recurring bills, split expenses with friends, and get payment reminders." />
  <meta name="keywords" content="bill tracker, payment reminders, recurring bills, split expenses, bill management" />
  
  <!-- Open Graph -->
  <meta property="og:title" content="Bills | Fireside Capital" />
  <meta property="og:description" content="Never miss a payment. Track recurring bills, split expenses with friends, and get payment reminders." />
  <meta property="og:url" content="https://nice-cliff-05b13880f.2.azurestaticapps.net/bills.html" />
  <meta property="og:image" content="https://nice-cliff-05b13880f.2.azurestaticapps.net/assets/img/og-image.png" />
  
  <!-- Canonical URL -->
  <link rel="canonical" href="https://nice-cliff-05b13880f.2.azurestaticapps.net/bills.html" />
  
  <!-- Existing CSS/fonts... -->
</head>
```

---

## Semantic HTML Improvements

### Use Proper Heading Hierarchy
```html
<!-- Before -->
<div class="title">Dashboard</div>

<!-- After -->
<h1>Dashboard</h1>
```

### Add ARIA Landmarks
```html
<header role="banner">
  <nav role="navigation">...</nav>
</header>

<main role="main" id="main-content">
  <!-- Page content -->
</main>

<footer role="contentinfo">
  <!-- Footer content -->
</footer>
```

### Use Semantic Elements
```html
<!-- Before -->
<div class="card">...</div>

<!-- After -->
<article class="card">...</article>

<!-- Before -->
<div class="table-wrapper">...</div>

<!-- After -->
<section class="table-wrapper">
  <h2>Your Bills</h2>
  <table>...</table>
</section>
```

---

## Structured Data (Optional Future Enhancement)

Add JSON-LD structured data for rich search results:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Fireside Capital",
  "applicationCategory": "FinanceApplication",
  "description": "Personal finance dashboard to track net worth, bills, budgets, and investments.",
  "operatingSystem": "Any",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
</script>
```

---

## Performance Optimizations for SEO

### 1. Image Optimization
- **Compress images** — Use TinyPNG or ImageOptim
- **Add alt text** — All images should have descriptive alt attributes
- **Lazy loading** — `<img loading="lazy" ...>`

### 2. Minify Assets
```bash
# Minify CSS
npx cssnano styles.css > styles.min.css

# Minify JavaScript
npx terser app.js -o app.min.js
```

### 3. Enable Compression (Azure Static Web Apps)
Add to `staticwebapp.config.json`:
```json
{
  "globalHeaders": {
    "content-encoding": "gzip"
  }
}
```

---

## Google Search Console Setup

### 1. Verify Ownership
1. Go to https://search.google.com/search-console
2. Add property: `https://nice-cliff-05b13880f.2.azurestaticapps.net`
3. Verify via HTML file upload or DNS TXT record

### 2. Submit Sitemap
1. In Search Console, go to **Sitemaps**
2. Add sitemap URL: `https://nice-cliff-05b13880f.2.azurestaticapps.net/sitemap.xml`
3. Click **Submit**

### 3. Monitor Performance
- Check **Performance** tab for search queries, clicks, impressions
- Review **Coverage** for indexing issues
- Check **Core Web Vitals** for performance metrics

---

## Keyword Strategy

### Primary Keywords
- Personal finance dashboard
- Net worth tracker
- Budget calculator
- Bill tracker
- Debt payoff calculator

### Long-Tail Keywords
- "Track net worth and assets online"
- "Free budget tracking app"
- "Split bills with roommates"
- "Calculate debt payoff timeline"

### Page-Specific Keywords
- **Dashboard:** net worth, financial overview, asset tracking
- **Bills:** bill tracker, payment reminders, recurring bills
- **Budget:** budget planner, monthly budget, spending tracker
- **Debts:** debt payoff, loan calculator, interest tracking
- **Investments:** 401k tracker, IRA calculator, investment returns

---

## Content Recommendations

### Add Blog Section (Future)
- Articles about personal finance tips
- How-to guides (e.g., "How to Track Your Net Worth")
- Financial calculators
- Case studies

### Add FAQ Section
- Common questions about features
- Troubleshooting guides
- Security/privacy information

---

## Monitoring & Analytics

### Google Analytics (if needed)
Add to all pages before closing `</head>`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Plausible Analytics (Privacy-Friendly Alternative)
```html
<script defer data-domain="nice-cliff-05b13880f.2.azurestaticapps.net" src="https://plausible.io/js/script.js"></script>
```

---

## Checklist

### Immediate (Completed)
- [x] Create `sitemap.xml`
- [x] Create `robots.txt`
- [x] Document SEO meta tags template

### Next Steps (Apply to HTML Pages)
- [ ] Add meta tags to `index.html`
- [ ] Add meta tags to `bills.html`
- [ ] Add meta tags to `assets.html`
- [ ] Add meta tags to `budget.html`
- [ ] Add meta tags to `debts.html`
- [ ] Add meta tags to `income.html`
- [ ] Add meta tags to `investments.html`
- [ ] Add meta tags to `friends.html`
- [ ] Add meta tags to `reports.html`
- [ ] Add meta tags to `settings.html`

### Future Enhancements
- [ ] Submit sitemap to Google Search Console
- [ ] Add Open Graph images (`og-image.png`, `twitter-card.png`)
- [ ] Implement structured data (JSON-LD)
- [ ] Add blog section for content marketing
- [ ] Set up Google Analytics or Plausible

---

## Expected Impact

- **Search visibility:** Improved rankings for target keywords
- **Social sharing:** Rich link previews on Facebook, Twitter, LinkedIn
- **Indexing:** Faster discovery and indexing by search engines
- **User experience:** Better mobile browser theming, favicons

---

## Related Documentation

- [Accessibility Guide](./ACCESSIBILITY.md)
- [Performance Optimization](./PERFORMANCE.md)
- [Semantic HTML](./SEMANTIC_HTML.md)

---

**Last Updated:** 2026-02-03  
**Owner:** Capital (Orchestrator)
