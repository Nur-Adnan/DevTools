import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { LogGroup } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { ResolveButton } from "./resolve-button";

interface PageProps {
  params: {
    projectId: string;
  };
  searchParams: {
    filter?: string;
  };
}

export default async function ProjectErrorsPage({ params, searchParams }: PageProps) {
  const { projectId } = params;
  const filter = searchParams.filter || "unresolved"; // default to unresolved

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

  // 2. Fetch log groups for this project
  const resolvedFilter = filter === "resolved" ? true : filter === "unresolved" ? false : undefined;

  const logGroups = await db.logGroup.findMany({
    where: {
      projectId,
      ...(resolvedFilter !== undefined ? { resolved: resolvedFilter } : {}),
    },
    orderBy: {
      lastSeen: "desc",
    },
  });

  // 3. Fetch detailed sample logs for type and message formatting
  const groupsWithDetails = await Promise.all(
    logGroups.map(async (group: LogGroup) => {
      const sampleLog = await db.log.findFirst({
        where: { fingerprint: group.fingerprint },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          type: true,
          message: true,
        },
      });
      return {
        ...group,
        type: sampleLog?.type || "ERROR",
        message: sampleLog?.message || "Unknown log signature",
        sampleLogId: sampleLog?.id,
      };
    })
  );

  // 4. Calculate some useful quick group counts
  const totalCount = await db.logGroup.count({ where: { projectId } });
  const unresolvedCount = await db.logGroup.count({ where: { projectId, resolved: false } });
  const resolvedCount = await db.logGroup.count({ where: { projectId, resolved: true } });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <h2 className="font-headline-lg text-headline-lg text-foreground font-bold">
          Error Signature Groups
        </h2>
        <p className="text-muted-foreground font-body-md text-body-md">
          PulseGuard hashes types, messages, and stack traces into distinct fingerprints to automatically group recurring events.
        </p>
      </div>

      {/* Grid of Quick Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href={`/dashboard/${projectId}/errors?filter=unresolved`}
          className="cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
        >
          <Card className={`bg-card border-border hover:border-primary/50 transition-all ${filter === "unresolved" ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20" : ""}`}>
            <CardHeader className="pb-4">
              <CardDescription className="text-xs uppercase font-semibold text-muted-foreground font-mono">Unresolved Signatures</CardDescription>
              <CardTitle className="text-3xl font-black text-primary font-mono mt-1">{unresolvedCount}</CardTitle>
            </CardHeader>
          </Card>
        </Link>
        <Link
          href={`/dashboard/${projectId}/errors?filter=resolved`}
          className="cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
        >
          <Card className={`bg-card border-border hover:border-emerald-500/50 transition-all ${filter === "resolved" ? "border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/10 ring-1 ring-emerald-500/20" : ""}`}>
            <CardHeader className="pb-4">
              <CardDescription className="text-xs uppercase font-semibold text-muted-foreground font-mono">Resolved Signatures</CardDescription>
              <CardTitle className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">{resolvedCount}</CardTitle>
            </CardHeader>
          </Card>
        </Link>
        <Link
          href={`/dashboard/${projectId}/errors?filter=all`}
          className="cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
        >
          <Card className={`bg-card border-border hover:border-indigo-500/50 transition-all ${filter === "all" ? "border-indigo-500/50 bg-indigo-50 dark:bg-indigo-950/10 ring-1 ring-indigo-500/20" : ""}`}>
            <CardHeader className="pb-4">
              <CardDescription className="text-xs uppercase font-semibold text-muted-foreground font-mono">Total Signatures</CardDescription>
              <CardTitle className="text-3xl font-black text-indigo-650 dark:text-indigo-400 font-mono mt-1">{totalCount}</CardTitle>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Main Groups Log Table */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <div>
            <CardTitle className="text-lg font-bold text-foreground">Signature Groups</CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Showing {groupsWithDetails.length} error signature{groupsWithDetails.length === 1 ? "" : "s"}
            </CardDescription>
          </div>
          {/* Simple toggle UI buttons */}
          <div className="flex bg-muted border border-border rounded-lg p-0.5 text-xs font-medium">
            <Link
              href={`/dashboard/${projectId}/errors?filter=unresolved`}
              className={`px-3 py-1.5 rounded-md transition-all ${filter === "unresolved" ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"}`}
            >
              Unresolved
            </Link>
            <Link
              href={`/dashboard/${projectId}/errors?filter=resolved`}
              className={`px-3 py-1.5 rounded-md transition-all ${filter === "resolved" ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"}`}
            >
              Resolved
            </Link>
            <Link
              href={`/dashboard/${projectId}/errors?filter=all`}
              className={`px-3 py-1.5 rounded-md transition-all ${filter === "all" ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"}`}
            >
              All
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {groupsWithDetails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <CheckCircle2 className="h-10 w-10 text-muted-foreground mb-3.5 stroke-[1.5]" />
              <h3 className="font-bold text-foreground text-sm">No Error Groups Found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
                {filter === "unresolved"
                  ? "All error signatures are marked resolved. Excellent work!"
                  : "No error signatures matched the selected resolution filter."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="border-b border-border">
                    <TableHead className="w-[120px] text-muted-foreground font-bold font-label-sm text-label-sm uppercase">Severity</TableHead>
                    <TableHead className="text-muted-foreground font-bold font-label-sm text-label-sm uppercase">Error Signature & Fingerprint</TableHead>
                    <TableHead className="w-[120px] text-right text-muted-foreground font-bold font-label-sm text-label-sm uppercase pr-6">Occurrences</TableHead>
                    <TableHead className="w-[180px] text-muted-foreground font-bold font-label-sm text-label-sm uppercase">First Seen</TableHead>
                    <TableHead className="w-[180px] text-muted-foreground font-bold font-label-sm text-label-sm uppercase">Last Seen</TableHead>
                    <TableHead className="w-[120px] text-right text-muted-foreground font-bold font-label-sm text-label-sm uppercase pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border/40">
                  {groupsWithDetails.map((group) => {
                    const badgeStyles = {
                      INFO: "border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-mono text-[9px] font-bold leading-none",
                      WARN: "border-yellow-200 dark:border-yellow-500/20 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-800 dark:text-yellow-400 font-mono text-[9px] font-bold leading-none",
                      ERROR: "border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-450 font-mono text-[9px] font-bold leading-none",
                    };

                    const firstSeenFormatted = new Date(group.firstSeen).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      second: "2-digit",
                    });

                    const lastSeenFormatted = new Date(group.lastSeen).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      second: "2-digit",
                    });

                    return (
                      <TableRow
                        key={group.id}
                        className={`border-b border-border/40 hover:bg-muted/40 transition-colors ${group.resolved ? "opacity-60" : ""}`}
                      >
                        {/* Severity Badge */}
                        <TableCell>
                          <Badge variant="outline" className={`border uppercase tracking-wider text-[10px] font-mono font-bold px-2 py-0.5 ${badgeStyles[group.type as keyof typeof badgeStyles]}`}>
                            {group.type}
                          </Badge>
                        </TableCell>

                        {/* Error Message & Fingerprint */}
                        <TableCell className="max-w-md">
                          <div className="flex flex-col gap-1">
                            <Link
                              href={`/dashboard/${projectId}/logs?fingerprint=${group.fingerprint}`}
                              className="font-semibold text-foreground hover:text-primary transition-colors text-sm truncate block"
                              title={group.message}
                            >
                              {group.message}
                            </Link>
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
                              <span>FINGERPRINT:</span>
                              <span className="select-all text-muted-foreground/80 truncate w-32 font-bold" title={group.fingerprint}>
                                {group.fingerprint.slice(0, 16)}...
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Event Count Occurrences */}
                        <TableCell className="text-right font-mono font-black text-foreground pr-6">
                          {group.count.toLocaleString()}
                        </TableCell>

                        {/* First Seen Date */}
                        <TableCell className="text-xs text-muted-foreground font-medium">
                          {firstSeenFormatted}
                        </TableCell>

                        {/* Last Seen Date */}
                        <TableCell className="text-xs text-muted-foreground font-medium">
                          {lastSeenFormatted}
                        </TableCell>

                        {/* Resolve Action Button */}
                        <TableCell className="text-right pr-6">
                          <ResolveButton
                            projectId={projectId}
                            fingerprint={group.fingerprint}
                            initialResolved={group.resolved}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
