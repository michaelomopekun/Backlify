import { ProjectRepository, BackupRepository, BackupFileRepository } from "db";
 
import { StorageService } from "shared/config/storage";
 
import { logger } from "shared/config/logger";
 
 
 
export class CleanupService {

    constructor() {}
 
 
    /**
     * Computes an ISO week key (YYYY-Www) for a given date.
     */
    private getWeekKey(date: Date): string {
        const d = new Date(date.getTime());
        d.setHours(0, 0, 0, 0);
        const day = d.getDay() || 7;
        d.setDate(d.getDate() + 4 - day);
        const yearStart = new Date(d.getFullYear(), 0, 1);
        const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
        return `${d.getFullYear()}-W${String(weekNo).padStart(2, "0")}`;
    }

    /**
     * Computes a calendar month key (YYYY-MM) for a given date.
     */
    private getMonthKey(date: Date): string {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    }

    /**
     * Enforces the project's tiered retention policy (GFS: Grandfather-Father-Son):
     * 1. Primary FIFO window: preserves the newest `retentionCount` active snapshots.
     * 2. Weekly rollups: preserves 1 snapshot per week for up to 12 weeks (if keepWeekly is true).
     * 3. Monthly archives: preserves 1 snapshot per month for up to 1 year (if keepMonthly is true).
     * 
     * Older snapshots that do not qualify for any tier have their cloud storage files pruned,
     * while preserving the PostgreSQL database records for audit history and telemetry.
     */
    public async enforceRetentionPolicy(projectId: string): Promise<void> {
        try {
            const project = await ProjectRepository.getProjectById(projectId);
            if (!project) {
                logger.warn({ projectId }, "Project not found for cleanup");
                return;
            }

            const retentionCount = project.retentionCount ?? 7;
            const keepWeekly = project.keepWeekly ?? true;
            const keepMonthly = project.keepMonthly ?? true;

            const activeBackups = await BackupRepository.getActiveRetainedBackupsForProject(projectId);

            if (activeBackups.length <= retentionCount) {
                logger.info({ projectId, count: activeBackups.length, retentionCount }, "Retention policy satisfied, no cleanup needed");
                return;
            }

            const now = Date.now();
            const protectedIds = new Set<string>();

            // 1. Primary FIFO Window: Always protect the newest `retentionCount` snapshots
            for (let i = 0; i < Math.min(retentionCount, activeBackups.length); i++) {
                protectedIds.add(activeBackups[i].id);
            }

            // 2. Weekly Rollups Window: Preserve 1 snapshot per calendar week for up to 12 weeks (84 days)
            if (keepWeekly) {
                const weeklyMap = new Map<string, typeof activeBackups[0]>();
                for (const b of activeBackups) {
                    const d = new Date(b.createdAt);
                    const ageDays = (now - d.getTime()) / (1000 * 60 * 60 * 24);
                    if (ageDays <= 84) {
                        const weekKey = this.getWeekKey(d);
                        if (!weeklyMap.has(weekKey)) {
                            weeklyMap.set(weekKey, b);
                        }
                    }
                }
                for (const b of weeklyMap.values()) {
                    protectedIds.add(b.id);
                }
            }

            // 3. Monthly Archives Window: Preserve 1 snapshot per calendar month for up to 1 year (365 days)
            if (keepMonthly) {
                const monthlyMap = new Map<string, typeof activeBackups[0]>();
                for (const b of activeBackups) {
                    const d = new Date(b.createdAt);
                    const ageDays = (now - d.getTime()) / (1000 * 60 * 60 * 24);
                    if (ageDays <= 365) {
                        const monthKey = this.getMonthKey(d);
                        if (!monthlyMap.has(monthKey)) {
                            monthlyMap.set(monthKey, b);
                        }
                    }
                }
                for (const b of monthlyMap.values()) {
                    protectedIds.add(b.id);
                }
            }

            // Any active backup outside the protected pool is pruned
            const backupsToPrune = activeBackups.filter((b) => !protectedIds.has(b.id));

            if (backupsToPrune.length === 0) {
                logger.info(
                    { projectId, totalActive: activeBackups.length, protectedCount: protectedIds.size },
                    "All active backups protected by tiered retention policy (FIFO + Weekly + Monthly)"
                );
                return;
            }

            logger.info(
                { projectId, countToPrune: backupsToPrune.length, protectedCount: protectedIds.size },
                "Found old backups to prune from storage after applying tiered retention"
            );

            for (const backupJob of backupsToPrune) {
                await this.pruneBackup(backupJob.id);
            }

            logger.info({ projectId }, "Tiered retention policy enforcement completed");
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
 
