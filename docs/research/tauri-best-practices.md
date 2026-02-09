# Tauri Best Practices — Fireside Ember

**Research Date:** 2026-02-08  
**Tauri Version:** 2.x  
**Application:** Personal Assistant Desktop App (Gmail/Outlook sync, Calendar, OAuth, SQLite)

---

## 1. Security Best Practices

### 1.1 Content Security Policy (CSP)

**Key Findings:**
- CSP is **critical** and only enabled if explicitly configured in `tauri.conf.json`
- Tauri automatically appends nonces and hashes to bundled code at compile time
- Local scripts are hashed, external scripts use cryptographic nonces
- Prevents XSS and injection attacks

**Recommended Configuration:**
```json
{
  "app": {
    "security": {
      "csp": {
        "default-src": "'self' customprotocol: asset:",
        "connect-src": "ipc: http://ipc.localhost https://gmail.googleapis.com https://outlook.office365.com",
        "font-src": ["https://fonts.gstatic.com"],
        "img-src": "'self' asset: http://asset.localhost blob: data:",
        "style-src": "'unsafe-inline' 'self' https://fonts.googleapis.com"
      }
    }
  }
}
```

**For SolidJS with Inline Styles:**
```json
{
  "security": {
    "dangerousDisableAssetCspModification": ["style-src"],
    "csp": {
      "default-src": "'self'",
      "style-src": "'self' 'unsafe-inline'",
      "img-src": "'self' asset:"
    }
  }
}
```

**Official Documentation:**
- https://v2.tauri.app/security/csp/
- https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP

---

### 1.2 Capabilities & Permissions System

**Key Findings:**
- Tauri 2.x uses a granular **capabilities system** to control command access
- All commands are **denied by default** unless explicitly allowed
- Commands can be restricted by platform (desktop vs mobile)
- Supports per-window/webview permissions

**Example Capability File** (`src-tauri/capabilities/main.json`):
```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "main-capability",
  "description": "Capability for the main window",
  "windows": ["main"],
  "permissions": [
    "core:path:default",
    "core:event:default",
    "core:window:default",
    "core:app:default",
    "sql:default",
    "sql:allow-execute",
    "store:default"
  ]
}
```

**In `tauri.conf.json`:**
```json
{
  "app": {
    "security": {
      "capabilities": ["main-capability"]
    }
  }
}
```

**Command-Specific Restrictions** (in `build.rs`):
```rust
const COMMANDS: &[&str] = &["sync_gmail", "sync_outlook", "save_credentials"];

fn main() {
    tauri_build::try_build(
        tauri_build::Attributes::new()
            .app_manifest(
                tauri_build::AppManifest::new()
                    .commands(COMMANDS)
            ),
    )
    .unwrap();
}
```

**Official Documentation:**
- https://v2.tauri.app/security/capabilities/
- https://v2.tauri.app/security/permissions/

---

### 1.3 Command Input Validation

**Key Findings:**
- Always validate and sanitize inputs in Rust commands
- Use strongly-typed structs with `serde::Deserialize`
- Implement custom validation logic before processing

**Example - Validated Email Sync Command:**
```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SyncRequest {
    email: String,
    max_results: Option<u32>,
}

#[derive(Debug, thiserror::Error)]
enum SyncError {
    #[error("Invalid email format")]
    InvalidEmail,
    #[error("Max results exceeds limit (max: 1000)")]
    ExcessiveResults,
    #[error(transparent)]
    ApiError(#[from] std::io::Error),
}

impl serde::Serialize for SyncError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

#[tauri::command]
async fn sync_gmail(request: SyncRequest) -> Result<Vec<Email>, SyncError> {
    // Validate email format
    if !request.email.contains('@') {
        return Err(SyncError::InvalidEmail);
    }
    
    // Validate max_results
    let max = request.max_results.unwrap_or(100);
    if max > 1000 {
        return Err(SyncError::ExcessiveResults);
    }
    
    // Proceed with sync...
    Ok(vec![])
}
```

**TypeScript Type Safety:**
```typescript
interface SyncRequest {
  email: string;
  maxResults?: number;
}

interface Email {
  id: string;
  subject: string;
  from: string;
}

async function syncGmail(request: SyncRequest): Promise<Email[]> {
  return await invoke<Email[]>('sync_gmail', request);
}
```

---

### 1.4 SQL Injection Prevention

**Key Findings:**
- Use parameterized queries with `sqlx` (Tauri SQL plugin uses sqlx)
- SQLite: Use `$1`, `$2`, etc. placeholders
- **NEVER** concatenate user input into SQL strings

**Secure Query Examples:**
```rust
// ✅ CORRECT - Parameterized query
let result = db.execute(
    "INSERT INTO emails (id, subject, body) VALUES ($1, $2, $3)",
    &[&email_id, &subject, &body]
).await?;

// ✅ CORRECT - SELECT with WHERE clause
let emails = sqlx::query_as::<_, Email>(
    "SELECT * FROM emails WHERE user_id = $1 AND read = $2"
)
.bind(user_id)
.bind(false)
.fetch_all(&pool)
.await?;

// ❌ WRONG - SQL injection vulnerable
let query = format!("SELECT * FROM emails WHERE user_id = '{}'", user_input);
db.execute(&query).await?; // NEVER DO THIS
```

**Using Tauri SQL Plugin (JavaScript):**
```typescript
import Database from '@tauri-apps/plugin-sql';

const db = await Database.load('sqlite:fireside.db');

// ✅ CORRECT - Parameterized
await db.execute(
  'INSERT INTO calendar_events (id, title, start_time) VALUES ($1, $2, $3)',
  [event.id, event.title, event.startTime]
);

// Query with parameters
const events = await db.select<Event[]>(
  'SELECT * FROM calendar_events WHERE user_id = $1 AND date >= $2',
  [userId, startDate]
);
```

**Official Documentation:**
- https://v2.tauri.app/plugin/sql/
- https://docs.rs/sqlx/latest/sqlx/

---

### 1.5 OAuth Credential Storage

**Key Findings:**
- Use OS-native credential stores (keyring-rs)
- **NEVER** store tokens in localStorage or plain files
- Encrypt database at rest with SQLCipher

