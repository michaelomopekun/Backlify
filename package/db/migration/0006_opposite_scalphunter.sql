ALTER TABLE "organizations" ADD COLUMN "billing_email" varchar(255);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_backup_files_backup_job_id" ON "backup_files" ("backup_job_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_backup_jobs_project_status" ON "backup_jobs" ("project_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_backup_jobs_project_created" ON "backup_jobs" ("project_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_backup_jobs_created_at" ON "backup_jobs" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_backup_schedules_project_active" ON "backup_schedules" ("project_id","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_org_members_user_org" ON "organization_members" ("user_id","org_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_org_members_org_id" ON "organization_members" ("org_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_organizations_user_id" ON "organizations" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_projects_org_id" ON "projects" ("org_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_restore_jobs_file_created" ON "restore_jobs" ("backup_file_id","created_at");