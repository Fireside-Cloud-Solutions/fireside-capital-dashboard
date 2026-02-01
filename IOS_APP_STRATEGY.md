# iOS App Strategy — Fireside Capital

## Executive Summary

After evaluating three distinct approaches for bringing Fireside Capital to iOS, **I recommend React Native with Expo (Option 1)** as the optimal path forward. This approach balances development speed, cross-platform capability, and integration compatibility with the existing tech stack.

React Native/Expo offers the best ROI for Fireside Capital because it:
- Leverages JavaScript expertise from the existing web app
- Provides official SDKs for both Supabase and Plaid (critical dependencies)
- Enables future Android expansion without additional codebase
- Delivers near-native performance for financial data visualization
- Supports MVP delivery in 4-6 weeks vs 6-10 weeks for native Swift

While a Progressive Web App could be deployed in 1-2 weeks, iOS's severe PWA limitations (no push notifications until manually added to home screen, restricted background sync, second-class experience) make it unsuitable for a financial app that requires timely payment alerts and seamless bank data syncing. Native Swift/SwiftUI would provide the premium iOS experience but requires learning a new language, doubles the timeline, and creates platform lock-in without Android support.

The recommended approach will deliver a production-ready iOS app in approximately 5-6 weeks with phased rollout of features, starting with core financial dashboard functionality and progressively adding advanced features like automated categorization and goal tracking.

---

## Option Analysis

### 1. React Native / Expo

**Effort:** 4-6 weeks for MVP (160-240 hours)

**Cost:**
- Apple Developer Program: $99/year (required for App Store distribution)
- Expo Application Services (EAS): Free tier available, $29/month for production builds
- No additional licensing fees
- Total Year 1: ~$99-$447 depending on build frequency

**Pros:**
- **Cross-platform foundation**: Single codebase targets iOS and Android, reducing future development costs by 60-70%
- **JavaScript alignment**: Matches existing vanilla JS skillset, minimizing learning curve
- **Mature ecosystem**: Over 500,000 apps built with React Native, extensive community support
- **Official Supabase SDK**: `@supabase/supabase-js` with React Native-specific auth storage adapters
- **Official Plaid SDK**: `react-native-plaid-link-sdk` v11.x with full iOS support
- **Component libraries**: React Native Elements, React Native Paper provide Bootstrap-like UI components
- **Chart.js compatible**: `react-native-chart-kit` and `react-native-svg-charts` provide similar charting APIs
- **Hot reload**: Expo Go enables instant preview on physical devices during development
- **OTA updates**: Push JavaScript updates without App Store review (for non-native code changes)

**Cons:**
- **Bridge overhead**: ~15-30ms latency for native module calls (minimal impact for financial apps)
- **App size**: 40-60MB base app size vs 10-20MB for native Swift
- **Limited native APIs**: Some iOS-specific features require custom native modules
- **Dependency on Expo ecosystem**: Framework updates may lag behind React Native core
- **Debugging complexity**: Errors can span JavaScript, native iOS, and bridge layers

**Technical Stack:**
- **Framework**: React Native 0.73+ with Expo SDK 50+
- **UI Components**: React Native Elements + React Native Paper
- **Navigation**: React Navigation 6.x (native stack navigator)
- **State Management**: React Context API + AsyncStorage for offline persistence
- **Charts**: React Native Chart Kit (wraps react-native-svg)
- **Auth**: `@supabase/supabase-js` with `@react-native-async-storage/async-storage`
- **Database**: Supabase PostgREST client
- **Banking**: `react-native-plaid-link-sdk` v11.x
- **Build**: Expo Application Services (EAS Build)
- **Testing**: Jest + React Native Testing Library

**Migration Strategy:**
1. **Reuse business logic**: Extract data fetching functions from `app/assets/js/` into shared utilities
2. **API layer unchanged**: Supabase REST endpoints remain identical; only client library changes
3. **Convert Bootstrap to RNE**: Map existing Bootstrap components to React Native Elements equivalents
   - `btn-primary` → `<Button type="solid" />`
   - `card` → `<Card />`
   - `form-control` → `<Input />`
4. **Chart.js → React Native Chart Kit**: Both use similar data structure; charts require minimal refactoring
5. **Authentication flow**: Supabase auth works identically; only storage adapter changes from localStorage to AsyncStorage
6. **Page → Screen mapping**: Each HTML page becomes a React Native screen component
7. **Incremental development**: Build screen-by-screen starting with dashboard, reusing 70-80% of data logic

---

### 2. Progressive Web App (PWA)

**Effort:** 1-2 weeks (40-80 hours)

**Cost:**
- **Zero App Store fees**: PWAs don't require Apple Developer Program
- **Hosting**: Already covered by Azure Static Web Apps
- **Development**: Minimal incremental cost
- **Total Year 1**: $0 incremental

