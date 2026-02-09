# Task Backlog: OpenAI Integration

**Created:** February 9, 2026  
**Research Source:** `reports/SPRINT-RESEARCH-OPENAI-API-INTEGRATION-2026-02-09.md`  
**Status:** Awaiting Azure DevOps sync  

---

## 📋 Task Work Items to Create

### Epic: Smart Transaction Categorization
**Priority:** High  
**Effort:** 30 hours total  
**Business Value:** Saves users 5-10 minutes per bank import

---

### Task 1: Setup OpenAI API Infrastructure
**Priority:** P1 (Blocker)  
**Effort:** 2 hours  
**Assignee:** Founder (credentials) + Capital (implementation)  

**Description:**
Set up OpenAI API access and Azure Function infrastructure for secure API key management.

**Acceptance Criteria:**
- [ ] OpenAI API key obtained from https://platform.openai.com
- [ ] API key stored in Azure App Service environment variables
- [ ] Test API connection with simple GPT-3.5 Turbo call
- [ ] Document API key rotation process

**Blockers:**
- Needs founder to create OpenAI account
- Needs payment method on file

**Files to Create:**
- `.env.example` (template for environment variables)
- `docs/openai-setup.md` (setup instructions)

---

### Task 2: Build Azure Function for Transaction Categorization
**Priority:** P1  
**Effort:** 6 hours  
**Assignee:** Capital

**Description:**
Create Azure Function endpoint `/api/categorize` that accepts transaction objects and returns categories via GPT-3.5 Turbo.

**Acceptance Criteria:**
- [ ] Azure Function created: `api/categorize/index.js`
- [ ] Accepts POST with transaction object (name, amount, merchant_name)
- [ ] Returns JSON: `{ category, confidence: 0-100 }`
- [ ] Implements rate limiting (100 requests/hour per user)
- [ ] Input sanitization (no prompt injection)
- [ ] Error handling (API failures, invalid input)
- [ ] Unit tests for prompt building
- [ ] Integration test with OpenAI API

**Files to Create:**
- `api/categorize/index.js`
- `api/categorize/function.json`
- `tests/api/categorize.test.js`

**Code Reference:**
See `reports/SPRINT-RESEARCH-OPENAI-API-INTEGRATION-2026-02-09.md` lines 40-80

---

### Task 3: Implement Client-Side Categorization
**Priority:** P1  
**Effort:** 4 hours  
**Assignee:** Capital

**Description:**
Add client-side categorization logic that calls Azure Function and handles responses.

**Acceptance Criteria:**
- [ ] Create `app/assets/js/openai-categorizer.js`
- [ ] Implement `categorizeTransaction(transaction)` function
- [ ] Call `/api/categorize` with fetch()
- [ ] Handle loading states (spinner)
- [ ] Handle errors (show fallback UI)
- [ ] Cache successful categorizations in memory
- [ ] Update transaction object with category + confidence

**Files to Create:**
- `app/assets/js/openai-categorizer.js`

**Files to Modify:**
- `app/assets/js/plaid.js` (integrate categorization into import flow)

---

### Task 4: Build Merchant Caching System
**Priority:** P2  
**Effort:** 4 hours  
**Assignee:** Capital

**Description:**
Implement merchant-to-category caching to reduce API calls by 60-70%.

**Acceptance Criteria:**
- [ ] Create Supabase table: `merchant_cache (merchant_name, category, updated_at)`
- [ ] Check cache before calling OpenAI API
- [ ] Store successful categorizations in cache
- [ ] Add cache management UI in settings (clear cache button)
- [ ] Add cache hit/miss metrics to dashboard

**Files to Create:**
- `supabase/migrations/004_merchant_cache.sql`
- `app/settings.html` (cache management section)

**Files to Modify:**
- `api/categorize/index.js` (add cache lookup)

---

### Task 5: Human-in-the-Loop Review UI
**Priority:** P2  
**Effort:** 6 hours  
**Assignee:** Capital

**Description:**
Add manual review interface for low-confidence (<70%) categorizations.

**Acceptance Criteria:**
- [ ] Create review queue table: `categorization_reviews (transaction_id, suggested_category, confidence, status)`
- [ ] Add "Review Needed" badge to transactions page
- [ ] Create review modal with transaction details
- [ ] Allow user to accept/reject/override category
- [ ] Update merchant cache when user overrides
- [ ] Track accuracy metrics (user corrections)

**Files to Create:**
- `supabase/migrations/005_categorization_reviews.sql`
- `app/assets/js/categorization-review.js`

**Files to Modify:**
- `app/transactions.html` (add review UI)

---

### Task 6: Integration Testing & Accuracy Audit
**Priority:** P1  
**Effort:** 4 hours  
**Assignee:** Capital

