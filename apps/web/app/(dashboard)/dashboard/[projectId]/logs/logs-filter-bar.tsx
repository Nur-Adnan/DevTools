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
import { Search, RotateCcw, Loader2, ListFilter } from "lucide-react";

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
      className={`flex flex-col lg:flex-row items-center justify-between gap-4 bg-card border border-border p-4 rounded-lg transition-all duration-300 ${focused ? 'glow-green border-primary/30 ring-1 ring-primary/20' : ''}`}
    >
      {/* Message Search */}
      <div className="relative w-full lg:max-w-md">
        <Search className={`absolute left-3 top-2.5 h-4 w-4 transition-colors duration-200 ${focused ? 'text-primary' : 'text-muted-foreground'}`} />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search log messages or stack traces..."
          className="pl-9 bg-background border border-border focus-visible:ring-1 focus-visible:ring-primary text-xs h-9 text-foreground placeholder:text-muted-foreground rounded focus-visible:border-primary focus-visible:ring-primary/20 transition-all"
        />
      </div>

      {/* Select Filters & Actions */}
      <div className="flex flex-wrap lg:flex-nowrap items-center gap-4 w-full lg:w-auto">
        {/* Severity Level */}
        <div className="flex flex-col w-full sm:w-auto">
          <span className="font-label-sm text-label-sm text-muted-foreground uppercase tracking-wider mb-1 font-mono">Level</span>
          <Select
            value={type}
            onValueChange={(val) => {
              if (val) {
                setType(val);
                applyFilters(val, range, search);
              }
            }}
          >
            <SelectTrigger className="w-full sm:w-36 bg-background border border-border text-xs h-9 text-foreground focus:ring-1 focus:ring-primary/20 focus:border-primary rounded">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border text-foreground">
              <SelectItem value="ALL" className="text-xs cursor-pointer focus:bg-accent focus:text-accent-foreground">ALL</SelectItem>
              <SelectItem value="INFO" className="text-xs text-emerald-600 dark:text-emerald-400 cursor-pointer focus:bg-accent focus:text-accent-foreground">INFO</SelectItem>
              <SelectItem value="WARN" className="text-xs text-amber-600 dark:text-amber-400 cursor-pointer focus:bg-accent focus:text-accent-foreground">WARNING</SelectItem>
              <SelectItem value="ERROR" className="text-xs text-rose-600 dark:text-rose-450 cursor-pointer focus:bg-accent focus:text-accent-foreground">ERROR</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Time Interval */}
        <div className="flex flex-col w-full sm:w-auto">
          <span className="font-label-sm text-label-sm text-muted-foreground uppercase tracking-wider mb-1 font-mono">Time Range</span>
          <Select
            value={range}
            onValueChange={(val) => {
              if (val) {
                setRange(val);
                applyFilters(type, val, search);
              }
            }}
          >
            <SelectTrigger className="w-full sm:w-36 bg-background border border-border text-xs h-9 text-foreground focus:ring-1 focus:ring-primary/20 focus:border-primary rounded">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border text-foreground">
              <SelectItem value="1h" className="text-xs cursor-pointer focus:bg-accent focus:text-accent-foreground">1h (Last Hour)</SelectItem>
              <SelectItem value="24h" className="text-xs cursor-pointer focus:bg-accent focus:text-accent-foreground">24h (Last Day)</SelectItem>
              <SelectItem value="7d" className="text-xs cursor-pointer focus:bg-accent focus:text-accent-foreground">7d (Last Week)</SelectItem>
              <SelectItem value="30d" className="text-xs cursor-pointer focus:bg-accent focus:text-accent-foreground">30d (Last Month)</SelectItem>
              <SelectItem value="all" className="text-xs cursor-pointer focus:bg-accent focus:text-accent-foreground">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Submit & Reset actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto pt-5">
          <Button
            type="submit"
            size="sm"
            className="h-9 px-6 bg-primary text-primary-foreground hover:opacity-90 text-xs font-bold gap-2 rounded transition-colors flex items-center"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ListFilter className="h-4 w-4" />
            )}
            Search
          </Button>

          {isFiltered && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-9 px-4 bg-transparent border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
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