**Pros:**
- **Maximum code reuse**: 95% of existing HTML/CSS/JS remains unchanged
- **Fastest time-to-market**: Add service worker, manifest, and offline support to existing app
- **Single codebase**: Web and "mobile" app are identical
- **Zero distribution friction**: Users install via Safari share menu, no App Store approval
- **Instant updates**: Changes deploy immediately without app review process
- **Works on all platforms**: Same PWA runs on iOS, Android, desktop

**Cons:**
- **iOS severely limits PWAs**: 
  - ❌ **No push notifications** until user manually adds to home screen (95% of users never do this)
  - ❌ **No background sync**: Can't update bank data when app is closed
  - ❌ **No badge notifications**: Can't show unread payment alerts on app icon
  - ❌ **Limited storage**: IndexedDB capped at ~50MB on iOS Safari
  - ❌ **No native integrations**: Can't access Face ID, Touch ID, or iOS Keychain
  - ❌ **Second-class UX**: Feels like a web bookmark, not a real app
- **No App Store presence**: Users can't discover the app by searching "Fireside Capital" in App Store
- **Performance constraints**: JavaScript execution ~30% slower than native/React Native
- **Limited offline capability**: Service worker can cache pages but complex offline sync is difficult
- **No monetization**: Can't use in-app purchases if future premium features are added

