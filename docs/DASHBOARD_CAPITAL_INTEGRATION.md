# Fireside HQ Dashboard — Capital Integration

## Investigation

**Dashboard Technology:** HTML/JavaScript frontend, Node.js backend (Express)  
**Backend:** Node.js HTTP server (server.js)  
**Gateway API Used:** `/tools/invoke` with `sessions_list` tool  
**Agent List Source:** Hardcoded in server.js (lines 109-113 for session fetches, lines 196-210 for agent roster)

### Root Cause
The dashboard only queried `fireside` and `conductor` agents from the Clawdbot gateway. Capital agent sessions existed but were never fetched or displayed.

---

## Changes Made

### 1. Agent Label Mapping
**File:** `C:\Users\chuba\fireside-hq\dashboard\server.js`  
**Lines:** 11-43  
**Change:** Added Capital's sub-agents to the `LABEL_TO_AGENT` mapping

```javascript
// Capital agent sub-agents
'builder': { name: 'Builder', role: 'Developer', emoji: '🔨' },
'auditor': { name: 'Auditor', role: 'QA & Security', emoji: '🔍' },
'architect': { name: 'Architect', role: 'System Design', emoji: '📐' },
'analyst': { name: 'Analyst', role: 'Financial Intel', emoji: '📊' },
'connector': { name: 'Connector', role: 'Integrations', emoji: '🔌' },
```

### 2. Session Queries
**File:** `C:\Users\chuba\fireside-hq\dashboard\server.js`  
**Lines:** 109-127  
**Change:** Added Capital to the parallel session fetch

```javascript
// Before:
const [fireside, conductor] = await Promise.allSettled([...])

// After:
const [fireside, conductor, capital] = await Promise.allSettled([
    invokeGatewayTool('sessions_list', { messageLimit: 1 }, 'fireside'),
    invokeGatewayTool('sessions_list', { messageLimit: 1 }, 'conductor'),
    invokeGatewayTool('sessions_list', { messageLimit: 1 }, 'capital')  // <-- Added
]);
```

### 3. Agent Roster
**File:** `C:\Users\chuba\fireside-hq\dashboard\server.js`  
**Lines:** 196-211  
**Change:** Added Capital and its sub-agents to the predefined roster

```javascript
agentMap.set('Capital', { name: 'Capital', role: 'Finance Orchestrator', status: 'idle', ... });
agentMap.set('Builder', { name: 'Builder', role: 'Developer', status: 'idle', ... });
agentMap.set('Auditor', { name: 'Auditor', role: 'QA & Security', status: 'idle', ... });
agentMap.set('Architect', { name: 'Architect', role: 'System Design', status: 'idle', ... });
agentMap.set('Analyst', { name: 'Analyst', role: 'Financial Intel', status: 'idle', ... });
agentMap.set('Connector', { name: 'Connector', role: 'Integrations', status: 'idle', ... });
```

### 4. Session Identification
**File:** `C:\Users\chuba\fireside-hq\dashboard\server.js`  
**Lines:** 176-188  
**Change:** Added Capital agent recognition in `identifyAgent()` function

```javascript
// Capital agent (finance orchestrator)
if (key.includes('agent:capital')) {
    if (key.includes(':cron:')) return null;
    return { name: 'Capital', role: 'Finance Orchestrator', emoji: '💰' };
}
```

### 5. Live Feed Transcript Reading
**File:** `C:\Users\chuba\fireside-hq\dashboard\server.js`  
**Lines:** 418-420, 476-478, 507-522  
**Change:** Added Capital sessions directory to live feed parsing

```javascript
// Added constant:
const CAPITAL_SESSIONS_DIR = 'C:\\Users\\chuba\\.clawdbot\\agents\\capital\\sessions';

// Updated directory loop:
for (const sessDir of [CONDUCTOR_SESSIONS_DIR, FIRESIDE_SESSIONS_DIR, CAPITAL_SESSIONS_DIR]) {
    const agentName = sessDir.includes('conductor') ? 'conductor' : 
                      sessDir.includes('capital') ? 'capital' : 'fireside';
    ...
}

// Added sub-agent identification in feed entries:
else if (t.includes('builder') && agentName === 'capital') agent = 'Builder';
else if (t.includes('auditor') && agentName === 'capital') agent = 'Auditor';
else if (t.includes('architect') && agentName === 'capital') agent = 'Architect';
else if (t.includes('analyst') && agentName === 'capital') agent = 'Analyst';
else if (t.includes('connector') && agentName === 'capital') agent = 'Connector';
```

### 6. Error State Default Roster
**File:** `C:\Users\chuba\fireside-hq\dashboard\server.js`  
**Lines:** 376-387  
**Change:** Added Capital to the fallback agent list used when the gateway is disconnected

```javascript
agents: [
    // ... existing agents ...
    { name: 'Capital', role: 'Finance Orchestrator', status: 'unknown', ... },
]
```

---

## Testing

**Dashboard URL:** http://localhost:3900

### Test Results

#### ✅ Capital Visible
```
Capital   Finance Orchestrator   working   3 sessions
```

#### ✅ Sub-agents Visible
```
Builder   Developer              idle      0 sessions
Auditor   QA & Security          recent    2 sessions
Architect System Design          recent    1 session
```

#### ✅ Live Feed Working
Live feed shows recent Capital and Builder activity:
```
Builder   assistant  2026-02-01T16:00:04.602Z
Builder   assistant  2026-02-01T16:00:00.247Z
Capital   assistant  2026-02-01T15:59:56.281Z
```

#### ✅ Session Count Increased
- Before: 15 agents, 21 sessions
- After: 16 agents, 47 sessions

---

## Result

**✅ Capital is now fully integrated into the Fireside HQ dashboard.**

The dashboard now:
1. Queries Capital sessions from the gateway
2. Displays Capital alongside Fireside and Conductor
3. Shows Capital's sub-agents (Builder, Auditor, Architect, Analyst, Connector)
4. Includes Capital activity in the live feed
5. Handles Capital in all error states and status calculations

No frontend changes were needed — all modifications were backend-only in `server.js`.
