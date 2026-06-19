import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';


export const projects = pgTable('projects', {

  id: text('id').primaryKey(),

  name: varchar('name', { length: 255 }).notNull(),

  databaseUrl: text('database_url').notNull(),

  createdAt: timestamp('created_at').notNull().defaultNow(),

  updatedAt: timestamp('updated_at').notNull().defaultNow(),

});
