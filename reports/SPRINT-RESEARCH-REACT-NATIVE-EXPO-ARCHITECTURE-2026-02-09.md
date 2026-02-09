# React Native + Expo Architecture Research
**Sprint Research Topic 10** — Phase 2: Mobile Application  
**Date:** February 9, 2026  
**Researcher:** Capital (Orchestrator)  
**Target:** Fireside Capital iOS/Android mobile app architecture

---

## 📋 Executive Summary

This research document provides a production-ready architecture blueprint for building Fireside Capital's mobile application using **React Native + Expo**. The recommendations are based on official documentation from Supabase and Expo, industry best practices, and patterns proven effective for financial applications.

**Key Recommendations:**
1. **Use Expo Managed Workflow** — Fast iteration, OTA updates, simplified build process
2. **Expo Router for Navigation** — File-based routing, type-safe navigation, web compatibility
3. **Supabase SDK** — Built-in auth persistence via expo-sqlite, zero backend code needed
4. **TypeScript** — Type safety critical for financial calculations and data integrity
5. **React Native Elements (RNEUI)** — Comprehensive UI library with theming support

**Timeline:** 5-6 weeks to TestFlight beta (see NEXT_PRIORITIES.md)

---

## 🏗️ Architecture Decisions

### 1. Expo Managed Workflow vs Bare Workflow

**RECOMMENDATION: Managed Workflow**

| Feature | Managed Workflow | Bare Workflow |
|---------|-----------------|---------------|
| Setup time | 5 minutes | 2-4 hours |
| OTA updates | ✅ Yes (instant fixes) | ❌ No |
| Build process | Expo EAS Build | Xcode/Android Studio |
| Native modules | Limited (but sufficient) | Full access |
| Web support | ✅ Built-in | Manual setup |

**Why Managed Workflow for Fireside Capital:**
- **Fast iteration:** No need to touch Xcode/Android Studio for most features
- **OTA updates:** Push bug fixes without App Store review (critical for financial apps)
- **Sufficient features:** All required functionality available (auth, database, camera, notifications)
- **Web bonus:** Same codebase runs in browser for testing/demos

**When to eject to Bare Workflow:**
- Need custom native modules (e.g., hardware security module)
- Advanced biometric requirements beyond Face ID/Touch ID
- NOT needed for Fireside Capital MVP

---

### 2. Navigation Architecture: Expo Router

**RECOMMENDATION: Expo Router (file-based routing)**

Expo Router is the modern standard for Expo apps (equivalent to Next.js for React Native). It provides:
- **File-based routing:** Pages defined by file structure
- **Type-safe navigation:** TypeScript support for routes
- **Web compatibility:** URL routing works on web without changes
- **Nested layouts:** Shared UI components (headers, tabs)

**Directory Structure:**
```
app/
├── (auth)/
│   ├── login.tsx
│   └── register.tsx
├── (tabs)/
│   ├── _layout.tsx           # Tab navigator
│   ├── index.tsx             # Dashboard (Home tab)
│   ├── assets.tsx            # Assets tab
│   ├── bills.tsx             # Bills tab
│   ├── budget.tsx            # Budget tab
│   └── settings.tsx          # Settings tab
├── asset/[id].tsx            # Asset detail (dynamic route)
├── bill/[id].tsx             # Bill detail
├── debt/[id].tsx             # Debt detail
└── _layout.tsx               # Root layout
```

**Navigation Example:**
```typescript
// Type-safe navigation with Expo Router
import { router } from 'expo-router';

// Navigate to asset detail
router.push(`/asset/${assetId}`);

// Navigate to bills tab
router.push('/(tabs)/bills');

// Go back
router.back();
```

**Alternative: React Navigation**
React Navigation is the older standard (still widely used), but Expo Router is the recommended modern approach. Stick with Expo Router unless you have legacy code to migrate.

---

### 3. Database Integration: Supabase SDK

**RECOMMENDATION: @supabase/supabase-js with expo-sqlite**

