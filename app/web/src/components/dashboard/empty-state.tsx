import type { Icon } from "@tabler/icons-react";

import { cn } from "@/lib/utils";

/**
 * The empty state. An empty screen is an invitation to act, so `action` is
 * strongly encouraged — a dead end that only says "nothing here" wastes the
 * one moment the reader is asking what to do next.
 */
export function EmptyState({
  icon: IconComponent,
  title,
  description,
  action,
  className,
}: {
  icon: Icon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-14 text-center",
        className
      )}
    >
      <span className="mb-4 flex size-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
        <IconComponent className="size-5" aria-hidden />
      </span>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
