import { IconCalendarClock } from "@tabler/icons-react";

import { Panel } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { FrequencyBadge } from "@/components/shared/frequency-badge";
import { ScheduleForm } from "@/components/projects/schedules/schedule-form";
import { ScheduleRowActions } from "@/components/projects/schedules/schedule-row-actions";
import { formatRelativeTime } from "@/lib/format";
import { getSchedulesForProject } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ProjectSchedulesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const schedules = await getSchedulesForProject(id);

  return (
    <div className="space-y-4">
      {schedules.length === 0 ? (
        <>
          <EmptyState
            icon={IconCalendarClock}
            title="No schedule yet"
            description="Backups for this project only run when you start them. Add a schedule and the runner takes over."
          />
          <ScheduleForm projectId={id} />
        </>
      ) : (
        <>
          <div className="flex items-center justify-end">
            <ScheduleForm projectId={id} />
          </div>

          <Panel bodyClassName="p-0">
            <ul className="divide-y divide-border">
              {schedules.map((schedule) => (
                <li
                  key={schedule.id}
                  className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <FrequencyBadge expression={schedule.cronExpression} />
                      {!schedule.isActive && (
                        <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                          Paused
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {schedule.timezone}
                      {schedule.lastRunAt
                        ? ` · last ran ${formatRelativeTime(schedule.lastRunAt)}`
                        : " · hasn't run yet"}
                    </p>
                  </div>

                  <ScheduleRowActions
                    scheduleId={schedule.id}
                    projectId={id}
                    isActive={schedule.isActive}
                  />
                </li>
              ))}
            </ul>
          </Panel>
        </>
      )}
    </div>
  );
}
