import { BackupJobStatusType, BACKUP_JOB_STATUS } from "shared/constants/backupJobStatus";

import { db, and, eq, desc, lt, or } from "../../index";

import { backupJobs } from "../../schema/backup-job";

import { logger } from "shared/config/logger";



export interface CreateBackupJobParams {

    jobId: string;

    databaseUrl: string;

    projectId?: string;

    jobStatus: BackupJobStatusType;

}


export class BackupRepository {

    static async saveBackupJob(params: CreateBackupJobParams) {

        try{

            const projectId = params.projectId || "default";

            logger.info({jobId: params.jobId}, "Saving backup job to database");

            const result = await db.insert(backupJobs).values({

                id: params.jobId,

                projectId,

                databaseUrl: params.databaseUrl,

                status: params.jobStatus,

                createdAt: new Date(),

                updatedAt: new Date(),
                
            }).returning({

                id: backupJobs.id,
                
                databaseUrl: backupJobs.databaseUrl,
                
                status: backupJobs.status,

            });

            logger.info({jobId: params.jobId}, "Backup job saved");

            return result[0];

        } catch (error) {

            logger.error({jobId: params.jobId, error}, "Failed to save backup job");

            throw error;

        }

    }

    static async updateJobStatus(jobId: string, initialJobStatus: BackupJobStatusType, newJobStatus: BackupJobStatusType) {

        try{

            logger.info({jobId, initialJobStatus, newJobStatus}, "Updating backup job status");

            const result = await db.update(backupJobs)

                .set({

                    status: newJobStatus as any,
                    
                    updatedAt: new Date(),
                
                })
                
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

            logger.info({jobId}, "Backup job status updated");

            return result[0];

        } catch (error) {

            logger.error({jobId, error}, "Failed to update backup job status");

            throw error;

        }

    } 

    static async getJobById(jobId: string) {

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
