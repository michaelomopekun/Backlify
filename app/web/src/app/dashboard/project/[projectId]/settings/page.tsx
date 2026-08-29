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

  return <SettingsPageClient projectId={projectId} />;
}
