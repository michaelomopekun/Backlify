import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconShieldLock,
  IconCloudUpload,
  IconCalendarEvent,
  IconHistory,
  IconRotateClockwise,
  IconNetwork,
  IconWorld,
} from "@tabler/icons-react";

export function ProjectOverviewSkeleton() {
  return (
    <div className="w-full space-y-20">
      {/* ── Top Panel: 6 Status Cards + Canvas ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Column: Title + 6 Static Metric Cards */}
        <div className="xl:col-span-6 flex flex-col space-y-6 sm:space-y-8 pt-5 sm:pt-4 xl:pt-16">
          {/* Title & Connection Header */}
          <div>
            <Skeleton className="h-8 sm:h-9 w-44 bg-white/[0.08]" />
            <div className="mt-2.5 flex items-center gap-2">
              <Skeleton className="h-4 w-72 max-w-full bg-white/[0.05]" />
            </div>
          </div>

          {/* 6 Metric Items — exact static labels, exact static icons, only values are loading */}
          <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-y-6 gap-x-3 pt-1">
            {/* 1. STATUS */}
            <div className="flex items-center gap-3.5 sm:gap-4 p-2 sm:p-0">
              <div className="size-[66px] sm:size-[68px] rounded-[7px] bg-[#161616] border border-[#242424] flex items-center justify-center shrink-0">
                <div className="grid grid-cols-3 gap-1">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="size-[5px] sm:size-[6px] rounded-full bg-amber-400/70 animate-pulse"
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] uppercase font-mono tracking-wider text-[#888888] mb-0.5">
                  STATUS
                </p>
                <p className="text-base sm:text-[17px] font-normal text-zinc-400">
                  Checking...
                </p>
              </div>
            </div>

            {/* 2. RETENTION */}
            <div className="flex items-center gap-3.5 sm:gap-4 p-2 sm:p-0">
              <div className="size-[66px] sm:size-[68px] rounded-[7px] bg-[#161616] border border-[#242424] flex items-center justify-center shrink-0">
                <IconShieldLock className="size-5 text-white/90" stroke={1.25} />
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] uppercase font-mono tracking-wider text-[#888888] mb-0.5">
                  RETENTION
                </p>
                <Skeleton className="h-5 w-24 bg-white/[0.08] mt-0.5" />
              </div>
            </div>

            {/* 3. STORAGE VAULT */}
            <div className="flex items-center gap-3.5 sm:gap-4 p-2 sm:p-0">
              <div className="size-[66px] sm:size-[68px] rounded-[7px] bg-[#161616] border border-[#242424] flex items-center justify-center shrink-0">
                <IconCloudUpload className="size-5 text-white/90" stroke={1.25} />
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] uppercase font-mono tracking-wider text-[#888888] mb-0.5">
                  STORAGE VAULT
                </p>
                <Skeleton className="h-5 w-20 bg-white/[0.08] mt-0.5" />
              </div>
            </div>

            {/* 4. ACTIVE SCHEDULE */}
            <div className="flex items-center gap-3.5 sm:gap-4 p-2 sm:p-0">
              <div className="size-[66px] sm:size-[68px] rounded-[7px] bg-[#161616] border border-[#242424] flex items-center justify-center shrink-0">
                <IconCalendarEvent className="size-5 text-white/90" stroke={1.25} />
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] uppercase font-mono tracking-wider text-[#888888] mb-0.5">
                  ACTIVE SCHEDULE
                </p>
                <Skeleton className="h-5 w-20 bg-white/[0.08] mt-0.5" />
              </div>
            </div>

            {/* 5. LAST BACKUP */}
            <div className="flex items-center gap-3.5 sm:gap-4 p-2 sm:p-0">
              <div className="size-[66px] sm:size-[68px] rounded-[7px] bg-[#161616] border border-[#242424] flex items-center justify-center shrink-0">
                <IconHistory className="size-5 text-white/90" stroke={1.25} />
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] uppercase font-mono tracking-wider text-[#888888] mb-0.5">
                  LAST BACKUP
                </p>
                <Skeleton className="h-5 w-36 bg-white/[0.08] mt-0.5" />
              </div>
            </div>

            {/* 6. RESTORE READINESS */}
            <div className="flex items-center gap-3.5 sm:gap-4 p-2 sm:p-0">
              <div className="size-[66px] sm:size-[68px] rounded-[7px] bg-[#161616] border border-[#242424] flex items-center justify-center shrink-0">
                <IconRotateClockwise className="size-5 text-white/90" stroke={1.25} />
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] uppercase font-mono tracking-wider text-[#888888] mb-0.5">
                  RESTORE READINESS
                </p>
                <Skeleton className="h-5 w-16 bg-white/[0.08] mt-0.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Exact Topology Canvas Card with clean Supabase central spinner */}
        <Card className="xl:col-span-6 relative min-h-[500px] p-6 flex flex-col justify-between overflow-hidden shadow-sm">
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#505050 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          <div className="relative z-10 flex justify-end">
            <div className="flex items-center border border-border rounded bg-card overflow-hidden text-muted-foreground">
              <button className="p-1.5 bg-muted text-foreground">
                <IconNetwork className="size-3.5" />
              </button>
              <button className="p-1.5 hover:text-foreground transition-colors">
                <IconWorld className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Clean central circular spinner matching Supabase */}
          <div className="relative z-10 my-auto mx-auto flex items-center justify-center">
            <div className="size-6 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
          </div>
        </Card>
      </div>

      {/* ── Bottom Section: Exact 4 Static Telemetry Cards ── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
          <p className="text-sm font-medium text-foreground tracking-tight">
            Total Backup Operations
          </p>
        </div>

        {/* 4 Cards: exact headers and static error badges, only numbers & sparklines are loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Scheduled Backups */}
          <Card className="flex flex-col justify-between h-52 overflow-visible">
            <CardHeader className="pb-0">
              <div className="flex items-start justify-between">
                <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  SCHEDULED BACKUPS
                </p>
                <Badge variant="outline" className="text-[10px] font-mono gap-1 text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-zinc-600" />
                  ERRORS 0
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="-mt-2">
              <Skeleton className="h-8 w-12 bg-white/[0.08]" />
            </CardContent>
            <CardFooter className="flex-col items-stretch border-0 bg-transparent pb-4 px-4 overflow-visible">
              <div className="h-10 flex items-end gap-1.5 pt-2">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="flex-1 h-2 rounded-t-[2px] bg-white/[0.04]" />
                ))}
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-2">
                <span>Status</span>
                <span>Operational</span>
              </div>
            </CardFooter>
          </Card>

          {/* 2. Manual Triggers */}
          <Card className="flex flex-col justify-between h-52 overflow-visible">
            <CardHeader className="pb-0">
              <div className="flex items-start justify-between">
                <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  MANUAL TRIGGERS
                </p>
                <Badge variant="outline" className="text-[10px] font-mono gap-1 text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-zinc-600" />
                  ERRORS 0
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="-mt-2">
              <Skeleton className="h-8 w-12 bg-white/[0.08]" />
            </CardContent>
            <CardFooter className="flex-col items-stretch border-0 bg-transparent pb-4 px-4 overflow-visible">
              <div className="h-10 flex items-end gap-1.5 pt-2">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="flex-1 h-2 rounded-t-[2px] bg-white/[0.04]" />
                ))}
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-2">
                <span>Activity</span>
                <span>Standby</span>
              </div>
            </CardFooter>
          </Card>

          {/* 3. Restore Drills */}
          <Card className="flex flex-col justify-between h-52 overflow-visible">
            <CardHeader className="pb-0">
              <div className="flex items-start justify-between">
                <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  RESTORE DRILLS
                </p>
                <Badge variant="outline" className="text-[10px] font-mono gap-1 text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-zinc-600" />
                  ERRORS 0
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="-mt-2">
              <Skeleton className="h-8 w-12 bg-white/[0.08]" />
            </CardContent>
            <CardFooter className="flex-col items-stretch border-0 bg-transparent pb-4 px-4 overflow-visible">
              <div className="h-10 flex items-end gap-1.5 pt-2">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="flex-1 h-2 rounded-t-[2px] bg-white/[0.04]" />
                ))}
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-2">
                <span>State</span>
                <span>Standby</span>
              </div>
            </CardFooter>
          </Card>

          {/* 4. Total Storage */}
          <Card className="flex flex-col justify-between h-52 overflow-visible">
            <CardHeader className="pb-0">
              <div className="flex items-start justify-between">
                <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  TOTAL STORAGE
                </p>
                <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">
                  Active Files
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="-mt-2">
              <Skeleton className="h-8 w-20 bg-white/[0.08]" />
            </CardContent>
            <CardFooter className="flex-col items-stretch border-0 bg-transparent pb-4 px-4 overflow-visible">
              <div className="h-10 flex items-end gap-1.5 pt-2">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="flex-1 h-2 rounded-t-[2px] bg-white/[0.04]" />
                ))}
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-2">
                <span>Vault</span>
                <span>Encrypted</span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
