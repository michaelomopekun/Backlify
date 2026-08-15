"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import { formatBytes } from "@/lib/format";

/**
 * Storage by project (SVG: 427×330 side panel).
 *
 * The design shows a quota ring, but there is no plan or quota in the schema
 * (§8.3) — so this splits *actual* usage by project instead of inventing a
 * denominator. The centre reads total bytes stored, which is a true number; a
 * percentage here would not be.
 *
 * Beyond five projects the tail collapses into "Other" so the ring stays
 * readable and the legend doesn't run past the panel.
 */

export interface StorageSlice {
  projectId: string;
  name: string;
  bytes: number;
}

const SLICE_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

const MAX_SLICES = 5;

function collapse(slices: StorageSlice[]): StorageSlice[] {
  const sorted = [...slices].sort((a, b) => b.bytes - a.bytes);
  if (sorted.length <= MAX_SLICES) return sorted;

  const head = sorted.slice(0, MAX_SLICES - 1);
  const tail = sorted.slice(MAX_SLICES - 1);
  return [
    ...head,
    {
      projectId: "__other",
      name: `${tail.length} more`,
      bytes: tail.reduce((sum, slice) => sum + slice.bytes, 0),
    },
  ];
}

export function StorageDonut({ slices }: { slices: StorageSlice[] }) {
  const data = collapse(slices.filter((slice) => slice.bytes > 0));
  const total = data.reduce((sum, slice) => sum + slice.bytes, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative h-[168px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="bytes"
              nameKey="name"
              innerRadius={56}
              outerRadius={80}
              paddingAngle={data.length > 1 ? 2 : 0}
              stroke="none"
              isAnimationActive={false}
            >
              {data.map((slice, index) => (
                <Cell
                  key={slice.projectId}
                  fill={SLICE_COLORS[index % SLICE_COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-semibold tabular-nums text-foreground">
            {formatBytes(total)}
          </span>
          <span className="text-xs text-muted-foreground">stored</span>
        </div>
      </div>

      {/* The list is the accessible reading of the ring, not decoration. */}
      <ul className="space-y-2">
        {data.map((slice, index) => (
          <li key={slice.projectId} className="flex items-center gap-2 text-sm">
            <span
              aria-hidden
              className="size-2 shrink-0 rounded-full"
              style={{ background: SLICE_COLORS[index % SLICE_COLORS.length] }}
            />
            <span className="min-w-0 flex-1 truncate text-muted-foreground">
              {slice.name}
            </span>
            <span className="tabular-nums text-foreground">
              {formatBytes(slice.bytes)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
