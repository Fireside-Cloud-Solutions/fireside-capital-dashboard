# Rust Async Patterns & Best Practices for Tauri Desktop Apps

**Research Date:** February 2026  
**Priority:** P0 — Unblocks Sprint 6 backend hardening  
**Status:** Complete

---

## Executive Summary

This document provides a comprehensive guide to implementing robust async patterns in Rust for Tauri desktop applications. Based on current ecosystem best practices (2025-2026), it covers runtime selection, connection pooling, error handling, background tasks, and testing strategies.

**Key Recommendations:**
- **Runtime:** Use Tokio (canonical choice for Tauri ecosystem)
- **Connection Pooling:** SQLx built-in pool for SQLite (simpler than deadpool/bb8)
- **Error Handling:** `thiserror` for libraries, `anyhow` for application code
- **Rate Limiting:** `backoff` crate for exponential backoff
- **Channels:** `mpsc` for task communication, `broadcast` for pub/sub, `watch` for state
- **Testing:** `#[tokio::test]` with `start_paused = true` for time-based tests

---

## 1. Tokio Runtime Patterns

### 1.1 Runtime Comparison

| Feature | Tokio | async-std | smol |
|---------|-------|-----------|------|
| **Status** | Active, canonical | Discontinued (2025) | Active |
| **Ecosystem** | 20,768+ crates | 1,754 crates (legacy) | Growing |
| **Performance** | ~18µs RTT localhost | ~5µs RTT localhost | ~5µs RTT localhost |
| **API Style** | Comprehensive framework | std-like API | Minimalist |
| **Default Runtime** | Multi-threaded | Multi-threaded | Single-threaded |
| **Compatibility** | Tokio ecosystem | Some compatibility layers | futures + async-executor |
| **Learning Curve** | Moderate | Easy (if familiar with std) | Low |
| **Best For** | Production apps, Tauri | Legacy projects | Embedded, simple apps |
| **Tauri Integration** | Native (re-exported) | Requires compatibility | Requires manual setup |

**Verdict:** Use **Tokio** for Tauri. It's the canonical runtime, has the best ecosystem support, and is directly integrated into Tauri via `tauri::async_runtime`.

### 1.2 Tauri Runtime Integration

