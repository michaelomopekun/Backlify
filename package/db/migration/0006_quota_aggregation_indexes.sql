CREATE INDEX IF NOT EXISTS "idx_projects_org_id" ON "projects" ("org_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_backup_jobs_project_status" ON "backup_jobs" ("project_id", "status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_backup_jobs_created_at" ON "backup_jobs" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_backup_files_backup_job_id" ON "backup_files" ("backup_job_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_backup_files_active_storage" ON "backup_files" ("backup_job_id", "file_size") WHERE "purged_at" IS NULL;
