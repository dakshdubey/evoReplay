# EvoReplay Language Examples

## 1. Node.js Adapter (`@evoreplay/node`)

The Node.js adapter uses `AsyncLocalStorage` to track context and `Proxy` to wrap determinism boundaries.

### Installation

```bash
npm install @evoreplay/node
```

### Usage (Application Entry Point)

```javascript
// index.js
require('@evoreplay/node').init({
  appName: 'payment-service',
  sampleRate: 0.05, // Record 5% of traffic
  redact: ['password', 'cvv'],
  // Auto-hooks into http, express, pg, etc.
});

const express = require('express');
const app = express();

app.post('/checkout', async (req, res) => {
  // Logic here is automatically traced
  // Decision points (DB results, random ID generation) are captured
  const result = await processPayment(req.body);
  res.json(result);
});

app.listen(3000);
```

### Manual Decision Capture (Optional)

```javascript
const { captureDecision } = require('@evoreplay/node');

function rolloutFeature(userId) {
  // If this logic is sensitive or critical for reproduction
  const isEnabled = captureDecision('feature_flag_x', () => {
    // This block is executed and the result recorded
    return Math.random() > 0.5;
  });
  return isEnabled;
}
```

## 2. Python Adapter (`evoreplay-py`)

The Python adapter uses decorators and `sys.settrace` (selectively) or monkey-patching for standard libraries.

### Installation

```bash
pip install evoreplay
```

### Usage (Flask Example)

```python
from evoreplay import EvoReplay
from flask import Flask, request

app = Flask(__name__)

# Initialize early
evo = EvoReplay(
    app_name="inventory-api",
    redact_keys=["api_key"]
)

# Auto-instrument common libraries
evo.instrument_all() 

@app.route('/update', methods=['POST'])
def update_inventory():
    data = request.json
    # External calls to DB/API are intercepted
    update_db(data)
    return {"status": "ok"}
```

### Replay Script

```python
# replay_bug.py
from evoreplay import ReplayEngine

def test_crash_repro():
    # Load the artifact that caused a crash in production
    engine = ReplayEngine.load("bug_92AF.evor")
    
    # Run the exact same flow
    engine.run()
    
    # Assertions
    assert engine.execution_path_hash == "EXPECTED_HASH"
```

## 3. Java Adapter (`evoreplay-java`)

The Java adapter uses a ByteBuddy agent to instrument classes at load time.

### Installation (Maven)

```xml
<dependency>
    <groupId>io.evoreplay</groupId>
    <artifactId>evoreplay-agent</artifactId>
    <version>1.0.0</version>
</dependency>
```

### Usage (Spring Boot)

Configuration via `application.properties`:

```properties
evoreplay.enabled=true
evoreplay.sample-rate=0.1
evoreplay.storage.type=s3
```

### Explicit Determinism Boundary

```java
import io.evoreplay.EvoReplay;

public class PricingService {
    
    public double calculateDiscount(User user) {
        // Non-deterministic logic (e.g. A/B test)
        // We explicitly name this decision for clarity in replay
        boolean applyDiscount = EvoReplay.decide("ab_test_group", () -> {
            return new Random().nextBoolean(); 
        });

        if (applyDiscount) {
            return 0.20;
        }
        return 0.0;
    }
}
```
