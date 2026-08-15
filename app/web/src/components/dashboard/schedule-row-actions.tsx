"use client";

import { useState, useTransition } from "react";
import { IconPlayerPause, IconPlayerPlay, IconTrash } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { deleteSchedule, setScheduleActive } from "@/app/actions/schedule.actions";

/**
 * Pause / resume / delete for one schedule.
 *
 * Delete confirms in place rather than in a dialog: the row being deleted stays
 * visible while you decide, which is exactly the information the confirmation
 * needs to convey. It's also the one destructive control on the page, so it
 * reads as destructive and doesn't share the row's default styling.
 */
export function ScheduleRowActions({
  scheduleId,
  projectId,
  isActive,
}: {
  scheduleId: string;
  projectId: string;
  isActive: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<{ error?: string } | undefined>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result?.error) setError(result.error);
      else setConfirming(false);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      {confirming ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Delete this schedule?</span>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={pending}
            onClick={() => run(() => deleteSchedule(scheduleId, projectId))}
          >
            {pending ? "Deleting…" : "Delete"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() => {
              setConfirming(false);
              setError(null);
            }}
          >
            Keep
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={pending}
            onClick={() =>
              run(() => setScheduleActive(scheduleId, projectId, !isActive))
            }
          >
            {isActive ? (
              <IconPlayerPause className="size-3.5" aria-hidden />
            ) : (
              <IconPlayerPlay className="size-3.5" aria-hidden />
            )}
            {isActive ? "Pause" : "Resume"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={pending}
            onClick={() => setConfirming(true)}
          >
            <IconTrash className="size-3.5" aria-hidden />
            <span className="sr-only">Delete schedule</span>
          </Button>
        </div>
      )}

      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
