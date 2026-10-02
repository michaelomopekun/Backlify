import { BackupJobStatusType, BACKUP_JOB_STATUS } from "shared/constants/backupJobStatus";

import { db } from "../../client";
import { and, eq, desc, lt, or, inArray, isNull, isNotNull, ilike, sql, gte } from "drizzle-orm";

import { backupJobs } from "../../schema/backup-job";

import { backupFiles } from "../../schema/backup-file";

import { projects } from "../../schema/project";

import { logger } from "shared/config/logger";


// Statuses that mean "still moving" — the UI polls only while one of these is
// present, then stops.
export const ACTIVE_BACKUP_STATUSES = [

    BACKUP_JOB_STATUS.PENDING,

    BACKUP_JOB_STATUS.QUEUED,

    BACKUP_JOB_STATUS.IN_PROGRESS,

    BACKUP_JOB_STATUS.UPLOADING,

] as const;


export interface ListBackupsParams {

    projectId?: string;

    projectIds?: string[];

    statuses?: readonly BackupJobStatusType[];

    type?: "manual" | "scheduled";

    isPurged?: boolean;

    search?: string;

    limit?: number | null;

    offset?: number;

}

export interface ProjectBackupStats {
    totalSnapshots: number;
    activeCount: number;
    prunedCount: number;
    completedCount: number;
    failedCount: number;
    inProgressCount: number;
    scheduledCount: number;
    manualCount: number;
    totalStorageBytes: number;
    successRate: number;
    recentEvents: Array<{
        type: "manual" | "scheduled";
        status: "complete" | "in_progress" | "failed";
        createdAt: string;
    }>;
}



export interface CreateBackupJobParams {

    jobId: string;

    databaseUrl: string;

    projectId?: string;

    jobStatus: BackupJobStatusType;

    triggerType?: "manual" | "scheduled";

}


export class BackupRepository {

    static async saveBackupJob(params: CreateBackupJobParams) {

        if (!params.jobId) {

            logger.warn({jobId: params.jobId}, "Invalid backup job ID");

            return null;

        }

        try{

            const projectId = params.projectId || "default";

            logger.info({jobId: params.jobId}, "Saving backup job to database");

            const triggerType = params.triggerType || (params.jobId.includes("scheduled") ? "scheduled" : "manual");

            const result = await db.insert(backupJobs).values({

                id: params.jobId,

                projectId,

                databaseUrl: params.databaseUrl,

                status: params.jobStatus,

                triggerType,

                createdAt: new Date(),

                updatedAt: new Date(),
                
            }).returning({

                id: backupJobs.id,
                
                databaseUrl: backupJobs.databaseUrl,
                
                status: backupJobs.status,

                triggerType: backupJobs.triggerType,

            });

            logger.info({jobId: params.jobId}, "Backup job saved");

            return result[0];

        } catch (error) {

            logger.error({jobId: params.jobId, error}, "Failed to save backup job");

            throw error;

        }

    }

    static async updateJobStatus(jobId: string, initialJobStatus: BackupJobStatusType, newJobStatus: BackupJobStatusType) {

        if (!jobId) {

            logger.warn({jobId}, "Invalid backup job ID");

            return null;

        }

        try{

            logger.info({jobId, initialJobStatus, newJobStatus}, "Updating backup job status");

            const updatePayload: Record<string, unknown> = {
                status: newJobStatus as any,
                updatedAt: new Date(),
            };

            if (newJobStatus === BACKUP_JOB_STATUS.IN_PROGRESS) {
                updatePayload.startedAt = new Date();
            } else if (newJobStatus === BACKUP_JOB_STATUS.COMPLETED) {
                updatePayload.completedAt = new Date();
            } else if (newJobStatus === BACKUP_JOB_STATUS.FAILED) {
                updatePayload.failedAt = new Date();
            }

            const result = await db.update(backupJobs)
                .set(updatePayload as any)
                
                .where(
                
                    and(
                    
                        eq(backupJobs.id, jobId),
                    
                        eq(backupJobs.status, initialJobStatus as any)
                
                    )
                
                )
                
                .returning({
                
                    id: backupJobs.id,
                
                    status: backupJobs.status,
                
                });

            if (!result[0]) {

                logger.warn({ jobId, initialJobStatus, newJobStatus }, "Backup job status transition skipped (no matching current status)");

                return null;

            }

            logger.info({jobId}, "Backup job status updated");

            return result[0];

        } catch (error) {

            logger.error({jobId, error}, "Failed to update backup job status");

            throw error;

        }

    } 

