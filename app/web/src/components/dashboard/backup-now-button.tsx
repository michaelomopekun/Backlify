"use client";

import { useState, useTransition } from "react";
import { IconLoader2, IconPlayerPlay } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { triggerBackup } from "@/app/actions/backup.actions";

/**
 * Starts a backup for one project.
 *
 * The label goes "Back up now" -> "Starting…" and the row it creates carries the
 * status from there, so the button doesn't pretend to track the whole job.
 *
 * Errors render next to the button rather than in a toast — the failure belongs
 * to this control, and a toast would disappear before the reader could act on it.
 */
export function BackupNowButton({
  projectId,
  variant = "default",
  size = "default",
}: {
  projectId: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    setError(null);
    startTransition(async () => {
      const result = await triggerBackup(projectId);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={onClick}
        disabled={pending}
      >
        {pending ? (
          <IconLoader2
            className="size-4 animate-spin motion-reduce:animate-none"
            aria-hidden
          />
        ) : (
          <IconPlayerPlay className="size-4" aria-hidden />
        )}
        {pending ? "Starting…" : "Back up now"}
      </Button>
      {error && (
        <p role="alert" className="max-w-xs text-right text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
