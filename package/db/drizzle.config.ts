import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load the root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export default {
  schema: './schema',
  out: './migration',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;