    static async forceUpdateJobStatus(jobId: string, newJobStatus: BackupJobStatusType, errorMessage?: string) {

        if (!jobId) {

            logger.warn({jobId}, "Invalid backup job ID");

            return null;

        }

        try {

            logger.info({ jobId, newJobStatus }, "Force updating backup job status");

            const updatePayload: Record<string, unknown> = {

                status: newJobStatus,

                updatedAt: new Date(),

            };

            if (errorMessage !== undefined) {

                updatePayload.errorMessage = errorMessage;

            }

            if (newJobStatus === BACKUP_JOB_STATUS.IN_PROGRESS) {
                updatePayload.startedAt = new Date();
            } else if (newJobStatus === BACKUP_JOB_STATUS.COMPLETED) {
                updatePayload.completedAt = new Date();
            } else if (newJobStatus === BACKUP_JOB_STATUS.FAILED) {
                updatePayload.failedAt = new Date();
            }

            const result = await db.update(backupJobs)

                .set(updatePayload as any)

                .where(eq(backupJobs.id, jobId))

                .returning({

                    id: backupJobs.id,

                    status: backupJobs.status,

                });

            if (!result[0]) {

                logger.warn({ jobId, newJobStatus }, "Force update did not find backup job");

                return null;

            }

            logger.info({ jobId, newJobStatus }, "Backup job status force updated");

            return result[0];

        } catch (error) {

            logger.error({ jobId, error }, "Failed to force update backup job status");

            throw error;

        }

    }

    static async getJobById(jobId: string) {

        if (!jobId) {

            logger.warn({jobId}, "Invalid backup job ID");

            return null;

        }

        try {

            logger.info({jobId}, "Fetching backup job");

            const result = await db.select().from(backupJobs).where(eq(backupJobs.id, jobId));

            if (!result || result.length === 0) {

                return null;

            }

            return result[0];

        } catch (error) {

            logger.error({jobId, error}, "Failed to fetch backup job");

            throw error;

        }

    }

    static async getSuccessfulBackupsForProject(projectId: string) {

        try {

            logger.info({ projectId }, "Fetching successful backups for project");

            const result = await db.select()

                .from(backupJobs)

                .where(

                    and(

                        eq(backupJobs.projectId, projectId),

                        eq(backupJobs.status, BACKUP_JOB_STATUS.COMPLETED as any)

                    )

                )

                .orderBy(desc(backupJobs.createdAt));

            return result;

        } catch (error) {

            logger.error({ projectId, error }, "Failed to fetch successful backups");

            throw error;

        }

    }

    /**
     * Fetches completed backups that still have active (unpurged) storage files in cloud storage.
     * Used by the retention policy so it only prunes active files and leaves purged metadata alone.
     */
    static async getActiveRetainedBackupsForProject(projectId: string) {

        try {

            logger.info({ projectId }, "Fetching active retained backups for project");

            const result = await db.select({
                id: backupJobs.id,
                projectId: backupJobs.projectId,
                createdAt: backupJobs.createdAt,
                fileId: backupFiles.id,
                filePath: backupFiles.filePath,
                fileSize: backupFiles.fileSize,
            })
                .from(backupJobs)
                .innerJoin(backupFiles, eq(backupFiles.backupJobId, backupJobs.id))
                .where(
                    and(
                        eq(backupJobs.projectId, projectId),
                        eq(backupJobs.status, BACKUP_JOB_STATUS.COMPLETED as any),
                        isNull(backupFiles.purgedAt)
                    )
                )
                .orderBy(desc(backupJobs.createdAt));

            return result;

        } catch (error) {

            logger.error({ projectId, error }, "Failed to fetch active retained backups");

            throw error;

        }

    }