**Option A: Let Tauri Own the Runtime (Recommended)**
```rust
// Tauri owns the Tokio runtime by default
#[tauri::command]
async fn my_async_command() -> Result<String, String> {
    // Async code here
    tokio::time::sleep(Duration::from_secs(1)).await;
    Ok("Done".to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![my_async_command])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

**Option B: Own the Runtime (Advanced Use Cases)**
```rust
#[tokio::main]
async fn main() {
    // Tell Tauri to use our runtime
    tauri::async_runtime::set(tokio::runtime::Handle::current());
    
    // Spawn tasks before Tauri starts
    tokio::spawn(async {
        // Background work
    });
    
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### 1.3 Best Practices for Async Commands

**✅ DO: Return Result for async commands with state**
```rust
#[tauri::command]
async fn fetch_data(
    state: State<'_, AppState>,
) -> Result<String, String> {
    // Required for stateful async commands
    Ok("data".to_string())
}
```

**✅ DO: Use single-threaded runtime when possible**
```rust
// For tasks that don't need Send + 'static
#[tokio::main(flavor = "current_thread")]
async fn main() {
    // Simpler ownership, no Arc/Mutex needed
}
```

**❌ DON'T: Use std::sync::Mutex across .await**
```rust
// WRONG - deadlock risk
let data = state.lock().unwrap();
async_call().await; // Lock held across await!
drop(data);

// CORRECT - use tokio::sync::Mutex
let data = state.lock().await;
async_call().await;
drop(data);
```

---

## 2. Database Connection Pooling

### 2.1 Connection Pool Comparison

| Feature | SQLx (built-in) | deadpool + SQLx | bb8 + SQLx |
|---------|-----------------|-----------------|------------|
| **Setup Complexity** | Low | Medium | Medium |
| **Configuration** | Via PgPoolOptions | Config struct | Builder pattern |
| **Tokio Integration** | Native | Native | Generic (works with any runtime) |
| **Health Checks** | Automatic | Automatic | Configurable |
| **Idle Timeout** | ✅ | ✅ | ✅ |
| **Min Idle Connections** | ❌ | ✅ | ✅ |
| **Best For** | Most apps | High-load services | Generic pooling needs |

**Recommendation:** Start with **SQLx's built-in pool**. It's simpler and sufficient for most Tauri apps.

### 2.2 SQLx Pool Setup (Recommended)

```rust
use sqlx::sqlite::{SqlitePool, SqlitePoolOptions};
use std::time::Duration;

async fn create_pool(database_url: &str) -> Result<SqlitePool, sqlx::Error> {
    SqlitePoolOptions::new()
        .max_connections(5) // Conservative for desktop app
        .min_connections(1) // Keep one connection warm
        .acquire_timeout(Duration::from_secs(5))
        .idle_timeout(Duration::from_secs(300)) // 5 min
        .max_lifetime(Duration::from_secs(1800)) // 30 min
        .connect(database_url)
        .await
}

// In Tauri setup
fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let pool = tauri::async_runtime::block_on(async {
                create_pool("sqlite:./data.db").await.unwrap()
            });
            app.manage(pool);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// In commands
#[tauri::command]
async fn get_users(pool: State<'_, SqlitePool>) -> Result<Vec<User>, String> {
    let users = sqlx::query_as!(User, "SELECT * FROM users")
        .fetch_all(pool.inner())
        .await
        .map_err(|e| e.to_string())?;
    Ok(users)
}
```

### 2.3 Connection Pool Sizing Guidelines

**For Desktop Apps (Tauri):**
- **Max connections:** 5-10 (desktop apps have limited concurrent users)
- **Min connections:** 1-2 (keep warm for fast response)
- **Acquire timeout:** 5 seconds (fail fast if pool exhausted)
- **Idle timeout:** 5 minutes (free resources when idle)

**For Server Apps:**
- **Max connections:** Calculate as `(CPU cores * 2) + effective_spindle_count`
- **Min connections:** 25% of max
- **Acquire timeout:** 2-3 seconds
- **Idle timeout:** 10 minutes

### 2.4 Anti-Patterns to Avoid

**❌ Creating connections per operation**
```rust
// WRONG - connection overhead on every call
async fn get_user(id: i64) -> Result<User, Error> {
    let pool = SqlitePool::connect("sqlite:./data.db").await?;
    let user = sqlx::query_as!(User, "SELECT * FROM users WHERE id = ?", id)
        .fetch_one(&pool)
        .await?;
    Ok(user)
}
```

**✅ Using a shared pool**
```rust
// CORRECT - reuse pool via state
#[tauri::command]
async fn get_user(id: i64, pool: State<'_, SqlitePool>) -> Result<User, String> {
    sqlx::query_as!(User, "SELECT * FROM users WHERE id = ?", id)
        .fetch_one(pool.inner())
        .await
        .map_err(|e| e.to_string())
}
```

---

## 3. Rate Limiting & Exponential Backoff

### 3.1 Recommended Crates

| Crate | Use Case | Features |
|-------|----------|----------|
| **backoff** | General retry logic | Exponential, fibonacci, constant |
| **backon** | Modern retry with traits | Retryable trait, dynamic backoff |
| **tokio-retry** | Tokio-specific | ExponentialBackoff strategy |
| **tower** | Service middleware | Retry layers for HTTP services |

### 3.2 Gmail/Graph API Rate Limiting Pattern

```rust
use backoff::{ExponentialBackoff, Error as BackoffError};
use std::time::Duration;

#[derive(Debug)]
struct ApiClient {
    // HTTP client, auth, etc.
}

impl ApiClient {
    async fn fetch_emails_with_retry(&self) -> Result<Vec<Email>, anyhow::Error> {
        let operation = || async {
            match self.fetch_emails().await {
                Ok(emails) => Ok(emails),
                Err(e) if is_retryable(&e) => Err(BackoffError::transient(e)),
                Err(e) => Err(BackoffError::permanent(e)),
            }
        };

        let backoff = ExponentialBackoff {
            initial_interval: Duration::from_millis(500),
            max_interval: Duration::from_secs(60),
            multiplier: 2.0,
            max_elapsed_time: Some(Duration::from_secs(300)), // 5 min max
            ..Default::default()
        };

        backoff::future::retry(backoff, operation).await
    }

    async fn fetch_emails(&self) -> Result<Vec<Email>, ApiError> {
        // Actual API call
        todo!()
    }
}

fn is_retryable(error: &ApiError) -> bool {
    match error {
        ApiError::RateLimited => true,
        ApiError::ServerError(status) if status >= 500 => true,
        ApiError::Timeout => true,
        _ => false,
    }
}
```

### 3.3 Rate Limiting with Token Bucket

```rust
use std::time::{Duration, Instant};
use tokio::sync::Semaphore;

struct RateLimiter {
    semaphore: Semaphore,
    refill_rate: Duration,
}

impl RateLimiter {
    fn new(max_requests: usize, per_duration: Duration) -> Self {
        Self {
            semaphore: Semaphore::new(max_requests),
            refill_rate: per_duration / max_requests as u32,
        }
    }

    async fn acquire(&self) {
        let permit = self.semaphore.acquire().await.unwrap();
        tokio::spawn({
            let refill_rate = self.refill_rate;
            let semaphore = self.semaphore.clone();
            async move {
                tokio::time::sleep(refill_rate).await;
                drop(permit); // Return permit to pool
            }
        });
    }
}

// Usage
let rate_limiter = Arc::new(RateLimiter::new(10, Duration::from_secs(1)));

for _ in 0..100 {
    rate_limiter.acquire().await;
    api_call().await;
}
```

---

## 4. Error Propagation & Handling

### 4.1 Error Handling Strategy

**Rule of Thumb:**
- **Libraries:** Use `thiserror` (expose structured errors for matching)
- **Applications:** Use `anyhow` (focus on error context, not matching)

### 4.2 thiserror for Library Code

```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum DatabaseError {
    #[error("Record not found: {0}")]
    NotFound(String),
    
    #[error("Database connection failed")]
    ConnectionFailed(#[from] sqlx::Error),
    
    #[error("Invalid input: {field}")]
    Validation { field: String },
    
    #[error("Timeout after {0}s")]
    Timeout(u64),
}

// Consumers can match on specific errors
async fn get_user(id: i64) -> Result<User, DatabaseError> {
    sqlx::query_as!(User, "SELECT * FROM users WHERE id = ?", id)
        .fetch_one(&pool)
        .await
        .map_err(|e| match e {
            sqlx::Error::RowNotFound => DatabaseError::NotFound(id.to_string()),
            _ => DatabaseError::ConnectionFailed(e),
        })
}
```

### 4.3 anyhow for Application Code

```rust
use anyhow::{Context, Result};

#[tauri::command]
async fn sync_emails(pool: State<'_, SqlitePool>) -> Result<String, String> {
    let result = sync_emails_internal(pool.inner())
        .await
        .map_err(|e| format!("Email sync failed: {:#}", e))?;
    Ok(format!("Synced {} emails", result))
}

async fn sync_emails_internal(pool: &SqlitePool) -> Result<usize> {
    let client = create_gmail_client()
        .context("Failed to create Gmail client")?;
    
    let emails = client.fetch_emails()
        .await
        .context("Failed to fetch emails from Gmail")?;
    
    for email in &emails {
        sqlx::query!("INSERT INTO emails (id, subject) VALUES (?, ?)", email.id, email.subject)
            .execute(pool)
            .await
            .context(format!("Failed to insert email {}", email.id))?;
    }
    
    Ok(emails.len())
}
```

### 4.4 User-Friendly Error Messages for Tauri

```rust
use serde::Serialize;

#[derive(Serialize)]
struct UserError {
    message: String,
    details: Option<String>,
    retryable: bool,
}

impl From<anyhow::Error> for UserError {
    fn from(error: anyhow::Error) -> Self {
        // Check error chain for specific types
        if let Some(db_err) = error.downcast_ref::<sqlx::Error>() {
            return Self {
                message: "Database error occurred".to_string(),
                details: Some(format!("{}", db_err)),
                retryable: false,
            };
        }
        
        if let Some(_) = error.downcast_ref::<ApiError>() {
            return Self {
                message: "API request failed".to_string(),
                details: None, // Don't expose API internals
                retryable: true,
            };
        }
        
        Self {
            message: "An unexpected error occurred".to_string(),
            details: Some(format!("{:#}", error)),
            retryable: false,
        }
    }
}

#[tauri::command]
async fn safe_operation() -> Result<String, UserError> {
    risky_operation()
        .await
        .map_err(|e| UserError::from(e))?;
    Ok("Success".to_string())
}
```

---

## 5. Background Tasks & Long-Running Jobs

### 5.1 Pattern: Dedicated Task with mpsc Channel

```rust
use tokio::sync::mpsc;
use tauri::Manager;

enum SyncCommand {
    Start,
    Stop,
    GetStatus { resp: oneshot::Sender<SyncStatus> },
}

struct SyncState {
    cmd_tx: mpsc::Sender<SyncCommand>,
}

fn main() {
    let (cmd_tx, mut cmd_rx) = mpsc::channel::<SyncCommand>(32);
    
    tauri::Builder::default()
        .setup(|app| {
            // Spawn background sync task
            let app_handle = app.handle();
            tauri::async_runtime::spawn(async move {
                let mut running = false;
                
                while let Some(cmd) = cmd_rx.recv().await {
                    match cmd {
                        SyncCommand::Start => {
                            running = true;
                            tokio::spawn(sync_loop(app_handle.clone()));
                        }
                        SyncCommand::Stop => {
                            running = false;
                        }
                        SyncCommand::GetStatus { resp } => {
                            let _ = resp.send(SyncStatus { running });
                        }
                    }
                }
            });
            
            app.manage(SyncState { cmd_tx });
            Ok(())
        })
        .run(tauri::generate_context!())
        .unwrap();
}

async fn sync_loop(app: tauri::AppHandle) {
    loop {
        // Do sync work
        match perform_sync().await {
            Ok(count) => {
                app.emit_all("sync-complete", count).unwrap();
            }
            Err(e) => {
                app.emit_all("sync-error", e.to_string()).unwrap();
            }
        }
        
        tokio::time::sleep(Duration::from_secs(300)).await; // Every 5 min
    }
}
```

### 5.2 Pattern: Progress Reporting to UI

```rust
use tokio::sync::watch;

#[derive(Clone, Serialize)]
struct ProgressUpdate {
    current: usize,
    total: usize,
    message: String,
}

async fn long_running_task(
    app: tauri::AppHandle,
    progress_tx: watch::Sender<ProgressUpdate>,
) -> Result<()> {
    let total = 100;
    
    for i in 0..total {
        // Do work
        process_item(i).await?;
        
        // Update progress
        let update = ProgressUpdate {
            current: i + 1,
            total,
            message: format!("Processing item {}/{}", i + 1, total),
        };
        
        let _ = progress_tx.send(update.clone());
        app.emit_all("progress", &update)?;
    }
    
    Ok(())
}

#[tauri::command]
async fn start_long_task(app: tauri::AppHandle) -> Result<(), String> {
    let (progress_tx, _progress_rx) = watch::channel(ProgressUpdate {
        current: 0,
        total: 0,
        message: "Starting...".to_string(),
    });
    
    tokio::spawn(async move {
        if let Err(e) = long_running_task(app.clone(), progress_tx).await {
            app.emit_all("task-error", e.to_string()).unwrap();
        }
    });
    
    Ok(())
}
```

---

## 6. Channel Patterns

### 6.1 Channel Selection Guide

| Channel | Pattern | Use Case |
|---------|---------|----------|
| **mpsc** | Multi-producer, single-consumer | Task commands, job queues |
| **oneshot** | Single value, one-time | Request/response pairs |
| **broadcast** | Multi-producer, multi-consumer | Pub/sub, event bus |
| **watch** | Latest value only | State synchronization |

### 6.2 mpsc: Task Communication

```rust
use tokio::sync::mpsc;

// Command pattern for background worker
let (tx, mut rx) = mpsc::channel(100);

// Multiple producers
let tx1 = tx.clone();
tokio::spawn(async move {
    tx1.send("message 1").await.unwrap();
});

let tx2 = tx.clone();
tokio::spawn(async move {
    tx2.send("message 2").await.unwrap();
});

// Single consumer
tokio::spawn(async move {
    while let Some(msg) = rx.recv().await {
        println!("Received: {}", msg);
    }
});
```

### 6.3 broadcast: Event Bus

```rust
use tokio::sync::broadcast;

#[derive(Clone, Debug)]
enum AppEvent {
    UserLoggedIn(String),
    DataSynced,
    ErrorOccurred(String),
}

let (event_tx, _) = broadcast::channel(100);

// Subscribe to events
let mut rx1 = event_tx.subscribe();
tokio::spawn(async move {
    while let Ok(event) = rx1.recv().await {
        println!("Handler 1: {:?}", event);
    }
});

let mut rx2 = event_tx.subscribe();
tokio::spawn(async move {
    while let Ok(event) = rx2.recv().await {
        println!("Handler 2: {:?}", event);
    }
});

// Emit events
event_tx.send(AppEvent::UserLoggedIn("alice".to_string())).unwrap();
```

### 6.4 watch: State Synchronization

```rust
use tokio::sync::watch;

// Create state channel
let (state_tx, mut state_rx) = watch::channel(0);

// Writer task
tokio::spawn(async move {
    for i in 0..10 {
        state_tx.send(i).unwrap();
        tokio::time::sleep(Duration::from_millis(100)).await;
    }
});

// Reader task (only sees latest value)
tokio::spawn(async move {
    while state_rx.changed().await.is_ok() {
        let value = *state_rx.borrow();
        println!("Current state: {}", value);
    }
});
```

---

## 7. Cancellation & Timeouts

### 7.1 Request Timeouts

```rust
use tokio::time::{timeout, Duration};

#[tauri::command]
async fn fetch_with_timeout() -> Result<String, String> {
    let result = timeout(
        Duration::from_secs(10),
        slow_api_call()
    )
    .await
    .map_err(|_| "Request timeout after 10 seconds")?
    .map_err(|e| e.to_string())?;
    
    Ok(result)
}
```

### 7.2 Graceful Shutdown with CancellationToken

```rust
use tokio_util::sync::CancellationToken;

struct AppState {
    shutdown_token: CancellationToken,
}

#[tauri::command]
async fn start_background_work(state: State<'_, AppState>) -> Result<(), String> {
    let token = state.shutdown_token.clone();
    
    tokio::spawn(async move {
        loop {
            tokio::select! {
                _ = token.cancelled() => {
                    println!("Shutting down gracefully");
                    break;
                }
                _ = do_work() => {
                    // Continue working
                }
            }
        }
    });
    
    Ok(())
}

#[tauri::command]
async fn shutdown(state: State<'_, AppState>) -> Result<(), String> {
    state.shutdown_token.cancel();
    Ok(())
}
```

### 7.3 TaskTracker for Coordinated Shutdown

```rust
use tokio_util::task::TaskTracker;

fn main() {
    let tracker = TaskTracker::new();
    
    tauri::Builder::default()
        .setup(move |app| {
            // Spawn multiple background tasks
            tracker.spawn(background_sync(app.handle()));
            tracker.spawn(cache_cleanup(app.handle()));
            tracker.spawn(metrics_reporter(app.handle()));
            
            // On app close, wait for all tasks
            let tracker_clone = tracker.clone();
            app.listen_global("tauri://close-requested", move |_| {
                tracker_clone.close();
                tauri::async_runtime::block_on(tracker_clone.wait());
            });
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .unwrap();
}
```

---

## 8. Testing Async Code

### 8.1 Basic Tokio Test

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_async_function() {
        let result = my_async_function().await;
        assert!(result.is_ok());
    }
}
```

### 8.2 Time-Based Testing with Paused Time

```rust
use tokio::time::{sleep, Duration};

