import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
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
    logGroups.map(async (group) => {
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
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-neutral-50 to-neutral-400 bg-clip-text text-transparent">
            Error Signature Groups
          </h1>
          <p className="text-sm text-neutral-400 mt-1.5">
            PulseGuard hashes types, messages, and stack traces into distinct fingerprints to automatically group recurring events.
          </p>
        </div>
      </div>

      {/* Grid of Quick Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link 
          href={`/dashboard/${projectId}/errors?filter=unresolved`}
          className="cursor-pointer transition-all duration-200 hover:scale-[1.01]"
        >
          <Card className={`bg-[#0c0c0e]/80 border-neutral-800 backdrop-blur-md transition-colors ${filter === "unresolved" ? "border-primary/40 bg-primary/5" : ""}`}>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase font-semibold text-neutral-400">Unresolved Signatures</CardDescription>
              <CardTitle className="text-3xl font-black text-primary font-mono">{unresolvedCount}</CardTitle>
            </CardHeader>
          </Card>
        </Link>
        <Link 
          href={`/dashboard/${projectId}/errors?filter=resolved`}
          className="cursor-pointer transition-all duration-200 hover:scale-[1.01]"
        >
          <Card className={`bg-[#0c0c0e]/80 border-neutral-800 backdrop-blur-md transition-colors ${filter === "resolved" ? "border-emerald-500/40 bg-emerald-950/10" : ""}`}>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase font-semibold text-neutral-400">Resolved Signatures</CardDescription>
              <CardTitle className="text-3xl font-black text-emerald-400 font-mono">{resolvedCount}</CardTitle>
            </CardHeader>
          </Card>
        </Link>
        <Link 
          href={`/dashboard/${projectId}/errors?filter=all`}
          className="cursor-pointer transition-all duration-200 hover:scale-[1.01]"
        >
          <Card className={`bg-[#0c0c0e]/80 border-neutral-800 backdrop-blur-md transition-colors ${filter === "all" ? "border-indigo-500/40 bg-indigo-950/10" : ""}`}>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase font-semibold text-neutral-400">Total Signatures</CardDescription>
              <CardTitle className="text-3xl font-black text-indigo-400 font-mono">{totalCount}</CardTitle>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Main Groups Log Table */}
      <Card className="bg-[#0c0c0e]/80 border-neutral-800 backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/10 pb-4">
          <div>
            <CardTitle className="text-lg font-bold text-neutral-100">Signature Groups</CardTitle>
            <CardDescription className="text-xs text-neutral-500 mt-0.5">
              Showing {groupsWithDetails.length} error signature{groupsWithDetails.length === 1 ? "" : "s"}
            </CardDescription>
          </div>
          {/* Simple toggle UI buttons */}
          <div className="flex bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 text-xs font-medium">
            <Link
              href={`/dashboard/${projectId}/errors?filter=unresolved`}
              className={`px-3 py-1.5 rounded-md transition-all ${filter === "unresolved" ? "bg-neutral-800 text-neutral-100 shadow-sm" : "text-neutral-400 hover:text-neutral-200"}`}
            >
              Unresolved
            </Link>
            <Link
              href={`/dashboard/${projectId}/errors?filter=resolved`}
              className={`px-3 py-1.5 rounded-md transition-all ${filter === "resolved" ? "bg-neutral-800 text-neutral-100 shadow-sm" : "text-neutral-400 hover:text-neutral-200"}`}
            >
              Resolved
            </Link>
            <Link
              href={`/dashboard/${projectId}/errors?filter=all`}
              className={`px-3 py-1.5 rounded-md transition-all ${filter === "all" ? "bg-neutral-800 text-neutral-100 shadow-sm" : "text-neutral-400 hover:text-neutral-200"}`}
            >
              All
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {groupsWithDetails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <CheckCircle2 className="h-10 w-10 text-neutral-500 mb-3.5 stroke-[1.5]" />
              <h3 className="font-bold text-neutral-200 text-sm">No Error Groups Found</h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                {filter === "unresolved" 
                  ? "All error signatures are marked resolved. Excellent work!"
                  : "No error signatures matched the selected resolution filter."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-neutral-950/40">
                  <TableRow className="border-b border-border/10">
                    <TableHead className="w-[120px] text-neutral-400 font-bold">Severity</TableHead>
                    <TableHead className="text-neutral-400 font-bold">Error Signature & Fingerprint</TableHead>
                    <TableHead className="w-[100px] text-right text-neutral-400 font-bold">Occurrences</TableHead>
                    <TableHead className="w-[180px] text-neutral-400 font-bold">First Seen</TableHead>
                    <TableHead className="w-[180px] text-neutral-400 font-bold">Last Seen</TableHead>
                    <TableHead className="w-[120px] text-right text-neutral-400 font-bold">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupsWithDetails.map((group) => {
                    const badgeStyles = {
                      INFO: "bg-blue-500/10 text-blue-400 border-blue-500/20",
                      WARN: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                      ERROR: "bg-rose-500/10 text-rose-400 border-rose-500/20",
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
                        className={`border-b border-border/10 hover:bg-neutral-900/20 transition-colors ${group.resolved ? "opacity-60" : ""}`}
                      >
                        {/* Severity Badge */}
                        <TableCell>
                          <Badge className={`border uppercase tracking-wider text-[10px] font-bold ${badgeStyles[group.type as keyof typeof badgeStyles]}`}>
                            {group.type}
                          </Badge>
                        </TableCell>

                        {/* Error Message & Fingerprint */}
                        <TableCell className="max-w-md">
                          <div className="flex flex-col gap-1">
                            {group.sampleLogId ? (
                              <Link 
                                href={`/dashboard/${projectId}/logs/${group.sampleLogId}`}
                                className="font-semibold text-neutral-200 hover:text-primary transition-colors text-sm truncate block"
                                title={group.message}
                              >
                                {group.message}
                              </Link>
                            ) : (
                              <span className="font-semibold text-neutral-200 text-sm truncate" title={group.message}>
                                {group.message}
                              </span>
                            )}
                            <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-mono">
                              <span>FINGERPRINT:</span>
                              <span className="select-all text-neutral-400 truncate w-32" title={group.fingerprint}>
                                {group.fingerprint.slice(0, 16)}...
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Event Count Occurrences */}
                        <TableCell className="text-right font-mono font-black text-neutral-200">
                          {group.count.toLocaleString()}
                        </TableCell>

                        {/* First Seen Date */}
                        <TableCell className="text-xs text-neutral-400 font-medium">
                          {firstSeenFormatted}
                        </TableCell>

                        {/* Last Seen Date */}
                        <TableCell className="text-xs text-neutral-400 font-medium">
                          {lastSeenFormatted}
                        </TableCell>

                        {/* Resolve Action Button */}
                        <TableCell className="text-right">
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
