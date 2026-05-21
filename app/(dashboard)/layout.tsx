import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div id="dashboard-root" className="min-h-screen bg-[#09090b] text-[#f4f4f5] font-sans antialiased relative selection:bg-primary/20 selection:text-white">
      {/* Subtle background overlay gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(120,119,198,0.03),transparent_100%)] pointer-events-none" />
      
      {/* Dashboard sidebar shell */}
      <Sidebar />

      {/* Main Dashboard shell */}
      <div className="pl-64 flex flex-col min-h-screen">
        {/* Dashboard topbar menu */}
        <Topbar />

        {/* Dashboard actual pages rendering */}
        <main className="flex-1 pt-16 p-6 md:p-8 relative z-0">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
