# Azure DevOps Work Items: Voice Interface Integration

**Generated:** 2026-02-10 @ 7:55 AM EST  
**Research Report:** `reports/SPRINT-RESEARCH-VOICE-INTERFACE-2026-02-10.md`  
**Project:** Fireside Capital  
**Area Path:** Features\Voice Interface  
**Iteration:** Backlog (Tier 3 Priority)

---

## Work Item Summary

| Phase | Tasks | Hours | Priority |
|-------|-------|-------|----------|
| Phase 1: MVP Alexa Skill | 9 | 40h | Low |
| Phase 2: Enhanced Insights | 5 | 20h | Low |
| Phase 3: Multimodal (Alexa Show) | 3 | 12h | Low |
| Phase 4: Siri Shortcuts (iOS) | 3 | 8h | Low |
| **TOTAL** | **20** | **80h** | **Low** |

---

## PHASE 1: MVP ALEXA SKILL (40 hours)

### Epic: Voice Interface - Alexa Skills Kit MVP
**Type:** Epic  
**Priority:** 3 (Low)  
**Story Points:** 40  
**Tags:** voice, alexa, read-only, tier-3  
**Description:** Implement basic Alexa skill for read-only budget and bill queries with account linking and voice profile security.

---

### Task 1.1: Research & Planning
**Type:** Task  
**Parent:** Voice Interface - Alexa Skills Kit MVP  
**Priority:** 3  
**Effort:** 4 hours  
**Assigned To:** Builder  
**Tags:** research, planning, voice

**Description:**
Finalize voice interface use cases and create detailed interaction model diagram.

**Acceptance Criteria:**
- [ ] Document 3-5 core voice use cases (budget status, upcoming bills, net worth)
- [ ] Create interaction flow diagram (user → Alexa → Lambda → Supabase → response)
- [ ] Define success metrics (adoption rate, usage frequency)
- [ ] Identify security requirements (voice profile, PIN, account linking)
- [ ] Review Alexa Skills Kit documentation and best practices

**Resources:**
- Alexa Skills Kit: https://developer.amazon.com/en-US/alexa/alexa-skills-kit
- Research report: `reports/SPRINT-RESEARCH-VOICE-INTERFACE-2026-02-10.md`

---

### Task 1.2: Alexa Developer Account Setup
**Type:** Task  
**Parent:** Voice Interface - Alexa Skills Kit MVP  
**Priority:** 3  
**Effort:** 2 hours  
**Assigned To:** Builder  
**Tags:** setup, alexa, devops

**Description:**
Set up Alexa Developer Console and create skill metadata.

**Acceptance Criteria:**
- [ ] Create Alexa Developer account (fireside365 org)
- [ ] Register new custom skill: "Fireside Capital"
- [ ] Configure skill metadata (name, icon, category = "Finance & Accounting")
- [ ] Set up testing environment (enable testing for fireside365 accounts)
- [ ] Create AWS account (if not exists) for Lambda hosting

**Outputs:**
- Skill ID: [TBD after registration]
- Invocation Name: "fireside capital"
- Privacy Policy URL: (reuse from dashboard)

---

### Task 1.3: Interaction Model Definition
**Type:** Task  
**Parent:** Voice Interface - Alexa Skills Kit MVP  
**Priority:** 3  
**Effort:** 6 hours  
**Assigned To:** Builder  
**Tags:** alexa, intents, NLU

**Description:**
Define Alexa interaction model with intents, slots, and sample utterances.

**Acceptance Criteria:**
- [ ] Create intent schema JSON file
- [ ] Define BudgetStatusIntent with category slot (dining, groceries, gas, etc.)
- [ ] Define UpcomingBillsIntent with timeframe slot (this week, next week)
- [ ] Define NetWorthIntent (no slots)
- [ ] Write 10-15 sample utterances per intent
- [ ] Configure built-in intents (Help, Stop, Cancel)
- [ ] Upload interaction model to Alexa Developer Console
- [ ] Build and test language model

**Code Location:**
- `alexa-skill/models/en-US.json`

**Sample Utterances:**
```
BudgetStatusIntent:
- "what's my {category} budget"
- "how much have I spent on {category}"
- "check my {category} spending"

UpcomingBillsIntent:
- "what bills are due {timeframe}"
- "show me upcoming bills"
- "when is my next payment"

NetWorthIntent:
- "what's my net worth"
- "how much am I worth"
- "what's my financial status"
```