**Secure Credential Storage Pattern:**
```rust
use keyring::Entry;

#[tauri::command]
async fn save_oauth_token(
    service: String, // "gmail" or "outlook"
    token: String,
) -> Result<(), String> {
    let entry = Entry::new("Fireside Ember", &service)
        .map_err(|e| e.to_string())?;
    
    entry.set_password(&token)
        .map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
async fn get_oauth_token(service: String) -> Result<String, String> {
    let entry = Entry::new("Fireside Ember", &service)
        .map_err(|e| e.to_string())?;
    
    entry.get_password()
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn delete_oauth_token(service: String) -> Result<(), String> {
    let entry = Entry::new("Fireside Ember", &service)
        .map_err(|e| e.to_string())?;
    
    entry.delete_credential()
        .map_err(|e| e.to_string())?;
    
    Ok(())
}
```

**SQLCipher Integration:**
```rust
use sqlx::sqlite::SqliteConnectOptions;

async fn create_encrypted_db() -> Result<SqlitePool> {
    let key = get_encryption_key()?; // Derive from OS keyring or hardware-backed key
    
    let options = SqliteConnectOptions::new()
        .filename("fireside.db")
        .pragma("key", key)
        .pragma("cipher_page_size", "4096")
        .create_if_missing(true);
    
    SqlitePool::connect_with(options).await
}
```

**Official Documentation:**
- https://docs.rs/keyring/latest/keyring/
- https://www.zetetic.net/sqlcipher/

---

### 1.6 API Key Management

**Key Findings:**
- Use environment variables for API keys during development
- Store production keys in OS credential store
- Rotate keys regularly

**Development Pattern:**
```rust
// src-tauri/.env
GMAIL_CLIENT_ID=your-dev-client-id
GMAIL_CLIENT_SECRET=your-dev-secret

// In Rust code
use std::env;

fn get_gmail_credentials() -> Result<(String, String), String> {
    #[cfg(dev)]
    {
        // Development: use .env
        let client_id = env::var("GMAIL_CLIENT_ID")
            .map_err(|_| "Missing GMAIL_CLIENT_ID")?;
        let client_secret = env::var("GMAIL_CLIENT_SECRET")
            .map_err(|_| "Missing GMAIL_CLIENT_SECRET")?;
        Ok((client_id, client_secret))
    }
    
    #[cfg(not(dev))]
    {
        // Production: use OS keyring
        let entry = Entry::new("Fireside Ember", "gmail_api_keys")?;
        let json = entry.get_password()?;
        let creds: ApiCredentials = serde_json::from_str(&json)?;
        Ok((creds.client_id, creds.client_secret))
    }
}
```

---

## 2. Performance Optimization

### 2.1 Efficient Command Communication (Frontend ↔ Backend)

**Key Findings:**
- IPC uses asynchronous message passing (similar to HTTP)
- Serialize/deserialize costs can add up with large payloads
- Use `tauri::ipc::Response` for binary data (avoids JSON serialization)
- Batch operations when possible

**Optimized Patterns:**

**1. Use Binary Response for Large Data:**
```rust
use tauri::ipc::Response;

#[tauri::command]
async fn download_attachment(email_id: String) -> Result<Response, String> {
    let data = fetch_attachment_bytes(&email_id).await?;
    Ok(Response::new(data)) // Returns ArrayBuffer to frontend
}
```

**2. Streaming with Channels:**
```rust
use tauri::ipc::Channel;

#[tauri::command]
async fn sync_emails_stream(
    user_id: String,
    on_progress: Channel<SyncProgress>,
) -> Result<(), String> {
    let total = get_email_count(&user_id).await?;
    
    for (i, email) in fetch_emails(&user_id).enumerate() {
        process_email(email).await?;
        
        // Stream progress updates
        on_progress.send(SyncProgress {
            current: i + 1,
            total,
            message: format!("Synced {} of {}", i + 1, total),
        }).ok();
    }
    
    Ok(())
}
```

**Frontend:**
```typescript
import { invoke, Channel } from '@tauri-apps/api/core';

interface SyncProgress {
  current: number;
  total: number;
  message: string;
}

async function syncEmailsWithProgress() {
  const onProgress = new Channel<SyncProgress>();
  
  onProgress.onmessage = (progress) => {
    console.log(`${progress.current}/${progress.total}: ${progress.message}`);
    updateProgressBar(progress.current / progress.total);
  };
  
  await invoke('sync_emails_stream', {
    userId: 'user123',
    onProgress,
  });
}
```

**3. Batch Operations:**
```rust
#[tauri::command]
async fn batch_mark_read(email_ids: Vec<String>) -> Result<u32, String> {
    // Process in batch instead of individual calls
    let count = sqlx::query!(
        "UPDATE emails SET read = true WHERE id = ANY($1)",
        &email_ids
    )
    .execute(&pool)
    .await?
    .rows_affected();
    
    Ok(count as u32)
}
```

**Official Documentation:**
- https://v2.tauri.app/concept/inter-process-communication/
- https://v2.tauri.app/develop/calling-rust/

---

### 2.2 Background Task Patterns (Tokio)

**Key Findings:**
- Use `tokio::spawn` for CPU-bound tasks
- Use `tokio::task::spawn_blocking` for blocking I/O
- Manage long-running tasks with cancellation tokens
- Avoid spawning unbounded tasks

**Pattern 1: Background Email Sync Task**
```rust
use tokio::sync::RwLock;
use tokio_util::sync::CancellationToken;
use std::sync::Arc;

pub struct SyncManager {
    cancel_token: CancellationToken,
    running: Arc<RwLock<bool>>,
}

impl SyncManager {
    pub fn new() -> Self {
        Self {
            cancel_token: CancellationToken::new(),
            running: Arc::new(RwLock::new(false)),
        }
    }
    
    pub async fn start_background_sync(
        &self,
        interval_secs: u64,
        app_handle: tauri::AppHandle,
    ) {
        let cancel = self.cancel_token.clone();
        let running = self.running.clone();
        
        tokio::spawn(async move {
            let mut interval = tokio::time::interval(
                Duration::from_secs(interval_secs)
            );
            
            *running.write().await = true;
            
            loop {
                tokio::select! {
                    _ = cancel.cancelled() => {
                        *running.write().await = false;
                        break;
                    }
                    _ = interval.tick() => {
                        if let Err(e) = sync_all_accounts(&app_handle).await {
                            eprintln!("Sync error: {}", e);
                            app_handle.emit("sync-error", e.to_string()).ok();
                        }
                    }
                }
            }
        });
    }
    
    pub fn stop_sync(&self) {
        self.cancel_token.cancel();
    }
}

#[tauri::command]
async fn start_sync(
    state: tauri::State<'_, SyncManager>,
    app_handle: tauri::AppHandle,
) -> Result<(), String> {
    state.start_background_sync(300, app_handle).await; // Every 5 minutes
    Ok(())
}

#[tauri::command]
async fn stop_sync(state: tauri::State<'_, SyncManager>) -> Result<(), String> {
    state.stop_sync();
    Ok(())
}
```

