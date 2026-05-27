import 'dotenv/config';
import {logger} from './config/logger';
import {redis} from './config/redis';

async function main() {
  try {
    
    logger.info('Worker starting...');

    // Test Redis connection
    await redis.ping();
    logger.info('Redis connection verified');

    logger.info('Worker listening...');

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
