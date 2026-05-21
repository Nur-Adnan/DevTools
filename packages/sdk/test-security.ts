import { createLogger } from "./src/index";

async function main() {
  console.log("--- STARTING SECURITY PAYLOAD SIZE INTEGRATION TEST ---");

  const rawApiKey = "pg_live_testing_sdk_api_key_1234567890";
  const logger = createLogger({
    apiKey: rawApiKey,
    source: "node-security-test-runner",
    host: "http://localhost:3000",
  });

  // 1. Generate a large metadata object (12KB)
  const largeMetadata: Record<string, string> = {};
  for (let i = 0; i < 400; i++) {
    largeMetadata[`key_${i}`] = "x".repeat(30); // 30 bytes per key value
  }

  const metadataSize = Buffer.byteLength(JSON.stringify(largeMetadata), "utf-8");
  console.log(`Generated metadata payload size: ${(metadataSize / 1024).toFixed(2)} KB`);

  // We want to intercept fetch response to verify rejection. Since createLogger fetches
  // asynchronously and swallows errors, let's manually send a fetch to see the exact HTTP response!
  try {
    console.log("Dispatching oversized metadata payload directly to ingest endpoint...");
    const res = await fetch("http://localhost:3000/api/ingest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${rawApiKey}`,
      },
      body: JSON.stringify({
        type: "INFO",
        message: "Oversized metadata test log",
        metadata: largeMetadata,
        source: "security-test",
      }),
    });

    console.log(`Response HTTP Status: ${res.status}`);
    const data = await res.json();
    console.log("Response Body:", data);

    if (res.status === 400 && data.error && data.error.includes("exceeds 10KB limit")) {
      console.log("🟢 SUCCESS: Ingestion gateway correctly rejected oversized metadata (>10KB) payload!");
    } else {
      console.log("🔴 FAILURE: Ingestion gateway did not reject the oversized metadata correctly.");
    }
  } catch (err) {
    console.error("Test failed with error:", err);
  }
}

main();
