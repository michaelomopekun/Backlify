import 'dotenv/config';

import {logger} from './config/logger';

import {redis} from './config/redis';

import { BackupService } from './service/backup.service';



async function main() {

  try {

    logger.info('Worker starting...');

    // Test Redis connection
    await redis.ping();
    
    logger.info('Redis connection verified');


    logger.info('Worker listening...');


    // Create and queue test job
    logger.info('Creating test backup job...');

    const backupService = new BackupService();
    
    const testJob = await backupService.createBackup({
    
      databaseUrl: 'postgresql://postgres:password@localhost:5432/test_db',
    
    });

    logger.info({ testJob }, 'Test backup job queued successfully');


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
