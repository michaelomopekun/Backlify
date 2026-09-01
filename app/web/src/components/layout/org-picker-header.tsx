import Link from "next/link";
import { getCurrentUser } from "@/lib/current-user";
import { OrgPickerClientActions } from "./org-picker-client-actions";

interface OrgPickerHeaderProps {
  title?: string;
  showBack?: boolean;
}

export async function OrgPickerHeader({ title = "Organizations" }: OrgPickerHeaderProps) {
  const user = await getCurrentUser();

  return (
    <header className="h-12 flex items-center justify-between px-4 border-b border-border shrink-0 bg-background text-xs">
      {/* Left: Logo (+ breadcrumb title on desktop) */}
      <div className="flex items-center gap-2">
        <Link href="/dashboard/org" className="flex items-center">
          <img
            src="/backlify-logo.svg"
            alt="Backlify"
            className="size-5 object-contain"
          />
        </Link>

        {title && (
          <div className="hidden sm:flex items-center gap-2 font-mono">
            <span className="text-muted-foreground/40 text-sm">/</span>
            <span className="text-xs text-foreground font-medium">{title}</span>
          </div>
        )}
      </div>

      {/* Right: Client actions + User profile avatar */}
      <OrgPickerClientActions userInitials={user.initials} />
    </header>
  );
}