**Pattern 2: CPU-Intensive Operations**
```rust
#[tauri::command]
async fn parse_large_email_batch(emails: Vec<RawEmail>) -> Result<Vec<Email>, String> {
    // Offload to thread pool to avoid blocking tokio runtime
    tokio::task::spawn_blocking(move || {
        emails.into_par_iter() // rayon parallel iterator
            .map(|raw| parse_email(raw))
            .collect::<Result<Vec<_>, _>>()
    })
    .await
    .map_err(|e| e.to_string())?
}
```

**Pattern 3: Rate-Limited API Calls**
```rust
use governor::{Quota, RateLimiter};
use std::num::NonZeroU32;

pub struct ApiRateLimiter {
    limiter: RateLimiter<
        governor::state::direct::NotKeyed,
        governor::state::InMemoryState,
        governor::clock::DefaultClock,
    >,
}

impl ApiRateLimiter {
    pub fn new(requests_per_second: u32) -> Self {
        let quota = Quota::per_second(NonZeroU32::new(requests_per_second).unwrap());
        Self {
            limiter: RateLimiter::direct(quota),
        }
    }
    
    pub async fn wait_for_slot(&self) {
        self.limiter.until_ready().await;
    }
}

#[tauri::command]
async fn fetch_gmail_messages(
    state: tauri::State<'_, ApiRateLimiter>,
) -> Result<Vec<Message>, String> {
    state.wait_for_slot().await; // Rate limit
    
    // Make API call...
    Ok(vec![])
}
```

**Official Documentation:**
- https://docs.rs/tokio/latest/tokio/
- https://tokio.rs/tokio/tutorial

---

### 2.3 Database Connection Pooling

**Key Findings:**
- Use `sqlx::Pool` for connection pooling
- Configure pool size based on workload
- Reuse connections across commands via Tauri state

**Optimal Pool Configuration:**
```rust
use sqlx::sqlite::{SqlitePool, SqlitePoolOptions};
use std::time::Duration;

pub async fn create_db_pool() -> Result<SqlitePool, sqlx::Error> {
    SqlitePoolOptions::new()
        .max_connections(5) // Desktop app: 5 connections sufficient
        .min_connections(1)
        .acquire_timeout(Duration::from_secs(5))
        .idle_timeout(Duration::from_secs(300))
        .max_lifetime(Duration::from_secs(1800))
        .connect("sqlite:fireside.db?mode=rwc")
        .await
}

// In main.rs
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let pool = tauri::async_runtime::block_on(create_db_pool())
                .expect("Failed to create DB pool");
            
            app.manage(pool);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            save_email,
            get_emails,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
async fn save_email(
    email: Email,
    pool: tauri::State<'_, SqlitePool>,
) -> Result<(), String> {
    sqlx::query!(
        "INSERT INTO emails (id, subject, body) VALUES (?, ?, ?)",
        email.id,
        email.subject,
        email.body
    )
    .execute(pool.inner())
    .await
    .map_err(|e| e.to_string())?;
    
    Ok(())
}
```

---

### 2.4 Memory Management for Long-Running Processes

**Key Findings:**
- Avoid memory leaks in background tasks
- Use weak references for app handles in spawned tasks
- Drop large data structures when no longer needed
- Monitor memory usage in production

**Pattern: Proper Resource Cleanup**
```rust
use std::sync::Weak;

pub struct BackgroundService {
    app_handle: Weak<tauri::AppHandle>,
}

impl BackgroundService {
    pub fn new(app_handle: &tauri::AppHandle) -> Self {
        Self {
            app_handle: Arc::downgrade(app_handle),
        }
    }
    
    pub async fn start(&self) {
        tokio::spawn(async move {
            loop {
                // Check if app is still alive
                let Some(app) = self.app_handle.upgrade() else {
                    // App dropped, exit task
                    break;
                };
                
                // Do work...
                
                tokio::time::sleep(Duration::from_secs(60)).await;
            }
        });
    }
}
```

**Memory-Efficient Event Processing:**
```rust
#[tauri::command]
async fn process_large_dataset() -> Result<(), String> {
    // Use iterators instead of loading everything into memory
    let file = File::open("large_export.json")?;
    let reader = BufReader::new(file);
    
    for line in reader.lines() {
        let item: Item = serde_json::from_str(&line?)?;
        process_item(item).await?;
        // item is dropped here, memory freed
    }
    
    Ok(())
}
```

---

### 2.5 Frontend State Management with Frequent Updates

**Key Findings:**
- SolidJS has fine-grained reactivity (efficient for frequent updates)
- Use stores for shared state
- Batch UI updates where possible
- Debounce/throttle high-frequency events

**SolidJS State Pattern for Email Sync:**
```typescript
import { createSignal, createEffect, batch } from 'solid-js';
import { createStore } from 'solid-js/store';
import { invoke, Channel } from '@tauri-apps/api/core';

interface Email {
  id: string;
  subject: string;
  read: boolean;
}

interface SyncState {
  syncing: boolean;
  progress: number;
  emails: Email[];
  error: string | null;
}

export function useEmailSync() {
  const [state, setState] = createStore<SyncState>({
    syncing: false,
    progress: 0,
    emails: [],
    error: null,
  });
  
  async function startSync() {
    const progressChannel = new Channel<SyncProgress>();
    
    progressChannel.onmessage = (progress) => {
      // Batch state updates
      batch(() => {
        setState('syncing', true);
        setState('progress', progress.current / progress.total);
      });
    };
    
    try {
      await invoke('sync_emails_stream', { progressChannel });
      
      // Load updated emails
      const emails = await invoke<Email[]>('get_emails');
      
      batch(() => {
        setState('syncing', false);
        setState('progress', 1);
        setState('emails', emails);
      });
    } catch (error) {
      batch(() => {
        setState('syncing', false);
        setState('error', String(error));
      });
    }
  }
  
  return { state, startSync };
}
```