---

### Task 1.4: AWS Lambda Function Setup
**Type:** Task  
**Parent:** Voice Interface - Alexa Skills Kit MVP  
**Priority:** 3  
**Effort:** 4 hours  
**Assigned To:** Builder  
**Tags:** aws, lambda, backend

**Description:**
Create and configure AWS Lambda function for Alexa skill backend.

**Acceptance Criteria:**
- [ ] Create Lambda function: `FiresideCapitalSkill`
- [ ] Configure Node.js 20.x runtime
- [ ] Set memory to 256 MB, timeout to 10 seconds
- [ ] Install dependencies: `ask-sdk-core`, `@supabase/supabase-js`
- [ ] Configure environment variables: SUPABASE_URL, SUPABASE_SERVICE_KEY
- [ ] Set up Alexa Skills Kit trigger (restrict to skill ID)
- [ ] Create IAM role with CloudWatch Logs permissions
- [ ] Test basic "Hello World" response

**Environment Variables:**
```
SUPABASE_URL=https://qqtiofdqplwycnwplmen.supabase.co
SUPABASE_SERVICE_KEY=[service key from Supabase dashboard]
```

**Code Location:**
- `alexa-skill/lambda/index.js`
- `alexa-skill/lambda/package.json`

---

### Task 1.5: Supabase OAuth Configuration
**Type:** Task  
**Parent:** Voice Interface - Alexa Skills Kit MVP  
**Priority:** 3  
**Effort:** 6 hours  
**Assigned To:** Builder  
**Tags:** auth, oauth, security

**Description:**
Configure account linking between Alexa and Supabase Auth for secure user authentication.

**Acceptance Criteria:**
- [ ] Enable OAuth provider in Supabase Dashboard (Authentication → Providers)
- [ ] Configure redirect URIs for Alexa (pitangui.amazon.com, layla.amazon.com)
- [ ] Implement account linking flow in Alexa Developer Console
- [ ] Test OAuth flow: Enable skill → Redirect to Supabase login → Token exchange
- [ ] Verify access token is included in Lambda requests
- [ ] Implement `getUserId(handlerInput)` helper to extract user_id from token
- [ ] Handle account linking errors gracefully (missing token → LinkAccountCard)

**OAuth Configuration:**
```javascript
// Alexa Developer Console → Account Linking
Authorization URI: https://qqtiofdqplwycnwplmen.supabase.co/auth/v1/authorize
Access Token URI: https://qqtiofdqplwycnwplmen.supabase.co/auth/v1/token
Client ID: [from Supabase OAuth settings]
Client Secret: [from Supabase OAuth settings]
Scopes: read:budget read:bills read:networth
```

**Testing:**
- [ ] Enable skill in Alexa app
- [ ] Verify redirect to Supabase login
- [ ] Verify access token received in Lambda CloudWatch logs
- [ ] Verify user_id extraction works

---

### Task 1.6: Budget Status Intent Handler
**Type:** Task  
**Parent:** Voice Interface - Alexa Skills Kit MVP  
**Priority:** 3  
**Effort:** 6 hours  
**Assigned To:** Builder  
**Tags:** lambda, intents, budgets

**Description:**
Implement BudgetStatusIntent handler to query budget data from Supabase and format voice response.

**Acceptance Criteria:**
- [ ] Implement `BudgetStatusIntentHandler` class with canHandle() and handle()
- [ ] Extract category slot from request
- [ ] Query Supabase `budgets` table filtered by user_id and category
- [ ] Calculate remaining budget and percentage spent
- [ ] Format response for natural speech (currency, percentages)
- [ ] Handle edge cases: No budget set, category not found, database errors
- [ ] Add warning if >80% of budget spent ("Watch out, you're running low!")
- [ ] Test with Alexa Simulator (web console)

**Code Location:**
- `alexa-skill/lambda/handlers/budgetStatusHandler.js`

**Example Response:**
```
"You've spent $340 of your $500 dining budget this month. 
You have $160 remaining, which is 32% of your budget."
```

**Error Handling:**
- No account linked: "Please link your Fireside Capital account in the Alexa app."
- Budget not found: "I couldn't find a budget for [category]. You can set one in the app."
- Database error: "Sorry, I'm having trouble accessing your budget data. Please try again."

---

