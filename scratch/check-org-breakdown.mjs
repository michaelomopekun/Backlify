import { db, eq, and, isNull, inArray } from "db";
import { projects } from "db/schema/project";
import { backupJobs } from "db/schema/backup-job";
import { backupFiles } from "db/schema/backup-file";

async function main() {
  const orgProjects = await db.select().from(projects).where(eq(projects.orgId, "org_dbf14727fcd348ea"));
  const pIds = orgProjects.map(p => p.id);

  const jobs = await db.select({
    jobId: backupJobs.id,
    projectId: backupJobs.projectId,
    status: backupJobs.status,
    fileSize: backupFiles.fileSize,
    purgedAt: backupFiles.purgedAt
  })
  .from(backupJobs)
  .leftJoin(backupFiles, eq(backupFiles.backupJobId, backupJobs.id))
  .where(inArray(backupJobs.projectId, pIds));

  console.log("Org Total Backup Jobs:", jobs.length);
  const activeBackups = jobs.filter(j => j.status === "completed" && j.fileSize && !j.purgedAt);
  console.log("Org Active (unpurged completed) Backups:", activeBackups.length);
  const activeBytes = activeBackups.reduce((s, j) => s + (j.fileSize || 0), 0);
  console.log("Org Active Storage:", (activeBytes / (1024 * 1024)).toFixed(2), "MB");

  const purgedBackups = jobs.filter(j => !!j.purgedAt);
  console.log("Org Purged Backups:", purgedBackups.length);
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
