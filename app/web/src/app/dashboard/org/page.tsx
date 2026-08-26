import Link from "next/link";
import { IconSearch, IconBuilding } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { OrganizationRepository } from "db";
import { getCurrentUser } from "@/lib/current-user";
import { OrgPickerHeader } from "@/components/dashboard/org-picker-header";

export const dynamic = "force-dynamic";

export default async function OrgSelectionPage() {
  const user = await getCurrentUser();

  // Fetch orgs for this user. Falls back to empty array if DB is unavailable.
  let orgs: Array<{ id: string; name: string; slug: string; userId: string; createdAt: Date; updatedAt: Date }> = [];
  try {
    orgs = await OrganizationRepository.getOrganizationsByUser(user.id);
  } catch {
    // DB not yet migrated or unavailable — show fallback org
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <OrgPickerHeader title="Organizations" />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10">
        {/* Heading */}
        <h1 className="text-2xl font-semibold text-foreground mb-6">
          Your organizations
        </h1>

        {/* Search + New org button row */}
        <div className="flex items-center gap-3 mb-4">
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
          {orgs.length === 0 ? (
            /* Fallback org card clickable matching the screenshot */
            <Link
              href="/dashboard/org/default-org"
              className="flex items-center gap-3 px-4 py-3.5 rounded-md border border-border bg-card hover:border-border/80 hover:bg-accent/40 transition-colors"
            >
              <div className="size-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                <IconBuilding className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {user.name}&apos;s Org
                </p>
                <p className="text-xs text-muted-foreground">
                  Free Plan · 0 projects
                </p>
              </div>
            </Link>
          ) : (
            orgs.map((org) => (
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
                    Free Plan · 0 projects
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
