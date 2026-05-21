import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { createLogger } from "./src/index";

// Load environment variables from the root .env file
dotenv.config();

async function run() {
  console.log("--- STARTING SDK TELEMETRY INTEGRATION TEST ---");
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not defined");
  }
  const adapter = new PrismaNeon({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    // 1. Retrieve first user or create a temporary test user
    let user = await prisma.user.findFirst();
    if (!user) {
      console.log("No users found. Creating a temporary user for SDK testing...");
      user = await prisma.user.create({
        data: {
          id: "usr_sdk_test_runner_123",
          email: "sdk-test@pulseguard.internal",
          name: "SDK Test Runner",
        },
      });
    }

    // 2. Upsert a project specifically for this SDK integration test
    const rawApiKey = "pg_live_testing_sdk_api_key_1234567890";
    const hashedApiKey = bcrypt.hashSync(rawApiKey, 10);

    let project = await prisma.project.findFirst({
      where: { name: "SDK Integration Test" },
    });

    if (project) {
      console.log("Updating existing SDK integration test project key...");
      project = await prisma.project.update({
        where: { id: project.id },
        data: { hashedApiKey },
      });
    } else {
      console.log("Creating new SDK integration test project...");
      project = await prisma.project.create({
        data: {
          name: "SDK Integration Test",
          userId: user.id,
          hashedApiKey,
        },
      });
    }

    console.log("-----------------------------------------");
    console.log(`Target Project: ${project.name} (${project.id})`);
    console.log(`API Key:        ${rawApiKey}`);
    console.log("-----------------------------------------");

    // 3. Initialize the SDK logger
    const logger = createLogger({
      apiKey: rawApiKey,
      source: "node-integration-test-runner",
      host: "http://localhost:3000",
    });

    // 4. Dispatch Telemetry logs
    console.log("1. Dispatching INFO telemetry log...");
    logger.log("User checkout session completed successfully", {
      transactionId: "txn_883012a",
      userId: user.id,
      amount: 299.95,
      items: ["item_44a", "item_12b"],
    });

    console.log("2. Dispatching WARN telemetry log...");
    logger.warn("API response latency exceeds SLA threshold", {
      apiEndpoint: "/api/v1/billing/history",
      responseMs: 4890,
      slaLimitMs: 2000,
    });

    console.log("3. Dispatching ERROR telemetry log (with automatic stack trace capture)...");
    logger.error("Failed to commit user session balance update", {
      userId: user.id,
      reason: "Postgres transaction deadlock detected",
      retryCount: 3,
    });

    console.log("4. Dispatching raw native Error instance...");
    try {
      throw new Error("SyntaxError: Unexpected token < in JSON at position 0");
    } catch (err) {
      logger.error(err, {
        operation: "parse-billing-callback",
        sourceRaw: "<html><body>Error 502 Bad Gateway</body></html>",
      });
    }

    console.log("-----------------------------------------");
    console.log("SDK Telemetry successfully dispatched asynchronously!");
    console.log("Check your PulseGuard dashboard at http://localhost:3000 to view logs.");
    console.log("-----------------------------------------");
  } catch (error) {
    console.error("SDK Integration test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
