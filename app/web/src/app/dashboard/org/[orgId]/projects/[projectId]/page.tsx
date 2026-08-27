import { ProjectRepository, BackupRepository } from "db";
import { getCurrentUser } from "@/lib/current-user";
import { ProjectOverviewHeader } from "@/components/projects/overview/project-overview-client";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ orgId: string; projectId: string }>;
}

export default async function ProjectOverviewPage({ params }: Props) {
  const { orgId, projectId } = await params;
  const user = await getCurrentUser();

  let project: { id: string; name: string; databaseUrl: string } | null = null;

  try {
    project = await ProjectRepository.getProjectById(projectId);
  } catch {}

  const projectName = project?.name ?? "roadly's Project";
  const databaseUrl = project?.databaseUrl ?? "postgresql://:postgres@host:5432";

  return (
    <div className="w-full">
      <ProjectOverviewHeader
        projectName={projectName}
        databaseUrl={databaseUrl}
        orgId={orgId}
        projectId={projectId}
      />
    </div>
  );
}