**Debounced Search:**
```typescript
import { createSignal } from 'solid-js';
import { debounce } from '@solid-primitives/scheduled';

export function EmailSearch() {
  const [query, setQuery] = createSignal('');
  const [results, setResults] = createSignal<Email[]>([]);
  
  const searchEmails = debounce(async (q: string) => {
    if (q.length < 3) return;
    
    const emails = await invoke<Email[]>('search_emails', { query: q });
    setResults(emails);
  }, 300); // 300ms debounce
  
  return (
    <input
      type="text"
      onInput={(e) => {
        setQuery(e.currentTarget.value);
        searchEmails(e.currentTarget.value);
      }}
    />
  );
}
```

---

## 3. Error Handling & Resilience

### 3.1 Error Propagation Patterns (Rust → TypeScript)

**Key Findings:**
- Create custom error types implementing `serde::Serialize`
- Use `thiserror` for ergonomic error definitions
- Return structured error objects (not just strings)
- Map errors to TypeScript enums for type safety

**Comprehensive Error Pattern:**
```rust
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),
    
    #[error("OAuth error: {0}")]
    OAuth(String),
    
    #[error("Network error: {0}")]
    Network(#[from] reqwest::Error),
    
    #[error("Invalid email format")]
    InvalidEmail,
    
    #[error("Rate limit exceeded. Try again in {retry_after} seconds")]
    RateLimit { retry_after: u64 },
    
    #[error("Authentication failed")]
    Unauthorized,
}

#[derive(serde::Serialize)]
#[serde(tag = "kind", content = "data")]
#[serde(rename_all = "camelCase")]
pub enum SerializedError {
    Database { message: String },
    OAuth { message: String },
    Network { message: String },
    InvalidEmail,
    RateLimit { retryAfter: u64 },
    Unauthorized,
}

impl serde::Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        let error = match self {
            AppError::Database(e) => SerializedError::Database {
                message: e.to_string(),
            },
            AppError::OAuth(e) => SerializedError::OAuth {
                message: e.clone(),
            },
            AppError::Network(e) => SerializedError::Network {
                message: e.to_string(),
            },
            AppError::InvalidEmail => SerializedError::InvalidEmail,
            AppError::RateLimit { retry_after } => SerializedError::RateLimit {
                retryAfter: *retry_after,
            },
            AppError::Unauthorized => SerializedError::Unauthorized,
        };
        
        error.serialize(serializer)
    }
}

#[tauri::command]
async fn sync_gmail() -> Result<Vec<Email>, AppError> {
    let token = get_oauth_token("gmail")
        .await
        .map_err(|e| AppError::OAuth(e))?;
    
    let emails = fetch_emails(&token).await?; // Auto-converts network errors
    
    Ok(emails)
}
```

**TypeScript Error Handling:**
```typescript
interface AppError {
  kind: 'database' | 'oauth' | 'network' | 'invalidEmail' | 'rateLimit' | 'unauthorized';
  data?: {
    message?: string;
    retryAfter?: number;
  };
}

async function syncGmail(): Promise<Email[]> {
  try {
    return await invoke<Email[]>('sync_gmail');
  } catch (error) {
    const appError = error as AppError;
    
    switch (appError.kind) {
      case 'rateLimit':
        showNotification(`Rate limited. Retry in ${appError.data?.retryAfter}s`);
        break;
      case 'unauthorized':
        redirectToOAuthFlow();
        break;
      case 'network':
        showNotification('Network error. Check your connection.');
        break;
      default:
        showNotification(`Error: ${appError.data?.message || 'Unknown error'}`);
    }
    
    throw error;
  }
}
```

---

### 3.2 Graceful Degradation Strategies

**Key Findings:**
- Provide offline functionality when possible
- Cache data locally for offline access
- Show meaningful error states in UI
- Implement fallback mechanisms

**Offline-First Pattern:**
```rust
#[tauri::command]
async fn get_emails(
    pool: tauri::State<'_, SqlitePool>,
    force_sync: bool,
) -> Result<Vec<Email>, AppError> {
    if force_sync {
        // Try to sync from server
        match sync_from_server().await {
            Ok(emails) => {
                // Save to local DB
                save_emails_to_db(&pool, &emails).await?;
                return Ok(emails);
            }
            Err(e) => {
                eprintln!("Sync failed, falling back to cache: {}", e);
                // Fall through to cached data
            }
        }
    }
    
    // Return cached data
    get_emails_from_db(&pool).await
}
```

**Frontend Degradation:**
```typescript
export function EmailList() {
  const [emails, setEmails] = createSignal<Email[]>([]);
  const [isOnline, setIsOnline] = createSignal(true);
  
  async function loadEmails(forceSync = false) {
    try {
      const data = await invoke<Email[]>('get_emails', { forceSync });
      setEmails(data);
      setIsOnline(true);
    } catch (error) {
      setIsOnline(false);
      // Show cached data with offline indicator
    }
  }
  
  return (
    <div>
      {!isOnline() && (
        <div class="offline-banner">
          You're offline. Showing cached emails.
        </div>
      )}
      <For each={emails()}>
        {(email) => <EmailItem email={email} />}
      </For>
    </div>
  );
}
```

---

### 3.3 Retry Logic for Network Operations

**Key Findings:**
- Implement exponential backoff for retries
- Use `reqwest-retry` middleware
- Limit retry attempts to avoid infinite loops

