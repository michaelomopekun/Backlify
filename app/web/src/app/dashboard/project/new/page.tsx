import { getCurrentUser } from "@/lib/current-user";
import { OrganizationRepository } from "db";
import { OrgPickerHeader } from "@/components/layout/org-picker-header";
import { NewProjectForm } from "@/components/projects/new/new-project-form";

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
    <div className="min-h-screen flex flex-col bg-background">
      <OrgPickerHeader title="New project" />

      <main className="flex-1 flex items-center justify-center p-6">
        <NewProjectForm orgId={orgId} orgName={orgName} />
      </main>
    </div>
  );
}

