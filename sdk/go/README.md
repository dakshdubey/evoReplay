# EvoReplay for Go (`go-sdk`)

Infrastructure-grade Deterministic Replay SDK for Go services.

## Installation

```bash
go get github.com/evoreplay/go-sdk
```

## Quick Start

### 1. Integrate in `main.go`

```go
package main

import "github.com/evoreplay/go-sdk/evoreplay"

func main() {
    // Start the global recorder
    evoreplay.Start()
    defer evoreplay.Stop()
    
    // ... your application logic ...
}
```

### 2. Deterministic Interception
Go does not allow monkey-patching `time.Now()` easily. Use the `Intercept` helper for non-deterministic sources.

```go
import "github.com/evoreplay/go-sdk/pkg/signals"

// Instead of rand.Intn(100)
val := evoreplay.Intercept(signals.RANDOM, func() interface{} {
    return rand.Intn(100)
}).(int)
```

## CLI Usage

This SDK includes the Replay Engine CLI.

```bash
# Build the tool
go build -o evoreplay cmd/evoreplay/main.go

# Replay an artifact
./evoreplay replay artifact.evor
```

## License
MIT
