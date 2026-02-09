# Alexa Skills Kit Integration for Fireside Ember

**Research Date:** February 8, 2026  
**Target Application:** Fireside Ember (Tauri + Rust + TypeScript desktop personal assistant)  
**Objective:** Evaluate feasibility and architecture for Alexa voice interface integration

---

## Executive Summary

### Feasibility Assessment: ✅ **FEASIBLE with Cloud Infrastructure**

Integrating Alexa Skills Kit with Fireside Ember is technically feasible, but requires **cloud infrastructure** as a bridge between Alexa and the desktop application. Alexa cannot communicate directly with local desktop applications.

### Recommended Approach

**Hybrid Architecture: Cloud Webhook + Desktop API**

1. **Host a custom skill backend** on AWS Lambda (or self-hosted HTTPS endpoint)
2. **Implement OAuth 2.0 account linking** to securely authenticate users
3. **Create a REST API** in Fireside Ember for the cloud service to communicate with the desktop app
4. **Use WebSocket or polling** for real-time sync between cloud and desktop

### Key Findings

- ✅ **All proposed use cases are feasible** (calendar queries, briefings, email counts, meeting scheduling)
- ⚠️ **Cloud infrastructure is mandatory** - Alexa requires HTTPS endpoints accessible from the internet
- ✅ **Self-hosted endpoints are supported** - Don't need AWS Lambda, but must meet security requirements
- ✅ **Private skills are possible** - No public certification needed for personal use
- 💰 **Free tier covers most development** - AWS Lambda free tier: 1M requests/month, 400K GB-s compute
- 🔒 **OAuth 2.0 required** - Secure account linking is built into ASK platform

---

## 1. Alexa Skills Kit (ASK) Overview

### What is ASK?

The Alexa Skills Kit (ASK) is Amazon's software development framework for creating voice-enabled applications ("skills") for Alexa-enabled devices. ASK handles all speech recognition and natural language understanding (NLU) automatically.

### How It Works

```
User Speech → Alexa Device → AWS Cloud (Speech-to-Text + NLU) → Your Skill Backend → Response → Alexa Device → User
```

1. User says: "Alexa, ask Ember when I'm free today"
2. Alexa device streams audio to AWS
3. AWS converts speech to text and identifies:
   - **Invocation name**: "Ember"
   - **Intent**: "GetScheduleIntent"
   - **Slot values**: Date = "today"
4. Alexa sends JSON POST request to your skill's HTTPS endpoint
5. Your backend processes request and queries Fireside Ember
6. Your backend returns JSON response with calendar data
7. Alexa speaks the response to the user

### Skill Types

| Skill Type | Description | Fit for Ember? |
|------------|-------------|----------------|
| **Custom Skills** | Full control over voice interaction model | ✅ **RECOMMENDED** - Best fit for personal assistant |
| **Smart Home Skills** | Pre-built model for IoT device control | ❌ Not applicable |
| **Flash Briefing Skills** | Daily news/content feeds | ⚠️ Partial fit (morning briefing only) |
| **Music Skills** | Audio streaming | ❌ Not applicable |

**Verdict:** **Custom Skill** is the best fit, providing maximum flexibility for all proposed use cases.

---

## 2. Integration Architecture

### The Desktop App Problem

**Critical Constraint:** Alexa can ONLY communicate with:
- AWS Lambda functions
- HTTPS web services with valid SSL certificates
- Endpoints accessible from the public internet

**Alexa CANNOT:**
- Connect directly to localhost
- Access desktop applications on private networks
- Use WebSockets for outbound connections

### Recommended Architecture: Cloud Proxy Pattern

```
┌─────────────┐         ┌──────────────┐         ┌─────────────────┐         ┌──────────────────┐
│   Alexa     │         │  Alexa       │         │   Cloud Proxy   │         │  Fireside Ember  │
│   Device    │◄────────┤  Service     │◄────────┤   (Lambda or    │◄────────┤  Desktop App     │
│             │  Voice  │  (AWS)       │  HTTPS  │   Self-hosted)  │  HTTPS/ │  (Local)         │
└─────────────┘         └──────────────┘         └─────────────────┘  WS     └──────────────────┘
                                                          │                           │
                                                          │                           │
                                                          └───────────────────────────┘
                                                          OAuth tokens stored in cloud
```

### Architecture Components

#### Component 1: Alexa Custom Skill
- **Location:** Configured in Alexa Developer Console
- **Purpose:** Defines voice interaction model (intents, utterances, slots)
- **Configuration:**
  - Invocation name: "ember" or "fireside"
  - Intents: GetScheduleIntent, ReadBriefingIntent, CheckEmailIntent, ScheduleMeetingIntent
  - Endpoint: Points to your cloud proxy

#### Component 2: Cloud Proxy / Skill Backend
- **Options:**
  - AWS Lambda function (serverless, free tier)
  - Self-hosted Node.js/Python/Rust web service
  - Heroku, Railway, Fly.io, or other PaaS
- **Responsibilities:**
  - Receive requests from Alexa (POST requests with JSON)
  - Validate request signatures (security requirement)
  - Check user authentication via OAuth token
  - Forward requests to Fireside Ember API
  - Format responses for Alexa

