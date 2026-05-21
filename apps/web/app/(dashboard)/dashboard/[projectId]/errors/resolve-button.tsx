"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, RotateCcw, Loader2 } from "lucide-react";
import { toggleResolveLogGroup } from "@/app/actions/projects";

interface ResolveButtonProps {
  projectId: string;
  fingerprint: string;
  initialResolved: boolean;
}

export function ResolveButton({ projectId, fingerprint, initialResolved }: ResolveButtonProps) {
  const [resolved, setResolved] = useState(initialResolved);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const targetState = !resolved;
      await toggleResolveLogGroup(projectId, fingerprint, targetState);
      setResolved(targetState);
    } catch (error) {
      console.error("Failed to update resolution status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={resolved ? "outline" : "default"}
      size="sm"
      disabled={isLoading}
      onClick={handleToggle}
      className={`h-8 transition-all gap-1.5 font-semibold text-xs rounded ${
        resolved 
          ? "border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/20" 
          : "bg-primary hover:bg-primary/90 text-primary-foreground"
      }`}
    >
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : resolved ? (
        <RotateCcw className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
      ) : (
        <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />
      )}
      {resolved ? "Reopen" : "Resolve"}
    </Button>
  );
}
