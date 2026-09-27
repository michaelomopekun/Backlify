import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/shared/stat-card";
import {
  IconShieldCheck,
  IconClock,
  IconBolt,
  IconRefresh,
  IconSearch,
  IconTerminal2,
} from "@tabler/icons-react";

export function RestoresSkeleton() {
  return (
    <div className="space-y-16 sm:space-y-20 pb-28 sm:pb-24 animate-in fade-in duration-200">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            Restores
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-normal">
            Automated recovery drills & point-in-time database restores
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <Button
            disabled
            variant="outline"
            className="flex-1 sm:flex-none h-9.5 px-4 text-xs sm:text-sm font-medium opacity-80 cursor-not-allowed"
          >
            <IconShieldCheck className="size-4 mr-1.5 text-emerald-400" />
            Run DR Drill
          </Button>
          <Button
            disabled
            className="flex-1 sm:flex-none h-9.5 px-4 bg-primary text-primary-foreground text-xs sm:text-sm font-semibold shadow-xs opacity-80 cursor-not-allowed"
          >
            <IconBolt className="size-4 mr-1.5" />
            New Restore
          </Button>
        </div>
      </div>

      {/* ── Stat Cards: using the EXACT StatCard component directly, replacing only values with placeholders ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={IconClock}
          label="Recovery Point (RPO)"
          value={<Skeleton className="h-7 w-20 bg-white/[0.08]" />}
          sub={<Skeleton className="h-3.5 w-28 bg-white/[0.04]" />}
          accent="text-muted-foreground"
        />
        <StatCard
          icon={IconBolt}
          label="Estimated RTO"
          value={<Skeleton className="h-7 w-12 bg-white/[0.08]" />}
          sub="Average drill duration"
          accent="text-indigo-400"
        />
        <StatCard
          icon={IconShieldCheck}
          label="Last Verified Drill"
          value={<Skeleton className="h-7 w-24 bg-white/[0.08]" />}
          sub={<Skeleton className="h-3.5 w-24 bg-white/[0.04]" />}
          accent="text-emerald-400"
        />
        <StatCard
          icon={IconRefresh}
          label="DR Readiness Score"
          value={<Skeleton className="h-7 w-14 bg-white/[0.08]" />}
          sub={<Skeleton className="h-3.5 w-28 bg-white/[0.04]" />}
          accent="text-emerald-400"
        />
      </div>

      {/* ── PITR Timeline Scrubber Frame ── */}
      <Card className="border-border/60 bg-card/60 py-0 gap-0 overflow-visible shadow-xs">
        <CardHeader className="p-5 sm:p-6 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <CardTitle className="text-sm sm:text-base font-semibold text-foreground">
                Point-in-Time Recovery
              </CardTitle>
              <Badge variant="outline" className="text-xs font-medium">
                Drag scrubber
              </Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground font-normal">
              Drag the handle or click any checkpoint below to select a recovery target
            </CardDescription>
          </div>
          <span className="text-xs font-medium text-muted-foreground bg-muted/40 border border-border/60 rounded-md px-3 py-1 self-start sm:self-auto flex items-center gap-1.5">
            <Skeleton className="h-3 w-8 bg-white/[0.06]" /> Checkpoints
          </span>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 space-y-6 overflow-visible">
          {/* Horizontal Background Rail (Empty during loading) */}
          <div className="relative h-6 flex items-center px-1">
            <div className="h-1.5 w-full bg-[#1c1c1c] rounded-full overflow-hidden border border-border/60" />
          </div>

          {/* Timeline Range Milestones */}
          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground select-none px-0.5">
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-muted-foreground/40" />
              <Skeleton className="h-3 w-24 bg-white/[0.05]" />
            </div>
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-3 w-24 bg-white/[0.05]" />
              <span className="size-1.5 rounded-full bg-emerald-400/40" />
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-5 sm:p-6 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/10">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <span className="size-2 rounded-full bg-emerald-400/40 shrink-0" />
            <Skeleton className="h-4 w-36 bg-white/[0.08]" />
            <span className="text-muted-foreground/40 hidden sm:inline">·</span>
            <Skeleton className="h-5 w-44 rounded bg-white/[0.06]" />
          </div>

          <Button
            disabled
            size="sm"
            className="h-9 px-4 text-xs sm:text-sm font-semibold shadow-xs shrink-0 self-start sm:self-auto opacity-70 cursor-not-allowed"
          >
            <IconBolt className="size-4 mr-1.5" />
            Restore from this point
          </Button>
        </CardFooter>
      </Card>

      {/* ── Recent Recovery Events Section ── */}
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">
              Recent Recovery Drills & Restores
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-normal">
              Audit log of simulated disaster recovery drills and active database clones
            </p>
          </div>

          <div className="relative w-full sm:w-64 shrink-0">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              disabled
              type="text"
              placeholder="Search drills..."
              className="h-9.5 pl-9 pr-3 w-full bg-muted/20 border border-border/60 rounded-md text-xs sm:text-sm text-muted-foreground"
            />
          </div>
        </div>

        {/* Drill Card Skeletons */}
        <div className="space-y-4 sm:space-y-5">
          {[1, 2].map((i) => (
            <Card key={i} className="border-border/60 bg-card/60 py-0 gap-0 overflow-hidden shadow-xs">
              <CardHeader className="p-4 sm:p-5 border-b border-border/50 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="size-2 rounded-full bg-emerald-400/40 shrink-0" />
                    <Skeleton className="h-4 w-32 bg-white/[0.08]" />
                    <Skeleton className="h-4 w-14 rounded bg-white/[0.05]" />
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Skeleton className="h-7 sm:h-8 w-14 rounded bg-white/[0.06]" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3.5 w-36 bg-white/[0.06]" />
                  <span className="text-muted-foreground/40">·</span>
                  <Skeleton className="h-3.5 w-24 bg-white/[0.04]" />
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-xs">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Target</p>
                    <Skeleton className="h-4 w-32 bg-white/[0.06]" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Executed</p>
                    <Skeleton className="h-4 w-20 bg-white/[0.06]" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Duration</p>
                    <Skeleton className="h-4 w-14 bg-white/[0.06]" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Payload Size</p>
                    <Skeleton className="h-4 w-16 bg-white/[0.06]" />
                  </div>
                </div>

                <div className="flex items-center gap-2.5 pt-4 border-t border-border/50">
                  <Skeleton className="h-5 w-16 rounded bg-white/[0.07]" />
                  <span className="text-muted-foreground/40 text-xs">·</span>
                  <Skeleton className="h-3.5 w-32 bg-white/[0.04]" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