### Task 1.7: Upcoming Bills Intent Handler
**Type:** Task  
**Parent:** Voice Interface - Alexa Skills Kit MVP  
**Priority:** 3  
**Effort:** 6 hours  
**Assigned To:** Builder  
**Tags:** lambda, intents, bills

**Description:**
Implement UpcomingBillsIntent handler to query upcoming bills from Supabase and format voice response.

**Acceptance Criteria:**
- [ ] Implement `UpcomingBillsIntentHandler` class
- [ ] Extract timeframe slot (default to "this week" if not provided)
- [ ] Query Supabase `bills` table filtered by user_id and due_date range
- [ ] Sort bills by due date (ascending)
- [ ] Format response with bill name, amount, and due date
- [ ] Calculate total amount due
- [ ] Handle edge cases: No bills due, future bills, past due bills
- [ ] Format dates for natural speech ("Monday, February 12th" not "2026-02-12")
- [ ] Test with Alexa Simulator

**Code Location:**
- `alexa-skill/lambda/handlers/upcomingBillsHandler.js`

**Example Response:**
```
"You have 3 bills due this week: 
Electric bill for $120 due Monday, February 12th, 
Internet for $80 due Wednesday, February 14th, 
and Car insurance for $150 due Friday, February 15th. 
Total: $350."
```

**Edge Cases:**
- No bills due: "You have no bills due in the next week. Great job staying on top of things!"
- Past due bills: "You have 1 overdue bill: [name] for [amount] was due [days] ago."

---

### Task 1.8: Testing & Debugging
**Type:** Task  
**Parent:** Voice Interface - Alexa Skills Kit MVP  
**Priority:** 3  
**Effort:** 4 hours  
**Assigned To:** Builder + Auditor  
**Tags:** testing, qa, debugging

**Description:**
Comprehensive testing of Alexa skill on physical Echo device and web simulator.

**Acceptance Criteria:**
- [ ] Test account linking flow end-to-end
- [ ] Test all intents (Budget, Bills, Net Worth) with valid data
- [ ] Test error scenarios (no account linked, no data found, API timeout)
- [ ] Test voice profile verification (if implemented)
- [ ] Test on physical Echo device (not just simulator)
- [ ] Verify CloudWatch logs show correct user_id and queries
- [ ] Test edge cases (empty budgets, no bills, multiple users)
- [ ] Document known issues and limitations

**Testing Checklist:**
- [ ] "Alexa, open Fireside Capital" → Welcome message
- [ ] "What's my dining budget?" → Correct amount and percentage
- [ ] "What bills are due this week?" → Correct bills and dates
- [ ] "What's my net worth?" → (Phase 2, skip for MVP)
- [ ] "Help" → Provides example commands
- [ ] "Stop" → Exits gracefully
- [ ] Account NOT linked → Prompts to link in Alexa app
- [ ] Database timeout → User-friendly error message

**Bugs Found:** [Document in Azure DevOps as Bug work items]

---

### Task 1.9: Alexa Skills Store Certification Preparation
**Type:** Task  
**Parent:** Voice Interface - Alexa Skills Kit MVP  
**Priority:** 3  
**Effort:** 2 hours  
**Assigned To:** PM  
**Tags:** submission, compliance, certification

**Description:**
Prepare skill metadata and submit to Alexa Skills Store for certification.

**Acceptance Criteria:**
- [ ] Write skill description (short + long)
- [ ] Create 3 example phrases for skill card
- [ ] Design skill icon (512x512 PNG, transparent background)
- [ ] Write privacy policy (reuse from dashboard, add voice-specific clauses)
- [ ] Write terms of use (opt into Alexa Terms of Service)
- [ ] Complete testing checklist in Developer Console
- [ ] Submit for certification review (7-14 day approval)
- [ ] Monitor certification feedback and address issues

**Skill Description (Short):**
"Check your budget, upcoming bills, and net worth hands-free with Fireside Capital."

**Example Phrases:**
1. "Alexa, ask Fireside what's my dining budget"
2. "Alexa, ask Fireside what bills are due this week"
3. "Alexa, ask Fireside what's my net worth"

**Privacy Policy Updates:**
- Add clause: "Voice commands are processed by Amazon Alexa. Audio is NOT stored by Fireside Capital."
- Add clause: "Alexa account linking uses OAuth 2.0. We do not store your Alexa credentials."