**Retry Pattern with Exponential Backoff:**
```rust
use reqwest_middleware::{ClientBuilder, ClientWithMiddleware};
use reqwest_retry::{RetryTransientMiddleware, policies::ExponentialBackoff};

pub fn create_http_client() -> ClientWithMiddleware {
    let retry_policy = ExponentialBackoff::builder()
        .build_with_max_retries(3);
    
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(30))
        .build()
        .unwrap();
    
    ClientBuilder::new(client)
        .with(RetryTransientMiddleware::new_with_policy(retry_policy))
        .build()
}

#[tauri::command]
async fn fetch_gmail_messages(
    client: tauri::State<'_, ClientWithMiddleware>,
) -> Result<Vec<Message>, AppError> {
    let response = client
        .get("https://gmail.googleapis.com/gmail/v1/users/me/messages")
        .send()
        .await?; // Automatically retries on transient errors
    
    let messages = response.json().await?;
    Ok(messages)
}
```

**Manual Retry with Backoff:**
```rust
use tokio::time::{sleep, Duration};

async fn retry_with_backoff<F, Fut, T, E>(
    mut f: F,
    max_retries: u32,
) -> Result<T, E>
where
    F: FnMut() -> Fut,
    Fut: std::future::Future<Output = Result<T, E>>,
{
    let mut attempt = 0;
    
    loop {
        match f().await {
            Ok(result) => return Ok(result),
            Err(e) if attempt >= max_retries => return Err(e),
            Err(_) => {
                attempt += 1;
                let backoff = Duration::from_secs(2_u64.pow(attempt));
                sleep(backoff).await;
            }
        }
    }
}

#[tauri::command]
async fn sync_with_retry() -> Result<(), String> {
    retry_with_backoff(|| async {
        sync_emails().await
    }, 3).await
}
```

---

### 3.4 Crash Recovery Mechanisms

**Key Findings:**
- Save application state periodically
- Implement crash handlers
- Use SQLite transactions for atomic operations
- Log errors for debugging

**State Persistence Pattern:**
```rust
use tauri_plugin_store::StoreExt;

#[tauri::command]
async fn save_app_state(
    app: tauri::AppHandle,
    state: AppState,
) -> Result<(), String> {
    let store = app.store("state.json")
        .map_err(|e| e.to_string())?;
    
    store.set("last_sync", serde_json::to_value(&state.last_sync)?)
        .map_err(|e| e.to_string())?;
    
    store.set("active_account", serde_json::to_value(&state.active_account)?)
        .map_err(|e| e.to_string())?;
    
    store.save().await
        .map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
async fn recover_state(app: tauri::AppHandle) -> Result<AppState, String> {
    let store = app.store("state.json")
        .map_err(|e| e.to_string())?;
    
    let last_sync = store.get("last_sync")
        .and_then(|v| serde_json::from_value(v).ok());
    
    let active_account = store.get("active_account")
        .and_then(|v| serde_json::from_value(v).ok());
    
    Ok(AppState {
        last_sync,
        active_account,
    })
}
```

**Transaction Safety:**
```rust
#[tauri::command]
async fn batch_update_emails(
    pool: tauri::State<'_, SqlitePool>,
    updates: Vec<EmailUpdate>,
) -> Result<(), String> {
    let mut tx = pool.begin()
        .await
        .map_err(|e| e.to_string())?;
    
    for update in updates {
        sqlx::query!(
            "UPDATE emails SET read = ? WHERE id = ?",
            update.read,
            update.id
        )
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;
    }
    
    // Atomic: all or nothing
    tx.commit()
        .await
        .map_err(|e| e.to_string())?;
    
    Ok(())
}
```

---

## 4. Build & Distribution

### 4.1 Binary Optimization (Release Builds)

**Key Findings:**
- Enable LTO (Link Time Optimization)
- Strip debug symbols
- Optimize for size or speed depending on use case
- Use `cargo-bloat` to analyze binary size

**Optimal `Cargo.toml` Configuration:**
```toml
[profile.release]
opt-level = "z"          # Optimize for size
lto = true               # Enable Link Time Optimization
codegen-units = 1        # Better optimization, slower build
panic = "abort"          # Reduce binary size
strip = true             # Strip debug symbols

# Alternative: Optimize for speed
[profile.release-speed]
inherits = "release"
opt-level = 3            # Maximum optimization
lto = "thin"             # Faster than full LTO

# For debugging release builds
[profile.release-debug]
inherits = "release"
strip = false
debug = true
```

**Reduce Dependencies:**
```toml
# Use features to include only what you need
[dependencies]
tokio = { version = "1", features = ["rt-multi-thread", "macros", "time"] }
# Don't include unused features like "full"

# Use default-features = false when possible
reqwest = { version = "0.11", default-features = false, features = ["json", "rustls-tls"] }
```

**Build Command:**
```bash
# Standard release build
cargo tauri build

# With custom profile
cargo tauri build --profile release-speed

# Analyze binary size
cargo install cargo-bloat
cargo bloat --release --crates
```

---

### 4.2 Code Signing (Windows/macOS)

**Key Findings:**
- Required for macOS (Apple notarization)
- Recommended for Windows (SmartScreen bypass)
- Store certificates securely
- Automate signing in CI/CD

**macOS Code Signing:**
```json
// tauri.conf.json
{
  "bundle": {
    "macOS": {
      "signingIdentity": "Developer ID Application: Your Name (TEAM_ID)",
      "entitlements": "entitlements.plist",
      "hardenedRuntime": true,
      "providerShortName": "TEAM_ID"
    }
  }
}
```

**entitlements.plist:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
  <true/>
  <key>com.apple.security.network.client</key>
  <true/>
  <key>com.apple.security.files.user-selected.read-write</key>
  <true/>
</dict>
</plist>
```

**Notarization Script:**
```bash
#!/bin/bash
# notarize.sh

APP_PATH="./target/release/bundle/macos/Fireside Ember.app"
ZIP_PATH="./target/release/bundle/macos/Fireside Ember.zip"

# Create zip for notarization
ditto -c -k --keepParent "$APP_PATH" "$ZIP_PATH"

# Upload for notarization
xcrun notarytool submit "$ZIP_PATH" \
  --apple-id "$APPLE_ID" \
  --password "$APPLE_APP_SPECIFIC_PASSWORD" \
  --team-id "$TEAM_ID" \
  --wait

