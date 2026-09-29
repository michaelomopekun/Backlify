import { db, eq, and, isNull, inArray } from "db";
import { projects } from "db/schema/project";
import { backupJobs } from "db/schema/backup-job";
import { backupFiles } from "db/schema/backup-file";

async function main() {
  const orgProjects = await db.select().from(projects).where(eq(projects.orgId, "org_dbf14727fcd348ea"));
  const pIds = orgProjects.map(p => p.id);

  const activeFiles = await db.select({
    jobId: backupJobs.id,
    projectId: backupJobs.projectId,
    fileId: backupFiles.id,
    fileName: backupFiles.fileName,
    fileSize: backupFiles.fileSize,
    createdAt: backupJobs.createdAt
  })
  .from(backupJobs)
  .innerJoin(backupFiles, eq(backupFiles.backupJobId, backupJobs.id))
  .where(and(inArray(backupJobs.projectId, pIds), isNull(backupFiles.purgedAt), eq(backupJobs.status, "completed")))
  .orderBy(backupJobs.createdAt);

  console.log("Total active files:", activeFiles.length);
  for (const f of activeFiles) {
    console.log(`${f.jobId} | ${(f.fileSize / (1024*1024)).toFixed(2)} MB | ${f.createdAt.toISOString()}`);
  }
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
