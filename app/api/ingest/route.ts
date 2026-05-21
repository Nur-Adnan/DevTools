import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// 1. Zod Validation Schema matching Prisma LogType enum
const ingestSchema = z.object({
  type: z.enum(["INFO", "WARN", "ERROR"]),
  message: z.string().min(1, "Message is required"),
  stackTrace: z.string().optional().nullable(),
  metadata: z.record(z.string(), z.any()).optional().nullable(),
  source: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  try {
    // 2. Validate Authorization: Bearer <api_key> header presence
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: Missing or malformed authorization header" },
        { status: 401 }
      );
    }
    const apiKey = authHeader.substring(7);

    // 3. Fetch all projects and look up matching project using parallel bcrypt comparison
    const projects = await db.project.findMany({
      select: {
        id: true,
        hashedApiKey: true,
      },
    });

    const comparisonChecks = await Promise.all(
      projects.map(async (project) => {
        const isMatch = await bcrypt.compare(apiKey, project.hashedApiKey);
        return isMatch ? project : null;
      })
    );

    const activeProject = comparisonChecks.find((p) => p !== null);

    if (!activeProject) {
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

    // 5. Compute SHA256 Fingerprint for error grouping
    // Formula: sha256(type + message + first line of stackTrace)
    const firstLineOfStack = stackTrace ? stackTrace.trim().split("\n")[0] || "" : "";
    const fingerprintInput = `${type}${message}${firstLineOfStack}`;
    const fingerprint = crypto
      .createHash("sha256")
      .update(fingerprintInput)
      .digest("hex");

    // 6. Save log in Neon PostgreSQL database
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

    // 7. Return response on success
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
