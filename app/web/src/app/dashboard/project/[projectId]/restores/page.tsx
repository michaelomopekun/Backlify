import { RestoresPageClient } from "@/components/projects/restores/restores-page-client";
import { ProjectRepository } from "db";

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
  try {
    project = await ProjectRepository.getProjectById(projectId);
  } catch {}

  const orgId = project?.orgId ?? "default-org";

  return <RestoresPageClient orgId={orgId} projectId={projectId} />;
}
