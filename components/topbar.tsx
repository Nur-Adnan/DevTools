"use client";

import { UserButton } from "@clerk/nextjs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Plus, Bell, RefreshCw } from "lucide-react";
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
    <header className="fixed top-0 right-0 left-64 z-10 flex h-16 items-center justify-between border-b border-border/40 bg-[#09090b]/80 backdrop-blur-md px-6">
      {/* Project Switcher & Navigation */}
      <div className="flex items-center gap-4">
        {projects.length > 0 ? (
          <Select 
            value={activeProjectId} 
            onValueChange={handleProjectChange}
          >
            <SelectTrigger className="w-56 bg-neutral-900/40 border-border/40 hover:bg-neutral-900/60 focus:ring-1 focus:ring-primary h-9 text-xs">
              <SelectValue placeholder="Select Project" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-950 border-neutral-800 text-neutral-200">
              {projects.map((proj) => (
                <SelectItem 
                  key={proj.id} 
                  value={proj.id} 
                  className="hover:bg-neutral-900 text-xs cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {proj.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="text-xs text-neutral-500 italic bg-neutral-900/20 border border-neutral-800/40 px-3 py-1.5 rounded-md">
            No projects found
          </div>
        )}

        <Button 
          variant="ghost" 
          size="sm" 
          className="h-9 px-2 hover:bg-neutral-900 border border-transparent hover:border-neutral-800/60"
          onClick={() => router.push("/dashboard?create=true")}
        >
          <Plus className="h-4 w-4 mr-1 text-neutral-400" />
          <span className="text-xs font-medium text-neutral-300">New Project</span>
        </Button>
      </div>

      {/* Topbar Actions & Clerk Auth Avatar */}
      <div className="flex items-center gap-4">
        {/* Refresh rate latency ticker */}
        <div className="hidden sm:flex items-center gap-1.5 bg-neutral-900/40 border border-neutral-800/40 px-2.5 py-1 rounded-md text-[10px] text-neutral-400 font-mono">
          <RefreshCw className="h-3 w-3 text-primary animate-spin-[20s]" />
          <span>REALTIME SYNC</span>
        </div>

        {/* Notifications mock button */}
        <button className="relative p-2 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-900/60 transition-colors">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-primary" />
        </button>

        <div className="h-5 w-[1px] bg-border/40" />

        {/* Clerk User avatar button */}
        <div className="flex items-center gap-3">
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "h-8 w-8 rounded-lg border border-border/50 hover:scale-105 transition-all shadow-md",
                userButtonPopoverCard: "bg-[#09090b] border border-border/60 text-white rounded-xl shadow-2xl",
              }
            }} 
          />
        </div>
      </div>
    </header>
  );
}
