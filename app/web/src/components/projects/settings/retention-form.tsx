"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { updateRetention } from "@/app/actions/backup.actions";

/**
 * How many backups this project keeps.
 *
 * Says what the number means in plain terms — the retention count is the count
 * of backups kept, not days, and getting that wrong costs someone a restore
 * point. Saved state is announced in place rather than as a toast so the
 * confirmation sits next to the thing it confirms.
 */
export function RetentionForm({
  projectId,
  initialValue,
}: {
  projectId: string;
  initialValue: number;
}) {
  const [value, setValue] = useState(String(initialValue));
  const [message, setMessage] = useState<
    { kind: "error" | "saved"; text: string } | null
  >(null);
  const [pending, startTransition] = useTransition();

  const parsed = Number(value);
  const dirty = parsed !== initialValue;

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const result = await updateRetention(projectId, parsed);
      if (result?.error) {
        setMessage({ kind: "error", text: result.error });
        return;
      }
      setMessage({
        kind: "saved",
        text: `Keeping the last ${parsed} ${parsed === 1 ? "backup" : "backups"}.`,
      });
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="flex items-end gap-3">
        <div className="space-y-1.5">
          <label
            htmlFor="retentionCount"
            className="block text-xs font-medium text-muted-foreground"
          >
            Backups to keep
          </label>
          <input
            id="retentionCount"
            name="retentionCount"
            type="number"
            min={1}
            max={365}
            step={1}
            inputMode="numeric"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="h-9 w-24 rounded-lg border border-input bg-background px-3 text-sm text-foreground tabular-nums focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          />
        </div>
        <Button
          type="submit"
          variant="secondary"
          size="lg"
          disabled={pending || !dirty || !Number.isInteger(parsed) || parsed < 1}
        >
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Older backups beyond this count are removed after a successful run.
      </p>

      {message && (
        <p
          role={message.kind === "error" ? "alert" : "status"}
          className={
            message.kind === "error"
              ? "text-xs text-destructive"
              : "text-xs text-success"
          }
        >
          {message.text}
        </p>
      )}
    </form>
  );
}