**Technical Stack:**
- **Current stack + additions**:
  - Vanilla JavaScript (existing)
  - Bootstrap 5 (existing)
  - Chart.js (existing)
  - **Service Worker** (new: handles offline caching)
  - **Web App Manifest** (new: defines app metadata, icons, theme)
  - **IndexedDB** (new: offline data storage)
  - **Workbox** (optional: Google's service worker toolkit)

**Migration Strategy:**
1. **Create manifest.json**: Define app name, icons (192px, 512px), theme colors, display mode
2. **Add service worker**: Implement caching strategy for HTML, CSS, JS, API responses
3. **Offline data layer**: Wrap Supabase calls with IndexedDB fallback for read-only offline access
4. **Add to home screen prompt**: Guide users through Safari → Share → Add to Home Screen
5. **Test iOS Safari limitations**: Validate reduced feature set works acceptably
6. **Deploy**: Push changes to Azure Static Web Apps, no app submission required

**Critical limitation for Fireside Capital**: Payment reminders and bill alerts are core features that require push notifications. iOS Safari only supports push notifications if the user manually adds the PWA to their home screen *first*, which creates a chicken-and-egg problem. This makes PWA unsuitable for a financial app where timely notifications are essential.

---

### 3. Native Swift (SwiftUI)

**Effort:** 6-10 weeks for MVP (240-400 hours)

**Cost:**
- Apple Developer Program: $99/year (required)
- Xcode: Free (macOS required)
- SwiftUI: Free (native framework)
- Third-party libraries: Free (open source)
- Total Year 1: $99

**Pros:**
- **Premium iOS experience**: Pixel-perfect adherence to iOS design guidelines, feels completely native
- **Best performance**: 2-3x faster than React Native for complex UI, instant 60fps animations
- **Full API access**: Unrestricted access to Face ID, Touch ID, HealthKit, Wallet, iOS Keychain
- **SwiftUI declarative syntax**: Modern UI framework similar to React (learn once, build faster)
- **Official Supabase SDK**: `supabase-swift` provides first-class Swift integration
- **Native Charts framework**: SwiftUI Charts (iOS 16+) provides beautiful, customizable charts built-in
- **Smaller app size**: 10-20MB vs 40-60MB for React Native
- **Apple ecosystem integration**: Seamless Handoff, iCloud sync, Shortcuts, Widgets, Apple Watch extension
- **Future-proof**: Direct access to new iOS features on day one of announcement

**Cons:**
- **iOS-only**: Separate codebase required for Android (doubles total development effort)
- **Steeper learning curve**: Requires learning Swift, SwiftUI, iOS patterns (vs JavaScript)
- **No code reuse from web**: Must rebuild all UI components and logic from scratch
- **Longer development time**: 50-60% more time than React Native for same feature set
- **Vendor lock-in**: Swift skills don't transfer to Android or web development
- **Smaller hiring pool**: 3x fewer Swift developers than JavaScript developers
- **Breaking changes**: SwiftUI is rapidly evolving; syntax changes between iOS versions

**Technical Stack:**
- **Language**: Swift 5.9+
- **UI Framework**: SwiftUI (iOS 16+ minimum target)
- **Architecture**: MVVM (Model-View-ViewModel) pattern
- **Database Client**: `supabase-swift` SDK
- **Networking**: URLSession + Codable for API calls
- **Charts**: SwiftUI Charts (native framework)
- **Banking**: Plaid iOS SDK (requires native integration)
- **Persistence**: SwiftData or Core Data for offline storage
- **Authentication**: Supabase Auth + iOS Keychain
- **Navigation**: NavigationStack (SwiftUI native)
- **Dependency Injection**: Swift Package Manager
- **Testing**: XCTest + SwiftUI Previews

**Migration Strategy:**
1. **No code reuse**: Start from scratch; existing JavaScript code provides specification, not implementation
2. **Database schema unchanged**: Supabase tables remain identical; only client library differs
3. **API-first approach**: Build Swift data models matching Supabase table schemas
4. **SwiftUI component library**: Create reusable components mimicking Bootstrap patterns
   - `ButtonPrimary` → primary button style
   - `CardView` → card container
   - `FormField` → text input with label
5. **Chart migration**: SwiftUI Charts uses different syntax than Chart.js; requires full rewrite of visualization code
6. **Authentication**: Implement Supabase auth flow using `supabase-swift` SDK
7. **Screen-by-screen rebuild**: Translate each HTML page to SwiftUI View
8. **Plaid integration**: Use native Plaid iOS SDK (different API than web SDK)
9. **Testing**: Build comprehensive test suite from day one (easier to test in Swift than JavaScript)

---

## Recommendation

**Chosen Approach:** React Native / Expo (Option 1)

### Rationale

React Native with Expo is the optimal choice for Fireside Capital because it:

1. **Balances speed and quality**: 4-6 week timeline delivers production app faster than native Swift while maintaining near-native performance and UX that PWA cannot achieve on iOS

2. **Leverages existing skills**: JavaScript expertise from the web app transfers directly, minimizing ramp-up time and reducing development risk

3. **Protects future optionality**: Cross-platform architecture enables Android expansion in Phase 3 without rebuilding the entire app (estimated 2-3 weeks for Android vs 6-10 weeks for new Swift codebase)

4. **Integrates seamlessly with tech stack**: 
   - Supabase provides official React Native SDK with full Auth, Database, and Storage support
   - Plaid maintains `react-native-plaid-link-sdk` with feature parity to web SDK
   - Chart rendering libraries provide familiar Chart.js-like APIs

5. **Reduces total cost of ownership**: Single codebase means bug fixes and feature additions deploy to both platforms simultaneously, cutting maintenance effort by 60%

6. **Meets product requirements**: Supports push notifications for payment alerts, background sync for bank data updates, Face ID/Touch ID for secure login, and offline data caching—all features PWA cannot deliver on iOS

7. **Proven for fintech**: Companies like Robinhood, Coinbase, and Bloomberg have successfully deployed React Native apps handling sensitive financial data

**Why not PWA**: iOS Safari's crippling limitations (no push notifications until manual install, no background sync, no badge alerts) make PWA unsuitable for a financial app where timely notifications are mission-critical. The "second-class app" experience would harm user retention.

**Why not Native Swift**: While Swift would deliver the best iOS experience, the 50-60% longer timeline, inability to reuse any existing code, and platform lock-in don't justify the marginal UX improvement for an MVP. Swift becomes the right choice if iOS becomes 80%+ of users and Android is explicitly ruled out.

---

### Phase 1 (MVP) — Core Financial Dashboard

**Timeline:** 5-6 weeks

**Features:**
- ✅ User authentication (Supabase email/password + magic link)
- ✅ Dashboard home screen (net worth snapshot, recent transactions)
- ✅ Assets view (real estate, vehicles with value/loan/equity)
- ✅ Bills management (upcoming bills, payment status, due date alerts)
- ✅ Debts tracking (loans, interest rates, payoff progress)
- ✅ Income sources (W2/1099 entries with frequency)
- ✅ Basic settings (emergency fund goal, notification preferences)
- ✅ Pull-to-refresh data sync
- ✅ Offline mode (read-only cached data)

**Deliverables:**
- Installable iOS app via TestFlight for beta testing
- 6 core screens matching web app parity
- Supabase backend integration (same database as web app)
- Local push notification setup (reminders without Plaid yet)
- Onboarding flow for new users

**Success Metrics:**
- App launches successfully on iOS 15+ devices
- All Supabase CRUD operations functional
- Chart rendering performance >30fps
- App bundle size <50MB

---

### Phase 2 (Enhanced) — Banking & Automation

**Timeline:** 3-4 weeks (cumulative: 8-10 weeks from start)

**Features:**
- ✅ Plaid integration (link bank accounts via Plaid Link)
- ✅ Transaction syncing (auto-import from connected banks)
- ✅ Budget tracking (monthly budget vs actual spending)
- ✅ Investments dashboard (account balances, contributions, returns)
- ✅ Push notifications (payment reminders, budget alerts sent via APNs)
- ✅ Face ID / Touch ID authentication
- ✅ Reports screen (weekly/monthly financial summaries)
- ✅ Data export (PDF/CSV generation)
- ✅ Search & filtering (find transactions by category, date, amount)

**Deliverables:**
- App Store submission (public release candidate)
- Plaid production environment connection
- Apple Push Notification Service (APNs) integration
- Enhanced security (biometric auth + iOS Keychain)
- 8 screens (full web app parity)

**Success Metrics:**
- Plaid connection success rate >95%
- Transaction sync completes in <10 seconds
- Push notifications delivered within 1 minute
- App Store approval on first submission

---

### Phase 3 (Full Parity + Cross-Platform)

**Timeline:** 4-5 weeks (cumulative: 12-15 weeks from start)

**Features:**
- ✅ Smart categorization (AI-powered transaction tagging via OpenAI API)
- ✅ Goal tracking (savings goals, debt payoff projections, net worth milestones)
- ✅ Advanced charts (interactive drill-downs, multi-period comparisons)
- ✅ Recurring bill automation (auto-assign to budgets, payment prediction)
- ✅ Email integration (Gmail/Outlook bill parsing)
- ✅ Widgets (home screen net worth widget, today's spending widget)
- ✅ Apple Watch companion app (quick balance checks)
- ✅ Android app (deploy same React Native codebase to Google Play)
- ✅ Siri Shortcuts ("Hey Siri, what's my net worth?")

**Deliverables:**
- iOS app with advanced features beyond web parity
- Android app (Play Store release)
- Cross-platform feature parity (iOS + Android + Web)
- Home screen widgets and watch app
- Voice assistant integration

**Success Metrics:**
- iOS + Android combined user base
- Widget adoption rate >40%
- AI categorization accuracy >85%
- Apple Watch app install rate >15% of iOS users

---

## Technical Architecture

### App Structure (Screens & Navigation)

```
Fireside Capital iOS App
│
├── Authentication Flow
│   ├── SplashScreen (session check)
│   ├── LoginScreen (email/password or magic link)
│   └── OnboardingScreen (first-time user setup)
│
├── Main App (TabNavigator)
│   │
│   ├── Tab 1: Dashboard
│   │   ├── DashboardScreen (net worth, recent transactions)
│   │   ├── NetWorthDetailScreen (historical chart, breakdown)
│   │   └── TransactionDetailScreen (single transaction view)
│   │
│   ├── Tab 2: Accounts
│   │   ├── AccountsListScreen (assets, debts, investments)
│   │   ├── AssetsScreen (real estate, vehicles)
│   │   ├── DebtsScreen (loans, credit cards)
│   │   └── InvestmentsScreen (401k, IRA, brokerage)
│   │
│   ├── Tab 3: Bills & Budget
│   │   ├── BillsListScreen (upcoming, overdue, paid)
│   │   ├── BudgetScreen (monthly budget vs actual)
│   │   └── BillDetailScreen (edit, mark paid)
│   │
│   ├── Tab 4: Reports
│   │   ├── ReportsScreen (weekly, monthly summaries)
│   │   ├── SpendingAnalysisScreen (category breakdown)
│   │   └── IncomeScreen (income sources, history)
│   │
│   └── Tab 5: Settings
│       ├── SettingsScreen (preferences, account)
│       ├── BankConnectionsScreen (Plaid link/unlink)
│       ├── NotificationSettingsScreen (alerts config)
│       └── SecurityScreen (Face ID, PIN, logout)
│
└── Modals & Overlays
    ├── PlaidLinkModal (Plaid Link webview)
    ├── AddItemModal (new asset/debt/bill/income)
    └── ChartDrilldownModal (interactive chart details)
```

**Navigation Pattern**: Bottom tab navigator (5 tabs) with nested stack navigators for each section. Modal presentations for Plaid and add/edit flows.

---

### Backend Integration (Supabase API Calls)

**Architecture**: Repository pattern with offline-first caching

```typescript
// Data Layer Architecture

┌─────────────────────────────────────────┐
│   React Native Components (UI)          │
│   - Screens, Tabs, Modals               │
└─────────────┬───────────────────────────┘
              │ useState, useEffect
              ▼
┌─────────────────────────────────────────┐
│   Custom Hooks (Business Logic)         │
│   - useAssets(), useBills(), useBudget() │
└─────────────┬───────────────────────────┘
              │ Repository calls
              ▼
┌─────────────────────────────────────────┐
│   Repository Layer (Data Access)        │
│   - AssetsRepository, BillsRepository    │
│   - Handles offline/online sync          │
└─────────────┬───────────────────────────┘
              │ Supabase client + AsyncStorage
              ▼
┌──────────────────┬──────────────────────┐
│  Supabase API    │  AsyncStorage Cache  │
│  (Online)        │  (Offline)           │
└──────────────────┴──────────────────────┘
```

**Example: Fetching Bills**

```typescript
// hooks/useBills.ts
export function useBills() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    BillsRepository.getAll()
      .then(setBills)
      .finally(() => setLoading(false));
  }, []);

  return { bills, loading };
}

// repositories/BillsRepository.ts
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class BillsRepository {
  static async getAll(): Promise<Bill[]> {
    try {
      // Try online fetch
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('user_id', getCurrentUserId())
        .order('due_date', { ascending: true });

      if (error) throw error;

      // Cache for offline use
      await AsyncStorage.setItem('bills_cache', JSON.stringify(data));
      return data;

    } catch (error) {
      // Fallback to cache if offline
      const cached = await AsyncStorage.getItem('bills_cache');
      return cached ? JSON.parse(cached) : [];
    }
  }
}
```

**API Endpoints** (Supabase auto-generated):
- `GET /rest/v1/assets?select=*&user_id=eq.{id}`
- `POST /rest/v1/bills` (insert new bill)
- `PATCH /rest/v1/debts?id=eq.{id}` (update debt)
- `DELETE /rest/v1/investments?id=eq.{id}` (delete investment)

**Real-time Subscriptions** (for live updates):
```typescript
supabase
  .channel('bills_changes')
  .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'bills' }, 
      (payload) => {
        // Update local state when bills table changes
        refreshBills();
      })
  .subscribe();
```

---

### Authentication Flow

```
User Opens App
      │
      ▼
┌─────────────────┐
│ Check Session   │────────► Session exists? ──Yes──► Navigate to Dashboard
│ (AsyncStorage)  │                │
└─────────────────┘                No
                                   │
                                   ▼
                          ┌────────────────┐
                          │ Login Screen   │
                          │ - Email/PW     │
                          │ - Magic Link   │
                          │ - Face ID      │
                          └────────┬───────┘
                                   │
                                   ▼
                          ┌────────────────────┐
                          │ Supabase Auth      │
                          │ supabase.auth.     │
                          │ signInWithPassword()│
                          └────────┬───────────┘
                                   │
                                   ▼
                          ┌────────────────┐
                          │ Save Session   │
                          │ to AsyncStorage│
                          └────────┬───────┘
                                   │
                                   ▼
                          Navigate to Dashboard
```

**Implementation**:
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const supabase = createClient(
  'https://qqtiofdqplwycnwplmen.supabase.co',
  'ANON_KEY',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// AuthContext.tsx
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Listen for auth state changes
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ session }}>
      {session ? <MainApp /> : <LoginScreen />}
    </AuthContext.Provider>
  );
}
```

**Biometric Auth** (Phase 2):
```typescript
import * as LocalAuthentication from 'expo-local-authentication';

