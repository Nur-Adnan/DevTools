"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Braces, Copy, Check } from "lucide-react";

interface MetadataViewerProps {
  metadata: unknown;
}

export function MetadataViewer({ metadata }: MetadataViewerProps) {
  const [copied, setCopied] = useState(false);

  if (!metadata || (typeof metadata === "object" && Object.keys(metadata as Record<string, unknown>).length === 0)) {
    return (
      <div className="text-neutral-500 font-mono text-xs italic bg-neutral-900/40 p-4 border border-white/[0.04] rounded-lg">
        No custom metadata recorded for this log event.
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(metadata, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-neutral-900/40 border border-white/[0.04] rounded-xl overflow-hidden backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-950/40 border-b border-white/[0.04]">
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
          <Braces className="h-4 w-4 text-primary" />
          <span>STRUCTURED METADATA</span>
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
              <span>COPY JSON</span>
            </>
          )}
        </button>
      </div>

      <div className="p-5 font-mono text-xs overflow-x-auto select-text text-neutral-300">
        <JSONNode value={metadata} isLast={true} />
      </div>
    </div>
  );
}

interface JSONNodeProps {
  label?: string;
  value: unknown;
  isLast?: boolean;
}

function JSONNode({ label, value, isLast }: JSONNodeProps) {
  const [isOpen, setIsOpen] = useState(true);

  const toggleOpen = () => setIsOpen(!isOpen);

  const renderLabel = () => {
    if (!label) return null;
    return <span className="text-indigo-400 font-semibold mr-1.5">&quot;{label}&quot;:</span>;
  };

  // 1. Array type
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <div className="pl-4">
          {renderLabel()}
          <span className="text-neutral-500">[]</span>
          {!isLast && <span className="text-neutral-500">,</span>}
        </div>
      );
    }

    return (
      <div className="pl-4">
        <div className="flex items-center group/node cursor-pointer -ml-4" onClick={toggleOpen}>
          <span className="text-neutral-600 group-hover/node:text-neutral-400 transition-colors">
            {isOpen ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
          </span>
          {renderLabel()}
          <span className="text-neutral-500 font-medium">Array({value.length}) [</span>
          {!isOpen && <span className="text-neutral-500"> ... ]{!isLast && ","}</span>}
        </div>
        
        {isOpen && (
          <>
            <div className="border-l border-white/[0.04] ml-[-8px] pl-4 my-1 space-y-1">
              {value.map((item, idx) => (
                <JSONNode 
                  key={idx} 
                  label={String(idx)} 
                  value={item} 
                  isLast={idx === value.length - 1} 
                />
              ))}
            </div>
            <div className="text-neutral-500">]{!isLast && ","}</div>
          </>
        )}
      </div>
    );
  }

  // 2. Object type
  if (value !== null && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj);
    if (keys.length === 0) {
      return (
        <div className="pl-4">
          {renderLabel()}
          <span className="text-neutral-500">{"{}"}</span>
          {!isLast && <span className="text-neutral-500">,</span>}
        </div>
      );
    }

    return (
      <div className="pl-4">
        <div className="flex items-center group/node cursor-pointer -ml-4" onClick={toggleOpen}>
          <span className="text-neutral-600 group-hover/node:text-neutral-400 transition-colors">
            {isOpen ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
          </span>
          {renderLabel()}
          <span className="text-neutral-500 font-medium">Object {"{"}</span>
          {!isOpen && <span className="text-neutral-500"> ... {"}"}{!isLast && ","}</span>}
        </div>

        {isOpen && (
          <>
            <div className="border-l border-white/[0.04] ml-[-8px] pl-4 my-1 space-y-1">
              {keys.map((key, idx) => (
                <JSONNode 
                  key={key} 
                  label={key} 
                  value={obj[key]} 
                  isLast={idx === keys.length - 1} 
                />
              ))}
            </div>
            <div className="text-neutral-500">{"}"}{!isLast && ","}</div>
          </>
        )}
      </div>
    );
  }

  // 3. Primative Types (string, number, boolean, null)
  return (
    <div className="pl-4">
      {renderLabel()}
      {typeof value === "string" && (
        <span className="text-emerald-400 font-medium break-all">&quot;{value}&quot;</span>
      )}
      {typeof value === "number" && (
        <span className="text-amber-400 font-medium">{value}</span>
      )}
      {typeof value === "boolean" && (
        <span className="text-sky-400 font-bold">{String(value)}</span>
      )}
      {value === null && (
        <span className="text-neutral-500 font-semibold italic">null</span>
      )}
      {value === undefined && (
        <span className="text-neutral-500 font-semibold italic">undefined</span>
      )}
      {!isLast && <span className="text-neutral-500">,</span>}
    </div>
  );
}
