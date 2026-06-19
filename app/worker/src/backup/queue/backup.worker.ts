import { Worker } from "bullmq";

import { redis } from "shared/config/redis";

import { logger } from "shared/config/logger";

import { backupQueue } from "./backup.queue";

import { BackupRepository, ProjectRepository, ScheduleRepository } from "db";

import { BACKUP_JOB_STATUS, BackupJobStatusType } from "shared/constants/backupJobStatus";

import { PgDumpService } from "../service/pgdump.service";

import { BackupFileUploadService } from "../service/backup_file_upload.service";

import { v4 as uuidv4 } from "uuid";




export const backupWorker = new Worker<any>(

    "backup-jobs",

    async (job) => {

        logger.info({ jobId : job.id, jobName: job.name }, "Processing backup queue job");


        if (job.name === "scheduled-backup") {

            const { scheduleId, projectId } = job.data;

            logger.info({ scheduleId, projectId }, "Triggering scheduled backup job");

            try {

                const schedule = await ScheduleRepository.getScheduleById(scheduleId);

                if (!schedule || !schedule.isActive) {

                    logger.warn({ scheduleId }, "Backup schedule not found or inactive, skipping");

                    return { success: false, error: "Inactive or missing schedule" };

                }


                const project = await ProjectRepository.getProjectById(projectId);

                if (!project) {

                    logger.error({ projectId }, "Project not found for backup schedule, skipping");

                    return { success: false, error: "Project not found" };

                }


                const jobId = `backlify-backupJob-${uuidv4().substring(0, 12)}`;


                // 1. Create a pending job record in DB

                await BackupRepository.saveBackupJob({

                    jobId,

                    databaseUrl: project.databaseUrl,

                    projectId: project.id,

                    jobStatus: BACKUP_JOB_STATUS.PENDING as BackupJobStatusType,

                });


                // 2. Add raw backup task to queue

                await backupQueue.add("backup", {

                    jobId,

                    databaseUrl: project.databaseUrl,

                    jobStatus: BACKUP_JOB_STATUS.PENDING as BackupJobStatusType,

                    timestamp: Date.now(),

                }, { jobId });


                // 3. Mark job status as QUEUED in DB

                await BackupRepository.updateJobStatus(jobId, BACKUP_JOB_STATUS.PENDING as BackupJobStatusType, BACKUP_JOB_STATUS.QUEUED as BackupJobStatusType);


                // 4. Update lastRunAt on the schedule

                await ScheduleRepository.updateLastRunAt(schedule.id, new Date());


                logger.info({ scheduleId, projectId, jobId }, "Scheduled backup successfully triggered");

                return { success: true, jobId };


            } catch (error) {

                logger.error({ scheduleId, projectId, error }, "Failed to execute scheduled backup trigger");

                throw error;

            }

        }


        // 1 update status from queued to running

        await BackupRepository.updateJobStatus(
            
            job.data.jobId, 
            
            job.data.jobStatus, 
            
            BACKUP_JOB_STATUS.IN_PROGRESS
        
        );
        
        // save the current status to job.data.jobStatus for alignment
        await job.updateData({
            
            ...job.data,
            
            jobStatus: BACKUP_JOB_STATUS.IN_PROGRESS,
            
        });

        logger.info({ jobId : job.id }, "updated job status to in_progress");

        // 2 call pgdump service to perform backup
        const pg_dump_service = new PgDumpService();

        const backup_result = await pg_dump_service.executePgDump({
            
            databaseUrl: job.data.databaseUrl,
            
            jobId: job.data.jobId,
            
        });

        // 3 wait for result and update status accordingly
        if (backup_result.success) {

            // 4 transition to UPLOADING — tracks cloud upload phase
            await BackupRepository.updateJobStatus(
            
                job.data.jobId,
            
                job.data.jobStatus,
            
                BACKUP_JOB_STATUS.UPLOADING,
            
            );

            await job.updateData({
                
                ...job.data,
                
                jobStatus: BACKUP_JOB_STATUS.UPLOADING,
                
            });

            logger.info({ jobId: job.id }, "Updated job status to uploading");

            const backup_file_service = new BackupFileUploadService();

            // 5 upload backup file to cloud storage and save record
            await backup_file_service.saveBackupFile({
                
                jobId: job.data.jobId,
                
                filePath: backup_result.filePath as string,
                
                fileSize: backup_result.fileSize as number,
            
            });

            // 6 update job status to completed
            await BackupRepository.updateJobStatus(
            
                job.data.jobId,
            
                BACKUP_JOB_STATUS.UPLOADING,
            
                BACKUP_JOB_STATUS.COMPLETED,
            
            );
            
            // 7 log completion
            logger.info({ jobId : job.id }, "Backup job completed");
            
            return { success: true };
        } 
        else {

            // 6 log failure — throw error here triggers BullMQ retry (attempts: 3, exponential backoff)
            const errorMessage = backup_result.error ?? "pg_dump failed";
            
            logger.error({ jobId : job.id, error: errorMessage }, "Backup job failed, will retry if attempts remain");
            
            throw new Error(errorMessage);
        }

    },

    {

        connection: redis as any,

        concurrency: 5,

    }

);


// worker listeners
backupWorker.on("completed", (job) => {

    logger.info({ jobId: job.id }, "Backup job completed successfully");

});

backupWorker.on("failed", async (job, err) => {

    logger.error({ jobId: job?.id, err: err.message, attempts: job?.attemptsMade }, "Backup job failed");

    // Mark as FAILED in DB after all retries are exhausted
    if (job) {  

        try {
        
            await BackupRepository.updateJobStatus(
        
                job.data.jobId,
        
                job.data.jobStatus,
        
                BACKUP_JOB_STATUS.FAILED,
        
            );
            
        
        } catch (updateErr) {
        
            logger.error({ jobId: job.id, err: updateErr }, "Failed to update job status to FAILED");
        
        }
    
    }

});

backupWorker.on("error", (err) => {

    logger.error({ err }, "Backup worker error");

});


logger.info("Backup worker initialized and listening for jobs");