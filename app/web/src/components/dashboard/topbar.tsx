import { cn } from "@/lib/utils";

/**
 * The page header (SVG: 1171×80 at the top of the content column).
 *
 * Title and actions only — no search field. The design shows one, but there is
 * nothing to search yet; shipping a dead input would be a promise the app can't
 * keep. It lands when there's an endpoint behind it.
 */
export function Topbar({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex min-h-20 flex-wrap items-center justify-between gap-4 px-6 py-4 lg:px-8",
        className
      )}
      style={{ background: 'rgba(15, 23, 42, 0.65)', borderRadius: '17px', border: '1px solid var(--color-border)', padding: '24px', gap: '12px' }}
    >
      <div className="min-w-0">
        <h1 className="truncate text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}
