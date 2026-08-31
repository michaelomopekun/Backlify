import { BackupsPageClient } from "@/components/projects/backups/backups-page-client";
import { ProjectRepository, BackupRepository } from "db";

export const metadata = {
  title: "Backups | Backlify",
  description: "View, manage, and trigger database backups for your project.",
};

export default async function BackupsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  let project: { id: string; orgId?: string | null; databaseUrl?: string } | null = null;
  let rawBackups: any[] = [];

  try {
    project = await ProjectRepository.getProjectById(projectId);
    rawBackups = await BackupRepository.listBackups({ projectId });
  } catch (err) {
    console.error("Failed to load project backups:", err);
  }

  const orgId = project?.orgId ?? "default-org";

  const initialBackups = rawBackups.map((b) => {
    const started = b.startedAt ? new Date(b.startedAt).getTime() : 0;
    const completed = b.completedAt ? new Date(b.completedAt).getTime() : 0;
    const durationSec = completed > started ? Math.round((completed - started) / 1000) : 0;
    const sizeMb = b.fileSize ? Math.round(b.fileSize / (1024 * 1024)) : 0;

    let status: "complete" | "in_progress" | "failed" = "in_progress";
    if (b.status === "completed") status = "complete";
    else if (b.status === "failed") status = "failed";

    return {
      id: b.id,
      timestamp: b.createdAt
        ? new Date(b.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "UTC",
          }) + " UTC"
        : "Just now",
      type: (b.id.includes("manual") ? "manual" : "scheduled") as "manual" | "scheduled",
      status,
      sizeMb,
      durationSec,
      label: b.fileName ?? undefined,
    };
  });

  return (
    <BackupsPageClient
      orgId={orgId}
      projectId={projectId}
      initialBackups={initialBackups.length > 0 ? initialBackups : undefined}
    />
  );
}

