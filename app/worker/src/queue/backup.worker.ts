import { Worker } from "bullmq";

import { redis } from "../config/redis";

import { logger } from "../config/logger";

import { BackupJobData } from "./backup.queue";

import { BackupRepository } from "../repo/backup.repo"

import { BACKUP_JOB_STATUS } from "shared/constants/backupJobStatus";

import { PgDumpService } from "../service/pgdump.service";




export const backupWorker = new Worker<BackupJobData>(

    "backup-jobs",

    async (job) => {

        logger.info({ jobId : job.id }, "Processing backup job");


        // 1 update status from queued to running
        await BackupRepository.updateJobStatus(
            
            job.data.jobId, 
            
            job.data.jobStatus, 
            
            BACKUP_JOB_STATUS.IN_PROGRESS
        
        );

        logger.info({ jobId : job.id }, "updated job status to in_progress");

        // 2 call pgdump service to perform backup
        const pg_dump_service = new PgDumpService();

        const backup_result = await pg_dump_service.executePgDump({
            
            databaseUrl: job.data.databaseUrl,
            
            jobId: job.data.jobId,
            
        });

        // 3 wait for result and update status accordingly
        if (backup_result.success) {
            
            await BackupRepository.updateJobStatus(
            
                job.data.jobId,
            
                job.data.jobStatus,
            
                BACKUP_JOB_STATUS.COMPLETED,
            
            );
            
            // 4 log completion
            logger.info({ jobId : job.id }, "Backup job completed");
            
            return { success: true };
        } 
        else {

            // 4 log failure — throw error here triggers BullMQ retry (attempts: 3, exponential backoff)
            const errorMessage = backup_result.error ?? "pg_dump failed";
            
            logger.error({ jobId : job.id, error: errorMessage }, "Backup job failed, will retry if attempts remain");
            
            throw new Error(errorMessage);
        }

    },

    {

        connection: redis,

        concurrency: 5,

    }

);


// worker listeners
backupWorker.on("completed", (job) => {

    logger.info({ jobId: job.id }, "Backup job completed successfully");

});

backupWorker.on("failed", async (job, err) => {

    logger.error({ jobId: job?.id, err: err.message, attempts: job?.attemptsMade }, "Backup job failed");

    // Mark as FAILED in DB after all retries are exhausted
    if (job) {  

        try {
        
            await BackupRepository.updateJobStatus(
        
                job.data.jobId,
        
                job.data.jobStatus,
        
                BACKUP_JOB_STATUS.FAILED,
        
            );
        
        } catch (updateErr) {
        
            logger.error({ jobId: job.id, err: updateErr }, "Failed to update job status to FAILED");
        
        }
    
    }

});

backupWorker.on("error", (err) => {

    logger.error({ err }, "Backup worker error");

});


logger.info("Backup worker initialized and listening for jobs");