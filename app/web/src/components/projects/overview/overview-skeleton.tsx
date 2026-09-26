import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  IconCircleCheck,
  IconCloudUpload,
  IconCalendarEvent,
  IconShieldLock,
  IconHistory,
  IconRotateClockwise,
  IconDatabase,
  IconNetwork,
  IconWorld,
  IconCpu,
} from "@tabler/icons-react";

export function ProjectOverviewSkeleton() {
  return (
    <div className="w-full space-y-12 animate-in fade-in duration-200">
      {/* Top Section: Status Cards (Left) + Topology Canvas (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Supabase-Style Status Grid */}
        <div className="xl:col-span-6 space-y-8">
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-44 bg-white/[0.08]" />
            <Skeleton className="h-4 w-72 bg-white/[0.04]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status */}
            <div className="flex items-center gap-3.5 p-3 rounded-lg bg-[#111111] border border-[#222222]">
              <div className="size-[54px] rounded-md bg-[#161616] border border-[#242424] flex items-center justify-center shrink-0">
                <div className="size-4 rounded-full border-2 border-amber-500/40 border-t-amber-400 animate-spin" />
              </div>
              <div className="space-y-1.5 min-w-0 flex-1">
                <p className="text-[10px] uppercase font-mono tracking-wider text-[#888888]">STATUS</p>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-zinc-400 font-medium">Checking...</span>
                  <Skeleton className="h-3.5 w-12 rounded-full bg-white/[0.06]" />
                </div>
              </div>
            </div>

            {/* Engine / Compute */}
            <div className="flex items-center gap-3.5 p-3 rounded-lg bg-[#111111] border border-[#222222]">
              <div className="size-[54px] rounded-md bg-[#161616] border border-[#242424] flex items-center justify-center shrink-0">
                <IconCpu className="size-5 text-zinc-500" stroke={1.5} />
              </div>
              <div className="space-y-1.5 min-w-0 flex-1">
                <p className="text-[10px] uppercase font-mono tracking-wider text-[#888888]">COMPUTE / ENGINE</p>
                <Skeleton className="h-4 w-28 bg-white/[0.07]" />
              </div>
            </div>

            {/* Retention */}
            <div className="flex items-center gap-3.5 p-3 rounded-lg bg-[#111111] border border-[#222222]">
              <div className="size-[54px] rounded-md bg-[#161616] border border-[#242424] flex items-center justify-center shrink-0">
                <IconShieldLock className="size-5 text-zinc-500" stroke={1.5} />
              </div>
              <div className="space-y-1.5 min-w-0 flex-1">
                <p className="text-[10px] uppercase font-mono tracking-wider text-[#888888]">RETENTION</p>
                <Skeleton className="h-4 w-24 bg-white/[0.07]" />
              </div>
            </div>

            {/* Storage Vault */}
            <div className="flex items-center gap-3.5 p-3 rounded-lg bg-[#111111] border border-[#222222]">
              <div className="size-[54px] rounded-md bg-[#161616] border border-[#242424] flex items-center justify-center shrink-0">
                <IconCloudUpload className="size-5 text-zinc-500" stroke={1.5} />
              </div>
              <div className="space-y-1.5 min-w-0 flex-1">
                <p className="text-[10px] uppercase font-mono tracking-wider text-[#888888]">STORAGE VAULT</p>
                <Skeleton className="h-4 w-20 bg-white/[0.07]" />
              </div>
            </div>

            {/* Active Schedule */}
            <div className="flex items-center gap-3.5 p-3 rounded-lg bg-[#111111] border border-[#222222]">
              <div className="size-[54px] rounded-md bg-[#161616] border border-[#242424] flex items-center justify-center shrink-0">
                <IconCalendarEvent className="size-5 text-zinc-500" stroke={1.5} />
              </div>
              <div className="space-y-1.5 min-w-0 flex-1">
                <p className="text-[10px] uppercase font-mono tracking-wider text-[#888888]">ACTIVE SCHEDULE</p>
                <Skeleton className="h-4 w-32 bg-white/[0.07]" />
              </div>
            </div>

            {/* Last Backup */}
            <div className="flex items-center gap-3.5 p-3 rounded-lg bg-[#111111] border border-[#222222]">
              <div className="size-[54px] rounded-md bg-[#161616] border border-[#242424] flex items-center justify-center shrink-0">
                <IconHistory className="size-5 text-zinc-500" stroke={1.5} />
              </div>
              <div className="space-y-1.5 min-w-0 flex-1">
                <p className="text-[10px] uppercase font-mono tracking-wider text-[#888888]">LAST BACKUP</p>
                <Skeleton className="h-4 w-28 bg-white/[0.07]" />
              </div>
            </div>

            {/* Restore Readiness */}
            <div className="flex items-center gap-3.5 p-3 rounded-lg bg-[#111111] border border-[#222222]">
              <div className="size-[54px] rounded-md bg-[#161616] border border-[#242424] flex items-center justify-center shrink-0">
                <IconRotateClockwise className="size-5 text-zinc-500" stroke={1.5} />
              </div>
              <div className="space-y-1.5 min-w-0 flex-1">
                <p className="text-[10px] uppercase font-mono tracking-wider text-[#888888]">RESTORE READINESS</p>
                <Skeleton className="h-4 w-24 bg-white/[0.07]" />
              </div>
            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-3.5 p-3 rounded-lg bg-[#111111] border border-[#222222]">
              <div className="size-[54px] rounded-md bg-[#161616] border border-[#242424] flex items-center justify-center shrink-0">
                <IconCircleCheck className="size-5 text-zinc-500" stroke={1.5} />
              </div>
              <div className="space-y-1.5 min-w-0 flex-1">
                <p className="text-[10px] uppercase font-mono tracking-wider text-[#888888]">HEALTH CHECK</p>
                <Skeleton className="h-4 w-20 bg-white/[0.07]" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Supabase Topology Canvas Skeleton with Center Spinner */}
        <div className="xl:col-span-6">
          <Card className="relative min-h-[460px] p-6 flex flex-col justify-between overflow-hidden shadow-sm bg-[#111111] border-[#222222]">
            {/* Subtle dot matrix background */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(#505050 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />

            {/* Canvas Header Switcher skeleton */}
            <div className="relative z-10 flex justify-end">
              <div className="flex items-center border border-[#2a2a2a] rounded bg-[#161616] overflow-hidden text-zinc-500">
                <div className="p-1.5 bg-[#202020] text-zinc-300">
                  <IconNetwork className="size-3.5" />
                </div>
                <div className="p-1.5">
                  <IconWorld className="size-3.5" />
                </div>
              </div>
            </div>

            {/* Central Node Loader — exact Supabase dashboard experience */}
            <div className="relative z-10 my-auto mx-auto flex flex-col items-center gap-4">
              <div className="relative flex items-center justify-center">
                <div className="size-14 rounded-full border-2 border-white/10 border-t-emerald-500 animate-spin" />
                <IconDatabase className="size-6 text-zinc-400 absolute" />
              </div>
              <div className="text-center space-y-1">
                <Skeleton className="h-4 w-36 mx-auto bg-white/[0.08]" />
                <p className="text-xs text-zinc-500 font-mono">Syncing topology state...</p>
              </div>
            </div>

            {/* Footer status skeleton */}
            <div className="relative z-10 flex items-center justify-between text-xs text-zinc-500">
              <Skeleton className="h-3 w-28 bg-white/[0.05]" />
              <Skeleton className="h-3 w-20 bg-white/[0.05]" />
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Section: Telemetry & Metrics Skeleton */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-36 bg-white/[0.08]" />
            <Skeleton className="h-5 w-20 rounded-full bg-white/[0.05]" />
          </div>
          <Skeleton className="h-8 w-28 rounded-md bg-white/[0.06]" />
        </div>

        {/* 3 Metric Cards with Sparklines */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-5 bg-[#111111] border-[#222222] space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-24 bg-white/[0.06]" />
                <Skeleton className="h-4 w-12 rounded bg-white/[0.05]" />
              </div>
              <Skeleton className="h-8 w-20 bg-white/[0.09]" />
              
              {/* Sparkline placeholder bars */}
              <div className="h-10 flex items-end gap-1.5 pt-2">
                {[40, 65, 30, 80, 50, 90, 70, 45, 60, 85, 35, 75].map((h, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-white/[0.05] rounded-t-[2px] animate-pulse"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
