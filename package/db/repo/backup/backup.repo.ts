import { BackupJobStatusType, BACKUP_JOB_STATUS } from "shared/constants/backupJobStatus";

import { db, and, eq, desc, lt, or, inArray, isNull } from "../../index";

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

    statuses?: readonly BackupJobStatusType[];

    limit?: number;

    offset?: number;

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
     * Cross-project backup feed. Joins the project (for its name) and the
     * backup file (for size/download), both left joins: a job has no file
     * until it finishes uploading, and older rows may carry the "default"
     * project placeholder.
     */
    static async listBackups(params: ListBackupsParams = {}) {

        const { projectId, statuses, limit = 50, offset = 0 } = params;

        try {

            const filters = [];

            if (projectId) {

                filters.push(eq(backupJobs.projectId, projectId));

            }

            if (statuses && statuses.length > 0) {

                filters.push(inArray(backupJobs.status, statuses as any));

            }

            const rows = await db.select({

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

                .limit(limit)

                .offset(offset);

            return rows;

        } catch (error) {

            logger.error({ projectId, error }, "Failed to list backups");

            throw error;

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
