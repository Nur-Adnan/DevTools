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

  return (
    <form 
      onSubmit={handleSubmit}
      className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white/[0.01] border border-white/[0.04] p-4 rounded-xl backdrop-blur-md"
    >
      {/* Message Search */}
      <div className="relative w-full lg:max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search log messages or stack traces..."
          className="pl-9 bg-neutral-900/40 border-neutral-800 focus-visible:ring-1 focus-visible:ring-primary text-xs h-9 text-neutral-200 placeholder:text-neutral-500"
        />
      </div>

      {/* Select Filters & Actions */}
      <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
        {/* Severity Level */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <span className="text-[10px] text-neutral-500 font-mono hidden sm:inline">LEVEL</span>
          <Select
            value={type}
            onValueChange={(val) => {
              if (val) {
                setType(val);
                applyFilters(val, range, search);
              }
            }}
          >
            <SelectTrigger className="w-full sm:w-32 bg-neutral-900/40 border-neutral-800 text-xs h-9 text-neutral-300">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-950 border-neutral-800 text-neutral-200">
              <SelectItem value="ALL" className="text-xs cursor-pointer">All Levels</SelectItem>
              <SelectItem value="INFO" className="text-xs text-emerald-400 cursor-pointer">INFO</SelectItem>
              <SelectItem value="WARN" className="text-xs text-amber-400 cursor-pointer">WARN</SelectItem>
              <SelectItem value="ERROR" className="text-xs text-rose-400 cursor-pointer">ERROR</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Time Interval */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <span className="text-[10px] text-neutral-500 font-mono hidden sm:inline">TIME RANGE</span>
          <Select
            value={range}
            onValueChange={(val) => {
              if (val) {
                setRange(val);
                applyFilters(type, val, search);
              }
            }}
          >
            <SelectTrigger className="w-full sm:w-36 bg-neutral-900/40 border-neutral-800 text-xs h-9 text-neutral-300">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-950 border-neutral-800 text-neutral-200">
              <SelectItem value="1h" className="text-xs cursor-pointer">Last 1 hour</SelectItem>
              <SelectItem value="24h" className="text-xs cursor-pointer">Last 24 hours</SelectItem>
              <SelectItem value="7d" className="text-xs cursor-pointer">Last 7 days</SelectItem>
              <SelectItem value="30d" className="text-xs cursor-pointer">Last 30 days</SelectItem>
              <SelectItem value="all" className="text-xs cursor-pointer">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Submit & Reset actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto ml-auto sm:ml-0">
          <Button
            type="submit"
            size="sm"
            className="h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/95 text-xs"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Search className="h-3.5 w-3.5 mr-1.5" />
            )}
            Search
          </Button>

          {isFiltered && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-9 px-3 bg-neutral-900/40 border-neutral-800 text-xs text-neutral-400 hover:text-white"
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
