import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Key, 
  Copy, 
  Eye, 
  Mail, 
  BellRing, 
  Save, 
  Terminal, 
  ExternalLink 
} from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-100 flex items-center gap-2">
          Settings
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Configure project configurations, credentials, API endpoints, and notification alerts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Details */}
          <Card className="bg-neutral-950 border-neutral-900 shadow-md">
            <CardHeader className="border-b border-border/10 pb-4">
              <CardTitle className="text-sm font-semibold text-neutral-200">Project Profile</CardTitle>
              <CardDescription className="text-xs text-neutral-500">Update workspace parameters for this project</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400">Project Name</label>
                <Input 
                  defaultValue="pulseguard-prod" 
                  className="bg-neutral-900/40 border-neutral-800 focus-visible:ring-1 focus-visible:ring-primary text-xs h-9"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400">Environment Identifier</label>
                <Input 
                  defaultValue="production" 
                  disabled
                  className="bg-neutral-900/10 border-neutral-800 text-neutral-500 text-xs h-9 cursor-not-allowed"
                />
              </div>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/95 text-xs h-9 shadow-lg shadow-primary/10">
                <Save className="h-3.5 w-3.5 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Webhooks & Alerts */}
          <Card className="bg-neutral-950 border-neutral-900 shadow-md">
            <CardHeader className="border-b border-border/10 pb-4">
              <CardTitle className="text-sm font-semibold text-neutral-200">Alert Notifications</CardTitle>
              <CardDescription className="text-xs text-neutral-500">Get notified instantly when error rates spike</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-neutral-900 bg-neutral-950/40">
                <div className="flex items-start gap-2.5">
                  <Mail className="h-4.5 w-4.5 text-neutral-400 mt-0.5" />
                  <div>
                    <span className="text-xs font-semibold text-neutral-200 block">Email Alerts</span>
                    <span className="text-[10px] text-neutral-500">Receive summaries and urgent critical failures</span>
                  </div>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-none font-mono text-[9px] px-1.5 py-0.5">Enabled</Badge>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400">Alert Recipient Email</label>
                <Input 
                  defaultValue="admin@pulseguard.io" 
                  className="bg-neutral-900/40 border-neutral-800 focus-visible:ring-1 focus-visible:ring-primary text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400">HTTP 5xx Error Threshold (%)</label>
                <Input 
                  type="number" 
                  defaultValue="1" 
                  className="bg-neutral-900/40 border-neutral-800 focus-visible:ring-1 focus-visible:ring-primary text-xs h-9"
                />
                <span className="text-[10px] text-neutral-500 block leading-normal mt-1">
                  We will trigger high-priority alerts if error rates exceed this percentage within any 5-minute window.
                </span>
              </div>

              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/95 text-xs h-9 shadow-lg shadow-primary/10">
                <BellRing className="h-3.5 w-3.5 mr-2" />
                Configure Incident Triggers
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* API Keys Sidebar Card */}
        <div className="space-y-6">
          <Card className="bg-neutral-950 border-neutral-900 shadow-md">
            <CardHeader className="border-b border-border/10 pb-4">
              <CardTitle className="text-sm font-semibold text-neutral-200">API Credentials</CardTitle>
              <CardDescription className="text-xs text-neutral-500">Authenticating SDK clients tracking API events</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* API Key visual box */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400 font-semibold flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5 text-primary" />
                    Write-Only API Key
                  </span>
                  <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/20 bg-emerald-500/5 font-mono">Active</Badge>
                </div>
                
                <div className="flex items-center gap-1.5 bg-neutral-900/50 border border-neutral-800 p-2 rounded-lg font-mono text-xs">
                  <span className="text-neutral-400 select-all truncate flex-1">pg_live_7fb488f5...</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-neutral-400 hover:text-white shrink-0">
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-neutral-400 hover:text-white shrink-0">
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <span className="text-[9px] text-neutral-500 block leading-normal mt-1">
                  Used by our Next.js, FastAPI, or Express middleware client configurations. Do not share.
                </span>
              </div>

              <div className="border-t border-border/10 pt-4 space-y-3">
                <span className="text-xs font-semibold text-neutral-300 block">Integration Guide</span>
                <p className="text-[10px] text-neutral-400 leading-normal">
                  Embed the SDK into your web application in seconds. Read our installation guide to get started.
                </p>
                <Button variant="outline" size="sm" className="w-full bg-neutral-900/40 border-neutral-800 text-[10px] h-8 justify-between hover:bg-neutral-900/60 text-neutral-300 hover:text-white">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="h-3.5 w-3.5 text-neutral-400" />
                    View SDK Quickstart
                  </span>
                  <ExternalLink className="h-3 w-3 text-neutral-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
