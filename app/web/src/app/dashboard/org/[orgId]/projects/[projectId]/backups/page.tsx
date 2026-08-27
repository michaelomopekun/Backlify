import { BackupsPageClient } from "@/components/dashboard/backups-page-client";

export const metadata = {
  title: "Backups | Backlify",
  description: "View, manage, and trigger database backups for your project.",
};

export default async function BackupsPage({
  params,
}: {
  params: Promise<{ orgId: string; projectId: string }>;
}) {
  const { orgId, projectId } = await params;

  return <BackupsPageClient orgId={orgId} projectId={projectId} />;
}
