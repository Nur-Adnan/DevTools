import Link from "next/link";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Activity, 
  ArrowUpRight, 
  Terminal, 
  Zap, 
  ShieldAlert, 
  Sparkles, 
  Clock, 
  Flame, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle 
} from "lucide-react";

// Mock stats for dashboard
const stats = [
  {
    title: "Total Requests",
    value: "2,845,912",
    description: "+14.2% vs last period",
    trend: "up",
    icon: Activity,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Average Latency",
    value: "148 ms",
    description: "p95 is 240ms",
    trend: "down",
    icon: Zap,
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
  },
  {
    title: "Error Rate",
    value: "0.04%",
    description: "24 failed requests",
    trend: "down",
    icon: ShieldAlert,
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
  },
  {
    title: "Active Incidents",
    value: "1",
    description: "Rate limit triggered",
    trend: "up",
    icon: Flame,
    color: "text-rose-400",
    bgColor: "bg-rose-400/10",
  },
];

// Mock API logs data
const recentLogs = [
  {
    id: "evt_1a83b2c",
    status: 200,
    method: "GET",
    path: "/api/v1/user/profile",
    duration: "42ms",
    timestamp: "2 mins ago",
    project: "pulseguard-prod",
  },
  {
    id: "evt_3b89012",
    status: 201,
    method: "POST",
    path: "/api/v1/auth/session",
    duration: "182ms",
    timestamp: "4 mins ago",
    project: "pulseguard-prod",
  },
  {
    id: "evt_9c12e34",
    status: 500,
    method: "POST",
    path: "/api/v1/billing/checkout",
    duration: "892ms",
    timestamp: "8 mins ago",
    project: "pulseguard-prod",
  },
  {
    id: "evt_5d0124a",
    status: 429,
    method: "GET",
    path: "/api/v1/search/autocomplete",
    duration: "12ms",
    timestamp: "12 mins ago",
    project: "pulseguard-prod",
  },
  {
    id: "evt_2e88a10",
    status: 404,
    method: "GET",
    path: "/api/v1/legacy/users",
    duration: "18ms",
    timestamp: "15 mins ago",
    project: "pulseguard-prod",
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Upper header action row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-100 flex items-center gap-2">
            Overview
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Real-time health status and performance indicators for <span className="text-neutral-300 font-medium">pulseguard-prod</span>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="bg-neutral-900/40 border-border/40 hover:bg-neutral-900/60 font-mono text-xs">
            <Clock className="h-3.5 w-3.5 mr-1.5 text-neutral-400" />
            Last 24 Hours
          </Button>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/95 text-xs shadow-lg shadow-primary/10">
            Share Report
            <ArrowUpRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </div>
      </div>

      {/* AI Smart Alert Diagnostic */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 relative overflow-hidden">
        {/* Glow behind AI banner */}
        <div className="absolute right-0 top-0 h-40 w-40 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5 animate-pulse">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-neutral-100 flex items-center gap-1.5">
              AI Insight: Latency Spike Detected
            </h4>
            <p className="text-xs text-neutral-400 leading-normal max-w-4xl">
              Average latency for `/api/v1/billing/checkout` spiked to <span className="text-amber-400 font-semibold font-mono">892ms</span> at 16:40. 
              Prisma pool connection count exceeded 90% utilization. Recommend reviewing database connection limits or scaling Neon serverless pool size.
            </p>
            <div className="flex gap-3 pt-2">
              <Button size="xs" className="bg-primary/20 text-primary-foreground hover:bg-primary/30 border border-primary/30 text-[10px] h-6 px-2.5">
                Optimize Prisma Settings
              </Button>
              <Button variant="ghost" size="xs" className="text-neutral-500 hover:text-neutral-300 text-[10px] h-6">
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.title} className="bg-neutral-950 border-neutral-900 hover:border-neutral-800/80 transition-all duration-300 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500 font-medium">{stat.title}</span>
                  <div className={`h-8 w-8 rounded-lg ${stat.bgColor} flex items-center justify-center ${stat.color}`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2.5">
                  <h3 className="text-2xl font-bold tracking-tight text-neutral-100 font-mono">
                    {stat.value}
                  </h3>
                  <span className="text-[10px] text-neutral-500 block mt-1 font-medium">
                    {stat.description}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Primary Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latency Percentile card placeholder */}
        <Card className="lg:col-span-2 bg-neutral-950 border-neutral-900 shadow-md">
          <CardHeader className="border-b border-border/10 pb-4">
            <CardTitle className="text-sm font-semibold text-neutral-200">Response Latency Distribution</CardTitle>
            <CardDescription className="text-xs text-neutral-500">Realtime distribution curve (last 1 hour)</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 h-60 flex flex-col justify-between">
            {/* Custom high fidelity chart container layout */}
            <div className="flex-1 flex items-end gap-2.5 px-4">
              <div className="flex-1 bg-neutral-900 rounded-t h-[20%] relative group">
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-mono opacity-0 group-hover:opacity-100 bg-neutral-950 border border-neutral-800 px-1 py-0.5 rounded text-neutral-300">20ms</span>
              </div>
              <div className="flex-1 bg-neutral-900 rounded-t h-[35%] relative group" />
              <div className="flex-1 bg-neutral-900 rounded-t h-[60%] relative group" />
              <div className="flex-1 bg-primary/40 rounded-t h-[85%] relative group">
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-mono opacity-0 group-hover:opacity-100 bg-neutral-950 border border-neutral-800 px-1 py-0.5 rounded text-neutral-200">142ms</span>
              </div>
              <div className="flex-1 bg-primary rounded-t h-[95%] relative group">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-mono bg-neutral-950 border border-neutral-800 px-1 py-0.5 rounded text-emerald-400 flex items-center gap-1 font-semibold">
                  <span className="h-1 w-1 rounded-full bg-emerald-500" />
                  Avg
                </div>
              </div>
              <div className="flex-1 bg-primary/70 rounded-t h-[75%] relative group" />
              <div className="flex-1 bg-neutral-900 rounded-t h-[40%] relative group" />
              <div className="flex-1 bg-neutral-900 rounded-t h-[25%] relative group" />
              <div className="flex-1 bg-rose-500/20 rounded-t h-[15%] relative group">
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-mono opacity-0 group-hover:opacity-100 bg-neutral-950 border border-neutral-800 px-1 py-0.5 rounded text-rose-400">892ms</span>
              </div>
            </div>
            
            {/* Chart X axis scale */}
            <div className="flex justify-between border-t border-border/10 pt-3 text-[10px] text-neutral-500 font-mono px-4 mt-2">
              <span>0ms</span>
              <span>100ms (p50)</span>
              <span>250ms (p90)</span>
              <span>500ms (p95)</span>
              <span>1000ms+ (p99)</span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Diagnostics */}
        <Card className="bg-neutral-950 border-neutral-900 shadow-md">
          <CardHeader className="border-b border-border/10 pb-4">
            <CardTitle className="text-sm font-semibold text-neutral-200">Issue Breakdown</CardTitle>
            <CardDescription className="text-xs text-neutral-500">Categorized anomalies (24h)</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">HTTP 5xx Server Errors</span>
                  <span className="text-rose-500 font-bold font-mono">16%</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: '16%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">HTTP 429 Rate Limits</span>
                  <span className="text-amber-500 font-bold font-mono">68%</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '68%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">HTTP 4xx Client Errors</span>
                  <span className="text-neutral-400 font-bold font-mono">16%</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden">
                  <div className="h-full bg-neutral-600 rounded-full" style={{ width: '16%' }} />
                </div>
              </div>
            </div>

            <div className="border-t border-border/10 pt-4 flex items-center justify-between text-xs">
              <span className="text-neutral-500">Unresolved Incidents</span>
              <Badge className="bg-amber-500/10 text-amber-400 border-none font-mono text-[10px]">1 Warning</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Streams Logs list */}
      <Card className="bg-neutral-950 border-neutral-900 shadow-md">
        <CardHeader className="border-b border-border/10 pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold text-neutral-200">Recent Traffic Streams</CardTitle>
            <CardDescription className="text-xs text-neutral-500">Real-time HTTP requests captured by PulseGuard middleware</CardDescription>
          </div>
          <Link href="/dashboard/logs">
            <Button variant="ghost" size="sm" className="h-8 hover:bg-neutral-900 text-xs text-neutral-400 hover:text-white">
              View All Logs
              <Terminal className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-neutral-900/30 border-b border-border/10">
              <TableRow className="border-b border-border/10 hover:bg-transparent">
                <TableHead className="text-neutral-400 text-xs font-mono py-3 pl-6">EVENT ID</TableHead>
                <TableHead className="text-neutral-400 text-xs">STATUS</TableHead>
                <TableHead className="text-neutral-400 text-xs">METHOD</TableHead>
                <TableHead className="text-neutral-400 text-xs">ENDPOINT PATH</TableHead>
                <TableHead className="text-neutral-400 text-xs">RESPONSE TIME</TableHead>
                <TableHead className="text-neutral-400 text-xs text-right pr-6">TIMESTAMP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentLogs.map((log) => {
                let statusBadge;
                if (log.status >= 500) {
                  statusBadge = <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20 font-mono text-[10px] px-1.5 flex gap-1 items-center w-fit"><XCircle className="h-3 w-3 shrink-0" /> {log.status}</Badge>;
                } else if (log.status >= 400) {
                  statusBadge = <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 font-mono text-[10px] px-1.5 flex gap-1 items-center w-fit"><AlertTriangle className="h-3 w-3 shrink-0" /> {log.status}</Badge>;
                } else {
                  statusBadge = <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-mono text-[10px] px-1.5 flex gap-1 items-center w-fit"><CheckCircle2 className="h-3 w-3 shrink-0" /> {log.status}</Badge>;
                }

                return (
                  <TableRow key={log.id} className="border-b border-neutral-900/40 hover:bg-neutral-900/20 transition-all font-sans">
                    <TableCell className="font-mono text-xs text-neutral-400 py-3.5 pl-6">{log.id}</TableCell>
                    <TableCell>{statusBadge}</TableCell>
                    <TableCell className="font-mono text-xs font-bold text-neutral-300">{log.method}</TableCell>
                    <TableCell className="font-mono text-xs text-neutral-200">{log.path}</TableCell>
                    <TableCell className="font-mono text-xs text-neutral-400">{log.duration}</TableCell>
                    <TableCell className="text-right text-xs text-neutral-500 pr-6">{log.timestamp}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
