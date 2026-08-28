import Link from "next/link";
import {
  IconSearch,
  IconLayoutGrid,
  IconList,
  IconDotsVertical,
  IconHelp,
  IconBell,
  IconSelector,
  IconArrowsSort,
  IconChevronDown,
  IconPlus,
  IconInfoCircle,
  IconX,
} from "@tabler/icons-react";
import { ProjectRepository, OrganizationRepository } from "db";
import { getCurrentUser } from "@/lib/current-user";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { OrgSidebar } from "@/components/layout/app-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ orgId: string }>;
}

export default async function OrgProjectsPage({ params }: Props) {
  const { orgId } = await params;
  const user = await getCurrentUser();

  let org: { id: string; name: string; slug: string } | null = null;
  try {
    org = await OrganizationRepository.getOrganizationById(orgId);
  } catch {}

  const orgName = org?.name ?? `${user.name}'s Org`;

  let dbProjects: Array<{ id: string; name: string; databaseUrl: string; createdAt: Date }> = [];
  try {
    dbProjects = await ProjectRepository.getAllProjects();
  } catch {}

  // Projects list with Backlify PostgreSQL data
  const displayProjects = dbProjects.length > 0 ? dbProjects : [
    {
      id: "proj-1",
      name: "roadRescue's Project",
      dbEngine: "Postgres 16",
      region: "eu-central-1",
      tier: "FREE · ACTIVE",
      isPaused: false,
    },
  ];

  return (
    <SidebarProvider>
      <OrgSidebar user={user} orgId={orgId} orgName={orgName} />

      <SidebarInset className="bg-[#0c0c0c]">
        {/* Topbar */}
        <header className="flex h-12 items-center gap-2.5 px-4 border-b border-border/80 shrink-0 bg-[#0e0e0e] text-xs">
          <SidebarTrigger className="-ml-1 size-7 text-muted-foreground hover:text-foreground" />

          {/* Org Selector */}
          <Link
            href={`/dashboard/org/${orgId}`}
            className="flex items-center gap-1.5 text-foreground hover:text-foreground/80 transition-colors font-medium"
          >
            <span>{orgName}</span>
            <span className="text-[10px] px-1 py-0.2 rounded border border-border bg-muted/40 text-muted-foreground font-mono uppercase">
              FREE
            </span>
            <IconSelector className="size-3 text-muted-foreground" />
          </Link>

          {/* Right Topbar actions */}
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground text-xs h-7 hidden lg:flex"
            >
              Feedback
            </Button>

            <button
              type="button"
              className="hidden md:flex items-center gap-2 h-7 px-2.5 rounded-md border border-border/80 bg-muted/30 text-xs text-muted-foreground hover:bg-muted/60 transition-colors"
            >
              <IconSearch className="size-3" />
              <span>Search...</span>
              <kbd className="ml-1 text-[9px] border border-border/80 rounded px-1">Ctrl K</kbd>
            </button>

            <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-foreground">
              <IconHelp className="size-3.5" />
            </Button>

            <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-foreground">
              <IconBell className="size-3.5" />
            </Button>

            <Avatar className="size-6 cursor-pointer">
              <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
                {user.initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-8 lg:px-12 py-8 max-w-[1600px] w-full">
          <h1 className="text-[26px] font-normal tracking-tight text-white mb-8">Projects</h1>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left / Main Projects Section */}
            <div className="flex-1 min-w-0 w-full space-y-4">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search */}
                <div className="relative">
                  <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[#555555]" />
                  <input
                    type="text"
                    placeholder="Search for a project"
                    className="h-8 pl-8 pr-3 w-56 bg-[#111111] border border-[#222222] rounded-md text-[12px] text-white placeholder-[#555555] focus:outline-none focus:border-[#3a3a3a] transition-colors"
                  />
                </div>

                {/* Status dropdown filter */}
                <button
                  type="button"
                  className="flex items-center gap-1.5 h-8 px-2.5 text-[12px] text-[#888888] bg-[#111111] border border-[#222222] rounded-md hover:text-white hover:border-[#333333] transition-colors font-mono"
                >
                  <span>Status</span>
                  <IconChevronDown className="size-3 text-[#666666]" />
                </button>

                {/* Sorted by dropdown */}
                <button
                  type="button"
                  className="flex items-center gap-1.5 h-8 px-2.5 text-[12px] text-[#888888] bg-[#111111] border border-[#222222] rounded-md hover:text-white hover:border-[#333333] transition-colors font-mono"
                >
                  <IconArrowsSort className="size-3.5 text-[#666666]" />
                  <span>Sorted by name</span>
                </button>

                {/* View toggle segmented control & New project button */}
                <div className="ml-auto flex items-center gap-2.5">
                  <div className="flex items-center border border-[#222222] bg-[#111111] rounded-md overflow-hidden p-0.5">
                    <button className="p-1 rounded bg-[#222222] text-white shadow-xs">
                      <IconLayoutGrid className="size-3.5" />
                    </button>
                    <button className="p-1 rounded text-[#666666] hover:text-white transition-colors">
                      <IconList className="size-3.5" />
                    </button>
                  </div>

                  <Link
                    href={`/dashboard/org/new`}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-[12px] transition-colors shadow-xs"
                  >
                    <IconPlus className="size-3.5 stroke-[2.5]" />
                    <span>New project</span>
                  </Link>
                </div>
              </div>

              {/* Projects Grid (3-column layout) */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pt-1">
                {displayProjects.map((p) => {
                  const projectId = "id" in p ? p.id : "proj-1";
                  const name = "name" in p ? p.name : "Project";
                  const dbEngine = "dbEngine" in p ? p.dbEngine : "Postgres 16";
                  const region = "region" in p ? p.region : "eu-central-1";
                  const tier = "tier" in p ? p.tier : "FREE · ACTIVE";
                  const isPaused = "isPaused" in p ? p.isPaused : false;

                  return (
                    <Link
                      key={projectId}
                      href={`/dashboard/project/${projectId}`}
                      className="group relative flex flex-col justify-between p-5 rounded-lg border border-[#1e1e1e] bg-[#111111] hover:border-[#2f2f2f] hover:bg-[#141414] transition-all min-h-[160px]"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h2 className="text-[14px] font-medium text-white group-hover:text-white transition-colors truncate">
                            {name}
                          </h2>
                          <span className="p-1 -mr-1 rounded text-[#555555] group-hover:text-[#888888] hover:text-white transition-colors">
                            <IconDotsVertical className="size-3.5" />
                          </span>
                        </div>

                        <p className="text-[12px] text-[#666666] font-mono">
                          {dbEngine} <span className="text-[#3a3a3a]">·</span> {region}
                        </p>
                      </div>

                      <div className="mt-6 flex items-center justify-between">
                        {isPaused ? (
                          <div className="flex items-center gap-1.5 text-[11px] text-[#777777]">
                            <span className="size-1.5 rounded-full bg-amber-400/80" />
                            <span>Project is paused</span>
                            <IconInfoCircle className="size-3 text-[#555555]" />
                          </div>
                        ) : (
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border border-[#242424] bg-[#161616] text-[#888888] tracking-wider">
                            {tier}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right Aside: Backlify "Free plan usage" Card */}
            <aside className="w-full lg:w-72 xl:w-80 shrink-0 space-y-6">
              <div className="rounded-lg border border-[#1e1e1e] bg-[#111111] p-5 space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-[13px] font-medium text-white">Free plan usage</h3>
                    <p className="text-[11px] text-[#666666] mt-0.5">Current billing cycle</p>
                  </div>
                  <Link
                    href={`/dashboard/org/${orgId}`}
                    className="flex items-center h-7 px-2.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-[11px] transition-colors"
                  >
                    Upgrade
                  </Link>
                </div>

                <div className="space-y-3 pt-1">
                  {[
                    { label: "PROJECTS", value: `${Math.max(displayProjects.length, 1)}`, limit: "2" },
                    { label: "TOTAL BACKUPS", value: "18", limit: "50" },
                    { label: "STORAGE USED", value: "1.2 GB", limit: "5 GB" },
                    { label: "ACTIVE SCHEDULES", value: "1", limit: "3" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-[11px] font-mono">
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-emerald-400 shrink-0" />
                        <span className="text-[#888888] tracking-wider">{item.label}</span>
                      </div>
                      <span className="text-white">
                        {item.value} <span className="text-[#555555]">/ {item.limit}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Backlify DR & Backup Notice Card */}
              <div className="rounded-lg border border-[#1e1e1e] bg-[#111111] p-4 space-y-2.5 relative">
                <button
                  type="button"
                  className="absolute top-3.5 right-3.5 text-[#555555] hover:text-white transition-colors"
                >
                  <IconX className="size-3.5" />
                </button>

                <span className="inline-block text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border border-[#2a2a2a] bg-[#181818] text-[#888888] font-semibold tracking-wider">
                  NOTICE
                </span>

                <h4 className="text-[12.5px] font-medium text-white leading-snug pr-4">
                  Automated DR Drill Engine
                </h4>

                <p className="text-[11.5px] text-[#666666] leading-relaxed">
                  Scheduled point-in-time disaster recovery testing is now enabled for all PostgreSQL clusters.
                </p>

                <div className="pt-1">
                  <button
                    type="button"
                    className="h-7 px-3 text-[11px] border border-[#2a2a2a] bg-[#161616] hover:bg-[#202020] text-white rounded-md transition-colors font-medium"
                  >
                    Learn more
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
