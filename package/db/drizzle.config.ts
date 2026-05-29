import { defineConfig } from 'drizzle-kit';

const connectionString = process.env.DATABASE_URL!;
const url = new URL(connectionString);

export default defineConfig({
  schema: './schema',
  out: './migration',
  dialect: 'postgresql',
  dbCredentials: {
    host: url.hostname,
    port: parseInt(url.port),
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
  },
});