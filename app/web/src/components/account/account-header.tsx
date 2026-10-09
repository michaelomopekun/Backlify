import Link from "next/link";
import { IconChevronLeft } from "@tabler/icons-react";
import { OrgPickerClientActions } from "@/components/layout/org-picker-client-actions";

interface AccountHeaderProps {
  userInitials: string;
  userEmail: string;
  userName: string;
}

export function AccountHeader({
  userInitials,
  userEmail,
  userName,
}: AccountHeaderProps) {
  return (
    <header className="h-12 flex items-center justify-between px-3 sm:px-4 border-b border-border/80 shrink-0 bg-[#0e0e0e] text-xs w-full">
      {/* Left: Brand Logo / Account Breadcrumb */}
      <div className="flex items-center gap-2.5">
        <Link
          href="/dashboard/org"
          className="flex items-center justify-center size-7 rounded-lg border border-[#262626] bg-[#141414] hover:bg-[#1e1e1e] hover:border-[#383838] text-neutral-300 hover:text-white transition-all md:hidden shrink-0 shadow-xs"
          title="Back to dashboard"
          aria-label="Back to dashboard"
        >
          <IconChevronLeft className="size-3.5 stroke-[2.2]" />
        </Link>

        <Link href="/dashboard/org" className="flex items-center hover:opacity-85 transition-opacity">
          <img
            src="/backlify-logo.svg"
            alt="Backlify"
            className="size-7 object-contain"
          />
        </Link>

        <span className="text-[#444444] text-[13px] font-light select-none">/</span>
        <span className="text-xs text-foreground font-medium">Account</span>
      </div>

      {/* Right: Actions + User Profile Menu */}
      <OrgPickerClientActions
        userInitials={userInitials}
        userEmail={userEmail}
        userName={userName}
      />
    </header>
  );
}
