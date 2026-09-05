import Link from "next/link";
import { ProjectRepository, OrganizationRepository } from "db";
import { getCurrentUser } from "@/lib/current-user";
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
  const user = await getCurrentUser();

  let project: { id: string; name: string; databaseUrl: string; orgId?: string | null } | null = null;
  let org: { id: string; name: string; slug: string } | null = null;

  try {
    project = await ProjectRepository.getProjectById(projectId);
  } catch {}

  const orgId = project?.orgId ?? "default-org";

  try {
    org = await OrganizationRepository.getOrganizationById(orgId);
  } catch {}

  const orgName = org?.name ?? `${user.name}'s Org`;
  const projectName = project?.name ?? "roadRescue's Project";

  return (
    <SidebarProvider className="h-screen w-screen overflow-hidden flex flex-col bg-[#0c0c0c]">
      {/* Responsive Project Topbar — full width across top (Supabase style) */}
      <ProjectHeader
        orgId={orgId}
        orgName={orgName}
        projectId={projectId}
        projectName={projectName}
        userInitials={user.initials}
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
