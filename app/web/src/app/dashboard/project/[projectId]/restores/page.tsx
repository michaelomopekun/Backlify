export const metadata = {
  title: "Restores | Backlify",
  description: "Point-in-time database restores and disaster recovery drills.",
};

export default async function RestoresPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-normal tracking-tight text-white">Restores</h1>
          <p className="text-[13px] text-[#555555] mt-1 font-mono">
            Restore history and recovery drills for project {projectId}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-[#1a1a1a] bg-[#0f0f0f] p-8 text-center text-sm text-[#666666]">
        Restores & Disaster Recovery drill UI is ready to be built next.
      </div>
    </div>
  );
}
