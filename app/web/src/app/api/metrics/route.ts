import { NextResponse } from "next/server";
import { db, eq, inArray, and, sql, isNull } from "db";
import { backupJobs } from "db/schema/backup-job";
import { backupFiles } from "db/schema/backup-file";
import { backupSchedules } from "db/schema/backup-schedule";
import { requireAuth, getUserAuthorizedProjectIds } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) return auth.response;

    // Strictly scope metrics to the authenticated user's accessible projects
    const { projectIds } = await getUserAuthorizedProjectIds(auth.user.id);

    const emptyJobStats = {
      completed: 0,
      failed: 0,
      in_progress: 0,
      queued: 0,
      pending: 0,
      uploading: 0,
    };

    if (projectIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          jobStats: emptyJobStats,
          totalStorageBytes: 0,
          activeSchedules: 0,
        },
      });
    }

    // 1. Backup job stats scoped to user's projects
    const jobStatsResult = await db
      .select({
        status: backupJobs.status,
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(backupJobs)
      .where(inArray(backupJobs.projectId, projectIds))
      .groupBy(backupJobs.status);

    const jobStats = { ...emptyJobStats };

    for (const row of jobStatsResult) {
      if (row.status in jobStats) {
        (jobStats as any)[row.status] = row.count;
      }
    }

    // 2. Total active storage used for user's projects (completed & unpurged)
    const storageResult = await db
      .select({
        totalBytes: sql<number>`coalesce(sum(${backupFiles.fileSize}), 0)`.mapWith(Number),
      })
      .from(backupFiles)
      .innerJoin(backupJobs, eq(backupFiles.backupJobId, backupJobs.id))
      .where(
        and(
          inArray(backupJobs.projectId, projectIds),
          eq(backupJobs.status, "completed"),
          isNull(backupFiles.purgedAt)
        )
      );

    const totalStorageBytes = storageResult[0]?.totalBytes || 0;

    // 3. Active schedules scoped to user's projects
    const activeSchedulesResult = await db
      .select({
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(backupSchedules)
      .where(
        and(
          inArray(backupSchedules.projectId, projectIds),
          eq(backupSchedules.isActive, true)
        )
      );

    const activeSchedules = activeSchedulesResult[0]?.count || 0;

    return NextResponse.json({
      success: true,
      data: {
        jobStats,
        totalStorageBytes,
        activeSchedules,
      },
    });
  } catch (error) {
    console.error("Failed to fetch metrics:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