    /**
     * Aggregates active (completed, unpurged) backup snapshots and total storage bytes
     * for a list of project IDs directly in the database.
     */
    static async getActiveStorageStatsForProjects(projectIds: string[]): Promise<{ count: number; totalBytes: number }> {
        if (!projectIds || projectIds.length === 0) {
            return { count: 0, totalBytes: 0 };
        }

        try {
            const result = await db
                .select({
                    count: sql<number>`count(*)`.mapWith(Number),
                    totalBytes: sql<number>`coalesce(sum(${backupFiles.fileSize}), 0)`.mapWith(Number),
                })
                .from(backupJobs)
                .innerJoin(backupFiles, eq(backupFiles.backupJobId, backupJobs.id))
                .where(
                    and(
                        inArray(backupJobs.projectId, projectIds),
                        eq(backupJobs.status, BACKUP_JOB_STATUS.COMPLETED as any),
                        isNull(backupFiles.purgedAt)
                    )
                );

            return {
                count: result[0]?.count || 0,
                totalBytes: result[0]?.totalBytes || 0,
            };
        } catch (error) {
            logger.error({ projectIds, error }, "Failed to calculate active storage stats");
            return { count: 0, totalBytes: 0 };
        }
    }

    /**
     * Directly aggregates active (completed, unpurged) backup snapshots and total storage bytes
     * for an organization via a single indexed SQL join across projects, backup_jobs, and backup_files.
     */
    static async getActiveStorageStatsForOrg(orgId: string): Promise<{ count: number; totalBytes: number }> {
        if (!orgId) {
            return { count: 0, totalBytes: 0 };
        }

        try {
            const result = await db
                .select({
                    count: sql<number>`count(${backupFiles.id})`.mapWith(Number),
                    totalBytes: sql<number>`coalesce(sum(${backupFiles.fileSize}), 0)`.mapWith(Number),
                })
                .from(projects)
                .innerJoin(backupJobs, eq(backupJobs.projectId, projects.id))
                .innerJoin(backupFiles, eq(backupFiles.backupJobId, backupJobs.id))
                .where(
                    and(
                        eq(projects.orgId, orgId),
                        eq(backupJobs.status, BACKUP_JOB_STATUS.COMPLETED as any),
                        isNull(backupFiles.purgedAt)
                    )
                );

            return {
                count: result[0]?.count || 0,
                totalBytes: result[0]?.totalBytes || 0,
            };
        } catch (error) {
            logger.error({ orgId, error }, "Failed to calculate active org storage stats");
            return { count: 0, totalBytes: 0 };
        }
    }




    /**
     * Cross-project backup feed. Joins the project (for its name) and the
     * backup file (for size/download), both left joins: a job has no file
     * until it finishes uploading, and older rows may carry the "default"
     * project placeholder.
     */
    static async listBackups(params: ListBackupsParams = {}) {
        const { projectId, projectIds, statuses, type, isPurged, search, limit, offset = 0 } = params;

        try {
            if (projectIds !== undefined && projectIds.length === 0) {
                return [];
            }

            const filters = [];

            if (projectId) {
                filters.push(eq(backupJobs.projectId, projectId));
            } else if (projectIds && projectIds.length > 0) {
                filters.push(inArray(backupJobs.projectId, projectIds));
            }

            if (statuses && statuses.length > 0) {
                filters.push(inArray(backupJobs.status, statuses as any));
            }

            if (type) {
                filters.push(eq(backupJobs.triggerType, type));
            }

            if (isPurged === true) {
                filters.push(isNotNull(backupFiles.purgedAt));
            } else if (isPurged === false) {
                filters.push(isNull(backupFiles.purgedAt));
            }

            if (search && search.trim()) {
                const term = `%${search.trim()}%`;
                filters.push(
                    or(
                        ilike(backupJobs.id, term),
                        ilike(backupFiles.fileName, term)
                    )
                );
            }

            let query = db.select({
                id: backupJobs.id,
                projectId: backupJobs.projectId,
                projectName: projects.name,
                status: backupJobs.status,
                triggerType: backupJobs.triggerType,
                startedAt: backupJobs.startedAt,
                completedAt: backupJobs.completedAt,
                failedAt: backupJobs.failedAt,
                errorMessage: backupJobs.errorMessage,
                createdAt: backupJobs.createdAt,
                fileId: backupFiles.id,
                fileName: backupFiles.fileName,
                fileSize: backupFiles.fileSize,
                purgedAt: backupFiles.purgedAt,
            })
                .from(backupJobs)
                .leftJoin(projects, eq(backupJobs.projectId, projects.id))
                .leftJoin(backupFiles, eq(backupFiles.backupJobId, backupJobs.id))
                .where(filters.length > 0 ? and(...filters) : undefined)
                .orderBy(desc(backupJobs.createdAt))
                .$dynamic();

            if (typeof limit === "number" && limit > 0) {
                query = query.limit(limit);
            }

            if (typeof offset === "number" && offset > 0) {
                query = query.offset(offset);
            }

            return await query;
        } catch (error) {
            logger.error({ projectId, error }, "Failed to list backups");
            throw error;
        }
    }

