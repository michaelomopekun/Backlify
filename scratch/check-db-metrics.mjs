import { db, eq, and, isNull, inArray } from "db";
import { projects } from "db/schema/project";
import { backupJobs } from "db/schema/backup-job";
import { backupFiles } from "db/schema/backup-file";
import { backupSchedules } from "db/schema/backup-schedule";

async function main() {
  const allProjects = await db.select().from(projects);
  console.log("Projects count:", allProjects.length);
  for (const p of allProjects) {
    console.log(`- Project: id=${p.id}, name=${p.name}, orgId=${p.orgId}`);
  }

  const allJobs = await db.select().from(backupJobs);
  console.log("Total Backup Jobs in DB:", allJobs.length);

  const allFiles = await db.select().from(backupFiles);
  const unpurgedFiles = allFiles.filter(f => !f.purgedAt);
  const purgedFiles = allFiles.filter(f => !!f.purgedAt);
  console.log("Total Backup Files:", allFiles.length);
  console.log("Purged Files:", purgedFiles.length);
  console.log("Active (Unpurged) Files:", unpurgedFiles.length);

  const activeBytes = unpurgedFiles.reduce((s, f) => s + (f.fileSize || 0), 0);
  console.log("Active Storage (MB):", (activeBytes / (1024 * 1024)).toFixed(2));

  const allSchedules = await db.select().from(backupSchedules);
  console.log("Total Schedules:", allSchedules.length, "Active:", allSchedules.filter(s => s.isActive).length);
  for (const s of allSchedules) {
    console.log(`- Schedule: id=${s.id}, projectId=${s.projectId}, isActive=${s.isActive}`);
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
