# EvoReplay

> **We do not replay machines. We replay decisions.**

EvoReplay is a production-grade, deterministic execution replay system designed to reproduce ephemeral bugs exactly as they occurred. It captures the minimal "decision graph" required to force code to take the same path during replay, without relying on heavy logs or memory dumps.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

##  System Architecture

EvoReplay follows a strict 3-Layer Architecture to ensure language agnostic behavior.

```mermaid
graph TD
    subgraph Layer 1: Application Runtime
    A[Application Code] -->|Hooks| B(Language Adapter);
    end

    subgraph Layer 2: Core Logic
    B -->| Signals | C{Signal Extractor};
    C -->| Normalized | D[Context Normalizer];
    D -->| Encoded | E[Deterministic Encoder];
    end

    subgraph Layer 3: Storage
    E -->| Writes | F[(.evor Artifact)];
    end

    subgraph Replay Engine
    G[CLI / Runner] -->| Reads | F;
    G -->| Injects Decisions | B;
    end
```

##  Workflow Diagram

How EvoReplay captures a bug in production and replays it locally.

```mermaid
sequenceDiagram
    participant App as Application
    participant SDK as EvoReplay SDK
    participant Art as .evor Artifact
    participant Dev as Local Developer

    Note over App,SDK: PRODUCTION
    App->>SDK: Function Entry (fn_A)
    App->>App: Calculate Logic
    App->>SDK: Branch Decision (true)
    App->>SDK: Non-Determinism (Date.now: 167000)
    App->>App: CRASH! (Exception)
    
    SDK->>Art: Write Artifact (crash_id.evor)
    
    Note over Art,Dev: REPLAY (OFFLINE)
    Dev->>Art: evoreplay run crash_id.evor
    Art->>SDK: Load Decision Graph
    
    SDK->>App: Start Replay
    App->>SDK: Request Date.now()
    SDK-->>App: Return 167000 (Injected)
    App->>App: Execute Branch (Forced True)
    App->>App: CRASH! (Reproduced)
```

## 🚀 Getting Started

Select your language to view specific documentation:

### [Node.js SDK](./sdk/node/README.md)
Reference implementation for JavaScript/TypeScript runtimes.
- **Package**: `evoreplay-node`
- **Features**: Automatic Time/Random hooks.

### [Go SDK](./sdk/go/README.md)
Infrastructure-grade SDK for Go services.
- **Package**: `github.com/evoreplay/go-sdk`
- **Features**: High-performance thread-safe recorder.

##  Repository Structure

```text
.
├── sdk/
│   ├── node/          # Reference Node.js Implementation
│   └── go/            # Infrastructure-Grade Go Implementation
├── schemas/
│   └── artifact.schema.json  # Strict .evor Spec
└── API_SPECIFICATION.md
```

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