    /**
     * Counts backups matching the exact filter parameters (for pagination total count).
     */
    static async countBackups(params: Omit<ListBackupsParams, "limit" | "offset"> = {}) {
        const { projectId, projectIds, statuses, type, isPurged, search } = params;

        try {
            if (projectIds !== undefined && projectIds.length === 0) {
                return 0;
            }

            const filters = [];

            if (projectId) {
                filters.push(eq(backupJobs.projectId, projectId));
            } else if (projectIds && projectIds.length > 0) {
                filters.push(inArray(backupJobs.projectId, projectIds));
            }

            if (statuses && statuses.length > 0) {
                filters.push(inArray(backupJobs.status, statuses as any));
            }

            if (type) {
                filters.push(eq(backupJobs.triggerType, type));
            }

            if (isPurged === true) {
                filters.push(isNotNull(backupFiles.purgedAt));
            } else if (isPurged === false) {
                filters.push(isNull(backupFiles.purgedAt));
            }

            if (search && search.trim()) {
                const term = `%${search.trim()}%`;
                filters.push(
                    or(
                        ilike(backupJobs.id, term),
                        ilike(backupFiles.fileName, term)
                    )
                );
            }

            const result = await db.select({
                count: sql<number>`count(distinct ${backupJobs.id})`.mapWith(Number),
            })
                .from(backupJobs)
                .leftJoin(backupFiles, eq(backupFiles.backupJobId, backupJobs.id))
                .where(filters.length > 0 ? and(...filters) : undefined);

            return result[0]?.count || 0;
        } catch (error) {
            logger.error({ projectId, error }, "Failed to count backups");
            return 0;
        }
    }

