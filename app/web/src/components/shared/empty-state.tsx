import React from "react";
import type { Icon } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: Icon | React.ComponentType<{ className?: string }> | React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * EmptyState: Encapsulates the Supabase + Backlify empty state design.
 * Features a dashed card container, a square icon badge, clean typography,
 * and prominent action CTA.
 */
export function EmptyState({
  icon: IconComponent,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const renderIcon = () => {
    if (!IconComponent) return null;
    if (React.isValidElement(IconComponent)) {
      return IconComponent;
    }
    const Comp = IconComponent as React.ComponentType<{ className?: string }>;
    return <Comp className="size-4 text-foreground/80 stroke-[2]" aria-hidden />;
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-card/20 py-16 sm:py-20 px-6 text-center shadow-xs transition-colors",
        className
      )}
    >
      {IconComponent && (
        <div className="size-9 rounded-md border border-border/80 bg-muted/30 flex items-center justify-center mb-3.5 text-muted-foreground shadow-xs">
          {renderIcon()}
        </div>
      )}
      <h3 className="text-base font-medium text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-xs sm:text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