async function authenticateWithBiometrics() {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  if (hasHardware && isEnrolled) {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access Fireside Capital',
      fallbackLabel: 'Use passcode',
    });

    if (result.success) {
      // Retrieve cached session from iOS Keychain
      // Auto-login without password
    }
  }
}
```

---

### Data Persistence (Offline/Cache)

**Strategy**: Write-through cache with background sync

1. **Read operations**: Check cache first, then API (cache-aside pattern)
2. **Write operations**: Write to API immediately, update cache on success
3. **Background sync**: Queue failed writes, retry when connection restored

**Implementation**:
```typescript
// lib/OfflineStorage.ts
export class OfflineStorage {
  // Cache read operations
  static async get(key: string, fetcher: () => Promise<any>) {
    try {
      // Try API first
      const data = await fetcher();
      await AsyncStorage.setItem(key, JSON.stringify(data));
      return data;
    } catch (error) {
      // Fallback to cache
      const cached = await AsyncStorage.getItem(key);
      if (cached) return JSON.parse(cached);
      throw error;
    }
  }

  // Queue write operations
  static async queueWrite(operation: PendingOperation) {
    const queue = await this.getWriteQueue();
    queue.push(operation);
    await AsyncStorage.setItem('write_queue', JSON.stringify(queue));
  }

