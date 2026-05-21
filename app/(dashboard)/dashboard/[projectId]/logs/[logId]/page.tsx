import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Calendar, 
  Cpu, 
  Fingerprint, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StackTrace } from "./stack-trace";
import { MetadataViewer } from "./metadata-viewer";

interface LogDetailPageProps {
  params: {
    projectId: string;
    logId: string;
  };
}

export default async function LogDetailPage({ params }: LogDetailPageProps) {
  const { projectId, logId } = params;

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

  // 2. Fetch log entry
  const log = await db.log.findFirst({
    where: {
      id: logId,
      projectId,
    },
  });

  if (!log) {
    redirect(`/dashboard/${projectId}/logs`);
  }

  // 3. Render type-specific header card styling
  let badgeColor = "";
  let icon = null;
  let bgGradient = "";

  if (log.type === "ERROR") {
    badgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";
    icon = <XCircle className="h-6 w-6 text-rose-400 shrink-0 mt-0.5" />;
    bgGradient = "from-rose-500/[0.03] to-transparent";
  } else if (log.type === "WARN") {
    badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
    icon = <AlertTriangle className="h-6 w-6 text-amber-400 shrink-0 mt-0.5" />;
    bgGradient = "from-amber-500/[0.03] to-transparent";
  } else {
    badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    icon = <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />;
    bgGradient = "from-emerald-500/[0.03] to-transparent";
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href={`/dashboard/${projectId}/logs`}
          className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-neutral-200 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to logs explorer
        </Link>
      </div>

      {/* Main Log Title Header Card */}
      <Card className={`bg-gradient-to-br ${bgGradient} bg-neutral-950/40 border border-white/[0.04] rounded-xl overflow-hidden`}>
        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="flex items-start gap-4">
            {icon}
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={`font-mono text-[10px] px-2 py-0.5 ${badgeColor}`}>
                  {log.type}
                </Badge>
                <span className="text-[10px] text-neutral-500 font-mono">
                  EVENT ID: {log.id}
                </span>
              </div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-neutral-100 break-words leading-relaxed select-text font-mono">
                {log.message}
              </h1>
            </div>
          </div>

          <div className="h-[1px] bg-white/[0.04]" />

          {/* Quick Details Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Timestamp */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-neutral-900/40 border border-white/[0.04] flex items-center justify-center text-neutral-400 shrink-0">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-neutral-500 font-mono uppercase font-semibold">Captured At</span>
                <span className="text-xs text-neutral-300 font-mono truncate">
                  {new Date(log.createdAt).toLocaleString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  })}
                </span>
              </div>
            </div>

            {/* Source */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-neutral-900/40 border border-white/[0.04] flex items-center justify-center text-neutral-400 shrink-0">
                <Cpu className="h-4 w-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-neutral-500 font-mono uppercase font-semibold">Client Environment</span>
                <span className="text-xs text-neutral-300 font-mono truncate" title={log.source || "N/A"}>
                  {log.source || "Unknown SDK / Host"}
                </span>
              </div>
            </div>

            {/* Fingerprint */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-neutral-900/40 border border-white/[0.04] flex items-center justify-center text-neutral-400 shrink-0">
                <Fingerprint className="h-4 w-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-neutral-500 font-mono uppercase font-semibold">Grouping Fingerprint</span>
                <span className="text-xs text-neutral-300 font-mono truncate select-all" title={log.fingerprint || "N/A"}>
                  {log.fingerprint ? log.fingerprint.slice(0, 16) + "..." : "None"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main content tabs/grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Stack Trace Display */}
        <StackTrace stackTrace={log.stackTrace} />

        {/* Custom metadata parsed visualizer */}
        <MetadataViewer metadata={log.metadata} />
      </div>
    </div>
  );
}
