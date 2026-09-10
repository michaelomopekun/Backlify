import Link from "next/link";
import { redirect } from "next/navigation";
import { Boxes } from "lucide-react";
import { IconSelector } from "@tabler/icons-react";
import { OrganizationRepository, ProjectRepository, BackupRepository } from "db";
import { getCurrentUser } from "@/lib/current-user";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { OrgSidebar } from "@/components/layout/app-sidebar";
import { OrgPickerClientActions } from "@/components/layout/org-picker-client-actions";
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
  const user = await getCurrentUser();

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
    <SidebarProvider className="flex flex-col min-h-screen">
      {/* Topbar — full width across top (Supabase style) */}
      <header className="flex h-12 items-center gap-2.5 px-3.5 sm:px-4 border-b border-border/80 shrink-0 bg-[#0e0e0e] text-xs z-30 sticky top-0 w-full">
        {/* Brand Logo */}
        <Link
          href="/dashboard/org"
          className="flex items-center shrink-0 pr-1 hover:opacity-85 transition-opacity"
        >
          <img
            src="/backlify-logo.svg"
            alt="Backlify"
            width={28}
            height={28}
            className="size-7 object-contain shrink-0"
          />
        </Link>

        <span className="text-muted-foreground/40 font-light text-sm">/</span>

        {/* Org Selector */}
        <Link
          href={`/dashboard/org/${orgId}`}
          className="flex items-center gap-1.5 text-foreground hover:text-foreground/80 transition-colors font-medium text-sm"
        >
          <Boxes className="size-3.5 text-muted-foreground shrink-0" />
          <span>{orgName}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded border border-border/80 bg-muted/40 text-muted-foreground font-mono uppercase tracking-wider">
            FREE
          </span>
          <IconSelector className="size-3 text-muted-foreground shrink-0" />
        </Link>

        <span className="text-muted-foreground/40 font-light text-sm">/</span>
        <span className="text-muted-foreground text-sm font-medium">Settings</span>

        {/* Sidebar Trigger */}
        <SidebarTrigger className="size-7 text-muted-foreground hover:text-foreground ml-1" />

        {/* Right Topbar actions */}
        <div className="ml-auto">
          <OrgPickerClientActions userInitials={user.initials} />
        </div>
      </header>

      <div className="flex-1 flex w-full min-h-0">
        <OrgSidebar user={user} orgId={orgId} orgName={orgName} />

        <SidebarInset className="bg-[#0c0c0c] flex-1 min-w-0">
          <main className="flex-1 px-8 lg:px-12 py-8 max-w-[1400px] w-full">
            <OrgSettingsClient
              organization={{
                id: org.id,
                name: org.name,
                slug: org.slug,
                userId: org.userId,
                createdAt: org.createdAt,
                projectsCount,
                totalStorageBytes,
              }}
              initialMembers={members}
            />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
