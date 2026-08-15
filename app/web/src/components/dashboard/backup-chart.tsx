"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatBytes } from "@/lib/format";

/**
 * Backups per day (SVG: 702×341).
 *
 * Stacked so the bar height reads as total attempts while the split still shows
 * failures — a separate failure series would make a bad day look like a short
 * bar rather than a red one. Colours come from the chart tokens via CSS vars,
 * which resolve inside SVG the same as anywhere else.
 */

export interface BackupChartPoint {
  /** ISO date (yyyy-mm-dd) for the bucket. */
  date: string;
  label: string;
  completed: number;
  failed: number;
  bytes: number;
}

/** recharts animates on mount; honour the OS preference rather than overriding it. */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

export function BackupChart({ data }: { data: BackupChartPoint[] }) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
          <CartesianGrid
            vertical={false}
            stroke="var(--color-border)"
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
            interval="preserveStartEnd"
            minTickGap={16}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            width={40}
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
          />
          <Tooltip
            cursor={{ fill: "var(--color-secondary)", opacity: 0.4 }}
            content={<ChartTooltip />}
          />
          <Bar
            dataKey="completed"
            stackId="jobs"
            name="Completed"
            fill="var(--color-chart-1)"
            radius={[0, 0, 0, 0]}
            isAnimationActive={!reducedMotion}
          />
          <Bar
            dataKey="failed"
            stackId="jobs"
            name="Failed"
            fill="var(--color-destructive)"
            radius={[4, 4, 0, 0]}
            isAnimationActive={!reducedMotion}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: BackupChartPoint }>;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1.5 font-medium text-popover-foreground">{point.label}</p>
      <Row label="Completed" value={point.completed} dot="bg-chart-1" />
      <Row label="Failed" value={point.failed} dot="bg-destructive" />
      {point.bytes > 0 && (
        <p className="mt-1.5 border-t border-border pt-1.5 text-muted-foreground">
          {formatBytes(point.bytes)} stored
        </p>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  dot,
}: {
  label: string;
  value: number;
  dot: string;
}) {
  return (
    <p className="flex items-center gap-2 text-muted-foreground">
      <span className={`size-2 rounded-full ${dot}`} aria-hidden />
      {label}
      <span className="ml-auto pl-4 font-medium tabular-nums text-popover-foreground">
        {value}
      </span>
    </p>
  );
}
