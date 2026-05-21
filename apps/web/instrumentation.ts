import { registerOTel } from "@vercel/otel";

export function register() {
  // Initialize standard Next.js App Router OpenTelemetry runtime instrumentation
  registerOTel({
    serviceName: "pulseguard-web-app",
  });
}
