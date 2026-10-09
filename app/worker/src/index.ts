import 'dotenv/config';

import http from "node:http";

import {logger} from 'shared/config/logger';

import {redis} from 'shared/config/redis';

// import { BackupService } from './backup/service/backup.service';

// import { RestoreService } from './restore/service/restore.service';

import { backupWorker } from './backup/queue/backup.worker';
import { restoreWorker } from './restore/queue/restore.worker';
import { loadSchedules } from './schedule/schedule.loader';
import { RecoveryLoader } from './schedule/recovery.loader';

// Top-level crash protection against unexpected network / socket drops
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  logger.error({ reason, promise }, 'Unhandled Rejection caught in worker process');
});

process.on('uncaughtException', (error: Error) => {
  logger.error({ error: error.message, stack: error.stack }, 'Uncaught Exception caught in worker process');
});

const port = Number(process.env.PORT) || 8080;
const server = http.createServer((_, res) => res.end("Backlify Worker is running!")).listen(port, () => {
  logger.info(`Internal health check server listening on port ${port}`);
});

async function main() {
  try {
    logger.info('Worker starting...');

    // Test Redis connection
    await redis.ping();
    logger.info('Redis connection verified');

    // Load active backup schedules
    await loadSchedules();

    // Start recovery loader for stalled jobs
    const recoveryLoader = new RecoveryLoader();
    recoveryLoader.start();

    logger.info('Worker is now listening for backup and restore jobs...');

    // Graceful shutdown handler for SIGINT and SIGTERM (sent by Fly.io and Docker)
    let isShuttingDown = false;
    const shutdown = async (signal: string) => {
      if (isShuttingDown) return;
      isShuttingDown = true;

      logger.info(`Received ${signal}. Gracefully shutting down worker...`);

      try {
        recoveryLoader.stop();

        logger.info('Closing BullMQ workers to finish active jobs...');
        await Promise.allSettled([
          backupWorker.close(),
          restoreWorker.close(),
        ]);

        await redis.quit();

        server.close();

        logger.info('Graceful shutdown completed. Exiting.');
        process.exit(0);
      } catch (shutdownErr) {
        logger.error({ error: shutdownErr }, 'Error during graceful shutdown');
        process.exit(1);
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

  } catch (error) {
    logger.error(error, 'Failed to start worker');
    process.exit(1);
  }
}

main();

