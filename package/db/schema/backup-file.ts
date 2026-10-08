import { pgTable, text, timestamp, integer, varchar, boolean, index } from 'drizzle-orm/pg-core';

import { backupJobs } from './backup-job';



export const backupFiles = pgTable('backup_files', {

  id: text('id').primaryKey(),

  backupJobId: text('backup_job_id')
    
    .notNull()

    .references(() => backupJobs.id, { onDelete: 'cascade' }),

  fileName: varchar('file_name', { length: 255 }).notNull(),

  filePath: text('file_path').notNull(),

  fileSize: integer('file_size').notNull(),

  storageProvider: varchar('storage_provider', { length: 50 }).notNull(),

  checksum: varchar('checksum', { length: 128 }).notNull(),

  isEncrypted: boolean('is_encrypted').notNull().default(false),

  purgedAt: timestamp('purged_at'),

  createdAt: timestamp('created_at').notNull().defaultNow(),

  updatedAt: timestamp('updated_at').notNull().defaultNow(),

}, (table) => ({
  backupJobIdIdx: index('idx_backup_files_backup_job_id').on(table.backupJobId),
  jobPurgedIdx: index('idx_backup_files_job_purged').on(table.backupJobId, table.purgedAt),
}));
