"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, RotateCcw, Loader2 } from "lucide-react";

interface LogsFilterBarProps {
  projectId: string;
}

export function LogsFilterBar({ projectId }: LogsFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state initialized from URL parameters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [type, setType] = useState(searchParams.get("type") || "ALL");
  const [range, setRange] = useState(searchParams.get("range") || "24h");

  // Sync state if URL changes externally
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setType(searchParams.get("type") || "ALL");
    setRange(searchParams.get("range") || "24h");
  }, [searchParams]);

  const applyFilters = (newType = type, newRange = range, newSearch = search) => {
    const params = new URLSearchParams();
    
    if (newType && newType !== "ALL") {
      params.set("type", newType);
    }
    
    if (newRange && newRange !== "all") {
      params.set("range", newRange);
    }
    
    if (newSearch.trim()) {
      params.set("search", newSearch.trim());
    }

    // Always reset cursor when filters change
    startTransition(() => {
      router.push(`/dashboard/${projectId}/logs?${params.toString()}`);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const handleReset = () => {
    setSearch("");
    setType("ALL");
    setRange("24h");
    startTransition(() => {
      router.push(`/dashboard/${projectId}/logs`);
    });
  };

  const isFiltered = 
    searchParams.has("type") || 
    (searchParams.has("range") && searchParams.get("range") !== "24h") || 
    searchParams.has("search") || 
    searchParams.has("cursor");

  const [focused, setFocused] = useState(false);

  return (
    <form 
      onSubmit={handleSubmit}
      className={`flex flex-col lg:flex-row items-center justify-between gap-4 bg-[#16181D] border border-[#2D3139] p-4 rounded-lg transition-all duration-300 ${focused ? 'glow-green border-[#00ff9c]/30' : ''}`}
    >
      {/* Message Search */}
      <div className="relative w-full lg:max-w-md">
        <Search className={`absolute left-3 top-2.5 h-4 w-4 transition-colors duration-200 ${focused ? 'text-[#00ff9c]' : 'text-neutral-500'}`} />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search log messages or stack traces..."
          className="pl-9 bg-[#0A0A0B] border border-[#2D3139] focus-visible:ring-1 focus-visible:ring-primary text-xs h-9 text-neutral-200 placeholder:text-neutral-500 rounded focus-visible:border-primary-container focus-visible:ring-primary-container/20 transition-all"
        />
      </div>

      {/* Select Filters & Actions */}
      <div className="flex flex-wrap lg:flex-nowrap items-center gap-4 w-full lg:w-auto">
        {/* Severity Level */}
        <div className="flex flex-col w-full sm:w-auto">
          <span className="text-[10px] text-on-surface-variant font-mono font-bold uppercase tracking-wider mb-1">Level</span>
          <Select
            value={type}
            onValueChange={(val) => {
              if (val) {
                setType(val);
                applyFilters(val, range, search);
              }
            }}
          >
            <SelectTrigger className="w-full sm:w-36 bg-[#0A0A0B] border border-[#2D3139] text-xs h-9 text-neutral-350 focus:ring-1 focus:ring-[#00ff9c]/20 focus:border-[#00ff9c] rounded">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-950 border-[#2D3139] text-neutral-200">
              <SelectItem value="ALL" className="text-xs cursor-pointer focus:bg-surface-container-highest">ALL</SelectItem>
              <SelectItem value="INFO" className="text-xs text-emerald-400 cursor-pointer focus:bg-surface-container-highest">INFO</SelectItem>
              <SelectItem value="WARN" className="text-xs text-amber-450 cursor-pointer focus:bg-surface-container-highest">WARNING</SelectItem>
              <SelectItem value="ERROR" className="text-xs text-rose-450 cursor-pointer focus:bg-surface-container-highest">ERROR</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Time Interval */}
        <div className="flex flex-col w-full sm:w-auto">
          <span className="text-[10px] text-on-surface-variant font-mono font-bold uppercase tracking-wider mb-1">Time Range</span>
          <Select
            value={range}
            onValueChange={(val) => {
              if (val) {
                setRange(val);
                applyFilters(type, val, search);
              }
            }}
          >
            <SelectTrigger className="w-full sm:w-36 bg-[#0A0A0B] border border-[#2D3139] text-xs h-9 text-neutral-350 focus:ring-1 focus:ring-[#00ff9c]/20 focus:border-[#00ff9c] rounded">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-950 border-[#2D3139] text-neutral-200">
              <SelectItem value="1h" className="text-xs cursor-pointer focus:bg-surface-container-highest">1h (Last Hour)</SelectItem>
              <SelectItem value="24h" className="text-xs cursor-pointer focus:bg-surface-container-highest">24h (Last Day)</SelectItem>
              <SelectItem value="7d" className="text-xs cursor-pointer focus:bg-surface-container-highest">7d (Last Week)</SelectItem>
              <SelectItem value="30d" className="text-xs cursor-pointer focus:bg-surface-container-highest">30d (Last Month)</SelectItem>
              <SelectItem value="all" className="text-xs cursor-pointer focus:bg-surface-container-highest">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Submit & Reset actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto pt-5">
          <Button
            type="submit"
            size="sm"
            className="h-9 px-6 bg-surface-container-highest border border-outline-variant hover:bg-surface-container-high text-xs font-bold gap-2 text-on-background hover:text-white rounded transition-colors"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Search className="h-3.5 w-3.5 text-[#00ff9c]" />
            )}
            Search
          </Button>

          {isFiltered && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-9 px-4 bg-transparent border border-outline-variant/60 text-xs text-neutral-400 hover:text-white hover:bg-surface-container-high/40 rounded transition-colors"
              disabled={isPending}
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Reset
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
