import Link from "next/link";
import { IconClock } from "@tabler/icons-react";

import { formatDateTime, formatTimeUntil } from "@/lib/format";
import { FrequencyBadge } from "./frequency-badge";

/**
 * An upcoming scheduled backup (SVG: 370×197, three across).
 *
 * `nextRunAt` is the scheduler's own fire time, never derived from the cron
 * string here — a countdown is only as trustworthy as its source. BullMQ owns
 * the repeat pattern and nothing writes that column back yet, so in practice it
 * is null and the card falls back to showing cadence alone.
 *
 * Server-rendered, so any countdown is accurate as of page load. The page is
 * `force-dynamic`, and a schedule measured in hours doesn't need a ticking clock.
 */
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

  return (
    <article className="flex min-h-[197px] flex-col justify-between rounded-xl border border-border bg-card p-5">
      <div>
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/dashboard/projects/${projectId}`}
            className="truncate text-sm font-medium text-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {projectName ?? projectId}
          </Link>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
            <IconClock className="size-4" aria-hidden />
          </span>
        </div>

        <div className="mt-3">
          <FrequencyBadge expression={cronExpression} />
        </div>
      </div>

      <div className="mt-4 border-t border-border pt-3">
        {nextRunAt ? (
          <>
            {countdown ? (
              <p className="text-sm text-foreground">
                Runs in{" "}
                <span className="font-medium tabular-nums">{countdown}</span>
              </p>
            ) : (
              <p className="text-sm text-foreground">Due now</p>
            )}
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatDateTime(nextRunAt)}
              {timezone !== "UTC" && ` · ${timezone}`}
            </p>
          </>
        ) : (
          /* No fire time recorded — say that plainly instead of implying "now". */
          <>
            <p className="text-sm text-foreground">Schedule active</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Next run handled by the scheduler
              {timezone !== "UTC" && ` · ${timezone}`}
            </p>
          </>
        )}
      </div>
    </article>
  );
}