#### Component 3: Fireside Ember REST API
- **Location:** Runs within Tauri app on user's desktop
- **Requirements:**
  - Must be accessible from cloud (port forwarding, ngrok, or Cloudflare Tunnel)
  - HTTPS endpoint with valid certificate
  - Authentication (API key or OAuth)
- **Endpoints:**
  ```
  GET  /api/calendar/free?date=today
  GET  /api/briefing/morning
  GET  /api/email/unread-count
  POST /api/calendar/schedule-meeting
  ```

#### Component 4: OAuth Authorization Server
- **Purpose:** Link Alexa user account with Ember user account
- **Options:**
  - Self-hosted OAuth server (using library like `node-oauth2-server`)
  - Third-party: Auth0, Okta, Login with Amazon
  - Simple JWT-based auth for single-user deployments
- **Flow:**
  1. User enables Ember skill in Alexa app
  2. Alexa redirects to your login page
  3. User logs in with Ember credentials
  4. Your server generates authorization code
  5. Alexa exchanges code for access token
  6. Token stored by Alexa and sent with every request

### Communication Patterns

#### Pattern A: Cloud-Initiated (Recommended for MVP)
```
Alexa → Lambda → Desktop App (via HTTPS)
```
- **Pros:** Simple, synchronous request/response
- **Cons:** Requires desktop app to expose HTTPS endpoint or use tunnel service
- **Best for:** All GET operations (calendar, email count, briefing)

#### Pattern B: Desktop-Initiated with Cloud Cache
```
Desktop App → Cloud DB → Lambda → Alexa
```
- **Pros:** No inbound connections to desktop
- **Cons:** Not real-time; requires polling or scheduled sync
- **Best for:** Read-only data that can be cached (morning briefing)

#### Pattern C: Hybrid (Recommended for Production)
```
Desktop App ←WebSocket→ Cloud Service ←HTTPS← Alexa
```
- **Pros:** Real-time bidirectional communication
- **Cons:** More complex infrastructure
- **Best for:** Production deployment with multiple features

---

## 3. Use Case Feasibility Analysis

### ✅ Use Case 1: "Alexa, ask Ember when I'm free today"

**Feasibility:** ✅ **Fully Supported**

**Implementation:**
```json
{
  "intent": "GetScheduleIntent",
  "slots": {
    "date": "today"
  }
}
```

**Flow:**
1. Alexa parses intent → Sends to Lambda
2. Lambda calls `GET /api/calendar/free?date=today`
3. Ember queries local calendar database (or synced Google Calendar)
4. Returns: `{"free_slots": ["10:00 AM - 11:30 AM", "2:00 PM - 5:00 PM"]}`
5. Lambda formats response: "You're free from 10 to 11:30 AM and 2 to 5 PM today."

**Limitations:** None

---

### ✅ Use Case 2: "Alexa, ask Ember to read my morning briefing"

**Feasibility:** ✅ **Fully Supported**

**Implementation:**
```json
{
  "intent": "ReadBriefingIntent"
}
```

**Flow:**
1. Alexa → Lambda → `GET /api/briefing/morning`
2. Ember aggregates:
   - Weather forecast
   - Top 3 calendar events
   - Unread email count
   - Top news headlines
3. Returns structured data
4. Alexa reads briefing aloud

**Limitations:**
- Alexa TTS has 8,000 character limit per response
- For longer briefings, use SSML or split into multiple responses
- Consider using **Flash Briefing Skill** as alternative (JSON feed of daily content)

---

### ✅ Use Case 3: "Alexa, ask Ember how many unread emails I have"

**Feasibility:** ✅ **Fully Supported**

**Implementation:**
```json
{
  "intent": "CheckEmailIntent",
  "slots": {
    "mailbox": "inbox"  // Optional: work, personal, etc.
  }
}
```

**Flow:**
1. Alexa → Lambda → `GET /api/email/unread-count?mailbox=inbox`
2. Ember queries email API (IMAP, Gmail API, Outlook API)
3. Returns: `{"unread_count": 14, "recent_count": 3}`
4. Alexa: "You have 14 unread emails, with 3 new messages in the last hour."

**Privacy Consideration:**
- Email content is NEVER sent to Alexa/Amazon
- Only metadata (counts, subjects) passes through Lambda
- Full email bodies stay on desktop

**Limitations:** None

---

### ⚠️ Use Case 4: "Alexa, ask Ember to schedule a meeting with [person]"

**Feasibility:** ⚠️ **Partially Supported** (with caveats)

**Implementation:**
```json
{
  "intent": "ScheduleMeetingIntent",
  "slots": {
    "person": "Sarah",
    "date": "tomorrow",
    "time": "3 PM"
  }
}
```

**Flow:**
1. Alexa → Lambda → `POST /api/calendar/schedule-meeting`
2. Ember:
   - Resolves "Sarah" to contact (email address)
   - Checks calendar availability
   - Creates calendar event
   - Sends meeting invite
3. Response: "Meeting with Sarah scheduled for tomorrow at 3 PM."

**Challenges:**
1. **Contact resolution:** "Sarah" could match multiple contacts
   - **Solution:** Use dialog management to ask "Sarah Smith or Sarah Johnson?"
2. **Availability checking:** What if 3 PM is taken?
   - **Solution:** Suggest alternative times
