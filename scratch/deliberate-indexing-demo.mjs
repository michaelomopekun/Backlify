import { db, sql, eq } from "db";
import { users } from "db/schema/user";
import { organizations } from "db/schema/organization";
import { projects } from "db/schema/project";
import { backupJobs } from "db/schema/backup-job";
import { backupFiles } from "db/schema/backup-file";
import { organizationMembers } from "db/schema/organization";
import { backupSchedules } from "db/schema/backup-schedule";

async function formatPlan(planRows) {
  return planRows.map((r) => r["QUERY PLAN"]).join("\n");
}

async function runDemo() {
  console.log("=========================================================================================");
  console.log("  DELIBERATE INDEXING WORKFLOW: THE 6-STEP POSTGRESQL OPTIMIZATION METHODOLOGY          ");
  console.log("=========================================================================================\n");

  // Setup isolated test data
  const testOrgId = `idx-org-${Date.now()}`;
  const testProjectId = `idx-proj-${Date.now()}`;
  const allUsers = await db.select().from(users).limit(1);
  const testUserId = allUsers[0]?.id || "usr-seed";

  console.log(`Cleaning any prior test data and setting up environment (Org: ${testOrgId}, Project: ${testProjectId})...`);

  await db.execute(sql`DELETE FROM backup_jobs WHERE project_id IN (SELECT id FROM projects WHERE org_id LIKE 'idx-org-%');`);
  await db.execute(sql`DELETE FROM organization_members WHERE org_id LIKE 'idx-org-%';`);
  await db.execute(sql`DELETE FROM projects WHERE org_id LIKE 'idx-org-%';`);
  await db.execute(sql`DELETE FROM organizations WHERE id LIKE 'idx-org-%';`);

  await db.insert(organizations).values({
    id: testOrgId,
    userId: testUserId,
    name: "Indexing Demo Tenant",
    slug: `idx-tenant-${Date.now()}`,
    plan: "pro",
  });

  await db.insert(projects).values({
    id: testProjectId,
    orgId: testOrgId,
    name: "Demo Project",
    databaseUrl: "postgresql://demo:demo@localhost:5432/demo",
  });

  // Seed 5,000 backup jobs for this project to create realistic cardinality
  const BATCH = 500;
  const TOTAL_JOBS = 5000;
  const now = Date.now();

  process.stdout.write(`Seeding ${TOTAL_JOBS.toLocaleString()} backup jobs for project-level query analysis... `);
  for (let i = 0; i < TOTAL_JOBS; i += BATCH) {
    const jobs = [];
    for (let j = 0; j < BATCH; j++) {
      const idx = i + j;
      jobs.push({
        id: `idx-job-${testOrgId}-${idx}`,
        projectId: testProjectId,
        databaseUrl: "postgresql://demo:demo@localhost:5432/demo",
        status: idx % 10 === 0 ? "failed" : "completed",
        triggerType: idx % 2 === 0 ? "scheduled" : "manual",
        createdAt: new Date(now - idx * 60000), // 1 minute apart
      });
    }
    await db.insert(backupJobs).values(jobs);
  }
  console.log("Done.\n");

  // Also seed organization members for RBAC query testing
  process.stdout.write("Seeding 2,000 organization member records for RBAC query analysis... ");
  for (let i = 0; i < 2000; i += BATCH) {
    const members = [];
    for (let j = 0; j < BATCH; j++) {
      const idx = i + j;
      members.push({
        id: `mem-${testOrgId}-${idx}`,
        orgId: testOrgId,
        userId: idx === 0 ? testUserId : `user-other-${idx}`,
        email: `member-${idx}@example.com`,
        role: "admin",
      });
    }
    await db.insert(organizationMembers).values(members);
  }
  console.log("Done.\n");

  try {
    // =========================================================================================
    // CASE STUDY 1: PROJECT BACKUP FEED (Filtering by project_id + Ordering by created_at DESC)
    // =========================================================================================
    console.log("-----------------------------------------------------------------------------------------");
    console.log("CASE STUDY 1: Project Backup Feed (Pagination & Feed Query)");
    console.log("Query: SELECT * FROM backup_jobs WHERE project_id = $1 ORDER BY created_at DESC LIMIT 10;");
    console.log("-----------------------------------------------------------------------------------------\n");

    console.log("Step 1 & 2: Running EXPLAIN (ANALYZE, BUFFERS) BEFORE index...");
    // Ensure test index does not exist yet
    await db.execute(sql`DROP INDEX IF EXISTS idx_backup_jobs_project_created;`);

    const beforeFeedPlan = await db.execute(sql`
      EXPLAIN (ANALYZE, BUFFERS)
      SELECT id, project_id, status, created_at
      FROM backup_jobs
      WHERE project_id = ${testProjectId}
      ORDER BY created_at DESC
      LIMIT 10;
    `);
    const beforeFeedPlanText = await formatPlan(beforeFeedPlan);
    console.log(beforeFeedPlanText);

    console.log("\nStep 3: Access Pattern Analysis:");
    console.log("- Access Pattern: High-frequency user page load displaying the 10 most recent backups.");
    console.log("- Bottleneck: The planner must fetch ALL rows matching project_id, buffer them, and run an explicit 'Sort' node (top-N heapsort) before returning the top 10.");
    console.log("- Index Solution: Compound index `(project_id, created_at DESC)` provides pre-sorted B-tree leaf traversal, eliminating the 'Sort' node entirely!\n");

    console.log("Step 4: Adding deliberate index:");
    console.log("SQL: CREATE INDEX idx_backup_jobs_project_created ON backup_jobs (project_id, created_at DESC);\n");
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_backup_jobs_project_created 
      ON backup_jobs (project_id, created_at DESC);
    `);

    console.log("Step 5: Re-running EXPLAIN (ANALYZE, BUFFERS) AFTER index...");
    const afterFeedPlan = await db.execute(sql`
      EXPLAIN (ANALYZE, BUFFERS)
      SELECT id, project_id, status, created_at
      FROM backup_jobs
      WHERE project_id = ${testProjectId}
      ORDER BY created_at DESC
      LIMIT 10;
    `);
    const afterFeedPlanText = await formatPlan(afterFeedPlan);
    console.log(afterFeedPlanText);

    // =========================================================================================
    // CASE STUDY 2: RBAC AUTH-GUARD QUERY (Filtering by user_id AND org_id on EVERY request)
    // =========================================================================================
    console.log("\n-----------------------------------------------------------------------------------------");
    console.log("CASE STUDY 2: RBAC Authorization Guard (Hot-Path Per-Request Verification)");
    console.log("Query: SELECT role FROM organization_members WHERE user_id = $1 AND org_id = $2;");
    console.log("-----------------------------------------------------------------------------------------\n");

    console.log("Step 1 & 2: Running EXPLAIN (ANALYZE, BUFFERS) BEFORE index...");
    await db.execute(sql`DROP INDEX IF EXISTS idx_org_members_user_org;`);

    const beforeAuthPlan = await db.execute(sql`
      EXPLAIN (ANALYZE, BUFFERS)
      SELECT role
      FROM organization_members
      WHERE user_id = ${testUserId} AND org_id = ${testOrgId};
    `);
    const beforeAuthPlanText = await formatPlan(beforeAuthPlan);
    console.log(beforeAuthPlanText);

    console.log("\nStep 3: Access Pattern Analysis:");
    console.log("- Access Pattern: Executed on every API route, Server Action, and protected dashboard render.");
    console.log("- Bottleneck: Sequential scan across all organization memberships in the entire database (Filter: user_id AND org_id).");
    console.log("- Index Solution: Composite unique index on `(user_id, org_id)` provides immediate O(log N) point lookup!\n");

    console.log("Step 4: Adding deliberate index:");
    console.log("SQL: CREATE UNIQUE INDEX idx_org_members_user_org ON organization_members (user_id, org_id);\n");
    await db.execute(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_org_members_user_org 
      ON organization_members (user_id, org_id);
    `);

    console.log("Step 5: Re-running EXPLAIN (ANALYZE, BUFFERS) AFTER index...");
    const afterAuthPlan = await db.execute(sql`
      EXPLAIN (ANALYZE, BUFFERS)
      SELECT role
      FROM organization_members
      WHERE user_id = ${testUserId} AND org_id = ${testOrgId};
    `);
    const afterAuthPlanText = await formatPlan(afterAuthPlan);
    console.log(afterAuthPlanText);

    // =========================================================================================
    // CASE STUDY 3: SCHEDULES BY PROJECT IDS (Multi-Tenant Schedule Lookup)
    // =========================================================================================
    console.log("\n-----------------------------------------------------------------------------------------");
    console.log("CASE STUDY 3: Schedule Lookup (Active Schedules Scoped to Projects)");
    console.log("Query: SELECT * FROM backup_schedules WHERE project_id = $1 AND is_active = true;");
    console.log("-----------------------------------------------------------------------------------------\n");

    await db.insert(backupSchedules).values({
      id: `sch-${Date.now()}`,
      projectId: testProjectId,
      cronExpression: "0 2 * * *",
      isActive: true,
    });

    console.log("Step 1 & 2: Running EXPLAIN (ANALYZE, BUFFERS) BEFORE index...");
    await db.execute(sql`DROP INDEX IF EXISTS idx_backup_schedules_project_active;`);

    const beforeSchPlan = await db.execute(sql`
      EXPLAIN (ANALYZE, BUFFERS)
      SELECT *
      FROM backup_schedules
      WHERE project_id = ${testProjectId} AND is_active = true;
    `);
    const beforeSchPlanText = await formatPlan(beforeSchPlan);
    console.log(beforeSchPlanText);

    console.log("\nStep 3: Access Pattern Analysis:");
    console.log("- Access Pattern: Polled by cron runner and loaded on org/project schedule dashboard.");
    console.log("- Bottleneck: Seq Scan on backup_schedules with filter condition.");
    console.log("- Index Solution: Composite index on `(project_id, is_active)`.\n");

    console.log("Step 4: Adding deliberate index:");
    console.log("SQL: CREATE INDEX idx_backup_schedules_project_active ON backup_schedules (project_id, is_active);\n");
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_backup_schedules_project_active 
      ON backup_schedules (project_id, is_active);
    `);

    console.log("Step 5: Re-running EXPLAIN (ANALYZE, BUFFERS) AFTER index...");
    const afterSchPlan = await db.execute(sql`
      EXPLAIN (ANALYZE, BUFFERS)
      SELECT *
      FROM backup_schedules
      WHERE project_id = ${testProjectId} AND is_active = true;
    `);
    const afterSchPlanText = await formatPlan(afterSchPlan);
    console.log(afterSchPlanText);

  } finally {
    console.log("\nCleaning up test benchmark data...");
    await db.execute(sql`DELETE FROM backup_schedules WHERE project_id = ${testProjectId};`);
    await db.execute(sql`DELETE FROM backup_jobs WHERE project_id = ${testProjectId};`);
    await db.execute(sql`DELETE FROM organization_members WHERE org_id = ${testOrgId};`);
    await db.execute(sql`DELETE FROM projects WHERE id = ${testProjectId};`);
    await db.execute(sql`DELETE FROM organizations WHERE id = ${testOrgId};`);
    console.log("Cleanup complete.");
  }
}

runDemo().then(() => process.exit(0)).catch((err) => {
  console.error("Demo failed:", err);
  process.exit(1);
});
