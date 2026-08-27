import Link from "next/link";
import {
  IconAlertTriangle,
  IconCalendarClock,
  IconCircleCheck,
  IconDatabase,
  IconServer2,
} from "@tabler/icons-react";

import { BackupRepository } from "db";
import { notFound } from "next/navigation";

import { Panel } from "@/components/shared/card";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { FrequencyBadge } from "@/components/shared/frequency-badge";
import { LiveBackupsTable } from "@/components/projects/backups/live-backups-table";
import { RetentionForm } from "@/components/projects/settings/retention-form";
import { Button } from "@/components/ui/button";
import { formatBytes, formatRelativeTime } from "@/lib/format";
import { getProject, getProjectMetrics, getSchedulesForProject } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [project, metrics, schedules, recent] = await Promise.all([
    getProject(id),
    getProjectMetrics(id),
    getSchedulesForProject(id),
    BackupRepository.listBackups({ projectId: id, limit: 5 }),
  ]);

  if (!project) notFound();

  const activeSchedules = schedules.filter((schedule) => schedule.isActive);
  const successRate =
    metrics.totalBackups > 0
      ? Math.round((metrics.completed / metrics.totalBackups) * 100)
      : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Backups"
          value={metrics.totalBackups.toLocaleString("en-US")}
          hint={
            metrics.lastBackupAt
              ? `last ${formatRelativeTime(metrics.lastBackupAt)}`
              : "none yet"
          }
          icon={IconDatabase}
          tone="primary"
        />
        <StatCard
          label="Completed"
          value={metrics.completed.toLocaleString("en-US")}
          hint={successRate === null ? undefined : `${successRate}% success rate`}
          icon={IconCircleCheck}
          tone="success"
        />
        <StatCard
          label="Failed"
          value={metrics.failed.toLocaleString("en-US")}
          hint={metrics.failed > 0 ? "needs a look" : "nothing to fix"}
          icon={IconAlertTriangle}
          tone={metrics.failed > 0 ? "destructive" : "neutral"}
        />
        <StatCard
          label="Stored"
          value={formatBytes(metrics.storageBytes)}
          hint={
            activeSchedules.length === 1
              ? "1 active schedule"
              : `${activeSchedules.length} active schedules`
          }
          icon={IconServer2}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {/* The table draws its own bordered card, so it sits in a plain section
            rather than a Panel — same treatment as the dashboard's feed. */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-foreground">Latest backups</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/dashboard/projects/${id}/backups`}>View all</Link>
            </Button>
          </div>

          {recent.length > 0 ? (
            <LiveBackupsTable
              initialRows={recent}
              projectId={id}
              showProject={false}
            />
          ) : (
            <EmptyState
              icon={IconDatabase}
              title="No backups yet"
              description="Use Back up now to take the first one, or add a schedule so it happens on its own."
            />
          )}
        </section>

        <div className="grid gap-4">
          <Panel
            title="Schedules"
            action={
              <Button asChild variant="ghost" size="sm">
                <Link href={`/dashboard/projects/${id}/schedules`}>Manage</Link>
              </Button>
            }
          >
            {schedules.length > 0 ? (
              <ul className="space-y-3">
                {schedules.slice(0, 4).map((schedule) => (
                  <li
                    key={schedule.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <FrequencyBadge expression={schedule.cronExpression} />
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {schedule.isActive ? "Active" : "Paused"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={IconCalendarClock}
                title="No schedule"
                description="Backups only run when you start them."
                action={
                  <Button asChild size="sm">
                    <Link href={`/dashboard/projects/${id}/schedules`}>
                      Add a schedule
                    </Link>
                  </Button>
                }
                className="border-0 py-2"
              />
            )}
          </Panel>

          <Panel title="Retention">
            <RetentionForm
              projectId={id}
              initialValue={project.retentionCount ?? 7}
            />
          </Panel>
        </div>
      </div>
    </div>
  );
}
