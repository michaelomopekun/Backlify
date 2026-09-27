import { redirect } from "next/navigation";
import { OrganizationRepository, ProjectRepository } from "db";
import { requireCurrentUser } from "@/lib/current-user";
import { BillingPageClient } from "@/components/org/billing/billing-page-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Billing & Subscription | Backlify",
  description: "Manage subscription plans, invoices, and billing recipients for your organization.",
};

interface Props {
  params: Promise<{ orgId: string }>;
}

export default async function OrgBillingPage({ params }: Props) {
  const { orgId } = await params;
  const user = await requireCurrentUser();

  const org = await OrganizationRepository.getOrganizationById(orgId);
  if (!org) {
    redirect("/dashboard/org");
  }

  // Count active projects in this org
  const orgProjects = (await ProjectRepository.getAllProjects()).filter(
    (p) => p.orgId === orgId
  );

  const organizationData = {
    id: org.id,
    name: org.name,
    slug: org.slug,
    plan: org.plan || "free",
    billingProvider: org.billingProvider,
    subscriptionId: org.subscriptionId,
    customerId: org.customerId,
    subscriptionStatus: org.subscriptionStatus,
    subscriptionEndsAt: org.subscriptionEndsAt,
    billingEmail: (org as any).billingEmail || null,
    projectsCount: orgProjects.length,
  };

  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  return <BillingPageClient organization={organizationData} user={userData} />;
}
