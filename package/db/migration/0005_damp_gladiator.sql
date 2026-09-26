ALTER TABLE "organizations" ADD COLUMN "plan" varchar(50) DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "billing_provider" varchar(50);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "subscription_id" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "customer_id" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "subscription_status" varchar(50) DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "subscription_ends_at" timestamp;