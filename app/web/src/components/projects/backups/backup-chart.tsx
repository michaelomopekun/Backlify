"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatBytes } from "@/lib/format";

export interface BackupChartPoint {
  /** ISO date (yyyy-mm-dd) or month label for the bucket. */
  date: string;
  label: string;
  completed: number;
  failed: number;
  bytes: number;
}

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

  if (!data || data.length === 0) {
    return (
      <div className="h-[240px] w-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-border/40 rounded-xl bg-card/20">
        <p className="text-sm font-medium text-foreground">No backup metrics available</p>
        <p className="text-xs text-muted-foreground mt-1">
          Historical backup performance and throughput charts will populate as backups execute.
        </p>
      </div>
    );
  }

  const chartData = data;

  return (
    <div className="h-[240px] w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
        >
          <defs>
            <linearGradient id="amberGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFB31F" stopOpacity={0.45} />
              <stop offset="70%" stopColor="#FFB31F" stopOpacity={0.08} />
              <stop offset="100%" stopColor="#1B1F25" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            vertical={false}
            stroke="#D0D5DD"
            strokeOpacity={0.07}
            strokeDasharray="2 2"
          />

          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{
              fill: "#FFFFFF",
              fontSize: 12,
              fontFamily: "JetBrains Mono, monospace",
              fontWeight: 700,
            }}
            interval="preserveStartEnd"
            minTickGap={12}
            dy={8}
          />

          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            width={40}
            tick={{
              fill: "#FFFFFF",
              fontSize: 12,
              fontFamily: "JetBrains Mono, monospace",
              fontWeight: 700,
            }}
            domain={[0, "auto"]}
          />

          <Tooltip
            cursor={{ stroke: "#64748B", strokeWidth: 1, strokeDasharray: "3 3" }}
            content={<ChartTooltip />}
          />

          <Area
            type="monotone"
            dataKey="completed"
            name="Backups"
            stroke="#64748B"
            strokeWidth={2}
            fill="url(#amberGlow)"
            activeDot={{
              r: 6,
              fill: "#64748B",
              stroke: "#FFFFFF",
              strokeWidth: 2,
            }}
            isAnimationActive={!reducedMotion}
          />
        </AreaChart>
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
    <div className="rounded-xl border border-white/20 bg-[#0F172A]/90 p-3.5 text-xs shadow-2xl backdrop-blur-md">
      <p className="mb-2 font-['JetBrains_Mono',monospace] font-bold text-white">
        {point.label}
      </p>
      <div className="flex items-center gap-2 text-slate-300">
        <span className="size-2 rounded-full bg-[#FFB31F]" />
        <span>Backups:</span>
        <span className="font-bold text-white tabular-nums">
          {point.completed}
        </span>
      </div>
      {point.bytes > 0 && (
        <p className="mt-1.5 border-t border-white/10 pt-1.5 font-mono text-[11px] text-[#64748B]">
          {formatBytes(point.bytes)} stored
        </p>
      )}
    </div>
  );
}
