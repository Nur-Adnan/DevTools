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
    activeProjectId = projects[0]?.id;
  }

  return (
    <div
      id="dashboard-root"
      className="flex h-screen bg-background text-foreground font-sans antialiased overflow-hidden relative selection:bg-primary-container selection:text-on-primary-container transition-colors duration-200"
    >
      {/* Subtle background overlay gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(0,255,156,0.015),transparent_100%)] pointer-events-none z-10" />

      {/* Dashboard sidebar shell */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden terminal-grid relative z-20">
        {/* Dashboard topbar menu - passes projects list and active selected ID */}
        <Topbar
          projects={projects.map((p) => ({ id: p.id, name: p.name }))}
          activeProjectId={activeProjectId}
        />

        {/* Scrollable Canvas for child pages */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="w-full p-margin-desktop space-y-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
