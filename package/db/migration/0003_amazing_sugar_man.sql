CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"image" text,
	"email_verified" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organization_members" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"user_id" text,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"role" varchar(50) DEFAULT 'member' NOT NULL,
	"invited_at" timestamp DEFAULT now() NOT NULL,
	"joined_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "backup_files" DROP CONSTRAINT "backup_files_backup_job_id_backup_jobs_id_fk";
--> statement-breakpoint
ALTER TABLE "backup_jobs" DROP CONSTRAINT "backup_jobs_project_id_projects_id_fk";
--> statement-breakpoint
ALTER TABLE "restore_jobs" DROP CONSTRAINT "restore_jobs_backup_file_id_backup_files_id_fk";
--> statement-breakpoint
ALTER TABLE "backup_files" ADD COLUMN "purged_at" timestamp;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "environment" varchar(50) DEFAULT 'production';--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "vault_provider" varchar(50) DEFAULT 's3';--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "vault_bucket" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "vault_region" varchar(50);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "kms_key_arn" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "keep_weekly" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "keep_monthly" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "webhook_url" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "notify_on_failure" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "notify_on_drill" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "notify_on_storage" boolean DEFAULT false;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "backup_files" ADD CONSTRAINT "backup_files_backup_job_id_backup_jobs_id_fk" FOREIGN KEY ("backup_job_id") REFERENCES "backup_jobs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "backup_jobs" ADD CONSTRAINT "backup_jobs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "restore_jobs" ADD CONSTRAINT "restore_jobs_backup_file_id_backup_files_id_fk" FOREIGN KEY ("backup_file_id") REFERENCES "backup_files"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
