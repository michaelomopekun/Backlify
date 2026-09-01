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
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
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

const MOCK_BACKUPS: Backup[] = [
  { id: "bk-001", timestamp: "Aug 26, 2026 · 14:00 UTC", type: "scheduled", status: "complete",     sizeMb: 142, durationSec: 72  },
  { id: "bk-002", timestamp: "Aug 26, 2026 · 09:14 UTC", type: "manual",    status: "complete",     sizeMb: 141, durationSec: 68, label: "pre-deploy" },
  { id: "bk-003", timestamp: "Aug 25, 2026 · 14:00 UTC", type: "scheduled", status: "complete",     sizeMb: 139, durationSec: 71  },
  { id: "bk-004", timestamp: "Aug 24, 2026 · 18:32 UTC", type: "manual",    status: "complete",     sizeMb: 138, durationSec: 65, label: "hotfix-2.1" },
  { id: "bk-005", timestamp: "Aug 24, 2026 · 14:00 UTC", type: "scheduled", status: "complete",     sizeMb: 137, durationSec: 70  },
  { id: "bk-006", timestamp: "Aug 23, 2026 · 14:00 UTC", type: "scheduled", status: "failed",       sizeMb: 0,   durationSec: 8   },
  { id: "bk-007", timestamp: "Aug 22, 2026 · 21:05 UTC", type: "manual",    status: "complete",     sizeMb: 135, durationSec: 63, label: "v2.0-release" },
  { id: "bk-008", timestamp: "Aug 22, 2026 · 14:00 UTC", type: "scheduled", status: "complete",     sizeMb: 134, durationSec: 67  },
  { id: "bk-009", timestamp: "Aug 21, 2026 · 14:00 UTC", type: "scheduled", status: "complete",     sizeMb: 133, durationSec: 66  },
  { id: "bk-010", timestamp: "Aug 20, 2026 · 14:00 UTC", type: "scheduled", status: "complete",     sizeMb: 131, durationSec: 64  },
  { id: "bk-011", timestamp: "Aug 20, 2026 · 08:00 UTC", type: "manual",    status: "in_progress",  sizeMb: 0,   durationSec: 0,  label: "migration-test" },
];

