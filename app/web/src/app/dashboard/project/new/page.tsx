import { getCurrentUser } from "@/lib/current-user";
import { OrganizationRepository } from "db";
import { NewProjectWizard } from "@/components/projects/new/new-project-wizard";

export const metadata = {
  title: "New Project | Backlify",
  description: "Connect a PostgreSQL database and configure automated backups.",
};

export default async function NewProjectPage() {
  const user = await getCurrentUser();
  const orgId = "default-org";

  let org: { id: string; name: string } | null = null;
  try {
    org = await OrganizationRepository.getOrganizationById(orgId);
  } catch {}

  const orgName = org?.name ?? `${user.name}'s Org`;

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-foreground p-6 sm:p-12">
      <NewProjectWizard orgId={orgId} orgName={orgName} />
    </div>
  );
}
