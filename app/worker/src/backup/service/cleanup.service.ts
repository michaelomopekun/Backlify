import { ProjectRepository, BackupRepository, BackupFileRepository } from "db";
 
import { StorageService } from "shared/config/storage";
 
import { logger } from "shared/config/logger";
 
 
 
export class CleanupService {

    constructor() {}
 
 
    /**
     * Checks if a project has exceeded its retention count and prunes the oldest active backup files.
     * Retains the backup_jobs and backup_files records for historical telemetry and audit logging.
     */
    public async enforceRetentionPolicy(projectId: string): Promise<void> {
        try {
            const project = await ProjectRepository.getProjectById(projectId);
            if (!project) {
                logger.warn({ projectId }, "Project not found for cleanup");
                return;
            }

            const retentionCount = project.retentionCount ?? 7;
            const activeBackups = await BackupRepository.getActiveRetainedBackupsForProject(projectId);

            if (activeBackups.length <= retentionCount) {
                logger.info({ projectId, count: activeBackups.length, retentionCount }, "Retention policy satisfied, no cleanup needed");
                return;
            }

            // The active backups are ordered by createdAt descending (newest first).
            // We want to keep the first `retentionCount` backups and prune the rest from cloud storage.
            const backupsToPrune = activeBackups.slice(retentionCount);
            logger.info({ projectId, countToPrune: backupsToPrune.length }, "Found old backups to prune from storage");

            for (const backupJob of backupsToPrune) {
                await this.pruneBackup(backupJob.id);
            }

            logger.info({ projectId }, "Retention policy enforcement completed");
        } catch (error) {
            logger.error({ projectId, error }, "Failed to enforce retention policy");
        }
    }

    private async pruneBackup(jobId: string): Promise<void> {
        try {
            logger.info({ jobId }, "Pruning old backup storage file");

            const backupFile = await BackupFileRepository.getBackupFileByJobId(jobId);

            if (backupFile) {
                if (backupFile.storageProvider === "r2" || backupFile.storageProvider === "aws") {
                    try {
                        const storageService = new StorageService();
                        await storageService.deleteFile(backupFile.filePath);
                        logger.info({ jobId, cloudKey: backupFile.filePath }, "Deleted backup file from cloud storage");
                    } catch (storageErr) {
                        logger.error({ jobId, error: storageErr }, "Failed to delete backup file from cloud storage");
                    }
                }

                // Mark the file as purged in the database while preserving fileSize and metadata
                await BackupFileRepository.markAsPurgedByJobId(jobId);
                logger.info({ jobId }, "Marked backup file DB record as purged");
            }

            // NOTE: We intentionally preserve the backup_jobs row so historical telemetry,
            // success rates, and audit logs remain accurate.
        } catch (error) {
            logger.error({ jobId, error }, "Failed to prune backup during cleanup");
        }
    }
 
}
 
