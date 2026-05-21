"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Key,
  Copy,
  Check,
  Save,
  Trash2,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  FolderGit2,
  Plus
} from "lucide-react";
import { renameProject, regenerateApiKey, deleteProject } from "@/app/actions/projects";

interface ActiveProject {
  id: string;
  name: string;
  hashedApiKey: string;
}

interface ProjectSettingsClientProps {
  activeProject: ActiveProject | null;
}

export function ProjectSettingsClient({ activeProject }: ProjectSettingsClientProps) {
  const router = useRouter();

  // Rename states
  const [name, setName] = useState(activeProject?.name || "");
  const [renameLoading, setRenameLoading] = useState(false);
  const [renameError, setRenameError] = useState("");
  const [renameSuccess, setRenameSuccess] = useState(false);

  // Key regeneration states
  const [isRegenOpen, setIsRegenOpen] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);
  const [regenError, setRegenError] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Delete states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  if (!activeProject) {
    return (
      <Card className="bg-card border border-border p-12 text-center flex flex-col items-center justify-center min-h-[350px] relative overflow-hidden rounded-xl animate-fade-in">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary relative z-10">
          <FolderGit2 className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-foreground relative z-10">No active project</h3>
        <p className="text-xs text-muted-foreground mt-1.5 max-w-sm relative z-10 leading-relaxed">
          Create or select a project to configure application profiles, security credentials, and alert parameters.
        </p>
        <Button 
          onClick={() => router.push("/dashboard?create=true")}
          size="sm"
          className="mt-6 bg-primary text-primary-foreground hover:opacity-90 text-xs relative z-10 rounded font-semibold"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Create Project
        </Button>
      </Card>
    );
  }

  // Handle Rename Form
  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim() === activeProject.name) return;

    setRenameLoading(true);
    setRenameError("");
    setRenameSuccess(false);

    try {
      const res = await renameProject(activeProject.id, name);
      if (res.success) {
        setRenameSuccess(true);
        router.refresh();
        setTimeout(() => setRenameSuccess(false), 3000);
      }
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : "Failed to rename project";
      setRenameError(errMessage);
    } finally {
      setRenameLoading(false);
    }
  };

  // Handle API Key Regeneration
  const handleRegenerate = async () => {
    setRegenLoading(true);
    setRegenError("");

    try {
      const res = await regenerateApiKey(activeProject.id);
      if (res.success) {
        setGeneratedKey(res.rawKey);
        router.refresh();
      }
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : "Failed to regenerate API key";
      setRegenError(errMessage);
    } finally {
      setRegenLoading(false);
    }
  };

  const handleCopyNewKey = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCloseRegen = () => {
    setIsRegenOpen(false);
    setGeneratedKey(null);
    setRegenError("");
  };

  // Handle Project Deletion
  const handleDelete = async () => {
    setDeleteLoading(true);
    setDeleteError("");

    try {
      const res = await deleteProject(activeProject.id);
      if (res.success) {
        // Clear selected project cookie state
        document.cookie = `activeProjectId=; path=/; max-age=0; SameSite=Lax`;
        setIsDeleteOpen(false);
        router.refresh();
        router.push("/dashboard");
      }
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : "Failed to delete project";
      setDeleteError(errMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  const maskSuffix = activeProject.id.slice(0, 4);
  const maskedKey = `pg_live_••••••••••••${maskSuffix}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-headline-lg text-headline-lg text-foreground font-bold">
          Project Settings
        </h2>
        <p className="text-muted-foreground font-body-md text-body-md">
          Configure project configurations, credentials, API endpoints, and notification alerts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Project Profile */}
          <Card className="bg-card border-border shadow-md">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-sm font-bold text-foreground">Project Profile</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Update workspace parameters for this project</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleRename} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Project Name</label>
                  <Input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background border-border focus-visible:ring-1 focus-visible:ring-primary text-xs h-9 text-foreground placeholder:text-muted-foreground"
                    disabled={renameLoading}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Unique Project ID</label>
                  <Input 
                    value={activeProject.id} 
                    disabled
                    className="bg-muted border-border text-muted-foreground font-mono text-[11px] h-9 cursor-not-allowed"
                  />
                </div>

                {renameError && (
                  <div className="text-rose-600 dark:text-rose-455 text-xs bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-2.5 rounded-lg">
                    {renameError}
                  </div>
                )}

                {renameSuccess && (
                  <div className="text-emerald-700 dark:text-emerald-400 text-xs bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-2.5 rounded-lg">
                    Project renamed successfully!
                  </div>
                )}

                <Button 
                  type="submit"
                  size="sm" 
                  className="bg-primary text-primary-foreground hover:opacity-90 text-xs h-9 rounded font-semibold"
                  disabled={renameLoading || name.trim() === activeProject.name}
                >
                  <Save className="h-3.5 w-3.5 mr-2" />
                  {renameLoading ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Destructive zone */}
          <Card className="bg-rose-50/20 dark:bg-red-950/5 border border-rose-200 dark:border-red-500/10 shadow-md">
            <CardHeader className="border-b border-rose-200 dark:border-red-500/10 pb-4">
              <CardTitle className="text-sm font-bold text-rose-700 dark:text-red-400">Danger Zone</CardTitle>
              <CardDescription className="text-xs text-rose-600/80 dark:text-red-500/60">Permanently delete this platform space and all cached event logs</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Deleting this project is irreversible. It instantly revokes access for all external SDK clients utilizing the API key and cascades to erase **all logs permanently** from the database.
              </p>
              <Button 
                type="button"
                onClick={() => setIsDeleteOpen(true)}
                className="bg-rose-600 hover:bg-rose-700 dark:bg-red-500 dark:hover:bg-red-600 text-white text-xs h-9 font-semibold rounded"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Delete Project
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* API Credentials Sidebar Card */}
        <div className="space-y-6">
          <Card className="bg-card border-border shadow-md">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-sm font-bold text-foreground">API Credentials</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Authenticating SDK clients tracking API events</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              
              {/* API Key visual display */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-semibold flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5 text-primary" />
                    Write-Only API Key
                  </span>
                  <Badge variant="outline" className="text-[9px] text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5 font-mono leading-none">
                    Active
                  </Badge>
                </div>
                
                <div className="flex items-center gap-1.5 bg-background border border-border p-2.5 rounded-lg font-mono text-xs">
                  <span className="text-muted-foreground select-all truncate flex-1 text-[11px]">
                    {maskedKey}
                  </span>
                  <Badge variant="outline" className="text-[9px] text-muted-foreground bg-muted border-border shrink-0 font-mono leading-none">
                    AES-256
                  </Badge>
                </div>
                
                <span className="text-[9px] text-muted-foreground block leading-normal mt-1">
                  Used by our Next.js, FastAPI, or Express middleware client configurations. Do not share.
                </span>
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <span className="text-xs font-semibold text-foreground block">Rotate API Access</span>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  If your API key was compromised or you require routine credential rotation, regenerate the key.
                </p>
                <Button 
                  type="button"
                  onClick={() => setIsRegenOpen(true)}
                  variant="outline" 
                  className="w-full bg-background border-border text-[10px] h-8 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  Regenerate API Key
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>

      {/* dialog regeneration popup */}
      <Dialog open={isRegenOpen} onOpenChange={handleCloseRegen}>
        <DialogContent className="bg-card border-border text-foreground rounded-xl shadow-2xl max-w-md p-6 overflow-hidden">
          
          {!generatedKey ? (
            // Phase 1: Invalidation Confirmation
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-amber-500" />
                  Regenerate API Key?
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-xs mt-1.5 leading-relaxed">
                  Are you absolutely sure you want to rotate access credentials for <span className="text-foreground font-semibold">{activeProject.name}</span>?
                </DialogDescription>
              </DialogHeader>

              {/* Warnings */}
              <div className="rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5 p-3 flex items-start gap-2.5">
                <ShieldAlert className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-red-700 dark:text-red-400">Critical Effect</h4>
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    This action will **instantly invalidate** the existing API key. All applications, websites, and backend servers currently sending event logs with the old key will fail immediately.
                  </p>
                </div>
              </div>

              {regenError && (
                <div className="text-rose-600 dark:text-rose-455 text-xs bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-2.5 rounded-lg">
                  {regenError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={handleCloseRegen}
                  className="text-muted-foreground hover:text-foreground text-xs h-9 hover:bg-muted rounded font-semibold"
                  disabled={regenLoading}
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  onClick={handleRegenerate}
                  className="bg-rose-600 hover:bg-rose-700 dark:bg-red-500 dark:hover:bg-red-600 text-white text-xs h-9 shadow-md rounded font-semibold"
                  disabled={regenLoading}
                >
                  {regenLoading ? "Regenerating..." : "Yes, Regenerate Key"}
                </Button>
              </div>
            </div>
          ) : (
            // Phase 2: Show rawKey ONCE
            <div className="space-y-5">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  API Key Rotated Successfully
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-xs mt-1.5 leading-relaxed">
                  Your new credentials have been generated. Update your environment configs immediately.
                </DialogDescription>
              </DialogHeader>

              {/* Danger Warning Alert Banner */}
              <div className="rounded-lg border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/5 p-3 flex items-start gap-2.5">
                <ShieldAlert className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400">Action Required</h4>
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    Please copy this new API key now. **It will not be shown again** once you exit this dialog.
                  </p>
                </div>
              </div>

              {/* API Credentials Box */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-semibold flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5 text-primary" />
                    New API Key
                  </span>
                  <Badge variant="outline" className="text-[9px] text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5 font-mono leading-none">
                    Rotated
                  </Badge>
                </div>
                
                <div className="flex items-center gap-1.5 bg-background border border-border p-2.5 rounded-lg font-mono text-xs">
                  <span className="text-foreground select-all truncate flex-1 font-mono text-xs">
                    {generatedKey}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 bg-background border border-border hover:bg-muted rounded"
                    onClick={handleCopyNewKey}
                  >
                    {copiedKey ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="border-t border-border pt-4 flex justify-end">
                <Button 
                  onClick={handleCloseRegen}
                  className="bg-foreground text-background hover:opacity-95 text-xs h-9 shadow-md rounded font-semibold"
                >
                  I&apos;ve Saved It
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

        </DialogContent>
      </Dialog>

      {/* dialog delete popup */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="bg-card border-border text-foreground rounded-xl shadow-2xl max-w-md p-6 overflow-hidden">
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-500" />
                Delete Project?
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs mt-1.5 leading-relaxed">
                Confirm that you wish to permanently destroy the platform workspace: <span className="text-foreground font-semibold">{activeProject.name}</span>.
              </DialogDescription>
            </DialogHeader>

            {/* Invalidation details */}
            <div className="rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5 p-3 flex items-start gap-2.5">
              <ShieldAlert className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-red-700 dark:text-red-400">Irreversible Action</h4>
                <p className="text-[10px] text-muted-foreground leading-normal">
                  All databases and records associated with this project will be deleted immediately. **There is no way to recover this data.**
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="text-rose-600 dark:text-rose-455 text-xs bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-2.5 rounded-lg">
                {deleteError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsDeleteOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xs h-9 hover:bg-muted rounded font-semibold"
                disabled={deleteLoading}
              >
                Cancel
              </Button>
              <Button 
                type="button"
                onClick={handleDelete}
                className="bg-rose-600 hover:bg-rose-700 dark:bg-red-500 dark:hover:bg-red-600 text-white text-xs h-9 shadow-md font-semibold rounded"
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Permanently Delete Project"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
