import 'dotenv/config';

import {logger} from './config/logger';

import {redis} from './config/redis';

import { BackupService } from './backup/service/backup.service';



async function main() {

  try {

    logger.info('Worker starting...');

    // Test Redis connection
    await redis.ping();
    
    logger.info('Redis connection verified');


    logger.info('Worker listening...');


    // Create and queue test job
    const databaseUrl = process.env.DATABASE_URL;

    logger.info('Creating test backup job...');

    const backupService = new BackupService();
    
    const testJob = await backupService.createBackup({
    
      databaseUrl: databaseUrl!,
    
    });

    logger.info({ testJob }, 'Backup job result');


    // shutdown
    process.on('SIGINT', async () => {
    
      logger.info('Shutting down worker...');
    
      await redis.quit();
    
      logger.info('Bye!');
    
      process.exit(0);
    
    });
  
  } catch (error) {
  
    logger.error(error, 'Failed to start worker');
  
    process.exit(1);
  
  }
  
}


main();
