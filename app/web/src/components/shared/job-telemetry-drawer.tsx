"use client";

import { useState, useEffect, useRef } from "react";
import {
  IconTerminal2,
  IconX,
  IconCopy,
  IconCheck,
  IconDownload,
  IconLoader2,
  IconArrowDown,
  IconCircleCheck,
  IconAlertTriangle,
  IconCpu,
  IconClock,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export interface TelemetryLog {
  jobId: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "success";
  phase: "INIT" | "DUMP" | "CHECKSUM" | "UPLOAD" | "RESTORE" | "INDEX" | "COMPLETE" | "ERROR";
  message: string;
  progress?: number;
}

interface Props {
  jobId: string | null;
  jobType?: "backup" | "restore" | "drill";
  open: boolean;
  onClose: () => void;
  title?: string;
}

export function JobTelemetryDrawer({
  jobId,
  jobType = "backup",
  open,
  onClose,
  title,
}: Props) {
  const [logs, setLogs] = useState<TelemetryLog[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [finishStatus, setFinishStatus] = useState<"COMPLETE" | "ERROR" | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const terminalContainerRef = useRef<HTMLDivElement>(null);

  // Connect to SSE stream whenever open and jobId are valid
  useEffect(() => {
    if (!open || !jobId) {
      setLogs([]);
      setIsConnected(false);
      setIsFinished(false);
      setFinishStatus(null);
      return;
    }

    setLogs([]);
    setIsConnected(true);
    setIsFinished(false);
    setFinishStatus(null);

    const eventSource = new EventSource(`/api/jobs/${jobId}/telemetry`);

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: TelemetryLog = JSON.parse(event.data);
        if (data && data.message) {
          setLogs((prev) => {
            // Avoid exact duplicate events
            if (
              prev.length > 0 &&
              prev[prev.length - 1].timestamp === data.timestamp &&
              prev[prev.length - 1].message === data.message
            ) {
              return prev;
            }
            return [...prev, data];
          });

          if (data.phase === "COMPLETE" || data.phase === "ERROR") {
            setIsFinished(true);
            setFinishStatus(data.phase);
          }
        }
      } catch (err) {
        console.error("Error parsing telemetry SSE log:", err);
      }
    };

    eventSource.addEventListener("connected", () => {
      setIsConnected(true);
    });

    eventSource.addEventListener("done", (event: any) => {
      try {
        const parsed = JSON.parse(event.data);
        setIsFinished(true);
        setFinishStatus(parsed.phase || "COMPLETE");
      } catch {
        setIsFinished(true);
        setFinishStatus("COMPLETE");
      }
    });

    eventSource.onerror = () => {
      // Reconnect handled automatically by EventSource
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [open, jobId]);

  // Auto-scroll to bottom on new logs if enabled
  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  // Detect manual user scroll to pause auto-scroll
  const handleScroll = () => {
    if (!terminalContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = terminalContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 40;
    setAutoScroll(isNearBottom);
  };

  const handleCopyLogs = () => {
    const rawText = logs
      .map(
        (l) =>
          `[${new Date(l.timestamp).toLocaleTimeString()}] [${l.phase}] [${l.level.toUpperCase()}] ${l.message}`
      )
      .join("\n");
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadLogs = () => {
    const rawText = logs
      .map(
        (l) =>
          `[${l.timestamp}] [${l.phase}] [${l.level.toUpperCase()}] ${l.message}`
      )
      .join("\n");
    const blob = new Blob([rawText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `telemetry_${jobId || "job"}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!open || !jobId) return null;

  // Determine current active phase for stepper
  const currentPhase =
    finishStatus || (logs.length > 0 ? logs[logs.length - 1].phase : "INIT");

  const phases =
    jobType === "restore" || jobType === "drill"
      ? [
          { key: "INIT", label: "Init" },
          { key: "DOWNLOAD", label: "Download" },
          { key: "CHECKSUM", label: "Checksum" },
          { key: "RESTORE", label: "pg_restore" },
          { key: "COMPLETE", label: "Verified" },
        ]
      : [
          { key: "INIT", label: "Init" },
          { key: "DUMP", label: "pg_dump" },
          { key: "UPLOAD", label: "Vault Upload" },
          { key: "COMPLETE", label: "Complete" },
        ];

  const currentPhaseIndex = phases.findIndex((p) => p.key === currentPhase);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-[70] backdrop-blur-[2px] transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[580px] lg:w-[680px] max-w-full bg-[#0b0b0b] border-l border-[#1f1f1f] z-[80] flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-[#1b1b1b] flex items-center justify-between shrink-0 bg-[#0e0e0e]">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <IconTerminal2 className="size-4 text-primary shrink-0" />
              <h2 className="text-[14px] font-semibold text-white truncate">
                {title || `${jobType.toUpperCase()} Execution Console`}
              </h2>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#161616] border border-[#262626] text-[#888888] truncate">
                {jobId}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1.5 text-[11px] font-mono">
              {isFinished ? (
                finishStatus === "COMPLETE" ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400">
                    <IconCircleCheck className="size-3 text-emerald-400" />
                    Process Completed Successfully
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-red-400">
                    <IconAlertTriangle className="size-3 text-red-400" />
                    Execution Failed
                  </span>
                )
              ) : isConnected ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Streaming Telemetry (Worker Active)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-amber-400">
                  <IconLoader2 className="size-3 animate-spin" />
                  Connecting to telemetry buffer…
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <button
              type="button"
              onClick={handleCopyLogs}
              title="Copy console logs"
              className="p-1.5 rounded text-[#777777] hover:text-white hover:bg-[#1c1c1c] transition-colors"
            >
              {copied ? (
                <IconCheck className="size-4 text-emerald-400" />
              ) : (
                <IconCopy className="size-4" />
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadLogs}
              title="Download logs (.log)"
              className="p-1.5 rounded text-[#777777] hover:text-white hover:bg-[#1c1c1c] transition-colors"
            >
              <IconDownload className="size-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded text-[#777777] hover:text-white hover:bg-[#1c1c1c] transition-colors ml-1"
            >
              <IconX className="size-4" />
            </button>
          </div>
        </div>

        {/* Phase Stepper Bar */}
        <div className="px-5 py-3 border-b border-[#161616] bg-[#0c0c0c] shrink-0">
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
            {phases.map((p, idx) => {
              const isPast =
                currentPhaseIndex > idx || (isFinished && finishStatus === "COMPLETE");
              const isCurrent =
                currentPhaseIndex === idx && !(isFinished && finishStatus === "COMPLETE");
              const isFailed = currentPhase === "ERROR" && currentPhaseIndex === idx;

              return (
                <div
                  key={p.key}
                  className={`px-2 py-1.5 rounded border text-[11px] font-mono flex items-center justify-between transition-colors ${
                    isFailed
                      ? "border-red-500/40 bg-red-500/10 text-red-400"
                      : isPast
                      ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                      : isCurrent
                      ? "border-primary/50 bg-primary/10 text-primary font-medium"
                      : "border-[#1c1c1c] bg-[#101010] text-[#555555]"
                  }`}
                >
                  <span className="truncate">{p.label}</span>
                  {isPast ? (
                    <IconCheck className="size-3 text-emerald-400 shrink-0 ml-1" />
                  ) : isCurrent ? (
                    <IconLoader2 className="size-3 text-primary animate-spin shrink-0 ml-1" />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* Terminal Log Console */}
        <div
          ref={terminalContainerRef}
          onScroll={handleScroll}
          className="flex-1 p-4 font-mono text-[12px] leading-relaxed overflow-y-auto bg-[#070707] text-[#cccccc] space-y-1 select-text"
        >
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-[#555555] py-12 space-y-3">
              <IconLoader2 className="size-6 animate-spin text-primary/70" />
              <div>
                <p className="text-white text-[13px] font-medium">
                  Awaiting worker task telemetry…
                </p>
                <p className="text-[11px] text-[#666666] mt-1 font-mono">
                  Logs stream live via Redis Pub/Sub as the worker executes.
                </p>
              </div>
            </div>
          ) : (
            logs.map((log, idx) => {
              const date = new Date(log.timestamp);
              const timeStr = isNaN(date.getTime())
                ? ""
                : date.toLocaleTimeString("en-US", {
                    hour12: false,
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  });

              let badgeColor = "text-[#888888] bg-[#161616] border-[#222222]";
              if (log.phase === "DUMP") badgeColor = "text-cyan-400 bg-cyan-950/30 border-cyan-800/40";
              else if (log.phase === "UPLOAD") badgeColor = "text-blue-400 bg-blue-950/30 border-blue-800/40";
              else if (log.phase === "RESTORE") badgeColor = "text-amber-400 bg-amber-950/30 border-amber-800/40";
              else if (log.phase === "CHECKSUM") badgeColor = "text-purple-400 bg-purple-950/30 border-purple-800/40";
              else if (log.phase === "COMPLETE" || log.level === "success")
                badgeColor = "text-emerald-400 bg-emerald-950/30 border-emerald-800/40";
              else if (log.phase === "ERROR" || log.level === "error")
                badgeColor = "text-red-400 bg-red-950/30 border-red-800/40";

              return (
                <div
                  key={`${log.timestamp}-${idx}`}
                  className="flex items-start gap-2.5 hover:bg-[#111111]/80 px-1.5 py-0.5 rounded transition-colors"
                >
                  <span className="text-[#555555] shrink-0 select-none text-[11px] pt-0.5">
                    {timeStr}
                  </span>

                  <span
                    className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded border shrink-0 ${badgeColor}`}
                  >
                    {log.phase}
                  </span>

                  <span
                    className={`flex-1 break-all ${
                      log.level === "error"
                        ? "text-red-400 font-semibold"
                        : log.level === "success"
                        ? "text-emerald-300 font-medium"
                        : "text-[#dddddd]"
                    }`}
                  >
                    {log.message}
                  </span>
                </div>
              );
            })
          )}
          <div ref={terminalEndRef} />
        </div>

        {/* Drawer Footer Status Bar */}
        <div className="px-5 py-3 border-t border-[#181818] bg-[#0c0c0c] flex items-center justify-between text-[11px] font-mono text-[#666666] shrink-0">
          <div className="flex items-center gap-3">
            <span>{logs.length} events received</span>
            <span>·</span>
            <span>Channel: {jobId ? `job-telemetry:${jobId}` : "idle"}</span>
          </div>

          <div className="flex items-center gap-2">
            {!autoScroll && (
              <button
                type="button"
                onClick={() => setAutoScroll(true)}
                className="flex items-center gap-1 text-primary hover:underline"
              >
                <IconArrowDown className="size-3" /> Auto-scroll paused
              </button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
              className="h-7 px-3 text-[12px] border-[#222222] bg-transparent text-[#888888] hover:text-white"
            >
              Close Console
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
