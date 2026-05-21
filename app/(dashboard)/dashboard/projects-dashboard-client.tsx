"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  FolderGit2, 
  Plus, 
  Key, 
  Copy, 
  Check, 
  Settings, 
  Terminal, 
  Activity, 
  Lock,
  ArrowRight,
  ShieldAlert
} from "lucide-react";
import { createProject } from "@/app/actions/projects";

interface ProjectItem {
  id: string;
  name: string;
  hashedApiKey: string;
  createdAt: Date;
}

interface CreatedProjectResponse {
  success: boolean;
  project: {
    id: string;
    name: string;
    createdAt: Date;
  };
  rawKey: string;
}

interface ProjectsDashboardClientProps {
  initialProjects: ProjectItem[];
}

export function ProjectsDashboardClient({ initialProjects }: ProjectsDashboardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Create Project states
  const [isOpen, setIsOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Credentials presentation state
  const [createdProject, setCreatedProject] = useState<CreatedProjectResponse | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync state from query parameter "?create=true"
  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setIsOpen(true);
      // Clean up URL parameter to prevent recurring opening on reloads
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("create");
      router.replace(`/dashboard?${newParams.toString()}`);
    }
  }, [searchParams, router]);

  // Handle Form Submission
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await createProject(projectName);
      if (res.success) {
        setCreatedProject(res);
        setProjectName("");
        
        // Auto-select this newly created project as active
        document.cookie = `activeProjectId=${res.project.id}; path=/; max-age=31536000; SameSite=Lax`;
        router.refresh();
      }
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : "Failed to create project";
      setError(errMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKey = () => {
    if (!createdProject?.rawKey) return;
    navigator.clipboard.writeText(createdProject.rawKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Close & Clean up
  const handleCloseDialog = () => {
    setIsOpen(false);
    setCreatedProject(null);
  };

  // Set selected project stickily and go to logs
  const handleManageProject = (projectId: string) => {
    document.cookie = `activeProjectId=${projectId}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
    router.push("/dashboard/logs");
  };

  // Set selected project stickily and go to settings
  const handleProjectSettings = (projectId: string) => {
    document.cookie = `activeProjectId=${projectId}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
    router.push("/dashboard/settings");
  };

  return (
    <div className="space-y-6">
      {/* Header action bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-100 flex items-center gap-2">
            <FolderGit2 className="h-6 w-6 text-primary" />
            Projects
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Build, structure, and supervise all active applications integrated with PulseGuard.
          </p>
        </div>
        <Button 
          onClick={() => setIsOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/95 text-xs shadow-lg shadow-primary/10 self-start md:self-auto"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Create Project
        </Button>
      </div>

      {/* Projects Grid */}
      {initialProjects.length === 0 ? (
        <Card className="bg-white/[0.01] border border-white/[0.04] p-12 text-center flex flex-col items-center justify-center min-h-[350px] relative overflow-hidden rounded-xl">
          {/* Subtle background flow glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary relative z-10">
            <FolderGit2 className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-neutral-200 relative z-10">No projects yet</h3>
          <p className="text-xs text-neutral-500 mt-1.5 max-w-sm relative z-10 leading-relaxed">
            Create your first application monitoring space to generate an API key and start tracking requests instantly.
          </p>
          <Button 
            onClick={() => setIsOpen(true)}
            size="sm"
            className="mt-6 bg-primary text-primary-foreground hover:bg-primary/95 text-xs shadow-lg shadow-primary/10 relative z-10"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Create Project
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialProjects.map((project) => {
            // Mask the key based on stable details
            const maskSuffix = project.id.slice(0, 4);
            const maskedKey = `pg_live_••••••••••••${maskSuffix}`;
            
            return (
              <Card 
                key={project.id}
                className="bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-primary/20 hover:shadow-xl hover:shadow-primary/[0.02] transition-all duration-300 relative group overflow-hidden rounded-xl"
              >
                {/* Visual top border glow */}
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg text-neutral-100 group-hover:text-white transition-colors tracking-tight">
                        {project.name}
                      </h3>
                      <span className="text-[10px] text-neutral-500 block font-medium">
                        Created on {new Date(project.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/20 bg-emerald-500/5 font-mono">
                      Active
                    </Badge>
                  </div>

                  {/* Visual API credentials row */}
                  <div className="bg-neutral-950/60 border border-neutral-900 rounded-lg p-2.5 font-mono text-xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Lock className="h-3 w-3 text-neutral-500 shrink-0" />
                      <span className="text-neutral-400 select-all truncate text-[11px]">
                        {maskedKey}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[9px] text-neutral-600 bg-neutral-900/40 border-neutral-800 shrink-0">
                      AES-256
                    </Badge>
                  </div>

                  {/* Actions drawer */}
                  <div className="flex gap-2.5 pt-1">
                    <Button 
                      onClick={() => handleManageProject(project.id)}
                      size="sm" 
                      className="flex-1 bg-neutral-900/40 border border-neutral-800 hover:bg-neutral-900/80 hover:text-white text-neutral-300 text-xs h-9"
                    >
                      <Terminal className="h-3.5 w-3.5 mr-1.5 text-neutral-400" />
                      Manage Logs
                    </Button>
                    
                    <Button 
                      onClick={() => handleProjectSettings(project.id)}
                      variant="ghost"
                      size="icon" 
                      className="h-9 w-9 text-neutral-400 hover:text-white bg-neutral-900/20 border border-transparent hover:border-neutral-800 shrink-0"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* dialog container popup */}
      <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="bg-neutral-950 border-neutral-800 text-white rounded-xl shadow-2xl max-w-md p-6 overflow-hidden">
          
          {!createdProject ? (
            // Phase 1: Input Project Name Form
            <form onSubmit={handleCreate} className="space-y-4">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-neutral-100 flex items-center gap-2">
                  <FolderGit2 className="h-5 w-5 text-primary" />
                  New Project Monitor
                </DialogTitle>
                <DialogDescription className="text-neutral-400 text-xs mt-1.5 leading-relaxed">
                  Establish a new isolated platform scope. This generates a cryptographically secure key to track HTTP/HTTPS request states.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-neutral-400">Application Name</label>
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. mystore-api-production"
                  className="bg-neutral-900 border-neutral-800 focus-visible:ring-1 focus-visible:ring-primary text-xs h-10"
                  disabled={loading}
                  required
                  autoFocus
                />
              </div>

              {error && (
                <div className="text-rose-500 text-xs bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={handleCloseDialog}
                  className="text-neutral-400 hover:text-white text-xs h-9 hover:bg-neutral-900"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-9"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </form>
          ) : (
            // Phase 2: Credentials display (Show rawKey ONCE)
            <div className="space-y-5">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Project Created Successfully!
                </DialogTitle>
                <DialogDescription className="text-neutral-400 text-xs mt-1.5 leading-relaxed">
                  The API key has been securely generated. This is your write access token to send telemetry logs.
                </DialogDescription>
              </DialogHeader>

              {/* Danger Warning Alert Banner */}
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 flex items-start gap-2.5">
                <ShieldAlert className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-amber-500">Security Warning</h4>
                  <p className="text-[10px] text-neutral-400 leading-normal">
                    Please copy this API key now. For your security, **it cannot be shown again** once you close this dialog.
                  </p>
                </div>
              </div>

              {/* API Credentials Box */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400 font-semibold flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5 text-primary" />
                    Write-Only API Key
                  </span>
                  <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/20 bg-emerald-500/5 font-mono">
                    Ready
                  </Badge>
                </div>
                
                <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 p-2.5 rounded-lg font-mono text-xs">
                  <span className="text-neutral-200 select-all truncate flex-1 font-mono text-xs">
                    {createdProject.rawKey}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-neutral-400 hover:text-white shrink-0 bg-neutral-950 border border-neutral-800 hover:border-neutral-700"
                    onClick={handleCopyKey}
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="border-t border-border/10 pt-4 flex items-center justify-between gap-4">
                <div className="text-[10px] text-neutral-500 flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Bcrypt hashed credentials
                </div>
                <Button 
                  onClick={handleCloseDialog}
                  className="bg-white text-black hover:bg-neutral-200 text-xs h-9 shadow-md"
                >
                  I&apos;ve Saved It
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

        </DialogContent>
      </Dialog>
    </div>
  );
}
