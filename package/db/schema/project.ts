import { pgTable, text, timestamp, varchar, integer, boolean, index } from 'drizzle-orm/pg-core';

import { organizations } from './organization';


export const projects = pgTable('projects', {

  id: text('id').primaryKey(),

  orgId: text('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  name: varchar('name', { length: 255 }).notNull(),

  environment: varchar('environment', { length: 50 }).default('production'),

  databaseUrl: text('database_url').notNull(),

  // Storage Vault Configuration
  useCustomVault: boolean('use_custom_vault').default(false),

  vaultProvider: varchar('vault_provider', { length: 50 }).default('s3'),

  vaultBucket: text('vault_bucket'),

  vaultRegion: varchar('vault_region', { length: 50 }),

  vaultEndpoint: text('vault_endpoint'),

  vaultAccessKeyId: text('vault_access_key_id'),

  vaultSecretKey: text('vault_secret_key'),

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

}, (table) => ({
  orgIdIdx: index('idx_projects_org_id').on(table.orgId),
}));

