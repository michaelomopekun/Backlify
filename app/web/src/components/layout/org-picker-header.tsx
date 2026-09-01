import Link from "next/link";
import { IconBell, IconHelp, IconSearch } from "@tabler/icons-react";
import { getCurrentUser } from "@/lib/current-user";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface OrgPickerHeaderProps {
  title?: string;
  showBack?: boolean;
}

export async function OrgPickerHeader(_props: OrgPickerHeaderProps = {}) {
  const user = await getCurrentUser();

  return (
    <header className="h-12 flex items-center justify-between px-4 border-b border-border shrink-0 bg-background">
      {/* Left: Logo only */}
      <Link href="/dashboard/org" className="flex items-center">
        <img
          src="/backlify-logo.svg"
          alt="Backlify"
          className="size-6 object-contain"
        />
      </Link>

      {/* Right: Profile Avatar only */}
      <div className="flex items-center">
        <Avatar className="size-7 cursor-pointer">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
            {user.initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
