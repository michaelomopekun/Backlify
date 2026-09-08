"use client";

import { useState } from "react";
import {
  IconCloudUpload,
  IconDatabaseImport,
  IconShieldCheck,
  IconClock,
  IconDownload,
  IconRotateClockwise,
  IconTrash,
  IconSearch,
  IconChevronDown,
  IconBolt,
  IconCheck,
  IconX,
  IconLoader2,
  IconDotsVertical,
  IconFilter,
  IconTerminal2,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { JobTelemetryDrawer } from "@/components/shared/job-telemetry-drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ─────────────────────────────────────────────────────────────────
   Types & Mock Data
───────────────────────────────────────────────────────────────────*/

type BackupType = "scheduled" | "manual";
type BackupStatus = "complete" | "in_progress" | "failed";

interface Backup {
  id: string;
  timestamp: string;
  type: BackupType;
  status: BackupStatus;
  sizeMb: number;
  durationSec: number;
  label?: string;
}


/* ─────────────────────────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────────────────────────────*/



function TypeBadge({ type }: { type: BackupType }) {
  return type === "scheduled" ? (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10.5px] font-mono uppercase tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
      <span className="size-1.5 rounded-full bg-emerald-400" />
      Scheduled
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10.5px] font-mono uppercase tracking-wide bg-blue-500/10 text-blue-400 border border-blue-500/20">
      <span className="size-1.5 rounded-full bg-blue-400" />
      Manual
    </span>
  );
}

function StatusBadge({ status }: { status: BackupStatus }) {
  if (status === "complete") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] text-emerald-400">
        <IconCheck className="size-3.5" />
        Complete
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] text-amber-400">
        <IconLoader2 className="size-3.5 animate-spin" />
        In Progress
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-red-400">
      <IconX className="size-3.5" />
      Failed
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Activity Chart
───────────────────────────────────────────────────────────────────*/

const MAX_EVENTS_IN_DAY = 3; // used to scale bar height

