"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
  ShieldAlert,
  Laptop,
  Gauge
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
    <div className="space-y-5 animate-fade-in">
      {/* Header action bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-border/80">
        <div className="space-y-0.5">
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            Projects
          </h1>
          <p className="text-xs text-muted-foreground max-w-2xl">
            Build, structure, and supervise all active applications integrated with PulseGuard.
          </p>
        </div>
        <Button 
          onClick={() => setIsOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-semibold shadow-sm self-start md:self-auto h-9 px-4 gap-1.5 transition-all active:scale-[0.98] rounded-lg cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          Deploy New Node
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Render Actual Projects */}
        {initialProjects.map((project) => {
          const maskSuffix = project.id.slice(-6);
          const maskedKey = `••••••••••••${maskSuffix}`;
          
          return (
            <div 
              key={project.id}
              className="animate-slide-in project-card-glass border border-border/70 p-4.5 rounded-xl transition-all duration-300 hover:scale-[1.01] hover:border-primary/45 group relative overflow-hidden flex flex-col justify-between shadow-xs bg-card/65 dark:bg-card/25"
            >
              {/* Settings Action on Hover */}
              <div className="absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Button 
                  onClick={() => handleProjectSettings(project.id)}
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/80 dark:hover:bg-muted/30 rounded-lg cursor-pointer"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>

              {/* Header inside Card */}
              <div className="flex items-start gap-3.5 mb-3.5">
                <div className="w-10 h-10 rounded-lg bg-muted border border-border/80 flex items-center justify-center shrink-0 shadow-xs">
                  <Laptop className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)] pulse-status"></div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-semibold">Active</span>
                  </div>
                </div>
              </div>

              {/* Encryption API Key Container */}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-[9.5px] text-muted-foreground/80 block mb-1.5 uppercase font-semibold tracking-wider">
                    ENCRYPTION KEY (AES-256)
                  </label>
                  <div className="flex items-center gap-2 bg-muted/30 dark:bg-zinc-950/15 border border-border p-2 px-2.5 rounded-lg text-xs text-muted-foreground select-all">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                    <code className="text-xs truncate flex-1 leading-none text-foreground font-mono font-medium">{maskedKey}</code>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`pg_live_key_details_in_settings`);
                        alert("API key can be copied during creation or regenerated in Settings.");
                      }}
                      className="ml-auto hover:text-primary transition-colors text-muted-foreground/65 cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Mockup Preview Graphic: High Quality Interactive Code Block */}
                <div className="relative h-[86px] w-full rounded-lg overflow-hidden border border-border/60 bg-muted/40 dark:bg-zinc-950/20 p-2.5 flex flex-col justify-between font-mono text-[9px] text-muted-foreground/90 group-hover:border-primary/20 transition-all duration-300">
                  <div className="flex items-center justify-between opacity-55 shrink-0 pb-1 border-b border-border/30">
                    <span className="font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> logger-sdk</span>
                    <span>Node.js v20</span>
                  </div>
                  <div className="space-y-0.5 mt-1 font-mono select-none overflow-hidden flex-1">
                    <div className="flex gap-1.5">
                      <span className="text-primary font-bold">import</span>
                      <span>{"{ createLogger }"}</span>
                      <span className="text-primary font-bold">from</span>
                      <span className="text-emerald-750 dark:text-emerald-400">&apos;@pg/sdk&apos;</span>
                    </div>
                    <div className="flex gap-1.5">
                      <span className="text-primary font-bold">const</span>
                      <span>{"logger = createLogger({ apiKey: '...' })"}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <span>{"logger.error("}</span>
                      <span className="text-emerald-750 dark:text-emerald-400">&apos;API error&apos;</span>
                      <span>{", { code: 500 })"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleManageProject(project.id)}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-semibold h-9 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all duration-300 active:scale-[0.98] cursor-pointer"
                >
                  <Terminal className="h-3.5 w-3.5 text-primary-foreground" />
                  Manage Logs
                </Button>
                <Button 
                  onClick={() => handleProjectSettings(project.id)}
                  variant="outline"
                  className="w-9 h-9 border border-border rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 dark:hover:bg-muted/20 transition-all shadow-sm active:scale-95 cursor-pointer bg-transparent"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}

        {/* Mock Placeholder: MetricsEngine Card */}
        <div className="border border-border/50 p-4.5 rounded-xl bg-muted/25 dark:bg-zinc-950/10 flex flex-col justify-between opacity-60">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="w-10 h-10 rounded-lg bg-muted/60 border border-border flex items-center justify-center">
                <Activity className="h-5 w-5 text-muted-foreground" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-muted/80 border border-border rounded-full text-muted-foreground">
                IDLE
              </span>
            </div>
            <h3 className="text-sm font-bold text-muted-foreground">MetricsEngine</h3>
            <p className="text-xs text-muted-foreground/80 mt-1.5 leading-normal">
              Historical data processor for node synchronization and background task telemetry cluster analysis.
            </p>
          </div>
          <div className="mt-5 flex gap-2">
            <div className="h-1 flex-1 bg-muted rounded-full"></div>
            <div className="h-1 flex-1 bg-muted rounded-full"></div>
          </div>
        </div>

        {/* Mock Placeholder: Initialize Node Dashed Card */}
        <div 
          onClick={() => setIsOpen(true)}
          className="border border-dashed border-2 border-border/80 p-4.5 rounded-xl bg-muted/20 dark:bg-zinc-950/5 flex flex-col justify-center items-center group cursor-pointer hover:bg-muted/40 dark:hover:bg-zinc-900/10 hover:border-primary/50 transition-all duration-300 min-h-[200px] h-full"
        >
          <div className="w-10 h-10 rounded-full border border-dashed border-border flex items-center justify-center mb-3 group-hover:border-primary transition-all duration-300">
            <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">
            Initialize Node
          </span>
        </div>
      </div>

      {/* Asymmetric System Stats Section */}
      <section className="mt-6 grid grid-cols-12 gap-5 pt-6 border-t border-border/80">
        {/* Waveform Uptime Activity Graphic */}
        <div className="col-span-12 lg:col-span-8 p-4.5 bg-card/45 dark:bg-card/20 border border-border/80 rounded-xl shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-sm font-bold text-foreground">Live Node Activity</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">Real-time status analysis of clusters</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)] pulse-status"></div>
                <span className="text-xs text-muted-foreground font-medium">Uptime: 99.98%</span>
              </div>
            </div>
          </div>
          
          {/* Mock Waveform chart */}
          <div className="h-28 flex items-end gap-1 px-1 pt-2">
            <div className="w-full bg-primary/20 h-[40%] rounded-t-xs transition-all hover:bg-primary/45"></div>
            <div className="w-full bg-primary/40 h-[60%] rounded-t-xs transition-all hover:bg-primary/65"></div>
            <div className="w-full bg-primary/30 h-[45%] rounded-t-xs transition-all hover:bg-primary/55"></div>
            <div className="w-full bg-primary/60 h-[80%] rounded-t-xs transition-all hover:bg-primary/85"></div>
            <div className="w-full bg-primary/40 h-[55%] rounded-t-xs transition-all hover:bg-primary/65"></div>
            <div className="w-full bg-primary/20 h-[30%] rounded-t-xs transition-all hover:bg-primary/45"></div>
            <div className="w-full bg-primary/50 h-[70%] rounded-t-xs transition-all hover:bg-primary/75"></div>
            <div className="w-full bg-primary/30 h-[50%] rounded-t-xs transition-all hover:bg-primary/55"></div>
            <div className="w-full bg-primary/60 h-[90%] rounded-t-xs transition-all hover:bg-primary/95"></div>
            <div className="w-full bg-primary/40 h-[65%] rounded-t-xs transition-all hover:bg-primary/65"></div>
            <div className="w-full bg-primary/30 h-[40%] rounded-t-xs transition-all hover:bg-primary/55"></div>
            <div className="w-full bg-primary/20 h-[25%] rounded-t-xs transition-all hover:bg-primary/45"></div>
          </div>
        </div>

        {/* Circular Progress Gauge */}
        <div className="col-span-12 lg:col-span-4 p-4.5 bg-card/45 dark:bg-card/20 border border-border/80 rounded-xl flex flex-col items-center justify-center shadow-xs">
          <div className="text-center w-full flex flex-col items-center">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1.5">Cluster Load</span>
            <div className="text-lg font-black text-primary">42.8%</div>
            
            <div className="mt-2.5 flex justify-center">
              <div className="w-24 h-24 rounded-full border-4 border-muted dark:border-zinc-800 flex items-center justify-center relative shadow-xs">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="stroke-muted dark:stroke-zinc-800/40"
                    strokeWidth="4"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="stroke-primary transition-all duration-1000 ease-out"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray="263.89"
                    strokeDashoffset={263.89 - (263.89 * 42.8) / 100}
                  />
                </svg>
                <div className="z-10 rounded-full bg-background w-18 h-18 border border-border flex items-center justify-center shadow-inner">
                  <Gauge className="h-6 w-6 text-primary opacity-80 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deploy Project Dialog Container Popup */}
      <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md">
          
          {!createdProject ? (
            // Phase 1: Input Project Name Form
            <form onSubmit={handleCreate} className="space-y-4 pt-1">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <FolderGit2 className="h-5 w-5 text-primary" />
                  New Project Monitor
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-1 leading-normal">
                  Establish a new isolated platform scope. This generates a cryptographically secure key to track HTTP/HTTPS request states.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2 py-1">
                <label className="text-xs font-semibold text-muted-foreground">Application Name</label>
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. mystore-api-production"
                  className="bg-background border-border focus-visible:ring-1 focus-visible:ring-primary text-xs h-10 rounded-lg"
                  disabled={loading}
                  required
                  autoFocus
                />
              </div>

              {error && (
                <div className="text-destructive text-xs bg-destructive/10 border border-destructive/20 p-2.5 rounded-lg font-medium">
                  {error}
                </div>
              )}

              <DialogFooter className="pt-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={handleCloseDialog}
                  className="text-muted-foreground hover:text-foreground text-xs h-9 rounded-lg hover:bg-muted cursor-pointer"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-semibold h-9 px-4 rounded-lg cursor-pointer"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Project"}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            // Phase 2: Credentials display (Show rawKey ONCE)
            <div className="space-y-4 pt-1">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Project Created Successfully!
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-1 leading-normal">
                  The API key has been securely generated. This is your write access token to send telemetry logs.
                </DialogDescription>
              </DialogHeader>

              {/* Danger Warning Alert Banner */}
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 dark:bg-amber-500/5 text-amber-800 dark:text-amber-400 p-3 flex items-start gap-2.5 shadow-sm">
                <ShieldAlert className="h-4.5 w-4.5 text-amber-600 dark:text-amber-550 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold">Security Warning</h4>
                  <p className="text-[10px] text-muted-foreground/80 leading-normal">
                    Please copy this API key now. For your security, **it cannot be shown again** once you close this dialog.
                  </p>
                </div>
              </div>

              {/* API Credentials Box */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-semibold flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5 text-primary" />
                    Write-Only API Key
                  </span>
                  <Badge className="text-[9px] text-emerald-600 border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-500/5 font-mono font-bold rounded-full">
                    Ready
                  </Badge>
                </div>
                
                <div className="flex items-center gap-1.5 bg-muted/60 dark:bg-zinc-950/20 border border-border p-2.5 rounded-lg font-mono text-xs shadow-inner">
                  <span className="text-foreground select-all truncate flex-1 font-mono text-xs font-medium">
                    {createdProject.rawKey}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 bg-background border border-border hover:bg-muted rounded-md transition-colors cursor-pointer flex items-center justify-center"
                    onClick={handleCopyKey}
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <div className="text-[10px] text-muted-foreground/60 flex items-center gap-1 select-none">
                  <Lock className="h-3 w-3" />
                  SHA-256 hashed credentials
                </div>
                <Button 
                  onClick={handleCloseDialog}
                  className="bg-primary text-primary-foreground hover:bg-primary/95 text-xs h-9 font-semibold px-4 rounded-lg cursor-pointer"
                >
                  I&apos;ve Saved It
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </DialogFooter>
            </div>
          )}

        </DialogContent>
      </Dialog>
    </div>
  );
}
