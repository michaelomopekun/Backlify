"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IconArrowLeft, IconAdjustments, IconUser } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export function AccountSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const isPreferences = pathname === "/account" || pathname === "/account/preferences";

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard/org");
    }
  };

  return (
    <aside className="hidden md:flex w-60 xl:w-64 border-r border-border/60 bg-[#0c0c0c] flex-col shrink-0 min-h-0 text-xs">
      {/* Back to dashboard */}
      <div className="p-3 border-b border-border/40">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-muted-foreground hover:text-white hover:bg-white/[0.04] transition-colors font-medium text-xs group w-full text-left cursor-pointer"
        >
          <IconArrowLeft className="size-3.5 text-muted-foreground group-hover:text-white transition-colors" />
          <span>Back to dashboard</span>
        </button>
      </div>

      {/* Navigation Group */}
      <div className="p-3 space-y-4">
        <div className="space-y-1">
          <span className="px-2.5 text-[10.5px] font-semibold text-muted-foreground/60 uppercase tracking-wider block">
            Account Settings
          </span>
          <nav className="space-y-0.5 pt-1">
            <Link
              href="/account"
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
                isPreferences
                  ? "bg-[#1c1c1c] text-white border border-[#2c2c2c] shadow-xs"
                  : "text-muted-foreground hover:text-white hover:bg-white/[0.04]"
              )}
            >
              <IconUser className="size-3.5 shrink-0" />
              <span>Preferences</span>
            </Link>
          </nav>
        </div>
      </div>
    </aside>
  );
}