function ActivityBar({
  events,
  isToday,
}: {
  events: { type: string; status: string }[];
  isToday?: boolean;
}) {
  const CHART_H = 80; // px — total column height
  const barH = Math.floor(CHART_H / MAX_EVENTS_IN_DAY) - 4; // height per segment

  return (
    <div
      className="relative flex flex-col-reverse gap-1.5 w-full"
      style={{ height: `${CHART_H}px` }}
    >
      {events.length === 0 ? (
        <div
          className="w-full rounded bg-[#1e1e1e] self-start"
          style={{ height: "10px" }}
        />
      ) : (
        events.map((e, i) => {
          const color =
            e.status === "failed"
              ? "bg-red-500/80 hover:bg-red-500"
              : e.type === "manual"
              ? "bg-blue-400/80 hover:bg-blue-400"
              : "bg-emerald-400/80 hover:bg-emerald-400";
          return (
            <div
              key={i}
              title={`${e.type} · ${e.status}`}
              className={`w-full rounded ${color} transition-all cursor-default`}
              style={{ height: `${barH}px` }}
            />
          );
        })
      )}
      {/* Today indicator */}
      {isToday && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 size-1 rounded-full bg-emerald-400" />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Trigger Backup Side Panel
───────────────────────────────────────────────────────────────────*/

import { triggerBackup } from "@/app/actions/backup.actions";

function TriggerPanel({
  projectId,
  onClose,
  onSuccess,
}: {
  projectId: string;
  onClose: () => void;
  onSuccess?: (jobId: string, label?: string) => void;
}) {
  const [label, setLabel] = useState("");
  const [triggered, setTriggered] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTrigger = async () => {
    setTriggered(true);
    setErrorMessage(null);

    const res = await triggerBackup(projectId);
    if (res?.error) {
      setErrorMessage(res.error);
      setTriggered(false);
      return;
    }

    if (res?.jobId && onSuccess) {
      onSuccess(res.jobId, label || undefined);
    }

    setTimeout(onClose, 1200);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-[2px]"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[420px] max-w-full bg-[#0d0d0d] border-l border-[#1e1e1e] z-[70] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1a1a1a]">
          <div>
            <h2 className="text-[15px] font-medium text-white">Trigger Manual Backup</h2>
            <p className="text-[12px] text-[#666666] mt-0.5">Creates an on-demand snapshot immediately</p>
          </div>
          <button onClick={onClose} className="text-[#555555] hover:text-white transition-colors">
            <IconX className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 py-6 space-y-6 overflow-y-auto">
          {/* Database info */}
          <div className="p-4 rounded-lg border border-[#1e1e1e] bg-[#111111] space-y-1.5">
            <p className="text-[11px] uppercase font-mono tracking-wider text-[#555555]">Target Database</p>
            <p className="text-[14px] text-white font-medium">Primary Database</p>
            <p className="text-[12px] text-[#666666] font-mono">Project: {projectId} · Postgres 16</p>
          </div>

          {/* Optional label */}
          <div className="space-y-2">
            <label className="text-[12px] text-[#888888] font-mono uppercase tracking-wider">
              Label <span className="text-[#444444] normal-case">(optional)</span>
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. pre-deploy, v2.1-release"
              className="w-full bg-[#111111] border border-[#222222] rounded-md px-3 py-2 text-[13px] text-white placeholder-[#444444] focus:outline-none focus:border-[#3a3a3a] transition-colors font-mono"
            />
          </div>

          {errorMessage && (
            <div className="p-3 rounded border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-mono">
              {errorMessage}
            </div>
          )}

          {/* Estimated info */}
          <div className="space-y-2.5">
            <p className="text-[11px] uppercase font-mono tracking-wider text-[#555555]">Snapshot Details</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["Estimated Size", "~142 MB"],
                ["Est. Duration", "~1m 12s"],
                ["Encryption", "AES-256"],
                ["Destination", "S3 / us-east-1"],
              ].map(([k, v]) => (
                <div key={k} className="p-3 rounded border border-[#1e1e1e] bg-[#0f0f0f]">
                  <p className="text-[10px] font-mono text-[#555555] uppercase tracking-wider">{k}</p>
                  <p className="text-[12.5px] text-white mt-0.5">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-[#1a1a1a]">
          {triggered ? (
            <div className="flex items-center gap-2 text-emerald-400 text-[13px]">
              <IconLoader2 className="size-4 animate-spin" />
              Backup enqueued — worker executing…
            </div>
          ) : (
            <div className="flex gap-3">
              <Button
                onClick={handleTrigger}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 text-[13px] font-semibold h-9 shadow-xs"
              >
                <IconBolt className="size-3.5 mr-1.5" />
                Run Backup Now
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="h-9 px-4 border-[#222222] bg-transparent text-[#888888] hover:text-white text-[13px]"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Main Page
───────────────────────────────────────────────────────────────────*/

export function BackupsPageClient({
  orgId,
  projectId,
  initialBackups,
}: {
  orgId: string;
  projectId: string;
  initialBackups?: Backup[];
}) {
  const [backupsList, setBackupsList] = useState<Backup[]>(initialBackups ?? []);
  const [showPanel, setShowPanel] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | BackupType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | BackupStatus>("all");
  const [activeTelemetryJobId, setActiveTelemetryJobId] = useState<string | null>(null);

  const handleBackupSuccess = (jobId: string, label?: string) => {
    const newEntry: Backup = {
      id: jobId,
      timestamp: "Just now",
      type: "manual",
      status: "in_progress",
      sizeMb: 0,
      durationSec: 0,
      label: label ?? "manual-trigger",
    };
    setBackupsList((prev) => [newEntry, ...prev]);
    setActiveTelemetryJobId(jobId);
  };

  const filtered = backupsList.filter((b) => {
    const matchSearch =
      b.timestamp.toLowerCase().includes(search.toLowerCase()) ||
      (b.label ?? "").toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || b.type === typeFilter;
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const scheduledCount = backupsList.filter((b) => b.type === "scheduled").length;
  const manualCount = backupsList.filter((b) => b.type === "manual").length;
  const failedCount = backupsList.filter((b) => b.status === "failed").length;
  const inProgressCount = backupsList.filter((b) => b.status === "in_progress").length;
  const totalMb = backupsList.filter((b) => b.status === "complete").reduce(
    (sum, b) => sum + b.sizeMb,
    0
  );
  const successCount = backupsList.filter((b) => b.status === "complete").length;
  const successRate = backupsList.length > 0 ? Math.round((successCount / backupsList.length) * 100) : null;

  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
    const dateLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const dayEvents = backupsList
      .filter((b) => b.timestamp.toLowerCase().includes(dateLabel.toLowerCase()))
      .map((b) => ({ type: b.type, status: b.status }));
    return { label: dayLabel, date: dateLabel, events: dayEvents };
  });

  return (
    <div className="space-y-16 sm:space-y-20 pb-28 sm:pb-24">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">Backups</h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-normal">
            {backupsList.length > 0
              ? `${totalMb} MB stored · ${backupsList.length} snapshot${backupsList.length === 1 ? "" : "s"}`
              : "No snapshots created yet"}
          </p>
        </div>
        <Button
          onClick={() => setShowPanel(true)}
          className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 text-xs sm:text-sm font-semibold h-9.5 px-4 shadow-xs shrink-0 mt-1 sm:mt-0"
        >
          <IconBolt className="size-4 mr-1.5" />
          Trigger Manual Backup
        </Button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={IconDatabaseImport}
          label="Total Snapshots"
          value={String(backupsList.length)}
          sub={`${scheduledCount} scheduled · ${manualCount} manual`}
          accent="text-emerald-400"
        />
        <StatCard
          icon={IconCloudUpload}
          label="Total Stored"
          value={`${totalMb} MB`}
          sub={backupsList.length > 0 ? "AES-256 Encrypted" : "Storage Standby"}
          accent="text-blue-400"
        />
        <StatCard
          icon={IconShieldCheck}
          label="Success Rate"
          value={successRate !== null ? `${successRate}%` : "—"}
          sub={backupsList.length > 0 ? `${successCount} of ${backupsList.length} succeeded` : "No backups recorded"}
          accent="text-emerald-400"
        />
        <StatCard
          icon={IconClock}
          label="Next Scheduled"
          value="—"
          sub="Check schedules page"
          accent="text-muted-foreground"
        />
      </div>

      {/* ── 7-Day Activity Chart ── */}
      <div className="rounded-xl border border-border/60 bg-card/60 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-foreground">Backup Activity</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Last 7 days</p>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-emerald-400" />Scheduled</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-blue-400" />Manual</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-red-500" />Failed</span>
          </div>
        </div>

        {/* Chart columns */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-2">
          {past7Days.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-2.5">
              <ActivityBar events={day.events} isToday={i === 6} />
              <div className="text-center">
                <p className={`text-xs ${i === 6 ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                  {day.label}
                </p>
                <p className="text-[11px] text-muted-foreground/60 mt-0.5">{day.date}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary strip */}
        <div className="pt-4 border-t border-border/50 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <span><span className="text-foreground font-medium">{backupsList.length}</span> total backups</span>
          <span>·</span>
          <span><span className="text-emerald-400 font-medium">{successCount}</span> succeeded</span>
          <span>·</span>
          <span><span className="text-red-400 font-medium">{failedCount}</span> failed</span>
          <span>·</span>
          <span><span className="text-blue-400 font-medium">{manualCount}</span> manual</span>
          <span>·</span>
          <span><span className="text-foreground font-medium">{inProgressCount}</span> in progress</span>
        </div>
      </div>

      {/* ── Backups Table ── */}
      <div className="space-y-6 sm:space-y-8">
        {/* Table header with filters */}
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
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="h-8 pl-8 pr-3 bg-[#111111] border border-[#1e1e1e] rounded text-[12px] text-white placeholder-[#444444] focus:outline-none focus:border-[#333333] transition-colors w-full sm:w-44"
              />
            </div>

            {/* Type filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 h-8 px-3 text-[12px] text-[#888888] border border-[#1e1e1e] bg-[#111111] rounded hover:text-white hover:border-[#2a2a2a] transition-colors font-mono">
                  <IconFilter className="size-3" />
                  {typeFilter === "all" ? "Type" : typeFilter}
                  <IconChevronDown className="size-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-32 bg-[#111111] border-[#222222] text-[12px]">
                <DropdownMenuItem onClick={() => setTypeFilter("all")}>All types</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("scheduled")}>Scheduled</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("manual")}>Manual</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Status filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 h-8 px-3 text-[12px] text-[#888888] border border-[#1e1e1e] bg-[#111111] rounded hover:text-white hover:border-[#2a2a2a] transition-colors font-mono">
                  <IconChevronDown className="size-3" />
                  {statusFilter === "all" ? "Status" : statusFilter.replace("_", " ")}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-36 bg-[#111111] border-[#222222] text-[12px]">
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>All statuses</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("complete")}>Complete</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("in_progress")}>In Progress</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("failed")}>Failed</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Table wrapper with overflow scroll on mobile */}
        <div className="rounded-lg border border-[#1a1a1a] bg-[#0c0c0c] overflow-hidden overflow-x-auto">
          <div className="min-w-[620px]">
            {/* Col headers */}
            <div className="grid grid-cols-[minmax(180px,1fr)_100px_80px_95px_80px_48px] gap-3 px-5 py-3 border-b border-[#1a1a1a] bg-[#0d0d0d]">
              {["Timestamp", "Type", "Size", "Status", "Duration", ""].map((h, i) => (
                <span key={i} className="text-[11px] font-mono uppercase tracking-wider text-[#444444]">
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            {filtered.length === 0 ? (
              <div className="px-5 py-12 text-center text-[13px] text-[#444444] font-mono">
                No backups match your filters
              </div>
            ) : (
              filtered.map((backup, idx) => (
                <div
                  key={backup.id}
                  className={`group grid grid-cols-[minmax(180px,1fr)_100px_80px_95px_80px_48px] gap-3 px-5 py-3.5 items-center hover:bg-[#121212] transition-colors ${
                    idx !== filtered.length - 1 ? "border-b border-[#161616]" : ""
                  }`}
                >
                  {/* Timestamp + label */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`size-1.5 rounded-full shrink-0 ${
                        backup.status === "complete"
                          ? "bg-emerald-400"
                          : backup.status === "in_progress"
                          ? "bg-amber-400 animate-pulse"
                          : "bg-red-500"
                      }`}
                    />
                    <span className="text-[13px] text-white font-mono truncate">{backup.timestamp}</span>
                    {backup.label && (
                      <span className="text-[10.5px] font-mono px-1.5 py-0.5 rounded bg-[#1a1a1a] text-[#777777] border border-[#262626] shrink-0">
                        {backup.label}
                      </span>
                    )}
                  </div>

                  {/* Type */}
                  <TypeBadge type={backup.type} />

                  {/* Size */}
                  <span className="text-[13px] font-mono text-[#888888]">
                    {backup.sizeMb > 0 ? `${backup.sizeMb} MB` : "—"}
                  </span>

                  {/* Status */}
                  <StatusBadge status={backup.status} />

                  {/* Duration */}
                  <span className="text-[13px] font-mono text-[#888888]">
                    {backup.durationSec > 0
                      ? `${Math.floor(backup.durationSec / 60)}m ${backup.durationSec % 60}s`
                      : "—"}
                  </span>

                  {/* Row actions (Always visible, prominent on mobile & desktop) */}
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          aria-label="Backup actions"
                          className="size-8 rounded-md bg-[#161616] sm:bg-transparent border border-[#262626] sm:border-transparent hover:border-[#383838] hover:bg-[#202020] text-[#aaaaaa] hover:text-white transition-all shadow-xs flex items-center justify-center cursor-pointer"
                        >
                          <IconDotsVertical className="size-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-44 bg-[#111111] border-[#222222] text-[12px]"
                      >
                        <DropdownMenuItem
                          onClick={() => setActiveTelemetryJobId(backup.id)}
                          className="gap-2 cursor-pointer text-white"
                        >
                          <IconTerminal2 className="size-3.5 text-muted-foreground" /> Live Console & Logs
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 cursor-pointer text-white">
                          <IconDownload className="size-3.5 text-[#888888]" /> Download dump
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            window.dispatchEvent(
                              new CustomEvent("backlify:open-modal", { detail: "restore" })
                            );
                          }}
                          className="gap-2 cursor-pointer text-white"
                        >
                          <IconRotateClockwise className="size-3.5 text-[#888888]" /> Restore database
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-[#1e1e1e]" />
                        <DropdownMenuItem className="gap-2 cursor-pointer text-red-400 focus:text-red-400">
                          <IconTrash className="size-3.5" /> Delete snapshot
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer count */}
        <p className="text-[11px] text-[#444444] font-mono px-1">
          Showing {filtered.length} of {backupsList.length} snapshot{backupsList.length === 1 ? "" : "s"}
        </p>
      </div>

      {/* Trigger backup panel */}
      {showPanel && (
        <TriggerPanel
          projectId={projectId}
          onClose={() => setShowPanel(false)}
          onSuccess={handleBackupSuccess}
        />
      )}

      {/* Real-time SSE Telemetry Drawer */}
      <JobTelemetryDrawer
        jobId={activeTelemetryJobId}
        jobType="backup"
        open={!!activeTelemetryJobId}
        onClose={() => setActiveTelemetryJobId(null)}
        title="Backup Worker Live Console"
      />
    </div>
  );
}
