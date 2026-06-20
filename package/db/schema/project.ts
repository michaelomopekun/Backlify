import { pgTable, text, timestamp, varchar, integer } from 'drizzle-orm/pg-core';


export const projects = pgTable('projects', {

  id: text('id').primaryKey(),

  name: varchar('name', { length: 255 }).notNull(),

  databaseUrl: text('database_url').notNull(),

  retentionCount: integer('retention_count').notNull().default(7),

  createdAt: timestamp('created_at').notNull().defaultNow(),

  updatedAt: timestamp('updated_at').notNull().defaultNow(),

});
