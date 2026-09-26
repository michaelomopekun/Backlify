import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';


export const organizations = pgTable('organizations', {
  id: text('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  userId: text('user_id').notNull(),
  plan: varchar('plan', { length: 50 }).notNull().default('free'), // 'free' | 'pro'
  billingProvider: varchar('billing_provider', { length: 50 }), // 'stripe' | 'paystack'
  subscriptionId: text('subscription_id'),
  customerId: text('customer_id'),
  subscriptionStatus: varchar('subscription_status', { length: 50 }).default('active'), // 'active' | 'past_due' | 'canceled'
  subscriptionEndsAt: timestamp('subscription_ends_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const organizationMembers = pgTable('organization_members', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: text('user_id'),
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  role: varchar('role', { length: 50 }).notNull().default('member'), // 'owner' | 'admin' | 'member'
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  joinedAt: timestamp('joined_at'),
});

