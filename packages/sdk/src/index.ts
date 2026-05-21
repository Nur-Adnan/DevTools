export interface LoggerOptions {
  /**
   * The PulseGuard application API key (raw value starting with pg_live_).
   */
  apiKey: string;
  /**
   * Identifies the logging client environment source, e.g. "auth-service" or "v1.2.0@host-1".
   */
  source?: string;
  /**
   * PulseGuard dashboard base host. Defaults to "http://localhost:3000" locally.
   */
  host?: string;
}

export interface LoggerClient {
  /**
   * Captured INFO severity log telemetry.
   */
  log(message: unknown, metadata?: Record<string, unknown>): void;
  /**
   * Captured WARN severity warning telemetry.
   */
  warn(message: unknown, metadata?: Record<string, unknown>): void;
  /**
   * Captured ERROR severity exception telemetry with automatic stack-trace capturing.
   */
  error(message: unknown, metadata?: Record<string, unknown>): void;
}

/**
 * Creates a simple, lightweight, fire-and-forget PulseGuard logger client.
 */
export function createLogger(options: LoggerOptions): LoggerClient {
  const { apiKey, source = "logger-sdk", host = "http://localhost:3000" } = options;
  const endpoint = `${host.replace(/\/$/, "")}/api/ingest`;

  // General, non-blocking telemetry emitter
  const emit = (
    type: "INFO" | "WARN" | "ERROR",
    message: unknown,
    metadata?: Record<string, unknown>,
    capturedStack?: string | null
  ) => {
    let messageText = "";
    let stackTraceText = capturedStack || null;

    // Smart payload formatting based on input types
    if (message instanceof Error) {
      messageText = message.message;
      if (!stackTraceText) {
        stackTraceText = message.stack || null;
      }
    } else if (typeof message === "object" && message !== null) {
      messageText = (message as { message?: string }).message || JSON.stringify(message);
      if (!stackTraceText && (message as { stack?: string }).stack) {
        stackTraceText = (message as { stack?: string }).stack || null;
      }
    } else {
      messageText = String(message);
    }

    const payload = {
      type,
      message: messageText,
      stackTrace: stackTraceText,
      metadata: metadata || null,
      source,
    };

    // Non-blocking fire-and-forget request with strict error swallowing
    if (typeof fetch !== "undefined") {
      fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      }).catch(() => {
        // Swallowed to prevent disruption inside the host application
      });
    }
  };

  return {
    log(message, metadata) {
      emit("INFO", message, metadata);
    },
    warn(message, metadata) {
      emit("WARN", message, metadata);
    },
    error(message, metadata) {
      let trace: string | null = null;

      // Extract original stack trace or auto-capture execution context
      if (message instanceof Error) {
        trace = message.stack || null;
      } else if (typeof message === "object" && message !== null && (message as { stack?: string }).stack) {
        trace = (message as { stack?: string }).stack || null;
      } else {
        const err = new Error();
        if (err.stack) {
          const frames = err.stack.split("\n");
          // Slices: Line 0 (Error label), Line 1 (err instantiation), Line 2 (error caller helper),
          // starting from Line 3 gives the exact location where developer invoked logger.error()
          trace = frames.slice(3).join("\n");
        }
      }

      emit("ERROR", message, metadata, trace);
    },
  };
}
