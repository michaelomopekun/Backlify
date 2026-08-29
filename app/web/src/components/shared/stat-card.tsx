import React from "react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  className?: string;
}

/**
 * Card 1 (Default Standard Metric Stat Card):
 * Used across Backups, Schedules, and Restores pages.
 * Features a structured squircle icon container with crisp mono typography.
 */
export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-5 rounded-lg border border-[#1e1e1e] bg-[#111111] transition-colors hover:border-[#282828]",
        className
      )}
    >
      <div className="size-[52px] rounded-[7px] bg-[#161616] border border-[#242424] flex items-center justify-center shrink-0">
        <Icon className={cn("size-5", accent ?? "text-white/80")} stroke={1.3} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase font-mono tracking-wider text-[#666666]">
          {label}
        </p>
        <p className="text-[22px] font-normal text-white leading-tight">
          {value}
        </p>
        {sub && (
          <p className="text-[11px] text-[#555555] font-mono mt-0.5 truncate">
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Card 2 (Spacious Ambient Glow Variant):
 * Preserved variant with top-aligned ambient glow icon container and spacious padding.
 */
export function StatCardVariant2({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-6 flex items-start gap-4 transition-colors hover:border-[#262626]",
        className
      )}
    >
      <div
        className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg"
        style={{ background: accent ? `${accent}15` : "#ffffff0d" }}
      >
        <Icon className="size-5" style={{ color: accent ?? "#888888" }} />
      </div>
      <div className="space-y-1.5 min-w-0">
        <p className="text-[11px] font-mono uppercase tracking-widest text-[#555555]">
          {label}
        </p>
        <p className="text-[24px] font-semibold tracking-tight text-white leading-none">
          {value}
        </p>
        {sub && <p className="text-[12px] text-[#666666] pt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
