import { IconDatabaseOff } from "@tabler/icons-react";

import { Panel } from "@/components/dashboard/card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { RestoreForm } from "@/components/dashboard/restore-form";
import { formatTableDateTime, jobDuration } from "@/lib/format";
import { getRestorableBackups, getRestoreJobsForProject } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ProjectRestorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [backups, history] = await Promise.all([
    getRestorableBackups(id),
    getRestoreJobsForProject(id),
  ]);

  return (
    <div className="space-y-6">
      {backups.length === 0 ? (
        <EmptyState
          icon={IconDatabaseOff}
          title="Nothing to restore from"
          description="A restore needs a completed backup with a stored file. Run a backup first and it becomes available here."
        />
      ) : (
        <Panel title="Restore a backup">
          <RestoreForm projectId={id} backups={backups} />
        </Panel>
      )}

      {history.length > 0 && (
        <Panel title="Restore history" bodyClassName="p-0">
          <ul className="divide-y divide-border">
            {history.map((job) => (
              <li key={job.id} className="px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">
                      {job.fileName}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatTableDateTime(job.createdAt)}
                      {" · "}
                      {jobDuration(job.startedAt, job.completedAt)}
                    </p>
                  </div>
                  <StatusBadge status={job.status} />
                </div>

                {/* The target database is deliberately not shown — it's a live
                    credential, and the file plus timestamp identify the run. */}
                {job.errorMessage && (
                  <p className="mt-2 text-xs text-destructive">
                    {job.errorMessage}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
