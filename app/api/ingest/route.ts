import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Upstash Redis rate limiter if environment variables are present
let ratelimit: Ratelimit | null = null;
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (redisUrl && redisToken) {
  ratelimit = new Ratelimit({
    redis: new Redis({
      url: redisUrl,
      token: redisToken,
    }),
    limiter: Ratelimit.slidingWindow(100, "60 s"),
    analytics: true,
    prefix: "@upstash/ratelimit",
  });
} else {
  console.warn(
    "⚠️ Upstash Redis rate limiting is bypassed. Configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to enable security controls."
  );
}

// Zod Validation Schema matching Prisma LogType enum
const ingestSchema = z.object({
  type: z.enum(["INFO", "WARN", "ERROR"]),
  message: z.string().min(1, "Message is required"),
  stackTrace: z.string().optional().nullable(),
  metadata: z.record(z.string(), z.any()).optional().nullable(),
  source: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  try {
    // 1. Validate Authorization: Bearer <api_key> header presence
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: Missing or malformed authorization header" },
        { status: 401 }
      );
    }
    const apiKey = authHeader.substring(7);

    // 2. Upstash Redis Rate Limiting (100 requests / minute)
    if (ratelimit) {
      try {
        const { success, limit, reset, remaining } = await ratelimit.limit(apiKey);
        if (!success) {
          return NextResponse.json(
            { error: "Too Many Requests: Rate limit exceeded (100 req/min)" },
            {
              status: 429,
              headers: {
                "X-RateLimit-Limit": limit.toString(),
                "X-RateLimit-Remaining": remaining.toString(),
                "X-RateLimit-Reset": reset.toString(),
              },
            }
          );
        }
      } catch (err) {
        // Fail-safe: Log error but allow ingestion if Redis is temporarily unreachable
        console.error("Rate limiting pipeline warning:", err);
      }
    }

    // 3. Timing-Safe API Key Lookup
    const hashedKey = crypto.createHash("sha256").update(apiKey).digest("hex");
    
    // Indexed lookup by unique key
    let activeProject = await db.project.findUnique({
      where: { hashedApiKey: hashedKey },
      select: {
        id: true,
        hashedApiKey: true,
      },
    });

    let isMatch = false;

    if (activeProject) {
      // Constant-time timing-safe comparison on equal-length SHA256 hashes
      const inputBuffer = Buffer.from(hashedKey, "hex");
      const dbBuffer = Buffer.from(activeProject.hashedApiKey, "hex");
      isMatch = crypto.timingSafeEqual(inputBuffer, dbBuffer);
    } else {
      // Execute dummy comparison of identical length to prevent timing attacks
      const dummyBuffer = Buffer.from(hashedKey, "hex");
      crypto.timingSafeEqual(dummyBuffer, dummyBuffer);

      // Backwards-Compatibility Fallback: Check old Bcrypt hashes
      const projects = await db.project.findMany({
        select: {
          id: true,
          hashedApiKey: true,
        },
      });

      const comparisonChecks = await Promise.all(
        projects.map(async (project) => {
          if (project.hashedApiKey.startsWith("$2")) {
            const ok = await bcrypt.compare(apiKey, project.hashedApiKey);
            return ok ? project : null;
          }
          return null;
        })
      );

      const oldProjectMatch = comparisonChecks.find((p) => p !== null);
      if (oldProjectMatch) {
        activeProject = oldProjectMatch;
        isMatch = true;

        // Auto-upgrade old Bcrypt hash to indexed timing-safe SHA256 hash
        try {
          await db.project.update({
            where: { id: oldProjectMatch.id },
            data: { hashedApiKey: hashedKey },
          });
          console.log(`Successfully migrated API key to timing-safe SHA256 for project: ${oldProjectMatch.id}`);
        } catch (upgradeErr) {
          console.error("Failed to automatically upgrade API key to SHA256:", upgradeErr);
        }
      }
    }

    if (!isMatch || !activeProject) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid API key" },
        { status: 401 }
      );
    }

    // 4. Validate Request Body with Zod
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Bad Request: Missing or invalid JSON body" },
        { status: 400 }
      );
    }

    const validationResult = ingestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Bad Request: Invalid schema fields",
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { type, message, stackTrace, metadata, source } = validationResult.data;

    // 5. Metadata Size Sanitization (Reject payloads over 10KB)
    if (metadata) {
      const metadataStr = JSON.stringify(metadata);
      const byteSize = Buffer.byteLength(metadataStr, "utf-8");
      if (byteSize > 10 * 1024) {
        return NextResponse.json(
          { error: "Bad Request: Metadata payload size exceeds 10KB limit" },
          { status: 400 }
        );
      }
    }

    // 6. Compute SHA256 Fingerprint for error grouping
    const firstLineOfStack = stackTrace ? stackTrace.trim().split("\n")[0] || "" : "";
    const fingerprintInput = `${type}${message}${firstLineOfStack}`;
    const fingerprint = crypto
      .createHash("sha256")
      .update(fingerprintInput)
      .digest("hex");

    // 7. Save log in Neon PostgreSQL database
    const log = await db.log.create({
      data: {
        projectId: activeProject.id,
        type,
        message,
        stackTrace: stackTrace || null,
        metadata: metadata ?? undefined,
        source: source || null,
        fingerprint,
      },
    });

    return NextResponse.json(
      {
        id: log.id,
        createdAt: log.createdAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Ingest pipeline failure:", error);
    return NextResponse.json(
      { error: "Internal Server Error: Ingestion pipeline failure" },
      { status: 500 }
    );
  }
}
