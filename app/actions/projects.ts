"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// Helper to assert authentication
async function getAuthSession() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized: Please sign in to perform this action.");
  }
  return userId;
}

/**
 * Creates a new project, generates a secure write-only API key, and stores its bcrypt hash.
 */
export async function createProject(name: string) {
  const userId = await getAuthSession();

  if (!name || name.trim() === "") {
    throw new Error("Project name is required.");
  }

  // 1. Generate cryptographically secure API key
  const rawKey = "pg_live_" + crypto.randomBytes(24).toString("hex");

  // 2. Hash key with bcryptjs
  const hashedApiKey = bcrypt.hashSync(rawKey, 10);

  // 3. Persist to Neon DB
  const project = await db.project.create({
    data: {
      name: name.trim(),
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
export async function renameProject(projectId: string, newName: string) {
  const userId = await getAuthSession();

  if (!newName || newName.trim() === "") {
    throw new Error("New project name is required.");
  }

  // Ensure user owns this project
  const project = await db.project.findFirst({
    where: { id: projectId, userId },
  });

  if (!project) {
    throw new Error("Project not found or access denied.");
  }

  await db.project.update({
    where: { id: projectId },
    data: { name: newName.trim() },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");

  return { success: true };
}

/**
 * Generates a new API key, updates the bcrypt hash in the DB, and invalidates the old one.
 */
export async function regenerateApiKey(projectId: string) {
  const userId = await getAuthSession();

  // Ensure user owns this project
  const project = await db.project.findFirst({
    where: { id: projectId, userId },
  });

  if (!project) {
    throw new Error("Project not found or access denied.");
  }

  const rawKey = "pg_live_" + crypto.randomBytes(24).toString("hex");
  const hashedApiKey = bcrypt.hashSync(rawKey, 10);

  await db.project.update({
    where: { id: projectId },
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
export async function deleteProject(projectId: string) {
  const userId = await getAuthSession();

  // Ensure user owns this project
  const project = await db.project.findFirst({
    where: { id: projectId, userId },
  });

  if (!project) {
    throw new Error("Project not found or access denied.");
  }

  await db.project.delete({
    where: { id: projectId },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");

  return { success: true };
}
