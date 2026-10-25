import { redirect } from "next/navigation";
import { OrganizationRepository } from "db";
import { requireCurrentUser } from "@/lib/current-user";
import { OrgTeamClient } from "@/components/org/team/org-team-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Team Members | Backlify",
  description: "Manage team members, roles, and invitations for your organization.",
};

interface Props {
  params: Promise<{ orgId: string }>;
}

export default async function OrgTeamPage({ params }: Props) {
  const { orgId } = await params;
  const user = await requireCurrentUser();

  const org = await OrganizationRepository.getOrganizationById(orgId);
  if (!org) {
    redirect("/dashboard/org");
  }

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
  } catch (err) {
    console.error("Failed to fetch organization members:", err);
  }

  const organizationData = {
    id: org.id,
    name: org.name,
    slug: org.slug,
    userId: org.userId,
    plan: (org as any).plan || "free",
    billingProvider: (org as any).billingProvider || null,
    subscriptionEndsAt: (org as any).subscriptionEndsAt || null,
  };

  const currentUserData = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  return (
    <main className="flex-1 px-8 lg:px-12 py-8 max-w-[1400px] w-full">
      <OrgTeamClient
        organization={organizationData}
        initialMembers={members}
        currentUser={currentUserData}
      />
    </main>
  );
}
