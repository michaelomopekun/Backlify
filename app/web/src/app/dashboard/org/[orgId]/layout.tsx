import Link from "next/link";
import { redirect } from "next/navigation";
import { Boxes } from "lucide-react";
import { IconSelector } from "@tabler/icons-react";
import { OrganizationRepository } from "db";
import { requireCurrentUser } from "@/lib/current-user";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { OrgSidebar } from "@/components/layout/app-sidebar";
import { OrgPickerClientActions } from "@/components/layout/org-picker-client-actions";

interface Props {
  children: React.ReactNode;
  params: Promise<{ orgId: string }>;
}

export default async function OrgWorkspaceRootLayout({
  children,
  params,
}: Props) {
  const { orgId } = await params;
  const user = await requireCurrentUser();

  let org: { id: string; name: string; slug: string } | null = null;
  try {
    org = await OrganizationRepository.getOrganizationById(orgId);
  } catch {}

  if (!org) {
    redirect("/dashboard/org");
  }

  const orgName = org.name;

  return (
    <SidebarProvider className="flex flex-col min-h-screen">
      {/* Topbar — stays permanently mounted during skeleton loading & navigation */}
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

        {/* Sidebar Trigger */}
        <SidebarTrigger className="size-7 text-muted-foreground hover:text-foreground ml-1" />

        {/* Right Topbar actions */}
        <div className="ml-auto">
          <OrgPickerClientActions
            userInitials={user.initials}
            userEmail={user.email}
            userName={user.name}
          />
        </div>
      </header>

      {/* Main workspace layout: persistent sidebar + content */}
      <div className="flex-1 flex w-full min-h-0">
        <OrgSidebar user={user} orgId={orgId} orgName={orgName} />

        <SidebarInset className="bg-[#0c0c0c] flex-1 min-w-0">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
