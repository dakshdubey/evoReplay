# Contributing to EvoReplay Node.js SDK

## 🛠️ Build & Test

This SDK is written in standard JavaScript (CommonJS) for maximum compatibility. No compilation step is strictly required, but we use strict linting.

### Prerequisites
- Node.js >= 16

### Testing
We use a self-contained test runner to verify determinism.

```bash
# Run all tests
npm test
```

## 📦 Publishing

1.  **Login to npm**:
    ```bash
    npm login
    ```

2.  **Bump Version**:
    ```bash
    npm version patch
    ```

3.  **Publish**:
    ```bash
    npm publish --access public
    ```
