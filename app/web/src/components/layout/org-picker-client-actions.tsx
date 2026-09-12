"use client";

import { IconHelp, IconSearch, IconBulb, IconLogout, IconUser } from "@tabler/icons-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";

interface Props {
  userInitials: string;
  userEmail?: string;
  userName?: string;
}

export function OrgPickerClientActions({ userInitials, userEmail, userName }: Props) {
  const triggerModal = (modal: "search" | "help" | "feedback") => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("backlify:open-modal", { detail: modal }));
    }
  };

  return (
    <div className="flex items-center gap-2.5">
      {/* Desktop-only action items */}
      <div className="hidden sm:flex items-center gap-2">
        {/* Feedback */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => triggerModal("feedback")}
          className="text-muted-foreground hover:text-foreground text-xs h-7 px-2"
        >
          Feedback
        </Button>

        {/* Search chip */}
        <button
          type="button"
          onClick={() => triggerModal("search")}
          className="flex items-center gap-2 h-7 px-2.5 rounded-md border border-border/80 bg-muted/30 text-xs text-muted-foreground hover:border-border hover:bg-muted/60 transition-colors"
        >
          <IconSearch className="size-3.5 text-muted-foreground" />
          <span>Search...</span>
          <kbd className="ml-1 text-[10px] text-muted-foreground/80 border border-border rounded px-1 font-mono">
            Ctrl K
          </kbd>
        </button>

        {/* Help icon */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => triggerModal("help")}
          className="size-7 text-muted-foreground hover:text-foreground"
        >
          <IconHelp className="size-3.5" />
        </Button>

        {/* Bulb icon */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => triggerModal("feedback")}
          className="size-7 text-muted-foreground hover:text-foreground"
        >
          <IconBulb className="size-3.5" />
        </Button>
      </div>

      {/* User profile picture with Dropdown Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-full">
            <Avatar className="size-7 cursor-pointer border border-[#2a2a2a] hover:border-neutral-500 transition-colors">
              <AvatarFallback className="bg-[#1f1f1f] text-foreground text-[11px] font-medium">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-[#111111] border border-[#262626] text-neutral-200">
          <DropdownMenuLabel className="font-normal px-2 py-1.5">
            <div className="flex flex-col space-y-1">
              <p className="text-xs font-semibold leading-none text-white">{userName || "Account"}</p>
              <p className="text-[11px] leading-none text-neutral-400 truncate">{userEmail || "user@backlify.dev"}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-[#262626]" />
          <DropdownMenuItem
            onClick={() => signOut({ redirectTo: "/login" })}
            className="text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 cursor-pointer focus:text-red-300 focus:bg-red-950/30 gap-2"
          >
            <IconLogout className="size-3.5" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
