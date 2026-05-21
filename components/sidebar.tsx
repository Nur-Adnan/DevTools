"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Activity, 
  Terminal, 
  Settings, 
  FolderGit2, 
  AlertTriangle,
  HelpCircle,
  LogOut,
  Plus
} from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";

const navItems = [
  {
    name: "Projects",
    href: "/dashboard",
    icon: FolderGit2,
  },
  {
    name: "Logs",
    href: "/dashboard/logs",
    icon: Terminal,
  },
  {
    name: "Errors",
    href: "/dashboard/errors",
    icon: AlertTriangle,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col py-6 bg-surface-container-low border-r border-outline-variant z-30">
      {/* Brand Header */}
      <div className="px-6 mb-10 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary-container rounded flex items-center justify-center">
          <Activity className="h-5 w-5 text-on-primary-container" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="font-headline-sm text-headline-sm font-bold text-primary">PulseGuard</h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant opacity-70">Monitoring Console</p>
        </div>
      </div>

      {/* Deploy/New Project Button */}
      <div className="px-4 mb-6">
        <button 
          onClick={() => router.push("/dashboard?create=true")}
          className="w-full bg-primary-container text-on-primary-container py-3 px-4 rounded font-label-md text-label-md font-bold flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.97] transition-all"
        >
          <Plus className="h-4.5 w-4.5 text-on-primary-container stroke-[2.5]" />
          New Project
        </button>
      </div>

      {/* Nav items list */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const IconComponent = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group cursor-pointer flex items-center px-6 py-3 transition-all",
                isActive 
                  ? "text-primary border-r-2 border-primary bg-surface-container-high font-bold" 
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest"
              )}
            >
              <IconComponent className={cn(
                "mr-3 h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-110",
                isActive ? "text-primary-fixed" : "text-on-surface-variant group-hover:text-on-surface"
              )} />
              <span className="font-label-md text-label-md">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Footer Section */}
      <div className="mt-auto border-t border-outline-variant pt-6 space-y-1">
        <Link
          href="https://github.com/Nur-Adnan/DevTools"
          target="_blank"
          className="group cursor-pointer flex items-center px-6 py-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all"
        >
          <HelpCircle className="mr-3 h-4.5 w-4.5 text-on-surface-variant group-hover:text-on-surface" />
          <span className="font-label-md text-label-md">Support</span>
        </Link>
        <SignOutButton redirectUrl="/sign-in">
          <div className="group cursor-pointer flex items-center px-6 py-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all">
            <LogOut className="mr-3 h-4.5 w-4.5 text-on-surface-variant group-hover:text-on-surface" />
            <span className="font-label-md text-label-md">Sign Out</span>
          </div>
        </SignOutButton>
        <div className="px-6 mt-4 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00FF9C] shadow-[0_0_8px_#00FF9C] pulse-status"></div>
          <span className="font-label-sm text-label-sm text-[#00FF9C] uppercase tracking-widest font-black">Operational</span>
        </div>
      </div>
    </aside>
  );
}
