import { logger } from "../config/logger";

import { BackupJobData } from "../queue/backup.queue";

import { BackupJobStatusType } from "shared/constants/backupJobStatus"


export class BackupRepository {

    static async saveBackupJob(jobData: BackupJobData) {



    }

    static async updateJobStatus(jobId: string, initialJobStatus: BackupJobStatusType, newJobStatus: BackupJobStatusType) {

        

    } 
}


