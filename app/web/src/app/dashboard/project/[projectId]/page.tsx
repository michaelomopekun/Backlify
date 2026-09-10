import { ProjectRepository, ScheduleRepository, BackupRepository } from "db";
import { ProjectOverviewHeader } from "@/components/projects/overview/project-overview-client";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectOverviewPage({ params }: Props) {
  const { projectId } = await params;

  let project: { id: string; name: string; databaseUrl: string; orgId?: string | null; retentionCount?: number | null } | null = null;
  let schedules: any[] = [];
  let backupJobs: any[] = [];

  try {
    project = await ProjectRepository.getProjectById(projectId);
    if (project) {
      schedules = await ScheduleRepository.getSchedulesByProjectId(projectId);
      backupJobs = await BackupRepository.listBackups({ projectId });
    }
  } catch (err) {
    console.error("Failed to load project overview data:", err);
  }

  if (!project) {
    redirect("/dashboard/org");
  }

  const orgId = project.orgId || "default-org";

  return (
    <div className="w-full">
      <ProjectOverviewHeader
        project={project}
        schedules={schedules}
        backupJobs={backupJobs}
        orgId={orgId}
        projectId={projectId}
      />
    </div>
  );
}
