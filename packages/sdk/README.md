# @yourapp/logger-sdk

A lightweight, non-blocking, and fire-and-forget JavaScript and TypeScript logging SDK built to stream diagnostic telemetry, warnings, and errors directly to your **PulseGuard** dashboard.

## Features

- **Non-Blocking Execution**: Runs asynchronously using fire-and-forget network calls. If the logging server is down or slow, your host application is completely unaffected.
- **Error Swallowing**: Suppresses network timeouts and errors silently to ensure logging failures never crash your user-facing applications.
- **Smart Stack Trace Auto-Capture**: Automatically resolves call stacks on `.error()` events, stripping out internal SDK helper frames to point developers directly to the actual code failure line.
- **Highly Type-Safe**: Built with 100% strict TypeScript types and definitions.

## Installation

Add the package to your project:

```bash
npm install @yourapp/logger-sdk
```

## Quick Start

Initialize the logger with your project API key and start monitoring events:

```typescript
import { createLogger } from '@yourapp/logger-sdk'

// Initialize the PulseGuard logger client
const logger = createLogger({
  apiKey: 'pg_live_YOUR_SECURE_API_KEY',
  source: 'billing-microservice' // Optional identifier
})

// 1. Log basic telemetry information
logger.log('Checkout session initialized', { 
  cartId: 'cart_99012', 
  amount: 49.99 
})

// 2. Log warning conditions
logger.warn('Payment gateway response latency is high', {
  provider: 'Stripe',
  durationMs: 8200
})

// 3. Log errors (with automatic stack trace capture)
logger.error('Payment checkout failed', {
  userId: 'user_12345',
  declineCode: 'insufficient_funds'
})

// 4. Log raw Error instances directly
try {
  throw new Error('Database connection timeout')
} catch (error) {
  logger.error(error, { dbHost: 'neon-ap-east-1.tech' })
}
```

## API Configuration Options

| Option | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `apiKey` | `string` | **Yes** | Your secure project API key generated from the PulseGuard dashboard (starts with `pg_live_`). |
| `source` | `string` | No | Identifies the client environment or service name (e.g. `auth-service`, `v1.2.0@host-a`). Defaults to `logger-sdk`. |
| `host` | `string` | No | Overrides the PulseGuard console domain. Defaults to `http://localhost:3000` for local dev. |

---

## License

MIT © PulseGuard Team
