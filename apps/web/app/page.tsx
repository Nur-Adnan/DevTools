import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Terminal, 
  ShieldAlert, 
  ArrowRight, 
  Sparkles, 
  BarChart3, 
  Layers,
  Flame,
  ChevronDown
} from "lucide-react";

export default async function Home() {
  const { userId } = await auth();
  
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div id="landing-root" className="min-h-screen bg-[#09090b] text-[#f4f4f5] selection:bg-primary/30 selection:text-white relative overflow-hidden font-sans">
      {/* Premium ambient glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[40%] right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[180px] pointer-events-none" />

      {/* Grid background overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35" />

      {/* Header */}
      <header className="border-b border-white/[0.02] backdrop-blur-lg bg-[#09090b]/40 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Brand Logo: Ngwodink */}
          <Link href="/" className="flex items-center gap-1.5 group select-none">
            <span className="font-bold text-2xl tracking-tight text-white font-sans">
              Ngw
            </span>
            <span className="relative flex items-center justify-center h-[22px] w-[22px] rounded-full bg-[#ccff00] text-black shadow-[0_0_15px_rgba(204,255,0,0.5)] transition-transform duration-300 group-hover:scale-110">
              <Flame className="h-3.5 w-3.5 fill-black text-black" strokeWidth={2.5} />
            </span>
            <span className="font-bold text-2xl tracking-tight text-white font-sans">
              dink
            </span>
          </Link>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-10">
            <div className="relative group/nav-item">
              <button className="flex items-center gap-1 text-neutral-300 hover:text-white transition-colors duration-200 py-2 text-sm font-medium">
                Developer Tools
                <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover/nav-item:rotate-180 text-neutral-500 group-hover/nav-item:text-white" />
              </button>
              
              {/* Elegant Dropdown Card on Hover */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 translate-y-2 pointer-events-none group-hover/nav-item:opacity-100 group-hover/nav-item:translate-y-0 group-hover/nav-item:pointer-events-auto transition-all duration-300 ease-out z-50">
                <div className="w-64 rounded-xl border border-white/[0.05] bg-[#0c0c0e]/95 backdrop-blur-2xl p-2.5 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
                  <Link href="/sign-up" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.03] transition-colors group/sub-item">
                    <div className="h-8 w-8 rounded-lg bg-[#ccff00]/10 flex items-center justify-center transition-colors group-hover/sub-item:bg-[#ccff00]/20">
                      <Terminal className="h-4 w-4 text-[#ccff00]" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-neutral-200 block">PulseGuard API Monitor</span>
                      <span className="text-[10px] text-neutral-500 block mt-0.5">Real-time HTTP logger</span>
                    </div>
                  </Link>
                  <Link href="/sign-up" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.03] transition-colors group/sub-item">
                    <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center transition-colors group-hover/sub-item:bg-indigo-500/20">
                      <ShieldAlert className="h-4 w-4 text-indigo-400" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-neutral-200 block">Error Diagnostics</span>
                      <span className="text-[10px] text-neutral-500 block mt-0.5">Automated source mapping</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            <Link href="/sign-up" className="text-neutral-300 hover:text-white transition-colors duration-200 text-sm font-medium">
              Download
            </Link>
            
            <Link href="/sign-up" className="text-neutral-300 hover:text-white transition-colors duration-200 text-sm font-medium">
              Buy
            </Link>

            <Link href="/sign-up" className="text-neutral-300 hover:text-white transition-colors duration-200 text-sm font-medium">
              Subscriptions
            </Link>
          </nav>

          {/* Action Callouts */}
          <div className="flex items-center gap-8">
            <Link href="/sign-in" className="text-neutral-300 hover:text-white transition-colors duration-200 text-sm font-medium">
              Log In
            </Link>
            <div className="relative group/btn-container flex flex-col items-center">
              <Link href="/sign-up">
                <button className="px-5 py-2 rounded-md border border-white/10 hover:border-white/20 bg-white/[0.01] hover:bg-white/[0.03] text-white text-sm font-medium transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                  Get Started
                </button>
              </Link>
              {/* Glowing active indicator dot immediately underneath button */}
              <div className="absolute -bottom-4.5 w-1.5 h-1.5 rounded-full bg-[#ccff00] opacity-80 shadow-[0_0_8px_#ccff00,0_0_15px_rgba(204,255,0,0.6)] group-hover/btn-container:opacity-100 group-hover/btn-container:scale-125 transition-all duration-300 ease-out" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
          <Link href="/sign-up" className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors mb-6 group cursor-pointer">
            <Badge variant="secondary" className="bg-primary/20 text-primary-foreground border-none text-[10px] px-2 py-0.5">NEW</Badge>
            <span className="text-xs text-neutral-300 flex items-center gap-1">
              PulseGuard Agent v1.0 is now live <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 max-w-4xl bg-clip-text text-transparent bg-gradient-to-b from-white via-neutral-100 to-neutral-500">
            API Monitoring & Error Tracking <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-400 font-bold block mt-2">Built for Modern Developers</span>
          </h1>

          <p className="text-neutral-400 text-base sm:text-xl max-w-2xl mb-10 leading-relaxed">
            A lightweight Sentry + PostHog hybrid. Track API payloads, measure performance bottlenecks, and capture critical errors with a single-line SDK integration.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-sm mb-16">
            <Link href="/sign-up" className="w-full">
              <Button size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/95 text-base shadow-xl shadow-primary/10">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/sign-in" className="w-full">
              <Button size="lg" variant="outline" className="w-full border-neutral-800 bg-[#09090b]/50 hover:bg-neutral-900 text-base">
                View Live Demo
              </Button>
            </Link>
          </div>

          {/* Interactive Mockup Container */}
          <div className="w-full max-w-5xl rounded-xl border border-neutral-800/80 bg-neutral-900/20 backdrop-blur-sm p-3 shadow-2xl relative group">
            {/* Ambient shadow reflection */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-primary/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-all duration-700 pointer-events-none" />
            
            {/* Top Bar for mockup */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-850 bg-neutral-950/40 rounded-t-lg">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-neutral-800" />
                <span className="w-3 h-3 rounded-full bg-neutral-800" />
                <span className="w-3 h-3 rounded-full bg-neutral-800" />
              </div>
              <span className="text-[11px] text-neutral-500 font-mono tracking-wide">pulseguard-dashboard-v1</span>
              <span className="w-12" />
            </div>

            {/* Mockup Dashboard Content */}
            <div className="bg-[#09090b]/90 rounded-b-lg p-6 min-h-[380px] grid grid-cols-1 md:grid-cols-3 gap-6 text-left font-sans">
              <div className="md:col-span-2 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-neutral-900/40 border border-neutral-800/40 p-4 rounded-xl">
                    <span className="text-xs text-neutral-500 block mb-1">Avg Response</span>
                    <span className="text-2xl font-semibold tracking-tight">142ms</span>
                    <span className="text-[10px] text-emerald-500 font-medium block mt-1">↓ 12.4% vs last week</span>
                  </div>
                  <div className="bg-neutral-900/40 border border-neutral-800/40 p-4 rounded-xl">
                    <span className="text-xs text-neutral-500 block mb-1">Request Volume</span>
                    <span className="text-2xl font-semibold tracking-tight">1.24M</span>
                    <span className="text-[10px] text-emerald-500 font-medium block mt-1">↑ 8.2% vs last week</span>
                  </div>
                  <div className="bg-neutral-900/40 border border-neutral-800/40 p-4 rounded-xl">
                    <span className="text-xs text-neutral-500 block mb-1">Error Rate</span>
                    <span className="text-2xl font-semibold tracking-tight text-rose-500">0.08%</span>
                    <span className="text-[10px] text-neutral-500 block mt-1">Healthy</span>
                  </div>
                </div>

                <div className="bg-neutral-900/40 border border-neutral-800/40 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-semibold text-neutral-300">Live API Traffic Stream</span>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-none font-mono text-[9px] px-1.5 py-0.5 flex gap-1 items-center animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      LIVE
                    </Badge>
                  </div>
                  <div className="space-y-2.5 font-mono text-xs">
                    <div className="flex items-center justify-between py-1.5 border-b border-neutral-900/60">
                      <div className="flex items-center gap-2.5">
                        <span className="text-emerald-500 font-bold">200 OK</span>
                        <span className="text-neutral-400">GET</span>
                        <span className="text-neutral-200">/api/v1/projects</span>
                      </div>
                      <span className="text-neutral-500">45ms</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-neutral-900/60">
                      <div className="flex items-center gap-2.5">
                        <span className="text-emerald-500 font-bold">201 CREATED</span>
                        <span className="text-neutral-400">POST</span>
                        <span className="text-neutral-200">/api/v1/events</span>
                      </div>
                      <span className="text-neutral-500">112ms</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-neutral-900/60">
                      <div className="flex items-center gap-2.5">
                        <span className="text-rose-500 font-bold">500 ERROR</span>
                        <span className="text-neutral-400">POST</span>
                        <span className="text-rose-300">/api/v1/auth/session</span>
                      </div>
                      <span className="text-neutral-500">289ms</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-amber-500 font-bold">429 RATE_LIMIT</span>
                        <span className="text-neutral-400">GET</span>
                        <span className="text-neutral-200">/api/v1/logs</span>
                      </div>
                      <span className="text-neutral-500">14ms</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-900/20 border border-neutral-800/40 rounded-xl p-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <span className="text-xs font-semibold text-neutral-300 block">Integrations</span>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-neutral-950/40 border border-neutral-850 p-2.5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 bg-neutral-800 rounded flex items-center justify-center font-bold text-[10px]">JS</div>
                        <span className="text-xs text-neutral-300">Next.js Client SDK</span>
                      </div>
                      <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/20 bg-emerald-500/5">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between bg-neutral-950/40 border border-neutral-850 p-2.5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 bg-neutral-800 rounded flex items-center justify-center font-bold text-[10px] text-indigo-400">PY</div>
                        <span className="text-xs text-neutral-300">Python Fast API</span>
                      </div>
                      <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/20 bg-emerald-500/5">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between bg-neutral-950/40 border border-neutral-850 p-2.5 rounded-lg opacity-40">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 bg-neutral-800 rounded flex items-center justify-center font-bold text-[10px] text-rose-400">EX</div>
                        <span className="text-xs text-neutral-300">Express Middleware</span>
                      </div>
                      <Badge variant="outline" className="text-[9px] text-neutral-500 border-neutral-800">Pending</Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg mt-4">
                  <div className="flex gap-2 items-start">
                    <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-semibold text-neutral-200 block">AI Smart Diagnostics</span>
                      <p className="text-[10px] text-neutral-400 mt-1 leading-normal">
                        Database pool connection exhaustion detected. Review prisma connection pool settings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Grid */}
      <section className="py-16 max-w-7xl mx-auto px-6 relative z-10 border-t border-neutral-900/60">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/[0.02] border border-white/[0.05] ring-0 backdrop-blur-md hover:bg-white/[0.04] hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1.5 transition-all duration-300 ease-out relative group overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            <CardContent className="p-6">
              <div className="h-11 w-11 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mb-5 shadow-inner">
                <Terminal className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2.5 text-neutral-200 tracking-tight group-hover:text-white transition-colors">API Payloads Tracking</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Log full request headers, request query parameters, and response payloads. Replay exactly what failed.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.02] border border-white/[0.05] ring-0 backdrop-blur-md hover:bg-white/[0.04] hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1.5 transition-all duration-300 ease-out relative group overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            <CardContent className="p-6">
              <div className="h-11 w-11 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center mb-5 shadow-inner">
                <ShieldAlert className="h-5 w-5 text-indigo-400" />
              </div>
              <h3 className="font-bold text-lg mb-2.5 text-neutral-200 tracking-tight group-hover:text-white transition-colors">Error Tracking</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Capture unhandled exceptions, reject promises, and trace source maps directly back to Git repositories.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.02] border border-white/[0.05] ring-0 backdrop-blur-md hover:bg-white/[0.04] hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1.5 transition-all duration-300 ease-out relative group overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            <CardContent className="p-6">
              <div className="h-11 w-11 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center mb-5 shadow-inner">
                <BarChart3 className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="font-bold text-lg mb-2.5 text-neutral-200 tracking-tight group-hover:text-white transition-colors">Latency Analytics</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Automatically measure and flag slow operations, p95/p99 spikes, and external database timeouts.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.02] border border-white/[0.05] ring-0 backdrop-blur-md hover:bg-white/[0.04] hover:border-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1.5 transition-all duration-300 ease-out relative group overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            <CardContent className="p-6">
              <div className="h-11 w-11 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center mb-5 shadow-inner">
                <Layers className="h-5 w-5 text-amber-400" />
              </div>
              <h3 className="font-bold text-lg mb-2.5 text-neutral-200 tracking-tight group-hover:text-white transition-colors">User Session Analytics</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Connect API performance events directly to specific user IDs and user actions. Understand user flows.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-black/40 py-12 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <span className="font-semibold text-neutral-400">PulseGuard © 2026.</span>
            <span>All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-neutral-300">Privacy Policy</a>
            <a href="#" className="hover:text-neutral-300">Terms of Service</a>
            <a href="#" className="hover:text-neutral-300">Docs</a>
            <a href="#" className="hover:text-neutral-300">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
