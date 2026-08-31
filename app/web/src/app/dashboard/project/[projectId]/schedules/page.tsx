import { SchedulesPageClient } from "@/components/projects/schedules/schedules-page-client";
import { ProjectRepository, ScheduleRepository } from "db";

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

  let project: { id: string; orgId?: string | null } | null = null;
  let rawSchedules: any[] = [];

  try {
    project = await ProjectRepository.getProjectById(projectId);
    rawSchedules = await ScheduleRepository.getSchedulesByProjectId(projectId);
  } catch (err) {
    console.error("Failed to fetch schedules:", err);
  }

  const orgId = project?.orgId ?? "default-org";

  const initialSchedules = rawSchedules.map((s) => {
    let name = "Custom Backup Schedule";
    let frequency = "Custom";
    if (s.cronExpression === "0 * * * *") {
      name = "Hourly WAL Archive";
      frequency = "Every hour";
    } else if (s.cronExpression === "0 2 * * *") {
      name = "Daily Production Snapshot";
      frequency = "Daily at 02:00";
    } else if (s.cronExpression === "0 2 * * 0") {
      name = "Weekly Full Database Rollup";
      frequency = "Every Sunday at 02:00";
    }

    return {
      id: s.id,
      name,
      cron: s.cronExpression,
      frequency,
      timezone: s.timezone || "UTC",
      retentionDays: 14,
      targetDb: "Primary Database",
      status: (s.isActive ? "active" : "paused") as "active" | "paused" | "failing",
      lastRun: s.lastRunAt ? new Date(s.lastRunAt).toLocaleTimeString() : undefined,
      lastRunStatus: "success" as const,
      nextRun: "Calculating…",
      nextRunRel: "soon",
      compression: "Zstandard (Level 3)",
      encryption: "AES-256 (KMS)",
      destination: "S3 / us-east-1",
    };
  });

  return (
    <SchedulesPageClient
      orgId={orgId}
      projectId={projectId}
      initialSchedules={initialSchedules.length > 0 ? initialSchedules : undefined}
    />
  );
}

