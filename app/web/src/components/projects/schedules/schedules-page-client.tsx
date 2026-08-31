"use client";

import { useState, useEffect } from "react";
import {
  IconCalendarTime,
  IconClock,
  IconBolt,
  IconPlayerPlay,
  IconPlayerPause,
  IconTrash,
  IconEdit,
  IconPlus,
  IconX,
  IconCheck,
  IconDotsVertical,
  IconChevronDown,
  IconRefresh,
  IconAlertTriangle,
  IconCircleCheck,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { StatCard, StatCardVariant2 } from "@/components/shared/stat-card";
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

type ScheduleStatus = "active" | "paused" | "failing";
type FrequencyPreset = "hourly" | "daily" | "weekly" | "monthly" | "custom";

interface Schedule {
  id: string;
  name: string;
  cron: string;
  humanReadable: string;
  status: ScheduleStatus;
  nextRunUtc: string; // "HH:MM" for timeline
  nextRunLabel: string;
  lastRunLabel: string;
  lastRunOk: boolean;
  retentionDays: number;
  avgDurationSec: number;
  totalRuns: number;
}

const MOCK_SCHEDULES: Schedule[] = [
  {
    id: "sch-001",
    name: "Daily Production Snapshot",
    cron: "0 14 * * *",
    humanReadable: "Every day at 14:00 UTC",
    status: "active",
    nextRunUtc: "14:00",
    nextRunLabel: "in 2h 14m",
    lastRunLabel: "Aug 26 · 14:00 UTC",
    lastRunOk: true,
    retentionDays: 7,
    avgDurationSec: 71,
    totalRuns: 42,
  },
  {
    id: "sch-002",
    name: "Nightly Full Backup",
    cron: "0 2 * * *",
    humanReadable: "Every day at 02:00 UTC",
    status: "active",
    nextRunUtc: "02:00",
    nextRunLabel: "in 14h 22m",
    lastRunLabel: "Aug 27 · 02:00 UTC",
    lastRunOk: true,
    retentionDays: 30,
    avgDurationSec: 134,
    totalRuns: 28,
  },
  {
    id: "sch-003",
    name: "Weekly Long-term Archive",
    cron: "0 0 * * 0",
    humanReadable: "Every Sunday at 00:00 UTC",
    status: "failing",
    nextRunUtc: "00:00",
    nextRunLabel: "in 6d 20h",
    lastRunLabel: "Aug 18 · 00:00 UTC",
    lastRunOk: false,
    retentionDays: 90,
    avgDurationSec: 198,
    totalRuns: 6,
  },
  {
    id: "sch-004",
    name: "Hourly WAL Checkpoint",
    cron: "0 * * * *",
    humanReadable: "Every hour",
    status: "paused",
    nextRunUtc: "11:00",
    nextRunLabel: "Paused",
    lastRunLabel: "Aug 25 · 10:00 UTC",
    lastRunOk: true,
    retentionDays: 1,
    avgDurationSec: 22,
    totalRuns: 120,
  },
];

// Timeline marks: each schedule's fire time as a fraction of 24h
const TIMELINE_HOURS = Array.from({ length: 25 }, (_, i) => i); // 0..24

/* ─────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────*/

function utcHourToPercent(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return ((h * 60 + m) / (24 * 60)) * 100;
}

function fmtDuration(sec: number) {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
}



/* ─────────────────────────────────────────────────────────────────
   24h Timeline Rail
───────────────────────────────────────────────────────────────────*/

function TimelineRail({ schedules }: { schedules: Schedule[] }) {
  const active = schedules.filter((s) => s.status !== "paused");
  // Current time mock: 11:46 UTC
  const nowPercent = ((11 * 60 + 46) / (24 * 60)) * 100;

  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#0f0f0f] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[13px] font-medium text-white">Next 24h Timeline</h2>
          <p className="text-[11px] text-[#555555] mt-0.5 font-mono">Scheduled fires — UTC</p>
        </div>
        <span className="text-[10px] font-mono text-[#444444] border border-[#222222] rounded px-2 py-0.5">
          Now: 11:46 UTC
        </span>
      </div>

      {/* Rail */}
      <div className="relative h-12 select-none">
        {/* Track */}
        <div className="absolute top-5 left-0 right-0 h-px bg-[#1e1e1e]" />

        {/* Hour tick marks */}
        {[0, 6, 12, 18, 24].map((h) => (
          <div
            key={h}
            className="absolute top-3 flex flex-col items-center"
            style={{ left: `${(h / 24) * 100}%` }}
          >
            <div className="w-px h-3 bg-[#2a2a2a]" />
            <span className="text-[9px] font-mono text-[#444444] mt-1">
              {String(h).padStart(2, "0")}:00
            </span>
          </div>
        ))}

        {/* "Now" cursor */}
        <div
          className="absolute top-2 flex flex-col items-center z-10"
          style={{ left: `${nowPercent}%` }}
        >
          <div className="w-px h-5 bg-primary/70" />
          <div className="size-1.5 rounded-full bg-primary mt-0.5" />
        </div>

        {/* Schedule pins */}
        {active.map((s) => {
          const pct = utcHourToPercent(s.nextRunUtc);
          const color =
            s.status === "failing" ? "#ef4444" : "#FFB31F";
          return (
            <div
              key={s.id}
              className="absolute top-3 flex flex-col items-center group cursor-default"
              style={{ left: `${pct}%` }}
              title={`${s.name} · ${s.nextRunUtc} UTC`}
            >
              <div
                className="w-0.5 h-5 rounded-full"
                style={{ background: color }}
              />
              <div
                className="size-2 rounded-full mt-0.5 ring-2 ring-[#0f0f0f]"
                style={{ background: color }}
              />
              {/* Hover label */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#1a1a1a] border border-[#2a2a2a] text-white text-[10px] font-mono px-2 py-1 rounded z-20 pointer-events-none">
                {s.nextRunUtc} UTC
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 pt-1">
        {active.map((s) => (
          <div key={s.id} className="flex items-center gap-1.5 text-[11px] text-[#666666]">
            <span
              className="size-1.5 rounded-full"
              style={{ background: s.status === "failing" ? "#ef4444" : "#FFB31F" }}
            />
            <span className="font-mono">{s.name.split(" ")[0]}</span>
            <span className="text-[#444444]">·</span>
            <span className="text-[#555555]">{s.nextRunUtc} UTC</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Schedule Card
───────────────────────────────────────────────────────────────────*/

function ScheduleCard({
  schedule,
  onEdit,
  onToggle,
  onDelete,
  onRunNow,
}: {
  schedule: Schedule;
  onEdit: (s: Schedule) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onRunNow: (id: string) => void;
}) {
  const statusColor =
    schedule.status === "active"
      ? "#22c55e"
      : schedule.status === "failing"
      ? "#ef4444"
      : "#555555";

  const statusLabel =
    schedule.status === "active"
      ? "Active"
      : schedule.status === "failing"
      ? "Failing"
      : "Paused";

  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#0f0f0f] p-5 space-y-4 group hover:border-[#252525] transition-colors">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1">
            {/* Status dot */}
            <span
              className="size-2 rounded-full shrink-0 shadow-[0_0_6px_currentColor]"
              style={{ color: statusColor, background: statusColor }}
            />
            <h3 className="text-[14px] font-medium text-white truncate">{schedule.name}</h3>
          </div>
          <p className="text-[12px] text-[#555555] font-mono">
            <span className="text-[#888888]">{schedule.cron}</span>
            <span className="text-[#333333] mx-2">·</span>
            {schedule.humanReadable}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Toggle switch */}
          <button
            type="button"
            onClick={() => onToggle(schedule.id)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              schedule.status === "active" ? "bg-primary" : "bg-[#2a2a2a]"
            }`}
          >
            <span
              className={`inline-block size-3.5 rounded-full bg-black transition-transform ${
                schedule.status === "active" ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </button>

          {/* Kebab menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="p-1 rounded text-[#555555] hover:text-white hover:bg-[#1a1a1a] transition-colors"
              >
                <IconDotsVertical className="size-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-44 bg-[#111111] border-[#222222] text-white text-[12px]"
            >
              <DropdownMenuItem
                onClick={() => onEdit(schedule)}
                className="gap-2 text-[#aaaaaa] hover:text-white focus:bg-[#1a1a1a] focus:text-white cursor-pointer"
              >
                <IconEdit className="size-3.5" />
                Edit schedule
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onRunNow(schedule.id)}
                className="gap-2 text-[#aaaaaa] hover:text-white focus:bg-[#1a1a1a] focus:text-white cursor-pointer"
              >
                <IconBolt className="size-3.5" />
                Run now
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onToggle(schedule.id)}
                className="gap-2 text-[#aaaaaa] hover:text-white focus:bg-[#1a1a1a] focus:text-white cursor-pointer"
              >
                {schedule.status === "paused" ? (
                  <><IconPlayerPlay className="size-3.5" />Resume</>
                ) : (
                  <><IconPlayerPause className="size-3.5" />Pause</>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#1e1e1e]" />
              <DropdownMenuItem
                onClick={() => onDelete(schedule.id)}
                className="gap-2 text-red-400 hover:text-red-300 focus:bg-[#1a1a1a] focus:text-red-300 cursor-pointer"
              >
                <IconTrash className="size-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Meta row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="space-y-0.5">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#444444]">Next Run</p>
          <p className={`text-[12px] font-medium ${schedule.status === "paused" ? "text-[#555555]" : "text-white"}`}>
            {schedule.nextRunLabel}
          </p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#444444]">Last Run</p>
          <div className="flex items-center gap-1.5">
            {schedule.lastRunOk ? (
              <IconCircleCheck className="size-3 text-emerald-400 shrink-0" />
            ) : (
              <IconAlertTriangle className="size-3 text-red-400 shrink-0" />
            )}
            <p className="text-[12px] text-[#888888]">{schedule.lastRunLabel}</p>
          </div>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#444444]">Retention</p>
          <p className="text-[12px] text-[#888888]">Keep last {schedule.retentionDays}d</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#444444]">Avg Duration</p>
          <p className="text-[12px] text-[#888888]">{fmtDuration(schedule.avgDurationSec)}</p>
        </div>
      </div>

      {/* Status badge row */}
      <div className="flex items-center gap-2 pt-1 border-t border-[#141414]">
        <span
          className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border tracking-wider"
          style={{
            borderColor: `${statusColor}40`,
            color: statusColor,
            background: `${statusColor}10`,
          }}
        >
          {statusLabel}
        </span>
        <span className="text-[10px] font-mono text-[#444444]">·</span>
        <span className="text-[11px] font-mono text-[#555555]">
          {schedule.totalRuns} total runs
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Cron Editor Drawer
───────────────────────────────────────────────────────────────────*/

const PRESET_OPTIONS: { label: string; key: FrequencyPreset; cron: string; readable: string }[] = [
  { label: "Hourly",   key: "hourly",  cron: "0 * * * *",   readable: "Every hour" },
  { label: "Daily",    key: "daily",   cron: "0 14 * * *",  readable: "Every day at 14:00 UTC" },
  { label: "Weekly",   key: "weekly",  cron: "0 0 * * 0",   readable: "Every Sunday at 00:00 UTC" },
  { label: "Monthly",  key: "monthly", cron: "0 0 1 * *",   readable: "1st of every month at 00:00 UTC" },
  { label: "Custom",   key: "custom",  cron: "",             readable: "" },
];

function CronEditorDrawer({
  open,
  editing,
  onClose,
  onSave,
}: {
  open: boolean;
  editing: Schedule | null;
  onClose: () => void;
  onSave: (data: Partial<Schedule>) => void;
}) {
  const [name, setName] = useState(editing?.name ?? "");
  const [preset, setPreset] = useState<FrequencyPreset>("daily");
  const [cronStr, setCronStr] = useState(editing?.cron ?? "0 14 * * *");
  const [readable, setReadable] = useState(editing?.humanReadable ?? "Every day at 14:00 UTC");
  const [retention, setRetention] = useState(editing?.retentionDays ?? 7);
  const [saved, setSaved] = useState(false);

  // Sync when editing changes
  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setCronStr(editing.cron);
      setReadable(editing.humanReadable);
      setRetention(editing.retentionDays);
    } else {
      setName("");
      setCronStr("0 14 * * *");
      setReadable("Every day at 14:00 UTC");
      setRetention(7);
      setPreset("daily");
    }
    setSaved(false);
  }, [editing, open]);

  function handlePreset(p: typeof PRESET_OPTIONS[0]) {
    setPreset(p.key);
    if (p.key !== "custom") {
      setCronStr(p.cron);
      setReadable(p.readable);
    }
  }

  function handleSave() {
    onSave({ name, cron: cronStr, humanReadable: readable, retentionDays: retention });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 900);
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0d0d0d] border-l border-[#1a1a1a] z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1a1a1a] shrink-0">
          <div>
            <h2 className="text-[15px] font-medium text-white">
              {editing ? "Edit Schedule" : "New Schedule"}
            </h2>
            <p className="text-[11px] text-[#555555] mt-0.5">
              Configure cron expression and retention policy
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-[#555555] hover:text-white hover:bg-[#1a1a1a] transition-colors"
          >
            <IconX className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Schedule name */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono uppercase tracking-widest text-[#555555]">
              Schedule Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Daily Production Snapshot"
              className="w-full h-9 px-3 bg-[#111111] border border-[#222222] rounded-lg text-[13px] text-white placeholder-[#444444] focus:outline-none focus:border-[#333333] transition-colors"
            />
          </div>

          {/* Frequency presets */}
          <div className="space-y-3">
            <label className="text-[11px] font-mono uppercase tracking-widest text-[#555555]">
              Frequency
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {PRESET_OPTIONS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => handlePreset(p)}
                  className={`py-2 rounded-lg text-[11px] font-mono border transition-colors ${
                    preset === p.key
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-[#1e1e1e] bg-[#111111] text-[#666666] hover:text-white hover:border-[#2a2a2a]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cron expression */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono uppercase tracking-widest text-[#555555]">
              Cron Expression
            </label>
            <input
              type="text"
              value={cronStr}
              onChange={(e) => {
                setCronStr(e.target.value);
                setPreset("custom");
                setReadable("Custom schedule");
              }}
              placeholder="0 14 * * *"
              className="w-full h-9 px-3 bg-[#111111] border border-[#222222] rounded-lg text-[13px] text-white font-mono placeholder-[#444444] focus:outline-none focus:border-[#333333] transition-colors"
            />
            {/* Human readable preview */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#181818]">
              <IconCalendarTime className="size-3.5 text-primary shrink-0" />
              <span className="text-[11.5px] text-[#888888]">{readable}</span>
            </div>
          </div>

          {/* Visual cron breakdown */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono uppercase tracking-widest text-[#555555]">
              Cron Fields
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {["Minute", "Hour", "Day", "Month", "Weekday"].map((field, i) => (
                <div key={field} className="space-y-1">
                  <p className="text-[9px] font-mono text-[#444444] text-center uppercase">
                    {field}
                  </p>
                  <div className="h-8 flex items-center justify-center bg-[#0a0a0a] border border-[#1a1a1a] rounded text-[13px] font-mono text-[#888888]">
                    {cronStr.split(" ")[i] ?? "*"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Retention policy */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono uppercase tracking-widest text-[#555555]">
                Retention Policy
              </label>
              <span className="text-[12px] font-mono text-white">
                Keep last <span className="text-primary font-semibold">{retention}</span> days
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={90}
              value={retention}
              onChange={(e) => setRetention(Number(e.target.value))}
              className="w-full h-1 appearance-none bg-[#1e1e1e] rounded-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[9px] font-mono text-[#444444]">
              <span>1d</span>
              <span>30d</span>
              <span>90d</span>
            </div>
          </div>

          {/* Target DB info */}
          <div className="rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] p-4 space-y-2">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#444444]">Target Database</p>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-400" />
              <span className="text-[12px] text-[#888888] font-mono">
                postgres://prod-db.eu-central-1 · Postgres 16
              </span>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-6 py-5 border-t border-[#1a1a1a] flex gap-3 shrink-0">
          {saved ? (
            <div className="flex-1 flex items-center justify-center gap-2 text-emerald-400 text-[13px]">
              <IconCheck className="size-4" />
              Saved successfully
            </div>
          ) : (
            <>
              <Button
                onClick={handleSave}
                disabled={!name.trim() || !cronStr.trim()}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 text-[13px] font-semibold h-9 shadow-xs disabled:opacity-40"
              >
                <IconCalendarTime className="size-3.5 mr-1.5" />
                {editing ? "Update Schedule" : "Create Schedule"}
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="h-9 px-4 border-[#222222] bg-transparent text-[#888888] hover:text-white text-[13px]"
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Main Page
───────────────────────────────────────────────────────────────────*/

import {
  createSchedule,
  setScheduleActive,
  deleteSchedule,
} from "@/app/actions/schedule.actions";
import { triggerBackup } from "@/app/actions/backup.actions";

export function SchedulesPageClient({
  orgId,
  projectId,
  initialSchedules,
}: {
  orgId: string;
  projectId: string;
  initialSchedules?: any[];
}) {
  const [schedules, setSchedules] = useState<Schedule[]>(() => {
    if (initialSchedules && initialSchedules.length > 0) {
      return initialSchedules.map((s) => ({
        id: s.id,
        name: s.name,
        cron: s.cron,
        humanReadable: s.frequency,
        status: s.status,
        nextRunUtc: "14:00",
        nextRunLabel: s.nextRunRel || "in ~3h",
        lastRunLabel: s.lastRun || "Never",
        lastRunOk: s.lastRunStatus === "success",
        retentionDays: s.retentionDays || 14,
        avgDurationSec: 72,
        totalRuns: 42,
      }));
    }
    return MOCK_SCHEDULES;
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);

  const activeCount = schedules.filter((s) => s.status === "active").length;
  const failingCount = schedules.filter((s) => s.status === "failing").length;

  // Next run: first active schedule's nextRunLabel
  const nextRun = schedules.find((s) => s.status === "active")?.nextRunLabel ?? "—";

  // Avg duration across all schedules
  const avgDuration = schedules.length > 0
    ? Math.round(schedules.reduce((sum, s) => sum + s.avgDurationSec, 0) / schedules.length)
    : 0;

  async function handleToggle(id: string) {
    const current = schedules.find((s) => s.id === id);
    if (!current) return;
    const nextActive = current.status !== "active";

    setSchedules((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: nextActive ? "active" : "paused" }
          : s
      )
    );

    await setScheduleActive(id, projectId, nextActive);
  }

  async function handleDelete(id: string) {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    await deleteSchedule(id, projectId);
  }

  function handleEdit(s: Schedule) {
    setEditingSchedule(s);
    setDrawerOpen(true);
  }

  async function handleRunNow(id: string) {
    setRunningId(id);
    await triggerBackup(projectId);
    setTimeout(() => setRunningId(null), 2500);
  }

  async function handleSave(data: Partial<Schedule>) {
    const cron = data.cron ?? "0 14 * * *";
    const formData = new FormData();
    formData.append("projectId", projectId);
    formData.append("cronExpression", cron);
    formData.append("timezone", "UTC");

    if (editingSchedule) {
      setSchedules((prev) =>
        prev.map((s) => (s.id === editingSchedule.id ? { ...s, ...data } : s))
      );
    } else {
      const res = await createSchedule(formData);
      const newSchedule: Schedule = {
        id: `sch-${Date.now()}`,
        name: data.name ?? "New Schedule",
        cron: data.cron ?? "0 14 * * *",
        humanReadable: data.humanReadable ?? "Every day at 14:00 UTC",
        status: "active",
        nextRunUtc: "14:00",
        nextRunLabel: "in 2h",
        lastRunLabel: "Never",
        lastRunOk: true,
        retentionDays: data.retentionDays ?? 7,
        avgDurationSec: 0,
        totalRuns: 0,
      };
      setSchedules((prev) => [...prev, newSchedule]);
    }
  }

  return (
    <div className="space-y-10 pb-16">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-normal tracking-tight text-white">Schedules</h1>
          <p className="text-[13px] text-[#555555] mt-1 font-mono">
            {activeCount} active &middot; {schedules.length} total &middot; Next run {nextRun}
          </p>
        </div>
        <Button
          onClick={() => { setEditingSchedule(null); setDrawerOpen(true); }}
          className="bg-primary text-primary-foreground hover:bg-primary/90 text-[13px] font-semibold h-9 px-4 shadow-xs"
        >
          <IconPlus className="size-3.5 mr-1.5" />
          New Schedule
        </Button>
      </div>

      {/* ── Stat Cards (Card 1 Style) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={IconCalendarTime}
          label="Active Schedules"
          value={`${activeCount} / ${schedules.length}`}
          sub={failingCount > 0 ? `${failingCount} failing` : "All healthy"}
          accent={failingCount > 0 ? "text-red-400" : "text-emerald-400"}
        />
        <StatCard
          icon={IconClock}
          label="Next Run In"
          value={nextRun}
          sub="Daily Production Snapshot"
          accent="text-amber-400"
        />
        <StatCard
          icon={IconRefresh}
          label="Avg Backup Duration"
          value={fmtDuration(avgDuration)}
          sub="Across all schedules"
          accent="text-indigo-400"
        />
      </div>

      {/* ── 24h Timeline Rail ── */}
      <TimelineRail schedules={schedules} />

      {/* ── Schedules Section ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-medium text-white">All Schedules</h2>
          <span className="text-[11px] text-[#555555] font-mono">{schedules.length} schedules</span>
        </div>

        {/* ── Schedule Cards ── */}
        <div className="space-y-3.5">
          {schedules.map((s) => (
            <div key={s.id} className="relative">
              {/* "Running now" flash overlay */}
              {runningId === s.id && (
                <div className="absolute inset-0 rounded-xl border border-primary/40 bg-primary/5 z-10 flex items-center justify-center pointer-events-none">
                  <span className="text-[12px] font-mono text-primary animate-pulse">
                    ⚡ Backup triggered — running…
                  </span>
                </div>
              )}
              <ScheduleCard
                schedule={s}
                onEdit={handleEdit}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onRunNow={handleRunNow}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Empty State (if all deleted) ── */}
      {schedules.length === 0 && (
        <div className="rounded-xl border border-[#1a1a1a] bg-[#0f0f0f] p-12 text-center space-y-3">
          <IconCalendarTime className="size-8 text-[#333333] mx-auto" />
          <p className="text-[14px] text-[#555555]">No schedules configured</p>
          <Button
            onClick={() => { setEditingSchedule(null); setDrawerOpen(true); }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-[12px] font-semibold h-8 px-3"
          >
            <IconPlus className="size-3.5 mr-1.5" />
            Create your first schedule
          </Button>
        </div>
      )}

      {/* ── Cron Editor Drawer ── */}
      <CronEditorDrawer
        open={drawerOpen}
        editing={editingSchedule}
        onClose={() => { setDrawerOpen(false); setEditingSchedule(null); }}
        onSave={handleSave}
      />
    </div>
  );
}