# Staple notarization ticket
xcrun stapler staple "$APP_PATH"
```

**Windows Code Signing:**
```json
// tauri.conf.json
{
  "bundle": {
    "windows": {
      "certificateThumbprint": "YOUR_CERT_THUMBPRINT",
      "digestAlgorithm": "sha256",
      "timestampUrl": "http://timestamp.digicert.com"
    }
  }
}
```

**Official Documentation:**
- https://v2.tauri.app/distribute/sign/macos/
- https://v2.tauri.app/distribute/sign/windows/

---

### 4.3 Auto-Update Patterns (tauri-plugin-updater)

**Key Findings:**
- Updater plugin supports seamless background updates
- Requires code signing
- Supports custom update servers
- Can check for updates on app startup or on-demand

**Setup Updater:**
```bash
npm run tauri add updater
```

**Configuration:**
```json
// tauri.conf.json
{
  "bundle": {
    "createUpdaterArtifacts": true
  },
  "plugins": {
    "updater": {
      "endpoints": [
        "https://updates.firesideember.com/{{target}}/{{current_version}}"
      ],
      "pubkey": "YOUR_PUBLIC_KEY_HERE"
    }
  }
}
```

**Generate Key Pair:**
```bash
npm run tauri signer generate -- -w ~/.tauri/fireside-ember.key
```

**Updater Implementation:**
```rust
use tauri_plugin_updater::UpdaterExt;

#[tauri::command]
async fn check_for_updates(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let updater = app.updater_builder()
        .build()
        .map_err(|e| e.to_string())?;
    
    match updater.check().await {
        Ok(Some(update)) => {
            let version = update.version.clone();
            
            // Download and install in background
            update.download_and_install(|chunk, total| {
                println!("Downloaded {} of {:?}", chunk, total);
            })
            .await
            .map_err(|e| e.to_string())?;
            
            Ok(Some(version))
        }
        Ok(None) => Ok(None), // No update available
        Err(e) => Err(e.to_string()),
    }
}
```

**Frontend:**
```typescript
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

async function checkForUpdates() {
  const update = await check();
  
  if (update?.available) {
    console.log(`Update to ${update.version} available`);
    
    // Download and install
    await update.downloadAndInstall((progress) => {
      console.log(`Downloaded ${progress.downloaded} of ${progress.total}`);
    });
    
    // Prompt user to restart
    const shouldRelaunch = confirm('Update installed. Restart now?');
    if (shouldRelaunch) {
      await relaunch();
    }
  }
}
```

**Update Server Endpoint Format:**
```json
// Response from https://updates.firesideember.com/windows-x86_64/1.0.0
{
  "version": "1.0.1",
  "notes": "Bug fixes and performance improvements",
  "pub_date": "2026-02-08T12:00:00Z",
  "platforms": {
    "windows-x86_64": {
      "signature": "SIGNATURE_HERE",
      "url": "https://updates.firesideember.com/downloads/Fireside-Ember_1.0.1_x64.msi"
    }
  }
}
```

**Official Documentation:**
- https://v2.tauri.app/plugin/updater/

---

### 4.4 Installer Best Practices

**Key Findings:**
- Use NSIS for Windows (supports silent install, custom branding)
- DMG for macOS (with background image and layout)
- AppImage for Linux (portable, no installation required)
- Configure file associations if needed

**Windows (NSIS) Configuration:**
```json
// tauri.conf.json
{
  "bundle": {
    "windows": {
      "nsis": {
        "installMode": "perMachine",
        "languages": ["English"],
        "displayLanguageSelector": false,
        "installerIcon": "icons/installer.ico",
        "headerImage": "icons/nsis-header.bmp",
        "sidebarImage": "icons/nsis-sidebar.bmp",
        "license": "LICENSE.rtf"
      }
    }
  }
}
```

**macOS (DMG) Configuration:**
```json
{
  "bundle": {
    "macOS": {
      "dmg": {
        "background": "icons/dmg-background.png",
        "windowSize": {
          "width": 660,
          "height": 400
        },
        "appPosition": {
          "x": 180,
          "y": 170
        },
        "applicationFolderPosition": {
          "x": 480,
          "y": 170
        }
      }
    }
  }
}
```

**File Associations:**
```json
{
  "bundle": {
    "fileAssociations": [
      {
        "ext": ["ember"],
        "description": "Fireside Ember Project",
        "mimeType": "application/x-fireside-ember",
        "role": "Editor"
      }
    ]
  }
}
```

---

## 5. Developer Experience

### 5.1 Testing Strategies

**Key Findings:**
- Unit tests for Rust commands
- Integration tests with mock runtime
- E2E tests with WebDriver
- Use `tauri-plugin-test` for Tauri-specific testing

**Unit Tests (Rust):**
```rust
// src-tauri/src/commands.rs
#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_validate_email() {
        assert!(validate_email("user@example.com").is_ok());
        assert!(validate_email("invalid").is_err());
    }
    
    #[tokio::test]
    async fn test_fetch_emails() {
        let mock_client = create_mock_http_client();
        let emails = fetch_emails_impl(mock_client).await.unwrap();
        assert_eq!(emails.len(), 5);
    }
}
```

**Mock Tauri Runtime:**
```rust
#[cfg(test)]
mod tests {
    use tauri::test::{mock_builder, mock_context};
    
    #[test]
    fn test_command_with_state() {
        let app = mock_builder()
            .manage(MockState::default())
            .build(mock_context())
            .expect("failed to build app");
        
        let result = tauri::test::get_ipc_response(
            &app,
            "my_command",
            serde_json::json!({ "arg": "value" }),
        );
        
        assert!(result.is_ok());
    }
}
```

**Integration Tests:**
```rust
// tests/integration.rs
use fireside_ember::commands::*;

#[tokio::test]
async fn test_email_sync_workflow() {
    // Setup test database
    let pool = setup_test_db().await;
    
    // Sync emails
    sync_emails(&pool).await.unwrap();
    
    // Verify emails saved
    let emails = get_emails(&pool).await.unwrap();
    assert!(!emails.is_empty());
    
    // Cleanup
    cleanup_test_db().await;
}
```

**E2E Tests with WebDriver:**
```typescript
// tests/e2e/email-sync.spec.ts
import { test, expect } from '@playwright/test';

