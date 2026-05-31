import { logger } from "../config/logger";

import { BackupJobData } from "../queue/backup.queue";

import { BackupJobStatusType, BACKUP_JOB_STATUS } from "shared/constants/backupJobStatus"

import { db } from "db";

import { backupJobs } from "db/schema/backup-job";

import { and, eq } from "db";


export class BackupRepository {

    static async saveBackupJob(jobData: BackupJobData, projectId: string = "default") {

        try{

            logger.info({ jobId: jobData.jobId }, "Savng backup job to database");

            const result = await db.insert(backupJobs).values({

                id: jobData.jobId,

                projectId,

                databaseUrl: jobData.databaseUrl,

                status: BACKUP_JOB_STATUS.PENDING,

                createdAt: new Date(),

                updatedAt: new Date(),
                
            }).returning({

                id: backupJobs.id,
                
                databaseUrl: backupJobs.databaseUrl,
                
                status: backupJobs.status,

            });

            logger.info({ jobId: jobData.jobId }, "Backup job saved");

            return result[0];

        } catch (error) {

            logger.error({ error, jobId: jobData.jobId }, "Failed to save backup job");

            throw error;

        }

    }

    static async updateJobStatus(jobId: string, initialJobStatus: BackupJobStatusType, newJobStatus: BackupJobStatusType) {

        try{

            logger.info({ jobId, initialJobStatus, newJobStatus }, "Updating backup job status");

            const result = await db.update(backupJobs)

                .set({

                    status: newJobStatus,
                    
                    updatedAt: new Date(),
                
                })
                
                .where(
                
                    and(
                    
                        eq(backupJobs.id, jobId),
                    
                        eq(backupJobs.status, initialJobStatus)
                
                    )
                
                )
                
                .returning({
                
                    id: backupJobs.id,
                
                    status: backupJobs.status,
                
                });

            logger.info({ jobId, newJobStatus }, "Backup job status updated");

            return result[0];

        } catch (error) {

            logger.error({ error, jobId }, "Failed to update backup job status");

            throw error;

        }

    } 
}


