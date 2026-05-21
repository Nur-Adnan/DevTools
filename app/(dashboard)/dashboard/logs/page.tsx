import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function LogsRedirectPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch all user projects to validate active project ID
  const projects = await db.project.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  if (projects.length === 0) {
    // If no projects exist, fallback to the main dashboard so they can create one
    redirect("/dashboard");
  }

  // Read sticky active project from cookie store
  const cookieStore = cookies();
  let activeProjectId = cookieStore.get("activeProjectId")?.value;

  // Validate the cookie active project ID
  const isActiveProjectValid =
    activeProjectId && projects.some((p) => p.id === activeProjectId);

  if (!isActiveProjectValid) {
    activeProjectId = projects[0].id;
  }

  // Redirect to the dynamic project logs page
  redirect(`/dashboard/${activeProjectId}/logs`);
}
