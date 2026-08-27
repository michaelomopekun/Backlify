import { cn } from "@/lib/utils";

/**
 * The page header (Figma: 1171×80 at the top of the content column).
 * Matches the Figma design with the "Suggest a feature" button and avatar ring.
 */
export function Topbar({
  title,
  description,
  actions,
  userInitials = "GA",
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  userInitials?: string;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex min-h-[76px] flex-wrap items-center justify-between gap-4 px-6 py-3.5",
        className
      )}
      style={{
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        borderRadius: "17px",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)",
      }}
    >
      <div className="min-w-0">
        <h1 className="truncate font-['JetBrains_Mono',monospace] text-lg font-medium tracking-tight text-white">
          {title}
        </h1>
        {description && (
          <p className="mt-0.5 truncate font-['JetBrains_Mono',monospace] text-xs text-[#64748B]">
            {description}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {actions}
        
        {/* Suggest a feature button */}
        <a
          href="https://github.com/michaelomopekun/Backlify/issues"
          target="_blank"
          rel="noreferrer"
          className="flex h-10 items-center gap-2 rounded-[7px] border border-white/30 bg-[rgba(100,116,139,0.5)] px-3.5 text-[10px] font-medium font-['JetBrains_Mono',monospace] text-white shadow-sm transition-all hover:bg-[rgba(100,116,139,0.7)] hover:border-white/50"
        >
          <span className="size-1.5 rounded-full border border-white bg-[#FFB31F]" />
          Suggest a feature
        </a>

        {/* User avatar ring */}
        <div className="flex size-[46px] shrink-0 items-center justify-center rounded-full border border-[#64748B] p-0.5">
          <div className="flex size-full items-center justify-center rounded-full bg-[#FFB31F] text-xs font-bold text-[#080B14] shadow-inner">
            {userInitials}
          </div>
        </div>
      </div>
    </header>
  );
}