  // Process queue when online
  static async syncQueue() {
    const queue = await this.getWriteQueue();
    for (const op of queue) {
      try {
        await this.executeOperation(op);
        // Remove from queue on success
        queue.shift();
      } catch (error) {
        break; // Stop on first failure
      }
    }
    await AsyncStorage.setItem('write_queue', JSON.stringify(queue));
  }
}
```

**Offline Indicator**:
```typescript
import NetInfo from '@react-native-community/netinfo';

function App() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
      if (state.isConnected) {
        OfflineStorage.syncQueue(); // Sync pending writes
      }
    });
    return unsubscribe;
  }, []);

  return (
    <>
      {!isOnline && <OfflineBanner />}
      <MainApp />
    </>
  );
}
```

---

### Push Notifications (Phase 2)

**Architecture**: Supabase Edge Functions → APNs → iOS Device

```
Scheduled Job (Supabase Cron)
      │
      ▼
Query bills due soon
      │
      ▼
Supabase Edge Function
(check_upcoming_bills)
      │
      ▼
Send push notification payload
      │
      ▼
APNs (Apple Push Notification Service)
      │
      ▼
User's iPhone (notification appears)
```

**Implementation**:

1. **Device token registration**:
```typescript
import * as Notifications from 'expo-notifications';

async function registerForPushNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  const token = await Notifications.getExpoPushTokenAsync();

  // Save token to Supabase
  await supabase.from('user_devices').upsert({
    user_id: getCurrentUserId(),
    push_token: token.data,
    platform: 'ios',
  });
}
```

2. **Supabase Edge Function** (runs daily at 8 AM):
```typescript
// supabase/functions/send-bill-reminders/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  // Query bills due in next 3 days
  const { data: upcomingBills } = await supabase
    .from('bills')
    .select('*, user_devices(push_token)')
    .gte('due_date', today)
    .lte('due_date', threeDaysFromNow);

  // Send push notification for each bill
  for (const bill of upcomingBills) {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: bill.user_devices.push_token,
        title: 'Bill Due Soon',
        body: `${bill.name} ($${bill.amount}) due ${bill.due_date}`,
        data: { bill_id: bill.id },
      }),
    });
  }

  return new Response('Notifications sent');
});
```

3. **Handle notification tap**:
```typescript
Notifications.addNotificationResponseReceivedListener(response => {
  const billId = response.notification.request.content.data.bill_id;
  navigation.navigate('BillDetail', { id: billId });
});
```

---

### Deployment (App Store / TestFlight)

**Build Process** (using Expo Application Services):

```bash
# 1. Configure app.json
{
  "expo": {
    "name": "Fireside Capital",
    "slug": "fireside-capital",
    "ios": {
      "bundleIdentifier": "com.fireside.capital",
      "buildNumber": "1.0.0",
      "supportsTablet": true
    }
  }
}