**Certification Timeline:**
- Day 0: Submit for review
- Day 3-5: Automated testing complete
- Day 7-10: Manual review by Amazon
- Day 14: Approval (if no issues) → Skill goes live

---

## PHASE 2: ENHANCED INSIGHTS (20 hours)

### Epic: Voice Interface - Enhanced Insights
**Type:** Epic  
**Parent:** Voice Interface - Alexa Skills Kit MVP  
**Priority:** 3 (Low)  
**Story Points:** 20  
**Tags:** voice, alexa, insights, proactive  
**Description:** Add net worth queries, spending summaries, and proactive budget alerts to Alexa skill.

---

### Task 2.1: Net Worth Intent Handler
**Type:** Task  
**Parent:** Voice Interface - Enhanced Insights  
**Priority:** 3  
**Effort:** 4 hours  
**Assigned To:** Builder  
**Tags:** lambda, intents, networth

**Description:**
Implement NetWorthIntent handler to query snapshots and calculate month-over-month change.

**Acceptance Criteria:**
- [ ] Implement `NetWorthIntentHandler` class
- [ ] Query Supabase `snapshots` table (latest 2 rows for comparison)
- [ ] Calculate current net worth
- [ ] Calculate change from previous month (absolute and direction)
- [ ] Format response with positive reinforcement for growth
- [ ] Handle edge cases: No snapshots, first month (no comparison)
- [ ] Test with Alexa Simulator

**Example Response:**
```
"Your current net worth is $127,450. 
That's up $2,300 from last month. Great progress!"
```

---

### Task 2.2: Spending Summary Intent Handler
**Type:** Task  
**Parent:** Voice Interface - Enhanced Insights  
**Priority:** 3  
**Effort:** 4 hours  
**Assigned To:** Builder  
**Tags:** lambda, intents, transactions

**Description:**
Implement SpendingSummaryIntent handler to aggregate transaction data by category.

**Acceptance Criteria:**
- [ ] Implement `SpendingSummaryIntentHandler` class
- [ ] Query Supabase `transactions` table (requires Plaid integration)
- [ ] Aggregate spending by category for specified month
- [ ] Calculate top 3 spending categories
- [ ] Format response with total and top categories
- [ ] Handle edge cases: No transactions, current month incomplete
- [ ] Test with sample transaction data

**Example Response:**
```
"In January, you spent $3,240 across all categories. 
Your top spending categories were: 
Dining $680, Gas $340, and Shopping $520."
```

**Note:** Requires Plaid transaction import to be functional.

---

### Task 2.3: Proactive Budget Warnings
**Type:** Task  
**Parent:** Voice Interface - Enhanced Insights  
**Priority:** 3  
**Effort:** 6 hours  
**Assigned To:** Builder + Connector  
**Tags:** proactive, notifications, cron

**Description:**
Implement proactive Alexa notifications when user exceeds 80% of budget.

**Acceptance Criteria:**
- [ ] Create cron job (daily at 8 AM) to check budget thresholds
- [ ] Query all users with budgets >80% spent
- [ ] Send Alexa proactive notification using Proactive Events API
- [ ] Format notification: "Hey, you've spent 85% of your dining budget with 10 days left."
- [ ] Handle user notification preferences (opt-in/opt-out)
- [ ] Test with test user account
- [ ] Monitor CloudWatch logs for notification delivery

**Proactive Events API:**
```javascript
// Requires Alexa Proactive Events API (separate permissions)
const notification = {
  timestamp: new Date().toISOString(),
  referenceId: `budget-warning-${userId}-${category}`,
  expiryTime: new Date(Date.now() + 86400000).toISOString(),  // 24 hours
  event: {
    name: 'AMAZON.MessageAlert.Activated',
    payload: {
      state: {
        status: 'UNREAD'
      },
      messageGroup: {
        creator: {
          name: 'Fireside Capital'
        },
        count: 1,
        urgency: 'IMPORTANT'
      }
    }
  },
  localizedAttributes: [
    {
      locale: 'en-US',
      heading: 'Budget Alert',
      teaser: `You've spent ${percentSpent}% of your ${category} budget`
    }
  ]
};