3. **Multi-turn conversation:** Requires back-and-forth
   - **Solution:** Use Alexa Dialog Management (built-in feature)

**Dialog Example:**
```
User: "Alexa, ask Ember to schedule a meeting with Sarah"
Alexa: "What day would you like to meet with Sarah?"
User: "Tomorrow"
Alexa: "What time works best?"
User: "3 PM"
Alexa: "I found two Sarahs in your contacts. Sarah Smith or Sarah Johnson?"
User: "Sarah Smith"
Alexa: "Great! Meeting with Sarah Smith scheduled for tomorrow at 3 PM."
```

**Limitations:**
- Complex multi-step workflows require careful dialog design
- User must speak all details (can't click buttons like in app UI)
- Error handling for conflicts requires multiple conversation turns

---

## 4. Technical Requirements

### Hosting Options Comparison

| Option | Pros | Cons | Cost |
|--------|------|------|------|
| **AWS Lambda** | • Free tier (1M requests/month)<br>• Auto-scaling<br>• Zero maintenance | • AWS account required<br>• Cold start latency (~1-2s)<br>• Vendor lock-in | **$0** (under 1M req/month) |
| **Self-hosted HTTPS** | • Full control<br>• No vendor lock-in<br>• Low latency | • Must maintain server<br>• SSL certificate required<br>• Need static IP or domain | **$5-10/month** (VPS) |
| **Heroku/Railway** | • Easy deployment<br>• Free/cheap tiers<br>• Git-based workflow | • Limited free tier<br>• Cold start on free tier | **$0-7/month** |
| **Cloudflare Workers** | • Global CDN edge<br>• Free tier (100K req/day)<br>• Instant cold starts | • V8 isolate environment<br>• Limited execution time (50ms CPU) | **$0-5/month** |

**Recommendation:** Start with **AWS Lambda** for development, migrate to **self-hosted** for production if needed.

### AWS Infrastructure Requirements

#### Minimum Setup (Free Tier)
```
AWS Lambda function (Node.js/Python/Rust)
  ├── Function memory: 512 MB
  ├── Timeout: 10 seconds
  └── Trigger: Alexa Skills Kit

No additional AWS services required!
```

#### Optional (For Production)
- **API Gateway:** Only needed if you want REST API (not required for Alexa)
- **DynamoDB:** Session persistence (free tier: 25 GB storage)
- **CloudWatch Logs:** Debugging (free tier: 5 GB ingestion)

### SSL Certificate Requirements

#### For AWS Lambda
✅ **No action needed** - Alexa trusts Lambda endpoints automatically

#### For Self-Hosted Endpoint
Must meet ALL these requirements:
1. **HTTPS only** (port 443)
2. **Valid SSL certificate** from [trusted CA](https://wiki.mozilla.org/CA/Included_Certificates)
3. **Certificate domain must match endpoint** (in Subject Alternative Names)
4. **No self-signed certificates** (except for testing in developer console)

**Free SSL Options:**
- Let's Encrypt (automated, free)
- Cloudflare SSL (free tier)
- AWS Certificate Manager (free with AWS services)

### Authentication & Security

#### OAuth 2.0 Implementation (Required)

Alexa **requires** OAuth 2.0 for account linking. Two grant types supported:

| Grant Type | Security | Complexity | Recommended? |
|------------|----------|------------|--------------|
| **Authorization Code** | ✅ Secure (with PKCE) | Medium | ✅ **YES** |
| **Implicit Grant** | ⚠️ Less secure | Easy | ❌ Deprecated |

**Authorization Code Flow:**
```
1. User enables skill → Alexa redirects to your login page
2. User enters Ember credentials
3. Your server returns authorization code
4. Alexa exchanges code for access token + refresh token
5. Alexa stores tokens and includes in all requests
6. When token expires, Alexa auto-refreshes using refresh token
```

#### OAuth Endpoints Required

```
Authorization URI:  https://auth.ember.app/oauth/authorize
Access Token URI:   https://auth.ember.app/oauth/token
```

**Simplified OAuth for Single-User:**
If Fireside Ember is single-user (personal assistant), you can implement a simplified flow:
```rust
// Generate long-lived API key
let api_key = generate_secure_token();

// Store in Alexa skill configuration
// No traditional OAuth server needed!
```

#### Request Verification (Mandatory)

All Alexa requests **must** be verified to prevent spoofing:

1. **Check request signature**
   - Validate `SignatureCertChainUrl` header
   - Download and verify Amazon's certificate
   - Verify signature matches request body
2. **Check timestamp**
   - Request must be within 150 seconds of current time
   - Prevents replay attacks

**Good news:** ASK SDKs handle this automatically!

```javascript
// Node.js example using ASK SDK
const Alexa = require('ask-sdk-core');

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(/* your handlers */)
  .lambda();  // Auto-verifies all requests ✅
```

### Privacy & GDPR Compliance

#### Data Alexa Stores

| Data Type | Stored by Amazon? | Duration | User Control |
|-----------|-------------------|----------|--------------|
| **Voice recordings** | Yes (optional) | Until user deletes | User can disable in settings |
| **Utterance text** | Yes | 30 days | Automatic deletion |
| **Intent/slot data** | No | N/A | Never stored |
| **OAuth tokens** | Yes (encrypted) | Until skill disabled | Deleted when skill disabled |
| **Response content** | No | N/A | Never stored |

#### Privacy Best Practices

✅ **DO:**
- Only request data you need
- Use OAuth scopes to limit access
- Store minimal data in cloud proxy
- Delete user data when skill disabled
- Provide privacy policy link

❌ **DON'T:**
- Store email content in cloud
- Log sensitive data (passwords, PII)
- Share user data with third parties
- Cache data longer than needed

#### GDPR Requirements

If serving EU users:
1. **Privacy policy required** (link in skill details)
2. **Data deletion on request**
3. **Consent for data processing**
4. **Right to export user data**

---

## 5. Development Workflow

### Step 1: Alexa Developer Console Setup

1. **Create Amazon Developer Account**
   - Go to: https://developer.amazon.com/alexa/console/ask
   - Sign in with Amazon account

2. **Create Custom Skill**
   ```
   Skill Name: Fireside Ember
   Default Language: English (US)
   Model: Custom
   Hosting: Provision your own
   ```

3. **Configure Invocation Name**
   ```
   Invocation: "ember" or "fireside"
   Example: "Alexa, ask Ember..."
   ```

4. **Define Interaction Model**
   ```json
   {
     "interactionModel": {
       "languageModel": {
         "invocationName": "ember",
         "intents": [
           {
             "name": "GetScheduleIntent",
             "slots": [
               {
                 "name": "date",
                 "type": "AMAZON.DATE"
               }
             ],
             "samples": [
               "when am I free {date}",
               "what's my schedule for {date}",
               "do I have any free time {date}"
             ]
           }
         ]
       }
     }
   }
   ```

5. **Set Endpoint**
   - For Lambda: Select "AWS Lambda ARN" and paste function ARN
   - For HTTPS: Enter your endpoint URL

6. **Configure Account Linking** (if needed)
   - Authorization URI
   - Access Token URI
   - Client ID & Secret
   - Scopes

### Step 2: Testing (No Publishing Required!)

#### Test in Alexa Developer Console
```
Type: "ask ember when am I free today"
View JSON request/response
Test without physical device ✅
```

#### Test on Your Device
1. Enable "Development" mode in Alexa app
2. Your unpublished skill appears on your devices
3. Test with real voice commands

**No certification needed for personal use!**

### Step 3: Beta Testing (Optional)

Share skill with up to 500 testers:
```
Alexa Developer Console → Distribution → Availability
→ Beta Test → Add email addresses
```

Testers receive invite link, enable skill, test immediately.

### Step 4: Certification Process (Only for Public Skills)

If you want to publish to Alexa Skills Store:

**Requirements:**
- ✅ Skill must meet [policy requirements](https://developer.amazon.com/docs/custom-skills/policy-requirements-for-an-alexa-skill.html)
- ✅ Voice interaction must be natural and intuitive
- ✅ Must handle errors gracefully
- ✅ Privacy policy required
- ✅ Example phrases must be accurate
- ✅ Security requirements (HTTPS, request verification)

**Timeline:**
- Review typically takes 3-5 business days
- Can resubmit if rejected
- No fees for certification

**Verdict for Fireside Ember:**
**🎯 Skip certification** - Keep skill private for personal use. No need to publish publicly.

---

## 6. Alternatives to Alexa

### Comparison Table

| Feature | Alexa Skills | Google Assistant | Siri Shortcuts |
|---------|-------------|------------------|----------------|
| **Platform** | Amazon Echo, Fire TV, 3rd party | Google Home, Android, iOS | iOS, macOS, HomePod |
| **Development Framework** | Alexa Skills Kit (ASK) | Actions on Google (Conversational Actions **DEPRECATED**) | Shortcuts app / App Intents |
| **Desktop App Integration** | ❌ Requires cloud proxy | ❌ Requires cloud proxy | ✅ **Direct (macOS only)** |
| **Voice Interaction Model** | Custom (define intents) | Conversational (NLU-based) | App Intents (parameter-based) |
| **Hosting Options** | Lambda or HTTPS | Dialogflow / Cloud Functions | On-device (no cloud needed) |
| **Authentication** | OAuth 2.0 required | OAuth 2.0 required | Not required (same device) |
| **Free Tier** | 1M requests/month (Lambda) | Dialogflow free tier limited | Unlimited (local) |
| **Natural Language** | Excellent | Best-in-class | Basic (keyword matching) |
| **Multi-turn Dialogs** | ✅ Built-in dialog management | ✅ Excellent conversation flow | ⚠️ Limited |
| **Testing** | ✅ Simulator + device | ✅ Simulator + device | ✅ On-device only |
| **Certification Required** | Only for public skills | Only for public actions | Not required |
| **Market Share (US)** | ~70% smart speaker | ~20% smart speaker | ~10% smart speaker |

### Google Assistant Status Update ⚠️

**CRITICAL:** Google has **deprecated** Conversational Actions (April 2023):
- No new Actions can be created
- Existing Actions will be shut down in June 2023
- **Replacement:** App Actions (Android only, limited functionality)

**Verdict:** ❌ **Not recommended** for new projects

### Siri Shortcuts Deep Dive

#### Pros
✅ **No cloud infrastructure needed** (macOS/iOS)  
✅ **Direct app integration** via App Intents framework  
✅ **Zero latency** (local processing)  
✅ **No authentication required** (same device)  
✅ **Free** (no hosting costs)  

#### Cons
❌ **Apple ecosystem only** (no Windows/Linux)  
❌ **Limited natural language** (must say exact phrases)  
❌ **No multi-turn dialogs** (single request/response)  
❌ **Requires iOS 16+ / macOS 13+**  

#### Implementation (macOS Tauri App)

```swift
// Swift code in Tauri plugin
import AppIntents

struct GetScheduleIntent: AppIntent {
    static var title: LocalizedStringResource = "Get Schedule"
    
    @Parameter(title: "Date")
    var date: Date?
    
    func perform() async throws -> some IntentResult {
        // Call Rust backend
        let schedule = await getSchedule(for: date ?? Date())
        return .result(value: schedule)
    }
}

// User says: "Hey Siri, get my schedule from Ember"
```

**Verdict for Fireside Ember:**
- ✅ **Best option for macOS-only deployment**
- ✅ **Simplest implementation** (no cloud needed)
- ❌ **Not cross-platform** (Alexa wins for multi-device support)

---

## 7. Cost Analysis

### AWS Lambda Pricing

#### Free Tier (Permanent)
```
Requests:  1,000,000 per month
Compute:   400,000 GB-seconds per month
Duration:  Effectively unlimited for typical skill requests
```

#### After Free Tier
```
Requests:  $0.20 per 1 million requests
Compute:   $0.0000166667 per GB-second

Example calculation (1M requests/month):
  - Memory: 512 MB = 0.5 GB
  - Avg duration: 200ms = 0.2 seconds
  - Compute: 1M × 0.5 GB × 0.2s = 100,000 GB-seconds
  - Cost: FREE (under 400K GB-s free tier)
```

**Realistic usage for personal assistant:**
- ~100 voice requests per day = 3,000/month
- Well within free tier = **$0/month**

### API Gateway Pricing (Optional)

**Not needed for Alexa!** Lambda can be invoked directly by Alexa Skills Kit.

If you want REST API for other purposes:
```
Requests: $3.50 per million
Free Tier: None
```

### Self-Hosted Endpoint Costs

| Provider | Specs | Price | Notes |
|----------|-------|-------|-------|
| **DigitalOcean** | 1 GB RAM, 1 CPU | $6/month | Easiest setup |
| **Linode** | 1 GB RAM, 1 CPU | $5/month | Good performance |
| **AWS Lightsail** | 512 MB RAM | $3.50/month | Integrated with AWS |
| **Oracle Cloud (Free Tier)** | 1 GB RAM, 1 CPU | **$0/month** | 2 VMs free forever |
| **Cloudflare Workers** | Edge compute | $5/month | 100K req/day free |

**Recommendation:** Use Oracle Cloud Free Tier if avoiding AWS.

### SSL Certificate Costs

```
Let's Encrypt:  FREE
Cloudflare SSL: FREE
AWS ACM:        FREE (with AWS services)
Commercial CA:  $50-200/year (unnecessary)
```

### Ongoing Maintenance Costs

```
Time investment:
  - Initial development: 20-40 hours
  - Monthly maintenance: 1-2 hours (monitoring, updates)
  
Infrastructure:
  - AWS Lambda: $0/month (free tier sufficient)
  - Domain name (optional): $10-15/year
  - SSL certificate: $0 (Let's Encrypt)
  
Total: ~$0-1/month for personal use
```

### Alexa Skill Certification Fees

**FREE** - No fees for:
- Skill creation
- Testing
- Certification review
- Hosting (within free tiers)
- Distribution

Amazon only charges if you use premium AWS services beyond free tier.

---

## 8. Implementation Roadmap

### Phase 1: Proof of Concept (Week 1-2)

**Goal:** Get "Hello World" working end-to-end

**Tasks:**
1. ✅ Create Amazon Developer account
2. ✅ Create custom skill in Alexa Developer Console
3. ✅ Create AWS Lambda function (Node.js)
   ```javascript
   exports.handler = async (event) => {
       return {
           version: "1.0",
           response: {
               outputSpeech: {
                   type: "PlainText",
                   text: "Hello from Ember!"
               }
           }
       };
   };
   ```
4. ✅ Link Lambda to skill
5. ✅ Test in simulator: "Alexa, open Ember"
6. ✅ Test on physical device

**Success Criteria:** Alexa responds to skill invocation

---

### Phase 2: Desktop API Integration (Week 3-4)

**Goal:** Lambda can communicate with Ember desktop app

**Tasks:**
1. ✅ Add REST API to Fireside Ember (Tauri)
   ```rust
   // src-tauri/src/api/mod.rs
   #[tauri::command]
   pub async fn get_schedule(date: String) -> Result<ScheduleResponse, String> {
       // Query local calendar
   }
   
   // Expose via HTTP server (axum or actix-web)
   ```

2. ✅ Choose tunnel solution:
   - **Option A:** ngrok (easiest, $0-8/month)
   - **Option B:** Cloudflare Tunnel (free, more setup)
   - **Option C:** Port forwarding (free, requires router config)

3. ✅ Update Lambda to call Ember API:
   ```javascript
   const response = await fetch('https://your-tunnel.ngrok.io/api/schedule?date=today');
   const data = await response.json();
   ```

4. ✅ Test end-to-end: "Alexa, ask Ember when I'm free"

**Success Criteria:** Alexa returns real calendar data from desktop app

---

### Phase 3: OAuth Implementation (Week 5-6)

**Goal:** Secure authentication and multi-user support

**Tasks:**
1. ✅ Choose OAuth implementation:
   - **Single-user:** Simple API key
   - **Multi-user:** Self-hosted OAuth server ([node-oauth2-server](https://github.com/oauthjs/node-oauth2-server))
   - **Third-party:** Auth0 free tier

2. ✅ Implement authorization endpoints:
   ```
   GET  /oauth/authorize  - Login page
   POST /oauth/token      - Token exchange
   ```

3. ✅ Configure account linking in Alexa Developer Console

4. ✅ Update Lambda to include access token in API calls:
   ```javascript
   const token = event.context.System.user.accessToken;
   const response = await fetch(apiUrl, {
       headers: { 'Authorization': `Bearer ${token}` }
   });
   ```

5. ✅ Test account linking flow

**Success Criteria:** User can link Alexa account with Ember account

---

### Phase 4: Core Features (Week 7-10)

**Goal:** Implement all four use cases

**Task List:**

#### ✅ Use Case 1: Calendar Queries
```javascript
// Intent: GetScheduleIntent
// Slots: date (AMAZON.DATE)
// Sample: "when am I free today"
```

#### ✅ Use Case 2: Morning Briefing
```javascript
// Intent: ReadBriefingIntent
// No slots
// Sample: "read my morning briefing"
// Response: Weather + Calendar + Email + News
```

#### ✅ Use Case 3: Email Count
```javascript
// Intent: CheckEmailIntent
// Slots: mailbox (custom: "work" | "personal")
// Sample: "how many unread emails do I have"
```

#### ✅ Use Case 4: Schedule Meeting (with Dialog Management)
```javascript
// Intent: ScheduleMeetingIntent
// Slots: person, date, time
// Multi-turn dialog with confirmation
```

**Success Criteria:** All four use cases work reliably

---

### Phase 5: Production Hardening (Week 11-12)

**Goal:** Production-ready deployment

**Tasks:**
1. ✅ Error handling & logging
2. ✅ CloudWatch monitoring (Lambda metrics)
3. ✅ Graceful fallbacks ("Ember is offline right now")
4. ✅ Rate limiting (prevent abuse)
5. ✅ Retry logic (network failures)
6. ✅ Performance optimization (<2s response time)
7. ✅ Security audit (ASK SDK request verification)

**Success Criteria:** 99% uptime, sub-2s latency

---

### Phase 6: Optional Enhancements (Future)

- [ ] Proactive notifications ("Your meeting starts in 10 minutes")
- [ ] Custom voice responses (SSML for better TTS)
- [ ] Visual cards (Alexa app integration)
- [ ] Multi-language support
- [ ] Voice profile recognition (multi-user household)

---

## 9. Code Examples

### Sample Intent Schema

```json
{
  "interactionModel": {
    "languageModel": {
      "invocationName": "ember",
      "intents": [
        {
          "name": "GetScheduleIntent",
          "slots": [
            {
              "name": "date",
              "type": "AMAZON.DATE"
            }
          ],
          "samples": [
            "when am I free {date}",
            "what's my schedule for {date}",
            "do I have any free time {date}",
            "am I busy {date}",
            "check my calendar for {date}"
          ]
        },
        {
          "name": "ReadBriefingIntent",
          "samples": [
            "read my morning briefing",
            "what's my briefing",
            "give me my daily summary",
            "what do I need to know today"
          ]
        },
        {
          "name": "CheckEmailIntent",
          "slots": [
            {
              "name": "mailbox",
              "type": "MailboxType"
            }
          ],
          "samples": [
            "how many unread emails do I have",
            "check my {mailbox} email",
            "do I have new emails",
            "what's my email count"
          ]
        },
        {
          "name": "ScheduleMeetingIntent",
          "slots": [
            {
              "name": "person",
              "type": "AMAZON.Person"
            },
            {
              "name": "date",
              "type": "AMAZON.DATE"
            },
            {
              "name": "time",
              "type": "AMAZON.TIME"
            }
          ],
          "samples": [
            "schedule a meeting with {person}",
            "set up a meeting with {person} on {date}",
            "book time with {person} at {time}",
            "create a meeting with {person} {date} at {time}"
          ]
        },
        {
          "name": "AMAZON.CancelIntent",
          "samples": []
        },
        {
          "name": "AMAZON.HelpIntent",
          "samples": []
        },
        {
          "name": "AMAZON.StopIntent",
          "samples": []
        }
      ],
      "types": [
        {
          "name": "MailboxType",
          "values": [
            {
              "name": {
                "value": "work"
              }
            },
            {
              "name": {
                "value": "personal"
              }
            },
            {
              "name": {
                "value": "all"
              }
            }
          ]
        }
      ]
    }
  }
}
```

### Lambda Handler Skeleton (Node.js)

```javascript
const Alexa = require('ask-sdk-core');

// Handler for GetScheduleIntent
const GetScheduleIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetScheduleIntent';
    },
    async handle(handlerInput) {
        // Extract slot value
        const date = Alexa.getSlotValue(handlerInput.requestEnvelope, 'date');
        
        // Get OAuth access token
        const accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
        
        if (!accessToken) {
            return handlerInput.responseBuilder
                .speak('Please link your Ember account in the Alexa app.')
                .withLinkAccountCard()
                .getResponse();
        }
        
        try {
            // Call Fireside Ember API
            const response = await fetch(`${process.env.EMBER_API_URL}/api/calendar/free?date=${date}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Format response
            let speakOutput = '';
            if (data.free_slots.length === 0) {
                speakOutput = `You have no free time ${date}.`;
            } else {
                const times = data.free_slots.join(', and ');
                speakOutput = `You're free ${times} on ${date}.`;
            }
            
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt('Is there anything else I can help with?')
                .getResponse();
                
        } catch (error) {
            console.error('Error calling Ember API:', error);
            
            return handlerInput.responseBuilder
                .speak('Sorry, I couldn\'t connect to Ember right now. Please try again later.')
                .getResponse();
        }
    }
};

// Handler for ReadBriefingIntent
const ReadBriefingIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ReadBriefingIntent';
    },
    async handle(handlerInput) {
        const accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
        
        if (!accessToken) {
            return handlerInput.responseBuilder
                .speak('Please link your Ember account in the Alexa app.')
                .withLinkAccountCard()
                .getResponse();
        }
        
        try {
            const response = await fetch(`${process.env.EMBER_API_URL}/api/briefing/morning`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            
            const briefing = await response.json();
            
            // Format briefing
            const speakOutput = `Good morning! Here's your briefing. ` +
                `The weather today is ${briefing.weather.description} with a high of ${briefing.weather.high} degrees. ` +
                `You have ${briefing.calendar.event_count} events today, including ${briefing.calendar.next_event} at ${briefing.calendar.next_time}. ` +
                `You have ${briefing.email.unread_count} unread emails. ` +
                `In the news, ${briefing.news.headline}.`;
            
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .getResponse();
                
        } catch (error) {
            console.error('Error fetching briefing:', error);
            
            return handlerInput.responseBuilder
                .speak('Sorry, I couldn\'t retrieve your briefing right now.')
                .getResponse();
        }
    }
};

// Launch request handler
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome to Ember! I can help you check your schedule, read your briefing, check emails, and schedule meetings. What would you like to do?';
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('What would you like me to do?')
            .getResponse();
    }
};