# 2. Build for iOS
eas build --platform ios --profile production

# 3. Submit to TestFlight (beta testing)
eas submit --platform ios --latest

# 4. After beta testing, promote to App Store via App Store Connect
```

**Release Checklist**:
- ✅ App privacy policy URL (required for App Store)
- ✅ App icon (1024x1024px)
- ✅ Screenshots (6.5" iPhone, 12.9" iPad)
- ✅ App description, keywords, category (Finance)
- ✅ Age rating (4+)
- ✅ Support URL and contact email
- ✅ Terms of service
- ✅ Data usage disclosure (financial data, bank connections)

**App Store Review Tips**:
1. Include test credentials for review team
2. Explain Plaid sandbox mode if using demo data
3. Document Face ID usage in privacy manifest
4. Provide video demo of core features

**Timeline**:
- TestFlight upload: ~30 minutes (build + upload)
- Beta testing period: 1-2 weeks
- App Store review: 24-48 hours (typically)
- Public release: Day of approval

---

## Migration Plan

### Step 1: Project Setup (Week 1, Days 1-2)
- Install Node.js, Expo CLI, Xcode
- Initialize Expo project: `npx create-expo-app fireside-capital-mobile`
- Install dependencies:
  - `@supabase/supabase-js`
  - `@react-native-async-storage/async-storage`
  - `react-native-plaid-link-sdk`
  - `react-navigation` (navigation)
  - `react-native-elements` (UI components)
  - `react-native-chart-kit` (charts)
- Configure Supabase client with existing credentials
- Set up project structure (screens/, components/, hooks/, repositories/)

### Step 2: Authentication (Week 1, Days 3-5)
- Build Login screen (email/password + magic link)
- Implement AuthContext with session management
- Connect to Supabase Auth API
- Test login/logout flow on iOS simulator
- Add splash screen with session check

### Step 3: Core Screens (Weeks 2-3)
**Week 2: Read-only views**
- Dashboard screen (net worth, recent transactions)
- Assets screen (list real estate, vehicles)
- Bills screen (upcoming bills, due dates)
- Debts screen (loans, credit cards)
- Income screen (salary, 1099 sources)

**Week 3: CRUD operations**
- Add/edit/delete assets
- Add/edit/delete bills
- Add/edit/delete debts
- Add/edit/delete income sources
- Implement form validation

### Step 4: Data Visualization (Week 4)
- Integrate React Native Chart Kit
- Build net worth trend chart (line chart)
- Build budget vs actual chart (bar chart)
- Build spending by category chart (pie chart)
- Add interactive chart gestures (tap to drill down)

### Step 5: Offline Support (Week 5)
- Implement AsyncStorage caching layer
- Build offline indicator banner
- Add pull-to-refresh on all screens
- Implement write queue for offline edits
- Test offline mode extensively

### Step 6: Beta Testing (Week 6)
- Build with EAS Build
- Deploy to TestFlight
- Distribute to 5-10 beta testers
- Collect feedback (bugs, UX issues)
- Fix critical issues
- Prepare App Store submission materials

### Step 7: Plaid Integration (Week 7-8, Phase 2)
- Integrate `react-native-plaid-link-sdk`
- Build bank connection flow (Plaid Link modal)
- Fetch transactions from Plaid API
- Store transactions in Supabase
- Build transactions list screen with search/filter
- Implement transaction auto-categorization

### Step 8: Push Notifications (Week 9, Phase 2)
- Register for APNs
- Request notification permissions in app
- Save device tokens to Supabase
- Build Supabase Edge Function for bill reminders
- Test notification delivery
- Handle notification taps (deep linking)

### Step 9: Advanced Features (Weeks 10-12, Phase 3)
- Build budget tracking screen (monthly budgets)
- Implement goal tracking (savings goals, debt payoff)
- Add AI transaction categorization (OpenAI API)
- Build reports screen (weekly/monthly summaries)
- Create home screen widgets (iOS 14+)
- Build Apple Watch companion app

### Step 10: Android Expansion (Weeks 13-15, Phase 3)
- Test existing React Native code on Android emulator
- Fix platform-specific UI issues
- Configure `app.json` for Android
- Build with EAS Build for Android
- Submit to Google Play Store
- Launch on both platforms simultaneously

---

### Risk Mitigation

**Risk 1: Expo limitations require native modules**
- **Mitigation**: Use `expo prebuild` to eject to bare React Native if needed (still maintains most Expo benefits)
- **Likelihood**: Low (Expo supports 95% of common use cases)

**Risk 2: Plaid SDK integration issues**
- **Mitigation**: Allocate 1 full week for Plaid integration (Week 7); use Plaid sandbox for testing before production
- **Likelihood**: Medium (Plaid SDK has good docs but OAuth flows can be tricky)

**Risk 3: App Store rejection**
- **Mitigation**: Review [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) Section 4.2 (minimum functionality); include detailed test instructions
- **Likelihood**: Low if following guidelines

**Risk 4: Performance issues with large datasets**
- **Mitigation**: Implement pagination (load 50 transactions at a time); use FlatList with `windowSize` optimization
- **Likelihood**: Low (financial apps typically have <10k transactions per user)

**Risk 5: AsyncStorage 6MB limit on iOS**
- **Mitigation**: Store only last 90 days of transactions offline; full history stays in Supabase
- **Likelihood**: Low (6MB = ~50k transactions in JSON)

**Risk 6: Developer leaves mid-project**
- **Mitigation**: Document all code with JSDoc comments; maintain ARCHITECTURE.md; use TypeScript for type safety
- **Likelihood**: Medium (always a risk with small teams)

**Risk 7: Supabase API changes break app**
- **Mitigation**: Pin `@supabase/supabase-js` version; subscribe to Supabase changelog; test updates in staging before production
- **Likelihood**: Very Low (Supabase maintains backward compatibility)

---

## Cost Estimate

### Development Time
| Phase | Duration | Hours | Rate ($100/hr) | Cost |
|-------|----------|-------|----------------|------|
| Phase 1 (MVP) | 5-6 weeks | 200-240 | $100/hr | $20,000-$24,000 |
| Phase 2 (Enhanced) | 3-4 weeks | 120-160 | $100/hr | $12,000-$16,000 |
| Phase 3 (Full Parity) | 4-5 weeks | 160-200 | $100/hr | $16,000-$20,000 |
| **Total** | **12-15 weeks** | **480-600 hrs** | **$100/hr** | **$48,000-$60,000** |

*Note: If building in-house, use your actual hourly cost (salary + benefits / 2080 hours)*

### Tools & Services (Year 1)
| Service | Cost | Notes |
|---------|------|-------|
| Apple Developer Program | $99/year | Required for App Store distribution |
| Expo EAS (Build service) | $0-$348/year | Free tier: 30 builds/month; Production: $29/month |
| Supabase | $0 | Free tier sufficient for MVP (<500MB DB, <2GB bandwidth) |
| Plaid | $0 (sandbox) → $1,500+/year | Sandbox free; Production: $0.30/item/month (500 users × $0.30 × 12 = $1,800) |
| TestFlight | $0 | Included with Apple Developer Program |
| Code signing certificates | $0 | Included with Apple Developer Program |
| **Total Year 1** | **$99-$1,947** | Depends on Plaid usage and EAS plan |

### Ongoing Maintenance (Monthly)
| Task | Hours/Month | Cost |
|------|-------------|------|
| Bug fixes | 4-8 hours | $400-$800 |
| OS updates (iOS 18, 19...) | 2-4 hours | $200-$400 |
| Dependency updates | 1-2 hours | $100-$200 |
| Feature enhancements | 10-20 hours | $1,000-$2,000 |
| **Total** | **17-34 hrs** | **$1,700-$3,400/month** |

### Total Cost Summary
- **Phase 1 (MVP)**: $20,000-$24,000 + $99 = **$20,099-$24,099**
- **Phase 2 (Enhanced)**: +$12,000-$16,000 = **$32,099-$40,099 cumulative**
- **Phase 3 (Full Parity)**: +$16,000-$20,000 = **$48,099-$60,099 cumulative**
- **Year 1 Total (Dev + Services)**: **$48,198-$62,046**
- **Year 2+ (Maintenance only)**: **$20,400-$40,800/year** (assuming 1 week/month of work)

---

## Next Steps

### Immediate Actions (Week 1)

1. **Install development environment**
   ```bash
   # Install Homebrew (if on macOS)
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   
   # Install Node.js
   brew install node
   
   # Install Expo CLI
   npm install -g expo-cli eas-cli
   
   # Install Xcode (from Mac App Store, ~12GB download)
   # Install Xcode Command Line Tools
   xcode-select --install
   ```

2. **Enroll in Apple Developer Program**
   - Visit https://developer.apple.com/programs/enroll/
   - Complete enrollment (requires Apple ID + $99 payment)
   - Wait for approval (typically 24-48 hours)

3. **Create Expo account**
   - Visit https://expo.dev/signup
   - Create account (free)
   - Link GitHub account for CI/CD

4. **Initialize project**
   ```bash
   # Create new Expo project
   npx create-expo-app fireside-capital-mobile --template blank-typescript
   cd fireside-capital-mobile
   
   # Install core dependencies
   npx expo install @supabase/supabase-js @react-native-async-storage/async-storage
   npx expo install @react-navigation/native @react-navigation/bottom-tabs
   npx expo install react-native-elements react-native-vector-icons
   
   # Run on iOS simulator
   npx expo run:ios
   ```

5. **Set up GitHub repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Expo project setup"
   git branch -M main
   git remote add origin https://github.com/Fireside-Cloud-Solutions/fireside-capital-mobile.git
   git push -u origin main
   ```