await alexaProactiveEventsClient.createProactiveEvent(notification, skillId);
```

**Note:** Requires user consent for proactive notifications (collected during account linking).

---

### Task 2.4: Payment Reminders
**Type:** Task  
**Parent:** Voice Interface - Enhanced Insights  
**Priority:** 3  
**Effort:** 4 hours  
**Assigned To:** Builder + Connector  
**Tags:** proactive, bills, reminders

**Description:**
Implement proactive Alexa reminders for upcoming bill payments.

**Acceptance Criteria:**
- [ ] Create cron job (daily at 8 AM) to check bills due in 1-3 days
- [ ] Query all users with upcoming bills
- [ ] Send Alexa proactive reminder: "Your [bill name] payment of $[amount] is due [date]."
- [ ] Allow user to snooze reminder (1 day)
- [ ] Handle multiple bills due on same day
- [ ] Test with test user account

**Example Reminder:**
```
"Your credit card payment of $1,200 is due in 2 days on February 15th. 
Would you like me to remind you again tomorrow?"
```

---

### Task 2.5: Testing & Iteration
**Type:** Task  
**Parent:** Voice Interface - Enhanced Insights  
**Priority:** 3  
**Effort:** 2 hours  
**Assigned To:** Builder + Auditor  
**Tags:** testing, qa, iteration

**Description:**
Test enhanced insights features and iterate based on user feedback.

**Acceptance Criteria:**
- [ ] Test net worth queries with real data
- [ ] Test spending summaries with transaction history
- [ ] Test proactive budget warnings (trigger manually)
- [ ] Test payment reminders (trigger manually)
- [ ] Collect feedback from 3-5 beta users
- [ ] Document improvements needed
- [ ] Implement 1-2 quick fixes based on feedback

**Feedback Questions:**
- Were the voice responses clear and helpful?
- Did proactive notifications feel intrusive or helpful?
- What additional features would you like?
- Did you encounter any bugs or errors?

---

## PHASE 3: MULTIMODAL (ALEXA SHOW) (12 hours)

### Epic: Voice Interface - Multimodal (Alexa Show)
**Type:** Epic  
**Parent:** Voice Interface - Enhanced Insights  
**Priority:** 3 (Low)  
**Story Points:** 12  
**Tags:** voice, alexa, apl, visual  
**Description:** Add visual components (charts, calendars) for Alexa Show and Spot devices using Alexa Presentation Language (APL).

---

### Task 3.1: APL Template Design
**Type:** Task  
**Parent:** Voice Interface - Multimodal (Alexa Show)  
**Priority:** 3  
**Effort:** 6 hours  
**Assigned To:** Builder  
**Tags:** apl, design, visual

**Description:**
Design APL templates for budget charts, bill calendars, and net worth graphs.

**Acceptance Criteria:**
- [ ] Create APL document for budget status (horizontal bar chart)
- [ ] Create APL document for upcoming bills (calendar view)
- [ ] Create APL document for net worth trend (line chart, last 6 months)
- [ ] Use APL Authoring Tool to preview designs
- [ ] Match Fireside Capital brand colors (blue #01a4ef, orange #f44e24)
- [ ] Test on Alexa Show simulator (10" screen)
- [ ] Export APL JSON files

**Code Location:**
- `alexa-skill/apl/budgetStatus.json`
- `alexa-skill/apl/upcomingBills.json`
- `alexa-skill/apl/netWorthTrend.json`

**APL Authoring Tool:** https://developer.amazon.com/alexa/console/ask/displays

---

### Task 3.2: APL Integration with Intent Handlers
**Type:** Task  
**Parent:** Voice Interface - Multimodal (Alexa Show)  
**Priority:** 3  
**Effort:** 4 hours  
**Assigned To:** Builder  
**Tags:** apl, lambda, intents

**Description:**
Integrate APL templates with existing intent handlers to show visuals on Alexa Show.

**Acceptance Criteria:**
- [ ] Detect if user has Alexa Show device (check `context.System.device.supportedInterfaces.Display`)
- [ ] Add APL directive to response if display supported
- [ ] Pass data to APL template (budget amounts, bill dates, net worth history)
- [ ] Fallback to voice-only response if no display
- [ ] Test on physical Alexa Show device (or simulator)

**Code Example:**
```javascript
// In BudgetStatusIntentHandler
if (supportsDisplay(handlerInput)) {
  return handlerInput.responseBuilder
    .speak(speakOutput)
    .addDirective({
      type: 'Alexa.Presentation.APL.RenderDocument',
      token: 'budgetStatusToken',
      document: require('./apl/budgetStatus.json'),
      datasources: {
        budgetData: {
          category: budget.category,
          spent: budget.spent,
          total: budget.amount,
          remaining: budget.amount - budget.spent,
          percentSpent: Math.round((budget.spent / budget.amount) * 100)
        }
      }
    })
    .getResponse();
}
```

---

### Task 3.3: Testing on Alexa Show Device
**Type:** Task  
**Parent:** Voice Interface - Multimodal (Alexa Show)  
**Priority:** 3  
**Effort:** 2 hours  
**Assigned To:** Builder + Auditor  
**Tags:** testing, qa, apl

**Description:**
Test APL visuals on physical Alexa Show device and verify correct rendering.

**Acceptance Criteria:**
- [ ] Test budget bar chart displays correctly on Alexa Show
- [ ] Test bill calendar shows correct dates and amounts
- [ ] Test net worth trend line chart renders smoothly
- [ ] Verify colors match Fireside Capital brand
- [ ] Verify text is readable at 10-foot viewing distance
- [ ] Test with long budget category names (truncation)
- [ ] Document any rendering issues

**Testing Device:** Amazon Echo Show 10 (3rd Gen) or Echo Show 8 (2nd Gen)

---

## PHASE 4: SIRI SHORTCUTS (iOS) (8 hours)

### Epic: Voice Interface - Siri Shortcuts (iOS)
**Type:** Epic  
**Priority:** 3 (Low)  
**Story Points:** 8  
**Tags:** voice, siri, ios, shortcuts  
**Description:** Add Siri Shortcuts integration to Fireside Capital iOS app for hands-free budget and bill queries.

---

### Task 4.1: SiriKit Intents Definition
**Type:** Task  
**Parent:** Voice Interface - Siri Shortcuts (iOS)  
**Priority:** 3  
**Effort:** 3 hours  
**Assigned To:** Builder (iOS)  
**Tags:** sirikit, ios, intents

**Description:**
Define custom SiriKit intents for budget, bills, and net worth queries.

**Acceptance Criteria:**
- [ ] Create `Intents.intentdefinition` file in Xcode project
- [ ] Define `CheckBudgetIntent` with category parameter
- [ ] Define `CheckBillsIntent` with timeframe parameter
- [ ] Define `CheckNetWorthIntent` (no parameters)
- [ ] Configure intent parameters, response templates, and Siri suggestions
- [ ] Build Intents Extension target
- [ ] Build Intents UI Extension target (optional, for visual responses)

**Code Location:**
- `ios/FiresideCapital/Intents.intentdefinition`
- `ios/FiresideCapitalIntents/` (Intents Extension)

**Xcode Configuration:**
1. File → New → Target → Intents Extension
2. Add Intents.intentdefinition file
3. Define custom intents with parameters

---

### Task 4.2: Intent Handler Implementation
**Type:** Task  
**Parent:** Voice Interface - Siri Shortcuts (iOS)  
**Priority:** 3  
**Effort:** 3 hours  
**Assigned To:** Builder (iOS)  
**Tags:** sirikit, ios, swift

**Description:**
Implement intent handlers to process Siri requests and query Supabase.

**Acceptance Criteria:**
- [ ] Implement `CheckBudgetIntentHandler` class (Swift)
- [ ] Implement `CheckBillsIntentHandler` class
- [ ] Implement `CheckNetWorthIntentHandler` class
- [ ] Query Supabase from iOS Intents Extension (using Supabase Swift client)
- [ ] Format responses for Siri speech synthesis
- [ ] Handle authentication (use iOS Keychain for user_id)
- [ ] Handle errors gracefully (no data, network timeout)
- [ ] Test in Xcode Simulator with "Hey Siri" trigger

**Code Example (Swift):**
```swift
import Intents
import Supabase