#[tokio::test(start_paused = true)]
async fn test_exponential_backoff() {
    let start = std::time::Instant::now();
    
    // This should complete instantly in paused time
    sleep(Duration::from_secs(1)).await;
    sleep(Duration::from_secs(2)).await;
    sleep(Duration::from_secs(4)).await;
    
    // Elapsed should be ~0ms even though we "slept" 7 seconds
    assert!(start.elapsed().as_millis() < 100);
}
```

### 8.3 Mocking with tokio_test::io

```rust
use tokio::io::{AsyncReadExt, AsyncWriteExt};

#[tokio::test]
async fn test_io_handler() {
    let reader = tokio_test::io::Builder::new()
        .read(b"GET /users HTTP/1.1\r\n\r\n")
        .build();
    
    let writer = tokio_test::io::Builder::new()
        .write(b"HTTP/1.1 200 OK\r\n\r\n")
        .build();
    
    let result = handle_request(reader, writer).await;
    assert!(result.is_ok());
}
```

### 8.4 Mocking Async Dependencies with mockall

```rust
use mockall::{automock, predicate::*};
use async_trait::async_trait;

#[async_trait]
pub trait EmailClient {
    async fn send_email(&self, to: &str, body: &str) -> Result<(), Error>;
}

#[cfg(test)]
mod tests {
    use super::*;
    use mockall::mock;

