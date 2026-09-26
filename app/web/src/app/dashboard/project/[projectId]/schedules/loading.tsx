import { TablePageSkeleton } from "@/components/shared/table-page-skeleton";

export default function SchedulesLoading() {
  return (
    <TablePageSkeleton
      titleWidth="w-40"
      hasStats={true}
      statCount={3}
      rowCount={4}
    />
  );
}