// Help handler
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can ask me to check your schedule, read your morning briefing, count your emails, or schedule a meeting. What would you like to do?';
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('What would you like me to do?')
            .getResponse();
    }
};

// Error handler
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.error(`Error: ${error.message}`, error);
        
        const speakOutput = 'Sorry, I had trouble processing your request. Please try again.';
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// Export Lambda handler
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        GetScheduleIntentHandler,
        ReadBriefingIntentHandler,
        HelpIntentHandler,
        Alexa.DefaultIntentHandler()
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();
```

### Fireside Ember API Endpoint (Rust/Tauri)

```rust
// src-tauri/src/api/calendar.rs
use axum::{
    extract::{Query, State},
    http::StatusCode,
    response::Json,
};
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct ScheduleQuery {
    date: String,
}

#[derive(Serialize)]
pub struct FreeSlot {
    start: String,
    end: String,
}

#[derive(Serialize)]
pub struct ScheduleResponse {
    free_slots: Vec<String>,
}

pub async fn get_free_schedule(
    Query(params): Query<ScheduleQuery>,
    State(app_state): State<AppState>,
) -> Result<Json<ScheduleResponse>, StatusCode> {
    // Parse date
    let date = parse_date(&params.date).map_err(|_| StatusCode::BAD_REQUEST)?;
    
    // Query local calendar database
    let events = app_state.calendar_db.get_events_for_date(date).await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    // Calculate free slots
    let free_slots = calculate_free_time(&events);
    
    // Format as human-readable strings
    let formatted_slots: Vec<String> = free_slots.iter()
        .map(|slot| format!("{} to {}", slot.start, slot.end))
        .collect();
    
    Ok(Json(ScheduleResponse {
        free_slots: formatted_slots,
    }))
}

