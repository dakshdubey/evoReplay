# EvoReplay Rollout & Business Model

## 1. Production Rollout Plan

To ensure "Engineers must trust it blindly", we cannot simply launch. We must graduate reliability.

### Phase 1: Internal Dogfooding (Alpha)
- **Target**: Internal Platform Team.
- **Scope**: CI/CD pipelines only. Replay failing tests locally.
- **Goal**: Verify 100% determinism on "known bad" flakiness.
- **Success Metric**: 0 crashes caused by the SDK.

### Phase 2: Canary Environment (Private Beta)
- **Target**: Staging environments of partner teams.
- **Scope**: 1% sampling rate on non-critical services.
- **Goal**: Validate performance overhead (< 5%) andartifact size.
- **Safety**: Remote "Kill Switch" enabled to instantly disable SDK via config poll.

### Phase 3: Production Standard (Public Beta)
- **Target**: Production, opt-in basis.
- **Scope**: Exception-triggered recording only (no continuous sampling yet).
- **Goal**: Debug actual production outages.
- **Safety**: Circuit breakers enabled (CPU spike > 10% auto-disables SDK).

### Phase 4: General Availability (GA)
- **Target**: Default inclusion in company-wide bootstrap templates.
- **Scope**: Continuous sampling (probabilistic debugging).

## 2. Open-Source vs Enterprise Split

We adopt an "Open Core" model to balance ubiquity with sustainability.

### 2.1 Open Source (MIT License)
**The "Standard"**
- **Core SDKs**: Node, Python, Java, Go libraries.
- **Specification**: `.evor` file format and protocol.
- **Local Replay CLI**: `evoreplay run <file>`.
- **Basic Signal Extraction**: Hooks for standard libs.

*Why?* We want `.evor` to be the standard format for bug interchange, like PDF is for documents.

### 2.2 Enterprise (Commercial)
**The "Intelligence Platform"**
- **Cloud Storage & Indexing**: Searchable repository of replay artifacts ("Find me all SQL errors from last Tuesday").
- **Collaborative Replay**: Web-based debugger (like a "Video Player" for code) running replays in cloud containers.
- **Drift Analysis**: Automated "Differential Replay" to detect regression drift between commits.
- **PII Vault**: Managed redaction policies and compliance audit logs.
- **Advanced Integrations**: Jira/PagerDuty deep links ("Click here to debug this alert").
