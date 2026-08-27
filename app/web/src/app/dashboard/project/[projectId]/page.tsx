import { ProjectRepository } from "db";
import { ProjectOverviewHeader } from "@/components/projects/overview/project-overview-client";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectOverviewPage({ params }: Props) {
  const { projectId } = await params;

  let project: { id: string; name: string; databaseUrl: string; orgId?: string | null } | null = null;

  try {
    project = await ProjectRepository.getProjectById(projectId);
  } catch {}

  const orgId = project?.orgId ?? "default-org";
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
