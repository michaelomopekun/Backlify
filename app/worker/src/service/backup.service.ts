import { z } from "zod";

import { logger } from "../config/logger";

import { backupQueue, BackupJobData } from "../queue/backup.queue";

import { v4 as uuidv4 } from "uuid";

import { BACKUP_JOB_STATUS } from "shared/constants/backupJobStatus";

import { BackupRepository as backupRepository } from "../repo/backup.repo";


// ?input validation
const CreateBackupInputSchema = z.object({

    databaseUrl: z.string().url("Invalid database URL format"),

});

type CreateBackupInput = z.infer<typeof CreateBackupInputSchema>;

export class BackupService {

    private generateJobId(): string{

        const uuid = uuidv4().substring(0, 12);

        return `backlify-backupJob-${uuid}`;
    }

    async createBackup(input: CreateBackupInput) {

        try{

            // 1
            const validated = CreateBackupInputSchema.safeParse(input);

            if (!validated.success) {

                logger.error({ errors: validated.error }, "Input validation failed");

                return {
                
                    success: false,
                
                    error: "Validation failed",
                
                    details: validated.error,
                
                };

            }

            // 2 generate job id
            const jobId = this.generateJobId();

            logger.info({ jobId }, "Creating backup job");

            // 3 save metadata to database
            await backupRepository.saveBackupJob({

                jobId,

                databaseUrl: validated.data.databaseUrl,

                jobStatus: BACKUP_JOB_STATUS.PENDING,

                timestamp: Date.now(),

            });

            // 4 create job
            const jobData: BackupJobData = {

                jobId,
                
                databaseUrl: validated.data.databaseUrl,
                
                jobStatus: BACKUP_JOB_STATUS.PENDING,
                
                timestamp: Date.now(),

            };

            // 5 enqueue job
            const job = await backupQueue.add("backup", jobData, { jobId });

            logger.info({ jobId: job.id, status: job.data.jobStatus }, "Backup job added to queue");

            // 6 update job status to queued
            await backupRepository.updateJobStatus(

                jobId,

                BACKUP_JOB_STATUS.PENDING,

                BACKUP_JOB_STATUS.QUEUED
            
            );

            // 7
            return {

                success: true,

                jobId: job.id,

                status: job.data.jobStatus,

                message: "Backup job created and added to queue",

            };

        }catch (error) {

            logger.error({ error }, "Failed to create backup job");
            
            return {
            
                success: false,
            
                message: "Failed to create backup job",
            
                details: error instanceof Error ? error.message : String(error),
            
            };
        }
    }
    
}