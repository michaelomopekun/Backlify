import { BackupsPageClient } from "@/components/projects/backups/backups-page-client";
import { ProjectRepository, BackupRepository } from "db";
import { getCurrentUser } from "@/lib/current-user";
import { getUserOrgRole, hasMinRole, OrgRole } from "@/lib/auth-guard";
import { redirect } from "next/navigation";

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
  let userRole: OrgRole = "member";

  try {
    const [fetchedProject, fetchedBackups, user] = await Promise.all([
      ProjectRepository.getProjectById(projectId),
      BackupRepository.listBackups({ projectId }),
      getCurrentUser(),
    ]);
    project = fetchedProject;
    rawBackups = fetchedBackups;

    if (user && project?.orgId) {
      const roleInfo = await getUserOrgRole(user.id, user.email, project.orgId);
      if (roleInfo) {
        userRole = roleInfo.role;
      }
    }
  } catch (err) {
    console.error("Failed to load project backups:", err);
  }

  if (!project) {
    redirect("/dashboard/org");
  }

  const orgId = project.orgId ?? "default-org";
  const canDelete = hasMinRole(userRole, "admin");

  const initialBackups = rawBackups.map((b) => {
    const started = b.startedAt
      ? new Date(b.startedAt).getTime()
      : b.createdAt
      ? new Date(b.createdAt).getTime()
      : 0;
    const completed = b.completedAt
      ? new Date(b.completedAt).getTime()
      : b.failedAt
      ? new Date(b.failedAt).getTime()
      : 0;
    const durationSec = completed > started ? Math.round((completed - started) / 1000) : 0;
    const fileSize = typeof b.fileSize === "number" ? b.fileSize : 0;
    const isPurged = Boolean(b.purgedAt);

    let status: "complete" | "in_progress" | "failed" = "in_progress";
    if (b.status === "completed") status = "complete";
    else if (b.status === "failed") status = "failed";

    return {
      id: b.id,
      createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString(),
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
      type: (b.triggerType === "manual" || Boolean(b.id && b.id.toLowerCase().includes("manual"))
        ? "manual"
        : "scheduled") as "manual" | "scheduled",
      status,
      fileSize,
      durationSec,
      isPurged,
      purgedAt: b.purgedAt ? new Date(b.purgedAt).toISOString() : null,
      label: b.fileName ?? undefined,
    };
  });

  return (
    <BackupsPageClient
      orgId={orgId}
      projectId={projectId}
      initialBackups={initialBackups}
      canDelete={canDelete}
      userRole={userRole}
    />
  );
}

