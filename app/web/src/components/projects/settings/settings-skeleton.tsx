import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  IconDatabase,
  IconShieldLock,
  IconRefresh,
  IconAdjustments,
  IconBell,
  IconAlertTriangle,
  IconClock,
  IconSettings,
} from "@tabler/icons-react";

export function SettingsSkeleton() {
  return (
    <div className="w-full space-y-8 sm:space-y-10 animate-in fade-in duration-200">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            Project Settings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-normal">
            Database credentials, storage vaults, encryption keys & retention policies
          </p>
        </div>

        {/* Project ID Badge (Dynamic value skeletonized) */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-2 px-3 py-1 rounded-md border border-border bg-card text-xs font-medium text-muted-foreground shadow-xs">
            <span>ID:</span>
            <Skeleton className="h-3.5 w-20 bg-white/[0.08]" />
          </div>
        </div>
      </div>

      {/* ── Main Layout: Settings Forms & Widescreen Companion Rail ── */}
      <div className="flex flex-col xl:flex-row items-start gap-8 2xl:gap-12">
        {/* Left / Main Column: Settings Forms */}
        <div className="flex-1 min-w-0 w-full space-y-12 sm:space-y-16 pb-28 sm:pb-24">
          {/* ── Section 1: General Information ── */}
          <Card className="border-border/60 bg-card/60 py-0 gap-0 overflow-hidden shadow-xs">
            <CardHeader className="p-5 sm:p-6 border-b border-border/50">
              <CardTitle className="text-base font-semibold text-foreground">General Information</CardTitle>
              <CardDescription className="text-xs text-muted-foreground font-normal">
                Basic project metadata and environment tagging
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 sm:p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Project Name
                  </Label>
                  <div className="h-9 px-3 bg-[#080808] border border-input rounded-md flex items-center">
                    <Skeleton className="h-3.5 w-28 bg-white/[0.08]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Environment Tier
                  </Label>
                  <div className="h-9 px-3 bg-[#080808] border border-input rounded-md flex items-center justify-between">
                    <Skeleton className="h-3.5 w-24 bg-white/[0.08]" />
                    <div className="size-3.5 opacity-40 border-r border-b border-white rotate-45 mr-1" />
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="px-5 sm:px-6 py-3.5 bg-muted/30 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground font-normal">
              <span>Please use 64 characters at maximum for project names.</span>
              <Button
                disabled
                size="sm"
                className="h-8.5 px-3.5 text-xs font-medium self-end sm:self-auto bg-white text-black opacity-80 cursor-not-allowed"
              >
                Save Changes
              </Button>
            </CardFooter>
          </Card>

          {/* ── Section 2: Target Database Connection ── */}
          <Card className="border-border/60 bg-card/60 py-0 gap-0 overflow-hidden shadow-xs">
            <CardHeader className="p-5 sm:p-6 border-b border-border/50 flex flex-row items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <IconDatabase className="size-4 text-emerald-400" />
                  <span>Target Database Connection</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground font-normal">
                  Encrypted PostgreSQL connection URI used by backup workers and DR drills
                </CardDescription>
              </div>

              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                Configured
              </span>
            </CardHeader>

            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  PostgreSQL Connection URI
                </Label>
                <div className="h-9 px-3.5 bg-[#080808] border border-input rounded-md flex items-center justify-between">
                  <Skeleton className="h-2.5 w-72 max-w-full bg-white/[0.08]" />
                  <div className="flex items-center gap-2 opacity-40">
                    <Skeleton className="size-3.5 rounded bg-white/20" />
                    <Skeleton className="size-3.5 rounded bg-white/20" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Credentials are encrypted at rest using envelope encryption (AES-256-GCM).
                </p>
              </div>
            </CardContent>

            <CardFooter className="px-5 sm:px-6 py-3.5 bg-muted/30 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground font-normal">
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <Button
                  disabled
                  variant="outline"
                  size="sm"
                  className="h-8.5 px-3 text-xs border-border bg-card font-medium w-full sm:w-auto opacity-80 cursor-not-allowed"
                >
                  <IconRefresh className="size-3.5 mr-1.5 text-muted-foreground" />
                  Test Connection & Ping
                </Button>

                <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border/60 bg-muted/20 text-[11px] font-mono text-muted-foreground">
                  <span>Outbound IP:</span>
                  <Skeleton className="h-3 w-16 bg-white/[0.08]" />
                </div>
              </div>

              <Button
                disabled
                size="sm"
                className="h-8.5 px-3.5 text-xs font-medium w-full sm:w-auto bg-white text-black opacity-80 cursor-not-allowed"
              >
                Save Connection
              </Button>
            </CardFooter>
          </Card>

          {/* ── Section 3: Storage Vault & KMS Encryption ── */}
          <Card className="border-border/60 bg-card/60 py-0 gap-0 overflow-hidden shadow-xs">
            <CardHeader className="p-5 sm:p-6 border-b border-border/50">
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <IconShieldLock className="size-4 text-indigo-400" />
                <span>Storage Vault & KMS Encryption</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground font-normal">
                S3-compatible immutable backup vault with Customer-Managed Keys (CMK)
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Provider</Label>
                  <div className="h-9 px-3 bg-[#080808] border border-input rounded-md flex items-center">
                    <Skeleton className="h-3.5 w-20 bg-white/[0.08]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Bucket Name</Label>
                  <div className="h-9 px-3 bg-[#080808] border border-input rounded-md flex items-center">
                    <Skeleton className="h-3.5 w-28 bg-white/[0.08]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Region</Label>
                  <div className="h-9 px-3 bg-[#080808] border border-input rounded-md flex items-center">
                    <Skeleton className="h-3.5 w-16 bg-white/[0.08]" />
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="px-5 sm:px-6 py-3.5 bg-muted/30 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground font-normal">
              <span>Ensure the IAM role has PutObject and GetObject permissions on this bucket.</span>
              <Button
                disabled
                size="sm"
                className="h-8.5 px-3.5 text-xs font-medium self-end sm:self-auto bg-white text-black opacity-80 cursor-not-allowed"
              >
                Update Vault
              </Button>
            </CardFooter>
          </Card>

          {/* ── Section 4: Automated Snapshot Retention (FIFO) ── */}
          <Card className="border-border/60 bg-card/60 py-0 gap-0 overflow-hidden shadow-xs">
            <CardHeader className="p-5 sm:p-6 border-b border-border/50">
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <IconAdjustments className="size-4 text-muted-foreground" />
                <span>Automated Snapshot Retention (FIFO)</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground font-normal">
                Automatically purge snapshots exceeding your retention threshold after successful verification
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 sm:p-6 space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Snapshot Retention Window</Label>
                  <Skeleton className="h-4 w-28 bg-white/[0.08]" />
                </div>
                <div className="w-full h-1.5 bg-[#1c1c1c] rounded-lg" />
              </div>
            </CardContent>

            <CardFooter className="px-5 sm:px-6 py-3.5 bg-muted/30 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground font-normal">
              <span>Old snapshots are deleted only after the newest snapshot is verified.</span>
              <Button
                disabled
                size="sm"
                className="h-8.5 px-3.5 text-xs font-medium self-end sm:self-auto bg-white text-black opacity-80 cursor-not-allowed"
              >
                Save Retention Policy
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* ── Right Column: Sticky Companion Rail (Visible on xl: and 2xl: displays) ── */}
        <div className="hidden xl:flex flex-col w-80 2xl:w-88 shrink-0 sticky top-6 space-y-5 self-start">
          {/* Quick Navigation: On this page (Static navigation) */}
          <div className="rounded-xl border border-border/60 bg-card/60 p-4 space-y-3 shadow-xs">
            <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider block px-1">
              On this page
            </span>
            <nav className="space-y-1">
              {[
                { id: "general", label: "General Information", icon: IconSettings },
                { id: "database", label: "Target Database", icon: IconDatabase },
                { id: "storage", label: "Storage Vault & KMS", icon: IconShieldLock },
                { id: "retention", label: "Snapshot Retention", icon: IconClock },
                { id: "alerts", label: "Alerts & Webhooks", icon: IconBell },
                { id: "danger-zone", label: "Danger Zone", icon: IconAlertTriangle, danger: true },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs ${
                      idx === 0
                        ? "bg-[#202020] text-white font-medium border border-[#2c2c2c]"
                        : item.danger
                        ? "text-destructive/80"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="size-3.5 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Live Configuration Snapshot (Skeletons ONLY on dynamic values in red boxes) */}
          <div className="rounded-xl border border-border/60 bg-card/60 p-4 space-y-3 shadow-xs text-xs">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <span className="font-semibold text-foreground text-[11px] uppercase tracking-wider">
                Configuration State
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                Active
              </span>
            </div>

            <div className="space-y-2.5 divide-y divide-border/30 pt-1">
              <div className="flex items-center justify-between pt-1">
                <span className="text-muted-foreground">Environment</span>
                <Skeleton className="h-3.5 w-16 bg-white/[0.08]" />
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-muted-foreground">Target DB</span>
                <Skeleton className="h-3.5 w-20 bg-white/[0.08]" />
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-muted-foreground">Storage Vault</span>
                <span className="font-mono text-foreground text-[11px]">—</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-muted-foreground">Encryption</span>
                <Skeleton className="h-3.5 w-24 bg-white/[0.08]" />
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-muted-foreground">Retention Window</span>
                <Skeleton className="h-3.5 w-28 bg-white/[0.08]" />
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-muted-foreground">Incident Alerts</span>
                <Skeleton className="h-3.5 w-14 bg-white/[0.08]" />
              </div>
            </div>
          </div>

          {/* Disaster Recovery SLA Card (Static) */}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
              <IconShieldLock className="size-4" />
              <span>Security & DR Assurances</span>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Continuous WAL archiving guarantees sub-60s RPO with automated disaster recovery restore drills.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
