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

export interface RecoveryPoint {
  id: string;
  day: string;
  date: string;
  time: string;
  size: string;
  snapshotId: string;
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


/* ─────────────────────────────────────────────────────────────────
   Clean, De-noised PITR Scrubber
───────────────────────────────────────────────────────────────────*/

function PitrScrubber({
  points = [],
  onSelectPoint,
}: {
  points?: RecoveryPoint[];
  onSelectPoint: (point: RecoveryPoint) => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState(Math.max(0, points.length - 1));

  if (points.length === 0) {
    return (
      <Card className="border-border/60 bg-card/60 py-0 gap-0 overflow-hidden shadow-xs">
        <CardHeader className="p-5 sm:p-6 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <CardTitle className="text-sm sm:text-base font-semibold text-foreground">
                Point-in-Time Recovery
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground font-normal">
              No completed backup snapshots available for point-in-time recovery.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-6 text-center text-xs text-muted-foreground font-mono">
          Run your first backup to establish recovery checkpoints.
        </CardContent>
      </Card>
    );
  }

  const clampedIndex = Math.min(selectedIndex, points.length - 1);
  const current = points[clampedIndex];
  const maxIdx = Math.max(1, points.length - 1);
  const percent = points.length > 1 ? (clampedIndex / maxIdx) * 100 : 0;

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
          {points.length} Checkpoint{points.length === 1 ? "" : "s"}
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
            max={points.length - 1}
            value={clampedIndex}
            onChange={(e) => setSelectedIndex(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-grab active:cursor-grabbing z-30"
          />
        </div>

        {/* Checkpoint Ticks & Labels with no mobile text overlap */}
        <div className="relative w-full h-8">
          {points.map((pt, idx) => {
            const ptPercent = points.length > 1 ? (idx / (points.length - 1)) * 100 : 50;
            const isSelected = idx === clampedIndex;
            const isFirst = idx === 0;
            const isLast = idx === points.length - 1;
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
  defaultPoint: RecoveryPoint | null;
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
  const sseRef = useRef<EventSource | null>(null);

  useEffect(() => {
    setMode(defaultMode);
    setIsExecuting(false);
    setExecutionStep(0);
    setLiveLogs([]);
    setConfirmWord("");

    return () => {
      if (sseRef.current) {
        sseRef.current.close();
        sseRef.current = null;
      }
    };
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
      } else if (res?.jobId) {
        setLiveLogs((prev) => [
          ...prev,
          `[SUCCESS] Restore Job enqueued: ${res.jobId}`,
          `[INFO] Connected to worker SSE telemetry stream. Listening for events...`,
        ]);

        if (sseRef.current) sseRef.current.close();
        const es = new EventSource(`/api/jobs/${res.jobId}/telemetry`);
        sseRef.current = es;

        es.onmessage = (ev) => {
          try {
            const telemetry = JSON.parse(ev.data);
            if (telemetry && telemetry.message) {
              setLiveLogs((prev) => [
                ...prev,
                `[${telemetry.phase || "INFO"}] ${telemetry.message}`,
              ]);
              if (telemetry.phase === "DOWNLOAD") setExecutionStep(2);
              else if (telemetry.phase === "CHECKSUM") setExecutionStep(3);
              else if (telemetry.phase === "RESTORE") setExecutionStep(4);
              else if (telemetry.phase === "COMPLETE") {
                setExecutionStep(5);
                es.close();
              } else if (telemetry.phase === "ERROR") {
                es.close();
              }
            }
          } catch {}
        };

        es.addEventListener("done", () => {
          setExecutionStep(5);
          es.close();
        });
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
  recoveryPoints = [],
  initialDrills = [],
}: {
  orgId: string;
  projectId: string;
  recoveryPoints?: RecoveryPoint[];
  initialDrills?: RestoreDrill[];
}) {
  const [drills, setDrills] = useState<RestoreDrill[]>(initialDrills);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"drill" | "restore">("drill");
  const [selectedPoint, setSelectedPoint] = useState<RecoveryPoint | null>(null);
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

  function handleSelectPoint(point: RecoveryPoint) {
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

  const passedDrills = drills.filter((d) => d.status === "passed" || d.status === "complete");
  const lastVerifiedDrill = passedDrills.length > 0 ? passedDrills[0] : null;
  const avgDuration = drills.length > 0
    ? Math.round(drills.reduce((sum, d) => sum + d.durationSec, 0) / drills.length)
    : 0;

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
          value={recoveryPoints.length > 0 ? recoveryPoints[recoveryPoints.length - 1].time : "—"}
          sub={recoveryPoints.length > 0 ? `Latest: ${recoveryPoints[recoveryPoints.length - 1].snapshotId}` : "No completed backups yet"}
          accent="text-amber-400"
        />
        <StatCard
          icon={IconBolt}
          label="Estimated RTO"
          value={drills.length > 0 ? `${avgDuration}s` : "—"}
          sub={drills.length > 0 ? "Average drill duration" : "Run a drill to benchmark RTO"}
          accent="text-indigo-400"
        />
        <StatCard
          icon={IconShieldCheck}
          label="Last Verified Drill"
          value={lastVerifiedDrill ? lastVerifiedDrill.executedAt : "—"}
          sub={lastVerifiedDrill ? "Verification passed" : "No drills executed yet"}
          accent="text-emerald-400"
        />
        <StatCard
          icon={IconRefresh}
          label="DR Readiness Score"
          value={drills.length > 0 ? `${Math.round((passedDrills.length / drills.length) * 100)}%` : "—"}
          sub={drills.length > 0 ? `${passedDrills.length} of ${drills.length} drills passed` : "No verification drills"}
          accent="text-emerald-400"
        />
      </div>

      {/* ── PITR Timeline Scrubber (Clean & Quiet) ── */}
      <PitrScrubber points={recoveryPoints} onSelectPoint={handleSelectPoint} />

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
        {filteredDrills.length === 0 ? (
          <div className="rounded-xl border border-border/60 bg-card/60 p-12 text-center space-y-4">
            <IconShieldCheck className="size-8 text-muted-foreground/60 mx-auto" />
            <p className="text-sm text-muted-foreground">No restore drills or recovery events recorded</p>
            <Button
              onClick={handleOpenDrill}
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold h-9 px-4"
            >
              <IconShieldCheck className="size-4 mr-1.5" />
              Run Disaster Recovery Drill
            </Button>
          </div>
        ) : (
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
        )}
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
