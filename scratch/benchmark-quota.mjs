import { db, sql, eq, inArray } from "db";
import { users } from "db/schema/user";
import { organizations } from "db/schema/organization";
import { projects } from "db/schema/project";
import { backupJobs } from "db/schema/backup-job";
import { backupFiles } from "db/schema/backup-file";

// Helper to measure process heap memory
function getHeapUsedKB() {
  if (global.gc) global.gc();
  return Math.round(process.memoryUsage().heapUsed / 1024);
}

// Approach A: Original Application-Side In-Memory Iteration (O(N) data transfer + JS aggregation)
async function runApplicationSideAggregation(orgId) {
  const startHeap = getHeapUsedKB();
  const startTime = performance.now();

  // 1. Fetch all projects and filter in JS
  const allProjects = await db.select().from(projects);
  const orgProjects = allProjects.filter((p) => p.orgId === orgId);
  const orgProjectIds = new Set(orgProjects.map((p) => p.id));

  // 2. Fetch all backups and filter in JS
  const allBackups = await db
    .select({
      id: backupJobs.id,
      projectId: backupJobs.projectId,
      status: backupJobs.status,
      fileId: backupFiles.id,
      fileSize: backupFiles.fileSize,
      purgedAt: backupFiles.purgedAt,
    })
    .from(backupJobs)
    .leftJoin(backupFiles, eq(backupFiles.backupJobId, backupJobs.id));

  const activeBackups = allBackups.filter(
    (b) => b.projectId && orgProjectIds.has(b.projectId) && b.status === "completed" && b.fileId && !b.purgedAt
  );

  const totalBytes = activeBackups.reduce((sum, b) => sum + (b.fileSize || 0), 0);
  const count = activeBackups.length;

  const durationMs = performance.now() - startTime;
  const memoryDeltaKB = Math.max(0, getHeapUsedKB() - startHeap);
  const recordsTransferred = allBackups.length + allProjects.length;

  return {
    count,
    totalBytes,
    durationMs,
    memoryDeltaKB,
    recordsTransferred,
  };
}

// Approach B: Optimized Indexed Database Aggregation (O(1) data transfer + DB index scan)
async function runIndexedDatabaseAggregation(orgId) {
  const startHeap = getHeapUsedKB();
  const startTime = performance.now();

  const result = await db.execute(sql`
    SELECT 
      COUNT(bf.id)::int AS count,
      COALESCE(SUM(bf.file_size), 0)::bigint AS total_bytes
    FROM projects p
    INNER JOIN backup_jobs bj ON bj.project_id = p.id AND bj.status = 'completed'
    INNER JOIN backup_files bf ON bf.backup_job_id = bj.id AND bf.purged_at IS NULL
    WHERE p.org_id = ${orgId};
  `);

  const row = result[0] || { count: 0, total_bytes: 0 };
  const count = Number(row.count);
  const totalBytes = Number(row.total_bytes);

  const durationMs = performance.now() - startTime;
  const memoryDeltaKB = Math.max(0, getHeapUsedKB() - startHeap);
  const recordsTransferred = 1; // Constant 1 scalar row

  return {
    count,
    totalBytes,
    durationMs,
    memoryDeltaKB,
    recordsTransferred,
  };
}

async function seedBenchmarkData(orgId, projectId, count, startIndex = 0) {
  const BATCH_SIZE = 500;
  const now = Date.now();

  for (let i = 0; i < count; i += BATCH_SIZE) {
    const currentBatchSize = Math.min(BATCH_SIZE, count - i);
    const jobsBatch = [];
    const filesBatch = [];

    for (let j = 0; j < currentBatchSize; j++) {
      const idx = startIndex + i + j;
      const jobId = `bench-job-${orgId}-${idx}`;
      const fileId = `bench-file-${orgId}-${idx}`;
      // 80% purged, 20% active retained (simulating GFS retention policy)
      const isPurged = idx % 5 !== 0;
      const fileSize = 1024 * 1024 * (5 + (idx % 20)); // 5MB - 25MB

      jobsBatch.push({
        id: jobId,
        projectId,
        databaseUrl: "postgresql://bench:bench@localhost:5432/bench",
        status: "completed",
        triggerType: "scheduled",
        createdAt: new Date(now - idx * 3600 * 1000),
      });

      filesBatch.push({
        id: fileId,
        backupJobId: jobId,
        fileName: `backup-${idx}.dump.gz`,
        filePath: `bench/${fileId}.dump.gz`,
        fileSize,
        storageProvider: "s3",
        checksum: "sha256-bench-dummy",
        isEncrypted: true,
        purgedAt: isPurged ? new Date(now - idx * 1800 * 1000) : null,
        createdAt: new Date(now - idx * 3600 * 1000),
      });
    }

    await db.insert(backupJobs).values(jobsBatch);
    await db.insert(backupFiles).values(filesBatch);
  }
}

