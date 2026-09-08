"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { formatBytes } from "@/lib/format";

export interface StorageSlice {
  projectId: string;
  name: string;
  bytes: number;
}

export function StorageDonut({ slices }: { slices?: StorageSlice[] }) {
  const hasRealData = slices && slices.length > 0;
  const usedBytes = hasRealData ? slices.reduce((acc, s) => acc + (s.bytes || 0), 0) : 0;
  const totalBytes = Math.max(usedBytes * 1.66, 1024 * 1024 * 1024); // baseline 1GB capacity
  const availableBytes = Math.max(totalBytes - usedBytes, 0);
  const percentage = totalBytes > 0 ? Math.round((usedBytes / totalBytes) * 100) : 0;

  const chartData = [
    { name: "Used", value: usedBytes, color: "#FFB31F" },
    { name: "Available", value: availableBytes, color: "rgba(100, 116, 139, 0.5)" },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
      {/* Donut Chart */}
      <div className="relative size-[180px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={58}
              outerRadius={80}
              startAngle={90}
              endAngle={-270}
              stroke="none"
              paddingAngle={2}
              isAnimationActive={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-['JetBrains_Mono',monospace] text-2xl font-bold tracking-tight text-white">
            {percentage}%
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div className="flex flex-col gap-4 min-w-[140px] font-['Inter',sans-serif]">
        {/* Used */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="size-3.5 shrink-0 rounded-full bg-[#FFB31F]" />
            <span className="text-slate-300">Used</span>
          </div>
          <span className="font-['JetBrains_Mono',monospace] font-bold text-white">
            {formatBytes(usedBytes)}
          </span>
        </div>

        {/* Available */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="size-3.5 shrink-0 rounded-full bg-[rgba(100,116,139,0.5)]" />
            <span className="text-slate-300">Available</span>
          </div>
          <span className="font-['JetBrains_Mono',monospace] font-bold text-white">
            {formatBytes(availableBytes)}
          </span>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="size-3.5 shrink-0 rounded-full bg-[#64748B]" />
            <span className="text-slate-300">Total</span>
          </div>
          <span className="font-['JetBrains_Mono',monospace] font-bold text-white">
            {formatBytes(totalBytes)}
          </span>
        </div>
      </div>
    </div>
  );
}
