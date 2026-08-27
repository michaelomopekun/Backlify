export const metadata = {
  title: "Project Settings | Backlify",
  description: "Configure project settings, storage targets, and retention policies.",
};

export default async function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-normal tracking-tight text-white">Project Settings</h1>
          <p className="text-[13px] text-[#555555] mt-1 font-mono">
            General configuration and database settings for {projectId}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-[#1a1a1a] bg-[#0f0f0f] p-8 text-center text-sm text-[#666666]">
        Project settings and retention policy management UI is ready to be built next.
      </div>
    </div>
  );
}
