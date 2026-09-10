import { RestoreJobStatusType, RESTORE_JOB_STATUS } from "shared/constants/restoreJobStatus";

import { db, and, eq, desc } from "../../index";

import { restoreJobs } from "../../schema/restore-job";
import { backupFiles } from "../../schema/backup-file";
import { backupJobs } from "../../schema/backup-job";

import { logger } from "shared/config/logger";


export interface CreateRestoreJobParams {

    jobId: string;

    backupFileId: string;

    targetDatabaseUrl: string;
    
    jobStatus: RestoreJobStatusType;
}


export class RestoreRepository {

    static async saveRestoreJob(params: CreateRestoreJobParams) {

        try{

            logger.info({ jobId: params.jobId }, "Saving restore job to database");

            const result = await db.insert(restoreJobs).values({

                id: params.jobId,

                backupFileId: params.backupFileId,

                targetDatabaseUrl: params.targetDatabaseUrl,

                status: RESTORE_JOB_STATUS.PENDING as any,

                createdAt: new Date(),

            }).returning({

                id: restoreJobs.id,
                
                targetDatabaseUrl: restoreJobs.targetDatabaseUrl,
                
                status: restoreJobs.status,

            });

            logger.info({ jobId: params.jobId }, "Restore job saved");

            return result[0];

        } catch (error) {

            logger.error({ jobId: params.jobId, error }, "Failed to save restore job");

            throw error;

        }

    }

    static async updateJobStatus(jobId: string, initialJobStatus: RestoreJobStatusType, newJobStatus: RestoreJobStatusType) {

        try{

            logger.info({ jobId, initialJobStatus, newJobStatus }, "Updating restore job status");

            const result = await db.update(restoreJobs)

                .set({

                    status: newJobStatus as any,
                
                })
                
                .where(
                
                    and(
                    
                        eq(restoreJobs.id, jobId),
                    
                        eq(restoreJobs.status, initialJobStatus as any)
                
                    )
                
                )
                
                .returning({
                
                    id: restoreJobs.id,
                
                    status: restoreJobs.status,
                
                });

            logger.info({ jobId }, "Restore job status updated");

            return result[0];

        } catch (error) {

            logger.error({ jobId, error }, "Failed to update restore job status");

            throw error;

        }

    } 

    static async getJobById(jobId: string) {
        try {
            logger.info({ jobId }, "Fetching restore job");
            const result = await db.select().from(restoreJobs).where(eq(restoreJobs.id, jobId));
            if (!result || result.length === 0) {
                return null;
            }
            return result[0];
        } catch (error) {
            logger.error({ jobId, error }, "Failed to fetch restore job");
            throw error;
        }
    }

    static async updateJobDetails(jobId: string, params: {
        status?: RestoreJobStatusType;
        startedAt?: Date;
        completedAt?: Date;
        errorMessage?: string;
    }) {
        try {
            logger.info({ jobId, params }, "Updating restore job details");
            const updatePayload: Record<string, unknown> = {};
            if (params.status) updatePayload.status = params.status;
            if (params.startedAt) updatePayload.startedAt = params.startedAt;
            if (params.completedAt) updatePayload.completedAt = params.completedAt;
            if (params.errorMessage !== undefined) updatePayload.errorMessage = params.errorMessage;

            const result = await db.update(restoreJobs)
                .set(updatePayload as any)
                .where(eq(restoreJobs.id, jobId))
                .returning();

            return result[0] || null;
        } catch (error) {
            logger.error({ jobId, error }, "Failed to update restore job details");
            throw error;
        }
    }

    static async listRestoreJobsByProjectId(projectId: string) {
        try {
            logger.info({ projectId }, "Listing restore and drill jobs for project");
            const rows = await db
                .select({
                    id: restoreJobs.id,
                    backupFileId: restoreJobs.backupFileId,
                    targetDatabaseUrl: restoreJobs.targetDatabaseUrl,
                    status: restoreJobs.status,
                    startedAt: restoreJobs.startedAt,
                    completedAt: restoreJobs.completedAt,
                    errorMessage: restoreJobs.errorMessage,
                    createdAt: restoreJobs.createdAt,
                    fileName: backupFiles.fileName,
                    fileSize: backupFiles.fileSize,
                    checksum: backupFiles.checksum,
                    backupJobId: backupFiles.backupJobId,
                })
                .from(restoreJobs)
                .innerJoin(backupFiles, eq(restoreJobs.backupFileId, backupFiles.id))
                .innerJoin(backupJobs, eq(backupFiles.backupJobId, backupJobs.id))
                .where(eq(backupJobs.projectId, projectId))
                .orderBy(desc(restoreJobs.createdAt));

            return rows;
        } catch (error) {
            logger.error({ projectId, error }, "Failed to list restore jobs by project ID");
            return [];
        }
    }
}
