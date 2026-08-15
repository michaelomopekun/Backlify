import type { BackupRepository } from "db";

/**
 * The row shape both the server table and the polling client render.
 *
 * Derived from the repo's own return type so a change to the `listBackups`
 * projection surfaces here as a type error rather than a silently missing cell.
 * The API route serialises dates to strings over JSON, hence the widened
 * timestamp fields.
 */
type RepoRow = Awaited<ReturnType<typeof BackupRepository.listBackups>>[number];

export type BackupRow = Omit<
  RepoRow,
  "startedAt" | "completedAt" | "failedAt" | "createdAt"
> & {
  startedAt: Date | string | null;
  completedAt: Date | string | null;
  failedAt: Date | string | null;
  createdAt: Date | string;
};

/** When a job ended, whichever way it ended. */
export function rowEndedAt(row: BackupRow): Date | string | null {
  return row.completedAt ?? row.failedAt;
}
