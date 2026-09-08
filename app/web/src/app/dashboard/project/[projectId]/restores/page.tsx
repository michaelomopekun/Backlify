import { RestoresPageClient } from "@/components/projects/restores/restores-page-client";
import { ProjectRepository, BackupRepository } from "db";

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
  try {
    project = await ProjectRepository.getProjectById(projectId);
    rawBackups = await BackupRepository.listBackups({ projectId });
  } catch {}

  const orgId = project?.orgId ?? "default-org";

  const recoveryPoints = rawBackups
    .filter((b) => b.status === "completed")
    .map((b) => {
      const d = b.completedAt ? new Date(b.completedAt) : new Date(b.createdAt);
      const sizeMb = b.fileSize ? Math.round(b.fileSize / (1024 * 1024)) : 0;
      return {
        id: b.id,
        day: d.toLocaleDateString("en-US", { weekday: "short" }),
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }) + " UTC",
        size: `${sizeMb} MB`,
        snapshotId: b.fileName || b.id.slice(0, 10),
      };
    });

  return (
    <RestoresPageClient
      orgId={orgId}
      projectId={projectId}
      recoveryPoints={recoveryPoints}
    />
  );
}
