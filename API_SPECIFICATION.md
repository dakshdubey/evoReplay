# EvoReplay API & Schema Specification

## 1. Public SDK API Design

The public API is designed to be minimal to encourage low-friction adoption.

### 1.1 Core Methods

```typescript
// Generic Interface
interface EvoReplaySDK {
  /**
   * Initializes the SDK.
   * @param config Configuration options (sampleRate, redactKeys, etc.)
   */
  init(config: Config): void;

  /**
   * Manually starts a recording session.
   * Usually handled automatically by middleware/hooks, but available for custom flows.
   * @param contextId Optional unique identifier for this trace/request.
   */
  startRecording(contextId?: string): void;

  /**
   * Stops recording and flushes the artifact if a criteria was met (e.g., error).
   * @returns Promise resolving to the artifact ID or null if discarded.
   */
  stopRecording(): Promise<string | null>;

  /**
   * Explicitly captures a checkpoint.
   * Useful for long-running processes to allow partial replays.
   */
  checkpoint(label: string): void;

  /**
   * Marks a specific variable or block as non-deterministic.
   * The SDK will attempt to capture its value.
   */
  captureDecision<T>(label: string, value: T): T;
}
```

### 1.2 Configuration

```typescript
interface Config {
  enabled: boolean;
  sampleRate: number; // 0.0 to 1.0
  redact: string[]; // Keys to redact from captured inputs (e.g., "password", "token")
  storage: StorageBackend; // Interface for where .evor files go (Disk, S3, etc.)
}
```

## 2. Adapter Interface Contract

Language adapters must implement this internal protocol to communicate with the core EvoReplay engine (or library logic).

### 2.1 Hooks Required

| Hook Name | Trigger Point | Payload | Purpose |
| :--- | :--- | :--- | :--- |
| `onFuncEntry` | Start of monitored function | `funcId`, `argsHash` | Track call stack & input changes |
| `onFuncExit` | End of monitored function | `funcId`, `returnHash` | Track return values |
| `onBranch` | `if`, `switch`, loops | `branchId`, `decision (bool/int)` | Replay control flow |
| `onAsyncSchedule` | `setTimeout`, `go`, `Thread.start` | `taskId`, `parentId` | Track concurrency ordering |
| `onIO` | Network/File Read | `resourceId`, `dataHash` | Mock external data on replay |

### 2.2 Determinism Protocol

The adapter must provide:
- **`injectTime(ts: number)`**: Force system time to a specific value.
- **`mockRandom(seed: number)`**: Force RNG to a specific seed or sequence.
- **`virtualizeNetwork(interceptor: Fn)`**: Redirect network calls to the replay engine.

## 3. Replay Artifact Schema (.evor)

The `.evor` file is a distinct binary format designed for efficiency. Below is the logical structure.

### 3.1 File Structure (Logical)

```text
[Header]
  Magic: "EVOR"
  Version: 1
  Timestamp: 1678888888
  Lang: "python"
  RuntimeVer: "3.10.2"

[Manifest]
  AppHash: "sha256:..." (Hash of the application code state)
  Entrypoint: "main.py"

[DecisionStream]
  // A tightly packed stream of decisions
  // Type (4 bits) | Payload (Var)
  [BRANCH_TRUE]
  [BRANCH_FALSE]
  [TIME_READ] -> 1678888900
  [ASYNC_SCHED] -> TaskID: 5

[DependencyMap]
  // External data snapshots
  Key: HASH(SELECT * FROM USERS)
  Value: { "id": 1, "name": "Alice" } (Redacted/Serialized)

[Signature]
  HMAC-SHA256 of the content
```

### 3.2 Decision Types (Enum)

| ID | Name | Payload |
| :--- | :--- | :--- |
| 0x01 | `BRANCH` | `1` (True) or `0` (False) |
| 0x02 | `SWITCH` | `int` (Case Index) |
| 0x03 | `EXCEPTION` | `Hash` (Error Fingerprint) |
| 0x04 | `TIME` | `int64` (Timestamp) |
| 0x05 | `RANDOM` | `u64` (Generated Value) |
| 0x06 | `IO_READ` | `Hash` (Content Hash) |