    mock! {
        pub EmailClient {}
        
        #[async_trait]
        impl EmailClient for EmailClient {
            async fn send_email(&self, to: &str, body: &str) -> Result<(), Error>;
        }
    }

    #[tokio::test]
    async fn test_notification_service() {
        let mut mock = MockEmailClient::new();
        
        mock.expect_send_email()
            .with(eq("user@example.com"), always())
            .times(1)
            .returning(|_, _| Ok(()));
        
        let service = NotificationService::new(mock);
        service.notify_user("user@example.com").await.unwrap();
    }
}
```

---

## 9. Anti-Patterns to Avoid

### 9.1 Blocking in Async Context

**❌ WRONG:**
```rust
#[tauri::command]
async fn bad_command() -> Result<String, String> {
    // Blocks the tokio thread!
    std::thread::sleep(Duration::from_secs(5));
    Ok("done".to_string())
}
```

**✅ CORRECT:**
```rust
#[tauri::command]
async fn good_command() -> Result<String, String> {
    tokio::time::sleep(Duration::from_secs(5)).await;
    Ok("done".to_string())
}
```

### 9.2 Unbounded Spawning

**❌ WRONG:**
```rust
// Can spawn unlimited tasks, exhausting memory
for item in huge_list {
    tokio::spawn(process(item));
}
```

**✅ CORRECT:**
```rust
use futures::stream::{self, StreamExt};