    /**
     * Computes complete project backup metrics, vault storage, and recent activity
     * in a single optimized database query.
     */
    static async getProjectBackupStats(projectId: string): Promise<ProjectBackupStats> {
        if (!projectId) {
            return {
                totalSnapshots: 0,
                activeCount: 0,
                prunedCount: 0,
                completedCount: 0,
                failedCount: 0,
                inProgressCount: 0,
                scheduledCount: 0,
                manualCount: 0,
                totalStorageBytes: 0,
                successRate: 100,
                recentEvents: [],
            };
        }

        try {
            const rows = await db
                .select({
                    totalSnapshots: sql<number>`count(${backupJobs.id})`.mapWith(Number),
                    completedCount: sql<number>`count(case when ${backupJobs.status} = 'completed' then 1 end)`.mapWith(Number),
                    failedCount: sql<number>`count(case when ${backupJobs.status} = 'failed' then 1 end)`.mapWith(Number),
                    inProgressCount: sql<number>`count(case when ${backupJobs.status} in ('pending', 'queued', 'in_progress', 'uploading') then 1 end)`.mapWith(Number),
                    scheduledCount: sql<number>`count(case when ${backupJobs.triggerType} = 'scheduled' then 1 end)`.mapWith(Number),
                    manualCount: sql<number>`count(case when ${backupJobs.triggerType} = 'manual' then 1 end)`.mapWith(Number),
                    activeCount: sql<number>`count(case when ${backupJobs.status} = 'completed' and ${backupFiles.purgedAt} is null and ${backupFiles.id} is not null then 1 end)`.mapWith(Number),
                    prunedCount: sql<number>`count(case when ${backupJobs.status} = 'completed' and ${backupFiles.purgedAt} is not null then 1 end)`.mapWith(Number),
                    totalStorageBytes: sql<number>`coalesce(sum(case when ${backupJobs.status} = 'completed' and ${backupFiles.purgedAt} is null and ${backupFiles.id} is not null then ${backupFiles.fileSize} else 0 end), 0)`.mapWith(Number),
                })
                .from(backupJobs)
                .leftJoin(backupFiles, eq(backupFiles.backupJobId, backupJobs.id))
                .where(eq(backupJobs.projectId, projectId));

            const stat = rows[0] || {
                totalSnapshots: 0,
                completedCount: 0,
                failedCount: 0,
                inProgressCount: 0,
                scheduledCount: 0,
                manualCount: 0,
                activeCount: 0,
                prunedCount: 0,
                totalStorageBytes: 0,
            };

            const totalFinished = stat.completedCount + stat.failedCount;
            const successRate = totalFinished > 0 ? Math.round((stat.completedCount / totalFinished) * 100) : 100;

            // Fetch recent 14 days of events for activity sparkline/bar
            const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
            const recent = await db
                .select({
                    status: backupJobs.status,
                    triggerType: backupJobs.triggerType,
                    createdAt: backupJobs.createdAt,
                })
                .from(backupJobs)
                .where(
                    and(
                        eq(backupJobs.projectId, projectId),
                        gte(backupJobs.createdAt, fourteenDaysAgo)
                    )
                )
                .orderBy(desc(backupJobs.createdAt));

            const recentEvents = recent.map((r) => {
                let status: "complete" | "in_progress" | "failed" = "in_progress";
                if (r.status === "completed") status = "complete";
                else if (r.status === "failed") status = "failed";

                return {
                    type: (r.triggerType === "manual" ? "manual" : "scheduled") as "manual" | "scheduled",
                    status,
                    createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
                };
            });

            return {
                totalSnapshots: stat.activeCount + stat.prunedCount,
                activeCount: stat.activeCount,
                prunedCount: stat.prunedCount,
                completedCount: stat.completedCount,
                failedCount: stat.failedCount,
                inProgressCount: stat.inProgressCount,
                scheduledCount: stat.scheduledCount,
                manualCount: stat.manualCount,
                totalStorageBytes: stat.totalStorageBytes,
                successRate,
                recentEvents,
            };
        } catch (error) {
            logger.error({ projectId, error }, "Failed to get project backup stats");
            return {
                totalSnapshots: 0,
                activeCount: 0,
                prunedCount: 0,
                completedCount: 0,
                failedCount: 0,
                inProgressCount: 0,
                scheduledCount: 0,
                manualCount: 0,
                totalStorageBytes: 0,
                successRate: 100,
                recentEvents: [],
            };
        }
    }


    static async markStalledJobsAsFailed(stalledThresholdMs: number) {

        try {

            const stalledTime = new Date(Date.now() - stalledThresholdMs);

            logger.info({ stalledTime }, "Marking stalled jobs as failed");

            
            const result = await db.update(backupJobs)

                .set({

                    status: BACKUP_JOB_STATUS.FAILED as any,

                    errorMessage: "Job timed out or worker crashed",

                    failedAt: new Date(),

                    updatedAt: new Date(),

                })

                .where(

                    and(

                        or(

                            eq(backupJobs.status, BACKUP_JOB_STATUS.IN_PROGRESS as any),

                            eq(backupJobs.status, BACKUP_JOB_STATUS.UPLOADING as any)

                        ),

                        lt(backupJobs.updatedAt, stalledTime)

                    )

                )

                .returning({ id: backupJobs.id });

                
            logger.info({ count: result.length }, "Stalled jobs marked as failed");

            return result;

        } catch (error) {

            logger.error({ error }, "Failed to mark stalled jobs as failed");

            throw error;

        }

    }


    static async deleteBackupJob(jobId: string) {

        try {

            logger.info({ jobId }, "Deleting backup job record");

            const result = await db.delete(backupJobs).where(eq(backupJobs.id, jobId)).returning();

            return result[0];

        } catch (error) {

            logger.error({ jobId, error }, "Failed to delete backup job");

            throw error;

        }

    }

}
