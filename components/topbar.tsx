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
    <header className="flex justify-between items-center w-full px-margin-desktop bg-surface h-16 border-b border-outline-variant shrink-0 z-50">
      {/* Project Switcher & Copyable Project ID Badge */}
      <div className="flex items-center gap-4">
        {projects.length > 0 ? (
          <Select 
            value={activeProjectId} 
            onValueChange={handleProjectChange}
          >
            <SelectTrigger className="w-48 bg-surface-container-high border border-outline-variant hover:bg-surface-container-highest/60 focus:ring-1 focus:ring-[#00ff9c] text-xs h-9 font-bold text-on-background rounded">
              <SelectValue placeholder="Select Project" />
            </SelectTrigger>
            <SelectContent className="bg-surface-container-high border-outline-variant text-on-background">
              {projects.map((proj) => (
                <SelectItem 
                  key={proj.id} 
                  value={proj.id} 
                  className="hover:bg-surface-container-highest text-xs cursor-pointer focus:bg-surface-container-highest"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-container pulse-status" />
                    {proj.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="text-xs text-on-surface-variant italic bg-surface-container-lowest border border-outline-variant px-3 py-1.5 rounded-md">
            No nodes configured
          </div>
        )}

        {/* Dynamic Project ID Badge with Copy trigger */}
        {activeProjectId && (
          <div className="flex items-center bg-surface-container-high rounded border border-outline-variant px-3 py-1.5 gap-2 text-xs font-mono h-9">
            <span className="font-label-sm text-label-sm text-on-surface-variant">ID:</span>
            <code className="font-label-sm text-label-sm text-primary select-all max-w-[140px] truncate" title={activeProjectId}>
              {activeProjectId}
            </code>
            <button 
              onClick={handleCopy}
              className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer flex items-center justify-center h-4 w-4"
              title="Copy Project ID"
            >
              {copied ? (
                <span className="text-[9px] text-[#00ff9c] font-sans font-bold">Copied!</span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Topbar Actions & Clerk Auth Avatar */}
      <div className="flex items-center gap-6">
        {/* Realtime sync indicator */}
        <div className="hidden sm:flex items-center gap-2 text-primary-fixed-dim">
          <RefreshCw className="h-4 w-4 text-[#00ff9c] animate-spin" />
          <span className="font-label-sm text-label-sm tracking-widest uppercase font-mono">REALTIME SYNC</span>
        </div>

        {/* Action icons & User profile */}
        <div className="flex items-center gap-4">
          <button 
            className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-highest transition-colors rounded-full cursor-pointer flex items-center justify-center"
            title="Notifications"
          >
            <Bell className="h-4.5 w-4.5" />
          </button>
          <button 
            className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-highest transition-colors rounded-full cursor-pointer flex items-center justify-center"
            title="Documentation"
            onClick={() => router.push("https://github.com/Nur-Adnan/DevTools")}
          >
            <HelpCircle className="h-4.5 w-4.5" />
          </button>
          <div className="h-8 w-[1px] bg-outline-variant mx-2"></div>
          
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="text-right hidden sm:block">
              <p className="font-label-md text-label-md text-primary font-bold">{user?.fullName || "Admin Console"}</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant opacity-85 font-mono">
                {user?.primaryEmailAddress?.emailAddress ? user.primaryEmailAddress.emailAddress.split("@")[0] : "DevTools Context"}
              </p>
            </div>
            <div className="relative hover:scale-105 transition-all">
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 rounded border border-outline-variant group-hover:border-primary transition-colors",
                    userButtonPopoverCard: "bg-surface-container-high border border-outline-variant text-white rounded-xl shadow-2xl",
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
