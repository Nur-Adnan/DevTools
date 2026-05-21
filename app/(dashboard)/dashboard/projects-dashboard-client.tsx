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
    <div className="space-y-12 animate-fade-in">
      {/* Header action bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-outline-variant">
        <div className="space-y-1">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-2 flex items-center gap-2.5">
            Projects
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Build, structure, and supervise all active applications integrated with PulseGuard.
          </p>
        </div>
        <Button 
          onClick={() => setIsOpen(true)}
          className="bg-primary-container text-on-primary hover:brightness-110 text-xs font-bold shadow-lg shadow-primary-container/10 self-start md:self-auto h-10 px-5 gap-2 transition-all active:scale-[0.98] rounded-lg"
        >
          <Plus className="h-4.5 w-4.5 stroke-[3]" />
          Deploy New Node
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Render Actual Projects */}
        {initialProjects.map((project) => {
          const maskSuffix = project.id.slice(0, 4);
          const maskedKey = `pg_live_••••••••••••${maskSuffix}`;
          
          return (
            <div 
              key={project.id}
              className="animate-slide-in project-card-glass border border-outline-variant p-6 rounded-lg transition-all duration-300 hover:scale-[1.02] hover:border-primary-container/50 group relative overflow-hidden flex flex-col justify-between"
            >
              {/* Settings Action on Hover */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Button 
                  onClick={() => handleProjectSettings(project.id)}
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-on-surface-variant hover:text-primary hover:bg-surface-container-high/60 rounded-lg"
                >
                  <Settings className="h-4.5 w-4.5" />
                </Button>
              </div>

              {/* Header inside Card */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded bg-surface-container-highest border border-outline-variant flex items-center justify-center shrink-0">
                  <Laptop className="h-6 w-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-headline-sm text-headline-sm text-primary group-hover:text-white transition-colors truncate">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-container pulse-status"></div>
                    <span className="font-label-sm text-label-sm text-primary-container uppercase tracking-widest">Active</span>
                  </div>
                </div>
              </div>

              {/* Encryption API Key Container */}
              <div className="space-y-4 mb-8">
                <div>
                  <label className="font-label-sm text-label-sm text-on-surface-variant block mb-2 uppercase">
                    ENCRYPTION KEY (AES-256)
                  </label>
                  <div className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant p-3 rounded font-label-md text-on-surface-variant select-all">
                    <Lock className="h-3.5 w-3.5 text-on-surface-variant shrink-0" />
                    <code className="font-label-md truncate flex-1 leading-none">{maskedKey}</code>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`pg_live_key_details_in_settings`);
                        alert("API key can be copied during creation or regenerated in Settings.");
                      }}
                      className="ml-auto hover:text-primary transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Mockup Preview Graphic */}
                <div className="relative h-24 w-full rounded overflow-hidden border border-outline-variant/30 bg-surface-container-lowest">
                  <img 
                    alt={`${project.name} preview`}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 opacity-40 group-hover:opacity-80"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUOsmx-0UeezNjR-UNrNS6LPU-ZlVF8WLwTatC5Ienm7InjbBwJ_u3Oxm2KMRMXHg53JZ8xBc8v6KPKsl0omsrEKFs4wTx0HFoPy-e57ojBUE1YTIq67JYMhm87Ckuvy005M4in8jFRo21It6ahpP0zLuz72PhhEUvUFRrjOOI8Ccqvc3B70JB_dSTtX_tnF_3c8yQLkPfCY_dpKckyELIXxVG3NChJioocq_hGitDJgNckGqg2K4LMyjkKNC6V84-kKksLfX_Vv9p"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button 
                  onClick={() => handleManageProject(project.id)}
                  className="flex-1 bg-surface-container-highest border border-outline-variant text-primary px-4 py-2 rounded font-label-md hover:bg-surface-container-high transition-all flex items-center justify-center gap-2"
                >
                  <Terminal className="h-3.5 w-3.5 text-primary" />
                  Manage Logs
                </Button>
                <Button 
                  onClick={() => handleProjectSettings(project.id)}
                  variant="outline"
                  className="w-10 h-10 border border-outline-variant rounded flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-all bg-transparent hover:bg-surface-container-high/40 shrink-0"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}

        {/* Mock Placeholder: MetricsEngine Card */}
        <div className="border border-outline-variant/30 p-6 rounded-lg bg-surface-container-low/50 flex flex-col justify-between opacity-60">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded bg-surface-container border border-outline-variant flex items-center justify-center">
                <Activity className="h-5 w-5 text-on-surface-variant" />
              </div>
              <span className="font-label-sm text-label-sm px-2 py-1 bg-surface-container border border-outline-variant rounded text-on-surface-variant">
                IDLE
              </span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface-variant">MetricsEngine</h3>
            <p className="font-body-md text-body-md text-on-surface-variant/70 mt-2 leading-relaxed">
              Historical data processor for node synchronization and background task telemetry cluster analysis.
            </p>
          </div>
          <div className="mt-8 flex gap-2">
            <div className="h-1 flex-1 bg-outline-variant/30 rounded-full"></div>
            <div className="h-1 flex-1 bg-outline-variant/30 rounded-full"></div>
          </div>
        </div>

        {/* Mock Placeholder: Initialize Node Dashed Card */}
        <div 
          onClick={() => setIsOpen(true)}
          className="border border-outline-variant/30 p-6 rounded-lg bg-surface-container-low/50 flex flex-col justify-center items-center border-dashed border-2 group cursor-pointer hover:bg-surface-container-high/40 transition-colors min-h-[300px]"
        >
          <div className="w-12 h-12 rounded-full border border-dashed border-outline-variant flex items-center justify-center mb-4 group-hover:border-primary transition-colors">
            <Plus className="h-5 w-5 text-on-surface-variant group-hover:text-primary" />
          </div>
          <span className="font-label-md text-label-md text-on-surface-variant group-hover:text-primary">
            Initialize Node
          </span>
        </div>
      </div>

      {/* Asymmetric System Stats Section */}
      <section className="mt-16 grid grid-cols-12 gap-6 pt-12 border-t border-outline-variant">
        {/* Waveform Uptime Activity Graphic */}
        <div className="col-span-12 lg:col-span-8 p-6 bg-surface-container border border-outline-variant rounded-lg">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="font-headline-sm text-headline-sm text-primary">Live Node Activity</h4>
              <p className="font-label-sm text-label-sm text-on-surface-variant mt-1 font-mono">Real-time status analysis of clusters</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary-container pulse-status"></div>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Uptime: 99.98%</span>
              </div>
            </div>
          </div>
          
          {/* Mock Waveform chart */}
          <div className="h-32 flex items-end gap-1.5 px-2">
            <div className="w-full bg-primary-container/20 h-[40%] rounded-t-sm transition-all hover:bg-primary-container/40"></div>
            <div className="w-full bg-primary-container/40 h-[60%] rounded-t-sm transition-all hover:bg-primary-container/60"></div>
            <div className="w-full bg-primary-container/30 h-[45%] rounded-t-sm transition-all hover:bg-primary-container/50"></div>
            <div className="w-full bg-primary-container/60 h-[80%] rounded-t-sm transition-all hover:bg-primary-container/80"></div>
            <div className="w-full bg-primary-container/40 h-[55%] rounded-t-sm transition-all hover:bg-primary-container/60"></div>
            <div className="w-full bg-primary-container/20 h-[30%] rounded-t-sm transition-all hover:bg-primary-container/40"></div>
            <div className="w-full bg-primary-container/50 h-[70%] rounded-t-sm transition-all hover:bg-primary-container/70"></div>
            <div className="w-full bg-primary-container/30 h-[50%] rounded-t-sm transition-all hover:bg-primary-container/50"></div>
            <div className="w-full bg-primary-container/60 h-[90%] rounded-t-sm transition-all hover:bg-primary-container/90"></div>
            <div className="w-full bg-primary-container/40 h-[65%] rounded-t-sm transition-all hover:bg-primary-container/65"></div>
            <div className="w-full bg-primary-container/30 h-[40%] rounded-t-sm transition-all hover:bg-primary-container/45"></div>
            <div className="w-full bg-primary-container/20 h-[25%] rounded-t-sm transition-all hover:bg-primary-container/35"></div>
          </div>
        </div>

        {/* Circular Progress Gauge */}
        <div className="col-span-12 lg:col-span-4 p-6 bg-surface-container border border-outline-variant rounded-lg flex flex-col items-center justify-center">
          <div className="text-center w-full flex flex-col items-center">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">Cluster Load</span>
            <div className="font-headline-lg text-headline-lg text-primary font-black">42.8%</div>
            
            <div className="mt-4 flex justify-center">
              <div className="w-32 h-32 rounded-full border-4 border-outline-variant flex items-center justify-center relative">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="#122131"
                    strokeWidth="4"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="#00ff9c"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray="263.89"
                    strokeDashoffset={263.89 - (263.89 * 42.8) / 100}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="z-10 rounded-full bg-surface-container-lowest w-24 h-24 border border-outline-variant flex items-center justify-center shadow-inner">
                  <Gauge className="h-8 w-8 text-primary-container opacity-80" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deploy Project Dialog Container Popup */}
      <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="bg-neutral-950 border-neutral-800 text-white rounded-xl shadow-2xl max-w-md p-6 overflow-hidden">
          
          {!createdProject ? (
            // Phase 1: Input Project Name Form
            <form onSubmit={handleCreate} className="space-y-4">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-neutral-100 flex items-center gap-2">
                  <FolderGit2 className="h-5 w-5 text-[#00ff9c]" />
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
                  className="bg-neutral-900 border-neutral-800 focus-visible:ring-1 focus-visible:ring-[#00ff9c] text-xs h-10"
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
                  className="bg-[#00ff9c] text-[#002110] hover:bg-[#00ff9c]/90 text-xs font-bold h-9 px-4"
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
                <DialogTitle className="text-lg font-bold text-[#00ff9c] flex items-center gap-2">
                  <Activity className="h-5 w-5 text-[#00ff9c]" />
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
                    <Key className="h-3.5 w-3.5 text-[#00ff9c]" />
                    Write-Only API Key
                  </span>
                  <Badge className="text-[9px] text-[#00ff9c] border-[#00ff9c]/20 bg-[#00ff9c]/5 font-mono">
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
                    className="h-8 w-8 text-neutral-400 hover:text-white shrink-0 bg-neutral-950 border border-neutral-800 hover:border-neutral-750"
                    onClick={handleCopyKey}
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-[#00ff9c]" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="border-t border-border/10 pt-4 flex items-center justify-between gap-4">
                <div className="text-[10px] text-neutral-500 flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  SHA-256 hashed credentials
                </div>
                <Button 
                  onClick={handleCloseDialog}
                  className="bg-white text-black hover:bg-neutral-200 text-xs h-9 font-bold px-4"
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
