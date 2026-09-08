import { ProjectRepository, ScheduleRepository, BackupRepository } from "db";
import { ProjectOverviewHeader } from "@/components/projects/overview/project-overview-client";
import Link from "next/link";
import { IconArrowLeft, IconDatabase } from "@tabler/icons-react";

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
    return (
      <div className="w-full max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="size-12 rounded-xl bg-[#161616] border border-[#242424] flex items-center justify-center mx-auto text-muted-foreground">
          <IconDatabase className="size-6" />
        </div>
        <h2 className="text-xl font-semibold text-white">Project Not Found</h2>
        <p className="text-sm text-muted-foreground">
          The requested project <code className="text-xs font-mono bg-muted/40 px-1.5 py-0.5 rounded">{projectId}</code> does not exist or has been deleted.
        </p>
        <div className="pt-2">
          <Link
            href="/dashboard/org"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            <IconArrowLeft className="size-3.5" />
            <span>Return to organizations</span>
          </Link>
        </div>
      </div>
    );
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
