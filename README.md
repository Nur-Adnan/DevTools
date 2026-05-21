# 🛡️ PulseGuard — Ngwodink DevTools

PulseGuard is a premium, high-performance, developer-first logging and exception tracking platform. Inspired by the best capabilities of modern tools like Sentry and PostHog, PulseGuard delivers real-time telemetry ingestion, structured payload analysis, and deep error grouping diagnostics—packaged in a modern glassmorphic dashboard.

---

## 🚀 Key Features

- **⚡ Zero-Overhead Ingestion**: High-capacity endpoint `/api/ingest` designed to handle high-frequency telemetry logging with minimal latency.
- **📦 Modular SDK (`@yourapp/logger-sdk`)**: Standard JavaScript/TypeScript client library featuring asynchronous, fire-and-forget logging and automatic trace slicing.
- **🧩 Structured Metadata Tree Viewer**: Interactive, color-coded collapsible JSON viewer to inspect complex metadata nodes seamlessly.
- **🧬 Error Fingerprinting & Grouping**: Smart SHA256 grouping algorithms that automatically cluster duplicate errors by signature and stack location.
- **🔑 Cryptographic Key Lifecycle**: Secure API keys generated securely via cryptographically random bytes, stored as strong Bcrypt hashes, and managed through settings (regenerate, delete).
- **📊 Real-time Dashboard Explorer**: Fully responsive filters (Time ranges, severity, keyword search) coupled with fast cursor-based pagination.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [Neon PostgreSQL Serverless](https://neon.tech/)
- **ORM**: [Prisma 7 (Neon Driver Adapter)](https://www.prisma.io/)
- **Authentication**: [Clerk Core Security](https://clerk.com/)
- **Validation**: [Zod Schema Parser](https://zod.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)

---

## 📐 Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │            Target Node App             │
                      │       (imports @yourapp/logger-sdk)     │
                      └───────────────────┬────────────────────┘
                                          │ (Async Fire-and-Forget)
                                          ▼
                      ┌────────────────────────────────────────┐
                      │       Public Ingestion Gateway         │
                      │           POST /api/ingest             │
                      └───────────────────┬────────────────────┘
                                          │
                                          ▼
                      ┌────────────────────────────────────────┐
                      │        Bcrypt Key Authentication       │
                      └───────────────────┬────────────────────┘
                                          │
                                          ▼
                      ┌────────────────────────────────────────┐
                      │        Neon Serverless Database        │
                      │     (Log + Project + User Schema)      │
                      └───────────────────┬────────────────────┘
                                          │
                                          ▼
                      ┌────────────────────────────────────────┐
                      │       PulseGuard Logs Dashboard        │
                      │         /dashboard/[projectId]         │
                      └────────────────────────────────────────┘
```

---

## ⚡ Getting Started

### 1. Environment Setup

Copy `.env.example` into a local `.env` file:
```bash
cp .env.example .env
```

Ensure your `.env` contains the required keys:
```env
# Database Connection
DATABASE_URL="postgresql://<user>:<password>@<host>/neondb?sslmode=require"

# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Clerk Webhook Cryptographic Verification Signature
CLERK_WEBHOOK_SECRET="whsec_..."
```

### 2. Install Workspace Dependencies
```bash
npm install
```

### 3. Initialize Prisma & Run Migrations
Sync your local schema definition directly with your Neon database:
```bash
npx prisma migrate dev --name init_schema
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view your local PulseGuard platform.

---

## 📦 Using the JavaScript/TypeScript SDK

PulseGuard includes a modular sub-package designed for npm publishing located under `packages/logger-sdk`.

### Installation

Import the SDK inside any Node or browser application:
```bash
# Compile and build the SDK package
cd packages/logger-sdk
npm install
npm run build
```

### Quickstart

```typescript
import { createLogger } from '@yourapp/logger-sdk';

// Initialize the client
const logger = createLogger({
  apiKey: 'pg_live_testing_sdk_api_key_1234567890',
  source: 'auth-service',
  host: 'http://localhost:3000' // Defaults to localhost:3000
});

// 1. Dispatch normal info telemetry
logger.log('User completed purchase session', { userId: 'usr_123', amount: 99.95 });

// 2. Dispatch system warnings
logger.warn('Redis read latency exceeded SLA threshold', { responseMs: 250 });

// 3. Dispatch errors (generates clean call-stack traces automatically)
logger.error('Failed to commit user ledger update');

// 4. Dispatch raw native Error objects (captures original stack frames)
try {
  throw new Error('Database transaction deadlock detected');
} catch (err) {
  logger.error(err, { retryCount: 3 });
}
```

---

## 📡 API Reference: Log Ingestion

### `POST /api/ingest`
Public endpoint utilized by SDK clients to submit new telemetries.

#### Headers
```http
Authorization: Bearer <api_key>
Content-Type: application/json
```

#### Request Payload
```json
{
  "type": "INFO" | "WARN" | "ERROR",
  "message": "User balance update failed",
  "stackTrace": "Error: User balance update failed\n    at commit...",
  "metadata": {
    "userId": "usr_99",
    "dbHost": "neon-primary"
  },
  "source": "billing-microservice@v1.2.0"
}
```

#### Response (Success `200 OK`)
```json
{
  "id": "log_8a39c1b72...",
  "createdAt": "2026-05-21T11:34:03.000Z"
}
```

---

## 🧪 Running Integration Tests

PulseGuard comes with automated verification scripts inside `packages/logger-sdk` to quickly validate the database pipeline, error-stack parsing, and dashboard routing:

1. Build the library first:
   ```bash
   npm run build --prefix packages/logger-sdk
   ```
2. Run the end-to-end integration suite:
   ```bash
   npx ts-node packages/logger-sdk/test-sdk.ts
   ```
3. Run the database log verifier to confirm safe persistence:
   ```bash
   npx ts-node packages/logger-sdk/verify-db.ts
   ```

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