test('email sync workflow', async ({ page }) => {
  await page.goto('http://localhost:1420');
  
  // Click sync button
  await page.click('[data-testid="sync-button"]');
  
  // Wait for sync to complete
  await expect(page.locator('[data-testid="sync-status"]'))
    .toHaveText('Sync complete');
  
  // Verify emails displayed
  const emailCount = await page.locator('[data-testid="email-item"]').count();
  expect(emailCount).toBeGreaterThan(0);
});
```

**Official Documentation:**
- https://v2.tauri.app/develop/tests/
- https://v2.tauri.app/develop/tests/mocking/
- https://v2.tauri.app/develop/tests/webdriver/

---

### 5.2 Debugging Tools

**Key Findings:**
- DevTools available in development
- Use `RUST_BACKTRACE=1` for detailed error traces
- `tauri dev` supports hot reload
- VS Code and JetBrains IDEs have Tauri debugging support

**Enable DevTools:**
```rust
// In development builds, DevTools open automatically
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

**Logging Pattern:**
```rust
use tracing::{info, warn, error, debug};
use tracing_subscriber;

fn setup_logging() {
    tracing_subscriber::fmt()
        .with_max_level(if cfg!(debug_assertions) {
            tracing::Level::DEBUG
        } else {
            tracing::Level::INFO
        })
        .init();
}

#[tauri::command]
async fn sync_emails() -> Result<(), String> {
    info!("Starting email sync");
    
    match fetch_emails().await {
        Ok(emails) => {
            info!("Fetched {} emails", emails.len());
            Ok(())
        }
        Err(e) => {
            error!("Sync failed: {}", e);
            Err(e.to_string())
        }
    }
}
```

**VS Code Launch Configuration:**
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "lldb",
      "request": "launch",
      "name": "Tauri Development Debug",
      "cargo": {
        "args": [
          "build",
          "--manifest-path=./src-tauri/Cargo.toml",
          "--no-default-features"
        ]
      },
      "cwd": "${workspaceFolder}"
    }
  ]
}
```

**Official Documentation:**
- https://v2.tauri.app/develop/debug/
- https://v2.tauri.app/develop/debug/vscode/

---

### 5.3 Hot Reload Optimization

**Key Findings:**
- `tauri dev` watches for file changes
- Frontend hot reload via Vite (fast)
- Rust changes require recompilation (slower)
- Use feature flags to speed up dev builds

**Optimize Dev Build Time:**
```toml
# Cargo.toml
[profile.dev]
opt-level = 1  # Some optimization for faster execution
```

**Incremental Compilation:**
```bash
# ~/.cargo/config.toml
[build]
incremental = true
```

**Conditional Features:**
```toml
[features]
default = ["custom-protocol"]
dev = []

[dependencies]
# Heavy dependencies only in release
heavy-lib = { version = "1.0", optional = true }

