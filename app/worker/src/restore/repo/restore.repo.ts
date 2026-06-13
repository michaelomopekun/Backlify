import { logger } from "../../config/logger";

import { RestoreJobData } from "../queue/restore.queue";

import { RestoreJobStatusType, RESTORE_JOB_STATUS } from "shared/constants/restoreJobStatus";

import { db } from "db";

import { restoreJobs } from "db/schema/restore-job";

import { and, eq } from "db";



export class RestoreRepository {

    static async saveRestoreJob(jobData: RestoreJobData) {

        try{

            logger.info({ jobId: jobData.jobId }, "Saving restore job to database");

            const result = await db.insert(restoreJobs).values({

                id: jobData.jobId,

                backupFileId: jobData.backupFileId,

                targetDatabaseUrl: jobData.targetDatabaseUrl,

                status: RESTORE_JOB_STATUS.PENDING as any,

                createdAt: new Date(),

            }).returning({

                id: restoreJobs.id,
                
                targetDatabaseUrl: restoreJobs.targetDatabaseUrl,
                
                status: restoreJobs.status,

            });

            logger.info({ jobId: jobData.jobId }, "Restore job saved");

            return result[0];

        } catch (error) {

            logger.error({ error, jobId: jobData.jobId }, "Failed to save restore job");

            throw error;

        }

    }

    static async updateJobStatus(jobId: string, initialJobStatus: RestoreJobStatusType, newJobStatus: RestoreJobStatusType) {

        try{

            logger.info({ jobId, initialJobStatus, newJobStatus }, "Updating restore job status");

            const result = await db.update(restoreJobs)

                .set({

                    status: newJobStatus as any,
                    
                    // updatedAt: new Date(), // TODO: add updatedAt to restore-job schema later
                
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

            logger.info({ jobId, newJobStatus }, "Restore job status updated");

            return result[0];

        } catch (error) {

            logger.error({ error, jobId }, "Failed to update restore job status");

            throw error;

        }

    } 
}
