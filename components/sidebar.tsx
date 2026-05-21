"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Activity, 
  Terminal, 
  Settings, 
  FolderGit2, 
  AlertTriangle
} from "lucide-react";

const navItems = [
  {
    name: "Projects",
    href: "/dashboard",
    icon: FolderGit2,
    description: "Manage monitored apps",
  },
  {
    name: "Logs",
    href: "/dashboard/logs",
    icon: Terminal,
    description: "Real-time event stream",
  },
  {
    name: "Errors",
    href: "/dashboard/errors",
    icon: AlertTriangle,
    description: "Grouped error signatures",
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    description: "Configure PulseGuard",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col bg-surface-container-low border-r border-outline-variant z-30 pt-16">
      {/* Brand logo header */}
      <div className="p-6 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-container rounded-lg flex items-center justify-center shadow-lg shadow-primary-container/10 shrink-0">
            <Activity className="h-5 w-5 text-on-primary" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-primary leading-tight font-sans">PulseGuard</span>
            <span className="text-[10px] text-on-surface-variant font-mono font-bold tracking-widest leading-none mt-0.5">V2.4.0-STABLE</span>
          </div>
        </div>
      </div>

      {/* Nav items list */}
      <nav className="flex-1 space-y-1 px-4 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const IconComponent = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-xs transition-all duration-200 cursor-pointer",
                isActive 
                  ? "bg-secondary-container/20 text-primary border-l-2 border-primary-container shadow-sm" 
                  : "text-on-surface-variant hover:text-primary hover:bg-surface-container-highest"
              )}
            >
              <IconComponent className={cn(
                "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                isActive ? "text-primary-container" : "text-on-surface-variant group-hover:text-primary"
              )} />
              <span className="font-sans font-bold tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Action / Trigger Button inside Sidebar */}
      <div className="p-4 mt-auto border-t border-outline-variant/30">
        <button 
          onClick={() => router.push("/dashboard?create=true")}
          className="w-full bg-primary-container text-on-primary px-4 py-3 rounded-lg font-bold hover:brightness-110 active:scale-[0.97] transition-all flex items-center justify-center gap-2 text-xs shadow-lg shadow-primary-container/10"
        >
          <FolderGit2 className="h-4 w-4 stroke-[2.5]" />
          Deploy New Node
        </button>
      </div>

      {/* Status Bar Bottom */}
      <footer className="h-10 border-t border-outline-variant bg-surface-container-low flex items-center px-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary-container pulse-status"></div>
          <span className="text-[9px] font-mono text-on-surface-variant uppercase tracking-widest font-black">Operational</span>
        </div>
      </footer>
    </aside>
  );
}
