import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // 1. Lazy Sync User to local database if webhook didn't execute
  let user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    const clerkUser = await currentUser();
    if (clerkUser) {
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      const name = [clerkUser.firstName, clerkUser.lastName]
        .filter(Boolean)
        .join(" ") || null;

      if (email) {
        user = await db.user.create({
          data: {
            id: userId,
            email,
            name,
          },
        });
      }
    }
  }

  // 2. Fetch all user projects from Neon PostgreSQL
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

  // 3. Read sticky active project from cookie store
  const cookieStore = cookies();
  let activeProjectId = cookieStore.get("activeProjectId")?.value;

  // Validate that the active project ID belongs to this user
  const isActiveProjectValid =
    activeProjectId && projects.some((p) => p.id === activeProjectId);

  if (!isActiveProjectValid && projects.length > 0) {
    activeProjectId = projects[0].id;
  }

  return (
    <div
      id="dashboard-root"
      className="min-h-screen bg-[#09090b] text-[#f4f4f5] font-sans antialiased relative selection:bg-primary/20 selection:text-white"
    >
      {/* Subtle background overlay gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(120,119,198,0.03),transparent_100%)] pointer-events-none" />

      {/* Dashboard sidebar shell */}
      <Sidebar />

      {/* Main Dashboard shell */}
      <div className="pl-64 flex flex-col min-h-screen">
        {/* Dashboard topbar menu - passes projects list and active selected ID */}
        <Topbar
          projects={projects.map((p) => ({ id: p.id, name: p.name }))}
          activeProjectId={activeProjectId}
        />

        {/* Dashboard actual pages rendering */}
        <main className="flex-1 pt-16 p-6 md:p-8 relative z-0">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
