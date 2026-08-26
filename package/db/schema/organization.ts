import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';


export const organizations = pgTable('organizations', {

  id: text('id').primaryKey(),

  name: varchar('name', { length: 255 }).notNull(),

  slug: varchar('slug', { length: 100 }).notNull().unique(),

  userId: text('user_id').notNull(),

  createdAt: timestamp('created_at').notNull().defaultNow(),

  updatedAt: timestamp('updated_at').notNull().defaultNow(),

});
