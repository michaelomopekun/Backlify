import { cn } from "@/lib/utils";
import { getStatusPresentation } from "@/lib/status";

/**
 * The §1.3 status treatment. Colour comes from `lib/status.ts`, never from the
 * call site — pass a status string, get the right dot and word.
 *
 * The label always renders alongside the dot (§7): status is never carried by
 * colour alone. The ping ring only appears while work is genuinely in flight,
 * so a still dot is meaningful information rather than a missing animation.
 */

export function StatusDot({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const { dot, active } = getStatusPresentation(status);

  return (
    <span className={cn("relative flex size-2 shrink-0", className)}>
      {active && (
        <span
          aria-hidden
          className={cn(
            "absolute inline-flex size-full animate-ping rounded-full opacity-75 motion-reduce:animate-none",
            dot
          )}
        />
      )}
      <span className={cn("relative inline-flex size-2 rounded-full", dot)} />
    </span>
  );
}

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const { label, text, tint } = getStatusPresentation(status);

  return (
    <span
      data-status={status}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap",
        tint,
        text,
        className
      )}
    >
      <StatusDot status={status} />
      {label}
    </span>
  );
}
