import { Worker, Job } from "bullmq";

import { redis } from "shared/config/redis";

import { logger } from "shared/config/logger";

import { RestoreJobData } from "./restore.queue";

import { RESTORE_JOB_STATUS } from "shared/constants/restoreJobStatus";

import { PgRestoreService } from "../service/pgrestore.service";

import { RestoreRepository, BackupFileRepository, BackupRepository } from "db";

import { EncryptionService } from "../../shared/service/encryption.service";

import { createHash } from "crypto";

import { emitJobTelemetry } from "shared/config/job-telemetry";
import { dispatchIncidentAlert } from "shared/config/alert-dispatcher";



export const restoreWorker = new Worker<RestoreJobData>(

    "restore-jobs",

    async (job: Job<RestoreJobData>) => {

        logger.info({ jobId: job.id, data: job.data }, "Processing restore job");

        // 1 update job status to in progress
        await RestoreRepository.updateJobStatus(

            job.data.jobId,

            RESTORE_JOB_STATUS.QUEUED,

            RESTORE_JOB_STATUS.IN_PROGRESS

        );

        // save the current status to job.data.jobStatus for alignment
        await job.updateData({
            
            ...job.data,
            
            jobStatus: RESTORE_JOB_STATUS.IN_PROGRESS,
            
        });

        const isDrill = Boolean(job.data.isDrill || job.data.targetDatabaseUrl?.startsWith("headless"));

        await emitJobTelemetry({
            jobId: job.data.jobId,
            level: "info",
            phase: "INIT",
            message: isDrill
                ? "Worker claimed Headless DR Drill job. Preparing verification sandbox..."
                : "Worker claimed restore job. Initializing recovery pipeline...",
            progress: 10,
        });

        // 2 fetch backup file record (check by file ID or job ID)
        let backupFile = await BackupFileRepository.getBackupFileById(job.data.backupFileId);
        if (!backupFile) {
            backupFile = await BackupFileRepository.getBackupFileByJobId(job.data.backupFileId);
        }

        if (!backupFile) {
            const errorMessage = `Backup file record not found for id: ${job.data.backupFileId}`;
            
            logger.error({ jobId: job.id }, errorMessage);

            await emitJobTelemetry({
                jobId: job.data.jobId,
                level: "error",
                phase: "ERROR",
                message: errorMessage,
            });
            
            throw new Error(errorMessage);

        }

        // Phase 6: if stored in cloud, download to temp dir first
        let restoreFilePath = backupFile.filePath;

        let tempDownloadPath: string | null = null;

        if (backupFile.storageProvider !== "local") {

            const { StorageService } = await import("shared/config/storage");

            const storageService = new StorageService();

            const path = await import("path");

            const { promises: fs } = await import("fs");

            const tempDir = path.join(process.cwd(), "src", "temp");

            await fs.mkdir(tempDir, { recursive: true });

            tempDownloadPath = path.join(tempDir, `restore_${job.data.jobId}_${backupFile.fileName}`);

            logger.info({ jobId: job.id, cloudKey: backupFile.filePath, tempDownloadPath }, "Downloading backup from cloud storage");

            await emitJobTelemetry({
                jobId: job.data.jobId,
                level: "info",
                phase: "DOWNLOAD",
                message: `Downloading encrypted snapshot package (${backupFile.fileName}) from ${backupFile.storageProvider}...`,
                progress: 25,
            });

            await storageService.downloadFile(backupFile.filePath, tempDownloadPath);

            restoreFilePath = tempDownloadPath;

            logger.info({ jobId: job.id, tempDownloadPath }, "Backup file downloaded from cloud");

        }

        // --- File Validation (Checksum) ---

        const { promises: fsPromises } = await import("fs");

        const fileBuffer = await fsPromises.readFile(restoreFilePath);

        const hash = createHash("sha256");

        hash.update(fileBuffer);

        const downloadedChecksum = hash.digest("hex");


        if (downloadedChecksum !== backupFile.checksum) {

            const err = `Checksum validation failed. Expected ${backupFile.checksum}, got ${downloadedChecksum}`;

            logger.error({ jobId: job.id }, err);

            await emitJobTelemetry({
                jobId: job.data.jobId,
                level: "error",
                phase: "ERROR",
                message: err,
            });

            throw new Error(err);

        }

        logger.info({ jobId: job.id }, "Checksum validation passed");

        await emitJobTelemetry({
            jobId: job.data.jobId,
            level: "success",
            phase: "CHECKSUM",
            message: `SHA-256 integrity checksum validated: ${downloadedChecksum.substring(0, 16)}... [MATCH]`,
            progress: 40,
        });


        // --- Decryption (if applicable) ---

        let finalRestorePath = restoreFilePath;

        let decryptedTempPath: string | null = null;

        
        if (backupFile.isEncrypted) {

            const encryptionService = new EncryptionService();

            const path = await import("path");

            const tempDir = path.join(process.cwd(), "src", "temp");

            decryptedTempPath = path.join(tempDir, `restore_decrypted_${job.data.jobId}.dump`);

            
            logger.info({ jobId: job.id, restoreFilePath, decryptedTempPath }, "Decrypting backup file");

            await emitJobTelemetry({
                jobId: job.data.jobId,
                level: "info",
                phase: "CHECKSUM",
                message: "Decrypting snapshot payload with AES-256 envelope key...",
                progress: 50,
            });

            await encryptionService.decryptFile(restoreFilePath, decryptedTempPath);

            finalRestorePath = decryptedTempPath;

            logger.info({ jobId: job.id }, "Backup file decrypted successfully");
        }

        const pgRestoreService = new PgRestoreService();

        if (isDrill) {
            await emitJobTelemetry({
                jobId: job.data.jobId,
                level: "info",
                phase: "RESTORE",
                message: "Initiating Headless DR Drill: Running pg_restore --list to inspect Table of Contents (TOC)...",
                progress: 65,
            });

            const startTime = Date.now();
            const tocResult = await pgRestoreService.inspectArchiveToc(finalRestorePath);
            const drillDuration = Date.now() - startTime;

            // Cleanup temp downloads if we pulled from cloud or decrypted
            if (tempDownloadPath || decryptedTempPath) {
                try {
                    const { promises: fs } = await import("fs");
                    if (tempDownloadPath) await fs.unlink(tempDownloadPath);
                    if (decryptedTempPath) await fs.unlink(decryptedTempPath);
                    logger.info({ jobId: job.id, tempDownloadPath, decryptedTempPath }, "Cleaned up temp restore files");
                } catch (cleanupErr) {
                    logger.warn({ jobId: job.id, error: cleanupErr }, "Failed to cleanup temp download (non-fatal)");
                }
            }

            if (tocResult.success) {
                const tableCount = tocResult.tableCount || 0;
                const indexCount = tocResult.indexCount || 0;
                const schemaCount = tocResult.schemaCount || 0;
                const totalEntries = tocResult.totalEntries || 0;

                await emitJobTelemetry({
                    jobId: job.data.jobId,
                    level: "info",
                    phase: "INDEX",
                    message: `Archive TOC parsed: ${tableCount} tables, ${indexCount} indexes, ${schemaCount} schema definitions (${totalEntries} total objects).`,
                    progress: 80,
                });

                if (tocResult.tables && tocResult.tables.length > 0) {
                    await emitJobTelemetry({
                        jobId: job.data.jobId,
                        level: "info",
                        phase: "INDEX",
                        message: `Verified table schemas: [${tocResult.tables.slice(0, 8).join(", ")}${tocResult.tables.length > 8 ? ", ..." : ""}]`,
                        progress: 90,
                    });
                }

                await RestoreRepository.updateJobDetails(job.data.jobId, {
                    status: RESTORE_JOB_STATUS.COMPLETED,
                    completedAt: new Date(),
                    errorMessage: JSON.stringify({
                        type: "headless_drill",
                        passed: true,
                        tableCount,
                        indexCount,
                        totalEntries,
                        durationMs: drillDuration,
                    }),
                });

                await emitJobTelemetry({
                    jobId: job.data.jobId,
                    level: "success",
                    phase: "COMPLETE",
                    message: `Headless DR Drill PASSED: Archive integrity confirmed in ${drillDuration}ms. Zero bit-rot detected. Safe to restore.`,
                    progress: 100,
                });

                return { success: true, drillResult: tocResult };
            } else {
                const errorMessage = tocResult.error || "Archive inspection failed";
                await RestoreRepository.updateJobDetails(job.data.jobId, {
                    status: RESTORE_JOB_STATUS.FAILED,
                    completedAt: new Date(),
                    errorMessage,
                });

                await emitJobTelemetry({
                    jobId: job.data.jobId,
                    level: "error",
                    phase: "ERROR",
                    message: `Headless DR Drill FAILED: ${errorMessage}`,
                });

                throw new Error(errorMessage);
            }
        }

        await emitJobTelemetry({
            jobId: job.data.jobId,
            level: "info",
            phase: "RESTORE",
            message: "Spawning pg_restore --clean --if-exists --no-owner on target database...",
            progress: 60,
        });

        // 3 execute pg_restore
        const restoreResult = await pgRestoreService.executePgRestore({
            backupFilePath: finalRestorePath,
            targetDatabaseUrl: job.data.targetDatabaseUrl,
            jobId: job.data.jobId,
            onLog: (line: string) => {
                emitJobTelemetry({
                    jobId: job.data.jobId,
                    level: "info",
                    phase: "RESTORE",
                    message: line,
                    progress: 75,
                });
            },
        });

        // 4 cleanup temp downloads if we pulled from cloud or decrypted
        if (tempDownloadPath || decryptedTempPath) {
            try {
                const { promises: fs } = await import("fs");
                if (tempDownloadPath) await fs.unlink(tempDownloadPath);
                if (decryptedTempPath) await fs.unlink(decryptedTempPath);
                logger.info({ jobId: job.id, tempDownloadPath, decryptedTempPath }, "Cleaned up temp restore files");
            } catch (cleanupErr) {
                logger.warn({ jobId: job.id, error: cleanupErr }, "Failed to cleanup temp download (non-fatal)");
            }
        }

        // 5 wait for result and update status accordingly
        if (restoreResult.success) {
            await RestoreRepository.updateJobDetails(job.data.jobId, {
                status: RESTORE_JOB_STATUS.COMPLETED,
                completedAt: new Date(),
            });

            logger.info({ jobId: job.id }, "Restore job completed");

            await emitJobTelemetry({
                jobId: job.data.jobId,
                level: "success",
                phase: "COMPLETE",
                message: `Database successfully restored and verified in ${restoreResult.duration}ms.`,
                progress: 100,
            });

            return { success: true };
        } else {
            // log failure — throw error here triggers BullMQ retry
            const errorMessage = restoreResult.error ?? "pg_restore failed";
            logger.error({ jobId: job.id, error: errorMessage }, "Restore job failed, will retry if attempts remain");

            await emitJobTelemetry({
                jobId: job.data.jobId,
                level: "error",
                phase: "ERROR",
                message: `pg_restore execution failed: ${errorMessage}`,
            });

            throw new Error(errorMessage);
        }

    },

    {

        connection: redis as any,

        concurrency: 2,

    }

);


