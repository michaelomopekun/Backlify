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
        "flex items-center gap-4 sm:gap-5 p-5 sm:p-6 rounded-xl border border-border/60 bg-card/60 transition-colors hover:border-border hover:bg-card min-w-0 shadow-xs",
        className
      )}
    >
      <div className="size-12 sm:size-13 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-center shrink-0">
        <Icon className={cn("size-5 sm:size-5.5", accent ?? "text-foreground/80")} stroke={1.5} />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-xs sm:text-[13px] font-medium text-muted-foreground truncate">
          {label}
        </p>
        <p className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground leading-tight">
          {value}
        </p>
        {sub && (
          <p className="text-xs text-muted-foreground font-normal truncate">
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
        "rounded-xl border border-border/60 bg-card/60 p-6 flex items-start gap-4 transition-colors hover:border-border hover:bg-card shadow-xs",
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
        <p className="text-xs sm:text-[13px] font-medium text-muted-foreground">
          {label}
        </p>
        <p className="text-2xl font-semibold tracking-tight text-foreground leading-none">
          {value}
        </p>
        {sub && <p className="text-xs text-muted-foreground pt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
