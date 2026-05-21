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
      <div className="text-neutral-500 font-mono text-xs italic bg-neutral-900/40 p-4 border border-white/[0.04] rounded-lg">
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
    <div className="bg-neutral-900/40 border border-white/[0.04] rounded-xl overflow-hidden backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-950/40 border-b border-white/[0.04]">
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
          <Terminal className="h-4 w-4 text-primary" />
          <span>STACK TRACE BLOCK</span>
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex h-7 px-2.5 items-center gap-1.5 rounded-lg border border-white/[0.04] bg-neutral-900/60 hover:bg-neutral-800 transition-all text-[10px] text-neutral-400 hover:text-white font-mono"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400">COPIED</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>COPY TRACE</span>
            </>
          )}
        </button>
      </div>

      <pre className="p-5 font-mono text-xs overflow-x-auto text-rose-300/80 leading-relaxed bg-[#0c0c0e]/60 selection:bg-rose-500/20 max-h-[450px]">
        <code>{stackTrace}</code>
      </pre>
    </div>
  );
}
