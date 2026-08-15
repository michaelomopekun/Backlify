import Link from "next/link";
import {
  IconAlertTriangle,
  IconCalendarClock,
  IconCircleCheck,
  IconDatabase,
  IconServer2,
} from "@tabler/icons-react";

import { BackupRepository } from "db";

import { Topbar } from "@/components/dashboard/topbar";
import { StatCard } from "@/components/dashboard/stat-card";
import { Panel } from "@/components/dashboard/card";
import { BackupChart } from "@/components/dashboard/backup-chart";
import { StorageDonut } from "@/components/dashboard/storage-donut";
import { UpcomingBackupCard } from "@/components/dashboard/upcoming-backup-card";
import { LiveBackupsTable } from "@/components/dashboard/live-backups-table";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/format";
import {
  getBackupsPerDay,
  getDashboardMetrics,
  getStorageByProject,
  getUpcomingBackups,
} from "@/lib/queries";

// Reads live job state — never serve this from the full route cache.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [metrics, chartData, storage, upcoming, recent] = await Promise.all([
    getDashboardMetrics(),
    getBackupsPerDay(14),
    getStorageByProject(),
    getUpcomingBackups(3),
    BackupRepository.listBackups({ limit: 8 }),
  ]);

  const successRate =
    metrics.totalBackups > 0
      ? Math.round((metrics.completed / metrics.totalBackups) * 100)
      : null;

  return (
    <>
      <Topbar
        title="Dashboard"
        description="Every backup across your projects."
      />

      <div className="space-y-6 px-6 py-6 lg:px-8">
        {/* The four-up row maps onto what the metrics query actually returns. */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total backups"
            value={metrics.totalBackups.toLocaleString("en-US")}
            hint={
              metrics.projectCount === 1
                ? "across 1 project"
                : `across ${metrics.projectCount} projects`
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
            label="Storage used"
            value={formatBytes(metrics.storageBytes)}
            hint={
              metrics.activeSchedules === 1
                ? "1 active schedule"
                : `${metrics.activeSchedules} active schedules`
            }
            icon={IconServer2}
          />
        </div>

        {/* SVG: 702×341 chart beside a 427×330 panel -> 12-col split at xl. */}
        <div className="grid gap-4 xl:grid-cols-[minmax(0,702fr)_minmax(0,427fr)]">
          <Panel title="Backups over time">
            {metrics.totalBackups > 0 ? (
              <BackupChart data={chartData} />
            ) : (
              <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
                No backups yet — the chart fills in as jobs run.
              </div>
            )}
          </Panel>

          <Panel title="Storage by project">
            {storage.length > 0 ? (
              <StorageDonut slices={storage} />
            ) : (
              <div className="flex h-[260px] items-center justify-center text-center text-sm text-muted-foreground">
                Nothing stored yet.
              </div>
            )}
          </Panel>
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-foreground">
              Upcoming backups
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/projects">Manage schedules</Link>
            </Button>
          </div>

          {upcoming.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {upcoming.map((schedule) => (
                <UpcomingBackupCard
                  key={schedule.scheduleId}
                  projectId={schedule.projectId}
                  projectName={schedule.projectName}
                  cronExpression={schedule.cronExpression}
                  timezone={schedule.timezone}
                  nextRunAt={schedule.nextRunAt}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={IconCalendarClock}
              title="No backups scheduled"
              description="Add a schedule to a project and its next run will show up here."
              action={
                <Button asChild size="sm">
                  <Link href="/dashboard/projects">Go to projects</Link>
                </Button>
              }
            />
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-foreground">Recent backups</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/backups">View all</Link>
            </Button>
          </div>

          {recent.length > 0 ? (
            <LiveBackupsTable initialRows={recent} />
          ) : (
            <EmptyState
              icon={IconDatabase}
              title="No backups yet"
              description="Connect a project and run your first backup to see it here."
              action={
                <Button asChild size="sm">
                  <Link href="/dashboard/projects">Add a project</Link>
                </Button>
              }
            />
          )}
        </section>
      </div>
    </>
  );
}