// Process with concurrency limit
stream::iter(huge_list)
    .map(|item| process(item))
    .buffer_unordered(10) // Max 10 concurrent
    .collect::<Vec<_>>()
    .await;
```

### 9.3 Forgetting to .await

**❌ WRONG:**
```rust
async fn broken() {
    fetch_data(); // Does nothing! Future not polled
}
```

**✅ CORRECT:**
```rust
async fn working() {
    fetch_data().await; // Actually executes
}
```

### 9.4 Holding std::sync::Mutex Across .await

**❌ WRONG:**
```rust
let data = mutex.lock().unwrap();
async_call().await; // Lock held across await = deadlock risk
drop(data);
```

**✅ CORRECT:**
```rust
let data = async_mutex.lock().await;
async_call().await; // Safe with tokio::sync::Mutex
drop(data);
```

---

## 10. Implementation Checklist for Ember

### Phase 1: Foundation (Sprint 6)
- [ ] Add Tokio to Cargo.toml with full features
- [ ] Set up SQLx connection pool in main.rs
- [ ] Create AppState struct with pool and shutdown token
- [ ] Add `thiserror` for library errors, `anyhow` for app errors
- [ ] Implement UserError type for frontend

### Phase 2: Background Tasks (Sprint 7)
- [ ] Create background sync task with mpsc channel
- [ ] Implement progress reporting with watch channel
- [ ] Add CancellationToken for graceful shutdown
- [ ] Set up TaskTracker for coordinated task management

### Phase 3: API Integration (Sprint 8)
- [ ] Implement exponential backoff for Gmail API
- [ ] Add rate limiter for Graph API (10 req/sec)
- [ ] Create retry logic with `backoff` crate
- [ ] Add request timeouts (10s for Gmail, 5s for Graph)

### Phase 4: Testing & Hardening (Sprint 9)
- [ ] Add `#[tokio::test]` to all async tests
- [ ] Use `start_paused = true` for time-based tests
- [ ] Create mocks for EmailClient and CalendarClient
- [ ] Add integration tests with test databases
- [ ] Implement error recovery tests

