# PulseGuard (Ngwodink DevTools)

A lightweight Sentry + PostHog hybrid built with Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui, Prisma ORM, and Clerk.

## Features
- **API Payloads Tracking**: Log full request headers, request query parameters, and response payloads. Replay exactly what failed.
- **Error Tracking**: Capture unhandled exceptions, reject promises, and trace source maps directly back to Git repositories.
- **Latency Analytics**: Automatically measure and flag slow operations, p95/p99 spikes, and external database timeouts.
- **User Session Analytics**: Connect API performance events directly to specific user IDs and user actions. Understand user flows.

## Getting Started

First, set up your environment variables:
```bash
cp .env.example .env
```
And populate your Neon database URL and Clerk API keys.

Then, install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
