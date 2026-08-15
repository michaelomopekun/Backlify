import type { Icon } from "@tabler/icons-react";

import { cn } from "@/lib/utils";

/**
 * The four-up metric row (SVG: 273×123, rx 15 -> rounded-xl).
 *
 * `tone` controls the icon chip only. The value stays foreground by default
 * because amber is rationed (§1.2) — spending it on four numbers at once would
 * leave nothing for the primary action. Pass `tone="primary"` on at most one.
 */

export interface StatCardProps {
  label: string;
  value: string;
  /** Optional sub-line — omitted rather than faked when there's no data for it. */
  hint?: string;
  icon: Icon;
  tone?: "neutral" | "primary" | "success" | "destructive";
}

const TONE_CHIP: Record<NonNullable<StatCardProps["tone"]>, string> = {
  neutral: "bg-secondary text-muted-foreground",
  primary: "bg-primary/12 text-primary",
  success: "bg-success/12 text-success",
  destructive: "bg-destructive/12 text-destructive",
};

export function StatCard({
  label,
  value,
  hint,
  icon: IconComponent,
  tone = "neutral",
}: StatCardProps) {
  return (
    <div className="flex flex-col justify-between p-4" style={{width: '273px', height: '123px', background: 'rgba(15, 23, 42, 0.65)', borderRadius: '15px', boxSizing: 'border-box'}}>

      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-md",
            TONE_CHIP[tone]
          )}
        >
          <IconComponent className="size-4" aria-hidden />
        </span>
      </div>

      <div className="space-y-0.5">
        <p className="text-2xl leading-none font-semibold tabular-nums text-foreground">
          {value}
        </p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}
