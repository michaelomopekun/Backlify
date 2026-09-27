import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import {
  IconCalendarTime,
  IconClock,
  IconRefresh,
  IconPlus,
} from "@tabler/icons-react";

export function SchedulesSkeleton() {
  return (
    <div className="space-y-16 sm:space-y-20 pb-28 sm:pb-24 animate-in fade-in duration-200">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            Schedules
          </h1>
          {/* Skeletons only for dynamic counts & next run info */}
          <Skeleton className="h-4 w-60 max-w-full bg-white/[0.06]" />
        </div>
        <Button
          disabled
          className="w-full sm:w-auto bg-primary text-primary-foreground text-xs sm:text-sm font-semibold h-9.5 px-4 shadow-xs shrink-0 mt-1 sm:mt-0 opacity-80 cursor-not-allowed"
        >
          <IconPlus className="size-4 mr-1.5" />
          New Schedule
        </Button>
      </div>

      {/* ── Stat Cards: using the EXACT StatCard component directly, replacing only values with placeholders ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          icon={IconCalendarTime}
          label="Active Schedules"
          value={<Skeleton className="h-7 w-12 bg-white/[0.08]" />}
          sub={<Skeleton className="h-3.5 w-16 bg-white/[0.04]" />}
          accent="text-emerald-400"
        />
        <StatCard
          icon={IconClock}
          label="Next Run In"
          value={<Skeleton className="h-7 w-16 bg-white/[0.08]" />}
          sub={<Skeleton className="h-3.5 w-32 bg-white/[0.04]" />}
          accent="text-muted-foreground"
        />
        <StatCard
          icon={IconRefresh}
          label="Avg Backup Duration"
          value={<Skeleton className="h-7 w-16 bg-white/[0.08]" />}
          sub="Across all schedules"
          accent="text-indigo-400"
        />
      </div>

      {/* ── 24h Timeline Rail: Rail container, ticks and frame stay static; pins empty during skeleton loading ── */}
      <Card className="border-border/60 bg-card/60 py-0 gap-0 overflow-hidden shadow-xs">
        <CardHeader className="p-5 sm:p-6 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-sm font-semibold text-foreground">Next 24h Timeline</CardTitle>
            <CardDescription className="text-xs text-muted-foreground font-normal">
              Scheduled fires — UTC
            </CardDescription>
          </div>
          <span className="text-xs font-medium text-muted-foreground bg-muted/40 border border-border/60 rounded-md px-3 py-1 self-start sm:self-auto">
            Now: --:-- UTC
          </span>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 space-y-6">
          {/* Timeline Stem Track */}
          <div className="relative pt-7 pb-7 select-none px-3 sm:px-6">
            {/* Thin 1px Baseline (pin bucket left empty during skeleton) */}
            <div className="relative h-px w-full bg-[#262626]" />

            {/* Hour Tick Marks & Labels safely below */}
            <div className="relative w-full h-4 mt-5 pointer-events-none">
              {[
                { h: 0, label: "00:00" },
                { h: 6, label: "06:00", hideMobile: true },
                { h: 12, label: "12:00" },
                { h: 18, label: "18:00", hideMobile: true },
                { h: 24, label: "24:00" },
              ].map((item) => (
                <div
                  key={item.h}
                  className={`absolute top-0 -translate-x-1/2 flex flex-col items-center ${
                    item.hideMobile ? "hidden sm:flex" : "flex"
                  }`}
                  style={{ left: `${(item.h / 24) * 100}%` }}
                >
                  <div className="w-px h-1.5 bg-[#262626] mb-1.5" />
                  <span className="text-[11px] text-muted-foreground/70">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Legend placeholder */}
          <div className="flex flex-wrap items-center gap-5 sm:gap-7 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#FFB31F]/30" />
              <Skeleton className="h-3 w-32 bg-white/[0.05]" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Schedules Section ── */}
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">
              All Schedules
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-normal">
              Configured cron rules, snapshot policies, and retention schedules
            </p>
          </div>
          <span className="text-xs font-medium text-muted-foreground self-start sm:self-auto bg-muted/40 border border-border/60 rounded-md px-3 py-1 flex items-center gap-1.5">
            <Skeleton className="h-3 w-10 bg-white/[0.06]" /> configured
          </span>
        </div>

        {/* ── Schedule Card Skeletons ── */}
        <div className="space-y-4 sm:space-y-5">
          {[1, 2].map((i) => (
            <Card key={i} className="border-border/60 bg-card/60 py-0 gap-0 overflow-hidden shadow-xs">
              <CardHeader className="p-5 sm:p-6 border-b border-border/50 flex flex-row items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="size-2 rounded-full bg-emerald-400/30" />
                    <Skeleton className="h-4.5 w-44 bg-white/[0.08]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-24 rounded bg-white/[0.06]" />
                    <span className="text-muted-foreground/40">·</span>
                    <Skeleton className="h-3.5 w-32 bg-white/[0.04]" />
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-9 h-5 rounded-full bg-white/[0.06]" />
                  <div className="size-8 rounded-md bg-white/[0.04]" />
                </div>
              </CardHeader>
              <CardContent className="p-5 sm:p-6 space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-xs">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Next Run</p>
                    <Skeleton className="h-4 w-16 bg-white/[0.06]" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Last Run</p>
                    <Skeleton className="h-4 w-20 bg-white/[0.06]" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Retention</p>
                    <Skeleton className="h-4 w-24 bg-white/[0.06]" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Avg Duration</p>
                    <Skeleton className="h-4 w-14 bg-white/[0.06]" />
                  </div>
                </div>
                <div className="flex items-center gap-2.5 pt-4 border-t border-border/50">
                  <Skeleton className="h-5 w-16 rounded bg-white/[0.07]" />
                  <span className="text-muted-foreground/40 text-xs">·</span>
                  <Skeleton className="h-3.5 w-20 bg-white/[0.04]" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
