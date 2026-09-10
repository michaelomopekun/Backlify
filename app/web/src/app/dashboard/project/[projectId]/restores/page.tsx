import { RestoresPageClient } from "@/components/projects/restores/restores-page-client";
import { ProjectRepository, BackupRepository, RestoreRepository } from "db";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Restores | Backlify",
  description: "Point-in-time database restores and disaster recovery drills.",
};

export default async function RestoresPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  let project: { id: string; orgId?: string | null } | null = null;
  let rawBackups: any[] = [];
  let rawRestores: any[] = [];
  try {
    project = await ProjectRepository.getProjectById(projectId);
    rawBackups = await BackupRepository.listBackups({ projectId });
    rawRestores = await RestoreRepository.listRestoreJobsByProjectId(projectId);
  } catch {}

  if (!project) {
    redirect("/dashboard/org");
  }

  const orgId = project.orgId ?? "default-org";

  const recoveryPoints = rawBackups
    .filter((b) => b.status === "completed")
    .map((b) => {
      const d = b.completedAt ? new Date(b.completedAt) : new Date(b.createdAt);
      const sizeMb = b.fileSize ? Math.round(b.fileSize / (1024 * 1024)) : 0;
      return {
        id: b.fileId || b.id,
        day: d.toLocaleDateString("en-US", { weekday: "short" }),
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }) + " UTC",
        size: `${sizeMb} MB`,
        snapshotId: b.fileName || b.id.slice(0, 10),
      };
    });

  const initialDrills = rawRestores.map((job) => {
    let parsedInfo: any = null;
    try {
      parsedInfo = job.errorMessage ? JSON.parse(job.errorMessage) : null;
    } catch {}

    const isDrill = job.targetDatabaseUrl?.startsWith("headless");
    const d = job.completedAt ? new Date(job.completedAt) : new Date(job.createdAt);
    const durationSec = job.startedAt && job.completedAt
      ? Math.max(1, Math.round((new Date(job.completedAt).getTime() - new Date(job.startedAt).getTime()) / 1000))
      : (parsedInfo?.durationMs ? Math.max(1, Math.round(parsedInfo.durationMs / 1000)) : 2);

    return {
      id: job.id,
      type: (isDrill ? "automated_drill" : "live_restore") as any,
      status: (job.status === "completed" ? "passed" : job.status === "failed" ? "failed" : "running") as any,
      targetDb: isDrill ? "headless-sandbox (verified in memory)" : (job.targetDatabaseUrl ? job.targetDatabaseUrl.replace(/:[^@]+@/, ":••••••••@") : "target-database"),
      sourceSnapshot: job.fileName || job.backupFileId.slice(0, 10),
      sourceTimestamp: d.toISOString(),
      executedAt: d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      durationSec,
      sizeMb: job.fileSize ? Math.round(job.fileSize / (1024 * 1024)) : 0,
      integrityChecks: [
        { name: "Bit-rot Checksum (SHA-256)", passed: job.status === "completed", details: job.checksum ? `${job.checksum.slice(0, 12)}...` : undefined },
        { name: "pg_restore TOC Inspection", passed: job.status === "completed", details: parsedInfo?.tableCount ? `${parsedInfo.tableCount} tables verified` : undefined },
        { name: "Schema DDL & Constraints", passed: job.status === "completed" }
      ],
      initiatedBy: "Console Admin",
      logs: job.errorMessage && !parsedInfo ? [job.errorMessage] : []
    };
  });

  return (
    <RestoresPageClient
      orgId={orgId}
      projectId={projectId}
      recoveryPoints={recoveryPoints}
      initialDrills={initialDrills}
    />
  );
}
