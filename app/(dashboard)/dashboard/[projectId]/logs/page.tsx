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
  };
}

export default async function ProjectLogsPage({ params, searchParams }: PageProps) {
  const { projectId } = params;
  const { type, range, search, cursor } = searchParams;

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
    <div className="space-y-8 animate-fade-in terminal-grid p-6 min-h-screen rounded-xl border border-outline-variant/30 bg-[#051424]">
      {/* Page Title Section & Node ID */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h2 className="font-headline-lg text-headline-lg text-primary font-bold">
              {project.name} <span className="text-on-surface-variant font-normal">/ Logs</span>
            </h2>
            <span className="px-2 py-0.5 rounded border border-primary-container text-primary-container font-label-sm text-[10px] tracking-widest font-black uppercase pulse-status leading-none">
              LIVE
            </span>
          </div>
          <p className="text-on-surface-variant font-body-md text-body-md">
            Real-time event streams and structured error tracking for production environments.
          </p>
        </div>

        {/* Node ID Badge with copy */}
        <div className="flex items-center self-start md:self-auto shrink-0">
          <div className="flex items-center bg-surface-container-high rounded-lg border border-outline-variant px-3 py-1.5 gap-2 text-xs">
            <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">NODE ID:</span>
            <code className="font-label-sm text-label-sm text-primary font-mono select-all font-bold">{project.id}</code>
          </div>
        </div>
      </div>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Captured */}
        <div className="bg-[#16181D] border border-[#2D3139] p-6 rounded-lg transition-all duration-300 hover:border-[#3b4b3f] flex flex-col justify-between h-32 group">
          <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-mono font-bold">Total Captured</h3>
          <div className="flex items-end justify-between">
            <span className="font-headline-lg text-headline-lg text-primary font-black tracking-tight leading-none">{totalCount}</span>
            <Database className="text-on-surface-variant opacity-20 h-8 w-8 shrink-0 group-hover:opacity-35 transition-opacity" />
          </div>
        </div>

        {/* Info Events */}
        <div className="bg-[#16181D] border border-[#2D3139] p-6 rounded-lg transition-all duration-300 hover:border-primary-container flex flex-col justify-between h-32 group">
          <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-mono font-bold">Info Events</h3>
          <div className="flex items-end justify-between">
            <span className="font-headline-lg text-headline-lg text-primary-container font-black tracking-tight leading-none">{infoCount}</span>
            <div className="w-8 h-8 rounded bg-primary-container/10 flex items-center justify-center group-hover:glow-green transition-all shrink-0">
              <Info className="text-primary-container h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Warnings */}
        <div className="bg-[#16181D] border border-[#2D3139] p-6 rounded-lg transition-all duration-300 hover:border-yellow-400/50 flex flex-col justify-between h-32 group">
          <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-mono font-bold">Warnings</h3>
          <div className="flex items-end justify-between">
            <span className="font-headline-lg text-headline-lg text-yellow-400 font-black tracking-tight leading-none">{warnCount}</span>
            <div className="w-8 h-8 rounded bg-yellow-400/10 flex items-center justify-center group-hover:glow-yellow transition-all shrink-0">
              <AlertTriangle className="text-yellow-400 h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Errors */}
        <div className="bg-[#16181D] border border-[#2D3139] p-6 rounded-lg transition-all duration-300 hover:border-rose-500/50 flex flex-col justify-between h-32 group">
          <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-mono font-bold">Errors</h3>
          <div className="flex items-end justify-between">
            <span className="font-headline-lg text-headline-lg text-rose-400 font-black tracking-tight leading-none">{errorCount}</span>
            <div className="w-8 h-8 rounded bg-rose-500/10 flex items-center justify-center group-hover:glow-red transition-all shrink-0">
              <AlertCircle className="text-rose-400 h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter toolbar */}
      <LogsFilterBar projectId={projectId} />

      {/* Activity Table Container */}
      <div className="bg-[#16181D] border border-[#2D3139] rounded-lg overflow-hidden flex flex-col min-h-[400px]">
        {/* Table Header */}
        <div className="grid grid-cols-12 border-b border-[#2D3139] bg-[#1E2228]/50 text-on-surface-variant font-mono font-bold text-[10px] tracking-wider uppercase shrink-0">
          <div className="col-span-3 p-4">Timestamp</div>
          <div className="col-span-2 p-4">Level</div>
          <div className="col-span-5 p-4">Message</div>
          <div className="col-span-2 p-4 text-right pr-6">Source</div>
        </div>

        {/* Table Body */}
        <div className="flex-1 flex flex-col divide-y divide-[#2D3139]/40">
          {displayedLogs.length === 0 ? (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center my-auto">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-6 relative border border-outline-variant">
                <div className="absolute inset-0 rounded-full border border-primary-container/20 animate-ping"></div>
                <Terminal className="h-8 w-8 text-primary-container animate-pulse" />
              </div>
              <h4 className="font-headline-sm text-headline-sm text-primary mb-2 font-bold">No activity detected</h4>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-sm leading-relaxed">
                No events or matching logs recorded in this period. Adjust your filters or wait for incoming data packets.
              </p>
              <div className="mt-8 flex gap-4">
                <Link
                  href="/dashboard/settings"
                  className="px-6 py-2 border border-[#2D3139] rounded font-label-md text-label-md hover:bg-[#1A1D21] transition-colors text-xs text-on-surface-variant hover:text-white"
                >
                  Configure SDK
                </Link>
                <Link
                  href={`/dashboard/${projectId}/logs`}
                  className="px-6 py-2 bg-primary-container text-on-primary rounded font-label-md text-label-md font-bold hover:brightness-110 transition-all text-xs"
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
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-400 font-mono text-[9px] font-bold">
                    <XCircle className="h-3 w-3 shrink-0" /> ERROR
                  </span>
                );
              } else if (log.type === "WARN") {
                badge = (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-yellow-500/20 bg-yellow-500/10 text-yellow-400 font-mono text-[9px] font-bold">
                    <AlertTriangle className="h-3 w-3 shrink-0" /> WARN
                  </span>
                );
              } else {
                badge = (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-primary-container/20 bg-primary-container/10 text-primary-container font-mono text-[9px] font-bold">
                    <CheckCircle2 className="h-3 w-3 shrink-0" /> INFO
                  </span>
                );
              }

              const sourceLabel = log.source || "N/A";

              return (
                <Link
                  key={log.id}
                  href={`/dashboard/${projectId}/logs/${log.id}`}
                  className="grid grid-cols-12 hover:bg-[#1A1D21]/30 transition-all duration-200 items-center text-xs font-mono font-light text-neutral-350 border-none group cursor-pointer"
                >
                  {/* Timestamp */}
                  <div className="col-span-3 p-4 font-mono text-neutral-400 group-hover:text-primary transition-colors">
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
                  <div className="col-span-5 p-4 truncate pr-4 font-sans text-neutral-200 group-hover:text-white transition-colors">
                    {log.message}
                  </div>

                  {/* Source */}
                  <div className="col-span-2 p-4 text-right pr-6 font-mono text-neutral-400 group-hover:text-neutral-300 transition-colors truncate max-w-full">
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
              className={buttonVariants({ variant: "outline", size: "sm" }) + " bg-neutral-900/40 border-neutral-800 text-xs text-neutral-400 hover:text-white hover:bg-neutral-800/60"}
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
              className={buttonVariants({ variant: "outline", size: "sm" }) + " bg-neutral-900/40 border-neutral-800 text-xs text-neutral-400 hover:text-white hover:bg-neutral-800/60"}
            >
              Next Page
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          )}
        </div>
      </div>

      {/* Bottom Footer Metrics (Optional Decoration for Aesthetic) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between py-6 border-t border-outline-variant/30 gap-4">
        <div className="flex gap-8">
          <div>
            <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1 font-mono">DATA INGESTION</span>
            <span className="font-label-md text-label-md text-primary font-mono font-bold">
              {displayedLogs.length > 0 ? "0.48 KB/s" : "0.00 KB/s"}
            </span>
          </div>
          <div>
            <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1 font-mono">LATENCY</span>
            <span className="font-label-md text-label-md text-primary font-mono font-bold">12ms</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-1.5 w-32 bg-[#1A1D21] rounded-full overflow-hidden border border-[#2D3139]/40">
            <div className="h-full w-1/3 bg-primary-container animate-pulse"></div>
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">NODE: US-EAST-1</span>
        </div>
      </div>
    </div>
  );
}