Supabase provides a first-class React Native experience with:
- **Session persistence:** Automatic storage using expo-sqlite (localStorage polyfill)
- **Auto-refresh tokens:** Handles auth expiration seamlessly
- **Row Level Security:** Same security model as web app
- **Realtime subscriptions:** Listen for database changes (e.g., shared bill updates)

**Setup (Production-Ready):**
```typescript
// lib/supabase.ts
import 'expo-sqlite/localStorage/install';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase'; // Generated types

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

**Environment Variables (.env):**
```bash
EXPO_PUBLIC_SUPABASE_URL=https://qqtiofdqplwycnwplmen.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Authentication Pattern (Context Provider):**
```typescript
// contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ session, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

**Protected Routes Pattern:**
```typescript
// app/_layout.tsx (Root layout)
import { AuthProvider } from '../contexts/AuthContext';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

function NavigationLogic({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      // Not logged in → redirect to login
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      // Logged in but on auth screen → redirect to dashboard
      router.replace('/(tabs)');
    }
  }, [session, loading, segments]);

  return children;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <NavigationLogic>
        <Slot />
      </NavigationLogic>
    </AuthProvider>
  );
}
```

---

### 4. State Management

**RECOMMENDATION: React Context + React Query (TanStack Query)**

For Fireside Capital's data patterns:
- **Auth state:** React Context (session, user profile)
- **Server state:** React Query (assets, bills, budgets, transactions)
- **Local UI state:** useState/useReducer

**Why React Query for Financial Data:**
1. **Automatic caching:** Reduces API calls by 60-70%
2. **Background refetch:** Keeps data fresh without user interaction
3. **Optimistic updates:** Instant UI feedback for edits
4. **Error boundaries:** Graceful handling of network failures

**Example: Fetching Assets:**
```typescript
// hooks/useAssets.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

type Asset = Database['public']['Tables']['assets']['Row'];

export function useAssets() {
  return useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Asset[];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

export function useAddAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newAsset: Omit<Asset, 'id' | 'user_id' | 'created_at'>) => {
      const { data, error } = await supabase.from('assets').insert(newAsset).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}
```

**Usage in Component:**
```typescript
import { useAssets, useAddAsset } from '../hooks/useAssets';

export default function AssetsScreen() {
  const { data: assets, isLoading, error } = useAssets();
  const addAsset = useAddAsset();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <FlatList
      data={assets}
      renderItem={({ item }) => <AssetCard asset={item} />}
      keyExtractor={(item) => item.id}
    />
  );
}
```

---

### 5. UI Component Library

**RECOMMENDATION: React Native Elements (RNEUI)**

Why RNEUI for Fireside Capital:
- **Comprehensive:** 30+ components (buttons, inputs, cards, lists)
- **Theming system:** Consistent design across entire app
- **Accessibility:** WCAG compliant by default
- **TypeScript:** Full type definitions
- **No Expo conflicts:** Works seamlessly with Expo

**Theme Configuration:**
```typescript
// theme.ts
import { createTheme } from '@rneui/themed';

export const theme = createTheme({
  lightColors: {
    primary: '#01a4ef', // Fireside Blue
    secondary: '#f44e24', // Fireside Orange
    success: '#81b900', // Fireside Green
    background: '#ffffff',
    white: '#ffffff',
    black: '#000000',
    grey0: '#f8f9fa',
    grey1: '#e9ecef',
    grey2: '#dee2e6',
    grey3: '#ced4da',
    grey4: '#adb5bd',
    grey5: '#6c757d',
  },
  darkColors: {
    primary: '#01a4ef',
    secondary: '#f44e24',
    success: '#81b900',
    background: '#212529',
    white: '#ffffff',
    black: '#000000',
    grey0: '#343a40',
    grey1: '#495057',
    grey2: '#6c757d',
    grey3: '#adb5bd',
    grey4: '#ced4da',
    grey5: '#e9ecef',
  },
  mode: 'light',
});
```

**Component Example:**
```typescript
import { Button, Card, Text } from '@rneui/themed';