### Phase 5: Observability (Sprint 10)
- [ ] Add tracing to all async tasks
- [ ] Implement metrics for pool usage
- [ ] Add error rate tracking
- [ ] Create health check endpoint

---

## 11. Further Reading

### Official Documentation
- [Tokio Tutorial](https://tokio.rs/tokio/tutorial)
- [SQLx Documentation](https://docs.rs/sqlx)
- [Tauri Async Runtime](https://tauri.app/v1/guides/features/async-runtime)

### Articles & Guides
- [The State of Async Rust: Runtimes](https://corrode.dev/blog/async/)
- [A Performance Evaluation on Rust Asynchronous Frameworks](https://zenoh.io/blog/2022-04-14-rust-async-eval/)
- [Tauri + Async Rust Process](https://rfdonnelly.github.io/posts/tauri-async-rust-process/)

### Crates
- [backoff](https://docs.rs/backoff) - Exponential backoff and retry
- [tokio-util](https://docs.rs/tokio-util) - Utilities for Tokio
- [mockall](https://docs.rs/mockall) - Mocking framework

---

## 12. Appendix: Code Examples Repository

All code examples from this document are available at:
`docs/research/examples/async-patterns/`

To run examples:
```bash
cd docs/research/examples/async-patterns
cargo test
```

---

**Document Version:** 1.0  
**Last Updated:** February 2026  
**Maintainer:** Fireside Research Team
