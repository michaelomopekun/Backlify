import { TablePageSkeleton } from "@/components/shared/table-page-skeleton";

export default function RestoresLoading() {
  return (
    <TablePageSkeleton
      title="Restores"
      description="Point-in-time database restores and disaster recovery drills."
      actionLabel="New Drill"
      searchPlaceholder="Search recovery points..."
      columns={["Status", "Recovery Point", "Timestamp", "Size", "Actions"]}
      hasStats={true}
      statCount={3}
      rowCount={5}
    />
  );
}
