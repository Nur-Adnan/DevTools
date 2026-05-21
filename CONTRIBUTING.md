# Contributing to PulseGuard

Welcome! We are thrilled that you are interested in contributing to **PulseGuard** (our industry-grade API monitoring, logging, and error tracking platform). 

To maintain high development velocity, codebase stability, and strict production-readiness, we enforce a pnpm-workspace monorepo architecture with strict TypeScript compiler constraints, unified ESLint 9 + Prettier formatting, and husky automated git hook integrations.

Please review these guidelines fully before initiating pull requests.

---

## 🏗️ Monorepo Architecture Overview

PulseGuard is configured as a pnpm workspace:
```
├── apps/
│   ├── web/           # Main Next.js 14 Web Application
│   └── docs/          # Technical documentation and guides
├── packages/
│   ├── db/            # Shared Prisma Client, Database Repositories, & Polymorphic Redis Clients
│   ├── sdk/           # JavaScript / Node.js Ingestion SDK
│   ├── ui/            # Shared UI Components library (shadcn base)
│   └── config/        # Centralized configurations (TSConfig, ESLint, Tailwind)
```

---

## 🛠️ Local Development Quickstart

Ensure you have **Node.js v20+** and **pnpm v9.0.0+** installed on your system.

### 1. Repository Bootstrap
Run our automated onboarding script to clean, install, and align your local database:
```bash
./scripts/setup.sh
```

Alternatively, perform steps manually:
```bash
# 1. Install dependencies
pnpm install --frozen-lockfile

# 2. Spin up local database and redis containers
docker compose up -d postgres redis

# 3. Generate Prisma client & apply local schemas
pnpm --filter @pulseguard/db db:generate
pnpm --filter @pulseguard/db db:migrate
```

### 2. Launch Dev Engines
```bash
pnpm dev
```
Access the application at `http://localhost:3000`.

---

## 🚀 Unified Code Guidelines

All changes must satisfy our multi-layer validation pipeline:

### 1. Strict TypeScript Constraints
We enforce strict compiler rules (e.g. `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`). Verify code build stability:
```bash
pnpm typecheck
```

### 2. ESLint 9 Flat Config + Formatting
Our custom ESLint configuration prevents architectural design violations (e.g. direct Prisma database invocations outside of server repositories).
```bash
# 1. Check and autofix lint rules
pnpm lint

# 2. Format all project files with Prettier 3
pnpm format
```

### 3. Git Commit Standards (Conventional Commits)
We run husky hooks to enforce Conventional Commits. Commits belonging to `feat` or `fix` scopes **MUST** specify a target package/app scope (e.g. `web`, `db`, `sdk`, `ui`):
```bash
# Valid Commit format
git commit -m "feat(web): add error grouping filter bar"
git commit -m "fix(db): resolve redis local polymorphic fallback"
```

---

## 🧪 Testing Guidelines

We utilize **Vitest** for isolated unit/integration tests and **Playwright** for complete End-to-End browser validations.

```bash
# 1. Run unit/integration tests with coverage gating
pnpm test -- --coverage

# 2. Run E2E Playwright tests (ensure Docker stack is running)
pnpm exec playwright test
```

*Note: Code coverage must meet or exceed our **80% coverage threshold**.*
