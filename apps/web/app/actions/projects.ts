"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { z } from "zod";

// Zod validation schemas
const nameSchema = z
  .string()
  .min(1, { message: "Project name is required." })
  .max(100, { message: "Project name must be under 100 characters." })
  .trim();

const projectIdSchema = z
  .string()
  .uuid({ message: "Invalid project ID format." });

// Helper to assert authentication
async function getAuthSession() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized: Please sign in to perform this action.");
  }
  return userId;
}

/**
 * Creates a new project, generates a secure write-only API key, and stores its SHA256 hash.
 */
export async function createProject(name: unknown) {
  const userId = await getAuthSession();

  // Validate project name with Zod
  const validatedName = nameSchema.parse(name);

  // 1. Generate cryptographically secure API key
  const rawKey = "pg_live_" + crypto.randomBytes(24).toString("hex");

  // 2. Hash key with SHA256 for fast indexed timing-safe lookups
  const hashedApiKey = crypto.createHash("sha256").update(rawKey).digest("hex");

  // 3. Persist to Neon DB
  const project = await db.project.create({
    data: {
      name: validatedName,
      userId,
      hashedApiKey,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");

  return {
    success: true,
    project: {
      id: project.id,
      name: project.name,
      createdAt: project.createdAt,
    },
    rawKey, // Returned exactly once to show in the client dialog
  };
}

/**
 * Renames an existing project owned by the user.
 */
export async function renameProject(projectId: unknown, newName: unknown) {
  const userId = await getAuthSession();

  // Zod Input Validation
  const validatedId = projectIdSchema.parse(projectId);
  const validatedName = nameSchema.parse(newName);

  // Ensure user owns this project
  const project = await db.project.findFirst({
    where: { id: validatedId, userId },
  });

  if (!project) {
    throw new Error("Project not found or access denied.");
  }

  await db.project.update({
    where: { id: validatedId },
    data: { name: validatedName },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");

  return { success: true };
}

/**
 * Generates a new API key, updates the SHA256 hash in the DB, and invalidates the old one.
 */
export async function regenerateApiKey(projectId: unknown) {
  const userId = await getAuthSession();

  // Zod Input Validation
  const validatedId = projectIdSchema.parse(projectId);

  // Ensure user owns this project
  const project = await db.project.findFirst({
    where: { id: validatedId, userId },
  });

  if (!project) {
    throw new Error("Project not found or access denied.");
  }

  const rawKey = "pg_live_" + crypto.randomBytes(24).toString("hex");
  const hashedApiKey = crypto.createHash("sha256").update(rawKey).digest("hex");

  await db.project.update({
    where: { id: validatedId },
    data: { hashedApiKey },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");

  return {
    success: true,
    rawKey, // Returned exactly once to display
  };
}

/**
 * Destroys a project, triggering cascading deletions of all its associated logs.
 */
export async function deleteProject(projectId: unknown) {
  const userId = await getAuthSession();

  // Zod Input Validation
  const validatedId = projectIdSchema.parse(projectId);

  // Ensure user owns this project
  const project = await db.project.findFirst({
    where: { id: validatedId, userId },
  });

  if (!project) {
    throw new Error("Project not found or access denied.");
  }

  await db.project.delete({
    where: { id: validatedId },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");

  return { success: true };
}

const fingerprintSchema = z.string().length(64, { message: "Invalid fingerprint format." });

/**
 * Marks a log group (by fingerprint) as resolved/unresolved.
 */
export async function toggleResolveLogGroup(
  projectId: unknown,
  fingerprint: unknown,
  resolved: unknown
) {
  const userId = await getAuthSession();

  // Zod Input Validation
  const validatedProjectId = projectIdSchema.parse(projectId);
  const validatedFingerprint = fingerprintSchema.parse(fingerprint);
  const validatedResolved = z.boolean().parse(resolved);

  // Ensure user owns this project
  const project = await db.project.findFirst({
    where: { id: validatedProjectId, userId },
  });

  if (!project) {
    throw new Error("Project not found or access denied.");
  }

  // Update the log group resolved status
  await db.logGroup.update({
    where: { fingerprint: validatedFingerprint },
    data: { resolved: validatedResolved },
  });

  revalidatePath(`/dashboard/${validatedProjectId}/errors`);
  revalidatePath(`/dashboard/${validatedProjectId}/logs`);

  return { success: true };
}