async function cleanupBenchmarkData(orgId) {
  await db.execute(sql`
    DELETE FROM backup_files 
    WHERE backup_job_id IN (
      SELECT id FROM backup_jobs WHERE project_id IN (
        SELECT id FROM projects WHERE org_id = ${orgId}
      )
    );
  `);
  await db.execute(sql`
    DELETE FROM backup_jobs 
    WHERE project_id IN (
      SELECT id FROM projects WHERE org_id = ${orgId}
    );
  `);
  await db.delete(projects).where(eq(projects.orgId, orgId));
  await db.delete(organizations).where(eq(organizations.id, orgId));
}

async function runBenchmark() {
  console.log("==================================================================================");
  console.log("  BACKLIFY ARCHITECTURAL BENCHMARK: STORAGE QUOTA AGGREGATION                     ");
  console.log("  Comparing Application-Side JS Iteration vs. Indexed PostgreSQL Aggregation      ");
  console.log("==================================================================================\n");

  const testOrgId = `bench-org-${Date.now()}`;
  const testProjectId = `bench-proj-${Date.now()}`;

  const allUsers = await db.select().from(users).limit(1);
  const testUserId = allUsers[0]?.id || "usr-test";

  // Create isolated benchmark tenant
  await db.insert(organizations).values({
    id: testOrgId,
    userId: testUserId,
    name: "Benchmark Tenant",
    slug: `bench-${Date.now()}`,
    plan: "free",
  });

  await db.insert(projects).values({
    id: testProjectId,
    orgId: testOrgId,
    name: "Benchmark Project",
    databaseUrl: "postgresql://bench:bench@localhost:5432/bench",
  });

  const datasetSizes = [100, 1000, 5000, 10000];
  const results = [];

  try {
    let accumulatedCount = 0;

    for (const targetSize of datasetSizes) {
      const recordsToAdd = targetSize - accumulatedCount;
      process.stdout.write(`Seeding dataset up to ${targetSize.toLocaleString()} backup records... `);
      await seedBenchmarkData(testOrgId, testProjectId, recordsToAdd, accumulatedCount);
      accumulatedCount = targetSize;
      console.log("Done.");

      // Warmup query
      await runIndexedDatabaseAggregation(testOrgId);
      await runApplicationSideAggregation(testOrgId);

      // Run multiple iterations to capture median
      const iterations = 5;
      let appTimeSum = 0;
      let appMemSum = 0;
      let dbTimeSum = 0;
      let dbMemSum = 0;
      let appRes, dbRes;

      for (let it = 0; it < iterations; it++) {
        appRes = await runApplicationSideAggregation(testOrgId);
        appTimeSum += appRes.durationMs;
        appMemSum += appRes.memoryDeltaKB;

        dbRes = await runIndexedDatabaseAggregation(testOrgId);
        dbTimeSum += dbRes.durationMs;
        dbMemSum += dbRes.memoryDeltaKB;
      }

      const avgAppTime = appTimeSum / iterations;
      const avgDbTime = dbTimeSum / iterations;
      const speedup = (avgAppTime / avgDbTime).toFixed(1);
      const latencyReduction = (((avgAppTime - avgDbTime) / avgAppTime) * 100).toFixed(1);

      results.push({
        datasetSize: targetSize,
        appTime: avgAppTime.toFixed(2),
        dbTime: avgDbTime.toFixed(2),
        speedup: `${speedup}x`,
        latencyReduction: `${latencyReduction}%`,
        appRows: appRes.recordsTransferred,
        dbRows: dbRes.recordsTransferred,
        appMem: `${Math.round(appMemSum / iterations)} KB`,
        dbMem: `${Math.round(dbMemSum / iterations)} KB`,
      });
    }

    console.log("\n============================= BENCHMARK RESULTS =============================");
    console.table(results);

    // Also run an EXPLAIN ANALYZE on the indexed query
    console.log("\n--- PostgreSQL EXPLAIN ANALYZE for Indexed Aggregation Query ---");
    const planResult = await db.execute(sql`
      EXPLAIN (ANALYZE, BUFFERS)
      SELECT 
        COUNT(bf.id)::int AS count,
        COALESCE(SUM(bf.file_size), 0)::bigint AS total_bytes
      FROM projects p
      INNER JOIN backup_jobs bj ON bj.project_id = p.id AND bj.status = 'completed'
      INNER JOIN backup_files bf ON bf.backup_job_id = bj.id AND bf.purged_at IS NULL
      WHERE p.org_id = ${testOrgId};
    `);

    for (const row of planResult) {
      console.log(row["QUERY PLAN"]);
    }

  } finally {
    console.log("\nCleaning up isolated benchmark tenant and test records...");
    await cleanupBenchmarkData(testOrgId);
    console.log("Cleanup complete.");
  }
}

runBenchmark().then(() => process.exit(0)).catch((err) => {
  console.error("Benchmark failed:", err);
  process.exit(1);
});
