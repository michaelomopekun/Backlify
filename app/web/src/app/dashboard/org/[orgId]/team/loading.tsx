import { OrgTeamSkeleton } from "@/components/org/team/org-team-skeleton";

export default function OrgTeamLoading() {
  return (
    <main className="flex-1 px-8 lg:px-12 py-8 max-w-[1400px] w-full">
      <OrgTeamSkeleton />
    </main>
  );
}
