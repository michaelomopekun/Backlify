import { cn } from "@/lib/utils";
import { describeCron } from "@/lib/cron";

/**
 * §5.6 — a schedule's cadence in words.
 *
 * `--font-sans` and `--font-mono` are both JetBrains Mono here, so the
 * recognised/raw distinction can't be carried by typeface the way the doc
 * assumes. It's carried by treatment instead: a known cadence reads as prose,
 * an unrecognised expression renders as a code chip with the raw string intact.
 * The reader can always tell which one they're looking at.
 */
export function FrequencyBadge({
  expression,
  className,
}: {
  expression: string | null | undefined;
  className?: string;
}) {
  if (!expression) {
    return <span className={cn("text-muted-foreground", className)}>—</span>;
  }

  const described = describeCron(expression);

  if (!described) {
    return (
      <code
        title={expression}
        className={cn(
          "rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground",
          className
        )}
      >
        {expression}
      </code>
    );
  }

  return (
    <span className={cn("inline-flex items-baseline gap-1 text-sm", className)}>
      <span className="text-foreground">{described.cadence}</span>
      {described.detail && (
        <span className="text-xs text-muted-foreground">{described.detail}</span>
      )}
    </span>
  );
}