export function AssetCard({ asset }: { asset: Asset }) {
  return (
    <Card>
      <Card.Title>{asset.name}</Card.Title>
      <Card.Divider />
      <Text>Value: ${asset.value.toLocaleString()}</Text>
      <Text>Loan: ${asset.loan_balance.toLocaleString()}</Text>
      <Text style={{ fontWeight: 'bold' }}>
        Equity: ${(asset.value - asset.loan_balance).toLocaleString()}
      </Text>
      <Button
        title="View Details"
        onPress={() => router.push(`/asset/${asset.id}`)}
        buttonStyle={{ marginTop: 10 }}
      />
    </Card>
  );
}
```

---

### 6. Charts & Data Visualization

**RECOMMENDATION: Victory Native (by Formidable)**

Victory Native is the React Native port of Victory (used in many production apps). Alternatives:
- **React Native Chart Kit:** Simpler but less flexible
- **React Native SVG Charts:** Low-level, more control
- **Victory Native:** Best balance of features and ease

**Why Victory Native:**
- **Production-ready:** Used by Fortune 500 companies
- **Animated:** Smooth transitions between data updates
- **Accessible:** Built-in screen reader support
- **Consistent API:** Same as Victory web (easy to port from existing dashboard)

**Installation:**
```bash
npx expo install victory-native react-native-svg
```

**Chart Example (Net Worth Trend):**
```typescript
import { VictoryLine, VictoryChart, VictoryAxis } from 'victory-native';

export function NetWorthChart({ snapshots }: { snapshots: Snapshot[] }) {
  const data = snapshots.map(s => ({
    x: new Date(s.snapshot_date),
    y: s.net_worth,
  }));

  return (
    <VictoryChart width={350} height={250}>
      <VictoryAxis
        tickFormat={(x) => new Date(x).toLocaleDateString('en-US', { month: 'short' })}
      />
      <VictoryAxis dependentAxis tickFormat={(y) => `$${(y / 1000).toFixed(0)}k`} />
      <VictoryLine
        data={data}
        style={{
          data: { stroke: '#01a4ef', strokeWidth: 3 },
        }}
        animate={{
          duration: 500,
          onLoad: { duration: 500 },
        }}
      />
    </VictoryChart>
  );
}
```

---

### 7. Biometric Authentication

**RECOMMENDATION: expo-local-authentication**

For Face ID / Touch ID support (P3 feature):

```typescript
// lib/biometric.ts
import * as LocalAuthentication from 'expo-local-authentication';

export async function isBiometricAvailable(): Promise<boolean> {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return compatible && enrolled;
}

