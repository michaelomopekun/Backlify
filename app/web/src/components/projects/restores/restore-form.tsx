"use client";

import { useState, useTransition } from "react";
import { IconAlertTriangle } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { formatBytes, formatTableDateTime } from "@/lib/format";
import { triggerRestore } from "@/app/actions/restore.actions";

/**
 * Restore a backup into a database.
 *
 * The only irreversible thing in the product, so it's built to be slow on
 * purpose: pick the exact backup, name the target explicitly, and type the word
 * before the button enables. No default target — pre-filling the project's own
 * connection string would make overwriting production a two-click accident.
 *
 * The warning states what happens in plain terms rather than shouting. People
 * who restore know what they're doing; they need the facts, not alarm.
 */

export interface RestorableBackup {
  backupFileId: string;
  fileName: string;
  fileSize: number | null;
  createdAt: Date | string;
}

export function RestoreForm({
  projectId,
  backups,
}: {
  projectId: string;
  backups: RestorableBackup[];
}) {
  const [backupFileId, setBackupFileId] = useState(
    backups[0]?.backupFileId ?? ""
  );
  const [targetDatabaseUrl, setTargetDatabaseUrl] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<
    { kind: "error" | "started"; text: string } | null
  >(null);
  const [pending, startTransition] = useTransition();

  const ready =
    backupFileId !== "" &&
    /^postgres(ql)?:\/\//i.test(targetDatabaseUrl.trim()) &&
    confirm.trim() === "RESTORE";

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const formData = new FormData();
    formData.set("projectId", projectId);
    formData.set("backupFileId", backupFileId);
    formData.set("targetDatabaseUrl", targetDatabaseUrl.trim());
    formData.set("confirm", confirm.trim());

    startTransition(async () => {
      const result = await triggerRestore(formData);
      if (result?.error) {
        setMessage({ kind: "error", text: result.error });
        return;
      }
      setConfirm("");
      setTargetDatabaseUrl("");
      setMessage({
        kind: "started",
        text: "Restore queued. It appears in the history below as it runs.",
      });
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
        <IconAlertTriangle
          className="mt-0.5 size-4 shrink-0 text-destructive"
          aria-hidden
        />
        <div className="text-sm text-foreground">
          <p className="font-medium">A restore replaces the target database.</p>
          <p className="mt-1 text-muted-foreground">
            Everything currently in the database you name below is overwritten by
            the contents of the backup. There is no undo.
          </p>
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-xs font-medium text-muted-foreground">
          Backup to restore
        </legend>
        <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-border p-2">
          {backups.map((backup) => {
            const checked = backupFileId === backup.backupFileId;
            return (
              <label
                key={backup.backupFileId}
                className={
                  "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50 " +
                  (checked ? "bg-secondary" : "hover:bg-muted")
                }
              >
                <input
                  type="radio"
                  name="backupFileId"
                  value={backup.backupFileId}
                  checked={checked}
                  onChange={() => setBackupFileId(backup.backupFileId)}
                  className="size-4 shrink-0 accent-primary"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-foreground">
                    {formatTableDateTime(backup.createdAt)}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {backup.fileName}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {formatBytes(backup.fileSize)}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="space-y-1.5">
        <label
          htmlFor="targetDatabaseUrl"
          className="block text-xs font-medium text-muted-foreground"
        >
          Restore into
        </label>
        <input
          id="targetDatabaseUrl"
          name="targetDatabaseUrl"
          type="password"
          autoComplete="off"
          spellCheck={false}
          placeholder="postgresql://user:password@host:5432/db"
          value={targetDatabaseUrl}
          onChange={(event) => setTargetDatabaseUrl(event.target.value)}
          className="h-9 w-full max-w-xl rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        />
        <p className="text-xs text-muted-foreground">
          Name the target explicitly — a restore can go to a staging copy just as
          easily as back to the original.
        </p>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="confirm"
          className="block text-xs font-medium text-muted-foreground"
        >
          Type RESTORE to confirm
        </label>
        <input
          id="confirm"
          name="confirm"
          autoComplete="off"
          spellCheck={false}
          placeholder="RESTORE"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          className="h-9 w-40 rounded-lg border border-input bg-background px-3 font-mono text-sm tracking-wider text-foreground placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        />
      </div>

      {message && (
        <p
          role={message.kind === "error" ? "alert" : "status"}
          className={
            message.kind === "error"
              ? "text-sm text-destructive"
              : "text-sm text-success"
          }
        >
          {message.text}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" disabled={pending || !ready}>
          {pending ? "Starting restore…" : "Start restore"}
        </Button>
        {!ready && !pending && (
          <p className="text-xs text-muted-foreground">
            Pick a backup, name the target, and type RESTORE.
          </p>
        )}
      </div>
    </form>
  );
}
