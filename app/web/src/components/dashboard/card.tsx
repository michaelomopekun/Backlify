import { cn } from "@/lib/utils";

/**
 * The dashboard's panel shell (SVG cards use rx 15–16 -> rounded-xl).
 *
 * A local primitive rather than shadcn's `card`: every panel in this design has
 * the same title/action header, and the shadcn composition would mean repeating
 * CardHeader/CardTitle/CardAction at eleven call sites to reach the identical
 * result. Swapping the internals for shadcn's later is a one-file change.
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
        "flex flex-col",
        className
      )}
      style={{ background: 'rgba(15, 23, 42, 0.65)', borderRadius: '16px', boxSizing: 'border-box', padding: 0 }}
    >
      {(title || action) && (
        <div className="flex items-center justify-between gap-3" style={{borderBottom: '1px solid var(--color-border)', padding: '20px'}}>
          {title && (
            <h2 className="text-sm font-medium text-foreground">{title}</h2>
          )}
          {action}
        </div>
      )}
      <div className={cn("flex-1 p-5", bodyClassName)}>{children}</div>
    </section>
  );
}