// API server setup
pub async fn run_api_server(app_state: AppState) {
    let app = Router::new()
        .route("/api/calendar/free", get(get_free_schedule))
        .route("/api/briefing/morning", get(get_morning_briefing))
        .route("/api/email/unread-count", get(get_unread_count))
        .layer(middleware::from_fn(auth_middleware))
        .with_state(app_state);
    
    let addr = SocketAddr::from(([127, 0, 0, 1], 3030));
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
```

---

## 10. Security Recommendations

### OAuth Token Storage

**✅ GOOD:**
- Store tokens encrypted in database
- Use environment variables for secrets
- Rotate tokens periodically
- Implement token revocation endpoint

**❌ BAD:**
- Store tokens in plaintext
- Log tokens in CloudWatch
- Share tokens across users
- Use short expiration without refresh tokens

### API Key Management

```javascript
// ✅ GOOD: Environment variables
const apiKey = process.env.EMBER_API_KEY;

// ❌ BAD: Hardcoded
const apiKey = 'ember_1234567890abcdef';
```

### Scoped Access

**Principle of Least Privilege:**
```
OAuth Scopes:
  - calendar:read     ✅ Allow
  - calendar:write    ✅ Allow (for scheduling)
  - email:read:count  ✅ Allow (count only, no content)
  - email:read:full   ❌ Deny (too broad)
  - files:read        ❌ Deny (not needed)
```

### Request Validation

```javascript
// Validate all inputs
function validateDate(dateStr) {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
    }
    // Prevent future date abuse
    if (date > addYears(new Date(), 5)) {
        throw new Error('Date too far in future');
    }
    return date;
}
```

### Rate Limiting

```javascript
// Prevent abuse
const rateLimit = require('express-rate-limit');

