# Azure DevOps Work Items: Real-Time Collaboration
**Generated:** February 10, 2026 @ 7:27 AM EST  
**Research Report:** `SPRINT-RESEARCH-REALTIME-COLLABORATION-2026-02-10.md`  
**Total Items:** 10 work items  
**Total Effort:** 60 hours (4 phases)

---

## Phase 1: Basic Presence & Broadcast (16 hours)

### Task #1: Realtime Connection Setup
**Title:** Set up Supabase Realtime client and household channels  
**Type:** Task  
**Priority:** P0 (Critical)  
**Effort:** 3 hours  
**Tags:** `realtime`, `infrastructure`, `phase-1`

**Description:**
Initialize Supabase Realtime client with proper configuration for household-based collaboration. Create channel management system with reconnection logic.

**Acceptance Criteria:**
- [ ] Supabase Realtime client initialized with household channels
- [ ] Channel naming convention: `household:{household_id}`
- [ ] Automatic reconnection on network failure (3s timeout)
- [ ] Connection status indicator in UI
- [ ] Clean disconnect on page unload

**Technical Notes:**
```javascript
const channel = supabase.channel(`household:${householdId}`, {
  config: {
    broadcast: { self: true, ack: true },
    presence: { key: userId }
  }
})
```

**Files:**
- `app/assets/js/realtime-manager.js` (new)
- `app/assets/js/main.js` (init on page load)

---

### Task #2: Presence Tracking System
**Title:** Implement user presence tracking with online status  
**Type:** Task  
**Priority:** P0 (Critical)  
**Effort:** 4 hours  
**Tags:** `realtime`, `presence`, `ui`, `phase-1`

**Description:**
Track user online status, active page, and editing state using Supabase Presence API. Display presence indicators in nav bar and page banners.

**Acceptance Criteria:**
- [ ] Track user presence with userId, name, page, editing state
- [ ] Display "X users online" badge in navigation
- [ ] Show online users dropdown with names and current pages
- [ ] Handle presence sync, join, leave events
- [ ] Update presence when user navigates between pages

**UI Components:**
- Presence badge in nav (`🟢 2 online`)
- Online users dropdown menu
- Page presence banner ("Matt is viewing Bills")

**Files:**
- `app/assets/js/realtime-manager.js` (update)
- `app/index.html` (add presence badge)
- `app/assets/css/realtime.css` (new)

---

### Task #3: Broadcast Notification System
**Title:** Implement broadcast messaging for live updates  
**Type:** Task  
**Priority:** P0 (Critical)  
**Effort:** 5 hours  
**Tags:** `realtime`, `broadcast`, `notifications`, `phase-1`

**Description:**
Build broadcast system for sending instant notifications between users. Include toast notification UI and event handling for transaction categorization, budget updates, and bill payments.

**Acceptance Criteria:**
- [ ] Broadcast transaction categorization events
- [ ] Broadcast budget limit changes
- [ ] Broadcast bill payment events
- [ ] Display toast notifications for broadcasts
- [ ] Throttle broadcast events (100ms debounce)
- [ ] Include sender info (userId, userName, timestamp)

**Event Types:**
```javascript
'transaction-categorized' // Transaction category changed
'budget-updated'          // Budget limit modified
'bill-paid'               // Bill marked as paid
'typing'                  // User typing in field
```

**Files:**
- `app/assets/js/broadcast-handler.js` (new)
- `app/assets/js/transaction-handler.js` (update)
- `app/assets/css/toast.css` (new)
- `app/index.html` (add toast container)

---

### Task #4: Presence UI Components
**Title:** Build presence badge, online users list, and page indicators  
**Type:** Task  
**Priority:** P0 (Critical)  
**Effort:** 4 hours  
**Tags:** `ui`, `presence`, `frontend`, `phase-1`

**Description:**
Create UI components for displaying user presence including nav badge, online users dropdown, and page-level presence indicators.

