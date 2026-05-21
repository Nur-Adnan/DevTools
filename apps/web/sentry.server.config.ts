import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://placeholder-sentry-dsn@sentry.io/mock-pulseguard",

  // Adjust tracesSampleRate for backend tracing
  tracesSampleRate: 0.1,

  debug: false,
});
