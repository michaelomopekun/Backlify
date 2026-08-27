import { cache } from "react";

import {
  and,
  backupFiles,
  backupJobs,
  backupSchedules,
  db,
  desc,
  eq,
  gte,
  projects,
  ProjectRepository,
  restoreJobs,
  sql,
} from "db";
import { BACKUP_JOB_STATUS } from "shared/constants/backupJobStatus";

import type { BackupChartPoint } from "@/components/projects/backups/backup-chart";
import type { StorageSlice } from "@/components/shared/storage-donut";

/**
 * Read models for the dashboard pages.
 *
 * Server components query here directly rather than fetching their own API
 * routes — an RSC calling its own HTTP endpoint pays a round trip and loses the
 * types for no benefit. `/api/*` stays the surface for the client poller and
 * anything external.
 */

/**
 * One project, deduped per render.
 *
 * The project detail layout and its tab page both need the project, and they
 * render in the same pass — `cache` collapses that into a single query instead
 * of two identical ones.
 */
export const getProject = cache(async (id: string) =>
  ProjectRepository.getProjectById(id)
);

export interface DashboardMetrics {
  totalBackups: number;
  completed: number;
  failed: number;
  storageBytes: number;
  activeSchedules: number;
  projectCount: number;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [statusRows, storageRow, scheduleRow, projectRow] = await Promise.all([
    db
      .select({
        status: backupJobs.status,
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(backupJobs)
      .groupBy(backupJobs.status),
    db
      .select({
        totalBytes: sql<number>`coalesce(sum(${backupFiles.fileSize}), 0)`.mapWith(
          Number
        ),
      })
      .from(backupFiles),
    db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(backupSchedules)
      .where(eq(backupSchedules.isActive, true)),
    db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(projects),
  ]);

  let totalBackups = 0;
  let completed = 0;
  let failed = 0;

  for (const row of statusRows) {
    totalBackups += row.count;
    if (row.status === BACKUP_JOB_STATUS.COMPLETED) completed = row.count;
    if (row.status === BACKUP_JOB_STATUS.FAILED) failed = row.count;
  }

  return {
    totalBackups,
    completed,
    failed,
    storageBytes: storageRow[0]?.totalBytes ?? 0,
    activeSchedules: scheduleRow[0]?.count ?? 0,
    projectCount: projectRow[0]?.count ?? 0,
  };
}

/**
 * Daily buckets for the chart. Zero-fills the range in JS so quiet days render
 * as gaps in the bars rather than being dropped and silently compressing the
 * time axis.
 */
export async function getBackupsPerDay(days = 14): Promise<BackupChartPoint[]> {
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - (days - 1));

  const rows = await db
    .select({
      day: sql<string>`to_char(date_trunc('day', ${backupJobs.createdAt}), 'YYYY-MM-DD')`,
      status: backupJobs.status,
      count: sql<number>`count(*)`.mapWith(Number),
      bytes: sql<number>`coalesce(sum(${backupFiles.fileSize}), 0)`.mapWith(Number),
    })
    .from(backupJobs)
    .leftJoin(backupFiles, eq(backupFiles.backupJobId, backupJobs.id))
    .where(gte(backupJobs.createdAt, since))
    .groupBy(sql`date_trunc('day', ${backupJobs.createdAt})`, backupJobs.status);

  const buckets = new Map<string, BackupChartPoint>();
  const labelFor = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date(since);
    date.setUTCDate(since.getUTCDate() + offset);
    const key = date.toISOString().slice(0, 10);
    buckets.set(key, {
      date: key,
      label: labelFor.format(date),
      completed: 0,
      failed: 0,
      bytes: 0,
    });
  }

  for (const row of rows) {
    const bucket = buckets.get(row.day);
    if (!bucket) continue;
    if (row.status === BACKUP_JOB_STATUS.FAILED) bucket.failed += row.count;
    else bucket.completed += row.count;
    bucket.bytes += row.bytes;
  }

  return [...buckets.values()];
}

export async function getStorageByProject(): Promise<StorageSlice[]> {
  const rows = await db
    .select({
      projectId: backupJobs.projectId,
      name: projects.name,
      bytes: sql<number>`coalesce(sum(${backupFiles.fileSize}), 0)`.mapWith(Number),
    })
    .from(backupFiles)
    .innerJoin(backupJobs, eq(backupFiles.backupJobId, backupJobs.id))
    .leftJoin(projects, eq(backupJobs.projectId, projects.id))
    .groupBy(backupJobs.projectId, projects.name);

  return rows.map((row) => ({
    projectId: row.projectId,
    name: row.name ?? row.projectId,
    bytes: row.bytes,
  }));
}

/**
 * Active schedules for the "Upcoming backups" panel.
 *
 * `nextRunAt` is nullable and currently *always* null: BullMQ owns the repeat
 * pattern, and nothing in the app writes that column back. So this does not
 * filter on it — doing so would leave the panel permanently empty even with
 * schedules configured. Rows with a known fire time sort first; the rest fall
 * back to their cadence, and the card says so rather than guessing.
 */
export async function getUpcomingBackups(limit = 3) {
  return db
    .select({
      scheduleId: backupSchedules.id,
      projectId: backupSchedules.projectId,
      projectName: projects.name,
      cronExpression: backupSchedules.cronExpression,
      timezone: backupSchedules.timezone,
      nextRunAt: backupSchedules.nextRunAt,
      lastRunAt: backupSchedules.lastRunAt,
    })
    .from(backupSchedules)
    .leftJoin(projects, eq(backupSchedules.projectId, projects.id))
    .where(eq(backupSchedules.isActive, true))
    .orderBy(sql`${backupSchedules.nextRunAt} asc nulls last`)
    .limit(limit);
}

