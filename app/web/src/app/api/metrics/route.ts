import { NextResponse } from "next/server";
 
import { db, eq, sql } from "db";
 
import { backupJobs } from "db/schema/backup-job";
 
import { backupFiles } from "db/schema/backup-file";
 
import { backupSchedules } from "db/schema/backup-schedule";
 
 
 
export const dynamic = 'force-dynamic';
 
 
 
export async function GET() {
 
    try {
 
        // 1. Backup job stats
 
        const jobStatsResult = await db.select({
 
            status: backupJobs.status,
 
            count: sql<number>`count(*)`.mapWith(Number)
 
        }).from(backupJobs).groupBy(backupJobs.status);
 
 
        const jobStats = {
 
            completed: 0,
 
            failed: 0,
 
            in_progress: 0,
 
            queued: 0,
 
            pending: 0,
 
            uploading: 0
 
        };
 
 
        for (const row of jobStatsResult) {
 
            if (row.status in jobStats) {
 
                (jobStats as any)[row.status] = row.count;
 
            }
 
        }
 
 
        // 2. Total storage used
 
        const storageResult = await db.select({
 
            totalBytes: sql<number>`sum(${backupFiles.fileSize})`.mapWith(Number)
 
        }).from(backupFiles);
 
 
        const totalStorageBytes = storageResult[0]?.totalBytes || 0;
 
 
        // 3. Active schedules
 
        const activeSchedulesResult = await db.select({
 
            count: sql<number>`count(*)`.mapWith(Number)
 
        }).from(backupSchedules).where(eq(backupSchedules.isActive, true));
 
 
        const activeSchedules = activeSchedulesResult[0]?.count || 0;
 
 
        return NextResponse.json({
 
            success: true,
 
            data: {
 
                jobStats,
 
                totalStorageBytes,
 
                activeSchedules
 
            }
 
        });
 
 
    } catch (error) {
 
        console.error("Failed to fetch metrics:", error);
 
        return NextResponse.json({
 
            success: false,
 
            message: "Internal server error",
 
            details: error instanceof Error ? error.message : String(error)
 
        }, { status: 500 });
 
    }
 
}
 
