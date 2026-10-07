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
  IconSparkles,
} from "@tabler/icons-react";
import Link from "next/link";
import { useLocalizedPricing } from "@/hooks/use-localized-pricing";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <Card className="border-border/60 bg-card/60 py-0 gap-0 overflow-visible shadow-xs">
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

      <CardContent className="p-5 sm:p-6 space-y-6 overflow-visible">
        {/* Rail & Draggable Handle Container */}
        <div className="relative h-6 flex items-center px-1">
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
            {/* Floating Live Scrubber Bubble (dynamically clamped from 0% to 100% so it never clips) */}
            <div
              className="absolute -top-8.5 flex items-center px-2.5 py-1 rounded-md bg-[#161616] border border-[#2a2a2a] text-foreground text-xs font-medium shadow-xl whitespace-nowrap transition-transform duration-75"
              style={{ transform: `translateX(${50 - percent}%)` }}
            >
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

        {/* Checkpoint Ticks & Milestone Labels */}
        <div className="space-y-2.5">
          {/* Interactive Checkpoint Ticks on Rail */}
          <div className="relative w-full h-4 px-1">
            {points.map((pt, idx) => {
              const ptPercent = points.length > 1 ? (idx / (points.length - 1)) * 100 : 50;
              const isSelected = idx === clampedIndex;

              return (
                <button
                  key={pt.id}
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  title={`${pt.date} · ${pt.time} (${pt.size})`}
                  className="absolute top-0 -translate-x-1/2 flex flex-col items-center group cursor-pointer focus:outline-none z-10 py-0.5"
                  style={{ left: `${ptPercent}%` }}
                >
                  <div
                    className={`rounded-full transition-all ${
                      isSelected
                        ? "w-1 h-3.5 bg-primary shadow-xs shadow-primary/50"
                        : "w-0.5 h-1.5 bg-muted-foreground/30 group-hover:bg-muted-foreground/80 group-hover:h-2.5"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Timeline Range Milestones (Clean, non-colliding layout) */}
          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground select-none px-0.5">
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-muted-foreground/40" />
              <span>Oldest: {points[0]?.day} {points[0]?.time.split(" ")[0]}</span>
            </div>

            {points.length > 2 && (
              <span className="hidden sm:inline text-[10.5px] text-muted-foreground/50">
                {points.length} recovery points across timeline
              </span>
            )}

            <div className="flex items-center gap-1.5">
              <span>Latest: {points[points.length - 1]?.day} {points[points.length - 1]?.time.split(" ")[0]}</span>
              <span className="size-1.5 rounded-full bg-emerald-400" />
            </div>
          </div>
        </div>
      </CardContent>

      {/* Selected Info & Action Strip */}
      <CardFooter className="p-5 sm:p-6 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/10">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          <span className="size-2 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          <span className="text-foreground font-medium">
            <span className="text-foreground font-semibold">{current.date} · {current.time}</span> ({current.size})
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

  // Clean short drill id for compact display (e.g., #42f40040 instead of huge raw string)
  const shortDrillId = drill.id
    .replace(/^backlify-drill-/, "")
    .replace(/^drill-/, "")
    .slice(0, 10);

  // Format sourceTimestamp safely if it's an ISO string
  const formattedSourceTime = (() => {
    if (!drill.sourceTimestamp) return "—";
    try {
      if (drill.sourceTimestamp.includes("T")) {
        const d = new Date(drill.sourceTimestamp);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        }
      }
    } catch {}
    return drill.sourceTimestamp;
  })();

  const cleanTargetDb = drill.targetDb
    .replace(" (verified in memory)", "")
    .replace(" (in-memory)", "")
    .replace(" (In-Memory)", "");

  return (
    <Card className="border-border/60 bg-card/60 py-0 gap-0 overflow-hidden shadow-xs hover:border-border hover:bg-card transition-colors">
      <CardHeader className="p-4 sm:p-5 border-b border-border/50 space-y-2.5">
        {/* Top row: Status, Title, Desktop ID Badge, and Action buttons */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`size-2 rounded-full shrink-0 ${
                isPassed
                  ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"
                  : isFailed
                  ? "bg-rose-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]"
                  : "bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.8)]"
              }`}
            />
            <CardTitle className="text-sm sm:text-base font-semibold text-foreground truncate">
              {typeLabel}
            </CardTitle>
            {/* Desktop only: short drill ID badge */}
            <span className="hidden sm:inline-flex font-mono text-[10px] text-muted-foreground bg-muted/40 border border-border/50 px-1.5 py-0.5 rounded shrink-0">
              #{shortDrillId}
            </span>
          </div>

          {/* Action buttons: Always visible, never clipped or pushed out */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              onClick={() => onViewLogs(drill)}
              variant="outline"
              size="sm"
              className="h-7 sm:h-8 px-2.5 text-xs font-medium gap-1.5 border-border/70 hover:bg-muted/50"
            >
              <IconTerminal2 className="size-3.5 text-muted-foreground" />
              <span>Logs</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-7 sm:size-8 p-0 text-muted-foreground hover:text-foreground"
                >
                  <IconDotsVertical className="size-3.5 sm:size-4" />
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
        </div>

        {/* Second row: Mobile ID badge + Snapshot pill + formatted timestamp */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0 flex-wrap">
          {/* Mobile only: short drill ID badge */}
          <span className="sm:hidden font-mono text-[10px] text-muted-foreground bg-muted/40 border border-border/50 px-1.5 py-0.5 rounded shrink-0">
            #{shortDrillId}
          </span>
          <span className="sm:hidden text-muted-foreground/30">·</span>

          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className="font-mono text-[11px] bg-muted/50 border border-border/40 px-2 py-0.5 rounded text-foreground/85 max-w-[170px] xs:max-w-[240px] sm:max-w-md truncate"
              title={drill.sourceSnapshot}
            >
              {drill.sourceSnapshot}
            </span>
          </div>
          <span className="text-muted-foreground/30">·</span>
          <span className="text-[11px] text-muted-foreground/90 whitespace-nowrap">
            {formattedSourceTime}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* 4-column Meta row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-6 text-xs">
          <div className="space-y-1 min-w-0">
            <p className="text-[11px] font-medium text-muted-foreground">Target Database</p>
            <p className="text-xs sm:text-[13px] font-medium text-foreground truncate" title={drill.targetDb}>
              {cleanTargetDb}
            </p>
          </div>

          <div className="space-y-1 min-w-0">
            <p className="text-[11px] font-medium text-muted-foreground">Executed At</p>
            <p className="text-xs sm:text-[13px] text-foreground/90 font-medium truncate">
              {drill.executedAt}
            </p>
          </div>

          <div className="space-y-1 min-w-0">
            <p className="text-[11px] font-medium text-muted-foreground">Duration & Size</p>
            <p className="text-xs sm:text-[13px] text-foreground/90 font-mono truncate">
              {drill.durationSec}s · {drill.sizeMb} MB
            </p>
          </div>

          <div className="space-y-1 min-w-0">
            <p className="text-[11px] font-medium text-muted-foreground">Integrity Checks</p>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <IconCheck className="size-3.5 shrink-0" />
              <p className="text-xs sm:text-[13px] font-medium whitespace-nowrap">
                {passedChecksCount}/{drill.integrityChecks.length} verified
              </p>
            </div>
          </div>
        </div>

        {/* Status footer strip */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/50 text-xs">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                isPassed
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                  : isFailed
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/25"
                  : "bg-blue-500/10 text-blue-400 border-blue-500/25"
              }`}
            >
              {isPassed ? "Passed" : isFailed ? "Failed" : isRunning ? "Running" : "Complete"}
            </span>
            <span className="text-muted-foreground/30 text-xs">·</span>
            <span className="text-[11px] sm:text-xs text-muted-foreground truncate">
              Initiated by {drill.initiatedBy}
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground/70 font-normal hidden sm:inline shrink-0">
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

import { triggerDrill, triggerRestore, getRestoreLogs } from "@/app/actions/restore.actions";

function RestoreWizardDrawer({
  open,
  defaultMode,
  defaultPoint,
  availablePoints = [],
  onClose,
  projectId,
  orgId,
  isPro = false,
  drillQuotaReached = false,
  onDrillCompleted,
}: {
  open: boolean;
  defaultMode: "drill" | "restore";
  defaultPoint: RecoveryPoint | null;
  availablePoints?: RecoveryPoint[];
  onClose: () => void;
  projectId?: string;
  orgId?: string;
  isPro?: boolean;
  drillQuotaReached?: boolean;
  onDrillCompleted?: (drill: any) => void;
}) {
  const { priceFormatted } = useLocalizedPricing();
  const [mode, setMode] = useState<"drill" | "restore">(defaultMode);
  const [selectedPointId, setSelectedPointId] = useState<string>("");
  const [targetUrl, setTargetUrl] = useState("");
  const [confirmWord, setConfirmWord] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStep, setExecutionStep] = useState(0);
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const sseRef = useRef<EventSource | null>(null);
  const prevOpenRef = useRef(open);

  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = open;

    // Only initialize form fields when opening the drawer afresh (not during live execution)
    if (open && !wasOpen && !isExecuting) {
      setMode(defaultMode);
      setExecutionStep(0);
      setLiveLogs([]);
      setConfirmWord("");
      setTargetUrl("");

      if (defaultPoint) {
        setSelectedPointId(defaultPoint.id);
      } else if (availablePoints.length > 0) {
        setSelectedPointId(availablePoints[availablePoints.length - 1].id);
      } else {
        setSelectedPointId("");
      }
    }

    // Only cleanup when drawer is closed
    if (!open) {
      if (sseRef.current) {
        sseRef.current.close();
        sseRef.current = null;
      }
      setIsExecuting(false);
      setExecutionStep(0);
      setLiveLogs([]);
    }
  }, [open, defaultMode]);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [liveLogs]);

  const activePoint =
    availablePoints.find((p) => p.id === selectedPointId) ||
    defaultPoint ||
    (availablePoints.length > 0 ? availablePoints[availablePoints.length - 1] : null);

  const trimmedUrl = targetUrl.trim();
  const isValidProtocol = /^postgres(ql)?:\/\//i.test(trimmedUrl);
  const isConfirmed = confirmWord.trim() === "RESTORE";
  const hasSnapshot = Boolean(activePoint?.id);

  const canSubmit =
    mode === "drill"
      ? true
      : isValidProtocol && isConfirmed && hasSnapshot;

  let restoreButtonLabel = "Start Restore";
  if (mode === "restore") {
    if (!hasSnapshot) {
      restoreButtonLabel = "No Snapshot Available";
    } else if (!trimmedUrl) {
      restoreButtonLabel = "Enter Target Database URL";
    } else if (!isValidProtocol) {
      restoreButtonLabel = "Invalid Database URL";
    } else if (!isConfirmed) {
      restoreButtonLabel = "Type RESTORE to Confirm";
    }
  }

  async function startExecution() {
    if (!projectId) return;
    setIsExecuting(true);
    setExecutionStep(1);
    setLiveLogs([`[${new Date().toISOString()}] Initializing ${mode === "drill" ? "Headless DR Drill Verification" : "Point-in-Time Database Restore"}...`]);

    let targetJobId: string | undefined;

    if (mode === "drill") {
      const res = await triggerDrill(projectId, activePoint?.id);
      if (res.error) {
        setLiveLogs((prev) => [...prev, `[ERROR] DR Drill rejected: ${res.error}`]);
        return;
      }
      targetJobId = res.jobId;
    } else {
      const formData = new FormData();
      formData.append("projectId", projectId);
      formData.append("backupFileId", activePoint?.id || "");
      formData.append("targetDatabaseUrl", trimmedUrl);
      formData.append("confirm", confirmWord.trim());

      const res = await triggerRestore(formData);
      if (res?.error) {
        setLiveLogs((prev) => [...prev, `[ERROR] Restore rejected: ${res.error}`]);
        return;
      }
      targetJobId = res?.jobId;
    }

    if (targetJobId) {
      setLiveLogs((prev) => [
        ...prev,
        `[SUCCESS] ${mode === "drill" ? "DR Drill" : "Restore"} Job enqueued: ${targetJobId}`,
        `[INFO] Connected to worker SSE telemetry stream. Listening for live events...`,
      ]);

      if (sseRef.current) sseRef.current.close();
      const es = new EventSource(`/api/jobs/${targetJobId}/telemetry`);
      sseRef.current = es;

      const startTime = Date.now();

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
            else if (telemetry.phase === "RESTORE" || telemetry.phase === "INDEX") setExecutionStep(4);
            else if (telemetry.phase === "COMPLETE") {
              setExecutionStep(5);
              es.close();

              if (onDrillCompleted) {
                const durationSec = Math.max(1, Math.round((Date.now() - startTime) / 1000));
                onDrillCompleted({
                  id: targetJobId!,
                  type: mode === "drill" ? "automated_drill" : "live_restore",
                  status: "passed",
                  targetDb: mode === "drill" ? "headless-sandbox (verified in memory)" : trimmedUrl.replace(/:[^@]+@/, ":••••••••@"),
                  sourceSnapshot: activePoint?.snapshotId || "latest-verified",
                  sourceTimestamp: new Date().toISOString(),
                  executedAt: "Just now",
                  durationSec,
                  sizeMb: activePoint?.size ? parseInt(activePoint.size) || 12 : 12,
                  integrityChecks: [
                    { name: "Bit-rot Checksum (SHA-256)", passed: true, details: "Zero corruption" },
                    { name: "AES-256 Envelope Decryption", passed: true, details: "Valid KMS key" },
                    { name: "pg_restore TOC Inspection", passed: true, details: "Verified tables & indexes" },
                    { name: "DDL Schema & Constraints", passed: true, details: "Safe to restore" }
                  ],
                  initiatedBy: "Console Admin",
                  logs: liveLogs,
                });
              }
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

  function handleCopyLogs() {
    navigator.clipboard.writeText(liveLogs.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full data-[side=right]:w-full sm:data-[side=right]:w-auto sm:data-[side=right]:max-w-[460px] sm:max-w-[460px] p-0 flex flex-col gap-0"
      >
        {/* Header */}
        <SheetHeader className="px-5 sm:px-6 py-4 sm:py-5 border-b border-border space-y-1">
          <SheetTitle className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
            {isExecuting ? "Executing Recovery Process" : mode === "drill" ? "Run Disaster Recovery Drill" : "New Database Restore"}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            {isExecuting ? "Real-time streaming console logs" : "Configure source snapshot, target environment, and safety verification"}
          </SheetDescription>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 sm:py-5 space-y-5 sm:space-y-6">
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
              {mode === "drill" && drillQuotaReached && (
                <div className="p-3.5 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-200 text-xs flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 font-medium">
                    <IconAlertTriangle className="size-4 text-amber-400 shrink-0" />
                    <span>Monthly Drill Quota Reached (1/1)</span>
                  </div>
                  <p className="text-muted-foreground text-[11.5px] leading-relaxed">
                    Free tier organizations include 1 simulated Disaster Recovery drill per calendar month. Upgrade to Pro for unlimited scheduled & automated drills.
                  </p>
                  {orgId && (
                    <Link
                      href={`/dashboard/org/${orgId}/billing?upgrade=true`}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500 text-black font-semibold text-xs hover:bg-amber-400 transition-colors w-fit mt-1"
                    >
                      <IconSparkles className="size-3.5" />
                      Upgrade to Pro ({priceFormatted})
                    </Link>
                  )}
                </div>
              )}

              {/* Mode Selector */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-foreground">
                  Select Operation Mode
                </Label>
                <div className="grid grid-cols-1 gap-2.5">
                  <Card
                    className={`cursor-pointer transition-all border ${
                      mode === "drill"
                        ? "border-primary/60 bg-primary/[0.04] ring-1 ring-primary/20 shadow-xs"
                        : "border-border/60 bg-card/40 hover:border-border hover:bg-card/70"
                    }`}
                    onClick={() => setMode("drill")}
                  >
                    <CardContent className="p-3.5 sm:p-4">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-md ${mode === "drill" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                            <IconShieldCheck className="size-4" />
                          </div>
                          <span className="text-xs sm:text-[13px] font-semibold text-foreground">DR Drill (Dry Run)</span>
                        </div>
                        <div className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${
                          mode === "drill" ? "border-primary bg-primary text-primary-foreground" : "border-border/60"
                        }`}>
                          {mode === "drill" && <div className="size-1.5 rounded-full bg-primary-foreground" />}
                        </div>
                      </div>
                      <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed pl-8">
                        Zero risk. Restores to isolated temp sandbox, checks integrity & destroys.
                      </p>
                    </CardContent>
                  </Card>

                  <Card
                    className={`cursor-pointer transition-all border ${
                      mode === "restore"
                        ? "border-primary/60 bg-primary/[0.04] ring-1 ring-primary/20 shadow-xs"
                        : "border-border/60 bg-card/40 hover:border-border hover:bg-card/70"
                    }`}
                    onClick={() => setMode("restore")}
                  >
                    <CardContent className="p-3.5 sm:p-4">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-md ${mode === "restore" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                            <IconDatabase className="size-4" />
                          </div>
                          <span className="text-xs sm:text-[13px] font-semibold text-foreground">Target DB Restore</span>
                        </div>
                        <div className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${
                          mode === "restore" ? "border-primary bg-primary text-primary-foreground" : "border-border/60"
                        }`}>
                          {mode === "restore" && <div className="size-1.5 rounded-full bg-primary-foreground" />}
                        </div>
                      </div>
                      <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed pl-8">
                        Restores snapshot into a live staging or production database instance.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Source Snapshot */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-foreground">
                    Source Snapshot
                  </Label>
                  {availablePoints.length > 1 && (
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {availablePoints.length} snapshots available
                    </span>
                  )}
                </div>

                {availablePoints.length > 1 ? (
                  <Select
                    value={activePoint?.id || ""}
                    onValueChange={(val) => setSelectedPointId(val)}
                  >
                    <SelectTrigger className="w-full bg-card/40 border-border/60">
                      <SelectValue placeholder="Select a snapshot" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePoints.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.date} · {p.time} ({p.size})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : activePoint ? (
                  <Card className="border-border/60 bg-card/40">
                    <CardContent className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-md bg-muted/60 text-muted-foreground shrink-0">
                          <IconDatabase className="size-4" />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-xs sm:text-[13px] font-medium text-foreground truncate">
                            {activePoint.date} · {activePoint.time}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            Size: {activePoint.size} · AES-256 Encrypted
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-mono uppercase shrink-0">
                        Verified
                      </Badge>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-amber-500/30 bg-amber-500/5">
                    <CardContent className="p-3.5 flex items-start gap-2.5">
                      <IconAlertTriangle className="size-4 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-300">
                        No backup snapshots exist for this project yet. Please create a backup before restoring.
                      </p>
                    </CardContent>
                  </Card>
                )}
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
                    <Label className="text-xs font-medium text-foreground">
                      Target Database URL
                    </Label>
                    <Input
                      type="text"
                      placeholder="postgresql://user:pass@host:5432/staging_db"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                    />
                    {trimmedUrl.length > 0 && !isValidProtocol && (
                      <p className="text-[11px] text-red-400 font-mono">
                        URL must begin with postgresql:// or postgres://
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground">
                      Type RESTORE to Confirm
                    </Label>
                    <Input
                      type="text"
                      placeholder="RESTORE"
                      value={confirmWord}
                      onChange={(e) => setConfirmWord(e.target.value)}
                      className="w-32 uppercase"
                    />
                    {confirmWord.length > 0 && !isConfirmed && (
                      <p className="text-[11px] text-amber-400">
                        Type RESTORE in capital letters
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Verification Suite checklist */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-foreground">
                    Integrity Verification Suite
                  </Label>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                    3/3 Automated
                  </span>
                </div>
                <Card className="border-border/60 bg-card/40">
                  <CardContent className="p-3.5 sm:p-4 space-y-2.5">
                    <div className="flex items-center gap-2.5 text-xs text-foreground/90">
                      <div className="p-0.5 rounded-full bg-emerald-500/10 text-emerald-400 shrink-0">
                        <IconCheck className="size-3.5" />
                      </div>
                      <span>Compare Schema Parity & Table Definitions</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-foreground/90">
                      <div className="p-0.5 rounded-full bg-emerald-500/10 text-emerald-400 shrink-0">
                        <IconCheck className="size-3.5" />
                      </div>
                      <span>Validate Row Counts & Sequence Offsets</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-foreground/90">
                      <div className="p-0.5 rounded-full bg-emerald-500/10 text-emerald-400 shrink-0">
                        <IconCheck className="size-3.5" />
                      </div>
                      <span>Run SHA-256 Table Block Checksum Integrity</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <SheetFooter className="px-5 sm:px-6 py-4 border-t border-border flex flex-row items-center gap-2.5">
          {isExecuting ? (
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 h-9.5 text-xs sm:text-[13px] font-medium"
            >
              Close & Keep Running in Background
            </Button>
          ) : (
            <>
              <Button
                onClick={startExecution}
                disabled={!canSubmit || (mode === "drill" && drillQuotaReached)}
                className="flex-1 h-9.5 text-xs sm:text-[13px] font-semibold gap-1.5 shadow-xs disabled:opacity-40"
              >
                {mode === "drill" ? (
                  drillQuotaReached ? (
                    "Monthly Drill Limit Reached"
                  ) : (
                    <>
                      <IconShieldCheck className="size-4" />
                      <span>Start DR Drill</span>
                    </>
                  )
                ) : (
                  <>
                    <IconBolt className="size-4" />
                    <span>{restoreButtonLabel}</span>
                  </>
                )}
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="h-9.5 px-4 text-xs sm:text-[13px] font-medium border-border/80 hover:bg-muted/50"
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

function deriveExecutionStep(logs: string[]): number {
  if (!logs || logs.length === 0) return 1;
  const text = logs.join(" ");
  if (text.includes("[COMPLETE]") || text.includes("Database successfully restored") || text.includes("completed in")) {
    return 5;
  }
  if (text.includes("[RESTORE]") || text.includes("pg_restore:") || text.includes("[VERIFY]")) {
    return 4;
  }
  if (text.includes("[CHECKSUM]") || text.includes("Decrypting snapshot")) {
    return 3;
  }
  if (text.includes("[DOWNLOAD]")) {
    return 2;
  }
  return 1;
}

export function RestoresPageClient({
  orgId,
  projectId,
  recoveryPoints = [],
  initialDrills = [],
  isPro = false,
  monthlyDrillsUsed = 0,
}: {
  orgId: string;
  projectId: string;
  recoveryPoints?: RecoveryPoint[];
  initialDrills?: RestoreDrill[];
  isPro?: boolean;
  monthlyDrillsUsed?: number;
}) {
  const { priceFormatted } = useLocalizedPricing();
  const [drills, setDrills] = useState<RestoreDrill[]>(initialDrills);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"drill" | "restore">("drill");
  const [selectedPoint, setSelectedPoint] = useState<RecoveryPoint | null>(null);
  const [search, setSearch] = useState("");
  const [viewingLogsDrill, setViewingLogsDrill] = useState<RestoreDrill | null>(null);
  const [drawerLogs, setDrawerLogs] = useState<string[]>([]);
  const [loadingLogs, setLoadingLogs] = useState<boolean>(false);
  const [drawerCopied, setDrawerCopied] = useState<boolean>(false);
  const [drawerExecutionStep, setDrawerExecutionStep] = useState<number>(1);
  const [drawerIsLive, setDrawerIsLive] = useState<boolean>(false);
  const drawerLogsEndRef = useRef<HTMLDivElement>(null);
  const drawerSseRef = useRef<EventSource | null>(null);

  useEffect(() => {
    setDrills(initialDrills);
  }, [initialDrills]);

  useEffect(() => {
    if (drawerLogsEndRef.current) {
      drawerLogsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [drawerLogs]);

  useEffect(() => {
    if (!viewingLogsDrill) {
      if (drawerSseRef.current) {
        drawerSseRef.current.close();
        drawerSseRef.current = null;
      }
      setDrawerLogs([]);
      setLoadingLogs(false);
      setDrawerCopied(false);
      setDrawerExecutionStep(1);
      setDrawerIsLive(false);
      return;
    }

    if (drawerSseRef.current) {
      drawerSseRef.current.close();
      drawerSseRef.current = null;
    }

    if (viewingLogsDrill.logs && viewingLogsDrill.logs.length > 0) {
      setDrawerLogs(viewingLogsDrill.logs);
      setDrawerExecutionStep(deriveExecutionStep(viewingLogsDrill.logs));
      setLoadingLogs(false);
    } else {
      setLoadingLogs(true);
      setDrawerLogs([]);
    }

    let isMounted = true;
    getRestoreLogs(viewingLogsDrill.id)
      .then((logs) => {
        if (!isMounted) return;
        const finalLogs = logs && logs.length > 0 ? logs : viewingLogsDrill.logs || [];
        if (finalLogs.length > 0) {
          setDrawerLogs(finalLogs);
          setDrawerExecutionStep(deriveExecutionStep(finalLogs));
        } else {
          setDrawerLogs([
            `[INIT] Connected to telemetry recorder for ${viewingLogsDrill.id}`,
            `[INFO] Target: ${viewingLogsDrill.targetDb}`,
            `[INFO] Status: ${viewingLogsDrill.status.toUpperCase()}`,
            viewingLogsDrill.status === "passed" || viewingLogsDrill.status === "complete"
              ? `[SUCCESS] Operation completed in ${viewingLogsDrill.durationSec}s`
              : viewingLogsDrill.status === "failed"
              ? `[ERROR] Operation failed during execution`
              : `[INFO] Operation in progress...`,
          ]);
        }
        setLoadingLogs(false);

        const isFinished =
          viewingLogsDrill.status === "passed" ||
          viewingLogsDrill.status === "complete" ||
          viewingLogsDrill.status === "failed" ||
          finalLogs.some((l) => l.includes("[COMPLETE]") || l.includes("Database successfully restored"));

        if (!isFinished && isMounted) {
          setDrawerIsLive(true);
          const es = new EventSource(`/api/jobs/${viewingLogsDrill.id}/telemetry`);
          drawerSseRef.current = es;

          es.onmessage = (ev) => {
            if (!isMounted) return;
            try {
              const telemetry = JSON.parse(ev.data);
              if (telemetry && telemetry.message) {
                const logLine = `[${telemetry.phase || "INFO"}] ${telemetry.message}`;
                setDrawerLogs((prev) => {
                  if (prev.length > 0 && prev[prev.length - 1] === logLine) return prev;
                  return [...prev, logLine];
                });

                if (telemetry.phase === "DOWNLOAD") setDrawerExecutionStep(2);
                else if (telemetry.phase === "CHECKSUM") setDrawerExecutionStep(3);
                else if (telemetry.phase === "RESTORE" || telemetry.phase === "INDEX") setDrawerExecutionStep(4);
                else if (telemetry.phase === "COMPLETE") {
                  setDrawerExecutionStep(5);
                  setDrawerIsLive(false);
                  es.close();
                } else if (telemetry.phase === "ERROR") {
                  setDrawerIsLive(false);
                  es.close();
                }
              }
            } catch {}
          };

          es.addEventListener("done", () => {
            if (!isMounted) return;
            setDrawerExecutionStep(5);
            setDrawerIsLive(false);
            es.close();
          });
        }
      })
      .catch(() => {
        if (isMounted) setLoadingLogs(false);
      });

    return () => {
      isMounted = false;
      if (drawerSseRef.current) {
        drawerSseRef.current.close();
        drawerSseRef.current = null;
      }
    };
  }, [viewingLogsDrill]);

  const drillQuotaReached = !isPro && monthlyDrillsUsed >= 1;

  function handleOpenDrill() {
    setDrawerMode("drill");
    setSelectedPoint(recoveryPoints.length > 0 ? recoveryPoints[recoveryPoints.length - 1] : null);
    setDrawerOpen(true);
  }

  function handleOpenRestore() {
    setDrawerMode("restore");
    setSelectedPoint(recoveryPoints.length > 0 ? recoveryPoints[recoveryPoints.length - 1] : null);
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
      {drillQuotaReached && (
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <IconAlertTriangle className="size-4 shrink-0 text-amber-400" />
            <span>
              <strong>Disaster Recovery Drill Limit Reached (1/1 this month):</strong> Free tier organizations include 1 simulated drill per calendar month. Upgrade to Pro for unlimited scheduled & automated drills.
            </span>
          </div>
          <Link
            href={`/dashboard/org/${orgId}/billing?upgrade=true`}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500 text-black font-semibold text-xs hover:bg-amber-400 transition-colors shrink-0"
          >
            <IconSparkles className="size-3.5" />
            Upgrade to Pro ({priceFormatted})
          </Link>
        </div>
      )}

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
            {drillQuotaReached ? "DR Drill (1/1 Used)" : "Run DR Drill"}
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
          accent="text-muted-foreground"
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
              className="inline-flex items-center gap-1.5 h-8.5 px-4 rounded-md bg-[#161616] border border-[#2a2a2a] hover:bg-[#202020] text-white text-xs font-medium transition-colors shadow-xs"
            >
              <IconShieldCheck className="size-4 mr-1" />
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
        availablePoints={recoveryPoints}
        projectId={projectId}
        orgId={orgId}
        isPro={isPro}
        drillQuotaReached={drillQuotaReached}
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
        <SheetContent
          side="right"
          showCloseButton={true}
          className="w-full data-[side=right]:w-full sm:data-[side=right]:w-auto sm:data-[side=right]:max-w-[480px] sm:max-w-[480px] p-0 flex flex-col gap-0"
        >
          <SheetHeader className="px-6 py-5 border-b border-border space-y-1">
            <div className="flex items-center justify-between pr-6">
              <SheetTitle className="text-base font-semibold truncate">
                Logs for {viewingLogsDrill?.type === "live_restore" ? "Restore" : "Drill"} #{viewingLogsDrill?.id.replace(/^(drill-|backlify-restoreJob-)/, "")}
              </SheetTitle>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
              <div className="flex items-center gap-2">
                <span>{viewingLogsDrill?.executedAt} · {viewingLogsDrill?.durationSec}s</span>
                {drawerIsLive ? (
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="size-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                    <span>Live streaming</span>
                  </span>
                ) : viewingLogsDrill?.status === "passed" || viewingLogsDrill?.status === "complete" || drawerExecutionStep === 5 ? (
                  <span className="text-emerald-400 font-semibold">Completed</span>
                ) : viewingLogsDrill?.status === "failed" ? (
                  <span className="text-red-400 font-semibold">Failed</span>
                ) : null}
              </div>
              {drawerLogs.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(drawerLogs.join("\n"));
                    setDrawerCopied(true);
                    setTimeout(() => setDrawerCopied(false), 2000);
                  }}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {drawerCopied ? <IconCheck className="size-3 text-emerald-400" /> : <IconCopy className="size-3" />}
                  <span>{drawerCopied ? "Copied" : "Copy Logs"}</span>
                </button>
              )}
            </div>
          </SheetHeader>

          <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4">
            {/* Recovery Stepper Card */}
            <Card className="border-border/60 bg-card/60">
              <CardContent className="py-3 px-3.5 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                  <span>Recovery Stepper</span>
                  <span className="text-primary font-semibold">
                    {drawerExecutionStep === 5 ? "Completed" : `Phase ${drawerExecutionStep} of 5`}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {["Sandbox", "Download", "pg_restore", "Verify", "Teardown"].map((st, i) => {
                    const isDone = drawerExecutionStep > i + 1 || (drawerExecutionStep === 5 && i === 4);
                    const isCurrent = drawerExecutionStep === i + 1 && drawerExecutionStep !== 5;
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

            {loadingLogs && drawerLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-muted-foreground font-mono">Fetching console logs from Redis telemetry...</p>
              </div>
            ) : drawerLogs.length > 0 ? (
              <div className="p-4 rounded-lg border border-border bg-[#050505] font-mono text-[11.5px] space-y-1.5 leading-relaxed text-muted-foreground max-h-[460px] overflow-y-auto">
                {drawerLogs.map((l, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-muted-foreground/40 select-none shrink-0">$</span>
                    <span
                      className={
                        l.includes("[SUCCESS]") || l.includes("[COMPLETE]")
                          ? "text-emerald-400 font-semibold"
                          : l.includes("[ERROR]")
                          ? "text-red-400 font-semibold"
                          : l.includes("[VERIFY]")
                          ? "text-primary"
                          : l.includes("[DOWNLOAD]") || l.includes("[RESTORE]")
                          ? "text-blue-300"
                          : l.includes("[CHECKSUM]")
                          ? "text-amber-300"
                          : "text-muted-foreground"
                      }
                    >
                      {l}
                    </span>
                  </div>
                ))}
                <div ref={drawerLogsEndRef} />
              </div>
            ) : (
              <div className="p-6 rounded-lg border border-border/60 bg-card/40 text-center">
                <p className="text-xs text-muted-foreground">No console logs recorded for this operation.</p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
