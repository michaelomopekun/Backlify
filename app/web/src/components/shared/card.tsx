import { cn } from "@/lib/utils";

/**
 * The dashboard's panel shell (Figma: rounded-[16px], glass slate bg, crisp border).
 */
export function Panel({
  title,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={cn(
        "flex flex-col relative transition-all duration-200",
        className
      )}
      style={{
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        borderRadius: "16px",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        boxSizing: "border-box",
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)",
      }}
    >
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 px-6 pt-5 pb-2">
          {title && (
            <h2 className="font-['JetBrains_Mono',monospace] text-lg font-bold tracking-tight text-white">
              {title}
            </h2>
          )}
          {action}
        </div>
      )}
      <div className={cn("flex-1 p-6 pt-3", bodyClassName)}>{children}</div>
    </section>
  );
}