**Acceptance Criteria:**
- [ ] Nav presence badge component with online count
- [ ] Dropdown showing all online users with avatars
- [ ] Page presence banner ("Sarah is viewing this page")
- [ ] Responsive design (mobile/desktop)
- [ ] Match Fireside Capital brand colors

**Components:**
```html
<!-- Nav Badge -->
<div class="nav-presence">
  <span class="badge badge-success">🟢 2 online</span>
</div>

<!-- Page Banner -->
<div class="page-presence-banner">
  <span>👀 Sarah is viewing this page</span>
</div>
```

**Files:**
- `app/assets/css/presence-ui.css` (new)
- `app/index.html` (add components)
- `app/assets/js/presence-ui.js` (new)

---

## Phase 2: Live Database Sync (12 hours)

### Task #5: Postgres Changes Listeners
**Title:** Set up Postgres change listeners for real-time data sync  
**Type:** Task  
**Priority:** P0 (Critical)  
**Effort:** 4 hours  
**Tags:** `realtime`, `database`, `postgres`, `phase-2`

**Description:**
Configure Postgres changes listeners for transactions, bills, budgets, and snapshots tables. Enable real-time sync across all connected clients.

**Acceptance Criteria:**
- [ ] Listen to INSERT events on transactions, bills, budgets
- [ ] Listen to UPDATE events on all core tables
- [ ] Listen to DELETE events with proper cleanup
- [ ] Filter changes by household_id (RLS)
- [ ] Handle connection errors gracefully

**Tables to Monitor:**
- `transactions`
- `bills`
- `budgets`
- `snapshots`
- `assets`
- `investments`
- `debts`
- `income`

**Files:**
- `app/assets/js/db-sync-manager.js` (new)
- `app/assets/js/realtime-manager.js` (update)

---

### Task #6: Auto-Refresh UI on Database Changes
**Title:** Automatically update UI when database changes occur  
**Type:** Task  
**Priority:** P0 (Critical)  
**Effort:** 4 hours  
**Tags:** `realtime`, `ui`, `auto-refresh`, `phase-2`

**Description:**
Implement UI auto-refresh logic when database changes are detected. Add new transactions to dashboard, update bill statuses, refresh budget progress bars, and update net worth chart.

**Acceptance Criteria:**
- [ ] Add new transactions to dashboard without page reload
- [ ] Update bill status in bills list (paid/unpaid)
- [ ] Refresh budget progress bars on budget changes
- [ ] Update net worth chart on snapshots changes
- [ ] Visual feedback (flash animation) on updates
- [ ] No duplicate records (idempotent updates)

**Visual Feedback:**
```css
@keyframes flash-update {
  0% { background-color: #fff3cd; }
  100% { background-color: transparent; }
}
```

**Files:**
- `app/assets/js/transaction-handler.js` (update)
- `app/assets/js/bill-handler.js` (update)
- `app/assets/js/budget-handler.js` (update)
- `app/assets/js/dashboard.js` (update)

---

### Task #7: Database Triggers for Broadcast
**Title:** Create Postgres triggers to broadcast changes  
**Type:** Task  
**Priority:** P1 (High)  
**Effort:** 2 hours  
**Tags:** `database`, `postgres`, `triggers`, `phase-2`

**Description:**
Create Postgres triggers to automatically broadcast changes via realtime.broadcast_changes(). Enable selective broadcasting by household.

**Acceptance Criteria:**
- [ ] Create `notify_household_changes()` function
- [ ] Attach trigger to transactions table
- [ ] Attach trigger to bills table
- [ ] Attach trigger to budgets table
- [ ] Test trigger firing on INSERT/UPDATE/DELETE
- [ ] Verify household isolation (no cross-household leaks)

