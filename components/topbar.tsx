"use client";

import { UserButton } from "@clerk/nextjs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Plus, Bell, RefreshCw, Terminal, HelpCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface TopbarProps {
  projects: Array<{ id: string; name: string }>;
  activeProjectId?: string;
}

export function Topbar({ projects = [], activeProjectId }: TopbarProps) {
  const router = useRouter();

  // Handle Project Switching
  const handleProjectChange = (projectId: string | null) => {
    if (!projectId) return;
    // Set sticky cookie for active project
    document.cookie = `activeProjectId=${projectId}; path=/; max-age=31536000; SameSite=Lax`;
    
    // Refresh page / router to load dynamic project statistics
    router.refresh();
  };

  return (
    <header className="fixed top-0 right-0 left-64 z-40 flex h-16 items-center justify-between border-b border-outline-variant bg-surface px-6 backdrop-blur-md">
      {/* Project Switcher & Search command */}
      <div className="flex items-center gap-6">
        {projects.length > 0 ? (
          <Select 
            value={activeProjectId} 
            onValueChange={handleProjectChange}
          >
            <SelectTrigger className="w-56 bg-surface-container-lowest border-outline-variant hover:bg-surface-container/50 focus:ring-1 focus:ring-[#00ff9c] text-xs h-9 font-bold text-on-background">
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
                    <span className="h-2 w-2 rounded-full bg-primary-container pulse-status" />
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

        <Button 
          variant="ghost" 
          size="sm" 
          className="h-9 px-3 hover:bg-surface-container-high border border-outline-variant bg-surface-container-lowest text-on-background hover:text-white transition-all text-xs"
          onClick={() => router.push("/dashboard?create=true")}
        >
          <Plus className="h-4.5 w-4.5 mr-1.5 text-[#00ff9c]" />
          New Project
        </Button>

        {/* Mock visual command jump bar */}
        <div className="hidden lg:flex items-center h-8 bg-surface-container-lowest border border-outline-variant px-2 rounded-lg gap-1.5">
          <Search className="h-3.5 w-3.5 text-on-surface-variant" />
          <input 
            className="bg-transparent border-none focus:outline-none focus:ring-0 text-[11px] font-mono text-on-surface-variant placeholder-on-surface-variant w-40" 
            placeholder="Jump to command..." 
            type="text"
            readOnly
          />
        </div>
      </div>

      {/* Topbar Actions & Clerk Auth Avatar */}
      <div className="flex items-center gap-4">
        {/* Realtime sync indicator */}
        <div className="hidden sm:flex items-center gap-1.5 bg-surface-container-lowest border border-outline-variant px-2.5 py-1 rounded-md text-[10px] text-on-surface-variant font-mono">
          <RefreshCw className="h-3 w-3 text-[#00ff9c] animate-spin-[20s]" />
          <span className="font-bold tracking-wider">SYNCING NODE</span>
        </div>

        {/* Buttons strip */}
        <div className="flex gap-1.5 mr-2 border-r border-outline-variant pr-4">
          <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors rounded-lg">
            <Bell className="h-4.5 w-4.5" />
          </button>
          <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors rounded-lg" onClick={() => router.push("/dashboard/logs")}>
            <Terminal className="h-4.5 w-4.5" />
          </button>
          <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors rounded-lg">
            <HelpCircle className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Clerk User avatar button */}
        <div className="flex items-center">
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-8 h-8 rounded-lg border border-outline-variant hover:scale-105 transition-all shadow-md",
                userButtonPopoverCard: "bg-surface-container-high border border-outline-variant text-white rounded-xl shadow-2xl",
              }
            }} 
          />
        </div>
      </div>
    </header>
  );
}