[target.'cfg(not(dev))'.dependencies]
heavy-lib = "1.0"
```

---

### 5.4 CI/CD Patterns for Tauri Apps

**Key Findings:**
- Use `tauri-action` for GitHub Actions
- Matrix builds for multi-platform
- Automated testing before release
- Automated signing and deployment

**GitHub Actions Workflow:**
```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    strategy:
      matrix:
        platform: [macos-latest, ubuntu-latest, windows-latest]
    
    runs-on: ${{ matrix.platform }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install Rust
        uses: dtolnay/rust-toolchain@stable
      
      - name: Install dependencies (Ubuntu only)
        if: matrix.platform == 'ubuntu-latest'
        run: |
          sudo apt-get update
          sudo apt-get install -y libwebkit2gtk-4.1-dev \
            build-essential curl wget file libssl-dev \
            libayatana-appindicator3-dev librsvg2-dev
      
      - name: Install frontend dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test
      
      - name: Build and release
        uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          TAURI_SIGNING_PRIVATE_KEY: ${{ secrets.TAURI_PRIVATE_KEY }}
          TAURI_SIGNING_PRIVATE_KEY_PASSWORD: ${{ secrets.TAURI_KEY_PASSWORD }}
          APPLE_CERTIFICATE: ${{ secrets.APPLE_CERTIFICATE }}
          APPLE_CERTIFICATE_PASSWORD: ${{ secrets.APPLE_CERTIFICATE_PASSWORD }}
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
        with:
          tagName: ${{ github.ref_name }}
          releaseName: 'Fireside Ember ${{ github.ref_name }}'
          releaseBody: 'See CHANGELOG.md for details'
          releaseDraft: true
          prerelease: false
```

**Official Documentation:**
- https://v2.tauri.app/develop/tests/continuous-integration/
- https://github.com/tauri-apps/tauri-action

---

## 6. Current Implementation Audit

Based on the research, here are **gaps** in your current architecture:

### 6.1 Security Gaps

| Issue | Current State | Required State | Priority |
|-------|---------------|----------------|----------|
| **CSP Configuration** | Not mentioned | Must configure strict CSP | **P0** |
| **Capabilities System** | Not implemented | Define granular permissions | **P0** |
| **Input Validation** | Unknown | Validate all command inputs | **P0** |
| **OAuth Token Storage** | "OS credential store (keyring)" ✅ | Already correct | ✅ |
| **SQLCipher Setup** | Mentioned but not configured | Configure encryption key management | **P0** |

### 6.2 Performance Gaps

| Issue | Current State | Required State | Priority |
|-------|---------------|----------------|----------|
| **Connection Pooling** | Not mentioned | Implement `SqlitePool` | **P1** |
| **Background Tasks** | "tokio async runtime" mentioned | Add cancellation tokens & proper lifecycle | **P1** |
| **IPC Optimization** | Not optimized | Use `Response` for binary data, channels for streaming | **P1** |
| **Rate Limiting** | Not implemented | Add rate limiters for Gmail/Outlook APIs | **P1** |

### 6.3 Error Handling Gaps

| Issue | Current State | Required State | Priority |
|-------|---------------|----------------|----------|
| **Custom Error Types** | Unknown | Implement structured errors with `thiserror` | **P1** |
| **Retry Logic** | Not implemented | Add exponential backoff for network calls | **P1** |
| **Crash Recovery** | Not implemented | Persist state with `tauri-plugin-store` | **P2** |

### 6.4 Build & Distribution Gaps

| Issue | Current State | Required State | Priority |
|-------|---------------|----------------|----------|
| **Code Signing** | Not configured | Set up for Windows & macOS | **P0** (for distribution) |
| **Auto-Updater** | Not implemented | Implement `tauri-plugin-updater` | **P2** |
| **Binary Optimization** | Default settings | Configure LTO & size optimization | **P2** |

### 6.5 Developer Experience Gaps

| Issue | Current State | Required State | Priority |
|-------|---------------|----------------|----------|
| **Testing** | No tests mentioned | Add unit, integration, and E2E tests | **P1** |
| **Logging** | Not configured | Set up `tracing` crate | **P2** |
| **CI/CD** | Not configured | Set up GitHub Actions | **P2** |

---

## 7. Priority Action Items

### P0 (Critical) — Security & Stability

1. **Configure Content Security Policy**
   - Define CSP in `tauri.conf.json`
   - Whitelist only necessary origins (Gmail/Outlook APIs)
   - Test with restrictive settings first
   - **Deadline:** Before any production deployment

2. **Implement Capabilities System**
   - Create `src-tauri/capabilities/main.json`
   - Define minimum required permissions
   - Test all commands are accessible
   - **Deadline:** Before production deployment

3. **Add Command Input Validation**
   - Audit all `#[tauri::command]` functions
   - Add validation for email addresses, IDs, date ranges
   - Return structured errors
   - **Deadline:** Before handling user data

4. **Configure SQLCipher Properly**
   - Generate encryption key from keyring
   - Set `PRAGMA key` on connection
   - Test database encryption
   - **Deadline:** Before storing sensitive data

5. **Set Up Code Signing**
   - Obtain certificates (Apple Developer, Windows code signing)
   - Configure `tauri.conf.json` with signing identities
   - Test signed builds
   - **Deadline:** Before distributing builds

---

### P1 (High) — Performance & UX

6. **Implement Database Connection Pooling**
   - Replace direct connections with `SqlitePool`
   - Configure pool size (recommend 5 connections)
   - Pass pool via Tauri state
   - **Deadline:** Before beta testing

7. **Add Background Task Management**
   - Create `SyncManager` with cancellation tokens
   - Implement periodic sync (every 5-15 minutes)
   - Add manual sync trigger
   - **Deadline:** Before beta testing

8. **Optimize IPC for Large Data**
   - Use `tauri::ipc::Response` for email attachments
   - Implement streaming with `Channel` for sync progress
   - Batch read/update operations
   - **Deadline:** When handling attachments or large datasets

9. **Add API Rate Limiting**
   - Install `governor` crate
   - Configure rate limits per API (Gmail: 250 req/user/sec, Outlook: varies)
   - Add retry logic with exponential backoff
   - **Deadline:** Before heavy API usage

10. **Implement Structured Error Handling**
    - Create `AppError` enum with `thiserror`
    - Implement `serde::Serialize` for frontend
    - Map all errors to `AppError`
    - **Deadline:** Before beta testing

11. **Add Retry Logic for Network Calls**
    - Use `reqwest-retry` middleware
    - Configure 3 retries with exponential backoff
    - Handle rate limit errors gracefully
    - **Deadline:** Before production deployment

12. **Write Tests**
    - Unit tests for all commands (target 80% coverage)
    - Integration tests for sync workflows
    - E2E tests for critical user flows
    - **Deadline:** Ongoing, before major releases

---

### P2 (Medium) — Developer Experience

13. **Set Up Logging**
    - Install `tracing` and `tracing-subscriber`
    - Configure different levels for dev/prod
    - Log all errors and important events
    - **Deadline:** Before beta testing

14. **Implement Crash Recovery**
    - Use `tauri-plugin-store` for app state
    - Save state periodically (every 30s)
    - Restore state on startup
    - **Deadline:** Before production deployment

15. **Configure Auto-Updater**
    - Install `tauri-plugin-updater`
    - Set up update server
    - Generate signing keys
    - Test update flow
    - **Deadline:** After initial release

16. **Optimize Binary Size**
    - Configure LTO in `Cargo.toml`
    - Strip debug symbols
    - Analyze with `cargo-bloat`
    - **Deadline:** Before final release

17. **Set Up CI/CD Pipeline**
    - Configure GitHub Actions workflow
    - Automated tests on PR
    - Automated builds on tag push
    - **Deadline:** Before public beta

---

## 8. Additional Resources

### Official Tauri Documentation
- **Security:** https://v2.tauri.app/security/
- **IPC:** https://v2.tauri.app/concept/inter-process-communication/
- **Commands:** https://v2.tauri.app/develop/calling-rust/
- **Plugins:** https://v2.tauri.app/develop/plugins/
- **Distribution:** https://v2.tauri.app/distribute/

### Community Resources
- **Discord:** https://discord.gg/tauri
- **GitHub Discussions:** https://github.com/tauri-apps/tauri/discussions
- **Awesome Tauri:** https://github.com/tauri-apps/awesome-tauri

### Recommended Crates
- **Error Handling:** `thiserror`, `anyhow`
- **Async Runtime:** `tokio`
- **HTTP Client:** `reqwest`, `reqwest-middleware`, `reqwest-retry`
- **Database:** `sqlx`, `sqlcipher`
- **Credentials:** `keyring`
- **Logging:** `tracing`, `tracing-subscriber`
- **Rate Limiting:** `governor`
- **Serialization:** `serde`, `serde_json`

### SolidJS Best Practices
- **State Management:** `solid-js/store` for complex state
- **Async Utilities:** `@solid-primitives/scheduled` for debounce/throttle
- **Resource Management:** Use `createResource` for async data fetching

---

## Summary

This research covers all critical aspects of building a secure, performant, and maintainable Tauri 2.x desktop application. The **Priority Action Items** section provides a clear roadmap for implementation.

**Key Takeaways:**
1. **Security first:** CSP, capabilities, input validation, and encrypted storage are non-negotiable
2. **Performance matters:** Connection pooling, background tasks, and IPC optimization are essential for good UX
3. **Robust error handling:** Structured errors and retry logic prevent frustrating user experiences
4. **Developer experience:** Testing, logging, and CI/CD save time in the long run

Focus on **P0 items** immediately, tackle **P1 items** before beta, and address **P2 items** as time permits.

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-08  
**Next Review:** After implementing P0 items
