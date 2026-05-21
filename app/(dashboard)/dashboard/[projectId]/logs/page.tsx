import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { LogType, Prisma } from "@prisma/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  Terminal
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
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-100 flex items-center gap-2">
            <Terminal className="h-6 w-6 text-primary" />
            Logs Explorer
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Real-time event streams and structured error tracking for{" "}
            <span className="text-neutral-200 font-semibold">{project.name}</span>.
          </p>
        </div>
      </div>

      {/* Quick Visual Stats Ribbons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/[0.01] border border-white/[0.04] rounded-xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary/40" />
          <CardContent className="p-4 flex flex-col justify-between">
            <span className="text-[10px] text-neutral-500 font-mono tracking-wider uppercase font-semibold">Total Captured</span>
            <span className="text-xl font-bold text-neutral-200 mt-1.5">{totalCount}</span>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.01] border border-white/[0.04] rounded-xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/40" />
          <CardContent className="p-4 flex flex-col justify-between">
            <span className="text-[10px] text-neutral-500 font-mono tracking-wider uppercase font-semibold">Info Events</span>
            <span className="text-xl font-bold text-emerald-400 mt-1.5">{infoCount}</span>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.01] border border-white/[0.04] rounded-xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/40" />
          <CardContent className="p-4 flex flex-col justify-between">
            <span className="text-[10px] text-neutral-500 font-mono tracking-wider uppercase font-semibold">Warnings</span>
            <span className="text-xl font-bold text-amber-400 mt-1.5">{warnCount}</span>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.01] border border-white/[0.04] rounded-xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-rose-500/40" />
          <CardContent className="p-4 flex flex-col justify-between">
            <span className="text-[10px] text-neutral-500 font-mono tracking-wider uppercase font-semibold">Errors</span>
            <span className="text-xl font-bold text-rose-400 mt-1.5">{errorCount}</span>
          </CardContent>
        </Card>
      </div>

      {/* Filter toolbar */}
      <LogsFilterBar projectId={projectId} />

      {/* Table Container */}
      <Card className="bg-white/[0.01] border border-white/[0.04] shadow-md rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-neutral-950/40 border-b border-white/[0.04]">
              <TableRow className="border-b border-white/[0.04] hover:bg-transparent">
                <TableHead className="text-neutral-400 text-xs font-mono py-3.5 pl-6 w-[180px]">TIMESTAMP</TableHead>
                <TableHead className="text-neutral-400 text-xs font-mono w-[100px]">LEVEL</TableHead>
                <TableHead className="text-neutral-400 text-xs font-mono">MESSAGE</TableHead>
                <TableHead className="text-neutral-400 text-xs font-mono w-[160px]">SOURCE</TableHead>
                <TableHead className="text-neutral-400 text-xs font-mono text-right pr-6 w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedLogs.length === 0 ? (
                <TableRow className="hover:bg-transparent border-none">
                  <TableCell colSpan={5} className="h-48 text-center text-neutral-500 text-xs font-light">
                    <Activity className="h-6 w-6 text-neutral-600 mx-auto mb-2.5 animate-pulse" />
                    No events or matching logs recorded in this period.
                  </TableCell>
                </TableRow>
              ) : (
                displayedLogs.map((log) => {
                  let badge;
                  if (log.type === "ERROR") {
                    badge = (
                      <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20 font-mono text-[9px] px-1.5 flex gap-1 items-center w-fit">
                        <XCircle className="h-3 w-3 shrink-0" /> ERROR
                      </Badge>
                    );
                  } else if (log.type === "WARN") {
                    badge = (
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 font-mono text-[9px] px-1.5 flex gap-1 items-center w-fit">
                        <AlertTriangle className="h-3 w-3 shrink-0" /> WARN
                      </Badge>
                    );
                  } else {
                    badge = (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-mono text-[9px] px-1.5 flex gap-1 items-center w-fit">
                        <CheckCircle2 className="h-3 w-3 shrink-0" /> INFO
                      </Badge>
                    );
                  }

                  const sourceLabel = log.source || "N/A";

                  return (
                    <TableRow 
                      key={log.id} 
                      className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    >
                      {/* Timestamp */}
                      <TableCell className="font-mono text-xs text-neutral-400 py-3.5 pl-6">
                        <Link href={`/dashboard/${projectId}/logs/${log.id}`} className="block">
                          {new Date(log.createdAt).toLocaleString(undefined, {
                            month: "short",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: false,
                          })}
                        </Link>
                      </TableCell>

                      {/* Level */}
                      <TableCell>
                        <Link href={`/dashboard/${projectId}/logs/${log.id}`} className="block">
                          {badge}
                        </Link>
                      </TableCell>

                      {/* Message */}
                      <TableCell className="text-xs text-neutral-200 max-w-[400px] truncate pr-4 font-mono font-light">
                        <Link href={`/dashboard/${projectId}/logs/${log.id}`} className="block">
                          {log.message}
                        </Link>
                      </TableCell>

                      {/* Source */}
                      <TableCell className="text-xs text-neutral-400 font-mono truncate max-w-[150px]">
                        <Link href={`/dashboard/${projectId}/logs/${log.id}`} className="block">
                          {sourceLabel}
                        </Link>
                      </TableCell>

                      {/* Details Quick Button */}
                      <TableCell className="text-right pr-6 py-0">
                        <Link 
                          href={`/dashboard/${projectId}/logs/${log.id}`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.04] bg-neutral-900/40 opacity-0 group-hover:opacity-100 hover:bg-neutral-800 transition-all text-neutral-400 hover:text-white"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
    </div>
  );
}
