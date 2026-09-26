import { TablePageSkeleton } from "@/components/shared/table-page-skeleton";

export default function RestoresLoading() {
  return (
    <TablePageSkeleton
      titleWidth="w-32"
      hasStats={true}
      statCount={3}
      rowCount={5}
    />
  );
}
