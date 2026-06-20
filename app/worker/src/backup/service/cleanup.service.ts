import { ProjectRepository, BackupRepository, BackupFileRepository } from "db";
 
import { StorageService } from "shared/config/storage";
 
import { logger } from "shared/config/logger";
 
 
 
export class CleanupService {
 
    private storageService: StorageService;
 
 
    constructor() {
 
        this.storageService = new StorageService();
 
    }
 
 
    /**
     * Checks if a project has exceeded its retention count and deletes the oldest successful backups.
     */
    public async enforceRetentionPolicy(projectId: string): Promise<void> {
 
        try {
 
            const project = await ProjectRepository.getProjectById(projectId);
 
            if (!project) {
 
                logger.warn({ projectId }, "Project not found for cleanup");
 
                return;
 
            }
 
 
            const retentionCount = project.retentionCount ?? 7;
 
            const successfulBackups = await BackupRepository.getSuccessfulBackupsForProject(projectId);
 
 
            if (successfulBackups.length <= retentionCount) {
 
                logger.info({ projectId, count: successfulBackups.length, retentionCount }, "Retention policy satisfied, no cleanup needed");
 
                return;
 
            }
 
 
            // The backups are ordered by createdAt descending (newest first).
 
            // We want to keep the first `retentionCount` backups and delete the rest.
 
            const backupsToDelete = successfulBackups.slice(retentionCount);
 
            logger.info({ projectId, countToDelete: backupsToDelete.length }, "Found old backups to clean up");
 
 
            for (const backupJob of backupsToDelete) {
 
                await this.deleteBackup(backupJob.id);
 
            }
 
 
            logger.info({ projectId }, "Retention policy enforcement completed");
 
        } catch (error) {
 
            logger.error({ projectId, error }, "Failed to enforce retention policy");
 
        }
 
    }
 
 
    private async deleteBackup(jobId: string): Promise<void> {
 
        try {
 
            logger.info({ jobId }, "Deleting old backup");
 
 
            const backupFile = await BackupFileRepository.getBackupFileByJobId(jobId);
 
 
            if (backupFile) {
 
                if (backupFile.storageProvider === "r2" || backupFile.storageProvider === "aws") {
 
                    try {
 
                        await this.storageService.deleteFile(backupFile.filePath);
 
                        logger.info({ jobId, cloudKey: backupFile.filePath }, "Deleted backup file from cloud storage");
 
                    } catch (storageErr) {
 
                        logger.error({ jobId, error: storageErr }, "Failed to delete backup file from cloud storage");
 
                        // We continue with DB deletion even if cloud delete fails, to not block future cleanups
 
                    }
 
                }
 
 
                await BackupFileRepository.deleteBackupFileByJobId(jobId);
 
                logger.info({ jobId }, "Deleted backup file DB record");
 
            }
 
 
            await BackupRepository.deleteBackupJob(jobId);
 
            logger.info({ jobId }, "Deleted backup job DB record");
 
 
        } catch (error) {
 
            logger.error({ jobId, error }, "Failed to delete backup during cleanup");
 
        }
 
    }
 
}
 
