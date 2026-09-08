"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconCircleCheck,
  IconCheck,
  IconChevronDown,
  IconCloudUpload,
  IconCalendarEvent,
  IconShieldLock,
  IconHistory,
  IconRotateClockwise,
  IconDatabase,
  IconNetwork,
  IconWorld,
  IconGripVertical,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useWidgetOrder } from "@/hooks/use-widget-order";
import { formatBytes, formatRelativeTime } from "@/lib/format";

/* ─────────────────────────────────────────────────────────────────────────────
   Data
───────────────────────────────────────────────────────────────────────────── */

interface StatusItem {
  name: string;
  status: string;
  detail: string;
}

export interface ProjectOverviewProps {
  project: {
    id: string;
    name: string;
    databaseUrl: string;
    orgId?: string | null;
    retentionCount?: number | null;
  };
  schedules?: any[];
  backupJobs?: any[];
  orgId: string;
  projectId: string;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Grip Handle
───────────────────────────────────────────────────────────────────────────── */

function GripHandle(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      title="Drag to reorder"
      className="flex items-center justify-center w-5 h-5 cursor-grab active:cursor-grabbing text-[#555555] hover:text-[#888888] transition-colors select-none shrink-0"
    >
      <IconGripVertical className="size-4" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SortableWidget wrapper — handles the dnd-kit transform + overlay fade
───────────────────────────────────────────────────────────────────────────── */

interface SortableWidgetProps {
  id: string;
  isDragging: boolean;
  children: React.ReactNode;
}

function SortableWidget({ id, isDragging, children }: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isSorting,
    isOver,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
    // When this item is the active dragged item, make the placeholder ghost subtle
    opacity: isDragging ? 0.35 : 1,
    // Smooth transition when other items shift
    ...(isSorting ? { transitionDuration: "200ms" } : {}),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
      data-over={isOver}
      {...attributes}
    >
      {/* Pass the activator ref and listeners down via context so each widget
          can put the grip handle wherever it wants */}
      <WidgetDragContext.Provider value={{ activatorRef: setActivatorNodeRef, listeners }}>
        {children}
      </WidgetDragContext.Provider>
    </div>
  );
}

/* Context to thread the drag handle ref + listeners into child widgets */
const WidgetDragContext = React.createContext<{
  activatorRef: ((el: HTMLElement | null) => void) | null;
  listeners: Record<string, unknown> | undefined;
}>({ activatorRef: null, listeners: undefined });

/* ─────────────────────────────────────────────────────────────────────────────
   TopPanel widget content
───────────────────────────────────────────────────────────────────────────── */

function TopPanelContent({
  project,
  schedules = [],
  backupJobs = [],
  orgId,
  projectId,
  copied,
  maskedUrl,
  onCopy,
}: {
  project: ProjectOverviewProps["project"];
  schedules?: any[];
  backupJobs?: any[];
  orgId: string;
  projectId: string;
  copied: boolean;
  maskedUrl: string;
  onCopy: () => void;
}) {
  const { activatorRef, listeners } = React.useContext(WidgetDragContext);

  const completedBackups = backupJobs.filter((j) => j.status === "completed");
  const failedBackups = backupJobs.filter((j) => j.status === "failed");
  const activeSchedules = schedules.filter((s) => s.isActive);
  const latestJob = backupJobs.length > 0 ? backupJobs[0] : null;
  const lastCompletedBackup = completedBackups.length > 0 ? completedBackups[0] : null;

  let dbHost = "—";
  let dbName = "—";
  if (project.databaseUrl) {
    try {
      const parsed = new URL(project.databaseUrl);
      dbHost = parsed.host || "—";
      dbName = parsed.pathname.replace(/^\//, "") || "postgres";
    } catch {}
  }

  const isFailing = latestJob?.status === "failed";
  const isRunning = latestJob && ["pending", "queued", "in_progress", "uploading"].includes(latestJob.status);
  const statusLabel = isFailing ? "Degraded" : isRunning ? "Running" : completedBackups.length > 0 ? "Healthy" : "Standby";

  let lastBackupLabel = "No backups yet";
  if (lastCompletedBackup) {
    const timeAgo = formatRelativeTime(lastCompletedBackup.completedAt || lastCompletedBackup.createdAt);
    const size = formatBytes(lastCompletedBackup.fileSize || 0);
    lastBackupLabel = `${timeAgo} · ${size}`;
  }

  const activeScheduleLabel = activeSchedules.length > 0
    ? (activeSchedules[0].cronExpression || "Configured")
    : "No active schedule";

  const dynamicStatusList: StatusItem[] = [
    {
      name: "PostgreSQL Database",
      status: project.databaseUrl ? "Connected" : "Missing",
      detail: project.databaseUrl ? `Host: ${dbHost}` : "Database URL not configured",
    },
    {
      name: "Backup Schedules",
      status: activeSchedules.length > 0 ? "Active" : "Idle",
      detail: activeSchedules.length > 0 ? `${activeSchedules.length} active schedule(s)` : "No automated schedule configured",
    },
    {
      name: "Snapshots Vault",
      status: completedBackups.length > 0 ? "Healthy" : "Empty",
      detail: completedBackups.length > 0 ? `${completedBackups.length} snapshot(s) stored` : "No backups created yet",
    },
    {
      name: "Backup Worker Queue",
      status: isRunning ? "Processing" : "Standby",
      detail: isRunning ? "Job actively executing" : "0 queued · Standby",
    },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 lg:gap-14 items-start">
      {/* Drag handle — only visible on hover, left of the metrics column */}
      <div
        ref={activatorRef as React.Ref<HTMLDivElement>}
        {...(listeners as React.HTMLAttributes<HTMLDivElement>)}
        className="absolute -left-7 top-1/2 -translate-y-1/2 hidden xl:flex opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripHandle />
      </div>

      {/* Left Column */}
      <div className="xl:col-span-6 flex flex-col space-y-6 sm:space-y-8 pt-5 sm:pt-4 xl:pt-16">
        {/* Title & Connection Header */}
        <div>
          <h1 className="text-2xl sm:text-[32px] font-semibold tracking-tight text-foreground font-sans">
            {project.name || "Untitled Project"}
          </h1>

          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-mono">
            <span className="text-[#888888] font-mono text-xs sm:text-[13px] break-all">
              {maskedUrl}
            </span>

            {project.databaseUrl ? (
              <DropdownMenu>
                <div className="inline-flex rounded border border-[#2a2a2a] bg-[#161616] overflow-hidden">
                  <button
                    type="button"
                    onClick={onCopy}
                    className="flex items-center gap-1.5 px-2.5 py-0.5 text-xs text-[#999999] hover:text-white transition-colors font-sans"
                  >
                    {copied ? (
                      <>
                        <IconCheck className="size-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <span>Copy</span>
                    )}
                  </button>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="px-1.5 py-0.5 border-l border-[#2a2a2a] hover:bg-[#222222] text-[#888888] hover:text-white"
                    >
                      <IconChevronDown className="size-3" />
                    </button>
                  </DropdownMenuTrigger>
                </div>

                <DropdownMenuContent align="start" className="w-60 border-border bg-popover text-xs">
                  <DropdownMenuItem onClick={onCopy} className="cursor-pointer">
                    Copy Connection String (URI)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigator.clipboard.writeText(`psql "${project.databaseUrl}"`)}
                    className="cursor-pointer"
                  >
                    Copy psql CLI Command
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </div>

        {/* Left Metric Items: Responsive 1 col on mobile, 2 cols on tablet/desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-y-6 gap-x-3 pt-1">
          {/* Status */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="group/metric flex items-center gap-3.5 sm:gap-4 cursor-pointer text-left select-none p-2 sm:p-0 rounded-lg hover:bg-[#141414] sm:hover:bg-transparent transition-colors">
                <div className="size-[66px] sm:size-[68px] rounded-[7px] bg-[#161616] border border-[#242424] flex items-center justify-center shrink-0 group-hover/metric:border-[#383838] transition-colors">
                  <div className="grid grid-cols-3 gap-1">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className={`size-[5px] sm:size-[6px] rounded-full ${
                          isFailing ? "bg-red-400" : isRunning ? "bg-amber-400 animate-pulse" : completedBackups.length > 0 ? "bg-emerald-400" : "bg-zinc-500"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] sm:text-[11px] uppercase font-mono tracking-wider text-[#888888] mb-0.5">STATUS</p>
                  <p className="text-base sm:text-[17px] font-normal text-white">{statusLabel}</p>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72 border-border bg-card p-3.5 space-y-2.5 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-xs font-semibold text-foreground">Service Health</span>
                <Link href={`/dashboard/project/${projectId}/backups`} className="text-[11px] text-primary hover:underline">
                  View jobs →
                </Link>
              </div>
              <div className="space-y-2 pt-1">
                {dynamicStatusList.map((item) => (
                  <div key={item.name} className="flex items-start gap-2 text-xs">
                    <IconCircleCheck className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Retention */}
          <div className="flex items-center gap-3.5 sm:gap-4 p-2 sm:p-0">
            <div className="size-[66px] sm:size-[68px] rounded-[7px] bg-[#161616] border border-[#242424] flex items-center justify-center shrink-0">
              <IconShieldLock className="size-5 text-white/90" stroke={1.25} />
            </div>
            <div>
              <p className="text-[10px] sm:text-[11px] uppercase font-mono tracking-wider text-[#888888] mb-0.5">RETENTION</p>
              <div className="flex items-center gap-2">
                <p className="text-base sm:text-[17px] font-normal text-white">
                  {project.retentionCount != null ? `${project.retentionCount} Snapshots` : "—"}
                </p>
                {project.retentionCount != null && (
                  <span className="text-[9px] sm:text-[9.5px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#202020] text-[#999999] border border-[#2e2e2e]">FIFO</span>
                )}
              </div>
            </div>
          </div>

          {/* Storage Vault */}
          <div className="flex items-center gap-3.5 sm:gap-4 p-2 sm:p-0">
            <div className="size-[66px] sm:size-[68px] rounded-[7px] bg-[#161616] border border-[#242424] flex items-center justify-center shrink-0">
              <IconCloudUpload className="size-5 text-white/90" stroke={1.25} />
            </div>
            <div>
              <p className="text-[10px] sm:text-[11px] uppercase font-mono tracking-wider text-[#888888] mb-0.5">STORAGE VAULT</p>
              <p className="text-base sm:text-[17px] font-normal text-white">
                {completedBackups.length > 0 ? "AES-256 S3" : "—"}
              </p>
            </div>
          </div>

          {/* Active Schedule */}
          <div className="flex items-center gap-3.5 sm:gap-4 p-2 sm:p-0">
            <div className="size-[66px] sm:size-[68px] rounded-[7px] bg-[#161616] border border-[#242424] flex items-center justify-center shrink-0">
              <IconCalendarEvent className="size-5 text-white/90" stroke={1.25} />
            </div>
            <div>
              <p className="text-[10px] sm:text-[11px] uppercase font-mono tracking-wider text-[#888888] mb-0.5">ACTIVE SCHEDULE</p>
              <p className="text-base sm:text-[17px] font-normal text-white">{activeScheduleLabel}</p>
            </div>
          </div>

          {/* Last Backup */}
          <div className="flex items-center gap-3.5 sm:gap-4 p-2 sm:p-0">
            <div className="size-[66px] sm:size-[68px] rounded-[7px] bg-[#161616] border border-[#242424] flex items-center justify-center shrink-0">
              <IconHistory className="size-5 text-white/90" stroke={1.25} />
            </div>
            <div>
              <p className="text-[10px] sm:text-[11px] uppercase font-mono tracking-wider text-[#888888] mb-0.5">LAST BACKUP</p>
              <p className="text-base sm:text-[17px] font-normal text-white">{lastBackupLabel}</p>
            </div>
          </div>

          {/* Restore Readiness */}
          <div className="flex items-center gap-3.5 sm:gap-4 p-2 sm:p-0">
            <div className="size-[66px] sm:size-[68px] rounded-[7px] bg-[#161616] border border-[#242424] flex items-center justify-center shrink-0">
              <IconRotateClockwise className="size-5 text-white/90" stroke={1.25} />
            </div>
            <div>
              <p className="text-[10px] sm:text-[11px] uppercase font-mono tracking-wider text-[#888888] mb-0.5">RESTORE READINESS</p>
              <p className="text-base sm:text-[17px] font-normal text-white">
                {completedBackups.length > 0 ? "Verified" : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Topology Canvas */}
      <Card className="xl:col-span-6 relative min-h-[500px] p-6 flex flex-col justify-between overflow-hidden shadow-sm">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(#505050 1px, transparent 1px)", backgroundSize: "20px 20px" }}
        />
        <div className="relative z-10 flex justify-end">
          <div className="flex items-center border border-border rounded bg-card overflow-hidden text-muted-foreground">
            <button className="p-1.5 hover:text-foreground bg-muted text-foreground transition-colors">
              <IconNetwork className="size-3.5" />
            </button>
            <button className="p-1.5 hover:text-foreground transition-colors">
              <IconWorld className="size-3.5" />
            </button>
          </div>
        </div>
        <div className="relative z-10 my-auto mx-auto w-80">
          <Card>
            <CardContent className="py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="size-9 rounded bg-[#182c20] border border-emerald-500/25 flex items-center justify-center shrink-0 mt-0.5">
                    <IconDatabase className="size-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-foreground">Primary Database</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[190px]" title={dbHost}>
                      {dbHost !== "—" ? dbHost : "Database Host"}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                      {dbName !== "—" ? dbName : "PostgreSQL"}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono text-emerald-400 border-emerald-500/30">
                  {project.databaseUrl ? "ONLINE" : "OFFLINE"}
                </Badge>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between text-[10.5px] text-muted-foreground font-mono">
              <Badge variant="outline" className="text-[10px] font-mono">{completedBackups.length} Snapshots</Badge>
              <Badge variant="outline" className="text-[10px] font-mono">{activeSchedules.length} Schedules</Badge>
              <Badge variant="outline" className="text-[10px] font-mono">{project.retentionCount ? `Retention: ${project.retentionCount}` : "Retention: —"}</Badge>
            </CardFooter>
          </Card>
        </div>
        <div className="relative z-10" />
      </Card>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TelemetryPanel widget content
───────────────────────────────────────────────────────────────────────────── */

function TelemetryPanelContent({
  backupJobs = [],
  schedules = [],
}: {
  backupJobs?: any[];
  schedules?: any[];
}) {
  const { activatorRef, listeners } = React.useContext(WidgetDragContext);

  const completedBackups = backupJobs.filter((j) => j.status === "completed");
  const manualBackups = backupJobs.filter((j) => j.id?.includes("manual") || j.jobType === "manual");
  const scheduledBackups = backupJobs.filter((j) => !j.id?.includes("manual") && j.jobType !== "manual");
  const scheduledErrors = scheduledBackups.filter((j) => j.status === "failed");
  const manualErrors = manualBackups.filter((j) => j.status === "failed");

  const totalBytes = completedBackups.reduce((sum, b) => sum + (b.fileSize || 0), 0);
  const successRate = backupJobs.length > 0
    ? `${((completedBackups.length / backupJobs.length) * 100).toFixed(1)}%`
    : "—";

  return (
    <div className="space-y-4 pt-4">
      {/* Strip Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Drag handle on the grip icon */}
          <div
            ref={activatorRef as React.Ref<HTMLDivElement>}
            {...(listeners as React.HTMLAttributes<HTMLDivElement>)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <GripHandle />
          </div>
          <div className="flex items-center gap-3.5 text-[15px] text-white">
            <span className="font-normal">{backupJobs.length} Total Backup Operation{backupJobs.length === 1 ? "" : "s"}</span>
            <span className="font-normal">{successRate} Success Rate</span>
          </div>
        </div>
      </div>

      {/* 4 Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Scheduled Backups */}
        <Card className="flex flex-col justify-between h-48">
          <CardHeader className="pb-0">
            <div className="flex items-start justify-between">
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">SCHEDULED BACKUPS</p>
              <div className="flex items-center gap-2.5 text-[10.5px] font-mono text-muted-foreground">
                <Badge variant="outline" className="text-[10px] font-mono gap-1"><span className="size-1.5 rounded-full bg-red-400" />ERRORS {scheduledErrors.length}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="-mt-2">
            <p className="text-2xl font-normal text-foreground tracking-tight">{scheduledBackups.length}</p>
          </CardContent>
          <CardFooter className="flex-col items-stretch border-0 bg-transparent pb-4 px-4">
            <div className="flex items-center justify-center h-16 border-b border-border pb-0.5 text-[11px] font-mono text-muted-foreground">
              {scheduledBackups.length === 0 ? "No scheduled backups run" : `${scheduledBackups.length} scheduled execution(s)`}
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-2">
              <span>Status</span><span>{scheduledErrors.length > 0 ? "Errors detected" : "Operational"}</span>
            </div>
          </CardFooter>
        </Card>

        {/* Manual Triggers */}
        <Card className="flex flex-col justify-between h-48">
          <CardHeader className="pb-0">
            <div className="flex items-start justify-between">
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">MANUAL TRIGGERS</p>
              <div className="flex items-center gap-2.5 text-[10.5px] font-mono text-muted-foreground">
                <Badge variant="outline" className="text-[10px] font-mono gap-1"><span className="size-1.5 rounded-full bg-red-400" />ERRORS {manualErrors.length}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="-mt-2">
            <p className="text-2xl font-normal text-foreground tracking-tight">{manualBackups.length}</p>
          </CardContent>
          <CardFooter className="flex-col items-stretch border-0 bg-transparent pb-4 px-4">
            <div className="flex items-center justify-center h-16 border-b border-border pb-0.5 text-[11px] font-mono text-muted-foreground">
              {manualBackups.length === 0 ? "No manual backups triggered" : `${manualBackups.length} manual trigger(s)`}
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-2">
              <span>Activity</span><span>{manualBackups.length > 0 ? "Active" : "None"}</span>
            </div>
          </CardFooter>
        </Card>

        {/* Restore Drills */}
        <Card className="flex flex-col justify-between h-48">
          <CardHeader className="pb-0">
            <div className="flex items-start justify-between">
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">RESTORE DRILLS</p>
              <Badge variant="outline" className="text-[10px] font-mono gap-1"><span className="size-1.5 rounded-full bg-emerald-400" />ERRORS 0</Badge>
            </div>
          </CardHeader>
          <CardContent className="-mt-2">
            <p className="text-2xl font-normal text-foreground tracking-tight">0</p>
          </CardContent>
          <CardFooter className="flex-col items-stretch border-0 bg-transparent pb-4 px-4">
            <div className="flex items-center justify-center h-16 border-b border-border pb-0.5 text-[11px] font-mono text-muted-foreground">
              No restore drills recorded
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-2">
              <span>Standby</span><span>0 completed</span>
            </div>
          </CardFooter>
        </Card>

        {/* Total Storage Stored */}
        <Card className="flex flex-col justify-between h-48">
          <CardHeader className="pb-0">
            <div className="flex items-start justify-between">
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">TOTAL STORAGE</p>
              <Badge variant="outline" className="text-[10px] font-mono text-emerald-400">{completedBackups.length} Files</Badge>
            </div>
          </CardHeader>
          <CardContent className="-mt-2">
            <p className="text-2xl font-normal text-foreground tracking-tight">{formatBytes(totalBytes)}</p>
          </CardContent>
          <CardFooter className="flex-col items-stretch border-0 bg-transparent pb-4 px-4">
            <div className="flex items-center justify-center h-16 border-b border-border pb-0.5 text-[11px] font-mono text-muted-foreground">
              {completedBackups.length === 0 ? "No storage consumed" : `${completedBackups.length} snapshot(s) encrypted`}
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-2">
              <span>Vault</span><span>Encrypted</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   DragOverlay snapshot — rendered while dragging (floats above the page)
───────────────────────────────────────────────────────────────────────────── */

function DragOverlaySnapshot({ id }: { id: string }) {
  if (id === "top-panel") {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-[#0e0e0e]/80 backdrop-blur-sm shadow-[0_32px_64px_rgba(0,0,0,0.7)] ring-1 ring-emerald-500/20 px-6 py-4 opacity-90 cursor-grabbing">
        <p className="text-[13px] text-[#888888] font-mono uppercase tracking-wider">Project Overview Panel</p>
        <p className="text-sm text-white/60 mt-0.5">Title · Connection · Metrics · Canvas</p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-emerald-500/30 bg-[#0e0e0e]/80 backdrop-blur-sm shadow-[0_32px_64px_rgba(0,0,0,0.7)] ring-1 ring-emerald-500/20 px-6 py-4 opacity-90 cursor-grabbing">
      <p className="text-[13px] text-[#888888] font-mono uppercase tracking-wider">Telemetry Panel</p>
      <p className="text-sm text-white/60 mt-0.5">Backup Operations · Metrics</p>
    </div>
  );
}

/* Need React import for context */
import React from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   Main export
───────────────────────────────────────────────────────────────────────────── */

export function ProjectOverviewHeader({
  project,
  schedules = [],
  backupJobs = [],
  orgId,
  projectId,
}: ProjectOverviewProps) {
  const [copied, setCopied] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { order, updateOrder } = useWidgetOrder(projectId);

  let maskedUrl = "—";
  if (project?.databaseUrl) {
    try {
      const parsed = new URL(project.databaseUrl);
      maskedUrl = `${parsed.protocol}//${parsed.username}:••••••••@${parsed.host}${parsed.pathname}`;
    } catch {
      maskedUrl = project.databaseUrl.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:••••••••@");
    }
  }

  const handleCopy = () => {
    if (!project?.databaseUrl) return;
    navigator.clipboard.writeText(project.databaseUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Require 8px of movement before drag starts so normal clicks still work
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (over && active.id !== over.id) {
      const from = order.indexOf(active.id as string);
      const to   = order.indexOf(over.id as string);
      updateOrder(arrayMove(order, from, to));
    }
    setActiveId(null);
  }

  const widgetContent: Record<string, React.ReactNode> = {
    "top-panel": (
      <TopPanelContent
        project={project}
        schedules={schedules}
        backupJobs={backupJobs}
        orgId={orgId}
        projectId={projectId}
        copied={copied}
        maskedUrl={maskedUrl}
        onCopy={handleCopy}
      />
    ),
    "telemetry-panel": (
      <TelemetryPanelContent
        backupJobs={backupJobs}
        schedules={schedules}
      />
    ),
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={order} strategy={verticalListSortingStrategy}>
        <div className="space-y-20">
          {order.map((id) => (
            <SortableWidget key={id} id={id} isDragging={activeId === id}>
              {widgetContent[id]}
            </SortableWidget>
          ))}
        </div>
      </SortableContext>

      {/* The floating overlay rendered while dragging — styled like Supabase */}
      <DragOverlay
        dropAnimation={{
          duration: 220,
          easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
        }}
      >
        {activeId ? <DragOverlaySnapshot id={activeId} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
