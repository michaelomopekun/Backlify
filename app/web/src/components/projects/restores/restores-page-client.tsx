"use client";

import { useState, useEffect, useRef } from "react";
import {
  IconShieldCheck,
  IconClock,
  IconTerminal2,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconDatabase,
  IconSearch,
  IconCopy,
  IconBolt,
  IconDotsVertical,
  IconRotateClockwise,
  IconRefresh,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ─────────────────────────────────────────────────────────────────
   Types & Mock Data
───────────────────────────────────────────────────────────────────*/

type DrillType = "automated_drill" | "live_restore" | "staging_clone";
type DrillStatus = "passed" | "running" | "failed" | "complete";

interface IntegrityCheck {
  name: string;
  passed: boolean;
  details?: string;
}

interface RestoreDrill {
  id: string;
  type: DrillType;
  status: DrillStatus;
  targetDb: string;
  sourceSnapshot: string;
  sourceTimestamp: string;
  executedAt: string;
  durationSec: number;
  sizeMb: number;
  integrityChecks: IntegrityCheck[];
  initiatedBy: string;
  logs: string[];
}

const MOCK_DRILLS: RestoreDrill[] = [
  {
    id: "drill-104",
    type: "automated_drill",
    status: "passed",
    targetDb: "ephemeral-sandbox-drill-104",
    sourceSnapshot: "Daily Production Snapshot (bk-001)",
    sourceTimestamp: "Aug 28 · 14:00 UTC",
    executedAt: "Today at 04:00 UTC",
    durationSec: 68,
    sizeMb: 142,
    initiatedBy: "Automated Cron Scheduler",
    integrityChecks: [
      { name: "Schema Parity", passed: true },
      { name: "Row Counts", passed: true },
      { name: "SHA-256", passed: true },
      { name: "Foreign Keys", passed: true },
    ],
    logs: [
      "[04:00:01 UTC] [INFO] Initiating automated disaster recovery drill #104",
      "[04:00:02 UTC] [SANDBOX] Provisioning isolated PostgreSQL 16.3 instance on eu-central-1...",
      "[04:00:06 UTC] [SANDBOX] Container ready: ephemeral-sandbox-drill-104",
      "[04:00:08 UTC] [S3] Fetching snapshot bk-001 (142 MB, AES-256 encrypted)...",
      "[04:00:11 UTC] [KMS] Decrypted payload with KMS key alias/backlify-prod-key",
      "[04:00:14 UTC] [RESTORE] Executing pg_restore --clean --if-exists --no-owner...",
      "[04:00:22 UTC] [RESTORE] Restoring table public.users (48,200 rows) ... [OK]",
      "[04:00:30 UTC] [RESTORE] Restoring table public.transactions (182,410 rows) ... [OK]",
      "[04:00:42 UTC] [INDEX] Rebuilding B-Tree & GIN indexes (42/42) ... [OK]",
      "[04:00:52 UTC] [VERIFY] Running schema parity check against live production catalog...",
      "[04:00:58 UTC] [VERIFY] Validating table row counts & sequences: 124,800 / 124,800 [MATCH]",
      "[04:01:04 UTC] [VERIFY] SHA-256 block checksum comparison: e3b0c442... [MATCH]",
      "[04:01:07 UTC] [TEARDOWN] Dropping ephemeral sandbox database cleanly...",
      "[04:01:08 UTC] [SUCCESS] DR Drill passed in 1m 08s. RTO benchmark satisfied.",
    ],
  },
  {
    id: "drill-103",
    type: "staging_clone",
    status: "complete",
    targetDb: "postgres://staging-clone.internal:5432/staging_db",
    sourceSnapshot: "Pre-deploy Snapshot (bk-002)",
    sourceTimestamp: "Aug 26 · 09:14 UTC",
    executedAt: "Aug 26 at 18:30 UTC",
    durationSec: 74,
    sizeMb: 141,
    initiatedBy: "michael@backlify.dev",
    integrityChecks: [
      { name: "Schema Parity", passed: true },
      { name: "Row Counts", passed: true },
      { name: "DB Online", passed: true },
      { name: "Sequences", passed: true },
    ],
    logs: [
      "[18:30:00 UTC] [INFO] Staging clone requested by user michael@backlify.dev",
      "[18:30:05 UTC] [S3] Downloaded snapshot bk-002 from s3://backlify-vault-eu-central-1",
      "[18:30:15 UTC] [RESTORE] Connecting to target database postgres://staging-clone.internal...",
      "[18:30:30 UTC] [RESTORE] Streaming dump into staging database...",
      "[18:31:05 UTC] [RESTORE] Schema and data restored successfully.",
      "[18:31:14 UTC] [SUCCESS] Staging database clone complete in 1m 14s.",
    ],
  },
  {
    id: "drill-102",
    type: "automated_drill",
    status: "passed",
    targetDb: "ephemeral-sandbox-drill-102",
    sourceSnapshot: "Daily Production Snapshot (bk-003)",
    sourceTimestamp: "Aug 25 · 14:00 UTC",
    executedAt: "Aug 25 at 04:00 UTC",
    durationSec: 65,
    sizeMb: 139,
    initiatedBy: "Automated Cron Scheduler",
    integrityChecks: [
      { name: "Schema Parity", passed: true },
      { name: "Row Counts", passed: true },
      { name: "SHA-256", passed: true },
      { name: "Foreign Keys", passed: true },
    ],
    logs: [
      "[04:00:00 UTC] [INFO] Daily automated disaster recovery drill #102 started",
      "[04:00:05 UTC] [SANDBOX] Ephemeral container launched",
      "[04:00:45 UTC] [RESTORE] Database restored into sandbox",
      "[04:01:00 UTC] [VERIFY] Schema & Row counts verified",
      "[04:01:05 UTC] [SUCCESS] Drill completed in 1m 05s.",
    ],
  },
  {
    id: "drill-101",
    type: "live_restore",
    status: "complete",
    targetDb: "postgres://prod-recovery-mirror.internal:5432/main",
    sourceSnapshot: "Hotfix Snapshot (bk-004)",
    sourceTimestamp: "Aug 24 · 18:32 UTC",
    executedAt: "Aug 24 at 19:10 UTC",
    durationSec: 69,
    sizeMb: 138,
    initiatedBy: "michael@backlify.dev",
    integrityChecks: [
      { name: "Schema Parity", passed: true },
      { name: "Row Counts", passed: true },
      { name: "Tablespaces", passed: true },
      { name: "Indexes", passed: true },
    ],
    logs: [
      "[19:10:00 UTC] [INFO] Production recovery mirror restore triggered",
      "[19:10:40 UTC] [RESTORE] pg_restore complete",
      "[19:11:09 UTC] [SUCCESS] Recovery mirror ready in 1m 09s.",
    ],
  },
];

const PITR_POINTS = [
  { id: "p1", day: "Mon", date: "Aug 24", time: "14:00 UTC", size: "137 MB", snapshotId: "bk-005" },
  { id: "p2", day: "Mon", date: "Aug 24", time: "18:32 UTC", size: "138 MB", snapshotId: "bk-004" },
  { id: "p3", day: "Tue", date: "Aug 25", time: "14:00 UTC", size: "139 MB", snapshotId: "bk-003" },
  { id: "p4", day: "Wed", date: "Aug 26", time: "09:14 UTC", size: "141 MB", snapshotId: "bk-002" },
  { id: "p5", day: "Wed", date: "Aug 26", time: "14:00 UTC", size: "142 MB", snapshotId: "bk-001" },
  { id: "p6", day: "Today", date: "Aug 28", time: "14:00 UTC", size: "142 MB", snapshotId: "bk-latest" },
];

/* ─────────────────────────────────────────────────────────────────
   Clean, De-noised PITR Scrubber
───────────────────────────────────────────────────────────────────*/

function PitrScrubber({
  onSelectPoint,
}: {
  onSelectPoint: (point: typeof PITR_POINTS[0]) => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState(PITR_POINTS.length - 1);
  const current = PITR_POINTS[selectedIndex];
  const percent = (selectedIndex / (PITR_POINTS.length - 1)) * 100;

  return (
    <div className="rounded-lg border border-[#1e1e1e] bg-[#111111] p-5 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[13.5px] font-medium text-white flex items-center gap-2">
            <span>Point-in-Time Recovery</span>
            <span className="text-[10px] font-mono text-primary bg-primary/10 border border-primary/20 rounded px-1.5 py-0.5">
              Drag scrubber
            </span>
          </h2>
          <p className="text-[11.5px] text-[#666666] font-mono mt-0.5">
            Drag the handle or click any checkpoint below to select a recovery target
          </p>
        </div>
        <span className="text-[11px] font-mono text-[#555555]">
          7-Day Window
        </span>
      </div>

      {/* Timeline Slider Track with Centered Handle & Inset Margins (No Overflow) */}
      <div className="space-y-3 pt-6 pb-2 px-6">
        {/* Rail & Draggable Handle Container */}
        <div className="relative h-6 flex items-center">
          {/* Horizontal Background Rail */}
          <div className="h-2 w-full bg-[#1c1c1c] rounded-full overflow-hidden border border-[#262626]">
            <div
              className="h-full bg-primary transition-all duration-75"
              style={{ width: `${percent}%` }}
            />
          </div>

          {/* Draggable Physical Handle directly centered ON TOP of the horizontal bar */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-all duration-75 z-20 flex flex-col items-center"
            style={{ left: `${percent}%` }}
          >
            {/* Floating Live Scrubber Bubble */}
            <div className="absolute -top-8 flex items-center px-2 py-0.5 rounded-md bg-[#161616] border border-primary/40 text-primary font-mono text-[11px] shadow-lg whitespace-nowrap">
              <span>{current.day} {current.time.split(" ")[0]}</span>
            </div>

            {/* Draggable Physical Thumb sitting directly on the horizontal rail */}
            <div className="size-5 rounded-full bg-white border-2 border-primary shadow-[0_0_14px_rgba(255,179,31,0.7)] flex items-center justify-center">
              <div className="size-1.5 rounded-full bg-[#111111]" />
            </div>
          </div>

          {/* Interactive Range Input overlay */}
          <input
            type="range"
            min={0}
            max={PITR_POINTS.length - 1}
            value={selectedIndex}
            onChange={(e) => setSelectedIndex(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-grab active:cursor-grabbing z-30"
          />
        </div>

        {/* Checkpoint Ticks & Labels with zero edge overflow */}
        <div className="relative w-full h-8">
          {PITR_POINTS.map((pt, idx) => {
            const ptPercent = (idx / (PITR_POINTS.length - 1)) * 100;
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={pt.id}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className="absolute top-0 -translate-x-1/2 flex flex-col items-center group cursor-pointer focus:outline-none z-10"
                style={{ left: `${ptPercent}%` }}
              >
                {/* Vertical tick connecting to the rail */}
                <div
                  className={`w-0.5 h-2 mb-1 transition-colors ${
                    isSelected ? "bg-primary" : "bg-[#333333] group-hover:bg-[#666666]"
                  }`}
                />
                <span
                  className={`text-[10.5px] font-mono whitespace-nowrap transition-colors ${
                    isSelected ? "text-primary font-semibold" : "text-[#555555] group-hover:text-[#888888]"
                  }`}
                >
                  {pt.day} {pt.time.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

        {/* Selected Info & Action Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#1a1a1a]">
          <div className="flex items-center gap-3 text-[12px] font-mono">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            <span className="text-white">
              <span className="text-primary font-semibold">{current.date} · {current.time}</span> ({current.size})
            </span>
            <span className="text-[#555555]">·</span>
            <span className="text-[#666666]">Snapshot: {current.snapshotId}</span>
          </div>

          <Button
            onClick={() => onSelectPoint(current)}
            size="sm"
            className="h-8 px-3.5 text-[12px] bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-xs shrink-0 self-start sm:self-auto"
          >
            <IconBolt className="size-3.5 mr-1" />
            Restore from this point
          </Button>
        </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Clean, De-noised Recovery Drill Card
───────────────────────────────────────────────────────────────────*/

function DrillCard({
  drill,
  onViewLogs,
  onRerun,
}: {
  drill: RestoreDrill;
  onViewLogs: (d: RestoreDrill) => void;
  onRerun: (d: RestoreDrill) => void;
}) {
  const typeLabel =
    drill.type === "automated_drill"
      ? "Automated DR Drill"
      : drill.type === "staging_clone"
      ? "Staging DB Clone"
      : "Production Restore";

  return (
    <div className="rounded-lg border border-[#1e1e1e] bg-[#111111] p-5 transition-colors hover:border-[#262626]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Type, target, and checks */}
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="size-1.5 rounded-full bg-emerald-400 shrink-0" />
            <h3 className="text-[13.5px] font-medium text-white">{typeLabel}</h3>
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Passed
            </span>
            <span className="text-[11px] text-[#555555] font-mono">
              #{drill.id}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[12px] font-mono text-[#666666]">
            <span>Target: <span className="text-[#aaaaaa]">{drill.targetDb}</span></span>
            <span>·</span>
            <span>{drill.sourceSnapshot}</span>
            <span>·</span>
            <span className="text-emerald-400/90 flex items-center gap-1">
              <IconCheck className="size-3 text-emerald-400" />
              4/4 checks verified
            </span>
          </div>
        </div>

        {/* Right: Timestamp, duration, and actions */}
        <div className="flex items-center gap-4 text-[12px] font-mono text-[#666666] shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-[#888888]">{drill.executedAt}</p>
            <p className="text-[11px] text-[#555555]">Duration: {drill.durationSec}s</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => onViewLogs(drill)}
              variant="outline"
              size="sm"
              className="h-8 px-2.5 border-[#262626] bg-[#141414] text-[#aaaaaa] hover:text-white text-[11.5px]"
            >
              <IconTerminal2 className="size-3.5 mr-1" />
              Logs
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="p-1.5 rounded text-[#555555] hover:text-white hover:bg-[#1a1a1a] transition-colors"
                >
                  <IconDotsVertical className="size-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-40 bg-[#141414] border-[#262626] text-white text-[12px]"
              >
                <DropdownMenuItem
                  onClick={() => onViewLogs(drill)}
                  className="gap-2 text-[#aaaaaa] hover:text-white focus:bg-[#1a1a1a] focus:text-white cursor-pointer"
                >
                  <IconTerminal2 className="size-3.5" />
                  View full logs
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onRerun(drill)}
                  className="gap-2 text-[#aaaaaa] hover:text-white focus:bg-[#1a1a1a] focus:text-white cursor-pointer"
                >
                  <IconRotateClockwise className="size-3.5" />
                  Re-run drill
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Slide-in Wizard Drawer with Realtime Terminal Log Streamer
───────────────────────────────────────────────────────────────────*/

import { triggerDrill, triggerRestore } from "@/app/actions/restore.actions";

function RestoreWizardDrawer({
  open,
  defaultMode,
  defaultPoint,
  onClose,
  projectId,
  onDrillCompleted,
}: {
  open: boolean;
  defaultMode: "drill" | "restore";
  defaultPoint: typeof PITR_POINTS[0] | null;
  onClose: () => void;
  projectId?: string;
  onDrillCompleted?: (drill: any) => void;
}) {
  const [mode, setMode] = useState<"drill" | "restore">(defaultMode);
  const [targetUrl, setTargetUrl] = useState("");
  const [confirmWord, setConfirmWord] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStep, setExecutionStep] = useState(0);
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMode(defaultMode);
    setIsExecuting(false);
    setExecutionStep(0);
    setLiveLogs([]);
    setConfirmWord("");
  }, [open, defaultMode]);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [liveLogs]);

  const canSubmit =
    mode === "drill"
      ? true
      : targetUrl.startsWith("postgres://") && confirmWord === "RESTORE";

  async function startExecution() {
    setIsExecuting(true);
    setExecutionStep(1);
    setLiveLogs([`[${new Date().toISOString()}] Initializing ${mode === "drill" ? "Headless DR Drill Verification" : "Point-in-Time Database Restore"}...`]);

    if (mode === "drill") {
      const res = await triggerDrill(projectId || "proj-1", defaultPoint?.id);
      if (res.success && res.drill) {
        setExecutionStep(5);
        setLiveLogs(res.drill.logs);
        if (onDrillCompleted) {
          onDrillCompleted(res.drill);
        }
      }
    } else {
      const formData = new FormData();
      formData.append("projectId", projectId || "proj-1");
      formData.append("backupFileId", defaultPoint?.id || "bk-001");
      formData.append("targetDatabaseUrl", targetUrl);
      formData.append("confirm", confirmWord);

      const res = await triggerRestore(formData);
      if (res?.error) {
        setLiveLogs((prev) => [...prev, `[ERROR] Restore rejected: ${res.error}`]);
      } else {
        setExecutionStep(5);
        setLiveLogs((prev) => [
          ...prev,
          `[SUCCESS] Restore Job enqueued: ${res.jobId}`,
          `[INFO] Worker has locked target database and begun schema restoration.`,
        ]);
      }
    }
  }

  function handleCopyLogs() {
    navigator.clipboard.writeText(liveLogs.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40" onClick={onClose} />

      <div className="fixed top-0 right-0 h-full w-full max-w-xl bg-[#0d0d0d] border-l border-[#1a1a1a] z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1a1a1a] shrink-0">
          <div>
            <h2 className="text-[15px] font-medium text-white">
              {isExecuting ? "Executing Recovery Process" : mode === "drill" ? "Run Disaster Recovery Drill" : "New Database Restore"}
            </h2>
            <p className="text-[11px] text-[#555555] mt-0.5 font-mono">
              {isExecuting ? "Real-time streaming console logs" : "Configure source snapshot, target environment, and safety verification"}
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
          {isExecuting ? (
            /* ── REALTIME TERMINAL & STEPPER ── */
            <div className="space-y-4">
              {/* Stepper */}
              <div className="p-3.5 rounded-lg border border-[#1e1e1e] bg-[#111111] space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#888888]">
                  <span>Recovery Stepper</span>
                  <span className="text-primary font-semibold">
                    {executionStep === 5 ? "Completed" : `Phase ${executionStep} of 5`}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {["Sandbox", "Download", "pg_restore", "Verify", "Teardown"].map((st, i) => {
                    const isDone = executionStep > i + 1 || (executionStep === 5 && i === 4);
                    const isCurrent = executionStep === i + 1 && executionStep !== 5;
                    return (
                      <div key={st} className="space-y-1">
                        <div
                          className={`h-1.5 rounded-full transition-colors ${
                            isDone ? "bg-emerald-400" : isCurrent ? "bg-primary animate-pulse" : "bg-[#222222]"
                          }`}
                        />
                        <p className="text-[9px] font-mono text-[#555555] text-center truncate">{st}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Terminal View */}
              <div className="rounded-lg border border-[#222222] bg-[#050505] overflow-hidden flex flex-col font-mono text-[11.5px]">
                {/* Terminal Header */}
                <div className="flex items-center justify-between px-4 py-2 bg-[#0d0d0d] border-b border-[#1a1a1a]">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[#888888] text-[11px]">live-stream · stdout</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyLogs}
                    className="flex items-center gap-1 text-[10px] text-[#666666] hover:text-white transition-colors"
                  >
                    {copied ? <IconCheck className="size-3 text-emerald-400" /> : <IconCopy className="size-3" />}
                    <span>{copied ? "Copied" : "Copy Logs"}</span>
                  </button>
                </div>

                {/* Terminal Output */}
                <div className="p-4 space-y-1.5 max-h-[380px] overflow-y-auto leading-relaxed text-[#aaaaaa]">
                  {liveLogs.map((l, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[#444444] select-none">$</span>
                      <span
                        className={
                          l.includes("[SUCCESS]")
                            ? "text-emerald-400 font-semibold"
                            : l.includes("[VERIFY]")
                            ? "text-primary"
                            : l.includes("[SANDBOX]")
                            ? "text-blue-400"
                            : "text-[#aaaaaa]"
                        }
                      >
                        {l}
                      </span>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              </div>
            </div>
          ) : (
            /* ── CONFIGURATION FORM ── */
            <>
              {/* Mode Selector */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono uppercase tracking-widest text-[#555555]">
                  Select Operation Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMode("drill")}
                    className={`p-3.5 rounded-lg border text-left transition-all ${
                      mode === "drill"
                        ? "border-primary bg-primary/10 text-white"
                        : "border-[#1e1e1e] bg-[#111111] text-[#777777] hover:border-[#2a2a2a]"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <IconShieldCheck className={`size-4 ${mode === "drill" ? "text-primary" : "text-[#777777]"}`} />
                      <span className="text-[13px] font-medium text-white">DR Drill (Dry Run)</span>
                    </div>
                    <p className="text-[11px] text-[#666666] leading-tight">
                      Zero risk. Restores to isolated temp sandbox, checks integrity & destroys.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode("restore")}
                    className={`p-3.5 rounded-lg border text-left transition-all ${
                      mode === "restore"
                        ? "border-primary bg-primary/10 text-white"
                        : "border-[#1e1e1e] bg-[#111111] text-[#777777] hover:border-[#2a2a2a]"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <IconDatabase className={`size-4 ${mode === "restore" ? "text-primary" : "text-[#777777]"}`} />
                      <span className="text-[13px] font-medium text-white">Target DB Restore</span>
                    </div>
                    <p className="text-[11px] text-[#666666] leading-tight">
                      Restores snapshot into a live staging or production database instance.
                    </p>
                  </button>
                </div>
              </div>

              {/* Source Snapshot */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono uppercase tracking-widest text-[#555555]">
                  Source Snapshot
                </label>
                <div className="p-3.5 rounded-lg border border-[#1e1e1e] bg-[#111111] flex items-center justify-between">
                  <div className="space-y-0.5 font-mono text-[12px]">
                    <p className="text-white">
                      {defaultPoint ? `${defaultPoint.date} · ${defaultPoint.time}` : "Latest Snapshot (bk-001)"}
                    </p>
                    <p className="text-[11px] text-[#666666]">
                      Size: {defaultPoint ? defaultPoint.size : "142 MB"} · AES-256 Encrypted
                    </p>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    Verified
                  </span>
                </div>
              </div>

              {/* Target DB input */}
              {mode === "restore" && (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 flex items-start gap-2.5">
                    <IconAlertTriangle className="size-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[11.5px] text-[#aaaaaa] leading-relaxed">
                      Restoring will overwrite existing tables in the target database. Type <strong className="text-white">RESTORE</strong> below to confirm.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-widest text-[#555555]">
                      Target Database URL
                    </label>
                    <input
                      type="text"
                      placeholder="postgres://user:pass@host:5432/staging_db"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      className="w-full h-9 px-3 bg-[#111111] border border-[#222222] rounded-lg text-[12.5px] text-white font-mono placeholder-[#444444] focus:outline-none focus:border-[#333333]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-widest text-[#555555]">
                      Type RESTORE to Confirm
                    </label>
                    <input
                      type="text"
                      placeholder="RESTORE"
                      value={confirmWord}
                      onChange={(e) => setConfirmWord(e.target.value)}
                      className="w-32 h-9 px-3 bg-[#111111] border border-[#222222] rounded-lg text-[12.5px] text-white font-mono placeholder-[#444444] focus:outline-none focus:border-[#333333]"
                    />
                  </div>
                </div>
              )}

              {/* Verification Suite checklist */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono uppercase tracking-widest text-[#555555]">
                  Integrity Verification Suite
                </label>
                <div className="p-3.5 rounded-lg border border-[#1e1e1e] bg-[#111111] space-y-2 text-[12px] font-mono text-[#888888]">
                  <div className="flex items-center gap-2">
                    <IconCheck className="size-3.5 text-emerald-400" />
                    <span>Compare Schema Parity & Table Definitions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconCheck className="size-3.5 text-emerald-400" />
                    <span>Validate Row Counts & Sequence Offsets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconCheck className="size-3.5 text-emerald-400" />
                    <span>Run SHA-256 Table Block Checksum Integrity</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-[#1a1a1a] flex gap-3 shrink-0">
          {isExecuting ? (
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 h-9 border-[#222222] bg-transparent text-[#888888] hover:text-white text-[13px]"
            >
              Close & Keep Running in Background
            </Button>
          ) : (
            <>
              <Button
                onClick={startExecution}
                disabled={!canSubmit}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 text-[13px] font-semibold h-9 shadow-xs disabled:opacity-40"
              >
                {mode === "drill" ? (
                  <>
                    <IconShieldCheck className="size-3.5 mr-1.5" />
                    Start DR Drill
                  </>
                ) : (
                  <>
                    <IconBolt className="size-3.5 mr-1.5" />
                    Start Restore
                  </>
                )}
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
   Main Page Client
───────────────────────────────────────────────────────────────────*/

export function RestoresPageClient({
  orgId,
  projectId,
}: {
  orgId: string;
  projectId: string;
}) {
  const [drills, setDrills] = useState<RestoreDrill[]>(MOCK_DRILLS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"drill" | "restore">("drill");
  const [selectedPoint, setSelectedPoint] = useState<typeof PITR_POINTS[0] | null>(null);
  const [search, setSearch] = useState("");
  const [viewingLogsDrill, setViewingLogsDrill] = useState<RestoreDrill | null>(null);

  function handleOpenDrill() {
    setDrawerMode("drill");
    setSelectedPoint(null);
    setDrawerOpen(true);
  }

  function handleOpenRestore() {
    setDrawerMode("restore");
    setSelectedPoint(null);
    setDrawerOpen(true);
  }

  function handleSelectPoint(point: typeof PITR_POINTS[0]) {
    setSelectedPoint(point);
    setDrawerMode("restore");
    setDrawerOpen(true);
  }

  function handleRerun(d: RestoreDrill) {
    setDrawerMode(d.type === "automated_drill" ? "drill" : "restore");
    setDrawerOpen(true);
  }

  const filteredDrills = drills.filter((d) =>
    d.targetDb.toLowerCase().includes(search.toLowerCase()) ||
    d.sourceSnapshot.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 sm:space-y-10 pb-24 sm:pb-16">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-semibold sm:font-normal tracking-tight text-white">
            Restores
          </h1>
          <p className="text-xs sm:text-[13px] text-[#777777] mt-1 font-mono">
            Automated recovery drills & point-in-time database restores
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <Button
            onClick={handleOpenDrill}
            variant="outline"
            className="flex-1 sm:flex-none h-9 px-3.5 border-[#262626] bg-[#111111] text-white hover:bg-[#1a1a1a] text-xs font-medium"
          >
            <IconShieldCheck className="size-3.5 mr-1.5 text-emerald-400" />
            Run DR Drill
          </Button>
          <Button
            onClick={handleOpenRestore}
            className="flex-1 sm:flex-none h-9 px-3.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs"
          >
            <IconBolt className="size-3.5 mr-1.5" />
            New Restore
          </Button>
        </div>
      </div>

      {/* ── 4 Stat Cards (Standard Card 1) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={IconClock}
          label="Recovery Point (RPO)"
          value="2h 14m"
          sub="Max data loss based on last snapshot"
          accent="text-amber-400"
        />
        <StatCard
          icon={IconBolt}
          label="Estimated RTO"
          value="1m 08s"
          sub="Calculated recovery spin-up duration"
          accent="text-indigo-400"
        />
        <StatCard
          icon={IconShieldCheck}
          label="Last Verified Drill"
          value="Today, 04:00"
          sub="Passed with 0 schema drift"
          accent="text-emerald-400"
        />
        <StatCard
          icon={IconRefresh}
          label="DR Readiness Score"
          value="100%"
          sub="14 of 14 drills passed"
          accent="text-emerald-400"
        />
      </div>

      {/* ── PITR Timeline Scrubber (Clean & Quiet) ── */}
      <PitrScrubber onSelectPoint={handleSelectPoint} />

      {/* ── Recent Recovery Events ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[14px] font-medium text-white">Recent Recovery Drills & Restores</h2>

          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[#555555]" />
            <input
              type="text"
              placeholder="Search drills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8.5 pr-3 w-52 bg-[#111111] border border-[#222222] rounded-md text-[12px] text-white placeholder-[#555555] focus:outline-none focus:border-[#333333]"
            />
          </div>
        </div>

        {/* Clean Drill Cards */}
        <div className="space-y-3.5">
          {filteredDrills.map((d) => (
            <DrillCard
              key={d.id}
              drill={d}
              onViewLogs={(drill) => setViewingLogsDrill(drill)}
              onRerun={handleRerun}
            />
          ))}
        </div>
      </div>

      {/* ── Slide-in Wizard Drawer ── */}
      <RestoreWizardDrawer
        open={drawerOpen}
        defaultMode={drawerMode}
        defaultPoint={selectedPoint}
        projectId={projectId}
        onDrillCompleted={(drill) => {
          setDrills((prev) => [
            {
              id: drill.id,
              type: "automated_drill",
              executedAt: "Just now",
              targetDb: "Headless Sandbox (In-Memory)",
              sourceSnapshot: drill.sourceSnapshot,
              sourceTimestamp: "Just now",
              sizeMb: 142,
              status: "passed",
              durationSec: drill.durationSec,
              initiatedBy: "Disaster Recovery Engine",
              integrityChecks: [
                { name: "Checksum SHA-256", passed: true },
                { name: "KMS Decryption", passed: true },
                { name: "Archive TOC", passed: true },
                { name: "Schema Validity", passed: true },
              ],
              logs: drill.logs,
            },
            ...prev,
          ]);
        }}
        onClose={() => setDrawerOpen(false)}
      />

      {/* ── Historical Logs Drawer ── */}
      {viewingLogsDrill && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40" onClick={() => setViewingLogsDrill(null)} />
          <div className="fixed top-0 right-0 h-full w-full max-w-xl bg-[#0d0d0d] border-l border-[#1a1a1a] z-50 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#1a1a1a]">
              <div>
                <h3 className="text-[14px] font-medium text-white">
                  Logs for Drill #{viewingLogsDrill.id.replace("drill-", "")}
                </h3>
                <p className="text-[11px] text-[#666666] font-mono">
                  {viewingLogsDrill.executedAt} · Duration: {viewingLogsDrill.durationSec}s
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingLogsDrill(null)}
                className="p-1.5 rounded-md text-[#555555] hover:text-white"
              >
                <IconX className="size-4" />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              <div className="p-4 rounded-lg border border-[#222222] bg-[#050505] font-mono text-[11.5px] space-y-1.5 leading-relaxed text-[#aaaaaa]">
                {viewingLogsDrill.logs.map((l, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-[#444444] select-none">$</span>
                    <span className={l.includes("[SUCCESS]") ? "text-emerald-400 font-semibold" : l.includes("[VERIFY]") ? "text-primary" : "text-[#aaaaaa]"}>
                      {l}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