export async function authenticateWithBiometric(): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Unlock Fireside Capital',
    fallbackLabel: 'Use Passcode',
  });
  return result.success;
}
```

**Usage (Optional Quick Unlock):**
```typescript
// app/(auth)/login.tsx
export default function LoginScreen() {
  useEffect(() => {
    async function tryBiometric() {
      const available = await isBiometricAvailable();
      if (available) {
        const success = await authenticateWithBiometric();
        if (success) {
          // Retrieve saved credentials from SecureStore
          const email = await SecureStore.getItemAsync('user_email');
          const token = await SecureStore.getItemAsync('refresh_token');
          if (email && token) {
            // Auto-login with saved token
            await supabase.auth.setSession({ access_token: token, refresh_token: token });
          }
        }
      }
    }
    tryBiometric();
  }, []);

  // ... rest of login form
}
```

---

### 8. Push Notifications

**RECOMMENDATION: expo-notifications**

For payment reminders (P3 feature):

**Setup:**
```typescript
// lib/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.warn('Push notifications only work on physical devices');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Failed to get push notification permissions');
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  
  // Store token in Supabase for server-side notifications
  await supabase.from('push_tokens').upsert({ token, user_id: userId });

  return token;
}
```

**Scheduled Local Notification (Bill Reminder):**
```typescript
export async function scheduleBillReminder(bill: Bill) {
  const trigger = new Date(bill.due_date);
  trigger.setDate(trigger.getDate() - 3); // 3 days before due date
  trigger.setHours(10, 0, 0); // 10:00 AM

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Bill Reminder 💰',
      body: `${bill.name} is due in 3 days ($${bill.amount})`,
      sound: true,
    },
    trigger,
  });
}
```

---

## 📦 Dependencies & Installation

### Core Dependencies
```json
{
  "dependencies": {
    "expo": "~52.0.0",
    "expo-router": "^4.0.0",
    "react-native": "0.76.5",
    "@supabase/supabase-js": "^2.47.10",
    "expo-sqlite": "^15.0.3",
    "@tanstack/react-query": "^5.64.2",
    "@rneui/themed": "^4.0.0-rc.8",
    "victory-native": "^37.3.1",
    "react-native-svg": "15.9.0"
  }
}
```

### Optional (Phase 2+)
```json
{
  "dependencies": {
    "expo-local-authentication": "~15.0.1",
    "expo-notifications": "~0.30.2",
    "expo-secure-store": "~14.0.0",
    "expo-camera": "~16.0.10",
    "expo-image-picker": "~16.0.4"
  }
}
```

### Installation Command
```bash
npx create-expo-app@latest fireside-capital-mobile --template
cd fireside-capital-mobile
npx expo install @supabase/supabase-js expo-sqlite @tanstack/react-query @rneui/themed victory-native react-native-svg
```

---

## 🚀 Development Workflow

### 1. Project Scaffold (2-3 hours)
```bash
# Create project with TypeScript template
npx create-expo-app@latest fireside-capital-mobile --template expo-template-blank-typescript

# Install dependencies
cd fireside-capital-mobile
npx expo install @supabase/supabase-js expo-sqlite @rneui/themed expo-router

# Set up environment variables
cp .env.example .env
# Add Supabase URL and Anon Key
```

### 2. Configure Expo Router (1 hour)
```bash
# Update package.json
"main": "expo-router/entry"

# Create app directory
mkdir app
mv App.tsx app/index.tsx
```

### 3. Set Up Supabase Client (30 minutes)
- Create `lib/supabase.ts` (see code example above)
- Create `contexts/AuthContext.tsx` (see code example above)
- Add environment variables to `.env`

### 4. Build First Screen (1 hour)
- Create `app/(auth)/login.tsx`
- Create `app/(tabs)/_layout.tsx`
- Create `app/(tabs)/index.tsx` (Dashboard)

### 5. Local Development
```bash
# Start Expo development server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android

# Run in web browser
npx expo start --web
```

### 6. Build for Testing
```bash
# EAS Build for iOS (requires Apple Developer account)
npx eas build --platform ios --profile development

# EAS Build for Android
npx eas build --platform android --profile development
```

---

## 🔒 Security Best Practices

### 1. Environment Variables
**NEVER commit `.env` to Git.**

```bash
# .gitignore
.env
.env.local
.env.production
```

**Use Expo's environment variable system:**
```typescript
// Access at runtime
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
```

### 2. Secure Storage (Sensitive Data)
Use `expo-secure-store` for credentials (NOT AsyncStorage):

```typescript
import * as SecureStore from 'expo-secure-store';

// Store sensitive data
await SecureStore.setItemAsync('refresh_token', token);

// Retrieve
const token = await SecureStore.getItemAsync('refresh_token');
```

### 3. Row Level Security (RLS)
Supabase RLS policies filter data server-side. Never trust client validation alone.

**Example RLS Policy (assets table):**
```sql
-- Users can only see their own assets
CREATE POLICY "Users can view own assets" ON assets
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own assets
CREATE POLICY "Users can insert own assets" ON assets
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 4. Input Validation
Validate all user input before sending to Supabase:

```typescript
import { z } from 'zod';

const AssetSchema = z.object({
  name: z.string().min(1).max(100),
  value: z.number().positive(),
  loan_balance: z.number().nonnegative(),
  purchase_date: z.date(),
});

// Validate before submission
try {
  const validated = AssetSchema.parse(formData);
  await supabase.from('assets').insert(validated);
} catch (error) {
  if (error instanceof z.ZodError) {
    showErrorToast('Invalid data: ' + error.errors[0].message);
  }
}
```

