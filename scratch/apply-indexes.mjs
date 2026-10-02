import { db, sql } from "db";

async function main() {
  console.log("Applying indexes for quota aggregation...");
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_projects_org_id" ON "projects" ("org_id");`);
  console.log("✓ Created idx_projects_org_id");

  await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_backup_jobs_project_status" ON "backup_jobs" ("project_id", "status");`);
  console.log("✓ Created idx_backup_jobs_project_status");

  await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_backup_jobs_created_at" ON "backup_jobs" ("created_at");`);
  console.log("✓ Created idx_backup_jobs_created_at");

  await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_backup_files_backup_job_id" ON "backup_files" ("backup_job_id");`);
  console.log("✓ Created idx_backup_files_backup_job_id");

  await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_backup_files_active_storage" ON "backup_files" ("backup_job_id", "file_size") WHERE "purged_at" IS NULL;`);
  console.log("✓ Created idx_backup_files_active_storage (partial index)");

  const result = await db.execute(sql`
    SELECT tablename, indexname, indexdef 
    FROM pg_indexes 
    WHERE schemaname = 'public' AND indexname LIKE 'idx_%'
    ORDER BY tablename, indexname;
  `);

  console.log("\nActive Custom Indexes:");
  for (const row of result) {
    console.log(`- [${row.tablename}] ${row.indexname}: ${row.indexdef}`);
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
