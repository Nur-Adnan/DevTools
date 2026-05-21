import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://placeholder-sentry-dsn@sentry.io/mock-pulseguard",
  
  // Adjust trace sample rate for client transaction tracking
  tracesSampleRate: 0.1,

  // Replay integration configurations
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  debug: false,
});
