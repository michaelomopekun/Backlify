import { ProjectRepository, BackupRepository } from "db";
import { getCurrentUser } from "@/lib/current-user";
import { ProjectOverviewHeader } from "@/components/dashboard/project-overview-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { IconDatabaseImport, IconCalendarPlus, IconRotateClockwise2 } from "@tabler/icons-react";

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

  const projectName = project?.name ?? "roadRescue's Project";
  const databaseUrl = project?.databaseUrl ?? "postgresql://postgres:postgres@aws-0-eu-central-1.pooler.supabase.com:5432/postgres";

  return (
    <div className="space-y-6">
      {/* Red-Circled Inspired Components: Metric Matrix, Topology Canvas, Telemetry Strip */}
      <ProjectOverviewHeader
        projectName={projectName}
        databaseUrl={databaseUrl}
        orgId={orgId}
        projectId={projectId}
      />

      {/* Quick Action Dock */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold gap-1.5 h-8">
          <Link href={`/dashboard/org/${orgId}/projects/${projectId}/backups`}>
            <IconDatabaseImport className="size-3.5" />
            <span>Create Backup Now</span>
          </Link>
        </Button>

        <Button asChild variant="outline" className="border-border text-foreground hover:bg-accent text-xs font-medium gap-1.5 h-8">
          <Link href={`/dashboard/org/${orgId}/projects/${projectId}/schedules`}>
            <IconCalendarPlus className="size-3.5 text-muted-foreground" />
            <span>Configure Schedule</span>
          </Link>
        </Button>

        <Button asChild variant="outline" className="border-border text-foreground hover:bg-accent text-xs font-medium gap-1.5 h-8">
          <Link href={`/dashboard/org/${orgId}/projects/${projectId}/restores`}>
            <IconRotateClockwise2 className="size-3.5 text-muted-foreground" />
            <span>Restore Backup</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
