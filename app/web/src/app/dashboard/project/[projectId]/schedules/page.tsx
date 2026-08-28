import { SchedulesPageClient } from "@/components/projects/schedules/schedules-page-client";
import { ProjectRepository } from "db";

export const metadata = {
  title: "Schedules | Backlify",
  description: "Configure automated backup schedules and cron frequencies.",
};

export default async function SchedulesPage({
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

  return <SchedulesPageClient orgId={orgId} projectId={projectId} />;
}
