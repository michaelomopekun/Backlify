import Link from "next/link";
import { IconBell, IconHelp, IconSearch } from "@tabler/icons-react";
import { getCurrentUser } from "@/lib/current-user";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface OrgPickerHeaderProps {
  title?: string;
  showBack?: boolean;
}

export async function OrgPickerHeader({ title = "Organizations" }: OrgPickerHeaderProps) {
  const user = await getCurrentUser();

  return (
    <header className="h-12 flex items-center gap-4 px-4 border-b border-border shrink-0 bg-background">
      {/* Logo + page title */}
      <Link href="/dashboard/org" className="flex items-center gap-2.5">
        <img
          src="/backlify-logo.svg"
          alt="Backlify"
          className="size-6 object-contain"
        />
        <span className="text-sm font-semibold text-foreground">
          {title}
        </span>
      </Link>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground text-xs h-8"
        >
          Feedback
        </Button>

        {/* Search chip */}
        <button
          type="button"
          className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-md border border-border bg-muted/40 text-xs text-muted-foreground hover:border-border/80 hover:bg-muted transition-colors"
        >
          <IconSearch className="size-3.5" />
          <span>Search...</span>
          <kbd className="ml-1 text-[10px] text-muted-foreground/70 border border-border rounded px-1">
            ⌘K
          </kbd>
        </button>

        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-foreground"
        >
          <IconHelp className="size-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-foreground"
        >
          <IconBell className="size-4" />
        </Button>

        <Avatar className="size-7 cursor-pointer">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
            {user.initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