### Week 2-3 Actions

6. **Build authentication flow**
   - Create `screens/LoginScreen.tsx`
   - Create `contexts/AuthContext.tsx`
   - Integrate Supabase Auth
   - Test login/logout on simulator

7. **Design navigation structure**
   - Install React Navigation
   - Create bottom tab navigator (5 tabs)
   - Build placeholder screens for each tab
   - Test navigation flow

8. **Implement first data screen**
   - Build `screens/DashboardScreen.tsx`
   - Fetch data from Supabase `snapshots` table
   - Display net worth card
   - Add pull-to-refresh

### Week 4-6 Actions

9. **Build remaining CRUD screens**
   - Assets, Bills, Debts, Income, Investments screens
   - Add/edit/delete modals
   - Form validation

10. **Integrate charts**
    - Install React Native Chart Kit
    - Build net worth line chart
    - Build spending pie chart
    - Test chart rendering performance

11. **Deploy to TestFlight**
    ```bash
    # Configure EAS
    eas build:configure
    
    # Build for iOS
    eas build --platform ios --profile production
    
    # Submit to TestFlight
    eas submit --platform ios --latest
    ```

12. **Gather beta feedback**
    - Invite 5-10 users to TestFlight
    - Create feedback form (Google Forms or Typeform)
    - Prioritize bug fixes vs feature requests
    - Iterate based on feedback

---

## Conclusion

React Native with Expo provides the optimal balance of development speed, cross-platform capability, and integration quality for Fireside Capital's iOS app. The phased rollout approach (MVP → Enhanced → Full Parity) allows for rapid user validation while progressively adding sophisticated features.

**Key Advantages of Chosen Approach:**
- ✅ 5-6 week MVP timeline (vs 6-10 weeks for native Swift)
- ✅ Reuses JavaScript expertise from web app
- ✅ Supabase + Plaid have official React Native SDKs
- ✅ Cross-platform foundation enables Android expansion in Phase 3
- ✅ Single codebase reduces maintenance by 60%
- ✅ Proven by major fintech companies (Robinhood, Coinbase, Bloomberg)

**Total Investment**: $48,000-$60,000 for full development (Phases 1-3) + $99-$1,947/year in services

**Timeline**: 12-15 weeks from project kickoff to iOS + Android public release

The strategy outlined above provides a clear, actionable roadmap to transform Fireside Capital from a web-only dashboard into a best-in-class mobile financial management app.
