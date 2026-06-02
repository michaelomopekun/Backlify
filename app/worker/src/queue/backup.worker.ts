import { Worker } from "bullmq";

import { redis } from "../config/redis";

import { logger } from "../config/logger";

import { BackupJobData } from "./backup.queue";

import { BackupService } from "../service/backup.service";



export const backupWorker = new Worker<BackupJobData>(

    "backup-jobs",

    async (job) => {

        logger.info({ jobId : job.id }, "Processing backup job");

        const backupService = new BackupService();

        await backupService.createBackup({

            databaseUrl: job.data.databaseUrl,
        
        });

        logger .info({ jobId : job.id }, "Backup job completed");
        
        return { success: true };

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

backupWorker.on("failed", (job, err) => {

    logger.error({ jobId: job?.id, err: err.message, attempts: job?.attemptsMade }, "Backup job failed");

});

backupWorker.on("error", (err) => {

    logger.error({ err }, "Backup worker error");

});


logger.info("Backup worker initialized and listening for jobs");