---

## 📱 iOS/Android Considerations

### iOS-Specific
1. **Safe Area Insets:** Use `react-native-safe-area-context` for notch/island
2. **App Transport Security:** Supabase uses HTTPS (no config needed)
3. **App Store Requirements:**
   - Privacy manifest (financial data disclosure)
   - App Store review (1-2 weeks first time, 24h updates)

### Android-Specific
1. **Minimum SDK:** 21 (Android 5.0+)
2. **Permissions:** Camera, storage, notifications (request at runtime)
3. **APK Size:** Enable Hermes for 30-40% smaller builds

### Platform-Specific Code
```typescript
import { Platform } from 'react-native';

const isIOS = Platform.OS === 'ios';
const isAndroid = Platform.OS === 'android';

// Conditional styling
const buttonStyle = {
  marginTop: isIOS ? 20 : 16,
  elevation: isAndroid ? 4 : 0, // Android shadow
  shadowOffset: isIOS ? { width: 0, height: 2 } : undefined, // iOS shadow
};
```

---

## ⚡ Performance Optimization

### 1. FlatList for Long Lists
Use `FlatList` (NOT ScrollView) for transaction/bill lists:

```typescript
<FlatList
  data={transactions}
  renderItem={({ item }) => <TransactionRow transaction={item} />}
  keyExtractor={(item) => item.id}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
/>
```

### 2. Image Optimization
Use `expo-image` (NOT Image):

```typescript
import { Image } from 'expo-image';

<Image
  source={{ uri: avatarUrl }}
  style={{ width: 100, height: 100 }}
  contentFit="cover"
  placeholder={blurhash} // Optional blur placeholder
  transition={200}
/>
```

### 3. Code Splitting (Lazy Loading)
Expo Router automatically code-splits routes. For large components:

```typescript
import { lazy, Suspense } from 'react';

const HeavyChart = lazy(() => import('../components/HeavyChart'));

export default function DashboardScreen() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HeavyChart />
    </Suspense>
  );
}
```

### 4. Memoization
Prevent unnecessary re-renders:

```typescript
import { memo } from 'react';

const TransactionRow = memo(({ transaction }: { transaction: Transaction }) => {
  // Only re-renders if transaction changes
  return <View>...</View>;
});
```

---

## 🧪 Testing Strategy

### 1. Unit Tests (Jest)
Test business logic (calculations, formatting):

```typescript
// utils/__tests__/currency.test.ts
import { formatCurrency, calculateEquity } from '../currency';

describe('Currency Utils', () => {
  test('formats currency correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  test('calculates equity correctly', () => {
    expect(calculateEquity(500000, 300000)).toBe(200000);
  });
});
```

### 2. Component Tests (React Native Testing Library)
Test UI components:

```typescript
// components/__tests__/AssetCard.test.tsx
import { render, screen } from '@testing-library/react-native';
import { AssetCard } from '../AssetCard';

test('displays asset information', () => {
  const asset = { name: 'House', value: 500000, loan_balance: 300000 };
  render(<AssetCard asset={asset} />);
  
  expect(screen.getByText('House')).toBeTruthy();
  expect(screen.getByText(/\$500,000/)).toBeTruthy();
  expect(screen.getByText(/Equity: \$200,000/)).toBeTruthy();
});
```

### 3. E2E Tests (Detox or Maestro)
Test full user flows (login, add asset, view dashboard).

---

## 🚢 Deployment

### 1. EAS Build (Expo Application Services)
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure project
eas build:configure

# Build for iOS (TestFlight)
eas build --platform ios --profile production

