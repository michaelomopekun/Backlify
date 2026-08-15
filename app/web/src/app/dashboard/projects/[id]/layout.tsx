import { notFound } from "next/navigation";

import { Topbar } from "@/components/dashboard/topbar";
import { ProjectTabs } from "@/components/dashboard/project-tabs";
import { BackupNowButton } from "@/components/dashboard/backup-now-button";
import { getProject } from "@/lib/queries";

export const dynamic = "force-dynamic";

/**
 * Shell for one project.
 *
 * The header and tab bar live here so they don't remount between tabs — the
 * project name stays put and only the panel below it changes. "Back up now"
 * sits in the header for the same reason: it's true of the project, not of any
 * one tab.
 */
export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) notFound();

  return (
    <>
      <Topbar
        title={project.name}
        description={
          project.retentionCount
            ? `Keeping the last ${project.retentionCount} backups`
            : undefined
        }
        actions={<BackupNowButton projectId={project.id} />}
      />

      <div className="px-6 pt-4 lg:px-8">
        <ProjectTabs projectId={project.id} />
      </div>

      <div className="px-6 py-6 lg:px-8">{children}</div>
    </>
  );
}
