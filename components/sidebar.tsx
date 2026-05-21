"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Activity, 
  Terminal, 
  Settings, 
  FolderGit2, 
  ChevronRight 
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
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    description: "Configure PulseGuard",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-border/40 bg-[#09090b]/80 backdrop-blur-md">
      {/* Brand logo header */}
      <div className="flex h-16 items-center px-6 border-b border-border/20 gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
          <Activity className="h-4.5 w-4.5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-tight text-neutral-100">PulseGuard</span>
          <span className="text-[10px] text-neutral-500 font-medium font-mono leading-none">CONSOLE V1</span>
        </div>
      </div>

      {/* Nav items list */}
      <nav className="flex-1 space-y-1.5 px-4 py-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const IconComponent = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-neutral-900/60",
                isActive 
                  ? "bg-primary/10 text-primary border-l-2 border-primary" 
                  : "text-neutral-400 hover:text-neutral-200"
              )}
            >
              <div className="flex items-center gap-3">
                <IconComponent className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-neutral-400 group-hover:text-neutral-200"
                )} />
                <div className="flex flex-col">
                  <span>{item.name}</span>
                  <span className="text-[10px] text-neutral-500 font-light hidden group-hover:block transition-all">
                    {item.description}
                  </span>
                </div>
              </div>
              <ChevronRight className={cn(
                "h-3 w-3 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5",
                isActive ? "text-primary" : "text-neutral-500"
              )} />
            </Link>
          );
        })}
      </nav>

      {/* Console details footer */}
      <div className="border-t border-border/20 p-4 bg-neutral-950/20">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-neutral-500 font-mono">STATUS</span>
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            OPERATIONAL
          </span>
        </div>
      </div>
    </aside>
  );
}
