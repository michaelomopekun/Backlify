import { BackupRepository } from "db";
 
import { logger } from "shared/config/logger";
 
 
 
export class RecoveryLoader {
 
    private intervalId?: NodeJS.Timeout;
 
    private checkIntervalMs = 60 * 60 * 1000; // 1 hour
 
    private stalledThresholdMs = 2 * 60 * 60 * 1000; // 2 hours
 
 
    public start() {
 
        if (this.intervalId) {
 
            return;
 
        }
 
 
        logger.info("Starting recovery loader for stalled jobs");
 
 
        // Run immediately on startup
 
        this.checkStalledJobs().catch(err => logger.error({ error: err }, "Initial stalled jobs check failed"));
 
 
        // Then run periodically
 
        this.intervalId = setInterval(() => {
 
            this.checkStalledJobs().catch(err => logger.error({ error: err }, "Periodic stalled jobs check failed"));
 
        }, this.checkIntervalMs);
 
    }
 
 
    public stop() {
 
        if (this.intervalId) {
 
            clearInterval(this.intervalId);
 
            this.intervalId = undefined;
 
            logger.info("Stopped recovery loader");
 
        }
 
    }
 
 
    private async checkStalledJobs() {
 
        logger.info("Checking for stalled backup jobs...");
 
        try {
 
            await BackupRepository.markStalledJobsAsFailed(this.stalledThresholdMs);
 
        } catch (error) {
 
            logger.error({ error }, "Failed to sweep stalled jobs");
 
        }
 
    }
 
}
 
