import { redirect } from "next/navigation";
import { ProjectRepository, OrganizationRepository, UserRepository } from "db";
import { requireCurrentUser } from "@/lib/current-user";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ProjectSidebar } from "@/components/layout/app-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  IconSearch,
  IconHelp,
  IconBell,
  IconPlugConnected,
  IconSelector,
} from "@tabler/icons-react";

import { ProjectHeader } from "@/components/layout/project-header";

interface Props {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}

export default async function ProjectLayout({ children, params }: Props) {
  const { projectId } = await params;
  const user = await requireCurrentUser();

  let project: { id: string; name: string; databaseUrl: string; orgId?: string | null } | null = null;
  let org: { id: string; name: string; slug: string } | null = null;

  try {
    project = await ProjectRepository.getProjectById(projectId);
  } catch (err) {
    console.error("Failed to load project:", err);
  }

  // If the project doesn't exist in the database, redirect immediately.
  // Never render a project dashboard shell for non-existent projects.
  if (!project) {
    redirect("/dashboard/org");
  }

  const orgId = project.orgId ?? "default-org";

  try {
    org = await OrganizationRepository.getOrganizationById(orgId);
  } catch {}

  const orgName = org?.name ?? "Organization";
  const projectName = project.name;

  // Fetch user organizations for switcher
  let userOrgs: Array<{ id: string; name: string }> = [];
  try {
    const orgs = await UserRepository.getUserOrganizations(user.id);
    if (orgs && orgs.length > 0) {
      userOrgs = orgs.map((o) => ({ id: o.id, name: o.name }));
    } else {
      const owned = await OrganizationRepository.getOrganizationsByUser(user.id);
      userOrgs = owned.map((o) => ({ id: o.id, name: o.name }));
    }
  } catch (err) {
    console.error("Failed to load user orgs for header:", err);
  }

  if (org && !userOrgs.some((o) => o.id === org.id)) {
    userOrgs.unshift({ id: org.id, name: org.name });
  } else if (!org && userOrgs.length === 0) {
    userOrgs.push({ id: orgId, name: orgName });
  }

  // Fetch all visible projects for switcher
  let allProjectsList: Array<{ id: string; name: string; orgId?: string | null }> = [];
  try {
    const all = await ProjectRepository.getAllProjects();
    const userOrgIds = new Set(userOrgs.map((o) => o.id));
    if (orgId) userOrgIds.add(orgId);

    const visible = userOrgIds.size > 0
      ? all.filter((p) => (p.orgId && userOrgIds.has(p.orgId)) || p.id === projectId)
      : all;

    allProjectsList = visible.map((p) => ({
      id: p.id,
      name: p.name,
      orgId: p.orgId,
    }));
  } catch (err) {
    console.error("Failed to load projects for switcher:", err);
  }

  if (!allProjectsList.some((p) => p.id === project.id)) {
    allProjectsList.unshift({
      id: project.id,
      name: project.name,
      orgId: project.orgId,
    });
  }

  return (
    <SidebarProvider className="h-screen w-screen overflow-hidden flex flex-col bg-[#0c0c0c]">
      {/* Responsive Project Topbar — full width across top (Supabase style) */}
      <ProjectHeader
        orgId={orgId}
        orgName={orgName}
        projectId={projectId}
        projectName={projectName}
        userInitials={user.initials}
        projects={allProjectsList}
        organizations={userOrgs}
      />

      <div className="flex-1 flex w-full min-h-0 overflow-hidden">
        <ProjectSidebar
          user={user}
          orgId={orgId}
          orgName={orgName}
          projectId={projectId}
          projectName={projectName}
        />

        {/* Main Content Area — independent smooth scroll */}
        <SidebarInset className="bg-[#0c0c0c] flex-1 min-w-0 h-full overflow-y-auto">
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-10 xl:px-12 pt-6 sm:pt-8 pb-16">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
