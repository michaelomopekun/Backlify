import { redirect } from "next/navigation";
import { OrganizationRepository, ProjectRepository, BackupRepository } from "db";
import { requireCurrentUser } from "@/lib/current-user";
import { OrgSettingsClient } from "@/components/org/settings/org-settings-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Organization Settings | Backlify",
  description: "Manage organization profile, team members, quotas, and security.",
};

interface Props {
  params: Promise<{ orgId: string }>;
}

export default async function OrgSettingsPage({ params }: Props) {
  const { orgId } = await params;
  const user = await requireCurrentUser();

  let org: {
    id: string;
    name: string;
    slug: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  } | null = null;

  try {
    org = await OrganizationRepository.getOrganizationById(orgId);
  } catch {}

  if (!org) {
    redirect("/dashboard/org");
  }

  const orgName = org.name;

  // Compute organization resource stats
  let projectsCount = 0;
  let totalStorageBytes = 0;
  try {
    const allProjects = await ProjectRepository.getAllProjects();
    const orgProjects = allProjects.filter((p) => p.orgId === orgId);
    projectsCount = orgProjects.length;

    const allBackups = await BackupRepository.listBackups({});
    const orgProjectIds = new Set(orgProjects.map((p) => p.id));
    const orgBackups = allBackups.filter((b) => b.projectId && orgProjectIds.has(b.projectId));
    totalStorageBytes = orgBackups.reduce((sum, b) => sum + (b.fileSize || 0), 0);
  } catch {}

  // Fetch team members
  let members: any[] = [];
  try {
    members = await OrganizationRepository.getOrganizationMembers(orgId);
    // If no members are recorded yet, seed current user as owner
    if (members.length === 0) {
      const owner = await OrganizationRepository.addMember({
        id: `mem_${org.id.replace("org_", "")}_owner`,
        orgId: org.id,
        userId: user.id,
        email: user.email,
        name: user.name,
        role: "owner",
      });
      members = [owner];
    }
  } catch {}

  return (
    <main className="flex-1 px-8 lg:px-12 py-8 max-w-[1400px] w-full">
            <OrgSettingsClient
              organization={{
                id: org.id,
                name: org.name,
                slug: org.slug,
                userId: org.userId,
                plan: (org as any).plan || "free",
                billingProvider: (org as any).billingProvider || null,
                subscriptionEndsAt: (org as any).subscriptionEndsAt || null,
                createdAt: org.createdAt,
                projectsCount,
                totalStorageBytes,
              }}
              initialMembers={members}
            />
    </main>
  );
}
