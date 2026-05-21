import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { LogType, Prisma } from "@prisma/client";
import { buttonVariants } from "@/components/ui/button";
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  Terminal,
  Database,
  Info,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { LogsFilterBar } from "./logs-filter-bar";

interface PageProps {
  params: {
    projectId: string;
  };
  searchParams: {
    type?: string;
    range?: string;
    search?: string;
    cursor?: string;
    fingerprint?: string;
  };
}

export default async function ProjectLogsPage({ params, searchParams }: PageProps) {
  const { projectId } = params;
  const { type, range, search, cursor, fingerprint } = searchParams;

  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  // 1. Verify project ownership
  const project = await db.project.findFirst({
    where: {
      id: projectId,
      userId,
    },
  });

  if (!project) {
    redirect("/dashboard");
  }

  // 2. Parse time intervals
  let timeFilter: Date | undefined;
  if (range === "1h") {
    timeFilter = new Date(Date.now() - 60 * 60 * 1000);
  } else if (range === "24h") {
    timeFilter = new Date(Date.now() - 24 * 60 * 60 * 1000);
  } else if (range === "7d") {
    timeFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  } else if (range === "30d") {
    timeFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  } else if (!range) {
    // Default to Last 24 hours if no timeframe selected
    timeFilter = new Date(Date.now() - 24 * 60 * 60 * 1000);
  }

  // 3. Build Prisma Query Clauses
  const typeFilter = type && type !== "ALL" ? (type as LogType) : undefined;
  const whereClause: Prisma.LogWhereInput = {
    projectId,
    ...(typeFilter ? { type: typeFilter } : {}),
    ...(timeFilter ? { createdAt: { gte: timeFilter } } : {}),
    ...(fingerprint ? { fingerprint } : {}),
    ...(search
      ? {
          message: {
            contains: search,
            mode: "insensitive",
          },
        }
      : {}),
  };

  // 4. Fetch Quick statistics in the timeframe
  const stats = await db.log.groupBy({
    by: ["type"],
    where: {
      projectId,
      ...(timeFilter ? { createdAt: { gte: timeFilter } } : {}),
    },
    _count: {
      _all: true,
    },
  });

  const infoCount = stats.find((s) => s.type === "INFO")?._count._all || 0;
  const warnCount = stats.find((s) => s.type === "WARN")?._count._all || 0;
  const errorCount = stats.find((s) => s.type === "ERROR")?._count._all || 0;
  const totalCount = infoCount + warnCount + errorCount;

  // 5. Fetch Paginated logs
  const limit = 20;
  const logs = await db.log.findMany({
    where: whereClause,
    orderBy: {
      createdAt: "desc",
    },
    take: limit + 1,
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1, // skip the cursor element itself
        }
      : {}),
  });

  const hasNextPage = logs.length > limit;
  const displayedLogs = hasNextPage ? logs.slice(0, limit) : logs;
  const nextCursor = hasNextPage ? displayedLogs[displayedLogs.length - 1].id : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title Section */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h2 className="font-headline-lg text-headline-lg text-foreground font-bold">
            {project.name} <span className="text-muted-foreground font-normal">/ Logs</span>
          </h2>
          <span className="px-2 py-0.5 rounded border border-emerald-500/30 dark:border-[#00FF9C]/30 text-emerald-700 dark:text-[#00FF9C] bg-emerald-50 dark:bg-emerald-950/20 font-label-sm text-label-sm tracking-widest font-semibold uppercase pulse-status leading-none">
            LIVE
          </span>
        </div>
        <p className="text-muted-foreground font-body-md text-body-md">
          Real-time event streams and structured error tracking for production environments.
        </p>
      </div>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
        {/* Total Captured */}
        <div className="bg-card border border-border p-6 rounded-lg transition-all duration-300 hover:border-primary/50 hover:-translate-y-0.5 group">
          <h3 className="font-label-sm text-label-sm text-muted-foreground uppercase tracking-tighter mb-4">Total Captured</h3>
          <div className="flex items-end justify-between">
            <span className="font-headline-lg text-headline-lg text-foreground font-black tracking-tight leading-none">{totalCount}</span>
            <Database className="text-muted-foreground opacity-30 h-8 w-8 shrink-0 group-hover:opacity-55 transition-opacity" />
          </div>
        </div>

        {/* Info Events */}
        <div className="bg-card border border-border p-6 rounded-lg transition-all duration-300 hover:border-primary/50 hover:-translate-y-0.5 group">
          <h3 className="font-label-sm text-label-sm text-muted-foreground uppercase tracking-tighter mb-4">Info Events</h3>
          <div className="flex items-end justify-between">
            <span className="font-headline-lg text-headline-lg text-primary font-black tracking-tight leading-none">{infoCount}</span>
            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center group-hover:glow-green transition-all shrink-0">
              <Info className="text-primary h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Warnings */}
        <div className="bg-card border border-border p-6 rounded-lg transition-all duration-300 hover:border-yellow-500/50 hover:-translate-y-0.5 group">
          <h3 className="font-label-sm text-label-sm text-muted-foreground uppercase tracking-tighter mb-4">Warnings</h3>
          <div className="flex items-end justify-between">
            <span className="font-headline-lg text-headline-lg text-yellow-600 dark:text-yellow-400 font-black tracking-tight leading-none">{warnCount}</span>
            <div className="w-8 h-8 rounded bg-yellow-500/10 flex items-center justify-center group-hover:glow-yellow transition-all shrink-0">
              <AlertTriangle className="text-yellow-600 dark:text-yellow-450 h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Errors */}
        <div className="bg-card border border-border p-6 rounded-lg transition-all duration-300 hover:border-error/50 hover:-translate-y-0.5 group">
          <h3 className="font-label-sm text-label-sm text-muted-foreground uppercase tracking-tighter mb-4">Errors</h3>
          <div className="flex items-end justify-between">
            <span className="font-headline-lg text-headline-lg text-error font-black tracking-tight leading-none">{errorCount}</span>
            <div className="w-8 h-8 rounded bg-error/10 flex items-center justify-center group-hover:glow-red transition-all shrink-0">
              <AlertCircle className="text-error h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter toolbar */}
      <LogsFilterBar projectId={projectId} />

      {/* Activity Table Container */}
      <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col min-h-[400px]">
        {/* Table Header */}
        <div className="grid grid-cols-12 border-b border-border bg-muted/40 shrink-0">
          <div className="col-span-3 p-4 font-label-sm text-label-sm text-muted-foreground uppercase">Timestamp</div>
          <div className="col-span-2 p-4 font-label-sm text-label-sm text-muted-foreground uppercase">Level</div>
          <div className="col-span-5 p-4 font-label-sm text-label-sm text-muted-foreground uppercase">Message</div>
          <div className="col-span-2 p-4 font-label-sm text-label-sm text-muted-foreground uppercase text-right pr-6">Source</div>
        </div>

        {/* Table Body */}
        <div className="flex-1 flex flex-col divide-y divide-border/40">
          {displayedLogs.length === 0 ? (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center my-auto">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6 relative border border-border">
                <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping"></div>
                <Terminal className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <h4 className="font-headline-sm text-headline-sm text-foreground mb-2 font-bold">No activity detected</h4>
              <p className="font-body-md text-body-md text-muted-foreground max-w-sm leading-relaxed">
                No events or matching logs recorded in this period. Adjust your filters or wait for incoming data packets.
              </p>
              <div className="mt-8 flex gap-4">
                <Link
                  href="https://github.com/Nur-Adnan/DevTools"
                  target="_blank"
                  className="px-6 py-2 border border-border rounded font-label-md text-label-md hover:bg-muted transition-colors text-xs text-muted-foreground hover:text-foreground flex items-center justify-center"
                >
                  Documentation
                </Link>
                <Link
                  href={`/dashboard/${projectId}/logs`}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded font-label-md text-label-md font-bold hover:opacity-90 transition-all text-xs flex items-center justify-center"
                >
                  Refresh View
                </Link>
              </div>
            </div>
          ) : (
            displayedLogs.map((log) => {
              let badge;
              if (log.type === "ERROR") {
                badge = (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-450 font-mono text-[9px] font-bold leading-none">
                    <XCircle className="h-3.5 w-3.5 shrink-0" /> ERROR
                  </span>
                );
              } else if (log.type === "WARN") {
                badge = (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-yellow-200 dark:border-yellow-500/20 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-800 dark:text-yellow-400 font-mono text-[9px] font-bold leading-none">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> WARN
                  </span>
                );
              } else {
                badge = (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono text-[9px] font-bold leading-none">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> INFO
                  </span>
                );
              }

              const sourceLabel = log.source || "N/A";

              return (
                <Link
                  key={log.id}
                  href={`/dashboard/${projectId}/logs/${log.id}`}
                  className="grid grid-cols-12 hover:bg-muted/40 transition-all duration-200 items-center text-xs font-mono text-muted-foreground border-none group cursor-pointer"
                >
                  {/* Timestamp */}
                  <div className="col-span-3 p-4 font-mono text-muted-foreground group-hover:text-primary transition-colors">
                    {new Date(log.createdAt).toLocaleString(undefined, {
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    })}
                  </div>

                  {/* Level */}
                  <div className="col-span-2 p-4">
                    {badge}
                  </div>

                  {/* Message */}
                  <div className="col-span-5 p-4 truncate pr-4 font-sans text-foreground/90 group-hover:text-foreground transition-colors">
                    {log.message.length > 80 ? log.message.substring(0, 80) + "..." : log.message}
                  </div>

                  {/* Source */}
                  <div className="col-span-2 p-4 text-right pr-6 font-mono text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-full">
                    {sourceLabel}
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* Pagination Actions */}
      <div className="flex items-center justify-between mt-4">
        <div>
          {cursor && (
            <Link
              href={{
                pathname: `/dashboard/${projectId}/logs`,
                query: {
                  ...(type ? { type } : {}),
                  ...(range ? { range } : {}),
                  ...(search ? { search } : {}),
                },
              }}
              className={buttonVariants({ variant: "outline", size: "sm" }) + " bg-card border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted"}
            >
              Back to First Page
            </Link>
          )}
        </div>

        <div>
          {hasNextPage && nextCursor && (
            <Link
              href={{
                pathname: `/dashboard/${projectId}/logs`,
                query: {
                  ...(type ? { type } : {}),
                  ...(range ? { range } : {}),
                  ...(search ? { search } : {}),
                  cursor: nextCursor,
                },
              }}
              className={buttonVariants({ variant: "outline", size: "sm" }) + " bg-card border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted"}
            >
              Next Page
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          )}
        </div>
      </div>

      {/* Bottom Footer Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between py-6 border-t border-border gap-4">
        <div className="flex gap-8">
          <div>
            <span className="font-label-sm text-label-sm text-muted-foreground block mb-1 font-mono">DATA INGESTION</span>
            <span className="font-label-md text-label-md text-primary font-mono font-bold">
              {displayedLogs.length > 0 ? "0.48 KB/s" : "0.00 KB/s"}
            </span>
          </div>
          <div>
            <span className="font-label-sm text-label-sm text-muted-foreground block mb-1 font-mono">LATENCY</span>
            <span className="font-label-md text-label-md text-primary font-mono font-bold">12ms</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-1.5 w-32 bg-muted rounded-full overflow-hidden border border-border/40">
            <div className="h-full w-1/3 bg-primary animate-pulse"></div>
          </div>
          <span className="font-label-sm text-label-sm text-muted-foreground font-mono">NODE: US-EAST-1</span>
        </div>
      </div>
    </div>
  );
}
