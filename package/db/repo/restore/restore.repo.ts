import { RestoreJobStatusType, RESTORE_JOB_STATUS } from "shared/constants/restoreJobStatus";

import { db, and, eq } from "../../index";

import { restoreJobs } from "../../schema/restore-job";


export interface CreateRestoreJobParams {

    jobId: string;

    backupFileId: string;

    targetDatabaseUrl: string;
    
    jobStatus: RestoreJobStatusType;
}


export class RestoreRepository {

    static async saveRestoreJob(params: CreateRestoreJobParams) {

        try{

            console.log(`[DB] Saving restore job to database: ${params.jobId}`);

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

            console.log(`[DB] Restore job saved: ${params.jobId}`);

            return result[0];

        } catch (error) {

            console.error(`[DB] Failed to save restore job ${params.jobId}:`, error);

            throw error;

        }

    }

    static async updateJobStatus(jobId: string, initialJobStatus: RestoreJobStatusType, newJobStatus: RestoreJobStatusType) {

        try{

            console.log(`[DB] Updating restore job status ${jobId} from ${initialJobStatus} to ${newJobStatus}`);

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

            console.log(`[DB] Restore job status updated: ${jobId}`);

            return result[0];

        } catch (error) {

            console.error(`[DB] Failed to update restore job status ${jobId}:`, error);

            throw error;

        }

    } 

    static async getJobById(jobId: string) {

        try {

            console.log(`[DB] Fetching restore job: ${jobId}`);

            const result = await db.select().from(restoreJobs).where(eq(restoreJobs.id, jobId));

            if (!result || result.length === 0) {

                return null;

            }

            return result[0];

        } catch (error) {

            console.error(`[DB] Failed to fetch restore job ${jobId}:`, error);

            throw error;

        }

    }

}
