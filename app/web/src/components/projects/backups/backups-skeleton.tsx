import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import {
  IconBolt,
  IconDatabaseImport,
  IconCloudUpload,
  IconShieldCheck,
  IconClock,
  IconSearch,
  IconChevronDown,
} from "@tabler/icons-react";

export function BackupsSkeleton() {
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };
  });

  return (
    <div className="space-y-16 sm:space-y-20 pb-28 sm:pb-24 animate-in fade-in duration-200">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            Backups
          </h1>
          {/* Only the dynamic storage/count subtitle is replaced with a placeholder */}
          <Skeleton className="h-4 w-72 max-w-full bg-white/[0.06]" />
        </div>
        <Button
          disabled
          className="w-full sm:w-auto bg-primary text-primary-foreground text-xs sm:text-sm font-semibold h-9.5 px-4 shadow-xs shrink-0 mt-1 sm:mt-0 opacity-80 cursor-not-allowed"
        >
          <IconBolt className="size-4 mr-1.5" />
          Trigger Manual Backup
        </Button>
      </div>

      {/* ── Stat Cards: using the EXACT StatCard component directly, replacing only values with placeholders ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={IconDatabaseImport}
          label="Total Snapshots"
          value={<Skeleton className="h-7 w-12 bg-white/[0.08]" />}
          sub={<Skeleton className="h-3.5 w-28 bg-white/[0.04]" />}
          accent="text-emerald-400"
        />
        <StatCard
          icon={IconCloudUpload}
          label="Total Stored"
          value={<Skeleton className="h-7 w-20 bg-white/[0.08]" />}
          sub={<Skeleton className="h-3.5 w-36 bg-white/[0.04]" />}
          accent="text-blue-400"
        />
        <StatCard
          icon={IconShieldCheck}
          label="Success Rate"
          value={<Skeleton className="h-7 w-16 bg-white/[0.08]" />}
          sub={<Skeleton className="h-3.5 w-24 bg-white/[0.04]" />}
          accent="text-emerald-400"
        />
        <StatCard
          icon={IconClock}
          label="Next Scheduled"
          value={<Skeleton className="h-7 w-10 bg-white/[0.08]" />}
          sub="Check schedules page"
          accent="text-muted-foreground"
        />
      </div>

      {/* ── 7-Day Activity Chart: each bucket left EMPTY (no fill placeholder), with smooth fill-up on load ── */}
      <div className="rounded-xl border border-border/60 bg-card/60 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-foreground">Backup Activity</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Last 7 days</p>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-sm bg-emerald-400" />
              Scheduled
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-sm bg-blue-400" />
              Manual
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-sm bg-red-500" />
              Failed
            </span>
          </div>
        </div>

        {/* 7 Daily Bar Columns — each bucket is empty */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-4">
          {past7Days.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-2.5">
              <div className="relative w-full max-w-[42px] h-24 bg-white/[0.03] border border-white/[0.06] rounded-md flex flex-col justify-end p-1">
                {/* Empty bucket baseline indicator */}
                <div className="w-full h-1.5 rounded-sm bg-white/10 self-center opacity-40" />
              </div>
              <div className="text-center">
                <p className={`text-xs ${i === 6 ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                  {day.label}
                </p>
                <p className="text-[11px] text-muted-foreground/60 mt-0.5">{day.date}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary strip — static text labels, placeholders only for numbers */}
        <div className="pt-4 border-t border-border/50 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Skeleton className="size-3.5 rounded bg-white/[0.08]" /> total backups
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1.5">
            <Skeleton className="size-3.5 rounded bg-emerald-400/30" /> succeeded
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1.5">
            <Skeleton className="size-3.5 rounded bg-red-400/30" /> failed
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1.5">
            <Skeleton className="size-3.5 rounded bg-blue-400/30" /> manual
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1.5">
            <Skeleton className="size-3.5 rounded bg-white/[0.08]" /> in progress
          </span>
        </div>
      </div>

      {/* ── Backups Table Section ── */}
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">
              All Snapshots
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-normal">
              Browse, download, or restore point-in-time PostgreSQL backup artifacts
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none">
              <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[#444444]" />
              <input
                disabled
                type="text"
                placeholder="Search…"
                className="h-8 pl-8 pr-3 bg-[#111111] border border-[#1e1e1e] rounded text-[12px] text-white placeholder-[#444444] focus:outline-none w-full sm:w-44"
              />
            </div>

            {/* Type filter */}
            <button
              disabled
              className="flex items-center gap-1.5 h-8 px-3 text-[12px] text-[#888888] border border-[#1e1e1e] bg-[#111111] rounded font-mono"
            >
              <span>Type: All</span>
              <IconChevronDown className="size-3 text-[#666666]" />
            </button>

            {/* Status filter */}
            <button
              disabled
              className="flex items-center gap-1.5 h-8 px-3 text-[12px] text-[#888888] border border-[#1e1e1e] bg-[#111111] rounded font-mono"
            >
              <span>Status: All</span>
              <IconChevronDown className="size-3 text-[#666666]" />
            </button>
          </div>
        </div>

        {/* Table Rows Skeleton */}
        <div className="rounded-lg border border-[#1e1e1e] bg-[#111111] overflow-hidden divide-y divide-[#1e1e1e]">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 px-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <Skeleton className="h-5 w-20 rounded-full bg-white/[0.07]" />
                <div className="space-y-1 min-w-0">
                  <Skeleton className="h-3.5 w-40 bg-white/[0.08]" />
                  <Skeleton className="h-2.5 w-28 bg-white/[0.04]" />
                </div>
              </div>
              <Skeleton className="h-3.5 w-24 bg-white/[0.05] hidden md:block" />
              <Skeleton className="h-3.5 w-16 bg-white/[0.05] hidden sm:block" />
              <Skeleton className="size-7 rounded bg-white/[0.05]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
