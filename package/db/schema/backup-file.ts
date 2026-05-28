import { pgTable, text, timestamp, integer, varchar } from 'drizzle-orm/pg-core';
import { backupJobs } from './backup-job';

export const backupFiles = pgTable('backup_files', {
  id: text('id').primaryKey(),
  backupJobId: text('backup_job_id')
    .notNull()
    .references(() => backupJobs.id),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  filePath: text('file_path').notNull(),
  fileSize: integer('file_size').notNull(),
  storageProvider: varchar('storage_provider', { length: 50 }).notNull(),
  checksum: varchar('checksum', { length: 128 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