app.use('/api/', rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // Max 100 requests per IP
}));
```

---

## 11. Risks & Limitations

### Technical Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Cloud dependency** | High | Implement offline mode; cache recent data |
| **Lambda cold starts** | Medium | Use Provisioned Concurrency ($$$) or accept 1-2s delay |
| **Tunnel reliability** | High | Use Cloudflare Tunnel (99.9% uptime) instead of ngrok |
| **OAuth token expiry** | Low | Implement auto-refresh (built into OAuth) |
| **API breaking changes** | Medium | Version API endpoints; maintain backwards compatibility |

### Privacy Concerns

⚠️ **Voice recordings:** Amazon may store voice recordings
- **Mitigation:** User can disable in Alexa app settings

⚠️ **Data transit through AWS:** OAuth tokens pass through Amazon servers
- **Mitigation:** Tokens are encrypted in transit; Amazon cannot decrypt

⚠️ **Skill analytics:** Amazon tracks usage metrics
- **Mitigation:** Unavoidable but anonymized

### User Experience Limitations

❌ **No visual UI:** Voice-only interaction (unless using Echo Show)
- **Impact:** Complex tasks (like choosing between 10 Sarahs) are tedious
- **Mitigation:** Design for voice-first simplicity

❌ **Disambiguation required:** "Sarah" → "Which Sarah?"
- **Impact:** Extra conversation turns
- **Mitigation:** Use dialog management to make it feel natural

❌ **Network dependency:** Requires internet connection
- **Impact:** Offline = no voice commands
- **Mitigation:** Display clear error messages

### Amazon Policy Risks

⚠️ **Platform changes:** Amazon could change ASK APIs
- **Probability:** Low (stable since 2014)
- **Mitigation:** Monitor developer blog; ASK SDK abstracts changes

⚠️ **Skill rejection:** If published, could be rejected for policy violations
- **Mitigation:** Keep skill private (no certification needed)

### Competitive Analysis Risk

📊 **Market trend:** Voice assistants declining in popularity (2023-2024 data)
- Smart speaker growth has plateaued
- Many users only use basic features (timers, music)
- **Recommendation:** Don't over-invest; build MVP and validate usage

---

## Conclusion

### Final Recommendation: ✅ **PROCEED with MVP**

**Best approach for Fireside Ember:**

1. **MVP:** AWS Lambda + ngrok + Simple API key auth
   - **Timeline:** 2-4 weeks
   - **Cost:** $0/month
   - **Effort:** ~40 hours

2. **Production:** Self-hosted HTTPS + OAuth 2.0
   - **Timeline:** +2 weeks
   - **Cost:** $0-5/month
   - **Effort:** +20 hours

3. **Platform Priority:**
   - **Primary:** Alexa (70% US market share)
   - **Secondary:** Siri Shortcuts (if macOS-only acceptable)
   - **Skip:** Google Assistant (deprecated)

### Success Metrics

Track these KPIs:
- **Adoption rate:** % of Ember users who enable Alexa skill
- **Usage frequency:** Commands per user per week
- **Top intents:** Which features are most used?
- **Error rate:** % of failed requests
- **Latency:** Average response time (<2s target)

---

## References & Further Reading

### Official Documentation
- [Alexa Skills Kit Documentation](https://developer.amazon.com/en-US/docs/alexa/ask-overviews/what-is-the-alexa-skills-kit.html)
- [Custom Skills Reference](https://developer.amazon.com/en-US/docs/alexa/custom-skills/understanding-custom-skills.html)
- [Account Linking Guide](https://developer.amazon.com/en-US/docs/alexa/account-linking/account-linking-concepts.html)
- [AWS Lambda Pricing](https://aws.amazon.com/lambda/pricing/)
- [OAuth 2.0 RFC 6749](https://tools.ietf.org/html/rfc6749)

### Sample Code
- [Alexa Skills Kit SDK for Node.js](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs)
- [Alexa OAuth Sample](https://github.com/alexa-samples/alexa-oauth-sample)
- [Hello World Skill](https://github.com/alexa-samples/skill-sample-nodejs-hello-world)

### Alternatives
- [Siri App Intents (macOS)](https://developer.apple.com/documentation/appintents)
- [Google Assistant App Actions (Android)](https://developers.google.com/assistant/app)

### Community
- [Alexa Developer Forums](https://forums.developer.amazon.com/spaces/165/index.html)
- [r/alexa](https://www.reddit.com/r/alexa/)
- [Stack Overflow - Alexa Skills Kit](https://stackoverflow.com/questions/tagged/alexa-skills-kit)

---

**Document Status:** ✅ Complete  
**Next Steps:** Review with team → Build proof of concept → Validate with user testing
