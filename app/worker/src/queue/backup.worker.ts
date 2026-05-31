import { Worker } from "bullmq";

import { redis } from "../config/redis";

import { logger } from "../config/logger";

import { BackupJobData } from "./backup.queue";



export const backupWorker = new Worker<BackupJobData>(

    "backup-jobs",

    async (job) => {

        logger.info({ jobId : job.id }, "Processing backup job");

        // will implement the actual backup logic here
        await new Promise((resolve) => setTimeout(resolve, 5000)); // just to simulate backup time

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