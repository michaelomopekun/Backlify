import { RestoreJobStatusType, RESTORE_JOB_STATUS } from "shared/constants/restoreJobStatus";

import { db, and, eq } from "../../index";

import { restoreJobs } from "../../schema/restore-job";

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

}
