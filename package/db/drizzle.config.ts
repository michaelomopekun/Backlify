import type { Config } from 'drizzle-kit';

// const connectionString = process.env.DATABASE_URL!;

export default {
  schema: './schema',
  out: './migration',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;