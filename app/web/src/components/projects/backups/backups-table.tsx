import Link from "next/link";
import { IconDownload } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { formatBytes, formatTableDateTime, jobDuration } from "@/lib/format";
import { StatusBadge } from "@/components/shared/status-badge";
import { rowEndedAt, type BackupRow } from "./backup-row";

/**
 * The backups table. Server-rendered; `live-backup-rows.tsx` wraps it when
 * anything is still in flight.
 *
 * A failed row shows its error under the project name rather than hiding it
 * behind a tooltip — the reason a backup failed is the first thing the reader
 * came to find out.
 */
export function BackupsTable({
  rows,
  showProject = true,
  className,
}: {
  rows: BackupRow[];
  showProject?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("overflow-x-auto rounded-xl border border-border", className)}>
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <caption className="sr-only">Backup jobs, newest first</caption>
        <thead>
          <tr className="border-b border-border bg-muted/40 text-left">
            {showProject && <Th>Project</Th>}
            <Th>Status</Th>
            <Th>Size</Th>
            <Th>Duration</Th>
            <Th>Started</Th>
            <Th className="text-right">
              <span className="sr-only">Actions</span>
            </Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/40"
            >
              {showProject && (
                <Td>
                  <Link
                    href={`/dashboard/project/${row.projectId}`}
                    className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    {row.projectName ?? row.projectId}
                  </Link>
                  {row.errorMessage && (
                    <p className="mt-0.5 max-w-xs truncate text-xs text-destructive">
                      {row.errorMessage}
                    </p>
                  )}
                </Td>
              )}
              <Td>
                <StatusBadge status={row.status} />
              </Td>
              <Td className="tabular-nums text-muted-foreground">
                {formatBytes(row.fileSize)}
              </Td>
              <Td className="tabular-nums text-muted-foreground">
                {jobDuration(row.startedAt, rowEndedAt(row))}
              </Td>
              <Td className="whitespace-nowrap text-muted-foreground">
                {formatTableDateTime(row.startedAt ?? row.createdAt)}
              </Td>
              <Td className="text-right">
                {row.fileId ? (
                  <a
                    href={`/api/backups/${row.id}/download`}
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <IconDownload className="size-3.5" aria-hidden />
                    Download
                    <span className="sr-only">
                      {" "}
                      {row.fileName ?? "backup"}
                    </span>
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={cn(
        "px-4 py-2.5 text-xs font-medium tracking-wide text-muted-foreground uppercase",
        className
      )}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={cn("px-4 py-3 align-middle", className)}>{children}</td>;
}
