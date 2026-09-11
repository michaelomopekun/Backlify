import * as fs from "fs";
import * as path from "path";

// Read DATABASE_URL and RESEND_API_KEY from app/web/.env
const envPath = path.join(process.cwd(), "app", "web", ".env");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("DATABASE_URL=")) {
      process.env.DATABASE_URL = trimmed.substring("DATABASE_URL=".length).trim();
    }
    if (trimmed.startsWith("RESEND_API_KEY=")) {
      process.env.RESEND_API_KEY = trimmed.substring("RESEND_API_KEY=".length).trim();
    }
  }
}

if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("localhost:5432")) {
  process.env.DATABASE_URL = "postgresql://postgres:postgrespassword@127.0.0.1:5433/backlify_db";
}

const { dispatchIncidentAlert } = await import("../package/shared/config/alert-dispatcher.ts");
const { ProjectRepository } = await import("../package/db/repo/project/project.repo.ts");

async function testIncidentAlerts() {
  console.log("=== 1. Testing Automated Incident Alert Dispatcher ===");

  const projectId = "proj-d59621ae";
  const project = await ProjectRepository.getProjectById(projectId);

  if (!project) {
    throw new Error("Project not found: " + projectId);
  }

  console.log(`Target Project: ${project.name} (${project.id})`);
  console.log(`Configured Webhook: ${project.webhookUrl}`);
  console.log(`Notify on Failure: ${project.notifyOnFailure}`);
  console.log(`Notify on Drill: ${project.notifyOnDrill}`);

  // Test 1: Backup failure dispatch
  console.log("\n--- Dispatching Backup Failure Incident Alert ---");
  const backupAlertResult = await dispatchIncidentAlert({
    jobId: "test-job-fail-001",
    projectId,
    type: "backup",
    errorMessage: 'pg_dump: connection to server at "192.0.2.1", port 5432 failed: Connection timed out',
    attemptsMade: 3,
    metadata: {
      exitCode: 1,
      databaseHost: "aws-1-eu-central-1.pooler.supabase.com",
    },
  });

  console.log("Backup Alert Dispatch Result:", JSON.stringify(backupAlertResult, null, 2));

  if (!backupAlertResult.webhookDelivered) {
    throw new Error("Expected webhook to be delivered successfully!");
  }
  console.log("✓ Webhook successfully received by endpoint (HTTP 200)");

  // Test 2: Drill drift alert
  console.log("\n--- Dispatching DR Drill Drift Incident Alert ---");
  const drillAlertResult = await dispatchIncidentAlert({
    jobId: "test-drill-drift-002",
    projectId,
    type: "drill",
    errorMessage: "TOC verification drift: Archive header corrupted or SHA-256 bit-rot mismatch",
    attemptsMade: 1,
    metadata: {
      expectedChecksum: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      actualChecksum: "112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00",
    },
  });

  console.log("Drill Alert Dispatch Result:", JSON.stringify(drillAlertResult, null, 2));

  if (!drillAlertResult.webhookDelivered) {
    throw new Error("Expected drill alert webhook to be delivered!");
  }
  console.log("✓ Drill drift webhook successfully delivered");

  // Test 3: Preference gating (notifyOnFailure = false)
  console.log("\n--- Testing Preference Gating (notifyOnFailure: false) ---");
  await ProjectRepository.updateProject(projectId, { notifyOnFailure: false });

  const skippedResult = await dispatchIncidentAlert({
    jobId: "test-job-skipped-003",
    projectId,
    type: "backup",
    errorMessage: "This alert should be suppressed by user settings",
  });

  console.log("Skipped Result:", JSON.stringify(skippedResult, null, 2));
  if (skippedResult.webhookDelivered) {
    throw new Error("Expected alert to be skipped when notifyOnFailure is false!");
  }
  console.log("✓ Correctly suppressed alert when notifyOnFailure is disabled");

  // Restore preference
  await ProjectRepository.updateProject(projectId, { notifyOnFailure: true });
  console.log("✓ Restored notifyOnFailure to true");

  console.log("\n🎉 All Automated Incident Alert tests completed successfully!");
  process.exit(0);
}

testIncidentAlerts().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
