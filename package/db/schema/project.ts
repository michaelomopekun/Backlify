import { pgTable, text, timestamp, varchar, integer, boolean } from 'drizzle-orm/pg-core';

import { organizations } from './organization';


export const projects = pgTable('projects', {

  id: text('id').primaryKey(),

  orgId: text('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  name: varchar('name', { length: 255 }).notNull(),

  environment: varchar('environment', { length: 50 }).default('production'),

  databaseUrl: text('database_url').notNull(),

  // Storage Vault Configuration
  vaultProvider: varchar('vault_provider', { length: 50 }).default('s3'),

  vaultBucket: text('vault_bucket'),

  vaultRegion: varchar('vault_region', { length: 50 }),

  kmsKeyArn: text('kms_key_arn'),

  // Retention Policy
  retentionCount: integer('retention_count').notNull().default(7),

  keepWeekly: boolean('keep_weekly').default(true),

  keepMonthly: boolean('keep_monthly').default(true),

  // Webhooks & Notifications
  webhookUrl: text('webhook_url'),

  notifyOnFailure: boolean('notify_on_failure').default(true),

  notifyOnDrill: boolean('notify_on_drill').default(true),

  notifyOnStorage: boolean('notify_on_storage').default(false),

  createdAt: timestamp('created_at').notNull().defaultNow(),

  updatedAt: timestamp('updated_at').notNull().defaultNow(),

});

