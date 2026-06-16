import { z } from "zod";

import { logger } from "shared/config/logger";

import { restoreQueue, RestoreJobData } from "../queue/restore.queue";

import { v4 as uuidv4 } from "uuid";

import { RESTORE_JOB_STATUS } from "shared/constants/restoreJobStatus";

import { RestoreRepository as restoreRepository } from "db/repo/restore/restore.repo";



// input validation
const CreateRestoreInputSchema = z.object({

    backupFileId: z.string().min(1, "Backup File ID is required"),

    targetDatabaseUrl: z.string().url("Invalid database URL format"),

});


type CreateRestoreInput = z.infer<typeof CreateRestoreInputSchema>;


export class RestoreService {

    private generateJobId(): string{

        const uuid = uuidv4().substring(0, 12);

        return `backlify-restoreJob-${uuid}`;
    }

    async createRestore(input: CreateRestoreInput) {

        try{

            // 1 validate input
            const validated = CreateRestoreInputSchema.safeParse(input);

            if (!validated.success) {

                logger.error({ errors: validated.error }, "Input validation failed");

                return {
                
                    success: false,
                
                    error: "Validation failed",
                
                    details: validated.error,
                
                };

            }

            // 2 generate job id
            const jobId = this.generateJobId();

            logger.info({ jobId, backupFileId: validated.data.backupFileId }, "Creating restore job");

            // 3 save metadata to database
            await restoreRepository.saveRestoreJob({

                jobId,

                backupFileId: validated.data.backupFileId,

                targetDatabaseUrl: validated.data.targetDatabaseUrl,

                jobStatus: RESTORE_JOB_STATUS.PENDING,

            });

            // 4 create job payload
            const jobData: RestoreJobData = {

                jobId,
                
                backupFileId: validated.data.backupFileId,
                
                targetDatabaseUrl: validated.data.targetDatabaseUrl,
                
                jobStatus: RESTORE_JOB_STATUS.PENDING,
                
                timestamp: Date.now(),

            };

            // 5 enqueue job
            const job = await restoreQueue.add("restore", jobData, { jobId });

            logger.info({ jobId: job.id, status: job.data.jobStatus }, "Restore job added to queue");

            // 6 update job status to queued
            await restoreRepository.updateJobStatus(

                jobId,

                RESTORE_JOB_STATUS.PENDING,

                RESTORE_JOB_STATUS.QUEUED
            
            );

            // 7 return success response
            return {

                success: true,

                jobId: job.id,

                status: job.data.jobStatus,

                message: "Restore job created and added to queue",

            };

        }catch (error) {

            logger.error({ error }, "Failed to create restore job");
            
            return {
            
                success: false,
            
                message: "Failed to create restore job",
            
                details: error instanceof Error ? error.message : String(error),
            
            };
        }
    }
    
}
