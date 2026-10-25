ALTER TABLE "users" ADD COLUMN "password_hash" text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_backup_files_job_purged" ON "backup_files" ("backup_job_id","purged_at");