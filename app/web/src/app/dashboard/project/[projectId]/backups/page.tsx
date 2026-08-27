import { BackupsPageClient } from "@/components/projects/backups/backups-page-client";
import { ProjectRepository } from "db";

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

  let project: { id: string; orgId?: string | null } | null = null;
  try {
    project = await ProjectRepository.getProjectById(projectId);
  } catch {}

  const orgId = project?.orgId ?? "default-org";

  return <BackupsPageClient orgId={orgId} projectId={projectId} />;
}
