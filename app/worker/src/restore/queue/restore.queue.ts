import { Queue } from "bullmq";

import { z } from "zod";

import { redis } from "shared/config/redis";

import { logger } from "shared/config/logger";

import { RESTORE_JOB_STATUS_VALUES } from "shared/constants/restoreJobStatus";



// validate job data
export const RestoreJobDataSchema = z.object({

    jobId: z.string(),

    backupFileId: z.string(),

    targetDatabaseUrl: z.string().url("Invalid database URL format"),

    jobStatus: z.enum(RESTORE_JOB_STATUS_VALUES),

    timestamp: z.number().optional(),

});


export type RestoreJobData = z.infer<typeof RestoreJobDataSchema>;


// restore queue
export const restoreQueue = new Queue<RestoreJobData>("restore-jobs", {

    connection: redis as any,

    defaultJobOptions: {

        attempts: 3,

        backoff: {

            type: "exponential",

            delay: 60000, // 1 minute

        },

        removeOnComplete: {

            age: 3600, // 1 hour

        },

    },

});


// queue listeners
restoreQueue.on("error", (err) => {

    logger.error({ err }, "Restore queue error");

});


logger.info("Restore queue initialized");
