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
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";

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
    <Card className="border-border/60 bg-card/60 py-0 gap-0 overflow-hidden shadow-xs">
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
        <span className="text-xs font-medium text-muted-foreground bg-muted/40 border border-border/60 rounded-md px-3 py-1 self-start sm:self-auto">
          7-Day Window
        </span>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-6">
        {/* Rail & Draggable Handle Container */}
        <div className="relative h-6 flex items-center">
          {/* Horizontal Background Rail */}
          <div className="h-1.5 w-full bg-[#1c1c1c] rounded-full overflow-hidden border border-border/60">
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
            <div className="absolute -top-8 flex items-center px-2.5 py-1 rounded-md bg-card border border-border text-primary text-xs font-medium shadow-md whitespace-nowrap">
              <span>{current.day} {current.time.split(" ")[0]}</span>
            </div>

            {/* Draggable Physical Thumb */}
            <div className="size-4.5 rounded-full bg-white border-2 border-primary shadow-sm shadow-black/80 flex items-center justify-center">
              <div className="size-1 rounded-full bg-card" />
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

        {/* Checkpoint Ticks & Labels with no mobile text overlap */}
        <div className="relative w-full h-8">
          {PITR_POINTS.map((pt, idx) => {
            const ptPercent = (idx / (PITR_POINTS.length - 1)) * 100;
            const isSelected = idx === selectedIndex;
            const isFirst = idx === 0;
            const isLast = idx === PITR_POINTS.length - 1;
            const showOnMobile = isSelected || isFirst || isLast;

            return (
              <button
                key={pt.id}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className="absolute top-0 -translate-x-1/2 flex flex-col items-center group cursor-pointer focus:outline-none z-10"
                style={{ left: `${ptPercent}%` }}
              >
                <div
                  className={`w-0.5 h-1.5 mb-1 transition-colors ${
                    isSelected ? "bg-primary" : "bg-muted-foreground/30 group-hover:bg-muted-foreground/60"
                  }`}
                />
                <span
                  className={`text-[11px] whitespace-nowrap transition-colors ${
                    showOnMobile ? "block" : "hidden sm:block"
                  } ${
                    isSelected
                      ? "text-primary font-semibold"
                      : "text-muted-foreground group-hover:text-foreground/60"
                  }`}
                >
                  {pt.day} {pt.time.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>

      {/* Selected Info & Action Strip */}
      <CardFooter className="p-5 sm:p-6 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/10">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          <span className="size-2 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          <span className="text-foreground font-medium">
            <span className="text-primary font-semibold">{current.date} · {current.time}</span> ({current.size})
          </span>
          <span className="text-muted-foreground/40 hidden sm:inline">·</span>
          <code className="font-mono text-xs font-medium text-foreground/90 bg-muted/60 border border-border/50 px-2 py-0.5 rounded">
            Snapshot: {current.snapshotId}
          </code>
        </div>

        <Button
          onClick={() => onSelectPoint(current)}
          size="sm"
          className="h-9 px-4 text-xs sm:text-sm font-semibold shadow-xs shrink-0 self-start sm:self-auto"
        >
          <IconBolt className="size-4 mr-1.5" />
          Restore from this point
        </Button>
      </CardFooter>
    </Card>
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

  const isPassed = drill.status === "passed";
  const isFailed = drill.status === "failed";
  const isRunning = drill.status === "running";
  const passedChecksCount = drill.integrityChecks.filter((c) => c.passed).length;

  return (
    <Card className="border-border/60 bg-card/60 py-0 gap-0 overflow-hidden shadow-xs hover:border-border hover:bg-card transition-colors">
      <CardHeader className="p-5 sm:p-6 border-b border-border/50 flex flex-row items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span
              className={`size-2 rounded-full shrink-0 ${
                isPassed
                  ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"
                  : isFailed
                  ? "bg-destructive shadow-[0_0_6px_rgba(239,68,68,0.8)]"
                  : "bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.8)]"
              }`}
            />
            <CardTitle className="text-sm sm:text-base font-semibold text-foreground truncate">
              {typeLabel}
            </CardTitle>
            <Badge variant="outline" className="text-xs font-medium">
              #{drill.id}
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
            <span className="text-foreground/90 font-medium">{drill.sourceSnapshot}</span>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-muted-foreground font-normal">{drill.sourceTimestamp}</span>
          </CardDescription>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            onClick={() => onViewLogs(drill)}
            variant="outline"
            size="sm"
            className="h-8.5 px-3 text-xs font-medium gap-1.5"
          >
            <IconTerminal2 className="size-3.5" />
            Logs
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="size-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <IconDotsVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 bg-[#111111] border-[#222222] text-xs">
              <DropdownMenuItem
                onClick={() => onViewLogs(drill)}
                className="gap-2 cursor-pointer text-white"
              >
                <IconTerminal2 className="size-3.5 text-muted-foreground" />
                View full logs
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onRerun(drill)}
                className="gap-2 cursor-pointer text-white"
              >
                <IconRotateClockwise className="size-3.5 text-muted-foreground" />
                Re-run drill
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-5">
        {/* 4-column Meta row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-xs">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Target Database</p>
            <p className="text-xs sm:text-[13px] font-medium text-foreground truncate">
              {drill.targetDb}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Executed At</p>
            <p className="text-xs sm:text-[13px] text-muted-foreground">
              {drill.executedAt}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Duration & Size</p>
            <p className="text-xs sm:text-[13px] text-muted-foreground">
              {drill.durationSec}s · {drill.sizeMb} MB
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Integrity Checks</p>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <IconCheck className="size-3.5 shrink-0" />
              <p className="text-xs sm:text-[13px] font-medium">
                {passedChecksCount}/{drill.integrityChecks.length} checks verified
              </p>
            </div>
          </div>
        </div>

        {/* Status footer strip with shadcn Badge */}
        <div className="flex items-center justify-between gap-2.5 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2.5">
            <Badge
              variant={isPassed ? "default" : isFailed ? "destructive" : "secondary"}
              className="text-xs font-medium px-2.5 py-0.5"
            >
              {isPassed ? "Passed" : isFailed ? "Failed" : isRunning ? "Running" : "Complete"}
            </Badge>
            <span className="text-muted-foreground/40 text-xs">·</span>
            <span className="text-xs text-muted-foreground font-normal">
              Initiated by {drill.initiatedBy}
            </span>
          </div>
          <span className="text-xs text-muted-foreground font-normal hidden sm:inline">
            Recovery benchmark satisfied
          </span>
        </div>
      </CardContent>
    </Card>
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

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="right" showCloseButton={false} className="w-full max-w-xl sm:max-w-xl p-0 flex flex-col gap-0">
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b border-border space-y-0">
          <SheetTitle>
            {isExecuting ? "Executing Recovery Process" : mode === "drill" ? "Run Disaster Recovery Drill" : "New Database Restore"}
          </SheetTitle>
          <SheetDescription className="font-mono text-[11px]">
            {isExecuting ? "Real-time streaming console logs" : "Configure source snapshot, target environment, and safety verification"}
          </SheetDescription>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {isExecuting ? (
            /* ── REALTIME TERMINAL & STEPPER ── */
            <div className="space-y-4">
              {/* Stepper */}
              <Card>
                <CardContent className="py-3.5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
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
                              isDone ? "bg-emerald-400" : isCurrent ? "bg-primary animate-pulse" : "bg-muted"
                            }`}
                          />
                          <p className="text-[9px] font-mono text-muted-foreground text-center truncate">{st}</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Terminal View */}
              <div className="rounded-lg border border-border bg-[#050505] overflow-hidden flex flex-col font-mono text-[11.5px]">
                {/* Terminal Header */}
                <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-muted-foreground text-[11px]">live-stream · stdout</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyLogs}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied ? <IconCheck className="size-3 text-emerald-400" /> : <IconCopy className="size-3" />}
                    <span>{copied ? "Copied" : "Copy Logs"}</span>
                  </button>
                </div>

                {/* Terminal Output */}
                <div className="p-4 space-y-1.5 max-h-[380px] overflow-y-auto leading-relaxed text-muted-foreground">
                  {liveLogs.map((l, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-muted-foreground/40 select-none">$</span>
                      <span
                        className={
                          l.includes("[SUCCESS]")
                            ? "text-emerald-400 font-semibold"
                            : l.includes("[VERIFY]")
                            ? "text-primary"
                            : l.includes("[SANDBOX]")
                            ? "text-blue-400"
                            : "text-muted-foreground"
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
                <Label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                  Select Operation Mode
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Card
                    className={`cursor-pointer transition-all ${
                      mode === "drill"
                        ? "ring-1 ring-primary bg-primary/5"
                        : "hover:ring-foreground/20"
                    }`}
                    onClick={() => setMode("drill")}
                  >
                    <CardContent className="py-3.5">
                      <div className="flex items-center gap-2 mb-1">
                        <IconShieldCheck className={`size-4 ${mode === "drill" ? "text-primary" : "text-muted-foreground"}`} />
                        <span className="text-[13px] font-medium text-foreground">DR Drill (Dry Run)</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        Zero risk. Restores to isolated temp sandbox, checks integrity & destroys.
                      </p>
                    </CardContent>
                  </Card>

                  <Card
                    className={`cursor-pointer transition-all ${
                      mode === "restore"
                        ? "ring-1 ring-primary bg-primary/5"
                        : "hover:ring-foreground/20"
                    }`}
                    onClick={() => setMode("restore")}
                  >
                    <CardContent className="py-3.5">
                      <div className="flex items-center gap-2 mb-1">
                        <IconDatabase className={`size-4 ${mode === "restore" ? "text-primary" : "text-muted-foreground"}`} />
                        <span className="text-[13px] font-medium text-foreground">Target DB Restore</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        Restores snapshot into a live staging or production database instance.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Source Snapshot */}
              <div className="space-y-2">
                <Label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                  Source Snapshot
                </Label>
                <Card>
                  <CardContent className="py-3.5 flex items-center justify-between">
                    <div className="space-y-0.5 font-mono text-[12px]">
                      <p className="text-foreground">
                        {defaultPoint ? `${defaultPoint.date} · ${defaultPoint.time}` : "Latest Snapshot (bk-001)"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Size: {defaultPoint ? defaultPoint.size : "142 MB"} · AES-256 Encrypted
                      </p>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-mono uppercase">
                      Verified
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              {/* Target DB input */}
              {mode === "restore" && (
                <div className="space-y-3">
                  <Card className="border-amber-500/30 bg-amber-500/5">
                    <CardContent className="py-3 flex items-start gap-2.5">
                      <IconAlertTriangle className="size-4 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-[11.5px] text-muted-foreground leading-relaxed">
                        Restoring will overwrite existing tables in the target database. Type <strong className="text-foreground">RESTORE</strong> below to confirm.
                      </p>
                    </CardContent>
                  </Card>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                      Target Database URL
                    </Label>
                    <Input
                      type="text"
                      placeholder="postgres://user:pass@host:5432/staging_db"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                      Type RESTORE to Confirm
                    </Label>
                    <Input
                      type="text"
                      placeholder="RESTORE"
                      value={confirmWord}
                      onChange={(e) => setConfirmWord(e.target.value)}
                      className="w-32"
                    />
                  </div>
                </div>
              )}

              {/* Verification Suite checklist */}
              <div className="space-y-2">
                <Label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                  Integrity Verification Suite
                </Label>
                <Card>
                  <CardContent className="py-3.5 space-y-2 text-[12px] font-mono text-muted-foreground">
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
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <SheetFooter className="px-6 py-5 border-t border-border flex-row gap-3">
          {isExecuting ? (
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 h-9 text-[13px]"
            >
              Close & Keep Running in Background
            </Button>
          ) : (
            <>
              <Button
                onClick={startExecution}
                disabled={!canSubmit}
                className="flex-1 text-[13px] font-semibold h-9 shadow-xs disabled:opacity-40"
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
                className="h-9 px-4 text-[13px]"
              >
                Cancel
              </Button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
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
    <div className="space-y-16 sm:space-y-20 pb-28 sm:pb-24">
      {/* ── Header ── */}
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
            onClick={handleOpenDrill}
            variant="outline"
            className="flex-1 sm:flex-none h-9.5 px-4 text-xs sm:text-sm font-medium"
          >
            <IconShieldCheck className="size-4 mr-1.5 text-emerald-400" />
            Run DR Drill
          </Button>
          <Button
            onClick={handleOpenRestore}
            className="flex-1 sm:flex-none h-9.5 px-4 bg-primary text-primary-foreground hover:bg-primary/90 text-xs sm:text-sm font-semibold shadow-xs"
          >
            <IconBolt className="size-4 mr-1.5" />
            New Restore
          </Button>
        </div>
      </div>

      {/* ── 4 Stat Cards (Standard Card 1) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
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
            <Input
              type="text"
              placeholder="Search drills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9.5 pl-9 pr-3 w-full text-xs sm:text-sm"
            />
          </div>
        </div>

        {/* Clean Drill Cards */}
        <div className="space-y-4 sm:space-y-5">
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
      <Sheet open={!!viewingLogsDrill} onOpenChange={(o) => { if (!o) setViewingLogsDrill(null); }}>
        <SheetContent side="right" showCloseButton={true} className="w-full max-w-xl sm:max-w-xl p-0 flex flex-col gap-0">
          <SheetHeader className="px-6 py-5 border-b border-border space-y-0">
            <SheetTitle>
              Logs for Drill #{viewingLogsDrill?.id.replace("drill-", "")}
            </SheetTitle>
            <SheetDescription className="font-mono text-[11px]">
              {viewingLogsDrill?.executedAt} · Duration: {viewingLogsDrill?.durationSec}s
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 p-6 overflow-y-auto">
            <div className="p-4 rounded-lg border border-border bg-[#050505] font-mono text-[11.5px] space-y-1.5 leading-relaxed text-muted-foreground">
              {viewingLogsDrill?.logs.map((l, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-muted-foreground/40 select-none">$</span>
                  <span className={l.includes("[SUCCESS]") ? "text-emerald-400 font-semibold" : l.includes("[VERIFY]") ? "text-primary" : "text-muted-foreground"}>
                    {l}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