class CheckBudgetIntentHandler: NSObject, CheckBudgetIntentHandling {
    func handle(intent: CheckBudgetIntent, completion: @escaping (CheckBudgetIntentResponse) -> Void) {
        guard let category = intent.category else {
            completion(CheckBudgetIntentResponse(code: .failure, userActivity: nil))
            return
        }
        
        // Query Supabase
        SupabaseClient.shared.budgets
            .select()
            .eq("category", category)
            .eq("month", currentMonth())
            .execute { result in
                switch result {
                case .success(let budget):
                    let response = CheckBudgetIntentResponse.success(
                        spent: budget.spent,
                        total: budget.amount,
                        remaining: budget.amount - budget.spent
                    )
                    completion(response)
                case .failure:
                    completion(CheckBudgetIntentResponse(code: .failure, userActivity: nil))
                }
            }
    }
}
```

---

### Task 4.3: Siri Shortcuts Suggestions
**Type:** Task  
**Parent:** Voice Interface - Siri Shortcuts (iOS)  
**Priority:** 3  
**Effort:** 2 hours  
**Assigned To:** Builder (iOS)  
**Tags:** sirikit, ios, suggestions

**Description:**
Donate shortcuts to Siri for intelligent suggestions based on user behavior.

**Acceptance Criteria:**
- [ ] Donate "Check Budget" shortcut when user views budget page
- [ ] Donate "Check Bills" shortcut when user views bills page
- [ ] Donate "Check Net Worth" shortcut when user views dashboard
- [ ] Configure suggested invocation phrases in intent definition
- [ ] Test that Siri suggests shortcuts in Settings → Siri & Search
- [ ] Verify shortcuts appear in Shortcuts app

**Code Example (Swift):**
```swift
import Intents