**SQL:**
```sql
CREATE OR REPLACE FUNCTION notify_household_changes()
RETURNS trigger AS $$
BEGIN
  PERFORM realtime.broadcast_changes(
    'household:' || NEW.household_id::text,
    TG_OP, TG_OP, TG_TABLE_NAME, TG_TABLE_SCHEMA,
    NEW, OLD
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER broadcast_transaction_changes
AFTER INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION notify_household_changes();
```

**Files:**
- `scripts/realtime-triggers.sql` (new)

---

### Task #8: RLS Policies for Realtime
**Title:** Create Row Level Security policies for realtime.messages  
**Type:** Task  
**Priority:** P0 (Critical — Security)  
**Effort:** 2 hours  
**Tags:** `security`, `database`, `rls`, `phase-2`

**Description:**
Create RLS policies to ensure users can only listen to their household's broadcasts. Prevent cross-household data leaks.

**Acceptance Criteria:**
- [ ] Create RLS policy on realtime.messages
- [ ] Users can only listen to `household:{their_household_id}`
- [ ] Test with multiple test accounts
- [ ] Verify no cross-household message delivery
- [ ] Document security model

**SQL:**
```sql
CREATE POLICY "household_isolation_realtime"
ON realtime.messages FOR SELECT
TO authenticated
USING (
  topic LIKE 'household:' || (
    SELECT household_id::text 
    FROM household_members 
    WHERE user_id = auth.uid()
  ) || '%'
);
```

**Files:**
- `scripts/realtime-rls-policies.sql` (new)

---

## Phase 3: Collaborative Editing (16 hours)

### Task #9: Editing Lock System
**Title:** Implement editing locks to prevent conflicting edits  
**Type:** Task  
**Priority:** P1 (High)  
**Effort:** 6 hours  
**Tags:** `realtime`, `editing`, `collaboration`, `phase-3`

**Description:**
Build editing lock system that prevents multiple users from editing the same item simultaneously. Use presence state to track who's editing what.

**Acceptance Criteria:**
- [ ] Track editing state in presence (`editing: "bill:123"`)
- [ ] Check for existing locks before allowing edit
- [ ] Show "View only" banner when item is locked
- [ ] Disable edit buttons when locked by another user
- [ ] Release lock when user navigates away
- [ ] Handle stale locks (auto-release after 30s disconnect)

**UI States:**
- ✅ **Unlocked:** "Edit" button enabled
- ⚠️ **Locked by other:** "View only — Sarah is editing"
- 🔒 **Locked by you:** "Editing... (others see view only)"

**Files:**
- `app/assets/js/editing-lock.js` (new)
- `app/assets/js/bill-handler.js` (update)
- `app/assets/js/budget-handler.js` (update)

---

### Task #10: Optimistic Updates & Conflict Resolution
**Title:** Implement optimistic UI updates with rollback on failure  
**Type:** Task  
**Priority:** P1 (High)  
**Effort:** 4 hours  
**Tags:** `realtime`, `optimistic-ui`, `ux`, `phase-3`

**Description:**
Implement optimistic updates (show changes immediately before DB save) with proper rollback on failure. Handle race conditions and conflicting edits.

**Acceptance Criteria:**
- [ ] Show changes instantly in UI (before DB save)
- [ ] Rollback UI on save failure
- [ ] Detect conflicting edits (compare timestamps)
- [ ] Show conflict resolution dialog
- [ ] Last-write-wins with notification to overwritten user

**Conflict Dialog:**
```
⚠️ This item was changed by Sarah while you were editing.

Your changes:
  Amount: $120

Sarah's changes:
  Amount: $125

[ Keep Mine ]  [ Use Sarah's ]  [ View Details ]
```

**Files:**
- `app/assets/js/optimistic-updates.js` (new)
- `app/assets/js/conflict-resolver.js` (new)

---

### Task #11: Typing Indicators
**Title:** Add typing indicators for real-time editing feedback  
**Type:** Task  
**Priority:** P2 (Medium)  
**Effort:** 2 hours  
**Tags:** `realtime`, `broadcast`, `ux`, `phase-3`

