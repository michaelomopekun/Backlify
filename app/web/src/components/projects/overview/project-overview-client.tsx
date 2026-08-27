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
import Link from "next/link";
import { useWidgetOrder } from "@/hooks/use-widget-order";

/* ─────────────────────────────────────────────────────────────────────────────
   Data
───────────────────────────────────────────────────────────────────────────── */

interface StatusItem {
  name: string;
  status: string;
  detail: string;
}

const statusList: StatusItem[] = [
  { name: "PostgreSQL Connection", status: "Healthy", detail: "SSL active · 12ms latency" },
  { name: "Backup Worker Queue",   status: "Healthy", detail: "0 queued · Idle" },
  { name: "Cron Scheduler",        status: "Healthy", detail: "Next trigger in 4h 22m" },
  { name: "Storage Target (S3/R2)",status: "Healthy", detail: "Encrypted bucket connected" },
  { name: "Restore Engine",        status: "Healthy", detail: "Standby & verified" },
];

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
  projectName,
  databaseUrl,
  orgId,
  projectId,
  copied,
  maskedUrl,
  onCopy,
}: {
  projectName: string;
  databaseUrl: string;
  orgId: string;
  projectId: string;
  copied: boolean;
  maskedUrl: string;
  onCopy: () => void;
}) {
  const { activatorRef, listeners } = React.useContext(WidgetDragContext);

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
      <div className="xl:col-span-6 flex flex-col space-y-8 pt-12 xl:pt-23">
        {/* Title & Connection Header */}
        <div>
          <h1 className="text-[32px] font-normal tracking-tight text-foreground font-sans">
            {projectName}
          </h1>

          <div className="mt-2.5 flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground font-mono">
            <span className="text-[#888888] font-mono text-[13.5px]">
              {maskedUrl}
            </span>

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
                  Copy Project URL
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(databaseUrl || maskedUrl)}
                  className="cursor-pointer"
                >
                  Copy Connection String (URI)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(`psql "${databaseUrl || maskedUrl}"`)}
                  className="cursor-pointer"
                >
                  Copy psql CLI Command
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Left Metric Items: 2 Columns */}
        <div className="grid grid-cols-2 gap-y-6 gap-x-4 pt-1">
          {/* Status */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="group/metric flex items-center gap-4 cursor-pointer text-left select-none">
                <div className="size-[68px] rounded-[7px] bg-[#161616] border border-[#242424] flex items-center justify-center shrink-0 group-hover/metric:border-[#383838] transition-colors">
                  <div className="grid grid-cols-3 gap-1">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="size-[6px] rounded-full bg-emerald-400" />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] uppercase font-mono tracking-wider text-[#888888] mb-0.5">STATUS</p>
                  <p className="text-[17px] font-normal text-white">Healthy</p>
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

          {/* Retention */}
          <div className="flex items-center gap-4">
            <div className="size-[68px] rounded-[7px] bg-[#161616] border border-[#242424] flex items-center justify-center shrink-0">
              <IconShieldLock className="size-5 text-white/90" stroke={1.25} />
            </div>
            <div>
              <p className="text-[11px] uppercase font-mono tracking-wider text-[#888888] mb-0.5">RETENTION</p>
              <div className="flex items-center gap-2">
                <p className="text-[17px] font-normal text-white">7 Snapshots</p>
                <span className="text-[9.5px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#202020] text-[#999999] border border-[#2e2e2e]">FIFO</span>
              </div>
            </div>
          </div>

          {/* Storage Vault */}
          <div className="flex items-center gap-4">
            <div className="size-[68px] rounded-[7px] bg-[#161616] border border-[#242424] flex items-center justify-center shrink-0">
              <IconCloudUpload className="size-5 text-white/90" stroke={1.25} />
            </div>
            <div>
              <p className="text-[11px] uppercase font-mono tracking-wider text-[#888888] mb-0.5">STORAGE VAULT</p>
              <p className="text-[17px] font-normal text-white">AES-256 S3</p>
            </div>
          </div>

          {/* Active Schedule */}
          <div className="flex items-center gap-4">
            <div className="size-[68px] rounded-[7px] bg-[#161616] border border-[#242424] flex items-center justify-center shrink-0">
              <IconCalendarEvent className="size-5 text-white/90" stroke={1.25} />
            </div>
            <div>
              <p className="text-[11px] uppercase font-mono tracking-wider text-[#888888] mb-0.5">ACTIVE SCHEDULE</p>
              <p className="text-[17px] font-normal text-white">Daily @ 14:00 UTC</p>
            </div>
          </div>

          {/* Last Backup */}
          <div className="flex items-center gap-4">
            <div className="size-[68px] rounded-[7px] bg-[#161616] border border-[#242424] flex items-center justify-center shrink-0">
              <IconHistory className="size-5 text-white/90" stroke={1.25} />
            </div>
            <div>
              <p className="text-[11px] uppercase font-mono tracking-wider text-[#888888] mb-0.5">LAST BACKUP</p>
              <p className="text-[17px] font-normal text-white">2h ago · 142 MB</p>
            </div>
          </div>

          {/* Restore Readiness */}
          <div className="flex items-center gap-4">
            <div className="size-[68px] rounded-[7px] bg-[#161616] border border-[#242424] flex items-center justify-center shrink-0">
              <IconRotateClockwise className="size-5 text-white/90" stroke={1.25} />
            </div>
            <div>
              <p className="text-[11px] uppercase font-mono tracking-wider text-[#888888] mb-0.5">RESTORE READINESS</p>
              <p className="text-[17px] font-normal text-white">Verified</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Topology Canvas */}
      <div className="xl:col-span-6 relative min-h-[500px] rounded-lg border border-[#222222] bg-[#0e0e0e] p-6 flex flex-col justify-between overflow-hidden shadow-sm">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(#505050 1px, transparent 1px)", backgroundSize: "20px 20px" }}
        />
        <div className="relative z-10 flex justify-end">
          <div className="flex items-center border border-[#262626] rounded bg-[#161616] overflow-hidden text-[#888888]">
            <button className="p-1.5 hover:text-white bg-[#222222] text-white transition-colors">
              <IconNetwork className="size-3.5" />
            </button>
            <button className="p-1.5 hover:text-white transition-colors">
              <IconWorld className="size-3.5" />
            </button>
          </div>
        </div>
        <div className="relative z-10 my-auto mx-auto w-80 rounded-[7px] border border-[#282828] bg-[#161616] p-4 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3.5">
              <div className="size-9 rounded bg-[#182c20] border border-emerald-500/25 flex items-center justify-center shrink-0 mt-0.5">
                <IconDatabase className="size-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-white">Primary Database</p>
                <p className="text-[11px] text-[#888888] mt-0.5">Central EU (Frankfurt)</p>
                <p className="text-[11px] text-[#888888] font-mono mt-0.5">eu-central-1 · Postgres 16</p>
              </div>
            </div>
            <span className="text-sm select-none">🇩🇪</span>
          </div>
          <div className="mt-4 pt-3 border-t border-[#262626] flex items-center justify-between text-[10.5px] text-[#888888] font-mono">
            <span>CPU 2%</span><span>·</span><span>Disk 3%</span><span>·</span><span>RAM 43%</span><span>·</span><span>5/60 conns</span>
          </div>
        </div>
        <div className="relative z-10" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TelemetryPanel widget content
───────────────────────────────────────────────────────────────────────────── */

function TelemetryPanelContent() {
  const { activatorRef, listeners } = React.useContext(WidgetDragContext);

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
            <span className="font-normal">18 Total Backup Operations</span>
            <span className="font-normal">100.0% Success Rate</span>
          </div>
        </div>
        <Button variant="outline" size="sm" className="h-7 text-xs border-[#262626] bg-[#161616] text-[#999999] hover:text-white">
          Last 60 minutes ▾
        </Button>
      </div>

      {/* 4 Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Scheduled Backups */}
        <div className="p-5 rounded-lg border border-[#222222] bg-[#121212] flex flex-col justify-between h-48 shadow-sm">
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-mono uppercase tracking-wider text-[#888888]">SCHEDULED BACKUPS</p>
            <div className="flex items-center gap-2.5 text-[10.5px] font-mono text-[#888888]">
              <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-amber-400" />WARNINGS 0</span>
              <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-red-400" />ERRORS 0</span>
            </div>
          </div>
          <p className="text-2xl font-normal text-white -mt-2 tracking-tight">12</p>
          <div>
            <div className="flex items-end gap-1.5 h-16 border-b border-[#222222] pb-0.5">
              {[15,30,45,20,60,80,50,75,90,85,100,40].map((h,i) => (
                <div key={i} className="flex-1 rounded-t-[1px] bg-emerald-400 hover:bg-emerald-300 transition-colors" style={{ height:`${h}%` }} />
              ))}
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#666666] pt-2">
              <span>Aug 26, 5:29am</span><span>Aug 26, 6:29am</span>
            </div>
          </div>
        </div>

        {/* Manual Triggers */}
        <div className="p-5 rounded-lg border border-[#222222] bg-[#121212] flex flex-col justify-between h-48 shadow-sm">
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-mono uppercase tracking-wider text-[#888888]">MANUAL TRIGGERS</p>
            <div className="flex items-center gap-2.5 text-[10.5px] font-mono text-[#888888]">
              <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-amber-400" />WARNINGS 0</span>
              <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-red-400" />ERRORS 0</span>
            </div>
          </div>
          <p className="text-2xl font-normal text-white -mt-2 tracking-tight">6</p>
          <div>
            <div className="flex items-end gap-1.5 h-16 border-b border-[#222222] pb-0.5">
              {[0,20,0,50,0,40,80,0,90,0,60,100].map((h,i) => (
                <div key={i} className="flex-1 rounded-t-[1px] bg-primary hover:bg-primary/80 transition-colors" style={{ height:`${h||8}%`, opacity: h ? 1 : 0.15 }} />
              ))}
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#666666] pt-2">
              <span>Aug 26, 5:29am</span><span>Aug 26, 6:29am</span>
            </div>
          </div>
        </div>

        {/* Restore Drills */}
        <div className="p-5 rounded-lg border border-[#222222] bg-[#121212] flex flex-col justify-between h-48 shadow-sm">
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-mono uppercase tracking-wider text-[#888888]">RESTORE DRILLS</p>
            <div className="flex items-center gap-2.5 text-[10.5px] font-mono text-[#888888]">
              <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-emerald-400" />ERRORS 0</span>
            </div>
          </div>
          <p className="text-2xl font-normal text-white -mt-2 tracking-tight">2</p>
          <div>
            <div className="flex items-end gap-1.5 h-16 border-b border-[#222222] pb-0.5">
              {[0,0,30,0,0,0,0,0,70,0,0,100].map((h,i) => (
                <div key={i} className="flex-1 rounded-t-[1px] bg-blue-400 hover:bg-blue-300 transition-colors" style={{ height:`${h||8}%`, opacity: h ? 1 : 0.15 }} />
              ))}
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#666666] pt-2">
              <span>Aug 26, 5:29am</span><span>Aug 26, 6:29am</span>
            </div>
          </div>
        </div>

        {/* Storage Throughput */}
        <div className="p-5 rounded-lg border border-[#222222] bg-[#121212] flex flex-col justify-between h-48 shadow-sm">
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-mono uppercase tracking-wider text-[#888888]">STORAGE THROUGHPUT</p>
            <div className="text-[11px] font-mono text-emerald-400">48 MB/s</div>
          </div>
          <p className="text-2xl font-normal text-white -mt-2 tracking-tight">1.2 GB</p>
          <div>
            <div className="flex items-end gap-1.5 h-16 border-b border-[#222222] pb-0.5">
              {[25,40,55,45,65,80,85,75,90,70,85,100].map((h,i) => (
                <div key={i} className="flex-1 rounded-t-[1px] bg-emerald-400 hover:bg-emerald-300 transition-colors" style={{ height:`${h}%` }} />
              ))}
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#666666] pt-2">
              <span>Aug 26, 5:29am</span><span>Aug 26, 6:29am</span>
            </div>
          </div>
        </div>
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
      <p className="text-sm text-white/60 mt-0.5">18 Total Backup Operations · Sparklines</p>
    </div>
  );
}

/* Need React import for context */
import React from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   Main export
───────────────────────────────────────────────────────────────────────────── */

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
  const [activeId, setActiveId] = useState<string | null>(null);
  const { order, updateOrder } = useWidgetOrder(projectId);

  const maskedUrl = databaseUrl
    ? databaseUrl.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:••••••••@")
    : `https://${projectId.slice(0, 10)}.backlify.app`;

  const handleCopy = () => {
    navigator.clipboard.writeText(databaseUrl || maskedUrl);
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
        projectName={projectName}
        databaseUrl={databaseUrl}
        orgId={orgId}
        projectId={projectId}
        copied={copied}
        maskedUrl={maskedUrl}
        onCopy={handleCopy}
      />
    ),
    "telemetry-panel": <TelemetryPanelContent />,
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
