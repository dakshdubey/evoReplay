# Non-Functional Requirements: Security & Performance

## 1. Security & Privacy Guarantees

EvoReplay is designed to be **safe by default**. We assume the application processes PII (Personally Identifiable Information) and secrets.

### 1.1 Data Minimization Strategy

> "If we don't need it for control flow, we don't record it."

1.  **Field-Level Hashing**:
    - By default, all string/byte inputs to I/O boundaries are hashed (SHA-256 truncated).
    - We record: `func_login(hash("password123"))`.
    - We *do not* record: `func_login("password123")`.
    - **Replay**: At replay time, we need to know that *some* string hash matched.

2.  **Explicit Allowlists**:
    - Developers must explicitly opt-in fields that are safe to record as raw values (e.g., `product_id`, `status_code`).
    - Everything else is redacted or hashed.

3.  **Zero Raw Credential Capture**:
    - Heuristic scanners (regex for keys, tokens) run in the adapter to actively destroy accidental captures before they leave the process memory.

4.  **Artifact Encryption**:
    - `.evor` files can be encrypted at rest using a public key embedded in the SDK config. Only the holder of the private key (e.g., the debugging engineer) can decrypt.

### 1.2 Compliance

- **GDPR**: The `.evor` artifact contains system traces, not user databases. However, if a user ID is captured, it is hashed. We support "Crypto-shredding" by discarding the salt used for hashing if a "Right to be Forgotten" request is processed.
- **SOC2**: The system is designed to fit into existing audit trails. Every replay session is logged.

## 2. Performance Requirements

The system must run in production with minimal impact.

### 2.1 Overhead Targets

- **CPU Overhead**: < 5% P99 latency increase.
- **Memory Overhead**: < 50MB resident set size for buffering.
- **Network Overhead**: Compressed artifacts should be small (KB/s range).

### 2.2 Critical Engineering Decisions

1.  **Zero Allocations on Hot Paths**:
    - Relies on pre-allocated ring buffers for signal storage.
    - No GC generated during recording of high-frequency events (like tight loops).

2.  **Async-Safe Design**:
    - Recording logic must never block the application thread.
    - I/O (writing the artifact) happens on a background thread or async worker.

3.  **No Global Locks**:
    - Use thread-local storage (TLS) for thread-specific signal buffers.
    - CAS (Compare-And-Swap) operations for merging buffers, avoiding mutex contention.

4.  **Fail-Open**:
    - If the SDK crashes or buffer is full, it stops recording effectively disabling itself. It *never* crashes the host application.

### 2.3 Benchmarking Strategy

- **Micro-benchmarks**: Cost of a single hook (func entry/exit). Target: < 100ns.
- **Macro-benchmarks**:
    - **Web Server**: Throughput (RPS) reduction on standard "Hello World" and "Complex App" (e.g., Acme Air).
    - **Batch Job**: Total execution time increase.