func donateCheckBudgetShortcut(category: String) {
    let intent = CheckBudgetIntent()
    intent.category = category
    intent.suggestedInvocationPhrase = "Check my \(category) budget"
    
    let interaction = INInteraction(intent: intent, response: nil)
    interaction.donate { error in
        if let error = error {
            print("Failed to donate shortcut: \(error)")
        }
    }
}

// Call when user views budget page
donateCheckBudgetShortcut(category: "dining")
```

**Expected Behavior:**
- User says "Hey Siri, check my dining budget"
- Siri responds: "You've spent $340 of your $500 dining budget."
- Shortcut appears in Shortcuts app for automation workflows

---

## Priority & Sequencing Recommendations

### RECOMMENDED: SKIP VOICE INTERFACE (For Now)

**Rationale:**
1. ⚠️ **Low ROI** — 80 hours of development for <5% expected user adoption
2. ⚠️ **Higher priority features** — Real-time collaboration, PWA, ML predictions have bigger impact
3. ⚠️ **Security complexity** — Voice adds attack surface without clear user demand
4. ✅ **Focus on core** — Dashboard improvements provide better UX for complex financial data

**When to Reconsider:**
- User requests for voice features reach >20% of feedback
- Enterprise customers require voice for accessibility compliance
- Alexa Skills Kit introduces major improvements (GPT-style conversational AI)

---

### ALTERNATIVE: IF IMPLEMENTING, DO PHASE 1 ONLY

**Sequence:**
1. **AFTER** Quick Wins Week (PWA, presence, budget widget, live updates, Chart.js)
2. **AFTER** Phase 1 Real-Time Collaboration (16h)
3. **THEN** Voice Interface Phase 1 (40h) — MVP Alexa skill
4. **MEASURE** adoption for 90 days
5. **IF** adoption >10%, proceed to Phase 2
6. **IF** adoption <5%, deprioritize further voice development

**Success Metrics:**
- 10% of users enable Alexa skill (1,000 of 10,000 users)
- 10% of skill users use weekly (100 weekly active voice users)
- <5 support tickets related to voice issues
- Average rating >4.0 stars in Alexa Skills Store

---

## Dependencies

### External Dependencies
- AWS Account with Lambda + CloudWatch access
- Alexa Developer Account (fireside365 org)
- Supabase OAuth provider configuration
- Physical Echo device for testing (Echo Dot 5th Gen minimum, Echo Show for APL)
- iOS device for Siri Shortcuts testing (iPhone 8+ with iOS 16+)

### Internal Dependencies
- Plaid transaction import (for spending summaries) — Task 2.2 blocked until Plaid integrated
- Supabase Auth OAuth setup (for account linking) — Task 1.5 required before all others
- Bills table populated (for upcoming bills) — Task 1.7 requires real bill data

### Skill Dependencies
- `ask-sdk-core` (npm package) — Alexa Skills Kit SDK for Node.js
- `@supabase/supabase-js` (npm package) — Supabase client for Lambda
- AWS CLI (for deployment) — `npm install -g aws-cli`
- ASK CLI (for skill management) — `npm install -g ask-cli`

---

## Cost Estimate

| Phase | Development Hours | Rate | Subtotal |
|-------|-------------------|------|----------|
| Phase 1: MVP | 40h | $150/h | $6,000 |
| Phase 2: Insights | 20h | $150/h | $3,000 |
| Phase 3: Multimodal | 12h | $150/h | $1,800 |
| Phase 4: Siri | 8h | $150/h | $1,200 |
| **TOTAL** | **80h** | **$150/h** | **$12,000** |

**Monthly Operational Costs:**
- AWS Lambda: ~$5/month (100K requests)
- Supabase: $0 (included in current plan)
- **Total:** ~$5/month

**Breakeven:** 0.5 paying subscribers ($10/mo) cover voice infrastructure

---

## Acceptance Criteria (Overall)

### Phase 1: MVP (Definition of Done)
- [ ] Alexa skill published to Skills Store
- [ ] User can link Fireside Capital account via OAuth
- [ ] User can query budget status by category
- [ ] User can query upcoming bills
- [ ] Voice profile verification blocks unauthorized users
- [ ] Error messages are user-friendly
- [ ] Skill passes Amazon certification review
- [ ] Documentation written for user onboarding

### Phase 2: Enhanced Insights (Definition of Done)
- [ ] User can query net worth with month-over-month comparison
- [ ] User can query spending summaries by month
- [ ] Proactive budget warnings sent when >80% spent
- [ ] Payment reminders sent 1-3 days before due date
- [ ] User can opt-in/opt-out of proactive notifications

### Phase 3: Multimodal (Definition of Done)
- [ ] Budget bar chart displays on Alexa Show
- [ ] Bill calendar displays on Alexa Show
- [ ] Net worth trend line chart displays on Alexa Show
- [ ] Visuals match Fireside Capital brand colors
- [ ] Graceful fallback to voice-only for non-display devices

### Phase 4: Siri Shortcuts (Definition of Done)
- [ ] User can say "Hey Siri, check my Fireside budget"
- [ ] User can say "Hey Siri, show me upcoming bills in Fireside"
- [ ] Siri Shortcuts donated after user views relevant pages
- [ ] Shortcuts appear in Shortcuts app for automation
- [ ] iOS Keychain used for secure authentication

---

## Testing Strategy

### Unit Tests
- [ ] Test `getUserId()` helper extracts correct user_id from access token
- [ ] Test budget calculation logic (spent, remaining, percentage)
- [ ] Test date formatting for natural speech
- [ ] Test error handling (null data, API timeout)

### Integration Tests
- [ ] Test end-to-end OAuth account linking flow
- [ ] Test Lambda → Supabase query with real data
- [ ] Test Alexa request → Lambda → Response flow
- [ ] Test proactive notifications delivery

### User Acceptance Testing
- [ ] 5 beta users test voice queries for 1 week
- [ ] Collect qualitative feedback (clarity, helpfulness, accuracy)
- [ ] Track quantitative metrics (success rate, usage frequency)
- [ ] Iterate based on feedback before public launch

---

## Rollout Plan

### Week 1: Beta Testing (5 users)
- Enable skill for fireside365 test accounts only
- Collect feedback via Discord #commands channel
- Monitor CloudWatch logs for errors
- Fix critical bugs

### Week 2: Limited Launch (50 users)
- Announce in #dashboard channel: "Voice interface now in beta!"
- Invite first 50 users to enable skill
- Track adoption rate and usage frequency
- Collect feature requests

### Week 3-4: Public Launch
- Submit skill for Amazon certification
- Announce on social media once approved
- Update dashboard with "Enable Voice" CTA button
- Monitor support tickets for voice-related issues

### Month 2-3: Measure & Iterate
- Track adoption rate (target: 10% of users)
- Track usage frequency (target: 10% use weekly)
- Analyze most-used intents (prioritize those for Phase 2)
- Decide: Continue to Phase 2 OR deprioritize voice

---

**Work Items Generated:** 2026-02-10 @ 7:55 AM EST  
**Total Tasks:** 20  
**Total Estimated Hours:** 80  
**Recommendation:** SKIP VOICE INTERFACE (Tier 3 priority) — Focus on dashboard features with higher ROI first  
**Alternative:** Implement Phase 1 ONLY (40h) after Quick Wins Week, measure adoption for 90 days, then decide on Phase 2-4