**Description:**
Show "Sarah is typing..." indicators in comment fields and note inputs. Debounce typing events to reduce broadcast frequency.

**Acceptance Criteria:**
- [ ] Broadcast typing events on input change
- [ ] Show typing indicator below input field
- [ ] Debounce to 300ms (don't spam broadcasts)
- [ ] Clear indicator after 3s of inactivity
- [ ] Support multiple simultaneous typers

**UI:**
```html
<div class="typing-indicator">
  <span class="typing-dots">●●●</span>
  <span class="typing-text">Sarah is typing...</span>
</div>
```

**Files:**
- `app/assets/js/typing-indicator.js` (new)
- `app/assets/css/typing-indicator.css` (new)

---

## Phase 4: Advanced Features (16 hours)

### Task #12: Activity Feed Widget
**Title:** Build real-time activity feed on dashboard  
**Type:** Feature  
**Priority:** P2 (Medium)  
**Effort:** 6 hours  
**Tags:** `realtime`, `dashboard`, `activity`, `phase-4`

**Description:**
Create activity feed widget that shows live updates of household actions (transactions added, bills paid, budgets changed).

**Acceptance Criteria:**
- [ ] Display last 20 activity items on dashboard
- [ ] Real-time updates when new activity occurs
- [ ] Filter by user, type, date
- [ ] "Mark all as read" functionality
- [ ] Avatar + description + timestamp per item

**Schema:**
```sql
CREATE TABLE activity_log (
  id UUID PRIMARY KEY,
  household_id UUID REFERENCES households(id),
  user_id UUID REFERENCES auth.users(id),
  action_type TEXT, -- 'create', 'update', 'delete'
  target_type TEXT, -- 'transaction', 'bill', 'budget'
  target_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Files:**
- `app/assets/js/activity-feed.js` (new)
- `app/index.html` (add widget)
- `scripts/activity-log-schema.sql` (new)

---

### Task #13: Comment System
**Title:** Implement real-time comment threads on transactions/bills  
**Type:** Feature  
**Priority:** P2 (Medium)  
**Effort:** 6 hours  
**Tags:** `realtime`, `collaboration`, `comments`, `phase-4`

**Description:**
Add comment system for collaborative discussion on transactions, bills, and budget items. Include real-time sync and typing indicators.

**Acceptance Criteria:**
- [ ] Comment thread UI on transaction/bill detail pages
- [ ] Real-time comment updates
- [ ] Typing indicators in comment box
- [ ] @mentions with notifications
- [ ] Edit/delete own comments

**Schema:**
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY,
  household_id UUID REFERENCES households(id),
  target_type TEXT, -- 'transaction', 'bill', 'budget'
  target_id UUID,
  user_id UUID REFERENCES auth.users(id),
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Files:**
- `app/assets/js/comment-system.js` (new)
- `app/assets/css/comments.css` (new)
- `scripts/comments-schema.sql` (new)

---

### Task #14: Cursor Tracking (Optional)
**Title:** Implement cursor position sync for collaborative editing  
**Type:** Feature  
**Priority:** P3 (Low — Nice to have)  
**Effort:** 4 hours  
**Tags:** `realtime`, `advanced`, `cursor`, `phase-4`

**Description:**
Track cursor positions and display other users' cursors with name labels. Only enable on hover-sensitive pages (budget editor).

**Acceptance Criteria:**
- [ ] Track cursor position in presence state
- [ ] Display other users' cursors as colored dots with labels
- [ ] Throttle cursor updates to 100ms
- [ ] Only show on specific pages (not everywhere)
- [ ] Disable by default (user preference)

**Privacy Note:**
This is an advanced feature. Many users may find cursor tracking intrusive. Make it opt-in with clear privacy notice.

**Files:**
- `app/assets/js/cursor-sync.js` (new)
- `app/assets/css/cursor-overlay.css` (new)

---

## Database Schema Updates

### Task #15: Add Household Tables
**Title:** Create households and household_members tables  
**Type:** Task  
**Priority:** P0 (Critical — Blocking)  
**Effort:** 3 hours  
**Tags:** `database`, `schema`, `households`

**Description:**
Create new tables for household management and modify existing tables to add household_id foreign keys.

**Schema:**
```sql
-- Household management
CREATE TABLE households (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  owner_id UUID REFERENCES auth.users(id)
);

-- User-household relationship
CREATE TABLE household_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'member', 'viewer'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(household_id, user_id)
);

