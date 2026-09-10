import { redirect } from "next/navigation";
import { ProjectRepository } from "db";
import { SettingsPageClient } from "@/components/projects/settings/settings-page-client";

export const metadata = {
  title: "Project Settings | Backlify",
  description: "Configure project settings, storage targets, and retention policies.",
};

export default async function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = await ProjectRepository.getProjectById(projectId);

  if (!project) {
    redirect("/dashboard/org");
  }

  return <SettingsPageClient projectId={projectId} project={project} />;
}