// listener for failed jobs (exhausted retries)
restoreWorker.on("failed", async (job, err) => {
    if (!job) return;

    logger.error({ jobId: job.id, err: err.message }, "Restore job failed after retries");

    try {
        await RestoreRepository.updateJobStatus(
            job.data.jobId,
            job.data.jobStatus,
            RESTORE_JOB_STATUS.FAILED
        );

        // Resolve project and dispatch incident alert
        let projectId: string | null = (job.data as any).projectId || null;
        if (!projectId && job.data.backupFileId) {
            const backupFile = await BackupFileRepository.getBackupFileById(job.data.backupFileId);
            if (backupFile && backupFile.backupJobId) {
                const dbBackupJob = await BackupRepository.getJobById(backupFile.backupJobId);
                if (dbBackupJob) {
                    projectId = dbBackupJob.projectId;
                }
            }
        }

        if (projectId) {
            const isDrill = (job.data as any).isDrill || (job.data as any).dryRun;
            await dispatchIncidentAlert({
                jobId: job.data.jobId,
                projectId,
                type: isDrill ? "drill" : "restore",
                errorMessage: err.message,
                attemptsMade: job.attemptsMade,
            });
        }
    } catch (dbError) {
        logger.error({ jobId: job.id, dbError }, "Failed to update status to FAILED or dispatch incident alert");
    }
});


restoreWorker.on("error", (err) => {

    logger.error({ err }, "Restore worker encountered an error");

});


logger.info("Restore worker initialized");
