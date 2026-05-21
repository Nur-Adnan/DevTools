import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ProjectsDashboardClient } from "./projects-dashboard-client";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch all projects for the authenticated user
  const projects = await db.project.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      hashedApiKey: true,
      createdAt: true,
    },
  });

  return (
    <ProjectsDashboardClient initialProjects={projects} />
  );
}
