import { Worker, Job } from "bullmq";

import { redis } from "../../config/redis";

import { logger } from "../../config/logger";

import { RestoreJobData } from "./restore.queue";

import { RESTORE_JOB_STATUS } from "shared/constants/restoreJobStatus";

import { PgRestoreService } from "../service/pgrestore.service";

import { RestoreRepository, BackupFileRepository } from "db";



export const restoreWorker = new Worker<RestoreJobData>(

    "restore-jobs",

    async (job: Job<RestoreJobData>) => {

        logger.info({ jobId: job.id, data: job.data }, "Processing restore job");

        // 1 update job status to in progress
        await RestoreRepository.updateJobStatus(

            job.data.jobId,

            RESTORE_JOB_STATUS.QUEUED,

            RESTORE_JOB_STATUS.IN_PROGRESS

        );

        // save the current status to job.data.jobStatus for alignment
        await job.updateData({
            
            ...job.data,
            
            jobStatus: RESTORE_JOB_STATUS.IN_PROGRESS,
            
        });


        // 2 fetch backup file record
        const backupFile = await BackupFileRepository.getBackupFileById(job.data.backupFileId);

        if (!backupFile) {

            const errorMessage = `Backup file record not found for id: ${job.data.backupFileId}`;
            
            logger.error({ jobId: job.id }, errorMessage);
            
            throw new Error(errorMessage);

        }

        // TODO Phase 6: if backupFile.storageProvider !== "local", download from cloud to temp dir here.

        const pgRestoreService = new PgRestoreService();

        // 3 execute pg_restore
        const restoreResult = await pgRestoreService.executePgRestore({

            backupFilePath: backupFile.filePath,

            targetDatabaseUrl: job.data.targetDatabaseUrl,

            jobId: job.data.jobId,

        });

        // 4 wait for result and update status accordingly
        if (restoreResult.success) {

            await RestoreRepository.updateJobStatus(

                job.data.jobId,

                job.data.jobStatus, // Note: we should probably transition from IN_PROGRESS, but job.data is static from enqueue.

                RESTORE_JOB_STATUS.COMPLETED

            );

            logger.info({ jobId: job.id }, "Restore job completed");

            return { success: true };

        } else {

            // log failure — throw error here triggers BullMQ retry
            const errorMessage = restoreResult.error ?? "pg_restore failed";

            logger.error({ jobId: job.id, error: errorMessage }, "Restore job failed, will retry if attempts remain");

            throw new Error(errorMessage);

        }

    },

    {

        connection: redis,

        concurrency: 2,

    }

);


// listener for failed jobs (exhausted retries)
restoreWorker.on("failed", async (job, err) => {

    if (!job) return;

    logger.error({ jobId: job.id, err: err.message }, "Restore job failed after retries");

    try {

        // update status to failed only when all retries are exhausted
        await RestoreRepository.updateJobStatus(

            job.data.jobId,

            job.data.jobStatus, // Note: ideally transition from whatever status it currently is, or just forcefully set to FAILED.

            RESTORE_JOB_STATUS.FAILED

        );

    } catch (dbError) {

        logger.error({ jobId: job.id, dbError }, "Failed to update status to FAILED after job failure");

    }

});


restoreWorker.on("error", (err) => {

    logger.error({ err }, "Restore worker encountered an error");

});


logger.info("Restore worker initialized");