export async function getSchedulesForProject(projectId: string) {
  return db
    .select()
    .from(backupSchedules)
    .where(eq(backupSchedules.projectId, projectId))
    .orderBy(desc(backupSchedules.createdAt));
}

export interface ProjectMetrics {
  totalBackups: number;
  completed: number;
  failed: number;
  storageBytes: number;
  lastBackupAt: Date | null;
}

/** The same rollup as the list page, scoped to one project. */
export async function getProjectMetrics(
  projectId: string
): Promise<ProjectMetrics> {
  const [statusRows, storageRow] = await Promise.all([
    db
      .select({
        status: backupJobs.status,
        count: sql<number>`count(*)`.mapWith(Number),
        lastAt: sql<Date | null>`max(${backupJobs.createdAt})`,
      })
      .from(backupJobs)
      .where(eq(backupJobs.projectId, projectId))
      .groupBy(backupJobs.status),
    db
      .select({
        totalBytes: sql<number>`coalesce(sum(${backupFiles.fileSize}), 0)`.mapWith(
          Number
        ),
      })
      .from(backupFiles)
      .innerJoin(backupJobs, eq(backupFiles.backupJobId, backupJobs.id))
      .where(eq(backupJobs.projectId, projectId)),
  ]);

  let totalBackups = 0;
  let completed = 0;
  let failed = 0;
  let lastBackupAt: Date | null = null;

  for (const row of statusRows) {
    totalBackups += row.count;
    if (row.status === BACKUP_JOB_STATUS.COMPLETED) completed = row.count;
    if (row.status === BACKUP_JOB_STATUS.FAILED) failed = row.count;

    const at = row.lastAt ? new Date(row.lastAt) : null;
    if (at && (!lastBackupAt || at > lastBackupAt)) lastBackupAt = at;
  }

  return {
    totalBackups,
    completed,
    failed,
    storageBytes: storageRow[0]?.totalBytes ?? 0,
    lastBackupAt,
  };
}

/**
 * Backups that can actually be restored: completed, and with a stored file.
 *
 * A completed job whose file row is missing isn't restorable — the restore queue
 * takes a `backupFileId`, not a job id — so the join is an inner one and the
 * picker only ever offers real targets.
 */
export async function getRestorableBackups(projectId: string) {
  return db
    .select({
      backupFileId: backupFiles.id,
      fileName: backupFiles.fileName,
      fileSize: backupFiles.fileSize,
      isEncrypted: backupFiles.isEncrypted,
      jobId: backupJobs.id,
      createdAt: backupJobs.createdAt,
      completedAt: backupJobs.completedAt,
    })
    .from(backupFiles)
    .innerJoin(backupJobs, eq(backupFiles.backupJobId, backupJobs.id))
    .where(
      and(
        eq(backupJobs.projectId, projectId),
        eq(backupJobs.status, BACKUP_JOB_STATUS.COMPLETED)
      )
    )
    .orderBy(desc(backupJobs.createdAt))
    .limit(50);
}

/** Restore history for a project, newest first. */
export async function getRestoreJobsForProject(projectId: string, limit = 20) {
  return db
    .select({
      id: restoreJobs.id,
      status: restoreJobs.status,
      startedAt: restoreJobs.startedAt,
      completedAt: restoreJobs.completedAt,
      errorMessage: restoreJobs.errorMessage,
      createdAt: restoreJobs.createdAt,
      fileName: backupFiles.fileName,
    })
    .from(restoreJobs)
    .innerJoin(backupFiles, eq(restoreJobs.backupFileId, backupFiles.id))
    .innerJoin(backupJobs, eq(backupFiles.backupJobId, backupJobs.id))
    .where(eq(backupJobs.projectId, projectId))
    .orderBy(desc(restoreJobs.createdAt))
    .limit(limit);
}

/** Per-project rollup for the projects list — one query, not N. */
export async function getProjectSummaries() {
  const rows = await db
    .select({
      projectId: backupJobs.projectId,
      total: sql<number>`count(*)`.mapWith(Number),
      failed:
        sql<number>`count(*) filter (where ${backupJobs.status} = ${BACKUP_JOB_STATUS.FAILED})`.mapWith(
          Number
        ),
      lastBackupAt: sql<Date | null>`max(${backupJobs.createdAt})`,
    })
    .from(backupJobs)
    .groupBy(backupJobs.projectId);

  const storage = await db
    .select({
      projectId: backupJobs.projectId,
      bytes: sql<number>`coalesce(sum(${backupFiles.fileSize}), 0)`.mapWith(Number),
    })
    .from(backupFiles)
    .innerJoin(backupJobs, eq(backupFiles.backupJobId, backupJobs.id))
    .groupBy(backupJobs.projectId);

  const bytesById = new Map(storage.map((row) => [row.projectId, row.bytes]));

  return new Map(
    rows.map((row) => [
      row.projectId,
      {
        total: row.total,
        failed: row.failed,
        lastBackupAt: row.lastBackupAt,
        bytes: bytesById.get(row.projectId) ?? 0,
      },
    ])
  );
}
