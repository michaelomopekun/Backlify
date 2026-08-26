"use client";

import { useState } from "react";
import {
  IconCircleCheck,
  IconCheck,
  IconCopy,
  IconChevronDown,
  IconCloudUpload,
  IconCalendarEvent,
  IconShieldLock,
  IconHistory,
  IconRotateClockwise,
  IconDatabase,
  IconNetwork,
  IconWorld,
  IconCpu,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface StatusItem {
  name: string;
  status: string;
  detail: string;
}

const statusList: StatusItem[] = [
  { name: "PostgreSQL Connection", status: "Healthy", detail: "SSL active · 12ms latency" },
  { name: "Backup Worker Queue", status: "Healthy", detail: "0 queued · Idle" },
  { name: "Cron Scheduler", status: "Healthy", detail: "Next trigger in 4h 22m" },
  { name: "Storage Target (S3/R2)", status: "Healthy", detail: "Encrypted bucket connected" },
  { name: "Restore Engine", status: "Healthy", detail: "Standby & verified" },
];

export function ProjectOverviewHeader({
  projectName,
  databaseUrl,
  orgId,
  projectId,
}: {
  projectName: string;
  databaseUrl: string;
  orgId: string;
  projectId: string;
}) {
  const [copied, setCopied] = useState(false);

  const maskedUrl = databaseUrl
    ? databaseUrl.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:••••••••@")
    : `https://${projectId.slice(0, 10)}.backlify.app`;

  const handleCopy = () => {
    navigator.clipboard.writeText(databaseUrl || maskedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Title & Connection Header */}
      <div>
        <h1 className="text-[28px] font-medium tracking-tight text-foreground font-sans">
          {projectName}
        </h1>

        <div className="mt-2 flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground font-mono">
          <span className="text-muted-foreground/90 font-mono text-[13px]">
            {maskedUrl}
          </span>

          <DropdownMenu>
            <div className="inline-flex rounded border border-border/80 bg-muted/20 overflow-hidden">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-sans"
              >
                {copied ? (
                  <>
                    <IconCheck className="size-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <span>Copy</span>
                  </>
                )}
              </button>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="px-1.5 py-0.5 border-l border-border/80 hover:bg-accent text-muted-foreground hover:text-foreground"
                >
                  <IconChevronDown className="size-3" />
                </button>
              </DropdownMenuTrigger>
            </div>

            <DropdownMenuContent align="start" className="w-60 border-border bg-popover text-xs">
              <DropdownMenuItem onClick={handleCopy} className="cursor-pointer">
                Copy Project URL
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(databaseUrl || maskedUrl)}
                className="cursor-pointer"
              >
                Copy Connection String (URI)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(`psql "${databaseUrl || maskedUrl}"`);
                }}
                className="cursor-pointer"
              >
                Copy psql CLI Command
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Split: Left Metric Entries (Exact Supabase 68px Squircle Card Style) + Right Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: 2 Columns with exact 68px squircle icon cards and generous vertical spacing */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-y-8 gap-x-6 py-1">
          {/* Entry 1: Status (Exact 6-dot matrix in 68px squircle) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="group flex items-center gap-4 cursor-pointer text-left select-none">
                {/* 68px rounded-[16px] squircle icon box with generous whitespace */}
                <div className="size-[68px] rounded-[7px] bg-[#181818] border border-[#262626] flex items-center justify-center shrink-0 group-hover:border-[#3a3a3a] transition-colors shadow-sm">
                  <div className="grid grid-cols-3 gap-1">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="size-[6px] rounded-full bg-emerald-400" />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] uppercase font-mono tracking-wider text-muted-foreground">
                    STATUS
                  </p>
                  <p className="text-[17px] font-medium text-foreground mt-0.5">
                    Healthy
                  </p>
                </div>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-72 border-border bg-card p-3 space-y-2.5 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-xs font-semibold text-foreground">Service Health</span>
                <Link
                  href={`/dashboard/org/${orgId}/projects/${projectId}/backups`}
                  className="text-[11px] text-primary hover:underline"
                >
                  View jobs →
                </Link>
              </div>

              <div className="space-y-2 pt-1">
                {statusList.map((item) => (
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

          {/* Entry 2: Retention Policy */}
          <div className="flex items-center gap-4">
            <div className="size-[68px] rounded-[7px] bg-[#181818] border border-[#262626] flex items-center justify-center shrink-0 shadow-sm">
              <IconShieldLock className="size-5 text-foreground/90" stroke={1.25} />
            </div>
            <div>
              <p className="text-[11px] uppercase font-mono tracking-wider text-muted-foreground">
                RETENTION
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[17px] font-medium text-foreground">7 Snapshots</p>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                  FIFO
                </span>
              </div>
            </div>
          </div>

          {/* Entry 3: Storage Vault / S3 Target */}
          <div className="flex items-center gap-4">
            <div className="size-[68px] rounded-[7px] bg-[#181818] border border-[#262626] flex items-center justify-center shrink-0 shadow-sm">
              <IconCloudUpload className="size-5 text-foreground/90" stroke={1.25} />
            </div>
            <div>
              <p className="text-[11px] uppercase font-mono tracking-wider text-muted-foreground">
                STORAGE VAULT
              </p>
              <p className="text-[17px] font-medium text-foreground mt-0.5">
                AES-256 S3
              </p>
            </div>
          </div>

          {/* Entry 4: Active Backup Schedule */}
          <div className="flex items-center gap-4">
            <div className="size-[68px] rounded-[7px] bg-[#181818] border border-[#262626] flex items-center justify-center shrink-0 shadow-sm">
              <IconCalendarEvent className="size-5 text-foreground/90" stroke={1.25} />
            </div>
            <div>
              <p className="text-[11px] uppercase font-mono tracking-wider text-muted-foreground">
                ACTIVE SCHEDULE
              </p>
              <p className="text-[17px] font-medium text-foreground mt-0.5">
                Daily @ 14:00 UTC
              </p>
            </div>
          </div>

          {/* Entry 5: Last Backup Run */}
          <div className="flex items-center gap-4">
            <div className="size-[68px] rounded-[7px] bg-[#181818] border border-[#262626] flex items-center justify-center shrink-0 shadow-sm">
              <IconHistory className="size-5 text-foreground/90" stroke={1.25} />
            </div>
            <div>
              <p className="text-[11px] uppercase font-mono tracking-wider text-muted-foreground">
                LAST BACKUP
              </p>
              <p className="text-[17px] font-medium text-foreground mt-0.5">
                2 hours ago · 142 MB
              </p>
            </div>
          </div>

          {/* Entry 6: Restore Readiness */}
          <div className="flex items-center gap-4">
            <div className="size-[68px] rounded-[7px] bg-[#181818] border border-[#262626] flex items-center justify-center shrink-0 shadow-sm">
              <IconRotateClockwise className="size-5 text-foreground/90" stroke={1.25} />
            </div>
            <div>
              <p className="text-[11px] uppercase font-mono tracking-wider text-muted-foreground">
                RESTORE READINESS
              </p>
              <p className="text-[17px] font-medium text-foreground mt-0.5">
                Verified (0 drills failed)
              </p>
            </div>
          </div>
        </div>

        {/* Right: Architecture Canvas — Tall, Dotted & Focused on Database Replication */}
        <div className="lg:col-span-7 relative min-h-[380px] rounded-xl border border-border/60 bg-[#0e0e0e] p-6 flex flex-col justify-between overflow-hidden">
          {/* Subtle dotted matrix background pattern */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#505050 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />

          {/* Top-Right Canvas Control Icons */}
          <div className="relative z-10 flex justify-end">
            <div className="flex items-center border border-border/70 rounded bg-[#181818] overflow-hidden text-muted-foreground">
              <button className="p-1.5 hover:text-foreground bg-accent/40 text-foreground transition-colors">
                <IconNetwork className="size-3.5" />
              </button>
              <button className="p-1.5 hover:text-foreground transition-colors">
                <IconWorld className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Center Database Node Card */}
          <div className="relative z-10 my-auto mx-auto w-72 rounded-xl border border-border/90 bg-[#161616] p-4 shadow-2xl">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <div className="size-9 rounded-lg bg-[#1c2e24] border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <IconDatabase className="size-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Primary Database
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Central EU (Frankfurt)
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    eu-central-1 · Postgres 16
                  </p>
                </div>
              </div>

              {/* German flag */}
              <span className="text-sm select-none">🇩🇪</span>
            </div>

            <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
              <span>CPU 2%</span>
              <span>·</span>
              <span>Disk 3%</span>
              <span>·</span>
              <span>RAM 43%</span>
              <span>·</span>
              <span className="text-emerald-400">SSL Active</span>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/40 pt-2 font-mono">
            <span>Latency: 12ms · 5/60 connections</span>
            <span className="text-emerald-400">● Live Replication Synced</span>
          </div>
        </div>
      </div>

      {/* Bottom Service Telemetry Strip */}
      <div className="space-y-3.5 pt-4">
        {/* Strip Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Grip icon */}
            <div className="grid grid-cols-2 gap-0.5 text-muted-foreground opacity-60">
              <div className="size-1 rounded-sm bg-muted-foreground" />
              <div className="size-1 rounded-sm bg-muted-foreground" />
              <div className="size-1 rounded-sm bg-muted-foreground" />
              <div className="size-1 rounded-sm bg-muted-foreground" />
            </div>
            <div className="flex items-center gap-3 text-sm text-foreground">
              <span className="font-medium">18 Total Backup Operations</span>
              <span className="text-muted-foreground">·</span>
              <span className="font-medium text-emerald-400">100.0% Success Rate</span>
            </div>
          </div>

          <Button variant="outline" size="sm" className="h-7 text-xs border-border bg-[#161616] text-muted-foreground hover:text-foreground">
            Last 60 minutes ▾
          </Button>
        </div>

        {/* 4 Telemetry Cards — Larger, Taller with Axis & Timestamp Markers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: SCHEDULED BACKUPS */}
          <div className="p-4 rounded-xl border border-border/80 bg-[#121212] flex flex-col justify-between h-44 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  SCHEDULED BACKUPS
                </p>
                <p className="text-2xl font-semibold text-foreground mt-1 tracking-tight">12</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-amber-400" />
                  WARNINGS 0
                </span>
                <span className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-red-400" />
                  ERRORS 0
                </span>
              </div>
            </div>

            {/* Vertical green bars with axis and time range */}
            <div>
              <div className="flex items-end gap-1.5 h-14 border-b border-border/30 pb-0.5">
                {[15, 30, 45, 20, 60, 80, 50, 75, 90, 85, 100, 40].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-[1.5px] bg-emerald-400 hover:bg-emerald-300 transition-colors"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground/60 pt-1.5">
                <span>60m ago</span>
                <span>now</span>
              </div>
            </div>
          </div>

          {/* Card 2: MANUAL TRIGGERS */}
          <div className="p-4 rounded-xl border border-border/80 bg-[#121212] flex flex-col justify-between h-44 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  MANUAL TRIGGERS
                </p>
                <p className="text-2xl font-semibold text-foreground mt-1 tracking-tight">6</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-amber-400" />
                  WARNINGS 0
                </span>
                <span className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-red-400" />
                  ERRORS 0
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-end gap-1.5 h-14 border-b border-border/30 pb-0.5">
                {[0, 20, 0, 50, 0, 40, 80, 0, 90, 0, 60, 100].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-[1.5px] bg-primary hover:bg-primary/80 transition-colors"
                    style={{ height: `${h || 8}%`, opacity: h ? 1 : 0.15 }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground/60 pt-1.5">
                <span>60m ago</span>
                <span>now</span>
              </div>
            </div>
          </div>

          {/* Card 3: RESTORE DRILLS */}
          <div className="p-4 rounded-xl border border-border/80 bg-[#121212] flex flex-col justify-between h-44 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  RESTORE DRILLS
                </p>
                <p className="text-2xl font-semibold text-foreground mt-1 tracking-tight">2</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  ERRORS 0
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-end gap-1.5 h-14 border-b border-border/30 pb-0.5">
                {[0, 0, 30, 0, 0, 0, 0, 0, 70, 0, 0, 100].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-[1.5px] bg-blue-400 hover:bg-blue-300 transition-colors"
                    style={{ height: `${h || 8}%`, opacity: h ? 1 : 0.15 }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground/60 pt-1.5">
                <span>60m ago</span>
                <span>now</span>
              </div>
            </div>
          </div>

          {/* Card 4: VAULT THROUGHPUT */}
          <div className="p-4 rounded-xl border border-border/80 bg-[#121212] flex flex-col justify-between h-44 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  STORAGE THROUGHPUT
                </p>
                <p className="text-2xl font-semibold text-foreground mt-1 tracking-tight">1.2 GB</p>
              </div>
              <div className="text-[11px] font-mono text-emerald-400 font-medium">
                48 MB/s
              </div>
            </div>

            <div>
              <div className="flex items-end gap-1.5 h-14 border-b border-border/30 pb-0.5">
                {[25, 40, 55, 45, 65, 80, 85, 75, 90, 70, 85, 100].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-[1.5px] bg-emerald-400 hover:bg-emerald-300 transition-colors"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground/60 pt-1.5">
                <span>60m ago</span>
                <span>now</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