**Description:**
Test categorization with 100 real transactions and measure accuracy.

**Acceptance Criteria:**
- [ ] Import 100 sample Plaid transactions
- [ ] Run categorization on all transactions
- [ ] Manually audit results (expected vs actual)
- [ ] Measure accuracy rate (target: >90%)
- [ ] Measure cost per transaction (target: <$0.002)
- [ ] Document results in test report

**Files to Create:**
- `tests/categorization-audit-2026-02-09.csv`
- `reports/categorization-accuracy-report.md`

---

### Task 7: Budget Insights Generation (Phase 2)
**Priority:** P2  
**Effort:** 8 hours  
**Assignee:** Capital

**Description:**
Generate automated spending insights using GPT-4 Turbo.

**Acceptance Criteria:**
- [ ] Create Azure Function: `api/insights`
- [ ] Accept monthly spending data (budget vs actual per category)
- [ ] Return 3-5 actionable insights (warning/success/info)
- [ ] Add insights widget to dashboard
- [ ] Schedule daily insight generation (cron job)
- [ ] Post insights to Discord #alerts

**Files to Create:**
- `api/insights/index.js`
- `app/assets/js/openai-insights.js`
- `app/dashboard.html` (insights section)

**Code Reference:**
See `reports/SPRINT-RESEARCH-OPENAI-API-INTEGRATION-2026-02-09.md` lines 180-240

---

### Task 8: Natural Language Query Interface (Phase 3)
**Priority:** P3  
**Effort:** 10 hours  
**Assignee:** Capital

**Description:**
Add chat interface for natural language financial queries.

**Acceptance Criteria:**
- [ ] Create Azure Function: `api/query`
- [ ] Accept natural language query (string)
- [ ] Generate safe SQL query (SELECT only, no injection)
- [ ] Execute via Supabase RPC (with RLS)
- [ ] Return human-readable explanation + data
- [ ] Add chat widget to dashboard
- [ ] Store query history

**Files to Create:**
- `api/query/index.js`
- `app/assets/js/openai-query.js`
- `app/dashboard.html` (chat widget)

**Security Notes:**
- MUST validate SQL (whitelist SELECT only)
- MUST filter by user_id (server-side)
- NEVER execute raw SQL from GPT output

**Code Reference:**
See `reports/SPRINT-RESEARCH-OPENAI-API-INTEGRATION-2026-02-09.md` lines 300-370

---

## 📊 Summary

| Phase | Tasks | Effort | Priority |
|-------|-------|--------|----------|
| **Infrastructure** | Task 1 | 2 hours | P1 |
| **Phase 1: Categorization** | Tasks 2-6 | 24 hours | P1-P2 |
| **Phase 2: Insights** | Task 7 | 8 hours | P2 |
| **Phase 3: Queries** | Task 8 | 10 hours | P3 |
| **TOTAL** | 8 tasks | 44 hours | — |

---

## 🎯 Dependencies

### Task 1 (Setup) blocks:
- Task 2 (Azure Function)
- Task 7 (Insights)
- Task 8 (Queries)

### Task 2 (Azure Function) blocks:
- Task 3 (Client categorization)
- Task 4 (Merchant cache)
- Task 5 (Review UI)
- Task 6 (Testing)

### Task 6 (Testing) should run after:
- Tasks 2-5 complete

---

## 🚀 Recommended Sprint Plan

### Sprint 1 (Week 1): Infrastructure + Core Categorization
- Task 1: Setup OpenAI API (2 hours)
- Task 2: Build Azure Function (6 hours)
- Task 3: Client-side integration (4 hours)
- Task 6: Initial testing (2 hours)

**Deliverable:** Working categorization with 100 test transactions

### Sprint 2 (Week 2): Optimization + Review UI
- Task 4: Merchant caching (4 hours)
- Task 5: Review UI (6 hours)
- Task 6: Full accuracy audit (2 hours)

**Deliverable:** Production-ready categorization with human review

### Sprint 3 (Week 3): Budget Insights
- Task 7: Insights generation (8 hours)

**Deliverable:** Automated spending insights on dashboard + Discord

### Sprint 4 (Week 4): Natural Language Queries
- Task 8: Query interface (10 hours)

**Deliverable:** Chat-based financial Q&A

---

## 📝 Notes for Azure DevOps Sync

When Azure DevOps authentication is working, create these tasks with:
- **Area Path:** Fireside Capital / AI Integration
- **Iteration:** Sprint 2026-02
- **Tags:** `research`, `ai`, `openai`, `automation`
- **Parent:** Epic "Smart Transaction Categorization"

---

**Created by:** Capital (Orchestrator)  
**Date:** February 9, 2026  
**Status:** Ready for Azure DevOps import