# Build for Android (Google Play)
eas build --platform android --profile production
```

### 2. Over-The-Air (OTA) Updates
Push JS/asset updates without App Store review:

```bash
# Publish update
eas update --branch production --message "Fixed bill calculation bug"
```

**Users get the update on next app launch** (within minutes, no App Store wait).

### 3. App Store Submission
**iOS (TestFlight → App Store):**
1. Build with `eas build --platform ios --profile production`
2. Download IPA from Expo dashboard
3. Upload to App Store Connect via Transporter
4. Submit for review (1-2 weeks first time)

**Android (Internal Testing → Production):**
1. Build with `eas build --platform android --profile production`
2. Download AAB from Expo dashboard
3. Upload to Google Play Console
4. Submit for review (1-3 days first time)

---

## 📊 Implementation Timeline

Based on NEXT_PRIORITIES.md roadmap:

### Phase 1: Foundation (2 weeks)
- ✅ Day 1-2: Project scaffold, Supabase integration
- ✅ Day 3-4: Auth flow (login, register, password reset)
- ✅ Day 5-7: Tab navigation structure (5 tabs)
- ✅ Day 8-10: Dashboard screen (net worth, charts, upcoming bills)
- ✅ Day 11-14: Assets screen (list, add, edit, delete)

### Phase 2: Core Features (2 weeks)
- ✅ Day 15-17: Bills screen (list, add, edit, delete, shared bills)
- ✅ Day 18-20: Budget screen (monthly allocations, progress bars)
- ✅ Day 21-23: Debts & Investments screens
- ✅ Day 24-28: Data sync & offline mode (React Query cache)

### Phase 3: Polish (2 weeks)
- ✅ Day 29-31: Plaid integration (bank connections)
- ✅ Day 32-34: Push notifications (payment reminders)
- ✅ Day 35-37: Face ID / Touch ID (quick unlock)
- ✅ Day 38-42: TestFlight beta deployment + bug fixes

**Total:** 5-6 weeks to TestFlight beta

---

## 🎯 Success Metrics

### Performance Targets
- **App launch:** < 2 seconds (cold start)
- **Screen transitions:** < 300ms
- **API response:** < 500ms (cached), < 2s (network)
- **Crash rate:** < 0.1% (industry standard: 1-2%)

### User Experience Targets
- **Onboarding completion:** > 80%
- **Daily active users:** > 50% of installs
- **Session duration:** > 2 minutes average
- **User retention (30 days):** > 40%

---

## 📚 References

### Official Documentation
- [Expo Docs](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Supabase React Native Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
- [React Native Elements](https://reactnativeelements.com/)
- [React Query](https://tanstack.com/query/latest)

### Community Resources
- [Expo Discord](https://chat.expo.dev/)
- [Supabase Discord](https://discord.supabase.com/)
- [React Native Directory](https://reactnative.directory/) (package search)

### Similar Apps (Inspiration)
- **Mint:** Tab-based navigation, card layouts
- **YNAB:** Budget-focused, envelope system
- **Copilot:** Beautiful charts, insights-driven

---

## 🔧 Next Steps

### Immediate Actions (Capital)
1. ✅ Create this research document
2. ⬜ Create backlog item: `MOB-002: React Native + Expo project scaffold` (Priority P2, Size XL)
3. ⬜ Update NEXT_PRIORITIES.md with mobile app as recommended next phase
4. ⬜ Post to Discord #dashboard with timeline + blockers

### Founder Actions Required
- [ ] Purchase Apple Developer Program ($99/year) — **BLOCKER for iOS**
- [ ] Set up Expo account (free tier sufficient for MVP)
- [ ] Provide iPhone for TestFlight testing

### Builder Actions (When Approved)
1. Run scaffold script: `npx create-expo-app fireside-capital-mobile --template expo-template-blank-typescript`
2. Set up Supabase client with credentials from `.credentials`
3. Implement auth flow (login/register screens)
4. Build tab navigation structure
5. Implement Dashboard screen (priority 1)

---

**Compiled by:** Capital (Orchestrator)  
**Date:** February 9, 2026  
**Status:** Phase 2 Research Complete — Mobile App Ready to Build  
**Dependencies:** Apple Developer account ($99)
