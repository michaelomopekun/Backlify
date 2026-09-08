import { getCurrentUser } from "@/lib/current-user";
import { OrganizationRepository } from "db";
import { OrgPickerHeader } from "@/components/layout/org-picker-header";
import { NewProjectForm } from "@/components/projects/new/new-project-form";
import { redirect } from "next/navigation";

export const metadata = {
  title: "New Project | Backlify",
  description: "Connect a PostgreSQL database and configure automated backups.",
};

interface Props {
  searchParams: Promise<{ orgId?: string }>;
}

export default async function NewProjectPage({ searchParams }: Props) {
  const { orgId: queryOrgId } = await searchParams;
  const user = await getCurrentUser();

  let userOrgs: Array<{ id: string; name: string }> = [];
  try {
    userOrgs = await OrganizationRepository.getOrganizationsByUser(user.id);
  } catch {}

  // If user has no organizations yet, redirect to create one first
  if (userOrgs.length === 0) {
    redirect("/dashboard/org/new");
  }

  let selectedOrg = queryOrgId
    ? userOrgs.find((o) => o.id === queryOrgId) ?? null
    : null;

  if (!selectedOrg) {
    selectedOrg = userOrgs[0];
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <OrgPickerHeader title="New project" />

      <main className="flex-1 flex items-center justify-center p-6">
        <NewProjectForm orgId={selectedOrg.id} orgName={selectedOrg.name} />
      </main>
    </div>
  );
}
