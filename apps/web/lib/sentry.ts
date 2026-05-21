import * as Sentry from "@sentry/nextjs";

// Safe capture utility that delegates to Sentry in production
export const captureError = (error: unknown, context?: Record<string, unknown>) => {
  if (process.env.NODE_ENV === "production") {
    Sentry.withScope((scope) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }
      Sentry.captureException(error);
    });
  } else {
    // In dev/test, output error cleanly
    console.error("Captured Error [Local/Test Sentry Bypass]:", error, context);
  }
};

// Safe capture message helper
export const captureMessage = (message: string, level: Sentry.SeverityLevel = "info", context?: Record<string, unknown>) => {
  if (process.env.NODE_ENV === "production") {
    Sentry.withScope((scope) => {
      scope.setLevel(level);
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }
      Sentry.captureMessage(message);
    });
  } else {
    console.log(`Captured Message [Local/Test Sentry Bypass - ${level.toUpperCase()}]:`, message, context);
  }
};

export const setSentryUser = (user: { id: string; email?: string; username?: string }) => {
  if (process.env.NODE_ENV === "production") {
    const sentryUser: Sentry.User = { id: user.id };
    if (user.email !== undefined) {
      sentryUser.email = user.email;
    }
    if (user.username !== undefined) {
      sentryUser.username = user.username;
    }
    Sentry.setUser(sentryUser);
  }
};
