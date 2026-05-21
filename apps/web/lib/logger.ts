import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

// Pino configuration options
const options: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
  redact: {
    // Redact sensitive security fields from the logs automatically
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "password",
      "apiKey",
      "token",
      "secret",
      "clerkSecret",
    ],
    censor: "[REDACTED]",
  },
  // In development, pipe log output to pino-pretty for visual clarity
  ...(!isProduction && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    },
  }),
};

export const logger = pino(options);

// Custom helper methods for standardized logging patterns
export const logPattern = {
  request: (req: Request, metadata?: Record<string, unknown>) => {
    logger.info({
      type: "REQUEST",
      method: req.method,
      url: req.url,
      ...metadata,
    }, `HTTP ${req.method} ${req.url}`);
  },
  db: (operation: string, model: string, durationMs: number, metadata?: Record<string, unknown>) => {
    logger.debug({
      type: "DATABASE",
      operation,
      model,
      durationMs,
      ...metadata,
    }, `DB Query: ${operation} on ${model} took ${durationMs}ms`);
  },
  redis: (operation: string, key: string, hit: boolean, durationMs: number) => {
    logger.debug({
      type: "REDIS",
      operation,
      key,
      hit,
      durationMs,
    }, `Redis ${operation} for ${key} [${hit ? "HIT" : "MISS"}] in ${durationMs}ms`);
  },
  error: (msg: string, err: Error | unknown, context?: Record<string, unknown>) => {
    logger.error({
      type: "ERROR",
      err: err instanceof Error ? {
        message: err.message,
        stack: err.stack,
        name: err.name,
      } : err,
      ...context,
    }, msg);
  },
};
