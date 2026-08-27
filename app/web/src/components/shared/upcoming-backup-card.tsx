import Link from "next/link";
import { IconClock } from "@tabler/icons-react";

import { formatDateTime, formatTimeUntil } from "@/lib/format";
import { describeCron } from "@/lib/cron";

export function UpcomingBackupCard({
  projectId,
  projectName,
  cronExpression,
  timezone,
  nextRunAt,
}: {
  projectId: string;
  projectName: string | null;
  cronExpression: string;
  timezone: string;
  nextRunAt: Date | string | null;
}) {
  const countdown = formatTimeUntil(nextRunAt);
  const described = describeCron(cronExpression);
  const cadenceLabel = described?.cadence || "Scheduled";

  return (
    <article
      className="flex min-h-[190px] flex-col justify-between p-6 transition-all duration-200 hover:border-white/30"
      style={{
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        borderRadius: "20px",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        boxSizing: "border-box",
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)",
      }}
    >
      <div className="space-y-2">
        {/* Top row: Project Name & Cadence badge */}
        <div className="flex items-center justify-between gap-3">
          <Link
            href={`/dashboard/project/${projectId}`}
            className="truncate font-['JetBrains_Mono',monospace] text-xl font-bold tracking-tight text-white hover:text-[#FFB31F] transition-colors"
          >
            {projectName ?? projectId}
          </Link>
          <span className="shrink-0 rounded-[100px] border border-white bg-[rgba(100,116,139,0.5)] px-3.5 py-1 font-['JetBrains_Mono',monospace] text-xs font-medium text-white shadow-sm">
            {cadenceLabel}
          </span>
        </div>

        {/* Date string */}
        <p className="font-['JetBrains_Mono',monospace] text-xs text-white/60">
          {nextRunAt ? formatDateTime(nextRunAt) : "Scheduled continuously"}
        </p>
      </div>

      {/* Bottom countdown row with bordered clock icon */}
      <div className="mt-4 flex items-center gap-3">
        <div className="flex size-[29px] shrink-0 items-center justify-center rounded-[10px] border border-[rgba(153,153,153,0.65)] text-white">
          <IconClock className="size-4 stroke-[1.5]" />
        </div>
        <span className="font-['JetBrains_Mono',monospace] text-[11px] font-light text-white">
          {countdown ? `Next backup in ${countdown}` : "Next backup in 2h 30m"}
        </span>
      </div>
    </article>
  );
}
