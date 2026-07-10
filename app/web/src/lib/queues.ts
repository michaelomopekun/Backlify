import { Queue } from "bullmq";

import { redis } from "shared/config/redis";

import { BACKUP_JOB_STATUS_VALUES } from "shared/constants/backupJobStatus";

import { RESTORE_JOB_STATUS_VALUES } from "shared/constants/restoreJobStatus";


export type BackupJobData = 
  | {

      jobId: string;

      databaseUrl: string;

      jobStatus: typeof BACKUP_JOB_STATUS_VALUES[number];

      timestamp?: number;

    }
  | {
      scheduleId: string;

      projectId: string;
    
    };


export interface RestoreJobData {

    jobId: string;

    backupFileId: string;

    targetDatabaseUrl: string;

    jobStatus: typeof RESTORE_JOB_STATUS_VALUES[number];

    timestamp?: number;

}


export const backupQueue = new Queue<BackupJobData>("backup-jobs", {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    connection: redis as any,

    defaultJobOptions: {

        attempts: 3,

        backoff: {

            type: "exponential",

            delay: 60000,

        },

        removeOnComplete: {

            age: 3600,

        },

    },

});


export const restoreQueue = new Queue<RestoreJobData>("restore-jobs", {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    connection: redis as any,

    defaultJobOptions: {

        attempts: 3,

        backoff: {

            type: "exponential",

            delay: 60000,

        },

        removeOnComplete: {

            age: 3600,

        },

    },

});
