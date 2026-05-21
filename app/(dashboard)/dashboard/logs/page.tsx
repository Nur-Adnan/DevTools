import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Search, 
  SlidersHorizontal, 
  Download, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle 
} from "lucide-react";

const allLogs = [
  {
    id: "evt_1a83b2c",
    status: 200,
    method: "GET",
    path: "/api/v1/user/profile",
    duration: "42ms",
    timestamp: "2026-05-21 16:46:12",
    ip: "192.168.1.1",
    client: "Next.js SDK",
  },
  {
    id: "evt_3b89012",
    status: 201,
    method: "POST",
    path: "/api/v1/auth/session",
    duration: "182ms",
    timestamp: "2026-05-21 16:44:05",
    ip: "192.168.1.5",
    client: "Next.js SDK",
  },
  {
    id: "evt_9c12e34",
    status: 500,
    method: "POST",
    path: "/api/v1/billing/checkout",
    duration: "892ms",
    timestamp: "2026-05-21 16:40:55",
    ip: "99.88.77.66",
    client: "cURL / Axios",
  },
  {
    id: "evt_5d0124a",
    status: 429,
    method: "GET",
    path: "/api/v1/search/autocomplete",
    duration: "12ms",
    timestamp: "2026-05-21 16:36:18",
    ip: "204.11.55.99",
    client: "Chrome Browser",
  },
  {
    id: "evt_2e88a10",
    status: 404,
    method: "GET",
    path: "/api/v1/legacy/users",
    duration: "18ms",
    timestamp: "2026-05-21 16:33:41",
    ip: "192.168.1.1",
    client: "Next.js SDK",
  },
];

export default function LogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-100 flex items-center gap-2">
          Logs Explorer
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Search and inspect raw HTTP request/response payloads captured by PulseGuard.
        </p>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-neutral-950/40 border border-neutral-900 p-4 rounded-xl">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
          <Input 
            placeholder="Search logs by path, query, payload or event ID..." 
            className="pl-9 bg-neutral-900/40 border-neutral-800 focus-visible:ring-1 focus-visible:ring-primary text-xs h-9"
          />
        </div>

        {/* Action Selects */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Select defaultValue="all">
            <SelectTrigger className="w-32 bg-neutral-900/40 border-neutral-800 text-xs h-9">
              <SelectValue placeholder="Method" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-950 border-neutral-800 text-neutral-200">
              <SelectItem value="all" className="text-xs">All Methods</SelectItem>
              <SelectItem value="get" className="text-xs">GET</SelectItem>
              <SelectItem value="post" className="text-xs">POST</SelectItem>
              <SelectItem value="put" className="text-xs">PUT</SelectItem>
              <SelectItem value="delete" className="text-xs">DELETE</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-32 bg-neutral-900/40 border-neutral-800 text-xs h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-950 border-neutral-800 text-neutral-200">
              <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
              <SelectItem value="2xx" className="text-xs">2xx Success</SelectItem>
              <SelectItem value="4xx" className="text-xs">4xx Client Error</SelectItem>
              <SelectItem value="5xx" className="text-xs">5xx Server Error</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" className="h-9 px-3 bg-neutral-900/40 border-neutral-800 text-xs text-neutral-400 hover:text-white">
            <SlidersHorizontal className="h-3.5 w-3.5 mr-2" />
            More Filters
          </Button>

          <div className="h-6 w-[1px] bg-neutral-900 hidden sm:block" />

          <Button variant="ghost" size="sm" className="h-9 px-3 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/5 ml-auto md:ml-0">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-9 px-3 text-neutral-400 hover:text-neutral-200">
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Logs Table */}
      <Card className="bg-neutral-950 border-neutral-900 shadow-md">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-neutral-900/30 border-b border-border/10">
              <TableRow className="border-b border-border/10 hover:bg-transparent">
                <TableHead className="text-neutral-400 text-xs font-mono py-3 pl-6">EVENT ID</TableHead>
                <TableHead className="text-neutral-400 text-xs">STATUS</TableHead>
                <TableHead className="text-neutral-400 text-xs">METHOD</TableHead>
                <TableHead className="text-neutral-400 text-xs">ENDPOINT PATH</TableHead>
                <TableHead className="text-neutral-400 text-xs">CLIENT</TableHead>
                <TableHead className="text-neutral-400 text-xs">LATENCY</TableHead>
                <TableHead className="text-neutral-400 text-xs text-right pr-6">TIMESTAMP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allLogs.map((log) => {
                let statusBadge;
                if (log.status >= 500) {
                  statusBadge = <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20 font-mono text-[10px] px-1.5 flex gap-1 items-center w-fit"><XCircle className="h-3 w-3 shrink-0" /> {log.status}</Badge>;
                } else if (log.status >= 400) {
                  statusBadge = <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 font-mono text-[10px] px-1.5 flex gap-1 items-center w-fit"><AlertTriangle className="h-3 w-3 shrink-0" /> {log.status}</Badge>;
                } else {
                  statusBadge = <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-mono text-[10px] px-1.5 flex gap-1 items-center w-fit"><CheckCircle2 className="h-3 w-3 shrink-0" /> {log.status}</Badge>;
                }

                return (
                  <TableRow key={log.id} className="border-b border-neutral-900/40 hover:bg-neutral-900/20 transition-all font-sans cursor-pointer">
                    <TableCell className="font-mono text-xs text-neutral-400 py-3.5 pl-6">{log.id}</TableCell>
                    <TableCell>{statusBadge}</TableCell>
                    <TableCell className="font-mono text-xs font-bold text-neutral-300">{log.method}</TableCell>
                    <TableCell className="font-mono text-xs text-neutral-200 truncate max-w-[200px]">{log.path}</TableCell>
                    <TableCell className="text-xs text-neutral-400">{log.client}</TableCell>
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
