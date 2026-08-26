import { pgTable, text, timestamp, varchar, integer } from 'drizzle-orm/pg-core';

import { organizations } from './organization';


export const projects = pgTable('projects', {

  id: text('id').primaryKey(),

  orgId: text('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  name: varchar('name', { length: 255 }).notNull(),

  databaseUrl: text('database_url').notNull(),

  retentionCount: integer('retention_count').notNull().default(7),

  createdAt: timestamp('created_at').notNull().defaultNow(),

  updatedAt: timestamp('updated_at').notNull().defaultNow(),

});
