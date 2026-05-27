import { Queue } from "bullmq";
import { z } from "zod";
import { redis } from "../config/redis";
import { logger } from "../config/logger";


// validate job data
export const BackupJobDataSchema = z.object({
    jobId: z.string(),
    databaseUrl: z.string().url("Invalid database URL format"),
    timestamp: z.number().optional(),
});

export type BackupJobData = z.infer<typeof BackupJobDataSchema>;

// backup queue
export const backupQueue = new Queue<BackupJobData>("backup-jobs", {
    connection: redis,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 2000,
        },
        removeOnComplete: {
            age: 3600, // 1 hour
        },
    },
});

// queue listeners
backupQueue.on("error", (err) => {
    logger.error({ err }, "Backup queue error");
});

logger.info("Backup queue initialized");