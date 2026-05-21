import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ProjectSettingsClient } from "./project-settings-client";

export default async function SettingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Retrieve selected active project from cookies
  const cookieStore = cookies();
  const activeProjectId = cookieStore.get("activeProjectId")?.value;

  // Retrieve user projects to ensure access/ownership
  const projects = await db.project.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // Verify and match the active project
  const activeProject =
    projects.find((p) => p.id === activeProjectId) || projects[0] || null;

  return (
    <ProjectSettingsClient
      activeProject={
        activeProject
          ? {
              id: activeProject.id,
              name: activeProject.name,
              hashedApiKey: activeProject.hashedApiKey,
            }
          : null
      }
    />
  );
}