// 7-day activity data: each day has an array of backup events {type, status}
const ACTIVITY_DAYS = [
  { label: "Mon", date: "Aug 20", events: [{ type: "scheduled", status: "complete" }, { type: "manual", status: "in_progress" }] },
  { label: "Tue", date: "Aug 21", events: [{ type: "scheduled", status: "complete" }] },
  { label: "Wed", date: "Aug 22", events: [{ type: "scheduled", status: "complete" }, { type: "manual", status: "complete" }] },
  { label: "Thu", date: "Aug 23", events: [{ type: "scheduled", status: "failed" }] },
  { label: "Fri", date: "Aug 24", events: [{ type: "scheduled", status: "complete" }, { type: "manual", status: "complete" }] },
  { label: "Sat", date: "Aug 25", events: [{ type: "scheduled", status: "complete" }] },
  { label: "Sun", date: "Aug 26", events: [{ type: "scheduled", status: "complete" }, { type: "manual", status: "complete" }] },
];

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
  const [backupsList, setBackupsList] = useState<Backup[]>(initialBackups ?? MOCK_BACKUPS);
  const [showPanel, setShowPanel] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | BackupType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | BackupStatus>("all");

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
  };

  const filtered = backupsList.filter((b) => {
    const matchSearch =
      b.timestamp.toLowerCase().includes(search.toLowerCase()) ||
      (b.label ?? "").toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || b.type === typeFilter;
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const totalMb = backupsList.filter((b) => b.status === "complete").reduce(
    (sum, b) => sum + b.sizeMb,
    0
  );
  const successCount = backupsList.filter((b) => b.status === "complete").length;
  const successRate = backupsList.length > 0 ? Math.round((successCount / backupsList.length) * 100) : 100;

  return (
    <div className="space-y-8 sm:space-y-10 pb-24 sm:pb-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-semibold sm:font-normal tracking-tight text-white">Backups</h1>
          <p className="text-xs sm:text-[13px] text-[#777777] mt-1 font-mono">
            {totalMb} MB stored · Last run 2h ago · Next: today at 14:00 UTC
          </p>
        </div>
        <Button
          onClick={() => setShowPanel(true)}
          className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 text-xs sm:text-[13px] font-semibold h-9 px-4 shadow-xs shrink-0"
        >
          <IconBolt className="size-3.5 mr-1.5" />
          Trigger Manual Backup
        </Button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={IconDatabaseImport}
          label="Total Snapshots"
          value={String(MOCK_BACKUPS.length)}
          sub="7 scheduled · 4 manual"
          accent="text-emerald-400"
        />
        <StatCard
          icon={IconCloudUpload}
          label="Total Stored"
          value={`${totalMb} MB`}
          sub="AES-256 · S3 eu-central-1"
          accent="text-blue-400"
        />
        <StatCard
          icon={IconShieldCheck}
          label="Success Rate"
          value={`${successRate}%`}
          sub={`${successCount} of ${MOCK_BACKUPS.length} succeeded`}
          accent="text-emerald-400"
        />
        <StatCard
          icon={IconClock}
          label="Next Scheduled"
          value="14:00 UTC"
          sub="Daily · in ~3h 40m"
          accent="text-amber-400"
        />
      </div>

      {/* ── 7-Day Activity Chart ── */}
      <div className="rounded-lg border border-[#1a1a1a] bg-[#0f0f0f] p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-[14px] font-medium text-white">Backup Activity</h2>
            <p className="text-[12px] text-[#555555] mt-0.5 font-mono">Last 7 days</p>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] font-mono text-[#666666]">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-emerald-400" />Scheduled</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-blue-400" />Manual</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-red-500" />Failed</span>
          </div>
        </div>

        {/* Chart columns */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-3">
          {ACTIVITY_DAYS.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <ActivityBar events={day.events} isToday={i === 6} />
              <div className="text-center">
                <p className={`text-[11px] font-mono ${i === 6 ? "text-white" : "text-[#555555]"}`}>
                  {day.label}
                </p>
                <p className="text-[10px] font-mono text-[#3a3a3a]">{day.date}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary strip */}
        <div className="mt-5 pt-4 border-t border-[#1a1a1a] flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] sm:text-[11.5px] font-mono text-[#777777]">
          <span><span className="text-white">11</span> total backups</span>
          <span><span className="text-emerald-400">10</span> succeeded</span>
          <span><span className="text-red-400">1</span> failed</span>
          <span><span className="text-blue-400">4</span> manual</span>
          <span><span className="text-amber-400">1</span> in progress</span>
        </div>
      </div>

      {/* ── Backups Table ── */}
      <div className="space-y-3">
        {/* Table header with filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-[14px] font-medium text-white shrink-0">All Snapshots</h2>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
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
        <div className="rounded-lg border border-[#1a1a1a] overflow-hidden overflow-x-auto">
          <div className="min-w-[620px]">
            {/* Col headers */}
            <div className="grid grid-cols-[1fr_100px_80px_90px_72px_44px] gap-4 px-5 py-3 border-b border-[#1a1a1a] bg-[#0d0d0d]">
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
                  className={`group grid grid-cols-[1fr_100px_80px_90px_72px_44px] gap-4 px-5 py-3.5 items-center hover:bg-[#111111] transition-colors ${
                    idx !== filtered.length - 1 ? "border-b border-[#141414]" : ""
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
                      <span className="text-[10.5px] font-mono px-1.5 py-0.5 rounded bg-[#1a1a1a] text-[#666666] border border-[#242424] shrink-0">
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

                  {/* Row actions */}
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-[#1e1e1e] text-[#666666] hover:text-white">
                          <IconDotsVertical className="size-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-44 bg-[#111111] border-[#222222] text-[12px]"
                      >
                        <DropdownMenuItem className="gap-2 cursor-pointer">
                          <IconDownload className="size-3.5" /> Download dump
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 cursor-pointer">
                          <IconRotateClockwise className="size-3.5" /> Restore to this point
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
          Showing {filtered.length} of {MOCK_BACKUPS.length} snapshots
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
    </div>
  );
}
