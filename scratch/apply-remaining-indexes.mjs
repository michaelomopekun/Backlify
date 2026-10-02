import { db, sql } from "db";

async function main() {
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_organizations_user_id" ON "organizations" ("user_id");`);
  console.log("✓ Created idx_organizations_user_id");

  await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_org_members_org_id" ON "organization_members" ("org_id");`);
  console.log("✓ Created idx_org_members_org_id");

  await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_restore_jobs_file_created" ON "restore_jobs" ("backup_file_id", "created_at" DESC);`);
  console.log("✓ Created idx_restore_jobs_file_created");

  await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_backup_jobs_stalled_sweeper" ON "backup_jobs" ("status", "updated_at") WHERE "status" IN ('in_progress', 'uploading');`);
  console.log("✓ Created idx_backup_jobs_stalled_sweeper");

  const result = await db.execute(sql`
    SELECT tablename, indexname 
    FROM pg_indexes 
    WHERE schemaname = 'public' AND indexname LIKE 'idx_%'
    ORDER BY tablename, indexname;
  `);

  console.log("\nAll Active Custom Indexes on Neon DB:");
  for (const row of result) {
    console.log(`- [${row.tablename}] ${row.indexname}`);
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
