import { notFound } from "next/navigation";
import { OrganizationRepository } from "db";
import { getCurrentUser } from "@/lib/current-user";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { OrgSidebar } from "@/components/dashboard/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { IconSearch, IconHelp, IconBell } from "@tabler/icons-react";

interface Props {
  children: React.ReactNode;
  params: Promise<{ orgId: string }>;
}

export default async function OrgIdLayout({ children, params }: Props) {
  const { orgId } = await params;
  const user = await getCurrentUser();

  // Try to load the org; fall back to a placeholder when DB is unavailable
  let org: { id: string; name: string; slug: string } | null = null;
  try {
    org = await OrganizationRepository.getOrganizationById(orgId);
  } catch {
    // DB unavailable — use placeholder so the shell still renders
  }

  const orgName = org?.name ?? `${user.name}'s Org`;

  return (
    <SidebarProvider>
      <OrgSidebar user={user} orgId={orgId} orgName={orgName} />

      <SidebarInset>
        {/* Topbar */}
        <header className="flex h-12 items-center gap-2 px-4 border-b border-border shrink-0">
          <SidebarTrigger className="-ml-1 size-7 text-muted-foreground hover:text-foreground" />
          <Separator orientation="vertical" className="h-4 mx-1" />

          {/* Breadcrumb */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/dashboard/org"
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  Backlify
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm font-medium text-foreground">
                  {orgName}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground text-xs h-8 hidden md:flex"
            >
              Feedback
            </Button>
            <button
              type="button"
              className="hidden md:flex items-center gap-2 h-8 px-3 rounded-md border border-border bg-muted/40 text-xs text-muted-foreground hover:bg-muted transition-colors"
            >
              <IconSearch className="size-3.5" />
              <span>Search...</span>
              <kbd className="ml-1 text-[10px] border border-border rounded px-1">⌘K</kbd>
            </button>
            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground">
              <IconHelp className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground">
              <IconBell className="size-4" />
            </Button>
            <Avatar className="size-7 cursor-pointer">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                {user.initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
