"use client";

import { useState } from "react";
import { Copy, Check, Terminal } from "lucide-react";

interface StackTraceProps {
  stackTrace: string | null;
}

export function StackTrace({ stackTrace }: StackTraceProps) {
  const [copied, setCopied] = useState(false);

  if (!stackTrace) {
    return (
      <div className="text-muted-foreground font-mono text-xs italic bg-muted/40 p-4 border border-border rounded-lg">
        No stack trace or execution context captured for this event.
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(stackTrace);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <Terminal className="h-4 w-4 text-primary" />
          <span>STACK TRACE BLOCK</span>
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex h-7 px-2.5 items-center gap-1.5 rounded-lg border border-border bg-background hover:bg-muted transition-all text-[10px] text-muted-foreground hover:text-foreground font-mono"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-600 dark:text-emerald-400">COPIED</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>COPY TRACE</span>
            </>
          )}
        </button>
      </div>

      <pre className="p-5 font-mono text-xs overflow-x-auto text-rose-700 dark:text-rose-350/80 leading-relaxed bg-muted/50 dark:bg-[#0c0c0e]/60 selection:bg-rose-500/20 max-h-[450px]">
        <code>{stackTrace}</code>
      </pre>
    </div>
  );
}
