import { TablePageSkeleton } from "@/components/shared/table-page-skeleton";

export default function BackupsLoading() {
  return (
    <TablePageSkeleton
      titleWidth="w-36"
      hasStats={true}
      statCount={4}
      rowCount={6}
    />
  );
}
