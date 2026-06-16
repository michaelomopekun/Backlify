import { BackupJobStatusType } from "shared/constants/backupJobStatus";

import { db, and, eq } from "../../index";

import { backupJobs } from "../../schema/backup-job";

import { logger } from "shared/config/logger";



export interface CreateBackupJobParams {

    jobId: string;

    databaseUrl: string;

    projectId?: string;

    jobStatus: BackupJobStatusType;

}


export class BackupRepository {

    static async saveBackupJob(params: CreateBackupJobParams) {

        try{

            const projectId = params.projectId || "default";

            logger.info({jobId: params.jobId}, "Saving backup job to database");

            const result = await db.insert(backupJobs).values({

                id: params.jobId,

                projectId,

                databaseUrl: params.databaseUrl,

                status: params.jobStatus,

                createdAt: new Date(),

                updatedAt: new Date(),
                
            }).returning({

                id: backupJobs.id,
                
                databaseUrl: backupJobs.databaseUrl,
                
                status: backupJobs.status,

            });

            logger.info({jobId: params.jobId}, "Backup job saved");

            return result[0];

        } catch (error) {

            logger.error({jobId: params.jobId, error}, "Failed to save backup job");

            throw error;

        }

    }

    static async updateJobStatus(jobId: string, initialJobStatus: BackupJobStatusType, newJobStatus: BackupJobStatusType) {

        try{

            logger.info({jobId, initialJobStatus, newJobStatus}, "Updating backup job status");

            const result = await db.update(backupJobs)

                .set({

                    status: newJobStatus as any,
                    
                    updatedAt: new Date(),
                
                })
                
                .where(
                
                    and(
                    
                        eq(backupJobs.id, jobId),
                    
                        eq(backupJobs.status, initialJobStatus as any)
                
                    )
                
                )
                
                .returning({
                
                    id: backupJobs.id,
                
                    status: backupJobs.status,
                
                });

            logger.info({jobId}, "Backup job status updated");

            return result[0];

        } catch (error) {

            logger.error({jobId, error}, "Failed to update backup job status");

            throw error;

        }

    } 

    static async getJobById(jobId: string) {

        try {

            logger.info({jobId}, "Fetching backup job");

            const result = await db.select().from(backupJobs).where(eq(backupJobs.id, jobId));

            if (!result || result.length === 0) {

                return null;

            }

            return result[0];

        } catch (error) {

            logger.error({jobId, error}, "Failed to fetch backup job");

            throw error;

        }

    }

}
