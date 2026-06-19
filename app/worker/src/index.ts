import 'dotenv/config';

import {logger} from 'shared/config/logger';

import {redis} from 'shared/config/redis';

// import { BackupService } from './backup/service/backup.service';

// import { RestoreService } from './restore/service/restore.service';

import './backup/queue/backup.worker';

import './restore/queue/restore.worker';

import { loadSchedules } from './schedule/schedule.loader';




async function main() {

  try {

    logger.info('Worker starting...');

    // Test Redis connection
    await redis.ping();
    
    logger.info('Redis connection verified');


    // Load active backup schedules
    await loadSchedules();


    // // backup test

    // logger.info('backup Worker listening...');


    // // Create and queue test job
    // const databaseUrl1 = "postgresql://postgres:Galaxias2005%25%25@localhost:5002/roadrescuedb";

    // logger.info('Creating test backup job...');

    // const backupService = new BackupService();
    
    // const testJob1 = await backupService.createBackup({
    
    //   databaseUrl: databaseUrl1!,
    
    // });

    // logger.info({ testJob1 }, 'Backup job result');



    // // restore test

    // logger.info("restore Worker Listening...");

    // // Create and queue test job

    // const databaseUrl = "postgresql://postgres:Galaxias2005%25%25@localhost:5002/roadrescuedb_restored";

    // logger.info("Creating test restore job...");

    // const restoreService = new RestoreService();

    // const testJob = await restoreService.createRestore({

    //   targetDatabaseUrl: databaseUrl,
    //   backupFileId: "bkf-c4bd03c1-d41" 

    // });

    // logger.info({ testJob }, "Restore job result");
    

    logger.info('Worker is now listening for backup and restore jobs...');


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
