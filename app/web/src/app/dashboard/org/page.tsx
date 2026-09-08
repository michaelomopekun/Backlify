import Link from "next/link";
import { IconSearch, IconBuilding, IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { OrganizationRepository, ProjectRepository } from "db";
import { getCurrentUser } from "@/lib/current-user";
import { OrgPickerHeader } from "@/components/layout/org-picker-header";
import { EmptyState } from "@/components/shared/empty-state";

export const dynamic = "force-dynamic";

export default async function OrgSelectionPage() {
  const user = await getCurrentUser();

  // Fetch orgs for this user.
  let orgs: Array<{ id: string; name: string; slug: string; userId: string; createdAt: Date; updatedAt: Date }> = [];
  try {
    orgs = await OrganizationRepository.getOrganizationsByUser(user.id);
  } catch {
    // DB not yet migrated or unavailable
  }

  let allProjects: Array<{ id: string; orgId: string }> = [];
  try {
    allProjects = await ProjectRepository.getAllProjects();
  } catch {}

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <OrgPickerHeader title="Organizations" />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
        {/* Heading */}
        <h1 className="text-2xl font-semibold text-foreground mb-6">
          Your organizations
        </h1>

        {orgs.length === 0 ? (
          <EmptyState
            icon={IconPlus}
            title="Create an organization"
            description="Manage your team and projects in one place."
            action={
              <Button asChild className="h-9 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-xs sm:text-sm font-medium transition-colors shadow-xs">
                <Link href="/dashboard/org/new" className="inline-flex items-center gap-1.5">
                  <IconPlus className="size-3.5 stroke-[2.5]" />
                  <span>New organization</span>
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {/* Search + New org button row */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative w-72">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search for an organization"
                  className="w-full h-9 pl-9 pr-3 rounded-md border border-border bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              {/* New org CTA */}
              <Button asChild className="ml-auto h-9 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium">
                <Link href="/dashboard/org/new">
                  + New organization
                </Link>
              </Button>
            </div>

            {/* Org list */}
            <div className="flex flex-col gap-2">
              {orgs.map((org) => {
                const projectCount = allProjects.filter((p) => p.orgId === org.id).length;
                return (
                  <Link
                    key={org.id}
                    href={`/dashboard/org/${org.id}`}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-md border border-border bg-card hover:border-border/80 hover:bg-accent/40 transition-colors"
                  >
                    <div className="size-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <IconBuilding className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{org.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Free Plan · {projectCount} {projectCount === 1 ? "project" : "projects"}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
