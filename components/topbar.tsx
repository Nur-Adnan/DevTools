"use client";

import { useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Bell, RefreshCw, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

interface TopbarProps {
  projects: Array<{ id: string; name: string }>;
  activeProjectId?: string;
}

export function Topbar({ projects = [], activeProjectId }: TopbarProps) {
  const router = useRouter();
  const { user } = useUser();
  const [copied, setCopied] = useState(false);

  // Handle Project Switching
  const handleProjectChange = (projectId: string | null) => {
    if (!projectId) return;
    // Set sticky cookie for active project
    document.cookie = `activeProjectId=${projectId}; path=/; max-age=31536000; SameSite=Lax`;
    
    // Refresh page / router to load dynamic project statistics
    router.refresh();
  };

  const handleCopy = () => {
    if (!activeProjectId) return;
    navigator.clipboard.writeText(activeProjectId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  return (
    <header className="sticky top-0 flex justify-between items-center w-full px-margin-desktop bg-background/80 backdrop-blur-md h-16 border-b border-border/80 shrink-0 z-40 transition-all duration-300 shadow-sm">
      {/* Project Switcher & Copyable Project ID Badge */}
      <div className="flex items-center gap-3">
        {projects.length > 0 ? (
          <Select 
            value={activeProjectId} 
            onValueChange={handleProjectChange}
          >
            <SelectTrigger className="w-52 bg-background/40 hover:bg-muted/65 dark:bg-background/10 dark:hover:bg-muted/15 border border-border hover:border-muted-foreground/30 focus-visible:ring-2 focus-visible:ring-primary/20 text-xs h-9 font-medium text-foreground rounded-lg transition-all duration-300 shadow-sm flex items-center justify-between px-3 cursor-pointer">
              <span className="flex items-center gap-2 truncate">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] pulse-status shrink-0" />
                <span className="font-semibold text-foreground truncate select-none">
                  <SelectValue placeholder="Select Project" />
                </span>
              </span>
            </SelectTrigger>
            <SelectContent className="bg-popover/95 backdrop-blur-md border border-border text-popover-foreground rounded-lg shadow-xl p-1 min-w-52 max-h-[300px] overflow-y-auto">
              {projects.map((proj) => (
                <SelectItem 
                  key={proj.id} 
                  value={proj.id} 
                  className="hover:bg-muted/85 dark:hover:bg-muted/30 focus:bg-muted/85 dark:focus:bg-muted/30 text-xs cursor-pointer rounded-md py-1.5 px-2.5 transition-all duration-150"
                >
                  {proj.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="text-xs text-muted-foreground italic bg-muted/20 border border-border px-3 py-1.5 rounded-lg select-none">
            No projects configured
          </div>
        )}

        {/* Dynamic Project ID Badge with Copy trigger */}
        {activeProjectId && (
          <div className="flex items-center gap-1.5 bg-muted/40 hover:bg-muted/70 dark:bg-muted/10 dark:hover:bg-muted/20 border border-border rounded-lg pl-2.5 pr-2 py-1 h-9 text-xs font-mono text-muted-foreground transition-all duration-300 shadow-sm hover:border-muted-foreground/20">
            <span className="text-[10px] text-muted-foreground/60 font-semibold tracking-wider select-none">ID:</span>
            <code className="text-[11px] text-foreground/80 font-mono select-all truncate max-w-[80px]" title={activeProjectId}>
              {activeProjectId.slice(0, 8)}...{activeProjectId.slice(-4)}
            </code>
            <button 
              onClick={handleCopy}
              className="text-muted-foreground/70 hover:text-primary hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center p-1 rounded hover:bg-muted-foreground/10 h-6 w-6 ml-0.5"
              title="Copy Full Project ID"
            >
              {copied ? (
                <span className="text-[9px] text-emerald-500 font-sans font-bold animate-pulse">Copied!</span>
              ) : (
                <svg xmlns="http://www.w3.org/2005/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Topbar Actions & Clerk Auth Avatar */}
      <div className="flex items-center gap-5">
        {/* Realtime sync indicator */}
        <div className="hidden sm:flex items-center gap-2.5 px-3 py-1 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 rounded-full select-none">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] tracking-wider uppercase font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
            Realtime Sync
            <RefreshCw className="h-3 w-3 text-emerald-500 animate-spin [animation-duration:3s]" />
          </span>
        </div>

        {/* Action icons & User profile */}
        <div className="flex items-center gap-3">
          <button 
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/80 dark:hover:bg-muted/20 transition-all duration-300 rounded-full cursor-pointer flex items-center justify-center border border-transparent hover:border-border hover:scale-105 active:scale-95 shadow-none hover:shadow-sm"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>
          <button 
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/80 dark:hover:bg-muted/20 transition-all duration-300 rounded-full cursor-pointer flex items-center justify-center border border-transparent hover:border-border hover:scale-105 active:scale-95 shadow-none hover:shadow-sm"
            title="Documentation"
            onClick={() => router.push("https://github.com/Nur-Adnan/DevTools")}
          >
            <HelpCircle className="h-4 w-4" />
          </button>
          <ThemeToggle />
          
          <div className="h-5 w-[1px] bg-border mx-1"></div>
          
          <div className="flex items-center gap-3 select-none group pl-1">
            <div className="text-right hidden md:block">
              <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                {user?.fullName || "Admin Console"}
              </p>
              <p className="text-[10px] text-muted-foreground/80 font-mono tracking-tight mt-0.5">
                {user?.primaryEmailAddress?.emailAddress 
                  ? user.primaryEmailAddress.emailAddress.split("@")[0] 
                  : "console"}
              </p>
            </div>
            <div className="relative hover:scale-105 active:scale-95 transition-all duration-300">
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 rounded-full border border-border group-hover:border-primary/50 transition-colors shadow-sm",
                    userButtonPopoverCard: "bg-popover border border-border text-popover-foreground rounded-xl shadow-2xl",
                  }
                }} 
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