-- Add household_id to existing tables
ALTER TABLE transactions ADD COLUMN household_id UUID REFERENCES households(id);
ALTER TABLE bills ADD COLUMN household_id UUID REFERENCES households(id);
ALTER TABLE budgets ADD COLUMN household_id UUID REFERENCES households(id);
-- (repeat for all core tables)

-- Create indexes
CREATE INDEX idx_transactions_household ON transactions(household_id);
CREATE INDEX idx_bills_household ON bills(household_id);
```

**Migration Steps:**
1. Create new tables
2. Add household_id columns to existing tables (nullable)
3. Create default household for existing users
4. Populate household_id for existing data
5. Make household_id NOT NULL
6. Create RLS policies

**Files:**
- `scripts/households-schema.sql` (new)
- `scripts/migrate-existing-data.sql` (new)

---

## Testing

### Task #16: Multi-User Integration Tests
**Title:** Write integration tests for multi-user scenarios  
**Type:** Test  
**Priority:** P1 (High)  
**Effort:** 4 hours  
**Tags:** `testing`, `integration`, `realtime`

**Description:**
Write automated tests for multi-user scenarios (presence sync, broadcast delivery, database changes).

**Test Cases:**
- [ ] Two users join same household → Both see "2 online"
- [ ] User A adds transaction → User B sees toast notification
- [ ] User A edits bill → User B sees edit lock
- [ ] User A disconnects → User B sees "1 online"
- [ ] Database update → All connected users see change
- [ ] Network failure → Auto-reconnect works

**Files:**
- `tests/realtime-integration.test.js` (new)

---

## Summary

**Total Work Items:** 16 tasks (15 implementation + 1 testing)  
**Total Effort:** 60 hours  
**Phases:** 4 (Basic Presence, Live Sync, Editing, Advanced)

**Phase Breakdown:**
- **Phase 1 (P0):** 16 hours — Basic presence + broadcasts
- **Phase 2 (P0):** 12 hours — Live database sync
- **Phase 3 (P1):** 16 hours — Collaborative editing
- **Phase 4 (P2-P3):** 16 hours — Advanced features (optional)

**Critical Path (32 hours):**
1. Realtime Connection Setup (3h)
2. Presence Tracking (4h)
3. Broadcast System (5h)
4. Presence UI (4h)
5. Postgres Changes Listeners (4h)
6. Auto-Refresh UI (4h)
7. Database Triggers (2h)
8. RLS Policies (2h)
9. Household Schema (3h)
10. Integration Tests (4h)

**Recommended First Sprint:** Phase 1 + Phase 2 (28 hours total)  
**Quick Win:** Presence badge + broadcast notifications (12 hours)  

**Dependencies:**
- Task #15 (Household Schema) must be completed first
- Phase 1 must complete before Phase 2
- Phase 2 must complete before Phase 3

**Risk Assessment:**
- 🟢 **Low Risk:** Phases 1-2 (well-documented APIs)
- 🟡 **Medium Risk:** Phase 3 (conflict resolution edge cases)
- 🔴 **High Risk:** Phase 4 (optional features, may deprioritize)

---

**Report Generated:** 2026-02-10 07:30 AM EST  
**Next Step:** Post summary to #dashboard, await directive to spawn Builder