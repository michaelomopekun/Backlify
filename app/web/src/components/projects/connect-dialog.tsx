"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  IconPlugConnected,
  IconCopy,
  IconCheck,
  IconEye,
  IconEyeOff,
  IconRefresh,
  IconCircleCheck,
  IconAlertTriangle,
  IconServer,
  IconExternalLink,
  IconShieldLock,
} from "@tabler/icons-react";

interface ConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  databaseUrl: string;
}

function parsePostgresUri(uri: string) {
  try {
    const url = new URL(uri);
    return {
      host: url.hostname || "—",
      port: url.port || "5432",
      database: url.pathname.replace(/^\//, "") || "postgres",
      user: url.username || "postgres",
    };
  } catch {
    return {
      host: "—",
      port: "5432",
      database: "postgres",
      user: "postgres",
    };
  }
}

function maskUriPassword(uri: string): string {
  try {
    const url = new URL(uri);
    if (url.password) {
      url.password = "••••••••";
    }
    return url.toString();
  } catch {
    return uri.replace(/:[^@/]+@/, ":••••••••@");
  }
}

export function ConnectDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
  databaseUrl,
}: ConnectDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedUri, setCopiedUri] = useState(false);
  const [copiedIp, setCopiedIp] = useState(false);

  const [testingPing, setTestingPing] = useState(false);
  const [pingResult, setPingResult] = useState<{
    status: "idle" | "success" | "error";
    latency?: number;
    version?: string;
    ssl?: boolean;
    error?: string;
    isFirewallLikely?: boolean;
    egressIp?: string;
  }>({ status: "idle" });

  const egressIp = "52.204.14.88";
  const params = parsePostgresUri(databaseUrl);
  const displayUri = showPassword ? databaseUrl : maskUriPassword(databaseUrl);

  const handleCopyUri = () => {
    if (!databaseUrl) return;
    navigator.clipboard.writeText(databaseUrl);
    setCopiedUri(true);
    setTimeout(() => setCopiedUri(false), 2000);
  };

  const handleCopyIp = () => {
    navigator.clipboard.writeText(egressIp);
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2000);
  };

  const handleTestConnection = async () => {
    if (!databaseUrl) {
      setPingResult({
        status: "error",
        error: "No database URL configured. Add your connection URI in Project Settings.",
      });
      return;
    }

    setTestingPing(true);
    setPingResult({ status: "idle" });

    try {
      const res = await fetch("/api/projects/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          databaseUrl,
        }),
      });
      const data = await res.json();
      setTestingPing(false);

      if (res.ok && data.success) {
        setPingResult({
          status: "success",
          latency: data.latencyMs,
          version: `${data.version}${data.database ? ` • DB: ${data.database}` : ""}${data.ssl ? " • SSL Active" : ""}`,
          ssl: data.ssl,
        });
      } else {
        setPingResult({
          status: "error",
          error: data.error || "Connection test failed. Check credentials and firewall allowlist.",
          isFirewallLikely: Boolean(data.isFirewallLikely),
          egressIp: data.egressIp || egressIp,
        });
      }
    } catch (err: any) {
      setTestingPing(false);
      setPingResult({
        status: "error",
        error: err?.message || "Failed to reach the database diagnostic service.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-[#0f0f0f] border-[#222222] p-0 text-foreground overflow-hidden shadow-2xl">
        <DialogHeader className="p-6 border-b border-[#1f1f1f]">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <IconPlugConnected className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-white">
                Connect to Database
              </DialogTitle>
              <DialogDescription className="text-xs text-[#888888] mt-0.5">
                Direct credentials and egress firewall information for {projectName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* ── 1. Connection URI ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">PostgreSQL URI</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="inline-flex items-center gap-1 text-[11px] text-[#888888] hover:text-white transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-[#1a1a1a]"
                >
                  {showPassword ? (
                    <>
                      <IconEyeOff className="size-3" />
                      <span>Hide Password</span>
                    </>
                  ) : (
                    <>
                      <IconEye className="size-3" />
                      <span>Show Password</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="relative flex items-center bg-[#080808] border border-[#222222] rounded-lg p-2.5 group">
              <code className="text-xs font-mono text-[#e5e5e5] truncate pr-16 select-all flex-1">
                {displayUri || "No database connection string configured"}
              </code>
              <Button
                type="button"
                size="sm"
                onClick={handleCopyUri}
                disabled={!databaseUrl}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 px-2.5 text-xs bg-[#1a1a1a] hover:bg-[#252525] border border-[#2c2c2c] text-white font-medium"
              >
                {copiedUri ? (
                  <>
                    <IconCheck className="size-3 mr-1 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <IconCopy className="size-3 mr-1 text-[#888888]" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* ── 2. Connection Parameters Breakdown ── */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-foreground">Connection Parameters</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-lg border border-[#1f1f1f] bg-[#141414] space-y-0.5 min-w-0">
                <p className="text-[10px] text-[#777777] uppercase font-mono tracking-wider">Host</p>
                <p className="text-white font-mono text-xs truncate" title={params.host}>
                  {params.host}
                </p>
              </div>
              <div className="p-2.5 rounded-lg border border-[#1f1f1f] bg-[#141414] space-y-0.5">
                <p className="text-[10px] text-[#777777] uppercase font-mono tracking-wider">Port</p>
                <p className="text-white font-mono text-xs">{params.port}</p>
              </div>
              <div className="p-2.5 rounded-lg border border-[#1f1f1f] bg-[#141414] space-y-0.5 min-w-0">
                <p className="text-[10px] text-[#777777] uppercase font-mono tracking-wider">Database</p>
                <p className="text-white font-mono text-xs truncate" title={params.database}>
                  {params.database}
                </p>
              </div>
              <div className="p-2.5 rounded-lg border border-[#1f1f1f] bg-[#141414] space-y-0.5 min-w-0">
                <p className="text-[10px] text-[#777777] uppercase font-mono tracking-wider">User</p>
                <p className="text-white font-mono text-xs truncate" title={params.user}>
                  {params.user}
                </p>
              </div>
            </div>
          </div>

          {/* ── 3. Backlify Egress Firewall Allowlist ── */}
          <div className="rounded-xl border border-border/60 bg-[#141414] p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <IconShieldLock className="size-4 text-emerald-400" />
                <span>Firewall Allowlist (Backlify Outbound IP)</span>
              </div>
              <button
                type="button"
                onClick={handleCopyIp}
                className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
              >
                {copiedIp ? (
                  <>
                    <IconCheck className="size-3" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <IconCopy className="size-3" />
                    <span>Copy IP</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center justify-between bg-black/60 border border-[#222222] rounded-md px-3 py-2">
              <code className="text-xs font-mono text-emerald-400 font-semibold">{egressIp}</code>
              <span className="text-[11px] text-[#666666] font-mono">CIDR: /32</span>
            </div>
            <p className="text-[11px] text-[#888888] leading-relaxed">
              If your PostgreSQL database is hosted on AWS RDS, Supabase, Neon, or a VPC behind a firewall, ensure <code className="text-white font-mono text-[10.5px]">{egressIp}</code> is allowlisted to permit backups and restore drills.
            </p>
          </div>

          {/* ── 4. Live Connection Diagnostic ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">Live Probe Diagnostic</span>
              <Button
                type="button"
                size="sm"
                onClick={handleTestConnection}
                disabled={testingPing || !databaseUrl}
                variant="outline"
                className="h-7 px-3 text-xs border-[#2c2c2c] bg-[#171717] hover:bg-[#222222] text-white"
              >
                <IconRefresh className={`size-3 mr-1.5 ${testingPing ? "animate-spin text-muted-foreground" : ""}`} />
                {testingPing ? "Testing…" : "Test Connection & Ping"}
              </Button>
            </div>

            {pingResult.status === "success" && (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-3 space-y-1 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <IconCircleCheck className="size-4" />
                  <span>Connection Verified {pingResult.latency ? `(${pingResult.latency}ms)` : ""}</span>
                </div>
                <p className="text-muted-foreground text-[11px]">{pingResult.version}</p>
              </div>
            )}

            {pingResult.status === "error" && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 space-y-1 text-xs">
                <div className="flex items-center gap-2 text-destructive font-semibold">
                  <IconAlertTriangle className="size-4" />
                  <span>{pingResult.isFirewallLikely ? "Firewall Block Detected" : "Connection Failed"}</span>
                </div>
                <p className="text-destructive/80 text-[11px]">{pingResult.error}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 bg-[#141414] border-t border-[#1f1f1f] flex items-center justify-between">
          <Link
            href={`/dashboard/project/${projectId}/settings#database`}
            onClick={() => onOpenChange(false)}
            className="inline-flex items-center gap-1.5 text-xs text-[#888888] hover:text-white transition-colors"
          >
            <span>Edit in Project Settings</span>
            <IconExternalLink className="size-3" />
          </Link>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-8 px-4 text-xs font-medium bg-white text-black hover:bg-neutral-200"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
