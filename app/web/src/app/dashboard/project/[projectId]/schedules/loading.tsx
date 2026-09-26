import { TablePageSkeleton } from "@/components/shared/table-page-skeleton";

export default function SchedulesLoading() {
  return (
    <TablePageSkeleton
      title="Schedules"
      description="Configure automated backup schedules and cron frequencies."
      actionLabel="New Schedule"
      searchPlaceholder="Search schedules..."
      columns={["Status", "Schedule Name", "Frequency", "Next Run", "Actions"]}
      hasStats={true}
      statCount={3}
      rowCount={4}
    />
  );
}
