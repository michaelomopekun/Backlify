import { TablePageSkeleton } from "@/components/shared/table-page-skeleton";

export default function BackupsLoading() {
  return (
    <TablePageSkeleton
      title="Backups"
      description="View, manage, and trigger database backups for your project."
      actionLabel="Trigger Backup"
      searchPlaceholder="Search backups by name or ID..."
      columns={["Status", "Snapshot ID", "Created", "Size", "Actions"]}
      hasStats={true}
      statCount={4}
      rowCount={6}
    />
  );
}
