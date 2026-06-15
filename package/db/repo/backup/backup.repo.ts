import { BackupJobStatusType, BACKUP_JOB_STATUS } from "shared/constants/backupJobStatus";

import { db, and, eq } from "../../index";

import { backupJobs } from "../../schema/backup-job";


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

            console.log(`[DB] Saving backup job to database: ${params.jobId}`);

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

            console.log(`[DB] Backup job saved: ${params.jobId}`);

            return result[0];

        } catch (error) {

            console.error(`[DB] Failed to save backup job ${params.jobId}:`, error);

            throw error;

        }

    }

    static async updateJobStatus(jobId: string, initialJobStatus: BackupJobStatusType, newJobStatus: BackupJobStatusType) {

        try{

            console.log(`[DB] Updating backup job status ${jobId} from ${initialJobStatus} to ${newJobStatus}`);

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

            console.log(`[DB] Backup job status updated: ${jobId}`);

            return result[0];

        } catch (error) {

            console.error(`[DB] Failed to update backup job status ${jobId}:`, error);

            throw error;

        }

    } 

    static async getJobById(jobId: string) {

        try {

            console.log(`[DB] Fetching backup job: ${jobId}`);

            const result = await db.select().from(backupJobs).where(eq(backupJobs.id, jobId));

            if (!result || result.length === 0) {

                return null;

            }

            return result[0];

        } catch (error) {

            console.error(`[DB] Failed to fetch backup job ${jobId}:`, error);

            throw error;

        }

    }

}
