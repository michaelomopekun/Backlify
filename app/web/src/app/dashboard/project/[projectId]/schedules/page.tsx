export const metadata = {
  title: "Schedules | Backlify",
  description: "Configure automated backup schedules and cron frequencies.",
};

export default async function SchedulesPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-normal tracking-tight text-white">Schedules</h1>
          <p className="text-[13px] text-[#555555] mt-1 font-mono">
            Automated snapshot schedules for project {projectId}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-[#1a1a1a] bg-[#0f0f0f] p-8 text-center text-sm text-[#666666]">
        Schedule management UI is ready to be built next.
      </div>
    </div>
  );
}
